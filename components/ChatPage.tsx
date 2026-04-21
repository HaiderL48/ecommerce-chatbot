"use client";

import { useReducer, useCallback, useEffect, useRef } from "react";
import { Message, BotResponse, Product } from "@/lib/types";
import MessageList from "./MessageList";
import TypingIndicator from "./TypingIndicator";
import ChatInput from "./ChatInput";

const STORAGE_KEY = "carbiforce_chat_messages";
const SID_KEY = "carbiforce_sid";

// ─── State & Reducer ────────────────────────────────────────────────────────

interface ChatState {
  messages: Message[];
  inputValue: string;
  isLoading: boolean;
}

type ChatAction =
  | { type: "SET_INPUT"; payload: string }
  | { type: "ADD_MESSAGE"; payload: Message }
  | { type: "SET_LOADING"; payload: boolean }
  | { type: "LOAD_MESSAGES"; payload: Message[] }
  | { type: "CLEAR_CHAT" };

function chatReducer(state: ChatState, action: ChatAction): ChatState {
  switch (action.type) {
    case "SET_INPUT":
      return { ...state, inputValue: action.payload };
    case "ADD_MESSAGE":
      return { ...state, messages: [...state.messages, action.payload] };
    case "SET_LOADING":
      return { ...state, isLoading: action.payload };
    case "LOAD_MESSAGES":
      return { ...state, messages: action.payload };
    case "CLEAR_CHAT":
      return { ...state, messages: [WELCOME] };
    default:
      return state;
  }
}

function makeId() {
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

const WELCOME: Message = {
  id: "welcome",
  role: "bot",
  type: "interact",
  text: "Welcome to Carbiforce! I'm your AI cutting-tool assistant. Ask me about endmills, drills, carbide inserts, holders, or anything else in our catalogue.",
  suggestions: "Show me endmills, Show me drills, Carbide inserts, Contact info",
};

// ─── Component ──────────────────────────────────────────────────────────────

export default function ChatPage() {
  const [state, dispatch] = useReducer(chatReducer, {
    messages: [WELCOME],
    inputValue: "",
    isLoading: false,
  });

  const hydrated = useRef(false);

  // Load messages from localStorage on mount
  useEffect(() => {
    if (hydrated.current) return;
    hydrated.current = true;
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed: Message[] = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          dispatch({ type: "LOAD_MESSAGES", payload: parsed });
        }
      }
    } catch {
      // ignore parse errors
    }
  }, []);

  // Save messages to localStorage whenever they change
  useEffect(() => {
    if (!hydrated.current) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state.messages));
    } catch {
      // ignore storage errors
    }
  }, [state.messages]);

  const handleSubmit = useCallback(async (text?: string) => {
    const messageText = (text ?? state.inputValue).trim();
    if (!messageText) return;

    dispatch({
      type: "ADD_MESSAGE",
      payload: { id: makeId(), role: "user", text: messageText },
    });
    dispatch({ type: "SET_INPUT", payload: "" });
    dispatch({ type: "SET_LOADING", payload: true });

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: messageText,
          sid: localStorage.getItem(SID_KEY) ?? undefined,
        }),
      });

      const json: BotResponse & { sid?: string } = await res.json();

      // Persist the session ID returned by the server
      if (json.sid) {
        localStorage.setItem(SID_KEY, json.sid);
      }

      if (!res.ok || json.status === "error") {
        dispatch({
          type: "ADD_MESSAGE",
          payload: {
            id: makeId(),
            role: "bot",
            text: json.message ?? "Something went wrong. Please try again.",
            isError: true,
          },
        });
        return;
      }

      const data = json.data;
      const isProduct = data.type === "product";
      const isInfo = data.type === "info" || data.type === "interact";

      let displayText = "";
      let products: Product[] | undefined;
      let recommended: Product[] | undefined;

      if (isProduct) {
        displayText = data.answer ?? "Here are the products I found.";
        products = Array.isArray(data.results) ? (data.results as Product[]) : [];
        recommended = Array.isArray(data.recommended) ? data.recommended : [];
      } else if (isInfo) {
        displayText =
          typeof data.results === "string"
            ? data.results
            : data.answer ?? "Here is the information you requested.";
      } else {
        displayText = data.answer ?? (typeof data.results === "string" ? data.results : "");
      }

      dispatch({
        type: "ADD_MESSAGE",
        payload: {
          id: makeId(),
          role: "bot",
          type: data.type,
          text: displayText,
          products,
          recommended,
          suggestions: data.suggestions,
        },
      });
    } catch (err) {
      console.error("[ChatPage] fetch error:", err);
      dispatch({
        type: "ADD_MESSAGE",
        payload: {
          id: makeId(),
          role: "bot",
          text: "Connection failed. Please check your internet connection and try again.",
          isError: true,
        },
      });
    } finally {
      dispatch({ type: "SET_LOADING", payload: false });
    }
  }, [state.inputValue]);

  const handleSuggestionSelect = useCallback(
    (text: string) => {
      dispatch({ type: "SET_INPUT", payload: text });
      handleSubmit(text);
    },
    [handleSubmit]
  );

  const handleClearChat = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(SID_KEY);
    dispatch({ type: "CLEAR_CHAT" });
  }, []);

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <header className="flex-shrink-0 bg-[#1a1a1a] border-b border-[#2e2e2e] px-4 py-3">
        <div className="max-w-3xl mx-auto flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-[#991a32] flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
            C
          </div>
          <div>
            <h1 className="text-base font-semibold text-[#f0f0f0] leading-tight">
              Carbiforce AI
            </h1>
            <p className="text-xs text-[#888888]">Expert cutting-tool assistant</p>
          </div>
          <div className="ml-auto flex items-center gap-3">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              <span className="text-xs text-[#888888]">Online</span>
            </span>
            <button
              onClick={handleClearChat}
              className="text-xs text-[#888888] hover:text-[#f0f0f0] border border-[#2e2e2e] hover:border-[#991a32] rounded-lg px-2 py-1 transition-colors"
              title="Clear chat history"
            >
              Clear
            </button>
          </div>
        </div>
      </header>

      {/* Messages */}
      <MessageList
        messages={state.messages}
        onSuggestionSelect={handleSuggestionSelect}
      />

      {/* Typing indicator */}
      {state.isLoading && (
        <div className="px-4 pb-0">
          <div className="max-w-3xl mx-auto">
            <TypingIndicator />
          </div>
        </div>
      )}

      {/* Input */}
      <div className="flex-shrink-0 max-w-3xl w-full mx-auto">
        <ChatInput
          value={state.inputValue}
          onChange={(v) => dispatch({ type: "SET_INPUT", payload: v })}
          onSubmit={() => handleSubmit()}
          disabled={state.isLoading}
        />
      </div>
    </div>
  );
}
