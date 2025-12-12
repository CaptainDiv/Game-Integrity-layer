import { TelemetryData, Position } from '../chain/types';

export class TelemetryCollector {
  private sessionStartTime: number;
  private listeners: ((data: TelemetryData) => void)[] = [];
  
  constructor() {
    this.sessionStartTime = Date.now();
  }

  private getRelativeTimestamp(): number {
    return Date.now() - this.sessionStartTime;
  }

  public onTelemetry(listener: (data: TelemetryData) => void): void {
    this.listeners.push(listener);
  }

  private emit(data: TelemetryData): void {
    this.listeners.forEach(listener => listener(data));
  }

  public captureMouseMove(x: number, y: number): void {
    this.emit({
      timestamp: this.getRelativeTimestamp(),
      mouseX: x,
      mouseY: y,
    });
  }

  public captureMouseClick(x: number, y: number, button: 'left' | 'right' | 'middle'): void {
    this.emit({
      timestamp: this.getRelativeTimestamp(),
      mouseX: x,
      mouseY: y,
      mouseButton: button,
    });
  }

  public captureKeyPress(key: string): void {
    this.emit({
      timestamp: this.getRelativeTimestamp(),
      key,
    });
  }

  public capturePosition(position: Position): void {
    this.emit({
      timestamp: this.getRelativeTimestamp(),
      position,
    });
  }

  public captureAction(action: string, position?: Position): void {
    this.emit({
      timestamp: this.getRelativeTimestamp(),
      action,
      position,
    });
  }

  public captureReload(): void {
    this.emit({
      timestamp: this.getRelativeTimestamp(),
      action: 'player_reload',
    });
  }

  public resetSession(): void {
    this.sessionStartTime = Date.now();
  }
}