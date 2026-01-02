import * as crypto from 'crypto';
import * as fs from 'fs';
import * as path from 'path';
import { Keypair, KeyStorage } from './types';
import { buffer } from 'stream/consumers';

// KeyManager: Handles Ed25519 keypair lifecycle
export class KeyManager {
    private readonly keyPath: string;
    private readonly ENCRYPTION_ALGORITHM = 'aes-256-gcm';
    private readonly KEY_LENGTH = 32;
    private readonly SALT_LENGTH = 32;
    private readonly IV_LENGTH = 16;

    constructor(storagePath: string = './Keys') {
        this.keyPath = storagePath;

        if (!fs.existsSync(this.keyPath)) {
            fs.mkdirSync(this.keyPath, { recursive: true});
        }
    }
    
    // Generate new Ed25519 keypair
    generateKeypair(): Keypair {
        const { publicKey, privateKey } = crypto.generateKeyPairSync('ed25519', {
            publicKeyEncoding: { type: 'spki', format: 'der' },
            privateKeyEncoding: { type: 'pkcs8', format: 'der' }
        });

        return {
            publicKey: Buffer.from(publicKey),
            privateKey: Buffer.from(privateKey)
        };
    }

    // Encrypt and save keypair to disk
    async saveKeypair(
        keypair: Keypair,
        password: string,
        filename: string = 'game_keypair.json'
    ): Promise<void> {
        if (!password || password.length < 8) {
            throw new Error('Password must be at least 8 characters');
        }

        const salt = crypto.randomBytes(this.SALT_LENGTH);

        const encryptionKey = crypto.pbkdf2Sync(
            password,
            salt,
            100000,
            this.KEY_LENGTH,
            'sha256'
        );
        const iv = crypto.randomBytes(this.IV_LENGTH);

        const cipher = crypto.createCipheriv(
            this.ENCRYPTION_ALGORITHM,
            encryptionKey,
            iv
        );

        const encrypted = Buffer.concat([
            cipher.update(keypair.privateKey),
            cipher.final()
        ]);

        const authTag = cipher.getAuthTag();

        const encryptedWithTag = Buffer.concat([encrypted, authTag]);

        const KeyStorage: KeyStorage = {
            encryptedPrivateKey: encryptedWithTag.toString('hex'),
            publicKey: keypair.publicKey.toString('hex'),
            salt: salt.toString('hex'),
            iv: iv.toString('hex')
        };

        const filePath = path.join(this.keyPath, filename);
        fs.writeFileSync(filePath, JSON.stringify(KeyStorage, null, 2));
    }

    // Load and decrypt keypair from disk
    async loadKeypair(
        password: string,
        filename: string = 'game_keypair.json'
    ): Promise<Keypair> {
        const filePath = path.join(this.keyPath, filename);

        if (!fs.existsSync(filePath)) {
            throw new Error('Keypair file not found: ${filename}');
        }

        const keyStorage: KeyStorage = JSON.parse(
            fs.readFileSync(filePath, 'utf-8')
        );

        // Derive same encryption key from password + stored salt
        const salt = Buffer.from(keyStorage.salt, 'hex');
        const encryptionKey = crypto.pbkdf2Sync(
            password,
            salt,
            100000,
            this.KEY_LENGTH,
            'sha256'
        );

        // Prepare for decryption
        const iv = Buffer.from(keyStorage.iv, 'hex');
        const encryptedWithTag = Buffer.from(keyStorage.encryptedPrivateKey, 'hex');

        // Split encrypted data and auth tag
        const authTag = encryptedWithTag.subarray(encryptedWithTag.length - 16);
        const encrypted = encryptedWithTag.subarray(0, encryptedWithTag.length - 16);        

        // Create dicipher
        const decipher = crypto.createDecipheriv(
            this.ENCRYPTION_ALGORITHM,
            encryptionKey,
            iv
        );
        decipher.setAuthTag(authTag);

        // Decrypt private key
        let privateKey: Buffer;
        try {    
          privateKey = Buffer.concat([
            decipher.update(encrypted),
            decipher.final()
        ]);
        } catch (error) {
            throw new Error('Decryption failed - incorrect password of corrupted file');
        }

        return {
            publicKey: Buffer.from(keyStorage.publicKey, 'hex'),
            privateKey
        };
    } 

    // Check if keypair file exists
    keypairExists(filename: string = 'game_keypair.json'): boolean {
        return fs.existsSync(path.join(this.keyPath, filename));
    }

    // Delete keypair file (use with caution!) 
    deleteKeypair(filename: string = 'game_keypair.json'): void {
        const filePath = path.join(this.keyPath, filename);
        if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
        }
    }
}


