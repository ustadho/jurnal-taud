import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { Siswa, CatatanHarian, Kelas } from '../../types';
import { StudentReportModal } from './StudentReportModal';
import { 
  FileSpreadsheet, 
  Printer, 
  Search, 
  Calendar, 
  School, 
  Smile, 
  Frown, 
  CheckCircle2, 
  XCircle, 
  FileText, 
  Filter, 
  BarChart3, 
  TrendingUp, 
  Utensils, 
  BookOpen,
  Users,
  Clock,
  AlertTriangle,
  Award,
  CalendarRange,
  ChevronRight,
  Sparkles
} from 'lucide-react';

export const DailyRecapView: React.FC = () => {
  const {
    catatanHarianList,
    siswaList,
    kelasList,
    tahunPelajaranList,
    activeTahunPelajaran,
    getAllowedClasses,
    currentUser,
    isGuru,
    isAdmin,
  } = useApp();

  const allowedClasses = useMemo(() => {
    return getAllowedClasses();
  }, [getAllowedClasses, currentUser, activeTahunPelajaran]);

  const allowedClassIds = useMemo(() => {
    return allowedClasses.map((c) => c.id);
  }, [allowedClasses]);

  const getTodayDate = () => new Date().toISOString().split('T')[0];
  const getDateOffset = (offsetDays: number) => {
    const d = new Date();
    d.setDate(d.getDate() + offsetDays);
    return d.toISOString().split('T')[0];
  };

  // Date Range state: default to last 7 days
  const [startDate, setStartDate] = useState<string>(() => getDateOffset(-6));
  const [endDate, setEndDate] = useState<string>(() => getTodayDate());
  const [useDateRange, setUseDateRange] = useState<boolean>(true);

  // Filter states
  const [filterKelasId, setFilterKelasId] = useState<string>('ALL');
  const [searchStudent, setSearchStudent] = useState<string>('');
  const [filterAttendance, setFilterAttendance] = useState<'ALL' | 'hadir' | 'tidak_hadir'>('ALL');

  // Subtab navigation: "dashboard" (Dashboard Kehadiran Santri) or "jurnal" (Detail Log Jurnal)
  const [activeTab, setActiveTab] = useState<'dashboard' | 'jurnal'>('dashboard');

  // Selected student for detailed period view modal
  const [selectedStudentHistory, setSelectedStudentHistory] = useState<Siswa | null>(null);

  // Single report slip modal
  const [selectedReport, setSelectedReport] = useState<{
    siswa: Siswa;
    log: CatatanHarian;
    kelas?: Kelas;
  } | null>(null);

  // Quick Date Range presets
  const applyPreset = (preset: 'today' | '7days' | '30days' | 'month' | 'all') => {
    const today = getTodayDate();
    setUseDateRange(true);
    if (preset === 'today') {
      setStartDate(today);
      setEndDate(today);
    } else if (preset === '7days') {
      setStartDate(getDateOffset(-6));
      setEndDate(today);
    } else if (preset === '30days') {
      setStartDate(getDateOffset(-29));
      setEndDate(today);
    } else if (preset === 'month') {
      const d = new Date();
      const firstDay = new Date(d.getFullYear(), d.getMonth(), 1).toISOString().split('T')[0];
      setStartDate(firstDay);
      setEndDate(today);
    } else if (preset === 'all') {
      setUseDateRange(false);
    }
  };

  // Filtered Logs
  const filteredLogs = useMemo(() => {
    return catatanHarianList.filter((log) => {
      // Date Range Filter
      if (useDateRange) {
        if (startDate && log.tanggal < startDate) return false;
        if (endDate && log.tanggal > endDate) return false;
      }

      // Scoping: If Guru, only allow their mapped classes
      if (isGuru && !allowedClassIds.includes(log.kelasId)) {
        return false;
      }

      // Class Filter
      if (filterKelasId !== 'ALL' && log.kelasId !== filterKelasId) return false;

      // Attendance Filter
      if (filterAttendance !== 'ALL' && log.kehadiran !== filterAttendance) return false;

      // Search student by name or NIS
      if (searchStudent.trim()) {
        const student = siswaList.find((s) => s.id === log.siswaId);
        if (!student) return false;
        const query = searchStudent.toLowerCase();
        const matchName = student.nama_siswa.toLowerCase().includes(query);
        const matchNis = student.no_induk.toLowerCase().includes(query);
        const matchPanggilan = student.panggilan?.toLowerCase().includes(query);
        if (!matchName && !matchNis && !matchPanggilan) return false;
      }

      return true;
    });
  }, [
    catatanHarianList,
    useDateRange,
    startDate,
    endDate,
    filterKelasId,
    filterAttendance,
    searchStudent,
    siswaList,
    isGuru,
    allowedClassIds,
  ]);

  // Unique dates in the filtered period
  const uniqueDatesInPeriod = useMemo(() => {
    const dates = new Set(filteredLogs.map((l) => l.tanggal));
    return Array.from(dates).sort();
  }, [filteredLogs]);

  // Aggregate Metrics for Dashboard
  const dashboardStats = useMemo(() => {
    const totalRecords = filteredLogs.length;
    const hadirCount = filteredLogs.filter((l) => l.kehadiran === 'hadir').length;
    const tepatWaktuCount = filteredLogs.filter((l) => l.kehadiran === 'hadir' && l.kedatangan === 'tepat_waktu').length;
    const terlambatCount = filteredLogs.filter((l) => l.kehadiran === 'hadir' && l.kedatangan === 'terlambat').length;
    
    const tidakHadirCount = filteredLogs.filter((l) => l.kehadiran === 'tidak_hadir').length;
    const sakitCount = filteredLogs.filter((l) => l.kehadiran === 'tidak_hadir' && l.sub_kehadiran === 'sakit').length;
    const izinCount = filteredLogs.filter((l) => l.kehadiran === 'tidak_hadir' && l.sub_kehadiran === 'izin').length;
    const alpaCount = filteredLogs.filter((l) => l.kehadiran === 'tidak_hadir' && (!l.sub_kehadiran || l.sub_kehadiran === 'alpa')).length;

    const ceriaCount = filteredLogs.filter((l) => l.kehadiran === 'hadir' && l.kondisi_kedatangan === 'ceria').length;
    const cemberutCount = filteredLogs.filter((l) => l.kehadiran === 'hadir' && l.kondisi_kedatangan === 'cemberut').length;

    const murojaahSangatAktif = filteredLogs.filter((l) => l.kehadiran === 'hadir' && l.keaktifan_murojaah === 'sangat_aktif').length;
    const adabMakanBaik = filteredLogs.filter((l) => l.kehadiran === 'hadir' && l.adab_makan === 'habis_adab_baik').length;

    const attendanceRate = totalRecords > 0 ? Math.round((hadirCount / totalRecords) * 100) : 0;
    const onTimeRate = hadirCount > 0 ? Math.round((tepatWaktuCount / hadirCount) * 100) : 0;
    const ceriaRate = hadirCount > 0 ? Math.round((ceriaCount / hadirCount) * 100) : 0;
    const murojaahRate = hadirCount > 0 ? Math.round((murojaahSangatAktif / hadirCount) * 100) : 0;
    const adabRate = hadirCount > 0 ? Math.round((adabMakanBaik / hadirCount) * 100) : 0;

    return {
      totalRecords,
      uniqueDays: uniqueDatesInPeriod.length,
      hadirCount,
      tepatWaktuCount,
      terlambatCount,
      tidakHadirCount,
      sakitCount,
      izinCount,
      alpaCount,
      attendanceRate,
      onTimeRate,
      ceriaCount,
      cemberutCount,
      ceriaRate,
      murojaahRate,
      adabRate,
    };
  }, [filteredLogs, uniqueDatesInPeriod]);

  // Daily Trend Breakdown (for Bar Chart)
  const dailyTrends = useMemo(() => {
    return uniqueDatesInPeriod.map((date) => {
      const logsOnDate = filteredLogs.filter((l) => l.tanggal === date);
      const total = logsOnDate.length;
      const hadirTepat = logsOnDate.filter((l) => l.kehadiran === 'hadir' && l.kedatangan === 'tepat_waktu').length;
      const hadirTerlambat = logsOnDate.filter((l) => l.kehadiran === 'hadir' && l.kedatangan === 'terlambat').length;
      const tidakHadir = logsOnDate.filter((l) => l.kehadiran === 'tidak_hadir').length;
      const ceria = logsOnDate.filter((l) => l.kondisi_kedatangan === 'ceria' && l.kehadiran === 'hadir').length;

      // Format date label (e.g. 02 Nov)
      let formattedDate = date;
      try {
        const parts = date.split('-');
        if (parts.length === 3) {
          const months = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
          formattedDate = `${parseInt(parts[2])} ${months[parseInt(parts[1]) - 1]}`;
        }
      } catch {
        // fallback to original
      }

      return {
        date,
        formattedDate,
        total,
        hadirTepat,
        hadirTerlambat,
        hadirTotal: hadirTepat + hadirTerlambat,
        tidakHadir,
        ceria,
        hadirPct: total > 0 ? Math.round(((hadirTepat + hadirTerlambat) / total) * 100) : 0,
      };
    });
  }, [uniqueDatesInPeriod, filteredLogs]);

  // Per-Student Attendance Scorecard (Matriks Kehadiran Santri dalam Periode)
  const studentAttendanceScorecard = useMemo(() => {
    // Get list of relevant students based on class filter or all
    let targetStudents = siswaList;
    if (filterKelasId !== 'ALL') {
      const classPlots = filteredLogs.filter((l) => l.kelasId === filterKelasId).map((l) => l.siswaId);
      targetStudents = siswaList.filter((s) => classPlots.includes(s.id));
      if (targetStudents.length === 0) {
        // Fallback: check students plotted to that class in AppContext
        targetStudents = siswaList;
      }
    }

    // Filter by student search query if any
    if (searchStudent.trim()) {
      const q = searchStudent.toLowerCase();
      targetStudents = targetStudents.filter(
        (s) =>
          s.nama_siswa.toLowerCase().includes(q) ||
          s.no_induk.toLowerCase().includes(q) ||
          (s.panggilan && s.panggilan.toLowerCase().includes(q))
      );
    }

    return targetStudents
      .map((student) => {
        const studentLogs = filteredLogs.filter((l) => l.siswaId === student.id);
        const totalRecorded = studentLogs.length;

        const hadir = studentLogs.filter((l) => l.kehadiran === 'hadir').length;
        const tepatWaktu = studentLogs.filter((l) => l.kehadiran === 'hadir' && l.kedatangan === 'tepat_waktu').length;
        const terlambat = studentLogs.filter((l) => l.kehadiran === 'hadir' && l.kedatangan === 'terlambat').length;
        const sakit = studentLogs.filter((l) => l.kehadiran === 'tidak_hadir' && l.sub_kehadiran === 'sakit').length;
        const izin = studentLogs.filter((l) => l.kehadiran === 'tidak_hadir' && l.sub_kehadiran === 'izin').length;
        const alpa = studentLogs.filter((l) => l.kehadiran === 'tidak_hadir' && (!l.sub_kehadiran || l.sub_kehadiran === 'alpa')).length;

        const ceria = studentLogs.filter((l) => l.kehadiran === 'hadir' && l.kondisi_kedatangan === 'ceria').length;
        const murojaahAktif = studentLogs.filter((l) => l.kehadiran === 'hadir' && l.keaktifan_murojaah === 'sangat_aktif').length;

        const attendanceRate = totalRecorded > 0 ? Math.round((hadir / totalRecorded) * 100) : 0;

        let statusPredikat: 'Sangat Rajin' | 'Baik' | 'Perlu Perhatian' = 'Baik';
        if (attendanceRate >= 90) statusPredikat = 'Sangat Rajin';
        else if (attendanceRate < 75) statusPredikat = 'Perlu Perhatian';

        // Most recent class
        const lastLog = studentLogs[0];
        const studentClass = lastLog ? kelasList.find((k) => k.id === lastLog.kelasId) : undefined;

        return {
          student,
          kelas: studentClass,
          totalRecorded,
          hadir,
          tepatWaktu,
          terlambat,
          sakit,
          izin,
          alpa,
          ceria,
          murojaahAktif,
          attendanceRate,
          statusPredikat,
          recentLogs: studentLogs,
        };
      })
      .filter((item) => item.totalRecorded > 0 || searchStudent.trim().length > 0)
      .sort((a, b) => b.attendanceRate - a.attendanceRate);
  }, [siswaList, filteredLogs, filterKelasId, searchStudent, kelasList]);

  // Export CSV for Student Attendance Scorecard
  const exportStudentAttendanceCSV = () => {
    const headers = [
      'NIS',
      'Nama Santri',
      'Panggilan',
      'L/P',
      'Kelas',
      'Total Sesi Terdata',
      'Hadir Tepat Waktu',
      'Terlambat',
      'Total Hadir',
      'Sakit (S)',
      'Izin (I)',
      'Alpa (A)',
      'Persentase Kehadiran (%)',
      'Predikat Kehadiran',
      'Kondisi Ceria',
      'Murojaah Sangat Aktif',
    ];

    const rows = studentAttendanceScorecard.map((item) => [
      `"${item.student.no_induk}"`,
      `"${item.student.nama_siswa}"`,
      `"${item.student.panggilan || ''}"`,
      `"${item.student.jenis_kelamin}"`,
      `"${item.kelas?.namaKelas || ''}"`,
      item.totalRecorded,
      item.tepatWaktu,
      item.terlambat,
      item.hadir,
      item.sakit,
      item.izin,
      item.alpa,
      `"${item.attendanceRate}%"`,
      `"${item.statusPredikat}"`,
      item.ceria,
      item.murojaahAktif,
    ]);

    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `rekap_kehadiran_santri_${startDate}_sd_${endDate}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Export CSV for Detail Activity Journal
  const exportActivityJournalCSV = () => {
    const headers = [
      'Tanggal',
      'NIS',
      'Nama Siswa',
      'Kelas',
      'Kehadiran',
      'Keterangan Hadir',
      'Kedatangan',
      'Kondisi Datang',
      'Murojaah',
      'Volume Suara',
      'Tartil',
      'Tahfidz',
      'Adab Makan',
      'Capaian Tahfiz',
      'Sosialisasi',
      'Ke Toilet',
      'Catatan Guru',
    ];

    const rows = filteredLogs.map((log) => {
      const siswa = siswaList.find((s) => s.id === log.siswaId);
      const kelas = kelasList.find((k) => k.id === log.kelasId);

      return [
        `"${log.tanggal}"`,
        `"${siswa?.no_induk || ''}"`,
        `"${siswa?.nama_siswa || ''}"`,
        `"${kelas?.namaKelas || ''}"`,
        `"${log.kehadiran}"`,
        `"${log.sub_kehadiran || ''}"`,
        `"${log.kedatangan}"`,
        `"${log.kondisi_kedatangan}"`,
        `"${log.keaktifan_murojaah}"`,
        `"${log.volume_suara}"`,
        `"${log.kemampuan_tartil}"`,
        `"${log.kemampuan_tahfidz}"`,
        `"${log.adab_makan}"`,
        `"${(log.capaian_tahfiz || '').replace(/"/g, '""')}"`,
        `"${(log.sosialisasi_dengan_teman || '').replace(/"/g, '""')}"`,
        `"${log.ke_toilet}"`,
        `"${(log.catatan_khusus || '').replace(/"/g, '""')}"`,
      ];
    });

    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `jurnal_harian_tk_${startDate}_sd_${endDate}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200 no-print">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded uppercase tracking-wider">
              Laporan Evaluasi
            </span>
            <span className="text-xs text-slate-500">
              {useDateRange ? `Periode ${startDate} s/d ${endDate}` : 'Semua Catatan'}
            </span>
          </div>
          <h2 className="text-xl font-bold text-slate-900 mt-1">
            Rekap & Jurnal Kegiatan Santri
          </h2>
          <p className="text-xs sm:text-sm text-slate-600">
            Analisis presensi kehadiran santri, ketepatan waktu, murojaah, dan catatan perkembangan per periode.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 self-start sm:self-auto">
          {activeTab === 'dashboard' ? (
            <button
              onClick={exportStudentAttendanceCSV}
              className="inline-flex items-center gap-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-lg text-xs transition-colors"
              title="Unduh Rekap Kehadiran Santri Format CSV"
            >
              <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
              <span>Ekspor Rekap Santri (CSV)</span>
            </button>
          ) : (
            <button
              onClick={exportActivityJournalCSV}
              className="inline-flex items-center gap-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-lg text-xs transition-colors"
              title="Unduh Detail Jurnal Aktivitas Harian"
            >
              <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
              <span>Ekspor Jurnal Rinci (CSV)</span>
            </button>
          )}

          <button
            onClick={() => window.print()}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-lg text-xs transition-colors shadow-xs"
            title="Cetak Halaman Rekap Ini"
          >
            <Printer className="w-4 h-4" />
            <span>Cetak Rekap</span>
          </button>
        </div>
      </div>

      {/* Modern Filter Card with Date Range (Tanggal Awal & Tanggal Akhir) */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4 no-print">
        
        {/* Date Range Section */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-3 border-b border-slate-100">
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2">
              <CalendarRange className="w-4 h-4 text-emerald-600 shrink-0" />
              <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                Rentang Tanggal:
              </span>
            </div>

            {/* Start Date */}
            <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-300 rounded-xl px-2.5 py-1.5">
              <span className="text-[11px] text-slate-500 font-medium">Dari:</span>
              <input
                type="date"
                value={startDate}
                onChange={(e) => {
                  setStartDate(e.target.value);
                  setUseDateRange(true);
                }}
                className="text-xs font-semibold text-slate-800 bg-transparent focus:outline-none"
              />
            </div>

            <span className="text-slate-400 font-bold text-xs">s/d</span>

            {/* End Date */}
            <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-300 rounded-xl px-2.5 py-1.5">
              <span className="text-[11px] text-slate-500 font-medium">Sampai:</span>
              <input
                type="date"
                value={endDate}
                onChange={(e) => {
                  setEndDate(e.target.value);
                  setUseDateRange(true);
                }}
                className="text-xs font-semibold text-slate-800 bg-transparent focus:outline-none"
              />
            </div>
          </div>

          {/* Preset Buttons */}
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-[11px] text-slate-400 font-medium mr-1">Pilihan Cepat:</span>
            <button
              onClick={() => applyPreset('today')}
              className={`px-2.5 py-1 text-xs rounded-lg font-medium transition-colors ${
                startDate === getTodayDate() && endDate === getTodayDate() && useDateRange
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              Hari Ini
            </button>
            <button
              onClick={() => applyPreset('7days')}
              className={`px-2.5 py-1 text-xs rounded-lg font-medium transition-colors ${
                startDate === getDateOffset(-6) && endDate === getTodayDate() && useDateRange
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              7 Hari Terakhir
            </button>
            <button
              onClick={() => applyPreset('30days')}
              className={`px-2.5 py-1 text-xs rounded-lg font-medium transition-colors ${
                startDate === getDateOffset(-29) && endDate === getTodayDate() && useDateRange
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              30 Hari
            </button>
            <button
              onClick={() => applyPreset('month')}
              className="px-2.5 py-1 text-xs rounded-lg font-medium bg-slate-100 text-slate-600 hover:bg-slate-200 transition-colors"
            >
              Bulan Ini
            </button>
            <button
              onClick={() => applyPreset('all')}
              className={`px-2.5 py-1 text-xs rounded-lg font-medium transition-colors ${
                !useDateRange
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              Semua
            </button>
          </div>
        </div>

        {/* Secondary Filters: Class, Status & Search */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-center">
          {/* Class Filter */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-700 whitespace-nowrap">Kelas:</span>
            <select
              value={filterKelasId}
              onChange={(e) => setFilterKelasId(e.target.value)}
              className="w-full text-xs font-semibold border border-slate-300 rounded-lg px-2.5 py-1.5 bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <option value="ALL">
                {isGuru ? 'Semua Kelas Binaan Anda' : 'Semua Kelas'}
              </option>
              {allowedClasses.map((k) => (
                <option key={k.id} value={k.id}>
                  {k.namaKelas} ({k.waliKelas})
                </option>
              ))}
            </select>
          </div>

          {/* Attendance Status Filter */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-700 whitespace-nowrap">Status:</span>
            <select
              value={filterAttendance}
              onChange={(e) => setFilterAttendance(e.target.value as any)}
              className="w-full text-xs font-semibold border border-slate-300 rounded-lg px-2.5 py-1.5 bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <option value="ALL">Semua Presensi</option>
              <option value="hadir">Hanya Hadir</option>
              <option value="tidak_hadir">Hanya Tidak Hadir (S/I/A)</option>
            </select>
          </div>

          {/* Search Santri Input */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Cari santri, panggilan, atau NIS..."
              value={searchStudent}
              onChange={(e) => setSearchStudent(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>
        </div>
      </div>

      {/* Segmented View Switcher: Dashboard Kehadiran Santri vs Log Jurnal Detail */}
      <div className="flex items-center justify-between gap-4 border-b border-slate-200 pb-2 no-print">
        <div className="flex items-center gap-2 bg-slate-200/80 p-1 rounded-xl shadow-inner">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`flex items-center gap-2 px-3.5 py-1.5 text-xs sm:text-sm font-bold rounded-lg transition-all ${
              activeTab === 'dashboard'
                ? 'bg-white text-emerald-800 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <BarChart3 className="w-4 h-4 text-emerald-600" />
            <span>Dashboard Kehadiran Santri</span>
          </button>

          <button
            onClick={() => setActiveTab('jurnal')}
            className={`flex items-center gap-2 px-3.5 py-1.5 text-xs sm:text-sm font-bold rounded-lg transition-all ${
              activeTab === 'jurnal'
                ? 'bg-white text-emerald-800 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <FileText className="w-4 h-4 text-emerald-600" />
            <span>Jurnal Aktivitas Lengkap ({filteredLogs.length})</span>
          </button>
        </div>

        <div className="hidden sm:flex items-center gap-2 text-xs text-slate-500">
          <span>{dashboardStats.uniqueDays} Hari Efektif</span>
          <span>·</span>
          <span>{dashboardStats.totalRecords} Presensi Terdata</span>
        </div>
      </div>

      {/* TAB 1: DASHBOARD KEHADIRAN SANTRI DALAM PERIODE */}
      {activeTab === 'dashboard' && (
        <div className="space-y-6">
          
          {/* Main Attendance KPI Ribbon */}
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
            {/* Total Hari Efektif */}
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
              <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
                Hari Efektif
              </span>
              <div className="text-2xl font-bold font-mono text-slate-900 mt-1">
                {dashboardStats.uniqueDays} <span className="text-xs font-normal text-slate-400">Hari</span>
              </div>
              <span className="text-[11px] text-slate-500">
                Dalam rentang tanggal
              </span>
            </div>

            {/* Tingkat Kehadiran (%) */}
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
              <span className="text-[11px] font-semibold text-emerald-700 uppercase tracking-wider block">
                Tingkat Kehadiran
              </span>
              <div className="text-2xl font-bold font-mono text-emerald-600 mt-1 flex items-baseline gap-1">
                {dashboardStats.attendanceRate}%
              </div>
              <span className="text-[11px] text-slate-500">
                {dashboardStats.hadirCount} dari {dashboardStats.totalRecords} sesi
              </span>
            </div>

            {/* Ketepatan Waktu */}
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
              <span className="text-[11px] font-semibold text-sky-700 uppercase tracking-wider block">
                Tepat Waktu
              </span>
              <div className="text-2xl font-bold font-mono text-sky-600 mt-1">
                {dashboardStats.onTimeRate}%
              </div>
              <span className="text-[11px] text-slate-500">
                {dashboardStats.tepatWaktuCount} tepat · {dashboardStats.terlambatCount} terlambat
              </span>
            </div>

            {/* Sakit, Izin, Alpa */}
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
              <span className="text-[11px] font-semibold text-rose-700 uppercase tracking-wider block">
                Ketidakhadiran
              </span>
              <div className="text-2xl font-bold font-mono text-rose-600 mt-1">
                {dashboardStats.tidakHadirCount}
              </div>
              <span className="text-[11px] text-slate-500">
                S: {dashboardStats.sakitCount} · I: {dashboardStats.izinCount} · A: {dashboardStats.alpaCount}
              </span>
            </div>

            {/* Mood Ceria Datang */}
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
              <span className="text-[11px] font-semibold text-emerald-700 uppercase tracking-wider block flex items-center gap-1">
                <Smile className="w-3.5 h-3.5" />
                <span>Keceriaan Santri</span>
              </span>
              <div className="text-2xl font-bold font-mono text-emerald-600 mt-1">
                {dashboardStats.ceriaRate}%
              </div>
              <span className="text-[11px] text-slate-500">
                {dashboardStats.ceriaCount} datang tersenyum
              </span>
            </div>

            {/* Murojaah Aktif */}
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
              <span className="text-[11px] font-semibold text-amber-700 uppercase tracking-wider block flex items-center gap-1">
                <BookOpen className="w-3.5 h-3.5" />
                <span>Murojaah Aktif</span>
              </span>
              <div className="text-2xl font-bold font-mono text-amber-600 mt-1">
                {dashboardStats.murojaahRate}%
              </div>
              <span className="text-[11px] text-slate-500">
                Adab makan baik: {dashboardStats.adabRate}%
              </span>
            </div>
          </div>

          {/* Daily Trend Chart (Distribusi Kehadiran Harian) */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-emerald-600" />
                  <span>Grafik Tren Kehadiran Santri Harian</span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Distribusi santri hadir (tepat waktu / terlambat) vs tidak hadir pada setiap tanggal kegiatan.
                </p>
              </div>

              {/* Legend */}
              <div className="flex items-center gap-3 text-xs text-slate-600">
                <div className="flex items-center gap-1.5">
                  <div className="w-3 h-3 bg-emerald-500 rounded-sm"></div>
                  <span>Hadir Tepat Waktu</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-3 h-3 bg-amber-400 rounded-sm"></div>
                  <span>Terlambat</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-3 h-3 bg-rose-500 rounded-sm"></div>
                  <span>Tidak Hadir (S/I/A)</span>
                </div>
              </div>
            </div>

            {/* Bar Visuals */}
            {dailyTrends.length === 0 ? (
              <div className="py-12 text-center text-slate-400 text-xs">
                Belum ada data presensi pada rentang tanggal ini. Silakan pilih rentang tanggal lain atau catat aktivitas harian terlebih dahulu.
              </div>
            ) : (
              <div className="pt-4 overflow-x-auto">
                <div className="min-w-[500px] space-y-3">
                  {dailyTrends.map((day) => {
                    const hadirTepatPct = day.total > 0 ? (day.hadirTepat / day.total) * 100 : 0;
                    const terlambatPct = day.total > 0 ? (day.hadirTerlambat / day.total) * 100 : 0;
                    const tidakHadirPct = day.total > 0 ? (day.tidakHadir / day.total) * 100 : 0;

                    return (
                      <div key={day.date} className="flex items-center gap-3 text-xs">
                        <div className="w-24 text-right font-medium text-slate-700 font-mono shrink-0">
                          {day.formattedDate}
                        </div>

                        {/* Stacked Bar */}
                        <div className="flex-1 bg-slate-100 h-6 rounded-lg overflow-hidden flex items-center relative">
                          {hadirTepatPct > 0 && (
                            <div
                              style={{ width: `${hadirTepatPct}%` }}
                              className="bg-emerald-500 h-full flex items-center justify-center text-white font-bold text-[11px] transition-all hover:bg-emerald-600"
                              title={`Tepat Waktu: ${day.hadirTepat} anak (${Math.round(hadirTepatPct)}%)`}
                            >
                              {day.hadirTepat > 0 ? day.hadirTepat : ''}
                            </div>
                          )}

                          {terlambatPct > 0 && (
                            <div
                              style={{ width: `${terlambatPct}%` }}
                              className="bg-amber-400 h-full flex items-center justify-center text-amber-950 font-bold text-[11px] transition-all hover:bg-amber-500"
                              title={`Terlambat: ${day.hadirTerlambat} anak (${Math.round(terlambatPct)}%)`}
                            >
                              {day.hadirTerlambat > 0 ? day.hadirTerlambat : ''}
                            </div>
                          )}

                          {tidakHadirPct > 0 && (
                            <div
                              style={{ width: `${tidakHadirPct}%` }}
                              className="bg-rose-500 h-full flex items-center justify-center text-white font-bold text-[11px] transition-all hover:bg-rose-600"
                              title={`Tidak Hadir: ${day.tidakHadir} anak (${Math.round(tidakHadirPct)}%)`}
                            >
                              {day.tidakHadir > 0 ? day.tidakHadir : ''}
                            </div>
                          )}
                        </div>

                        <div className="w-20 text-left font-mono font-semibold text-slate-800 shrink-0">
                          {day.hadirPct}% <span className="text-[10px] text-slate-400">({day.hadirTotal}/{day.total})</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Student Attendance Scorecard Table (Matriks Rekap per Santri) */}
          <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
            <div className="p-4 sm:p-5 bg-slate-50 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                  <Users className="w-4 h-4 text-emerald-600" />
                  <span>Matriks Rekapitulasi Kehadiran per Santri</span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Rangkuman akumulasi kehadiran, ketepatan waktu, dan catatan sakit/izin/alpa setiap santri selama periode terpilih.
                </p>
              </div>

              <div className="text-xs text-slate-500 font-medium">
                {studentAttendanceScorecard.length} Santri Terdata
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead className="bg-slate-100 text-slate-700 font-semibold uppercase tracking-wider">
                  <tr>
                    <th className="py-3 px-3 w-10 text-center">No</th>
                    <th className="py-3 px-3 min-w-[170px]">Nama Santri</th>
                    <th className="py-3 px-2">Kelas</th>
                    <th className="py-3 px-2 text-center">Hari Terdata</th>
                    <th className="py-3 px-2 text-center text-emerald-700">Tepat Waktu</th>
                    <th className="py-3 px-2 text-center text-amber-700">Terlambat</th>
                    <th className="py-3 px-2 text-center text-blue-700">Sakit</th>
                    <th className="py-3 px-2 text-center text-indigo-700">Izin</th>
                    <th className="py-3 px-2 text-center text-rose-700">Alpa</th>
                    <th className="py-3 px-3 min-w-[120px]">Kehadiran (%)</th>
                    <th className="py-3 px-2">Predikat</th>
                    <th className="py-3 px-3 text-right no-print">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {studentAttendanceScorecard.length === 0 ? (
                    <tr>
                      <td colSpan={12} className="py-12 text-center text-slate-400">
                        Tidak ada catatan santri yang sesuai dengan kriteria filter.
                      </td>
                    </tr>
                  ) : (
                    studentAttendanceScorecard.map((item, idx) => {
                      return (
                        <tr key={item.student.id} className="hover:bg-slate-50/80 transition-colors">
                          <td className="py-3 px-3 text-center font-mono text-slate-400">
                            {idx + 1}
                          </td>
                          <td className="py-3 px-3">
                            <div className="font-bold text-slate-900">
                              {item.student.nama_siswa}
                            </div>
                            <div className="text-[11px] text-slate-500 flex items-center gap-1.5 mt-0.5">
                              <span>NIS: {item.student.no_induk}</span>
                              {item.student.panggilan && (
                                <span>· {item.student.panggilan}</span>
                              )}
                            </div>
                          </td>
                          <td className="py-3 px-2 text-slate-700 font-medium">
                            {item.kelas?.namaKelas || '-'}
                          </td>
                          <td className="py-3 px-2 text-center font-mono font-semibold text-slate-700">
                            {item.totalRecorded}
                          </td>
                          <td className="py-3 px-2 text-center font-mono font-bold text-emerald-600 bg-emerald-50/50">
                            {item.tepatWaktu}
                          </td>
                          <td className="py-3 px-2 text-center font-mono font-semibold text-amber-600">
                            {item.terlambat}
                          </td>
                          <td className="py-3 px-2 text-center font-mono text-slate-600">
                            {item.sakit > 0 ? (
                              <span className="font-bold text-blue-600">{item.sakit}</span>
                            ) : (
                              '0'
                            )}
                          </td>
                          <td className="py-3 px-2 text-center font-mono text-slate-600">
                            {item.izin > 0 ? (
                              <span className="font-bold text-indigo-600">{item.izin}</span>
                            ) : (
                              '0'
                            )}
                          </td>
                          <td className="py-3 px-2 text-center font-mono text-slate-600">
                            {item.alpa > 0 ? (
                              <span className="font-bold text-rose-600">{item.alpa}</span>
                            ) : (
                              '0'
                            )}
                          </td>
                          
                          {/* Visual Progress Bar & % */}
                          <td className="py-3 px-3">
                            <div className="flex items-center gap-2">
                              <span className="font-mono font-bold text-slate-900 w-10">
                                {item.attendanceRate}%
                              </span>
                              <div className="flex-1 bg-slate-100 rounded-full h-2 overflow-hidden w-16">
                                <div
                                  className={`h-2 rounded-full transition-all ${
                                    item.attendanceRate >= 90
                                      ? 'bg-emerald-500'
                                      : item.attendanceRate >= 75
                                      ? 'bg-amber-400'
                                      : 'bg-rose-500'
                                  }`}
                                  style={{ width: `${item.attendanceRate}%` }}
                                />
                              </div>
                            </div>
                          </td>

                          {/* Predikat */}
                          <td className="py-3 px-2">
                            <span
                              className={`inline-block px-2 py-0.5 rounded text-[11px] font-bold ${
                                item.statusPredikat === 'Sangat Rajin'
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : item.statusPredikat === 'Baik'
                                  ? 'bg-sky-100 text-sky-800'
                                  : 'bg-rose-100 text-rose-800'
                              }`}
                            >
                              {item.statusPredikat}
                            </span>
                          </td>

                          {/* Aksi */}
                          <td className="py-3 px-3 text-right no-print">
                            <button
                              onClick={() => setSelectedStudentHistory(item.student)}
                              className="px-2.5 py-1 text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded-md transition-colors inline-flex items-center gap-1"
                              title="Lihat Riwayat & Laporan Santri"
                            >
                              <span>Riwayat</span>
                              <ChevronRight className="w-3 h-3" />
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: DETAIL LOG JURNAL HARIAN */}
      {activeTab === 'jurnal' && (
        <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
          <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
            <div>
              <h3 className="font-bold text-slate-900 text-sm">
                Log Catatan Kegiatan ({filteredLogs.length} Entri)
              </h3>
              <p className="text-xs text-slate-500">
                Data aktivitas, murojaah, tartil, tahfidz, adab makan, dan sosialisasi per santri per hari.
              </p>
            </div>
            <span className="text-xs text-slate-500 font-mono">
              {useDateRange ? `${startDate} s/d ${endDate}` : 'Semua'}
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-slate-100 text-slate-700 font-semibold uppercase tracking-wider">
                <tr>
                  <th className="py-2.5 px-3">Tanggal</th>
                  <th className="py-2.5 px-3">Nama Santri</th>
                  <th className="py-2.5 px-3">Kelas</th>
                  <th className="py-2.5 px-3">Kehadiran</th>
                  <th className="py-2.5 px-3">Kondisi Datang</th>
                  <th className="py-2.5 px-3">Murojaah & Suara</th>
                  <th className="py-2.5 px-3">Tartil / Tahfidz</th>
                  <th className="py-2.5 px-3">Capaian Tahfiz</th>
                  <th className="py-2.5 px-3">Adab Makan</th>
                  <th className="py-2.5 px-3 text-center">Toilet</th>
                  <th className="py-2.5 px-3 text-right no-print">Slip</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {filteredLogs.length === 0 ? (
                  <tr>
                    <td colSpan={11} className="py-12 text-center text-slate-400">
                      Tidak ada catatan kegiatan yang sesuai dengan filter.
                    </td>
                  </tr>
                ) : (
                  filteredLogs.map((log) => {
                    const siswa = siswaList.find((s) => s.id === log.siswaId);
                    const kelas = kelasList.find((k) => k.id === log.kelasId);

                    return (
                      <tr key={log.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-2.5 px-3 font-mono text-slate-600 whitespace-nowrap">
                          {log.tanggal}
                        </td>
                        <td className="py-2.5 px-3">
                          <div className="font-bold text-slate-900">{siswa?.nama_siswa || '-'}</div>
                          <div className="text-[11px] text-slate-500 font-mono">
                            NIS: {siswa?.no_induk}
                          </div>
                        </td>
                        <td className="py-2.5 px-3 text-slate-700 whitespace-nowrap">
                          {kelas?.namaKelas || '-'}
                        </td>
                        <td className="py-2.5 px-3 whitespace-nowrap">
                          {log.kehadiran === 'hadir' ? (
                            <div>
                              <span className="font-semibold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded text-[11px]">
                                Hadir
                              </span>
                              <span className="text-[11px] text-slate-500 block mt-0.5">
                                {log.kedatangan === 'tepat_waktu' ? 'Tepat Waktu' : 'Terlambat'}
                              </span>
                            </div>
                          ) : (
                            <span className="font-semibold text-rose-800 bg-rose-50 px-2 py-0.5 rounded text-[11px] capitalize">
                              {log.sub_kehadiran || 'Tidak Hadir'}
                            </span>
                          )}
                        </td>
                        <td className="py-2.5 px-3 whitespace-nowrap">
                          {log.kondisi_kedatangan === 'ceria' ? (
                            <span className="inline-flex items-center gap-1 text-emerald-700 font-medium">
                              <Smile className="w-3.5 h-3.5" />
                              <span>Ceria</span>
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-amber-700 font-medium">
                              <Frown className="w-3.5 h-3.5" />
                              <span>Cemberut</span>
                            </span>
                          )}
                        </td>
                        <td className="py-2.5 px-3">
                          <div className="font-medium text-slate-800 capitalize">
                            {log.keaktifan_murojaah.replace('_', ' ')}
                          </div>
                          <div className="text-[11px] text-slate-500 capitalize">
                            Suara: {log.volume_suara.replace('_', ' ')}
                          </div>
                        </td>
                        <td className="py-2.5 px-3">
                          <div className="text-slate-800">
                            Tartil: <strong className="capitalize">{log.kemampuan_tartil.replace('_', ' ')}</strong>
                          </div>
                          <div className="text-slate-600">
                            Tahfidz: <strong className="capitalize">{log.kemampuan_tahfidz.replace('_', ' ')}</strong>
                          </div>
                        </td>
                        <td className="py-2.5 px-3 max-w-[180px]">
                          <p className="text-slate-800 italic truncate" title={log.capaian_tahfiz}>
                            {log.capaian_tahfiz || '-'}
                          </p>
                        </td>
                        <td className="py-2.5 px-3 whitespace-nowrap text-slate-700">
                          {log.adab_makan.replace(/_/g, ' ')}
                        </td>
                        <td className="py-2.5 px-3 font-mono text-center font-bold text-slate-800">
                          {log.ke_toilet}x
                        </td>
                        <td className="py-2.5 px-3 text-right no-print">
                          {siswa && (
                            <button
                              onClick={() =>
                                setSelectedReport({
                                  siswa,
                                  log,
                                  kelas,
                                })
                              }
                              className="px-2 py-1 text-xs text-emerald-700 hover:text-emerald-900 bg-emerald-50 hover:bg-emerald-100 rounded font-semibold transition-colors flex items-center gap-1 ml-auto"
                              title="Buka Slip Laporan / WhatsApp"
                            >
                              <FileText className="w-3.5 h-3.5" />
                              <span>Slip</span>
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal: Detailed History for a Single Student in this Period */}
      {selectedStudentHistory && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/50 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-2xl w-full shadow-2xl border border-slate-200 overflow-hidden my-6">
            <div className="px-6 py-4 bg-emerald-700 text-white flex items-center justify-between">
              <div>
                <span className="text-xs uppercase tracking-wider text-emerald-200 font-semibold block">
                  Riwayat Santri dalam Periode
                </span>
                <h3 className="text-lg font-bold">
                  {selectedStudentHistory.nama_siswa} {selectedStudentHistory.panggilan ? `(${selectedStudentHistory.panggilan})` : ''}
                </h3>
                <p className="text-xs text-emerald-100">
                  NIS: {selectedStudentHistory.no_induk} · Periode: {startDate} s/d {endDate}
                </p>
              </div>
              <button
                onClick={() => setSelectedStudentHistory(null)}
                className="text-emerald-200 hover:text-white text-2xl font-bold p-1 leading-none"
              >
                &times;
              </button>
            </div>

            <div className="p-6 space-y-4 max-h-[75vh] overflow-y-auto text-xs sm:text-sm">
              {(() => {
                const logs = filteredLogs.filter((l) => l.siswaId === selectedStudentHistory.id);
                const hadirCount = logs.filter((l) => l.kehadiran === 'hadir').length;
                const pct = logs.length > 0 ? Math.round((hadirCount / logs.length) * 100) : 0;

                return (
                  <>
                    <div className="grid grid-cols-3 gap-3 bg-slate-50 p-3.5 rounded-xl text-center">
                      <div>
                        <span className="text-slate-400 block text-xs">Total Hari Terdata</span>
                        <strong className="text-base text-slate-900 font-mono">{logs.length} Hari</strong>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-xs">Total Hadir</span>
                        <strong className="text-base text-emerald-600 font-mono">{hadirCount} Hari</strong>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-xs">Persentase</span>
                        <strong className="text-base text-emerald-700 font-mono">{pct}%</strong>
                      </div>
                    </div>

                    <div className="space-y-2 pt-2">
                      <span className="font-bold text-slate-800 text-xs uppercase tracking-wider block">
                        Riwayat Catatan Harian Santri:
                      </span>

                      {logs.length === 0 ? (
                        <p className="text-slate-400 text-center py-6">
                          Belum ada catatan untuk santri ini pada rentang tanggal tersebut.
                        </p>
                      ) : (
                        logs.map((log) => {
                          const isHadir = log.kehadiran === 'hadir';
                          return (
                            <div
                              key={log.id}
                              className="p-3 rounded-xl border border-slate-200 bg-white hover:border-emerald-300 transition-all space-y-1.5"
                            >
                              <div className="flex items-center justify-between">
                                <span className="font-bold font-mono text-slate-900">
                                  {log.tanggal}
                                </span>
                                <span
                                  className={`px-2 py-0.5 rounded text-xs font-bold ${
                                    isHadir ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                                  }`}
                                >
                                  {isHadir ? `Hadir (${log.kedatangan === 'tepat_waktu' ? 'Tepat' : 'Terlambat'})` : `Tidak Hadir (${log.sub_kehadiran || 'Izin'})`}
                                </span>
                              </div>

                              {isHadir && (
                                <div className="text-xs text-slate-600 space-y-1 pt-1">
                                  <div className="flex flex-wrap gap-2 text-[11px]">
                                    <span className="bg-slate-100 px-2 py-0.5 rounded">
                                      Mood: {log.kondisi_kedatangan === 'ceria' ? '😊 Ceria' : '🙁 Cemberut'}
                                    </span>
                                    <span className="bg-slate-100 px-2 py-0.5 rounded">
                                      Murojaah: {log.keaktifan_murojaah.replace('_', ' ')}
                                    </span>
                                    <span className="bg-slate-100 px-2 py-0.5 rounded">
                                      Adab: {log.adab_makan.replace(/_/g, ' ')}
                                    </span>
                                    <span className="bg-slate-100 px-2 py-0.5 rounded">
                                      Toilet: {log.ke_toilet}x
                                    </span>
                                  </div>

                                  {log.capaian_tahfiz && (
                                    <p className="text-emerald-800 italic bg-emerald-50/60 p-1.5 rounded">
                                      Tahfidz: {log.capaian_tahfiz}
                                    </p>
                                  )}

                                  {log.sosialisasi_dengan_teman && (
                                    <p className="text-slate-600">
                                      Sosialisasi: {log.sosialisasi_dengan_teman}
                                    </p>
                                  )}
                                </div>
                              )}
                            </div>
                          );
                        })
                      )}
                    </div>
                  </>
                );
              })()}
            </div>

            <div className="p-4 bg-slate-50 border-t border-slate-200 text-right">
              <button
                onClick={() => setSelectedStudentHistory(null)}
                className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 font-semibold rounded-lg text-xs"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Slip Modal */}
      {selectedReport && (
        <StudentReportModal
          isOpen={true}
          onClose={() => setSelectedReport(null)}
          siswa={selectedReport.siswa}
          log={selectedReport.log}
          kelas={selectedReport.kelas}
          tanggal={selectedReport.log.tanggal}
        />
      )}
    </div>
  );
};
