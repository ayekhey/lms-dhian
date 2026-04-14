import { NodeViewWrapper } from '@tiptap/react';
import { useState } from 'react';

function getEmbedUrl(url) {
  try {
    // YouTube
    const yt = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\s]+)/);
    if (yt) return `https://www.youtube.com/embed/${yt[1]}`;
    // Vimeo
    const vm = url.match(/vimeo\.com\/(\d+)/);
    if (vm) return `https://player.vimeo.com/video/${vm[1]}`;
    return null;
  } catch {
    return null;
  }
}

export default function VideoBlock({ node, updateAttributes, deleteNode, selected }) {
  const { url, embedUrl } = node.attrs;
  const [draft, setDraft] = useState(url || '');
  const [editing, setEditing] = useState(!embedUrl);

  const handleApply = () => {
    const embed = getEmbedUrl(draft);
    if (!embed) {
      alert('Please enter a valid YouTube or Vimeo URL');
      return;
    }
    updateAttributes({ url: draft, embedUrl: embed });
    setEditing(false);
  };

  return (
    <NodeViewWrapper>
      <div style={{
        border: `1px ${selected ? 'solid #3b82f6' : 'dashed #e2e8f0'}`,
        borderRadius: '12px',
        margin: '12px 0',
        overflow: 'hidden',
        backgroundColor: selected ? '#f0f7ff' : '#f8fafc',
      }}>
        {/* Header */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '8px 12px', backgroundColor: '#f1f5f9',
          borderBottom: '1px solid #e2e8f0',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '14px' }}>▶</span>
            <span style={{ fontSize: '11px', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              Video
            </span>
          </div>
          <div style={{ display: 'flex', gap: '6px' }}>
            {embedUrl && (
              <button
                onClick={() => setEditing(e => !e)}
                style={{
                  fontSize: '11px', padding: '2px 8px', borderRadius: '6px',
                  border: '1px solid #e2e8f0', backgroundColor: '#ffffff',
                  color: '#64748b', cursor: 'pointer', fontFamily: 'inherit',
                }}
              >
                {editing ? 'Preview' : 'Change'}
              </button>
            )}
            <button onClick={deleteNode} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '14px', color: '#94a3b8', padding: '0 4px' }}>✕</button>
          </div>
        </div>

        <div style={{ padding: '12px 16px' }}>
          {editing || !embedUrl ? (
            <div style={{ display: 'flex', gap: '8px' }}>
              <input
                value={draft}
                onChange={e => setDraft(e.target.value)}
                placeholder="Paste YouTube or Vimeo URL..."
                style={{
                  flex: 1, border: '1.5px solid #e2e8f0', borderRadius: '8px',
                  padding: '8px 12px', fontSize: '13px', fontFamily: 'inherit',
                  backgroundColor: '#ffffff', outline: 'none',
                }}
              />
              <button
                onClick={handleApply}
                style={{
                  padding: '8px 16px', borderRadius: '8px', border: 'none',
                  backgroundColor: '#1d4ed8', color: '#ffffff',
                  fontSize: '13px', fontWeight: 600, cursor: 'pointer',
                  fontFamily: 'inherit', whiteSpace: 'nowrap',
                }}
              >
                Embed
              </button>
            </div>
          ) : (
            <div style={{ position: 'relative', paddingBottom: '56.25%', height: 0, borderRadius: '8px', overflow: 'hidden' }}>
              <iframe
                src={embedUrl}
                style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', border: 'none' }}
                allowFullScreen
              />
            </div>
          )}
        </div>
      </div>
    </NodeViewWrapper>
  );
}