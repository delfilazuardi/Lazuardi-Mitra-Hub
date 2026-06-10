import React, { useState } from "react";
import { UserRole, UserSession } from "../types";
import { GraduationCap, ShieldCheck, School, LogIn, Sparkles, Key, Eye, EyeOff } from "lucide-react";

interface LoginProps {
  onLoginSuccess: (session: UserSession) => void;
  schools: string[];
  users?: any[];
}

export default function LoginScreen({ onLoginSuccess, schools, users = [] }: LoginProps) {
  const [role, setRole] = useState<UserRole>("admin");
  const [selectedSchool, setSelectedSchool] = useState<string>(schools[0] || "Al-Falah Depok");
  const [email, setEmail] = useState("admin@lazuardi.com");
  const [password, setPassword] = useState("admin123");
  const [errorMsg, setErrorMsg] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleRoleChange = (newRole: UserRole) => {
    setRole(newRole);
    // Auto-update sample login info but user can still type their custom credentials if they want
    if (newRole === "admin") {
      const existingAdmin = users.find(u => u.role === "admin");
      setEmail(existingAdmin ? existingAdmin.email : "admin@lazuardi.com");
      setPassword(existingAdmin ? existingAdmin.password : "admin123");
    } else {
      const emailPattern = `bendahara.${selectedSchool.toLowerCase().replace(/\s+/g, "")}@lazuardi.com`;
      const existingMitra = users.find(u => u.sekolahName === selectedSchool);
      setEmail(existingMitra ? existingMitra.email : emailPattern);
      setPassword(existingMitra ? existingMitra.password : "mitra123");
    }
  };

  const handleSchoolChange = (schoolName: string) => {
    setSelectedSchool(schoolName);
    if (role === "sekolah_mitra") {
      const emailPattern = `bendahara.${schoolName.toLowerCase().replace(/\s+/g, "")}@lazuardi.com`;
      const existingMitra = users.find(u => u.sekolahName === schoolName);
      setEmail(existingMitra ? existingMitra.email : emailPattern);
      setPassword(existingMitra ? existingMitra.password : "mitra123");
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!password) {
      setErrorMsg("Password wajib diisi!");
      return;
    }

    // Dynamic database check
    const match = users.find(u => u.email.toLowerCase() === email.trim().toLowerCase() && u.password === password);
    if (match) {
      onLoginSuccess({
        username: match.username,
        role: match.role,
        sekolahName: match.sekolahName
      });
      return;
    }

    // Default Fallback checks in case of custom test logs
    if (email === "admin@lazuardi.com" && password === "admin123") {
      onLoginSuccess({
        username: "Pusat Lazuardi",
        role: "admin",
      });
      return;
    }

    if (password === "mitra123") {
      onLoginSuccess({
        username: `Bendahara ${selectedSchool}`,
        role: "sekolah_mitra",
        sekolahName: selectedSchool
      });
      return;
    }

    setErrorMsg("E-mail atau password salah! Silakan coba lagi.");
  };

  // Quick Login triggers
  const handleQuickLogin = (targetRole: UserRole, targetSchool?: string) => {
    if (targetRole === "admin") {
      const match = users.find(u => u.role === "admin") || { username: "Pusat Lazuardi" };
      onLoginSuccess({
        username: match.username,
        role: "admin"
      });
    } else {
      const name = targetSchool || "SMA Lazuardi";
      const match = users.find(u => u.sekolahName === name) || { username: `Bendahara ${name}` };
      onLoginSuccess({
        username: match.username,
        role: "sekolah_mitra",
        sekolahName: name
      });
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4 relative overflow-hidden" style={{ backgroundImage: "radial-gradient(circle at 10% 20%, rgba(30, 58, 138, 0.9) 0%, rgba(15, 23, 42, 1) 90%)" }}>
      {/* Visual background decorations in yellow/blue */}
      <div className="absolute top-[-10%] right-[-10%] w-96 h-96 rounded-full bg-yellow-400/20 blur-3xl pointer-events-none" />
      <div className="absolute bottom-[-10%] left-[-10%] w-96 h-96 rounded-full bg-blue-600/30 blur-3xl pointer-events-none" />

      <div className="w-full max-w-md bg-white border border-slate-100 rounded-3xl shadow-2xl overflow-hidden relative">
        
        {/* Banner with Blue and Yellow institutional styling */}
        <div className="bg-gradient-to-r from-blue-900 to-blue-800 p-6 text-center text-white relative">
          <div className="absolute top-0 left-0 w-full h-full bg-yellow-400 opacity-5" style={{ backgroundImage: "repeating-linear-gradient(45deg, transparent, transparent 10px, currentColor 10px, currentColor 20px)" }} />
          
          <div className="w-14 h-14 bg-yellow-400 text-blue-950 rounded-2xl flex items-center justify-center shadow-lg mx-auto mb-3 border-2 border-white transform hover:rotate-6 transition-transform">
            <GraduationCap className="w-8 h-8" />
          </div>
          
          <h1 className="text-xl font-extrabold tracking-tight">Lazuardi Mitra Hub</h1>
          <p className="text-xs text-yellow-300 font-semibold mt-1 uppercase tracking-wider">Sistem Monitoring & Audit Sekolah Mitra</p>
        </div>

        {/* Content Form */}
        <div className="p-6">
          
          {/* Quick Login Assist */}
          <div className="mb-6 p-3 bg-blue-50 border border-blue-100 rounded-xl">
            <span className="text-[10px] font-bold text-blue-800 uppercase tracking-wider block mb-2 flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-yellow-500 fill-yellow-400" />
              Demo Quick-Access (Login Instan)
            </span>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => handleQuickLogin("admin")}
                className="py-1.5 px-3 text-[11px] font-bold bg-blue-900 hover:bg-blue-800 text-white rounded-lg transition-colors flex items-center justify-center gap-1 cursor-pointer"
              >
                <ShieldCheck className="w-3.5 h-3.5 text-yellow-300" />
                Masuk as Admin
              </button>
              <button
                type="button"
                onClick={() => handleQuickLogin("sekolah_mitra", "SMA Lazuardi")}
                className="py-1.5 px-3 text-[11px] font-bold bg-yellow-400 hover:bg-yellow-500 text-slate-900 rounded-lg transition-colors flex items-center justify-center gap-1 cursor-pointer"
              >
                <School className="w-3.5 h-3.5 text-blue-900" />
                Masuk as Mitra
              </button>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            
            {/* Role Tab Selector */}
            <div>
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-2">Pilih Peran Hub</label>
              <div className="grid grid-cols-2 gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200/40">
                <button
                  type="button"
                  onClick={() => handleRoleChange("admin")}
                  className={`py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1 cursor-pointer ${
                    role === "admin"
                      ? "bg-blue-900 text-white shadow-xs"
                      : "text-slate-500 hover:text-slate-700"
                  }`}
                >
                  <ShieldCheck className={`w-3.5 h-3.5 ${role === "admin" ? "text-yellow-400" : ""}`} />
                  Administrator
                </button>
                <button
                  type="button"
                  onClick={() => handleRoleChange("sekolah_mitra")}
                  className={`py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1 cursor-pointer ${
                    role === "sekolah_mitra"
                      ? "bg-yellow-400 text-slate-900 shadow-xs"
                      : "text-slate-500 hover:text-slate-700"
                  }`}
                >
                  <School className={`w-3.5 h-3.5 ${role === "sekolah_mitra" ? "text-blue-900" : ""}`} />
                  Sekolah Mitra
                </button>
              </div>
            </div>

            {/* School Selector if Mitra Role selected */}
            {role === "sekolah_mitra" && (
              <div className="animated-fade-in">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1.5">Instansi Sekolah Mitra</label>
                <select
                  value={selectedSchool}
                  onChange={(e) => handleSchoolChange(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl outline-hidden focus:ring-2 focus:ring-blue-500/10 focus:border-blue-900 transition-all font-medium text-slate-700 appearance-none cursor-pointer"
                >
                  {schools.map((sch) => (
                    <option key={sch} value={sch}>
                      {sch}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Email Field */}
            <div>
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1.5">Email Akses</label>
              <input
                type="email"
                readOnly
                value={email}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200/80 rounded-xl text-slate-500 font-mono"
              />
            </div>

            {/* Password Field */}
            <div>
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1.5">Password</label>
              <div className="relative">
                <Key className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-9 pr-10 py-2 text-xs bg-slate-50 hover:bg-slate-100/50 focus:bg-white border border-slate-200 rounded-xl outline-hidden focus:ring-2 focus:ring-blue-500/10 focus:border-blue-900 transition-all font-medium text-slate-700"
                  placeholder="Masukkan password..."
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 focus:outline-hidden cursor-pointer"
                  title={showPassword ? "Sembunyikan password" : "Tampilkan password"}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errorMsg && (
                <span className="text-[10px] text-rose-500 font-bold mt-1 block">{errorMsg}</span>
              )}
            </div>

            {/* Submit button */}
            <button
              type="submit"
              className="w-full py-2.5 font-extrabold text-xs text-white rounded-xl shadow-md tracking-wider uppercase transition-all duration-300 cursor-pointer flex items-center justify-center gap-2"
              style={{
                background: "linear-gradient(135deg, #1e3a8a, #172554)",
                boxShadow: "0 4px 12px rgba(30, 58, 138, 0.25)"
              }}
            >
              <LogIn className="w-4 h-4 text-yellow-300" />
              Masuk / Login Hub
            </button>
          </form>

          {/* Footer of card */}
          <div className="mt-6 pt-4 border-t border-slate-100 text-center">
            <span className="text-[10px] text-slate-400 font-medium">Lazuardi Global Islamic School Group &copy; 2026</span>
          </div>

        </div>

      </div>
    </div>
  );
}
