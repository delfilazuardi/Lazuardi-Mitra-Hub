import fetch from "node-fetch";
import * as XLSX from "xlsx";

function excelSerialToDateString(serial: any): string {
  if (!serial) return "";
  if (typeof serial === "string") return serial;
  const num = Number(serial);
  if (isNaN(num)) return String(serial);
  
  // Excel base date is 30-Dec-1899
  const date = new Date((num - 25569) * 86400 * 1000);
  const day = String(date.getDate()).padStart(2, '0');
  const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const month = monthNames[date.getMonth()];
  const year = date.getFullYear();
  return `${day}-${month}-${year}`;
}

async function run() {
  const spreadsheetId = "1v0Z9ovWaR6e3B5VrxtIhJ-U9Sgy0ciybYmKxxcBr0HM";
  const url = `https://docs.google.com/spreadsheets/d/${spreadsheetId}/export?format=xlsx`;
  
  try {
    const res = await fetch(url);
    const buffer = await res.arrayBuffer();
    const workbook = XLSX.read(new Uint8Array(buffer), { type: "array" });

    // 1. Parse MASTER MITRA to check
    const masterSheet = workbook.Sheets["MASTER MITRA"];
    const masterRows = XLSX.utils.sheet_to_json(masterSheet, { defval: "" });
    console.log("Master Mitra Count:", masterRows.length);

    // 2. Parse LAPORAN BULANAN
    const reportsSheet = workbook.Sheets["LAPORAN BULANAN"];
    const reportsRows: any[] = XLSX.utils.sheet_to_json(reportsSheet, { defval: "" });
    const mappedReports = reportsRows.map((row: any, i) => {
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

    console.log(`Parsed ${mappedReports.length} reports. Sample:`, mappedReports.slice(0, 2));

    // 3. Parse Invoices from INV & PAYMENT FF, RENEWAL FEE, and JENJANG BARU
    const mappedInvoices: any[] = [];
    
    // RENEWAL FEE
    const renewalSheet = workbook.Sheets["RENEWAL FEE"];
    if (renewalSheet) {
      const renewalRows: any[] = XLSX.utils.sheet_to_json(renewalSheet, { defval: "" });
      renewalRows.forEach((row, i) => {
        const invNum = row["Nomor Invoice "] || "";
        const school = (row["Sekolah Mitra "] || "").trim();
        const amount = parseFloat(row["Renewal Fee "]) || 0;
        const status = (row["Status "] || "").trim().toUpperCase();
        
        mappedInvoices.push({
          id: `inv-ren-${i}`,
          invoiceNumber: invNum,
          sekolahMitra: school,
          jumlah: amount,
          tanggal: "Renewal Session",
          statusPay: status === "LUNAS" ? "Lunas" : "Belum Lunas",
          deskripsi: `Renewal Fee Iuran Mitra - ${school}`
        });
      });
    }

    // JENJANG BARU
    const jenjangSheet = workbook.Sheets["JENJANG BARU"];
    if (jenjangSheet) {
      const jenjangRows: any[] = XLSX.utils.sheet_to_json(jenjangSheet, { defval: "" });
      jenjangRows.forEach((row, i) => {
        const invNum = row["Nomor Invoice "] || "";
        const school = (row["Sekolah Mitra "] || "").trim();
        const amount = parseFloat(row["Pembukaan Jenjang Baru"]) || 0;
        const status = (row["Status "] || "").trim().toUpperCase();
        
        mappedInvoices.push({
          id: `inv-jenj-${i}`,
          invoiceNumber: invNum,
          sekolahMitra: school,
          jumlah: amount,
          tanggal: "Pembukaan Jenjang",
          statusPay: status === "LUNAS" ? "Lunas" : "Belum Lunas",
          deskripsi: `Pembayaran Franchise Fee Pembukaan Jenjang Baru - ${school}`
        });
      });
    }

    // FF (Franchise Fee invoices)
    const ffSheet = workbook.Sheets["INV & PAYMENT FF"];
    if (ffSheet) {
      const ffRows: any[] = XLSX.utils.sheet_to_json(ffSheet, { defval: "" });
      ffRows.forEach((row, i) => {
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

    console.log(`Parsed ${mappedInvoices.length} invoices. Sample RENEWAL/JENJANG/FF:`, mappedInvoices.slice(0, 3));

    // 4. Parse Requests from REQUEST MITRA
    const reqSheet = workbook.Sheets["REQUEST MITRA"];
    const mappedRequests: any[] = [];
    if (reqSheet) {
      const reqRows: any[] = XLSX.utils.sheet_to_json(reqSheet, { defval: "" });
      reqRows.forEach((row: any, i) => {
        const school = (row["Sekolah"] || "").trim();
        const requestText = row["Request"] || "";
        const dateIn = row["Tanggal Masuk"] ? excelSerialToDateString(row["Tanggal Masuk"]) : "Unknown Date";
        const status = (row["Status"] || "Menunggu").trim();
        
        if (school) {
          mappedRequests.push({
            id: `req-sheet-${i}`,
            sekolahMitra: school,
            tipeRequest: "Lainnya",
            deskripsi: requestText,
            tanggal: dateIn,
            statusApproved: status === "Setuju" ? "Setuju" : status === "Ditolak" ? "Ditolak" : "Menunggu"
          });
        }
      });
    }
    console.log(`Parsed ${mappedRequests.length} requests.`);

  } catch (err: any) {
    console.error("Mapping failed:", err.message);
  }
}

run();
