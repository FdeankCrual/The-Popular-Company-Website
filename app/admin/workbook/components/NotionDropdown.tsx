"use client";

import { useState, useRef, useEffect } from "react";
import { ChevronDown, Plus, Check } from "lucide-react";

export function NotionDropdown({ 
  value, 
  options, 
  onChange,
  placeholder = "Select...",
  colorMap = {}
}: { 
  value: string, 
  options: string[], 
  onChange: (val: string) => void,
  placeholder?: string,
  colorMap?: Record<string, string>
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filteredOptions = options.filter(opt => opt.toLowerCase().includes(search.toLowerCase()));
  const exactMatch = options.some(opt => opt.toLowerCase() === search.toLowerCase());

  const getColorClass = (val: string) => {
    if (!val) return "bg-gray-500/20 text-gray-400";
    if (colorMap[val.toLowerCase()]) return colorMap[val.toLowerCase()];
    // Fallback pseudo-random color based on string
    const colors = ["bg-blue-500/20 text-blue-500", "bg-purple-500/20 text-purple-500", "bg-pink-500/20 text-pink-500", "bg-indigo-500/20 text-indigo-500", "bg-teal-500/20 text-teal-500"];
    return colors[val.length % colors.length];
  };

  return (
    <div className="relative w-full" ref={dropdownRef}>
      <div 
        onClick={() => setIsOpen(!isOpen)}
        className="w-full min-h-[32px] flex items-center justify-between p-1 px-2 hover:bg-white/5 rounded cursor-pointer transition-colors group"
      >
        <div className="flex-1 overflow-hidden">
          {value ? (
            <span className={`px-2 py-0.5 rounded text-[11px] font-medium truncate inline-block max-w-full ${getColorClass(value)}`}>
              {value}
            </span>
          ) : (
            <span className="text-gray-500 text-sm">{placeholder}</span>
          )}
        </div>
        <ChevronDown className="w-3 h-3 text-gray-500 opacity-0 group-hover:opacity-100 transition-opacity shrink-0 ml-1" />
      </div>

      {isOpen && (
        <div className="absolute z-50 top-full left-0 mt-1 w-56 bg-[#252525] border border-white/10 rounded-lg shadow-xl shadow-black/50 overflow-hidden flex flex-col max-h-64">
          <div className="p-2 border-b border-white/5 shrink-0">
            <input 
              autoFocus
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search or create..."
              className="w-full bg-black/20 border border-transparent focus:border-tpc-orange/50 outline-none rounded p-1.5 text-xs text-white placeholder-gray-500 transition-colors"
            />
          </div>
          
          <div className="overflow-y-auto flex-1 p-1">
            <div className="text-[10px] font-bold text-gray-500 uppercase tracking-widest px-2 py-1.5">Select an option</div>
            {filteredOptions.length === 0 && search === "" && (
              <div className="text-xs text-gray-500 px-2 py-1 italic">No options found. Type to create.</div>
            )}
            
            {filteredOptions.map(opt => (
              <div 
                key={opt}
                onClick={() => { onChange(opt); setIsOpen(false); setSearch(""); }}
                className="px-2 py-1.5 hover:bg-white/5 rounded cursor-pointer flex items-center gap-2"
              >
                <div className={`w-3 h-3 rounded-sm shrink-0 ${getColorClass(opt).split(' ')[0]}`} />
                <span className="text-sm text-gray-200 truncate">{opt}</span>
                {value === opt && <Check className="w-3 h-3 text-white ml-auto" />}
              </div>
            ))}

            {search && !exactMatch && (
              <div 
                onClick={() => { onChange(search); setIsOpen(false); setSearch(""); }}
                className="px-2 py-1.5 hover:bg-white/5 rounded cursor-pointer flex items-center gap-2 mt-1 border-t border-white/5 pt-2"
              >
                <div className="w-5 h-5 bg-tpc-orange/20 rounded flex items-center justify-center shrink-0">
                  <Plus className="w-3 h-3 text-tpc-orange" />
                </div>
                <span className="text-sm text-gray-200 truncate">Create "{search}"</span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
