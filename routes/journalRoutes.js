const express = require('express');
const {
  createJournalEntry,
  getJournalEntries,
  updateJournalEntry,
  deleteJournalEntry
} = require('../models/JournalModel');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.use(protect);

router.get('/', async (req, res) => {
  try {
    const entries = await getJournalEntries(req.userId);
    res.json({ success: true, entries });
  } catch (error) {
    console.error('Error fetching journal entries:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch journal entries' });
  }
});

router.post('/', async (req, res) => {
  try {
    const { title, content, mood, tags } = req.body;

    if (!title || !content) {
      return res.status(400).json({ success: false, error: 'Title and content are required' });
    }

    const savedEntry = await createJournalEntry({
      userId: req.userId,
      title,
      content,
      mood: mood || 5,
      tags: tags || []
    });

    res.status(201).json({ success: true, entry: savedEntry });
  } catch (error) {
    console.error('Error creating journal entry:', error);
    res.status(500).json({ success: false, error: 'Failed to save journal entry' });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const { title, content, mood, tags } = req.body;

    if (!title || !content) {
      return res.status(400).json({ success: false, error: 'Title and content are required' });
    }

    const updatedEntry = await updateJournalEntry(req.params.id, req.userId, {
      title,
      content,
      mood: mood || 5,
      tags: tags || []
    });

    if (!updatedEntry) {
      return res.status(404).json({ success: false, error: 'Entry not found or unauthorized' });
    }

    res.json({ success: true, entry: updatedEntry });
  } catch (error) {
    console.error('Error updating journal entry:', error);
    res.status(500).json({ success: false, error: 'Failed to update journal entry' });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const result = await deleteJournalEntry(req.params.id, req.userId);
    if (!result) {
      return res.status(404).json({ success: false, error: 'Entry not found or unauthorized' });
    }

    res.json({ success: true, message: 'Entry deleted successfully' });
  } catch (error) {
    console.error('Error deleting journal entry:', error);
    res.status(500).json({ success: false, error: 'Failed to delete journal entry' });
  }
});

module.exports = router;
