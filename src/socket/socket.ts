/*
 * @Description: WebSocket
 * @Author: wangzhicheng  
 * @Date: 2021-03-02 20:18:54
 * 
 * @Change yujiaoLiu 2021-03-08
 */
import Byte from '@/utils/byte';
import config from '../configs';
import SocketManager from './socketManager';
const wsUrl = config.ws;

export const SocketState =
{
  none: 0,
  connected: 1,
  disconnected: 2,
  connecting: 3,
  connectFailed: 4,
  close: 5,
  dispose: 6,
}


export default class Socket {
  private websocket: any;
  private _socketId;
  private sendIdx = 0;
  private _byteArrayQueue = [];
  private bytesRecv;
  private StateInt: any;
  private _connected: any;

  private openHandler;
  private receiveHandler;
  private closeHandler;
  private errorHandler;

  public constructor(socketID) {
    this.openHandler = SocketManager.OnConnect;
    this.receiveHandler = SocketManager.OnReceive;
    this.closeHandler = SocketManager.Close;
    this.errorHandler = SocketManager.OnConnectFailed;
    this._socketId = socketID;

    this._byteArrayQueue = [];
    this.bytesRecv = new Byte();

    // this.websocket.disableInput = true;
    // this.websocket.endian = Socket.LITTLE_ENDIAN;
    this.bytesRecv.endian = Byte.LITTLE_ENDIAN;
  }

  // handleByteArrayQueue() {
  //     let bytes;
  //     while (this._byteArrayQueue.length > 0) {
  //         // if (Laya.stage.getTimeFromFrameStart() > Laya.timer.delta) {
  //         //     // console.log("Socket 超出每帧上限" + Object.keys(this._byteArrayQueue).length);
  //         //     break;
  //         // }
  //         bytes = this._byteArrayQueue.shift();
  //         if (this.receiveHandler) {
  //             try {
  //                 this.receiveHandler.call(this, this._socketId, bytes);
  //             } catch (error) {
  //                 console.log(error);
  //             }
  //         }
  //     }
  // }

  Connect() {
    this.websocket = new WebSocket(wsUrl);
    this.websocket.onopen = () => {
      // this.websocket.send("");
      this.onOpen();
    }

    this.websocket.onmessage = (event) => {
      this.onReceive(event);
    }
    this.websocket.onclose = (event) => {
      this.onClose(event);
    }
    this.websocket.onerror = (event) => {
      this.onError(event);
    }
  }

  //正确建立连接
  onOpen() {
    console.log("websocket open...");
    this.StateInt = SocketState.connected;
    this._connected = true;
    if (this.openHandler) {
      this.openHandler.call(this, this._socketId);
    }
  }

  moveBuff(buff) {
    let pos = buff.pos;
    let length = buff.bytesAvailable;
    let leftData = buff.readUint8Array(pos, length);
    buff.clear();
    buff.writeArrayBuffer(leftData);
    console.log("move buff ", leftData.length, " from ", pos);
  }

  //接收到数据
  onReceive(event) {
    this.bytesRecv.writeArrayBuffer(event.data);
    this.bytesRecv.pos = 0;

    while (true) {
      if (this.bytesRecv.bytesAvailable == 0) {
        this.bytesRecv.clear();
        break;
      }

      if (this.bytesRecv.bytesAvailable < 2) {
        this.moveBuff(this.bytesRecv);
        break;
      }

      let length = this.bytesRecv.getUint16();
      if (length == 0 || length > 100 * 1024) {
        console.log("error packet length ", length, ", reset buff");
        this.bytesRecv.clear();
        break;
      }

      if (length > this.bytesRecv.bytesAvailable) {
        this.bytesRecv.pos -= 2;
        if (this.bytesRecv.pos > 0) {
          this.moveBuff(this.bytesRecv);
        } else {
          this.bytesRecv.pos = this.bytesRecv.length;
        }
        break;
      }

      let packet = this.bytesRecv.readUint8Array(this.bytesRecv.pos, length);
      // this._byteArrayQueue.push(packet);
      if (this.receiveHandler) {
        this.receiveHandler.call(this, this._socketId, packet);
      }
    }
  }

  //关闭事件
  onClose(event) {
    console.log("websocket close:", event);
    this.StateInt = SocketState.close;
    if (this.closeHandler) {
      this.closeHandler.call(this, this._socketId);
    }
  }

  //连接出错
  onError(event) {
    console.log("websocket error:", event);
    this.StateInt = SocketState.connectFailed;
    if (this.errorHandler) {
      this.errorHandler.call(this, this._socketId);
    }
  }

  Send(bytes) {
    if (this.websocket.readyState === WebSocket.OPEN)
      this.websocket.send(bytes.buffer);
    // this.websocket.flush();
  }

  disconnect() {
    if (this.websocket != null && this._connected) {
      this._connected = false;
      this.websocket.close();
    }
  }

  dispose() {
    if (this.websocket != null) {
      try {
        this.websocket.close();
      } catch (e) {
      }
      this._connected = false;
      this.websocket.onopen = null;
      this.websocket.onmessage = null;
      this.websocket.onclose = null;
      this.websocket.onerror = null;
      this.websocket = null;
    }
  }

  get connected() {
    return this._connected;
  };

  get socketId() {
    return this._socketId;
  }
}