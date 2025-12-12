import { createContext, useContext, useEffect, useState } from "react";
import { authClient } from "./auth-client";


type userType = typeof authClient.$Infer.Session.user

export type AuthContextType = {
  isAuthenticated: boolean,
  isLoading: boolean,
  user: userType | null,
  refreshAuth: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<userType | null>(null)
  const [isLoading, setisLoading] = useState<boolean>(true);

  const checkAuth = async () => {
    try {
      const { data, error } = await authClient.getSession();
      setUser(data?.user || null)
    } catch (error) {
      setUser(null)
    }
    finally {
      setisLoading(false)
    }
  }

  useEffect(() => {
    checkAuth()
  }, [])

  const refreshAuth = async () => {
    await checkAuth()
  }

  const isAuthenticated = !!user

  return <AuthContext.Provider value={{ isAuthenticated, isLoading, user, refreshAuth }} >
    {children}
  </AuthContext.Provider>
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) throw new Error("useAuth must be used within AuthProvider")
  return context
}
// hook to use it easily 
