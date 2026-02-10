/* 📖 # Why centralize id generation in generateId?
Using a single helper makes it easy to standardize id formats across the app
and keep sortable, compact identifiers across storage backends.
*/
const BASE62_ALPHABET =
  '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz'
const KSUID_EPOCH = 1400000000
const KSUID_RANDOM_BYTES = 16
const KSUID_TOTAL_BYTES = 20
const KSUID_STRING_LENGTH = 27

const createRandomBytes = (length: number): Uint8Array => {
  const bytes = new Uint8Array(length)

  if (typeof crypto !== 'undefined' && 'getRandomValues' in crypto) {
    crypto.getRandomValues(bytes)
    return bytes
  }

  for (let index = 0; index < length; index += 1) {
    bytes[index] = Math.floor(Math.random() * 256)
  }

  return bytes
}

const bytesToBase62 = (bytes: Uint8Array): string => {
  const digits: number[] = []

  for (const byte of bytes) {
    let carry = byte
    for (let index = 0; index < digits.length; index += 1) {
      const value = digits[index] * 256 + carry
      digits[index] = value % 62
      carry = Math.floor(value / 62)
    }

    while (carry > 0) {
      digits.push(carry % 62)
      carry = Math.floor(carry / 62)
    }
  }

  let encoded = digits
    .reverse()
    .map((digit) => BASE62_ALPHABET[digit])
    .join('')

  while (encoded.length < KSUID_STRING_LENGTH) {
    encoded = `0${encoded}`
  }

  return encoded
}

const createKsuid = (): string => {
  const timestamp = Math.floor(Date.now() / 1000) - KSUID_EPOCH
  const bytes = new Uint8Array(KSUID_TOTAL_BYTES)
  bytes[0] = (timestamp >>> 24) & 0xff
  bytes[1] = (timestamp >>> 16) & 0xff
  bytes[2] = (timestamp >>> 8) & 0xff
  bytes[3] = timestamp & 0xff
  bytes.set(createRandomBytes(KSUID_RANDOM_BYTES), 4)

  return bytesToBase62(bytes)
}

export const generateId = (prefix?: string): string => {
  const baseId = createKsuid()
  return prefix ? `${prefix}-${baseId}` : baseId
}
