import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  School, 
  Lock, 
  User as UserIcon, 
  ArrowRight, 
  AlertCircle, 
  Eye, 
  EyeOff, 
  ShieldCheck, 
  GraduationCap,
  KeyRound,
  CheckCircle2
} from 'lucide-react';

export const LoginScreen: React.FC = () => {
  const { userList, login, switchUser, kelasList, activeTahunPelajaran } = useApp();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    const success = login(username, password);
    if (!success) {
      setErrorMsg('Username atau password salah. Silakan periksa kembali kredensial Anda.');
    }
  };

  const handleQuickLogin = (userId: string) => {
    switchUser(userId);
  };

  const handleFillCredentials = (u: string, p: string) => {
    setUsername(u);
    setPassword(p);
    setErrorMsg('');
  };

  return (
    <div className="min-h-screen bg-linear-to-b from-slate-100 via-slate-50 to-emerald-50/30 flex flex-col justify-center items-center p-4">
      <div className="max-w-md w-full my-8">
        
        {/* App Wordmark & Branding */}
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-lg shadow-emerald-600/20 text-white">
            <School className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-black tracking-tight text-slate-900">
            Jurnal TAUD MQ Al-Haqq
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 mt-1 max-w-sm mx-auto">
            Sistem Pencatatan Kegiatan Harian & Evaluasi Pembelajaran Santri TK/PAUD
          </p>
          {activeTahunPelajaran && (
            <div className="inline-flex items-center gap-1.5 mt-2.5 px-3 py-1 bg-white border border-slate-200 rounded-full text-xs text-slate-600 shadow-2xs">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span>Tahun Ajaran Aktif: <strong className="text-slate-800">{activeTahunPelajaran.nama} ({activeTahunPelajaran.semester})</strong></span>
            </div>
          )}
        </div>

        {/* Login Box */}
        <div className="bg-white rounded-3xl shadow-xl border border-slate-200 p-6 sm:p-8">
          <div className="mb-6">
            <h2 className="text-lg font-bold text-slate-900">Masuk ke Akun Anda</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Gunakan username dan password yang telah didaftarkan
            </p>
          </div>

          {errorMsg && (
            <div className="mb-5 p-3.5 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Username
              </label>
              <div className="relative">
                <UserIcon className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  placeholder="Ketik username Anda (cth: admin / fatimah)..."
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full pl-10 pr-3 py-2.5 text-xs sm:text-sm border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-semibold text-slate-700">
                  Password
                </label>
                <span className="text-[11px] text-slate-400">
                  Default akun contoh: <code className="bg-slate-100 px-1 py-0.5 rounded">admin</code> / <code className="bg-slate-100 px-1 py-0.5 rounded">guru</code>
                </span>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="Masukkan password Anda..."
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-10 py-2.5 text-xs sm:text-sm border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
                  title={showPassword ? 'Sembunyikan password' : 'Lihat password'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3 px-4 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-bold rounded-xl text-xs sm:text-sm transition-all shadow-md shadow-emerald-600/20 flex items-center justify-center gap-2 mt-2"
            >
              <span>Masuk ke Aplikasi</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Quick Login / Demo Accounts */}
          <div className="mt-6 pt-5 border-t border-slate-100">
            <div className="flex items-center justify-between mb-2.5">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                Masuk Cepat / Simulasi Akun:
              </span>
              <span className="text-[10px] text-emerald-700 font-medium">
                1-Klik Masuk
              </span>
            </div>

            <div className="space-y-2">
              {userList.map((user) => {
                const mappedClasses = kelasList.filter((k) => user.kelasIds?.includes(k.id));
                const isAdmin = user.role === 'admin';

                return (
                  <button
                    key={user.id}
                    type="button"
                    onClick={() => handleQuickLogin(user.id)}
                    className="w-full text-left p-2.5 rounded-xl border border-slate-200 hover:border-emerald-500 hover:bg-emerald-50/50 transition-all flex items-center justify-between gap-2.5 group"
                  >
                    <div className="flex items-center gap-2.5 truncate">
                      <div
                        className={`w-8 h-8 rounded-lg text-white font-bold text-xs flex items-center justify-center shrink-0 shadow-2xs ${
                          user.avatarColor || (isAdmin ? 'bg-emerald-700' : 'bg-rose-600')
                        }`}
                      >
                        {user.nama.charAt(0)}
                      </div>
                      <div className="truncate">
                        <div className="font-semibold text-slate-900 text-xs truncate group-hover:text-emerald-800">
                          {user.nama}
                        </div>
                        <div className="text-[10px] text-slate-500 truncate font-mono">
                          user: {user.username} · pwd: {user.password || (isAdmin ? 'admin' : 'guru')}
                        </div>
                      </div>
                    </div>

                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded shrink-0 ${
                        isAdmin
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-rose-100 text-rose-800'
                      }`}
                    >
                      {isAdmin ? 'Admin' : 'Guru'}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Quiet Info */}
        <div className="text-center mt-6 text-xs text-slate-500 space-y-1">
          <p>Hak Cipta © {new Date().getFullYear()} TAUD MQ Al-Haqq</p>
          <p className="text-slate-400 text-[11px]">
            Fitur Login, Logout, Hak Akses Guru Kelas, dan Reset Password telah aktif.
          </p>
        </div>
      </div>
    </div>
  );
};
