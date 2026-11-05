import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  Siswa, 
  CatatanHarian, 
  KehadiranType, 
  SubKehadiranType,
  KedatanganType, 
  KondisiKedatanganType, 
  KeaktifanMurojaahType,
  VolumeSuaraType,
  KemampuanLevelType,
  AdabMakanType,
  SarapanType,
  FokusType,
  SARAPAN_LABELS,
  FOKUS_LABELS,
  ADAB_MAKAN_LABELS
} from '../../types';
import { 
  Check, 
  Save, 
  Edit
} from 'lucide-react';

interface BatchClassSheetProps {
  students: Siswa[];
  tanggal: string;
  kelasId: string;
  onOpenSingleModal: (siswa: Siswa) => void;
}

type StudentDraft = {
  kehadiran: KehadiranType;
  sub_kehadiran: SubKehadiranType | undefined;
  kedatangan: KedatanganType;
  kondisi_kedatangan: KondisiKedatanganType;
  sarapan: SarapanType;
  fokus_belajar: FokusType;
  keaktifan_murojaah: KeaktifanMurojaahType;
  volume_suara: VolumeSuaraType;
  kemampuan_tartil: KemampuanLevelType;
  kemampuan_tahfidz: KemampuanLevelType;
  adab_makan: AdabMakanType;
  capaian_tahfiz: string;
  sosialisasi_dengan_teman: string;
  ke_toilet: number;
  catatan_khusus: string;
};

export const BatchClassSheet: React.FC<BatchClassSheetProps> = ({
  students,
  tanggal,
  kelasId,
  onOpenSingleModal,
}) => {
  const { getCatatanHarianByDateAndSiswa, batchSaveCatatanHarian } = useApp();

  const [drafts, setDrafts] = useState<Record<string, StudentDraft>>({});
  const [saveSuccessMessage, setSaveSuccessMessage] = useState(false);

  useEffect(() => {
    const initialDrafts: Record<string, StudentDraft> = {};

    students.forEach((s) => {
      const existing = getCatatanHarianByDateAndSiswa(tanggal, s.id);
      if (existing) {
        initialDrafts[s.id] = {
          kehadiran: existing.kehadiran,
          sub_kehadiran: existing.sub_kehadiran,
          kedatangan: existing.kedatangan,
          kondisi_kedatangan: existing.kondisi_kedatangan,
          sarapan: existing.sarapan || 'ya',
          fokus_belajar: existing.fokus_belajar || 'sangat_fokus',
          keaktifan_murojaah: existing.keaktifan_murojaah,
          volume_suara: existing.volume_suara,
          kemampuan_tartil: existing.kemampuan_tartil,
          kemampuan_tahfidz: existing.kemampuan_tahfidz,
          adab_makan: existing.adab_makan,
          capaian_tahfiz: existing.capaian_tahfiz || '',
          sosialisasi_dengan_teman: existing.sosialisasi_dengan_teman || '',
          ke_toilet: existing.ke_toilet ?? 0,
          catatan_khusus: existing.catatan_khusus || '',
        };
      } else {
        initialDrafts[s.id] = {
          kehadiran: 'hadir',
          sub_kehadiran: undefined,
          kedatangan: 'tepat_waktu',
          kondisi_kedatangan: 'ceria',
          sarapan: 'ya',
          fokus_belajar: 'sangat_fokus',
          keaktifan_murojaah: 'sangat_aktif',
          volume_suara: 'keras',
          kemampuan_tartil: 'baik',
          kemampuan_tahfidz: 'baik',
          adab_makan: 'habis_adab_baik',
          capaian_tahfiz: '',
          sosialisasi_dengan_teman: '',
          ke_toilet: 0,
          catatan_khusus: '',
        };
      }
    });

    setDrafts(initialDrafts);
  }, [students, tanggal, kelasId]);

  const updateDraft = (siswaId: string, field: keyof StudentDraft, value: any) => {
    setDrafts((prev) => ({
      ...prev,
      [siswaId]: { ...prev[siswaId], [field]: value },
    }));
  };

  const handleSaveAll = () => {
    const itemsToSave = students.map((s) => {
        const draft = drafts[s.id];
        return {
            id: getCatatanHarianByDateAndSiswa(tanggal, s.id)?.id,
            tanggal,
            siswaId: s.id,
            kelasId,
            kehadiran: draft.kehadiran,
            sub_kehadiran: draft.kehadiran === 'tidak_hadir' ? (draft.sub_kehadiran || 'alpa') : undefined,
            kedatangan: draft.kedatangan,
            kondisi_kedatangan: draft.kondisi_kedatangan,
            sarapan: draft.sarapan,
            fokus_belajar: draft.fokus_belajar,
            keaktifan_murojaah: draft.keaktifan_murojaah,
            volume_suara: draft.volume_suara,
            kemampuan_tartil: draft.kemampuan_tartil,
            kemampuan_tahfidz: draft.kemampuan_tahfidz,
            adab_makan: draft.adab_makan,
            capaian_tahfiz: draft.capaian_tahfiz,
            sosialisasi_dengan_teman: draft.sosialisasi_dengan_teman,
            ke_toilet: draft.ke_toilet,
            catatan_khusus: draft.catatan_khusus
        };
    });

    batchSaveCatatanHarian(itemsToSave);
    setSaveSuccessMessage(true);
    setTimeout(() => setSaveSuccessMessage(false), 3000);
  };

  return (
    <div className="space-y-4">
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex items-center justify-between">
        <span className="text-xs font-bold text-slate-700">Lembar Cepat Harian</span>
        <button type="button" onClick={handleSaveAll} className="px-5 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-sm flex items-center gap-2">
          <Save className="w-4 h-4" /> Simpan Semua
        </button>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl overflow-x-auto shadow-xs">
        <table className="w-full text-left text-xs border-collapse">
          <thead className="bg-slate-100 border-b border-slate-200">
            <tr>
              <th className="py-3 px-3">Siswa</th>
              <th className="py-3 px-2">Kehadiran</th>
              <th className="py-3 px-2">Sarapan</th>
              <th className="py-3 px-2">Adab Makan</th>
              <th className="py-3 px-3">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {students.map((siswa) => {
              const draft = drafts[siswa.id];
              if (!draft) return null;
              return (
                <tr key={siswa.id} className="hover:bg-slate-50">
                  <td className="py-2.5 px-3 font-bold">{siswa.nama_siswa}</td>
                  <td className="py-2.5 px-2">
                    <select value={draft.kehadiran} onChange={(e) => updateDraft(siswa.id, 'kehadiran', e.target.value)} className="text-xs p-1 rounded border">
                      <option value="hadir">Hadir</option>
                      <option value="tidak_hadir">Tidak Hadir</option>
                    </select>
                  </td>
                  <td className="py-2.5 px-2">
                    <select value={draft.sarapan} onChange={(e) => updateDraft(siswa.id, 'sarapan', e.target.value)} className="text-xs p-1 rounded border">
                      <option value="ya">Ya</option>
                      <option value="tidak">Tidak</option>
                    </select>
                  </td>
                  <td className="py-2.5 px-2">
                     <select value={draft.adab_makan} onChange={(e) => updateDraft(siswa.id, 'adab_makan', e.target.value)} className="text-xs p-1 rounded border">
                      <option value="habis_adab_baik">Habis & Tertib</option>
                      <option value="habis_adab_belum_baik">Habis & Belum Tertib</option>
                      <option value="tidak_habis_adab_baik">Tidak Habis & Tertib</option>
                      <option value="tidak_habis_adab_tidak_baik">Tidak Habis & Tidak Tertib</option>
                    </select>
                  </td>
                  <td className="py-2.5 px-3">
                    <button type="button" onClick={() => onOpenSingleModal(siswa)} className="p-1 text-slate-500 hover:text-emerald-700"><Edit className="w-4 h-4" /></button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
