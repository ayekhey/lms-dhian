import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import PageLayout from '../components/PageLayout';
import api from '../api/axios';

export default function TeacherStudentPage() {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [resetPasswordId, setResetPasswordId] = useState(null);
  const [newPassword, setNewPassword] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [showCreate, setShowCreate] = useState(false);
  const [search, setSearch] = useState('');

  useEffect(() => { fetchStudents(); }, []);

  const fetchStudents = () => {
    api.get('/users/students').then(res => setStudents(res.data)).finally(() => setLoading(false));
  };

  const showSuccess = (msg) => {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(''), 3000);
  };

  const handleCreate = async () => {
    if (!name || !email || !password) return alert('All fields are required');
    try {
      await api.post('/users/students', { name, email, password });
      setName(''); setEmail(''); setPassword('');
      setShowCreate(false);
      fetchStudents();
      showSuccess('Student account created');
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to create student');
    }
  };

  const handleResetPassword = async (id) => {
    if (!newPassword) return alert('Enter a new password');
    await api.put(`/users/students/${id}/reset-password`, { password: newPassword });
    setResetPasswordId(null); setNewPassword('');
    showSuccess('Password reset');
  };

  const handleResetDiagnostic = async (id) => {
    if (!confirm('Reset diagnostic? Student will need to retake it.')) return;
    await api.put(`/users/students/${id}/reset-diagnostic`);
    fetchStudents();
    showSuccess('Diagnostic reset');
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this student? This cannot be undone.')) return;
    await api.delete(`/users/students/${id}`);
    fetchStudents();
    showSuccess('Student deleted');
  };

  const tierMap = {
    1: { label: 'Tier 1 — Advanced', bg: '#dcfce7', color: '#166534' },
    2: { label: 'Tier 2 — Intermediate', bg: '#fef9c3', color: '#854d0e' },
    3: { label: 'Tier 3 — Foundation', bg: '#fee2e2', color: '#991b1b' },
  };

  const filtered = students.filter(s =>
    s.name.toLowerCase().includes(search.toLowerCase()) ||
    s.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <PageLayout title="Students" subtitle="Manage student accounts and diagnostics.">
      <style>{css}</style>

      {successMsg && <div style={s.successBanner}>✓ {successMsg}</div>}

      <div style={s.topRow}>
        <input
          className="lms-input"
          placeholder="Search students..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{ ...s.input, width: '280px' }}
        />
        <button onClick={() => setShowCreate(c => !c)} style={s.btnPrimary}>
          {showCreate ? '✕ Cancel' : '+ New Student'}
        </button>
      </div>

      {/* Create form */}
      {showCreate && (
        <div style={{ ...s.card, marginBottom: '20px' }}>
          <h2 style={s.cardTitle}>Create Student Account</h2>
          <div style={s.row3}>
            <div style={s.fieldGroup}>
              <label style={s.label}>Full name</label>
              <input className="lms-input" placeholder="e.g. John Doe" value={name} onChange={e => setName(e.target.value)} style={s.input} />
            </div>
            <div style={s.fieldGroup}>
              <label style={s.label}>Email</label>
              <input className="lms-input" type="email" placeholder="john@school.edu" value={email} onChange={e => setEmail(e.target.value)} style={s.input} />
            </div>
            <div style={s.fieldGroup}>
              <label style={s.label}>Initial password</label>
              <input className="lms-input" type="password" placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)} style={s.input} />
            </div>
          </div>
          <button onClick={handleCreate} style={s.btnPrimary}>Create Account</button>
        </div>
      )}

      {/* Student list */}
      <div style={s.card}>
        <h2 style={s.cardTitle}>
          Students <span style={s.count}>({filtered.length}{search ? ` of ${students.length}` : ''})</span>
        </h2>

        {loading ? <p style={s.empty}>Loading...</p> : filtered.length === 0 ? (
          <div style={s.emptyState}>
            <span style={{ fontSize: '32px' }}>👥</span>
            <p style={s.emptyTitle}>{search ? 'No students found' : 'No students yet'}</p>
            <p style={s.emptySub}>{search ? 'Try a different search' : 'Create your first student above'}</p>
          </div>
        ) : (
          <div style={s.studentList}>
            {filtered.map(student => {
              const tier = tierMap[student.tier];
              return (
                <div key={student.id} style={s.studentCard}>
                  <div style={s.studentLeft}>
                    <div style={s.avatar}>{student.name.charAt(0).toUpperCase()}</div>
                    <div>
                      <p style={s.studentName}>{student.name}</p>
                      <p style={s.studentEmail}>{student.email}</p>
                      <div style={{ display: 'flex', gap: '6px', marginTop: '6px', flexWrap: 'wrap' }}>
                        {tier ? (
                          <span style={{ ...s.tierBadge, backgroundColor: tier.bg, color: tier.color }}>{tier.label}</span>
                        ) : (
                          <span style={{ ...s.tierBadge, backgroundColor: '#f1f5f9', color: '#64748b' }}>No tier</span>
                        )}
                        <span style={{ ...s.tierBadge, backgroundColor: student.diagnosticDone ? '#eff6ff' : '#fff7ed', color: student.diagnosticDone ? '#1d4ed8' : '#92400e' }}>
                          {student.diagnosticDone ? 'Diagnostic done' : 'Diagnostic pending'}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div style={s.studentActions}>
                    <button onClick={() => { setResetPasswordId(student.id); setNewPassword(''); }} style={s.actionBtn}>
                      🔑 Reset Password
                    </button>
                    <button onClick={() => handleResetDiagnostic(student.id)} style={{ ...s.actionBtn, color: '#1d4ed8', borderColor: '#bfdbfe', backgroundColor: '#eff6ff' }}>
                      🔄 Reset Diagnostic
                    </button>
                    <button onClick={() => handleDelete(student.id)} style={{ ...s.actionBtn, color: '#dc2626', borderColor: '#fecaca', backgroundColor: '#fef2f2' }}>
                      🗑 Delete
                    </button>
                  </div>

                  {resetPasswordId === student.id && (
                    <div style={s.resetRow}>
                      <input
                        className="lms-input"
                        type="password"
                        placeholder="New password"
                        value={newPassword}
                        onChange={e => setNewPassword(e.target.value)}
                        style={{ ...s.input, flex: 1 }}
                      />
                      <button onClick={() => handleResetPassword(student.id)} style={s.btnPrimary}>Save</button>
                      <button onClick={() => setResetPasswordId(null)} style={s.btnGhost}>Cancel</button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </PageLayout>
  );
}

const css = `
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
  .lms-input:focus { outline: none; border-color: #3b82f6 !important; box-shadow: 0 0 0 3px rgba(59,130,246,0.12); }
`;

const s = {
  successBanner: { backgroundColor: '#dcfce7', border: '1px solid #86efac', color: '#166634', padding: '12px 16px', borderRadius: '10px', fontSize: '14px', fontWeight: 600, marginBottom: '20px' },
  topRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', gap: '12px' },
  card: { backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '24px 28px', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' },
  cardTitle: { fontSize: '16px', fontWeight: 700, color: '#0f172a', margin: '0 0 20px 0', fontFamily: "'Inter', sans-serif" },
  count: { fontSize: '14px', fontWeight: 500, color: '#94a3b8' },
  row3: { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginBottom: '16px' },
  fieldGroup: { marginBottom: '0' },
  label: { display: 'block', fontSize: '13px', fontWeight: 600, color: '#374151', marginBottom: '6px' },
  input: { width: '100%', border: '1.5px solid #e2e8f0', borderRadius: '10px', padding: '11px 14px', fontSize: '14px', color: '#0f172a', backgroundColor: '#f8fafc', fontFamily: "'Inter', sans-serif", boxSizing: 'border-box' },
  btnPrimary: { backgroundColor: '#1d4ed8', color: '#ffffff', border: 'none', borderRadius: '10px', padding: '11px 20px', fontSize: '14px', fontWeight: 600, cursor: 'pointer', fontFamily: "'Inter', sans-serif", whiteSpace: 'nowrap' },
  btnGhost: { backgroundColor: '#ffffff', color: '#64748b', border: '1.5px solid #e2e8f0', borderRadius: '10px', padding: '11px 16px', fontSize: '14px', fontWeight: 600, cursor: 'pointer', fontFamily: "'Inter', sans-serif" },
  empty: { color: '#94a3b8', fontSize: '14px' },
  emptyState: { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', padding: '32px 0', textAlign: 'center' },
  emptyTitle: { fontSize: '15px', fontWeight: 600, color: '#374151', margin: 0 },
  emptySub: { fontSize: '13px', color: '#94a3b8', margin: 0 },
  studentList: { display: 'flex', flexDirection: 'column', gap: '12px' },
  studentCard: { border: '1.5px solid #e2e8f0', borderRadius: '12px', padding: '16px 20px', backgroundColor: '#f8fafc' },
  studentLeft: { display: 'flex', alignItems: 'flex-start', gap: '12px', marginBottom: '12px' },
  avatar: { width: '40px', height: '40px', borderRadius: '50%', background: 'linear-gradient(135deg, #1d4ed8, #3b82f6)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '16px', flexShrink: 0 },
  studentName: { fontSize: '14px', fontWeight: 700, color: '#0f172a', margin: 0 },
  studentEmail: { fontSize: '13px', color: '#64748b', margin: '2px 0 0' },
  tierBadge: { fontSize: '11px', fontWeight: 600, padding: '3px 10px', borderRadius: '20px' },
  studentActions: { display: 'flex', gap: '8px', flexWrap: 'wrap' },
  actionBtn: { fontSize: '12px', fontWeight: 600, color: '#64748b', backgroundColor: '#f1f5f9', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '6px 12px', cursor: 'pointer', fontFamily: "'Inter', sans-serif" },
  resetRow: { display: 'flex', gap: '8px', alignItems: 'center', marginTop: '12px', paddingTop: '12px', borderTop: '1px solid #e2e8f0' },
};