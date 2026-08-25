import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import type { Session } from '@supabase/supabase-js';
import { supabase } from '../../infrastructure/supabase/supabaseClient';

export interface UserProfile {
  id: string;
  email: string;
  nombreCompleto: string | null;
  rol: string;
  estado: string;
}

export type AuthStatus = 'loading' | 'signed_out' | 'pending_approval' | 'rejected' | 'authenticated';

interface SignInResult {
  success: boolean;
  error?: string;
}

interface AuthContextValue {
  status: AuthStatus;
  session: Session | null;
  profile: UserProfile | null;
  errorMessage: string | null;
  signIn: (email: string, password: string) => Promise<SignInResult>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

async function fetchProfile(userId: string): Promise<UserProfile | null> {
  if (!supabase) return null;
  const { data, error } = await supabase
    .from('profiles')
    .select('id, email, nombre_completo, rol, estado')
    .eq('id', userId)
    .maybeSingle();

  if (error || !data) return null;

  return {
    id: data.id,
    email: data.email,
    nombreCompleto: data.nombre_completo,
    rol: data.rol,
    estado: data.estado,
  };
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [status, setStatus] = useState<AuthStatus>('loading');
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const resolveSession = useCallback(async (nextSession: Session | null) => {
    if (!nextSession) {
      setSession(null);
      setProfile(null);
      setStatus('signed_out');
      return;
    }

    const userProfile = await fetchProfile(nextSession.user.id);

    if (!userProfile) {
      // Sesión válida en Supabase pero sin fila en `profiles`: no autorizado para este portal.
      setSession(nextSession);
      setProfile(null);
      setStatus('signed_out');
      return;
    }

    setSession(nextSession);
    setProfile(userProfile);

    if (userProfile.estado === 'pendiente') {
      setStatus('pending_approval');
    } else if (userProfile.estado === 'rechazado') {
      setStatus('rejected');
    } else {
      // Nota: a diferencia del portal Admin (exclusivo de rol 'admin'), Calendario no filtra
      // por rol — está pensado para coordinadores de cualquier departamento (DIR/ACM/ADM/FIN/
      // LOG/COM/TECNICO/LUT). Solo se exige `estado === 'activo'` (no pendiente, no rechazado).
      setStatus('authenticated');
    }
  }, []);

  useEffect(() => {
    if (!supabase) {
      setStatus('signed_out');
      setErrorMessage('Supabase no está configurado (faltan VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY).');
      return;
    }

    supabase.auth.getSession().then(({ data }) => {
      resolveSession(data.session);
    });

    const { data: listener } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      resolveSession(nextSession);
    });

    return () => {
      listener.subscription.unsubscribe();
    };
  }, [resolveSession]);

  const signIn = useCallback(
    async (email: string, password: string): Promise<SignInResult> => {
      if (!supabase) {
        return { success: false, error: 'Supabase no está configurado.' };
      }
      setErrorMessage(null);
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        setErrorMessage(error.message);
        return { success: false, error: error.message };
      }
      await resolveSession(data.session);
      return { success: true };
    },
    [resolveSession]
  );

  const signOut = useCallback(async () => {
    if (!supabase) return;
    await supabase.auth.signOut();
    setSession(null);
    setProfile(null);
    setStatus('signed_out');
  }, []);

  return (
    <AuthContext.Provider value={{ status, session, profile, errorMessage, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return ctx;
}
