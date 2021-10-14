/*
 * @Description: 登录
 * @Author: wangzhicheng
 * @Date: 2021-03-01 20:01:12
 */
import React, {useState, useEffect} from 'react';
import { View, Text, Keyboard, Platform } from 'react-native';
import { Button, InputItem, WingBlank, Toast, WhiteSpace } from '@ant-design/react-native'
import { trim } from 'lodash';
import { useNavigation } from '@react-navigation/native';
import { useDispatch, useSelector } from 'react-redux';
import { createForm } from 'rc-form';
import { errorToast, PHONE } from '@/utils/common';
import styles from './styles';
import JPush from 'jpush-react-native';
import { navigate, navigateReset } from '@/utils/navigation';


const Login = (props) => {
  const navigation = useNavigation();
  const dispatch = useDispatch()
  const { form } = props
  const { getFieldProps, getFieldValue } = form

  const [loading, setLoading] = useState(false)
  const [registerID, setRegisterID] = useState(null)

  useEffect(()=>{
    JPush.getRegistrationID(result => {
      console.log("registerID:" , result)
      setRegisterID(result.registerID)
    })
  }, [])


  // 注册
  const doRegister = (phone) => {
    dispatch({
      type: 'user/register',
      payload: {
        account: phone,
      },
      callback: (res) => {
        if (res) {
          doLogin(phone)
        } else {
          setLoading(false)
        }
      },
    });
  }

  // 登录
  const doLogin = (phone) => {
    dispatch({
      type: 'user/login',
      payload: {
        account: phone,
        registerID: registerID,
        platform: Platform.OS,
      },
      callback: (res) => {
        if (res) {
          if (res.code === 0) {
            // Toast.success('登录成功', 1)
            navigateReset('Home');
            // 设置别名
            JPush.setAlias({sequence: Number(phone), alias: phone })
          } else if (res.code === 5) {
            doRegister(phone)
            return;
          }
        }
        setLoading(false)
      },
    });
  }

  const getFormConfig = () => {
    return {
      phone: {
        ...getFieldProps('phone', {
          trigger: 'onChange',
            rules: [
              {
                required: true,
                message: '请输入手机号',
              },
              {
                pattern: PHONE,
                message: '请输入正确手机号吗',
                transform(value: string) {
                  return value && value.replace(/\s/g, '');
                },
              },
            ],
          }),
          type: 'phone',
          maxLength: 15,
          placeholder: '输入手机号（新手机号自动注册）',
      }
    }
  }

  const formConfig = getFormConfig();

  const submit = () => {
    form.validateFields((err, values) => {
      if (!err) {
        setLoading(true)
        let phone = values.phone
        phone = phone && phone.replace(/\s/g, '');
        doLogin(phone)
        Keyboard.dismiss();
      } else {
        errorToast(err);
      }
    });
  };

  return (
    <View style={styles.warp}>
      <WhiteSpace />
      <WingBlank size="md">
        <InputItem {...formConfig.phone} />
        <Button
          loading={loading}
          disabled={loading}
          style={styles.button}
          type="primary"
          onPress={submit}>
          登录
        </Button>
      </WingBlank>
    </View>
  );
};

export default createForm()(Login);