"use client";

import {
  authenticate,
  clearSession,
  getSession,
  setSession,
  toSessionUser,
  type SessionUser,
} from "@/data/session";
import { getEmployees } from "@/lib/store";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

interface SessionContextValue {
  user: SessionUser | null;
  loading: boolean;
  login: (username: string, password: string) => string | null;
  logout: () => void;
  refreshUser: () => void;
}

const SessionContext = createContext<SessionContextValue | null>(null);

export function SessionProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<SessionUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setUser(getSession());
    setLoading(false);
  }, []);

  const login = useCallback((username: string, password: string) => {
    const next = authenticate(username, password);
    if (!next) return "Invalid username or password.";
    setSession(next);
    setUser(next);
    return null;
  }, []);

  const logout = useCallback(() => {
    clearSession();
    setUser(null);
  }, []);

  const refreshUser = useCallback(() => {
    const current = getSession();
    if (!current) {
      setUser(null);
      return;
    }
    const employee = getEmployees().find((item) => item.id === current.id);
    if (!employee) {
      clearSession();
      setUser(null);
      return;
    }
    const next = toSessionUser(employee);
    setSession(next);
    setUser(next);
  }, []);

  const value = useMemo(
    () => ({ user, loading, login, logout, refreshUser }),
    [user, loading, login, logout, refreshUser],
  );

  return (
    <SessionContext.Provider value={value}>{children}</SessionContext.Provider>
  );
}

export function useSession() {
  const context = useContext(SessionContext);
  if (!context) {
    throw new Error("useSession must be used within SessionProvider");
  }
  return context;
}
