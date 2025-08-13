import mongoose from 'mongoose';

const processedMessageSchema = new mongoose.Schema({
  wa_id: String,              // WhatsApp ID of the contact
  name: String,               // Contact name
  from: String,               // Sender number
  text: String,                // Message text
  messageId: String,          // Message unique ID
  meta_msg_id: String,        // Optional meta message ID
  status: { type: String, default: 'sent' }, // sent/delivered/read
  timestamp: Date
});

export default mongoose.model('ProcessedMessage', processedMessageSchema, 'processed_messages');
