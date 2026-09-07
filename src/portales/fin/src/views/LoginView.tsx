import React, { useState } from 'react';
import { Lock, Mail, AlertCircle, LogIn } from 'lucide-react';
import { signInAndAuthorize, AuthorizedProfile } from '../infrastructure/supabase/SupabaseAuthClient';

interface LoginViewProps {
  onAuthenticated: (profile: AuthorizedProfile) => void;
}

export const LoginView: React.FC<LoginViewProps> = ({ onAuthenticated }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;
    setIsSubmitting(true);
    setError(null);

    try {
      const res = await signInAndAuthorize(email.trim(), password);
      if (res.success && res.profile) {
        onAuthenticated(res.profile);
      } else {
        setError(res.error || 'No se pudo iniciar sesión.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-black p-4">
      <div className="w-full max-w-sm bg-zinc-900 border border-zinc-800 rounded-[2rem] p-8 shadow-2xl space-y-6">
        <div className="text-center space-y-1.5">
          <div className="w-12 h-12 mx-auto rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center">
            <Lock className="w-5 h-5 text-indigo-400" />
          </div>
          <h1 className="text-lg font-semibold text-white">FIN — El Sistema Punta Cana</h1>
          <p className="text-xs text-zinc-500">Acceso restringido a personal de Finanzas (admin / finanzas)</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="login-email" className="text-xs font-semibold text-zinc-400 block mb-1.5">
              Correo institucional
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-zinc-500 absolute left-3.5 top-3" />
              <input
                id="login-email"
                type="email"
                required
                autoComplete="username"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-zinc-950/80 border border-zinc-800 rounded-xl text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-indigo-500"
                placeholder="cajero@elsistema-pc.org"
              />
            </div>
          </div>

          <div>
            <label htmlFor="login-password" className="text-xs font-semibold text-zinc-400 block mb-1.5">
              Contraseña
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-zinc-500 absolute left-3.5 top-3" />
              <input
                id="login-password"
                type="password"
                required
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-zinc-950/80 border border-zinc-800 rounded-xl text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-indigo-500"
                placeholder="••••••••"
              />
            </div>
          </div>

          {error && (
            <div className="p-3 bg-rose-500/10 border border-rose-500/20 rounded-xl text-xs text-rose-400 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 disabled:bg-indigo-800 disabled:cursor-not-allowed text-white rounded-xl font-semibold text-sm flex items-center justify-center gap-2 transition-all"
          >
            <LogIn className="w-4 h-4" />
            <span>{isSubmitting ? 'Verificando…' : 'Iniciar sesión'}</span>
          </button>
        </form>
      </div>
    </div>
  );
};
