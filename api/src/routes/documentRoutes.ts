import express from 'express';
import authenticateToken from '../middleware/authenticateToken';
import {
  getDocuments,
  createDocument,
  deleteDocument,
  getDocumentVersions,
  rollbackDocument,
} from '../controllers/documentsController';

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
router.get('/documents', getDocuments);

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
router.post('/documents', authenticateToken, createDocument);

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
router.delete('/documents/:id', authenticateToken, deleteDocument);

/**
 * @swagger
 * /documents/{documentId}/versions:
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
router.get('/documents/:documentId/versions', getDocumentVersions);

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
router.post('/rollback/:documentId/:versionId', authenticateToken, rollbackDocument);

export default router;
