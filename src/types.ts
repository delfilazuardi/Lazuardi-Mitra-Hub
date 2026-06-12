export interface ReportRecord {
  id: string;
  bulan: string;
  tahun: number;
  sekolahMitra: string;
  tanggalKirim: string;
  statusLaporan: "Sudah Kirim" | "Belum Kirim";
  statusAudit: "Selesai" | "Revisi" | "Belum Diaudit" | "-";
}

export interface DashboardStats {
  totalMitra: number;
  totalAfiliasi?: number;
  totalLaporanKirim: number;
  totalLaporanBelumKirim: number;
  totalSelesai: number;
  totalRevisi: number;
  totalBelumAudit: number;
  persentaseKirim: number;
}

export interface SchoolHistory {
  sekolahMitra: string;
  totalSelesai: number;
  totalRevisi: number;
  totalBelumKirim: number;
  totalSudahKirim: number;
  submissionRate: number;
  records: ReportRecord[];
}

export interface ChatMessage {
  id: string;
  role: "user" | "model";
  text: string;
  timestamp: string;
}

export type UserRole = "admin" | "sekolah_mitra";

export interface UserSession {
  username: string;
  role: UserRole;
  sekolahName?: string; // If role is sekolah_mitra, this specifies which school
}

export interface Invoice {
  id: string;
  invoiceNumber: string;
  sekolahMitra: string;
  jumlah: number;
  tanggal: string;
  statusPay: "Lunas" | "Belum Lunas";
  deskripsi: string;
}

export interface RequestItem {
  id: string;
  namaItem: string;
  jumlah: number;
  catatan?: string;
}

export interface PartnerRequest {
  id: string;
  sekolahMitra: string;
  tipeRequest: string;
  deskripsi: string;
  tanggal: string;
  statusApproved: "Setuju" | "Menunggu" | "Ditolak";
  items?: RequestItem[];
}

export interface EventTracker {
  id: string;
  namaEvent: string;
  tanggal: string;
  sekolahMitra: string; // "Semua" or a specific school
  kategori: string;
  deskripsi: string;
}

export interface KPIMitra {
  id: string;
  idKpi: string;
  kategori: string;
  kpi: string;
  program: string;
  target: number;
  realisasi: number;
  satuan: string;
  progress: number;
  tahunAjaran: string;
}

export interface KPIActivity {
  id: string;
  tanggal: string;
  tahun: string;
  program: string;
  detail: string;
  idKpi: string;
  status: string;
  bobot: string;
}


