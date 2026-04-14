import { NodeViewWrapper } from '@tiptap/react';

const typeOptions = [
  { value: 'extend', label: 'Extend (Tier 2+)', dot: '#378ADD', bg: '#E6F1FB', color: '#0C447C' },
  { value: 'help', label: 'Help (Tier 3)', dot: '#BA7517', bg: '#FAEEDA', color: '#633806' },
  { value: 'all', label: 'All students', dot: '#1D9E75', bg: '#E1F5EE', color: '#085041' },
];

export default function ShowHideBlock({ node, updateAttributes, deleteNode, selected }) {
  const { content, label, type } = node.attrs;
  const typeInfo = typeOptions.find(t => t.value === type) || typeOptions[0];

  return (
    <NodeViewWrapper>
      <div style={{
        border: `1px dashed ${selected ? '#378ADD' : '#cbd5e1'}`,
        borderRadius: '12px',
        margin: '12px 0',
        overflow: 'hidden',
        backgroundColor: selected ? '#f0f7ff' : 'transparent',
      }}>
        {/* Header */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '8px 12px',
          backgroundColor: '#f8fafc',
          borderBottom: '1px solid #e2e8f0',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{
              width: '8px', height: '8px', borderRadius: '50%',
              backgroundColor: typeInfo.dot, flexShrink: 0,
            }} />
            <span style={{ fontSize: '11px', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              Show/hide block
            </span>

            {/* Label input */}
            <input
              value={label}
              onChange={e => updateAttributes({ label: e.target.value })}
              placeholder="Button label"
              style={{
                fontSize: '11px',
                color: '#374151',
                border: '1px solid #e2e8f0',
                borderRadius: '6px',
                padding: '2px 8px',
                backgroundColor: '#ffffff',
                fontFamily: 'inherit',
                width: '120px',
              }}
            />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            {/* Type selector */}
            <select
              value={type}
              onChange={e => updateAttributes({ type: e.target.value })}
              style={{
                fontSize: '11px',
                padding: '3px 8px',
                borderRadius: '6px',
                border: '1px solid #e2e8f0',
                backgroundColor: typeInfo.bg,
                color: typeInfo.color,
                fontWeight: 600,
                cursor: 'pointer',
                fontFamily: 'inherit',
              }}
            >
              {typeOptions.map(t => (
                <option key={t.value} value={t.value}>{t.label}</option>
              ))}
            </select>

            {/* Delete */}
            <button
              onClick={deleteNode}
              style={{
                background: 'none', border: 'none', cursor: 'pointer',
                fontSize: '14px', color: '#94a3b8', padding: '2px 4px',
                borderRadius: '4px', lineHeight: 1,
              }}
              title="Remove block"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Content textarea */}
        <div style={{ padding: '10px 14px' }}>
          <textarea
            value={content}
            onChange={e => updateAttributes({ content: e.target.value })}
            placeholder="Write hidden content here — students reveal it by clicking the toggle..."
            rows={3}
            style={{
              width: '100%',
              fontSize: '13px',
              color: '#374151',
              border: 'none',
              background: 'transparent',
              resize: 'vertical',
              outline: 'none',
              lineHeight: 1.65,
              fontFamily: 'inherit',
              boxSizing: 'border-box',
            }}
          />
        </div>
      </div>
    </NodeViewWrapper>
  );
}