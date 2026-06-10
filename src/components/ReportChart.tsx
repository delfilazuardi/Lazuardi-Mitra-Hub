import React, { useState } from "react";
import { ReportRecord } from "../types";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { motion } from "motion/react";
import { HelpCircle, BarChart3, PieChart as PieIcon, School } from "lucide-react";

interface ChartProps {
  records: ReportRecord[];
}

export default function ReportChart({ records }: ChartProps) {
  const [activeTab, setActiveTab] = useState<"monthly" | "audit" | "schools">("monthly");

  // 1. Calculate Monthly Trend Data
  const monthlyDataMap: { [key: string]: { monthName: string; sudah: number; belum: number; total: number } } = {};
  
  // Custom sorting of months
  const monthOrder = ["Juli", "Agustus", "September", "Oktober", "November", "Desember", "Januari", "Februari", "Maret", "April", "Mei", "Juni"];
  const getMonthSortValue = (bulan: string, tahun: number) => {
    const idx = monthOrder.indexOf(bulan.trim());
    return tahun * 12 + (idx !== -1 ? idx : 0);
  };

  records.forEach((r) => {
    const key = `${r.bulan} ${r.tahun}`;
    if (!monthlyDataMap[key]) {
      monthlyDataMap[key] = { monthName: key, sudah: 0, belum: 0, total: 0 };
    }
    if (r.statusLaporan === "Sudah Kirim") {
      monthlyDataMap[key].sudah += 1;
    } else {
      monthlyDataMap[key].belum += 1;
    }
    monthlyDataMap[key].total += 1;
  });

  const monthlyTrendData = Object.values(monthlyDataMap).sort((a, b) => {
    const [bulanA, tahunA] = a.monthName.split(" ");
    const [bulanB, tahunB] = b.monthName.split(" ");
    return getMonthSortValue(bulanA, parseInt(tahunA)) - getMonthSortValue(bulanB, parseInt(tahunB));
  });

  // 2. Audit Status Pie Chart
  const selesaiCount = records.filter((r) => r.statusAudit === "Selesai").length;
  const revisiCount = records.filter((r) => r.statusAudit === "Revisi").length;
  const belumAuditCount = records.filter((r) => r.statusAudit === "Belum Diaudit").length;
  const totalAuditedPeriod = selesaiCount + revisiCount + belumAuditCount;

  const auditStatusData = [
    { name: "Selesai", value: selesaiCount, color: "#14b8a6" },     // Teal 500
    { name: "Perlu Revisi", value: revisiCount, color: "#f59e0b" },  // Amber 500
    { name: "Belum Diaudit", value: belumAuditCount, color: "#64748b" }, // Slate 500
  ].filter(item => item.value > 0);

  // 3. School Submission Rates
  const schoolComplianceMap: { [key: string]: { name: string; kirim: number; total: number } } = {};
  records.forEach((r) => {
    if (!schoolComplianceMap[r.sekolahMitra]) {
      schoolComplianceMap[r.sekolahMitra] = { name: r.sekolahMitra, kirim: 0, total: 0 };
    }
    schoolComplianceMap[r.sekolahMitra].total += 1;
    if (r.statusLaporan === "Sudah Kirim") {
      schoolComplianceMap[r.sekolahMitra].kirim += 1;
    }
  });

  const schoolComplianceData = Object.values(schoolComplianceMap)
    .map((s) => ({
      name: s.name,
      Kepatuhan: Math.round((s.kirim / s.total) * 100),
      "Sudah Kirim": s.kirim,
      "Belum Kirim": s.total - s.kirim,
    }))
    .sort((a, b) => b.Kepatuhan - a.Kepatuhan);

  return (
    <div id="chart-section" className="bg-white border border-slate-100 rounded-2xl p-6 shadow-xs">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="text-lg font-bold text-slate-800 tracking-tight">Analisis Visual & Kepatuhan</h2>
          <p className="text-xs text-slate-400 mt-1">Gunakan tab di bawah untuk melihat pola pengarsipan dan progres audit</p>
        </div>
        
        {/* Toggle tabs */}
        <div className="flex bg-slate-50 p-1 rounded-xl border border-slate-100/80 self-start">
          <button
            id="tab-monthly-trend"
            onClick={() => setActiveTab("monthly")}
            className={`flex items-center gap-2 text-xs font-semibold px-3 py-2 rounded-lg transition-all ${
              activeTab === "monthly"
                ? "bg-white text-slate-800 shadow-xs"
                : "text-slate-400 hover:text-slate-600"
            }`}
          >
            <BarChart3 className="w-3.5 h-3.5" />
            Tren Bulanan
          </button>
          <button
            id="tab-audit-rate"
            onClick={() => setActiveTab("audit")}
            className={`flex items-center gap-2 text-xs font-semibold px-3 py-2 rounded-lg transition-all ${
              activeTab === "audit"
                ? "bg-white text-slate-800 shadow-xs"
                : "text-slate-400 hover:text-slate-600"
            }`}
          >
            <PieIcon className="w-3.5 h-3.5" />
            Distribusi Audit
          </button>
          <button
            id="tab-school-rate"
            onClick={() => setActiveTab("schools")}
            className={`flex items-center gap-2 text-xs font-semibold px-3 py-2 rounded-lg transition-all ${
              activeTab === "schools"
                ? "bg-white text-slate-800 shadow-xs"
                : "text-slate-400 hover:text-slate-600"
            }`}
          >
            <School className="w-3.5 h-3.5" />
            Komparasi Sekolah
          </button>
        </div>
      </div>

      <div className="h-[320px] w-full mt-4">
        {activeTab === "monthly" && (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={monthlyTrendData.slice(0, 12)} // show first 12 active months
              margin={{ top: 10, right: 10, left: -20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey="monthName" stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} />
              <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} allowDecimals={false} />
              <Tooltip 
                contentStyle={{ backgroundColor: "#1e293b", borderRadius: "12px", border: "none", color: "#fff" }} 
                labelStyle={{ fontWeight: "bold", fontSize: "12px", color: "#94a3b8" }}
              />
              <Legend verticalAlign="top" height={36} iconType="circle" wrapperStyle={{ fontSize: "12px" }} />
              <Bar dataKey="sudah" name="Sudah Kirim" fill="#10b981" radius={[4, 4, 0, 0]} stackId="a" />
              <Bar dataKey="belum" name="Belum Kirim" fill="#f43f5e" radius={[4, 4, 0, 0]} stackId="a" />
            </BarChart>
          </ResponsiveContainer>
        )}

        {activeTab === "audit" && (
          <div className="grid grid-cols-1 md:grid-cols-2 h-full items-center">
            <div className="h-[260px] md:h-[300px]">
              {auditStatusData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={auditStatusData}
                      cx="50%"
                      cy="50%"
                      innerRadius={65}
                      outerRadius={95}
                      paddingAngle={4}
                      dataKey="value"
                    >
                      {auditStatusData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ backgroundColor: "#1e293b", borderRadius: "12px", border: "none", color: "#fff" }} />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex h-full items-center justify-center text-slate-400 text-xs">Tidak ada data audit</div>
              )}
            </div>
            
            <div className="space-y-4 px-4">
              <h3 className="text-sm font-semibold text-slate-700">Status Penyelesaian Audit</h3>
              <p className="text-xs text-slate-400">Distribusi hasil tinjauan laporan dari tim auditor Lazuardi saat ini ({totalAuditedPeriod} terdaftar):</p>
              
              <div className="space-y-2.5 mt-2">
                {auditStatusData.map((item) => {
                  const percentage = totalAuditedPeriod > 0 ? Math.round((item.value / totalAuditedPeriod) * 100) : 0;
                  return (
                    <div key={item.name} className="flex items-center justify-between p-2 rounded-xl bg-slate-50 border border-slate-100">
                      <div className="flex items-center gap-2">
                        <span className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                        <span className="text-xs font-medium text-slate-600">{item.name}</span>
                      </div>
                      <div className="text-right">
                        <span className="text-xs font-bold text-slate-700 block">{item.value} Laporan</span>
                        <span className="text-[10px] text-slate-400">{percentage}% dari antrean</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {activeTab === "schools" && (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={schoolComplianceData}
              layout="vertical"
              margin={{ top: 5, right: 10, left: 30, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
              <XAxis type="number" stroke="#94a3b8" fontSize={11} unit="%" domain={[0, 100]} tickLine={false} axisLine={false} />
              <YAxis type="category" dataKey="name" stroke="#64748b" fontSize={10} width={95} tickLine={false} axisLine={false} />
              <Tooltip 
                formatter={(val) => [`${val}% Kepatuhan`]}
                contentStyle={{ backgroundColor: "#1e293b", borderRadius: "12px", border: "none", color: "#fff" }}
              />
              <Bar dataKey="Kepatuhan" fill="#3b82f6" radius={[0, 4, 4, 0]} barSize={12} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}
