import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Kelas } from '../../types';
import { Plus, Edit2, Trash2, Users, School } from 'lucide-react';

export const ClassMaster: React.FC = () => {
  const {
    kelasList,
    tahunPelajaranList,
    activeTahunPelajaran,
    addKelas,
    updateKelas,
    deleteKelas,
    getSiswaByKelas,
    canManageMasterData,
    showToast,
  } = useApp();

  const isEditable = canManageMasterData();
  const [deleteClassCandidate, setDeleteClassCandidate] = useState<{ id: string; nama: string; studentCount: number } | null>(null);

  const [selectedTahunId, setSelectedTahunId] = useState<string>(
    activeTahunPelajaran?.id || tahunPelajaranList[0]?.id || ''
  );

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Kelas | null>(null);

  const [formData, setFormData] = useState<{
    tahunPelajaranId: string;
    namaKelas: string;
    tingkat: 'KB' | 'TK-A' | 'TK-B';
    waliKelas: string;
    pendampingKelas: string;
    kapasitas: number;
  }>({
    tahunPelajaranId: selectedTahunId,
    namaKelas: '',
    tingkat: 'TK-A',
    waliKelas: '',
    pendampingKelas: '',
    kapasitas: 15,
  });

  const filteredKelas = kelasList.filter((k) => k.tahunPelajaranId === selectedTahunId);

  const handleOpenAdd = () => {
    setEditingItem(null);
    setFormData({
      tahunPelajaranId: selectedTahunId,
      namaKelas: '',
      tingkat: 'TK-A',
      waliKelas: '',
      pendampingKelas: '',
      kapasitas: 15,
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (item: Kelas) => {
    setEditingItem(item);
    setFormData({
      tahunPelajaranId: item.tahunPelajaranId,
      namaKelas: item.namaKelas,
      tingkat: item.tingkat,
      waliKelas: item.waliKelas,
      pendampingKelas: item.pendampingKelas || '',
      kapasitas: item.kapasitas,
    });
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.namaKelas.trim()) {
      showToast('Nama kelas harus diisi', 'warning');
      return;
    }
    if (!formData.waliKelas.trim()) {
      showToast('Wali kelas harus diisi', 'warning');
      return;
    }

    if (editingItem) {
      updateKelas(editingItem.id, formData);
    } else {
      addKelas(formData);
    }
    setIsModalOpen(false);
  };

  const handleDeleteClick = (id: string, nama: string) => {
    const studentCount = getSiswaByKelas(id).length;
    setDeleteClassCandidate({ id, nama, studentCount });
  };

  const confirmDeleteClass = () => {
    if (deleteClassCandidate) {
      deleteKelas(deleteClassCandidate.id);
      setDeleteClassCandidate(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Master Kelas</h2>
          <p className="text-sm text-slate-600 mt-1">
            Daftar kelas pembelajaran untuk kelompok bermain, TK-A, dan TK-B pada tahun pelajaran terkait.
          </p>
        </div>
        {isEditable && (
          <button
            onClick={handleOpenAdd}
            className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-lg text-sm transition-colors shadow-xs shrink-0 self-start sm:self-auto"
          >
            <Plus className="w-4 h-4" />
            <span>Tambah Kelas Baru</span>
          </button>
        )}
      </div>

      {/* Filter Tahun Pelajaran */}
      <div className="flex items-center gap-3 bg-white p-3 rounded-xl border border-slate-200">
        <span className="text-xs font-semibold text-slate-700">Tahun Pelajaran:</span>
        <select
          value={selectedTahunId}
          onChange={(e) => setSelectedTahunId(e.target.value)}
          className="text-xs font-medium border border-slate-300 rounded-lg px-3 py-1.5 bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
        >
          {tahunPelajaranList.map((tp) => (
            <option key={tp.id} value={tp.id}>
              TP {tp.nama} ({tp.semester}) {tp.status === 'aktif' ? '• Aktif' : ''}
            </option>
          ))}
        </select>
        <span className="text-xs text-slate-500 ml-auto">
          {filteredKelas.length} Kelas terdaftar
        </span>
      </div>

      {/* Grid of classes */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredKelas.length === 0 ? (
          <div className="col-span-full py-12 text-center bg-white border border-dashed border-slate-300 rounded-xl">
            <School className="w-10 h-10 text-slate-300 mx-auto mb-2" />
            <p className="text-sm font-medium text-slate-700">Belum ada kelas di tahun pelajaran ini.</p>
            {isEditable && (
              <p className="text-xs text-slate-500 mt-1">Klik tombol 'Tambah Kelas Baru' untuk menambahkan kelompok kelas.</p>
            )}
          </div>
        ) : (
          filteredKelas.map((kelas) => {
            const siswaInClass = getSiswaByKelas(kelas.id);
            return (
              <div
                key={kelas.id}
                className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs hover:border-emerald-300 transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div>
                      <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                        {kelas.tingkat}
                      </span>
                      <h3 className="text-base font-bold text-slate-900 mt-1">
                        {kelas.namaKelas}
                      </h3>
                    </div>
                    {isEditable && (
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleOpenEdit(kelas)}
                          className="p-1 text-slate-400 hover:text-slate-700 rounded transition-colors"
                          title="Ubah"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteClick(kelas.id, kelas.namaKelas)}
                          className="p-1 text-slate-400 hover:text-rose-600 rounded transition-colors"
                          title="Hapus"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    )}
                  </div>

                  <div className="space-y-1.5 mt-3 text-xs text-slate-600">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500">Wali Kelas:</span>
                      <span className="font-semibold text-slate-800">{kelas.waliKelas}</span>
                    </div>
                    {kelas.pendampingKelas && (
                      <div className="flex items-center justify-between">
                        <span className="text-slate-500">Pendamping:</span>
                        <span className="font-medium text-slate-700">{kelas.pendampingKelas}</span>
                      </div>
                    )}
                    <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                      <span className="text-slate-500">Terisi / Kapasitas:</span>
                      <span className="font-bold text-slate-900">
                        {siswaInClass.length} / {kelas.kapasitas} Siswa
                      </span>
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                  <span className="flex items-center gap-1">
                    <Users className="w-3.5 h-3.5 text-slate-400" />
                    <span>{siswaInClass.length} siswa aktif</span>
                  </span>
                  <div className="w-20 bg-slate-100 rounded-full h-1.5 overflow-hidden">
                    <div
                      className="bg-emerald-500 h-1.5 rounded-full"
                      style={{
                        width: `${Math.min(100, (siswaInClass.length / (kelas.kapasitas || 1)) * 100)}%`,
                      }}
                    />
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Modal Dialog */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-xl border border-slate-200 overflow-hidden">
            <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
              <h3 className="font-bold text-slate-900">
                {editingItem ? 'Ubah Data Kelas' : 'Tambah Kelas Baru'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-700 text-xl font-bold"
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Tahun Pelajaran *
                </label>
                <select
                  value={formData.tahunPelajaranId}
                  onChange={(e) =>
                    setFormData({ ...formData, tahunPelajaranId: e.target.value })
                  }
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
                >
                  {tahunPelajaranList.map((tp) => (
                    <option key={tp.id} value={tp.id}>
                      TP {tp.nama} ({tp.semester})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Tingkat / Jenjang *
                </label>
                <select
                  value={formData.tingkat}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      tingkat: e.target.value as 'KB' | 'TK-A' | 'TK-B',
                    })
                  }
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
                >
                  <option value="KB">Kelompok Bermain (KB)</option>
                  <option value="TK-A">TK-A (Usia 4-5 Tahun)</option>
                  <option value="TK-B">TK-B (Usia 5-6 Tahun)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Nama Kelas * (misal: TK-A Bintang / Al-Fatihah)
                </label>
                <input
                  type="text"
                  required
                  placeholder="TK-A Bintang"
                  value={formData.namaKelas}
                  onChange={(e) =>
                    setFormData({ ...formData, namaKelas: e.target.value })
                  }
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Wali Kelas *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ustadzah Fatimah, S.Pd."
                  value={formData.waliKelas}
                  onChange={(e) =>
                    setFormData({ ...formData, waliKelas: e.target.value })
                  }
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Pendamping Kelas (Opsional)
                </label>
                <input
                  type="text"
                  placeholder="Ustadzah Maryam"
                  value={formData.pendampingKelas}
                  onChange={(e) =>
                    setFormData({ ...formData, pendampingKelas: e.target.value })
                  }
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Kapasitas Siswa
                </label>
                <input
                  type="number"
                  min="1"
                  max="40"
                  value={formData.kapasitas}
                  onChange={(e) =>
                    setFormData({ ...formData, kapasitas: parseInt(e.target.value) || 15 })
                  }
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
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
                  className="px-4 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-colors shadow-xs"
                >
                  {editingItem ? 'Simpan Perubahan' : 'Tambahkan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteClassCandidate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-xl max-w-sm w-full p-6 border border-slate-100">
            <div className="w-12 h-12 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center mx-auto mb-4">
              <Trash2 className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-900 text-center mb-1">
              Hapus Kelas?
            </h3>
            <p className="text-xs text-slate-600 text-center mb-6">
              {deleteClassCandidate.studentCount > 0 ? (
                <>
                  Kelas <span className="font-bold text-slate-800">"{deleteClassCandidate.nama}"</span> memiliki{' '}
                  <span className="font-bold text-rose-600">{deleteClassCandidate.studentCount} siswa</span> terploting. Menghapus kelas akan melepas ploting siswa ini.
                </>
              ) : (
                <>
                  Apakah Anda yakin ingin menghapus kelas <span className="font-bold text-slate-800">"{deleteClassCandidate.nama}"</span>?
                </>
              )}
            </p>
            <div className="flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setDeleteClassCandidate(null)}
                className="flex-1 px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={confirmDeleteClass}
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
