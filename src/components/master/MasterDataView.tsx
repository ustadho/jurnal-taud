import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { AcademicYearMaster } from './AcademicYearMaster';
import { ClassMaster } from './ClassMaster';
import { StudentMaster } from './StudentMaster';
import { PlottingMaster } from './PlottingMaster';
import { UserMaster } from './UserMaster';
import { Calendar, School, Users, UserCheck, ShieldCheck, Lock } from 'lucide-react';

export const MasterDataView: React.FC = () => {
  const { currentUser, isAdmin, isGuru } = useApp();
  const [activeSubTab, setActiveSubTab] = useState<'siswa' | 'ploting' | 'kelas' | 'tahun' | 'users'>('siswa');

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      
      {/* Role notice for Guru */}
      {isGuru && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-3.5 flex items-center justify-between gap-3 text-xs text-amber-800">
          <div className="flex items-center gap-2">
            <Lock className="w-4 h-4 text-amber-600 shrink-0" />
            <span>
              <strong>Perhatian Akses:</strong> Anda login sebagai <strong>{currentUser?.nama}</strong> (Guru). Penambahan Tahun Ajaran dan Master Data hanya dapat dilakukan oleh <strong>Administrator</strong>.
            </span>
          </div>
          <span className="font-semibold text-amber-900 bg-amber-100/70 px-2 py-0.5 rounded shrink-0">
            Mode Akses Terbatas
          </span>
        </div>
      )}

      {/* Subtab Segmented Navigation */}
      <div className="flex items-center gap-1.5 p-1 bg-slate-200/80 rounded-xl max-w-3xl overflow-x-auto shadow-inner">
        <button
          onClick={() => setActiveSubTab('siswa')}
          className={`flex items-center gap-2 px-3.5 py-2 text-xs sm:text-sm font-semibold rounded-lg transition-all whitespace-nowrap ${
            activeSubTab === 'siswa'
              ? 'bg-white text-emerald-800 shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
          }`}
        >
          <Users className="w-4 h-4 text-emerald-600" />
          <span>Master Santri</span>
        </button>

        <button
          onClick={() => setActiveSubTab('ploting')}
          className={`flex items-center gap-2 px-3.5 py-2 text-xs sm:text-sm font-semibold rounded-lg transition-all whitespace-nowrap ${
            activeSubTab === 'ploting'
              ? 'bg-white text-emerald-800 shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
          }`}
        >
          <UserCheck className="w-4 h-4 text-emerald-600" />
          <span>Ploting Rombel</span>
        </button>

        <button
          onClick={() => setActiveSubTab('kelas')}
          className={`flex items-center gap-2 px-3.5 py-2 text-xs sm:text-sm font-semibold rounded-lg transition-all whitespace-nowrap ${
            activeSubTab === 'kelas'
              ? 'bg-white text-emerald-800 shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
          }`}
        >
          <School className="w-4 h-4 text-emerald-600" />
          <span>Master Kelas</span>
        </button>

        <button
          onClick={() => setActiveSubTab('tahun')}
          className={`flex items-center gap-2 px-3.5 py-2 text-xs sm:text-sm font-semibold rounded-lg transition-all whitespace-nowrap ${
            activeSubTab === 'tahun'
              ? 'bg-white text-emerald-800 shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
          }`}
        >
          <Calendar className="w-4 h-4 text-emerald-600" />
          <span>Tahun Pelajaran</span>
        </button>

        {/* User Management Tab (Admin only or prominent) */}
        {isAdmin && (
          <button
            onClick={() => setActiveSubTab('users')}
            className={`flex items-center gap-2 px-3.5 py-2 text-xs sm:text-sm font-semibold rounded-lg transition-all whitespace-nowrap ${
              activeSubTab === 'users'
                ? 'bg-white text-emerald-800 shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
            }`}
          >
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Manajemen User</span>
          </button>
        )}
      </div>

      {/* Tab Panels */}
      <div>
        {activeSubTab === 'siswa' && <StudentMaster />}
        {activeSubTab === 'ploting' && <PlottingMaster />}
        {activeSubTab === 'kelas' && <ClassMaster />}
        {activeSubTab === 'tahun' && <AcademicYearMaster />}
        {activeSubTab === 'users' && isAdmin && <UserMaster />}
      </div>
    </div>
  );
};
