"use client";

import { useState, useEffect, useMemo } from "react";
import { Loader2, Share2, ChevronLeft } from "lucide-react";
import MonthlyStrategyHub from "./research/MonthlyStrategyHub";

export default function StrategyDashboard({ initialRoles }: { initialRoles?: string[] }) {
  const canEdit = initialRoles === undefined || initialRoles.some(r => 
    r.toUpperCase().includes("CONTENT WRITER") || r.toUpperCase().includes("ADMIN")
  );

  const [researchData, setResearchData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [clients, setClients] = useState<string[]>([]);
  const [selectedClient, setSelectedClient] = useState<string | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [resRes, configRes] = await Promise.all([
        fetch("/api/admin/data?action=getClientResearch"),
        fetch("/api/admin/data?action=getConfig")
      ]);
      
      let configClients: string[] = [];
      if (configRes.ok) {
        const configData = await configRes.json();
        configClients = configData.workbook_settings?.clients || [];
      }

      if (resRes.ok) {
        const rData = await resRes.json();
        if (Array.isArray(rData)) {
          setResearchData(rData);
          const uniqueClients = configClients.length > 0 
            ? [...configClients].sort() 
            : Array.from(new Set(rData.map(r => r.clientName).filter(Boolean))).sort() as string[];
          setClients(uniqueClients);
          if (uniqueClients.length > 0 && !selectedClient) {
            setSelectedClient(uniqueClients[0]);
          }
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

  return (
    <div className="flex flex-col md:flex-row h-[calc(100dvh-60px)] md:h-dvh bg-[#191919] text-[#D4D4D4] overflow-hidden relative">

      {/* SIDEBAR: Vault/Client Selector */}
      <div className={`w-full md:w-72 bg-[#111] border-b md:border-r border-white/10 flex-col shrink-0 h-full ${selectedClient ? 'hidden md:flex' : 'flex'}`}>
        <div className="p-4 border-b border-white/10 shrink-0 bg-[#0a0a0a]">
          <h2 className="text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-2">Active Vault</h2>
          <select
            value={selectedClient || ""}
            onChange={e => setSelectedClient(e.target.value)}
            className="w-full bg-black/50 border border-white/10 rounded-lg p-2 text-sm text-tpc-orange font-bold focus:outline-none focus:border-tpc-orange"
          >
            {clients.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
        <div className="flex-1 flex flex-col items-center justify-center p-8 opacity-20">
          <Share2 className="w-16 h-16 text-white mb-4" />
          <p className="text-[10px] font-bold uppercase tracking-widest text-white">Strategy Vault</p>
        </div>
      </div>

      {/* MAIN CONTENT PANE */}
      <div className={`flex-1 flex-col h-full overflow-hidden bg-[#151515] min-w-0 ${selectedClient ? 'flex' : 'hidden md:flex'}`}>
        {selectedClient ? (
          <>
            <div className="md:hidden py-3 px-4 border-b border-white/10 bg-[#111]">
              <button 
                onClick={() => setSelectedClient(null)}
                className="flex items-center gap-1.5 text-xs uppercase font-black text-tpc-orange bg-tpc-orange/10 px-3 py-2 rounded-lg w-fit hover:bg-tpc-orange/20 transition-colors"
              >
                <ChevronLeft className="w-4 h-4" /> Switch Vault
              </button>
            </div>
            <MonthlyStrategyHub 
              clientName={selectedClient} 
              canEdit={canEdit} 
              researchFiles={researchData} 
            />
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-gray-500">
            <Share2 className="w-16 h-16 mb-4 opacity-20" />
            <p className="uppercase tracking-widest text-xs font-bold">Select a Vault</p>
          </div>
        )}
      </div>

    </div>
  );
}
