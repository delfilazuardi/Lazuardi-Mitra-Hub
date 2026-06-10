import React, { useState } from "react";
import { 
  Plus, 
  Trash2, 
  Edit2, 
  Tag, 
  Layers, 
  Calendar, 
  MessageSquare, 
  Check, 
  X, 
  AlertCircle
} from "lucide-react";
import { translations } from "../utils/translations";

interface CategoryManagementProps {
  requestCategories: string[];
  eventCategories: string[];
  onRequestCatChange: (categories: string[]) => void;
  onEventCatChange: (categories: string[]) => void;
  lang: "id" | "en";
}

export default function CategoryManagement({
  requestCategories,
  eventCategories,
  onRequestCatChange,
  onEventCatChange,
  lang,
}: CategoryManagementProps) {
  const t = translations[lang];

  // Forms state
  const [activeTab, setActiveTab] = useState<"requests" | "events">("requests");
  const [newCategoryName, setNewCategoryName] = useState("");
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editingValue, setEditingValue] = useState("");
  
  const [errorMsg, setErrorMsg] = useState("");
  const [successToast, setSuccessToast] = useState("");

  const triggerToast = (msg: string) => {
    setSuccessToast(msg);
    setTimeout(() => {
      setSuccessToast("");
    }, 3000);
  };

  const handleAddCategory = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanName = newCategoryName.trim();
    if (!cleanName) return;

    const currentList = activeTab === "requests" ? requestCategories : eventCategories;
    
    // Check duplication
    if (currentList.some(cat => cat.toLowerCase() === cleanName.toLowerCase())) {
      setErrorMsg(t.categoryAlreadyExists);
      return;
    }

    if (activeTab === "requests") {
      onRequestCatChange([...requestCategories, cleanName]);
    } else {
      onEventCatChange([...eventCategories, cleanName]);
    }

    setNewCategoryName("");
    setErrorMsg("");
    triggerToast(t.successAddCategory);
  };

  const handleStartEdit = (index: number, val: string) => {
    setEditingIndex(index);
    setEditingValue(val);
  };

  const handleSaveEdit = (index: number) => {
    const cleanVal = editingValue.trim();
    if (!cleanVal) return;

    if (activeTab === "requests") {
      const updated = [...requestCategories];
      // Check duplication avoiding self
      if (updated.some((cat, i) => i !== index && cat.toLowerCase() === cleanVal.toLowerCase())) {
        setErrorMsg(t.categoryAlreadyExists);
        return;
      }
      updated[index] = cleanVal;
      onRequestCatChange(updated);
    } else {
      const updated = [...eventCategories];
      if (updated.some((cat, i) => i !== index && cat.toLowerCase() === cleanVal.toLowerCase())) {
        setErrorMsg(t.categoryAlreadyExists);
        return;
      }
      updated[index] = cleanVal;
      onEventCatChange(updated);
    }

    setEditingIndex(null);
    setErrorMsg("");
    triggerToast(t.successUpdateCategory);
  };

  const handleDeleteCategory = (index: number) => {
    if (confirm(lang === "id" ? "Apakah Anda yakin ingin menghapus kategori ini?" : "Are you sure you want to delete this category?")) {
      if (activeTab === "requests") {
        const filtered = requestCategories.filter((_, i) => i !== index);
        onRequestCatChange(filtered);
      } else {
        const filtered = eventCategories.filter((_, i) => i !== index);
        onEventCatChange(filtered);
      }
      triggerToast(t.successDeleteCategory);
    }
  };

  const currentList = activeTab === "requests" ? requestCategories : eventCategories;

  return (
    <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-xs space-y-6" id="category-management-panel">
      
      {/* Toast message popup */}
      {successToast && (
        <div className="fixed bottom-5 right-5 z-200 bg-emerald-600 text-white font-bold text-xs p-3.5 px-6 rounded-2xl shadow-xl flex items-center gap-2 animate-bounce">
          <Check className="w-4 h-4 text-emerald-200" />
          <span>{successToast}</span>
        </div>
      )}

      {/* Header section */}
      <div className="border-b border-slate-100 pb-5">
        <h2 className="text-lg font-bold text-slate-800 tracking-tight flex items-center gap-2">
          <Tag className="w-5 h-5 text-blue-900" />
          {t.categoryHeader}
        </h2>
        <p className="text-xs text-slate-400 mt-1">
          {t.categorySub}
        </p>
      </div>

      {/* Tab Selectors */}
      <div className="flex gap-1.5 bg-slate-100 p-1.5 rounded-2xl border border-slate-200/40 w-full max-w-md">
        <button
          type="button"
          onClick={() => {
            setActiveTab("requests");
            setErrorMsg("");
            setEditingIndex(null);
          }}
          className={`flex-1 py-2.5 rounded-xl text-xs font-extrabold transition-all flex items-center justify-center gap-2 cursor-pointer ${
            activeTab === "requests"
              ? "bg-blue-900 text-white shadow-xs"
              : "text-slate-500 hover:text-slate-700"
          }`}
        >
          <MessageSquare className="w-4 h-4" />
          {t.categoryRequestSection}
        </button>
        <button
          type="button"
          onClick={() => {
            setActiveTab("events");
            setErrorMsg("");
            setEditingIndex(null);
          }}
          className={`flex-1 py-2.5 rounded-xl text-xs font-extrabold transition-all flex items-center justify-center gap-2 cursor-pointer ${
            activeTab === "events"
              ? "bg-yellow-400 text-blue-950 shadow-xs"
              : "text-slate-500 hover:text-slate-700"
          }`}
        >
          <Calendar className="w-4 h-4" />
          {t.categoryEventSection}
        </button>
      </div>

      {/* Main Split Layout: Form on left, current list in Grid on right */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        
        {/* Form Panel: Add Category */}
        <form onSubmit={handleAddCategory} className="p-5 border border-slate-150/60 bg-slate-50/50 rounded-2xl space-y-4">
          <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
            <Plus className="w-3.5 h-3.5 text-blue-900 font-bold" />
            {t.addCategoryBtn}
          </h3>
          
          <div>
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1.5">
              {t.categoryTypeLabel}
            </label>
            <input
              type="text"
              readOnly
              value={activeTab === "requests" ? t.requestCategoryOpt : t.eventCategoryOpt}
              className="w-full px-3 py-2 text-xs bg-white border border-slate-250 text-slate-500 rounded-xl"
            />
          </div>

          <div>
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1.5">
              {t.categoryNameLabel}
            </label>
            <input
              required
              type="text"
              value={newCategoryName}
              onChange={(e) => setNewCategoryName(e.target.value)}
              placeholder={t.newCategoryPlaceholder}
              className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-xl outline-hidden focus:ring-2 focus:ring-blue-500/10 focus:border-blue-900 font-medium text-slate-700"
            />
          </div>

          {errorMsg && (
            <div className="p-2.5 bg-rose-50 border border-rose-100 rounded-xl text-[10px] text-rose-600 font-bold flex items-center gap-1.5">
              <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          <button
            type="submit"
            className="w-full py-2 bg-blue-950 hover:bg-blue-900 text-white font-extrabold text-xs rounded-xl shadow-md transition-all cursor-pointer flex items-center justify-center gap-1.5"
          >
            <Plus className="w-4 h-4 text-yellow-300" />
            {t.saveCategory}
          </button>
        </form>

        {/* List of categories */}
        <div className="lg:col-span-2 space-y-3">
          <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-400">
            {activeTab === "requests" ? "Kategori Request Mitra Aktif" : "Kategori Kalender Event Aktif"}
          </h3>
          
          {currentList.length === 0 ? (
            <div className="p-8 text-center text-slate-400 border border-dashed border-slate-250 bg-slate-50 rounded-2xl text-xs font-medium">
              {t.noCustomCategories}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {currentList.map((category, index) => {
                const isEditing = editingIndex === index;

                return (
                  <div 
                    key={index} 
                    className="p-3.5 bg-white border border-slate-200/80 rounded-2xl shadow-xs flex items-center justify-between gap-3 group hover:border-blue-400/40 hover:shadow-xs transition-all duration-200"
                  >
                    <div className="flex-1 flex items-center gap-2">
                      <div className={`p-1.5 rounded-lg flex-shrink-0 ${
                        activeTab === "requests" ? "bg-blue-50 text-blue-900" : "bg-yellow-50 text-blue-950"
                      }`}>
                        {activeTab === "requests" ? <MessageSquare className="w-3.5 h-3.5" /> : <Layers className="w-3.5 h-3.5" />}
                      </div>

                      {isEditing ? (
                        <input
                          type="text"
                          value={editingValue}
                          onChange={(e) => setEditingValue(e.target.value)}
                          className="w-full px-2 py-1 text-xs bg-slate-50 border border-blue-400 rounded-lg outline-hidden focus:bg-white font-semibold text-slate-800"
                        />
                      ) : (
                        <span className="text-xs font-bold text-slate-700 truncate max-w-[150px]">{category}</span>
                      )}
                    </div>

                    <div className="flex items-center gap-1.5">
                      {isEditing ? (
                        <>
                          <button
                            type="button"
                            onClick={() => handleSaveEdit(index)}
                            className="p-1 hover:bg-emerald-50 text-emerald-600 rounded-lg border border-emerald-100 cursor-pointer"
                            title={t.save}
                          >
                            <Check className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => setEditingIndex(null)}
                            className="p-1 hover:bg-slate-100 text-slate-400 rounded-lg border border-slate-150 cursor-pointer"
                            title={t.cancel}
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </>
                      ) : (
                        <>
                          <button
                            type="button"
                            onClick={() => handleStartEdit(index, category)}
                            className="p-1 hover:bg-slate-50 text-slate-400 hover:text-blue-900 rounded-lg border border-slate-150 transition-colors cursor-pointer"
                            title={t.editCategoryBtn}
                          >
                            <Edit2 className="w-3 h-3" />
                          </button>
                          
                          {/* Ensure there's always at least one category left */}
                          {currentList.length > 1 && (
                            <button
                              type="button"
                              onClick={() => handleDeleteCategory(index)}
                              className="p-1 hover:bg-slate-50 text-slate-450 hover:text-rose-600 rounded-lg border border-slate-150 transition-colors cursor-pointer"
                              title={t.deleteCategoryBtn}
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

        </div>

      </div>

    </div>
  );
}
