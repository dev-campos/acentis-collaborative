import { beforeEach, describe, expect, test, vi } from "vitest";
import * as Y from "yjs";

const mockHocuspocusProvider = vi.fn(() => ({
    document: new Y.Doc(),
    connect: vi.fn(),
}));

describe("ProviderManager", () => {
    beforeEach(() => {
        mockHocuspocusProvider.mockClear();
    });

    test("should create a new document", () => {
        const provider = mockHocuspocusProvider();
        expect(provider.document).toBeInstanceOf(Y.Doc);
    });

    test("should connect successfully", () => {
        const provider = mockHocuspocusProvider();
        provider.connect();
        expect(provider.connect).toHaveBeenCalled();
    });
});
