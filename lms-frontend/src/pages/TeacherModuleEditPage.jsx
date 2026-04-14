import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../api/axios';
import ModuleEditor from '../components/editor/ModuleEditor';

export default function TeacherModuleEditPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [module, setModule] = useState(null);
  const [pages, setPages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [editingPageId, setEditingPageId] = useState(null);
  const [editingContent, setEditingContent] = useState(null);
  const [showAddPage, setShowAddPage] = useState(false);
  const [newContent, setNewContent] = useState(null);

  useEffect(() => { fetchAll(); }, []);

  const fetchAll = async () => {
    try {
      const [modsRes, pagesRes] = await Promise.all([
        api.get('/modules'),
        api.get(`/modules/${id}/pages`)
      ]);
      const mod = modsRes.data.find(m => m.id === id);
      setModule(mod);
      setTitle(mod?.title || '');
      setDescription(mod?.description || '');
      setPages(pagesRes.data);
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

  const handleAddPage = async () => {
    if (!newContent) return alert('Add some content first');
    await api.post(`/modules/${id}/pages`, {
      pageNumber: pages.length + 1,
      content: JSON.stringify(newContent),
      extendContent: null,
      helpContent: null,
    });
    setNewContent(null);
    setShowAddPage(false);
    fetchAll();
    showSuccess('Page added');
  };

  const handleSavePage = async (pageId) => {
    await api.put(`/modules/${id}/pages/${pageId}`, {
      content: JSON.stringify(editingContent),
      extendContent: null,
      helpContent: null,
    });
    setEditingPageId(null);
    setEditingContent(null);
    fetchAll();
    showSuccess('Page saved');
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
      return texts.join(' ').slice(0, 80) || 'Empty page';
    } catch {
      return typeof content === 'string' ? content.slice(0, 80) : 'Page';
    }
  };

  if (loading) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'Inter', sans-serif" }}>
      Loading...
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

        {/* Pages */}
        <div style={s.card}>
          <div style={s.cardHeader}>
            <h2 style={s.cardTitle}>Pages <span style={s.count}>({pages.length})</span></h2>
            <button
              onClick={() => { setShowAddPage(true); setEditingPageId(null); }}
              style={s.btnOutline}
            >
              + Add page
            </button>
          </div>

          {pages.length === 0 && !showAddPage && (
            <p style={s.empty}>No pages yet. Add your first page.</p>
          )}

          <div style={s.pageList}>
            {pages.map((page, i) => (
              <div key={page.id} style={s.pageItem}>
                {editingPageId === page.id ? (
                  <div style={s.editBlock}>
                    <div style={s.editHeader}>
                      <span style={s.pageNumLabel}>Page {page.pageNumber}</span>
                      <button onClick={() => setEditingPageId(null)} style={s.closeBtn}>✕ Cancel</button>
                    </div>
                    <ModuleEditor
                      content={(() => {
                        try { return typeof page.content === 'string' ? JSON.parse(page.content) : page.content; }
                        catch { return page.content; }
                      })()}
                      onChange={setEditingContent}
                    />
                    <button onClick={() => handleSavePage(page.id)} style={{ ...s.btnPrimary, marginTop: '12px' }}>
                      Save page
                    </button>
                  </div>
                ) : (
                  <div style={s.viewBlock}>
                    <div style={s.viewLeft}>
                      <span style={s.pageNumLabel}>Page {page.pageNumber}</span>
                      <p style={s.pagePreview}>{getPreview(page.content)}</p>
                    </div>
                    <button
                      onClick={() => { setEditingPageId(page.id); setShowAddPage(false); }}
                      style={s.editBtn}
                    >
                      ✏️ Edit
                    </button>
                  </div>
                )}
              </div>
            ))}

            {/* Add page */}
            {showAddPage && (
              <div style={{ ...s.editBlock, border: '1.5px dashed #bfdbfe', borderRadius: '12px', padding: '20px' }}>
                <div style={s.editHeader}>
                  <span style={s.pageNumLabel}>New page</span>
                  <button onClick={() => setShowAddPage(false)} style={s.closeBtn}>✕ Cancel</button>
                </div>
                <ModuleEditor content={null} onChange={setNewContent} />
                <button onClick={handleAddPage} style={{ ...s.btnPrimary, marginTop: '12px' }}>
                  Add page
                </button>
              </div>
            )}
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
`;

const s = {
  root: { minHeight: '100vh', backgroundColor: '#f8fafc', fontFamily: "'Inter', sans-serif" },
  topbar: {
    backgroundColor: '#ffffff', borderBottom: '1px solid #e2e8f0',
    padding: '14px 32px', display: 'flex', justifyContent: 'space-between',
    alignItems: 'center', position: 'sticky', top: 0, zIndex: 50,
  },
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
  empty: { fontSize: '14px', color: '#94a3b8', padding: '16px 0' },
  pageList: { display: 'flex', flexDirection: 'column', gap: '12px' },
  pageItem: { border: '1.5px solid #e2e8f0', borderRadius: '12px', overflow: 'hidden' },
  viewBlock: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '16px', padding: '16px 20px', backgroundColor: '#f8fafc' },
  viewLeft: { flex: 1, overflow: 'hidden' },
  editBlock: { padding: '20px 24px', backgroundColor: '#ffffff' },
  editHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' },
  pageNumLabel: { fontSize: '12px', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.06em' },
  pagePreview: { fontSize: '14px', color: '#374151', fontWeight: 500, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', margin: '4px 0 0' },
  editBtn: { padding: '7px 14px', borderRadius: '8px', border: '1px solid #e2e8f0', backgroundColor: '#ffffff', fontSize: '13px', fontWeight: 600, cursor: 'pointer', fontFamily: "'Inter', sans-serif", flexShrink: 0 },
  closeBtn: { background: 'none', border: 'none', cursor: 'pointer', fontSize: '13px', fontWeight: 600, color: '#94a3b8', fontFamily: "'Inter', sans-serif" },
};