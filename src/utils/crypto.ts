
import crypto from 'crypto';

const secret = process.env.AES_SECRET!;
const iv = Buffer.alloc(16, 0); // Use a secure IV in production

export function encryptMessage(msg: string): string {
  const cipher = crypto.createCipheriv('aes-256-cbc', Buffer.from(secret), iv);
  return cipher.update(msg, 'utf8', 'hex') + cipher.final('hex');
}

export function decryptMessage(encrypted: string): string {
  const decipher = crypto.createDecipheriv('aes-256-cbc', Buffer.from(secret), iv);
  return decipher.update(encrypted, 'hex', 'utf8') + decipher.final('utf8');
}