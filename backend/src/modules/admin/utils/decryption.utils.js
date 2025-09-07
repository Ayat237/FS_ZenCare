import crypto from "crypto";
export function decrypt(encryptedDataHex, ivHex, entityId) {
  const masterKey = Buffer.from(
    process.env.MASTER_KEY || "default-master-key-32bytes",
    "utf8"
  );
  const key = crypto
    .createHmac("sha256", masterKey)
    .update(entityId.toString())
    .digest();
  const iv = Buffer.from(ivHex, "hex");
  const encryptedText = Buffer.from(encryptedDataHex, "hex");
  const decipher = crypto.createDecipheriv("aes-256-cbc", key, iv);
  let decrypted = decipher.update(encryptedText);
  decrypted = Buffer.concat([decrypted, decipher.final()]);
  return decrypted;
}
