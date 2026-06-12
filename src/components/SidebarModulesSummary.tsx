import React, { useMemo } from "react";
import { 
  FileSpreadsheet, 
  Receipt, 
  MessageSquare, 
  Calendar, 
  Award, 
  Users, 
  Layers, 
  ArrowRight,
  TrendingUp,
  Clock,
  CheckCircle2,
  AlertCircle
} from "lucide-react";
import { UserSession, ReportRecord, Invoice, PartnerRequest, EventTracker, KPIMitra } from "../types";

interface SidebarModulesSummaryProps {
  session: UserSession;
  lang: "id" | "en";
  records: ReportRecord[];
  invoices: Invoice[];
  requests: PartnerRequest[];
  events: EventTracker[];
  kpis: KPIMitra[];
  users: any[];
  requestCategoriesCount: number;
  eventCategoriesCount: number;
  onNavigate: (tabId: string) => void;
}

export default function SidebarModulesSummary({
  session,
  lang,
  records,
  invoices,
  requests,
  events,
  kpis,
  users,
  requestCategoriesCount,
  eventCategoriesCount,
  onNavigate
}: SidebarModulesSummaryProps) {
  
  const isMitra = session.role === "sekolah_mitra";
  const userSchool = session.sekolahName || "";

  // 1. Report compliance highlights
  const reportStats = useMemo(() => {
    const list = isMitra ? records.filter(r => r.sekolahMitra === userSchool) : records;
    const total = list.length;
    const sent = list.filter(r => r.statusLaporan === "Sudah Kirim").length;
    const audited = list.filter(r => r.statusAudit === "Selesai").length;
    const rate = total > 0 ? Math.round((sent / total) * 100) : 0;
    return { total, sent, audited, rate };
  }, [records, isMitra, userSchool]);

  // 2. Invoice summary metrics
  const invoiceStats = useMemo(() => {
    const list = isMitra ? invoices.filter(i => i.sekolahMitra === userSchool) : invoices;
    const total = list.length;
    const paid = list.filter(i => i.statusPay === "Lunas").length;
    const pending = list.filter(i => i.statusPay === "Belum Lunas").length;
    const totalAmount = list.reduce((sum, item) => sum + item.jumlah, 0);
    const paidAmount = list.filter(i => i.statusPay === "Lunas").reduce((sum, item) => sum + item.jumlah, 0);
    const paidRatio = total > 0 ? Math.round((paid / total) * 100) : 0;
    return { total, paid, pending, totalAmount, paidAmount, paidRatio };
  }, [invoices, isMitra, userSchool]);

  // 3. Request summary metrics
  const requestStats = useMemo(() => {
    const list = isMitra ? requests.filter(r => r.sekolahMitra === userSchool) : requests;
    const total = list.length;
    const approved = list.filter(r => r.statusApproved === "Setuju").length;
    const pending = list.filter(r => r.statusApproved === "Menunggu").length;
    return { total, approved, pending };
  }, [requests, isMitra, userSchool]);

  // 4. Events summary metrics
  const eventStats = useMemo(() => {
    const list = isMitra ? events.filter(e => e.sekolahMitra === userSchool) : events;
    return { total: list.length };
  }, [events, isMitra, userSchool]);

  // 5. KPIs metrics
  const kpiStats = useMemo(() => {
    // KPIs generally apply to the active school or center-wide
    const list = kpis;
    const total = list.length;
    const avgProgress = total > 0 
      ? Math.round(list.reduce((sum, item) => sum + (item.progress || 0), 0) / total)
      : 0;
    return { total, avgProgress };
  }, [kpis]);

  const modules = [
    {
      id: "reports",
      title: lang === "id" ? "Laporan Bulanan" : "Monthly Reports",
      description: lang === "id" 
        ? "Modul pelacakan kepatuhan pengiriman berkas operasional bulanan sekolah."
        : "Module for tracking compliance of monthly school operational document submissions.",
      icon: FileSpreadsheet,
      themeColor: "border-emerald-500/30 hover:border-emerald-500 bg-emerald-500/5",
      badgeColor: "bg-emerald-100 text-emerald-800",
      iconColor: "text-emerald-600",
      visible: true,
      metrics: (
        <div className="grid grid-cols-2 gap-2 mt-3 text-xs">
          <div className="bg-white/60 p-2 rounded-xl border border-slate-100">
            <span className="text-[10px] text-slate-400 block font-medium">Terkirim</span>
            <span className="font-extrabold text-emerald-700">{reportStats.sent} / {reportStats.total}</span>
          </div>
          <div className="bg-white/60 p-2 rounded-xl border border-slate-100">
            <span className="text-[10px] text-slate-400 block font-medium">Rasio Patuh</span>
            <span className="font-extrabold text-blue-900">{reportStats.rate}%</span>
          </div>
        </div>
      )
    },
    {
      id: "invoices",
      title: lang === "id" ? "Invoice & Pembayaran" : "Invoices & Payments",
      description: lang === "id"
        ? "Pemantauan keuangan tagihan Franchise Fee, Renewal Fee, dan Uang Jenjang Baru."
        : "Financial monitoring of Franchise Fees, Renewal Fees, and New Grade level Fees.",
      icon: Receipt,
      themeColor: "border-blue-500/30 hover:border-blue-500 bg-blue-50/50",
      badgeColor: "bg-blue-100 text-blue-800",
      iconColor: "text-blue-600",
      visible: true,
      metrics: (
        <div className="grid grid-cols-2 gap-2 mt-3 text-xs">
          <div className="bg-white/60 p-2 rounded-xl border border-slate-100">
            <span className="text-[10px] text-slate-400 block font-medium">Lunas</span>
            <span className="font-extrabold text-emerald-700">{invoiceStats.paid} Invoice</span>
          </div>
          <div className="bg-white/60 p-2 rounded-xl border border-slate-100">
            <span className="text-[10px] text-slate-400 block font-medium">Belum Lunas</span>
            <span className="font-extrabold text-amber-600">{invoiceStats.pending} Invoice</span>
          </div>
        </div>
      )
    },
    {
      id: "requests",
      title: lang === "id" ? "Request Mitra" : "Partner Requests",
      description: lang === "id"
        ? "Wadah pengajuan aspirasi sarpras, bantuan BOS, penambahan kurikulum, dan keluhan."
        : "Portal for submitting infrastructure requests, BOS school aid, curriculum expansions, or complaints.",
      icon: MessageSquare,
      themeColor: "border-indigo-500/30 hover:border-indigo-500 bg-indigo-500/5",
      badgeColor: "bg-indigo-100 text-indigo-800",
      iconColor: "text-indigo-600",
      visible: true,
      metrics: (
        <div className="grid grid-cols-2 gap-2 mt-3 text-xs">
          <div className="bg-white/60 p-2 rounded-xl border border-slate-100">
            <span className="text-[10px] text-slate-400 block font-medium">Approved / Setuju</span>
            <span className="font-extrabold text-indigo-700">{requestStats.approved}</span>
          </div>
          <div className="bg-white/60 p-2 rounded-xl border border-slate-100">
            <span className="text-[10px] text-slate-400 block font-medium">Menunggu Realisasi</span>
            <span className="font-extrabold text-amber-600">{requestStats.pending}</span>
          </div>
        </div>
      )
    },
    {
      id: "events",
      title: lang === "id" ? "Event Tracker" : "Event Tracker",
      description: lang === "id"
        ? "Hub penjadwalan bimbingan teknis (Bimtek) guru, visitasi direksi luar kota, dan audit mutu."
        : "Scheduling hub for teacher training programs, management visits, and quality standard audits.",
      icon: Calendar,
      themeColor: "border-amber-500/30 hover:border-amber-500 bg-amber-500/5",
      badgeColor: "bg-amber-100 text-amber-800",
      iconColor: "text-amber-600",
      visible: true,
      metrics: (
        <div className="grid grid-cols-2 gap-2 mt-3 text-xs">
          <div className="bg-white/60 p-2 rounded-xl border border-slate-100 col-span-2 flex items-center justify-between">
            <span className="text-[10px] text-slate-400 font-medium">Agenda Terjadwal</span>
            <span className="font-extrabold text-amber-700 font-mono text-sm bg-amber-50 px-2 py-0.5 rounded-lg">{eventStats.total} Kegiatan</span>
          </div>
        </div>
      )
    },
    {
      id: "kpis",
      title: lang === "id" ? "KPI Mitra Lazuardi" : "Partner KPI Benchmarks",
      description: lang === "id"
        ? "Matriks penilaian Key Performance Indicators terhadap ketercapaian target tahunan."
        : "Standard metric analysis of Key Performance Indicators against active annual strategic targets.",
      icon: Award,
      themeColor: "border-violet-500/30 hover:border-violet-500 bg-violet-500/5",
      badgeColor: "bg-violet-100 text-violet-800",
      iconColor: "text-violet-600",
      visible: true,
      metrics: (
        <div className="grid grid-cols-2 gap-2 mt-3 text-xs">
          <div className="bg-white/60 p-2 rounded-xl border border-slate-100 col-span-2 flex items-center justify-between">
            <span className="text-[10px] text-slate-400 font-medium">Rata-rata Pencapaian</span>
            <span className="font-extrabold text-violet-700 font-mono text-sm bg-violet-50 px-2 py-0.5 rounded-lg">{kpiStats.avgProgress}%</span>
          </div>
        </div>
      )
    },
    {
      id: "users",
      title: lang === "id" ? "Kelola Pengguna" : "User Security Accounts",
      description: lang === "id"
        ? "Pusat verifikasi otentikasi login, pengelolaan kata sandi bendahara, dan pembatasan perimeter hak akses."
        : "Authentication portal oversight, management of operational passwords, and security boundary assignment.",
      icon: Users,
      themeColor: "border-rose-500/30 hover:border-rose-500 bg-rose-500/5",
      badgeColor: "bg-rose-100 text-rose-800",
      iconColor: "text-rose-600",
      visible: session.role === "admin",
      metrics: (
        <div className="grid grid-cols-2 gap-2 mt-3 text-xs">
          <div className="bg-white/60 p-2 rounded-xl border border-slate-100 col-span-2 flex items-center justify-between">
            <span className="text-[10px] text-slate-400 font-medium">Pengguna Terdaftar</span>
            <span className="font-extrabold text-rose-700 font-mono text-sm bg-rose-50 px-2 py-0.5 rounded-lg">{users.length} Akun</span>
          </div>
        </div>
      )
    },
    {
      id: "categories",
      title: lang === "id" ? "Kelola Kategori" : "System Categories",
      description: lang === "id"
        ? "Konfigurasi kustom jenis pengajuan aspirasi serta kelompok webinar pelorot bimbingan guru."
        : "Dynamic configuration of partner submission types and classification templates for teacher groups.",
      icon: Layers,
      themeColor: "border-teal-500/30 hover:border-teal-500 bg-teal-500/5",
      badgeColor: "bg-teal-100 text-teal-800",
      iconColor: "text-teal-600",
      visible: session.role === "admin",
      metrics: (
        <div className="grid grid-cols-2 gap-2 mt-3 text-xs">
          <div className="bg-white/60 p-2 rounded-xl border border-slate-100">
            <span className="text-[10px] text-slate-400 block font-medium">Req Class</span>
            <span className="font-extrabold text-teal-700">{requestCategoriesCount} Opsi</span>
          </div>
          <div className="bg-white/60 p-2 rounded-xl border border-slate-100">
            <span className="text-[10px] text-slate-400 block font-medium">Event Class</span>
            <span className="font-extrabold text-teal-700">{eventCategoriesCount} Opsi</span>
          </div>
        </div>
      )
    }
  ];

  const visibleModules = modules.filter(m => m.visible);

  return (
    <div id="sidebar-modules-summary-root" className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-xs">
      <div className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-900" />
            {lang === "id" ? "Rangkuman Aktivitas & Layanan Menu" : "Module Summaries & Active Hub Tracker"}
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            {lang === "id"
              ? "Klik langsung pada modul kartu di bawah ini untuk mengakses fungsionalitas detail di ruang kemudi Lazuardi."
              : "Click directly on any of the module cards below to open and navigate specifically to that functional management page."}
          </p>
        </div>
        
        <div className="self-start md:self-center text-[10px] font-bold text-slate-400 uppercase tracking-widest bg-slate-50 px-3 py-1 rounded-full border border-slate-100">
          {lang === "id" ? "Navigasi Cepat Aktif" : "Quick Navigation Ready"}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {visibleModules.map((m) => {
          const IconComponent = m.icon;
          return (
            <div
              key={m.id}
              id={`nav-summary-card-${m.id}`}
              onClick={() => onNavigate(m.id)}
              className={`p-5 rounded-2xl border transition-all duration-300 cursor-pointer group flex flex-col justify-between ${m.themeColor}`}
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className={`p-2 rounded-xl bg-white border border-slate-100 shadow-3xs ${m.iconColor}`}>
                    <IconComponent className="w-5 h-5" />
                  </div>
                  
                  <span className="text-[9px] font-extrabold tracking-widest uppercase bg-white px-2 py-0.5 rounded-full border border-slate-200/70 text-slate-500 flex items-center gap-1 group-hover:text-blue-950">
                    {lang === "id" ? "BUKA" : "OPEN"}
                    <ArrowRight className="w-3 h-3 translate-x-0 group-hover:translate-x-0.5 transition-transform" />
                  </span>
                </div>

                <h3 className="text-xs font-extrabold text-slate-800 tracking-tight group-hover:text-blue-950 transition-colors">
                  {m.title}
                </h3>
                <p className="text-[11px] text-slate-400 leading-relaxed mt-1.5 min-h-[44px]">
                  {m.description}
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100/60">
                {m.metrics}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
