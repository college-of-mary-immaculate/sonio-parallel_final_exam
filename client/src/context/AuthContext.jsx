import { createContext, useContext, useEffect, useState } from "react";
import { loginApi } from "../apis/authApi";
import { setAuthToken } from "../apis/mainApi";

const AuthContext = createContext();
const isBrowser = typeof window !== "undefined";

// ✅ Inject token immediately at module load — before any component renders
// This ensures API calls on protected pages have auth headers from the start
if (isBrowser) {
  const token = localStorage.getItem("token");
  if (token) setAuthToken(token);
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    // ✅ Initialize user synchronously from localStorage
    if (!isBrowser) return null;
    try {
      const userData = localStorage.getItem("user");
      return userData ? JSON.parse(userData) : null;
    } catch {
      return null;
    }
  });

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isBrowser) return;

    const token = localStorage.getItem("token");
    const userData = localStorage.getItem("user");

    if (token && userData) {
      try {
        const parsedUser = JSON.parse(userData);
        setAuthToken(token);
        setUser(parsedUser);
        applyTheme(parsedUser.role);
      } catch {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        setAuthToken(null);
      }
    }

    setLoading(false);
  }, []);

  const applyTheme = (role) => {
    if (!isBrowser) return;
    document.body.classList.remove("user-theme", "admin-theme");
    if (role === "admin") document.body.classList.add("admin-theme");
    else if (role === "voter") document.body.classList.add("user-theme");
  };

  const login = async (email, password) => {
    const response = await loginApi({ email, password });
    const { token, user } = response.data;
    localStorage.setItem("token", token);
    localStorage.setItem("user", JSON.stringify(user));
    setAuthToken(token);
    setUser(user);
    applyTheme(user.role);
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setAuthToken(null);
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