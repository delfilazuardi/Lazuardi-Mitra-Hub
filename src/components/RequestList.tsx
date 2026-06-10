import React, { useState, useMemo } from "react";
import { PartnerRequest, UserSession } from "../types";
import { Send, FileText, Check, X, Clock, HelpCircle, AlertTriangle, Plus, School, ShieldAlert } from "lucide-react";
import { motion } from "motion/react";

interface RequestProps {
  requests: PartnerRequest[];
  session: UserSession;
  onCreateRequest: (tipe: "Dana BOS" | "Fasilitas" | "Pendampingan Kurikulum" | "Lainnya", deskripsi: string) => void;
  onUpdateRequestStatus?: (id: string, newStatus: "Setuju" | "Ditolak") => void;
}

export default function RequestList({ requests, session, onCreateRequest, onUpdateRequestStatus }: RequestProps) {
  const [typeFilter, setTypeFilter] = useState("Semua");
  const [descInput, setDescInput] = useState("");
  const [tipeInput, setTipeInput] = useState<"Dana BOS" | "Fasilitas" | "Pendampingan Kurikulum" | "Lainnya">("Dana BOS");
  const [showCreateModal, setShowCreateModal] = useState(false);

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
    onCreateRequest(tipeInput, descInput);
    setDescInput("");
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

          <div className="flex items-center gap-3">
            {isMitra && (
              <button
                onClick={() => setShowCreateModal(true)}
                className="bg-yellow-400 hover:bg-yellow-500 text-slate-900 font-extrabold text-xs px-4 py-2.5 rounded-xl transition-all shadow-md flex items-center gap-1.5 cursor-pointer"
              >
                <Plus className="w-4 h-4 text-blue-900" />
                Buat Request Baru
              </button>
            )}

            {/* Filter toggle */}
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="px-3 py-2 text-xs bg-slate-50 hover:bg-slate-100/50 border border-slate-200 rounded-xl outline-hidden focus:ring-2 focus:ring-blue-500/10 focus:border-blue-900 transition-all font-semibold text-slate-700 cursor-pointer"
            >
              <option value="Semua">Semua Kategori</option>
              <option value="Dana BOS">Dana BOS</option>
              <option value="Fasilitas">Fasilitas Sekolah</option>
              <option value="Pendampingan Kurikulum">Pendampingan Kurikulum</option>
              <option value="Lainnya">Lain-lain</option>
            </select>
          </div>
        </div>

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
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-2">Pilih Klasifikasi</label>
                <select
                  value={tipeInput}
                  onChange={(e) => setTipeInput(e.target.value as any)}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl outline-hidden focus:ring-2 focus:ring-blue-500/10 focus:border-blue-900 font-medium text-slate-700 cursor-pointer"
                >
                  <option value="Dana BOS">Dispensasi Dana BOS</option>
                  <option value="Fasilitas">Pengadaan Fasilitas Lembaga</option>
                  <option value="Pendampingan Kurikulum">Workshop Kurikulum Akademik</option>
                  <option value="Lainnya">Lainnya / Pertanyaan Umum</option>
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

              <div className="grid grid-cols-2 gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
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
