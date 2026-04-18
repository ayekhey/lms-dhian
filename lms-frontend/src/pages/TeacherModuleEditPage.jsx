import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../api/axios';

export default function TeacherModuleEditPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [module, setModule] = useState(null);
  const [topics, setTopics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [showAddTopic, setShowAddTopic] = useState(false);
  const [newTopicTitle, setNewTopicTitle] = useState('');
  const [adding, setAdding] = useState(false);

  useEffect(() => { fetchAll(); }, []);

  const fetchAll = async () => {
    try {
      const [modsRes, topicsRes] = await Promise.all([
        api.get('/modules'),
        api.get(`/modules/${id}/pages`)
      ]);
      const mod = modsRes.data.find(m => m.id === id);
      setModule(mod);
      setTitle(mod?.title || '');
      setDescription(mod?.description || '');
      setTopics(topicsRes.data);
    } finally {
      setLoading(false);
    }
  };

  const showSuccess = (msg) => {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(''), 3000);
  };

  const handleSaveModule = async () => {
    if (!title) return alert('Title is required');
    await api.put(`/modules/${id}`, { title, description });
    showSuccess('Module details saved');
  };

  const handleAddTopic = async () => {
    if (!newTopicTitle.trim()) return alert('Topic title is required');
    setAdding(true);
    await api.post(`/modules/${id}/pages`, {
      pageNumber: topics.length + 1,
      content: JSON.stringify({
        type: 'doc',
        content: [{ type: 'paragraph', content: [{ type: 'text', text: newTopicTitle }] }]
      }),
      extendContent: null,
      helpContent: null,
    });
    setNewTopicTitle('');
    setShowAddTopic(false);
    fetchAll();
    showSuccess('Topic added');
    setAdding(false);
  };

  const handleDeleteTopic = async (topicId) => {
    if (!confirm('Delete this topic? This cannot be undone.')) return;
    await api.delete(`/modules/${id}/pages/${topicId}`);
    fetchAll();
    showSuccess('Topic deleted');
  };

  const getPreview = (content) => {
    try {
      const doc = typeof content === 'string' ? JSON.parse(content) : content;
      const texts = [];
      const extract = (nodes) => {
        nodes?.forEach(n => {
          if (n.type === 'text') texts.push(n.text);
          if (n.content) extract(n.content);
        });
      };
      extract(doc.content);
      return texts.join(' ').slice(0, 80) || 'Empty topic';
    } catch {
      return typeof content === 'string' ? content.slice(0, 80) : 'Topic';
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
        <button onClick={() => navigate('/teacher/modules')} style={s.backBtn}>← Modules</button>
        <h1 style={s.topbarTitle}>{title || 'Edit Module'}</h1>
        <div style={{ width: '80px' }} />
      </div>

      <div style={s.content}>
        {successMsg && <div style={s.successBanner}>✓ {successMsg}</div>}

        {/* Module details */}
        <div style={s.card}>
          <h2 style={s.cardTitle}>Module details</h2>
          <div style={s.fieldGroup}>
            <label style={s.label}>Title</label>
            <input className="lms-input" value={title} onChange={e => setTitle(e.target.value)} style={s.input} />
          </div>
          <div style={s.fieldGroup}>
            <label style={s.label}>Description <span style={s.optional}>(optional)</span></label>
            <textarea className="lms-input" value={description} onChange={e => setDescription(e.target.value)} style={{ ...s.input, ...s.textarea }} rows={2} />
          </div>
          <button onClick={handleSaveModule} style={s.btnPrimary}>Save details</button>
        </div>

        {/* Topics */}
        <div style={s.card}>
          <div style={s.cardHeader}>
            <h2 style={s.cardTitle}>Topics <span style={s.count}>({topics.length})</span></h2>
            <button onClick={() => setShowAddTopic(c => !c)} style={s.btnOutline}>
              {showAddTopic ? '✕ Cancel' : '+ Add topic'}
            </button>
          </div>

          {/* Add topic form */}
          {showAddTopic && (
            <div style={s.addTopicForm}>
              <div style={s.fieldGroup}>
                <label style={s.label}>Topic title</label>
                <input
                  className="lms-input"
                  placeholder="e.g. Introduction to Binary Trees"
                  value={newTopicTitle}
                  onChange={e => setNewTopicTitle(e.target.value)}
                  style={s.input}
                  onKeyDown={e => e.key === 'Enter' && handleAddTopic()}
                  autoFocus
                />
              </div>
              <button onClick={handleAddTopic} disabled={adding} style={{ ...s.btnPrimary, opacity: adding ? 0.6 : 1 }}>
                {adding ? 'Adding...' : 'Add topic'}
              </button>
            </div>
          )}

          {topics.length === 0 && !showAddTopic && (
            <p style={s.empty}>No topics yet. Add your first topic above.</p>
          )}

          <div style={s.topicList}>
            {topics.map((topic, i) => (
              <div key={topic.id} style={s.topicItem}>
                <div style={s.topicLeft}>
                  <div style={s.topicNum}>{i + 1}</div>
                  <div>
                    <p style={s.topicPreview}>{getPreview(topic.content)}</p>
                    <p style={s.topicMeta}>Topic {topic.pageNumber}</p>
                  </div>
                </div>
                <div style={s.topicActions}>
                  <button
                    onClick={() => navigate(`/teacher/modules/${id}/topics/${topic.id}/edit`)}
                    style={s.editBtn}
                  >
                    ✏️ Edit
                  </button>
                  <button
                    onClick={() => handleDeleteTopic(topic.id)}
                    style={s.deleteBtn}
                  >
                    🗑
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

const css = `
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  .lms-input:focus { outline: none; border-color: #3b82f6 !important; box-shadow: 0 0 0 3px rgba(59,130,246,0.12); }
  @keyframes spin { to { transform: rotate(360deg); } }
`;

const s = {
  root: { minHeight: '100vh', backgroundColor: '#f8fafc', fontFamily: "'Inter', sans-serif" },
  spinner: { width: '36px', height: '36px', border: '3px solid #e2e8f0', borderTop: '3px solid #3b82f6', borderRadius: '50%', animation: 'spin 0.8s linear infinite' },
  topbar: { backgroundColor: '#ffffff', borderBottom: '1px solid #e2e8f0', padding: '14px 32px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'sticky', top: 0, zIndex: 50 },
  backBtn: { background: 'none', border: 'none', cursor: 'pointer', fontSize: '14px', fontWeight: 600, color: '#3b82f6', fontFamily: "'Inter', sans-serif", padding: 0 },
  topbarTitle: { fontSize: '16px', fontWeight: 700, color: '#0f172a', fontFamily: "'Inter', sans-serif" },
  content: { maxWidth: '800px', margin: '0 auto', padding: '36px 24px 80px', display: 'flex', flexDirection: 'column', gap: '20px' },
  successBanner: { backgroundColor: '#dcfce7', border: '1px solid #86efac', color: '#166534', padding: '12px 16px', borderRadius: '10px', fontSize: '14px', fontWeight: 600 },
  card: { backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '24px 28px', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' },
  cardHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' },
  cardTitle: { fontSize: '16px', fontWeight: 700, color: '#0f172a', fontFamily: "'Inter', sans-serif", margin: 0 },
  count: { fontSize: '14px', fontWeight: 500, color: '#94a3b8' },
  fieldGroup: { marginBottom: '14px' },
  label: { display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', fontWeight: 600, color: '#374151', marginBottom: '6px' },
  optional: { fontSize: '12px', fontWeight: 400, color: '#94a3b8' },
  input: { width: '100%', border: '1.5px solid #e2e8f0', borderRadius: '10px', padding: '11px 14px', fontSize: '14px', color: '#0f172a', backgroundColor: '#f8fafc', fontFamily: "'Inter', sans-serif", transition: 'border-color 0.2s', boxSizing: 'border-box' },
  textarea: { resize: 'vertical', lineHeight: 1.6 },
  btnPrimary: { backgroundColor: '#1d4ed8', color: '#ffffff', border: 'none', borderRadius: '10px', padding: '11px 20px', fontSize: '14px', fontWeight: 600, cursor: 'pointer', fontFamily: "'Inter', sans-serif" },
  btnOutline: { backgroundColor: '#ffffff', color: '#1d4ed8', border: '1.5px solid #1d4ed8', borderRadius: '10px', padding: '8px 16px', fontSize: '13px', fontWeight: 600, cursor: 'pointer', fontFamily: "'Inter', sans-serif" },
  addTopicForm: { backgroundColor: '#f8fafc', border: '1.5px dashed #bfdbfe', borderRadius: '12px', padding: '20px', marginBottom: '16px' },
  empty: { fontSize: '14px', color: '#94a3b8', padding: '16px 0' },
  topicList: { display: 'flex', flexDirection: 'column', gap: '10px' },
  topicItem: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '16px', padding: '14px 16px', borderRadius: '12px', border: '1.5px solid #e2e8f0', backgroundColor: '#f8fafc' },
  topicLeft: { display: 'flex', alignItems: 'center', gap: '12px', flex: 1, overflow: 'hidden' },
  topicNum: { width: '32px', height: '32px', borderRadius: '8px', backgroundColor: '#eff6ff', color: '#1d4ed8', fontSize: '13px', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  topicPreview: { fontSize: '14px', fontWeight: 600, color: '#0f172a', margin: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' },
  topicMeta: { fontSize: '11px', color: '#94a3b8', margin: '2px 0 0', fontWeight: 500 },
  topicActions: { display: 'flex', gap: '8px', flexShrink: 0 },
  editBtn: { padding: '7px 14px', borderRadius: '8px', border: '1px solid #e2e8f0', backgroundColor: '#ffffff', fontSize: '13px', fontWeight: 600, cursor: 'pointer', fontFamily: "'Inter', sans-serif" },
  deleteBtn: { padding: '7px 10px', borderRadius: '8px', border: '1px solid #fecaca', backgroundColor: '#fef2f2', fontSize: '14px', cursor: 'pointer', fontFamily: "'Inter', sans-serif" },
};