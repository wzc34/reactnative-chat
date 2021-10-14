/*
 * @Description: 导航
 * @Author: wangzhicheng
 * @Date: 2021-03-04 13:55:33
 */

import { createRef } from 'react';
import { StackActions } from '@react-navigation/native';
import { setItem } from './storage';
import { StorageKey } from '@/constants/commonConstant';
import { Toast } from '@ant-design/react-native';

export const navigationRef: any = createRef();

export const navigate = (name: string, params?: any) => {
  navigationRef.current.navigate(name, params);
  setItem(StorageKey.routeName, name)
};

export function goBack() {
  navigationRef.current.goBack();
}

export const navigateReplace = (name: string, params?: any) => {
  navigationRef.current.dispatch(StackActions.replace(name, params));
};

export function navigateReset(name) {
  navigationRef.current.reset({
    index: 0,
    routes: [{ name }],
  });
}

// 返回键退出提示
export function onBackAndroid (navigation) {
  //禁用返回键
  if(navigation.isFocused()) {//判断   该页面是否处于聚焦状态
      if (this.lastBackPressed && this.lastBackPressed + 2000 >= Date.now()) {
          //最近2秒内按过back键，可以退出应用。
          return false;
          // BackHandler.exitApp();//直接退出APP
      }else{
          this.lastBackPressed = Date.now();
          Toast.info('再按一次退出应用', 1);//提示
          return true;
      }
  }
}