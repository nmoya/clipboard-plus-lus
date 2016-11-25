'use babel';

import { CompositeDisposable, Disposable } from 'atom'

export default {

  subscriptions: null,
  isActive: true,
  copyStack: [],

  activate() {
    this.subscriptions = new CompositeDisposable()
    this.subscriptions.add(atom.commands.add('atom-workspace', {
      'clipboard-plus-plus:toggle': () => this.toggle()
    }));
    this.subscriptions.add(this.wrapClipboard());
  },

  wrapClipboard() {
    const clipboard = atom.clipboard;
    const write = clipboard.write
    const readWithMetadata = clipboard.readWithMetadata
    clipboard.write = (text, metadata = {}) => {
      write.call(clipboard, text, metadata);
      this.push(text);
    }

    clipboard.readWithMetadata = () => {
      const stackContent = this.pop();
      const result = readWithMetadata.call(clipboard);
      if (result.metadata) {
        if (stackContent && this.isActive) {
          result.text = stackContent;
        }
      } else {
        this.clearStack();
      }
      return result;
    }

    return new Disposable(() => {
      clipboard.write = write;
      clipboard.readWithMetadata = readWithMetadata;
    });
  },

  deactivate() {
    this.subscriptions.dispose()
  },

  push(content) {
    this.copyStack.push(content);
    console.log(this.copyStack);
  },

  pop() {
    if (this.copyStack.length == 0)
      return null;
    else if (this.copyStack.length == 1)
      return this.copyStack[0];
    else
      return this.copyStack.pop();
  },

  clearStack() {
    this.copyStack = [];
  },

  toggle() {
    this.isActive = !this.isActive;
  }
};