export interface GameConfig {
  checkpointInterval: number;
  maxEventsPerCheckpoint: number;
  movementThreshold: number;
  maxPlayerSpeed: number;
}

export const DEFAULT_CONFIG: GameConfig = {
  checkpointInterval: 150,      // ms
  maxEventsPerCheckpoint: 50,   // events
  movementThreshold: 5,         // units
  maxPlayerSpeed: 0.5,          // units/ms
};

export class ConfigManager {
  private config: GameConfig;

  constructor(customConfig?: Partial<GameConfig>) {
    this.config = { ...DEFAULT_CONFIG, ...customConfig };
  }

  get checkpointInterval(): number {
    return this.config.checkpointInterval;
  }

  get maxEventsPerCheckpoint(): number {
    return this.config.maxEventsPerCheckpoint;
  }

  get movementThreshold(): number {
    return this.config.movementThreshold;
  }

  get maxPlayerSpeed(): number {
    return this.config.maxPlayerSpeed;
  }

  updateConfig(newConfig: Partial<GameConfig>): void {
    this.config = { ...this.config, ...newConfig };
  }
}