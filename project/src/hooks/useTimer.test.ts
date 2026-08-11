/**
 * Unit tests for the useTimer hook.
 *
 * requestAnimationFrame and cancelAnimationFrame are replaced with synchronous
 * Jest mocks so tests don't need real browser animation timing.
 */
import { renderHook, act } from '@testing-library/react';
import { useTimer } from './useTimer';

// ---------------------------------------------------------------------------
// Mock requestAnimationFrame / cancelAnimationFrame
// ---------------------------------------------------------------------------

let rafCallbacks: Map<number, FrameRequestCallback> = new Map();
let rafIdCounter = 0;

beforeAll(() => {
  global.requestAnimationFrame = jest.fn((cb: FrameRequestCallback) => {
    const id = ++rafIdCounter;
    rafCallbacks.set(id, cb);
    return id;
  });

  global.cancelAnimationFrame = jest.fn((id: number) => {
    rafCallbacks.delete(id);
  });
});

beforeEach(() => {
  rafCallbacks = new Map();
  rafIdCounter = 0;
  jest.clearAllMocks();
});

/**
 * Flush one pending rAF frame. Calls the callback with `performance.now()`.
 */
function flushRaf() {
  const entries = Array.from(rafCallbacks.entries());
  if (entries.length === 0) return;
  const [id, cb] = entries[0];
  rafCallbacks.delete(id);
  cb(performance.now());
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('useTimer', () => {
  it('has correct initial state with default initialElapsedMs', () => {
    const { result } = renderHook(() => useTimer());
    expect(result.current.elapsedMs).toBe(0);
    expect(result.current.isRunning).toBe(false);
  });

  it('accepts initialElapsedMs and reflects it in initial state', () => {
    const { result } = renderHook(() => useTimer(5000));
    expect(result.current.elapsedMs).toBe(5000);
    expect(result.current.isRunning).toBe(false);
  });

  it('sets isRunning to true after start()', () => {
    const { result } = renderHook(() => useTimer());

    act(() => {
      result.current.start();
    });

    expect(result.current.isRunning).toBe(true);
  });

  it('sets isRunning to false after pause()', () => {
    const { result } = renderHook(() => useTimer());

    act(() => {
      result.current.start();
    });
    expect(result.current.isRunning).toBe(true);

    act(() => {
      result.current.pause();
    });
    expect(result.current.isRunning).toBe(false);
  });

  it('resets elapsedMs to 0 and isRunning to false after reset()', () => {
    const { result } = renderHook(() => useTimer());

    act(() => {
      result.current.start();
      flushRaf(); // advance one frame so elapsedMs can increase
    });

    act(() => {
      result.current.reset();
    });

    expect(result.current.elapsedMs).toBe(0);
    expect(result.current.isRunning).toBe(false);
  });

  it('does not crash when pause() is called before start()', () => {
    const { result } = renderHook(() => useTimer());
    expect(() => {
      act(() => {
        result.current.pause();
      });
    }).not.toThrow();
    expect(result.current.isRunning).toBe(false);
  });

  it('does not start multiple rAF loops when start() is called twice', () => {
    const { result } = renderHook(() => useTimer());

    act(() => {
      result.current.start();
      result.current.start(); // second call should be a no-op
    });

    // Only one rAF should have been scheduled
    expect((global.requestAnimationFrame as jest.Mock).mock.calls.length).toBe(1);
  });

  it('cancels rAF on unmount', () => {
    const { result, unmount } = renderHook(() => useTimer());

    act(() => {
      result.current.start();
    });

    unmount();

    expect(global.cancelAnimationFrame as jest.Mock).toHaveBeenCalled();
  });
});
