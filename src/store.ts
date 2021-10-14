/*
 * @Description: store
 * @Author: wangzhicheng
 * @Date: 2021-03-05 19:13:21
 */
import { create } from 'dva-core';
import createLoading from 'dva-loading';

import user from './models/user';
// import home from './models/home';

const models = [user];

const app = create({
  initialState: {},
  models,
  onError(e) {
    console.log('onError', e);
  },
}); // 创建dva实例，可传递配置参数。https://dvajs.com/api/#app-dva-opts

models.forEach(o => {
  // 装载models对象
  app.model(o);
});

app.use(createLoading());

app.start(); // 实例初始化

const store = app._store; // 获取redux的store对象供react-redux使用

export default store;
