/*
 * @Description: 帮会信息
 * @Author: wangzhicheng
 * @Date: 2021-03-01 20:01:12
 */
import React, { useState, useCallback, useEffect } from 'react';
import { View, Text } from 'react-native';
import { StorageKey } from '@/constants/commonConstant';
import { getItem, removeItem } from '@/utils/storage';
import { List, Toast, WhiteSpace } from '@ant-design/react-native';
import AntdModal from '@/components/AntdModal'

const Setting = () => {

  const [visible, setVisible] = useState(false)

  const handleDetMsg = async () => {
    const currentUser = await getItem(StorageKey.currentUser).then(res=>{
      return res
    })
    removeItem(currentUser.account + '-' + StorageKey.friendMsg)
    removeItem(currentUser.account + '-' + StorageKey.guildMsg)

    Toast.success('清除成功', 1)
  }

  const RenderList = () => {
    return (
      <>
        <List>
          <List.Item arrow='horizontal' onPress={()=> setVisible(true)}>清空所有消息</List.Item>
        </List>
      </>
    )
  }

  return (
    <>
     {RenderList()}
     <AntdModal visible={visible} onClose={()=>setVisible(false)} text='您确定清空所有消息吗？帮会消息与好友消息清除后无法恢复' handleOk={handleDetMsg} />
    </>
  )
};

export default Setting;