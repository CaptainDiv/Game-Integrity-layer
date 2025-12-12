import * as crypto from 'crypto';

export function hashData(data: any): string {
  const jsonString = JSON.stringify(data);
  const hash = crypto.createHash('sha256');
  hash.update(jsonString);
  return hash.digest('hex');
}

export function chainHash(previousHash: string, newData: any): string {
  const combined = {
    previousHash,
    data: newData,
  };
  return hashData(combined);
}

export function initHash(sessionId: string): string {
  return hashData({
    sessionId,
    type: 'CHAIN_INIT',
  });
}