"use client";

import { Message } from "@/lib/types";
import { parseMarkdown } from "@/lib/parseMarkdown";
import ProductGrid from "./ProductGrid";
import RecommendedSection from "./RecommendedSection";
import SuggestionChips from "./SuggestionChips";

interface MessageBubbleProps {
  message: Message;
  onSuggestionSelect: (text: string) => void;
}

export default function MessageBubble({
  message,
  onSuggestionSelect,
}: MessageBubbleProps) {
  const isUser = message.role === "user";

  if (isUser) {
    return (
      <div className="flex justify-end mb-4">
        <div className="max-w-[75%] bg-[#991a32] text-white rounded-2xl rounded-tr-sm px-4 py-3 text-sm leading-relaxed">
          {message.text}
        </div>
      </div>
    );
  }

  // Bot message
  const hasProducts =
    Array.isArray(message.products) && message.products.length > 0;
  const hasRecommended =
    Array.isArray(message.recommended) && message.recommended.length > 0;

  return (
    <div className="flex items-start gap-3 mb-4">
      {/* Bot avatar */}
      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-[#991a32] flex items-center justify-center text-white text-xs font-bold mt-0.5">
        C
      </div>

      <div className="flex-1 min-w-0">
        <div
          className={`bg-[#1a1a1a] border rounded-2xl rounded-tl-sm px-4 py-3 text-sm leading-relaxed ${
            message.isError
              ? "border-red-900/60 bg-red-950/20"
              : "border-[#2e2e2e]"
          }`}
        >
          {/* Main text */}
          <div
            className="bot-text text-[#f0f0f0]"
            dangerouslySetInnerHTML={{
              __html: parseMarkdown(message.text),
            }}
          />

          {/* Product grid */}
          {hasProducts && message.products && (
            <ProductGrid products={message.products} />
          )}

          {/* Recommended section */}
          {hasRecommended && message.recommended && (
            <RecommendedSection products={message.recommended} />
          )}
        </div>

        {/* Suggestion chips — outside the bubble */}
        {message.suggestions && (
          <SuggestionChips
            suggestions={message.suggestions}
            onSelect={onSuggestionSelect}
          />
        )}
      </div>
    </div>
  );
}
