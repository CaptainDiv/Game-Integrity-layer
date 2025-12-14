import { Checkpoint, GameEvent, EventType } from '../chain/types';

export interface SessionStats {
  totalEvents: number;
  eventsByType: Record<string, number>;
  totalCheckpoints: number;
  averageEventsPerCheckpoint: number;
  sessionDuration: number;
  eventsPerSecond: number;
  firstEventTime: number;
  lastEventTime: number;
}

export class StatsCalculator {
  static calculateStats(checkpoints: Checkpoint[]): SessionStats {
    let totalEvents = 0;
    const eventsByType: Record<string, number> = {};
    let firstTime = Infinity;
    let lastTime = 0;

    for (const checkpoint of checkpoints) {
      totalEvents += checkpoint.events.length;

      for (const event of checkpoint.events) {
        // Count by type
        eventsByType[event.type] = (eventsByType[event.type] || 0) + 1;

        // Track time range
        if (event.timestamp < firstTime) firstTime = event.timestamp;
        if (event.timestamp > lastTime) lastTime = event.timestamp;
      }
    }

    const duration = lastTime - firstTime;
    const eventsPerSecond = duration > 0 ? (totalEvents / duration) * 1000 : 0;

    return {
      totalEvents,
      eventsByType,
      totalCheckpoints: checkpoints.length,
      averageEventsPerCheckpoint: totalEvents / checkpoints.length,
      sessionDuration: duration,
      eventsPerSecond,
      firstEventTime: firstTime,
      lastEventTime: lastTime,
    };
  }

  static printStats(stats: SessionStats): void {
    console.log('\n📈 DETAILED STATISTICS');
    console.log('==========================================');
    console.log(`Total Events:              ${stats.totalEvents}`);
    console.log(`Total Checkpoints:         ${stats.totalCheckpoints}`);
    console.log(`Avg Events/Checkpoint:     ${stats.averageEventsPerCheckpoint.toFixed(2)}`);
    console.log(`Session Duration:          ${stats.sessionDuration}ms`);
    console.log(`Events Per Second:         ${stats.eventsPerSecond.toFixed(2)}`);
    console.log('\n📊 Events By Type:');
    for (const [type, count] of Object.entries(stats.eventsByType)) {
      console.log(`  ${type.padEnd(20)} ${count}`);
    }
    console.log('');
  }
}