"use client";
import { useState } from "react";
import { motion } from "framer-motion";
import Header from "../components/Header";
import Cursor from "../Cursor";
import { ArrowUpRight, Mail, Phone, MessageCircle } from "lucide-react";

export default function ContactPage() {
  // 1. STATE
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [selectedService, setSelectedService] = useState("");
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasFinished, setHasFinished] = useState(false);

  // 2. SUBMIT LOGIC
  const handleSubmit = async (e: any) => {
    e.preventDefault();

    // Basic Validation
    if (!name || !email || !message) {
      alert("Please fill in all required fields.");
      return;
    }
    if (!selectedService) {
      alert("Please select a service.");
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch("/api/lead", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "Contact",
          name: name,
          email: email,
          target: selectedService, // Using target column for selected service
          message: message
        }),
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
              Ready to scale? Tell us what you need, and our elite team will get back to you with a custom roadmap.
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

          {!hasFinished ? (
            <form onSubmit={handleSubmit} className="flex flex-col h-full justify-center gap-8 relative z-10">
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* 1. Name Input */}
                <div className="group space-y-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-gray-500 group-focus-within:text-tpc-orange transition-colors">
                    Name *
                  </label>
                  <input 
                    type="text" 
                    placeholder="John Doe" 
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    disabled={isSubmitting}
                    className="w-full bg-transparent border-b border-white/20 py-2 text-xl font-bold focus:outline-none focus:border-tpc-orange transition-colors placeholder:text-white/20 text-white disabled:opacity-50"
                  />
                </div>

                {/* Email Input */}
                <div className="group space-y-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-gray-500 group-focus-within:text-tpc-orange transition-colors">
                    Email *
                  </label>
                  <input 
                    type="email" 
                    placeholder="john@company.com" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={isSubmitting}
                    className="w-full bg-transparent border-b border-white/20 py-2 text-xl font-bold focus:outline-none focus:border-tpc-orange transition-colors placeholder:text-white/20 text-white disabled:opacity-50"
                  />
                </div>
              </div>

              {/* 2. Service Selection */}
              <div className="space-y-4">
                <label className="text-xs font-bold uppercase tracking-widest text-gray-500">
                  I'm interested in... *
                </label>
                <div className="flex flex-wrap gap-2">
                  {services.map((service) => (
                    <button 
                      key={service} 
                      type="button" 
                      disabled={isSubmitting}
                      onClick={() => setSelectedService(service)}
                      className={`px-4 py-2 rounded-full border text-sm font-medium transition-all duration-300 disabled:opacity-50
                        ${selectedService === service 
                          ? "bg-tpc-orange text-black border-tpc-orange shadow-[0_0_15px_rgba(255,107,53,0.3)]" 
                          : "border-white/10 text-gray-400 hover:border-white/40 hover:text-white hover:bg-white/5"
                        }`}
                    >
                      {service}
                    </button>
                  ))}
                </div>
              </div>

              {/* Message Input */}
              <div className="group space-y-2 flex-grow">
                <label className="text-xs font-bold uppercase tracking-widest text-gray-500 group-focus-within:text-tpc-orange transition-colors">
                  Message *
                </label>
                <textarea 
                  placeholder="Tell us about your project..." 
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  disabled={isSubmitting}
                  className="w-full h-full min-h-[100px] bg-transparent border-b border-white/20 py-2 text-xl font-bold focus:outline-none focus:border-tpc-orange transition-colors placeholder:text-white/20 text-white resize-none disabled:opacity-50"
                ></textarea>
              </div>

              {/* 3. Submit Button */}
              <button 
                type="submit"
                disabled={isSubmitting}
                className="mt-2 w-full py-4 bg-white text-black rounded-xl font-bold text-lg uppercase tracking-widest hover:bg-tpc-orange disabled:hover:bg-white hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 flex items-center justify-center gap-3 group disabled:opacity-70"
              >
                {isSubmitting ? "Sending..." : "Submit Request"}
                <ArrowUpRight className="w-5 h-5 group-hover:-rotate-12 transition-transform" />
              </button>

            </form>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-center relative z-10 space-y-6">
               <div className="w-20 h-20 bg-tpc-orange/20 rounded-full flex items-center justify-center">
                 <ArrowUpRight className="w-10 h-10 text-tpc-orange" />
               </div>
               <h2 className="text-3xl font-bold">Request Received</h2>
               <p className="text-gray-400 max-w-sm">
                 Thank you! Our human strategists will review your project and get back to you via email shortly.
               </p>
               <button 
                 onClick={() => {
                   setHasFinished(false);
                   setName(""); setEmail(""); setMessage(""); setSelectedService("");
                 }}
                 className="mt-4 px-6 py-3 border border-white/20 rounded-full hover:bg-white/10 transition-colors uppercase tracking-widest text-sm font-bold"
               >
                 Send Another
               </button>
            </div>
          )}
        </motion.div>

      </section>
    </main>
  );
}
