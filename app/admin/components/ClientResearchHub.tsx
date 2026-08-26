"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { Loader2, Search, Edit3, BookOpen, Share2, Folder, FileText, ChevronRight, ChevronDown, ChevronLeft, Plus, Network, X, Trash2 } from "lucide-react";
import ReactMarkdown from "react-markdown";
import dynamic from 'next/dynamic';

const ForceGraph2D = dynamic(() => import('react-force-graph-2d'), { ssr: false });

type FileNode = {
  name: string;
  type: 'file' | 'folder';
  path: string;
  children?: FileNode[];
  isOpen?: boolean;
};

export default function ClientResearchHub({ initialRoles }: { initialRoles?: string[] }) {
  const canEdit = initialRoles === undefined || initialRoles.some(r => r.toUpperCase().includes("CONTENT WRITER"));

  const [researchData, setResearchData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [clients, setClients] = useState<string[]>([]);
  const [selectedClient, setSelectedClient] = useState<string | null>(null);

  const [selectedFile, setSelectedFile] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'reading' | 'editing' | 'graph'>('reading');
  const [currentMarkdown, setCurrentMarkdown] = useState("");
  const [saveTimeout, setSaveTimeout] = useState<NodeJS.Timeout | null>(null);

  // Tree state
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set());
  const [newClientName, setNewClientName] = useState("");
  const [isAddingClient, setIsAddingClient] = useState(false);

  // New file/folder modals
  const [showNewModal, setShowNewModal] = useState<'file' | 'folder' | null>(null);
  const [newItemName, setNewItemName] = useState("");
  const [newItemParent, setNewItemParent] = useState("");
  const [newItemMonth, setNewItemMonth] = useState("");
  const [newItemYear, setNewItemYear] = useState("2026");

  const [itemToDelete, setItemToDelete] = useState<{ path: string, type: 'file' | 'folder' } | null>(null);

  // Global Hotkeys
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if typing in an input or textarea
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

      if (canEdit && (e.metaKey || e.ctrlKey) && e.key === 'n') {
        e.preventDefault();
        setNewItemParent("");
        setShowNewModal('file');
      }
      if (canEdit && (e.metaKey || e.ctrlKey) && e.key === 'e') {
        e.preventDefault();
        setViewMode(prev => prev === 'editing' ? 'reading' : 'editing');
      }
      if ((e.metaKey || e.ctrlKey) && e.key === 'g') {
        e.preventDefault();
        setViewMode('graph');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [resRes, configRes] = await Promise.all([
        fetch("/api/admin/data?action=getClientResearch"),
        fetch("/api/admin/data?action=getConfig")
      ]);
      
      let configClients: string[] = [];
      if (configRes.ok) {
        const configData = await configRes.json();
        configClients = configData.workbook_settings?.clients || [];
      }

      if (resRes.ok) {
        const rData = await resRes.json();
        if (Array.isArray(rData)) {
          setResearchData(rData);
          const uniqueClients = configClients.length > 0 
            ? [...configClients].sort() 
            : Array.from(new Set(rData.map(r => r.clientName).filter(Boolean))).sort() as string[];
          setClients(uniqueClients);
          if (uniqueClients.length > 0 && !selectedClient) {
            setSelectedClient(uniqueClients[0]);
          }
        }
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const clientFiles = useMemo(() => {
    if (!selectedClient) return [];
    return researchData.filter(r => 
      r.clientName === selectedClient && 
      r.filePath && 
      !r.filePath.endsWith('.json') && 
      !r.filePath.startsWith('_')
    );
  }, [researchData, selectedClient]);

  // Build Tree
  const fileTree = useMemo(() => {
    const root: FileNode[] = [];

    clientFiles.forEach(file => {
      const parts = file.filePath.split('/').filter(Boolean);
      let currentLevel = root;
      let currentPath = "";

      parts.forEach((part: string, index: number) => {
        currentPath += (currentPath ? '/' : '') + part;
        const isFile = index === parts.length - 1;

        let existing = currentLevel.find(n => n.name === part && n.type === (isFile ? 'file' : 'folder'));

        if (!existing) {
          existing = {
            name: part,
            type: isFile ? 'file' : 'folder',
            path: currentPath,
            children: isFile ? undefined : []
          };
          currentLevel.push(existing);
        }

        if (!isFile) {
          currentLevel = existing.children!;
        }
      });
    });

    // Sort folders first, then files
    const sortTree = (nodes: FileNode[]) => {
      nodes.sort((a, b) => {
        if (a.type !== b.type) return a.type === 'folder' ? -1 : 1;
        return a.name.localeCompare(b.name);
      });
      nodes.forEach(n => {
        if (n.children) sortTree(n.children);
      });
    };
    sortTree(root);
    return root;
  }, [clientFiles]);

  useEffect(() => {
    if (selectedClient && clientFiles.length > 0 && !selectedFile) {
      // Auto-select first file only if on desktop
      if (window.innerWidth >= 768) {
        const firstFile = clientFiles.find(f => f.filePath.endsWith('.md'));
        if (firstFile) setSelectedFile(firstFile.filePath);
      }
    }
  }, [selectedClient, clientFiles, selectedFile]);

  useEffect(() => {
    if (selectedClient && selectedFile) {
      const existing = clientFiles.find(r => r.filePath === selectedFile);
      setCurrentMarkdown(existing?.markdownContent || "");
      if (viewMode === 'graph') setViewMode('reading'); // Exit graph view on file select
    }
  }, [selectedFile, selectedClient]); // Removed clientFiles from dependency to avoid overwriting typed content

  const saveToDatabase = async (client: string, path: string, markdown: string) => {
    setSaving(true);
    try {
      await fetch("/api/admin/data", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "updateClientResearch",
          data: {
            clientName: client,
            filePath: path,
            markdownContent: markdown
          }
        })
      });

      setResearchData(prev => {
        const exists = prev.find(p => p.clientName === client && p.filePath === path);
        if (exists) {
          return prev.map(p => (p.clientName === client && p.filePath === path) ? { ...p, markdownContent: markdown } : p);
        }
        return [...prev, { clientName: client, filePath: path, markdownContent: markdown }];
      });
    } catch (e) {
      console.error("Failed to save research", e);
    } finally {
      setSaving(false);
    }
  };

  const handleMarkdownChange = (val: string) => {
    setCurrentMarkdown(val);

    if (saveTimeout) clearTimeout(saveTimeout);

    const timeout = setTimeout(() => {
      if (selectedClient && selectedFile) {
        saveToDatabase(selectedClient, selectedFile, val);
      }
    }, 1500);

    setSaveTimeout(timeout);
  };

  const handleAddClient = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newClientName.trim()) return;
    setIsAddingClient(true);
    // Create an empty "Index.md" for the new client
    await saveToDatabase(newClientName.trim(), "Index.md", `# ${newClientName.trim()} Index\n\nStart here...`);
    setClients(prev => Array.from(new Set([...prev, newClientName.trim()])).sort());
    setSelectedClient(newClientName.trim());
    setSelectedFile("Index.md");
    setNewClientName("");
    setIsAddingClient(false);
  };

  const handleCreateNew = async () => {
    if (!newItemName.trim() || !selectedClient) return;
    
    // If a month and year are selected and we are creating at the root, wrap it in a folder
    let pathPrefix = newItemParent;
    const dateFolder = (newItemMonth && newItemYear) ? `${newItemMonth} ${newItemYear}` : null;
    
    if (!newItemParent && dateFolder) {
      pathPrefix = dateFolder;
    } else if (newItemParent && dateFolder && !newItemParent.startsWith(dateFolder)) {
      pathPrefix = `${dateFolder}/${newItemParent}`;
    }

    let path = pathPrefix ? `${pathPrefix}/${newItemName.trim()}` : newItemName.trim();

    if (showNewModal === 'file' && !path.endsWith('.md')) {
      path += '.md';
    }

    if (showNewModal === 'folder') {
      // Just create a placeholder index inside the folder to make it exist
      path += '/_Index.md';
    }

    await saveToDatabase(selectedClient, path, `# ${newItemName.trim()}`);

    if (showNewModal === 'file') {
      setSelectedFile(path);
      setViewMode('editing');
    }

    setShowNewModal(null);
    setNewItemName("");
    setNewItemParent("");
    setNewItemMonth("");
  };

  const toggleFolder = (path: string) => {
    const next = new Set(expandedFolders);
    if (next.has(path)) next.delete(path);
    else next.add(path);
    setExpandedFolders(next);
  };

  const handleDragStart = (e: React.DragEvent, path: string) => {
    e.dataTransfer.setData("filePath", path);
  };

  const handleDrop = async (e: React.DragEvent, targetFolder: string) => {
    e.preventDefault();
    const oldPath = e.dataTransfer.getData("filePath");
    if (!oldPath || !selectedClient) return;

    const filename = oldPath.split('/').pop();
    const newPath = targetFolder ? `${targetFolder}/${filename}` : filename as string;

    if (oldPath === newPath) return;

    setSaving(true);
    try {
      await fetch("/api/admin/data", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "renameClientResearch",
          data: {
            clientName: selectedClient,
            oldFilePath: oldPath,
            newFilePath: newPath
          }
        })
      });

      setResearchData(prev => {
        return prev.map(p =>
          (p.clientName === selectedClient && p.filePath === oldPath)
            ? { ...p, filePath: newPath }
            : p
        );
      });

      if (selectedFile === oldPath) {
        setSelectedFile(newPath);
      }
    } catch (e) {
      console.error("Rename failed", e);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!itemToDelete || !selectedClient) return;

    setSaving(true);
    try {
      await fetch("/api/admin/data", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "deleteClientResearch",
          data: {
            clientName: selectedClient,
            filePath: itemToDelete.path
          }
        })
      });

      setResearchData(prev => prev.filter(p => {
        if (p.clientName !== selectedClient) return true;
        if (itemToDelete.type === 'file') return p.filePath !== itemToDelete.path;
        return !p.filePath.startsWith(itemToDelete.path + "/");
      }));

      if (itemToDelete.type === 'file' && selectedFile === itemToDelete.path) {
        setSelectedFile(null);
      } else if (itemToDelete.type === 'folder' && selectedFile?.startsWith(itemToDelete.path + "/")) {
        setSelectedFile(null);
      }

    } catch (e) {
      console.error("Delete failed", e);
    } finally {
      setSaving(false);
      setItemToDelete(null);
    }
  };

  // Process wikilinks for markdown
  const processWikilinks = (text: string) => {
    return text.replace(/\[\[(.*?)\]\]/g, (match, p1) => {
      return `[${p1}](wiki://${encodeURIComponent(p1)})`;
    });
  };

  const CustomLink = ({ href, children }: any) => {
    const isExternal = href?.startsWith('http://') || href?.startsWith('https://');

    if (!isExternal) {
      let targetName = decodeURIComponent(href?.replace('wiki://', '') || '');
      targetName = targetName.replace(/^\//, ''); // remove leading slash
      targetName = targetName.replace(/\.md$/, ''); // remove .md suffix

      return (
        <span
          onClick={(e) => {
            e.preventDefault();
            // Find file by name (ignoring path)
            const targetFile = clientFiles.find(f => f.filePath.endsWith(`/${targetName}.md`) || f.filePath === `${targetName}.md`);
            if (targetFile) {
              setSelectedFile(targetFile.filePath);
            } else {
              // Auto create it
              if (canEdit) {
                setNewItemName(targetName);
                setNewItemParent("");
                setShowNewModal('file');
              } else {
                alert("This file does not exist yet.");
              }
            }
          }}
          className="text-tpc-orange hover:underline cursor-pointer font-bold mx-1"
        >
          {children}
        </span>
      );
    }
    return <a href={href} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">{children}</a>;
  };

  // Render Tree
  const renderTree = (nodes: FileNode[], level = 0) => {
    return nodes.map(node => {
      if (node.type === 'folder') {
        const isOpen = expandedFolders.has(node.path);
        return (
          <div key={node.path} className="w-full">
            <div
              className="group flex items-center gap-2 py-1.5 px-2 hover:bg-white/5 rounded cursor-pointer text-gray-300"
              style={{ paddingLeft: `${level * 12 + 8}px` }}
              onClick={() => toggleFolder(node.path)}
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => { e.stopPropagation(); handleDrop(e, node.path); }}
            >
              {isOpen ? <ChevronDown className="w-3 h-3 opacity-50" /> : <ChevronRight className="w-3 h-3 opacity-50" />}
              <Folder className="w-3.5 h-3.5 text-tpc-orange opacity-80" />
              <span className="text-[11px] font-bold truncate">{node.name}</span>
              {canEdit && (
                <div className="ml-auto flex items-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={(e) => { e.stopPropagation(); setItemToDelete({ path: node.path, type: 'folder' }); }}
                    className="hover:bg-red-500/20 p-1 rounded text-red-500/70 hover:text-red-500 transition-colors"
                    title="Delete Folder"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                  <button
                    onClick={(e) => { e.stopPropagation(); setNewItemParent(node.path); setShowNewModal('file'); }}
                    className="hover:bg-white/10 p-1 rounded text-tpc-orange"
                    title="New File in Folder"
                  >
                    <Plus className="w-3 h-3" />
                  </button>
                </div>
              )}
            </div>
            {isOpen && node.children && (
              <div className="w-full">
                {renderTree(node.children, level + 1)}
              </div>
            )}
          </div>
        );
      } else {
        if (node.name === '_Index.md') return null; // hide placeholder index
        return (
          <div
            key={node.path}
            draggable={canEdit}
            onDragStart={(e) => canEdit && handleDragStart(e, node.path)}
            className={`group flex items-center gap-2 py-1.5 px-2 rounded cursor-pointer transition-colors ${selectedFile === node.path ? 'bg-tpc-orange/20 text-tpc-orange' : 'hover:bg-white/5 text-gray-400'}`}
            style={{ paddingLeft: `${level * 12 + 24}px` }}
            onClick={() => setSelectedFile(node.path)}
          >
            <FileText className="w-3 h-3 opacity-50 shrink-0" />
            <span className="text-[11px] truncate">{node.name.replace('.md', '')}</span>
            {canEdit && (
              <button
                onClick={(e) => { e.stopPropagation(); setItemToDelete({ path: node.path, type: 'file' }); }}
                className="ml-auto opacity-0 group-hover:opacity-100 hover:bg-red-500/20 p-1 rounded text-red-500/70 hover:text-red-500 transition-all shrink-0"
                title="Delete File"
              >
                <Trash2 className="w-3 h-3" />
              </button>
            )}
          </div>
        );
      }
    });
  };

  // Build Graph Data
  const graphData = useMemo(() => {
    const nodes = clientFiles.map(f => ({
      id: f.filePath,
      name: f.filePath.split('/').pop()?.replace('.md', ''),
      val: 1
    }));

    const links: any[] = [];
    clientFiles.forEach(f => {
      const matches = f.markdownContent?.match(/\[\[(.*?)\]\]/g) || [];
      matches.forEach((m: string) => {
        const targetName = m.replace(/\[\[|\]\]/g, '');
        const targetFile = clientFiles.find(file => file.filePath.endsWith(`/${targetName}.md`) || file.filePath === `${targetName}.md`);
        if (targetFile) {
          links.push({ source: f.filePath, target: targetFile.filePath });
        }
      });
    });

    return { nodes, links };
  }, [clientFiles]);


  if (loading) {
    return (
      <div className="flex justify-center items-center h-full min-h-dvh text-gray-500 bg-[#191919]">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex flex-col md:flex-row h-full bg-[#191919] text-[#D4D4D4] overflow-hidden relative min-h-0">

      {/* SIDEBAR: Vault/Client Selector & File Tree */}
      <div className={`w-full md:w-72 bg-[#111] border-b md:border-r border-white/10 flex-col shrink-0 h-full ${selectedFile ? 'hidden md:flex' : 'flex'}`}>
        {/* Vault Selector */}
        <div className="p-2 md:p-4 border-b border-white/10 shrink-0 bg-[#0a0a0a]">
          <h2 className="hidden md:block text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-2">Active Vault</h2>
          <select
            value={selectedClient || ""}
            onChange={e => {
              setSelectedClient(e.target.value);
              setSelectedFile(null);
            }}
            className="w-full bg-black/50 border border-white/10 rounded-lg p-2 text-sm text-tpc-orange font-bold focus:outline-none focus:border-tpc-orange"
          >
            {clients.map(c => <option key={c} value={c}>{c}</option>)}
          </select>

          {canEdit && (
            <form onSubmit={handleAddClient} className="flex gap-2 mt-2">
              <input
                type="text"
                placeholder="New client..."
                value={newClientName}
                onChange={e => setNewClientName(e.target.value)}
                className="flex-1 bg-black/50 border border-white/10 rounded px-2 py-1.5 text-[10px] text-white focus:outline-none"
              />
              <button
                type="submit"
                disabled={isAddingClient || !newClientName.trim()}
                className="bg-white/5 hover:bg-white/10 text-white px-2 py-1.5 rounded text-[10px] font-bold disabled:opacity-50"
              >
                Add
              </button>
            </form>
          )}
        </div>

        {/* File Tree Controls */}
        <div
          className="p-2 border-b border-white/10 flex justify-between items-center bg-white/5 shrink-0"
          onDragOver={(e) => canEdit && e.preventDefault()}
          onDrop={(e) => canEdit && handleDrop(e, "")}
        >
          <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400 pl-2">Files</span>
          {canEdit && (
            <div className="flex gap-1">
              <button onClick={() => { setNewItemParent(""); setShowNewModal('file'); }} className="p-1.5 hover:bg-white/10 rounded text-gray-400 hover:text-white" title="New File">
                <FileText className="w-3.5 h-3.5" />
              </button>
              <button onClick={() => { setNewItemParent(""); setShowNewModal('folder'); }} className="p-1.5 hover:bg-white/10 rounded text-gray-400 hover:text-white" title="New Folder">
                <Folder className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>

        {/* Tree Render */}
        <div className="flex-1 overflow-y-auto p-2">
          {clientFiles.length === 0 ? (
            <p className="text-gray-500 text-xs italic p-4 text-center">No files in this vault.</p>
          ) : (
            renderTree(fileTree)
          )}
        </div>
      </div>

      {/* MAIN EDITOR PANE */}
      <div className={`flex-1 flex-col h-full overflow-hidden bg-[#151515] min-w-0 ${selectedFile ? 'flex' : 'hidden md:flex'}`}>
        {selectedClient ? (
          <>
            <div className="py-2 md:py-0 border-b border-white/10 flex flex-col md:flex-row items-start md:items-center justify-between px-3 md:px-6 bg-[#111] shrink-0 gap-2 md:gap-0 overflow-y-auto">
              <div className="flex flex-col justify-center w-full md:w-auto">
                <button 
                  onClick={() => setSelectedFile(null)}
                  className="md:hidden flex items-center gap-1 text-[10px] uppercase font-black text-tpc-orange bg-tpc-orange/10 px-2 py-1.5 rounded mb-1 w-fit hover:bg-tpc-orange/20 transition-colors"
                >
                  <ChevronLeft className="w-3 h-3" /> Back
                </button>
                <h1 className="text-base md:text-sm font-bold text-white truncate max-w-full md:max-w-md">
                  {selectedFile ? selectedFile : "No file selected"}
                </h1>
                <span className="text-[10px] text-gray-500 font-mono hidden md:block mt-1">
                  {selectedClient} Vault
                </span>
              </div>

              <div className="flex items-center justify-between w-full md:w-auto gap-4 mt-2 md:mt-0">
                {saving && (
                  <span className="text-[10px] text-gray-500 uppercase tracking-widest flex items-center gap-2">
                    <Loader2 className="w-3 h-3 animate-spin" /> Saving...
                  </span>
                )}

                <div className="flex bg-black/50 border border-white/10 rounded p-1 w-full md:w-auto justify-between md:justify-start">
                  <button
                    onClick={() => setViewMode('reading')}
                    className={`flex-1 md:flex-none px-3 py-2 md:py-1.5 rounded flex items-center justify-center gap-1.5 text-[10px] font-bold uppercase tracking-widest transition-colors ${viewMode === 'reading' ? 'bg-white/10 text-white' : 'text-gray-500 hover:text-gray-300'}`}
                  >
                    <BookOpen className="w-3 h-3 md:w-3 md:h-3" /> Read
                  </button>
                  {canEdit && (
                    <button
                      onClick={() => setViewMode('editing')}
                      className={`flex-1 md:flex-none px-3 py-2 md:py-1.5 rounded flex items-center justify-center gap-1.5 text-[10px] font-bold uppercase tracking-widest transition-colors ${viewMode === 'editing' ? 'bg-white/10 text-white' : 'text-gray-500 hover:text-gray-300'}`}
                    >
                      <Edit3 className="w-3 h-3 md:w-3 md:h-3" /> Edit
                    </button>
                  )}
                  <button
                    onClick={() => setViewMode('graph')}
                    className={`flex-1 md:flex-none px-3 py-2 md:py-1.5 rounded flex items-center justify-center gap-1.5 text-[10px] font-bold uppercase tracking-widest transition-colors ${viewMode === 'graph' ? 'bg-tpc-orange text-black' : 'text-gray-500 hover:text-gray-300'}`}
                  >
                    <Network className="w-3 h-3 md:w-3 md:h-3" /> Graph
                  </button>
                </div>
              </div>
            </div>

            <div className="flex-1 overflow-hidden relative">
              {viewMode === 'graph' ? (
                <div className="w-full h-full bg-[#0a0a0a]">
                  <ForceGraph2D
                    graphData={graphData}
                    nodeLabel="name"
                    nodeColor={() => '#FF4500'}
                    linkColor={() => 'rgba(255,255,255,0.2)'}
                    backgroundColor="#0a0a0a"
                    onNodeClick={(node: any) => {
                      setSelectedFile(node.id);
                      setViewMode('reading');
                    }}
                  />
                  <div className="absolute top-4 left-4 text-xs font-mono text-gray-500 pointer-events-none">
                    Scroll to zoom • Drag to pan • Click node to open
                  </div>
                </div>
              ) : !selectedFile ? (
                <div className="flex h-full items-center justify-center text-gray-600 font-mono text-xs">
                  Create or select a file to begin
                </div>
              ) : viewMode === 'editing' ? (
                <textarea
                  value={currentMarkdown}
                  onChange={(e) => handleMarkdownChange(e.target.value)}
                  placeholder="# Start typing...\nUse [[Note Name]] to link to other notes!"
                  className="w-full h-full p-8 md:p-12 bg-transparent text-gray-300 focus:outline-none resize-none font-mono text-sm leading-relaxed"
                  style={{ lineHeight: '1.8' }}
                />
              ) : (
                <div className="h-full overflow-y-auto p-8 md:p-12">
                  <article className="prose prose-invert prose-orange max-w-3xl mx-auto font-sans leading-relaxed">
                    <ReactMarkdown 
                      components={{ a: CustomLink }}
                      urlTransform={(url: string) => url}
                    >
                      {processWikilinks(currentMarkdown)}
                    </ReactMarkdown>
                  </article>
                </div>
              )}
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-gray-500">
            <Share2 className="w-16 h-16 mb-4 opacity-20" />
            <p className="uppercase tracking-widest text-xs font-bold">Select a Vault</p>
          </div>
        )}
      </div>

      {/* NEW ITEM MODAL */}
      {showNewModal && (
        <div className="fixed inset-0 bg-black/80 z-[20000] flex items-center justify-center backdrop-blur-sm">
          <div className="bg-[#191919] border border-white/10 p-6 rounded-xl w-full max-w-sm">
            <h3 className="text-lg font-bold text-white mb-4">
              Create New {showNewModal === 'file' ? 'Note' : 'Folder'}
            </h3>
            {newItemParent && (
              <p className="text-[10px] text-gray-400 font-mono mb-4">In: {newItemParent}</p>
            )}
            
            <div className="flex flex-col gap-3 mb-4">
              <div className="flex gap-2">
                <select
                  value={newItemMonth}
                  onChange={e => setNewItemMonth(e.target.value)}
                  className="flex-1 bg-black/50 border border-white/10 rounded-lg px-4 py-3 text-sm text-white focus:outline-none focus:border-tpc-orange"
                >
                  <option value="">No Month</option>
                  {["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"].map(m => (
                    <option key={m} value={m}>{m}</option>
                  ))}
                </select>
                
                <select
                  value={newItemYear}
                  onChange={e => setNewItemYear(e.target.value)}
                  disabled={!newItemMonth}
                  className="flex-1 bg-black/50 border border-white/10 rounded-lg px-4 py-3 text-sm text-white focus:outline-none focus:border-tpc-orange disabled:opacity-50"
                >
                  {["2026", "2027", "2028", "2029", "2030"].map(y => (
                    <option key={y} value={y}>{y}</option>
                  ))}
                </select>
              </div>

              <input
                autoFocus
                type="text"
                placeholder="Name..."
                value={newItemName}
                onChange={e => setNewItemName(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleCreateNew()}
                className="w-full bg-black/50 border border-white/10 rounded-lg px-4 py-3 text-sm text-white focus:outline-none focus:border-tpc-orange"
              />
            </div>
            <div className="flex justify-end gap-2">
              <button onClick={() => setShowNewModal(null)} className="px-4 py-2 rounded text-xs font-bold text-gray-400 hover:text-white">Cancel</button>
              <button onClick={handleCreateNew} className="px-4 py-2 rounded text-xs font-bold bg-tpc-orange text-black">Create</button>
            </div>
          </div>
        </div>
      )}

      {/* DELETE CONFIRMATION MODAL */}
      {itemToDelete && (
        <div className="fixed inset-0 bg-black/80 z-[20000] flex items-center justify-center backdrop-blur-sm">
          <div className="bg-[#191919] border border-red-500/30 p-6 rounded-xl w-full max-w-sm">
            <h3 className="text-lg font-bold text-white mb-2 flex items-center gap-2">
              <Trash2 className="w-5 h-5 text-red-500" />
              Delete {itemToDelete.type === 'file' ? 'File' : 'Folder'}?
            </h3>
            <p className="text-xs text-gray-400 mb-6 leading-relaxed">
              Are you sure you want to delete <span className="text-white font-mono bg-white/10 px-1 rounded">{itemToDelete.path}</span>?
              {itemToDelete.type === 'folder' && " This will permanently delete ALL files inside this folder!"}
            </p>
            <div className="flex justify-end gap-2">
              <button onClick={() => setItemToDelete(null)} className="px-4 py-2 rounded text-xs font-bold text-gray-400 hover:text-white">Cancel</button>
              <button onClick={handleDelete} disabled={saving} className="px-4 py-2 rounded text-xs font-bold bg-red-500 text-white hover:bg-red-600 disabled:opacity-50">
                {saving ? "Deleting..." : "Yes, Delete"}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
