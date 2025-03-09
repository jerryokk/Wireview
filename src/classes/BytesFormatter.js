const widths = {
  hexadecimal: 2,
  decimal: 3,
  octal: 3,
  bits: 8,
  ascii: 1,
  ebcdic: 1,
};

const formatters = {
  hexadecimal: (bytes) =>
    Array.from(bytes).map((byte) =>
      byte.toString(16).padStart(widths.hexadecimal, "0")
    ),
  decimal: (bytes) =>
    Array.from(bytes).map((byte) =>
      byte.toString().padStart(widths.decimal, " ")
    ),
  octal: (bytes) =>
    Array.from(bytes).map((byte) =>
      byte.toString(8).padStart(widths.octal, "0")
    ),
  bits: (bytes) =>
    Array.from(bytes).map((byte) =>
      byte.toString(2).padStart(widths.bits, "0")
    ),
  ascii: (bytes) =>
    Array.from(bytes).map((byte) =>
      32 <= byte && byte <= 126 ? String.fromCharCode(byte) : "."
    ),
  // so what if no one uses this one?
  ebcdic: (bytes) =>
    Array.from(bytes)
      .map((byte) => {
        if (0xf0 <= byte && byte <= 0xf9) return byte - 0xc0; // 0-9
        if (0x81 <= byte && byte <= 0x89) return byte - 0x20; // a-i
        if (0x91 <= byte && byte <= 0x99) return byte - 0x27; // j-r
        if (0xa2 <= byte && byte <= 0xa9) return byte - 0x2f; // s-z
        if (0xc1 <= byte && byte <= 0xc9) return byte - 0x80; // A-I
        if (0xd1 <= byte && byte <= 0xd9) return byte - 0x87; // J-R
        if (0xe2 <= byte && byte <= 0xe9) return byte - 0x8f; // S-Z
        return 0x2e; // .
      })
      .map((ascii) => String.fromCharCode(ascii)),
};

class BytesFormatter {
  static format(bytes, displayFormat) {
    const displayBytes = formatters[displayFormat](bytes);

    return displayBytes;
  }
}

export default BytesFormatter;
