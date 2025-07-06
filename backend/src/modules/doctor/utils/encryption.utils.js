import crypto from "crypto";

export function encrypt(data, entityId) {
  console.log("Encrypt function called with:");
  console.log("- Data type:", typeof data);
  console.log("- Data is Buffer?", Buffer.isBuffer(data));
  console.log("- Data length:", data ? data.length : "null/undefined");
  console.log("- Entity ID:", entityId);

  // Validate input parameters
  if (!data) {
    throw new Error("Encryption data cannot be null or undefined");
  }

  if (!entityId) {
    throw new Error("Entity ID cannot be null or undefined");
  }

  if (!process.env.MASTER_KEY) {
    throw new Error("MASTER_KEY environment variable is not set");
  }

  // Ensure data is a Buffer
  let dataBuffer;
  if (Buffer.isBuffer(data)) {
    dataBuffer = data;
  } else if (typeof data === "string") {
    dataBuffer = Buffer.from(data, "utf8");
  } else if (data instanceof ArrayBuffer || data instanceof Uint8Array) {
    dataBuffer = Buffer.from(data);
  } else {
    throw new Error(`Unsupported data type for encryption: ${typeof data}`);
  }

  console.log("Using data buffer with length:", dataBuffer.length);

  const masterKey = Buffer.from(process.env.MASTER_KEY, "utf8");
  const key = crypto
    .createHmac("sha256", masterKey)
    .update(entityId.toString())
    .digest();
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv("aes-256-cbc", key, iv);
  let encrypted = cipher.update(dataBuffer);
  encrypted = Buffer.concat([encrypted, cipher.final()]);
  return { iv: iv.toString("hex"), encryptedData: encrypted.toString("hex") };
}
