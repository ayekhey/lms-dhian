import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import Heading from '@tiptap/extension-heading';
import Link from '@tiptap/extension-link';
import Image from '@tiptap/extension-image';
import { ShowHideExtension } from './ShowHideExtension';
import { EquationExtension } from './EquationExtension';
import { VideoExtension } from './VideoExtension';
import { useRef } from 'react';

const ToolbarButton = ({ onClick, active, children, title }) => (
  <button
    onClick={onClick}
    title={title}
    style={{
      padding: '4px 8px',
      borderRadius: '6px',
      border: active ? '1px solid #3b82f6' : '1px solid transparent',
      backgroundColor: active ? '#eff6ff' : 'transparent',
      color: active ? '#1d4ed8' : '#64748b',
      cursor: 'pointer',
      fontSize: '13px',
      fontWeight: 600,
      fontFamily: 'inherit',
      lineHeight: 1,
    }}
  >
    {children}
  </button>
);

const Sep = () => <div style={{ width: '1px', height: '16px', backgroundColor: '#e2e8f0', margin: '0 4px' }} />;

export default function ModuleEditor({ content, onChange }) {
  const imageInputRef = useRef(null);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({ heading: false }),
      Underline,
      Heading.configure({ levels: [1, 2, 3] }),
      Link.configure({ openOnClick: false, HTMLAttributes: { target: '_blank', rel: 'noopener noreferrer' } }),
      Image,
      ShowHideExtension,
      EquationExtension,
      VideoExtension,
    ],
    content: content || '',
    onUpdate: ({ editor }) => {
      onChange(editor.getJSON());
    },
  });

  if (!editor) return null;

  const addShowHideBlock = () => {
    editor.chain().focus().insertContent({
      type: 'showHideBlock',
      attrs: { content: '', label: 'Show more', type: 'extend' },
    }).run();
  };

  const addEquation = () => {
    editor.chain().focus().insertContent({
      type: 'equation',
      attrs: { formula: '', display: true },
    }).run();
  };

  const addVideo = () => {
    editor.chain().focus().insertContent({
      type: 'videoEmbed',
      attrs: { url: '', embedUrl: '' },
    }).run();
  };

  const addLink = () => {
  const url = window.prompt('Enter URL:');
  if (!url) return;
  const href = url.startsWith('http') ? url : `https://${url}`;
  if (editor.state.selection.empty) {
    // No text selected — insert the URL as clickable text
    editor.chain().focus().insertContent(`<a href="${href}">${href}</a>`).run();
  } else {
    // Text is selected — wrap it with the link
    editor.chain().focus().setLink({ href }).run();
  }
};

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      editor.chain().focus().setImage({ src: ev.target.result }).run();
    };
    reader.readAsDataURL(file);
  };

  return (
    <div style={{ border: '1.5px solid #e2e8f0', borderRadius: '12px', overflow: 'hidden', backgroundColor: '#ffffff' }}>
      <style>{`
        .ProseMirror { outline: none; padding: 24px 28px; min-height: 300px; font-size: 15px; line-height: 1.75; color: #374151; }
        .ProseMirror p { margin: 0 0 12px; }
        .ProseMirror h1 { font-size: 22px; font-weight: 800; margin: 0 0 12px; color: #0f172a; }
        .ProseMirror h2 { font-size: 18px; font-weight: 700; margin: 0 0 12px; color: #0f172a; }
        .ProseMirror h3 { font-size: 16px; font-weight: 600; margin: 0 0 12px; color: #0f172a; }
        .ProseMirror ul { padding-left: 20px; margin: 0 0 12px; }
        .ProseMirror ol { padding-left: 20px; margin: 0 0 12px; }
        .ProseMirror li { margin-bottom: 4px; }
        .ProseMirror strong { font-weight: 700; color: #0f172a; }
        .ProseMirror a { color: #2563eb; text-decoration: underline; cursor: pointer; }
        .ProseMirror img { max-width: 100%; border-radius: 8px; margin: 8px 0; }
        .ProseMirror p.is-editor-empty:first-child::before { color: #94a3b8; content: attr(data-placeholder); float: left; height: 0; pointer-events: none; }
      `}</style>

      {/* Toolbar */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: '2px',
        padding: '8px 12px', borderBottom: '1px solid #e2e8f0',
        backgroundColor: '#f8fafc', flexWrap: 'wrap', rowGap: '4px',
      }}>
        <ToolbarButton onClick={() => editor.chain().focus().toggleBold().run()} active={editor.isActive('bold')} title="Bold"><strong>B</strong></ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().toggleItalic().run()} active={editor.isActive('italic')} title="Italic"><em>I</em></ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().toggleUnderline().run()} active={editor.isActive('underline')} title="Underline"><u>U</u></ToolbarButton>

        <Sep />

        <ToolbarButton onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()} active={editor.isActive('heading', { level: 1 })} title="Heading 1">H1</ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} active={editor.isActive('heading', { level: 2 })} title="Heading 2">H2</ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()} active={editor.isActive('heading', { level: 3 })} title="Heading 3">H3</ToolbarButton>

        <Sep />

        <ToolbarButton onClick={() => editor.chain().focus().toggleBulletList().run()} active={editor.isActive('bulletList')} title="Bullet list">• List</ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().toggleOrderedList().run()} active={editor.isActive('orderedList')} title="Numbered list">1. List</ToolbarButton>

        <Sep />

        <ToolbarButton onClick={addLink} active={editor.isActive('link')} title="Add link">🔗 Link</ToolbarButton>

        <ToolbarButton
          onClick={() => imageInputRef.current?.click()}
          title="Upload image"
        >
          🖼 Image
        </ToolbarButton>
        <input ref={imageInputRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleImageUpload} />

        <ToolbarButton onClick={addVideo} title="Embed video">▶ Video</ToolbarButton>

        <ToolbarButton onClick={addEquation} title="Insert equation">∑ Equation</ToolbarButton>

        <Sep />

        <button
          onClick={addShowHideBlock}
          style={{
            padding: '5px 12px', borderRadius: '6px',
            border: '1px solid #bfdbfe', backgroundColor: '#eff6ff',
            color: '#1d4ed8', cursor: 'pointer', fontSize: '12px',
            fontWeight: 600, fontFamily: 'inherit',
          }}
        >
          + Show/hide block
        </button>
      </div>

      <EditorContent editor={editor} />
    </div>
  );
}