"use client";

import { useEffect, useRef } from "react";
import { Message } from "@/lib/types";
import MessageBubble from "./MessageBubble";

interface MessageListProps {
  messages: Message[];
  onSuggestionSelect: (text: string) => void;
}

export default function MessageList({
  messages,
  onSuggestionSelect,
}: MessageListProps) {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <div className="flex-1 overflow-y-auto px-4 py-4">
      <div className="max-w-3xl mx-auto">
        {messages.map((msg) => (
          <MessageBubble
            key={msg.id}
            message={msg}
            onSuggestionSelect={onSuggestionSelect}
          />
        ))}
        <div ref={bottomRef} />
      </div>
    </div>
  );
}
