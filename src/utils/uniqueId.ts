import { monotonicFactory, decodeTime } from "ulidx"

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
export function generateUlid(prefix?: string): string {
  const id = ulid()
  return prefix ? `${prefix}_${id}` : id
}

/**
 * Validate if a string is a valid ULID format.
 * Checks for 26 characters and valid Crockford Base32 encoding.
 *
 * @param id The string to validate
 * @returns true if valid ULID, false otherwise
 */
export function isValidUlid(id: string): boolean {
  if (!id || typeof id !== "string" || id.length !== 26) return false

  const crockford32 = "0123456789ABCDEFGHJKMNPQRSTVWXYZ"
  for (const char of id) {
    if (crockford32.indexOf(char.toUpperCase()) === -1) return false
  }

  return true
}

/**
 * Decode timestamp from a ULID string.
 * Uses the ulidx decodeTime function.
 *
 * @param id The ULID string
 * @returns Timestamp in milliseconds since Unix epoch
 * @throws Error if invalid ULID
 */
export function decodeTimeFromUlid(id: string): number {
  if (!isValidUlid(id)) throw new Error("Invalid ULID format")
  return decodeTime(id)
}

/**
 * Get the age of a ULID in milliseconds.
 *
 * @param id The ULID string
 * @returns Age in milliseconds
 * @throws Error if invalid ULID
 */
export function getUlidAge(id: string): number {
  const timestamp = decodeTimeFromUlid(id)
  return Date.now() - timestamp
}

/**
 * Parse a ULID and extract all its components.
 *
 * @param id The ULID string
 * @returns Object containing timestamp (ms), timestampSeconds, and age (ms)
 * @throws Error if invalid ULID
 */
export function parseUlid(id: string): {
  timestamp: number
  timestampSeconds: number
  age: number
} {
  const timestamp = decodeTimeFromUlid(id)
  return {
    timestamp,
    timestampSeconds: Math.floor(timestamp / 1000),
    age: Date.now() - timestamp,
  }
}

const CROCKFORD32 = "0123456789ABCDEFGHJKMNPQRSTVWXYZ"

// Precompute decode map
const DECODE_MAP = new Uint8Array(128).fill(255)
for (let i = 0; i < CROCKFORD32.length; i++) {
  DECODE_MAP[CROCKFORD32.charCodeAt(i)] = i
}

/**
 * Convert ULID (26-char base32 string) → 16-byte binary representation
 */
export function ulidToBinary(id: string): Uint8Array {
  if (!id || id.length !== 26) {
    throw new Error("Invalid ULID: must be 26 characters")
  }

  const bytes = new Uint8Array(16)
  let bitBuffer = 0
  let bitsInBuffer = 0
  let bytePos = 0

  for (let i = 0; i < 26; i++) {
    const char = id[i].toUpperCase()
    const value = DECODE_MAP[char.charCodeAt(0)]
    if (value === 255) throw new Error(`Invalid ULID character: '${char}'`)

    bitBuffer = (bitBuffer << 5) | value
    bitsInBuffer += 5

    // flush out full bytes
    while (bitsInBuffer >= 8) {
      bitsInBuffer -= 8
      if (bytePos < 16) bytes[bytePos++] = (bitBuffer >> bitsInBuffer) & 0xff
    }
  }

  // Done: we used only 128 of 130 bits → discard remaining 2
  return bytes
}

/**
 * Convert 16-byte binary ULID (from DB) → 26-char ULID string
 */
export function binaryToUlid(input: Uint8Array | Buffer): string {
  const bytes = input instanceof Buffer ? new Uint8Array(input) : input
  if (!(bytes instanceof Uint8Array) || bytes.length !== 16) {
    throw new Error("Invalid binary ULID: must be 16 bytes")
  }

  let bitBuffer = 0
  let bitsInBuffer = 0
  let id = ""

  for (let i = 0; i < 16; i++) {
    bitBuffer = (bitBuffer << 8) | bytes[i]
    bitsInBuffer += 8

    while (bitsInBuffer >= 5) {
      bitsInBuffer -= 5
      id += CROCKFORD32[(bitBuffer >> bitsInBuffer) & 31]
    }
  }

  // We’ll have 128 bits encoded as 25.6 characters (~26).
  // To ensure full 130 bits alignment (spec-compliant),
  // we add two padding bits (0) and one more 5-bit group.
  if (bitsInBuffer > 0) {
    id += CROCKFORD32[(bitBuffer << (5 - bitsInBuffer)) & 31]
  }

  // Final ULID = exactly 26 chars
  return id.substring(0, 26)
}
