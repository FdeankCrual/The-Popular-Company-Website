"use client";

import React, { useState, useEffect } from "react";
import { X, Folder, UploadCloud, FileText, RefreshCw, Loader2, ExternalLink } from "lucide-react";

interface FileManagerModalProps {
  task: any;
  currentUserRoles: string[];
  onClose: () => void;
  onUpdateTask: (taskId: string, field: string, value: string) => void;
}

export default function FileManagerModal({ task, currentUserRoles, onClose, onUpdateTask }: FileManagerModalProps) {
  const [uploadingState, setUploadingState] = useState<{ progress: number; type: "doc" | "drive" } | null>(null);
  const [driveFiles, setDriveFiles] = useState<any[]>([]);
  const [loadingFiles, setLoadingFiles] = useState(false);

  // Fetch files on mount
  useEffect(() => {
    if (task) {
      fetchDriveFiles();
    }
  }, [task?.id]);

  const fetchDriveFiles = async () => {
    if (!task) return;
    setLoadingFiles(true);
    setDriveFiles([]);
    try {
      const params = new URLSearchParams();
      if (task.docLink) {
        params.append("docUrl", task.docLink);
      }
      if (task.driveA) {
        params.append("folderUrl", task.driveA);
      }
      if (!task.docLink && !task.driveA) {
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
    type: "docLink" | "driveA"
  ) => {
    return new Promise((resolve, reject) => {
      setUploadingState({ progress: 0, type: type === "docLink" ? "doc" : "drive" });

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
        }),
      })
        .then((res) => res.json())
        .then(async (data) => {
          if (!data.success || !data.uploadUrl) throw new Error("Init failed");
          const { uploadUrl, fileId, folderId } = data;

          const CHUNK_SIZE = 1024 * 1024;
          let offset = 0;

          const reader = new FileReader();
          reader.onload = async (e) => {
            const buffer = e.target?.result as ArrayBuffer;

            while (offset < file.size) {
              const chunk = buffer.slice(offset, offset + CHUNK_SIZE);
              const end = Math.min(offset + chunk.byteLength - 1, file.size - 1);

              try {
                const uploadRes = await fetch("/api/drive/upload-chunk", {
                  method: "POST",
                  headers: {
                    "Content-Type": "application/json",
                  },
                  body: JSON.stringify({
                    uploadUrl,
                    chunk: Array.from(new Uint8Array(chunk)),
                    contentRange: `bytes ${offset}-${end}/${file.size}`,
                  }),
                });

                if (!uploadRes.ok && uploadRes.status !== 308) throw new Error("Chunk failed");

                offset += chunk.byteLength;
                const percent = Math.round((offset / file.size) * 100);
                setUploadingState({ progress: percent, type: type === "docLink" ? "doc" : "drive" });

                if (uploadRes.status === 200 || uploadRes.status === 201) {
                  const fileLink = `https://drive.google.com/file/d/${fileId}/view`;
                  const driveLink = type === "driveA" && folderId ? `https://drive.google.com/drive/folders/${folderId}` : fileLink;

                  onUpdateTask(task.id, type, driveLink);
                  fetchDriveFiles();
                  resolve(driveLink);
                  setTimeout(() => setUploadingState(null), 1000);
                  return;
                }
              } catch (e) {
                setUploadingState(null);
                reject(e);
                return;
              }
            }
          };
          reader.readAsArrayBuffer(file);
        })
        .catch((e) => {
          setUploadingState(null);
          reject(e);
        });
    });
  };

  const roles = currentUserRoles || [];
  const allowed = new Set<string>();
  if (roles.some((r) => r === "SUPER_ADMIN" || r.startsWith("ADMIN_"))) {
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="bg-[#111] border border-white/10 rounded-2xl p-6 w-full max-w-lg relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-white transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
        <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
          <Folder className="w-5 h-5 text-tpc-orange" />
          Manage Files: {task.name}
        </h2>

        {/* Existing Links Section */}
        <div className="mb-6 space-y-3">
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
                    className="hidden"
                    onChange={(e) => {
                      if (e.target.files?.[0]) {
                        uploadFileToDrive(
                          e.target.files[0],
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
                <span>Uploading to Google Drive...</span>
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
        <div className="mt-8 border-t border-white/10 pt-6">
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
            <div className="space-y-4 max-h-[250px] overflow-y-auto pr-2 custom-scrollbar">
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
                  </div>
                  <div className="p-2 space-y-1">
                    {category.files && category.files.length > 0 ? (
                      category.files.map((file: any) => (
                        <a
                          key={file.id}
                          href={file.webViewLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-3 p-2 hover:bg-white/5 rounded-lg transition-colors group"
                        >
                          {file.thumbnailLink ? (
                            <img
                              src={file.thumbnailLink}
                              alt="Thumb"
                              className="w-8 h-8 object-cover rounded shadow-sm border border-white/10"
                            />
                          ) : (
                            <img src={file.iconLink} alt="Icon" className="w-5 h-5 ml-1.5 opacity-80" />
                          )}
                          <span className="text-sm text-gray-300 group-hover:text-white truncate flex-1">
                            {file.name}
                          </span>
                          <ExternalLink className="w-3.5 h-3.5 text-gray-500 group-hover:text-tpc-orange opacity-0 group-hover:opacity-100 transition-all" />
                        </a>
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

        <div className="mt-6 text-[10px] text-gray-500 text-center">
          Files are automatically organized in Google Drive under:<br />
          <span className="font-mono text-gray-400">TPC Website 2026 / {task.year || "General"} / {task.month || "General"} / {task.client || "Unknown"} / {task.name || "Untitled"}</span>
        </div>
      </div>
    </div>
  );
}
