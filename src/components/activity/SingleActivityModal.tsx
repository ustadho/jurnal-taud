import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  Siswa, 
  CatatanHarian, 
  KehadiranType, 
  SubKehadiranType,
  KedatanganType,
  KondisiKedatanganType,
  SarapanType,
  FokusType,
  KeaktifanMurojaahType,
  VolumeSuaraType,
  KemampuanLevelType,
  AdabMakanType,
  KONDISI_KEDATANGAN_LABELS,
  KEAKTIFAN_MUROJAAH_LABELS,
  VOLUME_SUARA_LABELS,
  KEMAMPUAN_LEVEL_LABELS,
  ADAB_MAKAN_LABELS,
  SARAPAN_LABELS,
  FOKUS_LABELS
} from '../../types';
import { 
  Check, 
  Smile, 
  Frown, 
  Volume2, 
  Volume1, 
  VolumeX, 
  Utensils, 
  BookOpen, 
  Users, 
  CheckCircle2
} from 'lucide-react';

interface SingleActivityModalProps {
  isOpen: boolean;
  onClose: () => void;
  siswa: Siswa;
  tanggal: string;
  kelasId: string;
}

export const SingleActivityModal: React.FC<SingleActivityModalProps> = ({
  isOpen,
  onClose,
  siswa,
  tanggal,
  kelasId,
}) => {
  const { getCatatanHarianByDateAndSiswa, saveCatatanHarian } = useApp();

  const existingLog = getCatatanHarianByDateAndSiswa(tanggal, siswa.id);

  const [kehadiran, setKehadiran] = useState<KehadiranType>('hadir');
  const [subKehadiran, setSubKehadiran] = useState<SubKehadiranType>('izin');
  const [kedatangan, setKedatangan] = useState<KedatanganType>('tepat_waktu');
  const [kondisiKedatangan, setKondisiKedatangan] = useState<KondisiKedatanganType>('ceria');
  const [sarapan, setSarapan] = useState<SarapanType>('ya');
  const [fokusBelajar, setFokusBelajar] = useState<FokusType>('sangat_fokus');
  const [keaktifanMurojaah, setKeaktifanMurojaah] = useState<KeaktifanMurojaahType>('sangat_aktif');
  const [volumeSuara, setVolumeSuara] = useState<VolumeSuaraType>('keras');
  const [kemampuanTartil, setKemampuanTartil] = useState<KemampuanLevelType>('sangat_baik');
  const [kemampuanTahfidz, setKemampuanTahfidz] = useState<KemampuanLevelType>('sangat_baik');
  const [adabMakan, setAdabMakan] = useState<AdabMakanType>('habis_adab_baik');
  const [capaianTahfiz, setCapaianTahfiz] = useState<string>('');
  const [sosialisasi, setSosialisasi] = useState<string>('');
  const [keToilet, setKeToilet] = useState<number>(0);
  const [catatanKhusus, setCatatanKhusus] = useState<string>('');

  useEffect(() => {
    if (existingLog) {
      setKehadiran(existingLog.kehadiran);
      setSubKehadiran(existingLog.sub_kehadiran || 'izin');
      setKedatangan(existingLog.kedatangan);
      setKondisiKedatangan(existingLog.kondisi_kedatangan);
      setSarapan(existingLog.sarapan || 'ya');
      setFokusBelajar(existingLog.fokus_belajar || 'sangat_fokus');
      setKeaktifanMurojaah(existingLog.keaktifan_murojaah);
      setVolumeSuara(existingLog.volume_suara);
      setKemampuanTartil(existingLog.kemampuan_tartil);
      setKemampuanTahfidz(existingLog.kemampuan_tahfidz);
      setAdabMakan(existingLog.adab_makan);
      setCapaianTahfiz(existingLog.capaian_tahfiz || '');
      setSosialisasi(existingLog.sosialisasi_dengan_teman || '');
      setKeToilet(existingLog.ke_toilet ?? 0);
      setCatatanKhusus(existingLog.catatan_khusus || '');
    } else {
      // Default initial states
      setKehadiran('hadir');
      setSubKehadiran('izin');
      setKedatangan('tepat_waktu');
      setKondisiKedatangan('ceria');
      setSarapan('ya');
      setFokusBelajar('sangat_fokus');
      setKeaktifanMurojaah('sangat_aktif');
      setVolumeSuara('keras');
      setKemampuanTartil('baik');
      setKemampuanTahfidz('baik');
      setAdabMakan('habis_adab_baik');
      setCapaianTahfiz('');
      setSosialisasi('');
      setKeToilet(0);
      setCatatanKhusus('');
    }
  }, [existingLog, siswa.id, tanggal]);

  if (!isOpen) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    saveCatatanHarian({
      id: existingLog?.id,
      tanggal,
      siswaId: siswa.id,
      kelasId,
      kehadiran,
      sub_kehadiran: kehadiran === 'tidak_hadir' ? subKehadiran : undefined,
      kedatangan,
      kondisi_kedatangan: kondisiKedatangan,
      sarapan,
      fokus_belajar: fokusBelajar,
      keaktifan_murojaah: keaktifanMurojaah,
      volume_suara: volumeSuara,
      kemampuan_tartil: kemampuanTartil,
      kemampuan_tahfidz: kemampuanTahfidz,
      adab_makan: adabMakan,
      capaian_tahfiz: capaianTahfiz,
      sosialisasi_dengan_teman: sosialisasi,
      ke_toilet: keToilet,
      catatan_khusus: catatanKhusus,
    });
    onClose();
  };

  const quickTahfizSuggestions = [
    "Surat An-Nasr ayat 1-3 lancar",
    "Surat Al-Kautsar ayat 1-3 fasih",
    "Surat Al-Ikhlas ayat 1-4 tajwid baik",
    "Doa sebelum & sesudah makan lancar",
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/50 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-2xl w-full shadow-2xl border border-slate-200 overflow-hidden my-6">
        <div className="px-6 py-4 bg-emerald-600 text-white flex items-center justify-between">
          <div>
            <div className="text-xs uppercase tracking-wider text-emerald-100 font-semibold">Catatan Aktivitas</div>
            <h3 className="text-lg font-bold">{siswa.nama_siswa}</h3>
            <p className="text-xs text-emerald-100">{tanggal}</p>
          </div>
          <button onClick={onClose} className="text-emerald-200 hover:text-white text-2xl font-bold p-1">&times;</button>
        </div>

        <form onSubmit={handleSave} className="p-6 space-y-6 max-h-[80vh] overflow-y-auto text-sm">
          
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-4">
            <div className="font-bold text-slate-800 text-xs uppercase tracking-wider flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>1. Kehadiran, Kedatangan, Ekspresi & Sarapan</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">Status Kehadiran *</label>
                <div className="grid grid-cols-2 gap-2">
                  <button type="button" onClick={() => setKehadiran('hadir')} className={`py-2 px-3 rounded-lg text-xs font-bold border transition-all ${kehadiran === 'hadir' ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs' : 'bg-white text-slate-700 border-slate-300'}`}>✓ Hadir</button>
                  <button type="button" onClick={() => setKehadiran('tidak_hadir')} className={`py-2 px-3 rounded-lg text-xs font-bold border transition-all ${kehadiran === 'tidak_hadir' ? 'bg-rose-600 text-white border-rose-600 shadow-xs' : 'bg-white text-slate-700 border-slate-300'}`}>✕ Tidak</button>
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">Waktu Kedatangan *</label>
                <div className="grid grid-cols-2 gap-2">
                  <button type="button" disabled={kehadiran === 'tidak_hadir'} onClick={() => setKedatangan('tepat_waktu')} className={`py-2 px-3 rounded-lg text-xs font-bold border ${kedatangan === 'tepat_waktu' && kehadiran === 'hadir' ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs' : 'bg-white text-slate-700 border-slate-300 disabled:opacity-40'}`}>Tepat</button>
                  <button type="button" disabled={kehadiran === 'tidak_hadir'} onClick={() => setKedatangan('terlambat')} className={`py-2 px-3 rounded-lg text-xs font-bold border ${kedatangan === 'terlambat' && kehadiran === 'hadir' ? 'bg-amber-600 text-white border-amber-600 shadow-xs' : 'bg-white text-slate-700 border-slate-300 disabled:opacity-40'}`}>Terlambat</button>
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">Ekspresi saat Masuk *</label>
                <div className="grid grid-cols-2 gap-2">
                  <button type="button" disabled={kehadiran === 'tidak_hadir'} onClick={() => setKondisiKedatangan('ceria')} className={`p-2.5 rounded-lg text-xs border flex items-center justify-center gap-2 ${kondisiKedatangan === 'ceria' && kehadiran === 'hadir' ? 'bg-emerald-50 border-emerald-500 font-bold' : 'bg-white border-slate-300 disabled:opacity-40'}`}><Smile className="w-4 h-4 text-emerald-600" /> Senang</button>
                  <button type="button" disabled={kehadiran === 'tidak_hadir'} onClick={() => setKondisiKedatangan('cemberut')} className={`p-2.5 rounded-lg text-xs border flex items-center justify-center gap-2 ${kondisiKedatangan === 'cemberut' && kehadiran === 'hadir' ? 'bg-amber-50 border-amber-500 font-bold' : 'bg-white border-slate-300 disabled:opacity-40'}`}><Frown className="w-4 h-4 text-amber-600" /> Sedih</button>
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">Sarapan di Rumah *</label>
                <div className="grid grid-cols-2 gap-2">
                  {(['ya', 'tidak'] as SarapanType[]).map((s) => (
                    <button key={s} type="button" disabled={kehadiran === 'tidak_hadir'} onClick={() => setSarapan(s)} className={`py-2 px-3 rounded-lg text-xs font-bold border ${sarapan === s && kehadiran === 'hadir' ? 'bg-emerald-600 text-white' : 'bg-white border-slate-300 disabled:opacity-40'}`}>{SARAPAN_LABELS[s]}</button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-4">
            <div className="font-bold text-slate-800 text-xs uppercase tracking-wider flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-emerald-600" />
              <span>2. Fokus, Murojaah & Ziyadah</span>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">Fokus saat di Kelas *</label>
              <div className="grid grid-cols-3 gap-2">
                {(['sangat_fokus', 'fokus_pendek', 'tidak_fokus'] as FokusType[]).map((f) => (
                  <button key={f} type="button" disabled={kehadiran === 'tidak_hadir'} onClick={() => setFokusBelajar(f)} className={`p-2 text-xs rounded-lg border text-center ${fokusBelajar === f && kehadiran === 'hadir' ? 'bg-emerald-600 text-white font-bold' : 'bg-white border-slate-300 disabled:opacity-40'}`}>{FOKUS_LABELS[f]}</button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">Keaktifan Ziyadah/Murojaah *</label>
              <div className="grid grid-cols-3 gap-2">
                {(['sangat_aktif', 'cukup_aktif', 'tidak_aktif'] as KeaktifanMurojaahType[]).map((lvl) => (
                  <button key={lvl} type="button" disabled={kehadiran === 'tidak_hadir'} onClick={() => setKeaktifanMurojaah(lvl)} className={`p-2 rounded-lg text-xs border text-center ${keaktifanMurojaah === lvl && kehadiran === 'hadir' ? 'bg-emerald-600 text-white font-bold' : 'bg-white border-slate-300 disabled:opacity-40'}`}>{KEAKTIFAN_MUROJAAH_LABELS[lvl].label}</button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">Volume Suara Al-Quran *</label>
              <div className="grid grid-cols-3 gap-2">
                {(['keras', 'kecil_lirih', 'tidak_bersuara'] as VolumeSuaraType[]).map((vol) => (
                  <button key={vol} type="button" disabled={kehadiran === 'tidak_hadir'} onClick={() => setVolumeSuara(vol)} className={`p-2 rounded-lg text-xs border flex items-center justify-center gap-1.5 ${volumeSuara === vol && kehadiran === 'hadir' ? 'bg-emerald-600 text-white font-bold' : 'bg-white border-slate-300 disabled:opacity-40'}`}>
                    <span>{VOLUME_SUARA_LABELS[vol].label}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">Kemampuan Tartil *</label>
                <div className="space-y-1.5">
                  {(['sangat_baik', 'baik', 'perlu_ditingkatkan'] as KemampuanLevelType[]).map((lvl) => (
                    <button key={lvl} type="button" disabled={kehadiran === 'tidak_hadir'} onClick={() => setKemampuanTartil(lvl)} className={`w-full py-1.5 px-2.5 rounded-lg text-xs border text-left ${kemampuanTartil === lvl && kehadiran === 'hadir' ? 'bg-emerald-50 border-emerald-500 font-bold' : 'bg-white border-slate-300 disabled:opacity-40'}`}>{KEMAMPUAN_LEVEL_LABELS[lvl].label}</button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">Kemampuan Menghafal *</label>
                <div className="space-y-1.5">
                  {(['sangat_baik', 'baik', 'perlu_ditingkatkan'] as KemampuanLevelType[]).map((lvl) => (
                    <button key={lvl} type="button" disabled={kehadiran === 'tidak_hadir'} onClick={() => setKemampuanTahfidz(lvl)} className={`w-full py-1.5 px-2.5 rounded-lg text-xs border text-left ${kemampuanTahfidz === lvl && kehadiran === 'hadir' ? 'bg-emerald-50 border-emerald-500 font-bold' : 'bg-white border-slate-300 disabled:opacity-40'}`}>{KEMAMPUAN_LEVEL_LABELS[lvl].label}</button>
                  ))}
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">Capaian Tahfiz</label>
              <input type="text" placeholder="Tuliskan capaian..." value={capaianTahfiz} onChange={(e) => setCapaianTahfiz(e.target.value)} className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500" />
            </div>
          </div>

          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-4">
            <div className="font-bold text-slate-800 text-xs uppercase tracking-wider flex items-center gap-2">
              <Utensils className="w-4 h-4 text-emerald-600" />
              <span>3. Adab Makan & Ke Toilet</span>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">Adab Makan *</label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {(['habis_adab_baik', 'habis_adab_belum_baik', 'tidak_habis_adab_baik', 'tidak_habis_adab_tidak_baik'] as AdabMakanType[]).map((adm) => (
                  <button key={adm} type="button" disabled={kehadiran === 'tidak_hadir'} onClick={() => setAdabMakan(adm)} className={`p-2.5 rounded-lg text-xs border text-left ${adabMakan === adm && kehadiran === 'hadir' ? 'bg-emerald-50 border-emerald-500 font-bold text-emerald-900 shadow-xs' : 'bg-white border-slate-300 text-slate-700 disabled:opacity-40'}`}>
                    <div className="font-semibold">{ADAB_MAKAN_LABELS[adm].label}</div>
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-slate-200">
              <label className="block text-xs font-semibold text-slate-700">Ke Toilet (kali)</label>
              <div className="flex items-center gap-2">
                <button type="button" onClick={() => setKeToilet(Math.max(0, keToilet - 1))} className="w-8 h-8 rounded-lg bg-slate-200 text-slate-700 font-bold flex items-center justify-center">-</button>
                <span className="w-10 text-center font-bold text-base text-slate-900">{keToilet}</span>
                <button type="button" onClick={() => setKeToilet(keToilet + 1)} className="w-8 h-8 rounded-lg bg-slate-200 text-slate-700 font-bold flex items-center justify-center">+</button>
              </div>
            </div>
          </div>

          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
            <div className="font-bold text-slate-800 text-xs uppercase tracking-wider flex items-center gap-2">
              <Users className="w-4 h-4 text-emerald-600" />
              <span>4. Sosialisasi & Catatan</span>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Sosialisasi Teman</label>
              <textarea rows={2} placeholder="Tulis interaksi..." value={sosialisasi} onChange={(e) => setSosialisasi(e.target.value)} className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Catatan Khusus</label>
              <input type="text" placeholder="Keterangan tambahan..." value={catatanKhusus} onChange={(e) => setCatatanKhusus(e.target.value)} className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500" />
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200">
            <button type="button" onClick={onClose} className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg">Batal</button>
            <button type="submit" className="px-6 py-2.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-sm transition-colors">Simpan</button>
          </div>
        </form>
      </div>
    </div>
  );
};
