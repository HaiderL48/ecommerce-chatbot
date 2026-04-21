"use client";

export default function ProductPageHeader() {
  return (
    <header className="bg-[#1a1a1a] border-b border-[#2e2e2e] px-4 py-3">
      <div className="max-w-4xl mx-auto flex items-center gap-3">
        <button
          onClick={() => window.history.back()}
          className="text-sm text-[#888888] hover:text-[#f0f0f0] transition-colors"
        >
          ← Back to Chat
        </button>
        <span className="text-[#2e2e2e]">|</span>
        <span className="text-sm text-[#888888]">Product Details</span>
      </div>
    </header>
  );
}
