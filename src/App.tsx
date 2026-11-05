import React, { useState } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Navbar } from './components/Navbar';
import { DailyActivityView } from './components/activity/DailyActivityView';
import { DailyRecapView } from './components/activity/DailyRecapView';
import { MasterDataView } from './components/master/MasterDataView';
import { LoginScreen } from './components/auth/LoginScreen';

function AppContent() {
  const { currentUser } = useApp();
  const [currentTab, setCurrentTab] = useState<'aktivitas' | 'jurnal' | 'master' | 'dashboard'>('aktivitas');

  // If user is logged out, render full login screen
  if (!currentUser) {
    return <LoginScreen />;
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col text-slate-800">
      {/* Navigation Top Bar */}
      <Navbar 
        currentTab={currentTab} 
        setCurrentTab={setCurrentTab} 
        onNewActivityClick={() => setCurrentTab('aktivitas')}
      />

      {/* Main View Port */}
      <main className="flex-1 pb-16">
        {currentTab === 'aktivitas' && <DailyActivityView />}
        {currentTab === 'jurnal' && <DailyRecapView />}
        {currentTab === 'master' && <MasterDataView />}
      </main>

      {/* Quiet human footer (No telemetry, no fake engines) */}
      <footer className="border-t border-slate-200 py-6 text-center text-xs text-slate-500 bg-white no-print">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>Aplikasi Jurnal & Catatan Kegiatan Harian Siswa TK / PAUD</span>
          <div className="flex items-center gap-4 text-slate-400">
            <span>Kehadiran</span>
            <span>·</span>
            <span>Murojaah / Ziyadah</span>
            <span>·</span>
            <span>Tartil & Tahfidz</span>
            <span>·</span>
            <span>Adab Makan</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}
