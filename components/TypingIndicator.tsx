export default function TypingIndicator() {
  return (
    <div className="flex items-start gap-3 mb-4">
      {/* Bot avatar */}
      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-[#991a32] flex items-center justify-center text-white text-xs font-bold">
        C
      </div>
      <div className="bg-[#1a1a1a] border border-[#2e2e2e] rounded-2xl rounded-tl-sm px-4 py-3">
        <div className="flex gap-1.5 items-center h-4">
          <span className="typing-dot w-2 h-2 rounded-full bg-[#888888] inline-block" />
          <span className="typing-dot w-2 h-2 rounded-full bg-[#888888] inline-block" />
          <span className="typing-dot w-2 h-2 rounded-full bg-[#888888] inline-block" />
        </div>
      </div>
    </div>
  );
}
