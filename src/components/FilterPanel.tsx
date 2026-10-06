import React, { useState, useRef, useEffect } from 'react';
import { Filter, ChevronDown, ChevronUp } from 'lucide-react';

export interface FilterGroup {
  id: string;
  label: string;
  options: string[];
  selectedValues: string[];
}

interface FilterPanelProps {
  groups: FilterGroup[];
  onApply: (newGroups: FilterGroup[]) => void;
}

export const FilterPanel: React.FC<FilterPanelProps> = ({ groups, onApply }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [localGroups, setLocalGroups] = useState<FilterGroup[]>(groups);
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>({});
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setLocalGroups(groups);
  }, [groups, isOpen]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const toggleGroup = (id: string) => {
    setExpandedGroups(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const handleCheckboxChange = (groupId: string, option: string, checked: boolean) => {
    setLocalGroups(prev => prev.map(g => {
      if (g.id === groupId) {
        const newSelected = checked 
          ? [...g.selectedValues, option]
          : g.selectedValues.filter(v => v !== option);
        return { ...g, selectedValues: newSelected };
      }
      return g;
    }));
  };

  const handleClearAll = () => {
    setLocalGroups(prev => prev.map(g => ({ ...g, selectedValues: [] })));
  };

  const handleApply = () => {
    onApply(localGroups);
    setIsOpen(false);
  };

  const activeFilterCount = groups.reduce((acc, g) => acc + g.selectedValues.length, 0);

  return (
    <div className="relative" ref={panelRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-center p-2 rounded-md border border-slate-300 hover:bg-slate-50 transition-colors relative"
        title="Filter"
      >
        <Filter className="w-4 h-4 text-slate-600" />
        {activeFilterCount > 0 && (
          <span className="absolute -top-1.5 -right-1.5 bg-emerald-600 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
            {activeFilterCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-64 bg-white rounded-lg shadow-xl border border-slate-200 z-50 flex flex-col max-h-[80vh]">
          <div className="p-3 border-b border-slate-200 flex items-center justify-between bg-slate-50 rounded-t-lg">
            <h3 className="font-semibold text-slate-700 text-sm">Filters</h3>
            <button onClick={handleClearAll} className="text-xs text-emerald-600 hover:text-emerald-700 font-medium">
              Clear all
            </button>
          </div>
          
          <div className="overflow-y-auto p-2 flex-grow">
            {localGroups.map(group => (
              <div key={group.id} className="mb-1 border-b border-slate-100 last:border-0">
                <button
                  className="w-full flex items-center justify-between p-2 text-sm font-medium text-slate-700 hover:bg-slate-50 rounded-md transition-colors"
                  onClick={() => toggleGroup(group.id)}
                >
                  <span>{group.label}</span>
                  {expandedGroups[group.id] ? (
                    <ChevronUp className="w-4 h-4 text-slate-400" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-slate-400" />
                  )}
                </button>
                
                {expandedGroups[group.id] && (
                  <div className="p-2 pt-0 space-y-2">
                    {group.options.map(option => (
                      <label key={option} className="flex items-center gap-2 cursor-pointer group">
                        <input
                          type="checkbox"
                          checked={group.selectedValues.includes(option)}
                          onChange={(e) => handleCheckboxChange(group.id, option, e.target.checked)}
                          className="w-4 h-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                        />
                        <span className="text-sm text-slate-600 group-hover:text-slate-900 truncate" title={option}>
                          {option}
                        </span>
                      </label>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="p-3 border-t border-slate-200 bg-slate-50 rounded-b-lg flex justify-end gap-2">
            <button
              onClick={() => setIsOpen(false)}
              className="px-3 py-1.5 text-sm font-medium text-slate-600 hover:bg-slate-200 rounded-md transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleApply}
              className="px-3 py-1.5 text-sm font-medium bg-emerald-600 text-white hover:bg-emerald-700 rounded-md transition-colors"
            >
              Apply
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
