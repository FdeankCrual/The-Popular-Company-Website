"use client";

import { useState } from "react";
import Header from "../components/Header";
import { Crosshair, Loader2, Globe, Instagram, CheckCircle2, ShieldCheck, Users } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function AuditPage() {
  const [auditMode, setAuditMode] = useState<"website" | "social">("website");
  
  // Website State
  const [url, setUrl] = useState("");
  const [webEmail, setWebEmail] = useState("");
  
  // Social State
  const [handle, setHandle] = useState("");
  const [socialEmail, setSocialEmail] = useState("");
  const [brand, setBrand] = useState("");

  // Shared State
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasFinished, setHasFinished] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setHasFinished(false);
    
    const payload = auditMode === "website" 
      ? {
          type: "Website Audit",
          name: "Website Owner",
          email: webEmail,
          target: url,
          message: "Requesting a manual website teardown."
        }
      : {
          type: "Social Media Audit",
          name: brand,
          email: socialEmail,
          target: handle,
          message: "Requesting a manual social media teardown."
        };

    try {
      const response = await fetch("/api/lead", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        setHasFinished(true);
      } else {
        alert("Something went wrong. Please try emailing us directly.");
      }
    } catch (error) {
      alert("Network error. Please try again.");
    }
    
    setIsSubmitting(false);
  };

  return (
    <main className="bg-tpc-black min-h-screen text-white font-sans selection:bg-tpc-orange selection:text-black">
      <Header />
      
      <div className="max-w-[1200px] mx-auto px-6 pt-40 pb-20">
        
        {/* HERO */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center p-4 bg-tpc-orange/10 rounded-full mb-6 shadow-[0_0_40px_rgba(242,95,51,0.2)]">
            <Users className="w-8 h-8 text-tpc-orange" />
          </div>
          <h1 className="text-4xl md:text-6xl font-black uppercase tracking-tighter mb-4">
            The Human <span className="text-tpc-orange">Audit</span>
          </h1>
          <p className="text-gray-400 max-w-3xl mx-auto font-sans text-lg md:text-xl leading-relaxed">
            Select your target below and our <span className="text-white font-bold">elite human strategists</span> will manually dissect your digital presence to deliver a precision teardown within 24 hours.
          </p>
        </div>

        {/* TOGGLE */}
        <div className="flex justify-center mb-12">
          <div className="bg-[#111] border border-white/10 rounded-full p-1 flex">
            <button
              onClick={() => { setAuditMode("website"); setHasFinished(false); }}
              className={`flex items-center gap-2 px-6 py-3 rounded-full text-sm uppercase tracking-widest font-bold transition-colors ${auditMode === "website" ? "bg-tpc-orange text-black" : "text-gray-400 hover:text-white"}`}
            >
              <Globe className="w-4 h-4" /> Website
            </button>
            <button
              onClick={() => { setAuditMode("social"); setHasFinished(false); }}
              className={`flex items-center gap-2 px-6 py-3 rounded-full text-sm uppercase tracking-widest font-bold transition-colors ${auditMode === "social" ? "bg-tpc-orange text-black" : "text-gray-400 hover:text-white"}`}
            >
              <Instagram className="w-4 h-4" /> Social Media
            </button>
          </div>
        </div>

        {/* FORMS */}
        {!hasFinished ? (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-2xl mx-auto mb-16"
          >
            {auditMode === "website" ? (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <input 
                    type="url" 
                    placeholder="https://yourwebsite.com"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    disabled={isSubmitting}
                    required
                    className="w-full bg-black border-2 border-white/20 rounded-xl px-6 py-4 outline-none focus:border-tpc-orange transition-colors disabled:opacity-50 font-sans"
                  />
                  <input 
                    type="email" 
                    placeholder="Business Email"
                    value={webEmail}
                    onChange={(e) => setWebEmail(e.target.value)}
                    disabled={isSubmitting}
                    required
                    className="w-full bg-black border-2 border-white/20 rounded-xl px-6 py-4 outline-none focus:border-tpc-orange transition-colors disabled:opacity-50 font-sans"
                  />
                </div>
                <button 
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-white text-black font-bold uppercase tracking-widest py-5 rounded-xl hover:bg-tpc-orange hover:text-white transition-all flex justify-center items-center gap-2 disabled:opacity-50"
                >
                  {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : "Request Manual Website Audit"}
                </button>
              </form>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <input 
                    type="text" 
                    placeholder="@instagram_handle"
                    value={handle}
                    onChange={(e) => setHandle(e.target.value)}
                    disabled={isSubmitting}
                    required
                    className="w-full bg-black border-2 border-white/20 rounded-xl px-6 py-4 outline-none focus:border-tpc-orange transition-colors disabled:opacity-50 font-sans"
                  />
                  <input 
                    type="text" 
                    placeholder="Brand / Company Name"
                    value={brand}
                    onChange={(e) => setBrand(e.target.value)}
                    disabled={isSubmitting}
                    required
                    className="w-full bg-black border-2 border-white/20 rounded-xl px-6 py-4 outline-none focus:border-tpc-orange transition-colors disabled:opacity-50 font-sans"
                  />
                </div>
                <input 
                  type="email" 
                  placeholder="Your Business Email"
                  value={socialEmail}
                  onChange={(e) => setSocialEmail(e.target.value)}
                  disabled={isSubmitting}
                  required
                  className="w-full bg-black border-2 border-white/20 rounded-xl px-6 py-4 outline-none focus:border-tpc-orange transition-colors disabled:opacity-50 font-sans"
                />
                <button 
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-white text-black font-bold uppercase tracking-widest py-5 rounded-xl hover:bg-tpc-orange hover:text-white transition-all flex justify-center items-center gap-2 disabled:opacity-50"
                >
                  {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : "Request Manual Social Audit"}
                </button>
              </form>
            )}
            
            <div className="mt-8 text-center flex items-center justify-center gap-2 text-gray-500 font-mono text-sm">
              <ShieldCheck className="w-4 h-4 text-tpc-orange" />
              100% Human Analysis. No Automated Fluff.
            </div>
          </motion.div>
        ) : (
          <AnimatePresence>
             <motion.div 
               initial={{ opacity: 0, scale: 0.95 }}
               animate={{ opacity: 1, scale: 1 }}
               className="max-w-2xl mx-auto text-center bg-[#111] border border-white/10 rounded-3xl p-12 relative overflow-hidden"
             >
                <div className="absolute top-0 left-0 w-full h-1 bg-green-500" />
                <div className="inline-flex items-center justify-center p-4 bg-green-500/20 rounded-full mb-6">
                  <CheckCircle2 className="w-10 h-10 text-green-500" />
                </div>
                <h3 className="text-3xl font-black uppercase tracking-tighter mb-4">Target Acquired</h3>
                <p className="text-gray-400 text-lg mb-8 leading-relaxed">
                  Your data has been securely transmitted to the TPC Command Center.<br/>
                  Our elite human team is currently dissecting your strategy.<br/>
                  <strong className="text-white">Check your inbox in 24 hours.</strong>
                </p>
             </motion.div>
          </AnimatePresence>
        )}

      </div>
    </main>
  );
}
