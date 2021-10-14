/*
 * @Description: 聊天
 * @Author: wangzhicheng
 * @Date: 2021-03-01 20:01:12
 */
import React, { useState, useCallback, useEffect } from 'react';
import { View, Text, DeviceEventEmitter, Clipboard, Keyboard, TouchableOpacity } from 'react-native';
import { GiftedChat, Send, Bubble, IMessage } from 'react-native-gifted-chat'
import ImageModal from 'react-native-image-modal'
import { StorageKey, SocketMsgId, SocketName, SocketNewMsg, AppChannel } from '@/constants/commonConstant';
import SocketManager from '@/socket/socketManager';
import Protocol from '@/socket/protocol'
import UserData from '@/socket/userData';
// 引入中文语言包
import 'dayjs/locale/zh-cn';
import { renderInputToolbar, renderActions, renderComposer, renderSend } from './InputToolbar';
import {
  renderAvatar,
  renderBubble,
  renderSystemMessage,
  renderMessage,
  renderMessageText,
  renderCustomView,
} from './MessageContainer';
import { GameMessage } from '@/types/message';
import { Flex, Toast } from '@ant-design/react-native';
import { unixToString } from '@/utils/common';
const pageSize = 10

const Chat = (props) => {
  const { navigation, route: { params }} = props
  const { user, type } = params // user 聊天的帮会或好友

  const [currentRole, setCurrentRole] = useState(null);
  const [messages, setMessages] = useState<any>([]);
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(false)

  const guild_dismiss = user.type && user.type === SocketNewMsg.guild_dismiss && type === 'guild' ? true : false // 是否帮会解散

  useEffect(() => {

    setCurrentRole(UserData.user()?.Current_role)

    isReadMsg()

    // 修改标题
    navigation.setOptions({
      headerTitle: type === 'friend' ? user.roleName : user.guildName,
    })
  }, [])

  useEffect(()=>{
    let myTimeout = null
    const newMsgToChatUpdateEvent = DeviceEventEmitter.addListener('newMsgToChatUpdate', reGetMessage)
    return () => {
      newMsgToChatUpdateEvent && newMsgToChatUpdateEvent.remove();
      myTimeout && clearTimeout(myTimeout)
    }
  }, [])

  useEffect(() => {
    let data = user?.data
    if (data) {
      data = [...data]
    }
    showChatMessage(data)

  }, [page])
  /**
   * 在当前页面接收新消息，更新当前message信息
   */
  const reGetMessage = () => {
    let userNewAllMsg = null
    const role = UserData.user()?.Current_role
    if (type === 'friend') {
        userNewAllMsg = role.friend_msg?.find(item=>item.roleId === user.roleId)
    } else {
        userNewAllMsg = role.guild_msg?.find(item=>item.guildId === user.guildId)
    }
    if (userNewAllMsg) {
      const newdata = userNewAllMsg?.data
      showChatMessage(newdata)
      // 重置未读消息
      isReadMsg()
    }
  }


  /**
   * 监听消息是否有未读消息
   */
  const isReadMsg = () => {
    const item = { 
      type, 
      id: null, // guild_id 或 role_id
    }
    if (user.isRead > 0) { // 有未消息
      item.id = type === 'friend' ? user.roleId : user.guildId
    }

    DeviceEventEmitter.emit('isReadMsg', item);
  }

  /**
   * 显示消息
   */
  const showChatMessage = async (data) =>{
    const messages: IMessage[] = []
    if (data) {
      data.forEach((element, i) => {
        if (i < page * pageSize) {
          const time = element.time && unixToString(element.time)
          const mytime = time && time.replace(/-/g,'/')
          const item: IMessage = {
            _id: i+1,
            text: element.message + ' ',
            createdAt: new Date(mytime),
            user: {
                _id: element.roleId,
                name: element.roleName,
                // avatar: 'https://placeimg.com/140/140/any',
            },
          }
          messages.push(item)
        }
      });
      if (data.length > page * pageSize) {
        setHasMore(true)
      } else {
        setHasMore(false)
      }
    }
    setMessages(messages)
  }

  const renderMessageImage = (props: any) => {
    return (
      <View
        style={{
          borderRadius: 15,
          padding: 2,
        }}
      >
        <ImageModal
          resizeMode="contain"
          style={{
            width: 200,
            height: 200,
            padding: 6,
            borderRadius: 15,
          }}
          source={{ uri: props.currentMessage.image }}
        />
      </View>
    );
  };

  /**
   * 发送消息
   */
  const onSend = useCallback((newMessages: IMessage[] = []) => {
    // const date = moment().utcOffset(8).format(datetime)
    // newMessages[0].createdAt = new Date(date)
    // setMessages((prevMessages: any) => GiftedChat.prepend(prevMessages, newMessages))
    // 发送消息到游戏
    sendSocketToGame(newMessages)
  }, [currentRole])

  

  /**
   * 长按消息
   * @param context 
   * @param message 
   */
  // const onLongPress = (context, message) => {
  //   if (message.text) {
  //     Keyboard.dismiss()
  //     const options = [
  //       '复制',
  //       '取消',
  //     ];
  //     const cancelButtonIndex = options.length - 1;
  //     context.actionSheet().showActionSheetWithOptions({
  //       options,
  //       cancelButtonIndex,
  //     },
  //     (buttonIndex) => {
  //       switch (buttonIndex) {
  //         case 0:
  //           Clipboard.setString(message.text);
  //           Toast.info('复制成功', 1)
  //           break;
  //       }
  //     });
  //   }
  // }
  

  /**
   * 发送到游戏
   * @param newMessages 
   */
  const sendSocketToGame = (newMessages) => {
    if (SocketManager.isConnect(SocketName.chatMessage)) {
      sendGameMessage(newMessages)
    }
  }

  /**
   * app发送游戏消息到请求
   */
  const sendGameMessage = (newMessages) => {
    const param: GameMessage = { 
      game_id: currentRole.game_id,
      platform_id: currentRole.platform_id,
      server_id: currentRole.server_id,
      role_id: currentRole.role_id,
      channel: type === 'friend' ? AppChannel.friend : AppChannel.guild,
      content: newMessages[0].text,
      guild_id: null,
      guild_name: null,
      friend_id: null,
      friend_name: null,
    }
    if (type === 'friend') {
      param.friend_id = user.roleId
      param.friend_name = user.roleName
    } else {
      param.guild_id = currentRole.guild_id
      param.guild_name = currentRole.guild_name
    }
    const protocol = new Protocol(SocketMsgId.cl2ch_app_chat_req, param)
    SocketManager.Send(protocol, SocketName.chatMessage)
  }

  const renderLoadEarlier = () => {
    return (
      <Flex justify='center'>
        <TouchableOpacity onPress={onLoadEarlier} style={{backgroundColor: '#fff', margin: 10, borderRadius: 50, paddingHorizontal: 20, paddingVertical: 5}}>
        <Text>  加载更多  </Text>
        </TouchableOpacity>
        </Flex>
    )
  }

  /**
   * 加载更早的消息
   */
  const onLoadEarlier = () => {
    if (hasMore) {
      setPage(page => page + 1)
      Keyboard.dismiss()
    }
  }

  const textInputProps = (
    {}
  )

  return (
    <>
      <GiftedChat
          alwaysShowSend={!guild_dismiss}
          textInputProps={guild_dismiss ? {display: 'none'}: null}
          scrollToBottom
          alignTop
          renderAvatarOnTop
          messages={messages}
          onSend={messages => onSend(messages)}
          showUserAvatar={true}
          showAvatarForEveryMessage={true}
          renderUsernameOnMessage={type === 'guild' ? true : false}
          locale={"zh-cn"}
          renderBubble={renderBubble}
          renderMessageImage={renderMessageImage}
          renderSend={renderSend}
          placeholder={"开始聊天吧"}
          // inverted={false}
          // renderAvatar={null}
          // renderMessage={renderMessage}
          renderMessageText={renderMessageText}
          renderInputToolbar={guild_dismiss ? null : renderInputToolbar}
          // renderActions={renderActions}
          renderComposer={renderComposer}
          minInputToolbarHeight={guild_dismiss ? 0 : 55}
          maxInputLength={120}
          loadEarlier={hasMore}
          renderLoadEarlier={renderLoadEarlier}
          // onLoadEarlier={onLoadEarlier}
          user={{
              _id: currentRole?.role_id,
              name: currentRole?.role_name,
              // avatar: 'https://placeimg.com/140/140/any',
          }}
          parsePatterns={(linkStyle) => [
            {
              pattern: /#(\w+)/,
              style: linkStyle,
              onPress: (tag) => console.log(`Pressed on hashtag: ${tag}`),
            },
            // { type: 'phone', style: linkStyle, onPress: this.onPressPhoneNumber },
          ]}
      />
     {/* {
      Platform.OS === 'android' && <KeyboardAvoidingView behavior="padding" />
    } */}
    </>
  )
};

export default Chat;