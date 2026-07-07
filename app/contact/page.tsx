"use client";
import { useState } from "react";
import { motion } from "framer-motion";
import Header from "../components/Header";
import Cursor from "../Cursor";
import { ArrowUpRight, Mail, Phone, MessageCircle } from "lucide-react";

export default function ContactPage() {
  // 1. STATE
  const [name, setName] = useState("");
  const [selectedService, setSelectedService] = useState("");

  // 2. WHATSAPP LOGIC
  const handleSendToWhatsApp = (e: any) => {
    e.preventDefault();

    // Basic Validation
    if (!name) {
      alert("Please tell us your name first.");
      return;
    }
    if (!selectedService) {
      alert("Please select a service.");
      return;
    }

    // Format Message
    const phoneNumber = "916367547753";
    const message = `Hi TPC, my name is ${name}. I am interested in ${selectedService}. I would like to discuss a project.`;
    
    // Redirect
    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, "_blank");
  };

  const services = ["Social Media", "Ads / Performance", "Video Production", "Branding", "Web / Tech", "Other"];

  return (
    <main className="bg-tpc-black min-h-screen text-white selection:bg-tpc-orange selection:text-black">
      <Cursor />
      <Header />

      <section className="min-h-screen flex flex-col md:flex-row pt-32 pb-20 px-6 md:px-12 gap-12 md:gap-20">
        
        {/* --- LEFT SIDE: THE PITCH --- */}
        <div className="md:w-1/2 flex flex-col justify-between">
          <div>
            <motion.span 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-tpc-orange font-mono text-xs uppercase tracking-widest mb-4 block"
            >
              Start a Project
            </motion.span>
            
            <motion.h1 
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.1 }}
              className="text-[14vw] md:text-[7vw] font-bold leading-[0.9] tracking-tighter mb-8 md:mb-12"
            >
              LET'S <br />
              TALK.
            </motion.h1>

            <motion.p 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="text-lg text-gray-400 max-w-md leading-relaxed"
            >
              We don't do boring forms. Tell us what you need, and we'll chat directly on WhatsApp. Faster, simpler, better.
            </motion.p>
          </div>

          {/* Contact Details */}
          <div className="flex flex-col gap-6 mt-12 md:mt-0">
            <a href="mailto:thepopularco.official@gmail.com" className="flex items-center gap-4 group cursor-none">
                <div className="w-12 h-12 rounded-full border border-white/10 flex items-center justify-center group-hover:bg-tpc-orange group-hover:border-tpc-orange group-hover:text-black transition-all duration-300">
                    <Mail className="w-5 h-5" />
                </div>
                <div>
                    <span className="text-xs text-gray-500 uppercase tracking-widest block mb-1">Email</span>
                    <span className="text-lg font-bold group-hover:text-tpc-orange transition-colors">thepopularco.official@gmail.com</span>
                </div>
            </a>
            
            <a href="tel:+916367547753" className="flex items-center gap-4 group cursor-none">
                <div className="w-12 h-12 rounded-full border border-white/10 flex items-center justify-center group-hover:bg-tpc-orange group-hover:border-tpc-orange group-hover:text-black transition-all duration-300">
                    <Phone className="w-5 h-5" />
                </div>
                <div>
                    <span className="text-xs text-gray-500 uppercase tracking-widest block mb-1">Phone</span>
                    <span className="text-lg font-bold group-hover:text-tpc-orange transition-colors">+91 6367547753</span>
                </div>
            </a>
          </div>
        </div>

        {/* --- RIGHT SIDE: THE FORM --- */}
        <motion.div 
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="md:w-1/2 bg-white/5 backdrop-blur-sm border border-white/10 rounded-[2rem] p-8 md:p-12 relative overflow-hidden"
        >
          {/* Subtle Glow Effect */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-tpc-orange/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />

          <form onSubmit={handleSendToWhatsApp} className="flex flex-col h-full justify-center gap-10 relative z-10">
            
            {/* 1. Name Input */}
            <div className="group space-y-4">
              <label className="text-xs font-bold uppercase tracking-widest text-gray-500 group-focus-within:text-tpc-orange transition-colors">
                01. What's your name?
              </label>
              <input 
                type="text" 
                placeholder="Type your name here..." 
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-transparent border-b border-white/20 py-4 text-2xl md:text-3xl font-bold focus:outline-none focus:border-tpc-orange transition-colors placeholder:text-white/20 text-white"
              />
            </div>

            {/* 2. Service Selection */}
            <div className="space-y-4">
              <label className="text-xs font-bold uppercase tracking-widest text-gray-500">
                02. I'm interested in...
              </label>
              <div className="flex flex-wrap gap-3">
                {services.map((service) => (
                  <button 
                    key={service} 
                    type="button" 
                    onClick={() => setSelectedService(service)}
                    className={`px-5 py-3 rounded-full border text-sm md:text-base font-medium transition-all duration-300
                      ${selectedService === service 
                        ? "bg-tpc-orange text-black border-tpc-orange shadow-[0_0_20px_rgba(255,107,53,0.4)]" 
                        : "border-white/10 text-gray-400 hover:border-white/40 hover:text-white hover:bg-white/5"
                      }`}
                  >
                    {service}
                  </button>
                ))}
              </div>
            </div>

            {/* 3. Submit Button */}
            <button 
              type="submit"
              className="mt-4 w-full py-5 bg-white text-black rounded-xl font-bold text-lg uppercase tracking-widest hover:bg-tpc-orange hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 flex items-center justify-center gap-3 group"
            >
              Chat on WhatsApp
              <MessageCircle className="w-5 h-5 group-hover:-rotate-12 transition-transform" />
            </button>

            <p className="text-center text-xs text-gray-600 font-mono">
                Average response time: 10 minutes.
            </p>

          </form>
        </motion.div>

      </section>
    </main>
  );
}
