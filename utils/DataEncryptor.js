const crypto = require('crypto');

class DataEncryptor {
  /**
   * @param {string} encryptionKey - A 32-byte key for encryption.
   */
  constructor(encryptionKey) {
    if (!encryptionKey || Buffer.from(encryptionKey, 'utf8').length !== 32) {
      throw new Error('A 32-byte (256-bit) encryption key is required.');
    }
    this.key = Buffer.from(encryptionKey, 'utf8');
    this.algorithm = 'aes-256-cbc';
  }

  /**
   * Encrypts specified properties of an object.
   * @param {object} data The object to process.
   * @param {string[]} propertiesToEncrypt An array of property names to encrypt.
   * @returns {object} The object with encrypted properties.
   */
  encrypt(data, propertiesToEncrypt) {
    const result = { ...data };
    for (const prop of propertiesToEncrypt) {
      if (Object.prototype.hasOwnProperty.call(result, prop) && result[prop] != null) {
        const iv = crypto.randomBytes(16); // Initialization vector
        const cipher = crypto.createCipheriv(this.algorithm, this.key, iv);
        let encrypted = cipher.update(String(result[prop]), 'utf8', 'hex');
        encrypted += cipher.final('hex');
        // Prepend the IV to the encrypted data for use in decryption
        result[prop] = `${iv.toString('hex')}:${encrypted}`;
      }
    }
    return result;
  }

  /**
   * Decrypts specified properties of an object.
   * @param {object} data The object with encrypted data.
   * @param {string[]} propertiesToDecrypt An array of property names to decrypt.
   * @returns {object} The object with decrypted properties.
   */
  decrypt(data, propertiesToDecrypt) {
    const result = { ...data };
    for (const prop of propertiesToDecrypt) {
      if (Object.prototype.hasOwnProperty.call(result, prop) && typeof result[prop] === 'string' && result[prop].includes(':')) {
        try {
            const [ivHex, encrypted] = result[prop].split(':');
            if (ivHex && encrypted) {
                const iv = Buffer.from(ivHex, 'hex');
                const decipher = crypto.createDecipheriv(this.algorithm, this.key, iv);
                let decrypted = decipher.update(encrypted, 'hex', 'utf8');
                decrypted += decipher.final('utf8');
                result[prop] = decrypted;
            }
        } catch (error) {
            // If decryption fails, it might not be an encrypted value; leave it as is.
            console.error(`Failed to decrypt property "${prop}":`, error);
        }
      }
    }
    return result;
  }
}

module.exports = DataEncryptor;
