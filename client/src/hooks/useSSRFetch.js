import { useState, useEffect, useCallback } from "react";
import { useSSRData } from "../context/SSRContext";

/**
 * @param {string}   ssrKey   
 * @param {Function} fetchFn 
 * @param {*}        [fallback] 
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
    // Skip client fetch entirely if the server already gave us this data
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