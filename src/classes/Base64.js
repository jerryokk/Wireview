// to be removed once Uint8Array.fromBase64() has widespread browser support
class Base64 {
  static decode(encoded) {
    try {
      return Uint8Array.fromBase64(encoded);
    } catch {
      return Uint8Array.from(atob(encoded), (c) => c.charCodeAt(0));
    }
  }
}

export default Base64;
