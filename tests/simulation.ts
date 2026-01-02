import { TelemetryCollector } from '../src/telemetry/TelemetryCollector';
import { EventBuilder } from '../src/telemetry/EventBuilder';
import { HashChain } from '../src/chain/HashChain';
import { LocalVerifier } from '../src/verification/LocalVerifier';
import { config } from '../src/config';
import { StatsCalculator } from '../src/utils/stats';
import { KeyManager } from '../src/signing/KeyManager';
import { Signer } from '../src/signing/Signer';
import { SignedCheckpoint } from '../src/signing/types';
import * as fs from 'fs';

/**
 * SUI GAME INTEGRITY LAYER - COMPLETE SIMULATION
 * 
 * Week 1: Hash Chain + Local Verification
 * Week 2: Ed25519 Signing + Server Ready
 */

const SESSION_ID = 'match_' + Date.now();
const PLAYER_ID = 'player_alice';
const PASSWORD = 'demo_password_change_in_production';

console.log('🎮 SUI GAME INTEGRITY LAYER - SIMULATION');
console.log('==========================================\n');

// ===== INITIALIZE COMPONENTS =====
const telemetry = new TelemetryCollector();
const hashChain = new HashChain(config.hashChain);
const verifier = new LocalVerifier(hashChain);

// Week 2: Signing components
const keyManager = new KeyManager('./keys');
const signer = new Signer();

// ===== EVENT GENERATION HELPER =====
const wait = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Simulate realistic gameplay
 */
async function simulateGameplay() {
  console.log('📡 Simulating gameplay...\n');

  // Event 1: Player spawns
  const spawnEvent = EventBuilder.playerAction(PLAYER_ID, 'spawn', { x: 0, y: 0, z: 0 });
  telemetry.recordEvent(spawnEvent);
  hashChain.addEvent(spawnEvent);
  console.log('✓ Player spawned at (0, 0, 0)');
  await wait(150);

  // Event 2: Player moves forward
  const moveEvent1 = EventBuilder.playerAction(PLAYER_ID, 'move', { x: 10, y: 0, z: 0 });
  telemetry.recordEvent(moveEvent1);
  hashChain.addEvent(moveEvent1);
  console.log('✓ Player moved to (10, 0, 0)');
  await wait(150);

  // Event 3: Player moves again
  const moveEvent2 = EventBuilder.playerAction(PLAYER_ID, 'move', { x: 20, y: 0, z: 0 });
  telemetry.recordEvent(moveEvent2);
  hashChain.addEvent(moveEvent2);
  console.log('✓ Player moved to (20, 0, 0)');
  await wait(150);

  // Event 4: Game state update
  const stateEvent1 = EventBuilder.gameState('combat', { enemiesAlive: 5, playerHealth: 100 });
  telemetry.recordEvent(stateEvent1);
  hashChain.addEvent(stateEvent1);
  console.log('✓ Combat state: 5 enemies alive');
  await wait(150);

  // Event 5: Player shoots
  const shootEvent = EventBuilder.playerAction(PLAYER_ID, 'shoot', { target: 'enemy_1', weapon: 'rifle' });
  telemetry.recordEvent(shootEvent);
  hashChain.addEvent(shootEvent);
  console.log('✓ Player shot at enemy_1');
  await wait(150);

  // Event 6: Player strafes left
  const strafeEvent = EventBuilder.playerAction(PLAYER_ID, 'move', { x: 20, y: -10, z: 0 });
  telemetry.recordEvent(strafeEvent);
  hashChain.addEvent(strafeEvent);
  console.log('✓ Player strafed to (20, -10, 0)');
  await wait(150);

  // Event 7: Player takes damage
  const damageEvent = EventBuilder.playerAction(PLAYER_ID, 'take_damage', { amount: 25, source: 'enemy_bullet' });
  telemetry.recordEvent(damageEvent);
  hashChain.addEvent(damageEvent);
  console.log('✓ Player took 25 damage');
  await wait(150);

  // Event 8: Game state update
  const stateEvent2 = EventBuilder.gameState('combat', { enemiesAlive: 4, playerHealth: 75 });
  telemetry.recordEvent(stateEvent2);
  hashChain.addEvent(stateEvent2);
  console.log('✓ Combat state: 4 enemies alive, player at 75 HP');
  await wait(150);

  // Event 9: Player collects item
  const collectEvent = EventBuilder.playerAction(PLAYER_ID, 'collect', { item: 'health_pack' });
  telemetry.recordEvent(collectEvent);
  hashChain.addEvent(collectEvent);
  console.log('✓ Player collected health pack');
  await wait(150);

  // Event 10: Player heals
  const healEvent = EventBuilder.playerAction(PLAYER_ID, 'heal', { amount: 25 });
  telemetry.recordEvent(healEvent);
  hashChain.addEvent(healEvent);
  console.log('✓ Player healed 25 HP');
  await wait(150);

  // Event 11: Player jumps
  const jumpEvent = EventBuilder.playerAction(PLAYER_ID, 'jump', { x: 20, y: -10, z: 5 });
  telemetry.recordEvent(jumpEvent);
  hashChain.addEvent(jumpEvent);
  console.log('✓ Player jumped');
  await wait(150);

  // Event 12: Player reloads
  const reloadEvent = EventBuilder.playerAction(PLAYER_ID, 'reload', { weapon: 'rifle' });
  telemetry.recordEvent(reloadEvent);
  hashChain.addEvent(reloadEvent);
  console.log('✓ Player reloaded weapon');
  await wait(150);

  console.log('\n✓ Gameplay simulation complete\n');
}

/**
 * Main simulation flow
 */
async function runSimulation() {
  try {
    // ===== WEEK 2: KEY MANAGEMENT =====
    console.log('🔑 WEEK 2: KEY MANAGEMENT');
    console.log('==========================================\n');

    let keypair;
    if (keyManager.keypairExists()) {
      console.log('Loading existing keypair...');
      keypair = await keyManager.loadKeypair(PASSWORD);
      console.log('✓ Keypair loaded');
    } else {
      console.log('Generating new Ed25519 keypair...');
      keypair = keyManager.generateKeypair();
      await keyManager.saveKeypair(keypair, PASSWORD);
      console.log('✓ Keypair generated and encrypted');
    }
    
    console.log(`Public Key: ${keypair.publicKey.toString('hex').substring(0, 32)}...\n`);

    // ===== WEEK 1: GAMEPLAY SIMULATION =====
    await simulateGameplay();

    // ===== WEEK 1: STATISTICS =====
    console.log('📊 SESSION STATISTICS');
    console.log('==========================================');
    const stats = hashChain.getStats();
    console.log(`Session ID:       ${SESSION_ID}`);
    console.log(`Total Events:     ${stats.totalEvents}`);
    console.log(`Checkpoints:      ${stats.checkpointsCreated}`);
    console.log(`Chain Length:     ${hashChain.getChainLength()}`);
    console.log(`Current Hash:     ${hashChain.getCurrentHash().substring(0, 32)}...`);
    console.log(`Duration:         ${stats.duration}ms\n`);

    // ===== WEEK 1: CHECKPOINTS =====
    const checkpoints = hashChain.getCheckpoints();
    console.log('📦 CHECKPOINTS');
    console.log('==========================================');
    checkpoints.forEach((cp, index) => {
      console.log(`Checkpoint #${index}:`);
      console.log(`  Chain Length: ${cp.chainLength}`);
      console.log(`  Hash:         ${cp.hash.substring(0, 32)}...`);
      console.log(`  Timestamp:    ${new Date(cp.timestamp).toISOString()}`);
      console.log('');
    });

    // ===== WEEK 2: SIGN CHECKPOINTS =====
    console.log('🔐 WEEK 2: SIGNING CHECKPOINTS');
    console.log('==========================================\n');

    const signedCheckpoints: SignedCheckpoint[] = [];

    checkpoints.forEach((checkpoint, index) => {
      const signedCheckpoint = signer.signCheckpoint(
        checkpoint.hash,
        keypair,
        checkpoint.chainLength
      );
      signedCheckpoints.push(signedCheckpoint);
      console.log(`✓ Checkpoint ${index} signed`);
      console.log(`  Hash:      ${signedCheckpoint.checkpointHash.substring(0, 32)}...`);
      console.log(`  Signature: ${signedCheckpoint.signature.substring(0, 32)}...`);
      console.log('');
    });

    // ===== WEEK 2: VERIFY SIGNATURES =====
    console.log('🔐 WEEK 2: SIGNATURE VERIFICATION');
    console.log('==========================================\n');

    const batchVerification = signer.verifyBatch(signedCheckpoints);
    console.log(`Total Signed Checkpoints: ${signedCheckpoints.length}`);
    console.log(`All Signatures Valid:     ${batchVerification.allValid ? '✅ YES' : '❌ NO'}`);
    console.log('');

    batchVerification.results.forEach(result => {
      const status = result.valid ? '✅' : '❌';
      console.log(`  ${status} Checkpoint ${result.index}: ${result.valid ? 'VALID' : 'INVALID'}`);
    });
    console.log('');

    // ===== WEEK 1: HASH CHAIN VERIFICATION =====
    console.log('🔐 WEEK 1: HASH CHAIN VERIFICATION');
    console.log('==========================================\n');

    const isChainValid = verifier.verifyChain();
    console.log(`Chain Integrity: ${isChainValid ? '✅ VALID' : '❌ INVALID'}`);
    console.log('');

    // ===== DETAILED STATISTICS =====
    console.log('📈 DETAILED STATISTICS');
    console.log('==========================================');
    const detailedStats = StatsCalculator.calculateStats(checkpoints);
    StatsCalculator.printStats(detailedStats);

    // ===== TAMPER TEST =====
    console.log('\n🔓 TAMPER TEST');
    console.log('==========================================');
    console.log('Testing what happens if we modify checkpoint data...\n');

    if (signedCheckpoints.length > 0) {
      // Create tampered checkpoint
      const tamperedCheckpoint = { ...signedCheckpoints[0] };
      tamperedCheckpoint.checkpointHash = 'f'.repeat(64); // Change hash

      console.log('Original checkpoint hash:');
      console.log(`  ${signedCheckpoints[0].checkpointHash.substring(0, 32)}...`);
      console.log('\nTampered checkpoint hash:');
      console.log(`  ${tamperedCheckpoint.checkpointHash.substring(0, 32)}...`);
      console.log('');

      const tamperedValid = signer.verifySignature(tamperedCheckpoint);
      console.log(`Tampered checkpoint signature valid? ${tamperedValid ? '✅ YES (Unexpected!)' : '❌ NO (Expected!)'}`);
      console.log('');

      if (!tamperedValid) {
        console.log('✓ Tamper detection working correctly!');
        console.log('  The signature verification caught the modified hash.\n');
      }
    }

    // ===== OUTPUT FILES =====
    console.log('💾 SAVING OUTPUT FILES');
    console.log('==========================================\n');

    // Week 1 Output
    const week1Output = {
      sessionId: SESSION_ID,
      playerId: PLAYER_ID,
      chainLength: hashChain.getChainLength(),
      chainValid: isChainValid,
      stats: stats,
      checkpoints: checkpoints.map(cp => ({
        chainLength: cp.chainLength,
        hash: cp.hash,
        timestamp: cp.timestamp
      }))
    };

    fs.writeFileSync(
      'output_week1.json',
      JSON.stringify(week1Output, null, 2)
    );
    console.log('✓ Week 1 output saved: output_week1.json');

    // Week 2 Output
    const week2Output = {
      sessionId: SESSION_ID,
      playerId: PLAYER_ID,
      publicKey: keypair.publicKey.toString('hex'),
      signedCheckpoints: signedCheckpoints,
      verification: {
        allSignaturesValid: batchVerification.allValid,
        chainValid: isChainValid,
        timestamp: Date.now()
      }
    };

    fs.writeFileSync(
      'output_week2.json',
      JSON.stringify(week2Output, null, 2)
    );
    console.log('✓ Week 2 output saved: output_week2.json\n');

    // ===== SUMMARY =====
    console.log('📋 SIMULATION SUMMARY');
    console.log('==========================================');
    console.log(`Session ID:            ${SESSION_ID}`);
    console.log(`Events Generated:      ${stats.totalEvents}`);
    console.log(`Checkpoints Created:   ${checkpoints.length}`);
    console.log(`Checkpoints Signed:    ${signedCheckpoints.length}`);
    console.log(`Chain Integrity:       ${isChainValid ? '✅ VALID' : '❌ INVALID'}`);
    console.log(`Signatures Valid:      ${batchVerification.allValid ? '✅ VALID' : '❌ INVALID'}`);
    console.log(`Duration:              ${stats.duration}ms`);
    console.log('');

    console.log('✨ NEXT STEPS (Week 2 - Server)');
    console.log('==========================================');
    console.log('1. ✓ Sign checkpoints with Ed25519 (DONE)');
    console.log('2. → Build relay server with signature verification');
    console.log('3. → Submit signed checkpoints to server');
    console.log('4. → Server verifies and stores in database');
    console.log('');
    console.log('Week 3: Submit to Sui blockchain! 🚀');
    console.log('');

  } catch (error) {
    console.error('❌ Simulation failed:', error);
    process.exit(1);
  }
}

// ===== RUN SIMULATION =====
runSimulation().catch(console.error);