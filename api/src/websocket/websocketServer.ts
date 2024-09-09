import { Server as HocuspocusServer } from "@hocuspocus/server";
import { Database } from '@hocuspocus/extension-database';
import { Document } from '../models/Document';
import jwt, { JwtPayload } from 'jsonwebtoken';
import { Server } from "http";
import { WebSocketServer } from 'ws';
import validator from 'validator';
import DOMPurify from 'dompurify';
import { JSDOM } from 'jsdom';

const window = new JSDOM('').window;
const purify = DOMPurify(window);

interface JwtPayloadWithId extends JwtPayload {
  id: string;
}

export const createHocuspocusServer = (httpServer: Server) => {
  const hocuspocusServer = HocuspocusServer.configure({
    extensions: [
      new Database({
        fetch: async ({ requestParameters }) => {
          const roomId = requestParameters.get('roomId');

          if (!roomId || !validator.isUUID(roomId)) {
            throw new Error('Invalid room ID');
          }

          try {
            const document = await Document.findOne({ _id: roomId });
            if (!document) {
              return null;
            }

            if (Buffer.isBuffer(document.content) && document.content.length > 0) {
              const contentBase64 = document.content.toString('base64');
              const contentString = Buffer.from(contentBase64, 'base64').toString('utf-8');
              const sanitizedContentString = purify.sanitize(contentString);
              const sanitizedContentBase64 = Buffer.from(sanitizedContentString, 'utf-8').toString('base64');

              return new Uint8Array(Buffer.from(sanitizedContentBase64, 'base64'));
            } else {
              return null;
            }
          } catch (error) {
            throw error;
          }
        },
        store: async ({ state, context, requestParameters }) => {
          const roomId = requestParameters.get('roomId');

          if (!roomId || !validator.isUUID(roomId)) {
            throw new Error('Invalid room ID');
          }

          try {
            let sanitizedState = state;

            if (Buffer.isBuffer(state)) {
              const stateBase64 = state.toString('base64');
              const stateString = Buffer.from(stateBase64, 'base64').toString('utf-8');
              const sanitizedString = purify.sanitize(stateString);
              const sanitizedBase64 = Buffer.from(sanitizedString, 'utf-8').toString('base64');
              sanitizedState = Buffer.from(sanitizedBase64, 'base64');
            }

            let existingDocument = await Document.findOne({ _id: roomId });

            if (Buffer.isBuffer(sanitizedState) && sanitizedState.length > 0) {
              if (existingDocument) {
                existingDocument.content = sanitizedState;
                existingDocument.versions.push({
                  content: sanitizedState,
                  updatedBy: context.user?.id,
                });
              } else {
                existingDocument = new Document({
                  _id: roomId,
                  title: roomId,
                  content: sanitizedState,
                  versions: [{
                    content: sanitizedState,
                    updatedBy: context.user?.id,
                  }],
                  createdBy: context.user?.id,
                });
              }
              await existingDocument.save();
            } else {
              return;
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

  const wss = new WebSocketServer({ server: httpServer });
  wss.on('connection', (ws, req) => {
    hocuspocusServer.handleConnection(ws, req);
  });
};
