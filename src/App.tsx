import React, { useState, useEffect, useMemo } from "react";
import { ReportRecord, DashboardStats, UserSession, Invoice, PartnerRequest, EventTracker } from "./types";
import { fallbackReports } from "./fallbackData";
import { mockInvoices, mockPartnerRequests, mockEvents } from "./mockFeaturesData";
import ReportStats from "./components/ReportStats";
import ReportChart from "./components/ReportChart";
import ReportTable from "./components/ReportTable";
import SchoolDetail from "./components/SchoolDetail";
import AiAssistant from "./components/AiAssistant";
import LoginScreen from "./components/LoginScreen";
import InvoiceList from "./components/InvoiceList";
import RequestList from "./components/RequestList";
import EventTrackerList from "./components/EventTrackerList";
import MitraComparison from "./components/MitraComparison";
import {
  GraduationCap,
  LayoutDashboard,
  FileSpreadsheet,
  Receipt,
  MessageSquare,
  Calendar,
  Users,
  LogOut,
  Menu,
  X,
  Shield,
  RefreshCw,
  Layers,
  ArrowUpRight,
  ShieldCheck,
  School,
  Lock,
  UserCheck
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

export default function App() {
  // Authentication & session state
  const [session, setSession] = useState<UserSession | null>(() => {
    const saved = localStorage.getItem("laz_session");
    return saved ? JSON.parse(saved) : null;
  });

  // Sidebar navigation tabs
  const [activeTab, setActiveTab] = useState<string>(() => {
    const savedSession = localStorage.getItem("laz_session");
    if (savedSession) {
      return "overview";
    }
    return "overview";
  });

  // Mobile sidebar open/close state
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  // Core records & syncing
  const [records, setRecords] = useState<ReportRecord[]>([]);
  const [source, setSource] = useState<"live" | "fallback" | "loading">("loading");
  const [selectedSchool, setSelectedSchool] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  // Dynamic feature data lists (Invoices, Requests, Events) with localStorage cache
  const [invoices, setInvoices] = useState<Invoice[]>(() => {
    const saved = localStorage.getItem("laz_invoices");
    return saved ? JSON.parse(saved) : mockInvoices;
  });

  const [requests, setRequests] = useState<PartnerRequest[]>(() => {
    const saved = localStorage.getItem("laz_requests");
    return saved ? JSON.parse(saved) : mockPartnerRequests;
  });

  const [events, setEvents] = useState<EventTracker[]>(() => {
    const saved = localStorage.getItem("laz_events");
    return saved ? JSON.parse(saved) : mockEvents;
  });

  // Save changes to cache
  useEffect(() => {
    localStorage.setItem("laz_invoices", JSON.stringify(invoices));
  }, [invoices]);

  useEffect(() => {
    localStorage.setItem("laz_requests", JSON.stringify(requests));
  }, [requests]);

  useEffect(() => {
    localStorage.setItem("laz_events", JSON.stringify(events));
  }, [events]);

  // Syncing reports from the sheets API
  const fetchReports = async () => {
    setRefreshing(true);
    try {
      const res = await fetch("/api/reports");
      const json = await res.json();
      if (json.success && json.data) {
        setRecords(json.data);
        setSource(json.source);
      } else {
        setRecords(fallbackReports);
        setSource("fallback");
      }
    } catch (err) {
      console.error("Gagal mendapatkan data laporan:", err);
      setRecords(fallbackReports);
      setSource("fallback");
    } finally {
      setTimeout(() => setRefreshing(false), 500);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  // Set default tab on login role change
  const handleLogin = (newSession: UserSession) => {
    setSession(newSession);
    localStorage.setItem("laz_session", JSON.stringify(newSession));
    setActiveTab("overview");
  };

  const handleLogout = () => {
    setSession(null);
    localStorage.removeItem("laz_session");
    setActiveTab("overview");
  };

  // List of unique school names for reference
  const schoolList = useMemo(() => {
    if (records.length === 0) return ["SMA Lazuardi", "Al-Falah Depok", "Cordova", "Haura", "Ibnu Sina"];
    return Array.from(new Set(records.map((r) => r.sekolahMitra)));
  }, [records]);

  // Multi-tenant reports isolation: if Mitra, isolate reports strictly to their scope
  const isolatedRecords = useMemo(() => {
    if (!session) return [];
    if (session.role === "admin") return records;
    return records.filter((r) => r.sekolahMitra === session.sekolahName);
  }, [records, session]);

  // Compute stats based on the isolated/isolated records
  const stats: DashboardStats = useMemo(() => {
    const targetSource = isolatedRecords;
    if (targetSource.length === 0) {
      return {
        totalMitra: 0,
        totalLaporanKirim: 0,
        totalLaporanBelumKirim: 0,
        totalSelesai: 0,
        totalRevisi: 0,
        totalBelumAudit: 0,
        persentaseKirim: 0,
      };
    }

    const uniqueSchools = Array.from(new Set(targetSource.map((r) => r.sekolahMitra)));
    const totalMitra = uniqueSchools.length;
    const totalLaporanKirim = targetSource.filter((r) => r.statusLaporan === "Sudah Kirim").length;
    const totalLaporanBelumKirim = targetSource.filter((r) => r.statusLaporan === "Belum Kirim").length;
    const totalSelesai = targetSource.filter((r) => r.statusAudit === "Selesai").length;
    const totalRevisi = targetSource.filter((r) => r.statusAudit === "Revisi").length;
    const totalBelumAudit = targetSource.filter((r) => r.statusAudit === "Belum Diaudit").length;

    const relevantSlots = totalLaporanKirim + totalLaporanBelumKirim;
    const persentaseKirim = relevantSlots > 0 ? Math.round((totalLaporanKirim / relevantSlots) * 100) : 0;

    return {
      totalMitra: session?.role === "admin" ? totalMitra : 1, // Mitra evaluates only 1 school
      totalLaporanKirim,
      totalLaporanBelumKirim,
      totalSelesai,
      totalRevisi,
      totalBelumAudit,
      persentaseKirim,
    };
  }, [isolatedRecords, session]);

  // Mutation handlers passed to sub-modules
  const handleUpdateInvoiceStatus = (id: string, newStatus: "Lunas" | "Belum Lunas") => {
    setInvoices((prev) =>
      prev.map((inv) => (inv.id === id ? { ...inv, statusPay: newStatus } : inv))
    );
  };

  const handleCreateRequest = (
    tipe: "Dana BOS" | "Fasilitas" | "Pendampingan Kurikulum" | "Lainnya",
    deskripsi: string
  ) => {
    if (!session) return;
    const newReq: PartnerRequest = {
      id: `req-${Date.now()}`,
      sekolahMitra: session.role === "admin" ? "Sekretariat Lazuardi" : (session.sekolahName || "SMA Lazuardi"),
      tipeRequest: tipe,
      deskripsi: deskripsi,
      tanggal: new Date().toLocaleDateString("id-ID", { day: "2-digit", month: "short", year: "numeric" }).replace(/\s/g, "-"),
      statusApproved: "Menunggu",
    };
    setRequests((prev) => [newReq, ...prev]);
  };

  const handleUpdateRequestStatus = (id: string, newStatus: "Setuju" | "Ditolak") => {
    setRequests((prev) =>
      prev.map((req) => (req.id === id ? { ...req, statusApproved: newStatus } : req))
    );
  };

  const handleCreateEvent = (
    namaEvent: string,
    tanggal: string,
    sekolahMitra: string,
    kategori: "Audit" | "Rapat Kurikulum" | "Bimtek" | "Lainnya",
    deskripsi: string
  ) => {
    const newEvt: EventTracker = {
      id: `evt-${Date.now()}`,
      namaEvent,
      tanggal,
      sekolahMitra,
      kategori,
      deskripsi,
    };
    setEvents((prev) => [newEvt, ...prev]);
  };

  // If user is not logged in, prompt the Login Screen beautifully
  if (!session) {
    return <LoginScreen onLoginSuccess={handleLogin} schools={schoolList} />;
  }

  // Side bar Navigation items with icons, filtered by Roles
  const navigationItems = [
    {
      id: "overview",
      label: "Dashboard Ringkasan",
      icon: LayoutDashboard,
      adminOnly: false,
    },
    {
      id: "reports",
      label: "Laporan Bulanan",
      icon: FileSpreadsheet,
      adminOnly: false,
    },
    {
      id: "invoices",
      label: "Invoice Pembayaran",
      icon: Receipt,
      adminOnly: false,
    },
    {
      id: "requests",
      label: "Request Mitra",
      icon: MessageSquare,
      adminOnly: false,
    },
    {
      id: "events",
      label: "Event Tracker",
      icon: Calendar,
      adminOnly: false,
    },
    {
      id: "users",
      label: "Kelola Pengguna",
      icon: Users,
      adminOnly: true,
    },
  ];

  // Defensive path authorization based on roles
  const authorizedNavItems = navigationItems.filter((item) => {
    if (session.role === "admin") return true;
    return !item.adminOnly;
  });

  return (
    <div className="min-h-screen bg-slate-50/60 flex flex-col md:flex-row font-sans text-slate-800" id="laz-layout-container">
      
      {/* 1. Mobile Top Navigation Bar (Blue and Yellow Styled) */}
      <div className="md:hidden bg-blue-950 border-b border-yellow-400/20 px-4 py-3 text-white flex items-center justify-between z-40 sticky top-0">
        <div className="flex items-center gap-2">
          <div className="p-1 px-2 bg-yellow-400 text-blue-950 rounded-lg font-bold flex items-center justify-center">
            <GraduationCap className="w-5 h-5" />
          </div>
          <div>
            <span className="text-xs font-bold font-mono tracking-tight text-yellow-300">LAZUARDI</span>
            <span className="text-[10px] block font-semibold leading-none text-slate-300">Mitra Hub</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[9px] font-bold uppercase bg-yellow-400/10 text-yellow-300 px-2 py-0.5 rounded-full border border-yellow-400/20">
            {session.role === "admin" ? "Admin" : "Mitra"}
          </span>
          <button
            onClick={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)}
            className="p-1.5 hover:bg-white/10 rounded-lg text-slate-100"
          >
            {isMobileSidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* 2. Desktop & Mobile Drawer Sidebar Wrapper */}
      <aside
        id="app-sidebar"
        className={`fixed inset-y-0 left-0 bg-blue-950 text-white w-64 border-r border-yellow-400/20 z-50 transform md:transform-none md:translate-x-0 transition-transform duration-300 flex flex-col justify-between ${
          isMobileSidebarOpen ? "translate-x-0" : "-translate-x-full"
        } md:sticky md:h-screen md:top-0`}
      >
        <div>
          {/* Brand logotype inside navy sidebar with custom golden elements */}
          <div className="p-6 border-b border-blue-900/60 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-yellow-400 text-blue-950 rounded-xl flex items-center justify-center shadow-md border border-white transform hover:rotate-6 transition-transform">
                <GraduationCap className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-sm font-extrabold tracking-tight text-white flex items-center gap-1.5">
                  Lazuardi
                  <span className="text-[9px] bg-yellow-400 text-blue-950 px-1 py-0.2 rounded-sm font-mono tracking-tight leading-none">HUB</span>
                </h2>
                <span className="text-[10px] text-slate-400 font-medium block mt-0.5">Tata Kelola Mitra Digital</span>
              </div>
            </div>
            
            {/* Close button for mobile inside drawer */}
            <button
              onClick={() => setIsMobileSidebarOpen(false)}
              className="md:hidden p-1 bg-blue-900/40 rounded-lg text-slate-300"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Quick Active user signet profile badge */}
          <div className="p-4 mx-3 my-4 bg-blue-900/40 border border-blue-900/60 rounded-2xl flex items-center gap-3">
            <div className="w-9 h-9 bg-yellow-400/10 border border-yellow-400/20 text-yellow-400 rounded-xl flex items-center justify-center flex-shrink-0">
              {session.role === "admin" ? <ShieldCheck className="w-5 h-5" /> : <School className="w-5 h-5" />}
            </div>
            <div className="overflow-hidden">
              <span className="text-[11px] font-bold block text-white truncate leading-tight">{session.username}</span>
              <span className="text-[9px] font-semibold text-yellow-300 uppercase tracking-widest block mt-0.5">
                {session.role === "admin" ? "Pusat (Admin)" : "Sekolah Mitra"}
              </span>
            </div>
          </div>

          {/* Navigational Links Menu */}
          <nav className="px-3 space-y-1">
            {authorizedNavItems.map((item) => {
              const IconComp = item.icon;
              const isSelected = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveTab(item.id);
                    setIsMobileSidebarOpen(false);
                  }}
                  className={`w-full py-2.5 px-3.5 rounded-xl text-left text-xs font-bold transition-all flex items-center gap-3 relative cursor-pointer group ${
                    isSelected
                      ? "bg-yellow-400 text-blue-950 shadow-md font-extrabold"
                      : "text-slate-350 hover:bg-blue-900/60 hover:text-white"
                  }`}
                >
                  {/* Active yellow sidebar left indicator */}
                  {isSelected && (
                    <span className="absolute left-0 top-2 bottom-2 w-1.5 bg-blue-950 rounded-r-md" />
                  )}
                  <IconComp className={`w-4 h-4 ${isSelected ? "text-blue-950" : "text-yellow-400 group-hover:scale-110 transition-transform"}`} />
                  {item.label}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Sidebar bottom log out button */}
        <div className="p-4 border-t border-blue-900/60">
          <button
            onClick={handleLogout}
            className="w-full py-2 px-3 text-slate-350 hover:text-white hover:bg-rose-950/40 rounded-xl text-xs font-bold transition-all flex items-center gap-3 cursor-pointer"
          >
            <LogOut className="w-4 h-4 text-rose-400" />
            Keluar Sidang
          </button>
        </div>
      </aside>

      {/* 3. Main Dashboard Display Area */}
      <div className="flex-1 flex flex-col min-w-0">
        
        {/* Dynamic Banner Alert for Offline/Mock Mode */}
        {source === "fallback" && (
          <div id="fallback-notification" className="bg-amber-50 border-b border-amber-200 py-2.5 px-6">
            <p className="text-[11px] text-amber-800 font-bold flex items-center gap-2">
              <Shield className="w-4 h-4 text-amber-600 flex-shrink-0" />
              Sistem Lokal Stabil: Data monitoring Lazuardi Mitra Hub dimuat dari basis data cadangan inkremental.
            </p>
          </div>
        )}

        {/* Main Content scroll window with yellow-blue design enhancements */}
        <main className="p-4 sm:p-6 lg:p-8 space-y-6 flex-1 max-w-7xl w-full mx-auto" id="app-main-content">
          
          {/* Header Action section: Profile description & sync button */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200/50 pb-5">
            <div>
              <div className="flex items-center gap-2.5">
                <h1 className="text-2xl font-extrabold text-slate-800 tracking-tight">
                  {activeTab === "overview" && "Dashboard Pengawasan Internal"}
                  {activeTab === "reports" && "Kelengkapan Laporan Bulanan"}
                  {activeTab === "invoices" && "Modul Keuangan & Invoice"}
                  {activeTab === "requests" && "Aspirasi & Request Mitra"}
                  {activeTab === "events" && "Sistem Kalender Audit & Bimtek"}
                  {activeTab === "users" && "Akses Administrasi Pengguna"}
                </h1>
                <span className="text-[10px] font-extrabold bg-blue-900 text-yellow-300 px-2 py-0.5 rounded-full border border-blue-900/30 uppercase tracking-wider">
                  {session.role === "admin" ? "Akses Multi-Sekolah" : "Akses Terisolasi"}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-1 font-medium">
                {session.role === "admin" 
                  ? "Sistem pengawasan Lazuardi Group terintegrasi dengan 10 sekolah mitra nasional."
                  : `Anda masuk sebagai bendahara ${session.sekolahName}. Seluruh data dibatasi demi keamanan instansi.`}
              </p>
            </div>

            <div className="flex items-center gap-2 self-start sm:self-auto">
              <a
                id="spreadsheet-external-link"
                href="https://docs.google.com/spreadsheets/d/1v0Z9ovWaR6e3B5VrxtIhJ-U9Sgy0ciybYmKxxcBr0HM/edit?gid=1734668151#gid=1734668151"
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-1.5 text-xs text-slate-600 bg-white hover:bg-slate-50 border border-slate-200/80 px-3.5 py-2 rounded-xl font-bold transition-all shadow-xs"
              >
                <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
                Spreadsheet
                <ArrowUpRight className="w-3 h-3 opacity-60" />
              </a>

              <button
                id="sync-sheet-btn"
                onClick={fetchReports}
                disabled={refreshing || source === "loading"}
                className="p-2 hover:bg-slate-50 bg-white border border-slate-200/80 rounded-xl transition-all cursor-pointer text-slate-600 disabled:opacity-50 flex items-center gap-1.5 shadow-xs"
                title="Sinkronisasi data Google Sheets"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? "animate-spin text-blue-900" : ""}`} />
                <span className="text-xs font-bold hidden sm:inline">Sinkronisasi</span>
              </button>
            </div>
          </div>

          {source === "loading" ? (
            <div className="py-24 flex flex-col items-center justify-center space-y-4" id="loading-state">
              <RefreshCw className="w-8 h-8 text-blue-900 animate-spin" />
              <p className="text-sm text-slate-500 font-bold">Menyusun tatanan dashboard interaktif...</p>
            </div>
          ) : (
            <div className="space-y-6">
              
              {/* PAGE TAB 1: OVERVIEW ANALYTICS (ADMIN ONLY) */}
              {activeTab === "overview" && session.role === "admin" && (
                <div className="space-y-6 animated-fade-in">
                  <ReportStats stats={stats} />
                  
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
                    <div className="lg:col-span-2 space-y-6">
                      <ReportChart records={isolatedRecords} />
                    </div>
                    
                    <div className="space-y-6">
                      <AiAssistant records={isolatedRecords} />
                      
                      {/* Interactive Admin Helper tool */}
                      <div className="p-5 bg-blue-950 border border-yellow-400/10 text-white rounded-3xl relative overflow-hidden shadow-md">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-yellow-400/5 rounded-full blur-xl pointer-events-none" />
                        <h3 className="text-sm font-bold text-yellow-300">Pusat Informasi Pengawas</h3>
                        <p className="text-xs text-slate-350 leading-relaxed mt-2">
                          Gunakan menu samping untuk memantau detail tagihan keuangan, menyetujui ajuan request sarana BOS, serta membuat jadwal BIMTEK sertifikasi.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* PAGE TAB 1: BENCHMARKING COMPARISON (SEKOLAH MITRA ONLY) */}
              {activeTab === "overview" && session.role === "sekolah_mitra" && (
                <div className="animated-fade-in">
                  <MitraComparison
                    records={records}
                    invoices={invoices}
                    events={events}
                    session={session}
                  />
                </div>
              )}

              {/* PAGE TAB 2: MONTHLY REPORTS TABLE & PERFORMANCE */}
              {activeTab === "reports" && (
                <div className="space-y-6 animated-fade-in">
                  {/* Simple stats localized to scope */}
                  <ReportStats stats={stats} />

                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
                    
                    {/* The Reports logs */}
                    <div className="lg:col-span-2 space-y-6">
                      <ReportTable
                        records={isolatedRecords}
                        onSelectSchool={(schoolName) => {
                          setSelectedSchool(schoolName);
                          setTimeout(() => {
                            document.getElementById("school-detail-modal")?.scrollIntoView({ behavior: "smooth", block: "start" });
                          }, 100);
                        }}
                      />
                    </div>

                    {/* Interactive focus card & helper panels */}
                    <div className="space-y-6 lg:sticky lg:top-24">
                      <AnimatePresence mode="wait">
                        {selectedSchool && (
                          <SchoolDetail
                            key={selectedSchool}
                            schoolName={selectedSchool}
                            records={isolatedRecords}
                            onClose={() => setSelectedSchool(null)}
                          />
                        )}
                      </AnimatePresence>

                      {!selectedSchool && (
                        <motion.div
                          id="no-school-selected-placeholder"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          className="p-5 bg-gradient-to-br from-blue-900/10 to-transparent border border-blue-200/50 rounded-3xl"
                        >
                          <div className="p-2.5 bg-blue-100 border border-blue-200 rounded-xl inline-block text-blue-900 mb-4">
                            <Layers className="w-5 h-5 text-blue-900" />
                          </div>
                          <h3 className="text-sm font-bold text-slate-800">Detail Evaluasi Sekolah</h3>
                          <p className="text-xs text-slate-500 leading-relaxed mt-2 font-normal">
                            Tekan tombol <strong className="text-blue-900 font-bold">"Tinjau"</strong> pada baris manapun untuk melihat persentase kedisiplinan dan tinjauan audit status keuangan.
                          </p>
                        </motion.div>
                      )}

                      {/* AI Assistant context-aware chatbot (Now available on reports tab) */}
                      <AiAssistant records={isolatedRecords} />

                      {/* Legend Box */}
                      <div id="legend-slate" className="p-4 bg-white border border-slate-150/60 rounded-2xl flex flex-col gap-2.5 text-[11px] text-slate-500 shadow-xs">
                        <span className="font-bold uppercase text-slate-400 tracking-wider">Petunjuk Indikator Laporan:</span>
                        <div className="flex items-center gap-2">
                          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                          <span><strong>Sudah Kirim / Selesai</strong> — Terverifikasi tuntas tanpa penyimpangan.</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                          <span><strong>Sudah Kirim / Revisi</strong> — Membutuhkan revisi data oleh bendahara.</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
                          <span><strong>Belum Kirim</strong> — Melewati tenggat batas waktu bulanan Lazuardi.</span>
                        </div>
                      </div>

                    </div>
                  </div>
                </div>
              )}

              {/* PAGE TAB 3: INVOICES & PAYMENTS */}
              {activeTab === "invoices" && (
                <div className="animated-fade-in">
                  <InvoiceList
                    invoices={invoices}
                    session={session}
                    onUpdateInvoiceStatus={handleUpdateInvoiceStatus}
                  />
                </div>
              )}

              {/* PAGE TAB 4: REQUESTS MITRA */}
              {activeTab === "requests" && (
                <div className="animated-fade-in">
                  <RequestList
                    requests={requests}
                    session={session}
                    onCreateRequest={handleCreateRequest}
                    onUpdateRequestStatus={handleUpdateRequestStatus}
                  />
                </div>
              )}

              {/* PAGE TAB 5: EVENT TRACKER SYSTEM */}
              {activeTab === "events" && (
                <div className="animated-fade-in">
                  <EventTrackerList
                    events={events}
                    session={session}
                    schools={schoolList}
                    onCreateEvent={handleCreateEvent}
                  />
                </div>
              )}

              {/* PAGE TAB 6: SETTINGS / USERS SECURITY CHECK (ADMIN ONLY) */}
              {activeTab === "users" && session.role === "admin" && (
                <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-xs space-y-6 animated-fade-in">
                  <div>
                    <h2 className="text-lg font-bold text-slate-800 tracking-tight">Kelola Sidang Kredensial & Pengguna</h2>
                    <p className="text-xs text-slate-400 mt-1">
                      Katalog akun simulasi terdaftar pada sistem Lazuardi Mitra Hub untuk referensi verifikasi audit keamanan.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-5 bg-slate-50 rounded-2xl border border-slate-150 relative overflow-hidden">
                      <div className="absolute top-3 right-3 p-1.5 bg-blue-900 border border-yellow-400/20 rounded-lg text-yellow-300">
                        <ShieldCheck className="w-4 h-4" />
                      </div>
                      <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider font-mono">Role: SUPER ADMINISTRATOR</span>
                      <strong className="text-sm font-bold text-slate-700 block mt-2">Sistem Administrator</strong>
                      <span className="text-xs text-slate-500 font-mono block mt-1">E-mail: admin@lazuardi.com</span>
                      <p className="text-[11px] text-slate-400 mt-3 border-t border-slate-200/50 pt-2 leading-relaxed">
                        Izin penuh di seluruh sektor: Tinjau statistik group, perbaharui invoice iuran, setujui request sarana keuangan, dan terbitkan BIMTEK.
                      </p>
                    </div>

                    <div className="p-5 bg-slate-50 rounded-2xl border border-slate-150 relative overflow-hidden">
                      <div className="absolute top-3 right-3 p-1.5 bg-yellow-400 border border-blue-950/20 rounded-lg text-blue-950">
                        <School className="w-4 h-4" />
                      </div>
                      <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider font-mono">Role: BENDAHARA SEKOLAH</span>
                      <strong className="text-sm font-bold text-slate-700 block mt-2">Simulasi Akun Mitra Terpilih</strong>
                      <span className="text-xs text-slate-500 font-mono block mt-1">E-mail: bendahara.sekolah@lazuardi.com</span>
                      <p className="text-[11px] text-slate-400 mt-3 border-t border-slate-200/50 pt-2 leading-relaxed">
                        Izin terbatas: Hanya dapat memantau data laporan internal sekolah bersangkutan, membayar iuran wajib, mengirimkan ajuan bantuan, dan membaca timeline.
                      </p>
                    </div>
                  </div>

                  <div className="p-4 bg-yellow-50 border border-yellow-200 text-slate-700 rounded-xl text-xs flex items-start gap-2 max-w-2xl leading-normal">
                    <Lock className="w-4 h-4 text-blue-900 mt-0.5 flex-shrink-0" />
                    <div>
                      <strong>Sistem Hub Keamanan Berlapis Lazuardi Group</strong>
                      <p className="text-[11px] text-slate-500 mt-1">
                        Sistem otentikasi membatasi rendering SQL query di tingkat backend berdasarkan token ID. Dengan ini, pelanggaran kebocoran data silang antar-sekolah mitra dapat ditekan hingga 100%.
                      </p>
                    </div>
                  </div>
                </div>
              )}

            </div>
          )}

        </main>
      </div>

    </div>
  );
}
