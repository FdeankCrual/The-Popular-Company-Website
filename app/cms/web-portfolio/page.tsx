"use client";

import { useState, useEffect } from "react";
import { Monitor, Plus, Trash2, X, Loader2 } from "lucide-react";

const emptyForm = { id: "", title: "", category: "Creative Portfolio", image: "", link: "" };

export default function WebPortfolioCMS() {
  const [items, setItems] = useState<any[]>([]);
  const [categories, setCategories] = useState<string[]>(["Creative Portfolio", "E-Commerce", "Corporate"]);
  const [loading, setLoading] = useState(true);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState<any>(emptyForm);
  const [isSaving, setIsSaving] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  useEffect(() => {
    fetchWebPortfolio();
  }, []);

  async function fetchWebPortfolio() {
    try {
      const [res, configRes] = await Promise.all([
        fetch("/api/admin/data?action=getWebPortfolio"),
        fetch("/api/admin/data?action=getConfig")
      ]);
      if (res.ok) {
        const liveData = await res.json();
        if (Array.isArray(liveData)) setItems(liveData);
      }
      if (configRes.ok) {
        const configData = await configRes.json();
        if (configData.workbook_settings?.webCategories?.length > 0) {
          setCategories(configData.workbook_settings.webCategories);
        }
      }
    } catch (err) {
      console.error("Failed to fetch web portfolio data", err);
    } finally {
      setLoading(false);
    }
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    
    // If editing, use the same ID, otherwise generate a new one
    const payload = { ...formData, id: editingId || ("web_" + Math.random().toString(36).substring(2, 9)) };

    try {
      // If we are editing, we first delete the old row to simulate an update without needing backend changes
      if (editingId) {
        await fetch("/api/admin/data", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action: "deleteWebPortfolio", id: editingId })
        });
      }

      const res = await fetch("/api/admin/data", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "addWebPortfolio", data: payload })
      });
      
      if (res.ok) {
        if (editingId) {
          setItems(items.map(item => item.id === editingId ? payload : item));
        } else {
          setItems([...items, payload]);
        }
        setIsModalOpen(false);
      } else {
        alert("Failed to save to Google Sheets.");
      }
    } catch (err) {
      alert("Error saving data.");
    } finally {
      setIsSaving(false);
      setEditingId(null);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this website project?")) return;
    
    setItems(items.filter(item => item.id !== id));
    
    try {
      await fetch("/api/admin/data", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "deleteWebPortfolio", id })
      });
    } catch (err) {
      alert("Error deleting item.");
    }
  };

  return (
    <div className="p-8 md:p-12 min-h-screen">
      <div className="flex justify-between items-end mb-10">
        <div>
          <h2 className="text-3xl font-black uppercase tracking-tighter mb-2 text-white">
            Web <span className="text-tpc-orange">Portfolio</span>
          </h2>
          <p className="text-gray-500 font-mono text-sm uppercase tracking-widest">
            Manage Website Design Projects
          </p>
        </div>
        <button 
          onClick={() => { setFormData(emptyForm); setEditingId(null); setIsModalOpen(true); }}
          className="bg-tpc-orange text-black px-6 py-3 rounded-xl font-bold uppercase tracking-widest flex items-center gap-2 hover:bg-white transition-colors"
        >
          <Plus className="w-4 h-4" /> Add Website
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64 text-gray-500">
          <Loader2 className="w-8 h-8 animate-spin" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {items.map((item, i) => (
            <div key={i} className="bg-[#111] border border-white/10 rounded-2xl p-4 group relative overflow-hidden flex flex-col">
              <div className="aspect-video bg-black rounded-xl mb-4 relative overflow-hidden flex items-center justify-center border border-white/5">
                <Monitor className="w-8 h-8 text-gray-700 absolute" />
                {item.image && <img src={item.image.startsWith('http') || item.image.startsWith('/') ? item.image : `/${item.image}`} className="w-full h-full object-cover object-top relative z-10" alt="" />}
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity z-20 flex items-center justify-center gap-4">
                  <button onClick={() => { setFormData(item); setEditingId(item.id); setIsModalOpen(true); }} className="bg-white text-black p-3 rounded-full hover:bg-tpc-orange transition-colors">
                    <span className="text-xs font-bold px-2 uppercase">Edit</span>
                  </button>
                  <button onClick={() => handleDelete(item.id)} className="bg-red-500 text-white p-3 rounded-full hover:bg-red-600 transition-colors">
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>
              <h3 className="font-bold text-white text-lg truncate">{item.title || "Untitled"}</h3>
              <div className="flex justify-between items-center mt-2">
                <span className="text-xs font-bold uppercase tracking-widest text-tpc-orange bg-tpc-orange/10 px-2 py-1 rounded">
                  {item.category}
                </span>
                <a href={item.link} target="_blank" className="text-xs text-blue-400 hover:text-blue-300 uppercase tracking-widest">
                  View Live Site
                </a>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="bg-[#111] border border-white/10 rounded-3xl p-8 max-w-lg w-full relative max-h-[90vh] overflow-y-auto">
            <button onClick={() => { setIsModalOpen(false); setEditingId(null); }} className="absolute top-6 right-6 text-gray-500 hover:text-white">
              <X className="w-5 h-5" />
            </button>
            <h3 className="text-2xl font-black uppercase tracking-tighter mb-8 text-white">
              {editingId ? "Edit Website" : "Add Website"}
            </h3>

            <form onSubmit={handleSave} className="space-y-6">
              <div>
                <label className="text-xs font-bold uppercase tracking-widest text-gray-500">Website Title</label>
                <input required value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} className="w-full bg-black border border-white/10 p-4 rounded-xl mt-2 text-white outline-none focus:border-tpc-orange" />
              </div>
              
              <div>
                <label className="text-xs font-bold uppercase tracking-widest text-gray-500">Category</label>
                <select value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})} className="w-full bg-black border border-white/10 p-4 rounded-xl mt-2 text-white outline-none focus:border-tpc-orange">
                  {categories.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-bold uppercase tracking-widest text-gray-500">Thumbnail Image Path</label>
                <input required placeholder="thumbnails/site.png" value={formData.image} onChange={e => setFormData({...formData, image: e.target.value})} className="w-full bg-black border border-white/10 p-4 rounded-xl mt-2 text-white outline-none focus:border-tpc-orange" />
              </div>

              <div>
                <label className="text-xs font-bold uppercase tracking-widest text-gray-500">Live Website URL</label>
                <input required placeholder="https://example.com" value={formData.link} onChange={e => setFormData({...formData, link: e.target.value})} className="w-full bg-black border border-white/10 p-4 rounded-xl mt-2 text-white outline-none focus:border-tpc-orange" />
              </div>

              <button type="submit" disabled={isSaving} className="w-full bg-tpc-orange text-black font-black uppercase tracking-widest py-4 rounded-xl hover:bg-white transition-colors flex items-center justify-center gap-2">
                {isSaving ? <Loader2 className="w-5 h-5 animate-spin" /> : "Publish Website"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
