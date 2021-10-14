/*
 * @Description: 账号
 * @Author: wangzhicheng
 * @Date: 2021-03-05 19:26:22
 */
/**
 * 用户信息接口
 */
export interface UserTypes {
  account: string;
  registerID: string;
  platform: string;
}

/**
 * 用户model
 */
export interface IUserState {
  isLogin: boolean;
  token: string;
  currentUser: UserTypes;
}
