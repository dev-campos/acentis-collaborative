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
        fetch: async ({ requestParameters }) => {
          const roomId = requestParameters.get('roomId');
          try {
            const document = await Document.findOne({ _id: roomId });
            if (!document) {
              return null;
            }

            if (Buffer.isBuffer(document.content) && document.content.length > 0) {
              return new Uint8Array(document.content);
            } else {
              console.error('Document content buffer is empty or invalid:', document.content);
              return null;
            }
          } catch (error) {
            throw error;
          }
        },
        store: async ({ state, context, requestParameters }) => {
          const roomId = requestParameters.get('roomId');
          try {
            let existingDocument = await Document.findOne({ _id: roomId });

            if (Buffer.isBuffer(state) && state.length > 0) {
              if (existingDocument) {
                existingDocument.content = state;
                existingDocument.versions.push({
                  content: state,
                  updatedBy: context.user?.id,
                });
              } else {
                existingDocument = new Document({
                  _id: roomId,
                  title: roomId,
                  content: state,
                  versions: [{
                    content: state,
                    updatedBy: context.user?.id,
                  }],
                  createdBy: context.user?.id,
                });
              }
              await existingDocument.save();
            } else {
              console.error('State buffer is empty or invalid:', state);
            }
          } catch (error) {
            throw error;
          }
        },
      }),
    ],
    onAuthenticate: async (data) => {
      const token = data.token;
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
      return Promise.resolve();
    },
    onDisconnect: async (data) => {
      return Promise.resolve();
    },
  });

  hocuspocusServer.listen(httpServer);
};
