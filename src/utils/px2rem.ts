/*
 * @Description: 屏幕
 * @Author: wangzhicheng
 * @Date: 2021-03-04 13:57:19
 */
import { Dimensions, Platform } from 'react-native';
import {
  isIphoneX,
  getStatusBarHeight,
  getBottomSpace,
} from 'react-native-iphone-x-helper';
import theme from './theme';
const UISize = 375; // 750 / 640
const deviceWidthDp = Dimensions.get('window').width / UISize || 1;

/**
 * px2rem
 * @param {number} px
 */
export function px2rem(px: number) {
  if (deviceWidthDp) {
    return px * deviceWidthDp;
  }
  return px;
}

/**
 * 是否是竖屏
 */
const isLandscape = () => {
  return Dimensions.get('window').width > Dimensions.get('window').height;
};

const screenInset = () => {
  let isLand = isLandscape();
  let isIPhoneX = isIphoneX();
  let fitIPhoneX = true;
  return {
    left: isLand && isIPhoneX && fitIPhoneX ? px2rem(44) : 0,
    right: isLand && isIPhoneX && fitIPhoneX ? px2rem(44) : 0,
    top: getStatusBarHeight(),
    // eslint-disable-next-line no-nested-ternary
    bottom: isIPhoneX && fitIPhoneX ? (isLand ? px2rem(24) : px2rem(34)) : 0,
  };
};

/**
 * 屏幕工具类
 */
export const screenUtils = {
  isIphoneX: isIphoneX(),
  bottomSpace: getBottomSpace(),
  bottomBarHeight: px2rem(55),
  statusBarHeight: getStatusBarHeight(),
  IOS: Platform.OS === 'ios',
  screenW: Dimensions.get('window').width,
  screenH: Dimensions.get('window').height,
  headerHeight: theme.navHeight,
  screenInset: screenInset(),
  screenBodyH: Dimensions.get('window').height - theme.navHeight - px2rem(55),
};
