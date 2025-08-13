import express from 'express';
import ProcessedMessage from '../models/ProcessedMessage.js';
import { io } from '../index.js';

const router = express.Router();

router.get('/conversations', async (req, res) => {
  try {
    const conversations = await ProcessedMessage.aggregate([
      { $sort: { timestamp: -1 } },
      {
        $group: {
          _id: "$wa_id",
          name: { $first: "$name" },
          lastMessage: { $first: "$text" },
          lastTimestamp: { $first: "$timestamp" }
        }
      },
      { $sort: { lastTimestamp: -1 } }
    ]);
    res.json(conversations);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/messages/:wa_id', async (req, res) => {
  try {
    const messages = await ProcessedMessage.find({ wa_id: req.params.wa_id })
      .sort({ timestamp: 1 });
    res.json(messages);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/messages', async (req, res) => {
  try {
    const { wa_id, name, text } = req.body;
    if (!wa_id || !text) {
      return res.status(400).json({ error: "wa_id and text are required" });
    }

    const newMsg = await ProcessedMessage.create({
      wa_id,
      name,
      from: "918329446654", 
      text,
      messageId: `local-${Date.now()}`, 
      meta_msg_id: null,
      status: "sent",
      timestamp: new Date()
    });

    io.emit("message", newMsg);

    res.json(newMsg);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


// for testing
router.post('/messages/status', async (req, res) => {
  try {
    const { id, meta_msg_id, status } = req.body;
    if (!status || (!id && !meta_msg_id)) return res.status(400).json({ error: 'status and id/meta_msg_id are required' });

    const updated = await ProcessedMessage.findOneAndUpdate(
      { $or: [{ messageId: id }, { meta_msg_id }] },
      { status },
      { new: true }
    );

    if (!updated) return res.status(404).json({ error: 'Message not found' });


    io.emit('status_update', updated);
    res.json(updated);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

export default router;