/*
 * @Description: socket 聊天数据
 * @Author: wangzhicheng
 * @Date: 2021-03-16 14:12:49
 */

import { groupBy, sortBy } from 'lodash';
import { switchUserMessage, switchMessageType } from '@/utils/common';
import { SocketNewMsg } from '@/constants/commonConstant';
import { IMessage, INewMessage, IUserData } from '@/types/gameUser';

export default class UserData {

  private user_data = []; // 用户、帮会、好友信息
  private current_role: IUserData = null;
  private user_list = []; // 只有用户信息


  constructor() {

  }

  // 登录返回的数据
  setData(data): void {

    const friend_msg = data.friend_msg
    const guild_msg = data.guild_msg
    const user_data = data.user_data_list

    // 判断只有user_data_list信息
    if (!friend_msg && !guild_msg && user_data && user_data.length > 0) {
      this.user_list = user_data
      if (this.user_data.length === 0) {
        this.user_data = user_data
      } else {
        user_data.forEach(user => {
          //更新user_data_list信息
          const frontUser = this.user_data.find(item => item.role_id === user.role_id)
          user.guild_msg = frontUser?.guild_msg || []
          user.friend_msg = frontUser?.friend_msg || []
        });

        this.user_data = user_data
      }
      return;
    }

    if (this.user_list && this.user_list.length > 0) {
      const user_data = [...this.user_list]
      user_data.forEach(user => {
        // 获取之前的帮会或发友消息
        const frontUser = this.user_data.find(item => item.role_id === user.role_id)
        user.guild_msg = frontUser?.guild_msg || []
        user.friend_msg = frontUser?.friend_msg || []
        this.getGuildMessage(user, guild_msg)
        this.getFriendMessage(user, friend_msg)
      });

      this.user_data = user_data
    }
  }

  /**
   * 帮会消息
   * @param user 
   * @param friend_msg 消息内容
   */
  private getGuildMessage(user: IUserData, guild) {

    // 消息内容
    const members = user.guild_members
    if (guild && members && members.length > 0) {
      let guild_msg = []
      // 多角色下，判断消息是属于哪个角色的
      if (guild.game_id === user.game_id && guild.server_id === user.server_id && guild.guild_id === user.guild_id && guild.recv_id === user.role_id) {
        guild_msg = guild.guild_msg
      }

      if (guild_msg.length > 0) {
        this.getData(guild_msg, 'guild', user)
      }
    }
  }

  /**
   * 好友消息
   * @param user 
   * @param friend_msg 消息内容
   */
  private getFriendMessage(user: IUserData, friend) {

    // 消息内容
    const friends = user.friend_list
    if (friend && friends && friends.length > 0) {
      let friend_msg = []
      if (friend.game_id === user.game_id && friend.server_id === user.server_id) {
        friend_msg = friend.friend_msg
      }
      if (friend_msg.length > 0) {

        // 消息接收人为当前角色
        const targetIsUserMsg = friend_msg.filter(item => item.Content.target_id === user.role_id)
        if (targetIsUserMsg && targetIsUserMsg.length > 0) {
          this.getFriendMsg(targetIsUserMsg, user, false)
        }

        // 消息发送人为当前角色
        const sendIsUserMsg = friend_msg.filter(item => item.Content.role_id === user.role_id)
        if (sendIsUserMsg && sendIsUserMsg.length > 0) {
          sendIsUserMsg.forEach(item => {
            item.RoleId = item.Content.target_id
          })
          this.getFriendMsg(sendIsUserMsg, user, true)
        }
      }
    }
  }

  /**
   * 分组显示的好友信息
   * @param messageData 
   * @param user 
   * @param isReverse 主要用于当前角色是自己，又是自己发的消息时
   */
  private getFriendMsg(messageData, user: IUserData, isReverse: boolean) {
    const roleIdKeyObj = groupBy(messageData, 'RoleId')
    if (roleIdKeyObj && Object.keys(roleIdKeyObj).length > 0) {
      // 分组有几个好友与帮会，显示列表中
      for (let key in roleIdKeyObj) {
        const value = roleIdKeyObj[key]
        this.getData(value, 'friend', user, isReverse)
      }
    }
  }

  private getData(type_msg_list, type: string, user: IUserData, isReverse = false) {

    let msgObj: IMessage = { // 列表显示一条数据
      roleId: null,
      roleName: '',
      guildId: type === 'guild' ? user.guild_id : null,
      guildName: type === 'guild' ? user.guild_name : null,
      message: '',
      time: null,
      data: [],
      isRead: 1,
    }

    let arr = []
    type_msg_list.forEach(msg => {
      arr.push({
        ...msgObj,
        message: switchUserMessage(msg.Content),
        time: msg.Time,
        unixtime: msg.Time,
        data: [],
        roleId: msg.Content.role_id,
        roleName: type === 'guild' ? this.getGuildRoleName(user, msg.Content.role_id) : this.getFreindRoleName(user, msg.Content.role_id, msg.Content.role_name),
      })
    })
    if (arr.length > 0) {
      msgObj = { ...msgObj, ...arr[0] }
    }
    arr = sortBy(arr, function (item) {
      return -item.unixtime;//根据unixtime对数据进行升序排序，如果降序则改为：return -item.unixtime
    });
    msgObj.data = arr
    if (type === 'friend' && isReverse) {
      msgObj.roleId = type_msg_list[0].RoleId
      msgObj.roleName = this.getFreindRoleName(user, msgObj.roleId, msgObj.roleName)
    }

    let currentMsg = type === 'guild' ? user.guild_msg || [] : user.friend_msg || [];

    // console.log('------2---msgObj---', msgObj)
    if (currentMsg && currentMsg.length > 0) {
      let myMsg: IMessage = null
      if (type === 'guild') {
        myMsg = currentMsg.find(item => item.guildId === msgObj.guildId)
      } else {
        myMsg = currentMsg.find(item => item.roleId === msgObj.roleId)
      }
      if (myMsg) {
        myMsg.data = msgObj.data.concat(myMsg.data)
        myMsg.message = msgObj.message
        myMsg.time = msgObj.time
        myMsg.isRead = (myMsg.isRead || 0) + arr.length
      } else {
        if (arr.length > 1) {
          msgObj.isRead = arr.length
        }
        currentMsg.push(msgObj)
      }
    } else {
      if (arr.length > 1) {
        msgObj.isRead = arr.length
      }
      currentMsg.push(msgObj)
    }
    this.sortDesc(user, currentMsg, type)
  }

  /**
   * 帮会新消息
   * 帮会改名：user_data中的guild_name更新; 帮会消息中的帮会名称更新
   * 玩家改名：user_data中的guild_members名称更新; 帮会中的玩家名称更新
   * target_id: 好友role_id
   * @param data 
   * @param type 
   */
  setNewMsg(data: INewMessage, type) {
    if (!data) return;

    let user: IUserData = null

    if (type === 'friend') {
      user = this.user_data.find(item => item.role_id === data.target_id || item.role_id === data.role_id) // 加上role_id，是由于app发送信息时，返回的信息的role_id有可能是自己
    } else {
      user = this.user_data.find(item => item.guild_id === data.guild_id && item.role_id === data.member_id)
    }

    if (user) {

      const name = data.data.name

      if (data.type === SocketNewMsg.guild_rename) {
        user.guild_name = name
      }
      if (data.type === SocketNewMsg.role_rename) {
        user.guild_members.forEach(element => {
          if (element.role_id === data.role_id)
            element.role_name = name
        });
        if (user.role_id === data.role_id) { // 如果玩家是自己改名
          user.role_name = name
        }
      }
      let currentMsg = type === 'guild' ? user.guild_msg || [] : user.friend_msg || [];

      // 内容: 聊天或改名
      const Content = {
        data: data.data,
        type: switchMessageType(data.type)
      }

      const newItem: IMessage = {
        message: switchUserMessage(Content),
        time: data.time,
        unixtime: data.time,
        roleId: data.role_id,
        roleName: '',
        guildId: type === 'guild' ? user.guild_id : null,
        guildName: type === 'guild' ? user.guild_name : null,
        data: [],
        isRead: user.role_id === data.role_id ? 0 : 1,
      }

      let msgObj: IMessage = null
      if (type === 'guild') {
        msgObj = currentMsg.find(item => item.guildId === data.guild_id)
      } else {
        let roleId = null
        if (user.role_id === data.target_id) { // 好友给我发的消息，应查询好友的id
          roleId = data.role_id
        } else { // 我给好友发的
          roleId = data.target_id
        }
        msgObj = currentMsg.find(item => item.roleId === roleId)
      }
      // console.log('---------msgObj---', msgObj)
      if (msgObj) { // 之前有这个成员的消息

        if (data.type === SocketNewMsg.role_rename) { // 玩家改名
          newItem.roleName = name
          msgObj.roleName = name
          msgObj.data.forEach(element => {
            if (element.role_id === data.role_id)
              element.roleName = name
          });
        } else {
          if (type === 'guild') {
            newItem.roleName = this.getGuildRoleName(user, data.role_id)
            msgObj.roleId = newItem.roleId
            msgObj.roleName = newItem.roleName
          } else {
            newItem.roleName = this.getFreindRoleName(user, data.role_id, data.role_name)
          }
        }

        msgObj.message = newItem.message
        msgObj.time = newItem.time
        msgObj.guildName = newItem.guildName
        msgObj.data.unshift(newItem)
        if (user.role_id !== data.role_id)
          msgObj.isRead = (msgObj.isRead || 0) + 1 // 未读条数 + 1
      } else { // 之前没有发过消息，这个是第一条
        this.newMsgInit(user, newItem, currentMsg, data, type)
      }
      this.sortDesc(user, currentMsg, type)
    }
  }

  private newMsgInit(user, newItem, currentMsg, data, type) {
    if (type === 'guild') {
      newItem.roleName = this.getGuildRoleName(user, data.role_id)
      newItem.data.push({ ...newItem, data: [] })
      currentMsg.push(newItem)
    } else {
      newItem.roleName = this.getFreindRoleName(user, data.role_id, data.role_name)
      newItem.data.push({ ...newItem, data: [] })
      const msgObj = { ...newItem }
      if (user.role_id === data.target_id) { // 好友给我发的消息，应查询好友的id
        msgObj.roleId = data.role_id
        msgObj.roleName = this.getFreindRoleName(user, data.role_id, data.role_name)
      } else { // 我给好友发的
        msgObj.roleId = data.target_id
        msgObj.roleName = this.getFreindRoleName(user, data.target_id, data.role_name)
      }
      currentMsg.push(msgObj)
    }
  }

  /**
   * 给消息排序，按时间降序排列
   * @param user 
   * @param currentMsg 
   * @param type 
   */
  private sortDesc(user, currentMsg, type) {
    const sortDesc = sortBy(currentMsg, function (item) {
      return -item.time;//根据unixtime对数据进行升序排序，如果降序则改为：return -item.unixtime
    });
    if (type === 'guild') {
      user.guild_msg = sortDesc
    } else {
      user.friend_msg = sortDesc
    }
  }

  /**
   * 我向好友发消息(暂未使用该方法)
   * @param data 
   */
  sendToFriend(data: INewMessage) {
    if (!data) return;
    let user = this.user_data.find(item => item.game_id === data.game_id && item.role_id === data.role_id)

    const currentMsg = user.friend_msg;
    const Content = {
      data: data.data,
      type: switchMessageType(data.type)
    }

    const newItem: IMessage = {
      message: switchUserMessage(Content),
      time: data.time,
      unixtime: data.time,
      roleId: data.role_id,
      roleName: data.role_name,
      guildId: null,
      guildName: null,
      data: [],
    }

    let msgObj = currentMsg.find(item => item.roleId === data.target_id)
    if (msgObj) { // 之前有这个成员的消息
      msgObj.message = newItem.message
      msgObj.time = data.time
      msgObj.data.push(newItem)
    } else { // 之前没有发过消息，这个是第一条
      newItem.data.push({ ...newItem, data: [] })
      currentMsg.push(newItem)
    }
  }

  /**
   * 好友名称
   * @param user 
   * @param roleId 
   */
  private getFreindRoleName(user: IUserData, roleId, role_Name) {
    let roleName = ''
    const friends = user.friend_list
    if (friends && friends.length > 0) {
      const myUser = friends.find(item => item.role_id === roleId)
      if (myUser) {
        roleName = myUser?.role_name
      } else {
        if (user.role_id === roleId) {
          roleName = user.role_name // 有可能新消息是自己发的，所以名称是自己
        } else {
          roleName = role_Name
        }
      }
    }
    return roleName
  }

  /**
   * 玩家名称
   * @param user 
   * @param roleId 
   */
  private getGuildRoleName(user, roleId) {
    let roleName = ''
    const members = user.guild_members
    if (members && members.length > 0) {
      const myUser = members.find(item => item.role_id === roleId)
      roleName = myUser?.role_name
    }
    return roleName
  }

  /**
   * 好友或帮会列表更新
   * @param value 
   * @param type 
   */
  setFriendOrGuildList(data, type: string) {
    if (!data) return;

    let user: IUserData = null

    if (type === 'friend') {
      user = this.user_data.find(item => item.role_id === data.role_id)
    } else {
      user = this.user_data.find(item => item.role_id === data.member_id)
    }

    if (user) {
      if (type === 'friend') {
        user.friend_list = data.friend_list;
      } else {
        user.guild_members = data.guild_members;
        user.guild_id = data.guild_id
        user.guild_name = data.guild_name
        if (data.type === SocketNewMsg.guild_dismiss) { // 帮会解散
          user.guild_name = ''
          const guild_msg = user.guild_msg
          if (guild_msg && guild_msg.length > 0) {
            const msgItem = guild_msg.find(item=>item.guildId === data.guild_id)
            if (msgItem) msgItem.type = SocketNewMsg.guild_dismiss;
          }
        }
      }
    }
  }

  setUser_data(value: any) {
    this.user_data = value;
  }

  get User_data() {
    return this.user_data;
  }

  setCurrent_role(value: any) {
    this.current_role = value;
  }

  get Current_role() {
    return this.current_role;
  }

  get User_list() {
    return this.user_list;
  }
}