/*
 * @Description: 
 * @Author: wangzhicheng
 * @Date: 2021-03-29 10:52:19
 */
package com.gchat.notification;

import android.app.NotificationManager;
import android.app.AppOpsManager;
import android.content.Context;
import android.os.Build;
import android.net.Uri;
import java.lang.reflect.Method;
import java.lang.reflect.Field;
import java.lang.reflect.InvocationTargetException;
import android.content.pm.ApplicationInfo;
import android.provider.Settings;

import android.content.Intent;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.Promise;
import com.gchat.MainActivity;

public class PushNotificationModule extends ReactContextBaseJavaModule {

    private static ReactApplicationContext appContext;

    public PushNotificationModule(ReactApplicationContext reactContext) {
        super(reactContext);
        appContext = reactContext;
    }

    @Override
    public String getName() {
        return "PushNotificationModule";
    }

    /**
    *  获取 APP 系统通知状态
    *
    *
    */
    @ReactMethod
    public void getSystemNoticeStatus(Promise promise) {
        promise.resolve(hasPermission("OP_POST_NOTIFICATION"));
    }

    private boolean hasPermission(String appOpsServiceId) {

        Context context = getReactApplicationContext();
        if (Build.VERSION.SDK_INT >= 24) {
            NotificationManager mNotificationManager = (NotificationManager) context.getSystemService(
                    Context.NOTIFICATION_SERVICE);
            return mNotificationManager.areNotificationsEnabled();
        }else if(Build.VERSION.SDK_INT >= Build.VERSION_CODES.KITKAT){
            AppOpsManager mAppOps = (AppOpsManager) context.getSystemService(Context.APP_OPS_SERVICE);
            ApplicationInfo appInfo = context.getApplicationInfo();

            String pkg = context.getPackageName();
            int uid = appInfo.uid;
            Class appOpsClazz;

            try {
                appOpsClazz = Class.forName(AppOpsManager.class.getName());
                Method checkOpNoThrowMethod = appOpsClazz.getMethod("checkOpNoThrow", Integer.TYPE, Integer.TYPE,
                        String.class);
                Field opValue = appOpsClazz.getDeclaredField(appOpsServiceId);
                int value = opValue.getInt(Integer.class);
                Object result = checkOpNoThrowMethod.invoke(mAppOps, value, uid, pkg);
                return Integer.parseInt(result.toString()) == AppOpsManager.MODE_ALLOWED;
            } catch (InvocationTargetException e) {
                e.printStackTrace();
            } catch (IllegalAccessException e) {
                e.printStackTrace();
            } catch (NoSuchMethodException e) {
                e.printStackTrace();
            } catch (NoSuchFieldException e) {
                e.printStackTrace();
            } catch (ClassNotFoundException e) {
                e.printStackTrace();
            }
        }

        return false;
    }


    /**
    *
    *  跳转到系统通知设置界面
    *  this.appContext 表示文件/应用的上下文环境
    *
    */
    @ReactMethod
    public void openSystemNoticeView(){
        try {
            // 跳转到通知设置界面
            Intent intent = new Intent();
            intent.setAction(Settings.ACTION_APP_NOTIFICATION_SETTINGS);

            //这种方案适用于 API 26, 即8.0（含8.0）以上可以用
            intent.putExtra(Settings.EXTRA_APP_PACKAGE, this.appContext.getPackageName());
            intent.putExtra(Settings.EXTRA_CHANNEL_ID, this.appContext.getApplicationInfo().uid);

            //这种方案适用于 API21——25，即 5.0——7.1 之间的版本可以使用
            intent.putExtra("app_package", this.appContext.getPackageName());
            intent.putExtra("app_uid", this.appContext.getApplicationInfo().uid);

            intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);

            this.appContext.startActivity(intent);
        } catch (Exception e) {
            e.printStackTrace();
            // 出现异常则跳转到应用设置界面：锤子
            Intent intent = new Intent();

            //下面这种方案是直接跳转到当前应用的设置界面。
            //https://blog.csdn.net/ysy950803/article/details/71910806
            intent.setAction(Settings.ACTION_APPLICATION_DETAILS_SETTINGS);
            Uri uri = Uri.fromParts("package", this.appContext.getPackageName(), null);
            intent.setData(uri);

            intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);

            this.appContext.startActivity(intent);
        }
    }
}