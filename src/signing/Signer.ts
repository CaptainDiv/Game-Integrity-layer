import * as crypto from 'crypto';
import { Keypair, SignedCheckpoint } from './types';

// Signer: Creates and verifies Ed25519 signatures
export class Signer {
    signCheckpoint(
        checkpointHash: string,
        keypair: Keypair,
        chainLength: number
    ): SignedCheckpoint {
        if (!checkpointHash || checkpointHash.length !== 64) {
            throw new Error('Invalid checkpoint hash - must be 64 hex characters');
        }

        if (!keypair.privateKey || !keypair.publicKey) {
            throw new Error('Invalid keypair');
        }

        const messageBuffer = Buffer.from(checkpointHash, 'hex');

        const signature = crypto.sign(
            null,
            messageBuffer,
            {
                key: keypair.privateKey,
                format: 'der',
                type: 'pkcs8'
            }
        );

        // Return signed checkpoint (ready for blockchain submission
        return {
            checkpointHash,
            signature: signature.toString('hex'),
            publicKey: keypair.publicKey.toString('hex'),
            timestamp: Date.now(),
            chainLength
        };
    }

    verifySignature(signedCheckpoint: SignedCheckpoint): boolean {
        try {
        // Validate input format
        if (!signedCheckpoint.checkpointHash || 
            !signedCheckpoint.signature || 
            !signedCheckpoint.publicKey) {
            return false;
        }

        const messageBuffer = Buffer.from(signedCheckpoint.checkpointHash, 'hex');
        const signatureBuffer = Buffer.from(signedCheckpoint.signature, 'hex');
        const publicKeyBuffer = Buffer.from(signedCheckpoint.publicKey, 'hex');

        // Verify signature
        const isValid = crypto.verify(
            null,
            messageBuffer,
            {
                key: publicKeyBuffer,
                format: 'der',
                type: 'spki'
            },
            signatureBuffer
          );

          return isValid;
        } catch (error) {
            console.error('Signature verification error:', error);
            return false;
        }
    }  
    
    verifyBatch(signedCheckpoints: SignedCheckpoint[]): {
        allValid: boolean;
        results: { index: number; valid: boolean; checkpoint: SignedCheckpoint }[];
    } {
        const results = signedCheckpoints.map((checkpoint, index) => ({
            index,
            valid: this.verifySignature(checkpoint),
            checkpoint
        }));

        const allValid = results.every(r => r.valid);

        return { allValid, results };
    }

    // Extract public key from signed checkpoint 
    getPublicKey(signedCheckpoint: SignedCheckpoint): Buffer{
        return Buffer.from(signedCheckpoint.publicKey, 'hex');
    }

    // Verify checkpoint came from specific public key
    verifyFromPublickey(
        signedCheckpoint: SignedCheckpoint,
        expectedPublickey: string,
    ): boolean {
        if (signedCheckpoint.publicKey !== expectedPublickey) {
            return false;
        }
        return this.verifySignature(signedCheckpoint);
    }
}