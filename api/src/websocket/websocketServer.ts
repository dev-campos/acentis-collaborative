import { Server as HocuspocusServer } from "@hocuspocus/server";
import { Throttle } from "@hocuspocus/extension-throttle";
import { Database } from '@hocuspocus/extension-database';
import { Document } from '../models/Document';
import jwt, { JwtPayload } from 'jsonwebtoken';
import { Server } from "http";
import { WebSocketServer } from 'ws';
import validator from 'validator';

interface JwtPayloadWithId extends JwtPayload {
  id: string;
}

export const createHocuspocusServer = (httpServer: Server) => {

  const throttleExtension = new Throttle({ throttle: 15, banTime: 5 })
  const hocuspocusServer = HocuspocusServer.configure({
    extensions: [
      throttleExtension,
      new Database({
        fetch: async ({ requestParameters }) => {
          const roomId = requestParameters.get('roomId');
          if (!roomId || !validator.isMongoId(roomId)) throw new Error('Invalid room ID');

          try {
            const document = await Document.findOne({ _id: roomId });
            if (!document) {
              return null;
            }

            if (Buffer.isBuffer(document.content) && document.content.length > 0) {
              return new Uint8Array(document.content);
            } else {
              return null;
            }
          } catch (error) {
            throw error;
          }
        },
        store: async ({ state, context, requestParameters }) => {
          const roomId = requestParameters.get('roomId');
          if (!roomId || !validator.isMongoId(roomId)) throw new Error('Invalid room ID');

          try {
            const existingDocument = await Document.findOne({ _id: roomId });

            if (Buffer.isBuffer(state) && state.length > 0) {
              if (existingDocument) {
                existingDocument.content = state;
                existingDocument.versions.push({
                  content: state,
                  updatedBy: context.user?.id,
                });
              } else {
                const newDocument = new Document({
                  _id: roomId,
                  content: state,
                  versions: [{ content: state, updatedBy: context.user?.id }],
                  createdBy: context.user?.id,
                });
                await newDocument.save();
              }
              await existingDocument?.save();
            }
          } catch (error) {
            throw error;
          }
        },
      }),
    ],
    onAuthenticate: async (data) => {
      const token = data.token;
      if (!token) throw new Error('Unauthorized');

      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as JwtPayloadWithId;
        data.context.user = { id: decoded.id };
      } catch (err) {
        throw new Error('Forbidden');
      }
    },
  });

  const wss = new WebSocketServer({ server: httpServer });

  wss.on('connection', (ws, req) => {
    hocuspocusServer.handleConnection(ws, req);
  });

  return {
    close: async () => {
      if (throttleExtension.cleanupInterval) {
        clearInterval(throttleExtension.cleanupInterval as NodeJS.Timeout);
      }
      wss.close();
      await hocuspocusServer.destroy();
    }
  };
};
