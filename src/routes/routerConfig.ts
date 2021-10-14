/*
 * @Description: 路由配置
 * @Author: wangzhicheng
 * @Date: 2021-03-04 13:55:04
 */

import Bootstrap from '../pages/Bootstrap';
import Login from '../pages/Login';
import Home from '../pages/Home';
import Contacts from '../pages/Contacts';
import Chat from '../pages/Chat';
import Mine from '../pages/Mine';
import Setting from '../pages/Mine/Setting';
import Camera from '../pages/Camera';

// 路由
export default [
  { name: 'Bootstrap', title: '启动', screen: Bootstrap, header: 'none' },
  { name: 'Login', title: '登录/注册', screen: Login },
  { name: 'Chat', title: '', screen: Chat, isLogin: true},
  { name: 'Setting', title: '设置', screen: Setting, isLogin: true},
  { name: 'Camera', title: '扫一扫', screen: Camera, isLogin: true},
];

export const tabConfig = [
  { name: 'Home', title: '聊天', screen: Home, isLogin: true },
  { name: 'Contacts', title: '通讯录', screen: Contacts, isLogin: true },
  { name: 'Mine', title: '我的', screen: Mine, isLogin: true },
];
