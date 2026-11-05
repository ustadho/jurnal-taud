import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Siswa } from '../../types';
import { 
  Users, 
  ArrowRight, 
  CheckSquare, 
  Square, 
  X, 
  School, 
  AlertCircle,
  MoveRight,
  UserCheck
} from 'lucide-react';

export const PlottingMaster: React.FC = () => {
  const {
    kelasList,
    tahunPelajaranList,
    activeTahunPelajaran,
    siswaList,
    plotingList,
    assignSiswaToKelas,
    batchAssignSiswaToKelas,
    removeSiswaFromKelas,
    getSiswaByKelas,
    getUnassignedSiswa,
    canManageMasterData,
    showToast,
  } = useApp();

  const isEditable = canManageMasterData();

  const [selectedTahunId, setSelectedTahunId] = useState<string>(
    activeTahunPelajaran?.id || tahunPelajaranList[0]?.id || ''
  );

  const classesInYear = kelasList.filter((k) => k.tahunPelajaranId === selectedTahunId);

  const [selectedKelasId, setSelectedKelasId] = useState<string>(
    classesInYear[0]?.id || ''
  );

  // Update selectedKelasId if selectedTahunId changes and current class is not in the year
  const activeClass = classesInYear.find((k) => k.id === selectedKelasId) || classesInYear[0];
  const currentClassId = activeClass?.id || '';

  const enrolledStudents = currentClassId ? getSiswaByKelas(currentClassId) : [];
  const unassignedStudents = selectedTahunId ? getUnassignedSiswa(selectedTahunId) : [];

  const [selectedUnassignedIds, setSelectedUnassignedIds] = useState<string[]>([]);
  const [transferModalStudent, setTransferModalStudent] = useState<Siswa | null>(null);
  const [targetTransferClassId, setTargetTransferClassId] = useState<string>('');
  const [removeCandidate, setRemoveCandidate] = useState<{ siswaId: string; namaSiswa: string } | null>(null);

  const toggleSelectUnassigned = (id: string) => {
    setSelectedUnassignedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleSelectAllUnassigned = () => {
    if (selectedUnassignedIds.length === unassignedStudents.length) {
      setSelectedUnassignedIds([]);
    } else {
      setSelectedUnassignedIds(unassignedStudents.map((s) => s.id));
    }
  };

  const handleBatchPlot = () => {
    if (!currentClassId) {
      showToast('Pilih kelas tujuan terlebih dahulu', 'warning');
      return;
    }
    if (selectedUnassignedIds.length === 0) {
      showToast('Pilih setidaknya satu siswa untuk dimasukkan ke kelas', 'warning');
      return;
    }

    batchAssignSiswaToKelas(selectedUnassignedIds, currentClassId, selectedTahunId);
    setSelectedUnassignedIds([]);
  };

  const handleSinglePlot = (siswaId: string) => {
    if (!currentClassId) return;
    assignSiswaToKelas(siswaId, currentClassId, selectedTahunId);
  };

  const handleRemoveClick = (siswaId: string, namaSiswa: string) => {
    setRemoveCandidate({ siswaId, namaSiswa });
  };

  const confirmRemove = () => {
    if (removeCandidate) {
      removeSiswaFromKelas(removeCandidate.siswaId, currentClassId);
      setRemoveCandidate(null);
    }
  };

  const handleTransfer = () => {
    if (!transferModalStudent || !targetTransferClassId) return;
    assignSiswaToKelas(transferModalStudent.id, targetTransferClassId, selectedTahunId);
    setTransferModalStudent(null);
    setTargetTransferClassId('');
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="pb-4 border-b border-slate-200">
        <h2 className="text-xl font-bold text-slate-900">Ploting Data Siswa ke Kelas</h2>
        <p className="text-sm text-slate-600 mt-1">
          Petakan siswa ke dalam rombongan belajar (rombel) kelas pada tahun ajaran yang dipilih.
        </p>
      </div>

      {/* Selectors Bar */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Tahun Pelajaran:
          </label>
          <select
            value={selectedTahunId}
            onChange={(e) => {
              setSelectedTahunId(e.target.value);
              const classes = kelasList.filter((k) => k.tahunPelajaranId === e.target.value);
              if (classes.length > 0) setSelectedKelasId(classes[0].id);
            }}
            className="w-full text-sm font-medium border border-slate-300 rounded-lg px-3 py-2 bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          >
            {tahunPelajaranList.map((tp) => (
              <option key={tp.id} value={tp.id}>
                TP {tp.nama} ({tp.semester}) {tp.status === 'aktif' ? '• Aktif' : ''}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Pilih Kelas Tujuan Rombel:
          </label>
          <select
            value={currentClassId}
            onChange={(e) => setSelectedKelasId(e.target.value)}
            disabled={classesInYear.length === 0}
            className="w-full text-sm font-medium border border-slate-300 rounded-lg px-3 py-2 bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          >
            {classesInYear.length === 0 ? (
              <option value="">Belum ada kelas di TP ini</option>
            ) : (
              classesInYear.map((k) => (
                <option key={k.id} value={k.id}>
                  {k.namaKelas} (Wali: {k.waliKelas})
                </option>
              ))
            )}
          </select>
        </div>
      </div>

      {/* Main Dual-Column Plotting Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Unassigned Students (Pool) */}
        <div className="lg:col-span-5 bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
          <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
            <div>
              <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                <Users className="w-4 h-4 text-slate-600" />
                <span>Siswa Belum Masuk Kelas</span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                {unassignedStudents.length} siswa siap dimasukkan
              </p>
            </div>

            {unassignedStudents.length > 0 && (
              <button
                onClick={handleSelectAllUnassigned}
                className="text-xs font-semibold text-emerald-700 hover:text-emerald-800"
              >
                {selectedUnassignedIds.length === unassignedStudents.length
                  ? 'Batal Pilih'
                  : 'Pilih Semua'}
              </button>
            )}
          </div>

          <div className="p-3 max-h-[460px] overflow-y-auto space-y-2">
            {unassignedStudents.length === 0 ? (
              <div className="py-12 text-center text-slate-400 text-xs">
                <UserCheck className="w-8 h-8 mx-auto text-emerald-500 mb-2 opacity-80" />
                Semua siswa sudah mendapatkan kelas untuk tahun pelajaran ini!
              </div>
            ) : (
              unassignedStudents.map((siswa) => {
                const isSelected = selectedUnassignedIds.includes(siswa.id);
                return (
                  <div
                    key={siswa.id}
                    onClick={() => toggleSelectUnassigned(siswa.id)}
                    className={`p-3 rounded-lg border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                      isSelected
                        ? 'border-emerald-500 bg-emerald-50/50'
                        : 'border-slate-200 hover:border-slate-300 bg-white'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="text-emerald-600 shrink-0">
                        {isSelected ? (
                          <CheckSquare className="w-4 h-4" />
                        ) : (
                          <Square className="w-4 h-4 text-slate-400" />
                        )}
                      </div>
                      <div>
                        <div className="font-semibold text-slate-900 text-xs sm:text-sm">
                          {siswa.nama_siswa}
                        </div>
                        <div className="text-xs text-slate-500 flex items-center gap-2 mt-0.5">
                          <span>NIS: {siswa.no_induk}</span>
                          <span>·</span>
                          <span>{siswa.jenis_kelamin === 'L' ? 'Laki-laki' : 'Perempuan'}</span>
                        </div>
                      </div>
                    </div>

                    {isEditable && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleSinglePlot(siswa.id);
                        }}
                        className="px-2 py-1 text-xs font-medium text-emerald-700 bg-emerald-100 hover:bg-emerald-200 rounded transition-colors shrink-0"
                      >
                        + Masukkan
                      </button>
                    )}
                  </div>
                );
              })
            )}
          </div>

          {unassignedStudents.length > 0 && isEditable && (
            <div className="p-3 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
              <span className="text-xs text-slate-600">
                {selectedUnassignedIds.length} terpilih
              </span>
              <button
                onClick={handleBatchPlot}
                disabled={selectedUnassignedIds.length === 0 || !currentClassId}
                className="px-3 py-1.5 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-colors flex items-center gap-1.5 shadow-xs"
              >
                <span>Masukkan Terpilih</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>

        {/* Center / Right Column: Enrolled Students in Target Class */}
        <div className="lg:col-span-7 bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
          <div className="p-4 bg-emerald-50/70 border-b border-emerald-100 flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-emerald-800 uppercase tracking-wider bg-emerald-100 px-2 py-0.5 rounded">
                  {activeClass?.tingkat || 'Kelas'}
                </span>
                <h3 className="font-bold text-slate-900 text-base">
                  {activeClass?.namaKelas || 'Pilih Kelas'}
                </h3>
              </div>
              <p className="text-xs text-slate-600 mt-1">
                Wali Kelas: <span className="font-semibold text-slate-800">{activeClass?.waliKelas || '-'}</span>
                {activeClass && (
                  <span className="ml-3">
                    Kapasitas: {enrolledStudents.length} / {activeClass.kapasitas} Siswa
                  </span>
                )}
              </p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold text-xs uppercase">
                <tr>
                  <th className="py-2.5 px-3 w-12 text-center">No</th>
                  <th className="py-2.5 px-3">Nama Siswa</th>
                  <th className="py-2.5 px-3">NIS</th>
                  <th className="py-2.5 px-3">L/P</th>
                  <th className="py-2.5 px-3 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {enrolledStudents.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-12 text-center text-slate-500 text-xs">
                      Belum ada siswa di kelas ini. Pilih siswa dari daftar sebelah kiri dan klik tombol Masukkan.
                    </td>
                  </tr>
                ) : (
                  enrolledStudents.map((siswa, idx) => (
                    <tr key={siswa.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-2.5 px-3 text-center font-mono text-slate-400">
                        {idx + 1}
                      </td>
                      <td className="py-2.5 px-3 font-semibold text-slate-900">
                        {siswa.nama_siswa}
                        {siswa.panggilan && (
                          <span className="text-xs text-slate-500 font-normal ml-1">
                            ({siswa.panggilan})
                          </span>
                        )}
                      </td>
                      <td className="py-2.5 px-3 font-mono text-slate-600 text-xs">
                        {siswa.no_induk}
                      </td>
                      <td className="py-2.5 px-3">
                        <span
                          className={`inline-block px-1.5 py-0.5 rounded text-[11px] font-bold ${
                            siswa.jenis_kelamin === 'L'
                              ? 'bg-sky-50 text-sky-700'
                              : 'bg-rose-50 text-rose-700'
                          }`}
                        >
                          {siswa.jenis_kelamin}
                        </span>
                      </td>
                      {isEditable && (
                        <td className="py-2.5 px-3 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              type="button"
                              onClick={() => {
                                setTransferModalStudent(siswa);
                                const otherClass = classesInYear.find((c) => c.id !== currentClassId);
                                setTargetTransferClassId(otherClass?.id || '');
                              }}
                              className="px-2 py-1 text-xs text-slate-600 hover:text-emerald-700 hover:bg-slate-100 rounded transition-colors"
                              title="Pindah ke Kelas Lain"
                            >
                              Pindah
                            </button>
                            <button
                              type="button"
                              onClick={() => handleRemoveClick(siswa.id, siswa.nama_siswa)}
                              className="p-1 text-slate-400 hover:text-rose-600 rounded transition-colors"
                              title="Keluarkan dari kelas"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      )}
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Transfer Class Modal */}
      {transferModalStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-xl border border-slate-200">
            <h3 className="font-bold text-slate-900 text-base mb-1">
              Pindahkan Siswa ke Kelas Lain
            </h3>
            <p className="text-xs text-slate-600 mb-4">
              Pindahkan <strong>{transferModalStudent.nama_siswa}</strong> dari {activeClass?.namaKelas} ke:
            </p>

            <div className="space-y-3">
              <select
                value={targetTransferClassId}
                onChange={(e) => setTargetTransferClassId(e.target.value)}
                className="w-full text-sm border border-slate-300 rounded-lg px-3 py-2 bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                {classesInYear
                  .filter((c) => c.id !== currentClassId)
                  .map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.namaKelas} (Wali: {c.waliKelas})
                    </option>
                  ))}
              </select>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setTransferModalStudent(null)}
                  className="px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Batal
                </button>
                <button
                  type="button"
                  onClick={handleTransfer}
                  className="px-3 py-1.5 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg"
                >
                  Pindahkan Siswa
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Remove from Class Confirmation Modal */}
      {removeCandidate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-xl max-w-sm w-full p-6 border border-slate-100">
            <div className="w-12 h-12 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center mx-auto mb-4">
              <X className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-900 text-center mb-1">
              Keluarkan dari Kelas?
            </h3>
            <p className="text-xs text-slate-600 text-center mb-6">
              Apakah Anda yakin ingin mengeluarkan <span className="font-bold text-slate-800">"{removeCandidate.namaSiswa}"</span> dari kelas <span className="font-semibold text-slate-800">{activeClass?.namaKelas}</span>? Siswa akan kembali ke daftar belum terploting.
            </p>
            <div className="flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setRemoveCandidate(null)}
                className="flex-1 px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={confirmRemove}
                className="flex-1 px-4 py-2 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-lg transition-colors shadow-xs"
              >
                Ya, Keluarkan
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
