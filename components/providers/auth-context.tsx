'use client';

import { createContext, useContext, useMemo, useState } from 'react';
import type { SafeUser } from '@/types';

type AuthContextValue = {
  user: SafeUser | null;
  setUser: (user: SafeUser | null) => void;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

type AuthProviderProps = {
  initialUser: SafeUser | null;
  children: React.ReactNode;
};

export function AuthProvider({ initialUser, children }: AuthProviderProps) {
  const [user, setUser] = useState<SafeUser | null>(initialUser);
  const value = useMemo(() => ({ user, setUser }), [user]);

  return (
    <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth deve ser usado dentro de AuthProvider');
  }
  return context;
}
