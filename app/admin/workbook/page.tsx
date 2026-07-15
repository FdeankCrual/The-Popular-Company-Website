"use client";

import { useState, useEffect, useMemo } from "react";
import { Plus, Loader2, Trash2, Filter, ArrowUpDown, ArrowDown, ArrowUp, X, Copy } from "lucide-react";
import { NotionDropdown } from "./components/NotionDropdown";
import { NotionMultiSelect } from "./components/NotionMultiSelect";

const initialData: any[] = [];
const emptyForm = { id: "", name: "", client: "", status: "Planning", assigned: "", scriptDate: "", shootDate: "", editDate: "", finalDate: "", platform: "Instagram", month: "", desc: "" };

export default function WorkbookPage() {
  const [data, setData] = useState<any[]>(initialData);
  const [loading, setLoading] = useState(true);
  const [config, setConfig] = useState<any>({ clients: [], assigned: [], status: [], platforms: [], months: [] });

  // Advanced Table States
  const [selectedRows, setSelectedRows] = useState<Set<string>>(new Set());
  const [lastSelectedRowId, setLastSelectedRowId] = useState<string | null>(null);
  const [sortConfig, setSortConfig] = useState<{ key: string, direction: 'asc'|'desc'|null }>({ key: '', direction: null });
  const [showFilters, setShowFilters] = useState(false);
  const [columnFilters, setColumnFilters] = useState<Record<string, string>>({});

  // Extracted unique values for dropdowns
  const clients = Array.from(new Set([...(config.clients || []), ...data.map(d => d.client)].filter(Boolean)));
  const statuses = Array.from(new Set([...(config.status || []), ...data.map(d => d.status)].filter(Boolean)));
  const platforms = Array.from(new Set([...(config.platforms || []), ...data.map(d => d.platform)].filter(Boolean)));
  const assigned = Array.from(new Set([
    ...(config.assigned || []),
    ...data.flatMap(d => d.assigned ? d.assigned.split(',').map((s: string) => s.trim()) : [])
  ].filter(Boolean)));
  const months = Array.from(new Set([...(config.months || []), ...data.map(d => d.month)].filter(Boolean)));

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    try {
      const [wbRes, confRes] = await Promise.all([
        fetch("/api/admin/data?action=getWorkbook"),
        fetch("/api/admin/data?action=getConfig")
      ]);
      if (wbRes.ok) {
        const liveData = await wbRes.json();
        if (Array.isArray(liveData)) setData(liveData);
      }
      if (confRes.ok) {
        const confData = await confRes.json();
        if (confData.workbook_settings) setConfig(confData.workbook_settings);
      }
    } catch (err) {
      console.error("Failed to fetch data", err);
    } finally {
      setLoading(false);
    }
  }

  // Data Processing: Filter & Sort
  const processedData = useMemo(() => {
    let result = [...data];

    // Filter
    const activeFilterKeys = Object.keys(columnFilters).filter(k => columnFilters[k].trim() !== "");
    if (activeFilterKeys.length > 0) {
      result = result.filter(row => {
        return activeFilterKeys.every(k => {
          const rowVal = (row[k] || '').toString().toLowerCase();
          const filterVal = columnFilters[k].toLowerCase().trim();
          return rowVal.includes(filterVal);
        });
      });
    }

    // Sort
    if (sortConfig.key && sortConfig.direction) {
      result.sort((a, b) => {
        const aVal = (a[sortConfig.key] || '').toString().toLowerCase();
        const bVal = (b[sortConfig.key] || '').toString().toLowerCase();
        if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1;
        if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
      });
    }

    return result;
  }, [data, columnFilters, sortConfig]);

  // Handlers
  const handleAddNewRow = async () => {
    const newRow = { ...emptyForm, id: "proj_" + Math.random().toString(36).substring(2, 9), name: "Untitled Task" };
    setData([...data, newRow]);
    
    try {
      await fetch("/api/admin/data", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "addWorkbook", data: newRow })
      });
    } catch (err) {
      console.error(err);
    }
  };

  const handleInlineChange = async (id: string, field: string, value: string) => {
    // Check if we are doing a BULK UPDATE via Row Selection
    if (selectedRows.has(id) && selectedRows.size > 1) {
      const rowIdsToUpdate = Array.from(selectedRows);
      
      // Optimistic update locally
      setData(prev => prev.map(item => 
        rowIdsToUpdate.includes(item.id) ? { ...item, [field]: value } : item
      ));

      // Grab the modified rows for the server payload
      const updates = data
        .filter(item => rowIdsToUpdate.includes(item.id))
        .map(item => ({ ...item, [field]: value }));

      try {
        await fetch("/api/admin/data", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action: "bulkUpdateWorkbook", updates })
        });
      } catch (err) {
        console.error("Failed to bulk update", err);
      }
    } else {
      // STANDARD SINGLE ROW UPDATE
      setData(prev => prev.map(item => item.id === id ? { ...item, [field]: value } : item));
      const updatedRow = data.find(item => item.id === id);
      if (!updatedRow) return;
      const newRow = { ...updatedRow, [field]: value };
      
      try {
        await fetch("/api/admin/data", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action: "updateWorkbook", data: newRow })
        });
      } catch (err) {
        console.error("Failed to save inline edit");
      }
    }
  };

  const handleDeleteRow = async (id: string) => {
    if (!confirm("Are you sure you want to delete this task?")) return;
    
    const previousData = [...data];
    const index = data.findIndex(d => d.id === id);
    if (index === -1) return;

    setData(data.filter(item => item.id !== id));
    
    try {
      const res = await fetch("/api/admin/data", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "deleteWorkbook", rowIndex: index })
      });
      if (!res.ok) throw new Error("Failed to delete");
    } catch (err) {
      setData(previousData);
      alert("Error deleting task.");
    }
  };

  const handleBulkDelete = async () => {
    if (!confirm(`Are you sure you want to delete ${selectedRows.size} tasks?`)) return;
    
    const idsToDelete = Array.from(selectedRows);
    const indicesToDelete = idsToDelete.map(id => data.findIndex(d => d.id === id)).filter(i => i !== -1);
    
    setData(prev => prev.filter(item => !idsToDelete.includes(item.id)));
    setSelectedRows(new Set());
    
    try {
      await fetch("/api/admin/data", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "bulkDeleteWorkbook", rowIndices: indicesToDelete })
      });
    } catch (err) {
      console.error(err);
      alert("Error during bulk delete.");
    }
  };

  const handleBulkDuplicate = async () => {
    const idsToDuplicate = Array.from(selectedRows);
    const rowsToCopy = data.filter(d => idsToDuplicate.includes(d.id));
    
    const newRows = rowsToCopy.map(row => ({
      ...row,
      id: "proj_" + Math.random().toString(36).substring(2, 9),
      name: row.name ? `${row.name} (Copy)` : "Untitled (Copy)"
    }));
    
    setData(prev => [...prev, ...newRows]);
    // Optionally select the new rows:
    setSelectedRows(new Set(newRows.map(r => r.id)));
    
    try {
      await fetch("/api/admin/data", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "bulkAddWorkbook", data: newRows })
      });
    } catch (err) {
      console.error(err);
      alert("Error duplicating tasks.");
    }
  };

  // UI Helpers
  const handleSort = (key: string) => {
    setSortConfig(prev => {
      if (prev.key === key) {
        if (prev.direction === 'asc') return { key, direction: 'desc' };
        if (prev.direction === 'desc') return { key: '', direction: null };
      }
      return { key, direction: 'asc' };
    });
  };

  const SortIcon = ({ columnKey }: { columnKey: string }) => {
    if (sortConfig.key !== columnKey) return <ArrowUpDown className="w-3 h-3 text-gray-600 inline ml-1 opacity-0 group-hover:opacity-100 transition-opacity" />;
    if (sortConfig.direction === 'asc') return <ArrowUp className="w-3 h-3 text-tpc-orange inline ml-1" />;
    return <ArrowDown className="w-3 h-3 text-tpc-orange inline ml-1" />;
  };

  const toggleAllRows = (checked: boolean) => {
    if (checked) {
      setSelectedRows(new Set(processedData.map(r => r.id)));
    } else {
      setSelectedRows(new Set());
    }
  };

  const toggleRow = (id: string, checked: boolean, shiftKey: boolean = false) => {
    const next = new Set(selectedRows);
    
    if (shiftKey && lastSelectedRowId) {
      const currentIndex = processedData.findIndex(r => r.id === id);
      const lastIndex = processedData.findIndex(r => r.id === lastSelectedRowId);
      
      if (currentIndex !== -1 && lastIndex !== -1) {
        const start = Math.min(currentIndex, lastIndex);
        const end = Math.max(currentIndex, lastIndex);
        
        for (let i = start; i <= end; i++) {
          if (checked) next.add(processedData[i].id);
          else next.delete(processedData[i].id);
        }
      }
    } else {
      if (checked) next.add(id);
      else next.delete(id);
    }
    
    setSelectedRows(next);
    setLastSelectedRowId(id);
  };

  const allSelected = processedData.length > 0 && selectedRows.size === processedData.length;

  return (
    <div className="flex flex-col h-full bg-[#191919] min-h-screen text-[#D4D4D4] font-sans relative">
      
      {/* HEADER */}
      <div className="flex justify-between items-end p-8 md:p-12 pb-8 border-b border-white/10 shrink-0">
        <div>
          <h2 className="text-4xl font-black uppercase tracking-tighter mb-2 text-white">
            Live <span className="text-tpc-orange">Workbook</span>
          </h2>
          <div className="flex items-center gap-4">
            <p className="text-gray-500 font-mono text-sm uppercase tracking-widest">
              Production Pipeline Manager
            </p>
            <button 
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center gap-2 text-xs font-bold uppercase px-3 py-1.5 rounded transition-colors ${showFilters ? 'bg-tpc-orange text-black' : 'bg-white/5 text-gray-400 hover:text-white'}`}
            >
              <Filter className="w-3 h-3" /> Filters
            </button>
          </div>
        </div>
        <button 
          onClick={handleAddNewRow} 
          className="bg-tpc-orange text-black px-6 py-3 rounded-xl font-bold uppercase tracking-widest flex items-center gap-2 hover:bg-white transition-colors cursor-pointer"
        >
          <Plus className="w-4 h-4" /> New Task
        </button>
      </div>

      {/* SPREADSHEET */}
      <div className="flex-1 overflow-auto bg-[#111]">
        {loading ? (
          <div className="flex items-center justify-center h-full text-gray-500 gap-2">
            <Loader2 className="w-5 h-5 animate-spin"/> Loading Workbook...
          </div>
        ) : (
          <table className="w-max min-w-full text-left text-sm whitespace-nowrap border-collapse pb-32">
            <thead className="sticky top-0 bg-[#111] z-20 text-gray-400 shadow-sm border-b border-white/10">
              <tr>
                <th className="px-4 py-4 w-12 text-center border-r border-white/5">
                  <input 
                    type="checkbox" 
                    checked={allSelected} 
                    onChange={e => toggleAllRows(e.target.checked)} 
                    className="accent-tpc-orange w-4 h-4 rounded cursor-pointer"
                  />
                </th>
                <th onClick={() => handleSort('name')} className="px-6 py-4 font-medium uppercase tracking-widest text-[10px] w-64 cursor-pointer hover:bg-white/5 group border-r border-white/5">Name <SortIcon columnKey="name"/></th>
                <th onClick={() => handleSort('client')} className="px-6 py-4 font-medium uppercase tracking-widest text-[10px] w-48 cursor-pointer hover:bg-white/5 group border-r border-white/5">Client <SortIcon columnKey="client"/></th>
                <th onClick={() => handleSort('status')} className="px-6 py-4 font-medium uppercase tracking-widest text-[10px] w-32 cursor-pointer hover:bg-white/5 group border-r border-white/5">Status <SortIcon columnKey="status"/></th>
                <th onClick={() => handleSort('assigned')} className="px-6 py-4 font-medium uppercase tracking-widest text-[10px] w-48 cursor-pointer hover:bg-white/5 group border-r border-white/5">Assigned <SortIcon columnKey="assigned"/></th>
                <th onClick={() => handleSort('scriptDate')} className="px-6 py-4 font-medium uppercase tracking-widest text-[10px] w-32 cursor-pointer hover:bg-white/5 group border-r border-white/5">Script Date <SortIcon columnKey="scriptDate"/></th>
                <th onClick={() => handleSort('shootDate')} className="px-6 py-4 font-medium uppercase tracking-widest text-[10px] w-32 cursor-pointer hover:bg-white/5 group border-r border-white/5">Shoot Date <SortIcon columnKey="shootDate"/></th>
                <th onClick={() => handleSort('editDate')} className="px-6 py-4 font-medium uppercase tracking-widest text-[10px] w-32 cursor-pointer hover:bg-white/5 group border-r border-white/5">Edit Date <SortIcon columnKey="editDate"/></th>
                <th onClick={() => handleSort('finalDate')} className="px-6 py-4 font-medium uppercase tracking-widest text-[10px] w-32 cursor-pointer hover:bg-white/5 group border-r border-white/5">Final Date <SortIcon columnKey="finalDate"/></th>
                <th onClick={() => handleSort('platform')} className="px-6 py-4 font-medium uppercase tracking-widest text-[10px] w-32 cursor-pointer hover:bg-white/5 group border-r border-white/5">Platform <SortIcon columnKey="platform"/></th>
                <th onClick={() => handleSort('month')} className="px-6 py-4 font-medium uppercase tracking-widest text-[10px] w-32 cursor-pointer hover:bg-white/5 group border-r border-white/5">Month <SortIcon columnKey="month"/></th>
                <th className="px-6 py-4 font-medium uppercase tracking-widest text-[10px] w-12 text-center"></th>
              </tr>
              {/* FILTER ROW */}
              {showFilters && (
                <tr className="bg-[#151515] border-b border-white/10">
                  <th className="px-4 py-2 border-r border-white/5"></th>
                  <th className="px-6 py-2 border-r border-white/5"><input placeholder="Filter name..." value={columnFilters.name || ''} onChange={e => setColumnFilters(p => ({...p, name: e.target.value}))} className="w-full bg-black/50 border border-white/10 p-1.5 px-3 text-xs rounded text-white focus:border-tpc-orange outline-none" /></th>
                  <th className="px-6 py-2 border-r border-white/5"><input placeholder="Filter client..." value={columnFilters.client || ''} onChange={e => setColumnFilters(p => ({...p, client: e.target.value}))} className="w-full bg-black/50 border border-white/10 p-1.5 px-3 text-xs rounded text-white focus:border-tpc-orange outline-none" /></th>
                  <th className="px-6 py-2 border-r border-white/5"><input placeholder="Filter status..." value={columnFilters.status || ''} onChange={e => setColumnFilters(p => ({...p, status: e.target.value}))} className="w-full bg-black/50 border border-white/10 p-1.5 px-3 text-xs rounded text-white focus:border-tpc-orange outline-none" /></th>
                  <th className="px-6 py-2 border-r border-white/5"><input placeholder="Filter assigned..." value={columnFilters.assigned || ''} onChange={e => setColumnFilters(p => ({...p, assigned: e.target.value}))} className="w-full bg-black/50 border border-white/10 p-1.5 px-3 text-xs rounded text-white focus:border-tpc-orange outline-none" /></th>
                  <th className="px-6 py-2 border-r border-white/5"><input placeholder="Filter..." value={columnFilters.scriptDate || ''} onChange={e => setColumnFilters(p => ({...p, scriptDate: e.target.value}))} className="w-full bg-black/50 border border-white/10 p-1.5 px-3 text-xs rounded text-white focus:border-tpc-orange outline-none" /></th>
                  <th className="px-6 py-2 border-r border-white/5"><input placeholder="Filter..." value={columnFilters.shootDate || ''} onChange={e => setColumnFilters(p => ({...p, shootDate: e.target.value}))} className="w-full bg-black/50 border border-white/10 p-1.5 px-3 text-xs rounded text-white focus:border-tpc-orange outline-none" /></th>
                  <th className="px-6 py-2 border-r border-white/5"><input placeholder="Filter..." value={columnFilters.editDate || ''} onChange={e => setColumnFilters(p => ({...p, editDate: e.target.value}))} className="w-full bg-black/50 border border-white/10 p-1.5 px-3 text-xs rounded text-white focus:border-tpc-orange outline-none" /></th>
                  <th className="px-6 py-2 border-r border-white/5"><input placeholder="Filter..." value={columnFilters.finalDate || ''} onChange={e => setColumnFilters(p => ({...p, finalDate: e.target.value}))} className="w-full bg-black/50 border border-white/10 p-1.5 px-3 text-xs rounded text-white focus:border-tpc-orange outline-none" /></th>
                  <th className="px-6 py-2 border-r border-white/5"><input placeholder="Filter platform..." value={columnFilters.platform || ''} onChange={e => setColumnFilters(p => ({...p, platform: e.target.value}))} className="w-full bg-black/50 border border-white/10 p-1.5 px-3 text-xs rounded text-white focus:border-tpc-orange outline-none" /></th>
                  <th className="px-6 py-2 border-r border-white/5"><input placeholder="Filter month..." value={columnFilters.month || ''} onChange={e => setColumnFilters(p => ({...p, month: e.target.value}))} className="w-full bg-black/50 border border-white/10 p-1.5 px-3 text-xs rounded text-white focus:border-tpc-orange outline-none" /></th>
                  <th className="px-6 py-2"></th>
                </tr>
              )}
            </thead>
            <tbody className="divide-y divide-white/5 relative">
              {processedData.length === 0 && (
                <tr>
                  <td colSpan={12} className="px-6 py-12 text-center text-gray-500 italic">No tasks match your filters.</td>
                </tr>
              )}
              {processedData.map((row) => (
                <tr key={row.id} className={`hover:bg-white/5 transition-colors group ${selectedRows.has(row.id) ? 'bg-tpc-orange/10 hover:bg-tpc-orange/20' : ''}`}>
                  <td className="px-4 py-3 border-r border-white/5 text-center">
                    <input 
                      type="checkbox" 
                      checked={selectedRows.has(row.id)} 
                      onChange={e => toggleRow(row.id, e.target.checked, (e.nativeEvent as any).shiftKey)} 
                      className="accent-tpc-orange w-4 h-4 rounded cursor-pointer opacity-50 group-hover:opacity-100 transition-opacity"
                    />
                  </td>
                  {/* Name */}
                  <td className="px-6 py-3 border-r border-white/5">
                    <input 
                      value={row.name || ''} 
                      onChange={(e) => handleInlineChange(row.id, 'name', e.target.value)}
                      className="w-full bg-transparent border-none outline-none text-white font-medium focus:bg-white/10 p-1 rounded transition-colors"
                      placeholder="Task name"
                    />
                  </td>
                  {/* Client - NotionDropdown */}
                  <td className="px-6 py-3 border-r border-white/5 w-48 relative">
                    <NotionDropdown 
                      value={row.client || ''} 
                      options={clients as string[]}
                      onChange={(val) => handleInlineChange(row.id, 'client', val)}
                      placeholder="Select Client..."
                    />
                  </td>
                  {/* Status - NotionDropdown */}
                  <td className="px-6 py-3 border-r border-white/5 w-32 relative">
                    <NotionDropdown 
                      value={row.status || ''} 
                      options={statuses as string[]}
                      onChange={(val) => handleInlineChange(row.id, 'status', val)}
                      placeholder="Status"
                      colorMap={{
                        "ideation": "bg-yellow-500/20 text-yellow-500 border border-yellow-500/30",
                        "error": "bg-gray-500/20 text-gray-400 border border-gray-500/30",
                        "scripting": "bg-blue-500/20 text-blue-500 border border-blue-500/30",
                        "shooting": "bg-purple-500/20 text-purple-500 border border-purple-500/30",
                        "editing": "bg-orange-500/20 text-orange-500 border border-orange-500/30",
                        "reviewing": "bg-red-500/20 text-red-500 border border-red-500/30",
                        "completed": "bg-green-500/20 text-green-500 border border-green-500/30",
                        "posted": "bg-orange-500/20 text-orange-500 border border-orange-500/30"
                      }}
                    />
                  </td>
                  {/* Assigned - NotionMultiSelect */}
                  <td className="px-6 py-3 border-r border-white/5 w-48 relative">
                    <NotionMultiSelect
                      value={row.assigned || ''} 
                      options={assigned as string[]}
                      onChange={(val) => handleInlineChange(row.id, 'assigned', val)}
                      placeholder="Assign..."
                    />
                  </td>
                  {/* Dates */}
                  <td className="px-6 py-3 border-r border-white/5">
                    <input 
                      type="text"
                      value={row.scriptDate || ''} 
                      onChange={(e) => handleInlineChange(row.id, 'scriptDate', e.target.value)}
                      className="w-full bg-transparent border-none outline-none text-gray-300 focus:bg-white/10 p-1 rounded transition-colors [color-scheme:dark]"
                      placeholder="e.g. July 12"
                    />
                  </td>
                  <td className="px-6 py-3 border-r border-white/5">
                    <input 
                      type="text"
                      value={row.shootDate || ''} 
                      onChange={(e) => handleInlineChange(row.id, 'shootDate', e.target.value)}
                      className="w-full bg-transparent border-none outline-none text-gray-300 focus:bg-white/10 p-1 rounded transition-colors [color-scheme:dark]"
                      placeholder="e.g. July 15"
                    />
                  </td>
                  <td className="px-6 py-3 border-r border-white/5">
                    <input 
                      type="text"
                      value={row.editDate || ''} 
                      onChange={(e) => handleInlineChange(row.id, 'editDate', e.target.value)}
                      className="w-full bg-transparent border-none outline-none text-gray-300 focus:bg-white/10 p-1 rounded transition-colors [color-scheme:dark]"
                      placeholder="e.g. July 18"
                    />
                  </td>
                  <td className="px-6 py-3 border-r border-white/5">
                    <input 
                      type="text"
                      value={row.finalDate || ''} 
                      onChange={(e) => handleInlineChange(row.id, 'finalDate', e.target.value)}
                      className="w-full bg-transparent border-none outline-none text-gray-300 focus:bg-white/10 p-1 rounded transition-colors [color-scheme:dark]"
                      placeholder="e.g. July 20"
                    />
                  </td>
                  {/* Platform - NotionDropdown */}
                  <td className="px-6 py-3 border-r border-white/5 w-32 relative">
                    <NotionDropdown 
                      value={row.platform || ''} 
                      options={platforms as string[]}
                      onChange={(val) => handleInlineChange(row.id, 'platform', val)}
                      placeholder="Platform"
                    />
                  </td>
                  {/* Month - NotionDropdown */}
                  <td className="px-6 py-3 border-r border-white/5 w-32 relative">
                    <NotionDropdown 
                      value={row.month || ''} 
                      options={months as string[]}
                      onChange={(val) => handleInlineChange(row.id, 'month', val)}
                      placeholder="Month"
                    />
                  </td>
                  {/* Actions */}
                  <td className="px-6 py-3 text-center">
                     <button onClick={() => handleDeleteRow(row.id)} className="p-1.5 text-gray-500 hover:text-red-500 hover:bg-red-500/10 rounded transition-colors opacity-0 group-hover:opacity-100">
                        <Trash2 className="w-4 h-4" />
                     </button>
                  </td>
                </tr>
              ))}
              
              {/* Add New Row Button inline */}
              <tr>
                <td colSpan={12} className="px-6 py-4">
                  <button onClick={handleAddNewRow} className="text-gray-500 hover:text-white flex items-center gap-2 font-medium transition-colors text-sm">
                    <Plus className="w-4 h-4" /> Add new row
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        )}
      </div>

      {/* FLOATING BULK ACTIONS BAR */}
      {selectedRows.size > 0 && (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 bg-white text-black px-6 py-3 rounded-2xl shadow-2xl flex items-center gap-6 z-50 animate-in slide-in-from-bottom-10 border border-black/10">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-tpc-orange text-white flex items-center justify-center font-bold text-xs">
              {selectedRows.size}
            </div>
            <span className="font-bold text-sm uppercase tracking-widest text-gray-500">Selected</span>
          </div>
          <div className="h-6 w-[1px] bg-gray-200"></div>
          <p className="text-xs text-gray-500 font-medium hidden md:block">Edit any dropdown above to update all selected rows instantly.</p>
          <div className="flex items-center gap-2 ml-auto md:ml-4">
            <button 
              onClick={handleBulkDuplicate} 
              className="flex items-center gap-2 bg-gray-100 text-gray-700 px-4 py-2 rounded-lg text-xs font-bold hover:bg-gray-200 transition-colors uppercase tracking-widest border border-gray-200"
            >
              <Copy className="w-3 h-3" /> Duplicate
            </button>
            <button 
              onClick={handleBulkDelete} 
              className="flex items-center gap-2 bg-red-50 text-red-600 px-4 py-2 rounded-lg text-xs font-bold hover:bg-red-100 transition-colors uppercase tracking-widest border border-red-200"
            >
              <Trash2 className="w-3 h-3" /> Delete
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
