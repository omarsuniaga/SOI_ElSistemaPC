import React, { useEffect, useState } from 'react';
import { AppContainerProvider, useAppContainer } from './presentation/context/AppContainerContext';
import { AuthProvider, useAuth } from './presentation/context/AuthContext';
import { LoginPage } from './presentation/pages/LoginPage';
import { useUIStore } from './presentation/state/uiStore';
import { AppHeader } from './presentation/components/layout/AppHeader';
import { AppSidebar } from './presentation/components/layout/AppSidebar';
import { TopCommandBar } from './presentation/components/layout/TopCommandBar';
import { TemporalRadarPage } from './presentation/pages/TemporalRadarPage';
import { CalendarPage } from './presentation/pages/CalendarPage';
import { SeasonsPage } from './presentation/pages/SeasonsPage';
import { ScheduleBuilderPage } from './presentation/pages/ScheduleBuilderPage';
import { ProtocolRunsPage } from './presentation/pages/ProtocolRunsPage';
import { HermesTasksPage } from './presentation/pages/HermesTasksPage';
import { VenuesPage } from './presentation/pages/VenuesPage';
import { CalendarItemDrawer } from './presentation/components/calendar/CalendarItemDrawer';
import { HermesPanel } from './presentation/components/hermes/HermesPanel';
import { ProtocolPreviewModal } from './presentation/components/hermes/ProtocolPreviewModal';
import { WeeklySnapshotModal } from './presentation/components/snapshot/WeeklySnapshotModal';
import { UserSettingsModal } from './presentation/components/settings/UserSettingsModal';
import { RadarExportModal } from './presentation/components/export/RadarExportModal';
import { CreateCalendarItemModal } from './presentation/components/calendar/CreateCalendarItemModal';
import { CreateTaskModal } from './presentation/components/tasks/CreateTaskModal';
import { ScheduleClassModal } from './presentation/components/schedule/ScheduleClassModal';
import { VenueDetailModal } from './presentation/components/venues/VenueDetailModal';
import { ConfirmActionModal } from './presentation/components/common/ConfirmActionModal';
import { ToastContainer } from './presentation/components/common/ToastContainer';

function MainApp() {
  const container = useAppContainer();
  const { activeScreen } = useUIStore();

  const [stats, setStats] = useState({
    upcomingCount: 12,
    activeTriggersCount: 31,
    protocolRunsCount: 6,
    riskCount: 4,
    criticalCount: 2,
  });

  useEffect(() => {
    // Load initial radar metrics for the top command bar
    container.getTemporalRadar.execute().then(radar => {
      setStats({
        upcomingCount: radar.totalUpcomingItems,
        activeTriggersCount: radar.activeTriggersCount,
        protocolRunsCount: radar.activeProtocolRunsCount,
        riskCount: radar.riskItemsCount,
        criticalCount: radar.criticalItemsCount,
      });
    });
  }, [container]);

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 font-sans selection:bg-amber-500 selection:text-zinc-950">
      {/* Header */}
      <AppHeader />

      {/* Main Layout */}
      <div className="flex">
        {/* Sidebar */}
        <AppSidebar />

        {/* Content Viewport */}
        <main className="flex-1 min-w-0 flex flex-col min-h-[calc(100vh-3.5rem)]">
          {/* Top KPI Command Bar */}
          <TopCommandBar
            upcomingCount={stats.upcomingCount}
            activeTriggersCount={stats.activeTriggersCount}
            protocolRunsCount={stats.protocolRunsCount}
            riskCount={stats.riskCount}
            criticalCount={stats.criticalCount}
          />

          {/* Active Screen View */}
          <div className="flex-1 p-4 sm:p-6 max-w-7xl w-full mx-auto">
            {activeScreen === 'radar' && <TemporalRadarPage />}
            {activeScreen === 'calendar' && <CalendarPage />}
            {activeScreen === 'seasons' && <SeasonsPage />}
            {activeScreen === 'schedules' && <ScheduleBuilderPage />}
            {activeScreen === 'protocols' && <ProtocolRunsPage />}
            {activeScreen === 'tasks' && <HermesTasksPage />}
            {activeScreen === 'venues' && <VenuesPage />}
          </div>
        </main>
      </div>

      {/* Overlay Modals & Drawers */}
      <CalendarItemDrawer />
      <HermesPanel />
      <ProtocolPreviewModal />
      <WeeklySnapshotModal />
      <UserSettingsModal />
      <RadarExportModal />
      <CreateCalendarItemModal />
      <CreateTaskModal />
      <ScheduleClassModal />
      <VenueDetailModal />
      <ConfirmActionModal />
      <ToastContainer />
    </div>
  );
}

function AuthGate() {
  const { status } = useAuth();

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center text-sm text-zinc-400">
        Cargando sesión...
      </div>
    );
  }

  if (status !== 'authenticated') {
    return <LoginPage />;
  }

  return (
    <AppContainerProvider>
      <MainApp />
    </AppContainerProvider>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AuthGate />
    </AuthProvider>
  );
}

