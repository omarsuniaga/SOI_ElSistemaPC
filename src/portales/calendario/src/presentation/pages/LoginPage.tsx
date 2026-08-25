import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';

function AuthShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-zinc-950 flex items-center justify-center p-4">
      <div className="w-full max-w-sm rounded-xl border border-zinc-800 bg-zinc-900/50 p-6">
        {children}
      </div>
    </div>
  );
}

function StatusMessage({ title, message }: { title: string; message: string }) {
  const { signOut } = useAuth();
  return (
    <div>
      <h1 className="text-lg font-semibold text-zinc-100 mb-2">{title}</h1>
      <p className="text-sm text-zinc-400 mb-6">{message}</p>
      <button
        onClick={() => signOut()}
        className="w-full rounded-md border border-zinc-700 text-zinc-200 py-2 text-sm hover:bg-zinc-800 transition-colors"
      >
        Volver al login
      </button>
    </div>
  );
}

export function LoginPage() {
  const { status, errorMessage, signIn } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setLocalError(null);
    const result = await signIn(email, password);
    setSubmitting(false);
    if (!result.success && result.error) {
      setLocalError(result.error);
    }
  };

  if (status === 'pending_approval') {
    return (
      <AuthShell>
        <StatusMessage
          title="Cuenta pendiente de aprobación"
          message="Tu cuenta todavía no fue aprobada por un administrador. Probá de nuevo más tarde."
        />
      </AuthShell>
    );
  }

  if (status === 'rejected') {
    return (
      <AuthShell>
        <StatusMessage
          title="Acceso rechazado"
          message="Esta cuenta no tiene acceso habilitado. Contactá a Dirección."
        />
      </AuthShell>
    );
  }

  return (
    <AuthShell>
      <h1 className="text-xl font-semibold text-zinc-100 mb-1">Calendario Institucional</h1>
      <p className="text-sm text-zinc-400 mb-6">Iniciá sesión con tu cuenta de El Sistema Punta Cana.</p>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-medium text-zinc-400 mb-1" htmlFor="email">
            Correo
          </label>
          <input
            id="email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-md bg-zinc-900 border border-zinc-800 px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:ring-2 focus:ring-amber-500"
            autoComplete="email"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-zinc-400 mb-1" htmlFor="password">
            Contraseña
          </label>
          <input
            id="password"
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded-md bg-zinc-900 border border-zinc-800 px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:ring-2 focus:ring-amber-500"
            autoComplete="current-password"
          />
        </div>
        {(localError || errorMessage) && (
          <p className="text-sm text-red-400">{localError || errorMessage}</p>
        )}
        <button
          type="submit"
          disabled={submitting}
          className="w-full rounded-md bg-amber-500 text-zinc-950 font-medium py-2 text-sm hover:bg-amber-400 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {submitting ? 'Ingresando...' : 'Ingresar'}
        </button>
      </form>
      <p className="mt-6 text-xs text-zinc-500">
        Misma cuenta que usás en el portal de Administración o el portal de Maestros.
      </p>
    </AuthShell>
  );
}
