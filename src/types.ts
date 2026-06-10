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

export interface PartnerRequest {
  id: string;
  sekolahMitra: string;
  tipeRequest: "Dana BOS" | "Fasilitas" | "Pendampingan Kurikulum" | "Lainnya";
  deskripsi: string;
  tanggal: string;
  statusApproved: "Setuju" | "Menunggu" | "Ditolak";
}

export interface EventTracker {
  id: string;
  namaEvent: string;
  tanggal: string;
  sekolahMitra: string; // "Semua" or a specific school
  kategori: "Audit" | "Rapat Kurikulum" | "Bimtek" | "Lainnya";
  deskripsi: string;
}

