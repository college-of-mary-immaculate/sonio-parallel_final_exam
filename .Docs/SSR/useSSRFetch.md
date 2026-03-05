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