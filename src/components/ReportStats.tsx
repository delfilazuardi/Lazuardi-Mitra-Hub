import React, { useState, useMemo } from "react";
import { ReportRecord, DashboardStats, UserSession } from "../types";
import { 
  Users, 
  Send, 
  AlertCircle, 
  CheckCircle, 
  HelpCircle, 
  TrendingUp, 
  RotateCcw, 
  X, 
  School,
  FileText,
  Clock,
  ArrowRight
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface StatsProps {
  stats: DashboardStats;
  records?: ReportRecord[];
  session?: UserSession;
  lang?: "id" | "en";
}

const PARTNER_SCHOOL_NAMES = [
  "Al-Falah Depok", 
  "Al-Falah Klaten", 
  "Athaillah", 
  "Cordova", 
  "Haura", 
  "Kamila", 
  "Ideal", 
  "Tursina", 
  "Ibnu Sina"
];

const AFFILIATE_SCHOOL_NAMES = [
  "SMA Lazuardi"
];

export default function ReportStats({ 
  stats, 
  records = [], 
  session, 
  lang = "id" 
}: StatsProps) {
  
  const [activeModal, setActiveModal] = useState<string | null>(null);

  const isMitraRole = session?.role === "sekolah_mitra";
  const userSchool = session?.sekolahName || "";

  // Filter school names according to multi-tenant or role isolation
  const visiblePartners = useMemo(() => {
    if (isMitraRole) {
      return PARTNER_SCHOOL_NAMES.includes(userSchool) ? [userSchool] : [];
    }
    return PARTNER_SCHOOL_NAMES;
  }, [isMitraRole, userSchool]);

  const visibleAffiliates = useMemo(() => {
    if (isMitraRole) {
      return AFFILIATE_SCHOOL_NAMES.includes(userSchool) ? [userSchool] : [];
    }
    return AFFILIATE_SCHOOL_NAMES;
  }, [isMitraRole, userSchool]);

  // Aggregate scorecard details per school based on filtered active reports
  const schoolScorecards = useMemo(() => {
    const scorecards: Record<string, {
      total: number;
      sent: number;
      unsent: number;
      selesai: number;
      revisi: number;
      belumAudit: number;
      sentRecords: ReportRecord[];
      unsentRecords: ReportRecord[];
      selesaiRecords: ReportRecord[];
      revisiRecords: ReportRecord[];
      belumAuditRecords: ReportRecord[];
    }> = {};

    const allSchools = [...PARTNER_SCHOOL_NAMES, ...AFFILIATE_SCHOOL_NAMES];
    allSchools.forEach(sch => {
      scorecards[sch] = {
        total: 0,
        sent: 0,
        unsent: 0,
        selesai: 0,
        revisi: 0,
        belumAudit: 0,
        sentRecords: [],
        unsentRecords: [],
        selesaiRecords: [],
        revisiRecords: [],
        belumAuditRecords: []
      };
    });

    records.forEach(rec => {
      const sch = rec.sekolahMitra;
      if (!scorecards[sch]) {
        scorecards[sch] = {
          total: 0,
          sent: 0,
          unsent: 0,
          selesai: 0,
          revisi: 0,
          belumAudit: 0,
          sentRecords: [],
          unsentRecords: [],
          selesaiRecords: [],
          revisiRecords: [],
          belumAuditRecords: []
        };
      }

      scorecards[sch].total++;
      if (rec.statusLaporan === "Sudah Kirim") {
        scorecards[sch].sent++;
        scorecards[sch].sentRecords.push(rec);

        if (rec.statusAudit === "Selesai") {
          scorecards[sch].selesai++;
          scorecards[sch].selesaiRecords.push(rec);
        } else if (rec.statusAudit === "Revisi") {
          scorecards[sch].revisi++;
          scorecards[sch].revisiRecords.push(rec);
        } else if (rec.statusAudit === "Belum Diaudit" || rec.statusAudit === "-") {
          scorecards[sch].belumAudit++;
          scorecards[sch].belumAuditRecords.push(rec);
        }
      } else {
        scorecards[sch].unsent++;
        scorecards[sch].unsentRecords.push(rec);
      }
    });

    return scorecards;
  }, [records]);

  // Helper variables to determine stats lists under each click category
  const modalData = useMemo(() => {
    if (!activeModal) return null;

    let titleLabel = "";
    let descLabel = "";
    let items: Array<{
      schoolName: string;
      isPartner: boolean;
      scorecard: any;
      filteredReports: ReportRecord[];
    }> = [];

    const isPartner = (sch: string) => PARTNER_SCHOOL_NAMES.includes(sch);

    const getList = (schoolsFilter: string[]) => {
      return schoolsFilter.map(sch => ({
        schoolName: sch,
        isPartner: isPartner(sch),
        scorecard: schoolScorecards[sch] || { total: 0, sent: 0, unsent: 0, selesai: 0, revisi: 0, belumAudit: 0, sentRecords: [], unsentRecords: [], selesaiRecords: [], revisiRecords: [], belumAuditRecords: [] },
        filteredReports: records.filter(r => r.sekolahMitra === sch)
      }));
    };

    if (activeModal === "total_mitra") {
      titleLabel = lang === "id" ? "Total Mitra Sekolah (9 Aktif)" : "Total Partner Schools (9 Active)";
      descLabel = lang === "id" 
        ? "Berikut adalah daftar seluruh sekolah mitra aktif beserta ringkasan status berkas laporan bulanan mereka." 
        : "Listed below are all active partner schools alongside their monthly submission records overview.";
      items = getList(visiblePartners);
    } 
    else if (activeModal === "total_afiliasi") {
      titleLabel = lang === "id" ? "Total Sekolah Afiliasi (1 Aktif)" : "Total Affiliate Schools (1 Active)";
      descLabel = lang === "id"
        ? "Berikut adalah daftar sekolah afiliasi yang terintegrasi di cakupan pengawasan operasional pusat."
        : "Operational overview of the central coordinated affiliate school campus.";
      items = getList(visibleAffiliates);
    } 
    else if (activeModal === "tingkat_pengiriman") {
      titleLabel = lang === "id" ? "Tingkat Pengiriman Berkas" : "Document Submission Rates";
      descLabel = lang === "id"
        ? "Analisis perbandingan ketepatan pengantaran laporan tiap sekolah untuk filter waktu yang aktif."
        : "Comparative compliance performance and delivery tracking for active timeframe bounds.";
      // Show all schools that have active visibility (both partner and affiliate)
      items = getList([...visiblePartners, ...visibleAffiliates]);
    } 
    else if (activeModal === "sudah_audit") {
      titleLabel = lang === "id" ? "Laporan Sudah Audit (Selesai)" : "Audited Reports Status (Approved)";
      descLabel = lang === "id"
        ? "Daftar sekolah yang berkas laporannya telah selesai diperiksa dan disetujui tanpa catatan revisi."
        : "List of schools whose monthly operational files have been validated and approved successfully.";
      items = getList([...visiblePartners, ...visibleAffiliates]).filter(item => item.scorecard.selesai > 0);
    } 
    else if (activeModal === "perlu_revisi") {
      titleLabel = lang === "id" ? "Laporan Perlu Revisi" : "Reports Requiring Revision";
      descLabel = lang === "id"
        ? "Daftar sekolah yang memiliki laporan dengan catatan perbaikan dari auditor pusat (membutuhkan unggah ulang)."
        : "Schools that have pending adjustments requested by the auditor (requires re-submission).";
      items = getList([...visiblePartners, ...visibleAffiliates]).filter(item => item.scorecard.revisi > 0);
    } 
    else if (activeModal === "belum_diaudit") {
      titleLabel = lang === "id" ? "Laporan Belum Diaudit" : "Reports Pending Audit Queue";
      descLabel = lang === "id"
        ? "Daftar sekolah dengan berkas terkirim yang sedang dalam antrean pemeriksaan oleh tim auditor pusat."
        : "Schools with successfully uploaded archives awaiting review in the central queue.";
      items = getList([...visiblePartners, ...visibleAffiliates]).filter(item => item.scorecard.belumAudit > 0);
    } 
    else if (activeModal === "mitra_telat_kirim") {
      titleLabel = lang === "id" ? "Mitra Belum Kirim / Tertunggak" : "Unsent / Overdue School Submissions";
      descLabel = lang === "id"
        ? "Daftar sekolah yang memiliki laporan belum dikirimkan pada saringan sirkulasi bulan aktif."
        : "List of institutions that have yet to transmit their operational reports in this timeframe.";
      items = getList([...visiblePartners, ...visibleAffiliates]).filter(item => item.scorecard.unsent > 0);
    }

    return { titleLabel, descLabel, items };
  }, [activeModal, visiblePartners, visibleAffiliates, schoolScorecards, records, lang]);

  const cards = [
    {
      id: "total_mitra",
      title: lang === "id" ? "Total Mitra Sekolah" : "Total Partner Schools",
      value: isMitraRole ? (PARTNER_SCHOOL_NAMES.includes(userSchool) ? 1 : 0) : 9,
      desc: lang === "id" ? "Sekolah mitra aktif dimonitor" : "Active partner schools monitored",
      icon: Users,
      color: "text-indigo-600 bg-indigo-50/70 border-indigo-200/50 hover:bg-indigo-100/50",
      delay: 0,
    },
    {
      id: "total_afiliasi",
      title: lang === "id" ? "Sekolah Afiliasi" : "Affiliate Schools",
      value: isMitraRole ? (AFFILIATE_SCHOOL_NAMES.includes(userSchool) ? 1 : 0) : 1,
      desc: lang === "id" ? "Sekolah pusat / afiliasi khusus" : "Central campus & direct affiliate",
      icon: School,
      color: "text-violet-600 bg-violet-50/70 border-violet-200/50 hover:bg-violet-100/50",
      delay: 0.05,
    },
    {
      id: "tingkat_pengiriman",
      title: lang === "id" ? "Tingkat Pengiriman" : "Submission Rate",
      value: `${stats.persentaseKirim}%`,
      desc: lang === "id" ? "Kepatuhan pengiriman sirkulasi" : "Overall periodic delivery health",
      icon: TrendingUp,
      color: "text-emerald-600 bg-emerald-50/70 border-emerald-200/50 hover:bg-emerald-100/50",
      delay: 0.1,
      extra: `Sukses: ${stats.totalLaporanKirim} | Tunggakan: ${stats.totalLaporanBelumKirim}`,
    },
    {
      id: "sudah_audit",
      title: lang === "id" ? "Sudah Audit (Selesai)" : "Audited (Selesai)",
      value: stats.totalSelesai,
      desc: lang === "id" ? "Laporan dinyatakan sesuai" : "Reports declared perfect",
      icon: CheckCircle,
      color: "text-teal-600 bg-teal-50/70 border-teal-200/50 hover:bg-teal-100/50",
      delay: 0.15,
    },
    {
      id: "perlu_revisi",
      title: lang === "id" ? "Perlu Revisi" : "Needs Revision",
      value: stats.totalRevisi,
      desc: lang === "id" ? "Laporan butuh perbaikan" : "Reports requiring fixes",
      icon: RotateCcw,
      color: "text-amber-600 bg-amber-50/70 border-amber-200/50 hover:bg-amber-100/50",
      delay: 0.2,
    },
    {
      id: "belum_diaudit",
      title: lang === "id" ? "Belum Diaudit" : "Awaiting Audit",
      value: stats.totalBelumAudit,
      desc: lang === "id" ? "Laporan dalam antrean verifikasi" : "File examination cue",
      icon: HelpCircle,
      color: "text-slate-600 bg-slate-50/70 border-slate-200/50 hover:bg-slate-100/50",
      delay: 0.25,
    },
    {
      id: "mitra_telat_kirim",
      title: lang === "id" ? "Mitra Telat Kirim" : "Unsent / Overdue",
      value: stats.totalLaporanBelumKirim,
      desc: lang === "id" ? "Tunggakan kiriman laporan" : "Outstanding items overdue",
      icon: AlertCircle,
      color: "text-rose-600 bg-rose-50/70 border-rose-200/50 hover:bg-rose-100/50",
      delay: 0.3,
    },
  ];

  return (
    <div id="stats-section-root" className="space-y-4">
      {/* Cards Grid */}
      <div id="stats-grid" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-7 gap-4">
        {cards.map((card, i) => {
          const IconComponent = card.icon;
          return (
            <motion.div
              key={card.id}
              id={`stat-card-item-${card.id}`}
              onClick={() => setActiveModal(card.id)}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, delay: card.delay }}
              whileHover={{ y: -4 }}
              className={`p-4 bg-white border border-slate-200/60 rounded-2xl shadow-3xs cursor-pointer flex flex-col justify-between transition-all duration-250 select-none group border-b-2 hover:border-slate-350 active:scale-[0.98]`}
            >
              <div className="flex items-start justify-between">
                <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest leading-none block">
                  {card.title}
                </span>
                <div className={`p-1.5 rounded-lg border transition-all duration-200 ${card.color}`}>
                  <IconComponent className="w-4 h-4" />
                </div>
              </div>
              
              <div className="mt-3.5">
                <span className="text-xl font-extrabold text-slate-800 tracking-tight block group-hover:text-blue-900 transition-colors">
                  {card.value}
                </span>
                <span className="text-[10px] text-slate-400 mt-1 block leading-snug">
                  {card.desc}
                </span>
                {card.extra && (
                  <div className="mt-2 text-[8px] bg-slate-50 text-slate-500 py-0.5 px-1.5 rounded-lg font-mono border border-slate-100 block truncate">
                    {card.extra}
                  </div>
                )}
                
                <span className="text-[8px] text-blue-900 font-extrabold mt-2.5 flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-all uppercase tracking-widest">
                  {lang === "id" ? "Lihat detail" : "View breakdown"}
                  <ArrowRight className="w-2.5 h-2.5" />
                </span>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Interactive Detail Modal Block */}
      <AnimatePresence>
        {activeModal && modalData && (
          <div 
            id="stats-detail-overlay"
            className="fixed inset-0 bg-slate-900/45 backdrop-blur-xs z-50 flex items-center justify-center p-4"
            onClick={() => setActiveModal(null)}
          >
            <motion.div
              id="stats-detail-dialog"
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              transition={{ duration: 0.25 }}
              className="bg-white rounded-3xl w-full max-w-2xl max-h-[85vh] overflow-hidden shadow-2xl flex flex-col border border-slate-100"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal Header */}
              <div className="border-b border-slate-100 p-5 flex items-center justify-between bg-slate-50/50">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-blue-900 text-white shrink-0">
                    <School className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-extrabold text-slate-900">
                      {modalData.titleLabel}
                    </h3>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      {modalData.descLabel}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setActiveModal(null)}
                  className="p-1.5 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Modal Scroller Body */}
              <div className="overflow-y-auto p-5 space-y-4 max-h-[50vh]">
                {modalData.items.length === 0 ? (
                  <div className="text-center py-10">
                    <HelpCircle className="w-10 h-10 text-slate-300 mx-auto" />
                    <p className="text-xs text-slate-400 mt-2 font-medium">
                      {lang === "id" 
                        ? "Tidak ada data sekolah atau laporan untuk status ini pada filter yang aktif."
                        : "No matching institution or report data found in this category context."}
                    </p>
                  </div>
                ) : (
                  modalData.items.map((item, index) => (
                    <div 
                      key={item.schoolName}
                      className="p-4 rounded-2xl border border-slate-150/70 bg-slate-50/40 hover:bg-slate-50 hover:border-slate-300/60 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4"
                    >
                      {/* School Brand Label */}
                      <div className="flex items-start gap-3">
                        <div className={`p-2 rounded-xl shrink-0 font-extrabold text-xs flex items-center justify-center ${
                          item.isPartner 
                            ? "bg-indigo-50 border border-indigo-100 text-indigo-700" 
                            : "bg-violet-50 border border-violet-150 text-violet-700"
                        }`}>
                          {item.isPartner ? "MITRA" : "AFILIASI"}
                        </div>
                        <div>
                          <h4 className="text-xs font-extrabold text-slate-800">
                            {item.schoolName}
                          </h4>
                          <span className="text-[10px] text-slate-400 inline-block mt-0.5 font-medium">
                            {item.isPartner 
                              ? (lang === "id" ? "Mata Rantai Pendidikan Lazuardi" : "Lazuardi Educational Partner Network")
                              : (lang === "id" ? "Afiliasi Unit Pusat Eksklusif" : "Direct Exclusive Affiliate Unit")
                            }
                          </span>
                        </div>
                      </div>

                      {/* Status Scorecard pill lists */}
                      <div className="flex flex-col gap-1.5 min-w-[200px] shrink-0">
                        {activeModal === "total_mitra" || activeModal === "total_afiliasi" || activeModal === "tingkat_pengiriman" ? (
                          <div className="space-y-1.5">
                            {/* Summary bar for general overview */}
                            <div className="flex items-center justify-between text-[10px] font-bold text-slate-500 font-mono">
                              <span>{lang === "id" ? "Terkirim/Total:" : "Uploaded/Total:"}</span>
                              <span className="text-slate-800">
                                {item.scorecard.sent} / {item.scorecard.total}
                              </span>
                            </div>
                            <div className="w-full bg-slate-200/80 rounded-full h-1.5 overflow-hidden">
                              <div 
                                className="bg-emerald-500 h-1.5 rounded-full"
                                style={{ width: `${item.scorecard.total > 0 ? (item.scorecard.sent / item.scorecard.total) * 100 : 0}%` }}
                              />
                            </div>
                            {/* Detailed stats overview tags */}
                            <div className="flex gap-1.5 flex-wrap pt-0.5">
                              {item.scorecard.selesai > 0 && (
                                <span className="text-[9px] bg-emerald-100/60 border border-emerald-200 text-emerald-800 px-1.5 py-0.5 rounded-md font-extrabold">
                                  {item.scorecard.selesai} Selesai
                                </span>
                              )}
                              {item.scorecard.revisi > 0 && (
                                <span className="text-[9px] bg-amber-100/60 border border-amber-200 text-amber-800 px-1.5 py-0.5 rounded-md font-extrabold animate-pulse">
                                  {item.scorecard.revisi} Revisi
                                </span>
                              )}
                              {item.scorecard.belumAudit > 0 && (
                                <span className="text-[9px] bg-slate-200/80 border border-slate-300 text-slate-700 px-1.5 py-0.5 rounded-md font-extrabold">
                                  {item.scorecard.belumAudit} Queue
                                </span>
                              )}
                              {item.scorecard.unsent > 0 && (
                                <span className="text-[9px] bg-rose-100/60 border border-rose-200 text-rose-800 px-1.5 py-0.5 rounded-md font-extrabold">
                                  {item.scorecard.unsent} Tunggakan
                                </span>
                              )}
                            </div>
                          </div>
                        ) : activeModal === "sudah_audit" ? (
                          <div className="space-y-1">
                            {item.scorecard.selesaiRecords.map((rec: ReportRecord) => (
                              <div key={rec.id} className="text-[10px] font-mono text-emerald-800 bg-emerald-50 border border-emerald-100 rounded-lg px-2 py-0.5 flex items-center gap-1">
                                <CheckCircle className="w-3 h-3 shrink-0" />
                                <span>{rec.bulan} {rec.tahun}</span>
                              </div>
                            ))}
                          </div>
                        ) : activeModal === "perlu_revisi" ? (
                          <div className="space-y-1">
                            {item.scorecard.revisiRecords.map((rec: ReportRecord) => (
                              <div key={rec.id} className="text-[10px] font-mono text-amber-800 bg-amber-50 border border-amber-100 rounded-lg px-2 py-0.5 flex items-center gap-1 animate-pulse">
                                <RotateCcw className="w-3 h-3 shrink-0" />
                                <span>{rec.bulan} {rec.tahun}</span>
                              </div>
                            ))}
                          </div>
                        ) : activeModal === "belum_diaudit" ? (
                          <div className="space-y-1">
                            {item.scorecard.belumAuditRecords.map((rec: ReportRecord) => (
                              <div key={rec.id} className="text-[10px] font-mono text-slate-700 bg-slate-100 border border-slate-200/55 rounded-lg px-2 py-0.5 flex items-center gap-1">
                                <Clock className="w-3 h-3 shrink-0 text-slate-400" />
                                <span>{rec.bulan} {rec.tahun}</span>
                              </div>
                            ))}
                          </div>
                        ) : activeModal === "mitra_telat_kirim" ? (
                          <div className="space-y-1">
                            {item.scorecard.unsentRecords.map((rec: ReportRecord) => (
                              <div key={rec.id} className="text-[10px] font-mono text-rose-800 bg-rose-50 border border-rose-100 rounded-lg px-2 py-0.5 flex items-center gap-1">
                                <AlertCircle className="w-3 h-3 shrink-0" />
                                <span>{rec.bulan} {rec.tahun} (Belum Kirim)</span>
                              </div>
                            ))}
                          </div>
                        ) : null}
                      </div>

                    </div>
                  ))
                )}
              </div>

              {/* Modal Footer */}
              <div className="border-t border-slate-100 p-4 bg-slate-50/50 flex items-center justify-between text-[10px] text-slate-400 uppercase tracking-widest font-extrabold">
                <span>Lazuardi Mitra Office</span>
                <button
                  onClick={() => setActiveModal(null)}
                  className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-extrabold rounded-xl transition-all shadow-sm border border-slate-900 uppercase tracking-wider text-[10px]"
                >
                  {lang === "id" ? "Tutup" : "Close"}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
