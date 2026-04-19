import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../api/axios';
import BlockEditor from '../components/editor/BlockEditor';

export default function TeacherTopicEditPage() {
  const { id, topicId } = useParams();
  const navigate = useNavigate();

  const [blocks, setBlocks] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [topicNumber, setTopicNumber] = useState('');
  const [topicTitle, setTopicTitle] = useState('');

  useEffect(() => {
    api.get(`/modules/${id}/pages`).then(res => {
      const topic = res.data.find(p => p.id === topicId);
      if (topic) {
        setTopicNumber(topic.pageNumber);
        setTopicTitle(topic.title || '');
        if (topic.blocks && Array.isArray(topic.blocks) && topic.blocks.length > 0) {
          setBlocks(topic.blocks);
        } else {
          // Migrate old content to block format
          setBlocks([{
            id: crypto.randomUUID(),
            type: 'main',
            content: (() => {
              try {
                return typeof topic.content === 'string' ? JSON.parse(topic.content) : topic.content;
              } catch { return null; }
            })(),
          }]);
        }
      }
    }).finally(() => setLoading(false));
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      await api.put(`/modules/${id}/pages/${topicId}`, {
        title: topicTitle,
        content: '',
        blocks: blocks,
      });
      setSuccessMsg('Topic saved');
      setTimeout(() => setSuccessMsg(''), 3000);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'Inter', sans-serif" }}>
      <div style={s.spinner} />
    </div>
  );

  return (
    <div style={s.root}>
      <style>{css}</style>

      <div style={s.topbar}>
        <button onClick={() => navigate(`/teacher/modules/${id}/edit`)} style={s.backBtn}>
          ← Back to Module
        </button>
        <h1 style={s.topbarTitle}>Topic {topicNumber}</h1>
        <button onClick={handleSave} disabled={saving} style={{ ...s.btnPrimary, opacity: saving ? 0.7 : 1 }}>
          {saving ? 'Saving...' : 'Save topic'}
        </button>
      </div>

      <div style={s.content}>
        {successMsg && <div style={s.successBanner}>✓ {successMsg}</div>}

        <div style={s.titleField}>
          <label style={s.titleLabel}>Topic title</label>
          <input
            style={s.titleInput}
            className="lms-title-input"
            value={topicTitle}
            onChange={e => setTopicTitle(e.target.value)}
            placeholder="e.g. Introduction to Verbs"
          />
        </div>

        {blocks && (
          <BlockEditor blocks={blocks} onChange={setBlocks} />
        )}
      </div>
    </div>
  );
}

const css = `
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  @keyframes spin { to { transform: rotate(360deg); } }
  .lms-title-input:focus { outline: none; border-color: #3b82f6 !important; box-shadow: 0 0 0 3px rgba(59,130,246,0.12); }
  .ProseMirror { outline: none; padding: 14px 16px; min-height: 72px; font-size: 14px; line-height: 1.75; color: #374151; }
  .ProseMirror p { margin: 0 0 10px; }
  .ProseMirror h1 { font-size: 22px; font-weight: 800; margin: 0 0 10px; color: #0f172a; }
  .ProseMirror h2 { font-size: 18px; font-weight: 700; margin: 0 0 10px; color: #0f172a; }
  .ProseMirror h3 { font-size: 16px; font-weight: 600; margin: 0 0 10px; color: #0f172a; }
  .ProseMirror ul, .ProseMirror ol { padding-left: 20px; margin: 0 0 10px; }
  .ProseMirror li { margin-bottom: 4px; }
  .ProseMirror strong { font-weight: 700; color: #0f172a; }
  .ProseMirror a { color: #2563eb; text-decoration: underline; }
  .ProseMirror img { max-width: 100%; border-radius: 8px; margin: 8px 0; }
`;

const s = {
  root: { minHeight: '100vh', backgroundColor: '#f8fafc', fontFamily: "'Inter', sans-serif" },
  spinner: { width: '36px', height: '36px', border: '3px solid #e2e8f0', borderTop: '3px solid #3b82f6', borderRadius: '50%', animation: 'spin 0.8s linear infinite' },
  topbar: { backgroundColor: '#ffffff', borderBottom: '1px solid #e2e8f0', padding: '14px 32px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'sticky', top: 0, zIndex: 50 },
  backBtn: { background: 'none', border: 'none', cursor: 'pointer', fontSize: '14px', fontWeight: 600, color: '#3b82f6', fontFamily: "'Inter', sans-serif", padding: 0 },
  topbarTitle: { fontSize: '16px', fontWeight: 700, color: '#0f172a', fontFamily: "'Inter', sans-serif" },
  btnPrimary: { backgroundColor: '#1d4ed8', color: '#ffffff', border: 'none', borderRadius: '10px', padding: '10px 20px', fontSize: '14px', fontWeight: 600, cursor: 'pointer', fontFamily: "'Inter', sans-serif" },
  content: { maxWidth: '860px', margin: '0 auto', padding: '32px 24px 80px' },
  successBanner: { backgroundColor: '#dcfce7', border: '1px solid #86efac', color: '#166534', padding: '12px 16px', borderRadius: '10px', fontSize: '14px', fontWeight: 600, marginBottom: '20px' },
  titleField: { marginBottom: '20px' },
  titleLabel: { display: 'block', fontSize: '13px', fontWeight: 600, color: '#374151', marginBottom: '6px' },
  titleInput: { width: '100%', border: '1.5px solid #e2e8f0', borderRadius: '10px', padding: '11px 14px', fontSize: '16px', fontWeight: 600, color: '#0f172a', backgroundColor: '#f8fafc', fontFamily: "'Inter', sans-serif", boxSizing: 'border-box', transition: 'border-color 0.2s' },
};