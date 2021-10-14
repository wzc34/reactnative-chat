/*
 * @Description: 登录用户
 * @Author: wangzhicheng
 * @Date: 2020-11-04 14:36:11
 */
import request from '@/utils/request';

/**
 * 用户注册
 * @param account 
 */
export const doRegisterServices = param => {
    return request.post('/login/register', param);
}
/**
 * 登录
 * @param account
 */
export const doLoginServices = param => {
    return request.post('/login/token', param);
}

/**
 * 登录验证
 * @param param 
 */
export const doLoginVerifyServices = param => {
    return request.post('/login/verify', param);
}