/*
 * @Description: 用户
 * @Author: wangzhicheng
 * @Date: 2021-03-05 18:12:29
 */

import {
  doRegisterServices,
  doLoginServices,
  doLoginVerifyServices,
} from '@/services/api_user';
import { DeviceEventEmitter } from 'react-native';
import { navigate, navigateReset } from '@/utils/navigation';
import { IUserState } from '@/types/user';
import { getItem, removeItem, setItem } from '@/utils/storage';
import { StorageKey } from '@/constants/commonConstant';
import UserData from '@/socket/userData';

const userState: IUserState = {
  isLogin: false,
  token: '',
  currentUser: {
    account: '',
    registerID: '',
    platform: '',
  },
};

export default {
  namespace: 'user',
  state: userState,
  effects: {
    /**
     * 注册
     */
    *register({payload, callback }, { call, put }) {
      const res = yield call(doRegisterServices, payload);
      callback(res)
    },
    /**
     * 登录
     * @param account
     */
    *login({ payload, callback }, { call, put }) {
      const res = yield call(doLoginServices, payload);
      if (res && res.token) {
        const { token = '' } = res;
        yield put({
          type: 'save',
          payload: {
            isLogin: true,
            token: token,
            currentUser: {
              account: payload.account,
              registerID: payload.registerID,
            }
          },
        });
        setItem(StorageKey.currentUser, {account: payload.account})
        setItem(StorageKey.token, token)
      }
      callback(res)
    },
    /**
     * 验证
     * @param account
     * @param token
     */
    *loginVerify({ }, { call, put, select }) {
      // const user = yield select((state: {user}) => state.user);
      const param = { account: '', token: ''}
      yield getItem(StorageKey.currentUser).then((res)=>{
        if (res) {
          param.account = res.account
        } 
      })
      yield getItem(StorageKey.token).then((res)=>{
        if (res) param.token = res
      })
      if (param.token) {
        const res = yield call(doLoginVerifyServices, param);
        yield put({
          type: 'save',
          payload: {
            isLogin: res ? true: false,
          },
        });
        
        if (!res) {
          DeviceEventEmitter.emit('socketLogout');
          removeItem(StorageKey.token)
          UserData.removeUser()
          navigateReset('Login')
        } 
      }

    },
    /**
     *退出
     */
    *logout({ }, { call, put }) {
      removeItem(StorageKey.token);
    },
  },
  reducers: {
    save(state: any, action: {payload: any}) {
      return { ...state, ...action.payload };
    },
  },
};
