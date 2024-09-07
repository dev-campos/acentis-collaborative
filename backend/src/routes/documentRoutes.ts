
import express, { Request, Response } from 'express';
import { Document } from '../models/Document';
import authenticateToken from '../middleware/authenticateToken';
import { AuthenticatedRequest } from 'src/types/AuthenticatedRequest';


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
 *       500:
 *         description: Error creating document
 */
router.post('/documents', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  const { id, title } = req.body;
  const userId = req.user?.id;


  try {
    const newDocument = new Document({
      _id: id,
      title,
      content: '',
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
 * /rollback/{documentId}/{versionIndex}:
 *   post:
 *     summary: Rollback document to a previous version
 *     tags: [Documents]
 *     parameters:
 *       - name: documentId
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *       - name: versionIndex
 *         in: path
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Document rolled back successfully
 *       404:
 *         description: Version not found
 *       500:
 *         description: Error rolling back document
 */
router.post('/rollback/:documentId/:versionIndex', async (req, res) => {
  const { documentId, versionIndex } = req.params;

  try {
    const document = await Document.findById(documentId);

    if (document && document.versions[Number(versionIndex)]) {
      const previousVersion = document.versions[Number(versionIndex)];
      document.content = previousVersion.content;

      document.versions.push({
        content: previousVersion.content,
        updatedBy: `rollback_to_${versionIndex}`,
      });

      await document.save();

      return res.status(200).json({ message: 'Document rolled back', content: document.content });
    }

    return res.status(404).json({ message: 'Version not found' });
  } catch (error) {
    return res.status(500).json({ message: 'Error rolling back document', error });
  }
});


export default router;
