import { Checkpoint, GameEvent } from '../chain/types';
import { chainHash, initHash } from '../utils/hash';

export interface VerificationResult {
  valid: boolean;
  message: string;
  expectedHash?: string;
  actualHash?: string;
  failedAtEvent?: number;
}

export class LocalVerifier {
  public verifyCheckpoint(checkpoint: Checkpoint): VerificationResult {
    console.log(`\n🔍 Verifying checkpoint #${checkpoint.index}...`);
    
    let currentHash = checkpoint.previousHash;
    
    for (let i = 0; i < checkpoint.events.length; i++) {
      const event = checkpoint.events[i];
      currentHash = chainHash(currentHash, event);
      
      if (i < 3 || i === checkpoint.events.length - 1) {
        console.log(`   Event ${i + 1}: ${currentHash.substring(0, 16)}...`);
      } else if (i === 3) {
        console.log(`   ... (${checkpoint.events.length - 4} more events)`);
      }
    }
    
    const valid = currentHash === checkpoint.hash;
    
    if (valid) {
      console.log(`✅ Checkpoint #${checkpoint.index} is VALID`);
      return {
        valid: true,
        message: `Checkpoint #${checkpoint.index} verified successfully.`,
        expectedHash: checkpoint.hash,
        actualHash: currentHash,
      };
    } else {
      console.log(`❌ Checkpoint #${checkpoint.index} is INVALID`);
      console.log(`   Expected: ${checkpoint.hash.substring(0, 32)}...`);
      console.log(`   Got:      ${currentHash.substring(0, 32)}...`);
      return {
        valid: false,
        message: `Hash mismatch in checkpoint #${checkpoint.index}.`,
        expectedHash: checkpoint.hash,
        actualHash: currentHash,
      };
    }
  }

  public verifyChain(checkpoints: Checkpoint[], sessionId: string): VerificationResult {
    console.log(`\n🔗 Verifying complete chain...`);
    console.log(`   Session ID: ${sessionId}`);
    console.log(`   Checkpoints: ${checkpoints.length}`);
    
    if (checkpoints.length === 0) {
      return {
        valid: false,
        message: 'No checkpoints to verify.',
      };
    }

    const expectedGenesisHash = initHash(sessionId);
    if (checkpoints[0].previousHash !== expectedGenesisHash) {
      console.log(`❌ Genesis hash mismatch`);
      return {
        valid: false,
        message: 'Genesis hash does not match session ID.',
        expectedHash: expectedGenesisHash,
        actualHash: checkpoints[0].previousHash,
      };
    }
    console.log(`✅ Genesis hash verified`);

    for (let i = 0; i < checkpoints.length; i++) {
      const checkpoint = checkpoints[i];
      
      if (checkpoint.index !== i) {
        return {
          valid: false,
          message: `Checkpoint index mismatch at position ${i}. Expected ${i}, got ${checkpoint.index}.`,
          failedAtEvent: i,
        };
      }

      const result = this.verifyCheckpoint(checkpoint);
      if (!result.valid) {
        return {
          ...result,
          failedAtEvent: i,
        };
      }

      if (i > 0) {
        const previousCheckpoint = checkpoints[i - 1];
        if (checkpoint.previousHash !== previousCheckpoint.hash) {
          console.log(`❌ Checkpoint link broken at #${i}`);
          return {
            valid: false,
            message: `Checkpoint #${i} previousHash does not match checkpoint #${i - 1} hash.`,
            expectedHash: previousCheckpoint.hash,
            actualHash: checkpoint.previousHash,
            failedAtEvent: i,
          };
        }
      }
    }

    console.log(`\n✅ ENTIRE CHAIN VERIFIED SUCCESSFULLY`);
    console.log(`   All ${checkpoints.length} checkpoints are valid`);
    console.log(`   Total events verified: ${checkpoints.reduce((sum, cp) => sum + cp.events.length, 0)}`);

    return {
      valid: true,
      message: `All ${checkpoints.length} checkpoints verified successfully.`,
    };
  }

  public validateGameRules(events: GameEvent[]): VerificationResult {
    console.log(`\n🎮 Validating game rules...`);
    
    let lastPosition: { x: number; y: number; z: number } | null = null;
    let lastTimestamp = 0;
    const maxSpeedPerMs = 0.5;

    for (let i = 0; i < events.length; i++) {
      const event = events[i];

      if (event.timestamp < lastTimestamp) {
        console.log(`❌ Events out of order at event ${i}`);
        return {
          valid: false,
          message: `Events are not in chronological order (event ${i}).`,
          failedAtEvent: i,
        };
      }
      lastTimestamp = event.timestamp;

      if (event.type === 'PLAYER_MOVE' && event.data.position) {
        if (lastPosition) {
          const timeDelta = event.timestamp - lastTimestamp;
          const distance = Math.sqrt(
            Math.pow(event.data.position.x - lastPosition.x, 2) +
            Math.pow(event.data.position.y - lastPosition.y, 2) +
            Math.pow(event.data.position.z - lastPosition.z, 2)
          );
          
          const speed = distance / timeDelta;
          
          if (speed > maxSpeedPerMs) {
            console.log(`❌ Impossible movement speed detected at event ${i}`);
            console.log(`   Speed: ${speed.toFixed(2)} units/ms (max: ${maxSpeedPerMs})`);
            return {
              valid: false,
              message: `Impossible movement speed at event ${i}. Possible speed hack.`,
              failedAtEvent: i,
            };
          }
        }
        
        lastPosition = event.data.position;
      }
    }

    console.log(`✅ All game rules validated`);
    return {
      valid: true,
      message: 'All game rules validated successfully.',
    };
  }

  public fullVerification(checkpoints: Checkpoint[], sessionId: string): VerificationResult {
    console.log(`\n🚀 Running FULL VERIFICATION`);
    console.log(`========================================`);

    const chainResult = this.verifyChain(checkpoints, sessionId);
    if (!chainResult.valid) {
      return chainResult;
    }

    const allEvents: GameEvent[] = [];
    for (const checkpoint of checkpoints) {
      allEvents.push(...checkpoint.events);
    }

    const rulesResult = this.validateGameRules(allEvents);
    if (!rulesResult.valid) {
      return rulesResult;
    }

    console.log(`\n🎉 FULL VERIFICATION PASSED`);
    console.log(`========================================`);
    return {
      valid: true,
      message: 'Full verification passed: hash chain and game rules valid.',
    };
  }
}