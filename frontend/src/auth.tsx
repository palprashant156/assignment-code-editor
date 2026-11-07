import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import { api } from './api';

export type User = { id: string; name: string; email: string; role: 'student' | 'admin' };
type AuthContextValue = { user: User | null; loading: boolean; refresh: () => Promise<void>; login: (email: string, password: string) => Promise<User>; register: (name: string, email: string, password: string) => Promise<User>; logout: () => Promise<void> };
const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null); const [loading, setLoading] = useState(true);
  const refresh = async () => { try { const { data } = await api.get('/api/auth/me'); setUser(data.user); } catch { setUser(null); } finally { setLoading(false); } };
  useEffect(() => { void refresh(); const onUnauthorized = () => setUser(null); window.addEventListener('codearena:unauthorized', onUnauthorized); return () => window.removeEventListener('codearena:unauthorized', onUnauthorized); }, []);
  const value = useMemo<AuthContextValue>(() => ({ user, loading, refresh,
    login: async (email, password) => { const { data } = await api.post('/api/auth/login', { email, password }); setUser(data.user); return data.user; },
    register: async (name, email, password) => { const { data } = await api.post('/api/auth/register', { name, email, password }); setUser(data.user); return data.user; },
    logout: async () => { await api.post('/api/auth/logout'); setUser(null); },
  }), [user, loading]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
export function useAuth() { const value = useContext(AuthContext); if (!value) throw new Error('useAuth must be used inside AuthProvider'); return value; }
