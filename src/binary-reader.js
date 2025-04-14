// binary-reader.js

/**
 * Reads binary data from an ArrayBuffer.
 */
export class BinaryReader {
  /**
   * @param {ArrayBuffer} arrayBuffer The ArrayBuffer containing the binary data.
   * @param {number} [offset=0] The offset in bytes to start reading from.
   * @param {number} [length=arrayBuffer.byteLength] The length in bytes of the data segment.
   */
  constructor(arrayBuffer, offset = 0, length) {
    if (!(arrayBuffer instanceof ArrayBuffer)) {
      throw new Error("Input must be an ArrayBuffer.");
    }
    const dataLength =
      length === undefined ? arrayBuffer.byteLength - offset : length;
    if (offset < 0 || offset + dataLength > arrayBuffer.byteLength) {
      throw new Error("Offset/length out of bounds.");
    }

    this._dataView = new DataView(arrayBuffer, offset, dataLength);
    this._offset = 0; // Internal cursor offset relative to the start of the DataView
    this._length = dataLength;
  }

  /**
   * Gets the total length of the data segment being read.
   * @returns {number}
   */
  getLength() {
    return this._length;
  }

  /**
   * Gets the byte at the specified offset.
   * @param {number} offset Offset relative to the start of the data segment.
   * @returns {number} The byte value (0-255).
   */
  getByteAt(offset) {
    if (offset < 0 || offset >= this._length) {
      throw new Error(
        `Offset ${offset} out of bounds (length: ${this._length})`
      );
    }
    return this._dataView.getUint8(offset);
  }

  /**
   * Gets the signed byte at the specified offset.
   * @param {number} offset Offset relative to the start of the data segment.
   * @returns {number} The signed byte value (-128 to 127).
   */
  getSByteAt(offset) {
    if (offset < 0 || offset >= this._length) {
      throw new Error(
        `Offset ${offset} out of bounds (length: ${this._length})`
      );
    }
    return this._dataView.getInt8(offset);
  }

  /**
   * Gets the unsigned 16-bit short at the specified offset.
   * @param {number} offset Offset relative to the start of the data segment.
   * @param {boolean} [isBigEndian=false] Whether the data is in big-endian format.
   * @returns {number} The short value (0-65535).
   */
  getShortAt(offset, isBigEndian = false) {
    if (offset < 0 || offset + 1 >= this._length) {
      throw new Error(
        `Offset ${offset} for Short out of bounds (length: ${this._length})`
      );
    }
    return this._dataView.getUint16(offset, !isBigEndian); // DataView uses littleEndian flag
  }

  /**
   * Gets the signed 16-bit short at the specified offset.
   * @param {number} offset Offset relative to the start of the data segment.
   * @param {boolean} [isBigEndian=false] Whether the data is in big-endian format.
   * @returns {number} The signed short value (-32768 to 32767).
   */
  getSShortAt(offset, isBigEndian = false) {
    if (offset < 0 || offset + 1 >= this._length) {
      throw new Error(
        `Offset ${offset} for SShort out of bounds (length: ${this._length})`
      );
    }
    return this._dataView.getInt16(offset, !isBigEndian);
  }

  /**
   * Gets the unsigned 32-bit long at the specified offset.
   * @param {number} offset Offset relative to the start of the data segment.
   * @param {boolean} [isBigEndian=false] Whether the data is in big-endian format.
   * @returns {number} The long value (0-4294967295).
   */
  getLongAt(offset, isBigEndian = false) {
    if (offset < 0 || offset + 3 >= this._length) {
      throw new Error(
        `Offset ${offset} for Long out of bounds (length: ${this._length})`
      );
    }
    return this._dataView.getUint32(offset, !isBigEndian);
  }

  /**
   * Gets the signed 32-bit long at the specified offset.
   * @param {number} offset Offset relative to the start of the data segment.
   * @param {boolean} [isBigEndian=false] Whether the data is in big-endian format.
   * @returns {number} The signed long value (-2147483648 to 2147483647).
   */
  getSLongAt(offset, isBigEndian = false) {
    if (offset < 0 || offset + 3 >= this._length) {
      throw new Error(
        `Offset ${offset} for SLong out of bounds (length: ${this._length})`
      );
    }
    return this._dataView.getInt32(offset, !isBigEndian);
  }

  /**
   * Gets a string of specified length at the specified offset.
   * Assumes ASCII or single-byte encoding.
   * @param {number} offset Offset relative to the start of the data segment.
   * @param {number} length The number of bytes/characters to read.
   * @returns {string} The string.
   */
  getStringAt(offset, length) {
    if (offset < 0 || offset + length > this._length) {
      throw new Error(
        `Offset ${offset} / Length ${length} for String out of bounds (length: ${this._length})`
      );
    }
    let str = "";
    for (let i = offset; i < offset + length; i++) {
      str += String.fromCharCode(this.getByteAt(i));
    }
    return str;
  }

  /**
   * Gets a single character at the specified offset.
   * @param {number} offset Offset relative to the start of the data segment.
   * @returns {string} The character.
   */
  getCharAt(offset) {
    return String.fromCharCode(this.getByteAt(offset));
  }

  /**
   * Creates a new BinaryReader representing a slice of the current data.
   * @param {number} start Start offset relative to the current reader's data segment.
   * @param {number} length Length of the slice.
   * @returns {BinaryReader} A new BinaryReader for the slice.
   */
  slice(start, length) {
    if (start < 0 || start + length > this._length) {
      throw new Error(
        `Slice start ${start} / length ${length} out of bounds (length: ${this._length})`
      );
    }
    // Important: Calculate the absolute offset in the original ArrayBuffer
    const absoluteOffset = this._dataView.byteOffset + start;
    return new BinaryReader(this._dataView.buffer, absoluteOffset, length);
  }
}
