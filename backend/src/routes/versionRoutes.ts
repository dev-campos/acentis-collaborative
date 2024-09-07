import express from 'express';
import { Document } from '../models/Document';

const router = express.Router();

// Fetch version history of a document
router.get('/document/:documentId/versions', async (req, res) => {
  const { documentId } = req.params;
  try {
    const document = await Document.findById(documentId, 'versions');
    if (document) {
      return res.status(200).json(document.versions);
    }
    return res.status(404).json({ message: 'Document not found' });
  } catch (error) {
    return res.status(500).json({ message: 'Error fetching version history', error });
  }
});

export default router;
