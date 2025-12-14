import { TelemetryData, GameEvent, EventType } from '../chain/types';

export class EventBuilder {
  private playerId: string;
  private lastPosition: { x: number; y: number; z: number } | null = null;
  private movementThreshold: number = 5;

  constructor(playerId: string) {
    this.playerId = playerId;
  }

  public telemetryToEvent(telemetry: TelemetryData): GameEvent | null {
    if (telemetry.mouseButton === 'left') {
      return this.createShootEvent(telemetry);
    }

    if (telemetry.position) {
      return this.createMoveEvent(telemetry);
    }

    if (telemetry.key) {
      return this.createKeyEvent(telemetry);
    }

    if (telemetry.healthChange) {
      return this.createHealthChangeEvent(telemetry);
    }

    if (telemetry.action) {
      return this.createActionEvent(telemetry);
    }

    return null;
  }

  private createHealthChangeEvent(telemetry: TelemetryData): GameEvent {
    return {
      type: EventType.HEALTH_CHANGE,
      timestamp: telemetry.timestamp,
      playerId: this.playerId,
      data: {
        oldHealth: telemetry.healthChange!.oldHealth,
        newHealth: telemetry.healthChange!.newHealth,
        reason: telemetry.healthChange!.reason,
      },
    };
  }

  private createShootEvent(telemetry: TelemetryData): GameEvent {
    return {
      type: EventType.PLAYER_SHOOT,
      timestamp: telemetry.timestamp,
      playerId: this.playerId,
      data: {
        aimX: telemetry.mouseX,
        aimY: telemetry.mouseY,
      },
    };
  }

  private createMoveEvent(telemetry: TelemetryData): GameEvent | null {
    if (!telemetry.position) return null;

    const newPos = telemetry.position;

    if (this.lastPosition) {
      const distance = Math.sqrt(
        Math.pow(newPos.x - this.lastPosition.x, 2) +
        Math.pow(newPos.y - this.lastPosition.y, 2) +
        Math.pow(newPos.z - this.lastPosition.z, 2)
      );

      if (distance < this.movementThreshold) {
        return null;
      }
    }

    this.lastPosition = { ...newPos };

    return {
      type: EventType.PLAYER_MOVE,
      timestamp: telemetry.timestamp,
      playerId: this.playerId,
      data: {
        position: newPos,
      },
    };
  }

  private createKeyEvent(telemetry: TelemetryData): GameEvent {
    return {
      type: EventType.KEY_PRESS,
      timestamp: telemetry.timestamp,
      playerId: this.playerId,
      data: {
        key: telemetry.key,
      },
    };
  }

  private createActionEvent(telemetry: TelemetryData): GameEvent {
    if (telemetry.action === 'player_death') {
      return {
        type: EventType.PLAYER_DEATH,
        timestamp: telemetry.timestamp,
        playerId: this.playerId,
        data: {
          position: telemetry.position,
        },
      };
    }

    if (telemetry.action === 'player_hit') {
      return {
        type: EventType.PLAYER_HIT,
        timestamp: telemetry.timestamp,
        playerId: this.playerId,
        data: {
          position: telemetry.position,
        },
      };
    }

    if (telemetry.action === 'player_reload') {
      return {
        type: EventType.PLAYER_RELOAD,
        timestamp: telemetry.timestamp,
        playerId: this.playerId,
        data: {},
      };
    }

    return {
      type: EventType.MOUSE_CLICK,
      timestamp: telemetry.timestamp,
      playerId: this.playerId,
      data: {
        action: telemetry.action,
      },
    };
  }

  public setMovementThreshold(threshold: number): void {
    this.movementThreshold = threshold;
  }
}