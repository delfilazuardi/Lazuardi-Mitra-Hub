import { Invoice, PartnerRequest, EventTracker } from "./types";

export const mockInvoices: Invoice[] = [
  {
    id: "inv-001",
    invoiceNumber: "INV/LAZ-HUB/2026/05/012",
    sekolahMitra: "Al-Falah Depok",
    jumlah: 15450000,
    tanggal: "12-May-2026",
    statusPay: "Lunas",
    deskripsi: "Biaya Pendampingan Mutu Akademik & Audit Internal Triwulan II"
  },
  {
    id: "inv-002",
    invoiceNumber: "INV/LAZ-HUB/2026/05/013",
    sekolahMitra: "Al-Falah Klaten",
    jumlah: 8200000,
    tanggal: "15-May-2026",
    statusPay: "Lunas",
    deskripsi: "Lisensi Modul Digital & Evaluasi Kurikulum"
  },
  {
    id: "inv-003",
    invoiceNumber: "INV/LAZ-HUB/2026/05/014",
    sekolahMitra: "SMA Lazuardi",
    jumlah: 24500000,
    tanggal: "17-May-2026",
    statusPay: "Belum Lunas",
    deskripsi: "Biaya Kontribusi Sistem Informasi Lazuardi Hub & Sertifikasi Pendidik"
  },
  {
    id: "inv-004",
    invoiceNumber: "INV/LAZ-HUB/2026/05/015",
    sekolahMitra: "Athaillah",
    jumlah: 9500000,
    tanggal: "20-May-2026",
    statusPay: "Lunas",
    deskripsi: "Administrasi Supervisi Keuangan Non-BOS"
  },
  {
    id: "inv-005",
    invoiceNumber: "INV/LAZ-HUB/2026/05/016",
    sekolahMitra: "Cordova",
    jumlah: 11000000,
    tanggal: "22-May-2026",
    statusPay: "Belum Lunas",
    deskripsi: "Pelatihan Calon Pengawas & Audit Sistem Akuntansi Yayasan"
  },
  {
    id: "inv-006",
    invoiceNumber: "INV/LAZ-HUB/2026/05/017",
    sekolahMitra: "Kamila",
    jumlah: 6500000,
    tanggal: "25-May-2026",
    statusPay: "Lunas",
    deskripsi: "Pendampingan Tata Kelola Administrasi Pajak Lembaga"
  },
  {
    id: "inv-007",
    invoiceNumber: "INV/LAZ-HUB/2026/05/018",
    sekolahMitra: "Tursina",
    jumlah: 13200000,
    tanggal: "28-May-2026",
    statusPay: "Belum Lunas",
    deskripsi: "Bantuan Teknis Pengelolaan Kas Sekolah & Rekonsiliasi Bank"
  },
  {
    id: "inv-008",
    invoiceNumber: "INV/LAZ-HUB/2026/06/001",
    sekolahMitra: "Ibnu Sina",
    jumlah: 7800000,
    tanggal: "02-Jun-2026",
    statusPay: "Lunas",
    deskripsi: "Sertifikasi Mutu Penyelenggaraan Ujian Terintegrasi Lazuardi"
  },
  {
    id: "inv-009",
    invoiceNumber: "INV/LAZ-HUB/2026/06/002",
    sekolahMitra: "Ideal",
    jumlah: 10500000,
    tanggal: "05-Jun-2026",
    statusPay: "Belum Lunas",
    deskripsi: "Sewa Infrastruktur Digital Server & Cloud Lazuardi Hub Semester Genap"
  },
  {
    id: "inv-010",
    invoiceNumber: "INV/LAZ-HUB/2026/06/003",
    sekolahMitra: "Haura",
    jumlah: 5400000,
    tanggal: "07-Jun-2026",
    statusPay: "Lunas",
    deskripsi: "Bimtek Pelaporan Keuangan Dana Hibah Daerah"
  }
];

export const mockPartnerRequests: PartnerRequest[] = [
  {
    id: "req-001",
    sekolahMitra: "Al-Falah Depok",
    tipeRequest: "Dana BOS",
    deskripsi: "Permintaan dispensasi perpanjangan unggah berkas SPJ BOS APBD Tahap I karena kendala token Dapodik.",
    tanggal: "03-Jun-2026",
    statusApproved: "Setuju"
  },
  {
    id: "req-002",
    sekolahMitra: "SMA Lazuardi",
    tipeRequest: "Pendampingan Kurikulum",
    deskripsi: "Pengajuan workshop kurikulum merdeka lanjutan bagi jajaran guru baru matematika dan bahasa inggris.",
    tanggal: "05-Jun-2026",
    statusApproved: "Menunggu"
  },
  {
    id: "req-003",
    sekolahMitra: "Kamila",
    tipeRequest: "Fasilitas",
    deskripsi: "Permohonan instalasi perangkat keras monitoring kasir katering sekolah terintegrasi Lazuardi Pay.",
    tanggal: "06-Jun-2026",
    statusApproved: "Menunggu"
  },
  {
    id: "req-004",
    sekolahMitra: "Cordova",
    tipeRequest: "Lainnya",
    deskripsi: "Pengajuan izin pergantian bendahara operasional sekolah serta pendampingan serah terima jabatan digital.",
    tanggal: "08-Jun-2026",
    statusApproved: "Setuju"
  },
  {
    id: "req-005",
    sekolahMitra: "Athaillah",
    tipeRequest: "Fasilitas",
    deskripsi: "Penggantian printer cetak kuitansi di area administrasi tata usaha yang rusak karena overheat.",
    tanggal: "09-Jun-2026",
    statusApproved: "Ditolak"
  },
  {
    id: "req-006",
    sekolahMitra: "Tursina",
    tipeRequest: "Dana BOS",
    deskripsi: "Asistensi pelaporan Silpa Dana BOS Reguler melalui aplikasi ARKAS versi terbaru.",
    tanggal: "09-Jun-2026",
    statusApproved: "Menunggu"
  }
];

export const mockEvents: EventTracker[] = [
  {
    id: "evt-001",
    namaEvent: "Audit Keuangan Bulanan Serentak",
    tanggal: "12-Jun-2026",
    sekolahMitra: "Semua",
    kategori: "Audit",
    deskripsi: "Pengawasan rutin kelengkapan berkas slip bukti gaji dan mutasi rekening koran operasional sekolah."
  },
  {
    id: "evt-002",
    namaEvent: "Bimtek Aplikasi Manajemen Kas Lazuardi Hub V2",
    tanggal: "15-Jun-2026",
    sekolahMitra: "Semua",
    kategori: "Bimtek",
    deskripsi: "Sosialisasi modul rekonsiliasi otomatis bagi seluruh bendahara sekolah mitra."
  },
  {
    id: "evt-003",
    namaEvent: "Rapat Koordinasi Evaluasi Temuan Laporan Kamila",
    tanggal: "18-Jun-2026",
    sekolahMitra: "Kamila",
    kategori: "Rapat Kurikulum",
    deskripsi: "Pendalaman berkas revisi laporan keuangan periode Maret-Mei bersama pengawas pusat Lazuardi."
  },
  {
    id: "evt-004",
    namaEvent: "Sertifikasi Standardisasi Pengarsipan Digital",
    tanggal: "22-Jun-2026",
    sekolahMitra: "SMA Lazuardi",
    kategori: "Bimtek",
    deskripsi: "Pelatihan administrasi akreditasi standar ISO 9001 untuk divisi keuangan sekolah."
  },
  {
    id: "evt-005",
    namaEvent: "Visitasi Audit On-Site Tim Pengawas Lazuardi",
    tanggal: "25-Jun-2026",
    sekolahMitra: "Al-Falah Depok",
    kategori: "Audit",
    deskripsi: "Pencocokan fisik inventarisasi aset sekolah yang didanai menggunakan dana BOS afirmasi."
  }
];
