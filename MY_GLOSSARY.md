session id: unique identifier for one game match.
genesis hash: the initial hash which is the hash of the session id.
checkpoint: like a block of events instead of hashing all checkpoints, we just couple them into checkpoints in order to minimize space on the blockchain.
Hash: the cryptographic signature of a word, combination of letters or anything.
Events: the ocassions that took place during the game play.



GAMEPLAY;
1. Telementry captures event 
2. Observer gets notified 
3. EventBuilder convert it to KEY_PRESS event
4. It is been added to a chain: new hash = hash(old hash + event)
5. Some reminant event are stored in the PendingEvents
6. When 150ms passes, checkpoint is created

Key Storage Methods - Quick Reference
What I'm Using Now: File-Based Storage

Stores encrypted keys in files on disk
Simple, no external dependencies
Good for: Learning, development, small projects
Not for production - files can be copied, deleted, or accessed if server is compromised

Production Alternatives (Future Reference)
Hardware Security Modules (HSMs)

Physical tamper-proof devices
Keys never leave the hardware
Examples: YubiHSM, AWS CloudHSM
Use when: Maximum security needed

Key Vaults (Cloud)

Managed cloud services
Examples: AWS KMS, Azure Key Vault, Google Cloud KMS, HashiCorp Vault
Use when: Cloud-based apps, need centralized control

Other Options

Encrypted databases
OS credential stores (Keychain, Windows Credential Manager)
Secret management (Doppler, 1Password Secrets)

Why This Matters
Cryptographic keys are the "master password" to everything. If compromised, attackers can decrypt all data. Production systems need specialized, audited storage solutions.


stay here first {
    // ============================================
// RUN SIMULATION
// ============================================
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

  // ✅ NOW 'checkpoints' is defined here
  const checkpoints = hashChain.getCheckpoints();
  
  // ✅ MOVED: Use StatsCalculator here (after checkpoints is defined)
  console.log('📈 DETAILED STATISTICS');
  console.log('==========================================');
  const detailedStats = StatsCalculator.calculateStats(checkpoints);
  StatsCalculator.printStats(detailedStats);

  console.log('📦 CHECKPOINTS');
  console.log('==========================================');
  checkpoints.forEach((cp: Checkpoint) => {
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
  allEvents.slice(0, 5).forEach((event: GameEvent, i: number) => {
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

  // ============================================
  // MANUAL HASH CHAIN TEST
  // ============================================
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

  console.log('\n✨ NEXT STEPS (Week 2)');
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
}