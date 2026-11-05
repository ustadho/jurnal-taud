import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { LoginModal } from './auth/LoginModal';
import { UserProfileModal } from './auth/UserProfileModal';
import { 
  BookOpen, 
  Calendar, 
  Users, 
  CheckSquare, 
  BarChart3, 
  Download, 
  Upload, 
  RotateCcw,
  Sparkles,
  School,
  ShieldCheck,
  GraduationCap,
  ChevronDown,
  LogOut,
  UserCheck,
  ArrowRightLeft,
  LogIn,
  KeyRound
} from 'lucide-react';

interface NavbarProps {
  currentTab: 'aktivitas' | 'jurnal' | 'master' | 'dashboard';
  setCurrentTab: (tab: 'aktivitas' | 'jurnal' | 'master' | 'dashboard') => void;
  onNewActivityClick?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  setCurrentTab,
  onNewActivityClick,
}) => {
  const {
    activeTahunPelajaran,
    exportDataJSON,
    importDataJSON,
    resetToSampleData,
    currentUser,
    userList,
    switchUser,
    logout,
    kelasList,
    isAdmin,
    isGuru,
    showToast,
  } = useApp();

  const [showDataMenu, setShowDataMenu] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const text = event.target?.result as string;
        if (text) {
          const success = importDataJSON(text);
          if (success) {
            showToast('Data berhasil dipulihkan dari cadangan!', 'success');
          } else {
            showToast('Format berkas tidak valid atau rusak.', 'error');
          }
        }
      };
      reader.readAsText(file);
    }
  };

  const currentMappedClasses = currentUser?.kelasIds
    ? kelasList.filter((k) => currentUser.kelasIds?.includes(k.id))
    : [];

  return (
    <>
      <header className="bg-white border-b border-slate-200 sticky top-0 z-40 shadow-xs no-print">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between gap-4 lg:gap-8 h-16">
            
            {/* Zone 1: Single text element wordmark */}
            <div className="flex items-center gap-3 shrink-0">
              <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold text-lg shadow-sm">
                <School className="w-5 h-5 text-emerald-50" />
              </div>
              <div>
                <span className="text-base sm:text-lg font-bold tracking-tight text-slate-900 whitespace-nowrap block leading-tight">
                  Jurnal TAUD MQ Al-Haqq
                </span>
                <span className="text-[11px] sm:text-xs text-slate-500 font-medium">
                  Catatan Harian Siswa
                </span>
              </div>
            </div>

            {/* Zone 2: Navigation Links */}
            <nav className="hidden md:flex items-center gap-1 sm:gap-2 text-sm font-medium">
              <button
                onClick={() => setCurrentTab('aktivitas')}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap flex items-center gap-2 ${
                  currentTab === 'aktivitas'
                    ? 'bg-emerald-50 text-emerald-800 font-semibold'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                <CheckSquare className="w-4 h-4 text-emerald-600" />
                <span>Aktivitas Harian</span>
              </button>

              <button
                onClick={() => setCurrentTab('jurnal')}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap flex items-center gap-2 ${
                  currentTab === 'jurnal'
                    ? 'bg-emerald-50 text-emerald-800 font-semibold'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                <BarChart3 className="w-4 h-4 text-emerald-600" />
                <span>Rekap & Jurnal</span>
              </button>

              <button
                onClick={() => setCurrentTab('master')}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap flex items-center gap-2 ${
                  currentTab === 'master'
                    ? 'bg-emerald-50 text-emerald-800 font-semibold'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                <Users className="w-4 h-4 text-emerald-600" />
                <span>Master Data</span>
                {isGuru && (
                  <span className="text-[10px] text-amber-700 bg-amber-100/80 px-1.5 py-0.2 rounded font-normal">
                    Lihat
                  </span>
                )}
              </button>
            </nav>

            {/* Zone 3: User Profile & Actions */}
            <div className="flex items-center gap-2 sm:gap-3 shrink-0">
              
              {/* Academic Year Badge */}
              {activeTahunPelajaran && (
                <div className="hidden xl:flex items-center gap-2 text-xs text-slate-600 bg-slate-100 px-3 py-1.5 rounded-lg border border-slate-200">
                  <Calendar className="w-3.5 h-3.5 text-slate-500" />
                  <span>TP {activeTahunPelajaran.nama} ({activeTahunPelajaran.semester})</span>
                </div>
              )}

              {/* User Account / Profile Dropdown */}
              {currentUser ? (
                <div className="relative">
                  <button
                    onClick={() => {
                      setShowUserMenu(!showUserMenu);
                      setShowDataMenu(false);
                    }}
                    className="flex items-center gap-2 p-1.5 sm:px-2.5 sm:py-1.5 bg-slate-100 hover:bg-slate-200 rounded-xl transition-all border border-slate-200"
                    title="Profil Pengguna & Ganti Akun"
                  >
                    <div
                      className={`w-7 h-7 rounded-lg text-white font-bold text-xs flex items-center justify-center shrink-0 shadow-xs ${
                        currentUser.avatarColor || (isAdmin ? 'bg-emerald-700' : 'bg-rose-600')
                      }`}
                    >
                      {currentUser.nama.charAt(0)}
                    </div>
                    
                    <div className="hidden sm:block text-left max-w-[120px] lg:max-w-[150px] truncate">
                      <span className="text-xs font-bold text-slate-900 block truncate leading-tight">
                        {currentUser.nama}
                      </span>
                      <span className="text-[10px] font-semibold text-emerald-700 uppercase tracking-wider block">
                        {isAdmin ? 'Administrator' : 'Guru Kelas'}
                      </span>
                    </div>

                    <ChevronDown className="w-3.5 h-3.5 text-slate-500" />
                  </button>

                  {/* Dropdown Card */}
                  {showUserMenu && (
                    <>
                      <div
                        className="fixed inset-0 z-40"
                        onClick={() => setShowUserMenu(false)}
                      />
                      <div className="absolute right-0 mt-2 w-72 bg-white rounded-2xl shadow-xl border border-slate-200 py-3 z-50 text-xs">
                        {/* Profile Info Header */}
                        <div className="px-4 pb-3 border-b border-slate-100">
                          <div className="flex items-center gap-2.5 mb-1.5">
                            <div
                              className={`w-9 h-9 rounded-xl text-white font-bold text-sm flex items-center justify-center shrink-0 ${
                                currentUser.avatarColor || (isAdmin ? 'bg-emerald-700' : 'bg-rose-600')
                              }`}
                            >
                              {currentUser.nama.charAt(0)}
                            </div>
                            <div className="truncate">
                              <h4 className="font-bold text-slate-900 text-xs truncate">
                                {currentUser.nama}
                              </h4>
                              <span className="text-[11px] text-slate-500 font-mono block">
                                @{currentUser.username}
                              </span>
                            </div>
                          </div>

                          <div className="mt-2 bg-slate-50 p-2 rounded-lg border border-slate-200 space-y-1">
                            <div className="flex items-center justify-between">
                              <span className="text-slate-500 text-[11px]">Peran:</span>
                              <span
                                className={`font-bold px-2 py-0.5 rounded text-[10px] ${
                                  isAdmin
                                    ? 'bg-emerald-100 text-emerald-800'
                                    : 'bg-rose-100 text-rose-800'
                                }`}
                              >
                                {isAdmin ? 'Administrator (Akses Penuh)' : 'Guru / Ustadzah'}
                              </span>
                            </div>

                            {isGuru && (
                              <div className="text-[11px] text-slate-600 pt-1 border-t border-slate-100">
                                <span className="text-slate-400 block text-[10px]">Kelas Binaan:</span>
                                {currentMappedClasses.length > 0 ? (
                                  <div className="font-semibold text-emerald-800 mt-0.5">
                                    {currentMappedClasses.map((c) => c.namaKelas).join(', ')}
                                  </div>
                                ) : (
                                  <span className="text-amber-700 italic">Belum dimapping kelas</span>
                                )}
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Primary User Action: Profil & Ganti Password */}
                        <div className="p-2 border-b border-slate-100">
                          <button
                            onClick={() => {
                              setShowUserMenu(false);
                              setIsProfileModalOpen(true);
                            }}
                            className="w-full text-left px-3 py-2 rounded-xl bg-emerald-50 hover:bg-emerald-100/80 text-emerald-900 font-bold flex items-center justify-between transition-colors border border-emerald-100"
                          >
                            <div className="flex items-center gap-2">
                              <KeyRound className="w-4 h-4 text-emerald-600" />
                              <span>Profil Saya & Ganti Password</span>
                            </div>
                            <span className="text-[10px] bg-white text-emerald-700 font-semibold px-2 py-0.5 rounded shadow-2xs border border-emerald-200">
                              Buka
                            </span>
                          </button>
                        </div>

                        {/* Switch User List */}
                        <div className="px-4 py-2">
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">
                            Beralih Pengguna Cepat:
                          </span>
                          <div className="space-y-1 max-h-40 overflow-y-auto">
                            {userList.map((user) => {
                              const isSelf = user.id === currentUser.id;
                              return (
                                <button
                                  key={user.id}
                                  onClick={() => {
                                    switchUser(user.id);
                                    setShowUserMenu(false);
                                  }}
                                  disabled={isSelf}
                                  className={`w-full text-left p-1.5 rounded-lg flex items-center justify-between text-xs transition-colors ${
                                    isSelf
                                      ? 'bg-emerald-50 text-emerald-900 font-semibold'
                                      : 'hover:bg-slate-100 text-slate-700'
                                  }`}
                                >
                                  <span className="truncate">{user.nama}</span>
                                  <span
                                    className={`text-[9px] px-1.5 py-0.2 rounded font-semibold ${
                                      user.role === 'admin'
                                        ? 'bg-emerald-100 text-emerald-800'
                                        : 'bg-rose-100 text-rose-800'
                                    }`}
                                  >
                                    {user.role}
                                  </span>
                                </button>
                              );
                            })}
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="pt-2 border-t border-slate-100 px-3 flex items-center justify-between">
                          <button
                            onClick={() => {
                              setShowUserMenu(false);
                              setIsLoginModalOpen(true);
                            }}
                            className="px-2.5 py-1 text-slate-600 hover:text-slate-900 font-medium flex items-center gap-1.5"
                          >
                            <ArrowRightLeft className="w-3.5 h-3.5" />
                            <span>Ganti Akun</span>
                          </button>

                          <button
                            onClick={() => {
                              logout();
                              setShowUserMenu(false);
                              setIsLoginModalOpen(true);
                            }}
                            className="px-2.5 py-1 text-rose-600 hover:bg-rose-50 rounded font-semibold flex items-center gap-1.5"
                          >
                            <LogOut className="w-3.5 h-3.5" />
                            <span>Keluar</span>
                          </button>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              ) : (
                <button
                  onClick={() => setIsLoginModalOpen(true)}
                  className="px-3 py-1.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg flex items-center gap-1.5 shadow-xs"
                >
                  <LogIn className="w-4 h-4" />
                  <span>Masuk</span>
                </button>
              )}

              {/* Data options dropdown */}
              <div className="relative">
                <button
                  onClick={() => {
                    setShowDataMenu(!showDataMenu);
                    setShowUserMenu(false);
                  }}
                  className="px-2.5 py-2 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors whitespace-nowrap"
                  title="Cadangkan / Pulihkan Data"
                >
                  Cadangan
                </button>

                {showDataMenu && (
                  <>
                    <div 
                      className="fixed inset-0 z-40" 
                      onClick={() => setShowDataMenu(false)} 
                    />
                    <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-lg border border-slate-200 py-1.5 z-50 text-xs">
                      <button
                        onClick={() => {
                          exportDataJSON();
                          setShowDataMenu(false);
                        }}
                        className="w-full text-left px-4 py-2 hover:bg-slate-50 flex items-center gap-2 text-slate-700 font-medium"
                      >
                        <Download className="w-4 h-4 text-slate-500" />
                        <span>Unduh Cadangan (JSON)</span>
                      </button>
                      <label className="w-full text-left px-4 py-2 hover:bg-slate-50 flex items-center gap-2 text-slate-700 font-medium cursor-pointer">
                        <Upload className="w-4 h-4 text-slate-500" />
                        <span>Pulihkan dari File</span>
                        <input
                          type="file"
                          accept=".json"
                          onChange={(e) => {
                            handleFileUpload(e);
                            setShowDataMenu(false);
                          }}
                          className="hidden"
                        />
                      </label>
                      <div className="my-1 border-t border-slate-100" />
                      <button
                        onClick={() => {
                          setShowDataMenu(false);
                          setShowResetConfirm(true);
                        }}
                        className="w-full text-left px-4 py-2 hover:bg-amber-50 text-amber-700 font-medium flex items-center gap-2"
                      >
                        <RotateCcw className="w-4 h-4 text-amber-600" />
                        <span>Reset ke Data Contoh</span>
                      </button>
                    </div>
                  </>
                )}
              </div>

              {/* Primary Action Button */}
              <button
                onClick={() => {
                  setCurrentTab('aktivitas');
                  if (onNewActivityClick) onNewActivityClick();
                }}
                className="px-3 sm:px-4 py-2 text-xs sm:text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 rounded-lg transition-colors shadow-xs whitespace-nowrap flex items-center gap-1.5"
              >
                <CheckSquare className="w-4 h-4" />
                <span>Catat Harian</span>
              </button>
            </div>
          </div>

          {/* Mobile Navigation bar */}
          <div className="md:hidden flex items-center justify-around py-2 border-t border-slate-100 text-xs">
            <button
              onClick={() => setCurrentTab('aktivitas')}
              className={`py-1 px-2 font-medium flex flex-col items-center gap-1 ${
                currentTab === 'aktivitas' ? 'text-emerald-700 font-bold' : 'text-slate-600'
              }`}
            >
              <CheckSquare className="w-4 h-4" />
              <span>Aktivitas</span>
            </button>
            <button
              onClick={() => setCurrentTab('jurnal')}
              className={`py-1 px-2 font-medium flex flex-col items-center gap-1 ${
                currentTab === 'jurnal' ? 'text-emerald-700 font-bold' : 'text-slate-600'
              }`}
            >
              <BarChart3 className="w-4 h-4" />
              <span>Rekap Jurnal</span>
            </button>
            <button
              onClick={() => setCurrentTab('master')}
              className={`py-1 px-2 font-medium flex flex-col items-center gap-1 ${
                currentTab === 'master' ? 'text-emerald-700 font-bold' : 'text-slate-600'
              }`}
            >
              <Users className="w-4 h-4" />
              <span>Master Data</span>
            </button>
          </div>
        </div>
      </header>

      {/* Login Modal */}
      <LoginModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
      />

      {/* User Profile Modal */}
      <UserProfileModal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
      />

      {/* Reset Confirmation Modal */}
      {showResetConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-xl max-w-sm w-full p-6 border border-slate-100">
            <div className="w-12 h-12 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center mx-auto mb-4">
              <RotateCcw className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-900 text-center mb-1">
              Reset ke Data Contoh?
            </h3>
            <p className="text-xs text-slate-600 text-center mb-6">
              Kembalikan semua data ke contoh data awal? Semua perubahan data aktivitas dan rombel yang baru dibuat akan ditimpa.
            </p>
            <div className="flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setShowResetConfirm(false)}
                className="flex-1 px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={() => {
                  resetToSampleData();
                  setShowResetConfirm(false);
                  showToast('Data berhasil dikembalikan ke contoh awal.', 'info');
                }}
                className="flex-1 px-4 py-2 text-xs font-bold text-white bg-amber-600 hover:bg-amber-700 rounded-lg transition-colors shadow-xs"
              >
                Ya, Reset
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
