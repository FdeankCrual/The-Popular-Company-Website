"use client";

import { useState, useEffect } from "react";
import { Plus, X, Save, RefreshCw, AlertCircle, Settings2 } from "lucide-react";

export default function SettingsPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  
  const [settings, setSettings] = useState({
    clients: [] as string[],
    assigned: [] as string[],
    status: [] as string[],
    platforms: [] as string[],
    months: [] as string[]
  });

  const [newInputs, setNewInputs] = useState({
    clients: "",
    assigned: "",
    status: "",
    platforms: "",
    months: ""
  });

  useEffect(() => {
    fetchConfig();
  }, []);

  const fetchConfig = async () => {
    try {
      const res = await fetch("/api/admin/data?action=getConfig");
      if (!res.ok) throw new Error("Failed to load config");
      const data = await res.json();
      
      if (data.workbook_settings) {
        setSettings({
          clients: data.workbook_settings.clients || [],
          assigned: data.workbook_settings.assigned || [],
          status: data.workbook_settings.status || [],
          platforms: data.workbook_settings.platforms || [],
          months: data.workbook_settings.months || []
        });
      }
    } catch (err: any) {
      setError(err.message || "Failed to fetch settings");
    } finally {
      setLoading(false);
    }
  };

  const saveConfig = async () => {
    setSaving(true);
    setError("");
    try {
      const res = await fetch("/api/admin/data", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "updateConfig",
          key: "workbook_settings",
          value: settings
        })
      });
      if (!res.ok) throw new Error("Failed to save settings");
    } catch (err: any) {
      setError(err.message || "Failed to save settings");
    } finally {
      setSaving(false);
    }
  };

  const handleAdd = (category: keyof typeof settings) => {
    const val = newInputs[category].trim();
    if (val && !settings[category].includes(val)) {
      setSettings(prev => ({
        ...prev,
        [category]: [...prev[category], val]
      }));
      setNewInputs(prev => ({ ...prev, [category]: "" }));
    }
  };

  const handleRemove = (category: keyof typeof settings, valToRemove: string) => {
    setSettings(prev => ({
      ...prev,
      [category]: prev[category].filter(v => v !== valToRemove)
    }));
  };

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center p-8">
        <RefreshCw className="w-8 h-8 animate-spin text-tpc-orange" />
      </div>
    );
  }

  const renderSection = (title: string, category: keyof typeof settings, placeholder: string) => (
    <div className="bg-[#111] border border-white/5 p-6 rounded-2xl">
      <h3 className="text-lg font-bold uppercase tracking-widest text-white mb-4">{title}</h3>
      
      <div className="flex gap-2 mb-4">
        <input 
          type="text"
          value={newInputs[category]}
          onChange={(e) => setNewInputs(prev => ({ ...prev, [category]: e.target.value }))}
          onKeyDown={(e) => e.key === "Enter" && handleAdd(category)}
          placeholder={placeholder}
          className="flex-1 bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-tpc-orange focus:bg-white/10 transition-colors"
        />
        <button 
          onClick={() => handleAdd(category)}
          className="bg-white/5 hover:bg-tpc-orange hover:text-black transition-colors px-4 rounded-lg flex items-center justify-center"
        >
          <Plus className="w-4 h-4" />
        </button>
      </div>

      <div className="flex flex-wrap gap-2">
        {settings[category].map(item => (
          <div key={item} className="flex items-center gap-2 bg-white/10 px-3 py-1.5 rounded-full text-xs font-medium border border-white/5">
            {item}
            <button 
              onClick={() => handleRemove(category, item)}
              className="text-gray-400 hover:text-red-400 transition-colors"
            >
              <X className="w-3 h-3" />
            </button>
          </div>
        ))}
        {settings[category].length === 0 && (
          <span className="text-gray-500 text-xs italic">No options configured</span>
        )}
      </div>
    </div>
  );

  return (
    <div className="p-8 max-w-5xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-black uppercase tracking-tighter text-white flex items-center gap-3">
            <Settings2 className="w-8 h-8 text-tpc-orange" />
            System <span className="text-gray-500">Settings</span>
          </h1>
          <p className="text-gray-400 text-sm mt-1">Manage permanent dropdown options for the Workbook.</p>
        </div>
        <button 
          onClick={saveConfig}
          disabled={saving}
          className="bg-tpc-orange text-black px-6 py-3 rounded-lg font-bold text-sm tracking-wider uppercase hover:bg-orange-500 transition-all flex items-center gap-2 disabled:opacity-50"
        >
          {saving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          {saving ? "Saving..." : "Save Settings"}
        </button>
      </div>

      {error && (
        <div className="bg-red-500/10 text-red-400 border border-red-500/20 p-4 rounded-xl flex items-center gap-3 text-sm">
          <AlertCircle className="w-5 h-5 shrink-0" />
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {renderSection("Clients", "clients", "Add new client...")}
        {renderSection("Team Members", "assigned", "Add new team member...")}
        {renderSection("Statuses", "status", "Add new status...")}
        {renderSection("Platforms", "platforms", "Add new platform...")}
        {renderSection("Months", "months", "Add month...")}
      </div>
    </div>
  );
}
