import { createServer } from 'http';
import { Server as HocuspocusServer } from '@hocuspocus/server';
import { createHocuspocusServer } from '../../../websocket/websocketServer';
import { WebSocketServer } from 'ws';

jest.mock('@hocuspocus/server');
jest.mock('ws', () => ({
    WebSocketServer: jest.fn(() => ({
        on: jest.fn(),
        close: jest.fn(),
    })),
}));

jest.mock('@hocuspocus/extension-database', () => ({
    Database: jest.fn(() => ({
        fetch: jest.fn(),
        store: jest.fn(),
    })),
}));

describe('createHocuspocusServer', () => {
    let httpServer: any;
    let mockWebSocketServer: any;

    beforeEach(() => {
        httpServer = createServer();
        mockWebSocketServer = {
            on: jest.fn(),
            close: jest.fn(),
        };
        // Mock WebSocketServer to return a mock WebSocketServer instance
        (WebSocketServer as jest.MockedClass<typeof WebSocketServer>).mockReturnValue(mockWebSocketServer);

        // Mock HocuspocusServer.configure to return a mock Hocuspocus server
        (HocuspocusServer.configure as jest.Mock).mockReturnValue({
            handleConnection: jest.fn(),
            destroy: jest.fn().mockResolvedValueOnce(undefined), // Simulate async destroy
        });
    });

    afterEach(() => {
        httpServer.close();
        jest.clearAllMocks();
    });

    it('should create a Hocuspocus server and close WebSocket after destroy', async () => {
        const { close } = createHocuspocusServer(httpServer);

        expect(HocuspocusServer.configure).toHaveBeenCalledWith(expect.objectContaining({
            extensions: expect.any(Array),
            onAuthenticate: expect.any(Function),
        }));

        expect(WebSocketServer).toHaveBeenCalledWith({ server: httpServer });

        close()

        expect(mockWebSocketServer.close).toHaveBeenCalled();
    });
});
