import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import * as api from "./api";

const STORAGE_KEY = "wpcs_auth_v1";

interface AuthContextValue {
  isAuthenticated: boolean;
  email: string | null;
  username: string | null;
  role: 'admin' | 'customer' | null;
  login: (email: string, password: string) => Promise<boolean>;
  customerLogin: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [email, setEmail] = useState<string | null>(null);
  const [username, setUsername] = useState<string | null>(null);
  const [role, setRole] = useState<'admin' | 'customer' | null>(null);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const data = JSON.parse(raw);
        setEmail(data.email || null);
        setUsername(data.username || null);
        setRole(data.role || null);
      }
    } catch {
      // ignore
    }
    setHydrated(true);
  }, []);

  const login = useCallback(async (inputEmail: string, password: string) => {
    const result = await api.login(inputEmail, password);
    
    if (result.success && result.data) {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify({ 
        email: result.data.user.email,
        role: 'admin'
      }));
      setEmail(result.data.user.email);
      setRole('admin');
      return true;
    }
    return false;
  }, []);

  const customerLogin = useCallback(async (inputUsername: string, password: string) => {
    const result = await api.customerLogin(inputUsername, password);
    
    if (result.success && result.data) {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify({ 
        username: result.data.user.username,
        email: result.data.user.email,
        role: 'customer'
      }));
      setUsername(result.data.user.username);
      setEmail(result.data.user.email);
      setRole('customer');
      return true;
    }
    return false;
  }, []);

  const logout = useCallback(() => {
    api.logout();
    window.localStorage.removeItem(STORAGE_KEY);
    setEmail(null);
    setUsername(null);
    setRole(null);
  }, []);

  const value = useMemo(
    () => ({
      isAuthenticated: hydrated && (!!email || !!username) && api.isAuthenticated(),
      email,
      username,
      role,
      login,
      customerLogin,
      logout,
    }),
    [email, username, role, hydrated, login, customerLogin, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
