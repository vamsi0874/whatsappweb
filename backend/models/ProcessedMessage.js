import mongoose from 'mongoose';

const processedMessageSchema = new mongoose.Schema({
  wa_id: String,              
  name: String,              
  from: String,               
  text: String,                
  messageId: String,
  meta_msg_id: String,      
  status: { type: String, enum: ['sent', 'delivered', 'read'], default: 'sent' },

  timestamp: Date
});

export default mongoose.model('ProcessedMessage', processedMessageSchema, 'processed_messages');
