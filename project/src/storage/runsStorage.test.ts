import {
  loadRuns,
  saveRuns,
  saveRun,
  deleteRun,
  loadRun,
  clearAllRuns,
} from './runsStorage';
import type { Run } from '../types';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function makeRun(overrides: Partial<Run> = {}): Run {
  return {
    id: 'run-1',
    startedAt: '2024-01-01T10:00:00.000Z',
    completedAt: null,
    totalTimeMs: 0,
    splits: [],
    notes: '',
    ...overrides,
  };
}

// ---------------------------------------------------------------------------
// localStorage mock
// ---------------------------------------------------------------------------

const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: jest.fn((key: string) => store[key] ?? null),
    setItem: jest.fn((key: string, value: string) => {
      store[key] = value;
    }),
    removeItem: jest.fn((key: string) => {
      delete store[key];
    }),
    clear: () => {
      store = {};
    },
  };
})();

Object.defineProperty(global, 'localStorage', {
  value: localStorageMock,
  writable: true,
});

const STORAGE_KEY = 'running_tracker_runs';

beforeEach(() => {
  localStorageMock.clear();
  jest.clearAllMocks();
});

// ---------------------------------------------------------------------------
// loadRuns
// ---------------------------------------------------------------------------

describe('loadRuns', () => {
  it('returns [] when localStorage is empty', () => {
    expect(loadRuns()).toEqual([]);
  });

  it('returns parsed array when data exists', () => {
    const runs = [makeRun({ id: 'run-1' }), makeRun({ id: 'run-2' })];
    localStorageMock.setItem(STORAGE_KEY, JSON.stringify(runs));
    expect(loadRuns()).toEqual(runs);
  });

  it('returns [] and warns on JSON parse error', () => {
    const warnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});
    localStorageMock.setItem(STORAGE_KEY, 'not-valid-json{{{');
    const result = loadRuns();
    expect(result).toEqual([]);
    expect(warnSpy).toHaveBeenCalled();
    warnSpy.mockRestore();
  });
});

// ---------------------------------------------------------------------------
// saveRuns
// ---------------------------------------------------------------------------

describe('saveRuns', () => {
  it('calls localStorage.setItem with the correct key and JSON value', () => {
    const runs = [makeRun()];
    saveRuns(runs);
    expect(localStorageMock.setItem).toHaveBeenCalledWith(
      STORAGE_KEY,
      JSON.stringify(runs),
    );
  });

  it('warns and does not throw when setItem throws', () => {
    const warnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});
    localStorageMock.setItem.mockImplementationOnce(() => {
      throw new Error('QuotaExceededError');
    });
    expect(() => saveRuns([makeRun()])).not.toThrow();
    expect(warnSpy).toHaveBeenCalled();
    warnSpy.mockRestore();
  });
});

// ---------------------------------------------------------------------------
// saveRun
// ---------------------------------------------------------------------------

describe('saveRun', () => {
  it('appends a new run if its id is not found', () => {
    const existing = makeRun({ id: 'existing' });
    saveRuns([existing]);

    const newRun = makeRun({ id: 'new-run' });
    saveRun(newRun);

    expect(loadRuns()).toEqual([existing, newRun]);
  });

  it('replaces an existing run when id matches', () => {
    const original = makeRun({ id: 'run-1', totalTimeMs: 0 });
    saveRuns([original]);

    const updated = makeRun({ id: 'run-1', totalTimeMs: 5000 });
    saveRun(updated);

    const runs = loadRuns();
    expect(runs).toHaveLength(1);
    expect(runs[0].totalTimeMs).toBe(5000);
  });
});

// ---------------------------------------------------------------------------
// deleteRun
// ---------------------------------------------------------------------------

describe('deleteRun', () => {
  it('removes the run with the matching id', () => {
    const a = makeRun({ id: 'run-a' });
    const b = makeRun({ id: 'run-b' });
    saveRuns([a, b]);

    deleteRun('run-a');

    const runs = loadRuns();
    expect(runs).toHaveLength(1);
    expect(runs[0].id).toBe('run-b');
  });

  it('leaves other runs intact when id is not found', () => {
    const a = makeRun({ id: 'run-a' });
    saveRuns([a]);

    deleteRun('does-not-exist');

    expect(loadRuns()).toEqual([a]);
  });
});

// ---------------------------------------------------------------------------
// loadRun
// ---------------------------------------------------------------------------

describe('loadRun', () => {
  it('returns the matching run by id', () => {
    const run = makeRun({ id: 'target' });
    saveRuns([run]);
    expect(loadRun('target')).toEqual(run);
  });

  it('returns null when no run matches the id', () => {
    saveRuns([makeRun({ id: 'other' })]);
    expect(loadRun('missing')).toBeNull();
  });
});

// ---------------------------------------------------------------------------
// clearAllRuns
// ---------------------------------------------------------------------------

describe('clearAllRuns', () => {
  it('calls localStorage.removeItem with the correct key', () => {
    saveRuns([makeRun()]);
    clearAllRuns();
    expect(localStorageMock.removeItem).toHaveBeenCalledWith(STORAGE_KEY);
  });

  it('results in an empty run list after clearing', () => {
    saveRuns([makeRun()]);
    clearAllRuns();
    expect(loadRuns()).toEqual([]);
  });
});
