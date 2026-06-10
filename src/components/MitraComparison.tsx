import React, { useState, useMemo } from "react";
import { ReportRecord, Invoice, EventTracker, UserSession } from "../types";
import { 
  TrendingUp, 
  Award, 
  BarChart3, 
  BookOpen, 
  CreditCard, 
  Calendar,
  Search, 
  Star, 
  ArrowUpRight, 
  Info,
  Medal,
  CheckCircle2,
  AlertTriangle,
  School
} from "lucide-react";

interface ComparisonProps {
  records: ReportRecord[];
  invoices: Invoice[];
  events: EventTracker[];
  session: UserSession;
}

interface SchoolMetrics {
  name: string;
  reportCount: number;
  reportSubmitted: number;
  reportRate: number;
  reportApprovedRate: number; // Percentage of audited records that are finished/Selesai
  invoiceTotalCount: number;
  invoicePaidCount: number;
  paymentRate: number;
  unpaidCount: number;
  eventActivityCount: number;
  overallScore: number; // Weighted performance score (out of 100)
}

export default function MitraComparison({ records, invoices, events, session }: ComparisonProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState<"score" | "reportRate" | "paymentRate" | "event">("score");
  const [activeMetricTab, setActiveMetricTab] = useState<"all" | "reports" | "payments" | "events">("all");

  const currentSchool = session.sekolahName;

  // Generate list of all unique schools in the system
  const allSchools = useMemo(() => {
    // Collect from records, invoices, or sample fallback list
    const names = new Set<string>();
    records.forEach(r => { if (r.sekolahMitra) names.add(r.sekolahMitra); });
    invoices.forEach(i => { if (i.sekolahMitra) names.add(i.sekolahMitra); });
    events.forEach(e => { if (e.sekolahMitra && e.sekolahMitra !== "Semua") names.add(e.sekolahMitra); });
    
    // Safety fallback
    if (names.size === 0) {
      return ["SMA Lazuardi", "Al-Falah Depok", "Cordova", "Haura", "Ibnu Sina", "Ideal", "Kamila", "Tursina", "Al-Falah Klaten", "Athaillah"];
    }
    return Array.from(names);
  }, [records, invoices, events]);

  // Calculate metrics for each school
  const schoolMetricsList = useMemo(() => {
    return allSchools.map(schName => {
      // 1. Report compliance
      const schRecords = records.filter(r => r.sekolahMitra === schName);
      const totalReports = schRecords.length;
      const submittedReports = schRecords.filter(r => r.statusLaporan === "Sudah Kirim").length;
      const reportRate = totalReports > 0 ? Math.round((submittedReports / totalReports) * 100) : 0;
      
      const auditedCount = schRecords.filter(r => r.statusAudit === "Selesai").length;
      const reportApprovedRate = submittedReports > 0 ? Math.round((auditedCount / submittedReports) * 100) : 0;

      // 2. Invoice compliance
      const schInvoices = invoices.filter(inv => inv.sekolahMitra === schName);
      const invoiceCount = schInvoices.length;
      const paidInvoices = schInvoices.filter(inv => inv.statusPay === "Lunas").length;
      const paymentRate = invoiceCount > 0 ? Math.round((paidInvoices / invoiceCount) * 100) : 100; // default 100% compliant if no invoices are pending
      const unpaidInvoices = schInvoices.filter(inv => inv.statusPay === "Belum Lunas").length;

      // 3. Event active involvement
      const schEvents = events.filter(evt => evt.sekolahMitra === schName || evt.sekolahMitra === "Semua");
      const eventCount = schEvents.length;

      // Calculate composite scoring for ranking (Weighed: 45% report submission, 40% invoice payments, 15% bimtek/audit engagement index)
      const reportFactor = reportRate;
      const paymentFactor = paymentRate;
      const eventFactor = Math.min(100, eventCount * 20); // Cap event count at 5 events for 100 score influence

      const overallScore = Math.round((reportFactor * 0.45) + (paymentFactor * 0.40) + (eventFactor * 0.15));

      return {
        name: schName,
        reportCount: totalReports,
        reportSubmitted: submittedReports,
        reportRate,
        reportApprovedRate,
        invoiceTotalCount: invoiceCount,
        invoicePaidCount: paidInvoices,
        paymentRate,
        unpaidCount: unpaidInvoices,
        eventActivityCount: eventCount,
        overallScore
      };
    });
  }, [allSchools, records, invoices, events]);

  // Sort and filter school metrics
  const filteredAndSortedSchools = useMemo(() => {
    // 1. Filter
    let items = schoolMetricsList.filter(s => 
      s.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // 2. Sort
    items.sort((a, b) => {
      if (sortBy === "reportRate") {
        return b.reportRate - a.reportRate;
      }
      if (sortBy === "paymentRate") {
        return b.paymentRate - a.paymentRate;
      }
      if (sortBy === "event") {
        return b.eventActivityCount - a.eventActivityCount;
      }
      // Overall compliance score (default)
      return b.overallScore - a.overallScore;
    });

    return items;
  }, [schoolMetricsList, searchTerm, sortBy]);

  // Find ranks and stats
  const topSchoolByScore = useMemo(() => {
    if (schoolMetricsList.length === 0) return null;
    return [...schoolMetricsList].sort((a, b) => b.overallScore - a.overallScore)[0];
  }, [schoolMetricsList]);

  const bestReportComplier = useMemo(() => {
    if (schoolMetricsList.length === 0) return null;
    return [...schoolMetricsList].sort((a, b) => b.reportRate - a.reportRate)[0];
  }, [schoolMetricsList]);

  const mySchoolStats = useMemo(() => {
    if (!currentSchool) return null;
    return schoolMetricsList.find(s => s.name === currentSchool) || null;
  }, [schoolMetricsList, currentSchool]);

  // Find My School Rank
  const mySchoolRank = useMemo(() => {
    if (!currentSchool) return -1;
    const sorted = [...schoolMetricsList].sort((a, b) => b.overallScore - a.overallScore);
    return sorted.findIndex(s => s.name === currentSchool) + 1;
  }, [schoolMetricsList, currentSchool]);

  return (
    <div id="mitra-comparison-dashboard" className="space-y-6">
      
      {/* 1. Golden Notification Banner alerting comparative insights */}
      <div className="bg-gradient-to-r from-blue-900 to-blue-950 text-white rounded-3xl p-6 shadow-xl relative overflow-hidden border border-yellow-400/20">
        <div className="absolute top-[-20%] right-[-10%] w-64 h-64 rounded-full bg-yellow-400/10 blur-3xl pointer-events-none" />
        <div className="absolute bottom-[-20%] left-[-10%] w-64 h-64 rounded-full bg-blue-600/20 blur-3xl pointer-events-none" />
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-yellow-400 text-blue-950 font-extrabold text-[10px] rounded-full uppercase tracking-widest border border-white/50">
              <Award className="w-3.5 h-3.5 text-blue-950" />
              Komparasi Kemitraan Nasional
            </div>
            <h2 className="text-xl font-black tracking-tight">Evaluasi Tolok Ukur Kedisiplinan Mitra</h2>
            <p className="text-xs text-slate-300 max-w-xl leading-relaxed">
              Bandingkan kinerja administrasi sekolah Anda dengan seluruh mitra Lazuardi Group secara transparan. Indeks ini mendorong standar keaktifan audit, ketepatan SPJ BOS, dan iuran wajib berkala.
            </p>
          </div>

          {/* Quick summary for current school */}
          {mySchoolStats && (
            <div className="p-4 bg-white/10 backdrop-blur-md rounded-2xl border border-white/10 flex flex-col justify-between space-y-3 min-w-[200px]">
              <div>
                <span className="text-[10px] text-yellow-300 font-extrabold uppercase tracking-wider block">Sekolah Anda</span>
                <span className="text-sm font-bold block text-white truncate max-w-[190px]">{currentSchool}</span>
              </div>
              <div className="flex items-end justify-between">
                <div>
                  <span className="text-[10px] text-slate-350 block">Ranking Anda</span>
                  <span className="text-2xl font-black text-yellow-300 font-mono">#{mySchoolRank} <span className="text-xs text-white font-medium">dari {allSchools.length}</span></span>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-slate-350 block">Skor Integral</span>
                  <span className="text-xl font-bold font-mono text-white">{mySchoolStats.overallScore}</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 2. Top achievements highlights cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        
        {/* Card A: Leader of general index */}
        <div className="bg-white border border-slate-100 p-5 rounded-2xl shadow-xs flex items-center gap-4">
          <div className="p-3 bg-yellow-400 text-blue-950 rounded-2xl flex-shrink-0 animate-pulse">
            <Medal className="w-6 h-6 font-bold" />
          </div>
          <div className="min-w-0">
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Performa Mitra Terbaik</span>
            <span className="text-sm font-black text-slate-700 block truncate mt-0.5">{topSchoolByScore?.name}</span>
            <span className="text-[10px] text-slate-400 block mt-1">Skor Kepatuhan Gabungan: <strong className="text-blue-900 font-bold">{topSchoolByScore?.overallScore} pt</strong></span>
          </div>
        </div>

        {/* Card B: Highest report submission rate */}
        <div className="bg-white border border-slate-100 p-5 rounded-2xl shadow-xs flex items-center gap-4">
          <div className="p-3 bg-blue-50 text-blue-900 border border-blue-100 rounded-2xl flex-shrink-0">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div className="min-w-0">
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Kedisiplinan Laporan Terbaik</span>
            <span className="text-sm font-black text-slate-700 block truncate mt-0.5">{bestReportComplier?.name}</span>
            <span className="text-[10px] text-slate-400 block mt-1">Rasio Input Sukses: <strong className="text-teal-600 font-bold">{bestReportComplier?.reportRate}%</strong></span>
          </div>
        </div>

        {/* Card C: Average payment compliance */}
        <div className="bg-white border border-slate-100 p-5 rounded-2xl shadow-xs flex items-center gap-4">
          <div className="p-3 bg-rose-50 text-rose-700 border border-rose-100 rounded-2xl flex-shrink-0">
            <TrendingUp className="w-6 h-6" />
          </div>
          <div className="min-w-0">
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Rata-rata Ketepatan Administrasi</span>
            <span className="text-base font-black text-slate-800 block mt-0.5 font-mono">
              {Math.round(schoolMetricsList.reduce((acc, current) => acc + current.overallScore, 0) / schoolMetricsList.length)} <span className="text-xs text-slate-400 font-semibold font-sans">/ 100 pt</span>
            </span>
            <span className="text-[10px] text-slate-400 block mt-1">Standarisasi Audit Lazuardi Group</span>
          </div>
        </div>

      </div>

      {/* 3. Main interactive comparison board layout */}
      <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-xs space-y-6">
        
        {/* Actions bar */}
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 border-b border-slate-100 pb-5">
          <div>
            <h3 className="text-base font-extrabold text-slate-800">Tabel Kedisiplinan & Perbandingan Lintas Sekolah</h3>
            <p className="text-xs text-slate-400 mt-1">Gunakan tab filter dan pengaturan urutan untuk mengevaluasi parameter kesuksesan.</p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            
            {/* Sort Dropdown */}
            <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200/60 p-1.5 rounded-xl text-xs font-semibold">
              <span className="text-slate-400 text-[11px] font-bold uppercase pl-1.5">Urutkan:</span>
              <select
                id="mitra-sort-selector"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="bg-transparent border-0 font-bold text-blue-900 outline-none pr-1 cursor-pointer"
              >
                <option value="score">Skor Performa</option>
                <option value="reportRate">Pengiriman Laporan</option>
                <option value="paymentRate">Pembayaran Iuran</option>
                <option value="event">Keaktifan Event</option>
              </select>
            </div>

            {/* Metrics visual filters */}
            <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200/30">
              <button
                id="btn-metric-all"
                onClick={() => setActiveMetricTab("all")}
                className={`py-1.5 px-3 text-[11px] font-bold rounded-lg transition-all cursor-pointer ${activeMetricTab === "all" ? "bg-blue-900 text-white shadow-xs" : "text-slate-500 hover:text-slate-700"}`}
              >
                Semua Data
              </button>
              <button
                id="btn-metric-reports"
                onClick={() => setActiveMetricTab("reports")}
                className={`py-1.5 px-3 text-[11px] font-bold rounded-lg transition-all cursor-pointer ${activeMetricTab === "reports" ? "bg-blue-900 text-white shadow-xs" : "text-slate-500 hover:text-slate-700"}`}
              >
                Laporan
              </button>
              <button
                id="btn-metric-payments"
                onClick={() => setActiveMetricTab("payments")}
                className={`py-1.5 px-3 text-[11px] font-bold rounded-lg transition-all cursor-pointer ${activeMetricTab === "payments" ? "bg-blue-900 text-white shadow-xs" : "text-slate-500 hover:text-slate-700"}`}
              >
                Finansial
              </button>
              <button
                id="btn-metric-events"
                onClick={() => setActiveMetricTab("events")}
                className={`py-1.5 px-3 text-[11px] font-bold rounded-lg transition-all cursor-pointer ${activeMetricTab === "events" ? "bg-blue-900 text-white shadow-xs" : "text-slate-500 hover:text-slate-700"}`}
              >
                Event
              </button>
            </div>

          </div>
        </div>

        {/* Search tool */}
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            id="mitra-comparison-search"
            type="text"
            placeholder="Cari nama sekolah mitra..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 hover:bg-slate-100/50 focus:bg-white border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-900 transition-all font-medium text-slate-700"
          />
        </div>

        {/* Benchmarking Table Grid */}
        <div className="overflow-x-auto rounded-2xl border border-slate-100">
          <table className="w-full border-collapse text-left text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                <th className="py-3 px-4 w-12 text-center">Rank</th>
                <th className="py-3 px-4 min-w-[200px]">Sekolah Mitra</th>
                
                {/* Dynamically shown/hidden columns based on filter */}
                {(activeMetricTab === "all" || activeMetricTab === "reports") && (
                  <th className="py-3 px-4">Pengiriman Laporan</th>
                )}
                {(activeMetricTab === "all" || activeMetricTab === "payments") && (
                  <th className="py-3 px-4">Kepatuhan Iuran</th>
                )}
                {(activeMetricTab === "all" || activeMetricTab === "events") && (
                  <th className="py-3 px-4">Keaktifan Event</th>
                )}

                <th className="py-3 px-4 text-center">Skor Akhir</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100/40">
              {filteredAndSortedSchools.length > 0 ? (
                filteredAndSortedSchools.map((school, sortedIndex) => {
                  const isMySchool = currentSchool === school.name;
                  
                  // Calculate dynamic ranking inside the list (based on scores)
                  const originalRank = schoolMetricsList.findIndex(s => s.name === school.name) >= 0
                    ? [...schoolMetricsList].sort((a,b) => b.overallScore - a.overallScore).findIndex(s => s.name === school.name) + 1
                    : sortedIndex + 1;

                  return (
                    <tr 
                      key={school.name}
                      id={`compare-row-${school.name.toLowerCase().replace(/\s+/g, "")}`}
                      className={`transition-all ${isMySchool ? "bg-yellow-400/5 hover:bg-yellow-400/10" : "hover:bg-slate-50/50"}`}
                      style={isMySchool ? { borderLeft: "4px solid #facc15" } : undefined}
                    >
                      {/* Rank Indicator */}
                      <td className="py-4 px-4 text-center font-bold font-mono">
                        {originalRank === 1 ? (
                          <span className="inline-flex items-center justify-center w-6 h-6 bg-yellow-400 text-blue-950 rounded-full text-[11px] shadow-xs">
                            🥇
                          </span>
                        ) : originalRank === 2 ? (
                          <span className="inline-flex items-center justify-center w-6 h-6 bg-slate-200 text-slate-800 rounded-full text-[11px]">
                            🥈
                          </span>
                        ) : originalRank === 3 ? (
                          <span className="inline-flex items-center justify-center w-6 h-6 bg-amber-100 text-amber-800 rounded-full text-[11px]">
                            🥉
                          </span>
                        ) : (
                          <span className="text-slate-400">{originalRank}</span>
                        )}
                      </td>

                      {/* School description & visual highlights */}
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-2">
                          <span className="font-extrabold text-slate-700 text-sm tracking-tight">{school.name}</span>
                          {isMySchool && (
                            <span className="text-[9px] font-black uppercase bg-yellow-400 text-blue-950 px-2 py-0.5 rounded-full border border-yellow-500 flex items-center gap-1">
                              <Star className="w-2.5 h-2.5 fill-blue-950 text-blue-950" />
                              Sekolah Anda
                            </span>
                          )}
                        </div>
                        <span className="text-[10px] text-slate-400 font-medium block mt-0.5">
                          Lazuardi Group Academic Partner
                        </span>
                      </td>

                      {/* 1. Monthly Report Completion Status */}
                      {(activeMetricTab === "all" || activeMetricTab === "reports") && (
                        <td className="py-4 px-4 w-60">
                          <div className="space-y-1">
                            <div className="flex items-center justify-between text-[11px] font-bold">
                              <span className="text-slate-500">{school.reportSubmitted} / {school.reportCount} Laporan</span>
                              <span className={school.reportRate >= 80 ? "text-teal-600" : "text-amber-600"}>
                                {school.reportRate}%
                              </span>
                            </div>
                            {/* Bar display */}
                            <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                              <div 
                                className={`h-full rounded-full transition-all ${school.reportRate >= 80 ? "bg-teal-500" : "bg-yellow-400"}`} 
                                style={{ width: `${school.reportRate}%` }}
                              />
                            </div>
                            <span className="text-[9px] font-medium text-slate-400 block font-mono">
                              Verifikasi Audit: {school.reportSubmitted > 0 ? `${school.reportApprovedRate}% Sesuai` : "Belum Berkas"}
                            </span>
                          </div>
                        </td>
                      )}

                      {/* 2. Payment/Invoice History and Status */}
                      {(activeMetricTab === "all" || activeMetricTab === "payments") && (
                        <td className="py-4 px-4">
                          <div className="flex flex-col space-y-1">
                            <span className="text-[11px] font-bold text-slate-700">
                              Lunas: {school.invoicePaidCount} / {school.invoiceTotalCount} Invoice
                            </span>
                            
                            <div className="flex items-center gap-2">
                              {school.unpaidCount > 0 ? (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[9px] font-bold bg-amber-50 text-amber-600 border border-amber-200/50">
                                  <AlertTriangle className="w-3 h-3" />
                                  {school.unpaidCount} Belum Lunas
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[9px] font-bold bg-teal-50 text-teal-600 border border-teal-200/40">
                                  ✓ Bebas Tunggakan
                                </span>
                              )}
                              <span className="text-[10px] font-extrabold text-blue-900 bg-blue-50 px-1.5 rounded font-mono">
                                {school.paymentRate}%
                              </span>
                            </div>
                          </div>
                        </td>
                      )}

                      {/* 3. Event Tracker participation */}
                      {(activeMetricTab === "all" || activeMetricTab === "events") && (
                        <td className="py-4 px-4">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-extrabold text-blue-900 font-mono">
                              {school.eventActivityCount}
                            </span>
                            <span className="text-slate-400 font-medium">Kegiatan / Agenda</span>
                          </div>
                          <span className={`text-[9px] font-extrabold block mt-1 tracking-wider ${
                            school.eventActivityCount >= 5 
                              ? "text-blue-900 uppercase" 
                              : school.eventActivityCount >= 3 
                              ? "text-slate-500 uppercase" 
                              : "text-amber-600 uppercase"
                          }`}>
                            {school.eventActivityCount >= 5 ? "⚡ Sangat Aktif" : school.eventActivityCount >= 3 ? "⭐ Aktif" : "⚠ Cukup Aktif"}
                          </span>
                        </td>
                      )}

                      {/* Overall composite Score out of 100 */}
                      <td className="py-4 px-4 text-center">
                        <div className="inline-block p-1 px-3 bg-blue-900 text-yellow-300 font-black text-xs rounded-xl font-mono border border-blue-950/20">
                          {school.overallScore} <span className="text-[9px] font-medium text-slate-350">pt</span>
                        </div>
                      </td>

                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-slate-400">
                    Tidak ada sekolah mitra yang cocok dengan kueri pencarian.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

      </div>

      {/* 4. Strategic Recommendation context box */}
      <div className="p-5 bg-yellow-50 border border-yellow-200 text-slate-800 rounded-3xl flex items-start gap-3 max-w-4xl">
        <Info className="w-5 h-5 text-blue-900 mt-0.5 flex-shrink-0" />
        <div className="space-y-1">
          <strong className="text-xs font-bold text-blue-950 block uppercase tracking-wider">Mekanisme Kompetitif Sehat (Benchmarking)</strong>
          <p className="text-[11px] text-slate-600 leading-relaxed font-normal">
            Data ini dihimpun secara berkala oleh tim Audit Akademik Lazuardi Group setiap pertengahan bulan. Sekolah yang mempertahankan tingkat kepatuhan di atas <strong className="text-blue-900 font-bold">85% selama 3 triwulan berturut-turut</strong> berhak menerima insentif fasilitas lab penunjang serta prioritas dispensasi percepatan dana bantuan operasional sekolah (BOS) dari dinas terkait.
          </p>
        </div>
      </div>

    </div>
  );
}
