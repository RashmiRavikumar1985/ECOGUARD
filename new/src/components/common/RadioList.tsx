// src/components/common/RadioList.tsx
import React from "react";

type RadioListProps<T> = {
  items: T[];
  value: string | null;
  onChange: (id: string) => void;
  getId: (item: T) => string;
  getLabel: (item: T) => string;
  name: string;
  emptyText?: string;
};

export function RadioList<T>({
  items,
  value,
  onChange,
  getId,
  getLabel,
  name,
  emptyText = "No items available",
}: RadioListProps<T>) {
  if (items.length === 0) {
    return (
      <div className="text-sm text-[#92adc9] p-3">
        {emptyText}
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-[#324d67] bg-[#1a2632]/50 backdrop-blur-sm overflow-hidden">
      {items.map((item) => {
        const id = getId(item);
        const isSelected = value === id;

        return (
          <label
            key={id}
            className={`flex items-center gap-3 px-4 py-2.5 cursor-pointer
                       border-b border-[#324d67]/30 transition-colors
                       hover:bg-[#324d67]/20
                       last:border-b-0
                       ${isSelected ? "bg-[#324d67]/30" : ""}`}
          >
            <div className="relative flex items-center">
              <input
                type="radio"
                name={name}
                checked={isSelected}
                onChange={() => onChange(id)}
                className="sr-only"
              />
              <div
                className={`w-4 h-4 rounded-full border-2 flex items-center justify-center transition-all
                  ${
                    isSelected
                      ? "border-[#3b82f6] bg-[#3b82f6]"
                      : "border-[#92adc9]/50 bg-transparent"
                  }`}
              >
                {isSelected && (
                  <div className="w-2 h-2 rounded-full bg-white"></div>
                )}
              </div>
            </div>
            <span
              className={`text-sm font-medium transition-colors ${
                isSelected ? "text-white" : "text-[#92adc9]"
              }`}
            >
              {getLabel(item)}
            </span>
          </label>
        );
      })}
    </div>
  );
}
