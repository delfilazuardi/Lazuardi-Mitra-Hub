import React, { useState } from "react";
import { KPIMitra, UserSession } from "../types";
import {
  Award,
  Search,
  Plus,
  Calendar,
  TrendingUp,
  CheckCircle2,
  HelpCircle,
  FileSpreadsheet,
  Layers,
  ArrowRight,
  Filter,
  CheckCircle,
  AlertCircle
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface KPIMitraViewProps {
  kpis: KPIMitra[];
  session: UserSession;
  onAddKPI: (newKpi: Omit<KPIMitra, "id" | "progress">) => void;
  lang: "id" | "en";
  refreshing: boolean;
}

export default function KPIMitraView({
  kpis,
  session,
  onAddKPI,
  lang,
  refreshing
}: KPIMitraViewProps) {
  const [search, setSearch] = useState("");
  const [selectedYear, setSelectedYear] = useState("2025/2026");
  const [selectedCat, setSelectedCat] = useState("Semua");
  const [showAddForm, setShowAddForm] = useState(false);

  // Form states for adding new KPI
  const [formData, setFormData] = useState({
    idKpi: "",
    kategori: "Strategic Alignment",
    kpi: "",
    program: "",
    target: 100,
    satuan: "%",
    realisasi: 0,
    tahunAjaran: "2025/2026"
  });

  const [formError, setFormError] = useState("");

  const categories = ["Semua", ...Array.from(new Set(kpis.map((k) => k.kategori)))].filter(Boolean);
  const academicYears = [
    "2022/2023",
    "2023/2024",
    "2024/2025",
    "2025/2026",
    "2026/2027",
    "2027/2028"
  ];

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");

    if (!formData.idKpi.trim()) {
      setFormError(lang === "id" ? "Kode/ID KPI tidak boleh kosong!" : "ID KPI is required!");
      return;
    }
    if (!formData.kpi.trim()) {
      setFormError(lang === "id" ? "Nama/Deskripsi KPI tidak boleh kosong!" : "KPI name is required!");
      return;
    }
    if (!formData.program.trim()) {
      setFormError(lang === "id" ? "Program Mitra Office tidak boleh kosong!" : "Program name is required!");
      return;
    }

    onAddKPI({
      idKpi: formData.idKpi.trim(),
      kategori: formData.kategori,
      kpi: formData.kpi.trim(),
      program: formData.program.trim(),
      target: Number(formData.target),
      realisasi: Number(formData.realisasi),
      satuan: formData.satuan,
      tahunAjaran: formData.tahunAjaran
    });

    // Reset Form
    setFormData({
      idKpi: "",
      kategori: "Strategic Alignment",
      kpi: "",
      program: "",
      target: 100,
      satuan: "%",
      realisasi: 0,
      tahunAjaran: formData.tahunAjaran
    });
    setShowAddForm(false);
  };

  // Filter KPI list based on search, category selection, and selected Academic Year
  const filteredKpis = kpis.filter((k) => {
    const matchesYear = k.tahunAjaran === selectedYear;
    const matchesCat = selectedCat === "Semua" || k.kategori === selectedCat;
    const matchesSearch =
      k.idKpi.toLowerCase().includes(search.toLowerCase()) ||
      k.kpi.toLowerCase().includes(search.toLowerCase()) ||
      k.program.toLowerCase().includes(search.toLowerCase()) ||
      k.kategori.toLowerCase().includes(search.toLowerCase());

    return matchesYear && matchesCat && matchesSearch;
  });

  // KPI Overall stats for selected Academic Year
  const yearStats = React.useMemo(() => {
    const yearKpis = kpis.filter((k) => k.tahunAjaran === selectedYear);
    const count = yearKpis.length;
    if (count === 0) return { avgProgress: 0, completedCount: 0 };

    const totalProgress = yearKpis.reduce((acc, curr) => acc + (curr.progress || 0), 0);
    const completed = yearKpis.filter((k) => (curr => (curr.progress || 0) >= 100)(k)).length;

    return {
      avgProgress: Math.round(totalProgress / count),
      completedCount: completed
    };
  }, [kpis, selectedYear]);

  return (
    <div className="space-y-6" id="kpi-mitra-view-container">
      {/* 1. Page Header with Title and Quick Filter Info */}
      <div className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-sm flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-36 h-36 bg-blue-900/5 rounded-full blur-2xl pointer-events-none" />
        <div className="flex items-start gap-4">
          <div className="p-3.5 bg-blue-900 text-yellow-400 rounded-2xl flex items-center justify-center shadow-md shadow-blue-900/10">
            <Award className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-extrabold tracking-tight text-slate-900">
              {lang === "id" ? "Indikator Kinerja Utama (KPI)" : "Key Performance Indicators (KPI)"}
            </h1>
            <p className="text-xs text-slate-500 leading-relaxed mt-1">
              {lang === "id"
                ? "Pantau tingkat ketercapaian strategis operasional mitra office Lazuardi per tahun ajaran."
                : "Monitor strategic and operational Lazuardi partner office performance rates per academic year."}
            </p>
          </div>
        </div>

        {/* Year Dropdown & Add Button Action */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="bg-slate-50 border border-slate-250/70 p-1 px-3 rounded-2xl flex items-center gap-2">
            <Calendar className="w-4 h-4 text-slate-500" />
            <span className="text-xs font-bold text-slate-500">Tahun Ajaran:</span>
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
              className="text-xs font-extrabold text-blue-950 bg-transparent border-none focus:outline-none focus:ring-0 cursor-pointer"
            >
              {academicYears.map((yr) => (
                <option key={yr} value={yr}>
                  {yr}
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="flex items-center gap-2 bg-blue-950 hover:bg-blue-900 text-yellow-400 font-bold px-4 py-2.5 rounded-2xl text-xs transition-all shadow-md shadow-blue-950/10"
          >
            <Plus className="w-4 h-4" />
            <span>{lang === "id" ? "Tambah KPI" : "Add KPI"}</span>
          </button>
        </div>
      </div>

      {/* 2. Quick Progress Summary Ring Boxes */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white border border-slate-200/80 p-5 rounded-3xl shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[10px] uppercase tracking-wider font-extrabold text-slate-400 block">
              {lang === "id" ? "RATA-RATA PROGRESS KPI" : "KPI AVERAGE PROGRESS"}
            </span>
            <span className="text-3xl font-extrabold text-blue-950 block mt-1.5">
              {yearStats.avgProgress}%
            </span>
            <span className="text-[11px] text-slate-500 block mt-1">
              {lang === "id" ? `Tahun Ajaran ${selectedYear}` : `Academic Year ${selectedYear}`}
            </span>
          </div>
          <div className="w-14 h-14 rounded-full border-4 border-slate-100 flex items-center justify-center relative">
            <svg className="w-full h-full transform -rotate-90">
              <circle
                cx="28"
                cy="28"
                r="22"
                fill="transparent"
                stroke="#e2e8f0"
                strokeWidth="4"
              />
              <circle
                cx="28"
                cy="28"
                r="22"
                fill="transparent"
                stroke="#1e3a8a"
                strokeWidth="4"
                strokeDasharray={2 * Math.PI * 22}
                strokeDashoffset={2 * Math.PI * 22 * (1 - yearStats.avgProgress / 100)}
              />
            </svg>
            <span className="absolute text-[10px] font-bold text-blue-950">{yearStats.avgProgress}%</span>
          </div>
        </div>

        <div className="bg-white border border-slate-200/80 p-5 rounded-3xl shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[10px] uppercase tracking-wider font-extrabold text-slate-400 block">
              {lang === "id" ? "TOTAL TARGET DIKONTROL" : "TOTAL MANAGED KPIS"}
            </span>
            <span className="text-3xl font-extrabold text-blue-950 block mt-1.5">
              {filteredKpis.length} / {kpis.filter((k) => k.tahunAjaran === selectedYear).length}
            </span>
            <span className="text-[11px] text-slate-500 block mt-1">
              {lang === "id" ? "KPI terdistribusi aktif" : "Active distributed KPIs"}
            </span>
          </div>
          <div className="p-3 bg-blue-50 text-blue-900 rounded-2xl flex items-center justify-center">
            <Layers className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white border border-slate-200/80 p-5 rounded-3xl shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[10px] uppercase tracking-wider font-extrabold text-slate-400 block">
              {lang === "id" ? "KPI Tuntas (100%)" : "COMPLETED KPIS (100%)"}
            </span>
            <span className="text-3xl font-extrabold text-emerald-600 block mt-1.5">
              {yearStats.completedCount}
            </span>
            <span className="text-[11px] text-slate-550 block mt-1">
              {lang === "id" ? "Kinerja tercapai sempurna" : "Performance fully achieved"}
            </span>
          </div>
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center">
            <CheckCircle2 className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* 3. Add KPI Form Dropdown Accordion */}
      <AnimatePresence>
        {showAddForm && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="bg-slate-900 border border-slate-800 rounded-3xl p-6 text-white shadow-xl"
            id="kpi-form-block"
          >
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2 text-yellow-400 font-bold">
                <Plus className="w-4 h-4" />
                <h3 className="text-sm font-extrabold">
                  {lang === "id" ? "Tambah Data KPI Baru" : "Add New KPI Metric Data"}
                </h3>
              </div>
              <button
                onClick={() => setShowAddForm(false)}
                className="text-slate-400 hover:text-white text-xs font-bold bg-slate-800 p-1 px-2.5 rounded-lg"
              >
                ✕
              </button>
            </div>

            {formError && (
              <div className="p-3 bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs rounded-xl mb-4 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-400 flex-shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleFormSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-5">
              <div>
                <label className="block text-[11px] text-slate-400 font-bold uppercase mb-1.5">
                  {lang === "id" ? "Kode / ID KPI" : "KPI ID / Code"} *
                </label>
                <input
                  type="text"
                  placeholder="Contoh: 1.5 atau 3.4"
                  value={formData.idKpi}
                  onChange={(e) => setFormData({ ...formData, idKpi: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700/80 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-yellow-400 transition-all font-mono"
                />
              </div>

              <div>
                <label className="block text-[11px] text-slate-400 font-bold uppercase mb-1.5">
                  {lang === "id" ? "Kategori KPI" : "KPI Category"} *
                </label>
                <select
                  value={formData.kategori}
                  onChange={(e) => setFormData({ ...formData, kategori: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700/80 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-yellow-400 transition-all cursor-pointer"
                >
                  <option value="Strategic Alignment">Strategic Alignment</option>
                  <option value="Governance">Governance</option>
                  <option value="Data & Dashboard">Data & Dashboard</option>
                  <option value="Financial">Financial</option>
                  <option value="Partner Support">Partner Support</option>
                  <option value="Needs Development">Needs Development</option>
                  <option value="MER">MER</option>
                  <option value="Project Management">Project Management</option>
                  <option value="Program Quality">Program Quality</option>
                  <option value="Ethics">Ethics</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] text-slate-400 font-bold uppercase mb-1.5">
                  {lang === "id" ? "Tahun Ajaran" : "Academic Year"}
                </label>
                <select
                  value={formData.tahunAjaran}
                  onChange={(e) => setFormData({ ...formData, tahunAjaran: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700/80 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-yellow-400 transition-all cursor-pointer"
                >
                  {academicYears.map((yr) => (
                    <option key={yr} value={yr}>
                      {yr}
                    </option>
                  ))}
                </select>
              </div>

              <div className="md:col-span-2">
                <label className="block text-[11px] text-slate-400 font-bold uppercase mb-1.5">
                  {lang === "id" ? "Fokus / Target KPI" : "KPI Target / Focus Name"} *
                </label>
                <input
                  type="text"
                  placeholder="Misal: Roadmap Coverage, SLA Compliance, Data Submission"
                  value={formData.kpi}
                  onChange={(e) => setFormData({ ...formData, kpi: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700/80 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-yellow-400 transition-all"
                />
              </div>

              <div>
                <label className="block text-[11px] text-slate-400 font-bold uppercase mb-1.5">
                  {lang === "id" ? "Satuan Pengukuran" : "Unit of Measure"}
                </label>
                <input
                  type="text"
                  placeholder="Contoh: % atau Hari atau Laporan"
                  value={formData.satuan}
                  onChange={(e) => setFormData({ ...formData, satuan: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700/80 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-yellow-400 transition-all"
                />
              </div>

              <div className="md:col-span-3">
                <label className="block text-[11px] text-slate-400 font-bold uppercase mb-1.5">
                  {lang === "id" ? "Nama Program atau Event Mitra Office" : "Program or Event Name"} *
                </label>
                <input
                  type="text"
                  placeholder="Contoh: LATOF Akademik, LATOF Bisnis, RAKER, Magang, Visitasi"
                  value={formData.program}
                  onChange={(e) => setFormData({ ...formData, program: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700/80 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-yellow-400 transition-all"
                />
              </div>

              <div>
                <label className="block text-[11px] text-slate-400 font-bold uppercase mb-1.5">
                  {lang === "id" ? "Target Angka" : "Numerical Target Amount"}
                </label>
                <input
                  type="number"
                  min="0"
                  value={formData.target}
                  onChange={(e) => setFormData({ ...formData, target: Number(e.target.value) })}
                  className="w-full bg-slate-800 border border-slate-700/80 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-yellow-400 transition-all font-mono"
                />
              </div>

              <div>
                <label className="block text-[11px] text-slate-400 font-bold uppercase mb-1.5">
                  {lang === "id" ? "Realisasi Awal" : "Initial Realization"}
                </label>
                <input
                  type="number"
                  min="0"
                  value={formData.realisasi}
                  onChange={(e) => setFormData({ ...formData, realisasi: Number(e.target.value) })}
                  className="w-full bg-slate-800 border border-slate-700/80 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-yellow-400 transition-all font-mono"
                />
              </div>

              <div className="flex items-end justify-end">
                <button
                  type="submit"
                  className="bg-yellow-400 hover:bg-yellow-500 text-slate-900 font-extrabold px-5 py-2 rounded-xl text-xs flex items-center gap-1.5 transition-all shadow-md shadow-yellow-400/20 w-full md:w-auto h-[38px] justify-center"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>{lang === "id" ? "Simpan KPI ke Sheet" : "Save KPI to Sheet"}</span>
                </button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 4. Filter, Search, Table section */}
      <div className="bg-white border border-slate-200/80 rounded-3xl overflow-hidden shadow-xs">
        {/* Search & Category Filter Section */}
        <div className="p-4 border-b border-slate-100 flex flex-col md:flex-row gap-3 items-center justify-between">
          <div className="relative w-full md:max-w-xs">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 transform -translate-y-1/2" />
            <input
              type="text"
              placeholder={lang === "id" ? "Cari KPI, Program..." : "Search KPI, Program..."}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 text-xs rounded-xl pl-9 pr-4 py-2.5 focus:outline-none focus:border-blue-900 transition-all text-slate-800 placeholder-slate-400"
            />
          </div>

          <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto pb-1 md:pb-0 scrollbar-none">
            <Filter className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
            <span className="text-[10px] uppercase font-bold text-slate-400 flex-shrink-0 mr-1">
              Category:
            </span>
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCat(cat)}
                className={`text-[11px] font-bold px-3 py-1.5 rounded-xl transition-all cursor-pointer whitespace-nowrap ${
                  selectedCat === cat
                    ? "bg-blue-900 text-yellow-400"
                    : "bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-100"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* List of KPIs */}
        {filteredKpis.length === 0 ? (
          <div className="p-16 text-center">
            <div className="w-12 h-12 bg-slate-50 text-slate-400 rounded-full flex items-center justify-center mx-auto mb-3">
              <Award className="w-6 h-6" />
            </div>
            <h4 className="text-sm font-bold text-slate-800">No KPIs Found</h4>
            <p className="text-xs text-slate-450 mt-1">
              Tidak ada data indikator kinerja utama yang cocok dengan filter aktif.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100 text-[10px] font-extrabold text-slate-450 uppercase tracking-wider">
                  <th className="py-3.5 px-6 font-mono">Kode ID</th>
                  <th className="py-3.5 px-4">Kategori</th>
                  <th className="py-3.5 px-4">Target Indikator (KPI)</th>
                  <th className="py-3.5 px-4">Program & Event</th>
                  <th className="py-3.5 px-4 text-center">Ketercapaian</th>
                  <th className="py-3.5 px-6 text-right">Progress</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {filteredKpis.map((k, idx) => {
                  const isDone = k.progress >= 100;
                  return (
                    <tr
                      key={k.id || idx}
                      className="hover:bg-slate-50/55 transition-colors group"
                    >
                      {/* ID KPI */}
                      <td className="py-4 px-6 font-bold font-mono text-blue-900/90 whitespace-nowrap">
                        {k.idKpi}
                      </td>

                      {/* Kategori Badge */}
                      <td className="py-4 px-4 font-semibold text-slate-600">
                        <span className="bg-slate-100 text-slate-700 p-1 px-2.5 rounded-lg text-[10px]">
                          {k.kategori}
                        </span>
                      </td>

                      {/* Target KPI Description */}
                      <td className="py-4 px-4 font-bold text-slate-800 max-w-xs block lg:max-w-sm truncate group-hover:text-clip group-hover:whitespace-normal">
                        {k.kpi}
                      </td>

                      {/* Program list */}
                      <td className="py-4 px-4 text-slate-550 max-w-xs">
                        {k.program ? (
                          <div className="flex flex-wrap gap-1">
                            {k.program.split(",").map((p, pIdx) => (
                              <span
                                key={pIdx}
                                className="inline-block bg-blue-50 text-[10px] font-bold text-blue-900 px-2 py-0.5 rounded-md border border-blue-100/50"
                              >
                                {p.trim()}
                              </span>
                            ))}
                          </div>
                        ) : (
                          <span className="text-slate-400 italic font-mono text-[10px]">
                            {lang === "id" ? "(Belum ada program)" : "(No program associated)"}
                          </span>
                        )}
                      </td>

                      {/* Achievement target vs real */}
                      <td className="py-4 px-4 text-center whitespace-nowrap">
                        <div className="flex flex-col items-center">
                          <span className="font-extrabold text-slate-800">
                            {k.realisasi} / {k.target}
                          </span>
                          <span className="text-[10px] text-slate-400 font-bold">{k.satuan}</span>
                        </div>
                      </td>

                      {/* Progress bar visualizer */}
                      <td className="py-4 px-6 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-3 min-w-[140px]">
                          <div className="w-24 bg-slate-100 h-2 rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full transition-all duration-500 ${
                                isDone ? "bg-emerald-500" : "bg-blue-900"
                              }`}
                              style={{ width: `${Math.min(k.progress, 100)}%` }}
                            />
                          </div>
                          <span
                            className={`text-xs font-mono font-extrabold block text-right min-w-[36px] ${
                              isDone ? "text-emerald-600" : "text-slate-800"
                            }`}
                          >
                            {k.progress}%
                          </span>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* 5. Helpful Contextual Info */}
      <div className="p-5 bg-gradient-to-r from-blue-950 to-blue-900 border border-yellow-400/10 text-white rounded-3xl relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="absolute right-0 bottom-0 w-44 h-44 bg-yellow-400/5 rounded-full blur-2xl pointer-events-none" />
        <div className="flex items-center gap-3">
          <div className="p-2 bg-yellow-400 text-blue-950 rounded-xl">
            <TrendingUp className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-xs font-extrabold text-yellow-300 uppercase tracking-wider">
              {lang === "id" ? "Info Integrasi Aktivitas KPI" : "KPI ACTIVITY INTEGRATION INFO"}
            </h4>
            <p className="text-[11px] text-slate-300 leading-relaxed mt-1">
              {lang === "id"
                ? "Program yang sukses dilaksanakan pada modul BIMTEK / Event Lazuardi akan menaikkan persentase realisasi KPI terkait secara live."
                : "Successfully executed programs in the BIMTEK / Events module will automatically increment the performance of linked KPIs live."}
            </p>
          </div>
        </div>
        <div className="text-[10px] font-mono text-yellow-400/80 bg-white/5 border border-white/15 px-3 py-1.5 rounded-xl self-start md:self-auto">
          Source Sheet: [KPI MITRA]
        </div>
      </div>
    </div>
  );
}
