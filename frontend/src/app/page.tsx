"use client";

import { useState, useEffect } from "react";
import Sidebar from "../components/Sidebar";
import ChatWindow from "../components/ChatWindow";
import { getConversations, getMessages, Conversation, Message } from "@/lib/api";

export default function HomePage() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [selectedName, setSelectedName] = useState("");
  const [selectedWaId, setSelectedWaId] = useState("");

  useEffect(() => {
    getConversations()
      .then(setConversations)
      .catch(console.error);
  }, []);

  const selectConversation = (wa_id: string, name: string) => {
    setSelectedName(name);
    setSelectedWaId(wa_id);
    getMessages(wa_id)
      .then(setMessages)
      .catch(console.error);
  };

  return (
    <div className="flex flex-col md:flex-row h-screen">
      <Sidebar conversations={conversations} onSelect={selectConversation} />
      <ChatWindow
        messages={messages}
        selectedName={selectedName}
        selectedWaId={selectedWaId}
      />
    </div>
  );
}
