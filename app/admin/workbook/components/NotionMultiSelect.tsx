"use client";

import { useState, useRef, useEffect } from "react";
import { Plus, Check, X } from "lucide-react";

export function NotionMultiSelect({ 
  value, // comma separated string e.g. "Garv, Dhruv"
  options, 
  onChange,
  placeholder = "Empty"
}: { 
  value: string, 
  options: string[], 
  onChange: (val: string) => void,
  placeholder?: string
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Parse comma separated values
  const selectedValues = value ? value.split(",").map(s => s.trim()).filter(Boolean) : [];

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

  const toggleValue = (val: string) => {
    if (selectedValues.includes(val)) {
      onChange(selectedValues.filter(v => v !== val).join(", "));
    } else {
      onChange([...selectedValues, val].join(", "));
    }
    setSearch("");
  };

  const removeValue = (e: React.MouseEvent, val: string) => {
    e.stopPropagation();
    onChange(selectedValues.filter(v => v !== val).join(", "));
  };

  return (
    <div className="relative w-full" ref={dropdownRef}>
      <div 
        onClick={() => setIsOpen(!isOpen)}
        className="w-full min-h-[32px] flex items-center justify-start flex-wrap gap-1 p-1 hover:bg-white/5 rounded cursor-pointer transition-colors"
      >
        {selectedValues.length > 0 ? (
          selectedValues.map(val => (
            <span key={val} className="flex items-center gap-1 px-1.5 py-0.5 rounded text-[11px] font-medium bg-white/10 text-gray-200">
              {val}
              <button onClick={(e) => removeValue(e, val)} className="hover:text-red-400 text-gray-400 focus:outline-none">
                <X className="w-3 h-3" />
              </button>
            </span>
          ))
        ) : (
          <span className="text-gray-500 text-sm px-1">{placeholder}</span>
        )}
      </div>

      {isOpen && (
        <div className="absolute z-50 top-full left-0 mt-1 w-56 bg-[#252525] border border-white/10 rounded-lg shadow-xl shadow-black/50 overflow-hidden flex flex-col max-h-64">
          <div className="p-2 border-b border-white/5 shrink-0">
            <input 
              autoFocus
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search or add person..."
              className="w-full bg-black/20 border border-transparent focus:border-tpc-orange/50 outline-none rounded p-1.5 text-xs text-white placeholder-gray-500 transition-colors"
            />
          </div>
          
          <div className="overflow-y-auto flex-1 p-1">
            <div className="text-[10px] font-bold text-gray-500 uppercase tracking-widest px-2 py-1.5">Select options</div>
            
            {filteredOptions.map(opt => {
              const isSelected = selectedValues.includes(opt);
              return (
                <div 
                  key={opt}
                  onClick={() => toggleValue(opt)}
                  className="px-2 py-1.5 hover:bg-white/5 rounded cursor-pointer flex items-center gap-2"
                >
                  <div className={`w-3 h-3 rounded flex items-center justify-center shrink-0 border ${isSelected ? 'bg-blue-500 border-blue-500' : 'border-gray-500'}`}>
                    {isSelected && <Check className="w-2.5 h-2.5 text-white" />}
                  </div>
                  <span className="text-sm text-gray-200 truncate">{opt}</span>
                </div>
              );
            })}

            {search && !exactMatch && (
              <div 
                onClick={() => toggleValue(search)}
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
