/*
 * @Description: confirm弹出框
 * @Author: wangzhicheng
 * @Date: 2020-11-04 14:36:11
 */
import React from 'react';
import { Text } from 'react-native'
import { Flex } from '@ant-design/react-native'
import { screenUtils } from '@/utils/px2rem';

const Empty = (props) => {
    const { message = '暂无数据' } = props
    return (
        <Flex justify='center' style={{height: screenUtils.screenBodyH}}><Text style={{color: '#999'}}>{message}</Text></Flex>
    )
}

export default Empty
