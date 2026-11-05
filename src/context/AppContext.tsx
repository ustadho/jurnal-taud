import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  TahunPelajaran,
  Kelas,
  Siswa,
  PlotingSiswa,
  CatatanHarian,
  User,
  UserRole,
  ToastNotification,
} from '../types';
import { ToastContainer } from '../components/common/ToastContainer';
import {
  INITIAL_TAHUN_PELAJARAN,
  INITIAL_KELAS,
  INITIAL_SISWA,
  INITIAL_PLOTING,
  INITIAL_CATATAN_HARIAN,
  INITIAL_USERS,
} from '../data/initialData';

interface AppContextType {
  // Toast notifications
  showToast: (message: string, type?: 'success' | 'error' | 'info' | 'warning') => void;

  // User Management & Auth
  userList: User[];
  currentUser: User | null;
  isAdmin: boolean;
  isGuru: boolean;
  login: (username: string, password?: string) => boolean;
  logout: () => void;
  switchUser: (userId: string) => void;
  addUser: (item: Omit<User, 'id'>) => void;
  updateUser: (id: string, item: Partial<User>) => void;
  deleteUser: (id: string) => void;
  resetUserPassword: (userId: string, newPassword: string) => void;
  changePassword: (oldPassword: string, newPassword: string) => { success: boolean; message: string };
  updateProfile: (data: { nama: string; email: string; telepon?: string }) => void;
  getAllowedClasses: () => Kelas[];
  canManageMasterData: () => boolean;

  // Master Tahun Pelajaran
  tahunPelajaranList: TahunPelajaran[];
  activeTahunPelajaran: TahunPelajaran | undefined;
  addTahunPelajaran: (item: Omit<TahunPelajaran, 'id'>) => void;
  updateTahunPelajaran: (id: string, item: Partial<TahunPelajaran>) => void;
  deleteTahunPelajaran: (id: string) => void;
  setActiveTahunPelajaran: (id: string) => void;

  // Master Kelas
  kelasList: Kelas[];
  addKelas: (item: Omit<Kelas, 'id'>) => void;
  updateKelas: (id: string, item: Partial<Kelas>) => void;
  deleteKelas: (id: string) => void;

  // Master Siswa
  siswaList: Siswa[];
  addSiswa: (item: Omit<Siswa, 'id'>) => void;
  updateSiswa: (id: string, item: Partial<Siswa>) => void;
  deleteSiswa: (id: string) => void;

  // Ploting Siswa
  plotingList: PlotingSiswa[];
  assignSiswaToKelas: (siswaId: string, kelasId: string, tahunPelajaranId: string) => void;
  batchAssignSiswaToKelas: (siswaIds: string[], kelasId: string, tahunPelajaranId: string) => void;
  removeSiswaFromKelas: (siswaId: string, kelasId: string) => void;

  // Catatan Harian
  catatanHarianList: CatatanHarian[];
  saveCatatanHarian: (item: Omit<CatatanHarian, 'id' | 'updatedAt'> & { id?: string }) => void;
  batchSaveCatatanHarian: (items: (Omit<CatatanHarian, 'id' | 'updatedAt'> & { id?: string })[]) => void;
  deleteCatatanHarian: (id: string) => void;
  getCatatanHarianByDateAndSiswa: (tanggal: string, siswaId: string) => CatatanHarian | undefined;

  // Helpers
  getSiswaByKelas: (kelasId: string) => Siswa[];
  getUnassignedSiswa: (tahunPelajaranId: string) => Siswa[];
  getKelasBySiswa: (siswaId: string, tahunPelajaranId: string) => Kelas | undefined;
  
  // Data actions
  resetToSampleData: () => void;
  exportDataJSON: () => void;
  importDataJSON: (jsonString: string) => boolean;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const STORAGE_KEYS = {
  USERS: 'jurnal_tk_users_v2',
  CURRENT_USER: 'jurnal_tk_current_user_v2',
  TAHUN: 'jurnal_tk_tahun_pelajaran_v1',
  KELAS: 'jurnal_tk_kelas_v1',
  SISWA: 'jurnal_tk_siswa_v1',
  PLOTING: 'jurnal_tk_ploting_v1',
  CATATAN: 'jurnal_tk_catatan_harian_v1',
};

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Users
  const [userList, setUserList] = useState<User[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.USERS);
    return saved ? JSON.parse(saved) : INITIAL_USERS;
  });

  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.CURRENT_USER);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return INITIAL_USERS[0];
      }
    }
    return INITIAL_USERS[0]; // Default logged in as Administrator
  });

  const [tahunPelajaranList, setTahunPelajaranList] = useState<TahunPelajaran[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.TAHUN);
    return saved ? JSON.parse(saved) : INITIAL_TAHUN_PELAJARAN;
  });

  const [kelasList, setKelasList] = useState<Kelas[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.KELAS);
    return saved ? JSON.parse(saved) : INITIAL_KELAS;
  });

  const [siswaList, setSiswaList] = useState<Siswa[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.SISWA);
    return saved ? JSON.parse(saved) : INITIAL_SISWA;
  });

  const [plotingList, setPlotingList] = useState<PlotingSiswa[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.PLOTING);
    return saved ? JSON.parse(saved) : INITIAL_PLOTING;
  });

  const [catatanHarianList, setCatatanHarianList] = useState<CatatanHarian[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.CATATAN);
    return saved ? JSON.parse(saved) : INITIAL_CATATAN_HARIAN;
  });

  // Save to LocalStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(userList));
  }, [userList]);

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(currentUser));
    } else {
      localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
    }
  }, [currentUser]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.TAHUN, JSON.stringify(tahunPelajaranList));
  }, [tahunPelajaranList]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.KELAS, JSON.stringify(kelasList));
  }, [kelasList]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.SISWA, JSON.stringify(siswaList));
  }, [siswaList]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.PLOTING, JSON.stringify(plotingList));
  }, [plotingList]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.CATATAN, JSON.stringify(catatanHarianList));
  }, [catatanHarianList]);

  // Toast notifications
  const [toasts, setToasts] = useState<ToastNotification[]>([]);

  const showToast = (message: string, type: 'success' | 'error' | 'info' | 'warning' = 'info') => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    setToasts((prev) => [...prev, { id, type, message }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  };

  const dismissToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Active Tahun Pelajaran
  const activeTahunPelajaran = tahunPelajaranList.find((t) => t.status === 'aktif') || tahunPelajaranList[0];

  // Auth & Roles
  const isAdmin = currentUser?.role === 'admin';
  const isGuru = currentUser?.role === 'guru';

  const canManageMasterData = (): boolean => {
    return currentUser?.role === 'admin';
  };

  // Get allowed classes for the current user in active academic year
  const getAllowedClasses = (): Kelas[] => {
    const activeTPId = activeTahunPelajaran?.id;
    const classesInActiveTP = kelasList.filter(
      (k) => !activeTPId || k.tahunPelajaranId === activeTPId
    );

    // Administrator has access to all classes
    if (!currentUser || currentUser.role === 'admin') {
      return classesInActiveTP;
    }

    // Role is guru: only return classes mapped to this user
    const mappedClassIds = currentUser.kelasIds || [];
    return classesInActiveTP.filter((k) => mappedClassIds.includes(k.id));
  };

  // User CRUD
  const addUser = (item: Omit<User, 'id'>) => {
    const newId = `usr-${Date.now()}`;
    const newUser: User = {
      ...item,
      id: newId,
      avatarColor: item.avatarColor || (item.role === 'admin' ? 'bg-emerald-700' : 'bg-rose-600'),
    };
    setUserList((prev) => [...prev, newUser]);
  };

  const updateUser = (id: string, item: Partial<User>) => {
    setUserList((prev) =>
      prev.map((u) => {
        if (u.id === id) {
          const updated = { ...u, ...item };
          if (currentUser?.id === id) {
            setCurrentUser(updated);
          }
          return updated;
        }
        return u;
      })
    );
  };

  const deleteUser = (id: string) => {
    if (currentUser?.id === id) {
      showToast('Tidak dapat menghapus user yang sedang aktif login.', 'warning');
      return;
    }
    setUserList((prev) => prev.filter((u) => u.id !== id));
    showToast('Pengguna berhasil dihapus.', 'info');
  };

  const switchUser = (userId: string) => {
    const found = userList.find((u) => u.id === userId);
    if (found) {
      setCurrentUser(found);
    }
  };

  const login = (username: string, password?: string): boolean => {
    const trimmedUsername = username.trim().toLowerCase();
    const found = userList.find(
      (u) => u.username.toLowerCase() === trimmedUsername
    );
    if (!found) {
      return false;
    }
    // If the user has a password set, require exact match
    if (found.password) {
      if (!password || found.password !== password) {
        return false;
      }
    }
    setCurrentUser(found);
    return true;
  };

  const logout = () => {
    setCurrentUser(null);
  };

  const resetUserPassword = (userId: string, newPassword: string) => {
    if (!canManageMasterData()) {
      showToast('Akses ditolak: Hanya Administrator yang berwenang mereset password pengguna.', 'error');
      return;
    }
    if (!newPassword || newPassword.length < 3) {
      showToast('Password baru minimal 3 karakter.', 'warning');
      return;
    }
    setUserList((prev) =>
      prev.map((u) => {
        if (u.id === userId) {
          const updated = { ...u, password: newPassword };
          if (currentUser?.id === userId) {
            setCurrentUser(updated);
          }
          return updated;
        }
        return u;
      })
    );
    showToast('Password pengguna berhasil direset.', 'success');
  };

  const changePassword = (oldPassword: string, newPassword: string): { success: boolean; message: string } => {
    if (!currentUser) {
      return { success: false, message: 'Tidak ada sesi pengguna aktif.' };
    }
    // Verify old password if currently set
    if (currentUser.password && currentUser.password !== oldPassword) {
      return { success: false, message: 'Password saat ini / lama tidak cocok.' };
    }
    if (!newPassword || newPassword.length < 3) {
      return { success: false, message: 'Password baru minimal 3 karakter.' };
    }

    const updatedUser = { ...currentUser, password: newPassword };
    setCurrentUser(updatedUser);
    setUserList((prev) => prev.map((u) => (u.id === currentUser.id ? updatedUser : u)));
    showToast('Password Anda berhasil diperbarui!', 'success');
    return { success: true, message: 'Password berhasil diperbarui.' };
  };

  const updateProfile = (data: { nama: string; email: string; telepon?: string }) => {
    if (!currentUser) return;
    const updatedUser = {
      ...currentUser,
      nama: data.nama.trim(),
      email: data.email.trim(),
      telepon: data.telepon?.trim() || '',
    };
    setCurrentUser(updatedUser);
    setUserList((prev) => prev.map((u) => (u.id === currentUser.id ? updatedUser : u)));
    showToast('Profil pengguna berhasil diperbarui.', 'success');
  };

  // Tahun Pelajaran CRUD (Only Admin can modify)
  const addTahunPelajaran = (item: Omit<TahunPelajaran, 'id'>) => {
    if (!canManageMasterData()) {
      showToast('Akses ditolak: Hanya Administrator yang berwenang menambahkan Tahun Ajaran.', 'error');
      return;
    }
    const newId = `tp-${Date.now()}`;
    const newItem: TahunPelajaran = { ...item, id: newId };
    if (newItem.status === 'aktif') {
      setTahunPelajaranList((prev) => {
        const deactivated: TahunPelajaran[] = prev.map((t) => ({ ...t, status: 'nonaktif' }));
        return [...deactivated, newItem];
      });
    } else {
      setTahunPelajaranList((prev) => [...prev, newItem]);
    }
    showToast(`Tahun Pelajaran "${newItem.nama}" berhasil ditambahkan.`, 'success');
  };

  const updateTahunPelajaran = (id: string, item: Partial<TahunPelajaran>) => {
    if (!canManageMasterData()) {
      showToast('Akses ditolak: Hanya Administrator yang berwenang mengubah Tahun Ajaran.', 'error');
      return;
    }
    setTahunPelajaranList((prev) =>
      prev.map((t): TahunPelajaran => {
        if (t.id === id) {
          return { ...t, ...item };
        }
        if (item.status === 'aktif') {
          return { ...t, status: 'nonaktif' };
        }
        return t;
      })
    );
    showToast('Tahun Pelajaran berhasil diperbarui.', 'success');
  };

  const deleteTahunPelajaran = (id: string) => {
    if (!canManageMasterData()) {
      showToast('Akses ditolak: Hanya Administrator yang berwenang menghapus Tahun Ajaran.', 'error');
      return;
    }
    setTahunPelajaranList((prev) => prev.filter((t) => t.id !== id));
    showToast('Tahun Pelajaran berhasil dihapus.', 'info');
  };

  const setActiveTahunPelajaran = (id: string) => {
    if (!canManageMasterData()) {
      showToast('Akses ditolak: Hanya Administrator yang berwenang mengubah status Tahun Ajaran aktif.', 'error');
      return;
    }
    setTahunPelajaranList((prev) =>
      prev.map((t) => ({
        ...t,
        status: t.id === id ? 'aktif' : 'nonaktif',
      }))
    );
    showToast('Tahun Ajaran aktif telah diubah.', 'success');
  };

  // Kelas CRUD
  const addKelas = (item: Omit<Kelas, 'id'>) => {
    if (!canManageMasterData()) {
      showToast('Akses ditolak: Hanya Administrator yang berwenang menambah Master Kelas.', 'error');
      return;
    }
    const newId = `k-${Date.now()}`;
    setKelasList((prev) => [...prev, { ...item, id: newId }]);
    showToast(`Kelas "${item.namaKelas}" berhasil ditambahkan.`, 'success');
  };

  const updateKelas = (id: string, item: Partial<Kelas>) => {
    if (!canManageMasterData()) {
      showToast('Akses ditolak: Hanya Administrator yang berwenang mengubah Master Kelas.', 'error');
      return;
    }
    setKelasList((prev) => prev.map((k) => (k.id === id ? { ...k, ...item } : k)));
    showToast('Data kelas berhasil diperbarui.', 'success');
  };

  const deleteKelas = (id: string) => {
    if (!canManageMasterData()) {
      showToast('Akses ditolak: Hanya Administrator yang berwenang menghapus Master Kelas.', 'error');
      return;
    }
    setKelasList((prev) => prev.filter((k) => k.id !== id));
    setPlotingList((prev) => prev.filter((p) => p.kelasId !== id));
    showToast('Kelas berhasil dihapus.', 'info');
  };

  // Siswa CRUD
  const addSiswa = (item: Omit<Siswa, 'id'>) => {
    if (!canManageMasterData()) {
      showToast('Akses ditolak: Hanya Administrator yang berwenang menambah data santri baru.', 'error');
      return;
    }
    const newId = `s-${Date.now()}`;
    setSiswaList((prev) => [ { ...item, id: newId }, ...prev ]);
    showToast(`Data santri "${item.nama_siswa}" berhasil ditambahkan.`, 'success');
  };

  const updateSiswa = (id: string, item: Partial<Siswa>) => {
    if (!canManageMasterData()) {
      showToast('Akses ditolak: Hanya Administrator yang berwenang mengubah data santri.', 'error');
      return;
    }
    setSiswaList((prev) => prev.map((s) => (s.id === id ? { ...s, ...item } : s)));
    showToast('Data santri berhasil diperbarui.', 'success');
  };

  const deleteSiswa = (id: string) => {
    if (!canManageMasterData()) {
      showToast('Akses ditolak: Hanya Administrator yang berwenang menghapus data santri.', 'error');
      return;
    }
    setSiswaList((prev) => prev.filter((s) => s.id !== id));
    setPlotingList((prev) => prev.filter((p) => p.siswaId !== id));
    setCatatanHarianList((prev) => prev.filter((c) => c.siswaId !== id));
    showToast('Data santri berhasil dihapus.', 'info');
  };

  // Ploting Siswa
  const assignSiswaToKelas = (siswaId: string, kelasId: string, tahunPelajaranId: string) => {
    if (!canManageMasterData()) {
      showToast('Akses ditolak: Hanya Administrator yang berwenang melakukan ploting siswa.', 'error');
      return;
    }
    setPlotingList((prev) => {
      const filtered = prev.filter(
        (p) => !(p.siswaId === siswaId && p.tahunPelajaranId === tahunPelajaranId)
      );
      const newEntry: PlotingSiswa = {
        id: `plot-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
        siswaId,
        kelasId,
        tahunPelajaranId,
        tanggalPloting: new Date().toISOString().split('T')[0],
      };
      return [...filtered, newEntry];
    });
    showToast('Santri berhasil dimasukkan ke kelas.', 'success');
  };

  const batchAssignSiswaToKelas = (siswaIds: string[], kelasId: string, tahunPelajaranId: string) => {
    if (!canManageMasterData()) {
      showToast('Akses ditolak: Hanya Administrator yang berwenang melakukan ploting siswa.', 'error');
      return;
    }
    const today = new Date().toISOString().split('T')[0];
    setPlotingList((prev) => {
      const filtered = prev.filter(
        (p) => !(siswaIds.includes(p.siswaId) && p.tahunPelajaranId === tahunPelajaranId)
      );
      const newEntries: PlotingSiswa[] = siswaIds.map((sid, idx) => ({
        id: `plot-${Date.now()}-${idx}`,
        siswaId: sid,
        kelasId,
        tahunPelajaranId,
        tanggalPloting: today,
        nomorUrut: idx + 1,
      }));
      return [...filtered, ...newEntries];
    });
    showToast(`${siswaIds.length} santri berhasil dimasukkan ke kelas.`, 'success');
  };

  const removeSiswaFromKelas = (siswaId: string, kelasId: string) => {
    if (!canManageMasterData()) {
      showToast('Akses ditolak: Hanya Administrator yang berwenang mengeluarkan siswa dari kelas.', 'error');
      return;
    }
    setPlotingList((prev) => prev.filter((p) => !(p.siswaId === siswaId && p.kelasId === kelasId)));
    showToast('Santri dikeluarkan dari kelas.', 'info');
  };

  // Catatan Harian (Guru can save notes for their allowed classes)
  const saveCatatanHarian = (item: Omit<CatatanHarian, 'id' | 'updatedAt'> & { id?: string }) => {
    // Check if guru is allowed to write for this class
    if (currentUser?.role === 'guru') {
      const allowed = currentUser.kelasIds || [];
      if (!allowed.includes(item.kelasId)) {
        showToast('Akses ditolak: Anda hanya berwenang mencatat aktivitas untuk kelas binaan Anda.', 'error');
        return;
      }
    }

    const now = new Date().toISOString();
    setCatatanHarianList((prev) => {
      const existingIndex = prev.findIndex(
        (c) => (item.id && c.id === item.id) || (c.tanggal === item.tanggal && c.siswaId === item.siswaId)
      );

      if (existingIndex >= 0) {
        const updated = [...prev];
        updated[existingIndex] = {
          ...updated[existingIndex],
          ...item,
          updatedAt: now,
        };
        return updated;
      } else {
        const newRecord: CatatanHarian = {
          ...item,
          id: item.id || `log-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
          updatedAt: now,
        };
        return [newRecord, ...prev];
      }
    });
    showToast('Catatan harian berhasil disimpan.', 'success');
  };

  const batchSaveCatatanHarian = (items: (Omit<CatatanHarian, 'id' | 'updatedAt'> & { id?: string })[]) => {
    // Filter items to ensure guru only writes for allowed classes
    let validItems = items;
    if (currentUser?.role === 'guru') {
      const allowed = currentUser.kelasIds || [];
      validItems = items.filter((item) => allowed.includes(item.kelasId));
      if (validItems.length < items.length) {
        showToast('Sebagian data dilewati karena di luar wewenang kelas binaan Anda.', 'warning');
      }
    }

    const now = new Date().toISOString();
    setCatatanHarianList((prev) => {
      let updated = [...prev];
      validItems.forEach((item) => {
        const existingIndex = updated.findIndex(
          (c) => (item.id && c.id === item.id) || (c.tanggal === item.tanggal && c.siswaId === item.siswaId)
        );
        if (existingIndex >= 0) {
          updated[existingIndex] = {
            ...updated[existingIndex],
            ...item,
            updatedAt: now,
          };
        } else {
          updated.push({
            ...item,
            id: item.id || `log-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
            updatedAt: now,
          });
        }
      });
      return updated;
    });
  };

  const deleteCatatanHarian = (id: string) => {
    setCatatanHarianList((prev) => prev.filter((c) => c.id !== id));
  };

  const getCatatanHarianByDateAndSiswa = (tanggal: string, siswaId: string): CatatanHarian | undefined => {
    return catatanHarianList.find((c) => c.tanggal === tanggal && c.siswaId === siswaId);
  };

  // Helpers
  const getSiswaByKelas = (kelasId: string): Siswa[] => {
    const activeTPId = activeTahunPelajaran?.id;
    const plots = plotingList.filter(
      (p) => p.kelasId === kelasId && (!activeTPId || p.tahunPelajaranId === activeTPId)
    );
    const siswaIds = plots.map((p) => p.siswaId);
    return siswaList.filter((s) => siswaIds.includes(s.id));
  };

  const getUnassignedSiswa = (tahunPelajaranId: string): Siswa[] => {
    const assignedIds = plotingList
      .filter((p) => p.tahunPelajaranId === tahunPelajaranId)
      .map((p) => p.siswaId);
    return siswaList.filter((s) => !assignedIds.includes(s.id));
  };

  const getKelasBySiswa = (siswaId: string, tahunPelajaranId: string): Kelas | undefined => {
    const plot = plotingList.find(
      (p) => p.siswaId === siswaId && p.tahunPelajaranId === tahunPelajaranId
    );
    if (!plot) return undefined;
    return kelasList.find((k) => k.id === plot.kelasId);
  };

  // Reset to sample data
  const resetToSampleData = () => {
    setUserList(INITIAL_USERS);
    setCurrentUser(INITIAL_USERS[0]);
    setTahunPelajaranList(INITIAL_TAHUN_PELAJARAN);
    setKelasList(INITIAL_KELAS);
    setSiswaList(INITIAL_SISWA);
    setPlotingList(INITIAL_PLOTING);
    setCatatanHarianList(INITIAL_CATATAN_HARIAN);
  };

  // Export JSON
  const exportDataJSON = () => {
    const data = {
      userList,
      tahunPelajaranList,
      kelasList,
      siswaList,
      plotingList,
      catatanHarianList,
      exportedAt: new Date().toISOString(),
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `backup_jurnal_alhaqq_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Import JSON
  const importDataJSON = (jsonString: string): boolean => {
    try {
      const data = JSON.parse(jsonString);
      if (data.tahunPelajaranList && data.kelasList && data.siswaList) {
        if (data.userList) setUserList(data.userList);
        setTahunPelajaranList(data.tahunPelajaranList);
        setKelasList(data.kelasList);
        setSiswaList(data.siswaList);
        if (data.plotingList) setPlotingList(data.plotingList);
        if (data.catatanHarianList) setCatatanHarianList(data.catatanHarianList);
        return true;
      }
      return false;
    } catch (e) {
      console.error('Import failed', e);
      return false;
    }
  };

  return (
    <AppContext.Provider
      value={{
        userList,
        currentUser,
        isAdmin,
        isGuru,
        login,
        logout,
        switchUser,
        addUser,
        updateUser,
        deleteUser,
        resetUserPassword,
        changePassword,
        updateProfile,
        getAllowedClasses,
        canManageMasterData,
        tahunPelajaranList,
        activeTahunPelajaran,
        addTahunPelajaran,
        updateTahunPelajaran,
        deleteTahunPelajaran,
        setActiveTahunPelajaran,
        kelasList,
        addKelas,
        updateKelas,
        deleteKelas,
        siswaList,
        addSiswa,
        updateSiswa,
        deleteSiswa,
        plotingList,
        assignSiswaToKelas,
        batchAssignSiswaToKelas,
        removeSiswaFromKelas,
        catatanHarianList,
        saveCatatanHarian,
        batchSaveCatatanHarian,
        deleteCatatanHarian,
        getCatatanHarianByDateAndSiswa,
        getSiswaByKelas,
        getUnassignedSiswa,
        getKelasBySiswa,
        resetToSampleData,
        exportDataJSON,
        importDataJSON,
        showToast,
      }}
    >
      {children}
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
