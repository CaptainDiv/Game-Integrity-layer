/**
 * TYPE DEFINITIONS
 * 
 * These types define the structure of our data.
 * Think of them as contracts - everyone agrees on this format.
 */

export enum EventType {
  PLAYER_MOVE = 'PLAYER_MOVE',
  PLAYER_SHOOT = 'PLAYER_SHOOT',
  PLAYER_HIT = 'PLAYER_HIT',
  PLAYER_DEATH = 'PLAYER_DEATH',
  MOUSE_CLICK = 'MOUSE_CLICK',
  KEY_PRESS = 'KEY_PRESS',
}

export interface Position {
  x: number;
  y: number;
  z: number;
}

export interface GameEvent {
  type: EventType;
  timestamp: number;
  playerId: string;
  data: Record<string, any>;
}

export interface Checkpoint {
  index: number;
  events: GameEvent[];
  hash: string;
  previousHash: string;
  timestamp: number;
  sessionId: string;
}

export interface ChainState {
  sessionId: string;
  currentHash: string;
  eventCount: number;
  checkpointIndex: number;
  startTime: number;
  pendingEvents: GameEvent[];
}

export interface TelemetryData {
  timestamp: number;
  mouseX?: number;
  mouseY?: number;
  mouseButton?: 'left' | 'right' | 'middle';
  key?: string;
  position?: Position;
  action?: string;
}