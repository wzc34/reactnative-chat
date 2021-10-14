/*
 * @Description: Byte
 * @Author: yujiaoLiu
 * @Date: 2021-03-08
 */

export default class Byte {
  private _xd_: any;
  private _allocated_: any;
  private _pos_: any;
  private _length: any;
  private _u8d_: any;
  private _d_: any;
  private _sysEndian: any = null;

  public static readonly LITTLE_ENDIAN: string = "littleEndian";
  public static readonly BIG_ENDIAN: string = "bigEndian";

  public constructor() {
    var data = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : null;

    this._xd_ = true;
    this._allocated_ = 8;
    this._pos_ = 0;
    this._length = 0;
    if (data) {
      this._u8d_ = new Uint8Array(data);
      this._d_ = new DataView(this._u8d_.buffer);
      this._length = this._d_.byteLength;
    } else {
      this._resizeBuffer(this._allocated_);
    }
  }

  private _resizeBuffer(len): void {
    try {
      var newByteView = new Uint8Array(len);
      if (this._u8d_ != null) {
        if (this._u8d_.length <= len) newByteView.set(this._u8d_); else newByteView.set(this._u8d_.subarray(0, len));
      }
      this._u8d_ = newByteView;
      this._d_ = new DataView(newByteView.buffer);
    } catch (err) {
      throw "Invalid typed array length:" + len;
    }
  }

  public getString() {
    return this.readString();
  }

  public readString() {
    return this._rUTF(this.getUint16());
  }

  public getFloat32Array(start, len) {
    return this.readFloat32Array(start, len);
  }
  public readFloat32Array(start, len) {
    var end = start + len;
    end = end > this._length ? this._length : end;
    var v = new Float32Array(this._d_.buffer.slice(start, end));
    this._pos_ = end;
    return v;
  }

  public getUint8Array(start, len) {
    return this.readUint8Array(start, len);
  }
  public readUint8Array(start, len) {
    var end = start + len;
    end = end > this._length ? this._length : end;
    var v = new Uint8Array(this._d_.buffer.slice(start, end));
    this._pos_ = end;
    return v;
  }

  public getInt16Array(start, len) {
    return this.readInt16Array(start, len);
  }
  public readInt16Array(start, len) {
    var end = start + len;
    end = end > this._length ? this._length : end;
    var v = new Int16Array(this._d_.buffer.slice(start, end));
    this._pos_ = end;
    return v;
  }

  public getFloat32() {
    return this.readFloat32();
  }
  public readFloat32() {
    if (this._pos_ + 4 > this._length) throw "getFloat32 error - Out of bounds";
    var v = this._d_.getFloat32(this._pos_, this._xd_);
    this._pos_ += 4;
    return v;
  }

  public getFloat64() {
    return this.readFloat64();
  }
  public readFloat64() {
    if (this._pos_ + 8 > this._length) throw "getFloat64 error - Out of bounds";
    var v = this._d_.getFloat64(this._pos_, this._xd_);
    this._pos_ += 8;
    return v;
  }

  public writeFloat32(value) {
    this._ensureWrite(this._pos_ + 4);
    this._d_.setFloat32(this._pos_, value, this._xd_);
    this._pos_ += 4;
  }

  public writeFloat64(value) {
    this._ensureWrite(this._pos_ + 8);
    this._d_.setFloat64(this._pos_, value, this._xd_);
    this._pos_ += 8;
  }

  public getInt32() {
    return this.readInt32();
  }
  public readInt32() {
    if (this._pos_ + 4 > this._length) throw "getInt32 error - Out of bounds";
    var float = this._d_.getInt32(this._pos_, this._xd_);
    this._pos_ += 4;
    return float;
  }

  public getUint32() {
    return this.readUint32();
  }
  public readUint32() {
    if (this._pos_ + 4 > this._length) throw "getUint32 error - Out of bounds";
    var v = this._d_.getUint32(this._pos_, this._xd_);
    this._pos_ += 4;
    return v;
  }

  public writeInt32(value) {
    this._ensureWrite(this._pos_ + 4);
    this._d_.setInt32(this._pos_, value, this._xd_);
    this._pos_ += 4;
  }
  public writeUint32(value) {
    this._ensureWrite(this._pos_ + 4);
    this._d_.setUint32(this._pos_, value, this._xd_);
    this._pos_ += 4;
  }

  public getInt16() {
    return this.readInt16();
  }
  public readInt16() {
    if (this._pos_ + 2 > this._length) throw "getInt16 error - Out of bounds";
    var us = this._d_.getInt16(this._pos_, this._xd_);
    this._pos_ += 2;
    return us;
  }
  public ReadShort() {
    return this.getInt16();
  }

  public getUint16() {
    return this.readUint16();
  }
  public readUint16() {
    if (this._pos_ + 2 > this._length) throw "getUint16 error - Out of bounds";
    var us = this._d_.getUint16(this._pos_, this._xd_);
    this._pos_ += 2;
    return us;
  }

  public writeUint16(value) {
    this._ensureWrite(this._pos_ + 2);
    this._d_.setUint16(this._pos_, value, this._xd_);
    this._pos_ += 2;
  }

  public writeInt16(value) {
    this._ensureWrite(this._pos_ + 2);
    this._d_.setInt16(this._pos_, value, this._xd_);
    this._pos_ += 2;
  }

  private _getUInt8(pos) {
    return this._readUInt8(pos);
  }
  private _readUInt8(pos) {
    return this._d_.getUint8(pos);
  }

  private _getUint16(pos) {
    return this._readUint16(pos);
  }
  private _readUint16(pos) {
    this._d_.getUint16(pos, this._xd_);
  }

  private _rUTF(len) {
    var max = this._pos_ + len, c, c2, c3, f = String.fromCharCode;
    var u = this._u8d_;
    var strs: string[] = [];
    var n = 0;
    strs.length = 1000;
    while (this._pos_ < max) {
      c = u[this._pos_++];
      if (c < 0x80) {
        if (c != 0) strs[n++] = f(c);
      } else if (c < 0xE0) {
        strs[n++] = f((c & 0x3F) << 6 | u[this._pos_++] & 0x7F);
      } else if (c < 0xF0) {
        c2 = u[this._pos_++];
        strs[n++] = f((c & 0x1F) << 12 | (c2 & 0x7F) << 6 | u[this._pos_++] & 0x7F);
      } else {
        c2 = u[this._pos_++];
        c3 = u[this._pos_++];
        strs[n++] = f((c & 0x0F) << 18 | (c2 & 0x7F) << 12 | c3 << 6 & 0x7F | u[this._pos_++] & 0x7F);
      }
    }
    strs.length = n;
    return strs.join('');
  }

  public getCustomString(len) {
    return this.readCustomString(len);
  }

  public readCustomString(len) {
    var v = "", ulen = 0, c, c2, f = String.fromCharCode;
    var u = this._u8d_;
    while (len > 0) {
      c = u[this._pos_];
      if (c < 0x80) {
        v += f(c);
        this._pos_++;
        len--;
      } else {
        ulen = c - 0x80;
        this._pos_++;
        len -= ulen;
        while (ulen > 0) {
          c = u[this._pos_++];
          c2 = u[this._pos_++];
          v += f(c2 << 8 | c);
          ulen--;
        }
      }
    }
    return v;
  }

  public clear(): void {
    this._pos_ = 0;
    this.length = 0;
  }

  private __getBuffer() {
    return this._d_.buffer;
  }

  public writeUTFBytes(value): void {
    value = value + "";
    for (var i = 0, sz = value.length; i < sz; i++) {
      var c = value.charCodeAt(i);
      if (c <= 0x7F) {
        this.writeByte(c);
      } else if (c <= 0x7FF) {
        this._ensureWrite(this._pos_ + 2);
        this._u8d_.set([0xC0 | c >> 6, 0x80 | c & 0x3F], this._pos_);
        this._pos_ += 2;
      } else if (c <= 0xFFFF) {
        this._ensureWrite(this._pos_ + 3);
        this._u8d_.set([0xE0 | c >> 12, 0x80 | c >> 6 & 0x3F, 0x80 | c & 0x3F], this._pos_);
        this._pos_ += 3;
      } else {
        this._ensureWrite(this._pos_ + 4);
        this._u8d_.set([0xF0 | c >> 18, 0x80 | c >> 12 & 0x3F, 0x80 | c >> 6 & 0x3F, 0x80 | c & 0x3F], this._pos_);
        this._pos_ += 4;
      }
    }
  }

  public writeUTFString(value): void {
    var tPos = this.pos;
    this.writeUint16(1);
    this.writeUTFBytes(value);
    var dPos = this.pos - tPos - 2;
    this._d_.setUint16(tPos, dPos, this._xd_);
  }

  public readUTFString() {
    return this.readUTFBytes(this.getUint16());
  }
  public getUTFString() {
    return this.readUTFString();
  }
  public readUTFBytes(len) {
    // if (len === 0) return "";
    // var lastBytes = this.bytesAvailable;
    // if (len > lastBytes) throw "readUTFBytes error - Out of bounds";
    // len = len > 0 ? len : lastBytes;
    return this._rUTF(len);
  }

  public getUTFBytes(len) {
    return this.readUTFBytes(len);
  }

  public writeByte(value) {
    this._ensureWrite(this._pos_ + 1);
    this._d_.setInt8(this._pos_, value);
    this._pos_ += 1;
  }

  public readByte() {
    if (this._pos_ + 1 > this._length) throw "readByte error - Out of bounds";
    return this._d_.getInt8(this._pos_++);
  }

  public getByte() {
    return this.readByte();
  }

  private _ensureWrite(lengthToEnsure): void {
    if (this._length < lengthToEnsure) this._length = lengthToEnsure;
    if (this._allocated_ < lengthToEnsure) this.length = lengthToEnsure;
  }

  public writeArrayBuffer(arraybuffer) {
    var offset = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 0;
    var length = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 0;


    if (offset < 0 || length < 0) throw "writeArrayBuffer error - Out of bounds";
    if (length == 0) length = arraybuffer.byteLength - offset;
    this._ensureWrite(this._pos_ + length);
    var uint8array = new Uint8Array(arraybuffer);
    this._u8d_.set(uint8array.subarray(offset, offset + length), this._pos_);
    this._pos_ += length;
  }

  public readArrayBuffer(length) {
    var rst;
    rst = this._u8d_.buffer.slice(this._pos_, this._pos_ + length);
    this._pos_ = this._pos_ + length;
    return rst;
  }

  public get buffer() {
    var rstBuffer = this._d_.buffer;
    if (rstBuffer.byteLength === this._length) return rstBuffer;
    return rstBuffer.slice(0, this._length);
  }

  public set endian(value) {
    this._xd_ = value === Byte.LITTLE_ENDIAN;
  }
  public get endian() {
    return this._xd_ ? Byte.LITTLE_ENDIAN : Byte.BIG_ENDIAN;
  }

  public set length(value) {
    if (this._allocated_ < value) this._resizeBuffer(this._allocated_ = Math.floor(Math.max(value, this._allocated_ * 2))); else if (this._allocated_ > value) this._resizeBuffer(this._allocated_ = value);
    this._length = value;
  }
  public get length() {
    return this._length;
  }

  public set pos(value) {
    this._pos_ = value;
  }
  public get pos() {
    return this._pos_;
  }

  public get bytesAvailable() {
    return this._length - this._pos_;
  }

  public getSystemEndian() {
    if (!this._sysEndian) {
      var buffer = new ArrayBuffer(2);
      new DataView(buffer).setInt16(0, 256, true);
      this._sysEndian = new Int16Array(buffer)[0] === 256 ? Byte.LITTLE_ENDIAN : Byte.BIG_ENDIAN;
    }
    return this._sysEndian;
  }

  public ReadBoolean() {
    return (this.getByte() != 0);
  }

  public WriteUTF(value): void {
    this.writeUTFString(value);
  }

  public ReadUTF() {
    return this.getUTFString();
  }

  public WriteBytes(value): void {
    this.writeArrayBuffer(value);
  }

  public ReadBytes(len) {
    return this.readUint8Array(this.pos, len);
  }

  public WriteByte(value): void {
    this.writeByte(value);
  }

  public ReadByte() {
    return this.getByte();
  }

  public WriteShort(value): void {
    this.writeInt16(value);
  }

  public WriteUInt(value): void {
    this.writeUint32(value);
  }

  public ReadUInt() {
    return this.getUint32();
  }

  public WriteInt(value): void {
    this.writeInt32(value);
  }

  public ReadInt() {
    return this.getInt32();
  }

  public WriteDouble(value): void {
    this.writeFloat64(value);
  }

  public ReadDouble() {
    return this.getFloat64();
  }

  /**
   * string转ArrayBuffer
   * @param string 
   * @param options 
   * @returns 
   */
  stringToUint8Array(string, options = { stream: false }) {
    if (options.stream) {
      throw new Error(`Failed to encode: the 'stream' option is unsupported.`);
    }

    let pos = 0;
    const len = string.length;
    const out = [];

    let at = 0;  // output position
    let tlen = Math.max(32, len + (len >> 1) + 7);  // 1.5x size
    let target = new Uint8Array((tlen >> 3) << 3);  // ... but at 8 byte offset

    while (pos < len) {
      let value = string.charCodeAt(pos++);
      if (value >= 0xd800 && value <= 0xdbff) {
        // high surrogate
        if (pos < len) {
          const extra = string.charCodeAt(pos);
          if ((extra & 0xfc00) === 0xdc00) {
            ++pos;
            value = ((value & 0x3ff) << 10) + (extra & 0x3ff) + 0x10000;
          }
        }
        if (value >= 0xd800 && value <= 0xdbff) {
          continue;  // drop lone surrogate
        }
      }

      // expand the buffer if we couldn't write 4 bytes
      if (at + 4 > target.length) {
        tlen += 8;  // minimum extra
        tlen *= (1.0 + (pos / string.length) * 2);  // take 2x the remaining
        tlen = (tlen >> 3) << 3;  // 8 byte offset

        const update = new Uint8Array(tlen);
        update.set(target);
        target = update;
      }

      if ((value & 0xffffff80) === 0) {  // 1-byte
        target[at++] = value;  // ASCII
        continue;
      } else if ((value & 0xfffff800) === 0) {  // 2-byte
        target[at++] = ((value >> 6) & 0x1f) | 0xc0;
      } else if ((value & 0xffff0000) === 0) {  // 3-byte
        target[at++] = ((value >> 12) & 0x0f) | 0xe0;
        target[at++] = ((value >> 6) & 0x3f) | 0x80;
      } else if ((value & 0xffe00000) === 0) {  // 4-byte
        target[at++] = ((value >> 18) & 0x07) | 0xf0;
        target[at++] = ((value >> 12) & 0x3f) | 0x80;
        target[at++] = ((value >> 6) & 0x3f) | 0x80;
      } else {
        // FIXME: do we care
        continue;
      }

      target[at++] = (value & 0x3f) | 0x80;
    }

    return target.slice(0, at);
  }

  /**
   * AarryBuffer转string
   * @param array 
   * @returns 
   */
  utf8ArrayToStr(array) {
    var out, i, len, c;
    var char2, char3;

    out = "";
    len = array.length;
    i = 0;
    while (i < len) {
      c = array[i++];
      switch (c >> 4) {
        case 0: case 1: case 2: case 3: case 4: case 5: case 6: case 7:
          // 0xxxxxxx
          out += String.fromCharCode(c);
          break;
        case 12: case 13:
          // 110x xxxx   10xx xxxx
          char2 = array[i++];
          out += String.fromCharCode(((c & 0x1F) << 6) | (char2 & 0x3F));
          break;
        case 14:
          // 1110 xxxx  10xx xxxx  10xx xxxx
          char2 = array[i++];
          char3 = array[i++];
          out += String.fromCharCode(((c & 0x0F) << 12) |
            ((char2 & 0x3F) << 6) |
            ((char3 & 0x3F) << 0));
          break;
      }
    }

    return out;
  }

  /**
   * 大量数据转换,该方法在当前项目失败，在web中成功
   * @param uint8arr 
   * @param callback 
   */
  largeuint8ArrToString(uint8arr, callback) {
    var bb = new Blob([uint8arr]);
    var f = new FileReader();
    f.onload = function (e) {
      callback(e.target.result);
    };
    f.readAsText(bb);
  }


  public byteToString(arr) {
    let str = ''
    if (arr)
    str = this.utf8ArrayToStr(arr)

    // if (typeof arr === 'string') {
    //   return arr;
    // }
    //   _arr = arr;
    // for (var i = 0; i < _arr.length; i++) {
    //   var one = _arr[i].toString(2),
    //     v = one.match(/^1+?(?=0)/);
    //   if (v && one.length == 8) {
    //     var bytesLength = v[0].length;
    //     var store = _arr[i].toString(2).slice(7 - bytesLength);
    //     for (var st = 1; st < bytesLength; st++) {
    //       store += _arr[st + i].toString(2).slice(2);
    //     }
    //     str += String.fromCharCode(parseInt(store, 2));
    //     i += bytesLength - 1;
    //   } else {
    //     str += String.fromCharCode(_arr[i]);
    //   }
    // }
    console.log('---------str--------', str)
    return str;
  }
  //The end
}