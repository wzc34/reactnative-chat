/*
 * @Description: confirm弹出框
 * @Author: wangzhicheng
 * @Date: 2020-11-04 14:36:11
 */
import React from 'react';
import { Text } from 'react-native'
import { Modal, Flex } from '@ant-design/react-native'
import { px2rem } from '@/utils/px2rem';

const AntdModal = (props) => {
  
    const { onClose, handleOk, visible = false, text, okText = '确定' } = props

    const footerButtons = [
        { text: '取消', style: {color: '#333', fontSize: 14}, onPress: ()=> onClose },
        { text: okText, style: {fontSize: 14}, onPress: ()=> handleOk() },
    ]
    return (
        <Modal
            title=''
            transparent
            // closable
            onClose={onClose}
            maskClosable
            visible={visible}
            footer={footerButtons}
        >
                <Flex justify='center' style={{marginVertical: px2rem(10)}}><Text style={{textAlign: 'center'}}>{text}</Text></Flex>
        </Modal>
    )
}

export default AntdModal
