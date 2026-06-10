import React, { useState, useRef, useEffect } from "react";
import { ChatMessage, ReportRecord } from "../types";
import { Send, Sparkles, MessageSquare, Bot, User, Trash2, ArrowUpRight, Loader } from "lucide-react";
import { motion } from "motion/react";

interface AssistantProps {
  records: ReportRecord[];
}

export default function AiAssistant({ records }: AssistantProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "initial",
      role: "model",
      text: "Halo! Saya **Asisten AI Lazuardi Mitra Hub**. Saya siap membantu Anda menganalisis performa pengiriman laporan bulanan dan status audit 10 sekolah mitra Lazuardi. Silakan pilih rekomendasi pertanyaan atau ketik pertanyaan Anda sendiri di bawah!",
      timestamp: new Date().toLocaleTimeString(),
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Suggestions for quick entry
  const suggestions = [
    "Sekolah mana yang memiliki kinerja terbaik?",
    "Ada berapa laporan yang perlu direvisi?",
    "Berikan ringkasan kepatuhan SMA Lazuardi",
    "Rekomendasi tindakan peningkatan disiplin kirim",
  ];

  // Auto-scroll to bottom of chat
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, loading]);

  const handleSend = async (textToSend: string) => {
    if (!textToSend.trim() || loading) return;

    const userMessage: ChatMessage = {
      id: `usr-${Date.now()}`,
      role: "user",
      text: textToSend,
      timestamp: new Date().toLocaleTimeString(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setLoading(true);

    try {
      // Gather latest messages payload matching Gemini requirements
      const payloadMessages = [...messages, userMessage].map((m) => ({
        role: m.role,
        text: m.text,
      }));

      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: payloadMessages,
          records,
        }),
      });

      if (!res.ok) {
        throw new Error("Gagal terhubung dengan server");
      }

      const data = await res.json();
      
      const aiMessage: ChatMessage = {
        id: `ai-${Date.now()}`,
        role: "model",
        text: data.text || "Mohon maaf, saya mengalami kegagalan teknis dalam merumus respon.",
        timestamp: new Date().toLocaleTimeString(),
      };

      setMessages((prev) => [...prev, aiMessage]);
    } catch (err: any) {
      console.error(err);
      const errorMessage: ChatMessage = {
        id: `err-${Date.now()}`,
        role: "model",
        text: `Maaf, terjadi gangguan jaringan: **${err.message}**. Silakan coba sesaat lagi.`,
        timestamp: new Date().toLocaleTimeString(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  const handleClear = () => {
    setMessages([
      {
        id: "initial",
        role: "model",
        text: "Papan percakapan dibersihkan. Apa yang ingin Anda analisis kembali hari ini?",
        timestamp: new Date().toLocaleTimeString(),
      },
    ]);
  };

  // Helper to parse basic markdown lists or bold tags
  const renderMessageContent = (text: string) => {
    const lines = text.split("\n");
    return lines.map((line, idx) => {
      let content = line;
      
      // Handle Bold
      const boldRegex = /\*\*(.*?)\*\*/g;
      const parts = [];
      let lastIndex = 0;
      let match;
      
      while ((match = boldRegex.exec(content)) !== null) {
        if (match.index > lastIndex) {
          parts.push(content.substring(lastIndex, match.index));
        }
        parts.push(<strong key={match.index} className="font-extrabold text-[#111]">{match[1]}</strong>);
        lastIndex = boldRegex.lastIndex;
      }
      
      if (lastIndex < content.length) {
        parts.push(content.substring(lastIndex));
      }

      const finalContent = parts.length > 0 ? parts : content;

      // Check if Bullet point
      if (line.trim().startsWith("- ") || line.trim().startsWith("* ")) {
        return (
          <li key={idx} className="ml-4 list-disc text-xs leading-relaxed my-1">
            {parts.length > 0 ? parts : line.trim().substring(2)}
          </li>
        );
      }

      return (
        <p key={idx} className="text-xs leading-relaxed mb-2 last:mb-0">
          {finalContent}
        </p>
      );
    });
  };

  return (
    <div id="ai-assistant-card" className="bg-white border border-slate-100 rounded-3xl shadow-xs overflow-hidden flex flex-col h-[520px]">
      {/* Title */}
      <div className="p-4 bg-indigo-600 flex items-center justify-between text-white flex-shrink-0">
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-indigo-200 fill-indigo-200 animate-pulse" />
          <div>
            <h3 className="text-sm font-bold tracking-tight">Asisten AI Lazuardi</h3>
            <span className="text-[10px] text-indigo-200 block font-medium">Model Gemini-3.5-flash Terintegrasi</span>
          </div>
        </div>
        <button
          onClick={handleClear}
          title="Bersihkan chat"
          className="p-1.5 hover:bg-white/15 rounded-xl border border-white/10 transition-all cursor-pointer"
        >
          <Trash2 className="w-4 h-4 text-white" />
        </button>
      </div>

      {/* Messages wrapper */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50/50">
        {messages.map((m) => {
          const isUser = m.role === "user";
          return (
            <div key={m.id} className={`flex items-start gap-2.5 ${isUser ? "flex-row-reverse" : "flex-row"}`}>
              {/* Icon */}
              <div className={`p-1.5 rounded-xl border flex-shrink-0 ${isUser ? "bg-indigo-50 border-indigo-100/60 text-indigo-600" : "bg-white border-slate-100 text-slate-500"}`}>
                {isUser ? <User className="w-3.5 h-3.5" /> : <Bot className="w-3.5 h-3.5" />}
              </div>

              {/* Box */}
              <div className={`p-3 max-w-[85%] rounded-2xl shadow-xs border text-slate-700 ${
                isUser 
                  ? "bg-indigo-600/95 border-indigo-600 text-white rounded-tr-none" 
                  : "bg-white border-slate-100 rounded-tl-none"
              }`}>
                <div className="break-words select-text">
                  {isUser ? <p className="text-xs">{m.text}</p> : renderMessageContent(m.text)}
                </div>
                <span className={`text-[9px] block text-right mt-1.5 ${isUser ? "text-indigo-200" : "text-slate-400"}`}>
                  {m.timestamp}
                </span>
              </div>
            </div>
          );
        })}

        {loading && (
          <div className="flex items-start gap-2.5">
            <div className="p-1.5 rounded-xl border bg-white border-slate-100 text-slate-500 flex-shrink-0">
              <Bot className="w-3.5 h-3.5" />
            </div>
            <div className="p-4 bg-white border border-slate-100 rounded-2xl rounded-tl-none flex items-center justify-center gap-2">
              <Loader className="w-4 h-4 text-indigo-600 animate-spin" />
              <span className="text-xs text-slate-500 font-medium">Merumuskan analisis laporan...</span>
            </div>
          </div>
        )}
      </div>

      {/* Suggestions options */}
      {messages.length === 1 && !loading && (
        <div className="p-3 border-t border-slate-100/50 flex-shrink-0 bg-white">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-2">Rekomendasi Analisis:</span>
          <div className="flex flex-wrap gap-1.5">
            {suggestions.map((s, i) => (
              <button
                key={i}
                id={`suggest-btn-${i}`}
                onClick={() => handleSend(s)}
                className="text-[11px] font-semibold text-indigo-600 hover:text-white bg-indigo-50/50 hover:bg-indigo-600 hover:border-indigo-600 border border-indigo-100/40 px-2.5 py-1.5 rounded-xl transition-all cursor-pointer flex items-center gap-1"
              >
                {s}
                <ArrowUpRight className="w-3 h-3 opacity-60" />
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Entry field */}
      <div className="p-3 border-t border-slate-100 flex-shrink-0 bg-white">
        <form
          className="flex items-center gap-2"
          onSubmit={(e) => {
            e.preventDefault();
            handleSend(input);
          }}
        >
          <input
            id="chat-input-field"
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Tanyakan analisis laporan mitra..."
            disabled={loading}
            className="flex-1 py-2 px-3 text-xs bg-slate-50 border border-slate-100 rounded-xl outline-hidden focus:bg-white focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all font-medium text-slate-700"
          />
          <button
            type="submit"
            id="chat-submit-btn"
            disabled={!input.trim() || loading}
            className={`p-2 rounded-xl transition-all ${
              input.trim() && !loading
                ? "bg-indigo-600 text-white cursor-pointer hover:bg-indigo-700"
                : "bg-slate-100 text-slate-400 cursor-not-allowed"
            }`}
          >
            <Send className="w-4.5 h-4.5" />
          </button>
        </form>
      </div>
    </div>
  );
}
