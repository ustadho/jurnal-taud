import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  User as UserIcon, 
  Lock, 
  KeyRound, 
  Eye, 
  EyeOff, 
  Check, 
  ShieldCheck, 
  GraduationCap, 
  Mail, 
  Phone, 
  AlertCircle,
  Save,
  CheckCircle2,
  Calendar
} from 'lucide-react';

interface UserProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const UserProfileModal: React.FC<UserProfileModalProps> = ({ isOpen, onClose }) => {
  const { 
    currentUser, 
    updateProfile, 
    changePassword, 
    kelasList, 
    activeTahunPelajaran,
    isAdmin, 
    isGuru,
    showToast 
  } = useApp();

  const [activeTab, setActiveTab] = useState<'profile' | 'security'>('profile');

  // Profile Form State
  const [nama, setNama] = useState(currentUser?.nama || '');
  const [email, setEmail] = useState(currentUser?.email || '');
  const [telepon, setTelepon] = useState(currentUser?.telepon || '');

  // Password Change State
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState('');

  if (!isOpen || !currentUser) return null;

  // Sync state if currentUser changes
  const handleTabChange = (tab: 'profile' | 'security') => {
    setActiveTab(tab);
    setPasswordError('');
    setPasswordSuccess('');
  };

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nama.trim()) {
      showToast('Nama lengkap tidak boleh kosong.', 'warning');
      return;
    }
    updateProfile({
      nama,
      email,
      telepon,
    });
    showToast('Profil Anda berhasil diperbarui.', 'success');
  };

  const handleChangePassword = (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError('');
    setPasswordSuccess('');

    if (currentUser.password && !oldPassword) {
      setPasswordError('Harap masukkan password saat ini.');
      return;
    }

    if (!newPassword || newPassword.length < 3) {
      setPasswordError('Password baru minimal 3 karakter.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordError('Konfirmasi password baru tidak cocok.');
      return;
    }

    const result = changePassword(oldPassword, newPassword);
    if (result.success) {
      setPasswordSuccess('Password berhasil diperbarui!');
      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } else {
      setPasswordError(result.message);
    }
  };

  const currentMappedClasses = currentUser.kelasIds
    ? kelasList.filter((k) => currentUser.kelasIds?.includes(k.id))
    : [];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-slate-200 overflow-hidden my-6">
        
        {/* Header with User Info Banner */}
        <div className="p-6 bg-slate-900 text-white relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-slate-400 hover:text-white text-xl font-bold p-1 leading-none"
          >
            &times;
          </button>

          <div className="flex items-center gap-4">
            <div
              className={`w-14 h-14 rounded-2xl text-white font-bold text-2xl flex items-center justify-center shrink-0 shadow-md ${
                currentUser.avatarColor || (isAdmin ? 'bg-emerald-700' : 'bg-rose-600')
              }`}
            >
              {currentUser.nama.charAt(0)}
            </div>

            <div className="truncate">
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-lg text-white truncate">
                  {currentUser.nama}
                </h3>
              </div>
              <p className="text-xs text-slate-300 font-mono">
                @{currentUser.username}
              </p>
              <div className="mt-1 flex items-center gap-2">
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-md inline-flex items-center gap-1 ${
                    isAdmin
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                      : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                  }`}
                >
                  {isAdmin ? (
                    <>
                      <ShieldCheck className="w-3 h-3" />
                      <span>Administrator Sistem</span>
                    </>
                  ) : (
                    <>
                      <GraduationCap className="w-3 h-3" />
                      <span>Guru / Ustadzah Kelas</span>
                    </>
                  )}
                </span>

                {activeTahunPelajaran && (
                  <span className="text-[10px] text-slate-400 bg-slate-800 px-2 py-0.5 rounded border border-slate-700">
                    TP {activeTahunPelajaran.nama}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Tab Selection */}
        <div className="flex border-b border-slate-200 bg-slate-50 px-6 pt-3 text-xs sm:text-sm font-semibold">
          <button
            onClick={() => handleTabChange('profile')}
            className={`pb-3 px-3 border-b-2 flex items-center gap-2 transition-colors ${
              activeTab === 'profile'
                ? 'border-emerald-600 text-emerald-800 font-bold'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <UserIcon className="w-4 h-4" />
            <span>Profil Pengguna</span>
          </button>

          <button
            onClick={() => handleTabChange('security')}
            className={`pb-3 px-3 border-b-2 flex items-center gap-2 transition-colors ${
              activeTab === 'security'
                ? 'border-emerald-600 text-emerald-800 font-bold'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <KeyRound className="w-4 h-4" />
            <span>Ganti Password</span>
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6">
          {activeTab === 'profile' ? (
            <form onSubmit={handleSaveProfile} className="space-y-4 text-xs sm:text-sm">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Username
                  </label>
                  <input
                    type="text"
                    disabled
                    value={currentUser.username}
                    className="w-full px-3 py-2 text-xs sm:text-sm border border-slate-200 rounded-lg bg-slate-100 text-slate-500 cursor-not-allowed font-mono"
                  />
                  <span className="text-[10px] text-slate-400 mt-0.5 block">
                    Username tidak dapat diubah
                  </span>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Hak Akses / Peran
                  </label>
                  <input
                    type="text"
                    disabled
                    value={isAdmin ? 'Administrator (Akses Penuh)' : 'Guru Kelas'}
                    className="w-full px-3 py-2 text-xs sm:text-sm border border-slate-200 rounded-lg bg-slate-100 text-slate-500 cursor-not-allowed font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Nama Lengkap *
                </label>
                <input
                  type="text"
                  required
                  value={nama}
                  onChange={(e) => setNama(e.target.value)}
                  placeholder="Nama lengkap Anda..."
                  className="w-full px-3 py-2 text-xs sm:text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="email@sekolah.sch.id"
                    className="w-full px-3 py-2 text-xs sm:text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    No. Handphone / WA
                  </label>
                  <input
                    type="text"
                    value={telepon}
                    onChange={(e) => setTelepon(e.target.value)}
                    placeholder="08123456789"
                    className="w-full px-3 py-2 text-xs sm:text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              {/* Mapped Classes if Guru */}
              {isGuru && (
                <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                  <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                    Kelas Binaan yang Ditugaskan:
                  </span>
                  {currentMappedClasses.length > 0 ? (
                    <div className="flex flex-wrap gap-2 mt-1.5">
                      {currentMappedClasses.map((c) => (
                        <div
                          key={c.id}
                          className="bg-white border border-slate-200 px-2.5 py-1 rounded-lg text-xs font-semibold text-slate-800 shadow-2xs"
                        >
                          {c.namaKelas} <span className="text-slate-400 font-normal">({c.tingkat})</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <span className="text-xs text-amber-700 italic">
                      Belum ada mapping kelas dari Administrator.
                    </span>
                  )}
                  <p className="text-[11px] text-slate-500 mt-2">
                    * Mapping kelas diatur oleh Administrator di menu Master Data &gt; Pengguna.
                  </p>
                </div>
              )}

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Tutup
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-xs flex items-center gap-1.5"
                >
                  <Save className="w-4 h-4" />
                  <span>Simpan Perubahan</span>
                </button>
              </div>
            </form>
          ) : (
            <form onSubmit={handleChangePassword} className="space-y-4 text-xs sm:text-sm">
              {passwordError && (
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-rose-500 shrink-0" />
                  <span>{passwordError}</span>
                </div>
              )}

              {passwordSuccess && (
                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>{passwordSuccess}</span>
                </div>
              )}

              {/* Old Password */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Password Saat Ini *
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type={showOldPassword ? 'text' : 'password'}
                    required
                    value={oldPassword}
                    onChange={(e) => setOldPassword(e.target.value)}
                    placeholder="Masukkan password Anda saat ini..."
                    className="w-full pl-9 pr-10 py-2.5 text-xs sm:text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono"
                  />
                  <button
                    type="button"
                    onClick={() => setShowOldPassword(!showOldPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
                  >
                    {showOldPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* New Password */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Password Baru * (Minimal 3 Karakter)
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type={showNewPassword ? 'text' : 'password'}
                    required
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Masukkan password baru yang aman..."
                    className="w-full pl-9 pr-10 py-2.5 text-xs sm:text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
                  >
                    {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Confirm New Password */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Ulangi Password Baru *
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Ketik ulang password baru..."
                    className="w-full pl-9 pr-10 py-2.5 text-xs sm:text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
                  >
                    {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-600 space-y-1">
                <span className="font-semibold text-slate-700 block">Petunjuk Keamanan:</span>
                <p>• Gunakan kombinasi huruf dan angka agar password kuat.</p>
                <p>• Pastikan mengingat password baru Anda untuk login berikutnya.</p>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-xs flex items-center gap-1.5"
                >
                  <KeyRound className="w-4 h-4" />
                  <span>Perbarui Password</span>
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
