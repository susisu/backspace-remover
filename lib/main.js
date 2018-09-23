"use babel";

import { CompositeDisposable } from "atom";

const PKGNAME = "backspace-remover";

class BackspaceRemover {
  constructor() {
    this.editors = new Map();
    this.subscriptions = new CompositeDisposable();
  }

  activate() {
    this.subscriptions.add(atom.workspace.observeTextEditors(editor => {
      const editorSubscriptions = new CompositeDisposable();
      this.editors.set(editor, editorSubscriptions);
      editorSubscriptions.add(editor.onDidDestroy(() => {
        if (this.editors.has(editor)) {
          this.editors.get(editor).dispose();
          this.editors.delete(editor);
        }
      }));
      editorSubscriptions.add(editor.getBuffer().onWillSave(() => {
        if (atom.config.get(`${PKGNAME}.enabled`, { scope: editor.getRootScopeDescriptor() })) {
          editor.scan(/\u0008/g, ({ replace }) => {
            replace("");
          });
        }
      }));
    }));
  }

  deactivate() {
    this.subscriptions.dispose();
    for (const editorSubscriptions of this.editors.values()) {
      editorSubscriptions.destroy();
    }
    this.editors.clear();
  }

  serialize() {
  }
}

module.exports = new BackspaceRemover();
