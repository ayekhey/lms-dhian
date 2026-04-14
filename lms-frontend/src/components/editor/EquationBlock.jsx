import { NodeViewWrapper } from '@tiptap/react';
import { useEffect, useRef, useState } from 'react';
import katex from 'katex';
import 'katex/dist/katex.min.css';

export default function EquationBlock({ node, updateAttributes, deleteNode, selected }) {
  const { formula, display } = node.attrs;
  const [editing, setEditing] = useState(!formula);
  const [draft, setDraft] = useState(formula || '');
  const [error, setError] = useState('');
  const previewRef = useRef(null);

  useEffect(() => {
    if (!previewRef.current || !formula) return;
    try {
      katex.render(formula, previewRef.current, {
        displayMode: display,
        throwOnError: true,
      });
      setError('');
    } catch (e) {
      setError(e.message);
    }
  }, [formula, display]);

  const handleSave = () => {
    if (!draft.trim()) return;
    updateAttributes({ formula: draft });
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
          padding: '8px 12px',
          backgroundColor: '#f1f5f9',
          borderBottom: '1px solid #e2e8f0',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '14px' }}>∑</span>
            <span style={{ fontSize: '11px', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              Equation
            </span>
          </div>
          <div style={{ display: 'flex', gap: '6px' }}>
            <button
              onClick={() => setEditing(e => !e)}
              style={{
                fontSize: '11px', padding: '2px 8px', borderRadius: '6px',
                border: '1px solid #e2e8f0', backgroundColor: '#ffffff',
                color: '#64748b', cursor: 'pointer', fontFamily: 'inherit',
              }}
            >
              {editing ? 'Preview' : 'Edit'}
            </button>
            <button
              onClick={deleteNode}
              style={{
                background: 'none', border: 'none', cursor: 'pointer',
                fontSize: '14px', color: '#94a3b8', padding: '0 4px',
              }}
            >
              ✕
            </button>
          </div>
        </div>

        {/* Body */}
        <div style={{ padding: '12px 16px' }}>
          {editing ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <input
                value={draft}
                onChange={e => setDraft(e.target.value)}
                placeholder="e.g. x = \frac{-b \pm \sqrt{b^2 - 4ac}}{2a}"
                style={{
                  width: '100%', border: '1.5px solid #e2e8f0', borderRadius: '8px',
                  padding: '8px 12px', fontSize: '13px', fontFamily: 'monospace',
                  backgroundColor: '#ffffff', outline: 'none', boxSizing: 'border-box',
                }}
              />
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                <button
                  onClick={handleSave}
                  style={{
                    padding: '6px 14px', borderRadius: '8px', border: 'none',
                    backgroundColor: '#1d4ed8', color: '#ffffff',
                    fontSize: '12px', fontWeight: 600, cursor: 'pointer',
                    fontFamily: 'inherit',
                  }}
                >
                  Apply
                </button>
                <label style={{ fontSize: '12px', color: '#64748b', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <input
                    type="checkbox"
                    checked={display}
                    onChange={e => updateAttributes({ display: e.target.checked })}
                  />
                  Display mode (centered)
                </label>
              </div>
              {error && <p style={{ fontSize: '12px', color: '#dc2626' }}>⚠ {error}</p>}
            </div>
          ) : (
            <div
              ref={previewRef}
              style={{ textAlign: display ? 'center' : 'left', padding: '8px 0', cursor: 'pointer' }}
              onClick={() => setEditing(true)}
            />
          )}
        </div>
      </div>
    </NodeViewWrapper>
  );
}