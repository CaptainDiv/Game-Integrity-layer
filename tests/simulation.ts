import { TelemetryCollector } from '../src/telemetry/TelemetryCollector';
import { EventBuilder } from '../src/telemetry/EventBuilder';
import { HashChain } from '../src/chain/HashChain';
import { LocalVerifier } from '../src/verification/LocalVerifier';

const SESSION_ID = 'match_' + Date.now();
const PLAYER_ID = 'player_alice';
const CHECKPOINT_INTERVAL = 150;

console.log('   THE GAME INTEGRITY LAYER - SIMULATION');
console.log('============================================\n');

// Initialize conponents
const telemetry = new TelemetryCollector();
const eventBuilder = new EventBuilder(PLAYER_ID);
const hashChain = new HashChain(CHECKPOINT_INTERVAL);
const verifier = new LocalVerifier();