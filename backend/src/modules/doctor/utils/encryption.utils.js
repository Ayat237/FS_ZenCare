import crypto from "crypto";
export function encrypt(data, entityId) {
  const masterKey = Buffer.from(
    process.env.MASTER_KEY,
    "utf8"
  );
  const key = crypto
    .createHmac("sha256", masterKey)
    .update(entityId.toString())
    .digest();
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv("aes-256-cbc", key, iv);
  let encrypted = cipher.update(data);
  encrypted = Buffer.concat([encrypted, cipher.final()]);
  return { iv: iv.toString("hex"), encryptedData: encrypted.toString("hex") };
}

