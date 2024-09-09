import express from 'express';
import { Document } from '../models/Document';
import validator from 'validator';

const router = express.Router();

/**
 * @swagger
 * /document/{documentId}/versions:
 *   get:
 *     summary: Fetch version history of a document
 *     tags: [Documents]
 *     parameters:
 *       - name: documentId
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: A list of document versions
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   content:
 *                     type: string
 *                   updatedBy:
 *                     type: string
 *                   updatedAt:
 *                     type: string
 *                     format: date-time
 *       404:
 *         description: Document not found
 *       500:
 *         description: Error fetching version history
 */
router.get('/document/:documentId/versions', async (req, res) => {
  const { documentId } = req.params;

  if (!validator.isUUID(documentId)) {
    return res.status(400).json({ message: 'Invalid document ID format' });
  }

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
