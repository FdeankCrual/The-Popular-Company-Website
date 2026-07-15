"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, ArrowRight } from "lucide-react";
import Image from "next/image";

export default function AdminLoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const res = await fetch("/api/admin/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password })
      });

      if (res.ok) {
        router.push("/admin");
        router.refresh();
      } else {
        const data = await res.json();
        setError(data.error || "Invalid credentials");
      }
    } catch (err) {
      setError("Network error");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-tpc-black flex items-center justify-center text-white selection:bg-tpc-orange selection:text-black px-6">
      <div className="w-full max-w-md bg-[#111] border border-white/10 rounded-[2rem] p-8 md:p-12 relative overflow-hidden">
        {/* Glow */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-tpc-orange/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />

        <div className="mb-10 relative z-10 flex flex-col items-center">
          <h1 className="text-4xl font-black tracking-tighter uppercase mb-2">
            Mission <span className="text-tpc-orange">Control</span>
          </h1>
          <p className="text-gray-500 font-mono text-xs uppercase tracking-widest">
            Authorized Personnel Only
          </p>
        </div>

        <form onSubmit={handleLogin} className="relative z-10 space-y-6">
          {error && (
            <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-500 text-sm font-mono text-center">
              {error}
            </div>
          )}

          <div className="space-y-2 group">
            <label className="text-xs font-bold uppercase tracking-widest text-gray-500 group-focus-within:text-tpc-orange transition-colors">
              Email
            </label>
            <input 
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="agent@tpc.com"
              className="w-full bg-black border-2 border-white/10 rounded-xl px-6 py-4 outline-none focus:border-tpc-orange transition-colors font-sans text-lg placeholder:text-white/20"
              required
            />
          </div>

          <div className="space-y-2 group">
            <label className="text-xs font-bold uppercase tracking-widest text-gray-500 group-focus-within:text-tpc-orange transition-colors">
              Passcode
            </label>
            <input 
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full bg-black border-2 border-white/10 rounded-xl px-6 py-4 outline-none focus:border-tpc-orange transition-colors font-sans text-lg placeholder:text-white/20"
              required
            />
          </div>

          <button 
            type="submit"
            disabled={isLoading}
            className="w-full mt-4 bg-white text-black font-bold uppercase tracking-widest py-4 rounded-xl hover:bg-tpc-orange hover:text-white transition-all flex justify-center items-center gap-2 disabled:opacity-50"
          >
            {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : (
              <>Initiate Link <ArrowRight className="w-4 h-4" /></>
            )}
          </button>
        </form>

        <div className="mt-8 text-center text-[10px] text-gray-600 uppercase tracking-widest font-mono">
          System v1.0.0 • The Popular Co.
        </div>
      </div>
    </main>
  );
}
