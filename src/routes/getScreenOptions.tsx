/*
 * @Description: 导航样式
 * @Author: wangzhicheng
 * @Date: 2021-03-04 13:55:04
 */
import React from 'react';
import {
  TransitionPresets,
  StackNavigationOptions,
} from '@react-navigation/stack';
import { screenUtils } from '../utils/px2rem';
import theme from '../utils/theme';
import NavLeftButton from '../components/NavLeftButton';

const getScreenOptions = (): StackNavigationOptions => {
  return {
    headerStyle: {
      backgroundColor: 'white',
      height: screenUtils.headerHeight,
      elevation: 0, // android去除阴影
      borderBottomWidth: 0, // ios去除阴影
    },
    headerTitleStyle: {
      fontSize: theme.fontSizeLg,
      fontWeight: '600',
      borderBottomWidth: 0,
    },
    cardShadowEnabled: true,
    headerTitleAlign: 'center',
    cardStyle: {
      flex: 1,
      backgroundColor: theme.backgroundColor,
    },
    headerBackTitleStyle: {color: '#fff'},
    headerBackImage: () => <NavLeftButton style={{ paddingLeft: 10 }} />,
    ...TransitionPresets.SlideFromRightIOS,
  };
};

export default getScreenOptions;
