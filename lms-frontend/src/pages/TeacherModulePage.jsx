import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import PageLayout from '../components/PageLayout';
import api from '../api/axios';

export default function TeacherModulePage() {
  const [modules, setModules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [selectedModule, setSelectedModule] = useState(null);
  const [mode, setMode] = useState(null); // 'addPage' | 'editModule'
  const [pageContent, setPageContent] = useState('');
  const [pageExtend, setPageExtend] = useState('');
  const [pageHelp, setPageHelp] = useState('');
  const [editTitle, setEditTitle] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const navigate = useNavigate();

  useEffect(() => { fetchModules(); }, []);

  const fetchModules = () => {
    api.get('/modules')
      .then(res => setModules(res.data))
      .finally(() => setLoading(false));
  };

  const showSuccess = (msg) => {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(''), 3000);
  };

  const handleCreate = async () => {
    if (!title) return alert('Title is required');
    await api.post('/modules', { title, description });
    setTitle('');
    setDescription('');
    fetchModules();
    showSuccess('Module created successfully');
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this module? This cannot be undone.')) return;
    await api.delete(`/modules/${id}`);
    fetchModules();
    showSuccess('Module deleted');
  };

  const handleAddPage = async () => {
    if (!pageContent) return alert('Page content is required');
    await api.post(`/modules/${selectedModule.id}/pages`, {
      pageNumber: 1,
      content: pageContent,
      extendContent: pageExtend || null,
      helpContent: pageHelp || null
    });
    setPageContent('');
    setPageExtend('');
    setPageHelp('');
    setMode(null);
    setSelectedModule(null);
    showSuccess('Page added successfully');
  };

  const handleEditModule = async () => {
    if (!editTitle) return alert('Title is required');
    await api.put(`/modules/${selectedModule.id}`, {
      title: editTitle,
      description: editDescription
    });
    fetchModules();
    setMode(null);
    setSelectedModule(null);
    showSuccess('Module updated successfully');
  };

  const openEdit = (mod) => {
  navigate(`/teacher/modules/${mod.id}/edit`);
};

  const openAddPage = (mod) => {
    setSelectedModule(mod);
    setPageContent('');
    setPageExtend('');
    setPageHelp('');
    setMode('addPage');
  };

  const closePanel = () => {
    setMode(null);
    setSelectedModule(null);
  };

  if (loading) return <PageLayout title="Modules"><p style={{ color: '#64748b' }}>Loading...</p></PageLayout>;

  return (
    <PageLayout title="Modules" subtitle="Create and manage your learning modules.">
      <style>{css}</style>

      {successMsg && (
        <div style={s.successBanner}>
          ✓ {successMsg}
        </div>
      )}

      <div style={s.layout}>
        {/* Left column */}
        <div style={s.left}>
          {/* Create module */}
          <div style={s.card}>
            <h2 style={s.cardTitle}>Create New Module</h2>
            <div style={s.fieldGroup}>
              <label style={s.label}>Module Title</label>
              <input
                className="lms-input"
                type="text"
                placeholder="e.g. Introduction to Algebra"
                value={title}
                onChange={e => setTitle(e.target.value)}
                style={s.input}
              />
            </div>
            <div style={s.fieldGroup}>
              <label style={s.label}>Description <span style={s.optional}>(optional)</span></label>
              <textarea
                className="lms-input"
                placeholder="Brief summary of this module"
                value={description}
                onChange={e => setDescription(e.target.value)}
                style={{ ...s.input, ...s.textarea }}
                rows={2}
              />
            </div>
            <button className="lms-btn-primary" onClick={handleCreate} style={s.btnPrimary}>
              + Create Module
            </button>
          </div>

          {/* Module list */}
          <div style={s.card}>
            <h2 style={s.cardTitle}>Your Modules <span style={s.count}>({modules.length})</span></h2>
            {modules.length === 0 ? (
              <p style={s.empty}>No modules yet. Create one above.</p>
            ) : (
              <div style={s.moduleList}>
                {modules.map((mod, i) => (
                  <div
                    key={mod.id}
                    style={{
                      ...s.moduleItem,
                      ...(selectedModule?.id === mod.id ? s.moduleItemActive : {}),
                    }}
                  >
                    <div style={s.moduleItemLeft}>
                      <span style={s.moduleNum}>{String(i + 1).padStart(2, '0')}</span>
                      <div>
                        <p style={s.moduleTitle}>{mod.title}</p>
                        {mod.description && <p style={s.moduleDesc}>{mod.description}</p>}
                      </div>
                    </div>
                    <div style={s.moduleActions}>
                      <button
                        className="lms-btn-ghost"
                        onClick={() => openEdit(mod)}
                        style={s.btnIcon}
                        title="Edit module"
                      >
                        ✏️
                      </button>
                      <button
                        className="lms-btn-ghost"
                        onClick={() => openAddPage(mod)}
                        style={{ ...s.btnIcon, ...s.btnGreen }}
                        title="Add page"
                      >
                        + Page
                      </button>
                      <button
                        className="lms-btn-ghost"
                        onClick={() => handleDelete(mod.id)}
                        style={{ ...s.btnIcon, ...s.btnRed }}
                        title="Delete module"
                      >
                        🗑
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right panel */}
        {mode && (
          <div style={s.panel}>
            {/* Edit Module */}
            

            {/* Add Page */}
            {mode === 'addPage' && (
              <>
                <div style={s.panelHeader}>
                  <h3 style={s.panelTitle}>Add Page</h3>
                  <button onClick={closePanel} style={s.closeBtn}>✕</button>
                </div>
                <p style={s.panelSub}>Adding to: <strong>{selectedModule.title}</strong></p>

                <div style={s.fieldGroup}>
                  <label style={s.label}>
                    Standard Content
                    <span style={s.badge}>All students</span>
                  </label>
                  <textarea
                    className="lms-input"
                    placeholder="Main content visible to all students"
                    value={pageContent}
                    onChange={e => setPageContent(e.target.value)}
                    style={{ ...s.input, ...s.textarea }}
                    rows={4}
                  />
                </div>

                <div style={s.fieldGroup}>
                  <label style={s.label}>
                    Extend Content
                    <span style={{ ...s.badge, backgroundColor: '#fef9c3', color: '#854d0e' }}>Tier 2 & 3</span>
                  </label>
                  <textarea
                    className="lms-input"
                    placeholder="Additional content for intermediate and foundation students"
                    value={pageExtend}
                    onChange={e => setPageExtend(e.target.value)}
                    style={{ ...s.input, ...s.textarea }}
                    rows={3}
                  />
                </div>

                <div style={s.fieldGroup}>
                  <label style={s.label}>
                    Help Content
                    <span style={{ ...s.badge, backgroundColor: '#fee2e2', color: '#991b1b' }}>Tier 3 only</span>
                  </label>
                  <textarea
                    className="lms-input"
                    placeholder="Step-by-step guidance for foundation students"
                    value={pageHelp}
                    onChange={e => setPageHelp(e.target.value)}
                    style={{ ...s.input, ...s.textarea }}
                    rows={3}
                  />
                </div>

                <div style={s.panelActions}>
                  <button onClick={closePanel} style={s.btnSecondary}>Cancel</button>
                  <button className="lms-btn-primary" onClick={handleAddPage} style={s.btnPrimary}>
                    Add Page
                  </button>
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </PageLayout>
  );
}

const css = `
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
  .lms-input:focus { outline: none; border-color: #3b82f6 !important; box-shadow: 0 0 0 3px rgba(59,130,246,0.12); }
  .lms-btn-primary:hover { opacity: 0.9; }
  .lms-btn-ghost:hover { background: #f1f5f9 !important; }
`;

const s = {
  successBanner: {
    backgroundColor: '#dcfce7',
    border: '1px solid #86efac',
    color: '#166534',
    padding: '12px 16px',
    borderRadius: '10px',
    fontSize: '14px',
    fontWeight: 600,
    marginBottom: '20px',
  },
  layout: {
    display: 'grid',
    gridTemplateColumns: '1fr 400px',
    gap: '24px',
    alignItems: 'start',
  },
  left: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
  },
  card: {
    backgroundColor: '#ffffff',
    border: '1px solid #e2e8f0',
    borderRadius: '16px',
    padding: '24px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
  },
  cardTitle: {
    fontSize: '16px',
    fontWeight: 700,
    color: '#0f172a',
    margin: '0 0 16px 0',
    fontFamily: "'Inter', sans-serif",
  },
  count: {
    fontSize: '14px',
    fontWeight: 500,
    color: '#94a3b8',
  },
  fieldGroup: {
    marginBottom: '14px',
  },
  label: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    fontSize: '13px',
    fontWeight: 600,
    color: '#374151',
    marginBottom: '6px',
  },
  optional: {
    fontSize: '12px',
    fontWeight: 400,
    color: '#94a3b8',
  },
  badge: {
    fontSize: '11px',
    fontWeight: 600,
    backgroundColor: '#dcfce7',
    color: '#166534',
    padding: '2px 8px',
    borderRadius: '20px',
  },
  input: {
    width: '100%',
    border: '1.5px solid #e2e8f0',
    borderRadius: '10px',
    padding: '11px 14px',
    fontSize: '14px',
    color: '#0f172a',
    backgroundColor: '#f8fafc',
    fontFamily: "'Inter', sans-serif",
    transition: 'border-color 0.2s',
    boxSizing: 'border-box',
  },
  textarea: {
    resize: 'vertical',
    lineHeight: 1.6,
  },
  btnPrimary: {
    backgroundColor: '#1d4ed8',
    color: '#ffffff',
    border: 'none',
    borderRadius: '10px',
    padding: '11px 20px',
    fontSize: '14px',
    fontWeight: 600,
    cursor: 'pointer',
    fontFamily: "'Inter', sans-serif",
    transition: 'opacity 0.15s',
  },
  btnSecondary: {
    backgroundColor: '#ffffff',
    color: '#374151',
    border: '1.5px solid #e2e8f0',
    borderRadius: '10px',
    padding: '11px 20px',
    fontSize: '14px',
    fontWeight: 600,
    cursor: 'pointer',
    fontFamily: "'Inter', sans-serif",
  },
  moduleList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  moduleItem: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '12px',
    padding: '12px 14px',
    borderRadius: '10px',
    border: '1.5px solid #e2e8f0',
    backgroundColor: '#f8fafc',
    transition: 'all 0.15s',
  },
  moduleItemActive: {
    borderColor: '#3b82f6',
    backgroundColor: '#eff6ff',
  },
  moduleItemLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    flex: 1,
    overflow: 'hidden',
  },
  moduleNum: {
    fontSize: '14px',
    fontWeight: 800,
    color: '#d1d5db',
    flexShrink: 0,
  },
  moduleTitle: {
    fontSize: '14px',
    fontWeight: 600,
    color: '#0f172a',
    margin: 0,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  moduleDesc: {
    fontSize: '12px',
    color: '#94a3b8',
    margin: 0,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  moduleActions: {
    display: 'flex',
    gap: '6px',
    flexShrink: 0,
  },
  btnIcon: {
    padding: '6px 10px',
    borderRadius: '8px',
    border: '1px solid #e2e8f0',
    backgroundColor: '#ffffff',
    fontSize: '13px',
    fontWeight: 600,
    cursor: 'pointer',
    fontFamily: "'Inter', sans-serif",
    transition: 'background 0.15s',
  },
  btnGreen: {
    color: '#16a34a',
    borderColor: '#86efac',
    backgroundColor: '#f0fdf4',
  },
  btnRed: {
    color: '#dc2626',
    borderColor: '#fecaca',
    backgroundColor: '#fef2f2',
  },
  empty: {
    fontSize: '14px',
    color: '#94a3b8',
    textAlign: 'center',
    padding: '20px 0',
  },

  // Panel
  panel: {
    backgroundColor: '#ffffff',
    border: '1px solid #e2e8f0',
    borderRadius: '16px',
    padding: '24px',
    boxShadow: '0 4px 16px rgba(0,0,0,0.06)',
    position: 'sticky',
    top: '80px',
  },
  panelHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '4px',
  },
  panelTitle: {
    fontSize: '16px',
    fontWeight: 700,
    color: '#0f172a',
    margin: 0,
    fontFamily: "'Inter', sans-serif",
  },
  panelSub: {
    fontSize: '13px',
    color: '#64748b',
    marginBottom: '20px',
  },
  closeBtn: {
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    fontSize: '16px',
    color: '#94a3b8',
    padding: '4px',
    borderRadius: '6px',
    fontFamily: "'Inter', sans-serif",
  },
  panelActions: {
    display: 'flex',
    gap: '10px',
    justifyContent: 'flex-end',
    marginTop: '4px',
  },
};