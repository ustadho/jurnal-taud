import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { Siswa, JenisKelamin } from '../../types';
import { 
  Plus, 
  Search, 
  Edit2, 
  Trash2, 
  Eye, 
  Phone, 
  MapPin, 
  Calendar, 
  User, 
  FileSpreadsheet,
  Users
} from 'lucide-react';

export const StudentMaster: React.FC = () => {
  const {
    siswaList,
    addSiswa,
    updateSiswa,
    deleteSiswa,
    activeTahunPelajaran,
    getKelasBySiswa,
    canManageMasterData,
    showToast,
  } = useApp();

  const isEditable = canManageMasterData();
  const [deleteStudentCandidate, setDeleteStudentCandidate] = useState<{ id: string; nama: string } | null>(null);

  const [searchQuery, setSearchQuery] = useState('');
  const [filterGender, setFilterGender] = useState<'ALL' | 'L' | 'P'>('ALL');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Siswa | null>(null);
  const [viewingItem, setViewingItem] = useState<Siswa | null>(null);

  const initialFormState: Omit<Siswa, 'id'> = {
    no_induk: '',
    nama_siswa: '',
    panggilan: '',
    jenis_kelamin: 'L',
    tempat_lahir: '',
    tgl_lahir: '2020-01-01',
    alamat: '',
    nama_ayah: '',
    hp_ayah: '',
    nama_ibu: '',
    hp_ibu: '',
    tahun_masuk: new Date().getFullYear().toString(),
  };

  const [formData, setFormData] = useState<Omit<Siswa, 'id'>>(initialFormState);

  const filteredStudents = useMemo(() => {
    return siswaList.filter((s) => {
      const matchSearch =
        s.nama_siswa.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.no_induk.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (s.panggilan && s.panggilan.toLowerCase().includes(searchQuery.toLowerCase())) ||
        s.nama_ayah.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.nama_ibu.toLowerCase().includes(searchQuery.toLowerCase());

      const matchGender = filterGender === 'ALL' || s.jenis_kelamin === filterGender;
      return matchSearch && matchGender;
    });
  }, [siswaList, searchQuery, filterGender]);

  const handleOpenAdd = () => {
    setEditingItem(null);
    // Generate next NIS suggestion
    const nextNIS = `TK${new Date().getFullYear()}${String(siswaList.length + 1).padStart(3, '0')}`;
    setFormData({
      ...initialFormState,
      no_induk: nextNIS,
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (item: Siswa) => {
    setEditingItem(item);
    setFormData({
      no_induk: item.no_induk,
      nama_siswa: item.nama_siswa,
      panggilan: item.panggilan || '',
      jenis_kelamin: item.jenis_kelamin,
      tempat_lahir: item.tempat_lahir,
      tgl_lahir: item.tgl_lahir,
      alamat: item.alamat,
      nama_ayah: item.nama_ayah,
      hp_ayah: item.hp_ayah,
      nama_ibu: item.nama_ibu,
      hp_ibu: item.hp_ibu,
      tahun_masuk: item.tahun_masuk,
    });
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.no_induk.trim() || !formData.nama_siswa.trim()) {
      showToast('Nomor Induk dan Nama Siswa wajib diisi.', 'warning');
      return;
    }

    if (editingItem) {
      updateSiswa(editingItem.id, formData);
    } else {
      addSiswa(formData);
    }
    setIsModalOpen(false);
  };

  const handleDeleteClick = (id: string, nama: string) => {
    setDeleteStudentCandidate({ id, nama });
  };

  const confirmDeleteStudent = () => {
    if (deleteStudentCandidate) {
      deleteSiswa(deleteStudentCandidate.id);
      setDeleteStudentCandidate(null);
    }
  };

  const exportCSV = () => {
    const headers = [
      'No Induk',
      'Nama Siswa',
      'Panggilan',
      'L/P',
      'Tempat Lahir',
      'Tanggal Lahir',
      'Alamat',
      'Nama Ayah',
      'HP Ayah',
      'Nama Ibu',
      'HP Ibu',
      'Tahun Masuk',
    ];
    const rows = filteredStudents.map((s) => [
      `"${s.no_induk}"`,
      `"${s.nama_siswa}"`,
      `"${s.panggilan || ''}"`,
      `"${s.jenis_kelamin}"`,
      `"${s.tempat_lahir}"`,
      `"${s.tgl_lahir}"`,
      `"${s.alamat.replace(/"/g, '""')}"`,
      `"${s.nama_ayah}"`,
      `"${s.hp_ayah}"`,
      `"${s.nama_ibu}"`,
      `"${s.hp_ibu}"`,
      `"${s.tahun_masuk}"`,
    ]);

    const csvContent = [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `data_siswa_tk_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Master Data Siswa</h2>
          <p className="text-sm text-slate-600 mt-1">
            Buku induk peserta didik TK lengkap dengan biodata dan kontak orang tua / wali.
          </p>
        </div>
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            onClick={exportCSV}
            className="inline-flex items-center gap-2 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium rounded-lg text-sm transition-colors"
            title="Ekspor ke format Excel / CSV"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
            <span className="hidden sm:inline">Ekspor CSV</span>
          </button>
          {isEditable && (
            <button
              onClick={handleOpenAdd}
              className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-lg text-sm transition-colors shadow-xs"
            >
              <Plus className="w-4 h-4" />
              <span>Tambah Siswa Baru</span>
            </button>
          )}
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white p-3.5 rounded-xl border border-slate-200 flex flex-col md:flex-row gap-3 items-center justify-between">
        <div className="relative w-full md:w-96">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Cari nama siswa, nomor induk, atau orang tua..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto justify-between md:justify-end">
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg">
            <button
              onClick={() => setFilterGender('ALL')}
              className={`px-3 py-1 text-xs font-semibold rounded-md transition-colors ${
                filterGender === 'ALL'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Semua ({siswaList.length})
            </button>
            <button
              onClick={() => setFilterGender('L')}
              className={`px-3 py-1 text-xs font-semibold rounded-md transition-colors ${
                filterGender === 'L'
                  ? 'bg-white text-sky-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Laki-laki
            </button>
            <button
              onClick={() => setFilterGender('P')}
              className={`px-3 py-1 text-xs font-semibold rounded-md transition-colors ${
                filterGender === 'P'
                  ? 'bg-white text-rose-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Perempuan
            </button>
          </div>
        </div>
      </div>

      {/* Table list */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold text-xs uppercase tracking-wider">
              <tr>
                <th className="py-3 px-4">No. Induk</th>
                <th className="py-3 px-4">Nama Siswa</th>
                <th className="py-3 px-4">L/P</th>
                <th className="py-3 px-4">Kelahiran</th>
                <th className="py-3 px-4">Kelas Saat Ini</th>
                <th className="py-3 px-4">Kontak Orang Tua</th>
                <th className="py-3 px-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs sm:text-sm">
              {filteredStudents.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-500">
                    <Users className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                    Tidak ada data siswa yang cocok dengan pencarian.
                  </td>
                </tr>
              ) : (
                filteredStudents.map((siswa) => {
                  const currentClass = activeTahunPelajaran
                    ? getKelasBySiswa(siswa.id, activeTahunPelajaran.id)
                    : undefined;

                  return (
                    <tr key={siswa.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3.5 px-4 font-mono font-medium text-slate-700">
                        {siswa.no_induk}
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-slate-900">
                          {siswa.nama_siswa}
                        </div>
                        {siswa.panggilan && (
                          <div className="text-xs text-slate-500">
                            Panggilan: {siswa.panggilan}
                          </div>
                        )}
                      </td>
                      <td className="py-3.5 px-4">
                        <span
                          className={`inline-block px-2 py-0.5 rounded text-xs font-bold ${
                            siswa.jenis_kelamin === 'L'
                              ? 'bg-sky-50 text-sky-700'
                              : 'bg-rose-50 text-rose-700'
                          }`}
                        >
                          {siswa.jenis_kelamin === 'L' ? 'Laki-laki' : 'Perempuan'}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-slate-600 text-xs">
                        <div>{siswa.tempat_lahir}</div>
                        <div className="text-slate-400">{siswa.tgl_lahir}</div>
                      </td>
                      <td className="py-3.5 px-4">
                        {currentClass ? (
                          <span className="text-xs font-semibold text-emerald-800 bg-emerald-50 px-2 py-1 rounded">
                            {currentClass.namaKelas}
                          </span>
                        ) : (
                          <span className="text-xs text-amber-700 bg-amber-50 px-2 py-1 rounded">
                            Belum di-plot
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-xs text-slate-600">
                        <div>Ayah: {siswa.nama_ayah} ({siswa.hp_ayah})</div>
                        <div className="text-slate-400">Ibu: {siswa.nama_ibu} ({siswa.hp_ibu})</div>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => setViewingItem(siswa)}
                            className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-md transition-colors"
                            title="Lihat Detail Profil"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          {isEditable && (
                            <>
                              <button
                                onClick={() => handleOpenEdit(siswa)}
                                className="p-1.5 text-slate-500 hover:text-emerald-700 hover:bg-slate-100 rounded-md transition-colors"
                                title="Ubah Data Siswa"
                              >
                                <Edit2 className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleDeleteClick(siswa.id, siswa.nama_siswa)}
                                className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-md transition-colors"
                                title="Hapus"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-2xl w-full shadow-2xl border border-slate-200 overflow-hidden my-8">
            <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-slate-900 text-lg">
                  {editingItem ? 'Ubah Data Siswa' : 'Tambah Siswa Baru'}
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Isi data identitas diri anak dan kontak orang tua dengan lengkap.
                </p>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-700 text-2xl font-bold leading-none"
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
              <div className="border-b border-slate-100 pb-3">
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-700">
                  A. Identitas Siswa
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Nomor Induk Siswa (NIS) *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: TK2025001"
                    value={formData.no_induk}
                    onChange={(e) => setFormData({ ...formData, no_induk: e.target.value })}
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Tahun Masuk
                  </label>
                  <input
                    type="text"
                    placeholder="2025"
                    value={formData.tahun_masuk}
                    onChange={(e) => setFormData({ ...formData, tahun_masuk: e.target.value })}
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Nama Lengkap Siswa *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: Muhammad Rayhan Al-Fatih"
                    value={formData.nama_siswa}
                    onChange={(e) => setFormData({ ...formData, nama_siswa: e.target.value })}
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Nama Panggilan
                  </label>
                  <input
                    type="text"
                    placeholder="Rayhan"
                    value={formData.panggilan || ''}
                    onChange={(e) => setFormData({ ...formData, panggilan: e.target.value })}
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Jenis Kelamin *
                  </label>
                  <select
                    value={formData.jenis_kelamin}
                    onChange={(e) =>
                      setFormData({ ...formData, jenis_kelamin: e.target.value as JenisKelamin })
                    }
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
                  >
                    <option value="L">Laki-laki</option>
                    <option value="P">Perempuan</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Tempat Lahir *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Jakarta"
                    value={formData.tempat_lahir}
                    onChange={(e) => setFormData({ ...formData, tempat_lahir: e.target.value })}
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Tanggal Lahir *
                  </label>
                  <input
                    type="date"
                    required
                    value={formData.tgl_lahir}
                    onChange={(e) => setFormData({ ...formData, tgl_lahir: e.target.value })}
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Alamat Tempat Tinggal *
                </label>
                <textarea
                  required
                  rows={2}
                  placeholder="Jl. Melati Raya No. 12, RT 03/RW 04..."
                  value={formData.alamat}
                  onChange={(e) => setFormData({ ...formData, alamat: e.target.value })}
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="border-b border-slate-100 pt-2 pb-2">
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-700">
                  B. Data Orang Tua / Wali
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Nama Ayah Kandung *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Hendrawan Kusuma"
                    value={formData.nama_ayah}
                    onChange={(e) => setFormData({ ...formData, nama_ayah: e.target.value })}
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    No. HP / WhatsApp Ayah *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="081234567890"
                    value={formData.hp_ayah}
                    onChange={(e) => setFormData({ ...formData, hp_ayah: e.target.value })}
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Nama Ibu Kandung *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Nurul Hidayati"
                    value={formData.nama_ibu}
                    onChange={(e) => setFormData({ ...formData, nama_ibu: e.target.value })}
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    No. HP / WhatsApp Ibu *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="081987654321"
                    value={formData.hp_ibu}
                    onChange={(e) => setFormData({ ...formData, hp_ibu: e.target.value })}
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
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
                  className="px-4 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-colors shadow-xs"
                >
                  {editingItem ? 'Simpan Perubahan' : 'Simpan Data Siswa'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Detail Modal */}
      {viewingItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-slate-200 overflow-hidden">
            <div className="px-6 py-4 bg-emerald-700 text-white flex items-center justify-between">
              <div>
                <h3 className="font-bold text-lg">{viewingItem.nama_siswa}</h3>
                <p className="text-xs text-emerald-100">
                  NIS: {viewingItem.no_induk} · Panggilan: {viewingItem.panggilan || '-'}
                </p>
              </div>
              <button
                onClick={() => setViewingItem(null)}
                className="text-emerald-200 hover:text-white text-2xl font-bold"
              >
                &times;
              </button>
            </div>

            <div className="p-6 space-y-4 text-xs sm:text-sm">
              <div className="grid grid-cols-2 gap-4 bg-slate-50 p-4 rounded-xl">
                <div>
                  <span className="text-slate-500 block text-xs">Jenis Kelamin</span>
                  <span className="font-semibold text-slate-800">
                    {viewingItem.jenis_kelamin === 'L' ? 'Laki-laki' : 'Perempuan'}
                  </span>
                </div>
                <div>
                  <span className="text-slate-500 block text-xs">Tahun Masuk</span>
                  <span className="font-semibold text-slate-800">{viewingItem.tahun_masuk}</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-xs">Tempat, Tgl Lahir</span>
                  <span className="font-semibold text-slate-800">
                    {viewingItem.tempat_lahir}, {viewingItem.tgl_lahir}
                  </span>
                </div>
                <div>
                  <span className="text-slate-500 block text-xs">Kelas Terploting</span>
                  <span className="font-semibold text-emerald-700">
                    {activeTahunPelajaran
                      ? getKelasBySiswa(viewingItem.id, activeTahunPelajaran.id)?.namaKelas || 'Belum di-plot'
                      : '-'}
                  </span>
                </div>
              </div>

              <div>
                <span className="text-slate-500 block text-xs mb-1">Alamat Tinggal</span>
                <p className="text-slate-800 bg-slate-50 p-3 rounded-lg border border-slate-100">
                  {viewingItem.alamat}
                </p>
              </div>

              <div className="border-t border-slate-200 pt-3">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-700 block mb-2">
                  Kontak Orang Tua
                </span>
                <div className="space-y-2">
                  <div className="flex items-center justify-between p-2.5 bg-slate-50 rounded-lg">
                    <div>
                      <span className="font-semibold text-slate-900 block">Ayah: {viewingItem.nama_ayah}</span>
                      <span className="text-xs text-slate-500">{viewingItem.hp_ayah}</span>
                    </div>
                    <a
                      href={`https://wa.me/${viewingItem.hp_ayah.replace(/^0/, '62')}`}
                      target="_blank"
                      rel="noreferrer"
                      className="px-2.5 py-1 text-xs font-semibold text-emerald-700 bg-emerald-100 hover:bg-emerald-200 rounded-md transition-colors"
                    >
                      WhatsApp
                    </a>
                  </div>

                  <div className="flex items-center justify-between p-2.5 bg-slate-50 rounded-lg">
                    <div>
                      <span className="font-semibold text-slate-900 block">Ibu: {viewingItem.nama_ibu}</span>
                      <span className="text-xs text-slate-500">{viewingItem.hp_ibu}</span>
                    </div>
                    <a
                      href={`https://wa.me/${viewingItem.hp_ibu.replace(/^0/, '62')}`}
                      target="_blank"
                      rel="noreferrer"
                      className="px-2.5 py-1 text-xs font-semibold text-emerald-700 bg-emerald-100 hover:bg-emerald-200 rounded-md transition-colors"
                    >
                      WhatsApp
                    </a>
                  </div>
                </div>
              </div>

              <div className="pt-2 text-right">
                <button
                  onClick={() => setViewingItem(null)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium rounded-lg text-xs"
                >
                  Tutup
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteStudentCandidate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-xl max-w-sm w-full p-6 border border-slate-100">
            <div className="w-12 h-12 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center mx-auto mb-4">
              <Trash2 className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-900 text-center mb-1">
              Hapus Data Siswa?
            </h3>
            <p className="text-xs text-slate-600 text-center mb-6">
              Apakah Anda yakin ingin menghapus data siswa <span className="font-bold text-slate-800">"{deleteStudentCandidate.nama}"</span>? Data kehadiran dan riwayat jurnal harian siswa ini akan ikut terhapus.
            </p>
            <div className="flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setDeleteStudentCandidate(null)}
                className="flex-1 px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={confirmDeleteStudent}
                className="flex-1 px-4 py-2 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-lg transition-colors shadow-xs"
              >
                Ya, Hapus
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
