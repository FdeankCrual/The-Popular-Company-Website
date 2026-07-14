"use client";

import { useState, useEffect } from "react";
import Header from "../components/Header";
import { CheckCircle2, Terminal, Save, Loader2 } from "lucide-react";

export default function AdminDashboard() {
  const [prompt, setPrompt] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    // Load the prompt on mount
    fetch("/api/admin/prompt")
      .then((res) => res.json())
      .then((data) => {
        if (data.systemPrompt) {
          setPrompt(data.systemPrompt);
        }
        setIsLoaded(true);
      });
  }, []);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await fetch("/api/admin/prompt", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ systemPrompt: prompt }),
      });
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    } catch (error) {
      console.error("Failed to save", error);
    }
    setIsSaving(false);
  };

  return (
    <main className="bg-tpc-black min-h-screen text-white selection:bg-tpc-orange selection:text-black font-mono">
      <Header />
      
      <div className="max-w-[1200px] mx-auto px-6 pt-40 pb-20">
        <div className="flex items-center gap-4 mb-12">
          <Terminal className="w-10 h-10 text-tpc-orange" />
          <h1 className="text-4xl md:text-5xl font-black uppercase tracking-tighter">
            AI Core Command
          </h1>
        </div>

        <div className="bg-[#111] border border-white/10 rounded-2xl p-8 relative overflow-hidden">
          {/* Decorative Grid */}
          <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center opacity-5 pointer-events-none" />

          <div className="relative z-10">
            <h2 className="text-xl text-gray-400 uppercase tracking-widest mb-6">
              Chatbot System Instructions (The Brain)
            </h2>
            <p className="text-sm text-gray-500 mb-6 font-sans">
              Warning: Modifying this prompt immediately alters the personality and knowledge base of the AI Sales Engineer across the entire website. Write instructions clearly.
            </p>

            {!isLoaded ? (
              <div className="h-64 flex items-center justify-center border border-white/5 bg-black rounded-lg">
                <Loader2 className="w-8 h-8 text-tpc-orange animate-spin" />
              </div>
            ) : (
              <div className="relative group">
                <textarea
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  className="w-full h-80 bg-black text-green-400 p-6 rounded-lg border border-white/10 focus:border-tpc-orange focus:ring-1 focus:ring-tpc-orange outline-none resize-y text-sm leading-relaxed tracking-wide transition-all"
                  placeholder="You are an aggressive sales rep..."
                  spellCheck={false}
                />
                
                {/* Save Button Overlay */}
                <div className="absolute bottom-6 right-6 flex items-center gap-4">
                  {showSuccess && (
                    <span className="text-green-500 text-sm flex items-center gap-2 animate-in fade-in slide-in-from-right-4">
                      <CheckCircle2 className="w-4 h-4" /> Systems Updated
                    </span>
                  )}
                  <button
                    onClick={handleSave}
                    disabled={isSaving}
                    className="bg-tpc-orange text-black px-6 py-3 rounded hover:bg-white transition-colors flex items-center gap-2 font-bold uppercase tracking-widest disabled:opacity-50"
                  >
                    {isSaving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                    Deploy to Core
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
