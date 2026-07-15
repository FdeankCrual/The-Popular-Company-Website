"use client";

import { useState, useEffect } from "react";
import { Image as ImageIcon, Plus, Trash2, X, Loader2, Edit2 } from "lucide-react";

const emptyForm = { id: "", title: "", category: "Reels", type: "vertical", src: "", link: "/work", featured: false };

export default function GalleryCMS() {
  const [items, setItems] = useState<any[]>([]);
  const [categories, setCategories] = useState<string[]>(["Reels", "Ads", "Posters"]);
  const [loading, setLoading] = useState(true);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<any>(emptyForm);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    fetchGallery();
  }, []);

  async function fetchGallery() {
    try {
      const [res, configRes] = await Promise.all([
        fetch("/api/admin/data?action=getGallery"),
        fetch("/api/admin/data?action=getConfig")
      ]);
      if (res.ok) {
        const liveData = await res.json();
        if (Array.isArray(liveData)) setItems(liveData);
      }
      if (configRes.ok) {
        const configData = await configRes.json();
        if (configData.workbook_settings?.galleryCategories?.length > 0) {
          setCategories(configData.workbook_settings.galleryCategories);
        }
      }
    } catch (err) {
      console.error("Failed to fetch gallery data", err);
    } finally {
      setLoading(false);
    }
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    
    const isUpdate = isEditing;
    const payload = isUpdate ? { ...formData } : { ...formData, id: "gal_" + Math.random().toString(36).substring(2, 9) };

    try {
      const res = await fetch("/api/admin/data", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: isUpdate ? "updateGallery" : "addGallery", data: payload })
      });
      
      if (res.ok) {
        if (isUpdate) {
          setItems(items.map(i => i.id === payload.id ? payload : i));
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
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this gallery item?")) return;
    
    setItems(items.filter(item => item.id !== id));
    
    try {
      await fetch("/api/admin/data", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "deleteGallery", id })
      });
    } catch (err) {
      alert("Error deleting item.");
    }
  };

  const openAdd = () => {
    setFormData(emptyForm);
    setIsEditing(false);
    setIsModalOpen(true);
  };

  const openEdit = (item: any) => {
    setFormData({
      ...item,
      featured: item.featured === true || item.featured === "TRUE" || item.featured === "true"
    });
    setIsEditing(true);
    setIsModalOpen(true);
  };

  return (
    <div className="p-8 md:p-12 min-h-screen">
      <div className="flex justify-between items-end mb-10">
        <div>
          <h2 className="text-3xl font-black uppercase tracking-tighter mb-2 text-white">
            Portfolio <span className="text-tpc-orange">Gallery</span>
          </h2>
          <p className="text-gray-500 font-mono text-sm uppercase tracking-widest">
            Manage Video and Photo Assets
          </p>
        </div>
        <button 
          onClick={openAdd}
          className="bg-tpc-orange text-black px-6 py-3 rounded-xl font-bold uppercase tracking-widest flex items-center gap-2 hover:bg-white transition-colors"
        >
          <Plus className="w-4 h-4" /> Add Media
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64 text-gray-500">
          <Loader2 className="w-8 h-8 animate-spin" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {items.map((item, i) => {
             const isFeatured = item.featured === true || item.featured === "TRUE" || item.featured === "true";
             return (
              <div key={i} className="bg-[#111] border border-white/10 rounded-2xl p-4 group relative overflow-hidden flex flex-col">
                <div className="aspect-[9/16] bg-black rounded-xl mb-4 relative overflow-hidden flex items-center justify-center border border-white/5">
                  <ImageIcon className="w-8 h-8 text-gray-700 absolute" />
                  {item.src && item.src.endsWith('.mp4') ? (
                     <video src={`/${item.src}`} className="w-full h-full object-cover relative z-10" muted loop autoPlay playsInline />
                  ) : (
                     item.src && <img src={`/${item.src}`} className="w-full h-full object-cover relative z-10" alt="" />
                  )}
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity z-20 flex items-center justify-center gap-4">
                    <button onClick={() => openEdit(item)} className="bg-white text-black p-3 rounded-full hover:bg-gray-200 transition-colors">
                      <Edit2 className="w-5 h-5" />
                    </button>
                    <button onClick={() => handleDelete(item.id)} className="bg-red-500 text-white p-3 rounded-full hover:bg-red-600 transition-colors">
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
                <h3 className="font-bold text-white text-lg truncate">{item.title || "Untitled"}</h3>
                <div className="flex justify-between items-center mt-2">
                  <div className="flex gap-2">
                    <span className="text-xs font-bold uppercase tracking-widest text-tpc-orange bg-tpc-orange/10 px-2 py-1 rounded">
                      {item.category}
                    </span>
                    {isFeatured && (
                      <span className="text-xs font-bold uppercase tracking-widest text-green-400 bg-green-400/10 px-2 py-1 rounded">
                        Home
                      </span>
                    )}
                  </div>
                  <span className="text-xs text-gray-500 uppercase tracking-widest">
                    {item.type}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="bg-[#111] border border-white/10 rounded-3xl p-8 max-w-lg w-full relative max-h-[90vh] overflow-y-auto">
            <button onClick={() => setIsModalOpen(false)} className="absolute top-6 right-6 text-gray-500 hover:text-white">
              <X className="w-5 h-5" />
            </button>
            <h3 className="text-2xl font-black uppercase tracking-tighter mb-8 text-white">
              {isEditing ? "Edit Media" : "Add Media"}
            </h3>

            <form onSubmit={handleSave} className="space-y-6">
              <div>
                <label className="text-xs font-bold uppercase tracking-widest text-gray-500">Title</label>
                <input required value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} className="w-full bg-black border border-white/10 p-4 rounded-xl mt-2 text-white outline-none focus:border-tpc-orange" />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold uppercase tracking-widest text-gray-500">Category</label>
                  <select value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})} className="w-full bg-black border border-white/10 p-4 rounded-xl mt-2 text-white outline-none focus:border-tpc-orange">
                    {categories.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-bold uppercase tracking-widest text-gray-500">Aspect Ratio</label>
                  <select value={formData.type} onChange={e => setFormData({...formData, type: e.target.value})} className="w-full bg-black border border-white/10 p-4 rounded-xl mt-2 text-white outline-none focus:border-tpc-orange">
                    <option value="vertical">Vertical (9:16)</option>
                    <option value="horizontal">Horizontal (16:9)</option>
                    <option value="square">Square (1:1)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs font-bold uppercase tracking-widest text-gray-500">Media Path (Relative to public/)</label>
                <input required placeholder="e.g., reels/new_video.mp4" value={formData.src} onChange={e => setFormData({...formData, src: e.target.value})} className="w-full bg-black border border-white/10 p-4 rounded-xl mt-2 text-white outline-none focus:border-tpc-orange" />
              </div>

              <div>
                <label className="text-xs font-bold uppercase tracking-widest text-gray-500">Click Link (Optional)</label>
                <input value={formData.link} onChange={e => setFormData({...formData, link: e.target.value})} className="w-full bg-black border border-white/10 p-4 rounded-xl mt-2 text-white outline-none focus:border-tpc-orange" />
              </div>
              
              <label className="flex items-center gap-3 bg-black border border-white/10 p-4 rounded-xl cursor-pointer hover:border-tpc-orange transition-colors">
                <input 
                  type="checkbox" 
                  checked={formData.featured}
                  onChange={e => setFormData({...formData, featured: e.target.checked})}
                  className="w-5 h-5 accent-tpc-orange"
                />
                <span className="text-sm font-bold uppercase tracking-widest text-white">Show on Home Page?</span>
              </label>

              <button type="submit" disabled={isSaving} className="w-full bg-tpc-orange text-black font-black uppercase tracking-widest py-4 rounded-xl hover:bg-white transition-colors flex items-center justify-center gap-2">
                {isSaving ? <Loader2 className="w-5 h-5 animate-spin" /> : (isEditing ? "Save Changes" : "Publish Media")}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
