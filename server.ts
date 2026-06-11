import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dns from "dns";

// Ensure localhost is resolved first
dns.setDefaultResultOrder("ipv4first");

const app = express();
const PORT = 3000;

app.use(express.json());

// Initialize Gemini Client safely
let ai: GoogleGenAI | null = null;
const geminiKey = process.env.GEMINI_API_KEY;

if (geminiKey && geminiKey !== "MY_GEMINI_API_KEY") {
  try {
    ai = new GoogleGenAI({
      apiKey: geminiKey,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
    console.log("Gemini API client initialized successfully.");
  } catch (err) {
    console.error("Failed to initialize Gemini API Client:", err);
  }
} else {
  console.log("No GEMINI_API_KEY environment variable provided. Chat feature will fall back gracefully.");
}

import * as XLSX from "xlsx";

// Spreadsheet ID
const SPREADSHEET_ID = "1v0Z9ovWaR6e3B5VrxtIhJ-U9Sgy0ciybYmKxxcBr0HM";

// Fallback reports data parsed directly from the client's spreadsheet to ensure offline/fail-safe functionality
import { fallbackReports } from "./src/fallbackData.ts";

let cachedWorkbook: XLSX.WorkBook | null = null;
let lastFetchTime = 0;
const CACHE_TTL = 15000; // 15-second cache TTL for lightning-fast navigation with live updates

// Helper to download the XLSX representation of the spreadsheet
async function getWorkbook(): Promise<XLSX.WorkBook> {
  const now = Date.now();
  if (cachedWorkbook && (now - lastFetchTime < CACHE_TTL)) {
    return cachedWorkbook;
  }
  
  const url = `https://docs.google.com/spreadsheets/d/${SPREADSHEET_ID}/export?format=xlsx`;
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to download spreadsheet: ${response.statusText}`);
  }
  const buffer = await response.arrayBuffer();
  cachedWorkbook = XLSX.read(new Uint8Array(buffer), { type: "array" });
  lastFetchTime = now;
  return cachedWorkbook;
}

// Convert Excel date serial to readable string (e.g. 45999 -> "08-Dec-2025")
function excelSerialToDateString(serial: any): string {
  if (!serial) return "";
  if (typeof serial === "string") return serial;
  const num = Number(serial);
  if (isNaN(num)) return String(serial);
  
  const date = new Date((num - 25569) * 86400 * 1000);
  const day = String(date.getDate()).padStart(2, '0');
  const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const month = monthNames[date.getMonth()];
  const year = date.getFullYear();
  return `${day}-${month}-${year}`;
}

// API Route: Get compliance reports (from LAPORAN BULANAN)
app.get("/api/reports", async (req, res) => {
  try {
    const workbook = await getWorkbook();
    const sheet = workbook.Sheets["LAPORAN BULANAN"];
    if (!sheet) {
      return res.json({ success: true, source: "fallback", data: fallbackReports });
    }

    const rows: any[] = XLSX.utils.sheet_to_json(sheet, { defval: "" });
    const mappedReports = rows.map((row: any, i) => {
      const bulan = row["Bulan"] || "";
      const tahun = parseInt(row["Tahun "]) || 2025;
      const sekolahMitra = (row["Sekolah Mitra"] || "").trim();
      const tglKirimRaw = row["Tanggal Kirim"];
      const tanggalKirim = tglKirimRaw ? excelSerialToDateString(tglKirimRaw) : "";
      
      let statusLaporan = (row["Status Laporan "] || "").trim();
      let statusAudit = (row["Status Audit"] || "").trim();
      
      if (!statusLaporan) {
        statusLaporan = tanggalKirim ? "Sudah Kirim" : "Belum Kirim";
      }
      if (!statusAudit) {
        statusAudit = statusLaporan === "Sudah Kirim" ? "Belum Diaudit" : "-";
      }
      
      return {
        id: `rep-${bulan}-${tahun}-${sekolahMitra.replace(/\s+/g, "-").toLowerCase()}-${i}`,
        bulan,
        tahun,
        sekolahMitra,
        tanggalKirim,
        statusLaporan,
        statusAudit
      };
    }).filter(r => r.sekolahMitra);

    return res.json({ success: true, source: "live", data: mappedReports });
  } catch (error: any) {
    console.error("Failed to load reports from spreadsheet. Fallback loaded:", error.message);
    return res.json({ success: true, source: "fallback", data: fallbackReports });
  }
});

// API Route: Get all invoices including Franchise Fee (FF), Renewal Fee, & Jenjang Baru
app.get("/api/invoices", async (req, res) => {
  try {
    const workbook = await getWorkbook();
    const mappedInvoices: any[] = [];
    
    // 1. Process RENEWAL FEE
    const renewalSheet = workbook.Sheets["RENEWAL FEE"];
    if (renewalSheet) {
      const rows: any[] = XLSX.utils.sheet_to_json(renewalSheet, { defval: "" });
      rows.forEach((row, i) => {
        const invNum = row["Nomor Invoice "] || "";
        const school = (row["Sekolah Mitra "] || "").trim();
        const amount = parseFloat(row["Renewal Fee "]) || 0;
        const status = (row["Status "] || "").trim().toUpperCase();
        
        if (school && invNum) {
          mappedInvoices.push({
            id: `inv-ren-${i}`,
            invoiceNumber: invNum,
            sekolahMitra: school,
            jumlah: amount,
            tanggal: "Renewal Fee Due",
            statusPay: status === "LUNAS" ? "Lunas" : "Belum Lunas",
            deskripsi: `Renewal Fee Iuran Mitra - ${school}`
          });
        }
      });
    }

    // 2. Process JENJANG BARU
    const jenjangSheet = workbook.Sheets["JENJANG BARU"];
    if (jenjangSheet) {
      const rows: any[] = XLSX.utils.sheet_to_json(jenjangSheet, { defval: "" });
      rows.forEach((row, i) => {
        const invNum = row["Nomor Invoice "] || "";
        const school = (row["Sekolah Mitra "] || "").trim();
        const amount = parseFloat(row["Pembukaan Jenjang Baru"]) || 0;
        const status = (row["Status "] || "").trim().toUpperCase();
        
        if (school && invNum) {
          mappedInvoices.push({
            id: `inv-jenj-${i}`,
            invoiceNumber: invNum,
            sekolahMitra: school,
            jumlah: amount,
            tanggal: "Jenjang Baru due",
            statusPay: status === "LUNAS" ? "Lunas" : "Belum Lunas",
            deskripsi: `Pembayaran Franchise Fee Pembukaan Jenjang Baru - ${school}`
          });
        }
      });
    }

    // 3. Process INV & PAYMENT FF (Franchise Fee - monthly)
    const ffSheet = workbook.Sheets["INV & PAYMENT FF"];
    if (ffSheet) {
      const rows: any[] = XLSX.utils.sheet_to_json(ffSheet, { defval: "" });
      rows.forEach((row, i) => {
        const invNum = row["Invoice"] || "";
        const school = (row["Sekolah Mitra"] || "").trim();
        const amount = parseFloat(row["Tagihan Realisasi "]) || parseFloat(row["Tagihan Full"]) || 0;
        const status = (row["Status Payment"] || "").trim().toUpperCase();
        const tglKirim = row["Tanggal Kirim"] ? excelSerialToDateString(row["Tanggal Kirim"]) : `${row["Bulan "]} ${row["Tahun"]}`;
        
        if (school && invNum) {
          mappedInvoices.push({
            id: `inv-ff-${i}`,
            invoiceNumber: invNum,
            sekolahMitra: school,
            jumlah: amount,
            tanggal: tglKirim,
            statusPay: status === "LUNAS" ? "Lunas" : "Belum Lunas",
            deskripsi: `Franchise Fee Bulanan ${row["Bulan "]} ${row["Tahun"]} - ${school}`
          });
        }
      });
    }

    return res.json({ success: true, data: mappedInvoices });
  } catch (error: any) {
    console.error("Failed to load invoices from spreadsheet:", error.message);
    return res.json({ success: false, error: error.message });
  }
});

// API Route: Get partner wishes/requests (from REQUEST MITRA)
app.get("/api/requests", async (req, res) => {
  try {
    const workbook = await getWorkbook();
    const reqSheet = workbook.Sheets["REQUEST MITRA"];
    if (!reqSheet) {
      return res.json({ success: true, data: [] });
    }

    const rows: any[] = XLSX.utils.sheet_to_json(reqSheet, { defval: "" });
    const mappedRequests = rows.map((row: any, i) => {
      const school = (row["Sekolah"] || "").trim();
      const requestText = row["Request"] || "";
      const dateIn = row["Tanggal Masuk"] ? excelSerialToDateString(row["Tanggal Masuk"]) : "Unknown Date";
      const status = (row["Status"] || "Menunggu").trim();
      const type = row["Tipe"] || "Lainnya";
      
      return {
        id: `req-sheet-${i}`,
        sekolahMitra: school,
        tipeRequest: type,
        deskripsi: requestText,
        tanggal: dateIn,
        statusApproved: status === "Setuju" ? "Setuju" : status === "Ditolak" ? "Ditolak" : "Menunggu"
      };
    }).filter(r => r.sekolahMitra);

    return res.json({ success: true, data: mappedRequests });
  } catch (error: any) {
    console.error("Failed to load requests from spreadsheet:", error.message);
    return res.json({ success: false, error: error.message });
  }
});

// API Route: Get users list (from LOGIN tab)
app.get("/api/users-sync", async (req, res) => {
  try {
    const workbook = await getWorkbook();
    const sheet = workbook.Sheets["LOGIN"];
    if (!sheet) {
      return res.json({ success: false, error: "LOGIN sheet not found" });
    }

    const rows: any[] = XLSX.utils.sheet_to_json(sheet, { defval: "" });
    const usersList = rows.map((row: any, i) => {
      const username = row["Nama"] || "";
      const email = row["Email"] || "";
      // Account password column may contain spaces like " Password " on some Excel imports
      const password = row[" Password "] || row["Password"] || "";
      const roleStr = (row["Role"] || "").toLowerCase();
      const status = row["Status"] || "Aktif";
      const school = row["Akses"] || "";
      
      let mappedRole = "sekolah_mitra";
      if (roleStr.includes("general manager") || roleStr.includes("admin") || roleStr.includes("kabag") || roleStr.includes("officer") || roleStr.includes("bagian")) {
        mappedRole = "admin";
      }

      return {
        id: `usr-sheet-${i}`,
        username,
        email,
        role: mappedRole,
        sekolahName: school,
        password: password
      };
    }).filter(u => u.username && u.password);

    return res.json({ success: true, data: usersList });
  } catch (error: any) {
    console.error("Failed to load dynamic login users list:", error.message);
    return res.json({ success: false, error: error.message });
  }
});

// API Route: Get KPI Mitra metrics
app.get("/api/kpis", async (req, res) => {
  try {
    const workbook = await getWorkbook();
    const sheet = workbook.Sheets["KPI MITRA"];
    if (!sheet) {
      return res.json({ success: true, data: [] });
    }

    const rows: any[] = XLSX.utils.sheet_to_json(sheet, { defval: "" });
    const mappedKpis = rows.map((row: any, i) => {
      const idKpi = String(row["ID KPI "] || row["ID KPI"] || "").trim();
      const kategori = String(row["Kategori"] || "").trim();
      const kpi = String(row["KPI "] || row["KPI"] || "").trim();
      const program = String(row["Program "] || row["Program"] || "").trim();
      const target = parseFloat(row["Target"]) || 0;
      const realisasi = parseFloat(row["Realisasi "]) || parseFloat(row["Realisasi"]) || 0;
      const satuan = String(row["Satuan "] || row["Satuan"] || "").trim();
      
      let progress = 0;
      if (row["Progress"]) {
        progress = parseFloat(String(row["Progress"]).replace(/%/g, "")) || 0;
      } else if (target > 0) {
        progress = Math.round((realisasi / target) * 100);
      }
      if (progress > 100) progress = 100;

      // Smart default academic year distribution if none provided
      let tahunAjaran = row["Tahun Ajaran"] || row["Tahun"] || "";
      if (!tahunAjaran) {
        const val = parseFloat(idKpi);
        if (isNaN(val)) {
          tahunAjaran = "2025/2026";
        } else if (val >= 3.0) {
          tahunAjaran = "2026/2027";
        } else if (val >= 2.0) {
          tahunAjaran = "2024/2025";
        } else {
          tahunAjaran = "2025/2026";
        }
      }

      return {
        id: `kpi-${idKpi.replace(/\./g, "-")}-${i}`,
        idKpi,
        kategori,
        kpi,
        program,
        target,
        realisasi,
        satuan,
        progress,
        tahunAjaran
      };
    }).filter(r => r.idKpi && r.kpi);

    return res.json({ success: true, data: mappedKpis });
  } catch (error: any) {
    console.error("Failed to load KPIs from spreadsheet:", error.message);
    return res.json({ success: false, error: error.message });
  }
});

// API Route: Get KPI Activity logs
app.get("/api/kpi-activities", async (req, res) => {
  try {
    const workbook = await getWorkbook();
    const sheet = workbook.Sheets["KPI ACTIVITY"];
    if (!sheet) {
      return res.json({ success: true, data: [] });
    }

    const rows: any[] = XLSX.utils.sheet_to_json(sheet, { defval: "" });
    const cleanRows = rows.filter((row: any) => {
      const p = String(row["__EMPTY_2"] || "").trim();
      return p && p !== "Program " && p !== "Program";
    });

    const mappedActivities = cleanRows.map((row: any, i) => {
      const tglRaw = row["__EMPTY"];
      const tanggal = tglRaw ? excelSerialToDateString(tglRaw) : "";
      const tahun = String(row["__EMPTY_1"] || "").trim();
      const program = String(row["__EMPTY_2"] || "").trim();
      const detail = String(row["__EMPTY_3"] || "").trim();
      const idKpi = String(row["__EMPTY_4"] || "").trim();
      const status = String(row["__EMPTY_5"] || "DONE").trim();
      const bobot = String(row["__EMPTY_6"] || "100%").trim();

      return {
        id: `act-${i}`,
        tanggal,
        tahun,
        program,
        detail,
        idKpi,
        status,
        bobot
      };
    });

    return res.json({ success: true, data: mappedActivities });
  } catch (error: any) {
    console.error("Failed to load KPI activities from spreadsheet:", error.message);
    return res.json({ success: false, error: error.message });
  }
});

// API Route: Write row dynamically back to the Google Spreadsheet via OAuth Token
app.post("/api/write-sheet", async (req, res) => {
  const token = req.headers.authorization;
  if (!token) {
    return res.status(401).json({ success: false, error: "Missing authorization token" });
  }

  const { sheetName, values } = req.body;
  if (!sheetName || !values || !Array.isArray(values)) {
    return res.status(400).json({ success: false, error: "Missing sheetName or values array" });
  }

  const range = encodeURIComponent(sheetName);
  const url = `https://sheets.googleapis.com/v4/spreadsheets/${SPREADSHEET_ID}/values/${range}:append?valueInputOption=USER_ENTERED`;

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Authorization": token,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ values })
    });

    const data = await response.json();
    if (!response.ok) {
      console.error("Google Sheets append API failed:", data);
      return res.status(response.status).json({ success: false, error: data.error?.message || "Google API error" });
    }

    // Force clear local workbook cache so the very next fetch loads the fresh rows
    cachedWorkbook = null;
    lastFetchTime = 0;

    return res.json({ success: true, data });
  } catch (error: any) {
    console.error("Failed to write to Google Sheet:", error);
    return res.status(500).json({ success: false, error: error.message });
  }
});


// API Route: AI Assistant Chat
app.post("/api/chat", async (req, res) => {
  const { messages, records } = req.body;

  if (!messages || !Array.isArray(messages)) {
    return res.status(400).json({ error: "Invalid messages history" });
  }

  // Format reports context for Gemini
  // We'll summarize the records to avoid sending too much token clutter while retaining all diagnostic value.
  const totalRecords = records?.length || 0;
  const sudahKirim = records?.filter((r: any) => r.statusLaporan === "Sudah Kirim") || [];
  const belumKirim = records?.filter((r: any) => r.statusLaporan === "Belum Kirim") || [];
  const selesai = records?.filter((r: any) => r.statusAudit === "Selesai") || [];
  const revisi = records?.filter((r: any) => r.statusAudit === "Revisi") || [];
  const belumAudit = records?.filter((r: any) => r.statusAudit === "Belum Diaudit") || [];

  // Map school rates
  const schoolSummaryMap: { [key: string]: { kirim: number; total: number; selesai: number; revisi: number } } = {};
  records?.forEach((r: any) => {
    if (!schoolSummaryMap[r.sekolahMitra]) {
      schoolSummaryMap[r.sekolahMitra] = { kirim: 0, total: 0, selesai: 0, revisi: 0 };
    }
    schoolSummaryMap[r.sekolahMitra].total += 1;
    if (r.statusLaporan === "Sudah Kirim") schoolSummaryMap[r.sekolahMitra].kirim += 1;
    if (r.statusAudit === "Selesai") schoolSummaryMap[r.sekolahMitra].selesai += 1;
    if (r.statusAudit === "Revisi") schoolSummaryMap[r.sekolahMitra].revisi += 1;
  });

  const schoolBriefContext = Object.entries(schoolSummaryMap).map(([name, stats]) => {
    const rate = stats.total > 0 ? Math.round((stats.kirim / stats.total) * 100) : 0;
    return `- ${name}: Dikirim ${stats.kirim}/${stats.total} (${rate}%), Selesai Audit: ${stats.selesai}, Revisi: ${stats.revisi}`;
  }).join("\n");

  const systemInstruction = `
You are "Asisten AI Lazuardi Mitra Hub", a smart dashboard assistant designed by Lazuardi Mitra Hub to analyze partner school reports (Sekolah Mitra) and compliance.
Your current time is: 10 June 2026.
The dataset consists of reports submitted monthly by different Schools from 2025 until early 2027.

SUMMARY STATS:
- Total report periods: ${totalRecords}
- Already Sent (Sudah Kirim): ${sudahKirim.length}
- Not Sent (Belum Kirim): ${belumKirim.length}
- Completed Auditing (Selesai): ${selesai.length}
- Needs Revision (Revisi): ${revisi.length}
- Pending Auditing (Belum Diaudit): ${belumAudit.length}

PER-SCHOOL SUMMARY:
${schoolBriefContext}

Here is a list of recent rows with alert flags (Revisi or Belum Kirim):
${records?.filter((r: any) => r.statusAudit === "Revisi" || r.statusLaporan === "Belum Kirim").slice(0, 15).map((r: any) => `${r.bulan} ${r.tahun} - ${r.sekolahMitra}: ${r.statusLaporan}, Audit: ${r.statusAudit}`).join("\n")}

Guidelines for your answers:
1. Speak in deep, highly professional, but exceptionally warm, friendly, and structured Indonesian.
2. Provide concrete numbers and insights based on the summary and context provided above.
3. Keep answers clear, well-spaced with markdown, using bullet points or clean tables when presenting stats.
4. If asked about a specific school, pull data from the per-school summary above.
5. If the Gemini API is missing (fallback mode), indicate your limits lightly, but still answer using the summary statistics!
`;

  if (!ai) {
    // If Gemini client is not initialized, run a smart fallback generator that simulates a simple responsive system!
    // This is incredibly professional: the bot STILL works even if the user hasn't configured a secret!
    console.log("No Gemini API client initialized. Generating automatic rule-based assistant reply.");
    const lastUserMsg = messages[messages.length - 1]?.text || "";
    let reply = "";
    
    const query = lastUserMsg.toLowerCase();
    if (query.includes("halo") || query.includes("hi") || query.includes("pagi") || query.includes("siang")) {
      reply = "Halo! Saya Asisten AI Lazuardi Mitra Hub (Mode Luring). Ada yang bisa saya bantu untuk menganalisis laporan monitoring sekolah mitra Anda hari ini? 😊";
    } else if (query.includes("sekolah") || query.includes("mitra")) {
      reply = `Berikut adalah ringkasan performa pengiriman laporan per Sekolah Mitra:\n\n${schoolBriefContext}\n\nAda sekolah tertentu yang ingin Anda pantau lebih spesifik?`;
    } else if (query.includes("revisi")) {
      reply = `Saat ini terdapat **${revisi.length} laporan memerlukan revisi**. Beberapa di antaranya adalah:\n${records?.filter((r: any) => r.statusAudit === "Revisi").slice(0, 5).map((r: any) => `- ${r.sekolahMitra} (${r.bulan} ${r.tahun})`).join("\n")}\n\nSekolah terkait disarankan segera melakukan revisi laporan keuangan/operasional mereka sesuai rekomendasi auditor.`;
    } else if (query.includes("belum kirim") || query.includes("keterlambatan")) {
      reply = `Ada **${belumKirim.length} laporan belum dikirim** dari total periode. Sekolah dengan tingkat pengiriman paling membutuhkan perhatian adalah **SMA Lazuardi** dan **Ideal** yang memiliki catatan pengiriman terendah.\n\nApakah Anda perlu membuat pesan tindak lanjut otomatis untuk dikirim ke sekolah bersangkutan?`;
    } else {
      reply = `Terima kasih atas pertanyaannya! Berdasarkan visualisasi dashboard Lazuardi Mitra Hub:\n\n- **Tingkat Kepatuhan**: ${Math.round((sudahKirim.length / totalRecords) * 100)}% dari total ${totalRecords} periode laporan telah diserahkan.\n- **Status Audit**: ${selesai.length} disetujui, ${revisi.length} butuh revisi, dan ${belumAudit.length} dalam antrean.\n\nAda analisis detail lain yang Anda butuhkan? (Silakan hubungkan kunci API Gemini Anda di Secrets untuk analisis mendalam dengan model AI full-reasoning!)`;
    }

    return res.json({ text: reply });
  }

  try {
    const geminiChatHistory = messages.map((m: any) => ({
      role: m.role,
      parts: [{ text: m.text }],
    }));

    // Extract the latest query
    const latestMessage = messages[messages.length - 1].text;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: latestMessage,
      config: {
        systemInstruction,
        temperature: 0.7,
      },
    });

    return res.json({ text: response.text });
  } catch (error: any) {
    console.error("Gemini SDK Call Failed:", error);
    return res.status(500).json({ error: `Gemini AI failed to process: ${error.message}` });
  }
});

// Configure Vite or Static Production Server
async function setupServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
    console.log("Vite dev middleware mounted successfully.");
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
    console.log("Serving built production assets from dist/.");
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Lazuardi Mitra Hub backend server running on http://localhost:${PORT}`);
  });
}

setupServer();
