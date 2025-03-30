import CryptoJS from "crypto-js";

/**
 * Encrypts a string or object using AES encryption
 * @param {string|object} data - String or object to encrypt
 * @returns {string} Base64 encoded encrypted string
 */
export function encryptPayload(data) {
  try {
    const plainText = typeof data === "object" ? JSON.stringify(data) : data;

    const keyBase64 = process.env.NEXT_PUBLIC_AES_KEY;
    const ivBase64 = process.env.NEXT_PUBLIC_AES_INIT_VECTOR;

    const key = CryptoJS.enc.Base64.parse(keyBase64);
    const iv = CryptoJS.enc.Base64.parse(ivBase64);

    const encrypted = CryptoJS.AES.encrypt(plainText, key, {
      iv: iv,
      mode: CryptoJS.mode.CBC,
      padding: CryptoJS.pad.Pkcs7,
    });

    return encrypted.toString();
  } catch (error) {
    console.error("Encryption failed:", error);
    throw error;
  }
}

/**
 * Decrypts an encrypted string
 * @param {string} cipherText - Base64 encoded encrypted string
 * @returns {string} Decrypted string
 */
export function decryptPayload(cipherText) {
  try {
    if (!cipherText) return "";

    const keyBase64 = process.env.NEXT_PUBLIC_AES_KEY;
    const ivBase64 = process.env.NEXT_PUBLIC_AES_INIT_VECTOR;

    const key = CryptoJS.enc.Base64.parse(keyBase64);
    const iv = CryptoJS.enc.Base64.parse(ivBase64);

    const cipherBytes = CryptoJS.enc.Base64.parse(cipherText);

    const decrypted = CryptoJS.AES.decrypt({ ciphertext: cipherBytes }, key, {
      iv: iv,
      mode: CryptoJS.mode.CBC,
      padding: CryptoJS.pad.Pkcs7,
    });

    return decrypted.toString(CryptoJS.enc.Utf8);
  } catch (error) {
    console.error("Decryption failed:", error);
    throw error;
  }
}

/**
 * Encrypts data from a stream (for compatibility with your C# model)
 * @param {ReadableStream} stream - Stream containing data to encrypt
 * @returns {Promise<Uint8Array>} Encrypted data as byte array
 */
export async function encryptStream(stream) {
  try {
    // Read the stream to get plain text
    const reader = stream.getReader();
    let plainText = "";

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      plainText += new TextDecoder().decode(value);
    }

    if (!plainText) return new Uint8Array();

    const encryptedText = encryptPayload(plainText);

    const jsonResponse = JSON.stringify({ response: encryptedText });
    return new TextEncoder().encode(jsonResponse);
  } catch (error) {
    console.error("Stream encryption failed:", error);
    throw error;
  }
}

/**
 * Decrypts data from a stream
 * @param {ReadableStream} stream - Stream containing encrypted data
 * @returns {Promise<string>} Decrypted string
 */
export async function decryptStream(stream) {
  try {
    const reader = stream.getReader();
    let encryptedText = "";

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      encryptedText += new TextDecoder().decode(value);
    }

    if (!encryptedText) return "";

    return decryptPayload(encryptedText);
  } catch (error) {
    console.error("Stream decryption failed:", error);
    throw error;
  }
}
