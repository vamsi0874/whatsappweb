import fs from 'fs';
import path from 'path';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import ProcessedMessage from './models/ProcessedMessage.js';

dotenv.config();

async function main() {
  // Connect to MongoDB
  await mongoose.connect(process.env.MONGO_URI);
  console.log('✅ Connected to MongoDB');

  const payloadDir = './payloads';
  const files = fs.readdirSync(payloadDir).filter(f => f.endsWith('.json'));

  for (const file of files) {
    const data = JSON.parse(fs.readFileSync(path.join(payloadDir, file), 'utf8'));

    const change = data.metaData?.entry?.[0]?.changes?.[0]?.value || {};

    // 1️⃣ If payload contains messages → Insert them
    if (change.messages && Array.isArray(change.messages)) {
      for (const msg of change.messages) {
        const wa_id = change.contacts?.[0]?.wa_id || null;
        const name = change.contacts?.[0]?.profile?.name || null;

        const exists = await ProcessedMessage.findOne({ messageId: msg.id });
        if (!exists) {
          await ProcessedMessage.create({
            wa_id,
            name,
            from: msg.from,
            text: msg.text?.body || '',
            messageId: msg.id,
            meta_msg_id: msg.meta_msg_id || null,
            timestamp: new Date(parseInt(msg.timestamp) * 1000)
          });
          console.log(`📩 Inserted message from ${name || 'Unknown'}: ${msg.text?.body}`);
        }
      }
    }

    // 2️⃣ If payload contains statuses → Update matching message
    if (change.statuses && Array.isArray(change.statuses)) {
      for (const status of change.statuses) {
        const updated = await ProcessedMessage.findOneAndUpdate(
          {
            $or: [
              { messageId: status.id },
              { meta_msg_id: status.meta_msg_id }
            ]
          },
          { status: status.status }
        );
        if (updated) {
          console.log(`✅ Updated status for ${status.id} → ${status.status}`);
        } else {
          console.warn(`⚠️ No matching message found for status ${status.id}`);
        }
      }
    }
  }

  console.log('🎯 Finished processing payloads');
  mongoose.connection.close();
}

main().catch(err => {
  console.error(err);
  mongoose.connection.close();
});
