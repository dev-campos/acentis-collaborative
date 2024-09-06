import { PlainExtension } from '@remirror/core';
import { ySyncPlugin, yUndoPlugin } from 'y-prosemirror';
import * as Y from 'yjs';

export class YjsCollaborationExtension extends PlainExtension {
    get name() {
        return 'yjsCollaboration' as const;
    }

    constructor(private yXmlFragment: Y.XmlFragment) {
        super();
    }

    createExternalPlugins() {
        return [ySyncPlugin(this.yXmlFragment), yUndoPlugin()];
    }

    createCommands() {
        return {};
    }
}
