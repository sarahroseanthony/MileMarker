import type { Run } from '../types';

const STORAGE_KEY = 'running_tracker_runs';

/**
 * Load all runs from localStorage.
 * Returns an empty array if storage is empty or data cannot be parsed.
 */
export function loadRuns(): Run[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as Run[];
  } catch (err) {
    console.warn('[runsStorage] Failed to load runs:', err);
    return [];
  }
}

/**
 * Persist the full array of runs to localStorage.
 * Silently logs a warning if storage quota is exceeded or another error occurs.
 */
export function saveRuns(runs: Run[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(runs));
  } catch (err) {
    console.warn('[runsStorage] Failed to save runs:', err);
  }
}

/**
 * Upsert a single run — replaces it if its id already exists, appends otherwise.
 */
export function saveRun(run: Run): void {
  const runs = loadRuns();
  const index = runs.findIndex((r) => r.id === run.id);
  if (index !== -1) {
    runs[index] = run;
  } else {
    runs.push(run);
  }
  saveRuns(runs);
}

/**
 * Remove the run with the given id from localStorage.
 */
export function deleteRun(runId: string): void {
  const runs = loadRuns();
  const filtered = runs.filter((r) => r.id !== runId);
  saveRuns(filtered);
}

/**
 * Load a single run by id.
 * Returns null if no run with that id exists.
 */
export function loadRun(runId: string): Run | null {
  const runs = loadRuns();
  return runs.find((r) => r.id === runId) ?? null;
}

/**
 * Remove all runs from localStorage.
 */
export function clearAllRuns(): void {
  localStorage.removeItem(STORAGE_KEY);
}
