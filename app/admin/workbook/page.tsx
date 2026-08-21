"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import { Loader2, Plus, ArrowUpDown, ArrowDown, ArrowUp, X, Filter, Copy, CheckSquare, Trash2, Calendar, FileText, Download, Check, Save, MessageSquare, ExternalLink, Link as LinkIcon } from "lucide-react";
import { NotionDropdown } from "./components/NotionDropdown";
import { NotionMultiSelect } from "./components/NotionMultiSelect";
import { KanbanView } from "./components/KanbanView";
import { CalendarView } from "./components/CalendarView";

const initialData: any[] = [];
const emptyForm = { id: "", name: "", client: "", status: "Planning", assigned: "", scriptDate: "", shootDate: "", editDate: "", finalDate: "", platform: "Instagram", month: "", desc: "", captionApproved: "false" };

const formatForDateTimeLocal = (dateString?: string) => {
  if (!dateString) return "";
  try {
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return dateString;
    const pad = (n: number) => n.toString().padStart(2, '0');
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
  } catch (e) {
    return dateString;
  }
};

export default function WorkbookPage() {
  const [data, setData] = useState<any[]>(initialData);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'Active' | 'Archive'>('Active');
  const [activeView, setActiveView] = useState<'Table' | 'Kanban' | 'Calendar'>('Table');
  const [config, setConfig] = useState<any>({ clients: [], assigned: [], status: [], platforms: [], months: [] });
  const [employees, setEmployees] = useState<string[]>([]);
  const [users, setUsers] = useState<any[]>([]);

  // Advanced Table States
  const [selectedRows, setSelectedRows] = useState<Set<string>>(new Set());
  const [lastSelectedRowId, setLastSelectedRowId] = useState<string | null>(null);
  const [sortConfig, setSortConfig] = useState<{ key: string, direction: 'asc' | 'desc' | null }>({ key: '', direction: null });
  const [showFilters, setShowFilters] = useState(false);
  const [columnFilters, setColumnFilters] = useState<Record<string, string>>({});
  const [unsavedUpdates, setUnsavedUpdates] = useState<Map<string, any>>(new Map());

  const [editingTask, setEditingTask] = useState<any>(null);
  const [slashMenuOpen, setSlashMenuOpen] = useState(false);
  const [reviewTask, setReviewTask] = useState<any>(null);
  const [reviewNote, setReviewNote] = useState("");
  const [activeQueryTask, setActiveQueryTask] = useState<any>(null);
  const [ghostName, setGhostName] = useState("");
  const [draggedRowId, setDraggedRowId] = useState<string | null>(null);

  // Extracted unique values for dropdowns
  const clients = Array.from(new Set([...(config.clients || []), ...data.map(d => d.client)].filter(Boolean)));
  const statuses = Array.from(new Set([...(config.status || []), ...data.map(d => d.status)].filter(Boolean)));
  const platforms = Array.from(new Set([...(config.platforms || []), ...data.map(d => d.platform)].filter(Boolean)));
  const assigned = Array.from(new Set([
    ...(config.assigned || []),
    ...employees,
    ...data.flatMap(d => d.assigned ? d.assigned.split(',').map((s: string) => s.trim()) : [])
  ].filter(Boolean)));
  const months = Array.from(new Set([...(config.months || []), ...data.map(d => d.month)].filter(Boolean)));

  const autoSaveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  // Debounced Auto-Save Engine
  useEffect(() => {
    if (unsavedUpdates.size > 0) {
      if (autoSaveTimeoutRef.current) clearTimeout(autoSaveTimeoutRef.current);
      autoSaveTimeoutRef.current = setTimeout(() => {
        saveAllChanges();
      }, 1500); // Save automatically 1.5s after the last edit
    }
    return () => {
      if (autoSaveTimeoutRef.current) clearTimeout(autoSaveTimeoutRef.current);
    };
  }, [unsavedUpdates]);

  async function fetchData() {
    try {
      const [wbRes, confRes, userRes] = await Promise.all([
        fetch("/api/admin/data?action=getWorkbook"),
        fetch("/api/admin/data?action=getConfig"),
        fetch("/api/admin/data?action=getUsers")
      ]);
      if (wbRes.ok) {
        const liveData = await wbRes.json();
        if (Array.isArray(liveData)) setData(liveData);
      }
      if (confRes.ok) {
        const confData = await confRes.json();
        if (confData.workbook_settings) setConfig(confData.workbook_settings);
      }
      if (userRes.ok) {
        const liveUsers = await userRes.json();
        if (Array.isArray(liveUsers)) {
          setUsers(liveUsers);
          setEmployees(liveUsers.map((u: any) => u.Name).filter(Boolean));
        }
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

    // Filter by Tab
    if (activeTab === 'Active') {
      result = result.filter(r => {
        const s = (r.status || '').toLowerCase();
        return s !== 'completed' && s !== 'posted';
      });
    } else {
      result = result.filter(r => {
        const s = (r.status || '').toLowerCase();
        return s === 'completed' || s === 'posted';
      });
    }

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
  }, [data, columnFilters, sortConfig, activeTab]);

  const isStageCompleted = (stage: 'script' | 'shoot' | 'edit' | 'final', status: string) => {
    const s = (status || "").toLowerCase();

    const stages = [
      "ideation",
      "planning",
      "scripting",
      "reviewing script",
      "shooting",
      "reviewing shoot",
      "editing",
      "reviewing edit",
      "under review",
      "completed",
      "posted"
    ];

    let currentIndex = stages.indexOf(s);
    if (currentIndex === -1) {
      if (s.includes('reviewing script')) currentIndex = 3;
      else if (s.includes('reviewing shoot')) currentIndex = 5;
      else if (s.includes('reviewing edit')) currentIndex = 7;
      else if (s.includes('review')) currentIndex = 8;
      else currentIndex = 0;
    }

    if (stage === 'script') return currentIndex >= 4; // Past Scripting (started Shooting)
    if (stage === 'shoot') return currentIndex >= 6; // Past Shooting (started Editing)
    if (stage === 'edit') return currentIndex >= 8; // Past Editing (started Reviewing)
    if (stage === 'final') return currentIndex >= 9; // Completed or Posted

    return false;
  };

  const getDateClass = (stage: 'script' | 'shoot' | 'edit' | 'final', status: string, dateStr: string) => {
    if (isStageCompleted(stage, status)) {
      return 'bg-green-500/20 text-green-500';
    }

    if (dateStr) {
      const targetDate = new Date(dateStr);
      const now = new Date();
      if (targetDate < now) {
        return 'bg-red-500/20 text-red-500 border border-red-500/30';
      }
    }

    return 'bg-transparent text-gray-300 focus:bg-white/10';
  };

  // Handlers
  const handleAddNewRow = async (nameOverride?: string | React.MouseEvent) => {
    const defaultName = typeof nameOverride === 'string' ? nameOverride : "Untitled Task";
    const newRow = { ...emptyForm, id: "proj_" + Math.random().toString(36).substring(2, 9), name: defaultName };
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
    const applyAutomation = (item: any, field: string, value: string) => {
      let updated = { ...item, [field]: value };
      if (field === 'status') {
        const s = value.toLowerCase();

        // Find users based on their roles
        const getNamesByRole = (role: string) =>
          users.filter(u => {
            try {
              const uRoles = typeof u.Roles === 'string' ? JSON.parse(u.Roles) : u.Roles;
              return (Array.isArray(uRoles) ? uRoles : []).includes(role);
            } catch (e) { return false; }
          }).map(u => u.Name);

        const contentWriters = getNamesByRole("CONTENT WRITER");
        const videographers = getNamesByRole("VIDEOGRAPHER");
        const editors = getNamesByRole("EDITOR"); // Assuming standard editor role if any

        const adminContent = getNamesByRole("ADMIN_CONTENT");
        const adminEditor = getNamesByRole("ADMIN_EDITOR");

        if (s === 'scripting') {
          const assignees = [...contentWriters, ...adminContent];
          updated.assigned = Array.from(new Set(assignees)).join(', ');
        } else if (s === 'shooting') {
          const assignees = [...videographers, ...adminContent];
          updated.assigned = Array.from(new Set(assignees)).join(', ');
        } else if (s === 'editing') {
          const assignees = [...editors, ...adminEditor];
          updated.assigned = Array.from(new Set(assignees)).join(', ');
        } else if (s === 'completed') {
          updated.assigned = "";
        }
      }
      return updated;
    };

    // Check if we are doing a BULK UPDATE via Row Selection
    if (selectedRows.has(id) && selectedRows.size > 1) {
      const rowIdsToUpdate = Array.from(selectedRows);

      // Optimistic update locally
      setData(prev => prev.map(item =>
        rowIdsToUpdate.includes(item.id) ? applyAutomation(item, field, value) : item
      ));

      // Grab the modified rows to queue
      const updates = data
        .filter(item => rowIdsToUpdate.includes(item.id))
        .map(item => applyAutomation(item, field, value));

      setUnsavedUpdates(prev => {
        const next = new Map(prev);
        updates.forEach(u => next.set(u.id, u));
        return next;
      });
    } else {
      // STANDARD SINGLE ROW UPDATE
      const updatedRow = data.find(item => item.id === id);
      if (!updatedRow) return;
      const newRow = applyAutomation(updatedRow, field, value);

      setData(prev => prev.map(item => item.id === id ? newRow : item));

      setUnsavedUpdates(prev => {
        const next = new Map(prev);
        next.set(newRow.id, newRow);
        return next;
      });
    }
  };

  const [isSaving, setIsSaving] = useState(false);

  const saveAllChanges = async () => {
    if (unsavedUpdates.size === 0) return;
    const updates = Array.from(unsavedUpdates.values());
    const idsToClear = updates.map(u => u.id);
    
    setIsSaving(true);
    try {
      await fetch("/api/admin/data", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "bulkUpdateWorkbook", updates })
      });
      setUnsavedUpdates(prev => {
        const next = new Map(prev);
        idsToClear.forEach(id => next.delete(id));
        return next;
      });
    } catch (err) {
      console.error("Failed to save all changes", err);
    } finally {
      setIsSaving(false);
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
    <div className="flex flex-col h-full bg-[#191919] min-h-dvh text-[#D4D4D4] font-sans relative">

      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-end justify-between p-3 md:p-12 pb-3 md:pb-8 border-b border-white/10 shrink-0 gap-3">
        <div>
          <h2 className="text-xl md:text-4xl font-black uppercase tracking-tighter mb-1 md:mb-2 text-white">
            Live <span className="text-tpc-orange">Workbook</span>
          </h2>
          <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
            <p className="text-gray-500 font-mono text-[10px] md:text-sm uppercase tracking-widest leading-tight">
              Production Pipeline Manager
            </p>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center gap-1.5 w-max text-[10px] md:text-xs font-bold uppercase px-2 py-1 md:px-3 md:py-1.5 rounded transition-colors ${showFilters ? 'bg-tpc-orange text-black' : 'bg-white/5 text-gray-400 hover:text-white'}`}
            >
              <Filter className="w-3 h-3" /> Filters
            </button>
          </div>
        </div>
        <button
          onClick={handleAddNewRow}
          className="bg-tpc-orange text-black px-4 py-2 md:px-6 md:py-3 rounded-lg md:rounded-xl text-xs md:text-sm font-bold uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-white transition-colors cursor-pointer w-full md:w-auto mt-1 md:mt-0"
        >
          <Plus className="w-4 h-4" /> New Task
        </button>
      </div>

      {/* TABS */}
      <div className="flex border-b border-white/10 px-3 md:px-12 pt-1 md:pt-2 bg-[#191919]">
        <button
          onClick={() => setActiveTab('Active')}
          className={`px-4 py-2 md:px-6 md:py-3 font-bold uppercase tracking-widest text-[10px] md:text-xs border-b-2 transition-colors flex-1 md:flex-none ${activeTab === 'Active' ? 'border-tpc-orange text-white' : 'border-transparent text-gray-500 hover:text-gray-300'}`}
        >
          Active Tasks
        </button>
        <button
          onClick={() => setActiveTab('Archive')}
          className={`px-4 py-2 md:px-6 md:py-3 font-bold uppercase tracking-widest text-[10px] md:text-xs border-b-2 transition-colors flex-1 md:flex-none ${activeTab === 'Archive' ? 'border-tpc-orange text-white' : 'border-transparent text-gray-500 hover:text-gray-300'}`}
        >
          Archive (Completed)
        </button>
      </div>

      {/* VIEW TOGGLES */}
      <div className="flex px-4 sm:px-8 md:px-12 py-4 bg-[#191919] gap-4 border-b border-white/5">
        <button
          onClick={() => setActiveView('Table')}
          className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-widest transition-colors ${activeView === 'Table' ? 'bg-tpc-orange text-black' : 'bg-white/5 text-gray-400 hover:text-white hover:bg-white/10'}`}
        >
          Table View
        </button>
        <button
          onClick={() => setActiveView('Kanban')}
          className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-widest transition-colors ${activeView === 'Kanban' ? 'bg-tpc-orange text-black' : 'bg-white/5 text-gray-400 hover:text-white hover:bg-white/10'}`}
        >
          Kanban Board
        </button>
        <button
          onClick={() => setActiveView('Calendar')}
          className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-widest transition-colors ${activeView === 'Calendar' ? 'bg-tpc-orange text-black' : 'bg-white/5 text-gray-400 hover:text-white hover:bg-white/10'}`}
        >
          Calendar
        </button>
      </div>

      {/* MAIN VIEW CONTENT */}
      <div className="flex-1 overflow-auto bg-[#111]">
        {loading ? (
          <div className="flex items-center justify-center h-full text-gray-500 gap-2">
            <Loader2 className="w-5 h-5 animate-spin" /> Loading Workbook...
          </div>
        ) : activeView === 'Kanban' ? (
          <KanbanView data={processedData} handleInlineChange={handleInlineChange} onTaskClick={(task) => setEditingTask(task)} />
        ) : activeView === 'Calendar' ? (
          <CalendarView data={processedData} onTaskClick={(task) => setEditingTask(task)} />
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
                <th onClick={() => handleSort('name')} className="px-6 py-4 font-medium uppercase tracking-widest text-[10px] w-64 cursor-pointer hover:bg-white/5 group border-r border-white/5">Name <SortIcon columnKey="name" /></th>
                <th onClick={() => handleSort('client')} className="px-6 py-4 font-medium uppercase tracking-widest text-[10px] w-48 cursor-pointer hover:bg-white/5 group border-r border-white/5">Client <SortIcon columnKey="client" /></th>
                <th onClick={() => handleSort('status')} className="px-6 py-4 font-medium uppercase tracking-widest text-[10px] w-32 cursor-pointer hover:bg-white/5 group border-r border-white/5">Status <SortIcon columnKey="status" /></th>
                <th onClick={() => handleSort('assigned')} className="px-6 py-4 font-medium uppercase tracking-widest text-[10px] w-48 cursor-pointer hover:bg-white/5 group border-r border-white/5">Assigned <SortIcon columnKey="assigned" /></th>
                <th onClick={() => handleSort('docLink')} className="px-6 py-4 font-medium uppercase tracking-widest text-[10px] w-48 cursor-pointer hover:bg-white/5 group border-r border-white/5">Script Link <SortIcon columnKey="docLink" /></th>
                <th onClick={() => handleSort('driveA')} className="px-6 py-4 font-medium uppercase tracking-widest text-[10px] w-48 cursor-pointer hover:bg-white/5 group border-r border-white/5">Drive Link <SortIcon columnKey="driveA" /></th>
                <th onClick={() => handleSort('scriptDate')} className="px-6 py-4 font-medium uppercase tracking-widest text-[10px] w-32 cursor-pointer hover:bg-white/5 group border-r border-white/5">Script Date <SortIcon columnKey="scriptDate" /></th>
                <th onClick={() => handleSort('shootDate')} className="px-6 py-4 font-medium uppercase tracking-widest text-[10px] w-32 cursor-pointer hover:bg-white/5 group border-r border-white/5">Shoot Date <SortIcon columnKey="shootDate" /></th>
                <th onClick={() => handleSort('editDate')} className="px-6 py-4 font-medium uppercase tracking-widest text-[10px] w-32 cursor-pointer hover:bg-white/5 group border-r border-white/5">Edit Date <SortIcon columnKey="editDate" /></th>
                <th onClick={() => handleSort('finalDate')} className="px-6 py-4 font-medium uppercase tracking-widest text-[10px] w-32 cursor-pointer hover:bg-white/5 group border-r border-white/5">Posting Date / Time <SortIcon columnKey="finalDate" /></th>
                <th onClick={() => handleSort('platform')} className="px-6 py-4 font-medium uppercase tracking-widest text-[10px] w-32 cursor-pointer hover:bg-white/5 group border-r border-white/5">Platform <SortIcon columnKey="platform" /></th>
                <th onClick={() => handleSort('month')} className="px-6 py-4 font-medium uppercase tracking-widest text-[10px] w-32 cursor-pointer hover:bg-white/5 group border-r border-white/5">Month <SortIcon columnKey="month" /></th>
                <th className="px-6 py-4 font-medium uppercase tracking-widest text-[10px] w-32 border-r border-white/5">Support</th>
                <th className="px-6 py-4 font-medium uppercase tracking-widest text-[10px] w-12 text-center"></th>
              </tr>
              {/* FILTER ROW */}
              {showFilters && (
                <tr className="bg-[#151515] border-b border-white/10">
                  <th className="px-4 py-2 border-r border-white/5"></th>
                  <th className="px-6 py-2 border-r border-white/5"><input placeholder="Filter name..." value={columnFilters.name || ''} onChange={e => setColumnFilters(p => ({ ...p, name: e.target.value }))} className="w-full bg-black/50 border border-white/10 p-1.5 px-3 text-xs rounded text-white focus:border-tpc-orange outline-none" /></th>
                  <th className="px-6 py-2 border-r border-white/5"><input placeholder="Filter client..." value={columnFilters.client || ''} onChange={e => setColumnFilters(p => ({ ...p, client: e.target.value }))} className="w-full bg-black/50 border border-white/10 p-1.5 px-3 text-xs rounded text-white focus:border-tpc-orange outline-none" /></th>
                  <th className="px-6 py-2 border-r border-white/5"><input placeholder="Filter status..." value={columnFilters.status || ''} onChange={e => setColumnFilters(p => ({ ...p, status: e.target.value }))} className="w-full bg-black/50 border border-white/10 p-1.5 px-3 text-xs rounded text-white focus:border-tpc-orange outline-none" /></th>
                  <th className="px-6 py-2 border-r border-white/5"><input placeholder="Filter assigned..." value={columnFilters.assigned || ''} onChange={e => setColumnFilters(p => ({ ...p, assigned: e.target.value }))} className="w-full bg-black/50 border border-white/10 p-1.5 px-3 text-xs rounded text-white focus:border-tpc-orange outline-none" /></th>
                  <th className="px-6 py-2 border-r border-white/5"></th>
                  <th className="px-6 py-2 border-r border-white/5"></th>
                  <th className="px-6 py-2 border-r border-white/5"><input placeholder="Filter..." value={columnFilters.scriptDate || ''} onChange={e => setColumnFilters(p => ({ ...p, scriptDate: e.target.value }))} className="w-full bg-black/50 border border-white/10 p-1.5 px-3 text-xs rounded text-white focus:border-tpc-orange outline-none" /></th>
                  <th className="px-6 py-2 border-r border-white/5"><input placeholder="Filter..." value={columnFilters.shootDate || ''} onChange={e => setColumnFilters(p => ({ ...p, shootDate: e.target.value }))} className="w-full bg-black/50 border border-white/10 p-1.5 px-3 text-xs rounded text-white focus:border-tpc-orange outline-none" /></th>
                  <th className="px-6 py-2 border-r border-white/5"><input placeholder="Filter..." value={columnFilters.editDate || ''} onChange={e => setColumnFilters(p => ({ ...p, editDate: e.target.value }))} className="w-full bg-black/50 border border-white/10 p-1.5 px-3 text-xs rounded text-white focus:border-tpc-orange outline-none" /></th>
                  <th className="px-6 py-2 border-r border-white/5"><input placeholder="Filter..." value={columnFilters.finalDate || ''} onChange={e => setColumnFilters(p => ({ ...p, finalDate: e.target.value }))} className="w-full bg-black/50 border border-white/10 p-1.5 px-3 text-xs rounded text-white focus:border-tpc-orange outline-none" /></th>
                  <th className="px-6 py-2 border-r border-white/5"><input placeholder="Filter platform..." value={columnFilters.platform || ''} onChange={e => setColumnFilters(p => ({ ...p, platform: e.target.value }))} className="w-full bg-black/50 border border-white/10 p-1.5 px-3 text-xs rounded text-white focus:border-tpc-orange outline-none" /></th>
                  <th className="px-6 py-2 border-r border-white/5"><input placeholder="Filter month..." value={columnFilters.month || ''} onChange={e => setColumnFilters(p => ({ ...p, month: e.target.value }))} className="w-full bg-black/50 border border-white/10 p-1.5 px-3 text-xs rounded text-white focus:border-tpc-orange outline-none" /></th>
                  <th className="px-6 py-2 border-r border-white/5"></th>
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
                <tr 
                  key={row.id} 
                  draggable
                  onDragStart={(e) => {
                    setDraggedRowId(row.id);
                    e.dataTransfer.effectAllowed = "move";
                  }}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={(e) => {
                    e.preventDefault();
                    if (!draggedRowId || draggedRowId === row.id) return;
                    
                    const draggedIndex = data.findIndex(d => d.id === draggedRowId);
                    const targetIndex = data.findIndex(d => d.id === row.id);
                    if (draggedIndex === -1 || targetIndex === -1) return;

                    const newData = [...data];
                    const [draggedItem] = newData.splice(draggedIndex, 1);
                    newData.splice(targetIndex, 0, draggedItem);
                    setData(newData);
                    setDraggedRowId(null);
                  }}
                  onDragEnd={() => setDraggedRowId(null)}
                  className={`hover:bg-white/5 transition-colors group cursor-grab active:cursor-grabbing ${selectedRows.has(row.id) ? 'bg-tpc-orange/10 hover:bg-tpc-orange/20' : ''} ${draggedRowId === row.id ? 'opacity-30 border-2 border-tpc-orange bg-tpc-orange/5' : ''}`}
                >
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
                  {/* Script Link */}
                  <td className="px-6 py-3 border-r border-white/5 w-48 relative">
                    <div className={`flex items-center gap-2 border rounded px-2 py-1 transition-colors ${row.docLink ? 'bg-green-500/10 border-green-500/30' : 'bg-black/50 border-white/10 focus-within:border-tpc-orange'}`}>
                      <LinkIcon className={`w-3 h-3 shrink-0 ${row.docLink ? 'text-green-500' : 'text-gray-500'}`} />
                      <input
                        value={row.docLink || ''}
                        onChange={(e) => handleInlineChange(row.id, 'docLink', e.target.value)}
                        placeholder="Paste Script URL..."
                        className="w-full bg-transparent border-none outline-none text-white text-xs"
                      />
                      {row.docLink && (
                        <a href={row.docLink} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white shrink-0 ml-1">
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      )}
                    </div>
                  </td>
                  {/* Drive Link */}
                  <td className="px-6 py-3 border-r border-white/5 w-48 relative">
                    <div className={`flex items-center gap-2 border rounded px-2 py-1 transition-colors ${row.driveA ? 'bg-green-500/10 border-green-500/30' : 'bg-black/50 border-white/10 focus-within:border-tpc-orange'}`}>
                      <FileText className={`w-3 h-3 shrink-0 ${row.driveA ? 'text-green-500' : 'text-gray-500'}`} />
                      <input
                        value={row.driveA || ''}
                        onChange={(e) => handleInlineChange(row.id, 'driveA', e.target.value)}
                        placeholder="Paste Drive URL..."
                        className="w-full bg-transparent border-none outline-none text-white text-xs"
                      />
                      {row.driveA && (
                        <a href={row.driveA} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white shrink-0 ml-1">
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      )}
                    </div>
                  </td>
                  {/* Dates */}
                  <td className="px-6 py-3 border-r border-white/5">
                    <input
                      type="datetime-local"
                      value={formatForDateTimeLocal(row.scriptDate)}
                      onChange={(e) => handleInlineChange(row.id, 'scriptDate', e.target.value)}
                      className={`w-full border-none outline-none p-1 rounded transition-colors [color-scheme:dark] text-xs cursor-pointer ${getDateClass('script', row.status, row.scriptDate)}`}
                    />
                  </td>
                  <td className="px-6 py-3 border-r border-white/5">
                    <input
                      type="datetime-local"
                      value={formatForDateTimeLocal(row.shootDate)}
                      onChange={(e) => handleInlineChange(row.id, 'shootDate', e.target.value)}
                      className={`w-full border-none outline-none p-1 rounded transition-colors [color-scheme:dark] text-xs cursor-pointer ${getDateClass('shoot', row.status, row.shootDate)}`}
                    />
                  </td>
                  <td className="px-6 py-3 border-r border-white/5">
                    <input
                      type="datetime-local"
                      value={formatForDateTimeLocal(row.editDate)}
                      onChange={(e) => handleInlineChange(row.id, 'editDate', e.target.value)}
                      className={`w-full border-none outline-none p-1 rounded transition-colors [color-scheme:dark] text-xs cursor-pointer ${getDateClass('edit', row.status, row.editDate)}`}
                    />
                  </td>
                  <td className="px-6 py-3 border-r border-white/5">
                    <input
                      type="datetime-local"
                      value={formatForDateTimeLocal(row.finalDate)}
                      onChange={(e) => handleInlineChange(row.id, 'finalDate', e.target.value)}
                      className={`w-full border-none outline-none p-1 rounded transition-colors [color-scheme:dark] text-xs cursor-pointer ${getDateClass('final', row.status, row.finalDate)}`}
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
                  {/* Support Hub */}
                  <td className="px-6 py-3 border-r border-white/5 align-middle">
                    <button
                      onClick={() => setActiveQueryTask(row)}
                      className="bg-white/5 border border-white/10 hover:bg-white/10 text-white font-bold text-[10px] uppercase tracking-widest px-3 py-1.5 rounded transition-colors w-full relative flex items-center justify-center gap-2"
                    >
                      <MessageSquare className="w-3 h-3" /> Hub
                      {(row.employeeQuery && row.employeeQuery.trim() !== "") && (
                        <span className="w-2 h-2 rounded-full bg-tpc-orange animate-pulse absolute -mt-1 -mr-1 top-0 right-0"></span>
                      )}
                    </button>
                  </td>
                  {/* Actions */}
                  <td className="px-6 py-3 text-center">
                    <div className="flex items-center justify-center gap-2">
                      {(row.status || "").toLowerCase().includes("review") && (
                        <button onClick={() => setReviewTask(row)} className="px-3 py-1 bg-yellow-500/20 text-yellow-500 font-bold uppercase tracking-widest text-[10px] rounded hover:bg-yellow-500/30 transition-colors animate-pulse">
                          Review
                        </button>
                      )}
                      <button onClick={() => handleDeleteRow(row.id)} className="p-1.5 text-gray-500 hover:text-red-500 hover:bg-red-500/10 rounded transition-colors opacity-0 group-hover:opacity-100">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}

              {/* GHOST ROW (Instant Add) */}
              <tr className="hover:bg-white/5 transition-colors group opacity-50 focus-within:opacity-100">
                <td className="px-4 py-3 border-r border-white/5 text-center">
                  <Plus className="w-4 h-4 mx-auto text-gray-500 group-focus-within:text-tpc-orange" />
                </td>
                <td className="px-6 py-3 border-r border-white/5" colSpan={13}>
                  <input
                    value={ghostName}
                    onChange={(e) => setGhostName(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && ghostName.trim()) {
                        handleAddNewRow(ghostName);
                        setGhostName("");
                      }
                    }}
                    onBlur={() => {
                      if (ghostName.trim()) {
                        handleAddNewRow(ghostName);
                        setGhostName("");
                      }
                    }}
                    placeholder="Click to add a new task... (Press Enter to save)"
                    className="w-full bg-transparent border-none outline-none text-white font-medium focus:bg-white/10 p-1 rounded transition-colors"
                  />
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

      {/* FLOATING SAVE INDICATOR */}
      {(unsavedUpdates.size > 0 || isSaving) && (
        <div className="fixed bottom-8 right-8 bg-black/80 backdrop-blur border border-white/10 text-gray-300 px-4 py-2 rounded-full shadow-2xl flex items-center gap-3 z-[100] animate-in slide-in-from-bottom-8">
          {isSaving ? (
            <>
              <Loader2 className="w-4 h-4 text-tpc-orange animate-spin" />
              <span className="text-xs font-bold uppercase tracking-widest">Saving...</span>
            </>
          ) : (
            <>
              <span className="w-2 h-2 rounded-full bg-yellow-500 animate-pulse"></span>
              <span className="text-xs font-bold uppercase tracking-widest">{unsavedUpdates.size} Unsaved</span>
            </>
          )}
        </div>
      )}

      {/* EDIT MODAL (for Kanban/Calendar views - SIDE PEEK) */}
      {editingTask && (
        <div className="fixed inset-0 z-[20000] flex justify-end bg-black/50 backdrop-blur-sm">
          <div className="bg-[#111] border-l border-white/10 w-full md:w-[600px] md:max-w-[600px] h-full relative shadow-2xl animate-in slide-in-from-right duration-300 flex flex-col">
            
            <div className="p-6 md:p-8 border-b border-white/10 flex justify-between items-center shrink-0">
              <h3 className="text-xl font-bold uppercase tracking-widest text-tpc-orange flex items-center gap-2">
                Edit Task
              </h3>
              <button onClick={() => setEditingTask(null)} className="text-gray-500 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 md:p-8 flex-1 overflow-y-auto space-y-6 pr-2">
              <div>
                <label className="text-xs font-bold uppercase text-gray-500 mb-1 block">Task Name</label>
                <input
                  value={editingTask.name || ''}
                  onChange={(e) => setEditingTask({ ...editingTask, name: e.target.value })}
                  className="w-full bg-black border border-white/10 p-3 rounded-lg text-white text-sm outline-none focus:border-tpc-orange"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold uppercase text-gray-500 mb-1 block">Client</label>
                  <input
                    value={editingTask.client || ''}
                    onChange={(e) => setEditingTask({ ...editingTask, client: e.target.value })}
                    className="w-full bg-black border border-white/10 p-3 rounded-lg text-white text-sm outline-none focus:border-tpc-orange"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold uppercase text-gray-500 mb-1 block">Status</label>
                  <select
                    value={editingTask.status || ''}
                    onChange={(e) => setEditingTask({ ...editingTask, status: e.target.value })}
                    className="w-full bg-black border border-white/10 p-3 rounded-lg text-white text-sm outline-none focus:border-tpc-orange appearance-none"
                  >
                    {statuses.map(s => <option key={s as string} value={s as string}>{s as string}</option>)}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold uppercase text-gray-500 mb-1 block">Assigned To</label>
                  <input
                    value={editingTask.assigned || ''}
                    onChange={(e) => setEditingTask({ ...editingTask, assigned: e.target.value })}
                    placeholder="Comma separated names"
                    className="w-full bg-black border border-white/10 p-3 rounded-lg text-white text-sm outline-none focus:border-tpc-orange"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold uppercase text-gray-500 mb-1 block">Platform</label>
                  <select
                    value={editingTask.platform || ''}
                    onChange={(e) => setEditingTask({ ...editingTask, platform: e.target.value })}
                    className="w-full bg-black border border-white/10 p-3 rounded-lg text-white text-sm outline-none focus:border-tpc-orange appearance-none"
                  >
                    {platforms.map(p => <option key={p as string} value={p as string}>{p as string}</option>)}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold uppercase text-gray-500 mb-1 block">Month</label>
                  <select
                    value={editingTask.month || ''}
                    onChange={(e) => setEditingTask({ ...editingTask, month: e.target.value })}
                    className="w-full bg-black border border-white/10 p-3 rounded-lg text-white text-sm outline-none focus:border-tpc-orange appearance-none"
                  >
                    {months.map(m => <option key={m as string} value={m as string}>{m as string}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-bold uppercase text-gray-500 mb-1 block">Script Link</label>
                  <input
                    value={editingTask.docLink || ''}
                    onChange={(e) => setEditingTask({ ...editingTask, docLink: e.target.value })}
                    placeholder="https://..."
                    className="w-full bg-black border border-white/10 p-3 rounded-lg text-white text-sm outline-none focus:border-tpc-orange"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold uppercase text-gray-500 mb-1 block">Drive Link</label>
                <input
                  value={editingTask.driveA || ''}
                  onChange={(e) => setEditingTask({ ...editingTask, driveA: e.target.value })}
                  placeholder="https://..."
                  className="w-full bg-black border border-white/10 p-3 rounded-lg text-white text-sm outline-none focus:border-tpc-orange"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold uppercase text-gray-500 mb-1 block">Script Date</label>
                  <input
                    type="datetime-local"
                    value={formatForDateTimeLocal(editingTask.scriptDate)}
                    onChange={(e) => setEditingTask({ ...editingTask, scriptDate: e.target.value })}
                    className="w-full bg-black border border-white/10 p-3 rounded-lg text-white text-sm outline-none focus:border-tpc-orange"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold uppercase text-gray-500 mb-1 block">Shoot Date</label>
                  <input
                    type="datetime-local"
                    value={formatForDateTimeLocal(editingTask.shootDate)}
                    onChange={(e) => setEditingTask({ ...editingTask, shootDate: e.target.value })}
                    className="w-full bg-black border border-white/10 p-3 rounded-lg text-white text-sm outline-none focus:border-tpc-orange"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold uppercase text-gray-500 mb-1 block">Edit Date</label>
                  <input
                    type="datetime-local"
                    value={formatForDateTimeLocal(editingTask.editDate)}
                    onChange={(e) => setEditingTask({ ...editingTask, editDate: e.target.value })}
                    className="w-full bg-black border border-white/10 p-3 rounded-lg text-white text-sm outline-none focus:border-tpc-orange"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold uppercase text-gray-500 mb-1 block">Final Date</label>
                  <input
                    type="datetime-local"
                    value={formatForDateTimeLocal(editingTask.finalDate)}
                    onChange={(e) => setEditingTask({ ...editingTask, finalDate: e.target.value })}
                    className="w-full bg-black border border-white/10 p-3 rounded-lg text-white text-sm outline-none focus:border-tpc-orange"
                  />
                </div>
              </div>

              <div className="relative">
                <label className="text-xs font-bold uppercase text-gray-500 mb-1 block">Notes / Description</label>
                <textarea
                  value={editingTask.desc || ''}
                  onChange={(e) => {
                    const val = e.target.value;
                    setEditingTask({ ...editingTask, desc: val });
                    if (val.endsWith('/')) setSlashMenuOpen(true);
                    else setSlashMenuOpen(false);
                  }}
                  rows={4}
                  placeholder="Type '/' for quick commands..."
                  className="w-full bg-black border border-white/10 p-3 rounded-lg text-white text-sm outline-none focus:border-tpc-orange resize-none"
                />
                {slashMenuOpen && (
                  <div className="absolute bottom-full left-0 mb-2 w-48 bg-[#191919] border border-white/10 rounded-lg shadow-2xl overflow-hidden z-[21000] animate-in slide-in-from-bottom-2">
                    <button 
                      onClick={() => {
                        const today = new Date().toISOString().split('T')[0];
                        setEditingTask({...editingTask, desc: editingTask.desc.slice(0, -1) + today + ' '});
                        setSlashMenuOpen(false);
                      }}
                      className="w-full text-left px-4 py-2 text-xs hover:bg-white/10 text-white flex gap-2 items-center transition-colors"
                    >
                      <Calendar className="w-3 h-3 text-tpc-orange" /> Insert Today's Date
                    </button>
                    <button 
                      onClick={() => {
                        setEditingTask({...editingTask, desc: editingTask.desc.slice(0, -1) + '@[Assignee] '});
                        setSlashMenuOpen(false);
                      }}
                      className="w-full text-left px-4 py-2 text-xs hover:bg-white/10 text-white flex gap-2 items-center transition-colors"
                    >
                      <MessageSquare className="w-3 h-3 text-tpc-orange" /> Ping Assignee
                    </button>
                  </div>
                )}
              </div>

              {editingTask.reelCaption && (
                <div className="mt-4 bg-white/5 border border-white/10 p-4 rounded-lg">
                  <label className="flex items-center gap-3 cursor-pointer group">
                    <input
                      type="checkbox"
                      checked={editingTask.captionApproved === 'true'}
                      onChange={(e) => setEditingTask({ ...editingTask, captionApproved: e.target.checked ? 'true' : 'false' })}
                      className="w-5 h-5 accent-green-500 rounded cursor-pointer"
                    />
                    <div>
                      <div className="text-sm font-bold text-white group-hover:text-green-400 transition-colors">Caption Approved</div>
                      <div className="text-xs text-gray-500 font-mono mt-1">Check this to lock the caption and approve it for posting.</div>
                    </div>
                  </label>
                  <div className="mt-4 text-xs text-gray-400 bg-black/50 p-3 rounded italic border border-white/5">
                    "{editingTask.reelCaption}"
                  </div>
                </div>
              )}

            </div>

            <div className="p-6 md:p-8 border-t border-white/10 flex gap-4 shrink-0 bg-[#0a0a0a]">
              <button
                onClick={() => {
                  // Propagate all changes
                  Object.keys(editingTask).forEach(key => {
                    handleInlineChange(editingTask.id, key, editingTask[key]);
                  });
                  setEditingTask(null);
                }}
                className="w-full bg-tpc-orange hover:bg-white text-black font-bold uppercase tracking-widest py-4 rounded-xl transition-colors text-sm shadow-xl"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* REVIEW MODAL */}
      {reviewTask && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="bg-[#111] border border-white/10 rounded-2xl p-8 max-w-md w-full relative">
            <button onClick={() => { setReviewTask(null); setReviewNote(""); }} className="absolute top-4 right-4 text-gray-500 hover:text-white">
              <X className="w-5 h-5" />
            </button>
            <h3 className="text-xl font-bold uppercase tracking-widest mb-6 text-yellow-500 flex items-center gap-2">
              Review Task
            </h3>

            <p className="text-gray-400 mb-4 text-sm">Review the uploaded files from the Google Drive Folder before approving.</p>
            {reviewTask.driveA ? (
              <a href={reviewTask.driveA} target="_blank" rel="noopener noreferrer" className="block w-full text-center bg-white/5 hover:bg-white/10 border border-white/10 text-white font-bold py-3 rounded-xl mb-6 transition-colors">
                Open Google Drive Folder
              </a>
            ) : (
              <p className="text-red-400 text-xs italic mb-6">No Drive Folder provided by Admin.</p>
            )}

            <div className="space-y-4 mb-8">
              <div>
                <label className="text-xs font-bold uppercase tracking-widest text-gray-500">Admin Note (Required for Fixes)</label>
                <textarea
                  value={reviewNote}
                  onChange={e => setReviewNote(e.target.value)}
                  className="w-full bg-black border border-white/10 p-3 rounded-xl mt-1 text-white h-24 resize-none"
                  placeholder="Explain what needs to be fixed..."
                />
              </div>
            </div>

            <div className="flex gap-4">
              <button
                onClick={() => {
                  if (!reviewNote.trim()) return alert("You must provide an admin note for fixes.");
                  handleInlineChange(reviewTask.id, 'adminNote', reviewNote);
                  handleInlineChange(reviewTask.id, 'status', 'Fixes Required');
                  setReviewTask(null);
                  setReviewNote("");
                }}
                className="flex-1 bg-red-500/10 text-red-500 border border-red-500/30 hover:bg-red-500 hover:text-black font-bold uppercase tracking-widest p-4 rounded-xl transition-colors text-xs"
              >
                Needs Fixes
              </button>
              <button
                onClick={() => {
                  const s = reviewTask.status?.toLowerCase() || "";
                  let nextStatus = "Completed";
                  if (s === "reviewing script") nextStatus = "Shooting";
                  else if (s === "reviewing shoot") nextStatus = "Editing";

                  handleInlineChange(reviewTask.id, 'status', nextStatus);
                  setReviewTask(null);
                  setReviewNote("");
                }}
                className="flex-1 bg-green-500/10 text-green-500 border border-green-500/30 hover:bg-green-500 hover:text-black font-bold uppercase tracking-widest p-4 rounded-xl transition-colors text-xs"
              >
                Approve & Advance
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ADMIN QUERY MODAL */}
      {activeQueryTask && (
        <div className="fixed inset-0 z-[20000] bg-black/80 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-[#191919] border border-white/10 rounded-2xl w-full max-w-2xl flex flex-col shadow-2xl">
            <div className="flex justify-between items-center p-6 border-b border-white/10 shrink-0">
              <h3 className="text-xl font-bold text-white flex items-center gap-2">💬 Task Support Hub</h3>
              <button onClick={() => setActiveQueryTask(null)} className="text-gray-400 hover:text-white cursor-pointer"><X className="w-5 h-5" /></button>
            </div>

            <div className="p-6 space-y-6">
              <div className="bg-[#111] border border-white/5 rounded-xl p-4">
                <label className="text-[10px] uppercase tracking-widest text-tpc-orange font-bold mb-2 flex items-center justify-between">
                  Employee Query / Message
                </label>
                <div className="w-full bg-black border border-white/10 rounded-lg p-4 text-white min-h-[100px] whitespace-pre-wrap text-sm">
                  {activeQueryTask.employeeQuery ? activeQueryTask.employeeQuery : <span className="italic opacity-50 text-gray-500">No message from employee yet.</span>}
                </div>
              </div>

              <div className="bg-green-500/5 border border-green-500/20 rounded-xl p-4">
                <label className="text-[10px] uppercase tracking-widest text-green-500 font-bold mb-2 flex items-center justify-between">
                  Your Reply / Action
                </label>
                <textarea
                  rows={5}
                  placeholder="Type your reply to the employee here..."
                  value={activeQueryTask.adminReply || ""}
                  onChange={(e) => setActiveQueryTask({ ...activeQueryTask, adminReply: e.target.value })}
                  className="w-full bg-black/50 border border-white/10 rounded-lg p-4 text-white focus:outline-none focus:border-green-500 text-sm resize-none"
                />
              </div>

              <div className="flex justify-end gap-4 pt-2">
                <button type="button" onClick={() => setActiveQueryTask(null)} className="px-6 py-3 rounded-xl font-bold text-gray-400 hover:text-white transition-colors cursor-pointer text-sm">Close</button>
                <button
                  onClick={async () => {
                    handleInlineChange(activeQueryTask.id, 'adminReply', activeQueryTask.adminReply);
                    setActiveQueryTask(null);
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
