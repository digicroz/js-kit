type CryptoLike = { getRandomValues: <T extends ArrayBufferView>(array: T) => T };

/**
 * Uniform random float in [0, 1), drop-in for Math.random().
 * Uses the platform CSPRNG (Web Crypto, global in browsers and Node 19+).
 * Falls back to Math.random() only where no Web Crypto exists (e.g. React Native
 * without a polyfill), so the result is NOT guaranteed secure on those runtimes.
 */
export const secureRandom = (): number => {
  const webCrypto = (globalThis as { crypto?: CryptoLike }).crypto;
  if (webCrypto === undefined) {
    return Math.random();
  }
  const buf = new Uint32Array(2);
  webCrypto.getRandomValues(buf);
  // 27 + 26 = 53 random bits, same resolution as a double mantissa
  return (((buf[0] ?? 0) >>> 5) * 67108864 + ((buf[1] ?? 0) >>> 6)) / 9007199254740992;
};
