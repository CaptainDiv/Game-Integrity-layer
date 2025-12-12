import { TelemetryCollector } from '../src/telemetry/TelemetryCollector';
import { EventBuilder } from '../src/telemetry/EventBuilder';
import { HashChain } from '../src/chain/HashChain';
import { LocalVerifier } from '../src/verification/LocalVerifier';
import { TelemetryData, Checkpoint, GameEvent } from '../src/chain/types'; // ← IMPORTANT: Added types

const SESSION_ID = 'match_' + Date.now();
const PLAYER_ID = 'player_alice';
const CHECKPOINT_INTERVAL = 300;

console.log('🎮 SUI GAME INTEGRITY LAYER - SIMULATION');
console.log('==========================================\n');

const telemetry = new TelemetryCollector();
const eventBuilder = new EventBuilder(PLAYER_ID);
const hashChain = new HashChain(CHECKPOINT_INTERVAL);
const verifier = new LocalVerifier();

telemetry.onTelemetry((data: TelemetryData) => {
  const event = eventBuilder.telemetryToEvent(data);
  if (event) {
    hashChain.addEvent(event);
  }
});

console.log('Starting hash chain...');
const genesisHash = hashChain.startChain(SESSION_ID);
console.log('');

console.log('📡 Simulating gameplay...\n');

const wait = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

async function simulateGameplay() {
  telemetry.capturePosition({ x: 0, y: 0, z: 0 });
  await wait(500);

  telemetry.captureKeyPress('W');
  telemetry.capturePosition({ x: 10, y: 0, z: 0 });
  await wait(500);

  telemetry.capturePosition({ x: 20, y: 0, z: 0 });
  await wait(500);

  telemetry.captureMouseMove(150, 200);
  await wait(500);

  telemetry.captureKeyPress('K');
  await wait(500)

  telemetry.captureMouseClick(150, 200, 'left');
  await wait(500);

  telemetry.captureKeyPress('A');
  telemetry.capturePosition({ x: 20, y: -10, z: 0 });
  await wait(500);

  telemetry.captureMouseClick(160, 195, 'left');
  await wait(500);

  telemetry.capturePosition({ x: 30, y: -10, z: 0 });
  await wait(500);

  telemetry.capturePosition({ x: 40, y: -15, z: 0 });
  await wait(500);

  telemetry.captureKeyPress('Space');
  telemetry.capturePosition({ x: 40, y: -15, z: 5 });
  await wait(500);

  telemetry.capturePosition({ x: 45, y: -15, z: 0 });
  await wait(500);

  telemetry.captureMouseClick(170, 190, 'left');
  await wait(500);

  telemetry.captureAction('player_hit', { x: 45, y: -15, z: 0 });
  await wait(500);

  telemetry.capturePosition({ x: 40, y: -20, z: 0 });
  await wait(500);

  telemetry.captureReload();
  await wait(500);

  telemetry.capturePosition({ x: 35, y: -25, z: 0 });
  await wait(500);

  telemetry.capturePosition({ x: 30, y: -30, z: 0 });
  await wait(500);
}

(async () => {
  await simulateGameplay();

  console.log('\n📦 Creating final checkpoint...');
  const finalCheckpoint = hashChain.forceCheckpoint();
  if (finalCheckpoint) {
    console.log(`Final checkpoint #${finalCheckpoint.index} created\n`);
  }

  const stats = hashChain.getStats();
  console.log('📊 SESSION STATISTICS');
  console.log('==========================================');
  console.log(`Session ID:       ${stats?.sessionId}`);
  console.log(`Total Events:     ${stats?.totalEvents}`);
  console.log(`Checkpoints:      ${stats?.checkpointsCreated}`);
  console.log(`Final Hash:       ${stats?.currentHash.substring(0, 32)}...`);
  console.log(`Duration:         ${stats?.uptime}ms`);
  console.log('');

  const checkpoints = hashChain.getCheckpoints();
  console.log('📦 CHECKPOINTS');
  console.log('==========================================');
  checkpoints.forEach((cp: Checkpoint) => { // ← FIXED: Added type
    console.log(`Checkpoint #${cp.index}:`);
    console.log(`  Events:       ${cp.events.length}`);
    console.log(`  Hash:         ${cp.hash.substring(0, 32)}...`);
    console.log(`  Previous:     ${cp.previousHash.substring(0, 32)}...`);
    console.log(`  Timestamp:    ${cp.timestamp}`);
    console.log('');
  });

  const allEvents = hashChain.getAllEvents();
  console.log('🎯 SAMPLE EVENTS');
  console.log('==========================================');
  allEvents.slice(0, 5).forEach((event: GameEvent, i: number) => { // ← FIXED: Added types
    console.log(`Event ${i + 1}:`);
    console.log(`  Type:         ${event.type}`);
    console.log(`  Timestamp:    ${event.timestamp}ms`);
    console.log(`  Player:       ${event.playerId}`);
    console.log(`  Data:         ${JSON.stringify(event.data)}`);
    console.log('');
  });
  if (allEvents.length > 5) {
    console.log(`... and ${allEvents.length - 5} more events\n`);
  }

  console.log('🔐 VERIFICATION');
  console.log('==========================================');
  
  const result = verifier.fullVerification(checkpoints, SESSION_ID);
  
  console.log('\n📋 VERIFICATION RESULT');
  console.log('==========================================');
  console.log(`Status:  ${result.valid ? '✅ VALID' : '❌ INVALID'}`);
  console.log(`Message: ${result.message}`);
  console.log('');

  console.log('🔓 TAMPER TEST');
  console.log('==========================================');
  console.log('What happens if we modify an event?\n');

  const tamperedCheckpoints = JSON.parse(JSON.stringify(checkpoints));
  
  if (tamperedCheckpoints[0].events.length > 0) {
    const originalEvent = { ...tamperedCheckpoints[0].events[0] };
    tamperedCheckpoints[0].events[0].data.position = { x: 9999, y: 9999, z: 9999 };
    
    console.log('Original event:');
    console.log(`  ${JSON.stringify(originalEvent)}`);
    console.log('');
    console.log('Tampered event:');
    console.log(`  ${JSON.stringify(tamperedCheckpoints[0].events[0])}`);
    console.log('');
    
    console.log('Verifying tampered chain...');
    const tamperedResult = verifier.fullVerification(tamperedCheckpoints, SESSION_ID);
    
    console.log('\n📋 TAMPERED CHAIN RESULT');
    console.log('==========================================');
    console.log(`Status:  ${tamperedResult.valid ? '✅ VALID' : '❌ INVALID (Expected!)'}`);
    console.log(`Message: ${tamperedResult.message}`);
    console.log('');
  }

  console.log('✨ NEXT STEPS (Week 2)');
  console.log('==========================================');
  console.log('1. Sign checkpoints with client private key');
  console.log('2. Send checkpoints to relay server');
  console.log('3. Relay posts checkpoints to Sui blockchain');
  console.log('4. Smart contract stores checkpoint hashes');
  console.log('5. Anyone can verify against on-chain data');
  console.log('');
  console.log('💡 This proves gameplay integrity using blockchain!');
  console.log('');
})();


// Manual hash chain test
console.log('\n🧪 MANUAL HASH CHAIN TEST');
console.log('==========================================');

const { hashData, chainHash, initHash } = require('../src/utils/hash');

const testSession = 'test_123';
const genesis = initHash(testSession);
console.log(`Genesis: ${genesis.substring(0, 16)}...`);

const event1 = { type: 'MOVE', x: 10 };
const hash1 = chainHash(genesis, event1);
console.log(`After event 1: ${hash1.substring(0, 16)}...`);

const event2 = { type: 'SHOOT', x: 20 };
const hash2 = chainHash(hash1, event2);
console.log(`After event 2: ${hash2.substring(0, 16)}...`);

// Now modify event1 and recalculate
const modifiedEvent1 = { type: 'MOVE', x: 999 }; // Changed!
const tamperedHash1 = chainHash(genesis, modifiedEvent1);
console.log(`\nTampered after event 1: ${tamperedHash1.substring(0, 16)}...`);
console.log(`Original was:           ${hash1.substring(0, 16)}...`);
console.log(`Match? ${tamperedHash1 === hash1 ? 'YES' : 'NO ❌'}`);