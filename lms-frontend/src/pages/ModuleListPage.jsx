import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import PageLayout from '../components/PageLayout';
import api from '../api/axios';

export default function ModuleListPage() {
  const [modules, setModules] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    api.get('/modules').then(res => setModules(res.data)).finally(() => setLoading(false));
  }, []);

  if (loading) return <PageLayout title="Modules"><p style={{ color: '#6b7280' }}>Loading...</p></PageLayout>;

  return (
    <PageLayout title="Modules" subtitle="Select a module to start learning.">
      {modules.length === 0 ? (
        <div style={s.empty}>No modules available yet.</div>
      ) : (
        <div style={s.list}>
          {modules.map((mod, i) => (
            <button
              key={mod.id}
              onClick={() => navigate(`/student/modules/${mod.id}`)}
              style={s.card}
              onMouseEnter={e => e.currentTarget.style.backgroundColor = '#f9fafb'}
              onMouseLeave={e => e.currentTarget.style.backgroundColor = '#ffffff'}
            >
              <div style={s.num}>{String(i + 1).padStart(2, '0')}</div>
              <div style={s.info}>
                <h3 style={s.title}>{mod.title}</h3>
                {mod.description && <p style={s.desc}>{mod.description}</p>}
              </div>
              <span style={s.arrow}>→</span>
            </button>
          ))}
        </div>
      )}
    </PageLayout>
  );
}

const s = {
  list: { display: 'flex', flexDirection: 'column', gap: '12px' },
  card: {
    display: 'flex',
    alignItems: 'center',
    gap: '20px',
    backgroundColor: '#ffffff',
    border: '1px solid #e5e7eb',
    borderRadius: '14px',
    padding: '20px 24px',
    cursor: 'pointer',
    textAlign: 'left',
    transition: 'background-color 0.15s',
    boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
  },
  num: {
    fontFamily: "'Syne', sans-serif",
    fontWeight: 800,
    fontSize: '22px',
    color: '#d1d5db',
    minWidth: '40px',
  },
  info: { flex: 1 },
  title: {
    fontFamily: "'Syne', sans-serif",
    fontWeight: 700,
    fontSize: '16px',
    color: '#111827',
    margin: '0 0 4px 0',
  },
  desc: { fontSize: '14px', color: '#6b7280', margin: 0 },
  arrow: { fontSize: '20px', color: '#9ca3af' },
  empty: { color: '#6b7280', fontSize: '15px' },
};