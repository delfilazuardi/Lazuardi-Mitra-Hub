import React, { useState, useEffect, useMemo } from "react";
import { ReportRecord, DashboardStats, UserSession, Invoice, PartnerRequest, EventTracker, KPIMitra, KPIActivity } from "./types";
import { fallbackReports, fallbackKPIs } from "./fallbackData";
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
import MitraComplianceTracker from "./components/MitraComplianceTracker";
import UserManagement from "./components/UserManagement";
import CategoryManagement from "./components/CategoryManagement";
import KPIMitraView from "./components/KPIMitraView";
import SidebarModulesSummary from "./components/SidebarModulesSummary";
import { translations } from "./utils/translations";
import { getInvoiceYear, getInvoiceAcademicYear } from "./utils/invoiceHelpers";
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
  UserCheck,
  Link2,
  Award,
  Sliders
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

export default function App() {
  // Language support ('id' | 'en')
  const [lang, setLang] = useState<"id" | "en">(() => {
    const saved = localStorage.getItem("laz_lang");
    return (saved === "en" || saved === "id") ? saved : "id";
  });

  const t = translations[lang];

  // Authentication & session state
  const [session, setSession] = useState<UserSession | null>(null);

  // Sidebar navigation tabs
  const [activeTab, setActiveTab] = useState<string>("overview");

  // Mobile sidebar open/close state
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  // Core records & syncing
  const [records, setRecords] = useState<ReportRecord[]>([]);
  const [source, setSource] = useState<"live" | "fallback" | "loading">("loading");
  const [selectedSchool, setSelectedSchool] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  // Users state
  const [users, setUsers] = useState<any[]>(() => {
    const saved = localStorage.getItem("laz_users");
    const savedCustom = localStorage.getItem("laz_custom_users");
    
    const baseUsers = saved ? JSON.parse(saved) : [
      {
        id: "usr-1",
        username: "Pusat Lazuardi",
        email: "admin@lazuardi.com",
        role: "admin",
        password: "admin123"
      },
      {
        id: "usr-2",
        username: "Bendahara SMA Lazuardi",
        email: "bendahara.smalazuardi@lazuardi.com",
        role: "sekolah_mitra",
        sekolahName: "SMA Lazuardi",
        password: "mitra123"
      },
      {
        id: "usr-3",
        username: "Bendahara Al-Falah Depok",
        email: "bendahara.al-falahdepok@lazuardi.com",
        role: "sekolah_mitra",
        sekolahName: "Al-Falah Depok",
        password: "mitra123"
      },
      {
        id: "usr-4",
        username: "Bendahara Cordova",
        email: "bendahara.cordova@lazuardi.com",
        role: "sekolah_mitra",
        sekolahName: "Cordova",
        password: "mitra123"
      },
      {
        id: "usr-5",
        username: "Bendahara Haura",
        email: "bendahara.haura@lazuardi.com",
        role: "sekolah_mitra",
        sekolahName: "Haura",
        password: "mitra123"
      },
      {
        id: "usr-6",
        username: "Bendahara Ibnu Sina",
        email: "bendahara.ibnusina@lazuardi.com",
        role: "sekolah_mitra",
        sekolahName: "Ibnu Sina",
        password: "mitra123"
      }
    ];

    const customList = savedCustom ? JSON.parse(savedCustom) : [];
    const merged = [...baseUsers];
    customList.forEach((cUser: any) => {
      if (!merged.some(u => u.email?.toLowerCase() === cUser.email?.toLowerCase())) {
        merged.push(cUser);
      }
    });
    return merged;
  });

  // Dynamic Categories
  const [requestCategories, setRequestCategories] = useState<string[]>(() => {
    const saved = localStorage.getItem("laz_request_categories");
    return saved ? JSON.parse(saved) : ["Dana BOS", "Fasilitas", "Pendampingan Kurikulum", "Lainnya"];
  });

  const [eventCategories, setEventCategories] = useState<string[]>(() => {
    const saved = localStorage.getItem("laz_event_categories");
    return saved ? JSON.parse(saved) : ["Audit", "Rapat Kurikulum", "Bimtek", "Lainnya"];
  });

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

  const [kpis, setKpis] = useState<KPIMitra[]>(() => {
    const saved = localStorage.getItem("laz_kpis");
    return saved ? JSON.parse(saved) : fallbackKPIs;
  });

  const [overviewYear, setOverviewYear] = useState<string>("Semua");
  const [overviewAcademicYear, setOverviewAcademicYear] = useState<string>("Semua");

  // Google OAuth & Sheets Integration state
  const [googleToken, setGoogleToken] = useState<string | null>(() => {
    return localStorage.getItem("laz_google_token");
  });

  useEffect(() => {
    const hash = window.location.hash;
    if (hash && hash.includes("access_token=")) {
      const tokenMatch = hash.match(/access_token=([^&]+)/);
      if (tokenMatch && tokenMatch[1]) {
        const token = tokenMatch[1];
        setGoogleToken(token);
        localStorage.setItem("laz_google_token", token);
        // Trim hash securely to keep clean url
        window.history.replaceState(null, "", window.location.pathname + window.location.search);
      }
    }
  }, []);

  const handleGoogleLogin = () => {
    const clientId = (import.meta as any).env.VITE_GOOGLE_CLIENT_ID || "64005f6b-002e-47ab-91bb-5b70fdd2277b"; // From provisioned platform resources or config
    const scope = "https://www.googleapis.com/auth/spreadsheets";
    const redirectUri = window.location.origin;
    const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=token&scope=${encodeURIComponent(scope)}`;
    window.location.href = authUrl;
  };

  const handleDisconnectGoogle = () => {
    setGoogleToken(null);
    localStorage.removeItem("laz_google_token");
  };

  // Generic write back to Google Spreadsheet via server-side OAuth gateway
  const writeToSpreadsheet = async (sheetName: string, values: any[][]) => {
    if (!googleToken) {
      console.log(`No Google token found. Addition saved locally, connect Google Sheets to sync dynamically.`);
      return false;
    }

    try {
      const response = await fetch("/api/write-sheet", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${googleToken}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ sheetName, values })
      });

      const json = await response.json();
      if (json.success) {
        console.log(`Successfully appended dynamic row to Google Sheet tab: [${sheetName}]!`);
        // Refresh local cache representation to see the newly pulled spreadsheet row
        setTimeout(() => syncAllData(), 1200);
        return true;
      } else {
        console.warn("Failed to synchronize addition to Google Spreadsheet:", json.error);
        return false;
      }
    } catch (err) {
      console.error("Failed to connect write gateway API:", err);
      return false;
    }
  };

  // Save changes to cache
  useEffect(() => {
    localStorage.setItem("laz_lang", lang);
  }, [lang]);

  useEffect(() => {
    localStorage.setItem("laz_users", JSON.stringify(users));
  }, [users]);

  useEffect(() => {
    localStorage.setItem("laz_request_categories", JSON.stringify(requestCategories));
  }, [requestCategories]);

  useEffect(() => {
    localStorage.setItem("laz_event_categories", JSON.stringify(eventCategories));
  }, [eventCategories]);

  useEffect(() => {
    localStorage.setItem("laz_invoices", JSON.stringify(invoices));
  }, [invoices]);

  useEffect(() => {
    localStorage.setItem("laz_requests", JSON.stringify(requests));
  }, [requests]);

  useEffect(() => {
    localStorage.setItem("laz_events", JSON.stringify(events));
  }, [events]);

  useEffect(() => {
    localStorage.setItem("laz_kpis", JSON.stringify(kpis));
  }, [kpis]);

  // Syncing reports, invoices, requests, and login users list from Excel live streams!
  const syncAllData = async () => {
    setRefreshing(true);
    try {
      // 1. Fetch compliance reports
      const reportsRes = await fetch("/api/reports");
      const reportsJson = await reportsRes.json();
      if (reportsJson.success && reportsJson.data) {
        setRecords(reportsJson.data);
        setSource(reportsJson.source);
      } else {
        setRecords(fallbackReports);
        setSource("fallback");
      }

      // 2. Fetch invoices
      const invoicesRes = await fetch("/api/invoices");
      const invoicesJson = await invoicesRes.json();
      if (invoicesJson.success && invoicesJson.data) {
        setInvoices(invoicesJson.data);
      }

      // 3. Fetch requests
      const requestsRes = await fetch("/api/requests");
      const requestsJson = await requestsRes.json();
      if (requestsJson.success && requestsJson.data) {
        setRequests(requestsJson.data);
      }

      // 4. Fetch dynamic LOGIN accounts list
      const usersRes = await fetch("/api/users-sync");
      const usersJson = await usersRes.json();
      if (usersJson.success && usersJson.data && usersJson.data.length > 0) {
        const savedCustom = localStorage.getItem("laz_custom_users");
        const customList = savedCustom ? JSON.parse(savedCustom) : [];
        const fetchedList = usersJson.data;
        const merged = [...fetchedList];
        
        customList.forEach((cUser: any) => {
          if (!merged.some(f => f.email?.toLowerCase() === cUser.email?.toLowerCase())) {
            merged.push(cUser);
          }
        });
        setUsers(merged);
      }

      // 5. Fetch KPIs
      const kpiRes = await fetch("/api/kpis");
      const kpiJson = await kpiRes.json();
      if (kpiJson.success && kpiJson.data) {
        setKpis(kpiJson.data);
      }
    } catch (err) {
      console.error("Gagal melakukan sinkronisasi data dengan Google Sheet:", err);
      setRecords(fallbackReports);
      setSource("fallback");
    } finally {
      setTimeout(() => setRefreshing(false), 500);
    }
  };

  useEffect(() => {
    syncAllData();
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
        totalAfiliasi: 0,
        totalLaporanKirim: 0,
        totalLaporanBelumKirim: 0,
        totalSelesai: 0,
        totalRevisi: 0,
        totalBelumAudit: 0,
        persentaseKirim: 0,
      };
    }

    const uniqueSchools: string[] = Array.from(new Set(targetSource.map((r) => r.sekolahMitra)));
    const PARTNER_LIST = ["Al-Falah Depok", "Al-Falah Klaten", "Athaillah", "Cordova", "Haura", "Kamila", "Ideal", "Tursina", "Ibnu Sina"];
    const AFFILIATE_LIST = ["SMA Lazuardi"];

    let totalMitra = uniqueSchools.filter(s => PARTNER_LIST.includes(s)).length;
    let totalAfiliasi = uniqueSchools.filter(s => AFFILIATE_LIST.includes(s)).length;

    if (session?.role !== "admin") {
      const activeSchool = session?.sekolahName || "";
      totalMitra = PARTNER_LIST.includes(activeSchool) ? 1 : 0;
      totalAfiliasi = AFFILIATE_LIST.includes(activeSchool) ? 1 : 0;
    }

    const totalLaporanKirim = targetSource.filter((r) => r.statusLaporan === "Sudah Kirim").length;
    const totalLaporanBelumKirim = targetSource.filter((r) => r.statusLaporan === "Belum Kirim").length;
    const totalSelesai = targetSource.filter((r) => r.statusAudit === "Selesai").length;
    const totalRevisi = targetSource.filter((r) => r.statusAudit === "Revisi").length;
    const totalBelumAudit = targetSource.filter((r) => r.statusAudit === "Belum Diaudit").length;

    const relevantSlots = totalLaporanKirim + totalLaporanBelumKirim;
    const persentaseKirim = relevantSlots > 0 ? Math.round((totalLaporanKirim / relevantSlots) * 100) : 0;

    return {
      totalMitra,
      totalAfiliasi,
      totalLaporanKirim,
      totalLaporanBelumKirim,
      totalSelesai,
      totalRevisi,
      totalBelumAudit,
      persentaseKirim,
    };
  }, [isolatedRecords, session]);

  // Filter overview records by Year and Academic Year dynamically
  const filteredOverviewRecords = useMemo(() => {
    let list = isolatedRecords;
    
    // Apply overviewYear filter if not "Semua"
    if (overviewYear !== "Semua") {
      const targetYear = parseInt(overviewYear);
      list = list.filter((r) => r.tahun === targetYear);
    }
    
    // Apply overviewAcademicYear filter if not "Semua"
    if (overviewAcademicYear !== "Semua") {
      const [startYrStr, endYrStr] = overviewAcademicYear.split("/");
      const startYear = parseInt(startYrStr);
      const endYear = parseInt(endYrStr);
      
      const firstSemesterMonths = ["Juli", "Agustus", "September", "Oktober", "November", "Desember"];
      const secondSemesterMonths = ["Januari", "Februari", "Maret", "April", "Mei", "Juni"];
      
      list = list.filter((r) => {
        if (r.tahun === startYear && firstSemesterMonths.includes(r.bulan)) return true;
        if (r.tahun === endYear && secondSemesterMonths.includes(r.bulan)) return true;
        return false;
      });
    }
    
    return list;
  }, [isolatedRecords, overviewYear, overviewAcademicYear]);

  // Filter overview invoices by Year and Academic Year dynamically
  const filteredOverviewInvoices = useMemo(() => {
    let list = invoices;
    if (overviewYear !== "Semua") {
      const yr = parseInt(overviewYear);
      list = list.filter((i) => getInvoiceYear(i) === yr);
    }
    if (overviewAcademicYear !== "Semua") {
      list = list.filter((i) => getInvoiceAcademicYear(i) === overviewAcademicYear);
    }
    return list;
  }, [invoices, overviewYear, overviewAcademicYear]);

  // Filter overview events by Year and Academic Year dynamically
  const filteredOverviewEvents = useMemo(() => {
    let list = events;
    if (overviewYear !== "Semua") {
      list = list.filter((e) => String(e.tahun) === overviewYear);
    }
    if (overviewAcademicYear !== "Semua") {
      const [startYrStr, endYrStr] = overviewAcademicYear.split("/");
      list = list.filter((e) => String(e.tahun) === startYrStr || String(e.tahun) === endYrStr);
    }
    return list;
  }, [events, overviewYear, overviewAcademicYear]);

  // Compute overview-specific stats based on filtered overview records
  const overviewStats: DashboardStats = useMemo(() => {
    const targetSource = filteredOverviewRecords;
    if (targetSource.length === 0) {
      return {
        totalMitra: 0,
        totalAfiliasi: 0,
        totalLaporanKirim: 0,
        totalLaporanBelumKirim: 0,
        totalSelesai: 0,
        totalRevisi: 0,
        totalBelumAudit: 0,
        persentaseKirim: 0,
      };
    }

    const uniqueSchools = Array.from(new Set(targetSource.map((r) => r.sekolahMitra)));
    const PARTNER_LIST = ["Al-Falah Depok", "Al-Falah Klaten", "Athaillah", "Cordova", "Haura", "Kamila", "Ideal", "Tursina", "Ibnu Sina"];
    const AFFILIATE_LIST = ["SMA Lazuardi"];

    // Admin dashboard shows all 9 and 1 respectively as the total capacity domains
    let totalMitra = PARTNER_LIST.length; 
    let totalAfiliasi = AFFILIATE_LIST.length;

    if (session?.role !== "admin") {
      const activeSchool = session?.sekolahName || "";
      totalMitra = PARTNER_LIST.includes(activeSchool) ? 1 : 0;
      totalAfiliasi = AFFILIATE_LIST.includes(activeSchool) ? 1 : 0;
    }

    const totalLaporanKirim = targetSource.filter((r) => r.statusLaporan === "Sudah Kirim").length;
    const totalLaporanBelumKirim = targetSource.filter((r) => r.statusLaporan === "Belum Kirim").length;
    const totalSelesai = targetSource.filter((r) => r.statusAudit === "Selesai").length;
    const totalRevisi = targetSource.filter((r) => r.statusAudit === "Revisi").length;
    const totalBelumAudit = targetSource.filter((r) => r.statusAudit === "Belum Diaudit").length;

    const relevantSlots = totalLaporanKirim + totalLaporanBelumKirim;
    const persentaseKirim = relevantSlots > 0 ? Math.round((totalLaporanKirim / relevantSlots) * 100) : 0;

    return {
      totalMitra,
      totalAfiliasi,
      totalLaporanKirim,
      totalLaporanBelumKirim,
      totalSelesai,
      totalRevisi,
      totalBelumAudit,
      persentaseKirim,
    };
  }, [filteredOverviewRecords, session]);

  // Mutation handlers passed to sub-modules
  const handleUpdateInvoiceStatus = (id: string, newStatus: "Lunas" | "Belum Lunas") => {
    setInvoices((prev) =>
      prev.map((inv) => (inv.id === id ? { ...inv, statusPay: newStatus } : inv))
    );
  };

  const handleCreateReport = (
    bulan: string,
    tahun: number,
    sekolahMitra: string,
    statusLaporan: "Sudah Kirim" | "Belum Kirim",
    statusAudit: "Selesai" | "Revisi" | "Belum Diaudit" | "-"
  ) => {
    const tglStr = statusLaporan === "Sudah Kirim" ? new Date().toLocaleDateString("id-ID", { day: "2-digit", month: "short", year: "numeric" }).replace(/\s/g, "-") : "";
    const newRecord: ReportRecord = {
      id: `rep-${Date.now()}`,
      bulan,
      tahun,
      sekolahMitra,
      tanggalKirim: tglStr,
      statusLaporan,
      statusAudit
    };
    setRecords((prev) => [newRecord, ...prev]);

    // Push back dynamically to Google Sheet
    writeToSpreadsheet("LAPORAN BULANAN", [
      [ bulan, tahun, sekolahMitra, tglStr, statusLaporan, statusAudit ]
    ]);
  };

  const handleCreateInvoice = (
    invoiceNumber: string,
    sekolahMitra: string,
    jumlah: number,
    tanggal: string,
    statusPay: "Lunas" | "Belum Lunas",
    deskripsi: string
  ) => {
    const newInv: Invoice = {
      id: `inv-${Date.now()}`,
      invoiceNumber,
      sekolahMitra,
      jumlah,
      tanggal,
      statusPay,
      deskripsi
    };
    setInvoices((prev) => [newInv, ...prev]);

    // Push back dynamically to Google Sheet
    // Columns: Invoice, Sekolah Mitra, Bulan , Tahun, Status Invoice, Tanggal Kirim, Tanggal Bayar , Tagihan Full, Tagihan Realisasi , Pembayaran, Status Payment
    writeToSpreadsheet("INV & PAYMENT FF", [
      [ invoiceNumber, sekolahMitra, "Manual Input", 2026, "TERKIRIM", tanggal, "", jumlah, jumlah, statusPay === "Lunas" ? jumlah : "", statusPay === "Lunas" ? "LUNAS" : "MENUNGGAK" ]
    ]);
  };

  const handleCreateRequest = (
    tipe: string,
    deskripsi: string,
    items?: any[],
    targetSchool?: string
  ) => {
    if (!session) return;
    const defaultSchool = session.role === "admin" ? (targetSchool || "SMA Lazuardi") : (session.sekolahName || "SMA Lazuardi");
    const tglToday = new Date().toLocaleDateString("id-ID", { day: "2-digit", month: "short", year: "numeric" }).replace(/\s/g, "-");
    const newReq: PartnerRequest = {
      id: `req-${Date.now()}`,
      sekolahMitra: defaultSchool,
      tipeRequest: tipe,
      deskripsi: deskripsi,
      tanggal: tglToday,
      statusApproved: session.role === "admin" ? "Setuju" : "Menunggu",
      items: items
    };
    setRequests((prev) => [newReq, ...prev]);

    // Push back dynamically to Google Sheet
    // Columns: Sekolah, Request, Tanggal Masuk, Tanggal Selesai, Status, Tipe
    writeToSpreadsheet("REQUEST MITRA", [
      [ defaultSchool, deskripsi, tglToday, "", session.role === "admin" ? "Setuju" : "Menunggu", tipe ]
    ]);
  };

  const handleUpdateRequestStatus = (id: string, newStatus: "Setuju" | "Ditolak") => {
    setRequests((prev) =>
      prev.map((req) => (req.id === id ? { ...req, statusApproved: newStatus } : req))
    );
  };

  const handleCreateKPI = (newKpiData: Omit<KPIMitra, "id" | "progress">) => {
    const kpiId = `kpi-${newKpiData.idKpi.replace(/\./g, "-")}-${Date.now()}`;
    const progressRate = newKpiData.target > 0 ? Math.round((newKpiData.realisasi / newKpiData.target) * 100) : 0;
    const finalKpi: KPIMitra = {
      ...newKpiData,
      id: kpiId,
      progress: progressRate > 100 ? 100 : progressRate
    };
    setKpis((prev) => [finalKpi, ...prev]);

    // Push back dynamically to Google Sheet KPI MITRA
    writeToSpreadsheet("KPI MITRA", [
      [
        newKpiData.idKpi,
        newKpiData.kategori,
        newKpiData.kpi,
        newKpiData.program,
        newKpiData.target,
        newKpiData.realisasi,
        newKpiData.satuan,
        `${progressRate}%`,
        newKpiData.tahunAjaran
      ]
    ]);
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

  const handleUpdateEvent = (
    id: string,
    namaEvent: string,
    tanggal: string,
    sekolahMitra: string,
    kategori: "Audit" | "Rapat Kurikulum" | "Bimtek" | "Lainnya",
    deskripsi: string
  ) => {
    setEvents((prev) =>
      prev.map((evt) =>
        evt.id === id ? { ...evt, namaEvent, tanggal, sekolahMitra, kategori, deskripsi } : evt
      )
    );
  };

  const handleDeleteEvent = (id: string) => {
    setEvents((prev) => prev.filter((evt) => evt.id !== id));
  };

  const handleAddUser = (newUser: any) => {
    // 1. Update state
    setUsers((prev) => {
      if (prev.some(u => u.email?.toLowerCase() === newUser.email?.toLowerCase())) {
        return prev;
      }
      return [...prev, newUser];
    });

    // 2. Persist in local storage
    const savedCustom = localStorage.getItem("laz_custom_users");
    const customList = savedCustom ? JSON.parse(savedCustom) : [];
    if (!customList.some((u: any) => u.email?.toLowerCase() === newUser.email?.toLowerCase())) {
      const updatedCustom = [...customList, newUser];
      localStorage.setItem("laz_custom_users", JSON.stringify(updatedCustom));
    }

    // 3. Write back of row to the Google Spreadsheet sheet: "LOGIN" if token exists
    // Headers: ID User, Nama, Email,  Password , Role, Akses, Status
    const extRole = newUser.role === "admin" ? "Officer" : "Bendahara";
    const extAccess = newUser.sekolahName || "";
    writeToSpreadsheet("LOGIN", [
      [ newUser.id, newUser.username, newUser.email, newUser.password, extRole, extAccess, "Aktif" ]
    ]);
  };

  const handleEditUser = (id: string, updated: any) => {
    setUsers((prev) => prev.map((u) => (u.id === id ? updated : u)));

    const savedCustom = localStorage.getItem("laz_custom_users");
    if (savedCustom) {
      const customList = JSON.parse(savedCustom);
      const updatedCustom = customList.map((u: any) => (u.id === id ? updated : u));
      localStorage.setItem("laz_custom_users", JSON.stringify(updatedCustom));
    }
  };

  const handleDeleteUser = (id: string) => {
    setUsers((prev) => prev.filter((u) => u.id !== id));

    const savedCustom = localStorage.getItem("laz_custom_users");
    if (savedCustom) {
      const customList = JSON.parse(savedCustom);
      const updatedCustom = customList.filter((u: any) => u.id !== id);
      localStorage.setItem("laz_custom_users", JSON.stringify(updatedCustom));
    }
  };

  // If user is not logged in, prompt the Login Screen beautifully
  if (!session) {
    return (
      <LoginScreen
        onLoginSuccess={handleLogin}
        schools={schoolList}
        users={users}
        lang={lang}
        onLangChange={setLang}
        onUpdateUserPassword={(userId, newPass) => {
          setUsers((prev) =>
            prev.map((u) => (u.id === userId ? { ...u, password: newPass } : u))
          );
        }}
      />
    );
  }

  // Side bar Navigation items with icons, filtered by Roles
  const navigationItems = [
    {
      id: "overview",
      label: t.overview,
      icon: LayoutDashboard,
      adminOnly: false,
    },
    {
      id: "reports",
      label: t.reports,
      icon: FileSpreadsheet,
      adminOnly: false,
    },
    {
      id: "invoices",
      label: t.invoices,
      icon: Receipt,
      adminOnly: false,
    },
    {
      id: "requests",
      label: t.requests,
      icon: MessageSquare,
      adminOnly: false,
    },
    {
      id: "events",
      label: t.events,
      icon: Calendar,
      adminOnly: false,
    },
    {
      id: "kpis",
      label: t.kpiMitra || "KPI Mitra",
      icon: Award,
      adminOnly: false,
    },
    {
      id: "users",
      label: t.users,
      icon: Users,
      adminOnly: true,
    },
    {
      id: "categories",
      label: t.categories,
      icon: Layers,
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
            {lang === "id" ? "Keluar" : "Logout"}
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
              {t.offlineStableText}
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
                  {activeTab === "overview" && (lang === "id" ? "Dashboard Monitoring" : "Monitoring Dashboard")}
                  {activeTab === "reports" && (lang === "id" ? "Kelengkapan Laporan Bulanan" : "Monthly Report Status")}
                  {activeTab === "invoices" && (lang === "id" ? "Invoice & Pembayaran" : "Invoices & Payments")}
                  {activeTab === "requests" && (lang === "id" ? "Aspirasi & Request Mitra" : "Partner Wishes & Requests")}
                  {activeTab === "events" && (lang === "id" ? "Sistem Kalender Audit & Bimtek" : "Audit & Technical Guidance Calendar")}
                  {activeTab === "users" && (lang === "id" ? "Kelola Kredensial & Pengguna" : "User Security & Accounts")}
                  {activeTab === "categories" && (lang === "id" ? "Kelola Kategori & Klasifikasi" : "Category Configurations")}
                </h1>
                <span className="text-[10px] font-extrabold bg-blue-900 text-yellow-300 px-2 py-0.5 rounded-full border border-blue-900/30 uppercase tracking-wider">
                  {session.role === "admin" ? t.multiSchoolAccess : t.isolatedAccess}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-1 font-medium">
                {session.role === "admin" 
                  ? t.adminSub
                  : t.mitraSub.replace("{schoolName}", session.sekolahName || "")}
              </p>
            </div>

            <div className="flex items-center gap-2 flex-wrap self-start sm:self-auto">
              
              {/* Language Selector Toggle */}
              <div className="flex items-center bg-white border border-slate-200/80 rounded-xl p-0.5 shadow-xs mr-1">
                <button
                  type="button"
                  onClick={() => setLang("id")}
                  className={`text-[10px] font-extrabold px-2 py-1 rounded-lg transition-all cursor-pointer ${
                    lang === "id" ? "bg-blue-900 text-white shadow-xs font-extrabold" : "text-slate-500 hover:text-slate-800"
                  }`}
                  title="Bahasa Indonesia"
                >
                  ID
                </button>
                <button
                  type="button"
                  onClick={() => setLang("en")}
                  className={`text-[10px] font-extrabold px-2 py-1 rounded-lg transition-all cursor-pointer ${
                    lang === "en" ? "bg-blue-900 text-white shadow-xs font-extrabold" : "text-slate-500 hover:text-slate-800"
                  }`}
                  title="English Language"
                >
                  EN
                </button>
              </div>

              <a
                id="spreadsheet-external-link"
                href="https://docs.google.com/spreadsheets/d/1v0Z9ovWaR6e3B5VrxtIhJ-U9Sgy0ciybYmKxxcBr0HM/edit?gid=1734668151#gid=1734668151"
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-1.5 text-xs text-slate-600 bg-white hover:bg-slate-50 border border-slate-200/80 px-3.5 py-2 rounded-xl font-bold transition-all shadow-xs"
              >
                <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
                {t.spreadSheet}
                <ArrowUpRight className="w-3 h-3 opacity-60" />
              </a>

              {/* Google Sheets Connection Badge (Bidirectional Sync Indicator) */}
              {googleToken ? (
                <button
                  id="disconnect-google-btn"
                  onClick={handleDisconnectGoogle}
                  className="flex items-center gap-1.5 text-xs text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 px-3 py-2 rounded-xl font-bold transition-all shadow-xs"
                  title="Hubungan Google aktif. Klik untuk memutuskan koneksi."
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-xs font-bold text-emerald-800">SINKRON</span>
                </button>
              ) : (
                <button
                  id="connect-google-btn"
                  onClick={handleGoogleLogin}
                  className="flex items-center gap-1.5 text-xs text-slate-600 bg-white hover:bg-slate-100 border border-slate-200 px-3 py-2 rounded-xl font-bold transition-all shadow-xs"
                  title="Hubungkan Google Sheets untuk Sinkronisasi 2 Arah"
                >
                  <Link2 className="w-3.5 h-3.5 text-blue-600 animate-bounce" />
                  <span className="text-xs font-bold text-slate-700">Hubungkan Sheet</span>
                </button>
              )}

              <button
                id="sync-sheet-btn"
                onClick={syncAllData}
                disabled={refreshing || source === "loading"}
                className="p-2 hover:bg-slate-50 bg-white border border-slate-200/80 rounded-xl transition-all cursor-pointer text-slate-600 disabled:opacity-50 flex items-center gap-1.5 shadow-xs"
                title={t.syncText}
              >
                <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? "animate-spin text-blue-900" : ""}`} />
                <span className="text-xs font-bold hidden sm:inline">{t.sync}</span>
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
              
              {/* PAGE TAB 1 FILTER SYSTEM: YEAR & ACADEMIC YEAR (OVERVIEW FILTER BAR) */}
              {activeTab === "overview" && (
                <div className="bg-white border border-slate-200/80 rounded-3xl p-5 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-blue-50 text-blue-900 rounded-xl">
                      <Sliders className="w-5 h-5 text-blue-950" />
                    </div>
                    <div>
                      <h3 className="text-xs font-extrabold text-blue-950 uppercase tracking-wider">
                        {lang === "id" ? "Filter Dashboard Ringkasan" : "Summary Dashboard Filters"}
                      </h3>
                      <p className="text-[11px] text-slate-400">
                        {lang === "id" 
                          ? "Saring metrik & aktivitas berdasarkan tahun kalender atau periode tahun ajaran aktif Lazuardi."
                          : "Filter metrics & activities based on calendar year or active Lazuardi academic year cycle."}
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
                    {/* Year Selector Dropdown */}
                    <div className="bg-slate-50 border border-slate-205 py-1.5 px-3 rounded-2xl flex items-center gap-2 text-xs flex-1 sm:flex-initial">
                      <Calendar className="w-3.5 h-3.5 text-slate-500" />
                      <span className="font-bold text-slate-500">{lang === "id" ? "Tahun:" : "Year:"}</span>
                      <select
                        value={overviewYear}
                        onChange={(e) => setOverviewYear(e.target.value)}
                        className="font-extrabold text-blue-950 bg-transparent border-none focus:outline-none focus:ring-0 cursor-pointer text-xs"
                      >
                        <option value="Semua">{lang === "id" ? "Semua Tahun" : "All Years"}</option>
                        <option value="2022">2022</option>
                        <option value="2023">2023</option>
                        <option value="2024">2024</option>
                        <option value="2025">2025</option>
                        <option value="2026">2026</option>
                        <option value="2027">2027</option>
                      </select>
                    </div>

                    {/* Academic Year Selector Dropdown */}
                    <div className="bg-slate-50 border border-slate-205 py-1.5 px-3 rounded-2xl flex items-center gap-2 text-xs flex-1 sm:flex-initial">
                      <Award className="w-3.5 h-3.5 text-slate-500" />
                      <span className="font-bold text-slate-500">{lang === "id" ? "TA:" : "AY:"}</span>
                      <select
                        value={overviewAcademicYear}
                        onChange={(e) => setOverviewAcademicYear(e.target.value)}
                        className="font-extrabold text-blue-950 bg-transparent border-none focus:outline-none focus:ring-0 cursor-pointer text-xs"
                      >
                        <option value="Semua">{lang === "id" ? "Semua TA" : "All AY"}</option>
                        <option value="2022/2023">2022/2023</option>
                        <option value="2023/2024">2023/2024</option>
                        <option value="2024/2025">2024/2025</option>
                        <option value="2025/2026">2025/2026</option>
                        <option value="2026/2027">2026/2027</option>
                        <option value="2027/2028">2027/2028</option>
                      </select>
                    </div>
                  </div>
                </div>
              )}

              {/* PAGE TAB 1: OVERVIEW ANALYTICS (ADMIN ONLY) */}
              {activeTab === "overview" && session.role === "admin" && (
                <div className="space-y-6 animated-fade-in">
                  {/* Summary Metric Cards */}
                  <ReportStats stats={overviewStats} records={filteredOverviewRecords} session={session} lang={lang} />
                  
                  {/* Performance charts */}
                  <div className="bg-white border border-slate-200/80 p-6 rounded-3xl shadow-xs">
                    <h3 className="text-sm font-extrabold text-slate-900 mb-4">{lang === "id" ? "Tren Kepatuhan Bulanan" : "Monthly Compliance Trend"}</h3>
                    <ReportChart records={filteredOverviewRecords} />
                  </div>

                  {/* Detailed Interactive Compliance Matrix & Visual Analysis per School */}
                  <MitraComplianceTracker 
                    records={filteredOverviewRecords}
                    invoices={filteredOverviewInvoices}
                    events={filteredOverviewEvents}
                  />

                  {/* Sidebar Items Summary Center requested by user */}
                  <SidebarModulesSummary
                    session={session}
                    lang={lang}
                    records={records}
                    invoices={invoices}
                    requests={requests}
                    events={events}
                    kpis={kpis}
                    users={users}
                    requestCategoriesCount={requestCategories.length}
                    eventCategoriesCount={eventCategories.length}
                    onNavigate={(tabId) => setActiveTab(tabId)}
                  />

                  {/* AI Assistant & Controller Info Center placed at the BOTTOM */}
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start pt-4 border-t border-slate-100">
                    <div className="lg:col-span-2 space-y-6">
                      <AiAssistant records={filteredOverviewRecords} />
                    </div>
                    
                    <div className="space-y-6">
                      {/* Interactive Admin Helper tool */}
                      <div className="p-6 bg-blue-950 border border-yellow-400/10 text-white rounded-3xl relative overflow-hidden shadow-md">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-yellow-400/5 rounded-full blur-xl pointer-events-none" />
                        <h3 className="text-sm font-bold text-yellow-300">Pusat Informasi Pengawas</h3>
                        <p className="text-xs text-slate-300 leading-relaxed mt-2">
                          Gunakan menu samping untuk memantau detail tagihan keuangan, menyetujui ajuan request sarana BOS, serta membuat jadwal BIMTEK sertifikasi secara terpusat.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* PAGE TAB 1: BENCHMARKING COMPARISON (SEKOLAH MITRA ONLY) */}
              {activeTab === "overview" && session.role === "sekolah_mitra" && (
                <div className="space-y-6 animated-fade-in">
                  <MitraComparison
                    records={filteredOverviewRecords}
                    invoices={filteredOverviewInvoices}
                    events={filteredOverviewEvents}
                    session={session}
                  />

                  {/* Sidebar Items Summary Center requested by user */}
                  <SidebarModulesSummary
                    session={session}
                    lang={lang}
                    records={records}
                    invoices={invoices}
                    requests={requests}
                    events={events}
                    kpis={kpis}
                    users={users}
                    requestCategoriesCount={requestCategories.length}
                    eventCategoriesCount={eventCategories.length}
                    onNavigate={(tabId) => setActiveTab(tabId)}
                  />
                </div>
              )}

              {/* PAGE TAB 2: MONTHLY REPORTS TABLE & PERFORMANCE */}
              {activeTab === "reports" && (
                <div className="space-y-6 animated-fade-in">
                  {/* Simple stats localized to scope */}
                  <ReportStats stats={stats} records={isolatedRecords} session={session} lang={lang} />

                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
                    
                    {/* The Reports logs */}
                    <div className="lg:col-span-2 space-y-6">
                      <ReportTable
                        records={isolatedRecords}
                        schools={schoolList}
                        session={session}
                        onCreateReport={handleCreateReport}
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
                    schools={schoolList}
                    onUpdateInvoiceStatus={handleUpdateInvoiceStatus}
                    onCreateInvoice={handleCreateInvoice}
                  />
                </div>
              )}

              {/* PAGE TAB 4: REQUESTS MITRA */}
              {activeTab === "requests" && (
                <div className="animated-fade-in">
                  <RequestList
                    requests={requests}
                    session={session}
                    schools={schoolList}
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
                    onUpdateEvent={handleUpdateEvent}
                    onDeleteEvent={handleDeleteEvent}
                  />
                </div>
              )}

              {/* PAGE TAB 5b: KPI MITRA METRICS & SLIDERS */}
              {activeTab === "kpis" && (
                <div className="animated-fade-in">
                  <KPIMitraView
                    kpis={kpis}
                    session={session}
                    onAddKPI={handleCreateKPI}
                    lang={lang}
                    refreshing={refreshing}
                  />
                </div>
              )}

              {/* PAGE TAB 6: DYNAMIC USER MANAGEMENT PANEL (ADMIN ONLY) */}
              {activeTab === "users" && session.role === "admin" && (
                <div className="animated-fade-in">
                  <UserManagement
                    users={users}
                    schools={schoolList}
                    onAddUser={handleAddUser}
                    onEditUser={handleEditUser}
                    onDeleteUser={handleDeleteUser}
                    lang={lang}
                  />
                </div>
              )}

              {/* PAGE TAB 7: DYNAMIC CATEGORY CONFIGURATION (ADMIN ONLY) */}
              {activeTab === "categories" && session.role === "admin" && (
                <div className="animated-fade-in">
                  <CategoryManagement
                    requestCategories={requestCategories}
                    eventCategories={eventCategories}
                    onRequestCatChange={setRequestCategories}
                    onEventCatChange={setEventCategories}
                    lang={lang}
                  />
                </div>
              )}

            </div>
          )}

        </main>
      </div>

    </div>
  );
}
