import React, { useState, useMemo } from "react";
import { EventTracker, UserSession } from "../types";
import { 
  Calendar, 
  Plus, 
  MapPin, 
  Tag, 
  Users, 
  Check, 
  School, 
  Info, 
  Clock, 
  Edit2, 
  Trash2, 
  Filter, 
  CalendarDays,
  AlertCircle
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface EventProps {
  events: EventTracker[];
  session: UserSession;
  schools: string[];
  onCreateEvent: (namaEvent: string, tanggal: string, sekolahMitra: string, kategori: string, deskripsi: string) => void;
  onUpdateEvent?: (id: string, namaEvent: string, tanggal: string, sekolahMitra: string, kategori: string, deskripsi: string) => void;
  onDeleteEvent?: (id: string) => void;
}

export default function EventTrackerList({ 
  events, 
  session, 
  schools, 
  onCreateEvent,
  onUpdateEvent,
  onDeleteEvent 
}: EventProps) {
  const [catFilter, setCatFilter] = useState("Semua");
  const [timeFilter, setTimeFilter] = useState<"near" | "all">("near");
  const [showCreateModal, setShowCreateModal] = useState(false);

  // Dynamic Categories from LocalStorage
  const categories = useMemo(() => {
    const saved = localStorage.getItem("laz_event_categories");
    return saved ? JSON.parse(saved) : ["Audit", "Rapat Kurikulum", "Bimtek", "Lainnya"];
  }, [events]);

  // New Event Form State
  const [namaEvent, setNamaEvent] = useState("");
  const [tanggal, setTanggal] = useState("");
  const [targetSchool, setTargetSchool] = useState("Semua");
  const [kategori, setKategori] = useState<string>(() => {
    const saved = localStorage.getItem("laz_event_categories");
    const parsed = saved ? JSON.parse(saved) : ["Audit"];
    return parsed[0] || "Audit";
  });
  const [deskripsi, setDeskripsi] = useState("");

  // Edit Event Form State
  const [editingEvent, setEditingEvent] = useState<EventTracker | null>(null);
  const [editNamaEvent, setEditNamaEvent] = useState("");
  const [editTanggal, setEditTanggal] = useState("");
  const [editTargetSchool, setEditTargetSchool] = useState("Semua");
  const [editKategori, setEditKategori] = useState<string>("Audit");
  const [editDeskripsi, setEditDeskripsi] = useState("");

  const isMitra = session.role === "sekolah_mitra";
  const userSchool = session.sekolahName;

  // Helper inside component to parse "DD-MMM-YYYY" event dates
  const parseEventDate = (dateStr: string): Date => {
    try {
      const parts = dateStr.split("-");
      if (parts.length !== 3) return new Date();
      const day = parseInt(parts[0], 10);
      const year = parseInt(parts[2], 10);
      const monthMap: { [key: string]: number } = {
        jan: 0, feb: 1, mar: 2, apr: 3, mei: 4, may: 4, jun: 5, jul: 6, ags: 7, agu: 7, aug: 7, sep: 8, okt: 9, oct: 9, nov: 10, des: 11, dec: 11
      };
      const monthStr = parts[1].toLowerCase().slice(0, 3);
      const month = monthMap[monthStr] !== undefined ? monthMap[monthStr] : 5; // Default June
      return new Date(year, month, day);
    } catch {
      return new Date();
    }
  };

  // Check if dates are within upcoming ~1 month of reference June 10, 2026.
  const isWithinNearMonth = (dateStr: string): boolean => {
    const referenceDate = new Date("2026-06-10");
    const eventDate = parseEventDate(dateStr);
    
    // Difference calculation of days
    const diffTime = eventDate.getTime() - referenceDate.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    // Nearest ~1 month encompasses dates from June 5 up to July 11
    return diffDays >= -5 && diffDays <= 31;
  };

  // Filter events based on role and criteria
  const filteredEvents = useMemo(() => {
    return events.filter((evt) => {
      // Permission isolation
      if (isMitra && evt.sekolahMitra !== "Semua" && evt.sekolahMitra !== userSchool) {
        return false;
      }
      
      // Category isolation
      if (catFilter !== "Semua" && evt.kategori !== catFilter) {
        return false;
      }

      // Timeframe isolation (default: near-future ~1 month)
      if (timeFilter === "near") {
        return isWithinNearMonth(evt.tanggal);
      }

      return true;
    });
  }, [events, session, catFilter, timeFilter, isMitra, userSchool]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!namaEvent.trim() || !tanggal || !deskripsi.trim()) return;
    
    // Format to "DD-MMM-YYYY"
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

  const handleOpenEdit = (evt: EventTracker) => {
    setEditingEvent(evt);
    setEditNamaEvent(evt.namaEvent);
    
    // Convert "DD-MMM-YYYY" format back to "YYYY-MM-DD" style
    const parsed = parseEventDate(evt.tanggal);
    const yStr = parsed.getFullYear();
    const mStr = String(parsed.getMonth() + 1).padStart(2, "0");
    const dStr = String(parsed.getDate()).padStart(2, "0");
    setEditTanggal(`${yStr}-${mStr}-${dStr}`);

    setEditTargetSchool(evt.sekolahMitra);
    setEditKategori(evt.kategori);
    setEditDeskripsi(evt.deskripsi);
  };

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingEvent || !editNamaEvent.trim() || !editTanggal || !editDeskripsi.trim()) return;

    const dateObj = new Date(editTanggal);
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const formattedDate = `${dateObj.getDate()}-${months[dateObj.getMonth()]}-${dateObj.getFullYear()}`;

    onUpdateEvent?.(editingEvent.id, editNamaEvent, formattedDate, editTargetSchool, editKategori, editDeskripsi);
    setEditingEvent(null);
  };

  const handleDelete = (id: string) => {
    onDeleteEvent?.(id);
  };

  return (
    <div id="event-tracker-root" className="space-y-6">
      <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold text-slate-800 tracking-tight">Timeline & Kalender Bimtek</h2>
            <p className="text-xs text-slate-400 mt-1">
              {isMitra 
                ? `Jadwal audit, bimtek akreditasi kas, dan rapat evaluasi keuangan terstruktur untuk ${userSchool}`
                : "Tata kelola agenda timeline audit, bimtek operasional kas, dan sertifikasi Lazuardi"}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Quick Time Selector Toggle */}
            <div className="flex bg-slate-100/50 p-1.5 rounded-xl border border-slate-150/50">
              <button
                onClick={() => setTimeFilter("near")}
                className={`text-xs font-bold px-3 py-1.5 rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
                  timeFilter === "near" 
                    ? "bg-blue-900 text-white shadow-xs" 
                    : "text-slate-500 hover:text-slate-800"
                }`}
              >
                <CalendarDays className="w-3.5 h-3.5" />
                1 Bulan Terdekat
              </button>
              <button
                onClick={() => setTimeFilter("all")}
                className={`text-xs font-bold px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                  timeFilter === "all" 
                    ? "bg-blue-900 text-white shadow-xs" 
                    : "text-slate-500 hover:text-slate-800"
                }`}
              >
                Semua Jadwal
              </button>
            </div>

            {!isMitra && (
              <button
                onClick={() => setShowCreateModal(true)}
                className="bg-yellow-400 hover:bg-yellow-500 text-slate-900 font-extrabold text-xs px-4 py-2.5 rounded-xl transition-all shadow-md flex items-center gap-1.5 cursor-pointer"
              >
                <Plus className="w-4 h-4 text-blue-900" />
                Tambah Kegiatan
              </button>
            )}

            {/* Filter Toggle */}
            <select
              value={catFilter}
              onChange={(e) => setCatFilter(e.target.value)}
              className="px-3 py-2 text-xs bg-slate-50 hover:bg-slate-100/50 border border-slate-200 rounded-xl outline-hidden focus:ring-2 focus:ring-blue-500/10 focus:border-blue-900 font-semibold text-slate-700 cursor-pointer"
            >
              <option value="Semua">Semua Agenda</option>
              {categories.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Dynamic Warning Notification for Filter time: "1 Bulan Terdekat" */}
        {timeFilter === "near" && (
          <div className="mt-5 p-3 px-4 bg-blue-50/50 border border-blue-100 rounded-2xl flex items-center gap-2.5 text-[11px] text-blue-900 font-semibold leading-relaxed">
            <AlertCircle className="w-4 h-4 text-blue-800 flex-shrink-0" />
            <span>
              Menyajikan Agenda Dekat (Rentang Waktu: 10 Juni 2026 s/d 11 Juli 2026).
              Ubah filter menjadi <strong>"Semua Jadwal"</strong> pada tombol kanan atas untuk meninjau seluruh agenda semester.
            </span>
          </div>
        )}

        {/* Timeline Layout */}
        <div className="mt-8 relative border-l-2 border-slate-100 pl-6 ml-4 space-y-8">
          {filteredEvents.length > 0 ? (
            filteredEvents.map((evt) => {
              const itemCat = evt.kategori;
              let badgeColor = "bg-slate-100 text-slate-700 border-slate-200/50";
              if (itemCat === "Audit") badgeColor = "bg-rose-50 text-rose-700 border-rose-200/30";
              if (itemCat === "Bimtek") badgeColor = "bg-teal-50 text-teal-700 border-teal-200/30";
              if (itemCat === "Rapat Kurikulum") badgeColor = "bg-blue-50 text-blue-700 border-blue-200/35";

              return (
                <div key={evt.id} className="relative group">
                  {/* Timeline point node */}
                  <div className="absolute -left-[35px] top-1.5 w-4.5 h-4.5 rounded-full bg-white border-4 border-blue-900 shadow-xs group-hover:scale-125 transition-transform" />

                  <div className="bg-slate-50/50 border border-slate-100/80 rounded-2xl p-5 hover:bg-white hover:shadow-xs transition-all duration-200 max-w-3xl flex flex-col md:flex-row md:items-start justify-between gap-4">
                    <div className="space-y-3 flex-1">
                      <div className="space-y-1">
                        <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest font-mono flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5 text-blue-900" />
                          {evt.tanggal}
                        </span>
                        <h3 className="text-sm font-extrabold text-slate-800 tracking-tight leading-snug">
                          {evt.namaEvent}
                        </h3>
                      </div>

                      <p className="text-xs text-slate-500 leading-relaxed font-normal">{evt.deskripsi}</p>

                      <div className="flex flex-wrap items-center gap-1.5 pt-1">
                        <span className={`text-[9px] font-extrabold px-2 py-0.5 rounded-md border text-center ${badgeColor}`}>
                          {itemCat}
                        </span>
                        <span className="text-[9px] font-bold px-2 py-0.5 bg-slate-100 border border-slate-200/20 rounded-md text-slate-500 flex items-center gap-1">
                          <School className="w-3.5 h-3.5 text-yellow-500" />
                          {evt.sekolahMitra === "Semua" ? "Kolektif / Semua" : evt.sekolahMitra}
                        </span>
                      </div>
                    </div>

                    {/* Admin Access Controls */}
                    {!isMitra && (
                      <div className="flex sm:flex-col md:flex-row items-center gap-1.5 self-start md:self-center">
                        <button
                          onClick={() => handleOpenEdit(evt)}
                          title="Ubah Agenda"
                          className="p-2 text-slate-500 hover:text-blue-900 hover:bg-slate-100 border border-slate-200 rounded-xl transition-all cursor-pointer"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDelete(evt.id)}
                          title="Hapus Agenda"
                          className="p-2 text-rose-500 hover:text-rose-700 hover:bg-slate-100 border border-slate-200 rounded-xl transition-all cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    )}
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

      {/* Write Event Modal */}
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
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-2 font-semibold">Kategori</label>
                  <select
                    value={kategori}
                    onChange={(e) => setKategori(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl outline-hidden focus:ring-2 focus:ring-blue-500/10 focus:border-blue-900 font-semibold text-slate-700 cursor-pointer"
                  >
                    {categories.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
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

      {/* Editing Event Modal */}
      {editingEvent && (
        <div className="fixed inset-0 z-100 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white rounded-3xl overflow-hidden shadow-2xl border border-slate-100 animate-fade-in">
            <div className="bg-blue-900 text-white p-5 text-center">
              <h3 className="font-extrabold uppercase tracking-widest text-xs text-yellow-300">Edit / Perbarui Kegiatan</h3>
              <p className="text-xs text-slate-200 mt-1">Sistem Kalender Lazuardi</p>
            </div>
            
            <form onSubmit={handleEditSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-2">Tanggal Kegiatan</label>
                  <input
                    required
                    type="date"
                    value={editTanggal}
                    onChange={(e) => setEditTanggal(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl outline-hidden focus:ring-2 focus:ring-blue-500/10 focus:border-blue-900 font-medium text-slate-700"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-2 font-semibold">Kategori</label>
                  <select
                    value={editKategori}
                    onChange={(e) => setEditKategori(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl outline-hidden focus:ring-2 focus:ring-blue-500/10 focus:border-blue-900 font-semibold text-slate-700 cursor-pointer"
                  >
                    {categories.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-2">Sasaran Sekolah Mitra</label>
                <select
                  value={editTargetSchool}
                  onChange={(e) => setEditTargetSchool(e.target.value)}
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
                  value={editNamaEvent}
                  onChange={(e) => setEditNamaEvent(e.target.value)}
                  placeholder="Misal: Visitasi Verifikasi Kas Kecil..."
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl outline-hidden focus:ring-2 focus:ring-blue-500/10 focus:border-blue-900 font-medium text-slate-700"
                />
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-2 font-semibold">Deskripsi Agenda</label>
                <textarea
                  required
                  rows={3}
                  value={editDeskripsi}
                  onChange={(e) => setEditDeskripsi(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl outline-hidden focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 font-medium text-slate-700"
                  placeholder="Terangkan teknis pengerjaan, persyaratan, atau personil yang terlibat..."
                />
              </div>

              <div className="grid grid-cols-2 gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingEvent(null)}
                  className="py-2 text-xs font-bold text-slate-500 hover:text-slate-700 hover:bg-slate-50 border border-slate-200 rounded-xl transition-all cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="py-2 text-xs font-semibold text-slate-900 bg-yellow-400 hover:bg-yellow-500 rounded-xl shadow-md transition-all cursor-pointer flex items-center justify-center gap-1"
                >
                  ✓ Perbarui Agenda
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
