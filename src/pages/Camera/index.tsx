/*
 * @Description: 扫二维码
 * @Author: wangzhicheng
 * @Date: 2021-03-12 16:15:22
 */

import React, { useState, useRef, useEffect } from 'react';
import { View, Text, TouchableOpacity, Animated, Easing } from 'react-native';
import styles from './styles';
import { RNCamera } from 'react-native-camera';
import NavLeftButton from '@/components/NavLeftButton';
import { goBack } from '@/utils/navigation';
import { Button, Flex } from '@ant-design/react-native';

const Camera = (props) => {


  const { navigation, route: { params } } = props

  const [showCamera, setShowCamera] = useState(true)
  const [moveAnim, setMoveAnim] = useState(new Animated.Value(0))
  const [cameraStatus, setCameraStatus] = useState('PENDING_AUTHORIZATION') // 'READY' | 'PENDING_AUTHORIZATION' | 'NOT_AUTHORIZED'

  const isBarcodeReadRef: any = useRef()
  const cameraRef: any = useRef()


  useEffect(() => {
    startAnimation()
    isBarcodeReadRef.current = false

    navigation.setOptions({
      headerShown: false,
    })

  }, [])

  const startAnimation = () => {
    moveAnim.setValue(-350);
    Animated.timing(moveAnim,
      {
        toValue: 0,
        duration: 2000,
        easing: Easing.linear,
        useNativeDriver: true,
      }
    ).start(() => startAnimation());
  };

  // 扫描事件
  const onBarCodeRead = result => {
    if (!isBarcodeReadRef.current) {
      isBarcodeReadRef.current = true;
      // 卸载扫一扫组件，否则还会持续扫描

      setShowCamera(false)
      const { callback } = params
      // console.log('--------result--------', result)
      callback(result['data'])
      goBack()
    }
  };

  const notAuthorizedView = () => {
    return <Flex style={{ flex: 1, flexDirection: 'column', justifyContent: 'center', padding: 15, backgroundColor: '#fff' }}>
      <View style={styles.backBtn}>
        <NavLeftButton style={{ paddingLeft: 20 }} />
      </View>
      <View><Text style={{ fontSize: 16 }}>授权已取消</Text></View>
      <View style={{ marginTop: 20 }}><Text style={{color: '#999', lineHeight: 20}}>{cameraStatus === 'NOT_AUTHORIZED' ? '如未有提示选择相机权限，请您在手机设置->应用管理->选择本应用，打开相机权限。' : ''}</Text></View>
    </Flex>
  }

  return (
    <View style={styles.container}>
      {showCamera ? (
        <RNCamera
          ref={ref => {
            cameraRef.current = ref;
          }}
          style={styles.preview}
          type={RNCamera.Constants.Type.back}
          onBarCodeRead={onBarCodeRead}
          androidRecordAudioPermissionOptions={null}
          captureAudio={false}
          notAuthorizedView={notAuthorizedView()}
          onStatusChange={(e) => setCameraStatus(e.cameraStatus)}
        >
          <View style={styles.backBtn}>
            <NavLeftButton style={{ paddingLeft: 20 }} />
          </View>
          <View style={styles.rectangleContainer}>
            <View style={styles.rectangle} />
            <Animated.View
              style={[
                styles.border,
                { transform: [{ translateY: moveAnim }] }
              ]}
            />
            <Text style={styles.rectangleText}>
              请扫描二维码
              </Text>
          </View>
        </RNCamera>
      ) : (
        <View />
      )}
    </View>
  );
};

export default Camera;