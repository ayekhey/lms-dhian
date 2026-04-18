import { useState, useEffect, useRef } from 'react';
import katex from 'katex';
import 'katex/dist/katex.min.css';

function KatexRenderer({ formula, display }) {
  const ref = useRef(null);
  useEffect(() => {
    if (!ref.current) return;
    try {
      katex.render(formula, ref.current, { displayMode: display, throwOnError: false });
    } catch {}
  }, [formula, display]);
  return <span ref={ref} />;
}

function ShowHideRenderer({ node }) {
  const { content, label, type } = node.attrs || {};
  const [open, setOpen] = useState(false);

  const styles = {
    extend: { border: '#bfdbfe', bg: '#eff6ff', text: '#1d4ed8', accent: '#3b82f6' },
    help: { border: '#fde68a', bg: '#fffbeb', text: '#92400e', accent: '#d97706' },
    all: { border: '#bbf7d0', bg: '#f0fdf4', text: '#166534', accent: '#16a34a' },
  };
  const style = styles[type] || styles.extend;

  return (
    <div style={{ margin: '8px 0 12px' }}>
      <button
        onClick={() => setOpen(o => !o)}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '6px',
          padding: '5px 12px',
          borderRadius: '99px',
          border: `1px solid ${open ? style.border : '#e2e8f0'}`,
          backgroundColor: open ? style.bg : '#f8fafc',
          fontSize: '12px',
          fontWeight: 600,
          color: open ? style.text : '#64748b',
          cursor: 'pointer',
          fontFamily: 'inherit',
          marginBottom: '6px',
          transition: 'all 0.15s',
        }}
      >
        <svg
          width="12" height="12" viewBox="0 0 24 24" fill="none"
          stroke="currentColor" strokeWidth="2.5"
          style={{ transform: open ? 'rotate(180deg)' : 'rotate(0)', transition: 'transform 0.2s' }}
        >
          <path d="M6 9l6 6 6-6"/>
        </svg>
        {open ? 'Hide' : label || 'Show more'}
      </button>

      <div style={{
        maxHeight: open ? '600px' : '0',
        overflow: 'hidden',
        opacity: open ? 1 : 0,
        transition: 'max-height 0.35s ease, opacity 0.25s ease',
      }}>
        <div style={{
          borderLeft: `3px solid ${style.accent}`,
          borderRadius: '0 8px 8px 0',
          padding: '12px 16px',
          backgroundColor: style.bg,
          fontSize: '14px',
          color: style.text,
          lineHeight: 1.7,
        }}>
          {content}
        </div>
      </div>
    </div>
  );
}

function renderNode(node, index, tier) {
  if (!node) return null;

  switch (node.type) {
    case 'doc':
      return <div key={index}>{node.content?.map((n, i) => renderNode(n, i, tier))}</div>;

    case 'paragraph':
      return (
        <p key={index} style={{ fontSize: '15px', color: '#374151', lineHeight: 1.75, margin: '0 0 12px' }}>
          {node.content?.map((n, i) => renderNode(n, i, tier))}
        </p>
      );

    case 'heading': {
      const sizes = { 1: '22px', 2: '18px', 3: '16px' };
      const weights = { 1: 800, 2: 700, 3: 600 };
      const Tag = `h${node.attrs?.level || 1}`;
      return (
        <Tag key={index} style={{ fontSize: sizes[node.attrs?.level] || '22px', fontWeight: weights[node.attrs?.level] || 700, color: '#0f172a', margin: '0 0 12px', fontFamily: 'inherit' }}>
          {node.content?.map((n, i) => renderNode(n, i, tier))}
        </Tag>
      );
    }

    case 'bulletList':
      return <ul key={index} style={{ paddingLeft: '20px', margin: '0 0 12px' }}>{node.content?.map((n, i) => renderNode(n, i))}</ul>;

    case 'orderedList':
      return <ol key={index} style={{ paddingLeft: '20px', margin: '0 0 12px' }}>{node.content?.map((n, i) => renderNode(n, i))}</ol>;

    case 'listItem':
      return <li key={index} style={{ marginBottom: '4px', fontSize: '15px', color: '#374151', lineHeight: 1.7 }}>{node.content?.map((n, i) => renderNode(n, i))}</li>;

    case 'text': {
  let el = node.text;
  if (node.marks) {
    node.marks.forEach(mark => {
      if (mark.type === 'bold') el = <strong key="b" style={{ fontWeight: 700, color: '#0f172a' }}>{el}</strong>;
      if (mark.type === 'italic') el = <em key="i">{el}</em>;
      if (mark.type === 'underline') el = <u key="u">{el}</u>;
      if (mark.type === 'link') el = (
        <a key="a" href={mark.attrs?.href} target="_blank" rel="noopener noreferrer"
          style={{ color: '#2563eb', textDecoration: 'underline' }}>
          {el}
        </a>
      );
    });
  }
  return <span key={index}>{el}</span>;
}

    case 'showHideBlock': {
  const blockType = node.attrs?.type;
  if (blockType === 'extend' && tier < 2) return null;
  if (blockType === 'help' && tier < 3) return null;
  return <ShowHideRenderer key={index} node={node} />;
}

case 'equation': {
  const { formula, display } = node.attrs || {};
  if (!formula) return null;
  return (
    <div key={index} style={{ margin: '16px 0', textAlign: display ? 'center' : 'left' }}>
      <KatexRenderer formula={formula} display={display} />
    </div>
  );
}

case 'videoEmbed': {
  const { embedUrl } = node.attrs || {};
  if (!embedUrl) return null;
  return (
    <div key={index} style={{ position: 'relative', paddingBottom: '56.25%', height: 0, margin: '16px 0', borderRadius: '12px', overflow: 'hidden' }}>
      <iframe
        src={embedUrl}
        style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', border: 'none' }}
        allowFullScreen
      />
    </div>
  );
}

case 'image': {
  const { src, alt } = node.attrs || {};
  return (
    <div key={index} style={{ margin: '16px 0' }}>
      <img src={src} alt={alt || ''} style={{ maxWidth: '100%', borderRadius: '8px' }} />
    </div>
  );
}

    default:
      return null;
  }
}

export default function ModuleRenderer({ content, tier = 1 }) {
  if (!content) return <p style={{ color: '#94a3b8', fontSize: '14px' }}>No content yet.</p>;

  let doc;
  try {
    doc = typeof content === 'string' ? JSON.parse(content) : content;
  } catch {
    return <p style={{ fontSize: '15px', color: '#374151', lineHeight: 1.75 }}>{content}</p>;
  }

  if (!doc.content) return <p style={{ color: '#94a3b8', fontSize: '14px' }}>No content yet.</p>;

  return <div>{doc.content.map((node, i) => renderNode(node, i, tier))}</div>;
}