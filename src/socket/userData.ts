/*
 * @Description: socket 聊天数据
 * @Author: wangzhicheng
 * @Date: 2021-03-16 14:12:49
 */
import UserVo from './userVo'

export default class UserData {
  private static userVo: UserVo = null;

  static setLoginData(value: any) {
    if (!this.userVo) {
      this.userVo = new UserVo();
    }
    this.userVo.setData(value);
  }

  static user(): UserVo {
    return this.userVo;
  }

  /**
   * 帮会新消息
   * @param value 
   */
  static setGuildMsg(value: any) {
    this.userVo.setNewMsg(value, 'guild');
  }

  /**
   * 好友新消息
   * @param value 
   */
  static setFriendMsg(value: any) {
    this.userVo.setNewMsg(value, 'friend');
  }

  /**
   * 好友或帮会列表更新
   * @param value 
   */
  static setFriendOrGuildList(value: any, type: string) {
    this.userVo.setFriendOrGuildList(value, type);
  }

  /**
   * 发消息给好友
   * @param value 
   */
  static sendToFriend(value: any) {
    this.userVo.sendToFriend(value);
  }

  /**
   * 更新UserData值
   * @param value 
   */
  static setUserData(value: any) {
    if (!this.userVo) {
      this.userVo = new UserVo();
    }
    this.userVo.setUser_data(value)
  }

  static getUserData() {
    return this.userVo.User_data;
  }

  static getUserList() {
    return this.userVo.User_list;
  }

  static setCurrentRole(value: any) {
    if (!this.userVo) {
      this.userVo = new UserVo();
    }
    this.userVo.setCurrent_role(value);
  }

  static getCurrentRole() {
    return this.userVo.Current_role;
  }

  /**
   * 退出时删除用户
   */
  static removeUser() {
    this.userVo = null
  }



}