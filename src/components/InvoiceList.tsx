import React, { useState, useMemo } from "react";
import { Invoice, UserSession } from "../types";
import { FileText, Search, CreditCard, Check, AlertCircle, TrendingUp, DollarSign, ArrowUpRight, Plus, X } from "lucide-react";
import { motion } from "motion/react";

interface InvoiceProps {
  invoices: Invoice[];
  session: UserSession;
  schools?: string[];
  onUpdateInvoiceStatus?: (id: string, newStatus: "Lunas" | "Belum Lunas") => void;
  onCreateInvoice?: (
    invoiceNumber: string,
    sekolahMitra: string,
    jumlah: number,
    tanggal: string,
    statusPay: "Lunas" | "Belum Lunas",
    deskripsi: string
  ) => void;
}

export default function InvoiceList({ invoices, session, schools = [], onUpdateInvoiceStatus, onCreateInvoice }: InvoiceProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<"Semua" | "Lunas" | "Belum Lunas">("Semua");
  const [paymentModalInvoice, setPaymentModalInvoice] = useState<Invoice | null>(null);
  const [paymentSuccess, setPaymentSuccess] = useState(false);

  // Add invoice form states
  const [showAddModal, setShowAddModal] = useState(false);
  const [newInvoiceNo, setNewInvoiceNo] = useState("");
  const [newJumlah, setNewJumlah] = useState("");
  const [newDeskripsi, setNewDeskripsi] = useState("");
  const [newSekolah, setNewSekolah] = useState("");
  const [newStatus, setNewStatus] = useState<"Lunas" | "Belum Lunas">("Belum Lunas");

  const handleOpenAddModal = () => {
    const generatedNo = "INV-" + Date.now().toString().slice(-6);
    setNewInvoiceNo(generatedNo);
    setNewJumlah("");
    setNewDeskripsi("");
    setNewSekolah(session.role === "sekolah_mitra" ? (session.sekolahName || "") : (schools[0] || "SMA Lazuardi"));
    setNewStatus("Belum Lunas");
    setShowAddModal(true);
  };

  const handleSubmitInvoiceForm = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanNum = newJumlah.replace(/[^0-9]/g, "");
    if (!newInvoiceNo.trim() || !cleanNum || !newSekolah) return;
    const amountVal = parseFloat(cleanNum) || 0;
    const formattedDate = new Date().toLocaleDateString("id-ID", { day: "2-digit", month: "short", year: "numeric" }).replace(/\s/g, "-");
    
    if (onCreateInvoice) {
      onCreateInvoice(newInvoiceNo, newSekolah, amountVal, formattedDate, newStatus, newDeskripsi || "Iuran Biaya Monitoring");
    }
    setShowAddModal(false);
  };

  const isMitra = session.role === "sekolah_mitra";
  const userSchool = session.sekolahName;

  // Filter invoices based on credentials
  const filteredInvoices = useMemo(() => {
    return invoices.filter((inv) => {
      // Permission filtering
      if (isMitra && inv.sekolahMitra !== userSchool) {
        return false;
      }
      // Text searching
      const matchSearch =
        inv.sekolahMitra.toLowerCase().includes(searchTerm.toLowerCase()) ||
        inv.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        inv.deskripsi.toLowerCase().includes(searchTerm.toLowerCase());
      // Status filtering
      const matchStatus = statusFilter === "Semua" || inv.statusPay === statusFilter;

      return matchSearch && matchStatus;
    });
  }, [invoices, session, searchTerm, statusFilter, isMitra, userSchool]);

  // Aggregate stats
  const stats = useMemo(() => {
    const relevantInvoices = invoices.filter((inv) => !isMitra || inv.sekolahMitra === userSchool);
    const totalCount = relevantInvoices.length;
    const lunasCount = relevantInvoices.filter((inv) => inv.statusPay === "Lunas").length;
    const lunasAmount = relevantInvoices
      .filter((inv) => inv.statusPay === "Lunas")
      .reduce((sum, current) => sum + current.jumlah, 0);
    const tunggakanAmount = relevantInvoices
      .filter((inv) => inv.statusPay === "Belum Lunas")
      .reduce((sum, current) => sum + current.jumlah, 0);

    return {
      totalCount,
      lunasCount,
      lunasAmount,
      tunggakanAmount
    };
  }, [invoices, isMitra, userSchool]);

  const formatRupiah = (val: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0
    }).format(val);
  };

  const handleSimulatePayment = (inv: Invoice) => {
    setPaymentModalInvoice(inv);
    setPaymentSuccess(false);
  };

  const executeSimulatedPayment = () => {
    if (!paymentModalInvoice) return;
    if (onUpdateInvoiceStatus) {
      onUpdateInvoiceStatus(paymentModalInvoice.id, "Lunas");
    }
    setPaymentSuccess(true);
    setTimeout(() => {
      setPaymentModalInvoice(null);
      setPaymentSuccess(false);
    }, 1800);
  };

  return (
    <div id="invoice-component-root" className="space-y-6">
      
      {/* Financial Aggregations Banner (Blue & Yellow highlights) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-5 bg-blue-900 border border-blue-800 text-white rounded-2xl shadow-xs flex flex-col justify-between">
          <div className="flex items-start justify-between">
            <span className="text-xs font-bold text-yellow-300 uppercase tracking-widest">Dana Lunas Terverifikasi</span>
            <div className="p-2 bg-blue-800 rounded-xl text-yellow-400">
              <Check className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-4">
            <span className="text-2xl font-extrabold tracking-tight block text-yellow-300 font-mono">
              {formatRupiah(stats.lunasAmount)}
            </span>
            <span className="text-[10px] text-blue-200 block mt-1">
              Dari {stats.lunasCount} invoice yang tuntas disubmit
            </span>
          </div>
        </div>

        <div className="p-5 bg-white border border-slate-100 rounded-2xl shadow-xs flex flex-col justify-between">
          <div className="flex items-start justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Tertunggak / Tagihan</span>
            <div className="p-2 bg-amber-50 rounded-xl text-amber-600 border border-amber-100">
              <AlertCircle className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-4">
            <span className="text-2xl font-extrabold tracking-tight text-slate-800 block font-mono">
              {formatRupiah(stats.tunggakanAmount)}
            </span>
            <span className="text-[10px] text-amber-600 font-semibold block mt-1">
              Menunggu Pelunasan Administrasi
            </span>
          </div>
        </div>

        <div className="p-5 bg-white border border-slate-100 rounded-2xl shadow-xs flex flex-col justify-between">
          <div className="flex items-start justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Rasio Pembayaran Terpenuhi</span>
            <div className="p-2 bg-blue-50 text-blue-800 rounded-xl">
              <TrendingUp className="w-4 h-4 text-blue-900" />
            </div>
          </div>
          <div className="mt-4">
            <span className="text-2xl font-extrabold tracking-tight text-slate-800 block font-mono">
              {stats.totalCount > 0 ? Math.round((stats.lunasCount / stats.totalCount) * 100) : 0}%
            </span>
            <span className="text-[10px] text-slate-400 block mt-1">
              {stats.lunasCount} dari {stats.totalCount} invoice aktif
            </span>
          </div>
        </div>
      </div>

      {/* Database control layout */}
      <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h2 className="text-lg font-bold text-slate-800 tracking-tight">Invoice Dan Iuran Administrasional</h2>
            <p className="text-xs text-slate-400 mt-1">
              {isMitra 
                ? `Menampilkan tagihan finansial terdaftar untuk instansi ${userSchool}` 
                : "Portal Manajemen Tagihan Sekolah Mitra Lazuardi Group"}
            </p>
          </div>

          <div className="flex items-center gap-3 self-start md:self-auto flex-wrap">
            <button
              onClick={handleOpenAddModal}
              className="bg-blue-900 hover:bg-blue-800 text-white font-extrabold text-xs px-4 py-2.5 rounded-xl transition-all shadow-md flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-4 h-4 text-yellow-300" />
              Buat Invoice Baru
            </button>

            <div className="flex bg-slate-50 p-1 rounded-xl border border-slate-100/80">
              <button
                onClick={() => setStatusFilter("Semua")}
                className={`text-xs font-semibold px-3 py-1.5 rounded-lg transition-all ${
                  statusFilter === "Semua" ? "bg-blue-900 text-white shadow-xs" : "text-slate-400 hover:text-slate-600"
                }`}
              >
                Semua
              </button>
              <button
                onClick={() => setStatusFilter("Lunas")}
                className={`text-xs font-semibold px-3 py-1.5 rounded-lg transition-all ${
                  statusFilter === "Lunas" ? "bg-blue-900 text-white shadow-xs" : "text-slate-400 hover:text-slate-600"
                }`}
              >
                Lunas
              </button>
              <button
                onClick={() => setStatusFilter("Belum Lunas")}
                className={`text-xs font-semibold px-3 py-1.5 rounded-lg transition-all ${
                  statusFilter === "Belum Lunas" ? "bg-blue-900 text-white shadow-xs" : "text-slate-400 hover:text-slate-600"
                }`}
              >
                Belum Lunas
              </button>
            </div>
          </div>
        </div>

        {/* Search input to browse */}
        <div className="mb-4 relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder={isMitra ? "Cari nomor invoice atau uraian..." : "Cari mitra sekolah, nomor invoice, atau uraian..."}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 hover:bg-slate-100/50 focus:bg-white border border-slate-200/60 rounded-xl outline-hidden focus:ring-2 focus:ring-blue-500/10 focus:border-blue-900 transition-all font-medium text-slate-700"
          />
        </div>

        {/* Invoice Lists Table */}
        <div className="overflow-x-auto rounded-xl border border-slate-100">
          <table className="w-full border-collapse text-left">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                <th className="py-3 px-4">Invoice No / Uraian</th>
                {!isMitra && <th className="py-3 px-4">Sekolah Mitra</th>}
                <th className="py-3 px-4">Nominal</th>
                <th className="py-3 px-4">Tanggal Penerbitan</th>
                <th className="py-3 px-4 text-center">Status</th>
                <th className="py-3 px-4 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100/60 text-xs">
              {filteredInvoices.length > 0 ? (
                filteredInvoices.map((inv) => {
                  const isPaid = inv.statusPay === "Lunas";
                  return (
                    <tr key={inv.id} className="hover:bg-slate-50/50 transition-all">
                      <td className="py-4 px-4">
                        <div className="font-bold text-slate-700 tracking-tight font-mono">{inv.invoiceNumber}</div>
                        <div className="text-[11px] text-slate-400 mt-0.5 line-clamp-1">{inv.deskripsi}</div>
                      </td>
                      {!isMitra && (
                        <td className="py-4 px-4 font-semibold text-slate-700">{inv.sekolahMitra}</td>
                      )}
                      <td className="py-4 px-4 font-bold text-slate-800 font-mono">
                        {formatRupiah(inv.jumlah)}
                      </td>
                      <td className="py-4 px-4 text-slate-500 font-medium font-mono">{inv.tanggal}</td>
                      <td className="py-4 px-4 text-center">
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            isPaid
                              ? "bg-teal-50 text-teal-700 border border-teal-200/40"
                              : "bg-amber-50 text-amber-700 border border-amber-200/50"
                          }`}
                        >
                          <span className={`w-1 h-1 rounded-full ${isPaid ? "bg-teal-500" : "bg-amber-500"}`} />
                          {inv.statusPay}
                        </span>
                      </td>
                      <td className="py-4 px-4 text-center space-x-1.5">
                        {isPaid ? (
                          <span className="text-[10px] font-bold text-teal-600 bg-teal-50 px-2 py-1 rounded-lg">
                            Selesai & Clear
                          </span>
                        ) : isMitra ? (
                          <button
                            onClick={() => handleSimulatePayment(inv)}
                            className="bg-yellow-400 hover:bg-yellow-500 text-slate-900 border border-yellow-400 hover:border-yellow-500 text-[10px] font-extrabold px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1 mx-auto cursor-pointer"
                          >
                            <CreditCard className="w-3.5 h-3.5 text-blue-900" />
                            Bayar Online
                          </button>
                        ) : (
                          <button
                            onClick={() => onUpdateInvoiceStatus?.(inv.id, "Lunas")}
                            className="bg-blue-900 hover:bg-blue-800 text-white text-[10px] font-extrabold px-3 py-1.5 rounded-lg transition-colors cursor-pointer"
                          >
                            Tandai Lunas
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={isMitra ? 5 : 6} className="py-12 text-center text-slate-400">
                    <div className="flex flex-col items-center justify-center space-y-2">
                      <FileText className="w-8 h-8 text-slate-350" />
                      <span className="text-xs font-semibold">Tidak ada data invoice</span>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Payment simulation modal */}
      {paymentModalInvoice && (
        <div className="fixed inset-0 z-100 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="w-full max-w-sm bg-white rounded-3xl overflow-hidden shadow-2xl border border-slate-100">
            <div className="bg-blue-900 text-white p-5 text-center relative">
              <h3 className="font-extrabold uppercase tracking-widest text-xs text-yellow-300">Simulasi Pembayaran Lazuardi</h3>
              <p className="text-xs text-slate-200 mt-1">Transaksi Instan Terenkripsi</p>
            </div>
            
            <div className="p-6 space-y-4">
              <div className="space-y-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">No. Invoice</span>
                <span className="text-sm font-bold text-slate-800 tracking-tight block font-mono">{paymentModalInvoice.invoiceNumber}</span>
              </div>

              <div className="space-y-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Nominal Pembayaran</span>
                <span className="text-xl font-extrabold text-blue-900 tracking-tight block font-mono">{formatRupiah(paymentModalInvoice.jumlah)}</span>
              </div>

              <div className="p-3 bg-yellow-50 text-slate-700 rounded-xl text-xs space-y-1 border border-yellow-200/50">
                <strong className="block text-[10px] text-yellow-800 font-bold tracking-wider uppercase">Metode: Virtual Account Lazuardi Hub</strong>
                <span>Pencairan otomatis diverifikasi secara real-time demi sinkronisasi status sekolah Anda.</span>
              </div>

              {paymentSuccess ? (
                <div className="py-4 text-center space-y-2 bg-teal-50 border border-teal-200 rounded-2xl">
                  <div className="w-10 h-10 bg-teal-500 text-white rounded-full flex items-center justify-center mx-auto animate-bounce">
                    <Check className="w-6 h-6" />
                  </div>
                  <strong className="text-xs text-teal-700 block">Pencairan Berhasil Disimulasikan!</strong>
                  <span className="text-[10px] text-teal-500 block">Status invoice diperbarui seketika.</span>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-2 pt-2">
                  <button
                    onClick={() => setPaymentModalInvoice(null)}
                    className="py-2 text-xs font-bold text-slate-500 hover:text-slate-700 hover:bg-slate-50 border border-slate-200 rounded-xl transition-all cursor-pointer"
                  >
                    Batal
                  </button>
                  <button
                    onClick={executeSimulatedPayment}
                    className="py-2 text-xs font-bold text-white bg-blue-900 hover:bg-blue-800 rounded-xl shadow-md transition-all cursor-pointer"
                  >
                    Setujui Bayar
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Dynamic Add Invoice Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-100 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white rounded-3xl overflow-hidden shadow-2xl border border-slate-100">
            <div className="bg-blue-900 text-white p-5 text-center">
              <h3 className="font-extrabold uppercase tracking-widest text-xs text-yellow-300">Buat Invoice Baru</h3>
              <p className="text-xs text-slate-200 mt-1">Registrasi Administrasi Pembayaran Lazuardi</p>
            </div>
            
            <form onSubmit={handleSubmitInvoiceForm} className="p-6 space-y-4">
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1.5">Nomor Invoice</label>
                <input
                  type="text"
                  required
                  value={newInvoiceNo}
                  onChange={(e) => setNewInvoiceNo(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl outline-hidden font-bold text-slate-700 font-mono"
                  placeholder="e.g. INV-2026-01"
                />
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1.5">Instansi Sekolah Mitra</label>
                {session.role === "sekolah_mitra" ? (
                  <input
                    type="text"
                    readOnly
                    value={session.sekolahName}
                    className="w-full px-3 py-2 text-xs bg-slate-100 border border-slate-200 rounded-xl font-bold text-slate-700 font-sans"
                  />
                ) : (
                  <select
                    value={newSekolah}
                    onChange={(e) => setNewSekolah(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl outline-hidden font-medium text-slate-700 cursor-pointer"
                  >
                    {schools.length > 0 ? (
                      schools.map((sch) => (
                        <option key={sch} value={sch}>{sch}</option>
                      ))
                    ) : (
                      <option value="SMA Lazuardi">SMA Lazuardi</option>
                    )}
                  </select>
                )}
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1.5">Nominal Tagihan (IDR)</label>
                <input
                  type="text"
                  required
                  value={newJumlah}
                  onChange={(e) => {
                    const val = e.target.value.replace(/[^0-9]/g, "");
                    setNewJumlah(val);
                  }}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl outline-hidden font-bold text-slate-700 font-mono"
                  placeholder="Masukkan jumlah tanpa huruf/titik, misal 2500000"
                />
                {newJumlah && (
                  <span className="text-[10px] text-teal-600 font-semibold mt-1 block">
                    Konfirmasi nominal: {formatRupiah(parseFloat(newJumlah) || 0)}
                  </span>
                )}
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1.5">Uraian / Deskripsi Keperluan</label>
                <input
                  type="text"
                  required
                  value={newDeskripsi}
                  onChange={(e) => setNewDeskripsi(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl outline-hidden font-medium text-slate-700"
                  placeholder="e.g. Pembayaran Evaluasi Kurikulum atau Dana BOS Triwulan"
                />
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1.5">Status Pembayaran</label>
                <select
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value as any)}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl outline-hidden font-medium text-slate-700 cursor-pointer"
                >
                  <option value="Belum Lunas">Belum Lunas</option>
                  <option value="Lunas">Lunas</option>
                </select>
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
                  ✓ Terbitkan Invoice
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
