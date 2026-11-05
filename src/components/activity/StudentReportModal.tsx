import React from 'react';
import { useApp } from '../../context/AppContext';
import { 
  Siswa, 
  CatatanHarian, 
  Kelas,
  KONDISI_KEDATANGAN_LABELS,
  KEAKTIFAN_MUROJAAH_LABELS,
  VOLUME_SUARA_LABELS,
  KEMAMPUAN_LEVEL_LABELS,
  ADAB_MAKAN_LABELS,
  SARAPAN_LABELS,
  FOKUS_LABELS
} from '../../types';
import { 
  Printer, 
  Send, 
  Smile, 
  Frown, 
  CheckCircle2, 
  XCircle, 
  Utensils, 
  BookOpen, 
  MessageSquare,
  School,
  Clock,
  Sparkles
} from 'lucide-react';

interface StudentReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  siswa: Siswa;
  log?: CatatanHarian;
  kelas?: Kelas;
  tanggal: string;
}

export const StudentReportModal: React.FC<StudentReportModalProps> = ({
  isOpen,
  onClose,
  siswa,
  log,
  kelas,
  tanggal,
}) => {
  if (!isOpen) return null;

  const formatDateIndo = (dateStr: string) => {
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString('id-ID', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
    } catch {
      return dateStr;
    }
  };

  const generateWhatsAppMessage = () => {
    const panggilan = siswa.panggilan || siswa.nama_siswa;
    const dateFormatted = formatDateIndo(tanggal);

    if (!log) {
      return `Assalamu'alaikum Ayah/Bunda. Laporan harian ${panggilan} untuk tanggal ${dateFormatted} belum tercatat.`;
    }

    const kehadiranText = log.kehadiran === 'hadir' 
      ? `Hadir (${log.kedatangan === 'tepat_waktu' ? 'Tepat Waktu' : 'Terlambat'})`
      : `Tidak Hadir (${log.sub_kehadiran || 'Izin'})`;

    const moodText = KONDISI_KEDATANGAN_LABELS[log.kondisi_kedatangan]?.label || log.kondisi_kedatangan;
    const murojaahText = KEAKTIFAN_MUROJAAH_LABELS[log.keaktifan_murojaah]?.label || log.keaktifan_murojaah;
    const volumeText = VOLUME_SUARA_LABELS[log.volume_suara]?.label || log.volume_suara;
    const tartilText = KEMAMPUAN_LEVEL_LABELS[log.kemampuan_tartil]?.label || log.kemampuan_tartil;
    const tahfidzText = KEMAMPUAN_LEVEL_LABELS[log.kemampuan_tahfidz]?.label || log.kemampuan_tahfidz;
    const adabText = ADAB_MAKAN_LABELS[log.adab_makan]?.label || log.adab_makan;
    const sarapanText = SARAPAN_LABELS[log.sarapan] || log.sarapan;
    const fokusText = FOKUS_LABELS[log.fokus_belajar] || log.fokus_belajar;

    let msg = `*LAPORAN HARIAN TK - BUKU PENGHUBUNG*\n`;
    msg += `Hari/Tanggal: ${dateFormatted}\n`;
    msg += `Nama: *${siswa.nama_siswa}* (${panggilan})\n`;
    msg += `Kelas: ${kelas?.namaKelas || '-'}\n`;
    msg += `Wali Kelas: ${kelas?.waliKelas || '-'}\n`;
    msg += `─────────────────────\n`;
    msg += `1. Kehadiran: ${kehadiranText}\n`;
    if (log.kehadiran === 'hadir') {
      msg += `2. Suasana Hati: ${moodText}\n`;
      msg += `3. Sarapan: ${sarapanText}\n`;
      msg += `4. Fokus: ${fokusText}\n`;
      msg += `5. Murojaah/Ziyadah: ${murojaahText} (Suara: ${volumeText})\n`;
      msg += `6. Tartil & Tahfidz: ${tartilText} / ${tahfidzText}\n`;
      if (log.capaian_tahfiz) {
        msg += `   • Capaian: "${log.capaian_tahfiz}"\n`;
      }
      msg += `7. Adab Makan: ${adabText}\n`;
      if (log.sosialisasi_dengan_teman) {
        msg += `8. Sosialisasi: ${log.sosialisasi_dengan_teman}\n`;
      }
      msg += `9. Ke Toilet: ${log.ke_toilet} kali\n`;
      if (log.catatan_khusus) {
        msg += `\n*Catatan Ustadzah:* ${log.catatan_khusus}\n`;
      }
    }
    msg += `─────────────────────\n`;
    msg += `Terima kasih atas kerja samanya, Ayah dan Bunda! Wassalamu'alaikum Warahmatullahi Wabarakatuh.`;

    return encodeURIComponent(msg);
  };

  const handleSendWhatsApp = (phone: string) => {
    const cleanPhone = phone.replace(/\D/g, '').replace(/^0/, '62');
    const msg = generateWhatsAppMessage();
    const url = `https://api.whatsapp.com/send?phone=${cleanPhone}&text=${msg}`;
    window.open(url, '_blank');
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/50 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-xl w-full shadow-2xl border border-slate-200 overflow-hidden my-6">
        
        {/* Modal Top Bar (no-print) */}
        <div className="px-6 py-3.5 bg-slate-900 text-white flex items-center justify-between no-print">
          <div className="flex items-center gap-2">
            <School className="w-5 h-5 text-emerald-400" />
            <span className="font-bold text-sm">Lembar Laporan Harian Siswa</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="p-1.5 text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg transition-colors flex items-center gap-1.5 text-xs font-semibold"
              title="Cetak Laporan / Slip Harian"
            >
              <Printer className="w-4 h-4" />
              <span className="hidden sm:inline">Cetak</span>
            </button>
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-white text-xl font-bold p-1 leading-none"
            >
              &times;
            </button>
          </div>
        </div>

        {/* Printable Card Area */}
        <div className="p-6 sm:p-8 space-y-6">
          {/* Slip Header */}
          <div className="border-b-2 border-emerald-600 pb-4 text-center">
            <div className="text-xs uppercase font-extrabold tracking-widest text-emerald-700">
              JURNAL KEGIATAN HARIAN PEMBELAJARAN TK
            </div>
            <h2 className="text-xl font-bold text-slate-900 mt-0.5">
              TK ISLAM BINTANG CERIA
            </h2>
            <p className="text-xs text-slate-500">
              Hari/Tanggal: <strong>{formatDateIndo(tanggal)}</strong>
            </p>
          </div>

          {/* Student Identitas Box */}
          <div className="grid grid-cols-2 gap-4 bg-slate-50 p-4 rounded-xl text-xs sm:text-sm">
            <div>
              <span className="text-slate-500 block text-xs">Nama Lengkap Siswa</span>
              <span className="font-bold text-slate-900">{siswa.nama_siswa}</span>
              {siswa.panggilan && (
                <span className="text-xs text-slate-500 ml-1">({siswa.panggilan})</span>
              )}
            </div>
            <div>
              <span className="text-slate-500 block text-xs">Nomor Induk Siswa (NIS)</span>
              <span className="font-mono font-semibold text-slate-800">{siswa.no_induk}</span>
            </div>
            <div>
              <span className="text-slate-500 block text-xs">Rombel / Kelas</span>
              <span className="font-semibold text-emerald-800">{kelas?.namaKelas || '-'}</span>
            </div>
            <div>
              <span className="text-slate-500 block text-xs">Wali Kelas</span>
              <span className="font-semibold text-slate-800">{kelas?.waliKelas || '-'}</span>
            </div>
          </div>

          {/* Activity Checklist Record */}
          {!log ? (
            <div className="py-8 text-center text-slate-500 text-sm bg-slate-50 rounded-xl">
              Catatan harian belum diinput untuk tanggal ini.
            </div>
          ) : (
            <div className="space-y-4 text-xs sm:text-sm">
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {/* Kehadiran & Kedatangan */}
                <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                  <span className="text-[11px] text-slate-500 block font-medium">Kehadiran</span>
                  <div className="font-bold text-slate-900 mt-0.5 flex items-center gap-1.5">
                    {log.kehadiran === 'hadir' ? (
                      <>
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        <span>Hadir</span>
                      </>
                    ) : (
                      <>
                        <XCircle className="w-4 h-4 text-rose-600" />
                        <span className="capitalize">{log.sub_kehadiran || 'Tidak Hadir'}</span>
                      </>
                    )}
                  </div>
                  {log.kehadiran === 'hadir' && (
                    <span className="text-[11px] text-slate-500 mt-1 block">
                      Waktu: {log.kedatangan === 'tepat_waktu' ? 'Tepat Waktu' : 'Terlambat'}
                    </span>
                  )}
                </div>

                {/* Mood Datang */}
                <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                  <span className="text-[11px] text-slate-500 block font-medium">Suasana Hati Datang</span>
                  <div className="font-bold text-slate-900 mt-0.5 flex items-center gap-1.5">
                    {log.kondisi_kedatangan === 'ceria' ? (
                      <>
                        <Smile className="w-4 h-4 text-emerald-600" />
                        <span>Ceria</span>
                      </>
                    ) : (
                      <>
                        <Frown className="w-4 h-4 text-amber-600" />
                        <span>Sedih</span>
                      </>
                    )}
                  </div>
                </div>

                {/* Sarapan */}
                <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                  <span className="text-[11px] text-slate-500 block font-medium">Sarapan</span>
                  <div className="font-bold text-slate-900 mt-0.5">{SARAPAN_LABELS[log.sarapan]}</div>
                </div>

                {/* Fokus */}
                <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                  <span className="text-[11px] text-slate-500 block font-medium">Fokus Belajar</span>
                  <div className="font-bold text-slate-900 mt-0.5">{FOKUS_LABELS[log.fokus_belajar]}</div>
                </div>

                {/* Ke Toilet */}
                <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                  <span className="text-[11px] text-slate-500 block font-medium">Ke Toilet</span>
                  <div className="font-bold text-slate-900 mt-0.5 font-mono">
                    {log.ke_toilet} Kali
                  </div>
                  <span className="text-[11px] text-slate-400">Selama pembelajaran</span>
                </div>
              </div>

              {/* Murojaah & Tahfidz */}
              <div className="p-4 bg-emerald-50/60 rounded-xl border border-emerald-100 space-y-2">
                <div className="font-bold text-emerald-900 text-xs uppercase tracking-wider flex items-center gap-1.5">
                  <BookOpen className="w-4 h-4 text-emerald-700" />
                  <span>Murojaah, Tartil & Tahfidz</span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pt-1 text-xs">
                  <div>
                    <span className="text-slate-500 block">Keaktifan:</span>
                    <strong className="text-slate-900">
                      {KEAKTIFAN_MUROJAAH_LABELS[log.keaktifan_murojaah]?.label}
                    </strong>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Volume Suara:</span>
                    <strong className="text-slate-900">
                      {VOLUME_SUARA_LABELS[log.volume_suara]?.label}
                    </strong>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Tartil:</span>
                    <strong className="text-slate-900">
                      {KEMAMPUAN_LEVEL_LABELS[log.kemampuan_tartil]?.label}
                    </strong>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Tahfidz:</span>
                    <strong className="text-slate-900">
                      {KEMAMPUAN_LEVEL_LABELS[log.kemampuan_tahfidz]?.label}
                    </strong>
                  </div>
                </div>

                {log.capaian_tahfiz && (
                  <div className="pt-2 border-t border-emerald-100 text-xs">
                    <span className="text-emerald-800 font-semibold block">Capaian Ayat / Surat:</span>
                    <p className="text-slate-800 italic mt-0.5">"{log.capaian_tahfiz}"</p>
                  </div>
                )}
              </div>

              {/* Adab Makan */}
              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
                <div className="font-bold text-slate-800 text-xs uppercase tracking-wider flex items-center gap-1.5 mb-1">
                  <Utensils className="w-4 h-4 text-emerald-600" />
                  <span>Adab Makan</span>
                </div>
                <div className="font-semibold text-slate-900">
                  {ADAB_MAKAN_LABELS[log.adab_makan]?.label}
                </div>
                <div className="text-xs text-slate-500 mt-0.5">
                  {ADAB_MAKAN_LABELS[log.adab_makan]?.desc}
                </div>
              </div>

              {/* Sosialisasi */}
              {log.sosialisasi_dengan_teman && (
                <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
                  <div className="font-bold text-slate-800 text-xs uppercase tracking-wider mb-1">
                    Sosialisasi & Interaksi dengan Teman
                  </div>
                  <p className="text-slate-800 text-xs">
                    {log.sosialisasi_dengan_teman}
                  </p>
                </div>
              )}

              {/* Catatan Khusus Guru */}
              {log.catatan_khusus && (
                <div className="p-3.5 bg-amber-50/70 rounded-xl border border-amber-200">
                  <div className="font-bold text-amber-900 text-xs uppercase tracking-wider mb-1">
                    Catatan Guru untuk Orang Tua
                  </div>
                  <p className="text-slate-800 text-xs">
                    {log.catatan_khusus}
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Tanda Tangan Guru & Orang Tua (Visible in Print) */}
          <div className="pt-8 border-t border-slate-200 grid grid-cols-2 text-center text-xs">
            <div>
              <p className="text-slate-500">Mengetahui Orang Tua/Wali,</p>
              <div className="h-14"></div>
              <p className="font-semibold text-slate-800">
                ( {siswa.nama_ibu || siswa.nama_ayah || '....................'} )
              </p>
            </div>
            <div>
              <p className="text-slate-500">Guru / Wali Kelas,</p>
              <div className="h-14"></div>
              <p className="font-semibold text-slate-800">
                ( {kelas?.waliKelas || 'Ustadzah Wali Kelas'} )
              </p>
            </div>
          </div>
        </div>

        {/* Modal Bottom Actions (WhatsApp Direct) */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 no-print">
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              onClick={() => handleSendWhatsApp(siswa.hp_ibu)}
              className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold transition-colors shadow-xs"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Kirim WA ke Bunda</span>
            </button>
            <button
              onClick={() => handleSendWhatsApp(siswa.hp_ayah)}
              className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 px-3 py-2 bg-emerald-100 hover:bg-emerald-200 text-emerald-800 rounded-lg text-xs font-semibold transition-colors"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Kirim WA ke Ayah</span>
            </button>
          </div>

          <button
            onClick={onClose}
            className="w-full sm:w-auto px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-200 rounded-lg transition-colors"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};
