import { Node, mergeAttributes } from '@tiptap/core';
import { ReactNodeViewRenderer } from '@tiptap/react';
import ShowHideBlock from './ShowHideBlock';

export const ShowHideExtension = Node.create({
  name: 'showHideBlock',
  group: 'block',
  atom: true,

  addAttributes() {
    return {
      content: { default: '' },
      label: { default: 'Show more' },
      type: { default: 'extend' }, // 'extend' | 'help' | 'all'
    };
  },

  parseHTML() {
    return [{ tag: 'show-hide-block' }];
  },

  renderHTML({ HTMLAttributes }) {
    return ['show-hide-block', mergeAttributes(HTMLAttributes)];
  },

  addNodeView() {
    return ReactNodeViewRenderer(ShowHideBlock);
  },
});