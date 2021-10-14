/*
 * @Description: axios请求
 * @Author: wangzhicheng
 * @Date: 2021-03-04 18:48:43
 */
import axios, { AxiosResponse } from 'axios';
import { Platform } from 'react-native';
import store from '../store';
import { getItem, removeItem } from './storage'
import { Toast } from '@ant-design/react-native';
import config from '@/configs/index';
import { StorageKey } from '@/constants/commonConstant';
import { isNil } from 'lodash';
const baseURL = config.http;

const error_code = [
	{code: 0, message: '成功'},
	{code: 1, message: '请求失败'},
	{code: 2, message: '请求太快'},
	{code: 3, message: '无效的token'},
	{code: 4, message: '重复绑定token'},
	{code: 5, message: '账号没有注册'},
	// {code: 6, message: '验证失败'},
]

const responseLog = (res: AxiosResponse<any>) => {
  const randomColor = `rgba(${Math.round(Math.random() * 255)},${Math.round(
    Math.random() * 255,
  )},${Math.round(Math.random() * 255)})`;

  console.log(
    '%c┍------------------------------------------------------------------┑',
    `color:${randomColor};`,
  );
  console.log('| 请求地址：', res.request._url);
  console.log('| 请求方式：', res.config.method);
  console.log('| 请求头：', res.config.headers);
  console.log('| 请求时间：', res.headers.date);
  console.log('| 请求参数：', res.config);
  console.log('| 返回数据：', res.data);
  console.log(
    '%c┕------------------------------------------------------------------┙',
    `color:${randomColor};`,
  );
};

const instance = axios.create({
  baseURL: baseURL,
  timeout: 1000 * 10,
  withCredentials: true,
  headers: {
    platform: Platform.OS,
  },
});
instance.defaults.headers['Content-Type'] = 'application/json';

// Add a request interceptor
instance.interceptors.request.use(
  async function(config) {
    const { headers } = config;
    getItem(StorageKey.token).then((token)=>{
      if (token) {
        headers.token = token;
      }
    })
    return config;
  },
  function(error) {
    Toast.fail(error, 1)
    return ;
  },
);

instance.interceptors.response.use(
  function(response) {
    response && responseLog(response); // release to remove

    if (response && response.status === 200) {
      const res = response.data;
      if(res && res.code && res.code !== 0){
        const findItem: any = error_code.find(item=> res.code === item.code)
        if (!isNil(findItem)) {
          if (res.code === 3) {
            store.dispatch({ type: 'user/logout' });
            Toast.info(findItem.message);
          }
          if (res.code === 5) return res
        }
        return null
      }
      return res;
    }
    return response.data;
  },
  function(error) {
    console.log('error', error);
    if ((error + '') === 'Error: Network Error') {
      Toast.info('网络请求失败，请稍后再试', 1)
      return ;
    }
    if ((error + '').indexOf('Error: timeout') > -1) {
      Toast.info('网络连接超时，请检查网络是否连接', 1)
      return ;
    }
    if (error.response)
    switch (error.response.status) {
      case 401:
        Toast.info('用户未登录', 1)
        return ;
      case 404:
        Toast.info('请求接口异常 404 not found', 1)
        return ;
      case 400:
      case 500:
        Toast.info('服务端异常', 1)
        return ;
      case 502:
        Toast.info('服务器异常', 1)
        return ;
      default:
        return ;
    }
  },
);

export default instance;
