
"use client";

import { useState } from "react";
import { Conversation } from "@/lib/api";
import Image from "next/image";

interface SidebarProps {
  conversations: Conversation[];
  onSelect: (wa_id: string, name: string) => void;
}

export default function Sidebar({ conversations, onSelect }: SidebarProps) {
  const [search, setSearch] = useState("");


  const filteredConversations = conversations.filter((conv) =>
    conv.name?.toLowerCase().includes(search.toLowerCase()) ||
    conv.lastMessage?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="h-full flex flex-col">
     
      <div className="flex items-center gap-3 p-4 text-black">
        <Image
          src="/whatsapp.webp"  
          alt="WhatsApp"
          width={40}
          height={40}
          
        />
        <h1 className="text-lg font-semibold">Whatsapp</h1>
      </div>


      <div className="p-3">
        <input
          type="text"
          placeholder="Search or start new chat"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full px-3 py-2 border rounded-full bg-white focus:outline-none text-sm"
        />
      </div>

      <div className="flex-1 overflow-y-auto">
        {filteredConversations.length === 0 && (
          <div className="p-4 text-gray-500 text-sm text-center">
            No chats found
          </div>
        )}

        {filteredConversations.map((conv) => (
          <div
            key={conv._id}
            onClick={() => onSelect(conv._id, conv.name)}
            className="flex items-center p-3 hover:bg-gray-100 cursor-pointer"
          >
            
            <div className="w-10 h-10 rounded-full bg-gray-300 mr-3"></div>

            <div className="flex-1">
              <div className="flex justify-between items-center">
                <p className="font-semibold truncate">{conv.name || conv._id}</p>
                <span className="text-xs text-gray-500">
                  {new Date(conv.lastTimestamp).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
              </div>
              <p className="text-sm text-gray-500 truncate">
                {conv.lastMessage}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
