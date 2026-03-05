import { createContext, useContext, useEffect, useState } from "react";
import { loginApi, getMeApi, logoutApi } from "../apis/authApi";

const AuthContext = createContext();
const isBrowser = typeof window !== "undefined";

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);    // always start null — cookie check happens in useEffect
  const [loading, setLoading] = useState(isBrowser); // false on server → renders content; true on browser → waits for getMeApi()

  const applyTheme = (role) => {
    if (!isBrowser) return;
    document.body.classList.remove("user-theme", "admin-theme");
    if (role === "admin") document.body.classList.add("admin-theme");
    else if (role === "voter") document.body.classList.add("user-theme");
  };

  // On mount: ask the server "who am I?" using the cookie
  // If the cookie is valid, server returns the user — session restored
  // If not, user stays null — logged out
  useEffect(() => {
    if (!isBrowser) return;

    getMeApi()
      .then((res) => {
        setUser(res.data.user);
        applyTheme(res.data.user.role);
      })
      .catch(() => {
        setUser(null);   // cookie missing or expired — that's fine
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  const login = async (email, password) => {
    const response = await loginApi({ email, password });
    const { user } = response.data;    // server sets cookie, we just get user back
    setUser(user);
    applyTheme(user.role);
  };

  const logout = async () => {
    try {
      await logoutApi();               // server clears the cookie
    } catch {
      // even if the request fails, clear client state
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