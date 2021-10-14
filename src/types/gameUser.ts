/*
 * @Description: 游戏用户
 * @Author: wangzhicheng
 * @Date: 2021-03-24 10:03:42
 */
export interface IMessage {
    roleId: number;
    roleName: string;
    guildId?: number;
    guildName?: string;
    time: number;
    message: string;
    data: any;
    unixtime?: number;
    isRead?: number; // 0:已读， 1: 未读， 大于1：未读条数
  }
  
  export interface IFriends {
    role_id: number;
    role_name: string;
  }
  export interface IMembers {
    role_id: number;
    role_name: string;
  }
  
  export interface IUserData {
    friend_list: IFriends[];
    game_id: string;
    guild_id: number;
    guild_members: IMembers[];
    guild_name: string;
    platform_id: string;
    role_id: number;
    role_name: string;
    server_id: number;
    guild_msg: any;
    friend_msg: any;
  }
  
  export interface IConente {
    content?: string;
    name?: string;
  }
  
  export interface INewMessage {
    data: IConente;
    game_id: string;
    guild_id?: number;
    member_id?: number;
    platform_id: string;
    role_id: number;
    role_name: string;
    server_id: number;
    type: number;
    time: number;
    target_id?: number;
  }
  