import { createHocuspocusServer } from '../../../websocket/websocketServer';
import jwt from 'jsonwebtoken';
import { IncomingMessage, IncomingHttpHeaders } from 'http';
import { AddressInfo } from 'net';
import { onAuthenticatePayload } from '@hocuspocus/server';
import dotenv from 'dotenv'


jest.mock('jsonwebtoken');

describe('Hocuspocus WebSocket Server Tests', () => {
    let hocuspocusServer: ReturnType<typeof createHocuspocusServer>;
    const secretKey = "8sEJlZ8gO2WLQHkB";

    const mockAddressInfo: AddressInfo = {
        address: 'localhost',
        family: 'IPv4',
        port: 3000,
    };

    const mockDebouncer = {
        debounce: jest.fn(),
        isDebounced: jest.fn(),
        executeNow: jest.fn(),
    };

    const mockDebugger = {
        logs: [] as any[],
        listen: true,
        output: true,
        enable: jest.fn(),
        disable: jest.fn(),
        clear: jest.fn(),
        verbose: jest.fn(),
        quiet: jest.fn(),
        log: jest.fn(),
        flush: jest.fn(),
        get: jest.fn(),
    };

    const mockConfiguration = {
        name: 'test-server',
        extensions: [],
        timeout: 5000,
        debounce: 1000,
        maxDebounce: 5000,
        quiet: true,
        unloadImmediately: false,
        stopOnSignals: true,
        yDocOptions: { gc: true, gcFilter: jest.fn() },
    };

    beforeEach(() => {
        hocuspocusServer = createHocuspocusServer();
        hocuspocusServer.hocuspocusServer.configuration = mockConfiguration;
        hocuspocusServer.hocuspocusServer.debugger = mockDebugger;
        hocuspocusServer.hocuspocusServer.debouncer = mockDebouncer;
        jest.spyOn(hocuspocusServer.hocuspocusServer, 'requiresAuthentication', 'get').mockReturnValue(true);
        jest.spyOn(hocuspocusServer.hocuspocusServer, 'address', 'get').mockReturnValue(mockAddressInfo);
        dotenv.config()
    });

    afterEach(async () => {
        await hocuspocusServer.close();
        jest.clearAllMocks();
    });

    it('should authenticate with a valid token', async () => {
        const mockToken = 'valid.token.here';
        const mockDecodedToken = { id: 'user123' };

        (jwt.verify as jest.Mock).mockReturnValue(mockDecodedToken);

        const mockData: onAuthenticatePayload = {
            token: mockToken,
            context: { user: null },
            documentName: 'document-id',
            instance: hocuspocusServer.hocuspocusServer,
            requestHeaders: {} as IncomingHttpHeaders,
            requestParameters: new URLSearchParams(),
            request: {} as IncomingMessage,
            socketId: 'socket-id',
            connection: {
                readOnly: false,
                requiresAuthentication: true,
                isAuthenticated: true,
            },
        };

        hocuspocusServer.hocuspocusServer.configuration.onAuthenticate = jest.fn().mockImplementation(() => {
            jwt.verify(mockToken, secretKey);
            mockData.context.user = { id: 'user123' };
        });

        await hocuspocusServer.hocuspocusServer.configuration.onAuthenticate(mockData);

        expect(jwt.verify).toHaveBeenCalledWith(mockToken, secretKey);
        expect(mockData.context.user).toEqual({ id: 'user123' });
    });

    it('should throw an error if the token is missing', async () => {
        const mockData: onAuthenticatePayload = {
            token: '',
            context: { user: null },
            documentName: 'document-id',
            instance: hocuspocusServer.hocuspocusServer,
            requestHeaders: {} as IncomingHttpHeaders,
            requestParameters: new URLSearchParams(),
            request: {} as IncomingMessage,
            socketId: 'socket-id',
            connection: {
                readOnly: false,
                requiresAuthentication: true,
                isAuthenticated: false,
            },
        };

        hocuspocusServer.hocuspocusServer.configuration.onAuthenticate = jest
            .fn()
            .mockRejectedValueOnce(new Error('Unauthorized'));

        await expect(hocuspocusServer.hocuspocusServer.configuration.onAuthenticate(mockData))
            .rejects.toThrow('Unauthorized');
    });

    it('should return 403 if jwt verification fails', async () => {
        const mockToken = 'invalid.token.here';

        (jwt.verify as jest.Mock).mockImplementation(() => {
            throw new Error('Invalid token');
        });

        const mockData: onAuthenticatePayload = {
            token: mockToken,
            context: { user: null },
            documentName: 'document-id',
            instance: hocuspocusServer.hocuspocusServer,
            requestHeaders: {} as IncomingHttpHeaders,
            requestParameters: new URLSearchParams(),
            request: {} as IncomingMessage,
            socketId: 'socket-id',
            connection: {
                readOnly: false,
                requiresAuthentication: true,
                isAuthenticated: false,
            },
        };

        hocuspocusServer.hocuspocusServer.configuration.onAuthenticate = jest
            .fn()
            .mockRejectedValueOnce(new Error('Forbidden'));

        await expect(hocuspocusServer.hocuspocusServer.configuration.onAuthenticate(mockData))
            .rejects.toThrow('Forbidden');
    });
});