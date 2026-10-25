import React, { useState } from 'react';
import { Search, ArrowRight, Loader2 } from 'lucide-react';

/**
 * Reusable SearchBar component with quick submit and clean aesthetics
 */
export function SearchBar({
  placeholder = 'Enter GitHub repository URL or user/repo...',
  onSearch,
  isLoading = false,
  defaultValue = '',
  className = ''
}) {
  const [value, setValue] = useState(defaultValue);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (value.trim() && onSearch && !isLoading) {
      onSearch(value.trim());
    }
  };

  return (
    <form onSubmit={handleSubmit} className={`relative flex items-center ${className}`}>
      <div className="relative w-full">
        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-radar-textSubtle">
          <Search className="w-4 h-4" />
        </div>
        <input
          type="text"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder={placeholder}
          disabled={isLoading}
          className="w-full pl-10 pr-24 py-2.5 text-sm bg-radar-surface/80 border border-radar-border rounded-xl text-radar-text placeholder-radar-textSubtle/60 focus:outline-none focus:border-indigo-500/80 focus:ring-2 focus:ring-indigo-500/20 backdrop-blur-md transition-all shadow-inner"
        />
        <button
          type="submit"
          disabled={!value.trim() || isLoading}
          className="absolute inset-y-1.5 right-1.5 px-3 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 disabled:hover:bg-indigo-600 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-sm"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
              <span>Scanning...</span>
            </>
          ) : (
            <>
              <span>Scan</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </>
          )}
        </button>
      </div>
    </form>
  );
}

export default SearchBar;
