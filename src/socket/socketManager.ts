/*
 * @Description: soketManager
 * @Author: yujiaoLiu  
 * @Date: 2021-03-08
 * 
 * @Change yujiaoLiu 2021-03-08
 */

import Byte from "@/utils/byte";
import { DeviceEventEmitter } from "react-native";
import Socket, { SocketState } from "./socket";
import TimerManager from "../utils/timeManager";
import { SocketMsgId, SocketName } from '@/constants/commonConstant';
import Protocol from "./protocol";

let _sockets: any[] = [];
// let _handlers: any[] = [];
let _protocols: any[] = [];
let _protocolTypes: any[];
// let nTimerId = undefined;
let readBytes = new Byte();
readBytes.endian = Byte.LITTLE_ENDIAN;
let writeBytes = new Byte();
writeBytes.endian = Byte.LITTLE_ENDIAN;

export const tShieldDebugProtocolName = {
    "proto_rpc": true,
    "map_move_res": true,
    "map_move_syn": true,
    "map_sprite_attr_syn": true,
    "role_attr_syn": true,
    "role_atk_syn": true,
    "role_atk_res": true,
    "buff_update_syn": true,
    "role_buff_update_syn": true,
    "role_buff_remove_syn": true,
    "role_dmg_syn": true
};

export default class SocketManager {

    static socketID: any = undefined;
    static isReconnect: any = false;
    static timeId: any = undefined;

    public constructor() {
    }

    static SetProtocolTypes(protocolTypes) {
        _protocolTypes = protocolTypes;
    }

    static RegisterSocket(socketID) {
        let socket = _sockets[socketID];

        if (socket) {
            console.log(("Socket " + (socketID + " has already registered!")));
            return;
        }
        socket = new Socket(socketID);
        _sockets[socketID] = socket;
        return socket;
    }

    /**
     * @return {undefined}
     */
    static UnregisterSocket(socketID) {
        let socket = _sockets[socketID];
        if ((socket != undefined)) {
            socket.disconnect();
            _sockets[socketID] = undefined;
            return socket;
        }
        return undefined;
    }

    static GetSocket(socketID) {
        return _sockets[socketID];
    }

    static Connect(socketID) {
        let socket = _sockets[socketID];

        if (!socket) {
            console.log("socket == nil");
            return;
        }
        if (socket.connected) {
            console.log("socket " + socketID  + " in connected");
            return;
        }
        SocketManager.socketID = socketID;
        socket.Connect();
    }

    static Close(socketID) {
        let socket = _sockets[socketID];
        if ((socket == undefined)) {
            console.log("关闭socket，但socket不存在");
            return;
        } else {
            _sockets[socketID] = null
        }
        console.log(("关闭socket: " + socketID));
        // SocketManager.OnDisconnect();

        DeviceEventEmitter.emit('socketReconnent', socketID)
    }

    static Destory(socketID) {
        let socket = _sockets[socketID];
        if (socket) {
            socket.dispose();
            _sockets[socketID] = undefined;
        }
    }

    static Send(protocol, socketID = SocketName.chatMessage) {
        let socket = _sockets[socketID];

        if (!socket) {
            console.log(("Send: " + (socketID + " socket 不存在")));
            return;
        }
        if (!socket.connected) {
          console.log("Send: " + socketID + " 未连接");
            return;
        }
        writeBytes.writeInt16(0);
        writeBytes.writeInt16(protocol.protocolID);
        
        protocol.Encode(writeBytes);
        // 写入长度
        let length = writeBytes.length - 2;
        writeBytes.pos = 0;
        writeBytes.writeInt16(length);

        socket.Send(writeBytes);
        writeBytes.clear();
    }

    static Reg(protocolID, socketID, func) {
        let socket = _sockets[socketID];
        if (!socket) {
            console.log(("Socket " + (socketID + " is not exist!")));
            return;
        }
        socket.trggers.on(protocolID, func);
        console.log("socket:" + socketID + ",register->" + protocolID);
        // Logic.handlers.push({ protocolID: protocolID, func: f });
    }

    static Unregister(protocolID, socketID, func) {
        let socket = _sockets[socketID];
        if (!socket) {
            console.log(("Socket " + (socketID + " is not exist!")));
            return;
        }
        socket.trggers.removeListener(protocolID, func);
        console.log("socket:" + socketID + ",unregister->" + protocolID);
    }

    static AddConnectHandler(socketID, func) {
        let socket = _sockets[socketID];
        if (!socket) {
            console.log(("Socket " + (socketID + " is not exist!")));
            return;
        }
        console.log("socket:" + socketID + ",onOpen.");
        socket.openHandler = func;
    }

    static AddReceiveHandler(socketID, func) {
        let socket = _sockets[socketID];
        if (!socket) {
            console.log(("Socket " + (socketID + " is not exist!")));
            return;
        }
        console.log("socket:" + socketID + ",onMessage.");
        socket.receiveHandler = func;
    }

    static AddCloseHandler(socketID, func) {
        let socket = _sockets[socketID];
        if (!socket) {
            console.log(("Socket " + (socketID + " is not exist!")));
            return;
        }
        console.log("socket:" + socketID + ",onClose.");
        socket.closeHandler = func;
    }

    static RegisterHandler(protocolID, socketID, func) {
        SocketManager.Reg(protocolID, socketID, func);
    }

    static UnregisterHandler(protocolID, socketID, func) {
        SocketManager.Unregister(protocolID, socketID, func);
    }

    static GetProtocol(protocolID) {
        let protocol = _protocols[protocolID];
        if (protocol != undefined) {
            protocol.Reset();
        } else {
            let protocolType = _protocolTypes[protocolID];
            if (protocolType != undefined) {
                protocol = protocolType.new();
                _protocols[protocolID] = protocol;
            }
        }
        return protocol;
    }

    static OnDestory() {
        for (let k in _sockets) {

            if (k.startsWith("__") && k.endsWith("__")) continue;
            if (_sockets[k] != undefined) continue;

            let v = _sockets[k];
            SocketManager.Destory(k);
        }
    }

    static OnConnect(socketID) {
        console.log(("OnConnect:" + socketID));
        let socket = _sockets[socketID];
        if (!socket) {
            console.log(("Socket " + (socketID + " is not exist!")));
            return;
        }
        socket.EncryptToken = undefined;
        // if (SocketManager.timeId) {
        //     TimerManager.clearTimer(SocketManager.timeId);
        //     SocketManager.timeId = undefined;
        // }
        DeviceEventEmitter.emit('loginChat', socketID)
    }

    static OnDisconnect() {
        // console.log("OnDisconnect");
        // if (!SocketManager.timeId) {
        //     SocketManager.timeId = TimerManager.addTimer(10, 1, SocketManager.ReconnectNow, this)//TimerManager.RegisterSecond(0.01, 1, SocketManager.ReconnectNow);
        // }
    }

    static OnConnectFailed(socketID) {
        // console.log("OnConnectFailed");
    }

    static ReconnectNow() {
        console.log("ReconnectNow");
        SocketManager.Close(SocketManager.socketID);
        TimerManager.addTimer(2, 0, SocketManager.TryReconnect, this);
        SocketManager.isReconnect = true;
    }

    static TryReconnect() {
        console.log("TryReconnect");
        let socketID = SocketManager.socketID;
        SocketManager.Connect(socketID);
    }

    static OnConnecting(socketID) {
        console.log("OnConnecting");
        if (SocketManager.isReconnect) {
            console.log("isReconnect");
            // if (!SocketManager.TimeIdShowUI) {
            //     SocketManager.TimeIdShowUI = TimerManager.RegisterSecond(6, 0, SocketManager.ShowReconnectUI);
            // }
        }
        // SocketManager.connectingEvent.Call(socketID);
    }

    /**
     * @return {boolean}
     */
    static IsDefaultSocketConnected() {
        // let nState = SocketManager.GetDefaultSocketState();
        // return (nState == MIR_LuaSocketClient_SocketState.connected);
        let socket = _sockets["default"];
        if ((socket == undefined)) {
            console.log("_sockets.default == nil");
            return false;
        }
        return socket.connected;
    }

    /**
     * @return {number}
     */
    static GetDefaultSocketState() {
        let socket = _sockets["default"];
        if ((socket == undefined)) {
            console.log("_sockets.default == nil");
            return SocketState.none;
        }
        return socket.StateInt;
    }

    // static Update() {
    //     for (let socketId in _sockets) {
    //         if (socketId.startsWith("__") && socketId.endsWith("__")) continue;
    //         if (_sockets[socketId] != undefined) continue;

    //         let socket = _sockets[socketId];
    //         socket.handleByteArrayQueue();
    //         // while (true) {
    //         // readBytes.Reset();
    //         // let recvFlag = socket.Recv(readBytes.hBuffer);
    //         // if (!recvFlag) {
    //         //     break;
    //         // }
    //         // let nProtoId = readBytes.ReadShort();
    //         // SocketManager.OnReceive(nProtoId, socketId, readBytes);
    //         // }
    //     }
    // }

    static OnReceive(socketID, pack) {
        readBytes.clear();
        readBytes.writeArrayBuffer(pack);
        readBytes.pos = 0;

        try {
            let protocolID = readBytes.ReadShort();

            const protocol = new Protocol(protocolID, {})


            let socket = _sockets[socketID];
            if (socket != undefined) {

                if (protocol == undefined) {
                    console.log(("Unrecognized protocolID:" + protocolID));
                } else {
                    protocol.Decode(readBytes);
                    // socket.trggers.fire(protocolID, protocol);
                    DeviceEventEmitter.emit('receiveData', { protocolID, data: protocol.ReceiveData });
                }
            }
        } catch (error) {
            console.log("process proto error: ", error, error.stack)
        }
    }

    /**
     * 是否已连接
     * @param socketID 
     */
    static isConnect(socketID) {
        let socket = _sockets[socketID];
        if (!socket) {
            console.log("isConnect：socket 不存在");
            return false;
        }
        if (socket.connected) {
          return true;
        }
        console.log("isConnect：socket 连接已断开");
        return false;
    }
    //The end
}

