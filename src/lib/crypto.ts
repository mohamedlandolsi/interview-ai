import crypto from 'crypto';
import bcrypt from 'bcryptjs';

const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || crypto.randomBytes(32).toString('hex');
const ALGORITHM = 'aes-256-gcm';

/**
 * Encrypts sensitive data like Vapi API keys
 */
export function encrypt(text: string): string {
  if (!text) return '';
  
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipher(ALGORITHM, ENCRYPTION_KEY);
  
  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  
  const authTag = cipher.getAuthTag();
  
  return `${iv.toString('hex')}:${authTag.toString('hex')}:${encrypted}`;
}

/**
 * Decrypts sensitive data like Vapi API keys
 */
export function decrypt(encryptedText: string): string {
  if (!encryptedText) return '';
  
  try {
    const [ivHex, authTagHex, encrypted] = encryptedText.split(':');
    
    const iv = Buffer.from(ivHex, 'hex');
    const authTag = Buffer.from(authTagHex, 'hex');
    
    const decipher = crypto.createDecipher(ALGORITHM, ENCRYPTION_KEY);
    decipher.setAuthTag(authTag);
    
    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    
    return decrypted;
  } catch (error) {
    console.error('Decryption failed:', error);
    return '';
  }
}

/**
 * Generates a secure random API key
 */
export function generateApiKey(): string {
  const prefix = 'ij_'; // "interview job" prefix
  const randomBytes = crypto.randomBytes(32);
  const key = prefix + randomBytes.toString('hex');
  return key;
}

/**
 * Creates a display prefix from an API key
 */
export function createApiKeyPrefix(apiKey: string): string {
  return apiKey.substring(0, 12) + '...';
}

/**
 * Hashes an API key for secure storage
 */
export async function hashApiKey(apiKey: string): Promise<string> {
  const saltRounds = 12;
  return await bcrypt.hash(apiKey, saltRounds);
}

/**
 * Verifies an API key against its hash
 */
export async function verifyApiKey(apiKey: string, hash: string): Promise<boolean> {
  return await bcrypt.compare(apiKey, hash);
}

/**
 * Validates webhook URL format
 */
export function isValidWebhookUrl(url: string): boolean {
  try {
    const parsedUrl = new URL(url);
    return parsedUrl.protocol === 'https:' && parsedUrl.hostname !== 'localhost';
  } catch {
    return false;
  }
}
