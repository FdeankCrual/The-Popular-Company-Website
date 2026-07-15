"use client";

import { useState, useEffect } from "react";
import { Loader2, Plus, Trash2, Edit2, X, Shield, Key } from "lucide-react";

const AVAILABLE_ROLES = [
  "SUPER_ADMIN",
  "ADMIN_VIDEO",
  "ADMIN_CONTENT",
  "VIDEOGRAPHER",
  "EDITOR",
  "CONTENT WRITER",
  "GRAPHIC DESIGNER",
  "AI VIDEO CREATOR"
];

export default function EmployeesPage() {
  const [employees, setEmployees] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({ Name: "", Email: "", Password: "", Roles: [] as string[] });

  useEffect(() => {
    fetchEmployees();
  }, []);

  const fetchEmployees = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/data?action=getUsers");
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data)) setEmployees(data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const action = editingId ? "updateEmployee" : "addEmployee";
    const payload = { ...formData, ID: editingId || "emp_" + Math.random().toString(36).substr(2, 9) };
    
    try {
      await fetch("/api/admin/data", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, data: payload })
      });
      setIsModalOpen(false);
      fetchEmployees();
    } catch (err) {
      alert("Failed to save employee");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Remove this employee from the system?")) return;
    try {
      await fetch("/api/admin/data", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "deleteEmployee", id })
      });
      fetchEmployees();
    } catch (err) {
      alert("Failed to delete employee");
    }
  };

  const openNew = () => {
    setEditingId(null);
    setFormData({ Name: "", Email: "", Password: "", Roles: [] });
    setIsModalOpen(true);
  };

  const openEdit = (emp: any) => {
    setEditingId(emp.ID);
    setFormData({ Name: emp.Name, Email: emp.Email, Password: emp.Password, Roles: Array.isArray(emp.Roles) ? emp.Roles : [] });
    setIsModalOpen(true);
  };

  const toggleRole = (role: string) => {
    setFormData(prev => {
      if (prev.Roles.includes(role)) return { ...prev, Roles: prev.Roles.filter(r => r !== role) };
      return { ...prev, Roles: [...prev.Roles, role] };
    });
  };

  return (
    <div className="p-8 md:p-12 min-h-screen bg-[#191919] text-[#D4D4D4]">
      <div className="flex justify-between items-end mb-10">
        <div>
          <h2 className="text-3xl font-black uppercase tracking-tighter mb-2 text-white">
            Access <span className="text-tpc-orange">Control</span>
          </h2>
          <p className="text-gray-500 font-mono text-sm uppercase tracking-widest">
            Employee Directory & Roles
          </p>
        </div>
        <button 
          onClick={openNew}
          className="bg-tpc-orange text-black px-6 py-3 rounded-xl font-bold uppercase tracking-widest flex items-center gap-2 hover:bg-white transition-colors"
        >
          <Plus className="w-4 h-4" /> Add Agent
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64 text-gray-500">
          <Loader2 className="w-8 h-8 animate-spin" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {employees.map((emp, i) => (
            <div key={i} className="bg-[#111] border border-white/10 rounded-3xl p-8 relative group hover:border-tpc-orange/50 transition-colors">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h3 className="text-xl font-bold text-white">{emp.Name}</h3>
                  <p className="text-xs text-gray-500 font-mono mt-1">{emp.Email}</p>
                </div>
                <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => openEdit(emp)} className="p-2 bg-white/5 hover:bg-white/10 rounded-lg transition-colors"><Edit2 className="w-4 h-4 text-gray-400" /></button>
                  <button onClick={() => handleDelete(emp.ID)} className="p-2 bg-red-500/10 hover:bg-red-500/20 rounded-lg transition-colors"><Trash2 className="w-4 h-4 text-red-500" /></button>
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="text-xs uppercase tracking-widest text-gray-600 font-bold mb-3 flex items-center gap-2">
                  <Shield className="w-3 h-3" /> Security Clearance
                </div>
                <div className="flex flex-wrap gap-2">
                  {Array.isArray(emp.Roles) && emp.Roles.length > 0 ? emp.Roles.map((r: string, idx: number) => (
                    <span key={idx} className={`px-2 py-1 rounded text-[10px] font-bold uppercase tracking-widest ${r.includes('ADMIN') ? 'bg-red-500/20 text-red-400' : 'bg-white/10 text-gray-300'}`}>
                      {r}
                    </span>
                  )) : <span className="text-xs text-gray-600 italic">No Roles Assigned</span>}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <form onSubmit={handleSave} className="bg-[#111] border border-white/10 rounded-3xl p-8 max-w-lg w-full relative">
            <button type="button" onClick={() => setIsModalOpen(false)} className="absolute top-6 right-6 text-gray-500 hover:text-white">
              <X className="w-5 h-5" />
            </button>
            <h3 className="text-2xl font-black uppercase tracking-tighter mb-8 text-white">
              {editingId ? "Edit Agent" : "New Agent"}
            </h3>

            <div className="space-y-6">
              <div>
                <label className="text-xs font-bold uppercase tracking-widest text-gray-500">Agent Name</label>
                <input required value={formData.Name} onChange={e => setFormData({...formData, Name: e.target.value})} className="w-full bg-black border border-white/10 p-4 rounded-xl mt-2 text-white outline-none focus:border-tpc-orange transition-colors font-bold" />
              </div>
              <div>
                <label className="text-xs font-bold uppercase tracking-widest text-gray-500">Email Login</label>
                <input required type="email" value={formData.Email} onChange={e => setFormData({...formData, Email: e.target.value})} className="w-full bg-black border border-white/10 p-4 rounded-xl mt-2 text-white outline-none focus:border-tpc-orange transition-colors" />
              </div>
              <div>
                <label className="text-xs font-bold uppercase tracking-widest text-gray-500 flex items-center gap-2"><Key className="w-3 h-3" /> Passcode</label>
                <input required type="text" value={formData.Password} onChange={e => setFormData({...formData, Password: e.target.value})} className="w-full bg-black border border-white/10 p-4 rounded-xl mt-2 text-white outline-none focus:border-tpc-orange transition-colors" />
              </div>

              <div>
                <label className="text-xs font-bold uppercase tracking-widest text-gray-500 mb-4 block">Assigned Roles</label>
                <div className="grid grid-cols-2 gap-3">
                  {AVAILABLE_ROLES.map(role => {
                    const active = formData.Roles.includes(role);
                    return (
                      <button 
                        type="button" 
                        key={role} 
                        onClick={() => toggleRole(role)}
                        className={`p-3 rounded-xl border text-xs font-bold uppercase tracking-widest text-left transition-colors ${active ? (role.includes('ADMIN') ? 'bg-red-500/20 border-red-500/50 text-red-400' : 'bg-tpc-orange/20 border-tpc-orange/50 text-tpc-orange') : 'bg-black border-white/10 text-gray-500 hover:border-white/30'}`}
                      >
                        {role}
                      </button>
                    )
                  })}
                </div>
              </div>
            </div>

            <button type="submit" className="w-full mt-10 bg-white text-black font-black uppercase tracking-widest py-4 rounded-xl hover:bg-tpc-orange hover:text-white transition-all">
              Commit Changes
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
