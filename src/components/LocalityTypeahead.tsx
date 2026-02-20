import React, { useEffect, useId, useMemo, useRef, useState } from "react";

type Props = {
  label?: string;
  placeholder?: string;
  value: string;
  suggestions: string[];
  onChange: (next: string) => void;
  onSelect?: (selected: string) => void;
  disabled?: boolean;
};

function norm(s: string) {
  return (s || "").trim().toLowerCase();
}

export default function LocalityTypeahead({
  label = "Preferred locality / landmark (optional)",
  placeholder = "e.g., Thakur Village, Mindspace, IC Colony",
  value,
  suggestions,
  onChange,
  onSelect,
  disabled,
}: Props) {
  const inputId = useId();
  const listId = useId();
  const wrapRef = useRef<HTMLDivElement | null>(null);

  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState<number>(-1);

  const filtered = useMemo(() => {
    const q = norm(value);
    if (!q) return suggestions.slice(0, 8);
    return suggestions
      .filter((s) => norm(s).includes(q))
      .slice(0, 8);
  }, [suggestions, value]);

  // Close on outside click
  useEffect(() => {
    function onDoc(e: MouseEvent) {
      if (!wrapRef.current) return;
      if (!wrapRef.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  function commit(selection: string) {
    onChange(selection);
    onSelect?.(selection);
    setOpen(false);
    setActiveIndex(-1);
  }

  return (
    <div ref={wrapRef} className="relative">
      <div className="mb-2 text-xs font-semibold text-white/75">{label}</div>

      <div
        role="combobox"
        aria-expanded={open}
        aria-owns={listId}
        aria-haspopup="listbox"
        className="relative"
      >
        <input
          id={inputId}
          value={value}
          disabled={disabled}
          onFocus={() => setOpen(true)}
          onChange={(e) => {
            onChange(e.target.value);
            setOpen(true);
            setActiveIndex(-1);
          }}
          onKeyDown={(e) => {
            if (!open && (e.key === "ArrowDown" || e.key === "ArrowUp")) {
              setOpen(true);
              return;
            }
            if (!open) return;

            if (e.key === "Escape") {
              setOpen(false);
              return;
            }
            if (e.key === "ArrowDown") {
              e.preventDefault();
              setActiveIndex((i) => Math.min(i + 1, filtered.length - 1));
              return;
            }
            if (e.key === "ArrowUp") {
              e.preventDefault();
              setActiveIndex((i) => Math.max(i - 1, 0));
              return;
            }
            if (e.key === "Enter") {
              if (activeIndex >= 0 && filtered[activeIndex]) {
                e.preventDefault();
                commit(filtered[activeIndex]);
              }
            }
          }}
          placeholder={placeholder}
          aria-controls={listId}
          aria-autocomplete="list"
          aria-activedescendant={activeIndex >= 0 ? `${listId}-${activeIndex}` : undefined}
          className="w-full rounded-xl border border-white/10 bg-black/40 px-3 py-3 text-sm text-white outline-none focus:border-white/20"
        />

        {open && filtered.length > 0 && (
          <div
            id={listId}
            role="listbox"
            className="absolute z-30 mt-2 w-full overflow-hidden rounded-2xl border border-white/10 bg-[#0b0f14]/95 shadow-[0_24px_80px_-40px_rgba(0,0,0,0.9)] backdrop-blur"
          >
            {filtered.map((s, idx) => {
              const active = idx === activeIndex;
              return (
                <button
                  type="button"
                  key={s}
                  id={`${listId}-${idx}`}
                  role="option"
                  aria-selected={active}
                  onMouseEnter={() => setActiveIndex(idx)}
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => commit(s)}
                  className={`flex w-full items-center justify-between px-3 py-2 text-left text-sm text-white/90 transition-colors ${
                    active ? "bg-white/10" : "hover:bg-white/5"
                  }`}
                >
                  <span>{s}</span>
                  <span className="text-[11px] text-white/45">Select</span>
                </button>
              );
            })}
          </div>
        )}
      </div>

      <div className="mt-1 text-[11px] text-white/50">Tip: type a landmark to narrow down results.</div>
    </div>
  );
}
