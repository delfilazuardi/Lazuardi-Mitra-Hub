import React, { useState, useMemo } from "react";
import { PartnerRequest, UserSession } from "../types";
import { Send, FileText, Check, X, Clock, HelpCircle, AlertTriangle, Plus, School, ShieldAlert } from "lucide-react";
import { motion } from "motion/react";

interface RequestProps {
  requests: PartnerRequest[];
  session: UserSession;
  schools?: string[];
  onCreateRequest: (tipe: string, deskripsi: string, items?: any[], targetSchool?: string) => void;
  onUpdateRequestStatus?: (id: string, newStatus: "Setuju" | "Ditolak") => void;
}

export default function RequestList({ requests, session, schools = [], onCreateRequest, onUpdateRequestStatus }: RequestProps) {
  const [typeFilter, setTypeFilter] = useState("Semua");
  const [descInput, setDescInput] = useState("");
  const categories = useMemo(() => {
    const saved = localStorage.getItem("laz_request_categories");
    return saved ? JSON.parse(saved) : ["Dana BOS", "Fasilitas", "Pendampingan Kurikulum", "Lainnya"];
  }, [requests]);
  const [tipeInput, setTipeInput] = useState<string>(() => {
    const saved = localStorage.getItem("laz_request_categories");
    const parsed = saved ? JSON.parse(saved) : ["Dana BOS"];
    return parsed[0] || "Dana BOS";
  });
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [targetSchoolInput, setTargetSchoolInput] = useState<string>("");

  // Custom Category States
  const [showAddCategoryInline, setShowAddCategoryInline] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");

  const handleOpenCreateModal = () => {
    setTipeInput(categories[0] || "Dana BOS");
    setTargetSchoolInput(session.role === "admin" ? (schools[0] || "SMA Lazuardi") : (session.sekolahName || "SMA Lazuardi"));
    setDescInput("");
    setItems([]);
    setShowCreateModal(true);
  };

  const handleAddCategorySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanName = newCategoryName.trim();
    if (!cleanName) return;
    if (categories.some(cat => cat.toLowerCase() === cleanName.toLowerCase())) {
      setNewCategoryName("");
      setShowAddCategoryInline(false);
      return;
    }
    const updated = [...categories, cleanName];
    localStorage.setItem("laz_request_categories", JSON.stringify(updated));
    setTipeInput(cleanName);
    setNewCategoryName("");
    setShowAddCategoryInline(false);
    // Directly trigger a page update (or trigger list refresh) by forcing state refresh of form input
    setTimeout(() => {
      window.dispatchEvent(new Event("storage"));
    }, 50);
  };

  // Request item states
  const [items, setItems] = useState<{ id: string; namaItem: string; jumlah: number; catatan?: string }[]>([]);
  const [tempItemName, setTempItemName] = useState("");
  const [tempItemQty, setTempItemQty] = useState(1);
  const [tempItemNotes, setTempItemNotes] = useState("");

  const handleAddItem = (e: React.MouseEvent) => {
    e.preventDefault();
    if (!tempItemName.trim()) return;
    setItems((prev) => [
      ...prev,
      {
        id: `itm-${Date.now()}-${Math.random().toString(36).slice(-3)}`,
        namaItem: tempItemName.trim(),
        jumlah: tempItemQty,
        catatan: tempItemNotes.trim() || undefined
      }
    ]);
    setTempItemName("");
    setTempItemQty(1);
    setTempItemNotes("");
  };

  const handleRemoveItem = (itemId: string) => {
    setItems((prev) => prev.filter((item) => item.id !== itemId));
  };

  const isMitra = session.role === "sekolah_mitra";
  const userSchool = session.sekolahName;

  // Filter requests
  const filteredRequests = useMemo(() => {
    return requests.filter((req) => {
      // Permission filtering
      if (isMitra && req.sekolahMitra !== userSchool) {
        return false;
      }
      // Type filtering
      return typeFilter === "Semua" || req.tipeRequest === typeFilter;
    });
  }, [requests, session, typeFilter, isMitra, userSchool]);

  const handleSubmitRequest = (e: React.FormEvent) => {
    e.preventDefault();
    if (!descInput.trim()) return;
    onCreateRequest(tipeInput, descInput, items.length > 0 ? items : undefined, targetSchoolInput);
    setDescInput("");
    setItems([]);
    setShowCreateModal(false);
  };

  return (
    <div id="request-component-root" className="space-y-6">
      
      {/* Title block with Blue and Yellow action styles */}
      <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold text-slate-800 tracking-tight">Pusat Bantuan & Request Mitra</h2>
            <p className="text-xs text-slate-400 mt-1">
              {isMitra 
                ? `Kirimkan pengajuan dispensasi, fasilitas, pendampingan, atau bantuan dari Yayasan untuk ${userSchool}`
                : "Daftar Ajuan Bantuan, Fasilitas, dan Dispensasi dari Sekolah Kemitraan Lazuardi"}
            </p>
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            {/* Create action is now available for both Mitra and Admin! */}
            <button
              onClick={handleOpenCreateModal}
              className="bg-yellow-400 hover:bg-yellow-500 text-slate-900 font-extrabold text-xs px-4 py-2.5 rounded-xl transition-all shadow-md flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-4 h-4 text-blue-900" />
              Buat Request Baru
            </button>

            {/* Admin can add classifications dynamically */}
            {!isMitra && (
              <button
                onClick={() => setShowAddCategoryInline(!showAddCategoryInline)}
                className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-extrabold text-xs px-3.5 py-2.5 rounded-xl border border-slate-250 transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5 text-blue-900 animate-pulse" />
                Tambah Kategori
              </button>
            )}

            {/* Filter toggle */}
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="px-3 py-2 text-xs bg-slate-50 hover:bg-slate-100/50 border border-slate-200 rounded-xl outline-hidden focus:ring-2 focus:ring-blue-500/10 focus:border-blue-900 transition-all font-semibold text-slate-700 cursor-pointer"
            >
              <option value="Semua">Semua Kategori</option>
              {categories.map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Inline form for adding dynamic categories for admin */}
        {showAddCategoryInline && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-4 bg-blue-50 border border-blue-200 rounded-2xl flex flex-col sm:flex-row items-center gap-3"
          >
            <div className="flex-1 w-full">
              <span className="text-[10px] font-extrabold text-blue-900 uppercase tracking-widest block mb-1">Daftar Klasifikasi/Kategori Baru</span>
              <p className="text-[11px] text-slate-500">Mendaftarkan kategori penunjang aspirasi baru ke seluruh jajaran Mitra Hub.</p>
            </div>
            
            <form onSubmit={handleAddCategorySubmit} className="flex gap-2 w-full sm:w-auto">
              <input
                required
                type="text"
                value={newCategoryName}
                onChange={(e) => setNewCategoryName(e.target.value)}
                placeholder="Nama kategori, misal: Bimtek IT"
                className="px-3 py-2 text-xs bg-white border border-slate-200 rounded-xl outline-hidden font-medium text-slate-700"
              />
              <button
                type="submit"
                className="bg-blue-900 hover:bg-blue-800 text-white font-extrabold text-xs px-4 py-2 rounded-xl transition-all shadow-xs cursor-pointer"
              >
                Simpan
              </button>
              <button
                type="button"
                onClick={() => setShowAddCategoryInline(false)}
                className="bg-white hover:bg-slate-50 border border-slate-200 text-slate-500 font-extrabold text-xs px-3 py-2 rounded-xl transition-all cursor-pointer"
              >
                Batal
              </button>
            </form>
          </motion.div>
        )}

        {/* Request Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
          {filteredRequests.length > 0 ? (
            filteredRequests.map((req) => {
              const status = req.statusApproved;
              const isApproved = status === "Setuju";
              const isRejected = status === "Ditolak";
              const isPending = status === "Menunggu";

              let themeClass = "border-slate-150 bg-white";
              let statusBadge = "bg-slate-100 text-slate-600 border border-slate-250";
              if (isApproved) {
                themeClass = "border-teal-200 bg-teal-50/10";
                statusBadge = "bg-teal-50 text-teal-700 border border-teal-200/40";
              } else if (isRejected) {
                themeClass = "border-rose-100 bg-rose-50/10";
                statusBadge = "bg-rose-50 text-rose-700 border border-rose-150/40";
              } else if (isPending) {
                themeClass = "border-amber-200 bg-amber-50/10";
                statusBadge = "bg-amber-50 text-amber-700 border border-amber-200/40";
              }

              return (
                <div key={req.id} className={`p-5 rounded-2xl border transition-all hover:shadow-xs flex flex-col justify-between ${themeClass}`}>
                  <div className="space-y-3">
                    <div className="flex items-start justify-between">
                      <span className="text-[10px] font-bold text-blue-900 bg-blue-50 px-2.5 py-1 rounded-lg uppercase tracking-wider">
                        {req.tipeRequest}
                      </span>
                      <span className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full ${statusBadge}`}>
                        {status === "Setuju" ? "Disetujui" : status === "Ditolak" ? "Ditolak" : "Pending"}
                      </span>
                    </div>

                    {!isMitra && (
                      <span className="font-bold text-slate-700 text-xs block flex items-center gap-1.5 pt-0.5">
                        <School className="w-3.5 h-3.5 text-yellow-500" />
                        {req.sekolahMitra}
                      </span>
                    )}

                    <p className="text-xs text-slate-600 leading-relaxed font-normal">{req.deskripsi}</p>

                    {/* Show request items list if they exist */}
                    {req.items && req.items.length > 0 && (
                      <div className="mt-2.5 p-3 bg-slate-50/80 border border-slate-100 rounded-xl space-y-1.5 shadow-inner">
                        <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block">Daftar Item Ajuan:</span>
                        <div className="space-y-1">
                          {req.items.map((item) => (
                            <div key={item.id} className="flex items-center justify-between text-[11px] text-slate-600 font-semibold bg-white px-2.5 py-1.5 rounded-lg border border-slate-100/60 font-sans">
                              <span>{item.namaItem} <span className="text-slate-400 font-normal">x{item.jumlah}</span></span>
                              {item.catatan && <span className="text-[9px] text-slate-400 font-normal italic">{item.catatan}</span>}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="mt-4 pt-3.5 border-t border-slate-100/50 flex items-center justify-between">
                    <span className="text-[10px] text-slate-400 font-medium font-mono">Input: {req.tanggal}</span>

                    {/* Admin Actions */}
                    {!isMitra && isPending && (
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => onUpdateRequestStatus?.(req.id, "Ditolak")}
                          className="p-1 px-2.5 rounded-lg border border-rose-200 text-rose-600 bg-rose-50 hover:bg-rose-100/60 font-semibold text-[10px] transition-all cursor-pointer"
                        >
                          Tolak
                        </button>
                        <button
                          onClick={() => onUpdateRequestStatus?.(req.id, "Setuju")}
                          className="p-1 px-2.5 rounded-lg border border-teal-200 text-teal-700 bg-teal-50 hover:bg-teal-100/60 font-semibold text-[10px] transition-all cursor-pointer"
                        >
                          Setujui
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })
          ) : (
            <div className="col-span-full py-12 text-center text-slate-400">
              <div className="flex flex-col items-center justify-center space-y-2">
                <FileText className="w-8 h-8 text-slate-350" />
                <span className="text-xs font-semibold">Tidak ada pengajuan request terdaftar</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Write request dialog */}
      {showCreateModal && (
        <div className="fixed inset-0 z-100 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white rounded-3xl overflow-hidden shadow-2xl border border-slate-100">
            <div className="bg-blue-900 text-white p-5 text-center">
              <h3 className="font-extrabold uppercase tracking-widest text-xs text-yellow-300">Buat Formulir Request Mitra</h3>
              <p className="text-xs text-slate-200 mt-1">Sistem Korespondensi Lazuardi</p>
            </div>
            
            <form onSubmit={handleSubmitRequest} className="p-6 space-y-4">
              {session.role === "admin" && (
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1.5">Mewakili Instansi Sekolah</label>
                  <select
                    value={targetSchoolInput}
                    onChange={(e) => setTargetSchoolInput(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl outline-hidden focus:ring-2 focus:ring-blue-500/10 focus:border-blue-900 font-semibold text-slate-700 cursor-pointer"
                  >
                    {schools.map((sch) => (
                      <option key={sch} value={sch}>{sch}</option>
                    ))}
                  </select>
                </div>
              )}

              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-2">Pilih Klasifikasi</label>
                <select
                  value={tipeInput}
                  onChange={(e) => setTipeInput(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl outline-hidden focus:ring-2 focus:ring-blue-500/10 focus:border-blue-900 font-medium text-slate-700 cursor-pointer"
                >
                  {categories.map((cat) => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-2">Penjelasan Aspirasi / Kendala</label>
                <textarea
                  required
                  rows={4}
                  value={descInput}
                  onChange={(e) => setDescInput(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl outline-hidden focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 font-medium text-slate-700"
                  placeholder="Deskripsikan pengajuan Anda secara terurai..."
                />
              </div>

              {/* Dynamic Item Request Builder (User requested itemized requests) */}
              <div className="p-3.5 bg-slate-50 border border-slate-150 rounded-2xl space-y-3">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Tambahkan Item Detil Request (Opsional)</span>
                
                {/* Active items in the list */}
                {items.length > 0 && (
                  <div className="space-y-1.5 max-h-24 overflow-y-auto pr-1">
                    {items.map((it) => (
                      <div key={it.id} className="flex items-center justify-between text-[11px] bg-white p-2 rounded-xl border border-slate-200">
                        <span className="font-semibold text-slate-700">{it.namaItem} <span className="text-slate-400 font-normal">x{it.jumlah}</span></span>
                        <div className="flex items-center gap-1.5 text-slate-400">
                          {it.catatan && <span className="text-[9px] italic line-clamp-1 max-w-[120px]">{it.catatan}</span>}
                          <button
                            type="button"
                            onClick={() => handleRemoveItem(it.id)}
                            className="p-1 text-rose-500 hover:text-rose-600 rounded-lg bg-rose-50 hover:bg-rose-100 transition-colors cursor-pointer"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Direct insertion fields */}
                <div className="grid grid-cols-3 gap-1.5">
                  <div className="col-span-2">
                    <input
                      type="text"
                      value={tempItemName}
                      onChange={(e) => setTempItemName(e.target.value)}
                      placeholder="Nama barang / jasa..."
                      className="w-full px-2 py-1.5 text-[11px] bg-white border border-slate-200 rounded-lg outline-hidden text-slate-700 font-medium"
                    />
                  </div>
                  <div>
                    <input
                      type="number"
                      min={1}
                      max={100}
                      value={tempItemQty}
                      onChange={(e) => setTempItemQty(parseInt(e.target.value) || 1)}
                      className="w-full px-2 py-1.5 text-[11px] bg-white border border-slate-200 rounded-lg outline-hidden font-bold text-slate-700 font-mono"
                    />
                  </div>
                </div>

                <div className="flex gap-1.5">
                  <input
                    type="text"
                    value={tempItemNotes}
                    onChange={(e) => setTempItemNotes(e.target.value)}
                    placeholder="Catatan opsional (e.g. Merk, tipe)..."
                    className="flex-1 px-2 py-1.5 text-[11px] bg-white border border-slate-200 rounded-lg outline-hidden text-slate-700 font-medium"
                  />
                  <button
                    type="button"
                    onClick={handleAddItem}
                    className="px-3 bg-blue-900 text-white rounded-lg text-[11px] font-bold hover:bg-blue-800 transition-all flex items-center gap-1 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5 text-yellow-300" />
                    Tambah
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setItems([]);
                    setShowCreateModal(false);
                  }}
                  className="py-2 text-xs font-bold text-slate-500 hover:text-slate-700 hover:bg-slate-50 border border-slate-200 rounded-xl transition-all cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="py-2 text-xs font-bold text-slate-900 bg-yellow-400 hover:bg-yellow-500 rounded-xl shadow-md transition-all cursor-pointer flex items-center justify-center gap-1"
                >
                  <Send className="w-3.5 h-3.5 text-blue-900" />
                  Kirim Pengajuan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
