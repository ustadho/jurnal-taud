import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { TahunPelajaran } from '../../types';
import { Plus, Edit2, Trash2, CheckCircle2, Calendar, AlertCircle } from 'lucide-react';

export const AcademicYearMaster: React.FC = () => {
  const {
    tahunPelajaranList,
    activeTahunPelajaran,
    addTahunPelajaran,
    updateTahunPelajaran,
    deleteTahunPelajaran,
    setActiveTahunPelajaran,
    canManageMasterData,
    showToast,
  } = useApp();

  const isEditable = canManageMasterData();
  const [deleteYearCandidate, setDeleteYearCandidate] = useState<{ id: string; nama: string } | null>(null);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<TahunPelajaran | null>(null);

  const [formData, setFormData] = useState<{
    nama: string;
    semester: 'Ganjil' | 'Genap';
    status: 'aktif' | 'nonaktif';
    catatan: string;
  }>({
    nama: '',
    semester: 'Ganjil',
    status: 'aktif',
    catatan: '',
  });

  const handleOpenAdd = () => {
    setEditingItem(null);
    setFormData({
      nama: '2026/2027',
      semester: 'Ganjil',
      status: 'nonaktif',
      catatan: '',
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (item: TahunPelajaran) => {
    setEditingItem(item);
    setFormData({
      nama: item.nama,
      semester: item.semester,
      status: item.status,
      catatan: item.catatan || '',
    });
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.nama.trim()) {
      showToast('Nama tahun pelajaran harus diisi, misal 2025/2026', 'warning');
      return;
    }

    if (editingItem) {
      updateTahunPelajaran(editingItem.id, formData);
    } else {
      addTahunPelajaran(formData);
    }
    setIsModalOpen(false);
  };

  const handleDeleteClick = (id: string, nama: string) => {
    setDeleteYearCandidate({ id, nama });
  };

  const confirmDeleteYear = () => {
    if (deleteYearCandidate) {
      deleteTahunPelajaran(deleteYearCandidate.id);
      setDeleteYearCandidate(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Master Tahun Pelajaran</h2>
          <p className="text-sm text-slate-600 mt-1">
            Kelola periode tahun ajaran aktif dan semester kegiatan pembelajaran TK.
          </p>
        </div>
        {isEditable && (
          <button
            onClick={handleOpenAdd}
            className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-lg text-sm transition-colors shadow-xs shrink-0 self-start sm:self-auto"
          >
            <Plus className="w-4 h-4" />
            <span>Tambah Tahun Pelajaran</span>
          </button>
        )}
      </div>

      {/* Table list */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold">
              <tr>
                <th className="py-3 px-4">Tahun Pelajaran</th>
                <th className="py-3 px-4">Semester</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Catatan</th>
                {isEditable && <th className="py-3 px-4 text-right">Aksi</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {tahunPelajaranList.length === 0 ? (
                <tr>
                  <td colSpan={isEditable ? 5 : 4} className="py-8 text-center text-slate-500">
                    Belum ada data tahun pelajaran.
                  </td>
                </tr>
              ) : (
                tahunPelajaranList.map((item) => {
                  const isActive = item.status === 'aktif';
                  return (
                    <tr key={item.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3.5 px-4 font-semibold text-slate-900">
                        {item.nama}
                      </td>
                      <td className="py-3.5 px-4 text-slate-700">
                        Semester {item.semester}
                      </td>
                      <td className="py-3.5 px-4">
                        {isActive ? (
                          <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-800 bg-emerald-100/70 px-2.5 py-1 rounded-md">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                            Aktif Berjalan
                          </span>
                        ) : isEditable ? (
                          <button
                            onClick={() => setActiveTahunPelajaran(item.id)}
                            className="text-xs font-medium text-slate-600 hover:text-emerald-700 bg-slate-100 hover:bg-slate-200 px-2.5 py-1 rounded-md transition-colors"
                          >
                            Set Sebagai Aktif
                          </button>
                        ) : (
                          <span className="text-xs text-slate-400">Non-Aktif</span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-slate-600 text-xs">
                        {item.catatan || '-'}
                      </td>
                      {isEditable && (
                        <td className="py-3.5 px-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => handleOpenEdit(item)}
                              className="p-1.5 text-slate-600 hover:text-emerald-700 hover:bg-slate-100 rounded-md transition-colors"
                              title="Ubah"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteClick(item.id, item.nama)}
                              disabled={isActive && tahunPelajaranList.length > 1}
                              className={`p-1.5 rounded-md transition-colors ${
                                isActive && tahunPelajaranList.length > 1
                                  ? 'text-slate-300 cursor-not-allowed'
                                  : 'text-slate-500 hover:text-rose-600 hover:bg-rose-50'
                              }`}
                              title={
                                isActive && tahunPelajaranList.length > 1
                                  ? 'Nonaktifkan dulu sebelum menghapus'
                                  : 'Hapus'
                              }
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      )}
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Dialog */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-xl border border-slate-200 overflow-hidden">
            <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
              <h3 className="font-bold text-slate-900">
                {editingItem ? 'Ubah Tahun Pelajaran' : 'Tambah Tahun Pelajaran Baru'}
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
                  Nama Tahun Pelajaran (misal: 2025/2026) *
                </label>
                <input
                  type="text"
                  required
                  placeholder="2025/2026"
                  value={formData.nama}
                  onChange={(e) => setFormData({ ...formData, nama: e.target.value })}
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Semester *
                </label>
                <select
                  value={formData.semester}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      semester: e.target.value as 'Ganjil' | 'Genap',
                    })
                  }
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
                >
                  <option value="Ganjil">Semester Ganjil</option>
                  <option value="Genap">Semester Genap</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Status Keaktifan
                </label>
                <select
                  value={formData.status}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      status: e.target.value as 'aktif' | 'nonaktif',
                    })
                  }
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
                >
                  <option value="aktif">Aktif (Tahun Berjalan)</option>
                  <option value="nonaktif">Non-Aktif (Arsip)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Catatan Tambahan
                </label>
                <input
                  type="text"
                  placeholder="Keterangan opsional"
                  value={formData.catatan}
                  onChange={(e) => setFormData({ ...formData, catatan: e.target.value })}
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
      {deleteYearCandidate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-xl max-w-sm w-full p-6 border border-slate-100">
            <div className="w-12 h-12 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center mx-auto mb-4">
              <Trash2 className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-900 text-center mb-1">
              Hapus Tahun Pelajaran?
            </h3>
            <p className="text-xs text-slate-600 text-center mb-6">
              Apakah Anda yakin ingin menghapus Tahun Pelajaran <span className="font-bold text-slate-800">"{deleteYearCandidate.nama}"</span>?
            </p>
            <div className="flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setDeleteYearCandidate(null)}
                className="flex-1 px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={confirmDeleteYear}
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
