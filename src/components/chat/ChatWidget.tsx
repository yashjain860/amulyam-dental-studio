"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  MessageSquare,
  X,
  Send,
  Sparkles,
  Calendar,
  Clock,
  MapPin,
  CheckCircle2,
  ExternalLink,
  QrCode,
  Phone,
  RotateCcw,
  Bot
} from "lucide-react";
import Link from "next/link";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: string;
  bookingConfirmation?: {
    id: string;
    patientName: string;
    service: string;
    date: string;
    timeSlot: string;
    passUrl: string;
    qrCodeUrl?: string;
  } | null;
}

const QUICK_ACTIONS = [
  { label: "📅 Book Appointment", prompt: "I would like to book a dental appointment with Dr. Shreya Nidhi." },
  { label: "⏰ Clinic Timings", prompt: "What are the clinic timings and working hours?" },
  { label: "💰 Treatment Costs", prompt: "What are the costs for Root Canal (RCT), Crowns, and Teeth Whitening?" },
  { label: "📍 Location & Address", prompt: "Where is Amulyam Dental Studio located in Bhopal?" },
  { label: "🔍 Track Booking", prompt: "I want to track my appointment status and digital pass." }
];

export default function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome-1",
      role: "assistant",
      content: `👋 Namaste! I am **Dr. Shreya Nidhi's AI Care Concierge** at Amulyam Dental Studio.\n\nI can help you check open doctor slots, get treatment estimates, or **book an instant appointment** with a verifiable digital boarding pass.\n\nHow can I help you today?`,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    }
  ]);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Hydrate conversation memory from sessionStorage on mount
  useEffect(() => {
    try {
      const saved = sessionStorage.getItem("amulyam_ai_chat_session_v2");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setMessages(parsed);
        }
      }
    } catch (e) {}
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
      inputRef.current?.focus();
    }
  }, [isOpen, messages]);

  const handleSend = async (textToSend?: string) => {
    const text = textToSend || input;
    if (!text.trim() || loading) return;

    const userMessage: Message = {
      id: `user-${Date.now()}`,
      role: "user",
      content: text.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    };

    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    try {
      sessionStorage.setItem("amulyam_ai_chat_session_v2", JSON.stringify(newMessages));
    } catch (e) {}
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: newMessages.map((m) => ({ role: m.role, content: m.content }))
        })
      });

      if (!res.ok) {
        throw new Error("Failed to reach AI assistant");
      }

      const data = await res.json();
      const assistantMessage: Message = {
        id: `assistant-${Date.now()}`,
        role: "assistant",
        content: data.content || "I have received your request.",
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        bookingConfirmation: data.bookingConfirmation || null
      };

      const finalMessages = [...newMessages, assistantMessage];
      setMessages(finalMessages);
      try {
        sessionStorage.setItem("amulyam_ai_chat_session_v2", JSON.stringify(finalMessages));
      } catch (e) {}
    } catch (err) {
      console.error("Chat error:", err);
      const fallbackMsg: Message = {
        id: `err-${Date.now()}`,
        role: "assistant",
        content: "I am having trouble connecting to the clinic server. You can reach Dr. Shreya Nidhi directly on WhatsApp at **+91 97531 33330**.",
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
      };
      setMessages((prev) => [...prev, fallbackMsg]);
    } finally {
      setLoading(false);
    }
  };

  const resetChat = () => {
    const initial: Message[] = [
      {
        id: `welcome-${Date.now()}`,
        role: "assistant",
        content: `👋 Hello! I am Dr. Shreya Nidhi's AI Concierge. How can I assist you with your dental care today?`,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
      }
    ];
    setMessages(initial);
    try {
      sessionStorage.removeItem("amulyam_ai_chat_session_v2");
    } catch (e) {}
  };

  return (
    <>
      {/* 1. Floating AI Assistant Trigger Button */}
      <div className="fixed bottom-20 sm:bottom-6 right-20 sm:right-24 z-50 flex items-center gap-2">
        <button
          onClick={() => setIsOpen(!isOpen)}
          aria-label="Open AI Dental Care Assistant"
          className="group relative flex items-center gap-2.5 px-4 py-3 bg-gradient-to-r from-amber-500 via-amber-600 to-amber-700 text-slate-950 font-bold text-sm rounded-full shadow-xl hover:shadow-2xl hover:scale-105 transition-all duration-300 border border-amber-300/40"
        >
          {/* Online Ripple Dot */}
          <span className="relative flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-400 border-2 border-slate-950"></span>
          </span>

          <Sparkles className="w-4 h-4 text-slate-950 animate-pulse" />
          <span className="hidden md:inline font-bold tracking-tight">AI Booking &amp; Care</span>
          <span className="md:hidden font-bold">AI Care</span>
        </button>
      </div>

      {/* 2. Interactive Chat Modal / Drawer */}
      {isOpen && (
        <div
          data-lenis-prevent
          data-lenis-prevent-wheel
          data-lenis-prevent-touch
          onWheel={(e) => e.stopPropagation()}
          className="fixed bottom-20 sm:bottom-24 right-4 sm:right-6 z-50 w-[calc(100vw-2rem)] sm:w-[420px] max-h-[640px] h-[85vh] bg-slate-900/95 backdrop-blur-xl border border-amber-500/30 rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-5 duration-300 overscroll-contain"
          style={{ boxShadow: "0 25px 60px -15px rgba(0, 0, 0, 0.7), 0 0 30px rgba(217, 119, 6, 0.15)" }}
        >
          {/* Header */}
          <div className="px-4 py-3.5 bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 border-b border-amber-500/20 flex items-center justify-between select-none">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
                <Bot className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <h4 className="text-sm font-bold text-white leading-tight">Amulyam AI Concierge</h4>
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 font-medium">Live</span>
                </div>
                <p className="text-[11px] text-amber-200/60 leading-tight">Dr. Shreya Nidhi's Practice • Awadhpuri</p>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={resetChat}
                title="Reset Conversation"
                className="p-1.5 text-slate-400 hover:text-amber-400 rounded-lg hover:bg-slate-800 transition"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
              <button
                onClick={() => setIsOpen(false)}
                title="Close Chat"
                className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Messages Body */}
          <div
            data-lenis-prevent
            data-lenis-prevent-wheel
            data-lenis-prevent-touch
            onWheel={(e) => e.stopPropagation()}
            onTouchMove={(e) => e.stopPropagation()}
            className="flex-1 p-4 overflow-y-auto space-y-4 text-xs sm:text-sm overscroll-contain"
          >
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex flex-col ${msg.role === "user" ? "items-end" : "items-start"}`}
              >
                <div
                  className={`max-w-[85%] rounded-2xl px-4 py-3 leading-relaxed whitespace-pre-wrap ${
                    msg.role === "user"
                      ? "bg-amber-500 text-slate-950 font-medium rounded-tr-none shadow-md"
                      : "bg-slate-800/90 text-slate-200 border border-slate-700/60 rounded-tl-none"
                  }`}
                >
                  {msg.content}

                  {/* Render In-Chat Digital Boarding Pass if Booking Confirmed */}
                  {msg.bookingConfirmation && (
                    <div className="mt-3 p-3.5 rounded-xl bg-slate-950/90 border border-amber-500/40 text-left space-y-2.5">
                      <div className="flex items-center justify-between border-b border-amber-500/20 pb-2">
                        <div className="flex items-center gap-1.5 text-emerald-400 font-bold text-xs">
                          <CheckCircle2 className="w-4 h-4" />
                          <span>Appointment Reserved</span>
                        </div>
                        <span className="font-mono text-[10px] text-amber-300/80 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                          {msg.bookingConfirmation.id}
                        </span>
                      </div>

                      <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-300">
                        <div>
                          <span className="text-slate-400 block text-[10px]">Patient:</span>
                          <span className="font-semibold text-white">{msg.bookingConfirmation.patientName}</span>
                        </div>
                        <div>
                          <span className="text-slate-400 block text-[10px]">Treatment:</span>
                          <span className="font-semibold text-white">{msg.bookingConfirmation.service}</span>
                        </div>
                        <div>
                          <span className="text-slate-400 block text-[10px]">Date:</span>
                          <span className="font-semibold text-amber-300">{msg.bookingConfirmation.date}</span>
                        </div>
                        <div>
                          <span className="text-slate-400 block text-[10px]">Time Slot:</span>
                          <span className="font-semibold text-amber-300">{msg.bookingConfirmation.timeSlot}</span>
                        </div>
                      </div>

                      {/* Action buttons inside chat */}
                      <div className="pt-2 border-t border-slate-800 flex gap-2">
                        <a
                          href={msg.bookingConfirmation.passUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex-1 py-1.5 px-2.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-[11px] flex items-center justify-center gap-1.5 transition"
                        >
                          <QrCode className="w-3.5 h-3.5" />
                          <span>View Digital Pass</span>
                        </a>
                      </div>
                    </div>
                  )}
                </div>
                <span className="text-[10px] text-slate-400 px-1 mt-1">{msg.timestamp}</span>
              </div>
            ))}

            {loading && (
              <div className="flex items-center gap-2 text-amber-400 bg-slate-800/60 border border-slate-700 px-3.5 py-2.5 rounded-xl rounded-tl-none w-fit">
                <span className="animate-spin text-sm">✦</span>
                <span className="text-xs text-slate-300">Dr. Shreya's AI is checking clinic records...</span>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Quick Action Chips */}
          <div
            data-lenis-prevent
            onWheel={(e) => e.stopPropagation()}
            className="px-3 py-2 bg-slate-950/60 border-t border-slate-800/80 flex gap-1.5 overflow-x-auto no-scrollbar overscroll-contain"
          >
            {QUICK_ACTIONS.map((action, idx) => (
              <button
                key={idx}
                onClick={() => handleSend(action.prompt)}
                disabled={loading}
                className="whitespace-nowrap px-2.5 py-1 rounded-full bg-slate-800/80 hover:bg-amber-500/20 text-slate-300 hover:text-amber-300 border border-slate-700 text-[11px] font-medium transition shrink-0"
              >
                {action.label}
              </button>
            ))}
          </div>

          {/* Input Footer */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="p-3 bg-slate-950 border-t border-slate-800 flex items-center gap-2"
          >
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about treatments or book a slot..."
              disabled={loading}
              className="flex-1 bg-slate-900 border border-slate-700 focus:border-amber-500 text-white rounded-xl px-3.5 py-2.5 text-xs sm:text-sm focus:outline-none transition"
            />
            <button
              type="submit"
              disabled={!input.trim() || loading}
              aria-label="Send message"
              className="p-2.5 bg-amber-500 hover:bg-amber-400 disabled:opacity-50 disabled:hover:bg-amber-500 text-slate-950 rounded-xl font-bold transition flex items-center justify-center shrink-0"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      )}
    </>
  );
}
