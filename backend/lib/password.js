import crypto from "crypto";
import { promisify } from "util";

const scrypt = promisify(crypto.scrypt);

export async function hashPassword(plain) {
  const salt = crypto.randomBytes(16).toString("hex");
  const derived = await scrypt(plain, salt, 32);
  return `${salt}:${derived.toString("hex")}`;
}

export async function verifyPassword(plain, stored) {
  if (!stored || !stored.includes(":")) return false;
  const [salt, hashHex] = stored.split(":");
  const derived = await scrypt(plain, salt, 32);
  const a = Buffer.from(hashHex, "hex");
  const b = Buffer.from(derived);
  if (a.length !== b.length) return false;
  return crypto.timingSafeEqual(a, b);
}
