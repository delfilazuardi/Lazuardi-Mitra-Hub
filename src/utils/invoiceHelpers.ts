import { Invoice } from "../types";

/**
 * Extracts a numeric year from an invoice by scanning:
 * 1. An explicit 'tahun' property (if present)
 * 2. The invoice number (e.g. /2026/05/)
 * 3. The tanggal field (e.g., 12-May-2026)
 * 4. The description (e.g., Juni 2026)
 */
export function getInvoiceYear(inv: Invoice): number {
  if ((inv as any).tahun) {
    return Number((inv as any).tahun);
  }
  
  // Try to find a 4-digit year in invoiceNumber (e.g., INV/LAZ-HUB/2026/05/012)
  const invYearMatch = inv.invoiceNumber.match(/\b(202\d)\b/);
  if (invYearMatch) {
    return parseInt(invYearMatch[1]);
  }
  
  // Try to find a 4-digit year in tanggal (e.g., 12-May-2026)
  const dateYearMatch = inv.tanggal.match(/\b(202\d)\b/);
  if (dateYearMatch) {
    return parseInt(dateYearMatch[1]);
  }
  
  // Try to find a 4-digit year in deskripsi (e.g., Franchise Fee Bulanan Juni 2026)
  const descYearMatch = inv.deskripsi.match(/\b(202\d)\b/);
  if (descYearMatch) {
    return parseInt(descYearMatch[1]);
  }
  
  // Default fallback
  return 2026;
}

/**
 * Extracts a month name (Indonesian) from an invoice to support accurate academic year computation.
 */
export function getInvoiceMonthName(inv: Invoice): string {
  // Try matching month code inside invoiceNumber: e.g., INV/LAZ-HUB/2026/05/... -> "05" is May (Mei)
  const match = inv.invoiceNumber.match(/\/202\d\/(\d{2})\//);
  if (match) {
    const monthNum = parseInt(match[1]);
    const months = ["Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober", "November", "Desember"];
    if (monthNum >= 1 && monthNum <= 12) {
      return months[monthNum - 1];
    }
  }

  // Try matching month names in tanggal or deskripsi
  const engMonthsShort = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const idMonths = ["Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober", "November", "Desember"];
  
  const textToSearch = `${inv.tanggal} ${inv.deskripsi}`.toLowerCase();
  
  for (let i = 0; i < 12; i++) {
    const eng = engMonthsShort[i].toLowerCase();
    const id = idMonths[i].toLowerCase();
    if (textToSearch.includes(eng) || textToSearch.includes(id)) {
      return idMonths[i];
    }
  }

  return "Juni"; // Default middle month
}

/**
 * Derives the Academic Year (e.g. "2025/2026") based on the extracted year and month.
 */
export function getInvoiceAcademicYear(inv: Invoice): string {
  const year = getInvoiceYear(inv);
  const monthName = getInvoiceMonthName(inv);
  
  const firstSemesterMonths = ["Juli", "Agustus", "September", "Oktober", "November", "Desember"];
  
  if (firstSemesterMonths.includes(monthName)) {
    return `${year}/${year + 1}`;
  } else {
    return `${year - 1}/${year}`;
  }
}
