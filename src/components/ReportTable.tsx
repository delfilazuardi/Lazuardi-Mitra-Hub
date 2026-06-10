import React, { useState, useMemo } from "react";
import { ReportRecord, UserSession } from "../types";
import { Search, Filter, RefreshCw, ChevronLeft, ChevronRight, Download, Calendar, Check, AlertTriangle, FileSpreadsheet, Plus, X } from "lucide-react";

interface TableProps {
  records: ReportRecord[];
  schools: string[];
  session: UserSession;
  onCreateReport?: (
    bulan: string,
    tahun: number,
    sekolahMitra: string,
    statusLaporan: "Sudah Kirim" | "Belum Kirim",
    statusAudit: "Selesai" | "Revisi" | "Belum Diaudit" | "-"
  ) => void;
  onSelectSchool: (schoolName: string) => void;
}

export default function ReportTable({ records, schools, session, onCreateReport, onSelectSchool }: TableProps) {
  // Filters state
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSchool, setSelectedSchool] = useState("Semua");
  const [selectedStatus, setSelectedStatus] = useState("Semua");
  const [selectedAudit, setSelectedAudit] = useState("Semua");
  const [selectedYear, setSelectedYear] = useState("Semua");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Add report modal state variables
  const [showAddModal, setShowAddModal] = useState(false);
  const [newBulan, setNewBulan] = useState("Januari");
  const [newTahun, setNewTahun] = useState(2026);
  const [newSekolah, setNewSekolah] = useState(session.role === "sekolah_mitra" ? (session.sekolahName || "") : "SMA Lazuardi");
  const [newStatusLaporan, setNewStatusLaporan] = useState<"Sudah Kirim" | "Belum Kirim">("Sudah Kirim");
  const [newStatusAudit, setNewStatusAudit] = useState<"Selesai" | "Revisi" | "Belum Diaudit" | "-">("Belum Diaudit");

  const handleSubmitReportForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSekolah) return;
    if (onCreateReport) {
      onCreateReport(newBulan, newTahun, newSekolah, newStatusLaporan, newStatusAudit);
    }
    setShowAddModal(false);
  };

  // Derive unique schools, audits, years for filter options
  const availableSchoolsFilter = useMemo(() => {
    return ["Semua", ...Array.from(new Set(records.map((r) => r.sekolahMitra)))];
  }, [records]);

  const years = useMemo(() => {
    return ["Semua", ...Array.from(new Set(records.map((r) => r.tahun.toString())))];
  }, [records]);

  // Reset filters
  const handleReset = () => {
    setSearchTerm("");
    setSelectedSchool("Semua");
    setSelectedStatus("Semua");
    setSelectedAudit("Semua");
    setSelectedYear("Semua");
    setCurrentPage(1);
  };

  // Filtered reports
  const filteredRecords = useMemo(() => {
    return records.filter((r) => {
      const matchSearch = r.sekolahMitra.toLowerCase().includes(searchTerm.toLowerCase()) || r.bulan.toLowerCase().includes(searchTerm.toLowerCase());
      const matchSchool = selectedSchool === "Semua" || r.sekolahMitra === selectedSchool;
      const matchStatus = selectedStatus === "Semua" || r.statusLaporan === selectedStatus;
      const matchAudit = selectedAudit === "Semua" || r.statusAudit === selectedAudit;
      const matchYear = selectedYear === "Semua" || r.tahun.toString() === selectedYear;
      return matchSearch && matchSchool && matchStatus && matchAudit && matchYear;
    });
  }, [records, searchTerm, selectedSchool, selectedStatus, selectedAudit, selectedYear]);

  // Pagination calculation
  const totalItems = filteredRecords.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage) || 1;
  const paginatedRecords = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredRecords.slice(start, start + itemsPerPage);
  }, [filteredRecords, currentPage]);

  const handlePrevPage = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) setCurrentPage(currentPage + 1);
  };

  return (
    <div id="table-section" className="bg-white border border-slate-100 rounded-2xl shadow-xs overflow-hidden">
      {/* Header controls section */}
      <div className="p-6 border-b border-slate-50 space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold text-slate-800 tracking-tight">Daftar Pengarsipan Audit</h2>
            <p className="text-xs text-slate-400 mt-1">
              Ditemukan {filteredRecords.length} dari total {records.length} periode laporan monitoring
            </p>
          </div>
          
          <div className="flex items-center gap-2 flex-wrap">
            <button
              id="btn-add-report"
              onClick={() => {
                setNewSekolah(session.role === "sekolah_mitra" ? (session.sekolahName || "") : "SMA Lazuardi");
                setShowAddModal(true);
              }}
              className="flex items-center gap-1.5 text-xs text-white font-semibold bg-blue-900 hover:bg-blue-800 px-3 py-2 rounded-xl transition-all cursor-pointer shadow-xs"
            >
              <Plus className="w-4 h-4 text-yellow-300" />
              Tambah Laporan Baru
            </button>
            <button
              id="btn-reset-filters"
              onClick={handleReset}
              className="flex items-center gap-1.5 text-xs text-indigo-600 font-semibold bg-indigo-50 hover:bg-indigo-100/80 px-3 py-2 rounded-xl transition-all cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Reset Filter
            </button>
          </div>
        </div>

        {/* Filter input grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 pt-2">
          {/* Search bar */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              id="filter-search-input"
              type="text"
              placeholder="Cari sekolah atau bulan..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 hover:bg-slate-100/50 focus:bg-white border border-slate-200/60 rounded-xl outline-hidden focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all font-medium text-slate-700"
            />
          </div>

          {/* School filter */}
          <div className="relative">
            <select
              id="filter-school-select"
              value={selectedSchool}
              onChange={(e) => {
                setSelectedSchool(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200/60 rounded-xl outline-hidden focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all font-medium text-slate-700 appearance-none cursor-pointer"
            >
              <option disabled>Pilih Sekolah Mitra</option>
              {availableSchoolsFilter.map((s) => (
                <option key={s} value={s}>
                  {s === "Semua" ? "Semua Sekolah Mitra" : s}
                </option>
              ))}
            </select>
          </div>

          {/* Status filter */}
          <div className="relative">
            <select
              id="filter-status-select"
              value={selectedStatus}
              onChange={(e) => {
                setSelectedStatus(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200/60 rounded-xl outline-hidden focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all font-medium text-slate-700 appearance-none cursor-pointer"
            >
              <option value="Semua">Semua Status Laporan</option>
              <option value="Sudah Kirim">Sudah Kirim</option>
              <option value="Belum Kirim">Belum Kirim</option>
            </select>
          </div>

          {/* Audit filter */}
          <div className="relative">
            <select
              id="filter-audit-select"
              value={selectedAudit}
              onChange={(e) => {
                setSelectedAudit(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200/60 rounded-xl outline-hidden focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all font-medium text-slate-700 appearance-none cursor-pointer"
            >
              <option value="Semua">Semua Status Audit</option>
              <option value="Selesai">Selesai Audit</option>
              <option value="Revisi">Perlu Revisi</option>
              <option value="Belum Diaudit">Belum Diaudit</option>
            </select>
          </div>

          {/* Year filter */}
          <div className="relative">
            <select
              id="filter-year-select"
              value={selectedYear}
              onChange={(e) => {
                setSelectedYear(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200/60 rounded-xl outline-hidden focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all font-medium text-slate-700 appearance-none cursor-pointer"
            >
              <option disabled>Pilih Tahun</option>
              {years.map((y) => (
                <option key={y} value={y}>
                  {y === "Semua" ? "Semua Tahun" : `Tahun ${y}`}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Table section */}
      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-left">
          <thead>
            <tr className="bg-slate-50/70 border-b border-slate-100 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              <th className="py-3 px-6">Sekolah Mitra</th>
              <th className="py-3 px-4">Bulan / Tahun</th>
              <th className="py-3 px-4">Tanggal Kirim</th>
              <th className="py-3 px-4">Status Pengiriman</th>
              <th className="py-3 px-4 text-center">Status Audit</th>
              <th className="py-3 px-4 text-center">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100/60 text-xs">
            {paginatedRecords.length > 0 ? (
              paginatedRecords.map((r) => {
                const isSent = r.statusLaporan === "Sudah Kirim";
                const isAuditDone = r.statusAudit === "Selesai";
                const isAuditRevision = r.statusAudit === "Revisi";

                return (
                  <tr key={r.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="py-3.5 px-6 font-semibold text-slate-700">
                      <button
                        onClick={() => onSelectSchool(r.sekolahMitra)}
                        className="hover:text-indigo-600 hover:underline text-left cursor-pointer focus:outline-hidden"
                      >
                        {r.sekolahMitra}
                      </button>
                    </td>
                    <td className="py-3.5 px-4 text-slate-500 font-medium font-mono">
                      {r.bulan} {r.tahun}
                    </td>
                    <td className="py-3.5 px-4 font-mono text-slate-500">
                      {r.tanggalKirim || <span className="text-slate-300">-</span>}
                    </td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold ${
                          isSent
                            ? "bg-emerald-50 text-emerald-700 border border-emerald-200/40"
                            : "bg-rose-50 text-rose-700 border border-rose-200/40"
                        }`}
                      >
                        <span className={`w-1.5 h-1.5 rounded-full ${isSent ? "bg-emerald-500" : "bg-rose-500"}`} />
                        {r.statusLaporan}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <span
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold ${
                          isAuditDone
                            ? "bg-teal-50 text-teal-700 border border-teal-200/40"
                            : isAuditRevision
                            ? "bg-amber-50 text-amber-700 border border-amber-200"
                            : "bg-slate-100 text-slate-600 border border-slate-200/30"
                        }`}
                      >
                        {isAuditDone ? (
                          <Check className="w-3 h-3 text-teal-600" />
                        ) : isAuditRevision ? (
                          <AlertTriangle className="w-3 h-3 text-amber-600" />
                        ) : null}
                        {r.statusAudit}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <button
                        onClick={() => onSelectSchool(r.sekolahMitra)}
                        className="text-[11px] text-indigo-600 hover:text-indigo-800 font-bold bg-indigo-50/50 hover:bg-indigo-50 px-2.5 py-1 rounded-lg transition-all"
                      >
                        Tinjau
                      </button>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={6} className="py-12 text-center text-slate-400">
                  <div className="flex flex-col items-center justify-center space-y-2">
                    <AlertTriangle className="w-8 h-8 text-slate-300" />
                    <span className="text-xs font-medium">Laporan tidak ditemukan. Silakan sesuaikan filter Anda.</span>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="p-4 bg-slate-50/50 border-t border-slate-100 flex items-center justify-between">
          <span className="text-xs text-slate-500 font-medium">
            Halaman <span className="font-semibold text-slate-700">{currentPage}</span> dari <span className="font-semibold text-slate-700">{totalPages}</span>
          </span>
          
          <div className="flex items-center space-y-0 gap-2">
            <button
              onClick={handlePrevPage}
              disabled={currentPage === 1}
              className={`p-1.5 rounded-lg border border-slate-200/80 bg-white text-slate-600 hover:bg-slate-50 transition-all ${
                currentPage === 1 ? "opacity-40 cursor-not-allowed" : "cursor-pointer"
              }`}
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={handleNextPage}
              disabled={currentPage === totalPages}
              className={`p-1.5 rounded-lg border border-slate-200/80 bg-white text-slate-600 hover:bg-slate-50 transition-all ${
                currentPage === totalPages ? "opacity-40 cursor-not-allowed" : "cursor-pointer"
              }`}
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Dynamic Add new Report modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-100 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white rounded-3xl overflow-hidden shadow-2xl border border-slate-100">
            <div className="bg-blue-900 text-white p-5 text-center">
              <h3 className="font-extrabold uppercase tracking-widest text-xs text-yellow-300">Tambah Data Laporan Lazuardi</h3>
              <p className="text-xs text-slate-200 mt-1">Registrasi Arsip Laporan Hub</p>
            </div>
            
            <form onSubmit={handleSubmitReportForm} className="p-6 space-y-4">
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1.5">Instansi Sekolah Mitra</label>
                {session.role === "sekolah_mitra" ? (
                  <input
                    type="text"
                    readOnly
                    value={session.sekolahName}
                    className="w-full px-3 py-2 text-xs bg-slate-100 border border-slate-200 rounded-xl font-bold text-slate-700"
                  />
                ) : (
                  <select
                    value={newSekolah}
                    onChange={(e) => setNewSekolah(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl outline-hidden font-medium text-slate-700 cursor-pointer"
                  >
                    {schools.map((sch) => (
                      <option key={sch} value={sch}>{sch}</option>
                    ))}
                  </select>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1.5">Bulan</label>
                  <select
                    value={newBulan}
                    onChange={(e) => setNewBulan(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl outline-hidden font-medium text-slate-700 cursor-pointer"
                  >
                    {["Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober", "November", "Desember"].map((m) => (
                      <option key={m} value={m}>{m}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1.5">Tahun</label>
                  <input
                    type="number"
                    min={2020}
                    max={2035}
                    value={newTahun}
                    onChange={(e) => setNewTahun(parseInt(e.target.value) || 2026)}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl outline-hidden font-medium text-slate-700 font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1.5">Status Pengiriman</label>
                  <select
                    value={newStatusLaporan}
                    onChange={(e) => setNewStatusLaporan(e.target.value as any)}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl outline-hidden font-medium text-slate-700 cursor-pointer"
                  >
                    <option value="Sudah Kirim">Sudah Kirim</option>
                    <option value="Belum Kirim">Belum Kirim</option>
                  </select>
                </div>

                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1.5">Status Audit</label>
                  <select
                    value={newStatusAudit}
                    onChange={(e) => setNewStatusAudit(e.target.value as any)}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl outline-hidden font-medium text-slate-700 cursor-pointer"
                  >
                    <option value="Belum Diaudit">Belum Diaudit</option>
                    <option value="Selesai">Selesai Audit</option>
                    <option value="Revisi">Perlu Revisi</option>
                    <option value="-">-</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="py-2 text-xs font-bold text-slate-500 hover:text-slate-700 hover:bg-slate-50 border border-slate-200 rounded-xl transition-all cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="py-2 text-xs font-bold text-slate-900 bg-yellow-400 hover:bg-yellow-500 rounded-xl shadow-md transition-all cursor-pointer flex items-center justify-center gap-1.5"
                >
                  ✓ Simpan Laporan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
