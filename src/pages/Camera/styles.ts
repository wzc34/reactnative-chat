/*
 * @Description: 
 * @Author: wangzhicheng
 * @Date: 2021-03-08 16:40:04
 */
import { StyleSheet } from 'react-native';
import { px2rem, screenUtils } from '@/utils/px2rem';
import theme from '@/utils/theme';

export default StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'column'
  },
  preview: {
    flex: 1,
    justifyContent: 'flex-end',
    alignItems: 'center'
  },
  rectangleContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent'
  },
  rectangle: {
    height: 350,
    width: 300,
    // borderWidth: 1,
    // borderColor: '#00FF00',
    // backgroundColor: 'transparent'
  },
  rectangleText: {
    flex: 0,
    color: '#fff',
    marginTop: 10
  },
  border: {
    flex: 0,
    width: 280,
    height: .5,
    borderWidth: 0,
    backgroundColor: '#00FF00',
    elevation: 20,
  },
  backBtn: {
    position: 'absolute', 
    top: 0,
    left: 0,
    height: screenUtils.headerHeight,
  }
});
