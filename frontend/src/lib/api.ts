export interface Conversation {
  _id: string;
  name: string;
  lastMessage: string;
  lastTimestamp: string;
}

export interface Message {
  wa_id: string;
  name: string;
  from: string;
  text: string;
  messageId: string;
  meta_msg_id?: string;
  status: string;
  timestamp: string;
}

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

export async function getConversations(): Promise<Conversation[]> {
  const res = await fetch(`${API_BASE}/conversations`, { cache: "no-store" });
  if (!res.ok) throw new Error("Failed to fetch conversations");
  return res.json();
}

export async function getMessages(wa_id: string): Promise<Message[]> {
  const res = await fetch(`${API_BASE}/messages/${wa_id}`, { cache: "no-store" });
  if (!res.ok) throw new Error("Failed to fetch messages");
  return res.json();
}
