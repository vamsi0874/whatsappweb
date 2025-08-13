"use client";

import { Message } from "@/lib/api";

interface ChatWindowProps {
  messages: Message[];
  selectedName: string;
  selectedWaId: string; // Add this so we can check alignment
}

export default function ChatWindow({ messages, selectedName, selectedWaId }: ChatWindowProps) {
  return (
    <div className="flex-1 flex flex-col bg-gray-50">
      {/* Header */}
      <div className="p-4 border-b bg-white font-semibold">
        {selectedName || "Select a conversation"}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-2">
        {messages.map((m, idx) => {
          const isIncoming = m.from === selectedWaId;
          return (
            <div
              key={idx}
              className={`flex ${isIncoming ? "justify-start" : "justify-end"}`}
            >
              <div
                className={`max-w-xs px-3 py-2 rounded-lg shadow ${
                  isIncoming
                    ? "bg-white text-gray-800"
                    : "bg-green-100 text-gray-900"
                }`}
              >
                <p>{m.text}</p>
                <p className="text-xs text-gray-500 mt-1">
                  {new Date(m.timestamp).toLocaleString()} • {m.status}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
