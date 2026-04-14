import { Node, mergeAttributes } from '@tiptap/core';
import { ReactNodeViewRenderer } from '@tiptap/react';
import EquationBlock from './EquationBlock';

export const EquationExtension = Node.create({
  name: 'equation',
  group: 'block',
  atom: true,

  addAttributes() {
    return {
      formula: { default: '' },
      display: { default: true },
    };
  },

  parseHTML() {
    return [{ tag: 'equation-block' }];
  },

  renderHTML({ HTMLAttributes }) {
    return ['equation-block', mergeAttributes(HTMLAttributes)];
  },

  addNodeView() {
    return ReactNodeViewRenderer(EquationBlock);
  },
});