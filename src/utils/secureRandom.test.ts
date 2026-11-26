import { describe, it, expect, afterEach, vi } from "vitest"
import { secureRandom } from "./secureRandom"
import { randomNumberWithFixedLength } from "../number"
import { randomStringWithFixedLength } from "../string"

const stubCrypto = (word: number) => {
  const getRandomValues = vi.fn(<T extends ArrayBufferView>(array: T): T => {
    ;(array as unknown as Uint32Array).fill(word)
    return array
  })
  vi.stubGlobal("crypto", { getRandomValues })
  return getRandomValues
}

afterEach(() => {
  vi.unstubAllGlobals()
  vi.restoreAllMocks()
})

describe("secureRandom", () => {
  it("returns floats in [0, 1)", () => {
    for (let i = 0; i < 1000; i++) {
      const value = secureRandom()
      expect(value).toBeGreaterThanOrEqual(0)
      expect(value).toBeLessThan(1)
    }
  })

  it("uses crypto.getRandomValues and not Math.random", () => {
    const getRandomValues = stubCrypto(0)
    const mathRandom = vi.spyOn(Math, "random")

    secureRandom()

    expect(getRandomValues).toHaveBeenCalledTimes(1)
    expect(mathRandom).not.toHaveBeenCalled()
  })

  it("returns 0 for all-zero bits and stays below 1 for all-one bits", () => {
    stubCrypto(0)
    expect(secureRandom()).toBe(0)

    stubCrypto(0xffffffff)
    const max = secureRandom()
    expect(max).toBeLessThan(1)
    expect(max).toBeGreaterThan(0.999999)
  })

  it("falls back to Math.random when Web Crypto is unavailable", () => {
    vi.stubGlobal("crypto", undefined)
    const mathRandom = vi.spyOn(Math, "random").mockReturnValue(0.25)

    expect(secureRandom()).toBe(0.25)
    expect(mathRandom).toHaveBeenCalledTimes(1)
  })
})

describe("randomNumberWithFixedLength (secure source)", () => {
  it("covers the full range of the requested length", () => {
    stubCrypto(0)
    expect(randomNumberWithFixedLength(3)).toBe(100)

    stubCrypto(0xffffffff)
    expect(randomNumberWithFixedLength(3)).toBe(999)
  })

  it("does not use Math.random when Web Crypto exists", () => {
    stubCrypto(123456789)
    const mathRandom = vi.spyOn(Math, "random")

    randomNumberWithFixedLength(6)

    expect(mathRandom).not.toHaveBeenCalled()
  })
})

describe("randomStringWithFixedLength (secure source)", () => {
  it("always returns a defined character from 0-9a-z", () => {
    stubCrypto(0)
    expect(randomStringWithFixedLength(5)).toBe("00000")

    stubCrypto(0xffffffff)
    expect(randomStringWithFixedLength(5)).toBe("zzzzz")
  })

  it("only produces lowercase alphanumeric characters", () => {
    expect(randomStringWithFixedLength(500)).toMatch(/^[0-9a-z]{500}$/)
  })

  it("does not use Math.random when Web Crypto exists", () => {
    stubCrypto(987654321)
    const mathRandom = vi.spyOn(Math, "random")

    randomStringWithFixedLength(20)

    expect(mathRandom).not.toHaveBeenCalled()
  })
})