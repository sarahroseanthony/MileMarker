'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import type { TimerState } from '../types';

export interface UseTimerReturn extends TimerState {
  start: () => void;
  pause: () => void;
  reset: () => void;
}

/**
 * Custom React hook for high-precision elapsed time tracking.
 *
 * Uses requestAnimationFrame for smooth updates and integrates with the
 * Page Visibility API to correctly handle tab switching — pausing the
 * animation loop when the tab is hidden and resuming when it becomes
 * visible again, without losing accumulated time.
 *
 * @param initialElapsedMs - Starting elapsed milliseconds (default: 0)
 */
export function useTimer(initialElapsedMs: number = 0): UseTimerReturn {
  const [elapsedMs, setElapsedMs] = useState<number>(initialElapsedMs);
  const [isRunning, setIsRunning] = useState<boolean>(false);

  /** performance.now() timestamp when the current running segment began */
  const startTimeRef = useRef<number | null>(null);
  /** Total accumulated milliseconds from all completed segments */
  const accumulatedMs = useRef<number>(initialElapsedMs);
  /** Current requestAnimationFrame ID */
  const rafId = useRef<number | null>(null);
  /** Mirror of isRunning for use inside event handlers / raf callbacks */
  const isRunningRef = useRef<boolean>(false);

  const tick = useCallback(() => {
    if (startTimeRef.current === null) return;
    const currentElapsed = accumulatedMs.current + (performance.now() - startTimeRef.current);
    setElapsedMs(currentElapsed);
    rafId.current = requestAnimationFrame(tick);
  }, []);

  const start = useCallback(() => {
    if (isRunningRef.current) return;
    startTimeRef.current = performance.now();
    isRunningRef.current = true;
    setIsRunning(true);
    rafId.current = requestAnimationFrame(tick);
  }, [tick]);

  const pause = useCallback(() => {
    if (!isRunningRef.current) return;
    if (rafId.current !== null) {
      cancelAnimationFrame(rafId.current);
      rafId.current = null;
    }
    if (startTimeRef.current !== null) {
      accumulatedMs.current += performance.now() - startTimeRef.current;
      startTimeRef.current = null;
    }
    isRunningRef.current = false;
    setIsRunning(false);
  }, []);

  const reset = useCallback(() => {
    if (rafId.current !== null) {
      cancelAnimationFrame(rafId.current);
      rafId.current = null;
    }
    accumulatedMs.current = 0;
    startTimeRef.current = null;
    isRunningRef.current = false;
    setElapsedMs(0);
    setIsRunning(false);
  }, []);

  // Page Visibility API integration
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        // Tab became hidden — stop the raf loop but keep isRunning state
        if (isRunningRef.current) {
          if (rafId.current !== null) {
            cancelAnimationFrame(rafId.current);
            rafId.current = null;
          }
          if (startTimeRef.current !== null) {
            // Accumulate elapsed time from the current segment
            accumulatedMs.current += performance.now() - startTimeRef.current;
            startTimeRef.current = null;
          }
        }
      } else {
        // Tab became visible — restart the raf loop if still running
        if (isRunningRef.current) {
          startTimeRef.current = performance.now();
          rafId.current = requestAnimationFrame(tick);
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      if (rafId.current !== null) {
        cancelAnimationFrame(rafId.current);
      }
    };
  }, [tick]);

  return { elapsedMs, isRunning, start, pause, reset };
}
