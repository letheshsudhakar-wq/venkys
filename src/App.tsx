import { useState } from 'react';
import { useStore } from './hooks/useStore';
import { Header } from './components/layout/Header';
import { Sidebar } from './components/layout/Sidebar';
import type { NavigationTab } from './components/layout/Sidebar';
import { DashboardPage } from './pages/DashboardPage';
import { SchedulesPage } from './pages/SchedulesPage';
import { TripsPage } from './pages/TripsPage';
import { ReportsPage } from './pages/ReportsPage';
import { TransportersPage } from './pages/master/TransportersPage';
import { VehiclesPage } from './pages/master/VehiclesPage';
import { FarmsPage } from './pages/master/FarmsPage';
import { RoutesPage } from './pages/master/RoutesPage';
import { ItemsPage } from './pages/master/ItemsPage';
import { UsersPage } from './pages/master/UsersPage';
import { CreateScheduleModal } from './components/operations/CreateScheduleModal';
import { EnterStartKmModal } from './components/operations/EnterStartKmModal';
import { EnterEndKmModal } from './components/operations/EnterEndKmModal';
import { RecordSkipModal } from './components/operations/RecordSkipModal';
import { ConfirmDialog } from './components/ui/ConfirmDialog';
import type { ScheduleViewModel } from './types';

export function App() {
  const store = useStore();
  const [currentTab, setCurrentTab] = useState<NavigationTab>('dashboard');

  // Modals state
  const [isCreateScheduleOpen, setIsCreateScheduleOpen] = useState(false);
  const [startKmSchedule, setStartKmSchedule] = useState<ScheduleViewModel | null>(null);
  const [endKmSchedule, setEndKmSchedule] = useState<ScheduleViewModel | null>(null);
  const [skipSchedule, setSkipSchedule] = useState<ScheduleViewModel | null>(null);
  const [isResetConfirmOpen, setIsResetConfirmOpen] = useState(false);

  const handleOpenStartKm = (schedule: ScheduleViewModel) => {
    setStartKmSchedule(schedule);
  };

  const handleOpenEndKm = (schedule: ScheduleViewModel) => {
    setEndKmSchedule(schedule);
  };

  const handleOpenSkip = (schedule: ScheduleViewModel) => {
    setSkipSchedule(schedule);
  };

  const handleResetData = () => {
    store.resetAllData();
    setIsResetConfirmOpen(false);
  };

  const renderContent = () => {
    switch (currentTab) {
      case 'dashboard':
        return (
          <DashboardPage
            onOpenCreateSchedule={() => setIsCreateScheduleOpen(true)}
            onOpenStartKm={handleOpenStartKm}
            onOpenEndKm={handleOpenEndKm}
            onOpenSkipModal={handleOpenSkip}
            onNavigateToTab={(tab) => setCurrentTab(tab)}
          />
        );
      case 'schedules':
        return (
          <SchedulesPage
            onOpenCreateSchedule={() => setIsCreateScheduleOpen(true)}
            onOpenStartKm={handleOpenStartKm}
            onOpenEndKm={handleOpenEndKm}
            onOpenSkipModal={handleOpenSkip}
          />
        );
      case 'trips':
        return (
          <TripsPage
            onOpenStartKm={handleOpenStartKm}
            onOpenEndKm={handleOpenEndKm}
          />
        );
      case 'reports':
        return <ReportsPage />;
      case 'transporters':
        return <TransportersPage />;
      case 'vehicles':
        return <VehiclesPage />;
      case 'items':
        return <ItemsPage />;
      case 'farms':
        return <FarmsPage />;
      case 'routes':
        return <RoutesPage />;
      case 'users':
        return <UsersPage />;
      default:
        return (
          <DashboardPage
            onOpenCreateSchedule={() => setIsCreateScheduleOpen(true)}
            onOpenStartKm={handleOpenStartKm}
            onOpenEndKm={handleOpenEndKm}
            onOpenSkipModal={handleOpenSkip}
            onNavigateToTab={(tab) => setCurrentTab(tab)}
          />
        );
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col selection:bg-red-100 selection:text-red-900">
      {/* Venky's Header Bar */}
      <Header onOpenCreateSchedule={() => setIsCreateScheduleOpen(true)} />

      {/* Main App Layout */}
      <div className="flex-1 flex max-w-[1920px] w-full mx-auto">
        {/* Sidebar */}
        <Sidebar
          currentTab={currentTab}
          onSelectTab={(tab) => setCurrentTab(tab)}
          onResetData={() => setIsResetConfirmOpen(true)}
        />

        {/* Content Viewport */}
        <main className="flex-1 p-5 overflow-y-auto max-h-[calc(100vh-69px)]">
          {renderContent()}
        </main>
      </div>

      {/* GLOBAL OPERATIONAL MODALS */}
      <CreateScheduleModal
        isOpen={isCreateScheduleOpen}
        onClose={() => setIsCreateScheduleOpen(false)}
      />

      <EnterStartKmModal
        isOpen={Boolean(startKmSchedule)}
        onClose={() => setStartKmSchedule(null)}
        schedule={startKmSchedule}
      />

      <EnterEndKmModal
        isOpen={Boolean(endKmSchedule)}
        onClose={() => setEndKmSchedule(null)}
        schedule={endKmSchedule}
      />

      {skipSchedule && (
        <RecordSkipModal
          isOpen={Boolean(skipSchedule)}
          onClose={() => setSkipSchedule(null)}
          schedule={skipSchedule}
        />
      )}

      {/* Confirm Reset Demo Data */}
      <ConfirmDialog
        isOpen={isResetConfirmOpen}
        onClose={() => setIsResetConfirmOpen(false)}
        onConfirm={handleResetData}
        title="Reset Demo Data to Factory Seed"
        message="This will reset all operational schedules, trips, and master entities back to the initial demo baseline state. Are you sure?"
        confirmLabel="Reset Demo State"
        isDestructive={true}
      />
    </div>
  );
}

export default App;
