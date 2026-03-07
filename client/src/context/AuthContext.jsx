import { createContext, useContext, useEffect, useState } from "react";
import { loginApi, getMeApi, logoutApi } from "../apis/authApi";
import { useSSRData } from "./SSRContext";

const AuthContext = createContext();
const isBrowser = typeof window !== "undefined";

export const AuthProvider = ({ children }) => {
  const ssrData = useSSRData();

  // ── Seed from SSR data so server + client render identically ──────────────
  // Server:  ssrData.user = verified user from cookie → renders correct UI
  // Client:  window.__SSR_DATA__.user = same value → no hydration mismatch
  // If no cookie: ssrData.user = null → renders login/public UI on both sides
  const [user, setUser]       = useState(ssrData?.user ?? null);
  const [loading, setLoading] = useState(isBrowser && !ssrData?.user);
  // loading=false on server (no useEffect)
  // loading=false on client if SSR gave us a user (skip getMeApi)
  // loading=true  on client if no SSR user (need to verify cookie)

  const applyTheme = (role) => {
    if (!isBrowser) return;
    document.body.classList.remove("user-theme", "admin-theme");
    if (role === "admin") document.body.classList.add("admin-theme");
    else if (role === "voter") document.body.classList.add("user-theme");
  };

  useEffect(() => {
    // SSR already gave us a user — apply theme and skip the /me fetch
    if (ssrData?.user) {
      applyTheme(ssrData.user.role);
      return;
    }

    // No SSR user — check cookie (e.g. direct URL navigation, page refresh)
    getMeApi()
      .then((res) => {
        setUser(res.data.user);
        applyTheme(res.data.user.role);
      })
      .catch(() => {
        setUser(null);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  const login = async (email, password) => {
      const response = await loginApi({ email, password });
      const { user } = response.data;   // user is now { id, role }
      setUser(user);
      applyTheme(user.role);
  };

  const logout = async () => {
    try {
      await logoutApi();
    } catch {
      // clear client state even if request fails
    }
    setUser(null);
    if (isBrowser) document.body.classList.remove("user-theme", "admin-theme");
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);