/*
 * @Description: 我的
 * @Author: wangzhicheng
 * @Date: 2021-03-01 20:01:12
 */
import React, {useEffect, useState} from 'react';
import { View, Text, ScrollView, DeviceEventEmitter, Image } from 'react-native';
import { Button, Flex, List, Icon, WhiteSpace, WingBlank } from '@ant-design/react-native';
import AntdModal from '@/components/AntdModal'
import {removeItem, getItem} from '@/utils/storage'
import { SocketName, StorageKey, SocketMsgId } from '@/constants/commonConstant';
import { navigate, navigateReset } from '@/utils/navigation';
import { px2rem } from '@/utils/px2rem';
import NavigationBar from '@/components/NavigationBar'
import styles from './styles'
import UserData from '@/socket/userData';
import SocketManager from '@/socket/socketManager';
import Protocol from '@/socket/protocol'

const Index = (props) => {

  const [visible, setVisible] = useState(false)
  const [user, setUser] = useState(null)
  const [currentRole, setCurrentRole] = useState(null);

  useEffect(()=>{

    getAccount()
    setCurrentRole(UserData.user()?.Current_role)

    const renameEvent = DeviceEventEmitter.addListener('guildRename', ()=> {
      console.log('-----1--', 1)
      setCurrentRole(()=> { return { ...UserData.user()?.Current_role} })
    })

    const tabClickEvent = DeviceEventEmitter.addListener('tabClick', (data)=> {
      if (data === 'Mine') {
        setCurrentRole(()=> { return { ...UserData.user()?.Current_role} })
      }
    })
    return () => {
      renameEvent && renameEvent.remove();
      tabClickEvent && tabClickEvent.remove();
    }
  }, [])

  const getAccount = () => {
    getItem(StorageKey.currentUser).then(res=>{
      if (res) {
        setUser(res)
      } 
    })
  }

  // 退出
  const handleLogout = () => {
    removeItem(StorageKey.token)
    UserData.removeUser()
    navigateReset('Login')
  }

  const sendLogout = async () => {
    DeviceEventEmitter.emit('socketLogout');

    handleLogout()
    setTimeout(() => {
      SocketManager.Destory(SocketName.chatMessage)
    }, 1000);
  }


  const handelTopPage = (page) =>{
    navigate(page)
  }

  return (
      <View style={styles.wrapper}>
        <NavigationBar
          title="我的"
          leading={null}
        />
        <ScrollView
          automaticallyAdjustContentInsets={false}
          showsHorizontalScrollIndicator={false}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.headerBox}>
            <WingBlank>
              <Flex align='center'>
                {/* <Image source={{uri: 'https://placeimg.com/140/140/any'}} style={styles.avatar}/> */}
                <View>
                <Icon name="user" size="md" />
                </View>
                <Flex justify='center' align='start' style={{flexDirection: 'column', height: 60, paddingLeft: 15}}>
                 {/* <Text style={{fontSize: 20}}>{user?.name|| '未填写'}</Text> */}
                 <Text>{user?.account}</Text>
                </Flex>
              </Flex>
            </WingBlank>
          </View>
          <WhiteSpace />
          
          <List>
            {/* <List.Item extra={currentRole?.guild_id}>帮会ID</List.Item> */}
            <List.Item extra={currentRole?.guild_name || '--'}>帮会名称</List.Item>
            {/* <List.Item extra={currentRole?.role_id}>角色ID</List.Item> */}
            <List.Item extra={currentRole?.role_name || '--'}>角色名称</List.Item>
          </List>
        </ScrollView>
        <WingBlank style={{marginVertical: px2rem(10)}}>
            <Button onPress={()=>setVisible(true)}><Text>退出</Text></Button>
        </WingBlank>
        <AntdModal visible={visible} onClose={()=>setVisible(false)} text='您确定退出吗？' handleOk={sendLogout} />
      </View>
  );
};

export default Index