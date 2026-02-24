import { createContext, useContext } from "react";

const SSRContext = createContext({});

const isBrowser = typeof window !== "undefined";

export function SSRProvider({ data = {}, children }) {
  // Server: use data passed from entry-server.jsx via renderToString
  // Client: read from window.__SSR_DATA__ injected by ssr.js into <head>
  const value = isBrowser ? (window.__SSR_DATA__ || {}) : data;

  return (
    <SSRContext.Provider value={value}>
      {children}
    </SSRContext.Provider>
  );
}

export const useSSRData = () => useContext(SSRContext);