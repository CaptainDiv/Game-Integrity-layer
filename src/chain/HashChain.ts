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
    console.log(`   Genesis Hash: ${genesisHash.substring(0, 16)}...`);
    
    return genesisHash;
  }

  public addEvent(event: GameEvent): string {
    if (!this.state) {
      throw new Error('Chain not started. Call startChain() first.');
    }

    const newHash = chainHash(this.state.currentHash, event);
    
    this.state.currentHash = newHash;
    this.state.eventCount++;
    this.state.pendingEvents.push(event);

    const timeSinceLastCheckpoint = Date.now() - this.lastCheckpointTime;
    if (timeSinceLastCheckpoint >= this.checkpointInterval && this.state.pendingEvents.length > 0) {
      this.finalizeCheckpoint();
    }

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