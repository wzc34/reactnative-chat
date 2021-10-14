/*
 * @Description: app
 * @Author: wangzhicheng
 * @Date: 2021-02-24 12:57:19
 */
import React, { useEffect } from 'react';
import { Provider } from 'react-redux';
import { Provider as AntProvider } from '@ant-design/react-native'
import AppStatusBar from './components/AppStatusBar';
import store from './store';
import AppContainer from './routes/AppContainer';
import { antdTheme } from './utils/theme';
import CodePush from "react-native-code-push";
import JPush from 'jpush-react-native';

const App = () =>{

    JPush.setLoggerEnable(true)
    CodePush.sync({});

    useEffect(()=>{
        jpushInit()

        return () => {

        }
    }, [])
    
    const jpushInit = () => {
        JPush.init();
        //连接状态
        const connectListener = result => {
            console.log("connectListener:" + JSON.stringify(result))
        };
        JPush.addConnectEventListener(connectListener);
        //通知回调
        const notificationListener = result => {
            console.log("notificationListener:" + JSON.stringify(result))
        };
        JPush.addNotificationListener(notificationListener);
        //自定义消息回调
        // const customMessageListener = result => {
        //     console.log("customMessageListener:" + JSON.stringify(result))
        // };
        // JPush.addCustomMessagegListener(customMessageListener);
        // tag alias事件回调
        // const tagAliasListener = result => {
        //     console.log("tagAliasListener:" + JSON.stringify(result))
        // };
        // JPush.addTagAliasListener(tagAliasListener);
        // //手机号码事件回调
        // const mobileNumberListener = result => {
        //     console.log("mobileNumberListener:" + JSON.stringify(result))
        // };
        // JPush.addMobileNumberListener(mobileNumberListener);
    }

    return (
        <Provider store={store}>
            <AntProvider theme={antdTheme}>
                <AppStatusBar transparent={false}/>
                <AppContainer />
            </AntProvider>
                
        </Provider>
    )
}

let codePushOptions = { checkFrequency: CodePush.CheckFrequency.MANUAL };

export default CodePush(codePushOptions)(App);