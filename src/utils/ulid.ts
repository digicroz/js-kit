import { monotonicFactory, decodeTime } from "ulidx"

// Constants
const CROCKFORD32 = "0123456789ABCDEFGHJKMNPQRSTVWXYZ"
const ULID_LENGTH = 25 // Using 25 chars (125 bits) for perfect binary conversion

// Precompute decode map for performance
const DECODE_MAP = new Uint8Array(128).fill(255)
for (let i = 0; i < CROCKFORD32.length; i++) {
  DECODE_MAP[CROCKFORD32.charCodeAt(i)] = i
}

// Create monotonic ULID generator
const ulidGenerator = monotonicFactory()

/**
 * Generate a ULID (Universally Unique Lexicographically Sortable ID).
 * Returns 25 characters for perfect binary conversion (125 bits = 15.625 bytes ≈ 16 bytes).
 *
 * Uses monotonic mode by default - ensures IDs are always increasing,
 * even if the system clock goes backwards.
 *
 * @param seedTime Optional timestamp in milliseconds to use for ID generation
 * @returns 25-character ULID string
 */
export function generateUlid(seedTime?: number): string {
  const id = seedTime !== undefined ? ulidGenerator(seedTime) : ulidGenerator()
  // Use first 25 chars for lossless binary conversion (125 bits)
  return id.substring(0, ULID_LENGTH)
}

/**
 * Validate if a string is a valid ULID format.
 *
 * @param id The string to validate
 * @param strictLength If true, validates 25 chars; if false, accepts 25-26 chars
 * @returns true if valid ULID, false otherwise
 */
export function isValidUlid(id: string, strictLength = true): boolean {
  if (!id || typeof id !== "string") return false

  const minLength = ULID_LENGTH
  const maxLength = strictLength ? ULID_LENGTH : 26

  if (id.length < minLength || id.length > maxLength) return false

  // Validate all characters are valid Crockford Base32
  for (let i = 0; i < id.length; i++) {
    if (
      DECODE_MAP[id.charCodeAt(i)] === 255 &&
      DECODE_MAP[id.toUpperCase().charCodeAt(i)] === 255
    ) {
      return false
    }
  }

  return true
}

/**
 * Decode timestamp from a ULID string.
 *
 * @param id The ULID string (25 or 26 characters)
 * @returns Timestamp in milliseconds since Unix epoch
 * @throws Error if invalid ULID
 */
export function decodeTimeFromUlid(id: string): number {
  if (!isValidUlid(id, false)) {
    throw new Error("Invalid ULID format")
  }
  // Pad to 26 chars if needed for decodeTime function
  const paddedId = id.length === 25 ? id + "0" : id
  return decodeTime(paddedId)
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
 * Convert ULID (25-char base32) → 16-byte binary for lossless storage.
 * Perfect conversion: 25 chars × 5 bits = 125 bits ≈ 16 bytes (128 bits).
 *
 * @param id The ULID string (25 characters)
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

  // Process all 25 characters
  for (let i = 0; i < ULID_LENGTH; i++) {
    const value =
      DECODE_MAP[id.charCodeAt(i)] !== 255
        ? DECODE_MAP[id.charCodeAt(i)]
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

  // Handle remaining bits (125 % 8 = 5 bits left)
  if (bitsInBuffer > 0 && bytePos < 16) {
    bytes[bytePos] = (bitBuffer << (8 - bitsInBuffer)) & 0xff
  }

  return bytes
}

/**
 * Convert 16-byte binary ULID → 25-char string (lossless).
 *
 * @param input Binary ULID (16 bytes)
 * @returns 25-character ULID string
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

  // Return exactly 25 characters
  return id.substring(0, ULID_LENGTH)
}
