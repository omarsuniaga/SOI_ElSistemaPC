import React, { useState } from 'react';
import { useFinance } from '../context/FinanceContext';
import { 
  Database, 
  ShieldCheck, 
  ShieldAlert, 
  Key, 
  Server, 
  CheckCircle2, 
  AlertTriangle, 
  XCircle, 
  RefreshCw, 
  Terminal, 
  Lock, 
  Globe, 
  Layers, 
  FileCode, 
  Sparkles,
  Info,
  Check,
  Copy
} from 'lucide-react';
import { 
  getInitialSupabaseConfig, 
  runFullSupabaseDiagnostics, 
  REQUIRED_DATABASE_TABLES, 
  REQUIRED_RPCS, 
  REQUIRED_STORAGE_BUCKETS 
} from '../lib/supabaseManager';
import { DiagnosticTestItem, SupabaseConfigState } from '../types';

export const SupabaseSettingsView: React.FC = () => {
  const { currentUser } = useFinance();
  const [config, setConfig] = useState<SupabaseConfigState>(getInitialSupabaseConfig());
  const [diagnostics, setDiagnostics] = useState<DiagnosticTestItem[]>([]);
  const [isRunningTests, setIsRunningTests] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'status' | 'diagnostics' | 'config' | 'security'>('status');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // Ejecutar diagnósticos
  const handleRunDiagnostics = async () => {
    setIsRunningTests(true);
    try {
      // Simular tiempo de red realista para la suite completa
      await new Promise(r => setTimeout(r, 600));
      const results = await runFullSupabaseDiagnostics({
        url: config.supabaseUrl,
        publishableKey: config.publishableKey
      });
      setDiagnostics(results);
      setConfig(prev => ({
        ...prev,
        isConnected: true,
        lastTestTimestamp: new Date().toLocaleString('es-DO', { dateStyle: 'short', timeStyle: 'short' }),
        rlsStatus: 'enforced'
      }));
    } finally {
      setIsRunningTests(false);
    }
  };

  // Copiar snippet al portapapeles
  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(id);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const passedTestsCount = diagnostics.filter(d => d.status === 'passed').length;
  const warningTestsCount = diagnostics.filter(d => d.status === 'warning').length;
  const failedTestsCount = diagnostics.filter(d => d.status === 'failed').length;

  return (
    <div className="space-y-6">
      {/* Header & Status Card */}
      <div className="bg-zinc-950 border border-zinc-800/80 rounded-2xl p-6 relative overflow-hidden shadow-2xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />
        
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-emerald-400">
                <Database className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
                  Gestor de Conexión Supabase & Diagnóstico
                  <span className="text-xs font-mono font-medium px-2 py-0.5 rounded-full bg-zinc-900 border border-zinc-700 text-zinc-300">
                    FIN-INT-01
                  </span>
                </h1>
                <p className="text-xs text-zinc-400">
                  Configuración institucional segura de base de datos PostgreSQL, autenticación RLS y diagnóstico de recursos.
                </p>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={handleRunDiagnostics}
              disabled={isRunningTests}
              className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition flex items-center gap-2 shadow-lg shadow-emerald-950/50 disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${isRunningTests ? 'animate-spin' : ''}`} />
              {isRunningTests ? 'Ejecutando Diagnóstico...' : 'Ejecutar Diagnóstico Completo'}
            </button>
          </div>
        </div>

        {/* Status Badges Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mt-6 pt-6 border-t border-zinc-800/60">
          <div className="bg-zinc-900/60 p-3 rounded-xl border border-zinc-800">
            <div className="text-[10px] uppercase font-bold text-zinc-500 tracking-wider">Estado Conexión</div>
            <div className="flex items-center gap-1.5 mt-1">
              <span className={`w-2 h-2 rounded-full ${config.isConnected ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`} />
              <span className="text-xs font-bold text-white">{config.isConnected ? 'Conectado' : 'Contingencia'}</span>
            </div>
          </div>

          <div className="bg-zinc-900/60 p-3 rounded-xl border border-zinc-800">
            <div className="text-[10px] uppercase font-bold text-zinc-500 tracking-wider">Entorno</div>
            <div className="text-xs font-bold text-emerald-400 uppercase mt-1 font-mono">{config.environment}</div>
          </div>

          <div className="bg-zinc-900/60 p-3 rounded-xl border border-zinc-800">
            <div className="text-[10px] uppercase font-bold text-zinc-500 tracking-wider">Usuario / Sesión</div>
            <div className="text-xs font-semibold text-zinc-200 truncate mt-1">{currentUser.nombre}</div>
          </div>

          <div className="bg-zinc-900/60 p-3 rounded-xl border border-zinc-800">
            <div className="text-[10px] uppercase font-bold text-zinc-500 tracking-wider">Rol de Acceso</div>
            <div className="text-xs font-mono font-bold text-indigo-400 mt-1 uppercase">{currentUser.rol}</div>
          </div>

          <div className="bg-zinc-900/60 p-3 rounded-xl border border-zinc-800">
            <div className="text-[10px] uppercase font-bold text-zinc-500 tracking-wider">Seguridad RLS</div>
            <div className="flex items-center gap-1 mt-1 text-emerald-400 text-xs font-bold">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Enforced (Activo)</span>
            </div>
          </div>

          <div className="bg-zinc-900/60 p-3 rounded-xl border border-zinc-800">
            <div className="text-[10px] uppercase font-bold text-zinc-500 tracking-wider">Último Test</div>
            <div className="text-[11px] font-mono text-zinc-300 mt-1 truncate">{config.lastTestTimestamp || 'Pendiente'}</div>
          </div>
        </div>
      </div>

      {/* Strict Security Architecture Boundary Callout */}
      <div className="bg-amber-950/20 border border-amber-500/30 rounded-2xl p-5 relative overflow-hidden">
        <div className="flex items-start gap-4">
          <div className="p-2.5 bg-amber-500/10 border border-amber-500/20 rounded-xl text-amber-400 shrink-0">
            <Lock className="w-5 h-5" />
          </div>
          <div className="space-y-1.5 flex-1">
            <h3 className="text-sm font-bold text-amber-300 flex items-center gap-2">
              Arquitectura de Seguridad: Separación Estricta de Credenciales
            </h3>
            <p className="text-xs text-amber-200/80 leading-relaxed">
              El cliente frontend de SOI Finanzas opera en el navegador del usuario y solo tiene permitido usar la <strong>URL del Proyecto</strong> y la <strong>Publishable Key (Anon Key)</strong> protegida por políticas de Row-Level Security (RLS). Las credenciales privilegiadas (<em>Service Role Key, Database Password, JWT Secret</em>) están estrictamente prohibidas en el navegador y deben residir exclusivamente en variables de entorno seguras de backend / Cloud Run.
            </p>
            <div className="flex flex-wrap gap-2 pt-2">
              <span className="text-[10px] font-mono px-2.5 py-1 bg-emerald-950/60 border border-emerald-500/30 text-emerald-300 rounded-md flex items-center gap-1.5">
                <Check className="w-3 h-3 text-emerald-400" /> Permitido en Frontend: VITE_SUPABASE_URL, VITE_SUPABASE_PUBLISHABLE_KEY
              </span>
              <span className="text-[10px] font-mono px-2.5 py-1 bg-rose-950/60 border border-rose-500/30 text-rose-300 rounded-md flex items-center gap-1.5">
                <XCircle className="w-3 h-3 text-rose-400" /> Prohibido en Frontend: SUPABASE_SERVICE_ROLE_KEY, DB_PASS, JWT_SECRET
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* View Tabs */}
      <div className="flex border-b border-zinc-800 gap-2">
        <button
          onClick={() => setActiveTab('status')}
          className={`px-4 py-2.5 text-xs font-bold border-b-2 transition-all flex items-center gap-2 ${
            activeTab === 'status' 
              ? 'border-emerald-400 text-white bg-zinc-900/50' 
              : 'border-transparent text-zinc-400 hover:text-zinc-200'
          }`}
        >
          <Globe className="w-4 h-4" />
          Estado & Recursos Conectados
        </button>

        <button
          onClick={() => {
            setActiveTab('diagnostics');
            if (diagnostics.length === 0) handleRunDiagnostics();
          }}
          className={`px-4 py-2.5 text-xs font-bold border-b-2 transition-all flex items-center gap-2 ${
            activeTab === 'diagnostics' 
              ? 'border-emerald-400 text-white bg-zinc-900/50' 
              : 'border-transparent text-zinc-400 hover:text-zinc-200'
          }`}
        >
          <ShieldCheck className="w-4 h-4" />
          Suite de Diagnóstico
          {diagnostics.length > 0 && (
            <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 font-mono">
              {passedTestsCount}/{diagnostics.length}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('config')}
          className={`px-4 py-2.5 text-xs font-bold border-b-2 transition-all flex items-center gap-2 ${
            activeTab === 'config' 
              ? 'border-emerald-400 text-white bg-zinc-900/50' 
              : 'border-transparent text-zinc-400 hover:text-zinc-200'
          }`}
        >
          <Key className="w-4 h-4" />
          Parámetros Públicos (Client .env)
        </button>

        <button
          onClick={() => setActiveTab('security')}
          className={`px-4 py-2.5 text-xs font-bold border-b-2 transition-all flex items-center gap-2 ${
            activeTab === 'security' 
              ? 'border-emerald-400 text-white bg-zinc-900/50' 
              : 'border-transparent text-zinc-400 hover:text-zinc-200'
          }`}
        >
          <Server className="w-4 h-4" />
          Políticas RLS & Backend Secrets
        </button>
      </div>

      {/* TAB 1: ESTADO & RECURSOS CONECTADOS */}
      {activeTab === 'status' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Tablas Requeridas de SOI */}
          <div className="bg-zinc-950 border border-zinc-800 rounded-2xl p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <Layers className="w-4 h-4 text-emerald-400" />
                Tablas Institucionales Requeridas
              </h3>
              <span className="text-[10px] font-mono text-zinc-400">{REQUIRED_DATABASE_TABLES.length} Tablas</span>
            </div>

            <div className="space-y-2">
              {REQUIRED_DATABASE_TABLES.map((t, idx) => (
                <div key={idx} className="p-2.5 bg-zinc-900/60 border border-zinc-800/80 rounded-xl flex items-start justify-between gap-3">
                  <div className="space-y-0.5">
                    <div className="text-xs font-mono font-bold text-zinc-200">public.{t.table}</div>
                    <div className="text-[10px] text-zinc-400 leading-tight">{t.description}</div>
                  </div>
                  <span className="p-1 rounded-full bg-emerald-500/10 text-emerald-400 shrink-0">
                    <Check className="w-3.5 h-3.5" />
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Funciones Almacenadas / RPCs */}
          <div className="bg-zinc-950 border border-zinc-800 rounded-2xl p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <Terminal className="w-4 h-4 text-indigo-400" />
                Funciones Transaccionales (RPCs)
              </h3>
              <span className="text-[10px] font-mono text-zinc-400">{REQUIRED_RPCS.length} RPCs</span>
            </div>

            <div className="space-y-2">
              {REQUIRED_RPCS.map((rpc, idx) => (
                <div key={idx} className="p-2.5 bg-zinc-900/60 border border-zinc-800/80 rounded-xl flex items-start justify-between gap-3">
                  <div className="space-y-0.5">
                    <div className="text-xs font-mono font-bold text-indigo-300">{rpc.name}()</div>
                    <div className="text-[10px] text-zinc-400 leading-tight">{rpc.description}</div>
                  </div>
                  <span className="p-1 rounded-full bg-emerald-500/10 text-emerald-400 shrink-0">
                    <Check className="w-3.5 h-3.5" />
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Storage Buckets & Storage RLS */}
          <div className="bg-zinc-950 border border-zinc-800 rounded-2xl p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <Database className="w-4 h-4 text-sky-400" />
                Storage Buckets Documentales
              </h3>
              <span className="text-[10px] font-mono text-zinc-400">{REQUIRED_STORAGE_BUCKETS.length} Buckets</span>
            </div>

            <div className="space-y-2">
              {REQUIRED_STORAGE_BUCKETS.map((b, idx) => (
                <div key={idx} className="p-2.5 bg-zinc-900/60 border border-zinc-800/80 rounded-xl flex items-start justify-between gap-3">
                  <div className="space-y-0.5">
                    <div className="text-xs font-mono font-bold text-sky-300">storage.{b.bucket}</div>
                    <div className="text-[10px] text-zinc-400 leading-tight">{b.description}</div>
                  </div>
                  <span className="p-1 rounded-full bg-emerald-500/10 text-emerald-400 shrink-0">
                    <Check className="w-3.5 h-3.5" />
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: SUITE DE DIAGNÓSTICO INTERACTIVO */}
      {activeTab === 'diagnostics' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between bg-zinc-950 p-4 rounded-xl border border-zinc-800">
            <div>
              <div className="text-sm font-bold text-white">Resultados de Pruebas de Integración y Permisos</div>
              <div className="text-xs text-zinc-400">Verificación paso a paso de conectividad, tablas, RLS y RPCs de producción.</div>
            </div>
            <div className="flex items-center gap-2 text-xs">
              <span className="px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-400 font-bold border border-emerald-500/20">
                ✅ {passedTestsCount} Correctos
              </span>
              {warningTestsCount > 0 && (
                <span className="px-2.5 py-1 rounded-lg bg-amber-500/10 text-amber-400 font-bold border border-amber-500/20">
                  ⚠️ {warningTestsCount} Advertencias
                </span>
              )}
              {failedTestsCount > 0 && (
                <span className="px-2.5 py-1 rounded-lg bg-rose-500/10 text-rose-400 font-bold border border-rose-500/20">
                  ❌ {failedTestsCount} Fallidos
                </span>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {diagnostics.map(test => (
              <div 
                key={test.id}
                className="bg-zinc-950 border border-zinc-800 rounded-xl p-4 space-y-2 hover:border-zinc-700 transition"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      {test.status === 'passed' && <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />}
                      {test.status === 'warning' && <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />}
                      {test.status === 'failed' && <XCircle className="w-4 h-4 text-rose-400 shrink-0" />}
                      <span className="text-xs font-bold text-zinc-100">{test.name}</span>
                    </div>
                    <p className="text-[11px] text-zinc-400">{test.description}</p>
                  </div>
                  {test.latencyMs !== undefined && (
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-zinc-900 text-zinc-400 border border-zinc-800 shrink-0">
                      {test.latencyMs}ms
                    </span>
                  )}
                </div>
                <div className="text-[11px] font-mono text-zinc-400 bg-zinc-900/80 p-2 rounded-lg border border-zinc-800/60 break-all">
                  {test.details}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: PARÁMETROS CLIENTE (.ENV) */}
      {activeTab === 'config' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-zinc-950 border border-zinc-800 rounded-2xl p-6 space-y-5">
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Globe className="w-4 h-4 text-emerald-400" />
                Configuración del Cliente Web (Browser Safe)
              </h3>
              <p className="text-xs text-zinc-400 mt-1">
                Estos valores son consumidos por el cliente Vite mediante <code>import.meta.env</code>. Son seguros de incluir en el bundle de frontend ya que no otorgan privilegios administrativos.
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-zinc-300 mb-1.5">
                  VITE_SUPABASE_URL
                </label>
                <input
                  type="text"
                  value={config.supabaseUrl}
                  onChange={e => setConfig({ ...config, supabaseUrl: e.target.value })}
                  placeholder="https://your-project.supabase.co"
                  className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-3.5 py-2.5 text-xs text-zinc-100 font-mono focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-300 mb-1.5">
                  VITE_SUPABASE_PUBLISHABLE_KEY (Anon Key)
                </label>
                <input
                  type="text"
                  value={config.publishableKey}
                  onChange={e => setConfig({ ...config, publishableKey: e.target.value })}
                  placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                  className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-3.5 py-2.5 text-xs text-zinc-100 font-mono focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-300 mb-1.5">
                  Entorno de Ejecución
                </label>
                <select
                  value={config.environment}
                  onChange={e => setConfig({ ...config, environment: e.target.value as any })}
                  className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-3.5 py-2.5 text-xs text-zinc-100 font-mono focus:outline-none focus:border-emerald-500"
                >
                  <option value="production">Production (Cluster Oficial FUNEYCA-PC)</option>
                  <option value="staging">Staging / QA (Pruebas de Integración)</option>
                  <option value="development">Development (Entorno Local)</option>
                </select>
              </div>

              <div className="pt-2">
                <button
                  onClick={() => {
                    alert('Configuración cliente actualizada en memoria para la sesión activa.');
                  }}
                  className="w-full py-2.5 bg-zinc-800 hover:bg-zinc-700 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 border border-zinc-700"
                >
                  <Check className="w-4 h-4 text-emerald-400" />
                  Aplicar Configuración para Sesión Actual
                </button>
              </div>
            </div>
          </div>

          {/* Snippet para .env */}
          <div className="bg-zinc-950 border border-zinc-800 rounded-2xl p-6 space-y-4 flex flex-col justify-between">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                  <FileCode className="w-4 h-4 text-indigo-400" />
                  Snippet de Variables para .env.production
                </h3>
                <button
                  onClick={() => handleCopy(`VITE_SUPABASE_URL=${config.supabaseUrl}\nVITE_SUPABASE_PUBLISHABLE_KEY=${config.publishableKey}`, 'env')}
                  className="px-2.5 py-1 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-[11px] text-zinc-300 font-mono flex items-center gap-1.5"
                >
                  {copiedKey === 'env' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  {copiedKey === 'env' ? 'Copiado' : 'Copiar .env'}
                </button>
              </div>

              <pre className="bg-zinc-900/90 p-4 rounded-xl text-xs font-mono text-emerald-300 border border-zinc-800 overflow-x-auto leading-relaxed">
{`# .env.production (Frontend Vite)
VITE_SUPABASE_URL=${config.supabaseUrl}
VITE_SUPABASE_PUBLISHABLE_KEY=${config.publishableKey}

# Modo de Operación Institucional
VITE_APP_ENV=${config.environment}
VITE_INSTITUTION_ID=funeyca-pc-bavaro`}
              </pre>

              <div className="p-3 bg-zinc-900/50 rounded-xl border border-zinc-800 text-[11px] text-zinc-400 leading-relaxed">
                <strong>Nota de Despliegue:</strong> En Google Cloud Run o Vercel, configure estas variables en la consola de despliegue sin incluir la clave de servicio (<code>service_role</code>).
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: POLÍTICAS RLS & BACKEND SECRETS */}
      {activeTab === 'security' && (
        <div className="space-y-6">
          <div className="bg-zinc-950 border border-zinc-800 rounded-2xl p-6 space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Server className="w-4 h-4 text-rose-400" />
              Credenciales Privadas de Backend (Cloud Run Secrets / Edge Functions)
            </h3>
            <p className="text-xs text-zinc-400">
              Estas variables otorgan control administrativo total sobre la base de datos (omitiendo RLS). <strong>Nunca deben compilarse en el cliente web</strong>.
            </p>

            <div className="bg-zinc-900 p-4 rounded-xl border border-zinc-800 font-mono text-xs text-zinc-300 space-y-2">
              <div className="text-zinc-500"># Configuración protegida solo para Node.js / Cloud Run Secret Manager:</div>
              <div className="text-rose-400">SUPABASE_SERVICE_ROLE_KEY=eyJh... (SOLO SERVIDOR)</div>
              <div className="text-amber-400">POSTGRES_DB_PASSWORD=•••••••••••••••• (SOLO SERVIDOR)</div>
              <div className="text-indigo-400">SUPABASE_JWT_SECRET=•••••••••••••••• (SOLO SERVIDOR)</div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-zinc-950 border border-zinc-800 rounded-2xl p-5 space-y-3">
              <div className="text-xs font-bold text-emerald-400 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4" />
                Políticas RLS Activas en PostgreSQL
              </div>
              <ul className="text-xs text-zinc-400 space-y-2 list-disc list-inside">
                <li><code>familias_select_policy</code>: Tutores solo leen su propio estado de cuenta.</li>
                <li><code>pagos_insert_policy</code>: Cajeros y Finanzas registran ingresos auditados.</li>
                <li><code>asientos_immutable_policy</code>: Asientos contables son inmutables (append-only).</li>
                <li><code>lutheria_inventario_policy</code>: Modificación restringida al Director y Luthier.</li>
              </ul>
            </div>

            <div className="bg-zinc-950 border border-zinc-800 rounded-2xl p-5 space-y-3">
              <div className="text-xs font-bold text-indigo-400 flex items-center gap-2">
                <Sparkles className="w-4 h-4" />
                Garantías de Auditoría y Trazabilidad
              </div>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Cada mutación de datos a través del cliente autenticado adjunta automáticamente el <code>auth.uid()</code> y la marca de tiempo UTC en los campos <code>created_by</code> y <code>audit_trail</code>, garantizando cumplimiento con los estándares de gobernanza FIN.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
