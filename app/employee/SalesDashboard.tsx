"use client";

import { useState, useEffect } from "react";
import { Loader2, TrendingUp, Users, CheckCircle, XCircle } from "lucide-react";

export default function SalesDashboard({ email, name }: { email: string, name: string }) {
  const [leads, setLeads] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLeads();
  }, [name, email]);

  const fetchLeads = async () => {
    try {
      const res = await fetch("/api/admin/data", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "getLeads" })
      });
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data)) {
          const myLeads = data.filter(l => 
            (l.agent || "").toLowerCase() === name.toLowerCase() || 
            (l.agent || "").toLowerCase() === email.toLowerCase()
          );
          setLeads(myLeads);
        }
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-full min-h-dvh text-gray-500 bg-[#191919]">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  const activeLeads = leads.filter(l => l.status !== "Converted" && l.status !== "Rejected");
  const wonLeads = leads.filter(l => l.status === "Converted");
  const lostLeads = leads.filter(l => l.status === "Rejected");
  
  const totalLeads = leads.length;
  const conversionRate = totalLeads > 0 ? Math.round((wonLeads.length / totalLeads) * 100) : 0;

  return (
    <div className="p-4 sm:p-8 md:p-12 text-[#D4D4D4] bg-[#191919] min-h-dvh pb-24 md:pb-12">
      <div className="mb-8 md:mb-10">
        <h2 className="text-2xl md:text-3xl font-black uppercase tracking-tighter mb-2 text-white">
          Sales <span className="text-tpc-orange">Analytics</span>
        </h2>
        <p className="text-gray-500 font-mono text-xs md:text-sm uppercase tracking-widest">
          Performance Overview
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        <div className="bg-[#111] border border-white/10 rounded-2xl p-6 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-white/5 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2" />
          <Users className="w-6 h-6 text-gray-400 mb-4" />
          <div className="text-4xl font-black text-white mb-1">{totalLeads}</div>
          <div className="text-xs uppercase tracking-widest text-gray-500 font-bold">Total Leads</div>
        </div>

        <div className="bg-[#111] border border-white/10 rounded-2xl p-6 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2" />
          <TrendingUp className="w-6 h-6 text-blue-500 mb-4" />
          <div className="text-4xl font-black text-white mb-1">{activeLeads.length}</div>
          <div className="text-xs uppercase tracking-widest text-gray-500 font-bold">Active Pipeline</div>
        </div>

        <div className="bg-[#111] border border-white/10 rounded-2xl p-6 relative overflow-hidden group border-b-4 border-b-green-500">
          <div className="absolute top-0 right-0 w-24 h-24 bg-green-500/10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2" />
          <CheckCircle className="w-6 h-6 text-green-500 mb-4" />
          <div className="text-4xl font-black text-white mb-1">{wonLeads.length}</div>
          <div className="text-xs uppercase tracking-widest text-gray-500 font-bold">Won Clients</div>
        </div>

        <div className="bg-[#111] border border-white/10 rounded-2xl p-6 relative overflow-hidden group border-b-4 border-b-tpc-orange">
          <div className="absolute top-0 right-0 w-24 h-24 bg-tpc-orange/10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2" />
          <div className="w-6 h-6 flex items-center justify-center font-black text-tpc-orange mb-4 text-xl">%</div>
          <div className="text-4xl font-black text-white mb-1">{conversionRate}%</div>
          <div className="text-xs uppercase tracking-widest text-gray-500 font-bold">Win Rate</div>
        </div>
      </div>
      
      {activeLeads.length > 0 && (
        <div className="mt-8 bg-tpc-orange/10 border border-tpc-orange/20 rounded-xl p-6">
          <h3 className="text-tpc-orange font-bold uppercase tracking-widest text-sm mb-2">Keep Pushing!</h3>
          <p className="text-gray-300 text-sm">You have {activeLeads.length} active leads in your pipeline. Head over to <a href="/employee/leads" className="text-white font-bold underline">My Leads</a> to follow up and close those deals.</p>
        </div>
      )}
    </div>
  );
}
