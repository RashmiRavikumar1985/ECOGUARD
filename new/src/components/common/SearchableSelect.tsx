import { useState, useRef, useEffect } from "react";

type Option = {
  id: string;
  name: string;
};

type SearchableSelectProps = {
  options: Option[];
  value: string | null;
  onChange: (id: string) => void;
  placeholder?: string;
  label?: string;
};

export function SearchableSelect({
  options,
  value,
  onChange,
  placeholder = "Select...",
  label,
}: SearchableSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const selectedOption = options.find((o) => o.id === value);

  const filteredOptions = options.filter((o) =>
    o.name.toLowerCase().includes(search.toLowerCase())
  );

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
        setSearch("");
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Focus input when dropdown opens
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  const handleSelect = (id: string) => {
    onChange(id);
    setIsOpen(false);
    setSearch("");
  };

  return (
    <div ref={containerRef} className="relative">
      {label && (
        <label className="block text-sm font-semibold text-[#92adc9] mb-2">
          {label}
        </label>
      )}
      
      {/* Selected value / trigger */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-4 py-2.5 bg-[#1a2632] border border-[#324d67] rounded-lg
                   text-left text-white text-sm flex items-center justify-between
                   hover:border-[#3b82f6] transition-colors"
      >
        <span className={selectedOption ? "text-white" : "text-[#92adc9]"}>
          {selectedOption?.name || placeholder}
        </span>
        <svg
          className={`w-4 h-4 text-[#92adc9] transition-transform ${isOpen ? "rotate-180" : ""}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute z-50 mt-1 w-full bg-[#1a2632] border border-[#324d67] rounded-lg shadow-xl overflow-hidden">
          {/* Search input */}
          <div className="p-2 border-b border-[#324d67]">
            <input
              ref={inputRef}
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Type to search..."
              className="w-full px-3 py-2 bg-[#0f172a] border border-[#324d67] rounded-md
                         text-white text-sm placeholder-[#92adc9]
                         focus:outline-none focus:border-[#3b82f6]"
            />
          </div>
          
          {/* Options list */}
          <div className="max-h-60 overflow-y-auto">
            {filteredOptions.length === 0 ? (
              <div className="px-4 py-3 text-sm text-[#92adc9]">No results found</div>
            ) : (
              filteredOptions.map((option) => (
                <button
                  key={option.id}
                  type="button"
                  onClick={() => handleSelect(option.id)}
                  className={`w-full px-4 py-2.5 text-left text-sm transition-colors
                    ${option.id === value
                      ? "bg-[#3b82f6] text-white"
                      : "text-white hover:bg-[#324d67]/50"
                    }`}
                >
                  {option.name}
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
