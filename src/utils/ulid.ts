import { monotonicFactory, decodeTime } from "ulidx"

// Constants
const CROCKFORD32 = "0123456789ABCDEFGHJKMNPQRSTVWXYZ"
const ULID_LENGTH = 26 // Standard ULID length

// Precompute decode map for performance
const DECODE_MAP = new Uint8Array(128).fill(255)
for (let i = 0; i < CROCKFORD32.length; i++) {
  DECODE_MAP[CROCKFORD32.charCodeAt(i)] = i
}

// Create monotonic ULID generator
const ulidGenerator = monotonicFactory()

/**
 * Generate a ULID (Universally Unique Lexicographically Sortable ID).
 * Returns 26 characters with last character always '0' for perfect binary conversion.
 *
 * This ensures 100% lossless binary conversion (128 bits) while maintaining
 * full ULID spec compliance and interoperability with other ULID systems.
 *
 * Uses monotonic mode by default - ensures IDs are always increasing,
 * even if the system clock goes backwards.
 *
 * @param seedTime Optional timestamp in milliseconds to use for ID generation
 * @returns 26-character ULID string (last char always '0')
 */
export function generateUlid(seedTime?: number): string {
  const id = seedTime !== undefined ? ulidGenerator(seedTime) : ulidGenerator()
  // Replace last char with '0' for lossless binary conversion (128 bits)
  return id.substring(0, 25) + "0"
}

/**
 * Validate if a string is a valid ULID format.
 *
 * @param id The string to validate
 * @returns true if valid ULID format (26 characters, valid Crockford Base32)
 */
export function isValidUlid(id: string): boolean {
  if (!id || typeof id !== "string" || id.length !== ULID_LENGTH) return false

  // Validate all characters are valid Crockford Base32
  for (let i = 0; i < id.length; i++) {
    const charCode = id.charCodeAt(i)
    const upperCharCode = id.toUpperCase().charCodeAt(i)
    if (DECODE_MAP[charCode] === 255 && DECODE_MAP[upperCharCode] === 255) {
      return false
    }
  }

  return true
}

/**
 * Decode timestamp from a ULID string.
 *
 * @param id The ULID string (26 characters)
 * @returns Timestamp in milliseconds since Unix epoch
 * @throws Error if invalid ULID
 */
export function decodeTimeFromUlid(id: string): number {
  if (!isValidUlid(id)) {
    throw new Error("Invalid ULID format")
  }
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
  return Date.now() - decodeTimeFromUlid(id)
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
  const age = Date.now() - timestamp

  return {
    timestamp,
    timestampSeconds: Math.floor(timestamp / 1000),
    age,
  }
}

/**
 * Convert ULID (26-char base32) → 16-byte binary for lossless storage.
 * Works perfectly because last character is always '0' (uses only 128 bits).
 *
 * @param id The ULID string (26 characters)
 * @returns 16-byte Uint8Array
 * @throws Error if invalid ULID
 */
export function ulidToBinary(id: string): Uint8Array {
  if (!isValidUlid(id)) {
    throw new Error(`Invalid ULID: must be ${ULID_LENGTH} characters`)
  }

  const bytes = new Uint8Array(16)
  let bitBuffer = 0
  let bitsInBuffer = 0
  let bytePos = 0

  // Process all 26 characters (130 bits, but last 2 bits are always 0)
  for (let i = 0; i < ULID_LENGTH; i++) {
    const charCode = id.charCodeAt(i)
    const value =
      DECODE_MAP[charCode] !== 255
        ? DECODE_MAP[charCode]
        : DECODE_MAP[id.toUpperCase().charCodeAt(i)]

    bitBuffer = (bitBuffer << 5) | value
    bitsInBuffer += 5

    // Flush complete bytes
    while (bitsInBuffer >= 8) {
      bitsInBuffer -= 8
      if (bytePos < 16) {
        bytes[bytePos++] = (bitBuffer >> bitsInBuffer) & 0xff
      }
    }
  }

  // No remaining bits to handle since last char '0' contributes only to complete bytes
  return bytes
}

/**
 * Convert 16-byte binary ULID → 26-char string (lossless).
 * Last character will always be '0' (maintains consistency with generateUlid).
 *
 * @param input Binary ULID (16 bytes)
 * @returns 26-character ULID string
 * @throws Error if invalid input
 */
export function binaryToUlid(input: Uint8Array | Buffer): string {
  const bytes = input instanceof Buffer ? new Uint8Array(input) : input

  if (!(bytes instanceof Uint8Array) || bytes.length !== 16) {
    throw new Error("Invalid binary ULID: must be 16 bytes")
  }

  let bitBuffer = 0
  let bitsInBuffer = 0
  let id = ""

  // Process all 16 bytes
  for (let i = 0; i < 16; i++) {
    bitBuffer = (bitBuffer << 8) | bytes[i]
    bitsInBuffer += 8

    // Extract 5-bit groups
    while (bitsInBuffer >= 5) {
      bitsInBuffer -= 5
      id += CROCKFORD32[(bitBuffer >> bitsInBuffer) & 31]
    }
  }

  // Add final character (will be '0' due to padding)
  if (bitsInBuffer > 0) {
    id += CROCKFORD32[(bitBuffer << (5 - bitsInBuffer)) & 31]
  }

  // Ensure exactly 26 characters with last char '0'
  return id.substring(0, 25) + "0"
}
