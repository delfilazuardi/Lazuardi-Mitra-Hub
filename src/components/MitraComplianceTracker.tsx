import React, { useState, useMemo } from "react";
import { ReportRecord, Invoice, EventTracker } from "../types";
import { 
  School, 
  CheckCircle, 
  AlertTriangle, 
  XCircle, 
  TrendingUp, 
  FileSpreadsheet, 
  ChevronRight, 
  ChevronDown, 
  Clock, 
  Search, 
  Sliders, 
  BarChart, 
  Check, 
  ShieldAlert,
  Wallet,
  CalendarDays
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface ComplianceTrackerProps {
  records: ReportRecord[];
  invoices: Invoice[];
  events: EventTracker[];
}

interface SchoolComplianceStats {
  schoolName: string;
  totalRecords: number;
  submittedCount: number;
  notSubmittedCount: number;
  completedAuditCount: number;
  revisionAuditCount: number;
  pendingAuditCount: number;
  compliancePercentage: number;
  auditCompletionPercentage: number;
  paidInvoiceCount: number;
  unpaidInvoiceCount: number;
  totalUnpaidAmount: number;
  upcomingEventCount: number;
  complianceRating: "Sangat Patuh" | "Patuh" | "Perlu Perbaikan" | "Kritis";
}

export default function MitraComplianceTracker({ records, invoices, events }: ComplianceTrackerProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [minCompliance, setMinCompliance] = useState<number>(0);
  const [expandedSchool, setExpandedSchool] = useState<string | null>(null);

  // 1. Get unique list of school names
  const schools = useMemo(() => {
    const list = Array.from(new Set(records.map((r) => r.sekolahMitra)));
    if (list.length === 0) return ["SMA Lazuardi", "Al-Falah Depok", "Cordova", "Haura", "Ibnu Sina"];
    return list;
  }, [records]);

  // 2. Compile stats per school
  const schoolStatsList: SchoolComplianceStats[] = useMemo(() => {
    return schools.map((school) => {
      const schoolRecords = records.filter((r) => r.sekolahMitra === school);
      const schoolInvoices = invoices.filter((i) => i.sekolahMitra === school);
      const schoolEvents = events.filter((e) => e.sekolahMitra === school || e.sekolahMitra === "Semua");

      const totalRecords = schoolRecords.length;
      const submittedCount = schoolRecords.filter((r) => r.statusLaporan === "Sudah Kirim").length;
      const notSubmittedCount = schoolRecords.filter((r) => r.statusLaporan === "Belum Kirim").length;
      
      const completedAuditCount = schoolRecords.filter((r) => r.statusLaporan === "Sudah Kirim" && r.statusAudit === "Selesai").length;
      const revisionAuditCount = schoolRecords.filter((r) => r.statusLaporan === "Sudah Kirim" && r.statusAudit === "Revisi").length;
      const pendingAuditCount = schoolRecords.filter((r) => r.statusLaporan === "Sudah Kirim" && r.statusAudit === "Belum Diaudit").length;

      const compliancePercentage = totalRecords > 0 ? Math.round((submittedCount / totalRecords) * 100) : 0;
      const auditCompletionPercentage = submittedCount > 0 ? Math.round((completedAuditCount / submittedCount) * 100) : 0;

      const paidInvoiceCount = schoolInvoices.filter((i) => i.statusPay === "Lunas").length;
      const unpaidInvoiceCount = schoolInvoices.filter((i) => i.statusPay === "Belum Lunas").length;
      const totalUnpaidAmount = schoolInvoices
        .filter((i) => i.statusPay === "Belum Lunas")
        .reduce((sum, curr) => sum + curr.jumlah, 0);

      const upcomingEventCount = schoolEvents.length;

      let complianceRating: "Sangat Patuh" | "Patuh" | "Perlu Perbaikan" | "Kritis" = "Perlu Perbaikan";
      if (compliancePercentage >= 90) {
        complianceRating = "Sangat Patuh";
      } else if (compliancePercentage >= 75) {
        complianceRating = "Patuh";
      } else if (compliancePercentage >= 50) {
        complianceRating = "Perlu Perbaikan";
      } else {
        complianceRating = "Kritis";
      }

      return {
        schoolName: school,
        totalRecords,
        submittedCount,
        notSubmittedCount,
        completedAuditCount,
        revisionAuditCount,
        pendingAuditCount,
        compliancePercentage,
        auditCompletionPercentage,
        paidInvoiceCount,
        unpaidInvoiceCount,
        totalUnpaidAmount,
        upcomingEventCount,
        complianceRating,
      };
    });
  }, [schools, records, invoices, events]);

  // 3. Filter list
  const filteredSchools = useMemo(() => {
    return schoolStatsList.filter((stat) => {
      const matchSearch = stat.schoolName.toLowerCase().includes(searchTerm.toLowerCase());
      const matchCompliance = stat.compliancePercentage >= minCompliance;
      return matchSearch && matchCompliance;
    });
  }, [schoolStatsList, searchTerm, minCompliance]);

  const toggleExpand = (schoolName: string) => {
    if (expandedSchool === schoolName) {
      setExpandedSchool(null);
    } else {
      setExpandedSchool(schoolName);
    }
  };

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0
    }).format(val);
  };

  return (
    <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-xs space-y-6" id="compliance-tracker-container">
      {/* Title block */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-5">
        <div>
          <h2 className="text-lg font-bold text-slate-800 tracking-tight flex items-center gap-2">
            <Sliders className="w-5 h-5 text-blue-900" />
            Matriks & Detil Kepatuhan Sekolah Mitra
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Pengawasan visual terpadu atas kelengkapan dokumen, audit keuangan, dan pemenuhan iuran wajib instansi
          </p>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Cari sekolah mitra..."
              className="pl-9 pr-4 py-2 text-xs bg-slate-50 hover:bg-slate-100/50 border border-slate-200 rounded-xl outline-hidden focus:bg-white focus:ring-2 focus:ring-blue-500/10 transition-all font-medium text-slate-700 w-48"
            />
          </div>

          <select
            value={minCompliance}
            onChange={(e) => setMinCompliance(parseInt(e.target.value) || 0)}
            className="px-3 py-2 text-xs bg-slate-50 hover:bg-slate-100/50 border border-slate-200 rounded-xl outline-hidden font-semibold text-slate-700 cursor-pointer"
          >
            <option value={0}>Semua Tingkat Kepatuhan</option>
            <option value={90}>Sangat Patuh (≥90%)</option>
            <option value={75}>Patuh (≥75%)</option>
            <option value={50}>Perlu Perbaikan (≥50%)</option>
          </select>
        </div>
      </div>

      {/* Main Grid / Cards */}
      <div className="space-y-4">
        {filteredSchools.length > 0 ? (
          filteredSchools.map((item) => {
            const isExpanded = expandedSchool === item.schoolName;
            
            // Rating class configuration
            let ratingColor = "bg-rose-50 text-rose-700 border-rose-200/50";
            let rateIndicator = "bg-rose-500";
            if (item.complianceRating === "Sangat Patuh") {
              ratingColor = "bg-teal-50 text-teal-700 border-teal-200/50";
              rateIndicator = "bg-teal-500";
            } else if (item.complianceRating === "Patuh") {
              ratingColor = "bg-emerald-50 text-emerald-700 border-emerald-200/50";
              rateIndicator = "bg-emerald-500";
            } else if (item.complianceRating === "Perlu Perbaikan") {
              ratingColor = "bg-amber-50 text-amber-700 border-amber-200/50";
              rateIndicator = "bg-amber-500";
            }

            // Report records for this school
            const specificRecords = records.filter(r => r.sekolahMitra === item.schoolName);
            const specificInvoices = invoices.filter(i => i.sekolahMitra === item.schoolName);

            return (
              <div 
                key={item.schoolName}
                className={`border rounded-2xl transition-all duration-200 ${
                  isExpanded ? "border-blue-900 shadow-md bg-slate-50/20" : "border-slate-150 bg-white hover:border-slate-300"
                }`}
              >
                {/* Header Summary Row */}
                <div 
                  onClick={() => toggleExpand(item.schoolName)}
                  className="p-5 flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4 cursor-pointer select-none"
                >
                  <div className="flex items-center gap-3.5">
                    <div className="p-3 bg-blue-50 border border-blue-100 rounded-xl text-blue-900 shadow-inner flex-shrink-0">
                      <School className="w-5 h-5 text-blue-950" />
                    </div>
                    <div>
                      <h3 className="font-extrabold text-sm text-slate-800 tracking-tight">
                        {item.schoolName}
                      </h3>
                      <div className="flex items-center gap-2 mt-1">
                        <span className={`text-[9px] font-extrabold uppercase px-2 py-0.5 rounded-full border ${ratingColor}`}>
                          {item.complianceRating}
                        </span>
                        <span className="text-[10px] text-slate-400 font-medium">
                          {item.submittedCount} dari {item.totalRecords} Laporan Masuk
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Compliance Progress bar */}
                  <div className="flex-1 max-w-xs lg:mx-8">
                    <div className="flex items-center justify-between text-[11px] font-bold text-slate-500 mb-1.5">
                      <span>Rasio Pengiriman</span>
                      <span className="text-slate-800">{item.compliancePercentage}%</span>
                    </div>
                    <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                      <div 
                        className={`h-full rounded-full transition-all duration-500 ${rateIndicator}`}
                        style={{ width: `${item.compliancePercentage}%` }}
                      />
                    </div>
                  </div>

                  {/* Micro stats indicators */}
                  <div className="flex flex-wrap items-center gap-4 lg:gap-6 text-xs font-semibold text-slate-600">
                    <div className="bg-slate-50 border border-slate-100/80 p-2 px-3 rounded-xl flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-teal-500" />
                      <div>
                        <span className="text-[9px] text-slate-400 block font-bold leading-none uppercase">AUDIT SELESAI</span>
                        <span className="text-slate-700 font-extrabold font-mono text-[11px]">{item.completedAuditCount} Laporan</span>
                      </div>
                    </div>

                    <div className="bg-slate-50 border border-slate-100/80 p-2 px-3 rounded-xl flex items-center gap-2 font-sans">
                      <div className="w-2 h-2 rounded-full bg-amber-500" />
                      <div>
                        <span className="text-[9px] text-slate-400 block font-bold leading-none uppercase">PIUTANG</span>
                        <span className={`font-extrabold font-mono text-[11px] ${item.totalUnpaidAmount > 0 ? "text-rose-600" : "text-slate-600"}`}>
                          {item.totalUnpaidAmount > 0 ? formatCurrency(item.totalUnpaidAmount) : "Lunas"}
                        </span>
                      </div>
                    </div>
                    
                    <div>
                      {isExpanded ? (
                        <ChevronDown className="w-5 h-5 text-slate-400" />
                      ) : (
                        <ChevronRight className="w-5 h-5 text-slate-400" />
                      )}
                    </div>
                  </div>
                </div>

                {/* Expanded Details Pane */}
                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="border-t border-slate-150 overflow-hidden"
                    >
                      <div className="p-5 bg-white space-y-6">
                        
                        {/* Summary details dashboard box */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          
                          {/* Laporan detail */}
                          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-150 space-y-3.5">
                            <span className="text-[10px] uppercase font-extrabold text-indigo-700 tracking-wider flex items-center gap-1">
                              <FileSpreadsheet className="w-3.5 h-3.5" /> Track Dokumen Bulanan
                            </span>

                            <div className="grid grid-cols-2 gap-2 text-center">
                              <div className="bg-white p-2 rounded-xl border border-slate-100">
                                <span className="text-slate-400 text-[9px] font-bold block uppercase">Kirim</span>
                                <span className="text-sm font-extrabold text-teal-600">{item.submittedCount} Mo</span>
                              </div>
                              <div className="bg-white p-2 rounded-xl border border-slate-100">
                                <span className="text-slate-400 text-[9px] font-bold block uppercase">Belum Kirim</span>
                                <span className="text-sm font-extrabold text-rose-500">{item.notSubmittedCount} Mo</span>
                              </div>
                            </div>
                            
                            <div className="text-[11px] text-slate-500 pt-1 border-t border-slate-200/40">
                              <span className="font-bold block mb-1">Bulan Belum Dikirim:</span>
                              <div className="flex flex-wrap gap-1">
                                {specificRecords.filter(r => r.statusLaporan === "Belum Kirim").length > 0 ? (
                                  specificRecords
                                    .filter(r => r.statusLaporan === "Belum Kirim")
                                    .map(r => (
                                      <span key={r.id} className="bg-rose-50 text-rose-600 px-2 py-0.5 rounded-md text-[9px] font-extrabold border border-rose-100">
                                        {r.bulan} '{r.tahun.toString().slice(-2)}
                                      </span>
                                    ))
                                ) : (
                                  <span className="text-teal-600 font-bold text-[10px] flex items-center gap-1">
                                    <CheckCircle className="w-3 h-3" /> Semua Laporan Periode Terkirim!
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>

                          {/* Audit tracking detail */}
                          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-150 space-y-3">
                            <span className="text-[10px] uppercase font-extrabold text-amber-700 tracking-wider flex items-center gap-1">
                              <TrendingUp className="w-3.5 h-3.5" /> Progress Hasil Auditor
                            </span>

                            <div className="space-y-1.5 text-[11px] font-medium text-slate-600">
                              <div className="flex justify-between items-center bg-white p-1.5 px-2.5 rounded-xl border border-slate-100">
                                <span className="flex items-center gap-1.5 text-teal-600 font-bold">
                                  <span className="w-2 h-2 rounded-full bg-teal-500" /> Selesai Audit
                                </span>
                                <span className="font-extrabold">{item.completedAuditCount} Laporan</span>
                              </div>
                              <div className="flex justify-between items-center bg-white p-1.5 px-2.5 rounded-xl border border-slate-100">
                                <span className="flex items-center gap-1.5 text-amber-600 font-bold">
                                  <span className="w-2 h-2 rounded-full bg-amber-500" /> Perlu Revisi
                                </span>
                                <span className="font-extrabold">{item.revisionAuditCount} Laporan</span>
                              </div>
                              <div className="flex justify-between items-center bg-white p-1.5 px-2.5 rounded-xl border border-slate-100">
                                <span className="flex items-center gap-1.5 text-slate-500 font-bold">
                                  <span className="w-2 h-2 rounded-full bg-slate-400" /> Belum Audit
                                </span>
                                <span className="font-extrabold">{item.pendingAuditCount} Laporan</span>
                              </div>
                            </div>

                            <div className="flex items-center justify-between text-[10px] text-slate-400 font-extrabold pt-1">
                              <span>EFISIENSI VERIFIKASI</span>
                              <span className="text-slate-600">{item.auditCompletionPercentage}% Selesai</span>
                            </div>
                          </div>

                          {/* Keuangan invoice tracking detail */}
                          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-150 space-y-3">
                            <span className="text-[10px] uppercase font-extrabold text-blue-900 tracking-wider flex items-center gap-1">
                              <Wallet className="w-3.5 h-3.5" /> Status Administrasi Iuran
                            </span>

                            <div className="space-y-1.5 text-[11px] font-medium">
                              <div className="flex justify-between items-center bg-white p-1.5 px-2.5 rounded-xl border border-slate-100">
                                <span className="text-slate-500 font-bold">Total Terbit</span>
                                <span className="text-slate-800 font-extrabold">{specificInvoices.length} Invoice</span>
                              </div>
                              <div className="flex justify-between items-center bg-white p-1.5 px-2.5 rounded-xl border border-slate-100">
                                <span className="text-teal-600 font-bold">Terbayar Lunas</span>
                                <span className="text-teal-700 font-extrabold">{item.paidInvoiceCount} Tagihan</span>
                              </div>
                              <div className="flex justify-between items-center bg-white p-1.5 px-2.5 rounded-xl border border-slate-100">
                                <span className="text-rose-500 font-bold">Hutang / Pending</span>
                                <span className="text-rose-700 font-extrabold">{item.unpaidInvoiceCount} Tagihan</span>
                              </div>
                            </div>

                            {item.totalUnpaidAmount > 0 && (
                              <div className="p-1 px-2.5 rounded-lg bg-rose-50 border border-rose-100 text-[10px] text-rose-800 font-bold flex items-center gap-1">
                                <ShieldAlert className="w-3.5 h-3.5 text-rose-600 flex-shrink-0" />
                                <span>Tagihan Tertunggak: {formatCurrency(item.totalUnpaidAmount)}</span>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Recent History log of this specific school */}
                        <div className="border border-slate-150 rounded-2xl p-4 bg-slate-50/40 space-y-3">
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] uppercase font-extrabold text-slate-400 tracking-wider block">
                              Arsip Log Laporan Bulanan Terakhir
                            </span>
                            <span className="text-[11px] text-blue-900 font-extrabold">Dua Semester Terpilih</span>
                          </div>

                          <div className="overflow-x-auto">
                            <table className="w-full text-[11px] text-left font-sans">
                              <thead>
                                <tr className="border-b border-slate-200 text-slate-400 font-bold uppercase text-[9px] tracking-wider">
                                  <th className="pb-2">Bulan/Tahun</th>
                                  <th className="pb-2">Tanggal Pengiriman</th>
                                  <th className="pb-2 text-center">Status Kirim</th>
                                  <th className="pb-2 text-center">Status Audit</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-slate-100 font-medium text-slate-600">
                                {specificRecords.slice(0, 5).map((rec) => (
                                  <tr key={rec.id} className="hover:bg-white/50 transition-colors">
                                    <td className="py-2.5 font-bold text-slate-800">{rec.bulan} {rec.tahun}</td>
                                    <td className="py-2.5">{rec.tanggalKirim || <span className="text-slate-300">-</span>}</td>
                                    <td className="py-2.5 text-center">
                                      <span className={`px-2 py-0.5 rounded-md text-[9px] font-extrabold border ${
                                        rec.statusLaporan === "Sudah Kirim"
                                          ? "bg-teal-50 text-teal-700 border-teal-200/40"
                                          : "bg-rose-50 text-rose-700 border-rose-150/45"
                                      }`}>
                                        {rec.statusLaporan}
                                      </span>
                                    </td>
                                    <td className="py-2.5 text-center">
                                      <span className={`px-2 py-0.5 rounded-md text-[9px] font-extrabold border ${
                                        rec.statusAudit === "Selesai"
                                          ? "bg-teal-50 text-teal-700 border-teal-200"
                                          : rec.statusAudit === "Revisi"
                                          ? "bg-amber-50 text-amber-700 border-amber-200"
                                          : rec.statusAudit === "Belum Diaudit"
                                          ? "bg-slate-50 text-slate-500 border-slate-200"
                                          : "bg-slate-100 text-slate-400 border-slate-200/40"
                                      }`}>
                                        {rec.statusAudit === "Selesai" ? "Selesai Audit" : rec.statusAudit === "Revisi" ? "Revisi" : rec.statusAudit === "Belum Diaudit" ? "Menunggu" : "-"}
                                      </span>
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        </div>

                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })
        ) : (
          <div className="py-12 border border-dashed border-slate-200 rounded-3xl text-center text-slate-400 text-xs">
            Tidak ada data kepatuhan yang memenuhi kriteria penyaringan
          </div>
        )}
      </div>
    </div>
  );
}
