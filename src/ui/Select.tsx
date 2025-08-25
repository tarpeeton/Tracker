"use client";
import { ChevronDown } from "lucide-react";
import React, { useEffect, useRef, useState } from "react";

export type Status = "todo" | "in_progress" | "done" | "blocked";

export const Select: React.FC<{
  value: string;
  options: { value: string; label: string; color?: string }[];
  onChange: (value: string) => void;
  onComplete?: () => void;
  className?: string;
  placeholder?: string;
  isEditing?: boolean;
}> = ({
  value,
  options,
  onChange,
  onComplete,
  className = "",
  placeholder,
  isEditing = false,
}) => {
  const [isOpen, setIsOpen] = useState(isEditing);
  const selectRef = useRef<HTMLDivElement>(null);

  const selectedOption = options.find((opt) => opt.value === value);

  // Автоматически открываем select при начале редактирования
  useEffect(() => {
    if (isEditing) {
      setIsOpen(true);
    }
  }, [isEditing]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        selectRef.current &&
        !selectRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
        if (isEditing && onComplete) {
          onComplete();
        }
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen, isEditing, onComplete]);

  const handleOptionClick = (optionValue: string) => {
    onChange(optionValue);
    setIsOpen(false);
    if (isEditing && onComplete) {
      // Даем небольшую задержку чтобы изменение успело применится
      setTimeout(() => {
        onComplete();
      }, 50);
    }
  };

  const handleToggle = () => {
    if (!isEditing) {
      setIsOpen(!isOpen);
    }
  };

  return (
    <div className={`relative ${className}`} ref={selectRef}>
      <button
        type="button"
        onClick={handleToggle}
        className="w-full h-10 backdrop-blur-sm text-white px-3 rounded-lg border border-gray-600/50 flex items-center justify-between hover:border-gray-500 transition-colors"
      >
        <div className="flex items-center gap-2">
          {selectedOption?.color && (
            <div className={`w-2 h-2 rounded-full ${selectedOption.color}`} />
          )}
          <span className="text-sm">
            {selectedOption?.label || placeholder}
          </span>
        </div>
        <ChevronDown
          size={16}
          className={`transform transition-transform ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>

      {isOpen && (
        <div className="absolute z-50 w-full mt-1 bg-[#2b2a2a] backdrop-blur-sm border border-gray-600/50 rounded-lg shadow-lg max-h-48 overflow-auto">
          {options.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => handleOptionClick(option.value)}
              className={`w-full px-3 py-2 text-left text-sm text-white hover:bg-gray-700/50 flex items-center gap-2 transition-colors ${
                option.value === value ? "bg-gray-700/30" : ""
              }`}
            >
              {option.color && (
                <div className={`w-2 h-2 rounded-full ${option.color}`} />
              )}
              {option.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
