import React from 'react';
import { View, Text, Image, StyleSheet, DeviceEventEmitter } from 'react-native';
import theme from '../utils/theme';
import { px2rem, screenUtils } from '../utils/px2rem';
import AuthLoginButton from '@/components/AuthLoginButton';
import { setItem } from '@/utils/storage';
import { StorageKey } from '@/constants/commonConstant';

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  icon: {
    width: px2rem(30),
    height: px2rem(30),
  },
  badge: {
    position: 'absolute',
    right: px2rem(-2),
    top: px2rem(-2),
    backgroundColor: 'red',
    borderRadius: px2rem(7),
    minWidth: px2rem(15),
    height: px2rem(15),
    justifyContent: 'center',
    alignItems: 'center',
  },
  badgeText: {
    color: '#fff',
    fontSize: theme.fontSizeXs,
    fontWeight: '500',
  },
});

const iconSource = {
  tab0: require('../assets/img/icon_home_0.png'),
  tab0Active: require('../assets/img/icon_home_1.png'),
  tab1: require('../assets/img/icon_classify_0.png'),
  tab1Active: require('../assets/img/icon_classify_1.png'),
  tab2: require('../assets/img/icon_mine_0.png'),
  tab2Active: require('../assets/img/icon_mine_1.png'),
};

function IconWithBadge({ name, showBadge = false }) {
  const badgeCount = 12;
  return (
    <View style={styles.container}>
      <Image source={iconSource[name]} style={styles.icon} />
      {showBadge && badgeCount > 0 && (
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{badgeCount}</Text>
        </View>
      )}
    </View>
  );
}

export default ({ state, descriptors, navigation }) => {
  return (
    <View
      style={{
        width: '100%',
        flexDirection: 'row',
        height: screenUtils.bottomBarHeight,
        backgroundColor: theme.bottomBarBgColor,
      }}>
      {state.routes.map((route, index) => {
        const { options } = descriptors[route.key];
        const label =
          // eslint-disable-next-line no-nested-ternary
          options.tabBarLabel !== undefined
            ? options.tabBarLabel
            : options.title !== undefined
            ? options.title
            : route.name;

        const isFocused = state.index === index;

        const onPress = () => {
          const event = navigation.emit({
            type: 'tabPress',
            target: route.key,
            canPreventDefault: true,
          });

          if (!isFocused && !event.defaultPrevented) {
            navigation.navigate(route.name);
            // 点击tabBar时，重新加载数据
            DeviceEventEmitter.emit('tabClick', route.name);
            setItem(StorageKey.routeName, route.name)
          }
        };

        const onLongPress = () => {
          navigation.emit({
            type: 'tabLongPress',
            target: route.key,
          });
        };

        let iconName;
        if (route.name === 'Home') {
          iconName = isFocused ? 'tab0Active' : 'tab0';
        } else if (route.name === 'Contacts') {
          iconName = isFocused ? 'tab1Active' : 'tab1';
        } else if (route.name === 'Mine') {
          iconName = isFocused ? 'tab2Active' : 'tab2';
        }

        return (
          <AuthLoginButton
            key={route.name}
            routeName={route.name}
            accessibilityRole="button"
            // accessibilityStates={isFocused ? ['selected'] : []}
            accessibilityLabel={options.tabBarAccessibilityLabel}
            testID={options.tabBarTestID}
            onPress={onPress}
            onLongPress={onLongPress}
            style={{
              flex: 1,
              justifyContent: 'center',
              alignItems: 'center',
              paddingVertical: px2rem(10),
            }}>
            <IconWithBadge
              name={iconName}
              // showBadge={route.name === 'ShopCart'}
            />
            <Text
              style={{
                color: isFocused ? theme.primary : '#333333',
                fontSize: theme.fontSizeXs,
              }}>
              {label}
            </Text>
          </AuthLoginButton>
        );
      })}
    </View>
  );
};
