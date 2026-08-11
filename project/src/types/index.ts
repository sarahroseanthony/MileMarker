/**
 * Represents a single split recorded during a run.
 */
export interface Split {
  /** Unique identifier (UUID v4 format) */
  id: string;
  /** 1-based lap/split index */
  lapNumber: number;
  /** Elapsed milliseconds for this split alone */
  splitTimeMs: number;
  /** Cumulative elapsed milliseconds at split capture */
  totalTimeMs: number;
  /** ISO 8601 string of when the split was recorded */
  timestamp: string;
}

/**
 * Represents a complete or in-progress running session.
 */
export interface Run {
  /** Unique identifier (UUID v4) */
  id: string;
  /** ISO 8601 string of when the run was started */
  startedAt: string;
  /** ISO 8601 string when finished, null if in progress */
  completedAt: string | null;
  /** Total elapsed milliseconds */
  totalTimeMs: number;
  /** Ordered array of recorded splits */
  splits: Split[];
  /** Optional user notes (default empty string) */
  notes: string;
}

/**
 * Represents the status of a run.
 */
export type RunStatus = 'active' | 'completed';

/**
 * Represents the current state of the timer.
 */
export interface TimerState {
  /** Current elapsed milliseconds */
  elapsedMs: number;
  /** Whether the timer is actively ticking */
  isRunning: boolean;
}
