import express from 'express';
import ProcessedMessage from '../models/ProcessedMessage.js';

const router = express.Router();

// Get all conversations grouped by wa_id
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

// Get all messages for a specific wa_id
router.get('/messages/:wa_id', async (req, res) => {
  try {
    const messages = await ProcessedMessage.find({ wa_id: req.params.wa_id })
      .sort({ timestamp: 1 });
    res.json(messages);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
