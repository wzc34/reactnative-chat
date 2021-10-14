/*
 * @Description: 
 * @Author: wangzhicheng
 * @Date: 2021-03-08 15:44:51
 */
import { StyleSheet } from 'react-native';
import { px2rem } from '@/utils/px2rem';
import theme from '@/utils/theme';

export default StyleSheet.create({
  wrapper: {
    flex: 1,
    position: 'relative',
    backgroundColor: theme.backgroundColor,
  },
  headerBox: {
    backgroundColor: '#fff',
    paddingVertical: 15,
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    // marginBottom: 20,
  },
});
