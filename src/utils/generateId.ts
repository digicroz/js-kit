import { monotonicFactory } from "ulidx"

// Create a monotonic ULID generator (ensures IDs are always increasing)
const ulid = monotonicFactory()

/**
 * Generate a ULID (Universally Unique Lexicographically Sortable ID)
 * Works in Node.js, Web, and React Native.
 * 
 * Uses monotonic mode by default - ensures IDs are always increasing,
 * even if the system clock goes backwards.
 *
 * @param prefix Optional string to prefix before the ID, e.g. "user" → "user_01JF..."
 */
export function generateId(prefix?: string): string {
  const id = ulid()
  return prefix ? `${prefix}_${id}` : id
}

/**
 * Convert a ULID string to 16-byte binary buffer.
 * Good for storing in MySQL `BINARY(16)` columns for better index performance.
 */
export function ulidToBinary(id: string): Uint8Array {
  if (!id || id.length !== 26)
    throw new Error("Invalid ULID: must be 26 characters")

  // Each character represents 5 bits → total 130 bits → only 128 bits used
  const crockford32 = "0123456789ABCDEFGHJKMNPQRSTVWXYZ" // Crockford’s Base32
  const bytes = new Uint8Array(16)

  let bitBuffer = 0
  let bitsInBuffer = 0
  let bytePos = 0

  for (const char of id) {
    const value = crockford32.indexOf(char.toUpperCase())
    if (value === -1) throw new Error(`Invalid ULID char: ${char}`)

    bitBuffer = (bitBuffer << 5) | value
    bitsInBuffer += 5

    while (bitsInBuffer >= 8 && bytePos < 16) {
      bitsInBuffer -= 8
      bytes[bytePos++] = (bitBuffer >> bitsInBuffer) & 0xff
    }
  }

  return bytes
}

/**
 * Convert 16-byte binary ULID (from MySQL BINARY(16)) back to string form.
 */
export function binaryToUlid(bytes: Uint8Array): string {
  if (!(bytes instanceof Uint8Array) || bytes.length !== 16)
    throw new Error("Invalid binary ULID: must be 16 bytes")

  const crockford32 = "0123456789ABCDEFGHJKMNPQRSTVWXYZ"

  let bitBuffer = 0
  let bitsInBuffer = 0
  let id = ""

  for (const byte of bytes) {
    bitBuffer = (bitBuffer << 8) | byte
    bitsInBuffer += 8

    while (bitsInBuffer >= 5) {
      bitsInBuffer -= 5
      const index = (bitBuffer >> bitsInBuffer) & 31
      id += crockford32[index]
    }
  }

  // Trim to 26 chars
  return id.substring(0, 26)
}
