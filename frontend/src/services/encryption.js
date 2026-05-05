import nacl from 'tweetnacl';

class EncryptionService {
  generateKeyPair() {
    return nacl.box.keyPair();
  }

  encryptMessage(message, recipientPublicKey, senderSecretKey) {
    try {
      const nonce = nacl.randomBytes(nacl.box.nonceLength);
      const messageUint8 = new TextEncoder().encode(message);
      
      const encrypted = nacl.box(
        messageUint8,
        nonce,
        recipientPublicKey,
        senderSecretKey
      );
      
      return {
        ciphertext: Buffer.from(encrypted).toString('base64'),
        nonce: Buffer.from(nonce).toString('base64')
      };
    } catch (error) {
      throw new Error(`Encryption failed: ${error.message}`);
    }
  }

  decryptMessage(ciphertext, nonce, senderPublicKey, recipientSecretKey) {
    try {
      const decrypted = nacl.box.open(
        Buffer.from(ciphertext, 'base64'),
        Buffer.from(nonce, 'base64'),
        senderPublicKey,
        recipientSecretKey
      );
      
      if (!decrypted) {
        throw new Error('Decryption failed');
      }
      
      return new TextDecoder().decode(decrypted);
    } catch (error) {
      throw new Error(`Decryption failed: ${error.message}`);
    }
  }

  // Convert hex string to Uint8Array
  hexToUint8Array(hexString) {
    return new Uint8Array(Buffer.from(hexString, 'hex'));
  }

  // Convert Uint8Array to hex string
  uint8ArrayToHex(array) {
    return Buffer.from(array).toString('hex');
  }
}

export default new EncryptionService();
