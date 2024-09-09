import express, { Request, Response } from 'express';
import { Document } from '../models/Document';
import authenticateToken from '../middleware/authenticateToken';
import { AuthenticatedRequest } from 'src/types/AuthenticatedRequest';
import validator from 'validator';

const router = express.Router();

/**
 * @swagger
 * /documents:
 *   get:
 *     summary: Get all documents
 *     tags: [Documents]
 *     responses:
 *       200:
 *         description: A list of documents
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   _id:
 *                     type: string
 *                   title:
 *                     type: string
 *       500:
 *         description: Error fetching documents
 */
router.get('/documents', async (_, res) => {
  try {
    const documents = await Document.find();
    if (!documents.length) {
      return res.status(200).json([]);
    }
    return res.status(200).json(documents);
  } catch (error) {
    return res.status(500).json({ message: 'Error fetching documents', error });
  }
});

/**
 * @swagger
 * /documents:
 *   post:
 *     summary: Create a new document
 *     tags: [Documents]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *             properties:
 *               title:
 *                 type: string
 *     responses:
 *       201:
 *         description: Document created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 _id:
 *                   type: string
 *                 title:
 *                   type: string
 *                 content:
 *                   type: string
 *                 createdBy:
 *                   type: string
 *       500:
 *         description: Error creating document
 */
router.post('/documents', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  let { id, title } = req.body;
  const userId = req.user?.id;

  try {
    if (!validator.isUUID(id)) {
      return res.status(400).json({ message: 'Invalid document ID format' });
    }

    if (!validator.isLength(title, { min: 1 })) {
      return res.status(400).json({ message: 'Title cannot be empty' });
    }

    const newDocument = new Document({
      _id: id,
      title: validator.escape(title),
      content: Buffer.from(''),
      versions: [],
      createdBy: userId
    });
    await newDocument.save();
    return res.status(201).json(newDocument);
  } catch (error) {
    return res.status(500).json({ message: 'Error creating document', error });
  }
});

/**
 * @swagger
 * /documents/{id}:
 *   delete:
 *     summary: Delete a document
 *     tags: [Documents]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Document deleted successfully
 *       403:
 *         description: You do not have permission to delete this document
 *       404:
 *         description: Document not found
 *       500:
 *         description: Error deleting document
 */
router.delete('/documents/:id', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  const documentId = req.params.id;
  const userId = req.user?.id;

  if (!validator.isUUID(documentId)) {
    return res.status(400).json({ message: 'Invalid document ID format' });
  }

  try {
    const document = await Document.findById(documentId);
    if (!document) {
      return res.status(404).json({ message: 'Document not found' });
    }
    if (document.createdBy.toString() !== userId) {
      return res.status(403).json({ message: 'You do not have permission to delete this document' });
    }
    await Document.findByIdAndDelete(documentId);
    return res.status(200).json({ message: 'Document deleted successfully' });
  } catch (error) {
    return res.status(500).json({ message: 'Error deleting document', error });
  }
});

/**
 * @swagger
 * /rollback/{documentId}/{versionId}:
 *   post:
 *     summary: Rollback document to a previous version
 *     tags: [Documents]
 *     parameters:
 *       - name: documentId
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *       - name: versionId
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Document rolled back successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 content:
 *                   type: string
 *       404:
 *         description: Version not found
 *       500:
 *         description: Error rolling back document
 */
router.post('/rollback/:documentId/:versionId', async (req, res) => {
  const { documentId, versionId } = req.params;

  if (!validator.isUUID(documentId)) {
    return res.status(400).json({ message: 'Invalid document ID format' });
  }

  if (!validator.isMongoId(versionId)) {
    return res.status(400).json({ message: 'Invalid version ID format' });
  }

  try {
    const document = await Document.findById(documentId);

    if (document) {
      const previousVersion = document.versions.find(version => version._id.toString() === versionId);

      if (!previousVersion) {
        return res.status(404).json({ message: 'Version not found' });
      }

      document.content = Buffer.from(previousVersion.content);

      document.versions.push({
        content: Buffer.from(previousVersion.content),
        updatedBy: `rollback_to_${versionId}`,
      });

      await document.save();

      return res.status(200).json({ message: 'Document rolled back', content: document.content });
    }

    return res.status(404).json({ message: 'Document not found' });
  } catch (error) {
    return res.status(500).json({ message: 'Error rolling back document', error });
  }
});

export default router;
