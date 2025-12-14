import { GameEvent, Checkpoint, ChainState } from './types';
import { chainHash, initHash } from '../utils/hash';

export class HashChain {
  private state: ChainState | null = null;
  private checkpoints: Checkpoint[] = [];
  private checkpointInterval: number;
  private lastCheckpointTime: number = 0;

  constructor(checkpointInterval: number = 150) {
    this.checkpointInterval = checkpointInterval;
  }

  public startChain(sessionId: string): string {
    const genesisHash = initHash(sessionId);
    
    this.state = {
      sessionId,
      currentHash: genesisHash,
      eventCount: 0,
      checkpointIndex: 0,
      startTime: Date.now(),
      pendingEvents: [],
    };

    this.lastCheckpointTime = Date.now();
    
    console.log(`🔗 Hash chain started`);
    console.log(`   Session ID: ${sessionId}`);
    console.log(`   Genesis Hash: ${genesisHash}`);
    
    return genesisHash;
  }

  public addEvent(event: GameEvent): string {
    if (!this.state) {
      throw new Error('Chain not started. Call startChain() first.');
    }

    // ADD THESE LOGS:
    console.log('\n--- ADD EVENT DEBUG ---');
    console.log('Event type:', event.type);
    console.log('Event timestamp:', event.timestamp);
    console.log('Current hash BEFORE:', this.state.currentHash.substring(0, 16));
    console.log('Event count BEFORE:', this.state.eventCount);
    console.log('Pending events BEFORE:', this.state.pendingEvents.length);

    const newHash = chainHash(this.state.currentHash, event);
    
    // ADD THIS LOG:
    console.log('New hash AFTER:', newHash.substring(0, 16));
    
    this.state.currentHash = newHash;
    this.state.eventCount++;
    this.state.pendingEvents.push(event);

    // ADD THESE LOGS:
    console.log('Event count AFTER:', this.state.eventCount);
    console.log('Pending events AFTER:', this.state.pendingEvents.length);

    const timeSinceLastCheckpoint = Date.now() - this.lastCheckpointTime;
    
    // ADD THIS LOG:
    console.log('Time since last checkpoint:', timeSinceLastCheckpoint, 'ms');
    
    if (timeSinceLastCheckpoint >= this.checkpointInterval && this.state.pendingEvents.length > 0) {
      console.log('🚨 CHECKPOINT TIME!');
      this.finalizeCheckpoint();
    }

    console.log('--- END ADD EVENT ---\n');

    return newHash;
  }

  public getCurrentHash(): string {
    if (!this.state) {
      throw new Error('Chain not started.');
    }
    return this.state.currentHash;
  }

  public finalizeCheckpoint(): Checkpoint {
    if (!this.state) {
      throw new Error('Chain not started.');
    }

    if (this.state.pendingEvents.length === 0) {
      throw new Error('No pending events to checkpoint.');
    }

    const previousHash = this.checkpoints.length > 0
      ? this.checkpoints[this.checkpoints.length - 1].hash
      : initHash(this.state.sessionId);

    const checkpoint: Checkpoint = {
      index: this.state.checkpointIndex,
      events: [...this.state.pendingEvents],
      hash: this.state.currentHash,
      previousHash,
      timestamp: Date.now(),
      sessionId: this.state.sessionId,
    };

    this.checkpoints.push(checkpoint);
    
    this.state.checkpointIndex++;
    this.state.pendingEvents = [];
    this.lastCheckpointTime = Date.now();

    console.log(`📦 Checkpoint #${checkpoint.index} created`);
    console.log(`   Events: ${checkpoint.events.length}`);
    console.log(`   Hash: ${checkpoint.hash.substring(0, 16)}...`);

    return checkpoint;
  }

  public forceCheckpoint(): Checkpoint | null {
    if (!this.state || this.state.pendingEvents.length === 0) {
      return null;
    }
    return this.finalizeCheckpoint();
  }

  public getCheckpoints(): Checkpoint[] {
    return [...this.checkpoints];
  }

  public getStats() {
    if (!this.state) {
      return null;
    }

    return {
      sessionId: this.state.sessionId,
      totalEvents: this.state.eventCount,
      checkpointsCreated: this.checkpoints.length,
      pendingEvents: this.state.pendingEvents.length,
      currentHash: this.state.currentHash,
      uptime: Date.now() - this.state.startTime,
    };
  }

  public getAllEvents(): GameEvent[] {
    const allEvents: GameEvent[] = [];
    
    for (const checkpoint of this.checkpoints) {
      allEvents.push(...checkpoint.events);
    }
    
    if (this.state) {
      allEvents.push(...this.state.pendingEvents);
    }
    
    return allEvents;
  }

  public reset(): void {
    this.state = null;
    this.checkpoints = [];
    this.lastCheckpointTime = 0;
  }
}