/*
 * @Description: 
 * @Author: wangzhicheng
 * @Date: 2021-03-08 16:40:04
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
  title: {
    backgroundColor: 'rgba(216,216,216,0.20)', 
    padding: 5, 
    borderRadius: 5,
  },
  rowBox: {
    borderBottomColor: '#D8D8D8',
    borderBottomWidth: .5,
    paddingVertical: 10,
  },
  avatarBox: {
      marginRight: 10,
  },
  avatar: {
    borderRadius: 5,
    width: 40,
    height: 40,
  },
  text: {
      fontSize: 8,
      color: '#77869E',
      marginTop: 5,
  },
});
