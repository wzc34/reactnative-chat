/*
 * @Description: 验证用户登录状态及路由是否需要登录，当该路由需要登录才能进入而用户登录已失效，则跳转到登录页
 * @Author: wangzhicheng
 * @Date: 2021-03-04 13:55:19
 */
import React from 'react';
import { useSelector } from 'react-redux';
import { TouchableOpacity, TouchableOpacityProps } from 'react-native';
import routerConfig, { tabConfig } from '@/routes/routerConfig';
import { navigate, navigateReset } from '@/utils/navigation';

interface IProps extends TouchableOpacityProps {
  children: any;
  routeName: string;
  onPress?: any;
}

interface IRouter {
  isLogin?: boolean;
  name: string;
  title: string;
  screen: any;
}

const AuthLoginButton = (props: IProps) => {
  const { children, onPress, routeName } = props;
  const { isLogin } = useSelector((state: {user: any}) => state.user);
  const needLoginList = [...tabConfig, ...routerConfig]
    .filter((r: IRouter) => r && r.isLogin)
    .map((r: IRouter) => r.name);

  let need = needLoginList && needLoginList.includes(routeName) && !isLogin;

  const checkLogin = () => {
    if (need) {
      navigateReset('Login');
    } else {
      if (onPress) {
        onPress();
        return;
      }
      navigate(routeName);
    }
  };

  return (
    <TouchableOpacity {...props} onPress={checkLogin}>
      {children}
    </TouchableOpacity>
  );
};

export default AuthLoginButton;
