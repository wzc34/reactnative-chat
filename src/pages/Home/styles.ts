/*
 * @Description: 
 * @Author: wangzhicheng
 * @Date: 2021-03-08 16:40:04
 */
import { Platform, StyleSheet } from 'react-native';
import { px2rem } from '@/utils/px2rem';
import theme from '@/utils/theme';

export default StyleSheet.create({
  wrapper: {
    flex: 1,
    position: 'relative',
    backgroundColor: theme.backgroundColor,
  },
  chatBox: {
    backgroundColor: '#fff',
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
      fontSize: 12,
      color: '#77869E',
      marginTop: 5,
  },
  titleText: {
    width: 70, 
    textAlign: 'right', 
    fontSize: 12,
    color: '#888',
  },
  briefText: {
    width: '100%', 
    fontSize: 12, 
    color: '#888',
    marginTop: Platform.OS === 'ios'? 15: 3,
  },
  socketDisConnectTip: {
    backgroundColor: '#fff2f0',
    borderWidth: 1,
    borderColor: '#ffccc7',
    height: 50,
    paddingLeft: 15,
  }
});
