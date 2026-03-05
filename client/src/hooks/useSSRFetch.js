// hooks/useSSRFetch.js
// ─────────────────────────────────────────────────────────────────────────────
// Handles the SSR → client handoff pattern automatically.
//
// On the SERVER:  renders with `ssrData[key]` already populated → full HTML
// On the CLIENT:  if SSR data exists, skips the fetch entirely (no double load)
//                 if SSR data is missing, fetches normally
//
// Usage:
//   const { data, loading, error, reload } = useSSRFetch('elections', fetchFn)
//
// Where `fetchFn` is an async function that returns the data, e.g.:
//   () => electionApi.getPublic()
// ─────────────────────────────────────────────────────────────────────────────

import { useState, useEffect, useCallback } from "react";
import { useSSRData } from "../context/SSRContext";

/**
 * @param {string}   ssrKey      - Key to look up in window.__SSR_DATA__ / SSRContext
 * @param {Function} fetchFn     - async () => data   called only when SSR data is absent
 * @param {*}        [fallback]  - Initial value before data arrives (default: null)
 */
export function useSSRFetch(ssrKey, fetchFn, fallback = null) {
  const ssrData   = useSSRData();
  const ssrValue  = ssrData[ssrKey] ?? null;   // what the server gave us

  const [data,    setData]    = useState(ssrValue ?? fallback);
  const [loading, setLoading] = useState(ssrValue === null);   // no loading if SSR gave data
  const [error,   setError]   = useState(null);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await fetchFn();
      setData(result);
    } catch (err) {
      console.error(`[useSSRFetch] key="${ssrKey}" error:`, err);
      setError(err?.response?.data?.error || err?.message || "Failed to load data");
    } finally {
      setLoading(false);
    }
  }, [fetchFn, ssrKey]);

  useEffect(() => {
    // ✅ Skip client fetch entirely if the server already gave us this data
    if (ssrValue !== null) return;
    load();
  }, []);   // intentionally runs once on mount only

  return {
    data,
    loading,
    error,
    reload: load,   // call this to manually refresh
    setData,        // escape hatch for optimistic updates
  };
}