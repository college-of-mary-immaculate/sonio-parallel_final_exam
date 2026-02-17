import { createContext, useContext, useState, useEffect } from "react";
import { loginApi } from "../apis/authApi";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true); // ✅ added loading

  // Hydrate user from localStorage
  useEffect(() => {
    const token = localStorage.getItem("token");
    const userData = localStorage.getItem("user");

    if (token && userData) {
      const u = JSON.parse(userData);
      setUser(u);
      applyTheme(u.role);
    }

    setLoading(false); // ✅ done loading after check
  }, []);

  const applyTheme = (role) => {
    document.body.classList.remove("user-theme", "admin-theme");
    if (role === "admin") document.body.classList.add("admin-theme");
    else if (role === "voter") document.body.classList.add("user-theme");
  };

  const login = async (email, password) => {
    const response = await loginApi({ email, password });
    const { token, user } = response.data;

    localStorage.setItem("token", token);
    localStorage.setItem("user", JSON.stringify(user));
    setUser(user);

    applyTheme(user.role);
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);

    document.body.classList.remove("user-theme", "admin-theme");
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook
export const useAuth = () => useContext(AuthContext);
