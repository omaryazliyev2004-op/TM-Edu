import React, { useState, useRef, useEffect } from "react";

export default function CustomSelect({ value, onChange, options, placeholder, className, style }) {
  const [isOpen, setIsOpen] = useState(false);
  const wrapperRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const selectedOption = options.find((opt) => String(opt.value) === String(value));

  return (
    <div ref={wrapperRef} className={`relative w-full ${className || ""}`} style={style}>
      <div
        className={`flex items-center justify-between w-full h-[46px] px-4 bg-white border cursor-pointer rounded-xl transition-all ${
          isOpen ? "border-[#7C3AED] shadow-[0_0_0_4px_rgba(124,58,237,0.1)]" : "border-[#e2e8f0] hover:border-[#cbd5e1]"
        }`}
        onClick={() => setIsOpen(!isOpen)}
      >
        <span className={`text-[14px] truncate ${!selectedOption ? "text-[#9CA3AF]" : "text-[#1e293b] font-medium"}`}>
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <i className={`fa-solid fa-caret-down text-[14px] transition-transform ${isOpen ? "rotate-180 text-[#7C3AED]" : "text-[#9CA3AF]"}`}></i>
      </div>

      {isOpen && (
        <div className="absolute top-[calc(100%+6px)] left-0 w-full bg-white border border-[#e2e8f0] rounded-xl shadow-xl z-50 overflow-hidden max-h-[250px] overflow-y-auto custom-select-scrollbar">
          {options.length === 0 ? (
            <div className="px-4 py-3 text-[14px] text-[#9CA3AF] text-center">Ma'lumot topilmadi</div>
          ) : (
            options.map((opt) => (
              <div
                key={opt.value}
                className={`px-4 py-2.5 text-[14px] cursor-pointer transition-colors ${
                  String(opt.value) === String(value)
                    ? "bg-[#7C3AED] text-white font-semibold"
                    : "text-[#1e293b] hover:bg-[#6b7280] hover:text-white"
                }`}
                onClick={() => {
                  onChange(opt.value);
                  setIsOpen(false);
                }}
              >
                {opt.label}
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
