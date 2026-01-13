import { createContext, useContext, useEffect, useState } from "react";
import { authClient } from "./auth-client";

type userType = typeof authClient.$Infer.Session.user;
type sessionType = typeof authClient.$Infer.Session.session;

export type AuthContextType = {
  isAuthenticated: boolean;
  isLoading: boolean;
  user: userType | null;
  session: sessionType | null;
  refreshAuth: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<userType | null>(null);
  const [session, setSession] = useState<sessionType | null>(null);
  const [isLoading, setisLoading] = useState<boolean>(true);

  const checkAuth = async () => {
    try {
      const { data } = await authClient.getSession();
      setUser(data?.user || null);
      setSession(data?.session || null);
    } catch {
      setUser(null);
      setSession(null);
    } finally {
      setisLoading(false);
    }
  };

  useEffect(() => {
    checkAuth();
  }, []);

  const refreshAuth = async () => {
    await checkAuth();
  };

  const isAuthenticated = !!user;

  return (
    <AuthContext.Provider
      value={{ isAuthenticated, isLoading, user, session, refreshAuth }}
    >
      {children}
    </AuthContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
};
// hook to use it easily
