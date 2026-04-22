import { createContext, useCallback, useContext, useEffect, useState } from "react";
import client from "../api/client.js";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [username, setUsername] = useState(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    try {
      const { data } = await client.get("/user/isLoggedIn");
      if (data && data.username) {
        setUsername(data.username);
      } else {
        setUsername(null);
      }
    } catch {
      setUsername(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const login = useCallback(
    async (u, p) => {
      await client.post("/user/login", { username: u, password: p });
      await refresh();
    },
    [refresh],
  );

  const register = useCallback(
    async (u, p) => {
      await client.post("/user/register", { username: u, password: p });
      await refresh();
    },
    [refresh],
  );

  const logout = useCallback(async () => {
    await client.post("/user/logout");
    setUsername(null);
  }, []);

  return (
    <AuthContext.Provider
      value={{ username, loading, login, register, logout, refresh }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
