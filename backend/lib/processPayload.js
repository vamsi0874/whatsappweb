// lib/processPayload.js
import ProcessedMessage from "../models/ProcessedMessage.js";

/**
 * Normalize the common path to messages/statuses inside the payload
 * and return { messages: [...], statuses: [...] }
 */
function extractValueFromPayload(payload) {
  const entry = payload?.metaData?.entry?.[0];
  const change = entry?.changes?.[0];
  const value = change?.value || {};
  return value;
}

/**
 * Upsert messages (idempotent). If message exists, we skip or update text.
 */
export async function handleMessages(value) {
  const messages = value.messages || [];
  const contacts = value.contacts || [];
  const contact = contacts[0] || {};
  const wa_id = contact?.wa_id || null;
  const name = contact?.profile?.name || null;

  const results = [];
  for (const msg of messages) {
    const doc = {
      wa_id,
      name,
      from: msg.from || null,
      text: msg.text?.body || (msg.body ? msg.body : null),
      messageId: msg.id,
      meta_msg_id: msg.meta_msg_id || null,
      timestamp: msg.timestamp ? new Date(Number(msg.timestamp) * 1000) : new Date()
    };

    try {
      // Upsert: if messageId exists, don't overwrite status (unless you want to)
      const existing = await ProcessedMessage.findOne({ messageId: doc.messageId });
      if (existing) {
        // Optionally update text/timestamp if desired:
        // await ProcessedMessage.updateOne({ messageId: doc.messageId }, { $set: { text: doc.text, timestamp: doc.timestamp }});
        results.push({ action: "skipped", messageId: doc.messageId });
        continue;
      }

      await ProcessedMessage.create(doc);
      results.push({ action: "inserted", messageId: doc.messageId });
    } catch (err) {
      // handle duplicate key race or other errors
      if (err.code === 11000) {
        results.push({ action: "duplicate", messageId: doc.messageId });
      } else {
        results.push({ action: "error", messageId: doc.messageId, error: err.message });
      }
    }
  }
  return results;
}

/**
 * Update statuses (sent/delivered/read) by messageId OR meta_msg_id
 */
export async function handleStatuses(value) {
  const statuses = value.statuses || [];
  const results = [];

  for (const s of statuses) {
    const filter = {
      $or: [
        { messageId: s.id },
        { meta_msg_id: s.meta_msg_id }
      ]
    };

    const update = { status: s.status };

    const res = await ProcessedMessage.findOneAndUpdate(filter, update, { new: true });

    if (res) {
      results.push({ action: "updated", messageId: s.id || s.meta_msg_id, status: s.status });
    } else {
      // If you receive a status for a message you haven't yet inserted, you may want to stash it
      // or log for reconciliation. Here we log as 'not_found'.
      results.push({ action: "not_found", messageId: s.id || s.meta_msg_id, status: s.status });
    }
  }

  return results;
}

/**
 * Main entrypoint to process an incoming webhook-style payload
 */
export async function processPayload(payload) {
  const value = extractValueFromPayload(payload);
  const msgResults = await handleMessages(value);
  const statusResults = await handleStatuses(value);
  return { messages: msgResults, statuses: statusResults };
}
