/**
 * storage key 值
 */
export enum StorageKey {
  currentUser = 'currentUser',
  token = 'token',
  currentRole = 'currentRole', // 当前角色
  userData = 'userData',// 用户消息（包含帮会与好友消息） key: account + '-' + userData, currentUser.role_id
  routeName = 'routeName',
}

/**
 * websocket msgId
 */
export enum SocketMsgId {
  cl2ch_heart_req = 6001, // 心跳
  cl2ch_heart_res = 6002,
  cl2ch_login_req = 6003, // 登录
  cl2ch_login_res = 6004,
  cl2ch_logout_req = 6005, // 退出
  cl2ch_logout_res = 6006,
  cl2ch_bind_token_req = 6007, // 绑定账号
  cl2ch_bind_token_res = 6008,
  cl2ch_app_chat_req = 6009, // 发消息给游戏
  ch2cl_app_chat_res = 6010
}

/**
 *  channel
 */
export enum AppChannel {
  guild = 3, // 帮会
  friend = 5, // 好友聊天
}

/**
 * socket 名称
 */
export enum SocketName {
  chatMessage = 'chatMessage',
}

/**
 * 新消息
 */
export enum SocketNewMsg {
  friend_chat = 8001, // 好友聊天
  friend_add = 8002, //添加好友
  friend_rem = 8003, //删除好友
  guild_chat = 7001,   // 帮会聊天
  role_rename = 7002,  // 玩家改名
  guild_rename = 7003, // 帮会改名
  guild_add_member = 7004, // 帮会添加成员
  guild_rem_member = 7005, // 帮会删除成员
  guild_dismiss = 7006, // 帮会解散
}