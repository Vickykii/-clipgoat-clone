import crypto from "node:crypto";

export const millisToTimestamp = (ms: number): string => {
  const totalSeconds = Math.floor(ms / 1000);
  const hours = Math.floor(totalSeconds / 3600)
    .toString()
    .padStart(2, "0");
  const minutes = Math.floor((totalSeconds % 3600) / 60)
    .toString()
    .padStart(2, "0");
  const seconds = Math.floor(totalSeconds % 60)
    .toString()
    .padStart(2, "0");
  const milliseconds = Math.floor(ms % 1000)
    .toString()
    .padStart(3, "0");
  return `${hours}:${minutes}:${seconds},${milliseconds}`;
};

export const createEncryptionHelper = (secret: string) => {
  if (secret.length < 32) {
    throw new Error("ENCRYPTION_KEY must be at least 32 characters");
  }
  const key = Buffer.from(secret, secret.length === 32 ? "utf-8" : "base64");
  return {
    encrypt(data: string) {
      const iv = crypto.randomBytes(12);
      const cipher = crypto.createCipheriv("aes-256-gcm", key, iv);
      const encrypted = Buffer.concat([cipher.update(data, "utf8"), cipher.final()]);
      const tag = cipher.getAuthTag();
      return Buffer.concat([iv, tag, encrypted]).toString("base64");
    },
    decrypt(payload: string) {
      const buffer = Buffer.from(payload, "base64");
      const iv = buffer.subarray(0, 12);
      const tag = buffer.subarray(12, 28);
      const encrypted = buffer.subarray(28);
      const decipher = crypto.createDecipheriv("aes-256-gcm", key, iv);
      decipher.setAuthTag(tag);
      const decrypted = Buffer.concat([decipher.update(encrypted), decipher.final()]);
      return decrypted.toString("utf8");
    }
  } as const;
};

export const clamp = (value: number, min: number, max: number) =>
  Math.min(Math.max(value, min), max);

export const chunkArray = <T>(items: T[], size: number): T[][] => {
  const chunks: T[][] = [];
  for (let i = 0; i < items.length; i += size) {
    chunks.push(items.slice(i, i + size));
  }
  return chunks;
};
