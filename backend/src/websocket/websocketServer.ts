import { Server as HocuspocusServer } from "@hocuspocus/server";
import { Database } from '@hocuspocus/extension-database';
import { Document } from '../models/Document';
import jwt, { JwtPayload } from 'jsonwebtoken';

interface JwtPayloadWithId extends JwtPayload {
  id: string;
}

export const createHocuspocusServer = (httpServer: any) => {
  const hocuspocusServer = HocuspocusServer.configure({
    extensions: [
      new Database({
        fetch: async ({ socketId }) => {
          try {
            const document = await Document.findOne({ _id: socketId });
            return document ? Buffer.from(document.content, 'binary') : null;
          } catch (error) {
            throw error;
          }
        },
        store: async ({ state, context, socketId }) => {

          try {
            const existingDocument = await Document.findOne({ _id: socketId });

            if (existingDocument) {
              existingDocument.content = Buffer.from(state).toString('binary');
              existingDocument.versions.push({
                content: Buffer.from(state).toString('binary'),
                updatedBy: context.user?.id,
              });
              await existingDocument.save();
            }
          } catch (error) {
            throw error;
          }
        },
      }),
    ],
    onAuthenticate: async (data) => {
      const token = data.token

      if (!token) {
        throw new Error('Unauthorized');
      }

      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as JwtPayloadWithId;
        data.context.user = { id: decoded.id };
      } catch (err) {
        throw new Error('Forbidden');
      }
    },
    onConnect: async (data) => {
      console.log('Client connected', 'Authenticated user ID:', data.context.user?.id);
      return Promise.resolve();
    },
    onDisconnect: async (data) => {
      console.log('Client disconnected');
      return Promise.resolve();
    },
  });

  hocuspocusServer.listen(httpServer); // Attach Hocuspocus to the existing HTTP server
};
