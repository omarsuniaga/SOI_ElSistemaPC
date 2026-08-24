import React, { useState, useEffect } from 'react';
import { LogOut } from 'lucide-react';
import { FinanceProvider, useFinance } from './context/FinanceContext';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { SupabaseStatusBanner } from './components/SupabaseStatusBanner';
import { LoginView } from './views/LoginView';
import { restoreSession, signOut, AuthorizedProfile } from './infrastructure/supabase/SupabaseAuthClient';
import { MyDayView } from './views/MyDayView';
import { DashboardView } from './views/DashboardView';
import { RegistroPagoView } from './views/RegistroPagoView';
import { FamiliasView } from './views/FamiliasView';
import { CuotasView } from './views/CuotasView';
import { MoraCobranzaView } from './views/MoraCobranzaView';
import { BecasView } from './views/BecasView';
import { FacturasGastoView } from './views/FacturasGastoView';
import { GastosFijosView } from './views/GastosFijosView';
import { CajaDiariaView } from './views/CajaDiariaView';
import { BancosConciliacionView } from './views/BancosConciliacionView';
import { ContabilidadLibroView } from './views/ContabilidadLibroView';
import { NominaView } from './views/NominaView';
import { PresupuestoView } from './views/PresupuestoView';
import { TareasView } from './views/TareasView';
import { LutheriaInventarioView } from './views/LutheriaInventarioView';
import { TienditaView } from './views/TienditaView';
import { SupabaseSettingsView } from './views/SupabaseSettingsView';

const MainLayout: React.FC = () => {
  const [activeView, setActiveView] = useState<string>('my_day');
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(false);
  const { supabaseStatus, lastSupabaseSync, supabaseErrorMessage, refreshAuthoritativeReceivables } = useFinance();

  const renderActiveView = () => {
    switch (activeView) {
      case 'my_day':
        return <MyDayView setActiveView={setActiveView} />;
      case 'dashboard':
        return <DashboardView setActiveView={setActiveView} />;
      case 'registro_pago':
        return <RegistroPagoView />;
      case 'familias':
        return <FamiliasView setActiveView={setActiveView} />;
      case 'cuotas':
        return <CuotasView setActiveView={setActiveView} />;
      case 'mora_cobranza':
        return <MoraCobranzaView setActiveView={setActiveView} />;
      case 'becas':
        return <BecasView setActiveView={setActiveView} />;
      case 'tiendita':
      case 'procurement':
        return <TienditaView />;
      case 'facturas':
        return <FacturasGastoView />;
      case 'gastos_fijos':
      case 'servicios_fijos':
        return <GastosFijosView />;
      case 'lutheria':
      case 'lutheria_inventario':
        return <LutheriaInventarioView />;
      case 'caja_diaria':
        return <CajaDiariaView />;
      case 'bancos':
        return <BancosConciliacionView />;
      case 'contabilidad':
        return <ContabilidadLibroView />;
      case 'nomina':
        return <NominaView />;
      case 'presupuesto':
        return <PresupuestoView />;
      case 'tareas':
        return <TareasView />;
      case 'supabase_settings':
      case 'supabase':
      case 'settings':
        return <SupabaseSettingsView />;
      default:
        return <MyDayView setActiveView={setActiveView} />;
    }
  };

  return (
    <div className="flex h-screen bg-black text-zinc-100 font-sans antialiased overflow-hidden selection:bg-indigo-500 selection:text-white">
      {/* Sidebar Navigation */}
      <Sidebar
        activeView={activeView}
        setActiveView={setActiveView}
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden bg-black">
        {/* Top Header with Role Switcher & Critical Alerts */}
        <Header 
          setActiveView={setActiveView} 
          sidebarOpen={sidebarOpen}
          setSidebarOpen={setSidebarOpen}
        />

        {/* Supabase Authoritative Status Banner */}
        <SupabaseStatusBanner 
          status={supabaseStatus}
          lastSync={lastSupabaseSync || undefined}
          errorMessage={supabaseErrorMessage || undefined}
          onRetry={refreshAuthoritativeReceivables}
        />

        {/* Dynamic View Scrollable Container */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 bg-black">
          <div className="max-w-7xl mx-auto pb-16">
            {renderActiveView()}
          </div>
        </main>
      </div>
    </div>
  );
};

export default function App() {
  const [authProfile, setAuthProfile] = useState<AuthorizedProfile | null>(null);
  const [checkingSession, setCheckingSession] = useState(true);

  useEffect(() => {
    restoreSession()
      .then(setAuthProfile)
      .finally(() => setCheckingSession(false));
  }, []);

  const handleSignOut = () => {
    signOut();
    setAuthProfile(null);
  };

  if (checkingSession) {
    return <div className="min-h-screen bg-black" />;
  }

  if (!authProfile) {
    return <LoginView onAuthenticated={setAuthProfile} />;
  }

  return (
    <FinanceProvider>
      <div className="relative">
        <button
          onClick={handleSignOut}
          title="Cerrar sesión"
          className="fixed bottom-4 right-4 z-[60] flex items-center gap-1.5 px-3 py-2 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-400 hover:text-white rounded-xl text-xs font-medium shadow-xl transition-colors"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>{authProfile.nombreCompleto}</span>
        </button>
        <MainLayout />
      </div>
    </FinanceProvider>
  );
}
