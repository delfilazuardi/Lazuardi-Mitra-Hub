import React from "react";
import { ReportRecord, DashboardStats } from "../types";
import { Users, Send, AlertCircle, CheckCircle, HelpCircle, TrendingUp, RotateCcw } from "lucide-react";
import { motion } from "motion/react";

interface StatsProps {
  stats: DashboardStats;
}

export default function ReportStats({ stats }: StatsProps) {
  const cards = [
    {
      title: "Total Mitra Sekolah",
      value: stats.totalMitra,
      desc: "Sekolah mitra aktif dimonitor",
      icon: Users,
      color: "text-indigo-600 bg-indigo-50 border-indigo-200/50",
      delay: 0,
    },
    {
      title: "Tingkat Pengiriman",
      value: `${stats.persentaseKirim}%`,
      desc: "Kepatuhan pengantaran berkala",
      icon: TrendingUp,
      color: "text-emerald-600 bg-emerald-50 border-emerald-200/50",
      delay: 0.1,
      extra: `Selesai: ${stats.totalLaporanKirim} / Belum: ${stats.totalLaporanBelumKirim}`,
    },
    {
      title: "Sudah Audit (Selesai)",
      value: stats.totalSelesai,
      desc: "Laporan dinyatakan sesuai",
      icon: CheckCircle,
      color: "text-teal-600 bg-teal-50 border-teal-200/50",
      delay: 0.2,
    },
    {
      title: "Perlu Revisi",
      value: stats.totalRevisi,
      desc: "Laporan butuh perbaikan",
      icon: RotateCcw,
      color: "text-amber-600 bg-amber-50 border-amber-200/50",
      delay: 0.3,
    },
    {
      title: "Belum Diaudit",
      value: stats.totalBelumAudit,
      desc: "Dalam antrean verifikasi",
      icon: HelpCircle,
      color: "text-slate-600 bg-slate-50 border-slate-200/50",
      delay: 0.4,
    },
    {
      title: "Mitra Telat Kirim",
      value: stats.totalLaporanBelumKirim,
      desc: "Laporan masih tertunggak",
      icon: AlertCircle,
      color: "text-rose-600 bg-rose-50 border-rose-200/50",
      delay: 0.5,
    },
  ];

  return (
    <div id="stats-section" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
      {cards.map((card, i) => {
        const IconComponent = card.icon;
        return (
          <motion.div
            key={card.title}
            id={`stat-card-${i}`}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: card.delay }}
            whileHover={{ y: -4, transition: { duration: 0.2 } }}
            className={`p-4 bg-white border border-slate-100 rounded-2xl shadow-xs flex flex-col justify-between`}
          >
            <div className="flex items-start justify-between">
              <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">
                {card.title}
              </span>
              <div className={`p-2 rounded-xl border ${card.color}`}>
                <IconComponent className="w-4 h-4" />
              </div>
            </div>
            
            <div className="mt-4">
              <span className="text-2xl font-bold text-slate-800 tracking-tight block">
                {card.value}
              </span>
              <span className="text-xs text-slate-400 mt-1 block leading-snug">
                {card.desc}
              </span>
              {card.extra && (
                <div className="mt-2 text-[10px] bg-slate-50 text-slate-500 py-0.5 px-2 rounded-md inline-block font-mono">
                  {card.extra}
                </div>
              )}
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}
