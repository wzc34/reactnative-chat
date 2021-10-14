/*
 * @Description: 
 * @Author: wangzhicheng
 * @Date: 2021-03-23 10:25:42
 */
/* eslint-disable react/jsx-props-no-spreading */
import React from 'react';
import { View, Text } from 'react-native';
import { Avatar, Bubble, SystemMessage, Message, MessageText } from 'react-native-gifted-chat';
import moment from 'moment';
const hhformat = "HH:mm"

export const renderAvatar = (props) => (
  <Avatar
    {...props}
    containerStyle={{ left: { borderWidth: 3, borderColor: 'red' }, right: {} }}
    imageStyle={{ left: { borderWidth: 3, borderColor: 'blue' }, right: {} }}
  />
);

// export const renderBubble = (props) => (
//   <Bubble
//     {...props}
//     // renderTime={() => <Text>Time</Text>}
//     // renderTicks={() => <Text>Ticks</Text>}
//     containerStyle={{
//       left: { borderColor: 'teal', borderWidth: 8 },
//       right: {},
//     }}
//     wrapperStyle={{
//       left: { borderColor: 'tomato', borderWidth: 4 },
//       right: {},
//     }}
//     bottomContainerStyle={{
//       left: { borderColor: 'purple', borderWidth: 4 },
//       right: {},
//     }}
//     tickStyle={{}}
//     usernameStyle={{ color: 'tomato', fontWeight: '100' }}
//     containerToNextStyle={{
//       left: { borderColor: 'navy', borderWidth: 4 },
//       right: {},
//     }}
//     containerToPreviousStyle={{
//       left: { borderColor: 'mediumorchid', borderWidth: 4 },
//       right: {},
//     }}
//   />
// );
/**
   * 消息气泡
   * @param props 
   */
export const renderBubble = (props) => {
  return (
    <Bubble
      {...props}
      renderTime={renderTime}
      optionTitles={['复制', '取消']}
      // onLongPress={onLongPress}
      textStyle={{
        right: {
          color: '#333',
        },
      }}
      wrapperStyle={{
        left: {
          backgroundColor: '#fff',
          borderRadius: 3,
        },
        right: {
          backgroundColor: '#9EEA6A',
          borderRadius: 3,
        },
      }}
    />
  );
}

/**
 * 时间
 * @param props 
 */
const renderTime = (props) => {
  const { currentMessage: { createdAt }, position } = props
  const hhmm = moment(createdAt).format(hhformat)
  return <Text style={{ fontSize: 10, color: position === 'right' ? '#fff' : '#ccc', alignSelf: 'center', marginBottom: 4, paddingHorizontal: 10 }}>{hhmm} </Text>
}

export const renderSystemMessage = (props) => (
  <SystemMessage
    {...props}
    containerStyle={{ backgroundColor: 'pink' }}
    wrapperStyle={{ borderWidth: 10, borderColor: 'white' }}
    textStyle={{ color: 'crimson', fontWeight: '900' }}
  />
);

export const renderMessage = (props) => (
  <Message
    {...props}
    // renderDay={() => <Text>Date</Text>}
    containerStyle={{
      // left: { backgroundColor: 'lime' },
      // right: { backgroundColor: 'gold' },
    }}
  />
);

export const renderMessageText = (props) => (
  <MessageText
    {...props}
    optionTitles={['拨打电话', '发送短信', '取消']}
  // containerStyle={{
  //   left: { backgroundColor: 'yellow' },
  //   right: { backgroundColor: 'purple' },
  // }}
  // textStyle={{
  //   left: { color: 'red' },
  //   right: { color: 'green' },
  // }}
  // linkStyle={{
  //   left: { color: 'orange' },
  //   right: { color: 'orange' },
  // }}
  // customTextStyle={{ fontSize: 24, lineHeight: 24 }}
  />
);

export const renderCustomView = ({ user }) => (
  <View style={{ minHeight: 20, alignItems: 'center' }}>
    <Text>
      Current user:
      {user.name}
    </Text>
    <Text>From CustomView</Text>
  </View>
);
