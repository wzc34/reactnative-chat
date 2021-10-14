/*
 * @Description: 
 * @Author: wangzhicheng
 * @Date: 2021-03-23 11:03:52
 */

type renderFunction = (x: any) => JSX.Element

export interface User {
    _id: string | number
    name?: string
    avatar?: string | number | renderFunction
  }
  
  export interface Reply {
    title: string
    value: string
    messageId?: any
  }
  
  export interface QuickReplies {
    type: 'radio' | 'checkbox'
    values: Reply[]
    keepIt?: boolean
  }
  
  export interface IMessage {
    _id: string | number;
    text: string;
    createdAt: Date | number;
    user: User;
    image?: string;
    video?: string;
    audio?: string;
    system?: boolean;
    sent?: boolean;
    received?: boolean;
    pending?: boolean;
    quickReplies?: QuickReplies;
}

  export interface GameMessage {
    game_id: string;
    platform_id: number;
    server_id: number;
    role_id: number;
    channel: number;
    content: string;
    guild_id: number;
    guild_name: string;
    friend_id: number;
    friend_name: string;
  }