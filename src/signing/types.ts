// Signing Module Types

export interface Keypair {
    publicKey: Buffer;
    privateKey: Buffer;
}

export interface SignedCheckpoint {
    checkpointHash: string;
    signature: string;
    publicKey: string;
    timestamp: number;
    chainLength: number;
}

export interface KeyStorage {
    encryptedPrivateKey: string;
    publicKey: string;
    salt: string;
    iv: string;
}