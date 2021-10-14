/*
 * @Description: 
 * @Author: wangzhicheng
 * @Date: 2021-03-29 11:42:32
 */

package com.gchat.notification;

import com.facebook.react.ReactPackage;
import com.facebook.react.bridge.JavaScriptModule;
import com.facebook.react.bridge.NativeModule;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.uimanager.ViewManager;
import com.gchat.notification.PushNotificationModule;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

public class PushNotificationPackage implements ReactPackage {

    @Override
    public List<ViewManager> createViewManagers(ReactApplicationContext reactContext) {
        return Collections.emptyList();
    }

    @Override
    public List<NativeModule> createNativeModules(ReactApplicationContext reactContext) {
        List<NativeModule> modules = new ArrayList<>();
        modules.add(new PushNotificationModule(reactContext));
        return modules;
    }
}