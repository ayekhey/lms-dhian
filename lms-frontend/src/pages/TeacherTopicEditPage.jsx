import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../api/axios';
import ModuleEditor from '../components/editor/ModuleEditor';

export default function TeacherTopicEditPage() {
  const { id, topicId } = useParams();
  const navigate = useNavigate();

  const [content, setContent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [topicNumber, setTopicNumber] = useState('');

  useEffect(() => {
    api.get(`/modules/${id}/pages`).then(res => {
      const topic = res.data.find(p => p.id === topicId);
      if (topic) {
        setTopicNumber(topic.pageNumber);
        try {
          setContent(typeof topic.content === 'string' ? JSON.parse(topic.content) : topic.content);
        } catch {
          setContent(topic.content);
        }
      }
    }).finally(() => setLoading(false));
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      await api.put(`/modules/${id}/pages/${topicId}`, {
        content: JSON.stringify(content),
        extendContent: null,
        helpContent: null,
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

      {/* Topbar */}
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

        <div style={s.card}>
          <p style={s.hint}>Use the toolbar to format content, add show/hide blocks, equations, images, or videos.</p>
          <ModuleEditor content={content} onChange={setContent} />
        </div>
      </div>
    </div>
  );
}

const css = `
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  @keyframes spin { to { transform: rotate(360deg); } }
`;

const s = {
  root: { minHeight: '100vh', backgroundColor: '#f8fafc', fontFamily: "'Inter', sans-serif" },
  spinner: { width: '36px', height: '36px', border: '3px solid #e2e8f0', borderTop: '3px solid #3b82f6', borderRadius: '50%', animation: 'spin 0.8s linear infinite' },
  topbar: { backgroundColor: '#ffffff', borderBottom: '1px solid #e2e8f0', padding: '14px 32px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'sticky', top: 0, zIndex: 50 },
  backBtn: { background: 'none', border: 'none', cursor: 'pointer', fontSize: '14px', fontWeight: 600, color: '#3b82f6', fontFamily: "'Inter', sans-serif", padding: 0 },
  topbarTitle: { fontSize: '16px', fontWeight: 700, color: '#0f172a', fontFamily: "'Inter', sans-serif" },
  btnPrimary: { backgroundColor: '#1d4ed8', color: '#ffffff', border: 'none', borderRadius: '10px', padding: '10px 20px', fontSize: '14px', fontWeight: 600, cursor: 'pointer', fontFamily: "'Inter', sans-serif" },
  content: { maxWidth: '900px', margin: '0 auto', padding: '36px 24px 80px' },
  successBanner: { backgroundColor: '#dcfce7', border: '1px solid #86efac', color: '#166534', padding: '12px 16px', borderRadius: '10px', fontSize: '14px', fontWeight: 600, marginBottom: '20px' },
  card: { backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '24px 28px', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' },
  hint: { fontSize: '13px', color: '#94a3b8', marginBottom: '16px' },
};