/*
 * @Description: 通讯录
 * @Author: wangzhicheng
 * @Date: 2021-03-11 15:26:48
 */
import React, { useState, useCallback, useEffect } from 'react';
import { View, Text, ScrollView, DeviceEventEmitter } from 'react-native';
import { Toast, List } from '@ant-design/react-native'
import NavigationBar from '@/components/NavigationBar';
import { navigate } from '@/utils/navigation';
import styles from './styles';
import Empty from '@/components/Empty';
import UserData from '@/socket/userData';

const Contacts = () => {

  const [currentRole, setCurrentRole] = useState(null);

  useEffect(() => {

    setCurrentRole(UserData.user()?.Current_role)

    const renameEvent = DeviceEventEmitter.addListener('guildRename', () => {
      setCurrentRole(() => { return { ...UserData.user()?.Current_role } })
    })

    const freindOrGuildUpdateEvent = DeviceEventEmitter.addListener('freindOrGuildUpdate', () => {
      setCurrentRole(() => { return { ...UserData.user()?.Current_role } })
    })

    const tabClickEvent = DeviceEventEmitter.addListener('tabClick', (data) => {
      if (data === 'Contacts') {
        if (UserData.user()?.Current_role)
          setCurrentRole(() => { return { ...UserData.user()?.Current_role } })
      }
    })

    return () => {
      renameEvent && renameEvent.remove();
      freindOrGuildUpdateEvent && freindOrGuildUpdateEvent.remove();
      tabClickEvent && tabClickEvent.remove();
    }
  }, [])

  const handleClick = (item, type) => {
    if (type === 'member') {
      if (item.roleId === currentRole.role_id) { // 与自己发消息
        Toast.info(`不能给自己发送消息`, 1)
      } else {
        const friend_list = currentRole.friend_list
        if (friend_list && friend_list.length > 0) {
          const friend = friend_list.find(obj => obj.role_id === item.roleId)
          if (friend) {
            const friend_msg = currentRole.friend_msg
            if (friend_msg && friend_msg.length > 0) {
              const myObj = friend_msg.find(obj => obj.roleId === item.roleId || obj.roleId === currentRole.role_id)
              if (myObj) item = myObj
            }
            handleToChat(item, 'friend')
            return;
          }
        }
        Toast.info(`您与${item.roleName}不是好友，不能发送消息`, 1)
      }
    } else {
      handleToChat(item, type)
    }
  }

  /**
   * 去聊天详情页
   * @param item 
   * @param type 
   */
  const handleToChat = (item, type) => {
    if (type === 'guild') {
      item = currentRole.guild_msg && currentRole.guild_msg.length > 0 ? currentRole.guild_msg[0] : item
    } else {
      const friend_msg = currentRole.friend_msg
      if (friend_msg && friend_msg.length > 0) {
        const myObj = friend_msg.find(obj => obj.roleId === item.roleId || obj.roleId === currentRole.role_id)
        if (myObj) item = myObj
      }
    }
    navigate('Chat', { user: item, type });
  }

  const RenderGuild = () => {
    return (
      <>
        {currentRole && currentRole.guild_name !== '' &&
          <List renderHeader={'我的帮会'}>
            <View>
              <List.Item onPress={() => handleClick({ guildId: currentRole.guild_id, guildName: currentRole.guild_name }, 'guild')}>{currentRole.guild_name}</List.Item>
              {RenderMember(currentRole)}
            </View>
          </List>
        }
      </>
    )
  }

  const RenderMember = (item) => {
    const members = item.guild_members
    return (
      <>
        {members && members.length > 0 &&
          <List renderHeader={`帮会成员(${members.length})`}>
            {members.map((item, i) =>
              <List.Item key={item.role_id} onPress={() => handleClick({ roleId: item.role_id, roleName: item.role_name }, 'member')}>{item.role_name}</List.Item>
            )}
          </List>
        }
      </>
    )
  }

  const RenderFriend = () => {
    const friends = currentRole?.friend_list
    return (
      <>
        {friends && friends.length > 0 &&
          <List renderHeader={`我的好友(${friends.length})`}>
            {friends.map((item, i) =>
              <List.Item key={item.role_id + '' + i} onPress={() => handleClick({ roleId: item.role_id, roleName: item.role_name }, 'friend')}>{item.role_name}</List.Item>
            )}
          </List>
        }
      </>
    )
  }

  const RenderEmpty = () => {
    if (!currentRole || (currentRole && (!currentRole.friend_list || currentRole.friend_list.length === 0)) && currentRole.guild_name === '') {
      return <Empty />
    }
  }

  return (
    <View style={styles.wrapper}>
      <NavigationBar
        title="通讯录"
        leading={null}
      />
      <ScrollView
        automaticallyAdjustContentInsets={false}
        showsHorizontalScrollIndicator={false}
        showsVerticalScrollIndicator={false}
      >
        {RenderGuild()}
        {RenderFriend()}
        {RenderEmpty()}
      </ScrollView>
    </View>
  )
};

export default Contacts;