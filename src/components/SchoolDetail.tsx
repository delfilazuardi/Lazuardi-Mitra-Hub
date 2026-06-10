import React from "react";
import { ReportRecord, SchoolHistory } from "../types";
import { X, Check, AlertTriangle, Calendar, FileText, Info, Award, Clock } from "lucide-react";
import { motion } from "motion/react";

interface DetailProps {
  key?: string;
  schoolName: string;
  records: ReportRecord[];
  onClose: () => void;
}

export default function SchoolDetail({ schoolName, records, onClose }: DetailProps) {
  // Filter records specifically for this school
  const schoolRecords = records
    .filter((r) => r.sekolahMitra === schoolName)
    .sort((a, b) => {
      // Sort chronologically
      const monthOrder = ["Juli", "Agustus", "September", "Oktober", "November", "Desember", "Januari", "Februari", "Maret", "April", "Mei", "Juni"];
      const keyA = a.tahun * 12 + monthOrder.indexOf(a.bulan.trim());
      const keyB = b.tahun * 12 + monthOrder.indexOf(b.bulan.trim());
      return keyA - keyB;
    });

  // Calculate statistics
  const totalPeriods = schoolRecords.length;
  const sudahKirim = schoolRecords.filter((r) => r.statusLaporan === "Sudah Kirim");
  const belumKirimCount = schoolRecords.filter((r) => r.statusLaporan === "Belum Kirim").length;
  const selesaiAuditCount = schoolRecords.filter((r) => r.statusAudit === "Selesai").length;
  const revisiCount = schoolRecords.filter((r) => r.statusAudit === "Revisi").length;
  const submissionRate = totalPeriods > 0 ? Math.round((sudahKirim.length / totalPeriods) * 100) : 0;

  // Level compliance badge
  const getBadgeColor = (rate: number) => {
    if (rate >= 90) return { bg: "bg-emerald-50 border-emerald-200 text-emerald-700", label: "Tingkat Kepatuhan: SANGAT TINGGI" };
    if (rate >= 75) return { bg: "bg-blue-50 border-blue-200 text-blue-700", label: "Tingkat Kepatuhan: BAIK" };
    if (rate >= 50) return { bg: "bg-amber-50 border-amber-200 text-amber-700", label: "Tingkat Kepatuhan: CUKUP" };
    return { bg: "bg-rose-50 border-rose-200 text-rose-700", label: "Tingkat Kepatuhan: BUTUH ATENSI" };
  };

  const statusBadge = getBadgeColor(submissionRate);

  return (
    <motion.div
      id="school-detail-modal"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      className="bg-white border border-slate-100 rounded-3xl p-6 shadow-md"
    >
      {/* Top title and exit */}
      <div className="flex items-center justify-between border-b border-slate-50 pb-4 mb-6">
        <div>
          <span className="text-[10px] font-bold text-indigo-600 bg-indigo-50 border border-indigo-100 px-2.5 py-1 rounded-full uppercase tracking-wider">
            Detail Performa Sekolah Mitra
          </span>
          <h2 className="text-xl font-bold text-slate-800 tracking-tight mt-2">{schoolName}</h2>
        </div>
        <button
          id="btn-close-school-detail"
          onClick={onClose}
          className="p-1.5 rounded-xl hover:bg-slate-100 border border-slate-100 transition-all cursor-pointer"
        >
          <X className="w-5 h-5 text-slate-400" />
        </button>
      </div>

      {/* Grid compliance rate and highlights */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {/* Compliance Circle Chart */}
        <div className="bg-slate-50/50 p-4 border border-slate-100 rounded-2xl flex flex-col items-center justify-center text-center">
          <div className="relative flex items-center justify-center">
            {/* SVG Progress Circle */}
            <svg className="w-24 h-24 transform -rotate-90">
              <circle cx="48" cy="48" r="40" stroke="#000" strokeOpacity="0.05" strokeWidth="8" fill="transparent" />
              <circle
                cx="48"
                cy="48"
                r="40"
                stroke="#4f46e5"
                strokeWidth="8"
                fill="transparent"
                strokeDasharray={2 * Math.PI * 40}
                strokeDashoffset={2 * Math.PI * 40 * (1 - submissionRate / 100)}
                strokeLinecap="round"
              />
            </svg>
            <span className="absolute text-xl font-extrabold text-slate-800 font-mono">{submissionRate}%</span>
          </div>
          <span className="text-xs font-bold text-slate-700 mt-4 leading-relaxed">Rasio Pengiriman</span>
          <span className="text-[10px] text-slate-400 mt-1">Laporan berhasil disubmit tepat waktu</span>
        </div>

        {/* Audit performance indicators */}
        <div className="md:col-span-2 space-y-4">
          <div className={`p-3 rounded-xl border border-dashed flex items-center gap-2.5 ${statusBadge.bg}`}>
            <Award className="w-4 h-4 flex-shrink-0" />
            <span className="text-[11px] font-bold uppercase tracking-wider">{statusBadge.label}</span>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="p-3 bg-teal-50/40 border border-teal-100/50 rounded-xl">
              <span className="block text-[10px] text-slate-400 font-bold uppercase tracking-wider">Selesai Audit</span>
              <span className="text-lg font-bold text-teal-700 block mt-1">{selesaiAuditCount}</span>
            </div>
            <div className="p-3 bg-amber-50/50 border border-amber-100 rounded-xl">
              <span className="block text-[10px] text-slate-400 font-bold uppercase tracking-wider">Butuh Revisi</span>
              <span className="text-lg font-bold text-amber-700 block mt-1">{revisiCount}</span>
            </div>
            <div className="p-3 bg-slate-50 border border-slate-200/50 rounded-xl">
              <span className="block text-[10px] text-slate-400 font-bold uppercase tracking-wider">Belum Kirim</span>
              <span className="text-lg font-bold text-slate-600 block mt-1">{belumKirimCount}</span>
            </div>
          </div>

          <div className="text-xs text-slate-400 leading-normal flex items-start gap-1.5 p-1 bg-slate-50/40 rounded-lg">
            <Info className="w-3.5 h-3.5 text-indigo-500 mt-0.5 flex-shrink-0" />
            <span>Audit keuangan ini dilakukan secara bulanan untuk memastikan tata kelola dana BOS, kas, dan operasional di bawah naungan Lazuardi Group berjalan transparan.</span>
          </div>
        </div>
      </div>

      {/* Chronological Checklist Grid */}
      <div>
        <h3 className="text-sm font-bold text-slate-700 mb-4 flex items-center gap-2">
          <Calendar className="w-4 h-4 text-slate-400" />
          Riwayat Pengarsipan Bulanan ({totalPeriods} Periode)
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3.5">
          {schoolRecords.map((r) => {
            const isSent = r.statusLaporan === "Sudah Kirim";
            const isSelesai = r.statusAudit === "Selesai";
            const isRevisi = r.statusAudit === "Revisi";

            let bgClass = "bg-rose-50/50 border-rose-100/70 hover:bg-rose-50 text-rose-700";
            let statusText = "Lewat Tenggat (Belum)";
            if (isSent) {
              if (isSelesai) {
                bgClass = "bg-teal-50/30 border-teal-100 hover:bg-teal-50 text-teal-800";
                statusText = "Laporan Clear";
              } else if (isRevisi) {
                bgClass = "bg-amber-50/50 border-amber-200 hover:bg-amber-50 text-amber-800";
                statusText = "Revisi Auditor";
              } else {
                bgClass = "bg-indigo-50/40 border-indigo-100/50 hover:bg-indigo-50 text-indigo-800";
                statusText = "Antrean Verifikasi";
              }
            }

            return (
              <div
                key={r.id}
                className={`p-3 border rounded-xl flex flex-col justify-between transition-all group ${bgClass}`}
              >
                <div>
                  <span className="text-[10px] uppercase font-bold tracking-wider opacity-60 block">
                    {r.bulan} {r.tahun}
                  </span>
                  <span className="text-[11px] font-extrabold mt-1.5 block tracking-tight">
                    {isSent ? "Sudah Dikirim" : "Belum Dikirim"}
                  </span>
                </div>
                
                <div className="mt-4 pt-2 border-t border-slate-100/10 flex items-center justify-between">
                  <span className="text-[9px] font-medium opacity-80">{statusText}</span>
                  {isSent ? (
                    isSelesai ? (
                      <Check className="w-3.5 h-3.5 text-teal-600" />
                    ) : isRevisi ? (
                      <AlertTriangle className="w-3.5 h-3.5 text-amber-500 animate-pulse" />
                    ) : (
                      <Clock className="w-3.5 h-3.5 text-indigo-500" />
                    )
                  ) : (
                    <X className="w-3.5 h-3.5 text-rose-400" />
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </motion.div>
  );
}
