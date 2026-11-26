import { secureRandom } from "../utils/secureRandom"

const RANDOM_CHARS = "0123456789abcdefghijklmnopqrstuvwxyz"

export * from "./capitalize"
export * from "./truncate"
export * from "./caseConversion"

export function randomStringWithFixedLength(length: number): string {
  if (!Number.isInteger(length) || length <= 0) {
    throw new Error("Length must be a positive integer.")
  }

  return Array.from({ length }, () => RANDOM_CHARS[Math.floor(secureRandom() * RANDOM_CHARS.length)]).join("")
}
