import React, { useState, useMemo } from "react";
import { EventTracker, UserSession } from "../types";
import { Calendar, Plus, MapPin, Tag, Users, Check, School, Info, Clock } from "lucide-react";
import { motion } from "motion/react";

interface EventProps {
  events: EventTracker[];
  session: UserSession;
  schools: string[];
  onCreateEvent: (namaEvent: string, tanggal: string, sekolahMitra: string, kategori: "Audit" | "Rapat Kurikulum" | "Bimtek" | "Lainnya", deskripsi: string) => void;
}

export default function EventTrackerList({ events, session, schools, onCreateEvent }: EventProps) {
  const [catFilter, setCatFilter] = useState("Semua");
  const [showCreateModal, setShowCreateModal] = useState(false);

  // New Event Form
  const [namaEvent, setNamaEvent] = useState("");
  const [tanggal, setTanggal] = useState("");
  const [targetSchool, setTargetSchool] = useState("Semua");
  const [kategori, setKategori] = useState<"Audit" | "Rapat Kurikulum" | "Bimtek" | "Lainnya">("Audit");
  const [deskripsi, setDeskripsi] = useState("");

  const isMitra = session.role === "sekolah_mitra";
  const userSchool = session.sekolahName;

  // Filter events based on credentials & categories
  const filteredEvents = useMemo(() => {
    return events.filter((evt) => {
      // Permission filtering
      if (isMitra && evt.sekolahMitra !== "Semua" && evt.sekolahMitra !== userSchool) {
        return false;
      }
      // Category filtering
      return catFilter === "Semua" || evt.kategori === catFilter;
    });
  }, [events, session, catFilter, isMitra, userSchool]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!namaEvent.trim() || !tanggal || !deskripsi.trim()) return;
    
    // Format tanggal standard (e.g., "15-Jun-2026")
    const dateObj = new Date(tanggal);
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const formattedDate = `${dateObj.getDate()}-${months[dateObj.getMonth()]}-${dateObj.getFullYear()}`;

    onCreateEvent(namaEvent, formattedDate, targetSchool, kategori, deskripsi);
    
    // Reset Form
    setNamaEvent("");
    setTanggal("");
    setTargetSchool("Semua");
    setKategori("Audit");
    setDeskripsi("");
    setShowCreateModal(false);
  };

  return (
    <div id="event-tracker-root" className="space-y-6">
      <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold text-slate-800 tracking-tight">Timeline & Jadwal Kegiatan</h2>
            <p className="text-xs text-slate-400 mt-1">
              {isMitra 
                ? `Jadwal audit, bimtek, dan rapat evaluasi keuangan terstruktur untuk ${userSchool}`
                : "Timeline agenda audit, bimtek operasional kas, dan monitoring nasional Lazuardi"}
            </p>
          </div>

          <div className="flex items-center gap-3">
            {!isMitra && (
              <button
                onClick={() => setShowCreateModal(true)}
                className="bg-yellow-400 hover:bg-yellow-500 text-slate-900 font-extrabold text-xs px-4 py-2.5 rounded-xl transition-all shadow-md flex items-center gap-1.5 cursor-pointer"
              >
                <Plus className="w-4 h-4 text-blue-900" />
                Tambah Jadwal Kegiatan
              </button>
            )}

            {/* Filter Toggle */}
            <select
              value={catFilter}
              onChange={(e) => setCatFilter(e.target.value)}
              className="px-3 py-2 text-xs bg-slate-50 hover:bg-slate-100/50 border border-slate-200 rounded-xl outline-hidden focus:ring-2 focus:ring-blue-500/10 focus:border-blue-900 font-semibold text-slate-700 cursor-pointer"
            >
              <option value="Semua">Semua Agenda</option>
              <option value="Audit">Audit Keuangan</option>
              <option value="Bimtek">Bimtek Administrasi</option>
              <option value="Rapat Kurikulum">Rapat Evaluasi</option>
              <option value="Lainnya">Lainnya</option>
            </select>
          </div>
        </div>

        {/* Timeline Layout */}
        <div className="mt-8 relative border-l-2 border-slate-100 pl-6 ml-4 space-y-8">
          {filteredEvents.length > 0 ? (
            filteredEvents.map((evt, i) => {
              const itemCat = evt.kategori;
              let badgeColor = "bg-slate-100 text-slate-700 border-slate-200/50";
              if (itemCat === "Audit") badgeColor = "bg-rose-50 text-rose-700 border-rose-200/30";
              if (itemCat === "Bimtek") badgeColor = "bg-teal-50 text-teal-700 border-teal-200/30";
              if (itemCat === "Rapat Kurikulum") badgeColor = "bg-blue-50 text-blue-700 border-blue-200/35";

              return (
                <div key={evt.id} className="relative group">
                  {/* Timeline point node */}
                  <div className="absolute -left-[35px] top-1 w-4.5 h-4.5 rounded-full bg-white border-4 border-blue-900 shadow-xs group-hover:scale-125 transition-transform" />

                  <div className="bg-slate-50/50 border border-slate-100/80 rounded-2xl p-5 hover:bg-white hover:shadow-xs transition-all duration-200 max-w-3xl">
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2 mb-3">
                      <div className="space-y-1">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest font-mono">
                          {evt.tanggal}
                        </span>
                        <h3 className="text-sm font-bold text-slate-800 tracking-tight leading-snug">
                          {evt.namaEvent}
                        </h3>
                      </div>

                      <div className="flex items-center gap-1.5 self-start">
                        <span className={`text-[9px] font-extrabold px-2 py-0.5 rounded-md border ${badgeColor}`}>
                          {evt.kategori}
                        </span>
                        <span className="text-[9px] font-bold px-2 py-0.5 bg-slate-100 border border-slate-200/20 rounded-md text-slate-500 flex items-center gap-1">
                          <School className="w-3 h-3 text-yellow-500" />
                          {evt.sekolahMitra === "Semua" ? "Kolektif / Semua" : evt.sekolahMitra}
                        </span>
                      </div>
                    </div>

                    <p className="text-xs text-slate-500 leading-relaxed font-normal">{evt.deskripsi}</p>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="py-8 text-slate-400 text-xs flex flex-col items-center justify-center space-y-2">
              <Info className="w-6 h-6 text-slate-350" />
              <span>Tidak ada agenda terdaftar pada filter terpilih</span>
            </div>
          )}
        </div>
      </div>

      {/* Write event dialog */}
      {showCreateModal && (
        <div className="fixed inset-0 z-100 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white rounded-3xl overflow-hidden shadow-2xl border border-slate-100 animate-fade-in">
            <div className="bg-blue-900 text-white p-5 text-center">
              <h3 className="font-extrabold uppercase tracking-widest text-xs text-yellow-300">Buat Agenda Kegiatan Baru</h3>
              <p className="text-xs text-slate-200 mt-1">Sistem Kalender Lazuardi</p>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-2">Tanggal Kegiatan</label>
                  <input
                    required
                    type="date"
                    value={tanggal}
                    onChange={(e) => setTanggal(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl outline-hidden focus:ring-2 focus:ring-blue-500/10 focus:border-blue-900 font-medium text-slate-700"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-2">Klasifikasi/Kategori</label>
                  <select
                    value={kategori}
                    onChange={(e) => setKategori(e.target.value as any)}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl outline-hidden focus:ring-2 focus:ring-blue-500/10 focus:border-blue-900 font-semibold text-slate-700 cursor-pointer"
                  >
                    <option value="Audit">Audit Keuangan</option>
                    <option value="Bimtek">Bimtek Administrasi</option>
                    <option value="Rapat Kurikulum">Rapat Evaluasi</option>
                    <option value="Lainnya">Lain-lain</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-2">Sasaran Sekolah Mitra</label>
                <select
                  value={targetSchool}
                  onChange={(e) => setTargetSchool(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl outline-hidden focus:ring-2 focus:ring-blue-500/10 focus:border-blue-900 font-medium text-slate-700 cursor-pointer"
                >
                  <option value="Semua">Semua Sekolah Mitra (Kolektif)</option>
                  {schools.map((sch) => (
                    <option key={sch} value={sch}>{sch}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-2 font-semibold">Nama / Judul Kegiatan</label>
                <input
                  required
                  type="text"
                  value={namaEvent}
                  onChange={(e) => setNamaEvent(e.target.value)}
                  placeholder="Misal: Visitasi Verifikasi Kas Kecil..."
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl outline-hidden focus:ring-2 focus:ring-blue-500/10 focus:border-blue-900 font-medium text-slate-700"
                />
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-2">Deskripsi Agenda</label>
                <textarea
                  required
                  rows={3}
                  value={deskripsi}
                  onChange={(e) => setDeskripsi(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl outline-hidden focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 font-medium text-slate-700"
                  placeholder="Terangkan teknis pengerjaan, persyaratan, atau personil yang terlibat..."
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
                  <Plus className="w-3.5 h-3.5 text-blue-900" />
                  Simpan Agenda
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
