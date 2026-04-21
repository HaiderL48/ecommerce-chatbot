"use client";

import { KeyboardEvent } from "react";

interface ChatInputProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  disabled: boolean;
}

export default function ChatInput({
  value,
  onChange,
  onSubmit,
  disabled,
}: ChatInputProps) {
  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey && !disabled) {
      e.preventDefault();
      onSubmit();
    }
  };

  return (
    <div className="flex gap-3 p-4 border-t border-[#2e2e2e] bg-[#0f0f0f]">
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={handleKeyDown}
        disabled={disabled}
        placeholder="Ask about our cutting tools..."
        className="flex-1 bg-[#242424] border border-[#2e2e2e] rounded-xl px-4 py-3 text-[#f0f0f0] placeholder-[#888888] text-sm outline-none focus:border-[#991a32] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        autoComplete="off"
      />
      <button
        onClick={onSubmit}
        disabled={disabled || value.trim().length === 0}
        className="bg-[#991a32] hover:bg-[#b01f3a] disabled:bg-[#3a1a20] disabled:cursor-not-allowed text-white rounded-xl px-5 py-3 text-sm font-medium transition-colors flex items-center gap-2 flex-shrink-0"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="currentColor"
          className="w-4 h-4"
        >
          <path d="M3.478 2.405a.75.75 0 00-.926.94l2.432 7.905H13.5a.75.75 0 010 1.5H4.984l-2.432 7.905a.75.75 0 00.926.94 60.519 60.519 0 0018.445-8.986.75.75 0 000-1.218A60.517 60.517 0 003.478 2.405z" />
        </svg>
        <span className="hidden sm:inline">Send</span>
      </button>
    </div>
  );
}
