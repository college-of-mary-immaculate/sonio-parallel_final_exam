import { createContext, useContext } from "react";

const SSRContext = createContext({});

const isBrowser = typeof window !== "undefined";

export function SSRProvider({ data = {}, children }) {
  const value = isBrowser ? (window.__SSR_DATA__ || {}) : data;

  return (
    <SSRContext.Provider value={value}>
      {children}
    </SSRContext.Provider>
  );
}

export const useSSRData = () => useContext(SSRContext);