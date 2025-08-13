"use client";

import { Conversation } from "@/lib/api";

interface SidebarProps {
  conversations: Conversation[];
  onSelect: (wa_id: string, name: string) => void;
}

export default function Sidebar({ conversations, onSelect }: SidebarProps) {
  return (
    <div className="w-full md:w-1/3 border-r overflow-y-auto bg-white">
      {conversations.map((conv) => (
        <div
          key={conv._id}
          className="p-4 hover:bg-gray-100 cursor-pointer border-b"
          onClick={() => onSelect(conv._id, conv.name)}
        >
          <p className="font-semibold">{conv.name || conv._id}</p>
          <p className="text-sm text-gray-500 truncate">{conv.lastMessage}</p>
          <span className="text-xs text-gray-400">
            {new Date(conv.lastTimestamp).toLocaleString()}
          </span>
        </div>
      ))}
    </div>
  );
}
