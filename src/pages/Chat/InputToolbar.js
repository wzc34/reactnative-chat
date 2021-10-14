/*
 * @Description: 
 * @Author: wangzhicheng
 * @Date: 2021-03-23 10:25:23
 */
/* eslint-disable react/destructuring-assignment */
/* eslint-disable react/jsx-props-no-spreading */
import { Icon } from '@ant-design/react-native';
import React from 'react';
import { Image, View, Text } from 'react-native';
import { InputToolbar, Actions, Composer, Send } from 'react-native-gifted-chat';

export const renderInputToolbar = (props) => (
  <InputToolbar
    {...props}
    containerStyle={{
      backgroundColor: '#fff',
      paddingTop: 6,
    }}
    primaryStyle={{ alignItems: 'center' }}
  />
);

export const renderActions = (props) => (
  <Actions
    {...props}
    containerStyle={{
      width: 44,
      height: 44,
      alignItems: 'center',
      justifyContent: 'center',
      marginLeft: 4,
      marginRight: 4,
      marginBottom: 0,
    }}
    icon={() => (
      // <Image
      //   style={{ width: 32, height: 32 }}
      //   source={{
      //     uri: 'https://placeimg.com/32/32/any',
      //   }}
      // />
      <Icon name='plus-circle' />
    )}
    options={{
      '语音': () => {
        console.log('语音');
      },
      '表情': () => {
        console.log('表情');
      },
      // '取消': () => {
      //   console.log('Cancel');
      // },
    }}
    optionTintColor="#222B45"
  />
);

/**
 * 自定义textInput输入框
 * @param {*} props 
 */
export const renderComposer = (props) => (
  <Composer
    {...props}
    textInputStyle={{
      color: '#222B45',
      backgroundColor: '#fff',
      borderWidth: 1,
      borderRadius: 5,
      borderColor: '#E4E9F2',
      paddingTop: 8.5,
      paddingHorizontal: 12,
      marginLeft: 5,
    }}
  />
);

export const renderSend = (props) => (
  <Send
    {...props}
    disabled={!props.text}
    containerStyle={{
      width: 44,
      height: 44,
      alignItems: 'center',
      justifyContent: 'center',
      marginHorizontal: 4,
    }}
  >
    {/* <Image
      style={{ width: 32, height: 32 }}
      source={{
        uri: 'https://placeimg.com/32/32/any',
      }}
    /> */}
    <View><Text>发送</Text></View>
  </Send>
);
