"use client";

import { useState, useEffect } from "react";
import { Loader2, Plus, X, MessageSquare } from "lucide-react";

const emptyLead = { date: "", type: "Agent Initiated", name: "", email: "", phone: "", target: "", message: "", status: "New", agent: "" };

export default function EmployeeLeadsDashboard({ email, name }: { email: string, name: string }) {
  const [leads, setLeads] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeQueryLead, setActiveQueryLead] = useState<any>(null);
  const [formData, setFormData] = useState<any>({ ...emptyLead, agent: name });
  const [isSaving, setIsSaving] = useState(false);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

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
          // Filter to show only leads assigned to this agent
          const myLeads = data.filter(l => 
            (l.agent || "").toLowerCase() === name.toLowerCase() || 
            (l.agent || "").toLowerCase() === email.toLowerCase()
          );
          // Assuming the row index is needed for updating, we map a virtual ID
          const mappedLeads = myLeads.map((l, idx) => ({ ...l, _originalIndex: data.findIndex(ol => ol === l) }));
          setLeads(mappedLeads);
        }
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveNew = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    
    try {
      const res = await fetch("/api/admin/data", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "bulkAddLeads", data: [formData] })
      });
      
      if (res.ok) {
        await fetchLeads(); // Refetch to get the proper index
        setIsModalOpen(false);
      } else {
        alert("Failed to save to database.");
      }
    } catch (err) {
      console.error(err);
      alert("Error saving data.");
    } finally {
      setIsSaving(false);
    }
  };

  const updateLead = async (lead: any, updates: any) => {
    setUpdatingId(lead._originalIndex.toString());
    try {
      await fetch("/api/admin/data", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "bulkUpdateLeads",
          updates: [{ ...lead, ...updates }]
        })
      });
      await fetchLeads();
    } catch (err) {
      console.error("Failed to update", err);
    } finally {
      setUpdatingId(null);
    }
  };


  if (loading) {
    return (
      <div className="flex justify-center items-center h-full min-h-screen text-gray-500 bg-[#191919]">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  const activeLeads = leads.filter(l => l.status !== "Converted" && l.status !== "Rejected");
  const closedLeads = leads.filter(l => l.status === "Converted" || l.status === "Rejected");

  return (
    <div className="p-4 sm:p-8 md:p-12 text-[#D4D4D4] bg-[#191919] min-h-screen pb-24 md:pb-12">
      <div className="mb-8 md:mb-10 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h2 className="text-2xl md:text-3xl font-black uppercase tracking-tighter mb-2 text-white">
            My <span className="text-tpc-orange">Leads</span>
          </h2>
          <p className="text-gray-500 font-mono text-xs md:text-sm uppercase tracking-widest">
            Sales & Pipeline Management
          </p>
        </div>
        <button 
          onClick={() => {
            setFormData({ ...emptyLead, agent: name, date: new Date().toISOString().split('T')[0] });
            setIsModalOpen(true);
          }} 
          className="bg-tpc-orange text-black px-6 py-3 rounded-xl font-bold uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-white transition-colors cursor-pointer w-full md:w-auto"
        >
          <Plus className="w-4 h-4" /> Add Lead
        </button>
      </div>

      <div className="mb-10">
        <h3 className="text-xl font-bold uppercase tracking-widest text-white mb-4">Active Leads</h3>
        {activeLeads.length === 0 ? (
          <p className="text-gray-500 italic">No active leads right now. Time to start hunting!</p>
        ) : (
          <div className="overflow-x-auto border border-white/10 rounded-xl bg-[#111]">
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead className="bg-[#0a0a0a] text-gray-500 font-bold uppercase tracking-widest text-[10px]">
                <tr>
                  <th className="px-4 py-3">Lead Name</th>
                  <th className="px-4 py-3">Target / Service</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {activeLeads.map((l, i) => (
                  <tr key={i} className="hover:bg-white/5 transition-colors group">
                    <td className="px-4 py-4 font-bold text-white align-top whitespace-nowrap">
                      {l.name}
                      <div className="font-normal text-xs text-gray-500 mt-1">{l.email}</div>
                      {l.phone && <div className="font-normal text-xs text-gray-500">{l.phone}</div>}
                    </td>
                    <td className="px-4 py-4 align-top text-gray-300 whitespace-normal min-w-[200px]">
                      {l.target}
                    </td>
                    <td className="px-4 py-4 align-top">
                      <span className="bg-white/10 px-2 py-1 rounded text-xs font-bold text-tpc-orange">{l.status || "New"}</span>
                    </td>
                    <td className="px-4 py-4 align-top w-48">
                      <div className="flex flex-col gap-2">
                        {updatingId === l._originalIndex.toString() ? (
                          <div className="py-2 flex justify-center"><Loader2 className="w-4 h-4 animate-spin text-tpc-orange" /></div>
                        ) : (
                          <select 
                            value={l.status || "New"}
                            onChange={(e) => updateLead(l, { status: e.target.value })}
                            className="w-full bg-black/50 border border-white/10 rounded p-2 text-xs text-white focus:border-tpc-orange outline-none"
                          >
                            <option value="New">New</option>
                            <option value="Contacted">Contacted</option>
                            <option value="Meeting Scheduled">Meeting Scheduled</option>
                            <option value="Converted">Converted (Won)</option>
                            <option value="Rejected">Rejected (Lost)</option>
                          </select>
                        )}
                        <button 
                          onClick={() => setActiveQueryLead(l)}
                          className="w-full bg-white/5 border border-white/10 hover:bg-white/10 text-white font-bold text-[10px] uppercase tracking-widest px-3 py-2 rounded transition-colors flex items-center justify-center gap-2 relative"
                        >
                          <MessageSquare className="w-3 h-3" /> Support / Hub
                          {(l.adminReply && l.adminReply.trim() !== "") && (
                            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse absolute -mt-4 -mr-24"></span>
                          )}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="mb-10 opacity-70">
        <h3 className="text-xl font-bold uppercase tracking-widest text-gray-500 mb-4">Closed Leads</h3>
        {closedLeads.length === 0 ? (
          <p className="text-gray-600 italic">No closed leads yet.</p>
        ) : (
          <div className="overflow-x-auto border border-white/5 rounded-xl bg-[#111]">
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead className="bg-[#0a0a0a] text-gray-600 font-bold uppercase tracking-widest text-[10px]">
                <tr>
                  <th className="px-4 py-3">Lead Name</th>
                  <th className="px-4 py-3">Target</th>
                  <th className="px-4 py-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {closedLeads.map((l, i) => (
                  <tr key={i}>
                    <td className="px-4 py-4 font-bold text-gray-400">{l.name}</td>
                    <td className="px-4 py-4 text-gray-500">{l.target}</td>
                    <td className="px-4 py-4">
                      <span className={`text-[10px] uppercase font-bold tracking-widest px-2 py-1 rounded ${l.status === 'Converted' ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'}`}>
                        {l.status}
                      </span>
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
            
            <form onSubmit={handleSaveNew} className="flex-1 overflow-auto p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-xs uppercase tracking-widest text-gray-500 font-medium">Name</label>
                  <input required value={formData.name || ''} onChange={(e)=>setFormData({...formData, name: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:border-tpc-orange" />
                </div>
                <div className="space-y-2">
                  <label className="text-xs uppercase tracking-widest text-gray-500 font-medium">Email</label>
                  <input type="email" required value={formData.email || ''} onChange={(e)=>setFormData({...formData, email: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:border-tpc-orange" />
                </div>
                <div className="space-y-2">
                  <label className="text-xs uppercase tracking-widest text-gray-500 font-medium">Phone</label>
                  <input type="tel" value={formData.phone || ''} onChange={(e)=>setFormData({...formData, phone: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:border-tpc-orange" />
                </div>
                <div className="space-y-2">
                  <label className="text-xs uppercase tracking-widest text-gray-500 font-medium">Target / Service</label>
                  <input required value={formData.target || ''} onChange={(e)=>setFormData({...formData, target: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:border-tpc-orange" />
                </div>
                <div className="space-y-2">
                  <label className="text-xs uppercase tracking-widest text-gray-500 font-medium">Date</label>
                  <input type="date" value={formData.date || ''} onChange={(e)=>setFormData({...formData, date: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:border-tpc-orange [color-scheme:dark]" />
                </div>
                <div className="space-y-2">
                  <label className="text-xs uppercase tracking-widest text-gray-500 font-medium">Status</label>
                  <select value={formData.status || 'New'} onChange={(e)=>setFormData({...formData, status: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:border-tpc-orange">
                    <option value="New">New</option>
                    <option value="Contacted">Contacted</option>
                    <option value="Meeting Scheduled">Meeting Scheduled</option>
                    <option value="Converted">Converted (Won)</option>
                    <option value="Rejected">Rejected (Lost)</option>
                  </select>
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

      {/* QUERY MODAL */}
      {activeQueryLead && (
        <div className="fixed inset-0 z-[20000] bg-black/80 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-[#191919] border border-white/10 rounded-2xl w-full max-w-2xl flex flex-col shadow-2xl">
            <div className="flex justify-between items-center p-6 border-b border-white/10 shrink-0">
              <h3 className="text-xl font-bold text-white flex items-center gap-2">💬 Communication Hub</h3>
              <button onClick={() => setActiveQueryLead(null)} className="text-gray-400 hover:text-white cursor-pointer"><X className="w-5 h-5"/></button>
            </div>
            
            <div className="p-6 space-y-6">
              
              <div className="bg-[#111] border border-white/5 rounded-xl p-4">
                <label className="text-[10px] uppercase tracking-widest text-gray-500 font-bold mb-2 flex items-center justify-between">
                  Notes / Meeting Details
                  {updatingId === activeQueryLead._originalIndex.toString() && <Loader2 className="w-3 h-3 animate-spin text-gray-500" />}
                </label>
                <textarea 
                  rows={3} 
                  placeholder="Add meeting notes or lead details..."
                  value={activeQueryLead.message || ""} 
                  onChange={(e) => setActiveQueryLead({...activeQueryLead, message: e.target.value})} 
                  onBlur={() => updateLead(activeQueryLead, { message: activeQueryLead.message })}
                  className="w-full bg-black border border-white/10 rounded-lg p-3 text-gray-300 focus:outline-none focus:border-tpc-orange text-sm resize-none" 
                />
              </div>

              <div className="bg-[#111] border border-white/5 rounded-xl p-4">
                <label className="text-[10px] uppercase tracking-widest text-gray-500 font-bold mb-2 block">Admin Reply / Notes</label>
                <div className="w-full bg-black border border-white/10 rounded-lg p-4 text-gray-300 min-h-[80px] whitespace-pre-wrap text-sm">
                  {activeQueryLead.adminReply ? activeQueryLead.adminReply : <span className="italic opacity-50">No replies from admin yet.</span>}
                </div>
              </div>

              <div className="bg-tpc-orange/5 border border-tpc-orange/20 rounded-xl p-4">
                <label className="text-[10px] uppercase tracking-widest text-tpc-orange font-bold mb-2 flex items-center justify-between">
                  Your Message / Query
                  {updatingId === activeQueryLead._originalIndex.toString() && <Loader2 className="w-3 h-3 animate-spin" />}
                </label>
                <textarea 
                  rows={5} 
                  placeholder="Type your questions or meeting updates here..."
                  value={activeQueryLead.employeeQuery || ""} 
                  onChange={(e) => setActiveQueryLead({...activeQueryLead, employeeQuery: e.target.value})} 
                  className="w-full bg-black/50 border border-white/10 rounded-lg p-4 text-white focus:outline-none focus:border-tpc-orange text-sm resize-none" 
                />
              </div>

              <div className="flex justify-end gap-4 pt-2">
                <button type="button" onClick={() => setActiveQueryLead(null)} className="px-6 py-3 rounded-xl font-bold text-gray-400 hover:text-white transition-colors cursor-pointer text-sm">Close</button>
                <button 
                  onClick={async () => {
                    await updateLead(activeQueryLead, { employeeQuery: activeQueryLead.employeeQuery });
                    setActiveQueryLead(null);
                  }}
                  disabled={updatingId === activeQueryLead._originalIndex.toString()}
                  className="bg-tpc-orange text-black px-8 py-3 rounded-xl font-bold uppercase tracking-widest hover:bg-white transition-colors flex items-center gap-2 cursor-pointer text-sm"
                >
                  Send Message
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
