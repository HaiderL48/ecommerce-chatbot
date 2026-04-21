"use client";

interface SuggestionChipsProps {
  suggestions: string;
  onSelect: (text: string) => void;
}

export default function SuggestionChips({
  suggestions,
  onSelect,
}: SuggestionChipsProps) {
  // Split on comma or newline, trim, filter empty
  const chips = suggestions
    .split(/[,\n]/)
    .map((s) => s.trim())
    .filter((s) => s.length > 0 && s.length < 120);

  if (!chips.length) return null;

  return (
    <div className="flex flex-wrap gap-2 mt-3">
      {chips.map((chip, i) => (
        <button
          key={i}
          onClick={() => onSelect(chip)}
          className="text-xs bg-[#242424] hover:bg-[#991a32] border border-[#2e2e2e] hover:border-[#991a32] text-[#888888] hover:text-white rounded-full px-3 py-1.5 transition-all duration-150"
        >
          {chip}
        </button>
      ))}
    </div>
  );
}
