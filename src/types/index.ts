export type JenisKelamin = 'L' | 'P';

export type KehadiranType = 'hadir' | 'tidak_hadir';
export type SubKehadiranType = 'izin' | 'sakit' | 'alpa';

export type KedatanganType = 'tepat_waktu' | 'terlambat';

export type KondisiKedatanganType = 'ceria' | 'cemberut';

export type KeaktifanMurojaahType = 'sangat_aktif' | 'cukup_aktif' | 'tidak_aktif';

export type VolumeSuaraType = 'keras' | 'kecil_lirih' | 'tidak_bersuara';

export type KemampuanLevelType = 'sangat_baik' | 'baik' | 'perlu_ditingkatkan';

export type SarapanType = 'ya' | 'tidak';
export type FokusType = 'sangat_fokus' | 'fokus_pendek' | 'tidak_fokus';

export type UserRole = 'admin' | 'guru';

export interface ToastNotification {
  id: string;
  type: 'success' | 'error' | 'info' | 'warning';
  message: string;
}

export interface User {
  id: string;
  username: string;
  nama: string;
  email: string;
  password?: string;
  role: UserRole;
  kelasIds?: string[]; // ID kelas yang dimapping untuk guru ini
  telepon?: string;
  catatan?: string;
  avatarColor?: string;
}

export type AdabMakanType = 
  | 'habis_adab_baik'
  | 'habis_adab_belum_baik'
  | 'tidak_habis_adab_baik'
  | 'tidak_habis_adab_tidak_baik';

export interface TahunPelajaran {
  id: string;
  nama: string; // e.g. "2025/2026"
  semester: 'Ganjil' | 'Genap';
  status: 'aktif' | 'nonaktif';
  catatan?: string;
}

export interface Kelas {
  id: string;
  tahunPelajaranId: string;
  namaKelas: string; // e.g. "TK-A Al-Fatihah"
  tingkat: 'KB' | 'TK-A' | 'TK-B';
  waliKelas: string; // e.g. "Ustadzah Siti Aminah, S.Pd."
  pendampingKelas?: string; // e.g. "Ustadzah Rina"
  kapasitas: number;
}

export interface Siswa {
  id: string;
  no_induk: string; // NIS / NISN
  nama_siswa: string;
  panggilan?: string;
  jenis_kelamin: JenisKelamin;
  tempat_lahir: string;
  tgl_lahir: string; // YYYY-MM-DD
  alamat: string;
  nama_ayah: string;
  hp_ayah: string;
  nama_ibu: string;
  hp_ibu: string;
  tahun_masuk: string;
}

export interface PlotingSiswa {
  id: string;
  siswaId: string;
  kelasId: string;
  tahunPelajaranId: string;
  tanggalPloting: string;
  nomorUrut?: number;
}

export interface CatatanHarian {
  id: string;
  tanggal: string; // YYYY-MM-DD
  siswaId: string;
  kelasId: string;
  
  // Checklist items based on requirements:
  kehadiran: KehadiranType;
  sub_kehadiran?: SubKehadiranType;
  kedatangan: KedatanganType;
  kondisi_kedatangan: KondisiKedatanganType;
  sarapan: SarapanType;
  fokus_belajar: FokusType;
  keaktifan_murojaah: KeaktifanMurojaahType;
  volume_suara: VolumeSuaraType;
  kemampuan_tartil: KemampuanLevelType;
  kemampuan_tahfidz: KemampuanLevelType;
  adab_makan: AdabMakanType;
  capaian_tahfiz: string; // free text
  sosialisasi_dengan_teman: string; // free text
  ke_toilet: number; // berapa kali
  
  catatan_khusus?: string; // catatan tambahan guru
  updatedAt: string;
}

// Option definitions and Indonesian labels
export const KONDISI_KEDATANGAN_LABELS: Record<KondisiKedatanganType, { label: string; desc: string }> = {
  ceria: { label: 'Ceria - Senang', desc: 'Tersenyum, antusias saat datang' },
  cemberut: { label: 'Cemberut - Tidak Senang', desc: 'Menangis, merajuk atau cemberut' },
};

export const KEAKTIFAN_MUROJAAH_LABELS: Record<KeaktifanMurojaahType, { label: string; desc: string }> = {
  sangat_aktif: { label: 'Sangat Aktif', desc: 'Fokus penuh dan bersemangat' },
  cukup_aktif: { label: 'Cukup Aktif', desc: 'Mengikuti dengan sesekali terdistraksi' },
  tidak_aktif: { label: 'Tidak Aktif', desc: 'Pasif atau enggan melafalkan' },
};

export const VOLUME_SUARA_LABELS: Record<VolumeSuaraType, { label: string; desc: string }> = {
  keras: { label: 'Keras', desc: 'Suara lantang dan terdengar jelas' },
  kecil_lirih: { label: 'Kecil - Lirih', desc: 'Suara pelan / berbisik' },
  tidak_bersuara: { label: 'Tidak Bersuara', desc: 'Hanya diam saat murojaah' },
};

export const KEMAMPUAN_LEVEL_LABELS: Record<KemampuanLevelType, { label: string; desc: string }> = {
  sangat_baik: { label: 'Sangat Baik', desc: 'Makhraj & tajwid tepat / hafalan lancar' },
  baik: { label: 'Baik', desc: 'Cukup lancar dengan sedikit bimbingan' },
  perlu_ditingkatkan: { label: 'Perlu Ditingkatkan', desc: 'Masih sering terbata / perlu pengulangan' },
};

export const ADAB_MAKAN_LABELS: Record<AdabMakanType, { label: string; desc: string }> = {
  habis_adab_baik: { label: 'Habis & Sesuai Adab Makan', desc: 'Makanan dihabiskan, tertib' },
  habis_adab_belum_baik: { label: 'Habis & Belum Sesuai Adab', desc: 'Makanan dihabiskan, belum tertib' },
  tidak_habis_adab_baik: { label: 'Tidak Habis tapi Sesuai Adab', desc: 'Makanan bersisa, tertib' },
  tidak_habis_adab_tidak_baik: { label: 'Tidak Habis & Tidak Sesuai Adab', desc: 'Makanan bersisa, tidak tertib' },
};

export const SARAPAN_LABELS: Record<SarapanType, string> = {
  ya: 'Ya',
  tidak: 'Tidak',
};

export const FOKUS_LABELS: Record<FokusType, string> = {
  sangat_fokus: 'Sangat Fokus',
  fokus_pendek: 'Fokus Pendek',
  tidak_fokus: 'Tidak Fokus',
};
