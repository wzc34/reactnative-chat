/*
 * @Description: 启动页判断是否登录
 * @Author: wangzhicheng
 * @Date: 2021-03-04 20:00:46
 */
import React, { useEffect } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { getItem } from '@/utils/storage';
import { navigateReset } from '@/utils/navigation';
import theme from '@/utils/theme';
import { StorageKey } from '@/constants/commonConstant';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
});

const Bootstrap = () => {

  async function bootstrapAsync() {
    
    // 启动处理
    try {
      let isLogin: boolean;
      const token = await getItem(StorageKey.token).then(res=>{
          return res
      });
      isLogin = !!token;

      // 未登录
      if (!isLogin) {
        navigateReset('Login');
        return;
      }
      if (isLogin) {
        navigateReset('Home');
      }
    } catch (error) {
      console.warn('bootstrapAsync error', error);
    }
  }

  useEffect(() => {
    bootstrapAsync();
  }, []);

  return (
    <View style={styles.container}>
      <ActivityIndicator size={30} color={theme.primary} />
    </View>
  );
};

export default Bootstrap;
