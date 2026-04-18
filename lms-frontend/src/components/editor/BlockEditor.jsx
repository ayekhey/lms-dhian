import { useState, useCallback } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import Heading from '@tiptap/extension-heading';
import Link from '@tiptap/extension-link';
import Image from '@tiptap/extension-image';
import { ShowHideExtension } from './ShowHideExtension';
import { EquationExtension } from './EquationExtension';
import { VideoExtension } from './VideoExtension';

const BLOCK_TYPES = {
  MAIN: 'main',
  SHOW_HIDE: 'show_hide',
  QUIZ: 'quiz',
};

function useBlockEditor(initialContent, onChange) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({ heading: false }),
      Underline,
      Heading.configure({ levels: [1, 2, 3] }),
      Link.configure({ openOnClick: false, HTMLAttributes: { target: '_blank' } }),
      Image,
      ShowHideExtension,
      EquationExtension,
      VideoExtension,
    ],
    content: initialContent || '',
    onUpdate: ({ editor }) => onChange(editor.getJSON()),
  });
  return editor;
}

function MiniToolbar({ editor, imageInputRef }) {
  if (!editor) return null;

  const addLink = () => {
    const url = window.prompt('Enter URL:');
    if (!url) return;
    const href = url.startsWith('http') ? url : `https://${url}`;
    if (editor.state.selection.empty) {
      editor.chain().focus().insertContent(`<a href="${href}">${href}</a>`).run();
    } else {
      editor.chain().focus().setLink({ href }).run();
    }
  };

  return (
    <div style={ts.toolbar}>
      <button onClick={() => editor.chain().focus().toggleBold().run()} style={{ ...ts.tb, ...(editor.isActive('bold') ? ts.tbActive : {}) }}><strong>B</strong></button>
      <button onClick={() => editor.chain().focus().toggleItalic().run()} style={{ ...ts.tb, ...(editor.isActive('italic') ? ts.tbActive : {}) }}><em>I</em></button>
      <button onClick={() => editor.chain().focus().toggleUnderline().run()} style={{ ...ts.tb, ...(editor.isActive('underline') ? ts.tbActive : {}) }}><u>U</u></button>
      <div style={ts.sep} />
      <button onClick={addLink} style={{ ...ts.tb, ...(editor.isActive('link') ? ts.tbActive : {}) }}>Link</button>
      {imageInputRef && (
        <button onClick={() => imageInputRef.current?.click()} style={ts.tb}>Image</button>
      )}
      <div style={ts.sep} />
      <button onClick={() => editor.chain().focus().insertContent({ type: 'equation', attrs: { formula: '', display: true } }).run()} style={ts.tb}>Eq</button>
    </div>
  );
}

const ts = {
  toolbar: { display: 'flex', alignItems: 'center', gap: '3px', padding: '6px 10px', borderBottom: '0.5px solid #e2e8f0', backgroundColor: '#f8fafc', flexWrap: 'wrap' },
  tb: { fontSize: '12px', padding: '3px 7px', borderRadius: '6px', border: '0.5px solid transparent', color: '#64748b', cursor: 'pointer', backgroundColor: 'transparent', fontFamily: 'inherit' },
  tbActive: { backgroundColor: '#eff6ff', border: '0.5px solid #3b82f6', color: '#1d4ed8' },
  sep: { width: '0.5px', height: '13px', backgroundColor: '#e2e8f0', margin: '0 2px' },
};

function FullToolbar({ editor }) {
  if (!editor) return null;

  const addLink = () => {
    const url = window.prompt('Enter URL:');
    if (!url) return;
    const href = url.startsWith('http') ? url : `https://${url}`;
    if (editor.state.selection.empty) {
      editor.chain().focus().insertContent(`<a href="${href}">${href}</a>`).run();
    } else {
      editor.chain().focus().setLink({ href }).run();
    }
  };

  const handleImage = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => editor.chain().focus().setImage({ src: ev.target.result }).run();
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const addVideo = () => {
    editor.chain().focus().insertContent({ type: 'videoEmbed', attrs: { url: '', embedUrl: '' } }).run();
  };

  return (
    <div style={{ ...ts.toolbar, backgroundColor: '#f8fafc' }}>
      <style>{`.ProseMirror{outline:none;padding:16px;min-height:80px;font-size:15px;line-height:1.75;color:#374151}.ProseMirror p{margin:0 0 10px}.ProseMirror h1{font-size:22px;font-weight:800;margin:0 0 10px;color:#0f172a}.ProseMirror h2{font-size:18px;font-weight:700;margin:0 0 10px;color:#0f172a}.ProseMirror h3{font-size:16px;font-weight:600;margin:0 0 10px;color:#0f172a}.ProseMirror ul,.ProseMirror ol{padding-left:20px;margin:0 0 10px}.ProseMirror li{margin-bottom:4px}.ProseMirror strong{font-weight:700;color:#0f172a}.ProseMirror a{color:#2563eb;text-decoration:underline}.ProseMirror img{max-width:100%;border-radius:8px;margin:8px 0}`}</style>
      <button onClick={() => editor.chain().focus().toggleBold().run()} style={{ ...ts.tb, ...(editor.isActive('bold') ? ts.tbActive : {}) }}><strong>B</strong></button>
      <button onClick={() => editor.chain().focus().toggleItalic().run()} style={{ ...ts.tb, ...(editor.isActive('italic') ? ts.tbActive : {}) }}><em>I</em></button>
      <button onClick={() => editor.chain().focus().toggleUnderline().run()} style={{ ...ts.tb, ...(editor.isActive('underline') ? ts.tbActive : {}) }}><u>U</u></button>
      <div style={ts.sep} />
      <button onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()} style={{ ...ts.tb, ...(editor.isActive('heading', { level: 1 }) ? ts.tbActive : {}) }}>H1</button>
      <button onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} style={{ ...ts.tb, ...(editor.isActive('heading', { level: 2 }) ? ts.tbActive : {}) }}>H2</button>
      <div style={ts.sep} />
      <button onClick={() => editor.chain().focus().toggleBulletList().run()} style={{ ...ts.tb, ...(editor.isActive('bulletList') ? ts.tbActive : {}) }}>• List</button>
      <button onClick={() => editor.chain().focus().toggleOrderedList().run()} style={{ ...ts.tb, ...(editor.isActive('orderedList') ? ts.tbActive : {}) }}>1. List</button>
      <div style={ts.sep} />
      <button onClick={addLink} style={{ ...ts.tb, ...(editor.isActive('link') ? ts.tbActive : {}) }}>Link</button>
      <label style={{ ...ts.tb, cursor: 'pointer' }}>
        Image
        <input type="file" accept="image/*" style={{ display: 'none' }} onChange={handleImage} />
      </label>
      <button onClick={addVideo} style={ts.tb}>Video</button>
      <button onClick={() => editor.chain().focus().insertContent({ type: 'equation', attrs: { formula: '', display: true } }).run()} style={ts.tb}>Eq</button>
    </div>
  );
}

function MainBlock({ block, onChange, onRemove, isOnly }) {
  const editor = useBlockEditor(block.content, (json) => onChange({ ...block, content: json }));
  return (
    <div style={bs.block}>
      <div style={bs.head}>
        <div style={bs.headLeft}>
          <div style={{ ...bs.dot, background: '#185FA5' }} />
          <span style={bs.label}>Main content</span>
          <span style={{ ...bs.badge, background: '#E6F1FB', color: '#0C447C' }}>All students</span>
        </div>
        {!isOnly && <button onClick={onRemove} style={bs.remove}>✕</button>}
      </div>
      <FullToolbar editor={editor} />
      <EditorContent editor={editor} />
    </div>
  );
}

function ShowHideBlock({ block, onChange, onRemove }) {
  const editor = useBlockEditor(block.content, (json) => onChange({ ...block, content: json }));
  const tierOptions = [
    { value: 'extend', label: 'Extend (Tier 2+)', bg: '#E6F1FB', color: '#0C447C', border: '#B5D4F4', dot: '#378ADD' },
    { value: 'help', label: 'Help (Tier 3)', bg: '#FAEEDA', color: '#633806', border: '#FAC775', dot: '#BA7517' },
    { value: 'all', label: 'All students', bg: '#E1F5EE', color: '#085041', border: '#9FE1CB', dot: '#1D9E75' },
  ];
  const tierInfo = tierOptions.find(t => t.value === block.tier) || tierOptions[0];

  return (
    <div style={bs.block}>
      <div style={bs.head}>
        <div style={bs.headLeft}>
          <div style={{ ...bs.dot, background: tierInfo.dot }} />
          <span style={bs.label}>Show/hide block</span>
        </div>
        <button onClick={onRemove} style={bs.remove}>✕</button>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 12px', borderBottom: '0.5px solid #e2e8f0' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '11px', color: '#64748b' }}>Label:</span>
          <input
            value={block.label || 'Show more'}
            onChange={e => onChange({ ...block, label: e.target.value })}
            style={{ fontSize: '11px', border: '0.5px solid #e2e8f0', borderRadius: '4px', padding: '2px 7px', backgroundColor: '#ffffff', color: '#374151', width: '100px', fontFamily: 'inherit' }}
          />
        </div>
        <select
          value={block.tier || 'extend'}
          onChange={e => onChange({ ...block, tier: e.target.value })}
          style={{ fontSize: '11px', padding: '3px 8px', borderRadius: '6px', border: `0.5px solid ${tierInfo.border}`, backgroundColor: tierInfo.bg, color: tierInfo.color, cursor: 'pointer', fontFamily: 'inherit' }}
        >
          {tierOptions.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
        </select>
      </div>
      <MiniToolbar editor={editor} />
      <EditorContent editor={editor} />
    </div>
  );
}

function OptionEditor({ content, onChange, isCorrect }) {
  const editor = useBlockEditor(content, onChange);
  return (
    <div style={{ border: `0.5px solid ${isCorrect ? '#639922' : '#e2e8f0'}`, borderRadius: '8px', overflow: 'hidden', backgroundColor: isCorrect ? '#EAF3DE' : '#f8fafc', flex: 1 }}>
      <div style={{ ...ts.toolbar, backgroundColor: isCorrect ? '#EAF3DE' : '#f8fafc', borderBottomColor: isCorrect ? '#C0DD97' : '#e2e8f0' }}>
        <button onClick={() => editor?.chain().focus().toggleBold().run()} style={{ ...ts.tb, color: isCorrect ? '#27500A' : '#64748b' }}><strong>B</strong></button>
        <button onClick={() => editor?.chain().focus().toggleItalic().run()} style={{ ...ts.tb, color: isCorrect ? '#27500A' : '#64748b' }}><em>I</em></button>
        <div style={ts.sep} />
        <button onClick={() => editor?.chain().focus().insertContent({ type: 'equation', attrs: { formula: '', display: false } }).run()} style={{ ...ts.tb, color: isCorrect ? '#27500A' : '#64748b' }}>Eq</button>
      </div>
      <EditorContent editor={editor} />
    </div>
  );
}

function QuizBlock({ block, onChange, onRemove }) {
  const questionEditor = useBlockEditor(
    block.question,
    (json) => onChange({ ...block, question: json })
  );

  const updateOption = (i, content) => {
    const opts = [...(block.options || ['', '', '', '', ''])];
    opts[i] = content;
    onChange({ ...block, options: opts });
  };

  const labels = ['A', 'B', 'C', 'D', 'E'];
  const options = block.options || ['', '', '', '', ''];

  return (
    <div style={bs.block}>
      <div style={bs.head}>
        <div style={bs.headLeft}>
          <div style={{ ...bs.dot, background: '#639922' }} />
          <span style={bs.label}>Quiz</span>
          <span style={{ ...bs.badge, background: '#EAF3DE', color: '#27500A' }}>5 options</span>
        </div>
        <button onClick={onRemove} style={bs.remove}>✕</button>
      </div>

      {/* Question */}
      <div style={{ borderBottom: '0.5px solid #e2e8f0' }}>
        <div style={{ ...ts.toolbar, borderBottom: '0.5px solid #e2e8f0' }}>
          <span style={{ fontSize: '11px', color: '#64748b', fontWeight: 600, marginRight: '6px' }}>Question</span>
          <div style={ts.sep} />
          <button onClick={() => questionEditor?.chain().focus().toggleBold().run()} style={ts.tb}><strong>B</strong></button>
          <button onClick={() => questionEditor?.chain().focus().toggleItalic().run()} style={ts.tb}><em>I</em></button>
          <div style={ts.sep} />
          <button onClick={() => questionEditor?.chain().focus().insertContent({ type: 'equation', attrs: { formula: '', display: false } }).run()} style={ts.tb}>Eq</button>
        </div>
        <EditorContent editor={questionEditor} />
      </div>

      {/* Options */}
      <div style={{ padding: '12px 14px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <p style={{ fontSize: '11px', color: '#94a3b8', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '4px' }}>
          Options — select radio button next to correct answer
        </p>
        {labels.map((label, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', paddingTop: '10px', flexShrink: 0 }}>
              <input
                type="radio"
                name={`quiz-${block.id}`}
                checked={block.correctOption === i}
                onChange={() => onChange({ ...block, correctOption: i })}
                style={{ accentColor: '#639922', width: '14px', height: '14px' }}
              />
              <span style={{ fontSize: '11px', fontWeight: 700, color: block.correctOption === i ? '#27500A' : '#94a3b8', width: '12px' }}>{label}</span>
            </div>
            <OptionEditor
              content={options[i]}
              onChange={(json) => updateOption(i, json)}
              isCorrect={block.correctOption === i}
            />
          </div>
        ))}
      </div>
    </div>
  );
}

function AddBlockButton({ onAdd }) {
  const [open, setOpen] = useState(false);

  const options = [
    { type: BLOCK_TYPES.MAIN, label: 'Main content', dot: '#185FA5', bg: '#E6F1FB', color: '#0C447C', border: '#B5D4F4' },
    { type: BLOCK_TYPES.SHOW_HIDE, label: 'Show/hide block', dot: '#BA7517', bg: '#FAEEDA', color: '#633806', border: '#FAC775' },
    { type: BLOCK_TYPES.QUIZ, label: 'Quiz', dot: '#639922', bg: '#EAF3DE', color: '#27500A', border: '#C0DD97' },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px', padding: '4px 0' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', width: '100%' }}>
        <div style={{ flex: 1, height: '0.5px', backgroundColor: '#e2e8f0' }} />
        <button
          onClick={() => setOpen(o => !o)}
          style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', fontWeight: 500, color: '#64748b', padding: '5px 12px', borderRadius: '99px', border: '0.5px solid #e2e8f0', backgroundColor: '#ffffff', cursor: 'pointer', fontFamily: 'inherit', whiteSpace: 'nowrap' }}
        >
          + Add block {open ? '▲' : '▼'}
        </button>
        <div style={{ flex: 1, height: '0.5px', backgroundColor: '#e2e8f0' }} />
      </div>

      {open && (
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', justifyContent: 'center' }}>
          {options.map(opt => (
            <button
              key={opt.type}
              onClick={() => { onAdd(opt.type); setOpen(false); }}
              style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', fontWeight: 500, padding: '6px 14px', borderRadius: '8px', border: `0.5px solid ${opt.border}`, cursor: 'pointer', fontFamily: 'inherit', backgroundColor: opt.bg, color: opt.color }}
            >
              <div style={{ width: '7px', height: '7px', borderRadius: '50%', background: opt.dot, flexShrink: 0 }} />
              {opt.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

const bs = {
  block: { backgroundColor: '#ffffff', border: '0.5px solid #e2e8f0', borderRadius: '12px', overflow: 'hidden' },
  head: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '9px 14px', backgroundColor: '#f8fafc', borderBottom: '0.5px solid #e2e8f0' },
  headLeft: { display: 'flex', alignItems: 'center', gap: '8px' },
  dot: { width: '8px', height: '8px', borderRadius: '50%', flexShrink: 0 },
  label: { fontSize: '11px', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.06em' },
  badge: { fontSize: '11px', padding: '2px 8px', borderRadius: '99px', fontWeight: 500 },
  remove: { background: 'none', border: 'none', cursor: 'pointer', fontSize: '13px', color: '#94a3b8', padding: '2px 4px', fontFamily: 'inherit' },
};

export default function BlockEditor({ blocks: initialBlocks, onChange }) {
  const [blocks, setBlocks] = useState(() => {
    if (initialBlocks && initialBlocks.length > 0) return initialBlocks;
    return [{ id: crypto.randomUUID(), type: BLOCK_TYPES.MAIN, content: null }];
  });

  const update = (newBlocks) => {
    setBlocks(newBlocks);
    onChange(newBlocks);
  };

  const addBlock = (afterIndex, type) => {
    const newBlock = {
      id: crypto.randomUUID(),
      type,
      content: null,
      ...(type === BLOCK_TYPES.SHOW_HIDE ? { tier: 'extend', label: 'Show more' } : {}),
      ...(type === BLOCK_TYPES.QUIZ ? { question: null, options: [null, null, null, null, null], correctOption: 0 } : {}),
    };
    const next = [...blocks];
    next.splice(afterIndex + 1, 0, newBlock);
    update(next);
  };

  const removeBlock = (index) => {
    update(blocks.filter((_, i) => i !== index));
  };

  const updateBlock = (index, updatedBlock) => {
    const next = [...blocks];
    next[index] = updatedBlock;
    update(next);
  };

  const mainCount = blocks.filter(b => b.type === BLOCK_TYPES.MAIN).length;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
      {blocks.map((block, i) => (
        <div key={block.id}>
          {block.type === BLOCK_TYPES.MAIN && (
            <MainBlock
              block={block}
              onChange={(b) => updateBlock(i, b)}
              onRemove={() => removeBlock(i)}
              isOnly={mainCount === 1 && block.type === BLOCK_TYPES.MAIN}
            />
          )}
          {block.type === BLOCK_TYPES.SHOW_HIDE && (
            <ShowHideBlock
              block={block}
              onChange={(b) => updateBlock(i, b)}
              onRemove={() => removeBlock(i)}
            />
          )}
          {block.type === BLOCK_TYPES.QUIZ && (
            <QuizBlock
              block={block}
              onChange={(b) => updateBlock(i, b)}
              onRemove={() => removeBlock(i)}
            />
          )}
          <AddBlockButton onAdd={(type) => addBlock(i, type)} />
        </div>
      ))}
    </div>
  );
}