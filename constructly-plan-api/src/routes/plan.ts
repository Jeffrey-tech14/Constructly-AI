import express from 'express';
import multer from 'multer';
import { parsePlanFile } from '../services/parser';

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

// Test route
router.get('/test', (req, res) => {
  console.log('📡 Test route hit');
  res.json({ message: 'Plan API is working!' });
});

// Upload route
router.post('/upload', upload.single('file'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }

  try {
    const result = await parsePlanFile(req.file);
    return res.status(200).json(result);
  } catch (err) {
    console.error('Parse error:', err);
    return res.status(500).json({ error: 'Failed to parse plan file' });
  }
});

export default router;
