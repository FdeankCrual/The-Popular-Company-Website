"use client";

import { useState, useEffect } from "react";
import { FileText, Plus, X, Loader2, Trash2 } from "lucide-react";
import dynamic from "next/dynamic";
import "react-quill-new/dist/quill.snow.css";

const ReactQuill = dynamic(() => import("react-quill-new"), { ssr: false });

const emptyForm = { id: "", title: "", slug: "", coverImage: "", author: "", date: "", category: "Marketing", status: "Draft", content: "" };

export default function ContentPage() {
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState<any>(emptyForm);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    fetchPosts();
  }, []);

  async function fetchPosts() {
    try {
      const res = await fetch("/api/admin/data", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "getContent" })
      });
      if (res.ok) {
        const liveData = await res.json();
        if (Array.isArray(liveData)) {
          setPosts(liveData);
        }
      }
    } catch (err) {
      console.error("Failed to fetch content data", err);
    } finally {
      setLoading(false);
    }
  }

  const handleOpenNew = () => {
    setFormData({ ...emptyForm, id: "post_" + Math.random().toString(36).substring(2, 9), date: new Date().toISOString().split('T')[0] });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (post: any) => {
    setFormData(post);
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    
    const isUpdate = posts.some(item => item.id === formData.id);
    const action = isUpdate ? "updateContent" : "addContent";

    try {
      const res = await fetch("/api/admin/data", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, data: formData })
      });
      
      if (res.ok) {
        if (isUpdate) {
          setPosts(posts.map(item => item.id === formData.id ? formData : item));
        } else {
          setPosts([...posts, formData]);
        }
        setIsModalOpen(false);
      } else {
        alert("Failed to save post to Google Sheets.");
      }
    } catch (err) {
      console.error(err);
      alert("Error saving data.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleInlineStatusChange = async (e: React.ChangeEvent<HTMLSelectElement>, post: any) => {
    e.stopPropagation();
    const newStatus = e.target.value;
    const previousPosts = [...posts];
    
    // Optimistic UI update
    setPosts(posts.map(p => p.id === post.id ? { ...p, status: newStatus } : p));
    
    try {
      const res = await fetch("/api/admin/data", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "updateContent", data: { ...post, status: newStatus } })
      });
      if (!res.ok) {
        setPosts(previousPosts);
        alert("Failed to update status in Google Sheets.");
      }
    } catch (err) {
      setPosts(previousPosts);
      alert("Error updating status.");
    }
  };

  const handleDelete = async (e: React.MouseEvent, index: number) => {
    e.stopPropagation(); // Prevent opening the edit modal
    if (!confirm("Are you sure you want to delete this blog post?")) return;
    
    // Optimistic UI for simplicity, ideally we would track deleting state like in leads
    const previousPosts = [...posts];
    setPosts(posts.filter((_, i) => i !== index));
    
    try {
      const res = await fetch("/api/admin/data", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "deleteContent", rowIndex: index })
      });
      if (!res.ok) {
        setPosts(previousPosts);
        alert("Failed to delete post from Google Sheets.");
      }
    } catch (err) {
      setPosts(previousPosts);
      alert("Error deleting post.");
    }
  };

  return (
    <div className="p-8 md:p-12 h-full flex flex-col">
      <div className="mb-10 flex justify-between items-end shrink-0">
        <div>
          <h2 className="text-3xl font-black uppercase tracking-tighter mb-2">Content <span className="text-tpc-orange">Manager</span></h2>
          <p className="text-gray-500 font-mono text-sm uppercase tracking-widest">Global Site Content & Blogs</p>
        </div>
        <button onClick={handleOpenNew} className="bg-tpc-orange text-black px-6 py-3 rounded-xl font-bold uppercase tracking-widest flex items-center gap-2 hover:bg-white transition-colors cursor-pointer">
          <Plus className="w-4 h-4" /> New Blog Post
        </button>
      </div>

      <div className="bg-[#111] border border-white/10 rounded-2xl overflow-hidden flex-1 flex flex-col">
        {loading ? (
          <div className="flex items-center justify-center h-full min-h-[400px] text-gray-500 gap-2"><Loader2 className="w-4 h-4 animate-spin"/> Loading Content...</div>
        ) : (
          <div className="overflow-auto flex-1">
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead className="sticky top-0 bg-[#111] z-10 border-b border-white/10 text-gray-400">
                <tr>
                  <th className="px-6 py-4 font-medium uppercase tracking-widest text-[10px]">Title</th>
                  <th className="px-6 py-4 font-medium uppercase tracking-widest text-[10px]">Date</th>
                  <th className="px-6 py-4 font-medium uppercase tracking-widest text-[10px]">Category</th>
                  <th className="px-6 py-4 font-medium uppercase tracking-widest text-[10px]">Status</th>
                  <th className="px-6 py-4 font-medium uppercase tracking-widest text-[10px] text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {posts.length === 0 ? (
                  <tr><td colSpan={5} className="p-6 text-center text-gray-500">No blog posts found in Google Sheets. Click "New Blog Post" to create one.</td></tr>
                ) : null}
                {posts.map((post, i) => (
                  <tr key={post.id || i} onClick={() => handleOpenEdit(post)} className="hover:bg-white/5 transition-colors cursor-pointer group">
                    <td className="px-6 py-4 font-medium text-white flex items-center gap-3">
                      <FileText className="w-4 h-4 text-tpc-orange" />
                      {post.title}
                    </td>
                    <td className="px-6 py-4 text-gray-400">{post.date}</td>
                    <td className="px-6 py-4"><span className="bg-white/10 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest">{post.category}</span></td>
                    <td className="px-6 py-4">
                      <select 
                        value={post.status || 'Draft'}
                        onClick={(e) => e.stopPropagation()}
                        onChange={(e) => handleInlineStatusChange(e, post)}
                        className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase cursor-pointer outline-none appearance-none ${post.status?.toLowerCase() === 'published' ? 'bg-green-500/20 text-green-500' : 'bg-yellow-500/20 text-yellow-500'}`}
                      >
                        <option value="Draft" className="bg-[#222] text-white">Draft</option>
                        <option value="Published" className="bg-[#222] text-white">Published</option>
                      </select>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button 
                        onClick={(e) => handleDelete(e, i)}
                        className="p-2 text-gray-500 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-colors cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* EDIT MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[20000] bg-black/80 flex items-center justify-center p-4">
          <div className="bg-[#191919] border border-white/10 rounded-2xl w-full max-w-5xl flex flex-col max-h-[95vh]">
            <div className="flex justify-between items-center p-6 border-b border-white/10 shrink-0">
              <h3 className="text-xl font-bold text-white">{formData.title ? 'Edit Post' : 'New Post'}</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-white cursor-pointer"><X className="w-5 h-5"/></button>
            </div>
            
            <form onSubmit={handleSave} className="flex-1 flex flex-col min-h-0">
              <div className="flex-1 overflow-auto p-6 flex flex-col md:flex-row gap-6">
              
              {/* LEFT: Metadata */}
              <div className="w-full md:w-1/3 space-y-6 shrink-0">
                <div className="space-y-2">
                  <label className="text-xs uppercase tracking-widest text-gray-500 font-medium">Post Title</label>
                  <input required value={formData.title || ''} onChange={(e)=>setFormData({...formData, title: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:border-tpc-orange" />
                </div>
                <div className="space-y-2">
                  <label className="text-xs uppercase tracking-widest text-gray-500 font-medium">Slug (URL)</label>
                  <input value={formData.slug || ''} onChange={(e)=>setFormData({...formData, slug: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:border-tpc-orange" placeholder="my-blog-post" />
                </div>
                <div className="space-y-2">
                  <label className="text-xs uppercase tracking-widest text-gray-500 font-medium">Status</label>
                  <select value={formData.status || 'Draft'} onChange={(e)=>setFormData({...formData, status: e.target.value})} className="w-full bg-[#222] border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:border-tpc-orange">
                    <option>Draft</option>
                    <option>Published</option>
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-xs uppercase tracking-widest text-gray-500 font-medium">Date</label>
                    <input type="date" value={formData.date || ''} onChange={(e)=>setFormData({...formData, date: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:border-tpc-orange [color-scheme:dark]" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs uppercase tracking-widest text-gray-500 font-medium">Category</label>
                    <input value={formData.category || ''} onChange={(e)=>setFormData({...formData, category: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:border-tpc-orange" />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-xs uppercase tracking-widest text-gray-500 font-medium">Cover Image URL</label>
                  <input value={formData.coverImage || ''} onChange={(e)=>setFormData({...formData, coverImage: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:border-tpc-orange" placeholder="https://..." />
                </div>
                <div className="space-y-2">
                  <label className="text-xs uppercase tracking-widest text-gray-500 font-medium">Author</label>
                  <input value={formData.author || ''} onChange={(e)=>setFormData({...formData, author: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:border-tpc-orange" />
                </div>
              </div>

              {/* RIGHT: Content Editor */}
              <div className="w-full md:w-2/3 flex flex-col h-full min-h-[500px]">
                 <div className="flex justify-between items-end mb-2">
                    <label className="text-xs uppercase tracking-widest text-gray-500 font-medium">Rich Text Content</label>
                 </div>
                 <div className="flex-1 bg-white/5 border border-white/10 rounded-lg overflow-hidden flex flex-col text-white">
                   <ReactQuill 
                     theme="snow" 
                     value={formData.content || ''} 
                     onChange={(content) => setFormData({...formData, content})}
                     className="flex-1 overflow-y-auto prose prose-invert prose-lg max-w-none prose-headings:font-bold prose-headings:tracking-tight prose-headings:text-white prose-p:text-gray-300 prose-p:leading-relaxed prose-a:text-tpc-orange prose-a:no-underline hover:prose-a:underline prose-strong:text-white prose-blockquote:border-tpc-orange prose-blockquote:bg-white/5 prose-blockquote:p-6 prose-blockquote:rounded-r-lg"
                     modules={{
                       toolbar: [
                         [{ 'header': [1, 2, 3, false] }],
                         ['bold', 'italic', 'underline', 'strike', 'blockquote'],
                         [{'list': 'ordered'}, {'list': 'bullet'}, {'indent': '-1'}, {'indent': '+1'}],
                         ['link', 'image'],
                         ['clean']
                       ],
                     }}
                   />
                 </div>
                 <style>{`
                   .ql-toolbar.ql-snow { border: none; border-bottom: 1px solid rgba(255,255,255,0.1); background: #111; padding: 12px; }
                   .ql-container.ql-snow { border: none; font-family: inherit; font-size: inherit; }
                   .ql-editor { min-height: 400px; padding: 24px; }
                   .ql-stroke { stroke: #aaa !important; }
                   .ql-fill { fill: #aaa !important; }
                   .ql-picker { color: #aaa !important; }
                   button.ql-active .ql-stroke { stroke: #FF4F00 !important; }
                   button:hover .ql-stroke { stroke: #FF4F00 !important; }
                   .ql-picker-options { background: #111 !important; border-color: rgba(255,255,255,0.1) !important; }
                 `}</style>
              </div>

              </div>

              <div className="p-6 flex justify-end gap-4 w-full bg-[#191919] border-t border-white/10 shrink-0 rounded-b-2xl">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-6 py-3 rounded-xl font-bold text-gray-400 hover:text-white transition-colors cursor-pointer">Cancel</button>
                <button disabled={isSaving} type="submit" className="bg-tpc-orange text-black px-8 py-3 rounded-xl font-bold uppercase tracking-widest hover:bg-white transition-colors disabled:opacity-50 flex items-center gap-2 cursor-pointer">
                  {isSaving ? <Loader2 className="w-5 h-5 animate-spin" /> : null} Save to Sheets
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
}
