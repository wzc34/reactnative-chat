/*
 * @Description: 首页
 * @Author: wangzhicheng
 * @Date: 2021-03-01 20:01:12
 */
import React, { useState, useEffect, useRef, useLayoutEffect, useCallback } from 'react'
import { View, Text, ScrollView, NativeModules, Linking, Platform, DeviceEventEmitter, AppState, BackHandler, ActivityIndicator } from 'react-native';
import { Button, Popover, WingBlank, Toast, Icon, Flex, Portal, WhiteSpace, Modal, Radio, SwipeAction, List, Badge } from '@ant-design/react-native'
import { navigate, navigateReset, onBackAndroid } from '@/utils/navigation';
import NavigationBar from '@/components/NavigationBar';
import styles from './styles';
import { getItem, removeItem, setItem } from '@/utils/storage';
import { StorageKey, SocketMsgId, SocketName, SocketNewMsg } from '@/constants/commonConstant';
import SocketManager from '@/socket/socketManager';
import Protocol from '@/socket/protocol'
import AntdModal from '@/components/AntdModal';
import UserData from '@/socket/userData';
import Empty from '@/components/Empty';
import { screenUtils } from '@/utils/px2rem';
import { unixToStrtime } from '@/utils/common';
import { TouchableOpacity } from 'react-native-gesture-handler';
/** 心跳间隔时间 */
const count = 1000 * 5
// 断开重连
const disCount = 1000 * 2
const RadioItem = Radio.RadioItem
const Item = Popover.Item;

const Home = (props) => {

  const { route, navigation } = props

  const [qrcodeToken, setQrcodeToken] = useState('')
  const [visible, setVisible] = useState(false) // 未绑定提示
  const [isBind, setIsBind] = useState(true)
  const [loading, setLoading] = useState(true)
  const [reconnect, setReconnect] = useState(0)
  const [role_visible, setRole_visible] = useState(false)
  const [currentRole, setCurrentRole] = useState(null)
  const [userList, setUserList] = useState(null) // 登录后返回的值user_data_list
  const [roleIndex, setRoleIndex] = useState(0)
  const [appState, setAppState] = useState('')
  const [notice_visible, setNotice_visible] = useState(false)
  const [err_visible, setErr_visible] = useState(false)

  const keyloadRef = useRef(null)
  const sendHeartRef = useRef(null)
  const reconnectRef = useRef(null)
  const bindAccountRef = useRef(null)

  useEffect(() => {

    // 注册 socket
    SocketManager.RegisterSocket(SocketName.chatMessage);
    // 连接 socket
    SocketManager.Connect(SocketName.chatMessage);

    getItem(StorageKey.currentUser).then(user => {
      if (user) {
        getItem(user.account + '-' + StorageKey.userData).then(res => {
          if (res) {
            UserData.setUserData(res)
          }
        })
        getItem(user.account + '-' + StorageKey.currentRole).then(res => {
          if (res) {
            UserData.setCurrentRole(res)
            setCurrentRole(res)
          }
        })
      }
    })

    setItem(StorageKey.routeName, route.name)
  }, [])

  /**
   * 开启消息推送
   */
  useEffect(() => {
    const noticetimeout = setTimeout(() => {
      openSystemNoticeSetting()
    }, 1000);

    return () => noticetimeout && clearTimeout(noticetimeout)
  }, [isBind])

  useEffect(() => {

    // 监听socket连接成功后发送消息
    const chatEvent: any = DeviceEventEmitter.addListener('loginChat', (key) => {
      if (key === SocketName.chatMessage) {
        sendLoginChat()
      }
    })

    // socket返回值
    const chatReceive: any = DeviceEventEmitter.addListener('receiveData', receiveMsg)

    // socket 断开重连
    const socketReconnent: any = DeviceEventEmitter.addListener('socketReconnent', reconnectSocket)

    // 手机状态
    AppState.addEventListener('change', handleAppStateChange)

    // 未读消息
    const isReadMsg: any = DeviceEventEmitter.addListener('isReadMsg', resetReadMsg)

    BackHandler.addEventListener('hardwareBackPress', () => onBackAndroid(navigation));

    //退出socket
    const socketLogout: any = DeviceEventEmitter.addListener('socketLogout', sendLogout)

    return () => {
      chatEvent && chatEvent.remove()
      chatReceive && chatReceive.remove()
      socketReconnent && socketReconnent.remove()
      isReadMsg && isReadMsg.remove()
      socketLogout && socketLogout.remove()
      AppState.removeEventListener('change', handleAppStateChange)
      BackHandler.removeEventListener('hardwareBackPress', () => onBackAndroid(navigation));
      // reconnectRef.current && clearTimeout(reconnectRef.current)
    }
  }, [])


  /**
   * 扫二维码后绑定
   */
  useEffect(() => {
    // 如果socket未连接，直到连接后重新绑定
    bindAccountRef.current && clearTimeout(bindAccountRef.current)
    bindAccountRef.current = setTimeout(() => {
      if (qrcodeToken && SocketManager.isConnect(SocketName.chatMessage)) {
        sendAccountBind()
      }
    }, disCount);
    return () => {
      bindAccountRef.current && clearTimeout(bindAccountRef.current)
    }
  }, [qrcodeToken])
  /**
   * 接收的消息
   * @param res 
   */
  const receiveMsg = (res) => {
    setErr_visible(false)
    // console.log('--------res------------', res)
    if (res && res.data && res.data !== 'null') {
      const data = JSON.parse(res.data)
      if (data.code === -1 || data.code === -2) { // -1:重连失败； -2:重新连接了,但是服务端没有这个session信息
        Toast.fail('连接失败', 1)
      } else if (data.code === 210012) { // 210012:账号已登录在别的设备上
        Toast.fail('您的账号已在其他设备上登录', 1)
        sendLogout()
        removeItem(StorageKey.token)
        UserData.removeUser()
        navigateReset('Login')
      } else {
        switch (res.protocolID) {
          case SocketMsgId.cl2ch_bind_token_res: // 绑定
            setQrcodeToken('')
            removeKeyLoading()
            bindAccountRef.current && clearTimeout(bindAccountRef.current)
            if (data.code === 0) {
              Toast.success('绑定成功', 1)
              setIsBind(true)
              // 返回用户信息
              getMessageChange(data)
              // 登录
              sendLoginChat(1)
            } else if (data.code === 3) {
              Toast.fail('二维码已失效', 1)
            } else if (data.code === 4) {
              Toast.fail('您已绑定角色，请勿重复绑定', 1)
            }
            break;
          case SocketMsgId.cl2ch_login_res: // 登录
            if (data.user_data_list === null) { // 未绑定
              setIsBind(false)
              getItem(StorageKey.routeName).then(res => {
                if (res === 'Home' && !visible) {
                  setVisible(true)
                }
              })
              // 清除用户缓存
              getItem(StorageKey.currentUser).then(user => {
                if (user) {
                  removeItem(user.account + '-' + StorageKey.userData)
                  removeItem(user.account + '-' + StorageKey.currentRole)
                }
              })
              UserData.removeUser()
            } else {
              // 登录后的消息
              getMessageChange(data)
              // 登录成功之后发送心跳连接
              sendHeartRef.current && clearTimeout(sendHeartRef.current)
              sendSocketHeart()
              setIsBind(true)
            }
            break;
          case SocketNewMsg.friend_chat: // 好友新消息
            getFriendNewMsg(data)
            break;
          case SocketNewMsg.guild_chat: case SocketNewMsg.guild_rename: case SocketNewMsg.role_rename: // 帮会新消息，聊天或改名
            getGuildNewMsg(data)
            break;
          case SocketNewMsg.guild_add_member: case SocketNewMsg.guild_rem_member: case SocketNewMsg.guild_dismiss:
            getFriendOrGuildList(data, 'guild')
            break;
          case SocketNewMsg.friend_add: case SocketNewMsg.friend_rem:
            getFriendOrGuildList(data, 'friend')
            break;
          default:
            break;
        }
      }
    }
  }

  /**
   * 重连socket
   */
  const reconnectSocket = () => {
    setReconnect(1) // 重连
    setErr_visible(true)
    sendHeartRef.current && clearTimeout(sendHeartRef.current)

    console.log('开始重连...')
    if (!SocketManager.isConnect(SocketName.chatMessage) && appState === 'active') { // app运行中
      reconnectRef.current && clearTimeout(reconnectRef.current)
      reconnectRef.current = setTimeout(() => {
        SocketManager.RegisterSocket(SocketName.chatMessage);
        SocketManager.Connect(SocketName.chatMessage);
      }, disCount);
    }
  }

  /**
   * 状态改变响应
   * @param state 
   */
  const handleAppStateChange = async (state) => {
    console.log('-----------------状态改变响应------------', state)
    setAppState(state)
    if (state === 'active') { // app打开的
      if (!SocketManager.isConnect(SocketName.chatMessage)) { // app运行中
        reconnectRef.current && clearTimeout(reconnectRef.current)
        reconnectRef.current = setTimeout(() => {
          SocketManager.RegisterSocket(SocketName.chatMessage);
          SocketManager.Connect(SocketName.chatMessage);
        }, disCount);
      }
    } else {
      // 转入后台就退出socket
      sendLogout()
    }
  }

  /**
   * 退出socket
   */
  const sendLogout = async () => {
    console.log('正在退出...')
    const currentUser = await getItem(StorageKey.currentUser).then(res => {
      return res
    })
    const param = { account: currentUser.account }
    const protocol = new Protocol(SocketMsgId.cl2ch_logout_req, param)
    SocketManager.Send(protocol, SocketName.chatMessage)
    SocketManager.UnregisterSocket(SocketName.chatMessage)
    sendHeartRef.current && clearTimeout(sendHeartRef.current)
  }

  /**
   * 有未读消息改为已读
   * @param data 
   */
  const resetReadMsg = (data) => {

    if (data && data.id) {

      const { type, id } = data
      UserData.getUserData().forEach(item => {

        const msgList = type === 'friend' ? item.friend_msg : item.guild_msg

        if (msgList) {
          const msgObj = msgList.find(obj => {
            if (type === 'friend') {
              return obj.roleId === id
            } else {
              return obj.guildId === id
            }
          })
          if (msgObj) {
            msgObj.isRead = 0
            msgObj.data.forEach(msg => {
              msg.isRead = 0
            })
          }
        }
      })
      // 更新信息
      UserData.setUserData(UserData.getUserData())
      loadUserDataMsg()
      saveCurrentRole(currentRole.role_id)
    }
  }


  /**
   * 发送账号绑定请求
   */
  const sendAccountBind = async () => {
    const currentUser = await getItem(StorageKey.currentUser).then(res => {
      return res
    })
    const param = { account: currentUser.account, token: qrcodeToken }
    const protocol = new Protocol(SocketMsgId.cl2ch_bind_token_req, param)
    SocketManager.Send(protocol, SocketName.chatMessage)
  }

  /**
   * 发送登录请求
   */
  const sendLoginChat = async (reconnectState = reconnect) => {
    const currentUser = await getItem(StorageKey.currentUser).then(res => {
      return res
    })
    const param = { account: currentUser.account, reconnect: reconnectState }
    const protocol = new Protocol(SocketMsgId.cl2ch_login_req, param)
    SocketManager.Send(protocol, SocketName.chatMessage)
  }

  /**
   * 发送心跳请求
   */
  const sendSocketHeart = async () => {
    console.log('心跳：', sendHeartRef.current)

    const currentUser = await getItem(StorageKey.currentUser).then(res => {
      return res
    })
    const param = { account: currentUser.account }
    const protocol = new Protocol(SocketMsgId.cl2ch_heart_req, param)
    if (!SocketManager.GetSocket(SocketName.chatMessage)) SocketManager.RegisterSocket(SocketName.chatMessage)
    if (!SocketManager.isConnect(SocketName.chatMessage)) SocketManager.Connect(SocketName.chatMessage)
    SocketManager.Send(protocol, SocketName.chatMessage)
    
    sendHeartRef.current = setTimeout(() => {
      sendSocketHeart()
    }, count);
  }

  /**
   *  登录后获取所有消息
   */
  const getMessageChange = async (data) => {

    UserData.setLoginData(data);

    const user_list = UserData.getUserList()

    const role: any = UserData.getCurrentRole()

    if (user_list) {

      setRadioValue()

      setUserList(user_list)
      if (role) {
        loadUserDataMsg();
        saveCurrentRole(role.role_id)
        setLoading(false)
      } else {
        if (user_list.length === 1) {
          saveCurrentRole(user_list[0].role_id)
          loadUserDataMsg();
          setLoading(false)
        } else {
          setRole_visible(true)
        }
      }
    }
  }

  /**
   * 选择角色时显示值
   */
  const setRadioValue = () => {
    const user_list = UserData.getUserList()
    if (user_list && user_list.length > 0) {
      const role: any = UserData.getCurrentRole()
      user_list.forEach((item, index) => {
        if (role) {
          if (item.role_id === role.role_id) {
            item.checked = true
          } else {
            item.checked = false
          }
        } else {
          if (index === 0) {
            item.checked = true
          } else {
            item.checked = false
          }
        }
      });
    }
    setUserList(user_list)
  }

  /**
   * 移除加载提示
   */
  const removeKeyLoading = () => {
    if (keyloadRef.current) {
      setLoading(false)
      Portal.remove(keyloadRef.current)
      keyloadRef.current = null
    }
  }

  /**
   * 选择角色，修改currentRole
   */
  const handleSelectRole = async () => {
    const roleItem = userList[roleIndex]
    const role: any = UserData.getCurrentRole()
    if (role && role.role_id === roleItem.role_id) {
      setRole_visible(false);
      return;
    }
    saveCurrentRole(roleItem.role_id)
    setRole_visible(false);
    setLoading(false)

  }

  /**
   * 保存currentRole
   * @param role_id 
   */
  const saveCurrentRole = async (role_id: number) => {
    const userData = UserData.getUserData()

    let role = userData.find(item => item.role_id === role_id)

    if (!role) {
      role = userData[0]
    }
    UserData.setCurrentRole(role)

    setCurrentRole(() => { return { ...role } })

    const currentUser = await getItem(StorageKey.currentUser).then(res => {
      return res
    })
    setItem(currentUser.account + '-' + StorageKey.currentRole, role)

    DeviceEventEmitter.emit('newMsgToChatUpdate', {})
  }

  /**
   * 存入所有消息
   */
  const loadUserDataMsg = async () => {
    const user_data = UserData.getUserData()
    if (user_data.length > 0) {
      const currentUser = await getItem(StorageKey.currentUser).then(res => {
        return res
      })
      setItem(currentUser.account + '-' + StorageKey.userData, user_data)
    }
  }

  /**
   * 帮会新消息
   * @param data 
   */
  const getGuildNewMsg = async (data) => {

    UserData.setGuildMsg(data)

    loadUserDataMsg()

    const role: any = UserData.getCurrentRole()
    saveCurrentRole(role.role_id)

    if (data && (data.type === SocketNewMsg.guild_rename || data.type === SocketNewMsg.role_rename)) {
      DeviceEventEmitter.emit('guildRename', {})
    }
  }

  /**
   * 好友新消息
   * @param data 
   */
  const getFriendNewMsg = async (data) => {

    UserData.setFriendMsg(data)

    loadUserDataMsg()

    const role: any = UserData.getCurrentRole()
    saveCurrentRole(role.role_id)
  }

  /**
   * 好友或帮会列表更新
   * @param data 
   * @param type 
   */
  const getFriendOrGuildList = async (data, type) => {

    UserData.setFriendOrGuildList(data, type)

    loadUserDataMsg()

    const role: any = UserData.getCurrentRole()
    saveCurrentRole(role.role_id)

    DeviceEventEmitter.emit('freindOrGuildUpdate', {})
  }

  /**
   * 去聊天详情页
   * @param item 
   * @param type 
   */
  const handleToChat = (item, type) => {
    navigate('Chat', { user: item, type });
  }

  /**
   * 删除消息
   * @param item 
   * @param type 
   */
  const handleDelete = (index, type) => {
    const userData = UserData.getUserData()
    userData.forEach(item => {
      if (item.role_id === currentRole.role_id) {
        if (type === 'friend') {
          item.friend_msg.splice(index, 1)
        } else {
          item.guild_msg.splice(index, 1)
        }
      }
    })
    UserData.setUserData(userData)
    loadUserDataMsg()
    saveCurrentRole(currentRole.role_id)
  }

  const RenderItem = (item, index: number, type: string) => {
    const name = type === 'guild' ? item.guildName : item.roleName

    const right = [
      {
        text: '删除',
        onPress: () => handleDelete(index, type),
        style: { backgroundColor: 'red', color: 'white' },
      },
    ];

    const isRead = item.isRead && item.isRead > 0
    return (
      <View key={index}>
        {/* <TouchableOpacity onPress={()=>handleToChat(item, type)}>
                <Flex justify='between'>
                    <Flex>
                        <View style={styles.avatarBox}>
                            <Image source={{uri: 'https://placeimg.com/140/140/any'}} style={styles.avatar} />
                        </View>
                        <View>
                            <Flex><Text style={{color: '#25245A'}}>{name} </Text></Flex>
                            <Text style={styles.text}>{`${type === 'guild' ? item.roleName + ': ': ''}${item.message}`} </Text>
                        </View>
                    </Flex>
                    <View><Text style={{color: '#77869E', fontSize: 10}}>{item.time} </Text></View>
                </Flex>
              </TouchableOpacity> */}
        <SwipeAction
          autoClose
          style={{ backgroundColor: 'transparent' }}
          right={right}
        // onOpen={() => console.log('open')}
        // onClose={() => console.log('close')}
        >
          <List.Item onPress={() => handleToChat(item, type)} extra={<Text style={styles.titleText}>{unixToStrtime(item.time)}</Text>}>
            <Badge dot={isRead}><Text style={{ fontSize: 17 }}>{name} </Text></Badge>
            <List.Item.Brief><Flex style={{ width: screenUtils.screenW - 100 }}><Text style={styles.briefText} ellipsizeMode='tail' numberOfLines={1}>{isRead ? `[${item.isRead}条] ` : ''}{`${type === 'guild' ? item.roleName + ': ' : ''}${item.message}`} </Text></Flex></List.Item.Brief>
          </List.Item>
        </SwipeAction>
      </View>
    )
  }

  // 帮会
  const RenderGuild = () => {
    let guildData = []
    if (currentRole) guildData = currentRole.guild_msg
    return (
      <>
        {
          guildData && guildData.length > 0 &&
          <>
            {/* <WingBlank><Text>帮会</Text></WingBlank> */}
            <List renderHeader={'帮会'}>
              {guildData.map((item, i) =>
                <View key={item.roleId + '' + i}>
                  {
                    RenderItem(item, i, 'guild')
                  }
                </View>
              )}
            </List>
          </>
        }
      </>
    )
  }

  // 好友
  const RenderFriend = () => {
    let friendData = []
    if (currentRole) friendData = currentRole.friend_msg
    return (
      <>
        { friendData && friendData.length > 0 &&
          <>
            {/* <WhiteSpace />
            <WingBlank><Text>好友</Text></WingBlank> */}
            <List renderHeader={'好友'}>
              {friendData.map((item, i) =>
                <View key={item.roleId + '' + i}>
                  {
                    RenderItem(item, i, 'friend')
                  }
                </View>
              )}
            </List>
          </>
        }
      </>
    )
  }

  /**
   * 右上角事件
   */
  const handleSelect = (value) => {
    if (value === 'scan') {

      setQrcodeToken('')
      removeKeyLoading()
      navigate('Camera', {
        callback: (data) => {
          if (data) {
            keyloadRef.current = Toast.loading('正在绑定...', 30)
            setQrcodeToken(data);
          }
        }
      })
    } else if (value === 'swap') {
      setRole_visible(true)
    }
  }

  /**
   * 导航右上角按钮
   * @returns 
   */
  // const RenderRightBtn = useCallback(() => {
  //   const props = {
  //     marginLeft: 10
  //   }
  //   let overlay = ([<Item value={'scan'} key={'scan'}>
  //     <Flex><Icon name='scan' color={'#333'} size={20} /><Text style={props}>扫一扫</Text></Flex>
  //   </Item>])
  //   if (userList && userList.length > 1) {
  //     overlay = overlay.concat([<Item value={'swap'} key={'swap'}>
  //       <Flex><Icon name='swap' color={'#333'} size={20} /><Text style={props}>切换角色</Text></Flex>
  //     </Item>])
  //   }
  //   return (
  //     <Popover
  //       placement={'bottom'}
  //       triggerStyle={{
  //         paddingHorizontal: 16,
  //       }}
  //       onSelect={value => handleSelect(value)}
  //       overlay={overlay}
  //     >
  //       <Icon name='plus-circle' color={'#333'} size={20} />
  //     </Popover>

  //   )
  // }, [userList])

  const RenderRightBtn = () => {
    return (
      <Flex style={{ paddingRight: 15 }}>
        <TouchableOpacity onPress={() => handleSelect('scan')}><Icon name='scan' color={'#333'} size={20} /></TouchableOpacity>
      </Flex>
    )
  }

  const RenderLeftBtn = (<>
    { userList && userList.length > 1 ?
      <Flex style={{ paddingLeft: 5 }}>
        <TouchableOpacity><Icon name='swap' color={'#333'} size={20} /></TouchableOpacity>
      </Flex>
      : null
    }
  </>)


  /**
   *  跳转到 APP 消息设置页面
   */
  const openSystemNoticeSetting = () => {
    if (Platform.OS === "android") {
      const myModules = NativeModules.PushNotificationModule
      if (myModules)
        NativeModules.PushNotificationModule.getSystemNoticeStatus().then(res => {
          if (!res && isBind) {
            setNotice_visible(true)
          }
        })
    } else {
      Linking.openURL('app-settings:')
        .catch(err => console.log('openSystemSetting error', err));
    }
  }

  const handleOpenNotification = () => {
    if (Platform.OS === "android") {
      NativeModules.PushNotificationModule.openSystemNoticeView()
    } else {
      Linking.openURL('app-settings:')
        .catch(err => console.log('openSystemSetting error', err));
    }
    setNotice_visible(false)
  }

  const RenderBindModal = () => {
    return <AntdModal visible={visible} onClose={() => setVisible(false)} text='您还没有绑定账号' okText='去绑定' handleOk={() => handleSelect('scan')} />
  }
  const RenderNotificationModal = () => {
    return <AntdModal visible={notice_visible} onClose={() => setNotice_visible(false)} text='您当前未打开消息推送提醒，建议您开启提醒，开启后在未打开应用时也能收到好友消息' okText='去开启' handleOk={() => handleOpenNotification()} />
  }

  /**
   * 关闭选择角色
   */
  const handleClose = () => {
    const role: any = UserData.getCurrentRole()
    if (role) {
      setRole_visible(false)
      setRadioValue()
    }
  }

  const RenderModal = () => {
    const color = '#323643'
    return (
      <Modal
        popup
        maskClosable
        visible
        animationType="slide-up"
        onClose={() => handleClose()}
        style={{
          borderTopLeftRadius: 12,
          borderTopRightRadius: 12,
        }}
      >
        <View>
          <Flex justify='between' style={{ margin: 20 }}><Text style={{ fontSize: 20, color }}>选择角色</Text>
          </Flex>
          <View style={{ marginHorizontal: 5 }}>
            {userList && userList.map((item, index) =>
              <RadioItem
                key={item.guild_id + '_' + item.role_id}
                onChange={event => {
                  if (event.target.checked) {
                    userList.forEach(item => item.checked = false)
                    userList[index].checked = true
                    setRoleIndex(index)
                    setUserList(() => [...userList])
                  }
                }}
                checked={item.checked}
              >
                {item.role_name}
              </RadioItem>
            )}
          </View>
          <WhiteSpace size='lg' />
          <WingBlank>
            <Button onPress={() => {
              handleSelectRole()
            }} type="primary">确定</Button>
          </WingBlank>
          <WhiteSpace size='lg' />
        </View>
      </Modal>
    )
  }

  return (
    <View style={styles.wrapper}>
      <NavigationBar
        title="聊天"
        leading={RenderLeftBtn}
        leadingPress={() => handleSelect('swap')}
        trailing={RenderRightBtn()}
      />
      <ScrollView
        automaticallyAdjustContentInsets={false}
        showsHorizontalScrollIndicator={false}
        showsVerticalScrollIndicator={false}
      >
        {err_visible && <Flex style={styles.socketDisConnectTip}><Icon name="info-circle" color='#ff4d4f' style={{ marginRight: 8 }} /><Text>连接已断开，正在尝试连接...</Text></Flex>}
        {RenderGuild()}
        {RenderFriend()}
        {!loading && currentRole && (!currentRole.guild_msg || currentRole.guild_msg?.length === 0) && (!currentRole.friend_msg || currentRole.friend_msg?.length === 0) && <Empty />}
        {!isBind && <Empty message='您还未绑定角色，请点击右上角扫一扫绑定' />}
        {role_visible && RenderModal()}
        <RenderBindModal />
        {notice_visible && isBind && RenderNotificationModal()}
      </ScrollView>
    </View>
  );

};

export default Home