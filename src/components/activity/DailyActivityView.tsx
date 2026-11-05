import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { Siswa, CatatanHarian } from '../../types';
import { BatchClassSheet } from './BatchClassSheet';
import { SingleActivityModal } from './SingleActivityModal';
import { StudentReportModal } from './StudentReportModal';
import { 
  Calendar as CalendarIcon, 
  School, 
  Plus, 
  CheckCircle2, 
  XCircle, 
  Smile, 
  Frown, 
  Send, 
  FileText, 
  Edit3, 
  LayoutGrid, 
  Table2, 
  Clock,
  Sparkles,
  BookOpen
} from 'lucide-react';

export const DailyActivityView: React.FC = () => {
  const {
    kelasList,
    tahunPelajaranList,
    activeTahunPelajaran,
    getSiswaByKelas,
    getCatatanHarianByDateAndSiswa,
    catatanHarianList,
    getAllowedClasses,
    currentUser,
    isGuru,
    isAdmin,
  } = useApp();

  const getTodayDate = () => {
    const d = new Date();
    return d.toISOString().split('T')[0];
  };

  const [selectedDate, setSelectedDate] = useState<string>(getTodayDate());

  // Allowed classes for the current user in active academic year
  const allowedClasses = useMemo(() => {
    return getAllowedClasses();
  }, [getAllowedClasses, currentUser, activeTahunPelajaran]);

  const [selectedKelasId, setSelectedKelasId] = useState<string>(() => {
    return allowedClasses[0]?.id || '';
  });

  // Keep selectedKelasId in sync if allowedClasses change
  React.useEffect(() => {
    if (allowedClasses.length > 0 && !allowedClasses.some((c) => c.id === selectedKelasId)) {
      setSelectedKelasId(allowedClasses[0].id);
    }
  }, [allowedClasses, selectedKelasId]);

  // Ensure valid class selected
  const currentClass = allowedClasses.find((k) => k.id === selectedKelasId) || allowedClasses[0];
  const activeClassId = currentClass?.id || '';

  const students = useMemo(() => {
    return activeClassId ? getSiswaByKelas(activeClassId) : [];
  }, [activeClassId, getSiswaByKelas]);

  // Mode: "batch" (spreadsheet table) or "cards" (student card list)
  const [viewMode, setViewMode] = useState<'batch' | 'cards'>('batch');

  // Modals state
  const [modalStudent, setModalStudent] = useState<Siswa | null>(null);
  const [isSingleModalOpen, setIsSingleModalOpen] = useState(false);
  const [reportStudent, setReportStudent] = useState<Siswa | null>(null);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);

  // Statistics for selected day & class
  const stats = useMemo(() => {
    let recorded = 0;
    let hadir = 0;
    let tidakHadir = 0;
    let terlambat = 0;
    let ceria = 0;

    students.forEach((s) => {
      const log = getCatatanHarianByDateAndSiswa(selectedDate, s.id);
      if (log) {
        recorded++;
        if (log.kehadiran === 'hadir') hadir++;
        if (log.kehadiran === 'tidak_hadir') tidakHadir++;
        if (log.kedatangan === 'terlambat') terlambat++;
        if (log.kondisi_kedatangan === 'ceria') ceria++;
      }
    });

    return {
      total: students.length,
      recorded,
      unrecorded: Math.max(0, students.length - recorded),
      hadir,
      tidakHadir,
      terlambat,
      ceria,
    };
  }, [students, selectedDate, getCatatanHarianByDateAndSiswa]);

  const handleOpenSingleModal = (siswa: Siswa) => {
    setModalStudent(siswa);
    setIsSingleModalOpen(true);
  };

  const handleOpenReportModal = (siswa: Siswa) => {
    setReportStudent(siswa);
    setIsReportModalOpen(true);
  };

  const setDateRelative = (daysOffset: number) => {
    const d = new Date();
    d.setDate(d.getDate() + daysOffset);
    setSelectedDate(d.toISOString().split('T')[0]);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      
      {/* Top Filter and Controls Bar */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        
        {/* Date Selector */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-2 bg-slate-50 border border-slate-300 rounded-xl px-3 py-1.5">
            <CalendarIcon className="w-4 h-4 text-emerald-600" />
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="text-xs sm:text-sm font-semibold text-slate-800 bg-transparent focus:outline-none"
            />
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={() => setDateRelative(0)}
              className={`px-2.5 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
                selectedDate === getTodayDate()
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              Hari Ini
            </button>
            <button
              onClick={() => setDateRelative(-1)}
              className="px-2.5 py-1.5 text-xs font-semibold rounded-lg bg-slate-100 text-slate-700 hover:bg-slate-200 transition-colors"
            >
              Kemarin
            </button>
          </div>
        </div>

        {/* Class Selector & View Mode Switch */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2">
            <School className="w-4 h-4 text-slate-400" />
            <select
              value={activeClassId}
              onChange={(e) => setSelectedKelasId(e.target.value)}
              className="text-xs sm:text-sm font-bold text-slate-800 border border-slate-300 rounded-xl px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 shadow-xs"
            >
              {allowedClasses.length === 0 ? (
                <option value="">{isGuru ? 'Belum ada kelas yang dimapping' : 'Belum ada kelas'}</option>
              ) : (
                allowedClasses.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.namaKelas} ({c.waliKelas})
                  </option>
                ))
              )}
            </select>
            {isGuru && allowedClasses.length > 0 && (
              <span className="hidden sm:inline-block text-[11px] font-semibold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2 py-1 rounded-md">
                Kelas Binaan Anda
              </span>
            )}
          </div>

          {/* View mode toggle */}
          <div className="flex items-center bg-slate-100 p-1 rounded-xl">
            <button
              onClick={() => setViewMode('batch')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors ${
                viewMode === 'batch'
                  ? 'bg-white text-emerald-800 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Table2 className="w-3.5 h-3.5" />
              <span>Lembar Cepat (Tabel)</span>
            </button>
            <button
              onClick={() => setViewMode('cards')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors ${
                viewMode === 'cards'
                  ? 'bg-white text-emerald-800 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span>Kartu Siswa</span>
            </button>
          </div>
        </div>
      </div>

      {/* Daily Class KPI Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="bg-white p-3.5 rounded-xl border border-slate-200">
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
            Total Siswa
          </span>
          <div className="text-xl font-bold font-mono text-slate-900 mt-0.5">
            {stats.total}
          </div>
          <span className="text-[11px] text-slate-400">
            {currentClass?.namaKelas || 'Kelas'}
          </span>
        </div>

        <div className="bg-white p-3.5 rounded-xl border border-slate-200">
          <span className="text-[11px] font-semibold text-emerald-700 uppercase tracking-wider block">
            Hadir Hari Ini
          </span>
          <div className="text-xl font-bold font-mono text-emerald-600 mt-0.5">
            {stats.hadir}
          </div>
          <span className="text-[11px] text-slate-400">
            {stats.total ? Math.round((stats.hadir / stats.total) * 100) : 0}% kehadiran
          </span>
        </div>

        <div className="bg-white p-3.5 rounded-xl border border-slate-200">
          <span className="text-[11px] font-semibold text-rose-700 uppercase tracking-wider block">
            Tidak Hadir
          </span>
          <div className="text-xl font-bold font-mono text-rose-600 mt-0.5">
            {stats.tidakHadir}
          </div>
          <span className="text-[11px] text-slate-400">Izin / Sakit / Alpa</span>
        </div>

        <div className="bg-white p-3.5 rounded-xl border border-slate-200">
          <span className="text-[11px] font-semibold text-amber-700 uppercase tracking-wider block">
            Terlambat
          </span>
          <div className="text-xl font-bold font-mono text-amber-600 mt-0.5">
            {stats.terlambat}
          </div>
          <span className="text-[11px] text-slate-400">Datang lewat jam</span>
        </div>

        <div className="bg-white p-3.5 rounded-xl border border-slate-200">
          <span className="text-[11px] font-semibold text-emerald-700 uppercase tracking-wider block">
            Kondisi Ceria
          </span>
          <div className="text-xl font-bold font-mono text-emerald-600 mt-0.5">
            {stats.ceria}
          </div>
          <span className="text-[11px] text-slate-400">Tersenyum & antusias</span>
        </div>

        <div className="bg-white p-3.5 rounded-xl border border-slate-200">
          <span className="text-[11px] font-semibold text-slate-600 uppercase tracking-wider block">
            Status Catatan
          </span>
          <div className="text-xl font-bold font-mono text-slate-800 mt-0.5">
            {stats.recorded}/{stats.total}
          </div>
          <span className="text-[11px] text-emerald-700 font-medium">
            {stats.unrecorded === 0 && stats.total > 0 ? '✓ Lengkap' : `${stats.unrecorded} belum`}
          </span>
        </div>
      </div>

      {/* Main Content: Batch Sheet or Cards */}
      {viewMode === 'batch' ? (
        <BatchClassSheet
          students={students}
          tanggal={selectedDate}
          kelasId={activeClassId}
          onOpenSingleModal={handleOpenSingleModal}
        />
      ) : (
        /* Cards View Mode */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {students.length === 0 ? (
            <div className="col-span-full py-12 text-center bg-white border border-slate-200 rounded-xl">
              <School className="w-10 h-10 text-slate-300 mx-auto mb-2" />
              <p className="text-sm font-semibold text-slate-700">Belum ada siswa di kelas ini.</p>
              <p className="text-xs text-slate-500 mt-1">Silakan ploting siswa pada menu Master Data.</p>
            </div>
          ) : (
            students.map((siswa) => {
              const log = getCatatanHarianByDateAndSiswa(selectedDate, siswa.id);

              return (
                <div
                  key={siswa.id}
                  className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs hover:border-emerald-300 transition-all flex flex-col justify-between"
                >
                  <div>
                    {/* Card Top */}
                    <div className="flex items-start justify-between gap-2 pb-3 border-b border-slate-100">
                      <div>
                        <div className="font-bold text-slate-900 text-base leading-tight">
                          {siswa.nama_siswa}
                        </div>
                        <div className="text-xs text-slate-500 flex items-center gap-2 mt-0.5">
                          <span>NIS: {siswa.no_induk}</span>
                          <span>·</span>
                          <span>{siswa.panggilan || (siswa.jenis_kelamin === 'L' ? 'Ikhwan' : 'Akhwat')}</span>
                        </div>
                      </div>

                      {log ? (
                        <span
                          className={`text-xs font-bold px-2.5 py-1 rounded-md flex items-center gap-1 ${
                            log.kehadiran === 'hadir'
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-rose-100 text-rose-800'
                          }`}
                        >
                          {log.kehadiran === 'hadir' ? (
                            <>
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              <span>Hadir</span>
                            </>
                          ) : (
                            <>
                              <XCircle className="w-3.5 h-3.5" />
                              <span className="capitalize">{log.sub_kehadiran || 'Tidak'}</span>
                            </>
                          )}
                        </span>
                      ) : (
                        <span className="text-xs text-amber-700 bg-amber-50 px-2.5 py-1 rounded-md font-medium">
                          Belum dicatat
                        </span>
                      )}
                    </div>

                    {/* Card Body Log Details */}
                    {log ? (
                      <div className="py-3 space-y-2 text-xs">
                        <div className="grid grid-cols-2 gap-2 text-slate-600 bg-slate-50 p-2.5 rounded-xl">
                          <div>
                            <span className="text-slate-400 block text-[11px]">Kedatangan</span>
                            <span className="font-semibold text-slate-800">
                              {log.kedatangan === 'tepat_waktu' ? 'Tepat Waktu' : 'Terlambat'}
                            </span>
                          </div>
                          <div>
                            <span className="text-slate-400 block text-[11px]">Kondisi Datang</span>
                            <span className="font-semibold text-slate-800 flex items-center gap-1">
                              {log.kondisi_kedatangan === 'ceria' ? (
                                <>
                                  <Smile className="w-3.5 h-3.5 text-emerald-600" />
                                  <span>Ceria</span>
                                </>
                              ) : (
                                <>
                                  <Frown className="w-3.5 h-3.5 text-amber-600" />
                                  <span>Cemberut</span>
                                </>
                              )}
                            </span>
                          </div>
                          <div>
                            <span className="text-slate-400 block text-[11px]">Murojaah</span>
                            <span className="font-semibold text-slate-800 capitalize">
                              {log.keaktifan_murojaah.replace('_', ' ')}
                            </span>
                          </div>
                          <div>
                            <span className="text-slate-400 block text-[11px]">Ke Toilet</span>
                            <span className="font-bold text-slate-900 font-mono">
                              {log.ke_toilet} Kali
                            </span>
                          </div>
                        </div>

                        {log.capaian_tahfiz && (
                          <div className="text-xs text-slate-700 bg-emerald-50/60 p-2 rounded-lg border border-emerald-100">
                            <span className="font-semibold text-emerald-800 block text-[11px]">
                              Capaian Tahfiz:
                            </span>
                            <p className="italic">{log.capaian_tahfiz}</p>
                          </div>
                        )}

                        {log.sosialisasi_dengan_teman && (
                          <div className="text-xs text-slate-600">
                            <span className="text-slate-400 block text-[11px]">Sosialisasi:</span>
                            <p className="line-clamp-2">{log.sosialisasi_dengan_teman}</p>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="py-6 text-center text-xs text-slate-400">
                        Klik 'Catat Aktivitas' untuk mengisi checklist harian.
                      </div>
                    )}
                  </div>

                  {/* Card Bottom Actions */}
                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                    <button
                      type="button"
                      onClick={() => handleOpenSingleModal(siswa)}
                      className="px-3 py-1.5 text-xs font-semibold text-emerald-700 hover:text-white bg-emerald-50 hover:bg-emerald-600 rounded-lg transition-colors flex items-center gap-1.5"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                      <span>{log ? 'Ubah Catatan' : 'Catat Aktivitas'}</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleOpenReportModal(siswa)}
                      className="px-3 py-1.5 text-xs font-semibold text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors flex items-center gap-1.5"
                      title="Lihat Slip / Kirim WhatsApp"
                    >
                      <FileText className="w-3.5 h-3.5 text-slate-500" />
                      <span>Buku Penghubung</span>
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* Single Activity Form Modal */}
      {modalStudent && isSingleModalOpen && (
        <SingleActivityModal
          isOpen={isSingleModalOpen}
          onClose={() => {
            setIsSingleModalOpen(false);
            setModalStudent(null);
          }}
          siswa={modalStudent}
          tanggal={selectedDate}
          kelasId={activeClassId}
        />
      )}

      {/* Student Slip / WhatsApp Report Modal */}
      {reportStudent && isReportModalOpen && (
        <StudentReportModal
          isOpen={isReportModalOpen}
          onClose={() => {
            setIsReportModalOpen(false);
            setReportStudent(null);
          }}
          siswa={reportStudent}
          log={getCatatanHarianByDateAndSiswa(selectedDate, reportStudent.id)}
          kelas={currentClass}
          tanggal={selectedDate}
        />
      )}
    </div>
  );
};
