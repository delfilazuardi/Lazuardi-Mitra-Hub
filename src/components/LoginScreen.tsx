import React, { useState } from "react";
import { UserRole, UserSession } from "../types";
import { GraduationCap, ShieldCheck, School, LogIn, Key, Eye, EyeOff, Globe, ArrowLeft, CheckCircle2, AlertCircle } from "lucide-react";

interface LoginProps {
  onLoginSuccess: (session: UserSession) => void;
  schools: string[];
  users?: any[];
  lang: "id" | "en";
  onLangChange: (lang: "id" | "en") => void;
  onUpdateUserPassword: (userId: string, newPass: string) => void;
}

export default function LoginScreen({
  onLoginSuccess,
  schools,
  users = [],
  lang,
  onLangChange,
  onUpdateUserPassword,
}: LoginProps) {
  const [role, setRole] = useState<UserRole>("admin");
  const [selectedSchool, setSelectedSchool] = useState<string>(schools[0] || "Al-Falah Depok");
  const [email, setEmail] = useState("admin@lazuardi.com");
  const [password, setPassword] = useState("admin123");
  const [errorMsg, setErrorMsg] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  // Change Password state
  const [isChangePasswordMode, setIsChangePasswordMode] = useState(false);
  const [changeEmail, setChangeEmail] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [changeError, setChangeError] = useState("");
  const [changeSuccess, setChangeSuccess] = useState("");
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);

  const isId = lang === "id";

  const localT = {
    selectRole: isId ? "Pilih Peran Hub" : "Select Hub Role",
    adminRole: isId ? "Administrator" : "Administrator",
    mitraRole: isId ? "Sekolah Mitra" : "Partner School",
    schoolLabel: isId ? "Instansi Sekolah Mitra" : "Partner School Institution",
    emailLabel: isId ? "Email Akses" : "Access Email",
    passwordLabel: isId ? "Password" : "Password",
    passwordPlaceholder: isId ? "Masukkan password..." : "Enter password...",
    loginBtn: isId ? "Masuk / Login Hub" : "Sign In / Login Hub",
    changePassLink: isId ? "Lupa/Ganti Password?" : "Forgot/Change Password?",
    incorrectCreds: isId ? "E-mail atau password salah! Silakan coba lagi." : "Incorrect email or password! Please try again.",
    passwordRequired: isId ? "Password wajib diisi!" : "Password is required!",
    
    // Change Password View
    changePassTitle: isId ? "Ganti Password Baru" : "Change Password",
    changePassSub: isId ? "Perbarui kata sandi akun Lazuardi Anda demi keamanan berkala." : "Update your Lazuardi account password for security.",
    currentPassLabel: isId ? "Password Saat Ini" : "Current Password",
    currentPassPlaceholder: isId ? "Masukkan password lama..." : "Enter current password...",
    newPassLabel: isId ? "Password Baru" : "New Password",
    newPassPlaceholder: isId ? "Masukkan password baru..." : "Enter new password...",
    confirmPassLabel: isId ? "Konfirmasi Password Baru" : "Confirm New Password",
    confirmPassPlaceholder: isId ? "Ulangi password baru..." : "Confirm new password...",
    saveNewPassBtn: isId ? "Simpan Password Baru" : "Save New Password",
    errEmailNotRegistered: isId ? "Email tidak terdaftar di sistem!" : "Email is not registered!",
    errWrongCurrentPass: isId ? "Password saat ini salah!" : "Incorrect current password!",
    errPassMismatch: isId ? "Konfirmasi password tidak cocok!" : "Passwords do not match!",
    errWeakPassword: isId ? "Password baru harus memiliki minimal 5 karakter!" : "New password must be at least 5 characters!",
    successPassUpdated: isId ? "Password berhasil diubah! Silakan login kembali." : "Password successfully updated! Please log in.",
    errFillAll: isId ? "Harap lengkapi semua isian!" : "Please fill out all fields!",
    backToLogin: isId ? "Kembali ke Login" : "Back to Login"
  };

  const handleRoleChange = (newRole: UserRole) => {
    setRole(newRole);
    if (newRole === "admin") {
      const existingAdmin = users.find((u) => u.role === "admin");
      setEmail(existingAdmin ? existingAdmin.email : "admin@lazuardi.com");
      setPassword(existingAdmin ? existingAdmin.password : "admin123");
    } else {
      const emailPattern = `bendahara.${selectedSchool.toLowerCase().replace(/\s+/g, "")}@lazuardi.com`;
      const existingMitra = users.find((u) => u.sekolahName === selectedSchool);
      setEmail(existingMitra ? existingMitra.email : emailPattern);
      setPassword(existingMitra ? existingMitra.password : "mitra123");
    }
  };

  const handleSchoolChange = (schoolName: string) => {
    setSelectedSchool(schoolName);
    if (role === "sekolah_mitra") {
      const emailPattern = `bendahara.${schoolName.toLowerCase().replace(/\s+/g, "")}@lazuardi.com`;
      const existingMitra = users.find((u) => u.sekolahName && u.sekolahName.toLowerCase() === schoolName.toLowerCase());
      setEmail(existingMitra ? (existingMitra.email || existingMitra.username) : emailPattern);
      setPassword(existingMitra ? existingMitra.password : "mitra123");
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!password) {
      setErrorMsg(localT.passwordRequired);
      return;
    }

    const inputIdentifier = email.trim().toLowerCase();
    const cleanPassword = password.trim();

    const match = users.find((u) => {
      const matchPass = String(u.password).trim() === cleanPassword;
      if (!matchPass) return false;

      // Extract parts to make email prefix matching extremely robust
      const inputPrefix = inputIdentifier.split("@")[0].replace(/[._-]/g, "");
      const userEmailPrefix = u.email ? u.email.toLowerCase().split("@")[0].replace(/[._-]/g, "") : "";
      const userUsernameClean = u.username ? u.username.toLowerCase().replace(/[\s._-]/g, "") : "";
      const userIdClean = u.id ? u.id.toLowerCase().replace(/[._-]/g, "") : "";

      const primaryMatch = (
        u.email?.toLowerCase() === inputIdentifier ||
        u.username?.toLowerCase() === inputIdentifier ||
        u.id?.toLowerCase() === inputIdentifier
      );

      const prefixMatch = (
        (userEmailPrefix && (inputPrefix.includes(userEmailPrefix) || userEmailPrefix.includes(inputPrefix))) ||
        (userUsernameClean && (inputPrefix.includes(userUsernameClean) || userUsernameClean.includes(inputPrefix))) ||
        (userIdClean && (inputPrefix.includes(userIdClean) || userIdClean.includes(inputPrefix)))
      );

      return primaryMatch || prefixMatch || (u.sekolahName && u.sekolahName.toLowerCase() === inputIdentifier);
    });

    if (match) {
      onLoginSuccess({
        username: match.username,
        role: match.role,
        sekolahName: match.sekolahName,
      });
      return;
    }

    if (email === "admin@lazuardi.com" && password === "admin123") {
      onLoginSuccess({
        username: "Pusat Lazuardi",
        role: "admin",
      });
      return;
    }

    if (password === "mitra123" && role === "sekolah_mitra") {
      onLoginSuccess({
        username: `Bendahara ${selectedSchool}`,
        role: "sekolah_mitra",
        sekolahName: selectedSchool,
      });
      return;
    }

    setErrorMsg(localT.incorrectCreds);
  };

  const handleChangePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setChangeError("");
    setChangeSuccess("");

    if (!changeEmail || !currentPassword || !newPassword || !confirmPassword) {
      setChangeError(localT.errFillAll);
      return;
    }

    if (newPassword !== confirmPassword) {
      setChangeError(localT.errPassMismatch);
      return;
    }

    if (newPassword.length < 5) {
      setChangeError(localT.errWeakPassword);
      return;
    }

    const inputEmail = changeEmail.trim().toLowerCase();
    const matchedUser = users.find(
      (u) => 
        u.email?.toLowerCase() === inputEmail ||
        u.username?.toLowerCase() === inputEmail ||
        u.id?.toLowerCase() === inputEmail
    );

    if (!matchedUser) {
      setChangeError(localT.errEmailNotRegistered);
      return;
    }

    if (matchedUser.password !== currentPassword) {
      setChangeError(localT.errWrongCurrentPass);
      return;
    }

    onUpdateUserPassword(matchedUser.id, newPassword);
    setChangeSuccess(localT.successPassUpdated);

    // Auto update state so login pre-populates the new password
    if (matchedUser.email?.toLowerCase() === email.toLowerCase() || matchedUser.username?.toLowerCase() === email.toLowerCase()) {

      setPassword(newPassword);
    }

    // Reset fields
    setChangeEmail("");
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");

    // Revert back to login screen after 2.5 seconds
    setTimeout(() => {
      setIsChangePasswordMode(false);
      setChangeSuccess("");
    }, 2500);
  };

  return (
    <div
      className="min-h-screen bg-slate-900 flex items-center justify-center p-4 relative overflow-hidden"
      style={{
        backgroundImage:
          "radial-gradient(circle at 10% 20%, rgba(30, 58, 138, 0.9) 0%, rgba(15, 23, 42, 1) 90%)",
      }}
    >
      {/* Background radial blurs */}
      <div className="absolute top-[-10%] right-[-10%] w-96 h-96 rounded-full bg-yellow-400/20 blur-3xl pointer-events-none" />
      <div className="absolute bottom-[-10%] left-[-10%] w-96 h-96 rounded-full bg-blue-600/30 blur-3xl pointer-events-none" />

      <div className="w-full max-w-md bg-white border border-slate-100 rounded-3xl shadow-2xl overflow-hidden relative">
        {/* Language option on top bar of the login card */}
        <div className="absolute top-4 right-4 z-20 flex items-center bg-blue-950/40 backdrop-blur-md rounded-xl p-0.5 border border-white/10 shadow-lg">
          <button
            type="button"
            onClick={() => onLangChange("id")}
            className={`text-[9px] font-extrabold px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
              lang === "id"
                ? "bg-yellow-400 text-blue-950 font-extrabold shadow-xs"
                : "text-white hover:text-yellow-200"
            }`}
            title="Bahasa Indonesia"
          >
            ID
          </button>
          <button
            type="button"
            onClick={() => onLangChange("en")}
            className={`text-[9px] font-extrabold px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
              lang === "en"
                ? "bg-yellow-400 text-blue-950 font-extrabold shadow-xs"
                : "text-white hover:text-yellow-200"
            }`}
            title="English"
          >
            EN
          </button>
        </div>

        {/* Brand Banner */}
        <div className="bg-gradient-to-r from-blue-900 to-blue-800 p-6 text-center text-white relative">
          <div
            className="absolute top-0 left-0 w-full h-full bg-yellow-400 opacity-5"
            style={{
              backgroundImage:
                "repeating-linear-gradient(45deg, transparent, transparent 10px, currentColor 10px, currentColor 20px)",
            }}
          />

          <div className="w-14 h-14 bg-yellow-400 text-blue-950 rounded-2xl flex items-center justify-center shadow-lg mx-auto mb-3 border-2 border-white transform hover:rotate-4 transition-transform duration-300">
            <GraduationCap className="w-8 h-8" />
          </div>

          <h1 className="text-xl font-extrabold tracking-tight">Lazuardi Mitra Hub</h1>
          <p className="text-xs text-yellow-300 font-semibold mt-1 uppercase tracking-wider">
            {lang === "id"
              ? "Sistem Monitoring & Audit Sekolah Mitra"
              : "Monitoring & Audit System for Partner Schools"}
          </p>
        </div>

        {/* Card Body */}
        <div className="p-6">
          {!isChangePasswordMode ? (
            /* LOGIN CARD MODE */
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Role selector */}
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-2">
                  {localT.selectRole}
                </label>
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
                    <ShieldCheck
                      className={`w-3.5 h-3.5 ${role === "admin" ? "text-yellow-400" : ""}`}
                    />
                    {localT.adminRole}
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
                    {localT.mitraRole}
                  </button>
                </div>
              </div>

              {/* School select dropdown */}
              {role === "sekolah_mitra" && (
                <div className="animated-fade-in">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1.5">
                    {localT.schoolLabel}
                  </label>
                  <select
                    value={selectedSchool}
                    onChange={(e) => handleSchoolChange(e.target.value)}
                    className="w-full px-3 py-2.5 text-xs bg-slate-50 border border-slate-250 rounded-xl outline-hidden focus:ring-2 focus:ring-blue-500/10 focus:border-blue-900 transition-all font-semibold text-slate-700 appearance-none cursor-pointer"
                  >
                    {schools.map((sch) => (
                      <option key={sch} value={sch}>
                        {sch}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Email Input */}
              <div>
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1.5">
                  {localT.emailLabel}
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    setErrorMsg("");
                  }}
                  className="w-full px-3 py-2.5 text-xs bg-slate-50 hover:bg-slate-100/50 focus:bg-white border border-slate-200/80 rounded-xl text-slate-700 font-mono focus:outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-900 transition-all"
                  placeholder="name@lazuardi.com"
                />
              </div>

              {/* Password Input */}
              <div>
                <div className="flex justify-between items-center mb-1.5">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                    {localT.passwordLabel}
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      setChangeEmail(email);
                      setIsChangePasswordMode(true);
                    }}
                    className="text-[10px] text-blue-800 hover:text-blue-950 font-bold tracking-tight cursor-pointer focus:outline-none"
                  >
                    {localT.changePassLink}
                  </button>
                </div>
                <div className="relative">
                  <Key className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      setErrorMsg("");
                    }}
                    className="w-full pl-9 pr-10 py-2.5 text-xs bg-slate-50 hover:bg-slate-100/50 focus:bg-white border border-slate-200 rounded-xl outline-hidden focus:ring-2 focus:ring-blue-500/10 focus:border-blue-900 transition-all font-semibold text-slate-700"
                    placeholder={localT.passwordPlaceholder}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-3 text-slate-400 hover:text-slate-600 focus:outline-hidden cursor-pointer"
                    title={showPassword ? "Hide" : "Show"}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {errorMsg && (
                  <span className="text-[10px] text-rose-500 font-bold mt-1 block flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5" />
                    {errorMsg}
                  </span>
                )}
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                className="w-full py-2.5 mt-2 font-extrabold text-xs text-white rounded-xl shadow-md tracking-wider uppercase transition-all duration-300 cursor-pointer flex items-center justify-center gap-2 hover:opacity-95"
                style={{
                  background: "linear-gradient(135deg, #1e3a8a, #172554)",
                  boxShadow: "0 4px 12px rgba(30, 58, 138, 0.25)",
                }}
              >
                <LogIn className="w-4 h-4 text-yellow-300" />
                {localT.loginBtn}
              </button>
            </form>
          ) : (
            /* CHANGE PASSWORD SCREEN MODE */
            <form onSubmit={handleChangePasswordSubmit} className="space-y-4 animated-fade-in">
              <div className="pb-1 border-b border-slate-100 mb-2">
                <button
                  type="button"
                  onClick={() => {
                    setIsChangePasswordMode(false);
                    setChangeError("");
                    setChangeSuccess("");
                  }}
                  className="text-xs text-slate-500 hover:text-slate-800 font-bold flex items-center gap-1 mb-2.5 cursor-pointer pb-1.5 focus:outline-none"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  {localT.backToLogin}
                </button>
                <h2 className="text-sm font-extrabold text-slate-800">{localT.changePassTitle}</h2>
                <p className="text-[10px] text-slate-400 mt-0.5 leading-relaxed">
                  {localT.changePassSub}
                </p>
              </div>

              {/* Success Notice */}
              {changeSuccess && (
                <div className="p-3 bg-emerald-50 border border-emerald-150 rounded-xl text-emerald-800 text-[11px] font-bold flex items-start gap-2 animate-bounce">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                  <div>{changeSuccess}</div>
                </div>
              )}

              {/* Error Notice */}
              {changeError && (
                <div className="p-3 bg-rose-50 border border-rose-150 rounded-xl text-rose-800 text-[11px] font-bold flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0 mt-0.5" />
                  <div>{changeError}</div>
                </div>
              )}

              {/* Verified Email Target */}
              <div>
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                  {localT.emailLabel}
                </label>
                <input
                  type="email"
                  value={changeEmail}
                  onChange={(e) => setChangeEmail(e.target.value)}
                  placeholder="name@lazuardi.com"
                  className="w-full px-3 py-2 text-xs bg-slate-50 hover:bg-slate-100/50 focus:bg-white border border-slate-200 rounded-xl outline-hidden focus:ring-2 focus:ring-blue-500/10 focus:border-blue-900 transition-all font-mono text-slate-700"
                />
              </div>

              {/* Old Password */}
              <div>
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                  {localT.currentPassLabel}
                </label>
                <div className="relative">
                  <Key className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type={showCurrentPassword ? "text" : "password"}
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    placeholder={localT.currentPassPlaceholder}
                    className="w-full pl-9 pr-10 py-2.5 text-xs bg-slate-50 hover:bg-slate-100/50 focus:bg-white border border-slate-200 rounded-xl outline-hidden focus:ring-2 focus:ring-blue-500/10 focus:border-blue-900 transition-all font-semibold text-slate-700"
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                    className="absolute right-3 top-3 text-slate-400 hover:text-slate-600 focus:outline-hidden cursor-pointer"
                  >
                    {showCurrentPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* New Password and Confirm */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                    {localT.newPassLabel}
                  </label>
                  <div className="relative">
                    <input
                      type={showNewPassword ? "text" : "password"}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder={localT.newPassPlaceholder}
                      className="w-full px-3 py-2.5 text-xs bg-slate-50 hover:bg-slate-100/50 focus:bg-white border border-slate-200 rounded-xl outline-hidden focus:ring-2 focus:ring-blue-500/10 focus:border-blue-900 transition-all font-semibold text-slate-700"
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      className="absolute right-2.5 top-3 text-slate-400 hover:text-slate-600 focus:outline-hidden cursor-pointer"
                    >
                      {showNewPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                    {localT.confirmPassLabel}
                  </label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder={localT.confirmPassPlaceholder}
                    className="w-full px-3 py-2.5 text-xs bg-slate-50 hover:bg-slate-100/50 focus:bg-white border border-slate-200 rounded-xl outline-hidden focus:ring-2 focus:ring-blue-500/10 focus:border-blue-900 transition-all font-semibold text-slate-700"
                  />
                </div>
              </div>

              {/* Action Button */}
              <button
                type="submit"
                className="w-full py-2.5 font-extrabold text-xs text-white rounded-xl shadow-md tracking-wider uppercase transition-all duration-300 cursor-pointer flex items-center justify-center gap-2 hover:opacity-95"
                style={{
                  background: "linear-gradient(135deg, #1e3a8a, #172554)",
                  boxShadow: "0 4px 12px rgba(30, 58, 138, 0.25)",
                }}
              >
                {localT.saveNewPassBtn}
              </button>
            </form>
          )}

          {/* Footer branding */}
          <div className="mt-6 pt-4 border-t border-slate-150 text-center">
            <span className="text-[10px] text-slate-400 font-bold tracking-tight">
              Mitra Office Lazuardi GCS &copy; 2026
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

