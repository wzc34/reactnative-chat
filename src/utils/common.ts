/*
 * @Description: 公共工具文件
 * @Author: wangzhicheng
 * @Date: 2021-03-08 14:38:53
 */
import { SocketNewMsg } from '@/constants/commonConstant';
import { Toast } from '@ant-design/react-native';
import { each } from 'lodash';
import moment from 'moment';
const datetime = 'YYYY-MM-DD HH:mm:ss';
const ddformat = 'YYYY-MM-DD';
const mmformat = 'MM-DD';
const hhformat="HH:mm"

/**
 * 校验表单
 * @param {*} err
 */
export const errorToast = err => {
  const errors = [];
  each(err, (item: {errors: []}) => {
    errors.push(...item.errors)
  })
  const [firstError] = errors;
  const { message } = firstError;
  Toast.info(message, 1);
};

/**
 * 手机号验证
 */
export const PHONE = /^[1]([3-9])[0-9]{9}$/;

/**
 * 日期时间
 * @param time 
 */
export const unixToStrtime = (time: number) => {
  const myMoment = moment.unix(Number(time)).utcOffset(8);
  const curMoment = moment().utcOffset(8);
  const hh = myMoment.format(hhformat)
  if (myMoment.format('YYYY') !== curMoment.format('YYYY')) return myMoment.format(ddformat)

  if (myMoment.format(ddformat) === curMoment.format(ddformat)) { // 今天
    return hh
  } else {
    return myMoment.format(mmformat)
  }
}

/**
 * 日期 YYYY-MM-DD HH:mm:ss
 * @param time 
 */
export const unixToString = (time: number) => {
  return moment.unix(Number(time)).utcOffset(8).format(datetime)
}

/**
 * 时间戳 
 */
type e = () => number;
export const timestamp: e = () => {
  return Number(Math.round(new Date().getTime()/1000).toString());
}

/**
 * 消息内容
 * @param Content 
 */
export const switchUserMessage = (Content) => {
  const { type, data } = Content;
  let messgae = ''
  switch (type) {
    // 帮会聊天
    case 1:
      messgae = data.content
      break;
    // 玩家改名
    case 2:
      messgae = '我改了新名字：' + data.name
      break;
    // 帮会改名
    case 3:
      messgae = '帮会改了新名字：' + data.name
      break;
    default:
      messgae = data.content // 好友聊天
      break;
  }
  return messgae
}
/**
 * 新消息类别
 * @param type 
 */
export const switchMessageType = (type) => {
  let mytype = 1
  switch (type) {
    // 帮会聊天
    case SocketNewMsg.guild_chat:
      mytype = 1
      break;
    // 帮会改名
    case SocketNewMsg.role_rename:
      mytype = 2
      break;
    // 好友消息
    case SocketNewMsg.friend_chat:
      mytype = 1
      break;
    // 玩家消息
    case SocketNewMsg.guild_rename:
      mytype = 3
      break;
    default:
      break;
  }
  return mytype
}