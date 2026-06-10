import React, { useState } from "react";
import { UserRole } from "../types";
import { 
  Users, 
  UserPlus, 
  Edit2, 
  Trash2, 
  ShieldCheck, 
  School, 
  Plus, 
  X, 
  Check, 
  Lock, 
  Mail, 
  Fingerprint, 
  Eye, 
  EyeOff,
  AlertCircle
} from "lucide-react";
import { translations } from "../utils/translations";

interface UserManagementProps {
  users: any[];
  schools: string[];
  onAddUser: (user: any) => void;
  onEditUser: (id: string, updated: any) => void;
  onDeleteUser: (id: string) => void;
  lang: "id" | "en";
}

export default function UserManagement({
  users,
  schools,
  onAddUser,
  onEditUser,
  onDeleteUser,
  lang,
}: UserManagementProps) {
  const t = translations[lang];

  // Modals & form state
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingUser, setEditingUser] = useState<any | null>(null);

  // Form Fields
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<UserRole>("sekolah_mitra");
  const [sekolahName, setSekolahName] = useState(schools[0] || "SMA Lazuardi");
  const [password, setPassword] = useState("");

  const [showPassword, setShowPassword] = useState<{[key: string]: boolean}>({});
  const [errorMsg, setErrorMsg] = useState("");
  const [showSuccessToast, setShowSuccessToast] = useState("");

  const triggerToast = (msg: string) => {
    setShowSuccessToast(msg);
    setTimeout(() => {
      setShowSuccessToast("");
    }, 3000);
  };

  const handleOpenAddModal = () => {
    setUsername("");
    setEmail("");
    setRole("sekolah_mitra");
    setSekolahName(schools[0] || "SMA Lazuardi");
    setPassword("");
    setErrorMsg("");
    setShowAddModal(true);
  };

  const handleOpenEditModal = (user: any) => {
    setEditingUser(user);
    setUsername(user.username);
    setEmail(user.email);
    setRole(user.role);
    setSekolahName(user.sekolahName || schools[0] || "SMA Lazuardi");
    setPassword(user.password);
    setErrorMsg("");
  };

  const validateForm = (isEditing: boolean, userId?: string) => {
    if (!username.trim()) return lang === "id" ? "Nama lengkap tidak boleh kosong!" : "Full name cannot be empty!";
    if (!email.trim()) return lang === "id" ? "Email tidak boleh kosong!" : "Email cannot be empty!";
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) return lang === "id" ? "Format email tidak valid!" : "Invalid email format!";
    
    if (!password.trim()) return lang === "id" ? "Kata sandi tidak boleh kosong!" : "Password cannot be empty!";
    if (password.length < 5) return lang === "id" ? "Sandi minimal 5 karakter!" : "Password must be at least 5 characters!";

    // Check email uniqueness
    const emailConflict = users.some(u => u.email.toLowerCase() === email.toLowerCase() && (!isEditing || u.id !== userId));
    if (emailConflict) return lang === "id" ? "Email sudah terdaftar!" : "Email already registered!";

    return "";
  };

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const validation = validateForm(false);
    if (validation) {
      setErrorMsg(validation);
      return;
    }

    const newUser = {
      id: `usr-${Date.now()}`,
      username: username.trim(),
      email: email.trim().toLowerCase(),
      role,
      sekolahName: role === "sekolah_mitra" ? sekolahName : undefined,
      password: password.trim()
    };

    onAddUser(newUser);
    setShowAddModal(false);
    triggerToast(t.successAddUser);
  };

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;

    const validation = validateForm(true, editingUser.id);
    if (validation) {
      setErrorMsg(validation);
      return;
    }

    const updatedUser = {
      ...editingUser,
      username: username.trim(),
      email: email.trim().toLowerCase(),
      role,
      sekolahName: role === "sekolah_mitra" ? sekolahName : undefined,
      password: password.trim()
    };

    onEditUser(editingUser.id, updatedUser);
    setEditingUser(null);
    triggerToast(t.successEditUser);
  };

  const handleDelete = (id: string) => {
    if (confirm(t.deleteConfirm)) {
      onDeleteUser(id);
      triggerToast(t.successDeleteUser);
    }
  };

  const togglePasswordVisibility = (id: string) => {
    setShowPassword(prev => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-xs space-y-6" id="user-management-panel">
      
      {/* Toast Notification */}
      {showSuccessToast && (
        <div className="fixed bottom-5 right-5 z-200 bg-emerald-600 text-white font-bold text-xs p-3.5 px-6 rounded-2xl shadow-xl flex items-center gap-2 animate-bounce">
          <Check className="w-4 h-4 text-emerald-200" />
          <span>{showSuccessToast}</span>
        </div>
      )}

      {/* Header Panel */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-5">
        <div>
          <h2 className="text-lg font-bold text-slate-800 tracking-tight flex items-center gap-2">
            <Users className="w-5 h-5 text-blue-900" />
            {t.userManagementTitle}
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            {t.userManagementSub}
          </p>
        </div>

        <button
          onClick={handleOpenAddModal}
          className="bg-blue-900 hover:bg-blue-800 text-white font-extrabold text-xs px-4 py-2.5 rounded-xl transition-all shadow-md flex items-center gap-1.5 self-start sm:self-auto cursor-pointer"
        >
          <UserPlus className="w-4 h-4 text-yellow-300" />
          {t.addUserBtn}
        </button>
      </div>

      {/* User Accounts Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-xs text-left text-slate-600">
          <thead>
            <tr className="border-b border-slate-150 text-[10px] text-slate-400 font-extrabold uppercase tracking-wider">
              <th className="pb-3">{t.usernameLabel}</th>
              <th className="pb-3">{t.emailLabel}</th>
              <th className="pb-3">{t.roleLabel}</th>
              <th className="pb-3">{t.schoolLabel}</th>
              <th className="pb-3">{t.passwordLabel}</th>
              <th className="pb-3 text-center">{t.actionPlaceholder}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {users.map((user) => {
              const isAdmin = user.role === "admin";
              const displayingPass = showPassword[user.id] ? user.password : "••••••••";

              return (
                <tr key={user.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="py-3.5 pr-2 font-bold text-slate-800 flex items-center gap-2.5">
                    <div className={`p-1.5 rounded-lg flex-shrink-0 ${
                      isAdmin ? "bg-blue-100 text-blue-900" : "bg-yellow-100 text-blue-950"
                    }`}>
                      {isAdmin ? <ShieldCheck className="w-4 h-4" /> : <School className="w-4 h-4" />}
                    </div>
                    <span className="truncate max-w-[150px]" title={user.username}>{user.username}</span>
                  </td>
                  <td className="py-3.5 pr-2 font-mono text-[11px] text-slate-500 truncate max-w-[150px]" title={user.email}>
                    {user.email}
                  </td>
                  <td className="py-3.5 pr-2 font-semibold">
                    <span className={`px-2 py-0.5 rounded-full text-[9px] font-extrabold border uppercase tracking-wider ${
                      isAdmin 
                        ? "bg-blue-50 text-blue-700 border-blue-200" 
                        : "bg-yellow-50 text-slate-700 border-yellow-200"
                    }`}>
                      {isAdmin ? t.superAdminLabel : t.schoolTreasurerLabel}
                    </span>
                  </td>
                  <td className="py-3.5 pr-2 font-medium text-slate-700">
                    {user.sekolahName || <span className="text-slate-350">-</span>}
                  </td>
                  <td className="py-3.5 pr-2 font-mono text-[11px]">
                    <div className="flex items-center gap-1.5">
                      <span className="bg-slate-100 px-2 py-0.5 rounded-lg font-medium">{displayingPass}</span>
                      <button
                        type="button"
                        onClick={() => togglePasswordVisibility(user.id)}
                        className="p-1 hover:bg-slate-150 rounded-md text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
                        title={showPassword[user.id] ? "Hide" : "Show"}
                      >
                        {showPassword[user.id] ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                      </button>
                    </div>
                  </td>
                  <td className="py-3.5 text-center">
                    <div className="flex items-center justify-center gap-1.5">
                      <button
                        onClick={() => handleOpenEditModal(user)}
                        className="p-1.5 hover:bg-slate-100 text-slate-500 hover:text-blue-900 border border-slate-200 rounded-lg transition-colors cursor-pointer"
                        title={t.editUserBtn}
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      
                      {/* Secure deletion mechanism (admin cannot delete themselves) */}
                      {user.email !== "admin@lazuardi.com" ? (
                        <button
                          onClick={() => handleDelete(user.id)}
                          className="p-1.5 hover:bg-slate-100 text-slate-400 hover:text-rose-600 border border-slate-200 rounded-lg transition-colors cursor-pointer"
                          title={t.deleteUserBtn}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      ) : (
                        <span className="w-7 h-7 inline-block rounded-md bg-slate-50 border border-dashed border-slate-200 flex items-center justify-center text-slate-300" title="Locked Admin">
                          <Lock className="w-3 h-3" />
                        </span>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Security Hub Notice Banner */}
      <div className="p-4 bg-yellow-50/50 border border-yellow-200 text-slate-700 rounded-2xl text-xs flex items-start gap-2.5 leading-relaxed max-w-3xl">
        <Lock className="w-4.5 h-4.5 text-blue-900 mt-0.5 flex-shrink-0" />
        <div>
          <strong className="font-extrabold text-slate-800">{t.securityHubTitle}</strong>
          <p className="text-[11px] text-slate-500 mt-1">
            {t.securityHubSub}
          </p>
        </div>
      </div>

      {/* Modal 1: Add User */}
      {showAddModal && (
        <div className="fixed inset-0 z-100 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white rounded-3xl overflow-hidden shadow-2xl border border-slate-100 animate-fade-in text-slate-800">
            <div className="bg-blue-900 text-white p-5 text-center flex items-center justify-between">
              <div className="flex-1 text-center">
                <h3 className="font-extrabold uppercase tracking-widest text-xs text-yellow-300">{t.addUserBtn}</h3>
                <p className="text-xs text-slate-200 mt-1">Lazuardi Mitra Hub</p>
              </div>
              <button onClick={() => setShowAddModal(false)} className="p-1 hover:bg-white/10 rounded-lg text-slate-300 cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>
            
            <form onSubmit={handleAddSubmit} className="p-6 space-y-4">
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1.5">{t.usernameLabel}</label>
                <div className="relative">
                  <Fingerprint className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    required
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Misal: Ahmad Fauzi"
                    className="w-full pl-9 pr-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl outline-hidden focus:ring-2 focus:ring-blue-500/10 focus:border-blue-900 font-medium text-slate-700"
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1.5">{t.emailLabel}</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    required
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="fauzi@lazuardi.com"
                    className="w-full pl-9 pr-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl outline-hidden focus:ring-2 focus:ring-blue-500/10 focus:border-blue-900 font-medium text-slate-700"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1.5">{t.roleLabel}</label>
                  <select
                    value={role}
                    onChange={(e) => setRole(e.target.value as UserRole)}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl outline-hidden focus:ring-2 focus:ring-blue-500/10 focus:border-blue-900 font-bold text-slate-700 cursor-pointer"
                  >
                    <option value="admin">Administrator</option>
                    <option value="sekolah_mitra">Sekolah Mitra</option>
                  </select>
                </div>

                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1.5">{t.passwordLabel}</label>
                  <input
                    required
                    type="text"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Sandi123"
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl outline-hidden focus:ring-2 focus:ring-blue-500/10 focus:border-blue-900 font-medium text-slate-700"
                  />
                </div>
              </div>

              {role === "sekolah_mitra" && (
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1.5">{t.schoolLabel}</label>
                  <select
                    value={sekolahName}
                    onChange={(e) => setSekolahName(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl outline-hidden focus:ring-2 focus:ring-blue-500/10 focus:border-blue-900 font-medium text-slate-700 cursor-pointer"
                  >
                    {schools.map((sch) => (
                      <option key={sch} value={sch}>{sch}</option>
                    ))}
                  </select>
                </div>
              )}

              {errorMsg && (
                <div className="p-2.5 bg-rose-50 border border-rose-100 rounded-xl text-[10px] text-rose-600 font-bold flex items-center gap-1.5">
                  <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}

              <div className="grid grid-cols-2 gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="py-2 text-xs font-bold text-slate-500 hover:text-slate-700 hover:bg-slate-50 border border-slate-200 rounded-xl transition-all cursor-pointer"
                >
                  {t.cancel}
                </button>
                <button
                  type="submit"
                  className="py-2 text-xs font-bold text-white bg-blue-900 hover:bg-blue-800 rounded-xl shadow-md transition-all cursor-pointer flex items-center justify-center gap-1"
                >
                  <Check className="w-3.5 h-3.5" />
                  {t.save}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal 2: Edit User */}
      {editingUser && (
        <div className="fixed inset-0 z-100 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white rounded-3xl overflow-hidden shadow-2xl border border-slate-100 animate-fade-in text-slate-800">
            <div className="bg-blue-900 text-white p-5 text-center flex items-center justify-between">
              <div className="flex-1 text-center">
                <h3 className="font-extrabold uppercase tracking-widest text-xs text-yellow-300">{t.editUserBtn}</h3>
                <p className="text-xs text-slate-200 mt-1">{editingUser.email}</p>
              </div>
              <button onClick={() => setEditingUser(null)} className="p-1 hover:bg-white/10 rounded-lg text-slate-300 cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>
            
            <form onSubmit={handleEditSubmit} className="p-6 space-y-4">
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1.5">{t.usernameLabel}</label>
                <div className="relative">
                  <Fingerprint className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    required
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full pl-9 pr-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl outline-hidden focus:ring-2 focus:ring-blue-500/10 focus:border-blue-900 font-medium text-slate-700"
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1.5">{t.emailLabel}</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    required
                    type="email"
                    value={email}
                    disabled={editingUser.email === "admin@lazuardi.com"}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-9 pr-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl outline-hidden focus:ring-2 focus:ring-blue-500/10 focus:border-blue-900 font-medium text-slate-700 disabled:opacity-50 font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1.5">{t.roleLabel}</label>
                  <select
                    value={role}
                    disabled={editingUser.email === "admin@lazuardi.com"}
                    onChange={(e) => setRole(e.target.value as UserRole)}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl outline-hidden focus:ring-2 focus:ring-blue-500/10 focus:border-blue-900 font-bold text-slate-700 cursor-pointer disabled:opacity-50"
                  >
                    <option value="admin">Administrator</option>
                    <option value="sekolah_mitra">Sekolah Mitra</option>
                  </select>
                </div>

                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1.5">{t.passwordLabel}</label>
                  <input
                    required
                    type="text"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl outline-hidden focus:ring-2 focus:ring-blue-500/10 focus:border-blue-900 font-medium text-slate-700"
                  />
                </div>
              </div>

              {role === "sekolah_mitra" && (
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1.5">{t.schoolLabel}</label>
                  <select
                    value={sekolahName}
                    onChange={(e) => setSekolahName(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl outline-hidden focus:ring-2 focus:ring-blue-500/10 focus:border-blue-900 font-medium text-slate-700 cursor-pointer"
                  >
                    {schools.map((sch) => (
                      <option key={sch} value={sch}>{sch}</option>
                    ))}
                  </select>
                </div>
              )}

              {errorMsg && (
                <div className="p-2.5 bg-rose-50 border border-rose-100 rounded-xl text-[10px] text-rose-600 font-bold flex items-center gap-1.5">
                  <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}

              <div className="grid grid-cols-2 gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingUser(null)}
                  className="py-2 text-xs font-bold text-slate-500 hover:text-slate-700 hover:bg-slate-50 border border-slate-200 rounded-xl transition-all cursor-pointer"
                >
                  {t.cancel}
                </button>
                <button
                  type="submit"
                  className="py-2 text-xs font-bold text-white bg-blue-900 hover:bg-blue-800 rounded-xl shadow-md transition-all cursor-pointer flex items-center justify-center gap-1"
                >
                  <Check className="w-3.5 h-3.5" />
                  {t.save}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
