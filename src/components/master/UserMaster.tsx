import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { User, UserRole } from '../../types';
import { 
  Plus, 
  Search, 
  Edit2, 
  Trash2, 
  ShieldCheck, 
  GraduationCap, 
  School, 
  UserCheck, 
  Phone, 
  Mail,
  Lock,
  ArrowRightLeft,
  KeyRound,
  Eye,
  EyeOff,
  Check,
  RefreshCw
} from 'lucide-react';

export const UserMaster: React.FC = () => {
  const {
    userList,
    currentUser,
    kelasList,
    activeTahunPelajaran,
    addUser,
    updateUser,
    deleteUser,
    resetUserPassword,
    switchUser,
    showToast,
  } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [filterRole, setFilterRole] = useState<'ALL' | UserRole>('ALL');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<User | null>(null);
  const [deleteCandidate, setDeleteCandidate] = useState<User | null>(null);
  
  // Password state for Add/Edit
  const [showPasswordInput, setShowPasswordInput] = useState(false);

  // Reset Password Modal State
  const [resetTargetUser, setResetTargetUser] = useState<User | null>(null);
  const [newResetPassword, setNewResetPassword] = useState('123456');
  const [showResetPasswordInput, setShowResetPasswordInput] = useState(false);

  // Classes for active academic year
  const activeClasses = kelasList.filter(
    (k) => !activeTahunPelajaran || k.tahunPelajaranId === activeTahunPelajaran.id
  );

  const initialFormState: Omit<User, 'id'> = {
    username: '',
    nama: '',
    email: '',
    password: '',
    role: 'guru',
    kelasIds: [],
    telepon: '',
    catatan: '',
    avatarColor: 'bg-emerald-700',
  };

  const [formData, setFormData] = useState<Omit<User, 'id'>>(initialFormState);

  const filteredUsers = userList.filter((u) => {
    const matchSearch =
      u.nama.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchRole = filterRole === 'ALL' || u.role === filterRole;
    return matchSearch && matchRole;
  });

  const handleOpenAdd = () => {
    setEditingItem(null);
    setFormData(initialFormState);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (user: User) => {
    setEditingItem(user);
    setFormData({
      username: user.username,
      nama: user.nama,
      email: user.email,
      password: user.password || '',
      role: user.role,
      kelasIds: user.kelasIds || [],
      telepon: user.telepon || '',
      catatan: user.catatan || '',
      avatarColor: user.avatarColor || 'bg-emerald-700',
    });
    setIsModalOpen(true);
  };

  const toggleClassMapping = (kelasId: string) => {
    setFormData((prev) => {
      const current = prev.kelasIds || [];
      const updated = current.includes(kelasId)
        ? current.filter((id) => id !== kelasId)
        : [...current, kelasId];
      return { ...prev, kelasIds: updated };
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.username.trim() || !formData.nama.trim()) {
      showToast('Username dan Nama Pengguna wajib diisi.', 'warning');
      return;
    }

    // Check username unique
    const isDuplicate = userList.some(
      (u) =>
        u.username.toLowerCase() === formData.username.trim().toLowerCase() &&
        u.id !== editingItem?.id
    );
    if (isDuplicate) {
      showToast('Username sudah digunakan, silakan gunakan username lain.', 'error');
      return;
    }

    if (editingItem) {
      const updatedData: Partial<User> = { ...formData };
      if (!formData.password?.trim()) {
        delete updatedData.password;
      }
      updateUser(editingItem.id, updatedData);
      showToast('Akun pengguna berhasil diperbarui.', 'success');
    } else {
      const newUserData = {
        ...formData,
        password: formData.password?.trim() || (formData.role === 'admin' ? 'admin' : 'guru'),
      };
      addUser(newUserData);
      showToast(`Pengguna baru berhasil ditambahkan dengan password default "${newUserData.password}".`, 'success');
    }
    setIsModalOpen(false);
  };

  const handleOpenResetPassword = (user: User) => {
    setResetTargetUser(user);
    setNewResetPassword(user.role === 'admin' ? 'admin123' : 'guru123');
    setShowResetPasswordInput(false);
  };

  const handleSaveResetPassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (!resetTargetUser) return;
    if (!newResetPassword || newResetPassword.trim().length < 3) {
      showToast('Password baru minimal 3 karakter.', 'warning');
      return;
    }
    resetUserPassword(resetTargetUser.id, newResetPassword.trim());
    setResetTargetUser(null);
  };

  const handleDeleteClick = (user: User) => {
    if (currentUser?.id === user.id) {
      showToast('Tidak dapat menghapus user yang saat ini sedang aktif login.', 'warning');
      return;
    }
    setDeleteCandidate(user);
  };

  const confirmDelete = () => {
    if (deleteCandidate) {
      deleteUser(deleteCandidate.id);
      setDeleteCandidate(null);
    }
  };

  const colorOptions = [
    'bg-emerald-700',
    'bg-teal-600',
    'bg-rose-600',
    'bg-amber-600',
    'bg-sky-600',
    'bg-indigo-600',
    'bg-violet-600',
  ];

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded uppercase tracking-wider">
              Hak Akses & Pengguna
            </span>
          </div>
          <h2 className="text-xl font-bold text-slate-900 mt-1">Manajemen User & Mapping Guru</h2>
          <p className="text-sm text-slate-600 mt-0.5">
            Kelola akun administrator dan guru/ustadzah yang di-mapping dengan kelas pada tahun ajaran aktif.
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-lg text-sm transition-colors shadow-xs shrink-0 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Tambah User Baru</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-3.5 rounded-xl border border-slate-200 flex flex-col md:flex-row gap-3 items-center justify-between">
        <div className="relative w-full md:w-96">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Cari nama, username, atau email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>

        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg w-full md:w-auto justify-between md:justify-end">
          <button
            onClick={() => setFilterRole('ALL')}
            className={`px-3 py-1 text-xs font-semibold rounded-md transition-colors ${
              filterRole === 'ALL'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Semua ({userList.length})
          </button>
          <button
            onClick={() => setFilterRole('admin')}
            className={`px-3 py-1 text-xs font-semibold rounded-md transition-colors ${
              filterRole === 'admin'
                ? 'bg-white text-emerald-800 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Admin ({userList.filter((u) => u.role === 'admin').length})
          </button>
          <button
            onClick={() => setFilterRole('guru')}
            className={`px-3 py-1 text-xs font-semibold rounded-md transition-colors ${
              filterRole === 'guru'
                ? 'bg-white text-rose-800 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Guru ({userList.filter((u) => u.role === 'guru').length})
          </button>
        </div>
      </div>

      {/* Grid of Users */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredUsers.length === 0 ? (
          <div className="col-span-full py-12 text-center bg-white border border-dashed border-slate-300 rounded-xl">
            <UserCheck className="w-10 h-10 text-slate-300 mx-auto mb-2" />
            <p className="text-sm font-medium text-slate-700">Tidak ada pengguna yang cocok.</p>
          </div>
        ) : (
          filteredUsers.map((user) => {
            const isSelf = currentUser?.id === user.id;
            const mappedClasses = kelasList.filter((k) => user.kelasIds?.includes(k.id));

            return (
              <div
                key={user.id}
                className={`bg-white border rounded-2xl p-5 shadow-xs transition-all flex flex-col justify-between ${
                  isSelf
                    ? 'border-emerald-500 ring-2 ring-emerald-100'
                    : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <div>
                  {/* Top user row */}
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-11 h-11 rounded-xl text-white flex items-center justify-center font-bold text-base shrink-0 shadow-xs ${
                          user.avatarColor || 'bg-emerald-700'
                        }`}
                      >
                        {user.nama.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <h3 className="font-bold text-slate-900 text-sm leading-snug">
                            {user.nama}
                          </h3>
                        </div>
                        <span className="text-xs text-slate-500 font-mono">
                          @{user.username}
                        </span>
                      </div>
                    </div>

                    <div className="flex flex-col items-end gap-1">
                      <span
                        className={`text-[11px] font-bold px-2 py-0.5 rounded-md inline-flex items-center gap-1 ${
                          user.role === 'admin'
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-rose-100 text-rose-800'
                        }`}
                      >
                        {user.role === 'admin' ? (
                          <>
                            <ShieldCheck className="w-3.5 h-3.5" />
                            <span>Administrator</span>
                          </>
                        ) : (
                          <>
                            <GraduationCap className="w-3.5 h-3.5" />
                            <span>Guru / Ustadzah</span>
                          </>
                        )}
                      </span>
                      {isSelf && (
                        <span className="text-[10px] text-emerald-700 font-semibold bg-emerald-50 px-1.5 py-0.5 rounded">
                          Sedang Aktif
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Details */}
                  <div className="space-y-1.5 text-xs text-slate-600 border-t border-slate-100 pt-3">
                    <div className="flex items-center gap-2">
                      <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="truncate">{user.email || '-'}</span>
                    </div>
                    {user.telepon && (
                      <div className="flex items-center gap-2">
                        <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span>{user.telepon}</span>
                      </div>
                    )}
                    <div className="flex items-center justify-between pt-1">
                      <div className="flex items-center gap-2">
                        <Lock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span>Status Password:</span>
                      </div>
                      <span className="font-mono text-[11px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded font-semibold border border-emerald-100">
                        {user.password ? 'Tersedia' : 'Belum Diset'}
                      </span>
                    </div>
                  </div>

                  {/* Mapping Kelas Section */}
                  <div className="mt-3 pt-3 border-t border-slate-100">
                    <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                      {user.role === 'admin' ? 'Akses Kelas:' : 'Kelas yang Di-mapping:'}
                    </span>

                    {user.role === 'admin' ? (
                      <p className="text-xs text-emerald-700 font-medium">
                        ✓ Seluruh Rombel & Master Data (Akses Penuh)
                      </p>
                    ) : mappedClasses.length === 0 ? (
                      <p className="text-xs text-amber-700 italic">
                        Belum ada kelas dimapping. Klik 'Ubah' untuk memetakan kelas.
                      </p>
                    ) : (
                      <div className="flex flex-wrap gap-1.5">
                        {mappedClasses.map((k) => (
                          <span
                            key={k.id}
                            className="text-[11px] font-semibold bg-slate-100 text-slate-800 px-2 py-0.5 rounded-md border border-slate-200"
                          >
                            {k.namaKelas}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Bottom Actions */}
                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                  <button
                    onClick={() => switchUser(user.id)}
                    disabled={isSelf}
                    className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-colors flex items-center gap-1.5 ${
                      isSelf
                        ? 'text-slate-400 bg-slate-100 cursor-default'
                        : 'text-emerald-700 hover:text-white bg-emerald-50 hover:bg-emerald-600'
                    }`}
                    title="Beralih ke akun pengguna ini"
                  >
                    <ArrowRightLeft className="w-3.5 h-3.5" />
                    <span>{isSelf ? 'Akun Anda' : 'Beralih Akun'}</span>
                  </button>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleOpenResetPassword(user)}
                      className="p-1.5 text-amber-600 hover:text-amber-800 hover:bg-amber-50 rounded-md transition-colors"
                      title="Reset Password Pengguna"
                    >
                      <KeyRound className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleOpenEdit(user)}
                      className="p-1.5 text-slate-500 hover:text-emerald-700 hover:bg-slate-100 rounded-md transition-colors"
                      title="Ubah Data User & Mapping Kelas"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    {!isSelf && (
                      <button
                        onClick={() => handleDeleteClick(user)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-md transition-colors"
                        title="Hapus Akun Pengguna"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Add / Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-slate-200 overflow-hidden my-6">
            <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-slate-900 text-base">
                  {editingItem ? 'Ubah Data Pengguna' : 'Tambah Pengguna Baru'}
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Tentukan peran akun dan mapping kelas binaan santri.
                </p>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-700 text-xl font-bold leading-none"
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto text-xs sm:text-sm">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Username * (huruf kecil & tanpa spasi)
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="misal: fatimah / admin"
                    value={formData.username}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        username: e.target.value.toLowerCase().replace(/\s+/g, ''),
                      })
                    }
                    className="w-full px-3 py-2 text-xs sm:text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Peran (Role) *
                  </label>
                  <select
                    value={formData.role}
                    onChange={(e) =>
                      setFormData({ ...formData, role: e.target.value as UserRole })
                    }
                    className="w-full px-3 py-2 text-xs sm:text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
                  >
                    <option value="guru">Guru / Ustadzah (Terbatas sesuai kelas)</option>
                    <option value="admin">Administrator (Akses Penuh Master Data)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Nama Lengkap & Gelar *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Ustadzah Fatimah, S.Pd."
                  value={formData.nama}
                  onChange={(e) => setFormData({ ...formData, nama: e.target.value })}
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
                    placeholder="fatimah@alhaqq.sch.id"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-3 py-2 text-xs sm:text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    No. HP / WhatsApp
                  </label>
                  <input
                    type="text"
                    placeholder="08123456789"
                    value={formData.telepon || ''}
                    onChange={(e) => setFormData({ ...formData, telepon: e.target.value })}
                    className="w-full px-3 py-2 text-xs sm:text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              {/* Password Field */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-semibold text-slate-700">
                    {editingItem ? 'Password Akun (Opsional)' : 'Password Masuk *'}
                  </label>
                  <span className="text-[11px] text-slate-400">
                    {editingItem
                      ? 'Kosongkan jika tidak ingin mengubah password'
                      : `Default jika kosong: "${formData.role === 'admin' ? 'admin' : 'guru'}"`}
                  </span>
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type={showPasswordInput ? 'text' : 'password'}
                    placeholder={
                      editingItem
                        ? 'Ketik password baru jika ingin diganti...'
                        : 'Masukkan password (contoh: rahasia123)'
                    }
                    value={formData.password || ''}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="w-full pl-9 pr-10 py-2 text-xs sm:text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPasswordInput(!showPasswordInput)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
                    title={showPasswordInput ? 'Sembunyikan password' : 'Lihat password'}
                  >
                    {showPasswordInput ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Mapping Kelas Binaan (Only if Role === Guru) */}
              {formData.role === 'guru' && (
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider">
                      Mapping Kelas Binaan Santri *
                    </label>
                    <span className="text-[11px] text-slate-500">
                      Pilih kelas yang diampu guru ini
                    </span>
                  </div>
                  <p className="text-xs text-slate-500">
                    Guru hanya dapat melihat dan mencatat kegiatan harian santri di kelas yang dipilih.
                  </p>

                  <div className="space-y-2 pt-2">
                    {activeClasses.length === 0 ? (
                      <p className="text-xs text-amber-700 italic">
                        Belum ada kelas aktif di Master Kelas.
                      </p>
                    ) : (
                      activeClasses.map((kelas) => {
                        const isChecked = formData.kelasIds?.includes(kelas.id);
                        return (
                          <label
                            key={kelas.id}
                            className={`flex items-center justify-between p-2.5 rounded-lg border cursor-pointer transition-all ${
                              isChecked
                                ? 'bg-emerald-50 border-emerald-400 font-semibold text-emerald-900'
                                : 'bg-white border-slate-200 hover:border-slate-300 text-slate-700'
                            }`}
                          >
                            <div className="flex items-center gap-2.5">
                              <input
                                type="checkbox"
                                checked={isChecked}
                                onChange={() => toggleClassMapping(kelas.id)}
                                className="rounded text-emerald-600 focus:ring-emerald-500"
                              />
                              <div>
                                <span className="text-xs font-bold block">
                                  {kelas.namaKelas}
                                </span>
                                <span className="text-[11px] text-slate-500 font-normal">
                                  Wali Kelas Saat Ini: {kelas.waliKelas}
                                </span>
                              </div>
                            </div>
                            <span className="text-[11px] font-mono text-slate-500">
                              {kelas.tingkat}
                            </span>
                          </label>
                        );
                      })
                    )}
                  </div>
                </div>
              )}

              {/* Catatan / Keterangan */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Catatan Tambahan
                </label>
                <input
                  type="text"
                  placeholder="Keterangan tugas mengajar / wewenang"
                  value={formData.catatan || ''}
                  onChange={(e) => setFormData({ ...formData, catatan: e.target.value })}
                  className="w-full px-3 py-2 text-xs sm:text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-xs"
                >
                  {editingItem ? 'Simpan Perubahan' : 'Tambahkan Pengguna'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteCandidate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-xl max-w-sm w-full p-6 border border-slate-100">
            <div className="w-12 h-12 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center mx-auto mb-4">
              <Trash2 className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-900 text-center mb-1">
              Hapus Akun Pengguna?
            </h3>
            <p className="text-xs text-slate-600 text-center mb-6">
              Apakah Anda yakin ingin menghapus akun <span className="font-bold text-slate-800">"{deleteCandidate.nama}"</span>? Tindakan ini tidak dapat dibatalkan.
            </p>
            <div className="flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setDeleteCandidate(null)}
                className="flex-1 px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={confirmDelete}
                className="flex-1 px-4 py-2 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-lg transition-colors shadow-xs"
              >
                Ya, Hapus
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reset Password Modal */}
      {resetTargetUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full border border-slate-200 overflow-hidden">
            <div className="px-6 py-4 bg-amber-50 border-b border-amber-200 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-amber-600 text-white flex items-center justify-center shadow-xs">
                  <KeyRound className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-sm">
                    Reset Password Pengguna
                  </h3>
                  <p className="text-[11px] text-slate-600">
                    Atur password baru untuk akun terpilih
                  </p>
                </div>
              </div>
              <button
                onClick={() => setResetTargetUser(null)}
                className="text-slate-400 hover:text-slate-700 text-xl font-bold"
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleSaveResetPassword} className="p-6 space-y-4 text-xs sm:text-sm">
              {/* Target User Info Card */}
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div
                    className={`w-9 h-9 rounded-lg text-white font-bold text-xs flex items-center justify-center shrink-0 ${
                      resetTargetUser.avatarColor || 'bg-emerald-700'
                    }`}
                  >
                    {resetTargetUser.nama.charAt(0)}
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 text-xs">
                      {resetTargetUser.nama}
                    </h4>
                    <span className="text-[11px] text-slate-500 font-mono block">
                      @{resetTargetUser.username}
                    </span>
                  </div>
                </div>

                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                    resetTargetUser.role === 'admin'
                      ? 'bg-emerald-100 text-emerald-800'
                      : 'bg-rose-100 text-rose-800'
                  }`}
                >
                  {resetTargetUser.role === 'admin' ? 'Admin' : 'Guru'}
                </span>
              </div>

              {/* Password Input */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Password Baru * (Minimal 3 Karakter)
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type={showResetPasswordInput ? 'text' : 'password'}
                    required
                    value={newResetPassword}
                    onChange={(e) => setNewResetPassword(e.target.value)}
                    placeholder="Masukkan password baru..."
                    className="w-full pl-9 pr-10 py-2.5 text-xs sm:text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 font-mono"
                  />
                  <button
                    type="button"
                    onClick={() => setShowResetPasswordInput(!showResetPasswordInput)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
                    title={showResetPasswordInput ? 'Sembunyikan password' : 'Lihat password'}
                  >
                    {showResetPasswordInput ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Quick Preset Buttons */}
              <div>
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">
                  Template Cepat:
                </span>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => setNewResetPassword('123456')}
                    className="px-2.5 py-1 text-xs bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-md font-mono"
                  >
                    123456
                  </button>
                  <button
                    type="button"
                    onClick={() => setNewResetPassword(`${resetTargetUser.username}123`)}
                    className="px-2.5 py-1 text-xs bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-md font-mono"
                  >
                    {resetTargetUser.username}123
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      const randomCode = Math.random().toString(36).substring(2, 8);
                      setNewResetPassword(randomCode);
                    }}
                    className="px-2.5 py-1 text-xs bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-md flex items-center gap-1 font-mono"
                  >
                    <RefreshCw className="w-3 h-3 text-slate-500" />
                    <span>Acak 6 Digit</span>
                  </button>
                </div>
              </div>

              <div className="p-3 bg-amber-50/70 border border-amber-200 rounded-xl text-xs text-amber-900 leading-relaxed">
                ℹ️ Berikan password baru ini kepada guru / pemegang akun bersangkutan agar dapat login kembali.
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setResetTargetUser(null)}
                  className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold text-white bg-amber-600 hover:bg-amber-700 rounded-lg shadow-xs flex items-center gap-1.5"
                >
                  <KeyRound className="w-4 h-4" />
                  <span>Simpan Password Baru</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
