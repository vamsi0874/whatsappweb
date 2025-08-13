

import axios from "axios";

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
  try {
    const res = await axios.get<Conversation[]>(`${API_BASE}/conversations`, {
   
      headers: { "Cache-Control": "no-cache" }
    });
    return res.data;
  } catch (error) {
    console.error("Error fetching conversations:", error);
    throw error;
  }
}


export async function getMessages(wa_id: string): Promise<Message[]> {
  try {
    const res = await axios.get<Message[]>(`${API_BASE}/messages/${wa_id}`, {
      headers: { "Cache-Control": "no-cache" }
    });
    return res.data;
  } catch (error) {
    console.error(`Error fetching messages for ${wa_id}:`, error);
    throw error;
  }
}

export async function sendMessage(
  wa_id: string,
  name: string,
  text: string
): Promise<Message> {
  try {
    const res = await axios.post<Message>(`${API_BASE}/messages`, {
      wa_id,
      name,
      text
    });
    return res.data;
  } catch (error) {
    console.error("Error sending message:", error);
    throw error;
  }
}
