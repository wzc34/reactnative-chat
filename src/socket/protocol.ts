/*
 * @Description:  socket协议
 * @Author: yujiaoLiu
 * @Date: 2021-03-09
 */
import Byte from "@/utils/byte";

export default class protocol {
  private protocolID = 6002;
  private param = {};
  private receiveData: any;

  constructor(protocolID, param) {
    this.protocolID = protocolID;
    this.param = param;
  }

  Reset() {

  }

  Encode(bytes: Byte) {
    bytes.writeUTFBytes(JSON.stringify(this.param));
  }

  Decode(bytes: Byte) {
    bytes.pos = 0;
    const count_args = bytes.ReadShort();
    this.receiveData = bytes.byteToString(bytes.ReadBytes(count_args))
  }

  get ReceiveData() {
    return this.receiveData;
  }
}
