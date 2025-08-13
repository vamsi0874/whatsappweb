

"use client";

import { useState, useEffect } from "react";
import Sidebar from "../components/Sidebar";
import ChatWindow from "../components/ChatWindow";
import { getConversations, getMessages, Conversation, Message } from "@/lib/api";
import { io } from "socket.io-client";

export default function HomePage() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [selectedName, setSelectedName] = useState("");
  const [selectedWaId, setSelectedWaId] = useState("");
  const [isMobileChatOpen, setIsMobileChatOpen] = useState(false);

  useEffect(() => {

    (async () => {
      const data = await getConversations();
      setConversations(data);
    })();

    const socket = io(process.env.NEXT_PUBLIC_API_WS || "http://localhost:5000");

   socket.on("message", (msg: Message) => {
  
  if (msg.from === msg.wa_id) {
  
    setConversations((prev) => {
      let updated = prev.map((c) =>
        c._id === msg.wa_id
          ? { ...c, lastMessage: msg.text, lastTimestamp: msg.timestamp }
          : c
      );
      if (!updated.find((c) => c._id === msg.wa_id)) {
        updated.push({
          _id: msg.wa_id,
          name: msg.name,
          lastMessage: msg.text,
          lastTimestamp: msg.timestamp
        });
      }
      return updated.sort(
        (a, b) =>
          new Date(b.lastTimestamp).getTime() -
          new Date(a.lastTimestamp).getTime()
      );
    });

  
    if (msg.wa_id === selectedWaId) {
      setMessages((prev) => [...prev, msg]);
    }
  }
});


    socket.on("status_update", (updatedMsg: Message) => {
      setMessages((prev) =>
        prev.map((m) => (m.messageId === updatedMsg.messageId ? updatedMsg : m))
      );
    });

    return () => {
      socket.disconnect();
    };
  }, [selectedWaId]);

  const selectConversation = async (wa_id: string, name: string) => {
    setSelectedName(name);
    setSelectedWaId(wa_id);
    const msgs = await getMessages(wa_id);
    setMessages(msgs);
    if (window.innerWidth < 768) setIsMobileChatOpen(true);
  };

  const handleNewMessage = (msg: Message) => {
    setMessages((prev) => [...prev, msg]);
    setConversations((prev) => {
      let updated = prev.map((c) =>
        c._id === msg.wa_id
          ? { ...c, lastMessage: msg.text, lastTimestamp: msg.timestamp }
          : c
      );
      if (!updated.find((c) => c._id === msg.wa_id)) {
        updated.push({
          _id: msg.wa_id,
          name: msg.name,
          lastMessage: msg.text,
          lastTimestamp: msg.timestamp
        });
      }
      return updated.sort(
        (a, b) =>
          new Date(b.lastTimestamp).getTime() -
          new Date(a.lastTimestamp).getTime()
      );
    });
  };

  return (
    <div className="flex h-screen bg-gray-100">
 
      <div
        className={`w-full md:w-1/3 border-r bg-white ${
          isMobileChatOpen ? "hidden md:block" : "block"
        }`}
      >
        <Sidebar conversations={conversations} onSelect={selectConversation} />
      </div>

  
      <div
        className={`flex-1 ${
          isMobileChatOpen ? "block" : "hidden md:block"
        }`}
      >
        <ChatWindow
          messages={messages}
          selectedName={selectedName}
          selectedWaId={selectedWaId}
          onNewMessage={handleNewMessage}
          onBack={() => setIsMobileChatOpen(false)}
        />
      </div>
    </div>
  );
}
