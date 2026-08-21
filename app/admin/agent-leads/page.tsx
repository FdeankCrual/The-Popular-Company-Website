"use client";

import { useState, useEffect, useMemo } from "react";
import { Plus, Loader2, Trash2, Filter, ArrowUpDown, ArrowDown, ArrowUp, X, Copy, Save, MessageSquare } from "lucide-react";
import { NotionDropdown } from "../workbook/components/NotionDropdown";

const initialData: any[] = [];
const emptyLead = { id: "", date: "", type: "Agent Initiated", name: "", email: "", phone: "", target: "", message: "", status: "New", agent: "" };

export default function AdminAgentLeadsPage() {
  const [data, setData] = useState<any[]>(initialData);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'Active' | 'Archive'>('Active');
  
  const [employees, setEmployees] = useState<string[]>([]);
  
  const [selectedRows, setSelectedRows] = useState<Set<number>>(new Set());
  const [lastSelectedRowIdx, setLastSelectedRowIdx] = useState<number | null>(null);
  const [sortConfig, setSortConfig] = useState<{ key: string, direction: 'asc'|'desc'|null }>({ key: '', direction: null });
  const [showFilters, setShowFilters] = useState(false);
  const [columnFilters, setColumnFilters] = useState<Record<string, string>>({});
  const [unsavedUpdates, setUnsavedUpdates] = useState<Map<number, any>>(new Map());
  const [activeQueryLead, setActiveQueryLead] = useState<any>(null);

  const leadTypes = Array.from(new Set(["Manual", "Agent Initiated", ...data.map(d => d.type)].filter(Boolean)));
  const statuses = Array.from(new Set(["New", "Contacted", "Meeting Scheduled", "Converted", "Rejected", ...data.map(d => d.status)].filter(Boolean)));
  const agents = Array.from(new Set(["Unassigned", ...employees].filter(Boolean)));

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    try {
      const [leadsRes, userRes] = await Promise.all([
        fetch("/api/admin/data", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action: "getLeads" })
        }),
        fetch("/api/admin/data?action=getUsers")
      ]);
      
      if (leadsRes.ok) {
        const liveData = await leadsRes.json();
        if (Array.isArray(liveData)) {
          const mapped = liveData.map((row, idx) => ({ ...row, _originalIndex: idx }));
          setData(mapped);
        }
      }
      
      if (userRes.ok) {
        const liveUsers = await userRes.json();
        if (Array.isArray(liveUsers)) {
          setEmployees(liveUsers.map((u: any) => u.Name).filter(Boolean));
        }
      }
    } catch (err) {
      console.error("Failed to fetch data", err);
    } finally {
      setLoading(false);
    }
  }

  const processedData = useMemo(() => {
    // ONLY SHOW AGENT LEADS
    let result = data.filter(d => d.type === 'Manual' || d.type === 'Agent Initiated');

    if (activeTab === 'Active') {
      result = result.filter(r => r.status !== 'Converted' && r.status !== 'Rejected');
    } else {
      result = result.filter(r => r.status === 'Converted' || r.status === 'Rejected');
    }

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
  }, [data, columnFilters, sortConfig, activeTab]);

  const handleAddNewRow = async () => {
    const newRow = { ...emptyLead, date: new Date().toISOString().split('T')[0] };
    try {
      await fetch("/api/admin/data", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "bulkAddLeads", data: [newRow] })
      });
      await fetchData(); 
    } catch (err) {
      console.error(err);
    }
  };

  const handleInlineChange = (idx: number, field: string, value: string) => {
    if (selectedRows.has(idx) && selectedRows.size > 1) {
      // BULK UPDATE
      const rowIdsToUpdate = Array.from(selectedRows);
      
      setData(prev => prev.map(item => 
        rowIdsToUpdate.includes(item._originalIndex) ? { ...item, [field]: value } : item
      ));

      setUnsavedUpdates(prev => {
        const next = new Map(prev);
        data.filter(item => rowIdsToUpdate.includes(item._originalIndex)).forEach(item => {
          const newRow = { ...item, [field]: value };
          next.set(item._originalIndex, newRow);
        });
        return next;
      });
    } else {
      // SINGLE ROW UPDATE
      const updatedRow = data.find(item => item._originalIndex === idx);
      if (!updatedRow) return;
      const newRow = { ...updatedRow, [field]: value };

      setData(prev => prev.map(item => item._originalIndex === idx ? newRow : item));
      
      setUnsavedUpdates(prev => {
        const next = new Map(prev);
        next.set(idx, newRow);
        return next;
      });
    }
  };

  const saveAllChanges = async () => {
    if (unsavedUpdates.size === 0) return;
    const updates = Array.from(unsavedUpdates.values());
    try {
      await fetch("/api/admin/data", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "bulkUpdateLeads", updates })
      });
      setUnsavedUpdates(new Map());
      await fetchData(); 
    } catch (err) {
      console.error("Failed to save all changes", err);
      alert("Failed to save changes.");
    }
  };

  const handleBulkDelete = async () => {
    if (!confirm(`Are you sure you want to delete ${selectedRows.size} leads?`)) return;
    
    const idsToDelete = Array.from(selectedRows);
    setData(prev => prev.filter(item => !idsToDelete.includes(item._originalIndex)));
    setSelectedRows(new Set());
    
    try {
      await fetch("/api/admin/data", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "bulkDeleteLeads", rowIndices: idsToDelete })
      });
      await fetchData();
    } catch (err) {
      console.error(err);
      alert("Error during bulk delete.");
      await fetchData();
    }
  };

  const handleBulkDuplicate = async () => {
    const idsToDuplicate = Array.from(selectedRows);
    const rowsToCopy = data.filter(d => idsToDuplicate.includes(d._originalIndex));
    
    const newRows = rowsToCopy.map(row => ({
      ...row,
      name: row.name ? `${row.name} (Copy)` : "Untitled (Copy)",
      date: new Date().toISOString().split('T')[0]
    }));
    
    try {
      await fetch("/api/admin/data", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "bulkAddLeads", data: newRows })
      });
      await fetchData();
    } catch (err) {
      console.error(err);
      alert("Error duplicating leads.");
    }
  };

  const handleDeleteRow = async (idx: number) => {
    if (!confirm("Are you sure you want to delete this lead?")) return;
    
    setData(data.filter(item => item._originalIndex !== idx));
    
    try {
      await fetch("/api/admin/data", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "deleteLead", rowIndex: idx })
      });
      await fetchData();
    } catch (err) {
      alert("Error deleting lead.");
      await fetchData();
    }
  };

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
    if (checked) setSelectedRows(new Set(processedData.map(r => r._originalIndex)));
    else setSelectedRows(new Set());
  };

  const toggleRow = (idx: number, checked: boolean, shiftKey: boolean = false) => {
    const next = new Set(selectedRows);
    
    if (shiftKey && lastSelectedRowIdx !== null) {
      const currentIndex = processedData.findIndex(r => r._originalIndex === idx);
      const lastIndex = processedData.findIndex(r => r._originalIndex === lastSelectedRowIdx);
      
      if (currentIndex !== -1 && lastIndex !== -1) {
        const start = Math.min(currentIndex, lastIndex);
        const end = Math.max(currentIndex, lastIndex);
        
        for (let i = start; i <= end; i++) {
          if (checked) next.add(processedData[i]._originalIndex);
          else next.delete(processedData[i]._originalIndex);
        }
      }
    } else {
      if (checked) next.add(idx);
      else next.delete(idx);
    }
    
    setSelectedRows(next);
    setLastSelectedRowIdx(idx);
  };

  const allSelected = processedData.length > 0 && selectedRows.size === processedData.length;

  return (
    <div className="flex flex-col h-full bg-[#191919] min-h-dvh text-[#D4D4D4] font-sans relative">
      <div className="flex flex-col md:flex-row md:items-end justify-between p-4 sm:p-8 md:p-12 pb-4 sm:pb-8 border-b border-white/10 shrink-0 gap-4">
        <div>
          <h2 className="text-3xl md:text-4xl font-black uppercase tracking-tighter mb-2 text-white">
            Agent <span className="text-tpc-orange">Leads</span>
          </h2>
          <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
            <p className="text-gray-500 font-mono text-xs md:text-sm uppercase tracking-widest">
              Internal Team Initiated Leads
            </p>
            <button 
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center gap-2 w-max text-xs font-bold uppercase px-3 py-1.5 rounded transition-colors ${showFilters ? 'bg-tpc-orange text-black' : 'bg-white/5 text-gray-400 hover:text-white'}`}
            >
              <Filter className="w-3 h-3" /> Filters
            </button>
          </div>
        </div>
      </div>

      <div className="flex border-b border-white/10 px-4 sm:px-8 md:px-12 pt-2 bg-[#191919]">
        <button 
          onClick={() => setActiveTab('Active')}
          className={`px-6 py-3 font-bold uppercase tracking-widest text-xs border-b-2 transition-colors ${activeTab === 'Active' ? 'border-tpc-orange text-white' : 'border-transparent text-gray-500 hover:text-gray-300'}`}
        >
          Active Leads
        </button>
        <button 
          onClick={() => setActiveTab('Archive')}
          className={`px-6 py-3 font-bold uppercase tracking-widest text-xs border-b-2 transition-colors ${activeTab === 'Archive' ? 'border-tpc-orange text-white' : 'border-transparent text-gray-500 hover:text-gray-300'}`}
        >
          Archive (Closed/Rejected)
        </button>
      </div>

      <div className="flex-1 overflow-auto bg-[#111]">
        {loading ? (
          <div className="flex items-center justify-center h-full text-gray-500 gap-2">
            <Loader2 className="w-5 h-5 animate-spin"/> Loading Leads...
          </div>
        ) : (
          <table className="w-max min-w-full text-left text-sm whitespace-nowrap border-collapse pb-32">
            <thead className="sticky top-0 bg-[#111] z-20 text-gray-400 shadow-sm border-b border-white/10">
              <tr>
                <th className="px-4 py-4 w-12 text-center border-r border-white/5">
                  <input type="checkbox" checked={allSelected} onChange={e => toggleAllRows(e.target.checked)} className="accent-tpc-orange w-4 h-4 rounded cursor-pointer" />
                </th>
                <th onClick={() => handleSort('date')} className="px-6 py-4 font-medium uppercase tracking-widest text-[10px] w-32 cursor-pointer hover:bg-white/5 group border-r border-white/5">Date <SortIcon columnKey="date"/></th>
                <th onClick={() => handleSort('name')} className="px-6 py-4 font-medium uppercase tracking-widest text-[10px] w-48 cursor-pointer hover:bg-white/5 group border-r border-white/5">Name <SortIcon columnKey="name"/></th>
                <th onClick={() => handleSort('email')} className="px-6 py-4 font-medium uppercase tracking-widest text-[10px] w-48 cursor-pointer hover:bg-white/5 group border-r border-white/5">Email <SortIcon columnKey="email"/></th>
                <th onClick={() => handleSort('phone')} className="px-6 py-4 font-medium uppercase tracking-widest text-[10px] w-40 cursor-pointer hover:bg-white/5 group border-r border-white/5">Phone <SortIcon columnKey="phone"/></th>
                <th onClick={() => handleSort('type')} className="px-6 py-4 font-medium uppercase tracking-widest text-[10px] w-32 cursor-pointer hover:bg-white/5 group border-r border-white/5">Type <SortIcon columnKey="type"/></th>
                <th onClick={() => handleSort('status')} className="px-6 py-4 font-medium uppercase tracking-widest text-[10px] w-40 cursor-pointer hover:bg-white/5 group border-r border-white/5">Status <SortIcon columnKey="status"/></th>
                <th onClick={() => handleSort('target')} className="px-6 py-4 font-medium uppercase tracking-widest text-[10px] w-48 cursor-pointer hover:bg-white/5 group border-r border-white/5">Target/Service <SortIcon columnKey="target"/></th>
                <th onClick={() => handleSort('agent')} className="px-6 py-4 font-medium uppercase tracking-widest text-[10px] w-32 cursor-pointer hover:bg-white/5 group border-r border-white/5">Agent <SortIcon columnKey="agent"/></th>
                <th onClick={() => handleSort('message')} className="px-6 py-4 font-medium uppercase tracking-widest text-[10px] w-64 cursor-pointer hover:bg-white/5 group border-r border-white/5">Notes <SortIcon columnKey="message"/></th>
                <th className="px-6 py-4 font-medium uppercase tracking-widest text-[10px] w-32 border-r border-white/5">Support</th>
                <th className="px-6 py-4 font-medium uppercase tracking-widest text-[10px] w-12 text-center"></th>
              </tr>
              
              {showFilters && (
                <tr className="bg-[#151515] border-b border-white/10">
                  <th className="px-4 py-2 border-r border-white/5"></th>
                  <th className="px-6 py-2 border-r border-white/5"><input placeholder="Filter..." value={columnFilters.date || ''} onChange={e => setColumnFilters(p => ({...p, date: e.target.value}))} className="w-full bg-black/50 border border-white/10 p-1.5 px-3 text-xs rounded text-white focus:border-tpc-orange outline-none" /></th>
                  <th className="px-6 py-2 border-r border-white/5"><input placeholder="Filter name..." value={columnFilters.name || ''} onChange={e => setColumnFilters(p => ({...p, name: e.target.value}))} className="w-full bg-black/50 border border-white/10 p-1.5 px-3 text-xs rounded text-white focus:border-tpc-orange outline-none" /></th>
                  <th className="px-6 py-2 border-r border-white/5"><input placeholder="Filter email..." value={columnFilters.email || ''} onChange={e => setColumnFilters(p => ({...p, email: e.target.value}))} className="w-full bg-black/50 border border-white/10 p-1.5 px-3 text-xs rounded text-white focus:border-tpc-orange outline-none" /></th>
                  <th className="px-6 py-2 border-r border-white/5"><input placeholder="Filter phone..." value={columnFilters.phone || ''} onChange={e => setColumnFilters(p => ({...p, phone: e.target.value}))} className="w-full bg-black/50 border border-white/10 p-1.5 px-3 text-xs rounded text-white focus:border-tpc-orange outline-none" /></th>
                  <th className="px-6 py-2 border-r border-white/5"><input placeholder="Filter type..." value={columnFilters.type || ''} onChange={e => setColumnFilters(p => ({...p, type: e.target.value}))} className="w-full bg-black/50 border border-white/10 p-1.5 px-3 text-xs rounded text-white focus:border-tpc-orange outline-none" /></th>
                  <th className="px-6 py-2 border-r border-white/5"><input placeholder="Filter status..." value={columnFilters.status || ''} onChange={e => setColumnFilters(p => ({...p, status: e.target.value}))} className="w-full bg-black/50 border border-white/10 p-1.5 px-3 text-xs rounded text-white focus:border-tpc-orange outline-none" /></th>
                  <th className="px-6 py-2 border-r border-white/5"><input placeholder="Filter target..." value={columnFilters.target || ''} onChange={e => setColumnFilters(p => ({...p, target: e.target.value}))} className="w-full bg-black/50 border border-white/10 p-1.5 px-3 text-xs rounded text-white focus:border-tpc-orange outline-none" /></th>
                  <th className="px-6 py-2 border-r border-white/5"><input placeholder="Filter agent..." value={columnFilters.agent || ''} onChange={e => setColumnFilters(p => ({...p, agent: e.target.value}))} className="w-full bg-black/50 border border-white/10 p-1.5 px-3 text-xs rounded text-white focus:border-tpc-orange outline-none" /></th>
                  <th className="px-6 py-2 border-r border-white/5"><input placeholder="Filter notes..." value={columnFilters.message || ''} onChange={e => setColumnFilters(p => ({...p, message: e.target.value}))} className="w-full bg-black/50 border border-white/10 p-1.5 px-3 text-xs rounded text-white focus:border-tpc-orange outline-none" /></th>
                  <th className="px-6 py-2 border-r border-white/5"></th>
                  <th className="px-6 py-2"></th>
                </tr>
              )}
            </thead>
            
            <tbody className="divide-y divide-white/5">
              {processedData.length === 0 && (
                <tr>
                  <td colSpan={11} className="px-6 py-12 text-center text-gray-500 italic">No agent leads match your filters.</td>
                </tr>
              )}
              {processedData.map((row) => (
                <tr key={row._originalIndex} className={`hover:bg-white/5 transition-colors group ${selectedRows.has(row._originalIndex) ? 'bg-tpc-orange/10 hover:bg-tpc-orange/20' : ''}`}>
                  <td className="px-4 py-3 border-r border-white/5 text-center">
                    <input 
                      type="checkbox" 
                      checked={selectedRows.has(row._originalIndex)} 
                      onChange={e => toggleRow(row._originalIndex, e.target.checked, (e.nativeEvent as any).shiftKey)} 
                      className="accent-tpc-orange w-4 h-4 rounded cursor-pointer opacity-50 group-hover:opacity-100 transition-opacity"
                    />
                  </td>
                  <td className="px-6 py-3 border-r border-white/5">
                    <input type="date" value={row.date || ''} onChange={(e) => handleInlineChange(row._originalIndex, 'date', e.target.value)} className="w-full bg-transparent border-none outline-none text-white font-medium focus:bg-white/10 p-1 rounded transition-colors [color-scheme:dark]" />
                  </td>
                  <td className="px-6 py-3 border-r border-white/5">
                    <input value={row.name || ''} onChange={(e) => handleInlineChange(row._originalIndex, 'name', e.target.value)} className="w-full bg-transparent border-none outline-none text-white focus:bg-white/10 p-1 rounded transition-colors" placeholder="Name" />
                  </td>
                  <td className="px-6 py-3 border-r border-white/5">
                    <input value={row.email || ''} onChange={(e) => handleInlineChange(row._originalIndex, 'email', e.target.value)} className="w-full bg-transparent border-none outline-none text-tpc-orange focus:bg-white/10 p-1 rounded transition-colors" placeholder="Email" />
                  </td>
                  <td className="px-6 py-3 border-r border-white/5">
                    <input value={row.phone || ''} onChange={(e) => handleInlineChange(row._originalIndex, 'phone', e.target.value)} className="w-full bg-transparent border-none outline-none text-tpc-orange focus:bg-white/10 p-1 rounded transition-colors" placeholder="Phone" />
                  </td>
                  <td className="px-6 py-3 border-r border-white/5 relative">
                    <NotionDropdown value={row.type || ''} options={leadTypes as string[]} onChange={(val) => handleInlineChange(row._originalIndex, 'type', val)} placeholder="Type" />
                  </td>
                  <td className="px-6 py-3 border-r border-white/5 relative">
                    <NotionDropdown 
                      value={row.status || ''} 
                      options={statuses as string[]} 
                      onChange={(val) => handleInlineChange(row._originalIndex, 'status', val)} 
                      placeholder="Status"
                      colorMap={{
                        "new": "bg-blue-500/20 text-blue-500",
                        "contacted": "bg-yellow-500/20 text-yellow-500",
                        "meeting scheduled": "bg-purple-500/20 text-purple-500",
                        "converted": "bg-green-500/20 text-green-500",
                        "rejected": "bg-red-500/20 text-red-500"
                      }}
                    />
                  </td>
                  <td className="px-6 py-3 border-r border-white/5">
                    <input value={row.target || ''} onChange={(e) => handleInlineChange(row._originalIndex, 'target', e.target.value)} className="w-full bg-transparent border-none outline-none text-white focus:bg-white/10 p-1 rounded transition-colors" placeholder="Target/Service" />
                  </td>
                  <td className="px-6 py-3 border-r border-white/5 relative">
                    <NotionDropdown value={row.agent || ''} options={agents as string[]} onChange={(val) => handleInlineChange(row._originalIndex, 'agent', val)} placeholder="Agent" />
                  </td>
                  <td className="px-6 py-3 border-r border-white/5">
                    <input value={row.message || ''} onChange={(e) => handleInlineChange(row._originalIndex, 'message', e.target.value)} className="w-full bg-transparent border-none outline-none text-gray-400 focus:bg-white/10 p-1 rounded transition-colors" placeholder="Message/Notes" />
                  </td>
                  <td className="px-6 py-3 border-r border-white/5 align-middle">
                    <button 
                      onClick={() => setActiveQueryLead(row)}
                      className="bg-white/5 border border-white/10 hover:bg-white/10 text-white font-bold text-[10px] uppercase tracking-widest px-3 py-1.5 rounded transition-colors w-full relative flex items-center justify-center gap-2"
                    >
                      <MessageSquare className="w-3 h-3" /> Hub
                      {(row.employeeQuery && row.employeeQuery.trim() !== "") && (
                        <span className="w-2 h-2 rounded-full bg-tpc-orange animate-pulse absolute -mt-1 -mr-1 top-0 right-0"></span>
                      )}
                    </button>
                  </td>
                  <td className="px-6 py-3 text-center">
                    <button onClick={() => handleDeleteRow(row._originalIndex)} className="p-1.5 text-gray-500 hover:text-red-500 hover:bg-red-500/10 rounded transition-colors opacity-0 group-hover:opacity-100">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
              <tr>
                <td colSpan={11} className="px-6 py-4">
                  <button onClick={handleAddNewRow} className="text-gray-500 hover:text-white flex items-center gap-2 font-medium transition-colors text-sm">
                    <Plus className="w-4 h-4" /> Add new lead
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
              className="flex items-center gap-2 bg-gray-100 text-gray-700 px-4 py-2 rounded-lg text-xs font-bold hover:bg-gray-200 transition-colors uppercase tracking-widest border border-gray-200 cursor-pointer"
            >
              <Copy className="w-3 h-3" /> Duplicate
            </button>
            <button 
              onClick={handleBulkDelete} 
              className="flex items-center gap-2 bg-red-50 text-red-600 px-4 py-2 rounded-lg text-xs font-bold hover:bg-red-100 transition-colors uppercase tracking-widest border border-red-200 cursor-pointer"
            >
              <Trash2 className="w-3 h-3" /> Delete
            </button>
          </div>
        </div>
      )}

      {unsavedUpdates.size > 0 && (
        <button 
          onClick={saveAllChanges}
          className="fixed bottom-8 right-8 bg-tpc-orange text-black p-4 rounded-full shadow-[0_0_20px_rgba(255,102,0,0.3)] flex items-center justify-center z-[100] hover:scale-110 active:scale-95 transition-all group animate-in slide-in-from-bottom-8"
        >
          <div className="relative">
            <Save className="w-6 h-6 group-hover:animate-pulse" />
            <span className="absolute -top-3 -right-3 bg-white text-black text-[10px] font-bold w-5 h-5 flex items-center justify-center rounded-full border-2 border-tpc-orange shadow-lg">
              {unsavedUpdates.size}
            </span>
          </div>
        </button>
      )}

      {/* ADMIN QUERY MODAL */}
      {activeQueryLead && (
        <div className="fixed inset-0 z-[20000] bg-black/80 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-[#191919] border border-white/10 rounded-2xl w-full max-w-2xl flex flex-col shadow-2xl">
            <div className="flex justify-between items-center p-6 border-b border-white/10 shrink-0">
              <h3 className="text-xl font-bold text-white flex items-center gap-2">💬 Agent Support Hub</h3>
              <button onClick={() => setActiveQueryLead(null)} className="text-gray-400 hover:text-white cursor-pointer"><X className="w-5 h-5"/></button>
            </div>
            
            <div className="p-6 space-y-6">
              <div className="bg-[#111] border border-white/5 rounded-xl p-4">
                <label className="text-[10px] uppercase tracking-widest text-tpc-orange font-bold mb-2 flex items-center justify-between">
                  Employee Query / Message
                </label>
                <div className="w-full bg-black border border-white/10 rounded-lg p-4 text-white min-h-[100px] whitespace-pre-wrap text-sm">
                  {activeQueryLead.employeeQuery ? activeQueryLead.employeeQuery : <span className="italic opacity-50 text-gray-500">No message from employee yet.</span>}
                </div>
              </div>

              <div className="bg-green-500/5 border border-green-500/20 rounded-xl p-4">
                <label className="text-[10px] uppercase tracking-widest text-green-500 font-bold mb-2 flex items-center justify-between">
                  Your Reply / Action
                </label>
                <textarea 
                  rows={5} 
                  placeholder="Type your reply to the agent here..."
                  value={activeQueryLead.adminReply || ""} 
                  onChange={(e) => setActiveQueryLead({...activeQueryLead, adminReply: e.target.value})} 
                  className="w-full bg-black/50 border border-white/10 rounded-lg p-4 text-white focus:outline-none focus:border-green-500 text-sm resize-none" 
                />
              </div>

              <div className="flex justify-end gap-4 pt-2">
                <button type="button" onClick={() => setActiveQueryLead(null)} className="px-6 py-3 rounded-xl font-bold text-gray-400 hover:text-white transition-colors cursor-pointer text-sm">Close</button>
                <button 
                  onClick={async () => {
                    handleInlineChange(activeQueryLead._originalIndex, 'adminReply', activeQueryLead.adminReply);
                    setActiveQueryLead(null);
                    // Force an immediate save since they might not click the floaty save button
                    saveAllChanges(); 
                  }}
                  className="bg-green-500 text-black px-8 py-3 rounded-xl font-bold uppercase tracking-widest hover:bg-white transition-colors flex items-center gap-2 cursor-pointer text-sm"
                >
                  Save Reply
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
