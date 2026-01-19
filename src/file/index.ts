
// Universal File/Buffer types mapping for TS
// "File" and "Blob" are DOM types. "Buffer" is a Node type.
// We use 'any' or check existence to avoid build errors in pure Node/Browser setups without full libs.

import { convertToSlug } from "../slug";

export async function getArrayBuffer(input: any): Promise<ArrayBuffer> {
  // Browser: File or Blob
  if (input && typeof input.arrayBuffer === 'function') {
    return await input.arrayBuffer();
  }

  // Node: Buffer or Uint8Array
  if (typeof Buffer !== "undefined" && Buffer.isBuffer(input)) {
    // Buffer shares memory with the underlying ArrayBuffer
    // We must slice it to get the correct view if it's a subarray
    return input.buffer.slice(input.byteOffset, input.byteOffset + input.byteLength) as ArrayBuffer;
  }

  if (input instanceof Uint8Array) {
     return input.buffer.slice(input.byteOffset, input.byteOffset + input.byteLength) as ArrayBuffer;
  }

  throw new Error("Unsupported input type for hashing");
}

export async function hashContent(input: any, hashLength = 8): Promise<string> {
  const buffer = await getArrayBuffer(input);

  // Browser + Node 15+ (if global crypto is available or polyfilled)
  // We check for globalThis.crypto or window.crypto
  const cryptoAPI = (typeof crypto !== "undefined" ? crypto : (typeof window !== "undefined" ? window.crypto : undefined));
  
  if (cryptoAPI?.subtle?.digest) {
    const hashBuffer = await cryptoAPI.subtle.digest("SHA-256", buffer);
    return Array.from(new Uint8Array(hashBuffer))
      .map(b => b.toString(16).padStart(2, "0"))
      .join("")
      .slice(0, hashLength);
  }

  // Node fallback (using require for CommonJS/Node compatibility)
  // We use logic to avoid bundler errors if possible, but user provided require('crypto')
  try {
     // Dynamic require to avoid static analysis issues in some bundlers if targeting browser only
     // However, in a general js-kit, we can just try it.
     const nodeCrypto = require("crypto");
     const hash = nodeCrypto.createHash("sha256").update(Buffer.from(buffer)).digest("hex");
     return hash.slice(0, hashLength);
  } catch (e) {
      console.warn("Crypto fallback failed", e);
      throw new Error("No crypto implementation found");
  }
}

export function sanitizeFilename(name: string): string {
  return convertToSlug(name,{
    allowDots: true,
  });
}

export interface HashedFilenameOptions {
    hashLength?: number;
}

export async function getHashedFilename(input: any, originalName: string, options: HashedFilenameOptions = {}): Promise<string> {
  const { hashLength = 8 } = options;
  const hash = await hashContent(input, hashLength);

  const dotIndex = originalName.lastIndexOf(".");
  const base = dotIndex > 0 ? originalName.slice(0, dotIndex) : originalName;
  const ext = dotIndex > 0 ? originalName.slice(dotIndex + 1) : "";

  const safeBase = sanitizeFilename(base);
  return ext
    ? `${safeBase}.${hash}.${ext}`
    : `${safeBase}.${hash}`;
}
