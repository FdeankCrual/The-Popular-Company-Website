"use client";

import { useState, useEffect } from "react";
import { Trash2, Loader2, Plus, X } from "lucide-react";

const emptyLead = { date: "", type: "Manual", name: "", email: "", target: "", message: "" };

export default function LeadsPage() {
  const [leads, setLeads] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingIndex, setDeletingIndex] = useState<number | null>(null);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState<any>(emptyLead);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    fetchLeads();
  }, []);

  async function fetchLeads() {
    try {
      const res = await fetch("/api/admin/data", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "getLeads" })
      });
      if (res.ok) {
        const liveData = await res.json();
        if (Array.isArray(liveData)) {
          setLeads(liveData);
        }
      }
    } catch (err) {
      console.error("Failed to fetch leads", err);
    } finally {
      setLoading(false);
    }
  }

  const handleDelete = async (index: number) => {
    if (!confirm("Are you sure you want to delete this lead?")) return;
    
    setDeletingIndex(index);
    try {
      const res = await fetch("/api/admin/data", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "deleteLead", rowIndex: index })
      });
      if (res.ok) {
        // Remove from local state
        setLeads(leads.filter((_, i) => i !== index));
      } else {
        alert("Failed to delete lead from Google Sheets.");
      }
    } catch (err) {
      console.error(err);
      alert("Error deleting lead.");
    } finally {
      setDeletingIndex(null);
    }
  };

  const handleOpenNew = () => {
    setFormData({ ...emptyLead, date: new Date().toISOString().split('T')[0] });
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    
    try {
      const res = await fetch("/api/admin/data", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "addLead", data: formData })
      });
      
      if (res.ok) {
        setLeads([...leads, formData]);
        setIsModalOpen(false);
      } else {
        alert("Failed to save to Google Sheets.");
      }
    } catch (err) {
      console.error(err);
      alert("Error saving data.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="p-8 md:p-12 h-full flex flex-col">
      <div className="mb-10 flex justify-between items-end shrink-0">
        <div>
          <h2 className="text-3xl font-black uppercase tracking-tighter mb-2">Inbound <span className="text-tpc-orange">Leads</span></h2>
          <p className="text-gray-500 font-mono text-sm uppercase tracking-widest">Manage Contact and Audit Requests</p>
        </div>
        <button onClick={handleOpenNew} className="bg-tpc-orange text-black px-6 py-3 rounded-xl font-bold uppercase tracking-widest flex items-center gap-2 hover:bg-white transition-colors cursor-pointer">
          <Plus className="w-4 h-4" /> New Lead
        </button>
      </div>

      <div className="bg-[#111] border border-white/10 rounded-2xl overflow-hidden flex-1 flex flex-col">
        {loading ? (
          <div className="flex items-center justify-center h-full min-h-[400px] text-gray-500 gap-2"><Loader2 className="w-4 h-4 animate-spin"/> Loading Leads...</div>
        ) : (
          <div className="overflow-auto flex-1">
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead className="sticky top-0 bg-[#111] z-10 border-b border-white/10 text-gray-400">
                <tr>
                  <th className="px-6 py-4 font-medium uppercase tracking-widest text-[10px]">Date</th>
                  <th className="px-6 py-4 font-medium uppercase tracking-widest text-[10px]">Type</th>
                  <th className="px-6 py-4 font-medium uppercase tracking-widest text-[10px]">Name</th>
                  <th className="px-6 py-4 font-medium uppercase tracking-widest text-[10px]">Email</th>
                  <th className="px-6 py-4 font-medium uppercase tracking-widest text-[10px]">Target / Service</th>
                  <th className="px-6 py-4 font-medium uppercase tracking-widest text-[10px]">Message</th>
                  <th className="px-6 py-4 font-medium uppercase tracking-widest text-[10px] text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {leads.length === 0 ? (
                  <tr><td colSpan={7} className="p-6 text-center text-gray-500">No leads found in Google Sheets.</td></tr>
                ) : null}
                {leads.map((lead, i) => (
                  <tr key={i} className="hover:bg-white/5 transition-colors">
                    <td className="px-6 py-4 text-gray-400 whitespace-nowrap">{lead.date}</td>
                    <td className="px-6 py-4">
                      <span className="bg-white/10 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest">{lead.type}</span>
                    </td>
                    <td className="px-6 py-4 font-medium text-white">{lead.name}</td>
                    <td className="px-6 py-4 text-tpc-orange">{lead.email}</td>
                    <td className="px-6 py-4 text-gray-400">{lead.target}</td>
                    <td className="px-6 py-4 text-gray-500 max-w-xs truncate" title={lead.message}>{lead.message}</td>
                    <td className="px-6 py-4 text-right">
                      <button 
                        onClick={() => handleDelete(i)}
                        disabled={deletingIndex === i}
                        className="p-2 text-gray-500 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-colors cursor-pointer"
                      >
                        {deletingIndex === i ? <Loader2 className="w-4 h-4 animate-spin"/> : <Trash2 className="w-4 h-4" />}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ADD LEAD MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[20000] bg-black/80 flex items-center justify-center p-4">
          <div className="bg-[#191919] border border-white/10 rounded-2xl w-full max-w-2xl flex flex-col max-h-[90vh]">
            <div className="flex justify-between items-center p-6 border-b border-white/10 shrink-0">
              <h3 className="text-xl font-bold text-white">Add New Lead</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-white cursor-pointer"><X className="w-5 h-5"/></button>
            </div>
            
            <form onSubmit={handleSave} className="flex-1 overflow-auto p-6 space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-xs uppercase tracking-widest text-gray-500 font-medium">Name</label>
                  <input required value={formData.name || ''} onChange={(e)=>setFormData({...formData, name: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:border-tpc-orange" />
                </div>
                <div className="space-y-2">
                  <label className="text-xs uppercase tracking-widest text-gray-500 font-medium">Email</label>
                  <input type="email" required value={formData.email || ''} onChange={(e)=>setFormData({...formData, email: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:border-tpc-orange" />
                </div>
                <div className="space-y-2">
                  <label className="text-xs uppercase tracking-widest text-gray-500 font-medium">Type</label>
                  <select value={formData.type || 'Manual'} onChange={(e)=>setFormData({...formData, type: e.target.value})} className="w-full bg-[#222] border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:border-tpc-orange">
                    <option>Manual</option>
                    <option>Contact Form</option>
                    <option>Audit</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-xs uppercase tracking-widest text-gray-500 font-medium">Target / Service</label>
                  <input value={formData.target || ''} onChange={(e)=>setFormData({...formData, target: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:border-tpc-orange" />
                </div>
                <div className="space-y-2">
                  <label className="text-xs uppercase tracking-widest text-gray-500 font-medium">Date</label>
                  <input type="date" value={formData.date || ''} onChange={(e)=>setFormData({...formData, date: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:border-tpc-orange [color-scheme:dark]" />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs uppercase tracking-widest text-gray-500 font-medium">Message / Notes</label>
                <textarea rows={4} value={formData.message || ''} onChange={(e)=>setFormData({...formData, message: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:border-tpc-orange" />
              </div>

              <div className="flex justify-end gap-4 pt-4 shrink-0">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-6 py-3 rounded-xl font-bold text-gray-400 hover:text-white transition-colors cursor-pointer">Cancel</button>
                <button disabled={isSaving} type="submit" className="bg-tpc-orange text-black px-8 py-3 rounded-xl font-bold uppercase tracking-widest hover:bg-white transition-colors disabled:opacity-50 flex items-center gap-2 cursor-pointer">
                  {isSaving ? <Loader2 className="w-5 h-5 animate-spin" /> : null} Add Lead
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
