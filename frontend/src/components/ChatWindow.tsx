
"use client";

import { useState } from "react";
import { Message, sendMessage } from "@/lib/api";
import { ArrowLeft } from "lucide-react";

interface ChatWindowProps {
  messages: Message[];
  selectedName: string;
  selectedWaId: string;
  onNewMessage: (msg: Message) => void;
  onBack?: () => void;
}

export default function ChatWindow({
  messages,
  selectedName,
  selectedWaId,
  onNewMessage,
  onBack
}: ChatWindowProps) {
  const [input, setInput] = useState("");

  const handleSend = async () => {
    if (!input.trim()) return;
    const newMsg = await sendMessage(selectedWaId, selectedName, input);
    onNewMessage(newMsg);
    setInput("");
  };

  return (
    <div className="flex flex-col h-full bg-[url('/whatsapp-bg.png')] bg-cover">

      <div className="flex items-center p-4 bg-white">
        {onBack && (
          <button
            className="md:hidden mr-3"
            onClick={onBack}
          >
            <ArrowLeft />
          </button>
        )}
        <h2 className="font-semibold">{selectedName || "Select a chat"}</h2>
      </div>

     
      <div className="flex-1 overflow-y-auto p-4 space-y-2">
        {messages.map((m, idx) => {
          const isIncoming = m.from === selectedWaId;
          return (
            <div
              key={idx}
              className={`flex ${isIncoming ? "justify-start" : "justify-end"}`}
            >
              <div
                className={`max-w-xs px-3 py-2 rounded-lg relative ${
                  isIncoming
                    ? "bg-gray-200 text-black"
                    : "bg-green-500 text-white"
                }`}
              >
                {m.text}
                <div className="text-xs mt-1 flex justify-end opacity-70">
                  {new Date(m.timestamp).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit"
                  })}
                  {!isIncoming && (
                    <span className="ml-1">
                      {m.status}
                     
                    </span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

    
      {selectedWaId && (
        <div className="p-3 bg-gray-100 flex gap-2">
          <input
            type="text"
            placeholder="Type a message"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="flex-1 border rounded-full px-4 py-2 focus:outline-none"
          />
          <button
            onClick={handleSend}
            className="bg-green-500 text-white px-4 py-2 rounded-full hover:bg-green-600"
          >
            Send
          </button>
        </div>
      )}
    </div>
  );
}
