"use client";

import React, { useState, useEffect } from "react";
import { X, Folder, UploadCloud, FileText, RefreshCw, Loader2, ExternalLink, Download, Trash2 } from "lucide-react";

interface FileManagerModalProps {
  task: any;
  currentUserRoles: string[];
  onClose: () => void;
  onUpdateTask: (taskId: string, field: string, value: string) => void;
}

export default function FileManagerModal({ task, currentUserRoles, onClose, onUpdateTask }: FileManagerModalProps) {
  const [uploadingState, setUploadingState] = useState<{ progress: number; type: "doc" | "drive"; filename: string; current: number; total: number } | null>(null);
  const [driveFiles, setDriveFiles] = useState<any[]>([]);
  const [loadingFiles, setLoadingFiles] = useState(false);

  // Fetch files on mount
  useEffect(() => {
    if (task) {
      fetchDriveFiles();
    }
  }, [task?.id]);

  const fetchDriveFiles = async (overrideDocUrl?: string, overrideFolderUrl?: string) => {
    if (!task) return;
    setLoadingFiles(true);
    setDriveFiles([]);
    try {
      const params = new URLSearchParams();
      const currentDocUrl = overrideDocUrl !== undefined ? overrideDocUrl : task.docLink;
      const currentFolderUrl = overrideFolderUrl !== undefined ? overrideFolderUrl : task.driveA;
      
      if (currentDocUrl) {
        params.append("docUrl", currentDocUrl);
      }
      if (currentFolderUrl) {
        params.append("folderUrl", currentFolderUrl);
      }
      if (!currentDocUrl && !currentFolderUrl) {
        setLoadingFiles(false);
        return;
      }
      const res = await fetch(`/api/drive/list-files?${params}`);
      if (res.ok) {
        const data = await res.json();
        if (data.tree) {
          setDriveFiles(data.tree);
        }
      }
    } catch (err) {
      console.error("Failed to fetch drive files", err);
    } finally {
      setLoadingFiles(false);
    }
  };

  const uploadFileToDrive = async (
    file: File,
    categoryName: string,
    type: "docLink" | "driveA",
    current: number,
    total: number,
    currentDriveA: string
  ) => {
    return new Promise((resolve, reject) => {
      setUploadingState({ progress: 0, type: type === "docLink" ? "doc" : "drive", filename: file.name, current, total });

      const initRes = fetch("/api/drive/init-upload", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fileName: file.name,
          mimeType: file.type || "application/octet-stream",
          yearName: task.year || "General",
          monthName: task.month || "General",
          clientName: task.client || "Unknown Client",
          taskName: task.name || "Untitled Task",
          categoryName,
          taskFolderUrl: currentDriveA || "",
        }),
      })
        .then((res) => res.json())
        .then(async (data) => {
          if (!data.uploadUrl) throw new Error("Init failed");
          const { uploadUrl, folderId } = data;

          const CHUNK_SIZE = 1024 * 1024;
          let offset = 0;

          const reader = new FileReader();
          reader.onload = async (e) => {
            const buffer = e.target?.result as ArrayBuffer;

            while (offset < file.size) {
              const chunk = buffer.slice(offset, offset + CHUNK_SIZE);
              const end = Math.min(offset + chunk.byteLength - 1, file.size - 1);

              try {
                const uploadRes = await fetch(uploadUrl, {
                  method: "PUT",
                  headers: {
                    "Content-Range": `bytes ${offset}-${end}/${file.size}`,
                  },
                  body: chunk,
                });

                if (!uploadRes.ok && uploadRes.status !== 308) throw new Error("Chunk failed");

                offset += chunk.byteLength;
                const percent = Math.round((offset / file.size) * 100);
                setUploadingState({ progress: percent, type: type === "docLink" ? "doc" : "drive", filename: file.name, current, total });

                if (uploadRes.status === 200 || uploadRes.status === 201) {
                  const fileData = await uploadRes.json();
                  const fileId = fileData.id;
                  const fileLink = `https://drive.google.com/file/d/${fileId}/view`;
                  const driveLink = type === "driveA" && folderId ? `https://drive.google.com/drive/folders/${folderId}` : fileLink;

                  onUpdateTask(task.id, type, driveLink);
                  resolve(driveLink);
                  return;
                }
              } catch (e) {
                reject(e);
                return;
              }
            }
          };
          reader.readAsArrayBuffer(file);
        })
        .catch((e) => {
          reject(e);
        });
    });
  };

  const handleBulkUpload = async (files: FileList, categoryName: string, type: "docLink" | "driveA") => {
    const fileArray = Array.from(files);
    let currentDriveA = task.driveA;
    for (let i = 0; i < fileArray.length; i++) {
      try {
        const newDriveA = await uploadFileToDrive(fileArray[i], categoryName, type, i + 1, fileArray.length, currentDriveA);
        if (newDriveA && type === "driveA") {
          currentDriveA = newDriveA as string;
        }
      } catch (err) {
        console.error(`Failed to upload ${fileArray[i].name}`, err);
        alert(`Failed to upload ${fileArray[i].name}`);
      }
    }
    setUploadingState(null);
    fetchDriveFiles(undefined, currentDriveA);
  };

  const downloadAll = (files: any[]) => {
    if (!files || files.length === 0) return;
    files.forEach(file => {
      if (file.webContentLink) {
        const a = document.createElement('a');
        a.href = file.webContentLink;
        a.download = file.name;
        a.target = '_blank';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
      } else {
        window.open(file.webViewLink, '_blank');
      }
    });
  };

  const deleteFile = async (fileId: string) => {
    if (!confirm("Are you sure you want to permanently delete this file?")) return;
    try {
      setLoadingFiles(true);
      const res = await fetch('/api/drive/delete-file', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fileId })
      });
      if (!res.ok) throw new Error("Delete failed");
      await fetchDriveFiles();
    } catch (err) {
      console.error(err);
      alert("Failed to delete file.");
      setLoadingFiles(false);
    }
  };

  const roles = currentUserRoles || [];
  const isAdmin = roles.some((r) => r === "SUPER_ADMIN" || r.startsWith("ADMIN_"));
  
  const allowed = new Set<string>();
  if (isAdmin) {
    allowed.add("Raw Videos");
    allowed.add("Final Videos");
    allowed.add("Scripts");
    allowed.add("Thumbnails");
  } else {
    if (roles.includes("EDITOR") || roles.includes("AI VIDEO CREATOR")) {
      allowed.add("Raw Videos");
      allowed.add("Final Videos");
    }
    if (roles.includes("VIDEOGRAPHER")) {
      allowed.add("Raw Videos");
    }
    if (roles.includes("GRAPHIC DESIGNER")) {
      allowed.add("Thumbnails");
    }
    if (roles.includes("CONTENT WRITER")) {
      allowed.add("Scripts");
    }
  }

  const allowedArr = Array.from(allowed);

  return (
    <div className="fixed inset-0 z-[100000] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="bg-[#111] border border-white/10 rounded-2xl p-6 w-full max-w-lg relative max-h-[90vh] flex flex-col shadow-2xl">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-white transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
        <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2 shrink-0">
          <Folder className="w-5 h-5 text-tpc-orange" />
          Manage Files: {task.name}
        </h2>

        <div className="overflow-y-auto custom-scrollbar pr-2 flex-1 space-y-6">
          {/* Existing Links Section */}
          <div className="space-y-3">
            <div className="flex gap-2">
              <input 
                type="text" 
                placeholder="Script / Doc URL..." 
                value={task.docLink || ""} 
                onChange={(e) => onUpdateTask(task.id, 'docLink', e.target.value)}
                className="flex-1 bg-black/50 border border-white/10 rounded-lg p-3 text-xs text-white focus:border-tpc-orange outline-none"
              />
              {task.docLink && (
                <a href={task.docLink} target="_blank" rel="noopener noreferrer" className="bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 p-3 rounded-lg border border-blue-500/30 flex items-center justify-center transition-colors">
                  <FileText className="w-4 h-4" />
                </a>
              )}
            </div>
            <div className="flex gap-2">
              <input 
                type="text" 
                placeholder="Google Drive Folder URL..." 
                value={task.driveA || ""} 
                onChange={(e) => onUpdateTask(task.id, 'driveA', e.target.value)}
                className="flex-1 bg-black/50 border border-white/10 rounded-lg p-3 text-xs text-white focus:border-tpc-orange outline-none"
              />
              {task.driveA && (
                <a href={task.driveA} target="_blank" rel="noopener noreferrer" className="bg-white/5 hover:bg-white/10 text-white p-3 rounded-lg border border-white/10 flex items-center justify-center transition-colors">
                  <Folder className="w-4 h-4" />
                </a>
              )}
            </div>
          </div>

          {/* Upload Section */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest border-b border-white/10 pb-2">Quick Upload</h3>
            {allowedArr.length === 0 ? (
              <div className="text-gray-500 text-sm italic">
                You do not have permission to upload files.
              </div>
            ) : (
              allowedArr.map((category) => (
                <div
                  key={category}
                  className="flex items-center justify-between bg-black/50 border border-white/5 p-4 rounded-xl"
                >
                  <span className="text-sm font-medium text-white">{category}</span>
                  <label className="flex items-center gap-2 px-3 py-1.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded cursor-pointer transition-colors text-xs text-white">
                    <UploadCloud className="w-3 h-3" />
                    Upload
                    <input
                      type="file"
                      multiple
                      className="hidden"
                      onChange={(e) => {
                        if (e.target.files && e.target.files.length > 0) {
                          handleBulkUpload(
                            e.target.files,
                            category,
                            category === "Scripts" ? "docLink" : "driveA"
                          );
                        }
                      }}
                    />
                  </label>
                </div>
              ))
            )}

            {uploadingState && (
              <div className="mt-4 p-4 border border-tpc-orange/30 bg-tpc-orange/5 rounded-xl">
                <div className="flex justify-between text-xs text-white mb-2">
                  <span className="truncate max-w-[200px]" title={uploadingState.filename}>
                    Uploading ({uploadingState.current}/{uploadingState.total}): {uploadingState.filename}
                  </span>
                  <span>{uploadingState.progress}%</span>
                </div>
                <div className="w-full h-1.5 bg-black rounded-full overflow-hidden">
                  <div
                    className="h-full bg-tpc-orange transition-all duration-300"
                    style={{ width: `${uploadingState.progress}%` }}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Files Browser Section */}
          <div className="border-t border-white/10 pt-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                <FileText className="w-4 h-4 text-tpc-orange" />
                Files in Drive
              </h3>
              <button
                onClick={fetchDriveFiles}
                className="text-gray-400 hover:text-white transition-colors"
                title="Refresh Files"
              >
                <RefreshCw className={`w-4 h-4 ${loadingFiles ? "animate-spin" : ""}`} />
              </button>
            </div>

            {loadingFiles ? (
              <div className="flex justify-center py-6">
                <Loader2 className="w-6 h-6 text-tpc-orange animate-spin" />
              </div>
            ) : driveFiles.length === 0 ? (
              <div className="text-center py-6 text-sm text-gray-500 bg-white/5 rounded-xl border border-white/5">
                No files found. Paste a link above or upload something!
              </div>
            ) : (
              <div className="space-y-4">
                {driveFiles.map((category: any) => (
                  <div
                    key={category.id}
                    className="bg-black/50 border border-white/5 rounded-xl overflow-hidden"
                  >
                    <div className="bg-white/5 px-4 py-2 font-semibold text-sm text-gray-300 flex items-center gap-2 border-b border-white/5">
                      <Folder className="w-4 h-4 text-tpc-orange" />
                      {category.name}
                      <span className="text-xs font-normal text-gray-500 bg-black px-2 py-0.5 rounded-full ml-auto">
                        {category.files?.length || 0} files
                      </span>
                      {category.files && category.files.length > 0 && (
                        <button 
                          onClick={() => downloadAll(category.files)}
                          className="ml-2 flex items-center gap-1 text-[10px] uppercase tracking-wider bg-tpc-orange/20 text-tpc-orange hover:bg-tpc-orange hover:text-black px-2 py-1 rounded transition-colors font-bold"
                        >
                          <Download className="w-3 h-3" /> All
                        </button>
                      )}
                    </div>
                    <div className="p-2 space-y-1">
                      {category.files && category.files.length > 0 ? (
                        category.files.map((file: any) => (
                          <div key={file.id} className="flex items-center gap-2 p-2 hover:bg-white/5 rounded-lg transition-colors group">
                            <a
                              href={file.webViewLink}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center gap-3 flex-1 overflow-hidden"
                            >
                              {file.thumbnailLink ? (
                                <img
                                  src={file.thumbnailLink}
                                  alt="Thumb"
                                  className="w-8 h-8 object-cover rounded shadow-sm border border-white/10 shrink-0"
                                />
                              ) : (
                                <img src={file.iconLink} alt="Icon" className="w-5 h-5 ml-1.5 opacity-80 shrink-0" />
                              )}
                              <span className="text-sm text-gray-300 group-hover:text-white truncate">
                                {file.name}
                              </span>
                              <ExternalLink className="w-3 h-3 text-gray-500 group-hover:text-tpc-orange opacity-0 group-hover:opacity-100 transition-all shrink-0 ml-2" />
                            </a>
                            
                            <div className="flex items-center gap-1 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                              {file.webContentLink && (
                                <a 
                                  href={file.webContentLink} 
                                  download={file.name}
                                  target="_blank"
                                  title="Download File"
                                  className="p-1.5 text-gray-400 hover:text-white hover:bg-white/10 rounded"
                                >
                                  <Download className="w-4 h-4" />
                                </a>
                              )}
                              {isAdmin && (
                                <button 
                                  onClick={() => deleteFile(file.id)}
                                  title="Permanently Delete File"
                                  className="p-1.5 text-gray-400 hover:text-red-400 hover:bg-red-500/10 rounded"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              )}
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="text-xs text-gray-500 italic p-3 text-center">Empty</div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="mt-4 pt-4 border-t border-white/5 text-[10px] text-gray-500 text-center shrink-0">
          Files are automatically organized in Google Drive under:<br />
          <span className="font-mono text-gray-400">TPC Website 2026 / {task.year || "General"} / {task.month || "General"} / {task.client || "Unknown"} / {task.name || "Untitled"}</span>
        </div>
      </div>
    </div>
  );
}
