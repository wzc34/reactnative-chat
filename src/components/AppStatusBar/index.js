import React from 'react';
import { StatusBar } from 'react-native';

const AppStatusBar = (props) => {
  const { transparent = false } = props;
  return (
    <StatusBar
      barStyle={transparent ? 'light-content' : 'dark-content'}
      translucent
      backgroundColor="rgba(0, 0, 0, 0)"
    />
  );
};

export default AppStatusBar;