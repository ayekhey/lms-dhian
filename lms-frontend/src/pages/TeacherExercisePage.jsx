import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import PageLayout from '../components/PageLayout';
import api from '../api/axios';

export default function TeacherExercisePage() {
  const [exercises, setExercises] = useState([]);
  const [title, setTitle] = useState('');
  const [timerMinutes, setTimerMinutes] = useState('');
  const [questions, setQuestions] = useState([{ questionText: '', options: ['', '', '', ''], correctOption: 0 }]);
  const [selectedExercise, setSelectedExercise] = useState(null);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => { fetchExercises(); }, []);

  const fetchExercises = () => {
    api.get('/exercises').then(res => setExercises(res.data)).finally(() => setLoading(false));
  };

  const showSuccess = (msg) => {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(''), 3000);
  };

  const handleQuestionChange = (i, field, value) => {
    const updated = [...questions];
    updated[i][field] = value;
    setQuestions(updated);
  };

  const handleOptionChange = (qi, oi, value) => {
    const updated = [...questions];
    updated[qi].options[oi] = value;
    setQuestions(updated);
  };

  const handleCreate = async () => {
    if (!title) return alert('Title is required');
    await api.post('/exercises', { title, timerMinutes: timerMinutes ? parseInt(timerMinutes) : null, questions });
    setTitle(''); setTimerMinutes('');
    setQuestions([{ questionText: '', options: ['', '', '', ''], correctOption: 0 }]);
    setShowCreate(false);
    fetchExercises();
    showSuccess('Exercise created');
  };

  const viewResults = async (ex) => {
    setSelectedExercise(ex);
    const res = await api.get(`/exercises/${ex.id}/results`);
    setResults(res.data);
  };

  const downloadCSV = () => {
    window.open(`http://localhost:3001/api/exercises/${selectedExercise.id}/results/export`, '_blank');
  };

  return (
    <PageLayout title="Exercises" subtitle="Create exercises and view student results.">
      <style>{css}</style>

      {successMsg && <div style={s.successBanner}>✓ {successMsg}</div>}

      <div style={s.topRow}>
        <div />
        <button onClick={() => { setShowCreate(c => !c); setSelectedExercise(null); }} style={s.btnPrimary}>
          {showCreate ? '✕ Cancel' : '+ New Exercise'}
        </button>
      </div>

      {/* Create form */}
      {showCreate && (
        <div style={{ ...s.card, marginBottom: '20px' }}>
          <h2 style={s.cardTitle}>New Exercise</h2>

          <div style={s.row2}>
            <div style={s.fieldGroup}>
              <label style={s.label}>Title</label>
              <input className="lms-input" placeholder="e.g. Chapter 1 Quiz" value={title} onChange={e => setTitle(e.target.value)} style={s.input} />
            </div>
            <div style={s.fieldGroup}>
              <label style={s.label}>Timer <span style={s.optional}>(minutes, optional)</span></label>
              <input className="lms-input" type="number" placeholder="e.g. 10" value={timerMinutes} onChange={e => setTimerMinutes(e.target.value)} style={s.input} />
            </div>
          </div>

          <p style={s.sectionLabel}>Questions</p>

          {questions.map((q, i) => (
            <div key={i} style={s.questionCard}>
              <div style={s.questionHeader}>
                <span style={s.questionNum}>Q{i + 1}</span>
                {questions.length > 1 && (
                  <button onClick={() => setQuestions(qs => qs.filter((_, idx) => idx !== i))} style={s.removeBtn}>Remove</button>
                )}
              </div>
              <input
                className="lms-input"
                placeholder="Question text"
                value={q.questionText}
                onChange={e => handleQuestionChange(i, 'questionText', e.target.value)}
                style={{ ...s.input, marginBottom: '10px' }}
              />
              <div style={s.optionsGrid}>
                {q.options.map((opt, j) => (
                  <div key={j} style={s.optRow}>
                    <input
                      type="radio"
                      name={`correct-${i}`}
                      checked={q.correctOption === j}
                      onChange={() => handleQuestionChange(i, 'correctOption', j)}
                      style={{ flexShrink: 0 }}
                    />
                    <input
                      className="lms-input"
                      placeholder={`Option ${j + 1}`}
                      value={opt}
                      onChange={e => handleOptionChange(i, j, e.target.value)}
                      style={{ ...s.input, flex: 1 }}
                    />
                  </div>
                ))}
              </div>
              <p style={{ fontSize: '11px', color: '#94a3b8', marginTop: '6px' }}>Select the radio button next to the correct answer</p>
            </div>
          ))}

          <div style={{ display: 'flex', gap: '10px', marginTop: '4px' }}>
            <button onClick={() => setQuestions(qs => [...qs, { questionText: '', options: ['', '', '', ''], correctOption: 0 }])} style={s.btnOutline}>
              + Add Question
            </button>
            <button onClick={handleCreate} style={s.btnPrimary}>Create Exercise</button>
          </div>
        </div>
      )}

      {/* Exercise list */}
      <div style={s.card}>
        <h2 style={s.cardTitle}>Your Exercises <span style={s.count}>({exercises.length})</span></h2>
        {loading ? <p style={s.empty}>Loading...</p> : exercises.length === 0 ? (
          <div style={s.emptyState}>
            <span style={{ fontSize: '32px' }}>📝</span>
            <p style={s.emptyTitle}>No exercises yet</p>
            <p style={s.emptySub}>Create your first exercise above</p>
          </div>
        ) : (
          <div style={s.exList}>
            {exercises.map(ex => (
              <div key={ex.id} style={{ ...s.exItem, ...(selectedExercise?.id === ex.id ? s.exItemActive : {}) }}>
                <div style={s.exLeft}>
                  <p style={s.exTitle}>{ex.title}</p>
                  <div style={{ display: 'flex', gap: '8px', marginTop: '4px' }}>
                    <span style={s.metaTag}>📝 {ex.questions?.length || 0} questions</span>
                    {ex.timerMinutes && <span style={s.metaTag}>⏱ {ex.timerMinutes} min</span>}
                  </div>
                </div>
                <button onClick={() => viewResults(ex)} style={s.viewBtn}>
                  View Results
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Results */}
      {selectedExercise && (
        <div style={{ ...s.card, marginTop: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <div>
              <h2 style={s.cardTitle}>Results: {selectedExercise.title}</h2>
              <p style={{ fontSize: '13px', color: '#64748b', margin: 0 }}>{results.length} submission{results.length !== 1 ? 's' : ''}</p>
            </div>
            <button onClick={downloadCSV} style={s.csvBtn}>↓ Download CSV</button>
          </div>

          {results.length === 0 ? (
            <p style={s.empty}>No submissions yet.</p>
          ) : (
            <div style={s.tableWrap}>
              <table style={s.table}>
                <thead>
                  <tr style={s.tableHead}>
                    <th style={s.th}>Student</th>
                    <th style={s.th}>Email</th>
                    <th style={s.th}>Score</th>
                    <th style={s.th}>Submitted</th>
                  </tr>
                </thead>
                <tbody>
                  {results.map(r => (
                    <tr key={r.id} style={s.tableRow}>
                      <td style={s.td}>{r.student.name}</td>
                      <td style={{ ...s.td, color: '#64748b' }}>{r.student.email}</td>
                      <td style={s.td}>
                        <span style={{
                          fontSize: '12px', fontWeight: 700,
                          backgroundColor: '#eff6ff', color: '#1d4ed8',
                          padding: '3px 10px', borderRadius: '20px',
                        }}>
                          {r.score}
                        </span>
                      </td>
                      <td style={{ ...s.td, color: '#64748b' }}>{new Date(r.submittedAt).toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </PageLayout>
  );
}

const css = `
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
  .lms-input:focus { outline: none; border-color: #3b82f6 !important; box-shadow: 0 0 0 3px rgba(59,130,246,0.12); }
`;

const s = {
  successBanner: { backgroundColor: '#dcfce7', border: '1px solid #86efac', color: '#166634', padding: '12px 16px', borderRadius: '10px', fontSize: '14px', fontWeight: 600, marginBottom: '20px' },
  topRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' },
  card: { backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '24px 28px', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' },
  cardTitle: { fontSize: '16px', fontWeight: 700, color: '#0f172a', margin: '0 0 4px 0', fontFamily: "'Inter', sans-serif" },
  count: { fontSize: '14px', fontWeight: 500, color: '#94a3b8' },
  row2: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '4px' },
  fieldGroup: { marginBottom: '16px' },
  label: { display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', fontWeight: 600, color: '#374151', marginBottom: '6px' },
  optional: { fontSize: '12px', fontWeight: 400, color: '#94a3b8' },
  input: { width: '100%', border: '1.5px solid #e2e8f0', borderRadius: '10px', padding: '11px 14px', fontSize: '14px', color: '#0f172a', backgroundColor: '#f8fafc', fontFamily: "'Inter', sans-serif", boxSizing: 'border-box' },
  sectionLabel: { fontSize: '11px', fontWeight: 700, color: '#94a3b8', letterSpacing: '0.08em', textTransform: 'uppercase', margin: '0 0 12px 0' },
  questionCard: { border: '1.5px solid #e2e8f0', borderRadius: '12px', padding: '16px 20px', marginBottom: '12px', backgroundColor: '#f8fafc' },
  questionHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' },
  questionNum: { fontSize: '12px', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.06em' },
  removeBtn: { fontSize: '12px', color: '#dc2626', background: 'none', border: 'none', cursor: 'pointer', fontFamily: "'Inter', sans-serif" },
  optionsGrid: { display: 'flex', flexDirection: 'column', gap: '6px' },
  optRow: { display: 'flex', alignItems: 'center', gap: '8px' },
  btnPrimary: { backgroundColor: '#1d4ed8', color: '#ffffff', border: 'none', borderRadius: '10px', padding: '10px 20px', fontSize: '14px', fontWeight: 600, cursor: 'pointer', fontFamily: "'Inter', sans-serif" },
  btnOutline: { backgroundColor: '#ffffff', color: '#1d4ed8', border: '1.5px solid #1d4ed8', borderRadius: '10px', padding: '10px 16px', fontSize: '13px', fontWeight: 600, cursor: 'pointer', fontFamily: "'Inter', sans-serif" },
  empty: { color: '#94a3b8', fontSize: '14px' },
  emptyState: { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', padding: '32px 0', textAlign: 'center' },
  emptyTitle: { fontSize: '15px', fontWeight: 600, color: '#374151', margin: 0 },
  emptySub: { fontSize: '13px', color: '#94a3b8', margin: 0 },
  exList: { display: 'flex', flexDirection: 'column', gap: '10px' },
  exItem: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '16px', padding: '14px 16px', borderRadius: '10px', border: '1.5px solid #e2e8f0', backgroundColor: '#f8fafc', transition: 'all 0.15s' },
  exItemActive: { borderColor: '#3b82f6', backgroundColor: '#eff6ff' },
  exLeft: { flex: 1 },
  exTitle: { fontSize: '14px', fontWeight: 600, color: '#0f172a', margin: 0 },
  metaTag: { fontSize: '12px', fontWeight: 600, color: '#64748b', backgroundColor: '#f1f5f9', padding: '3px 10px', borderRadius: '20px' },
  viewBtn: { fontSize: '13px', fontWeight: 600, color: '#1d4ed8', backgroundColor: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: '8px', padding: '7px 14px', cursor: 'pointer', fontFamily: "'Inter', sans-serif", whiteSpace: 'nowrap' },
  csvBtn: { fontSize: '13px', fontWeight: 600, color: '#166534', backgroundColor: '#dcfce7', border: '1px solid #86efac', borderRadius: '8px', padding: '8px 16px', cursor: 'pointer', fontFamily: "'Inter', sans-serif" },
  tableWrap: { overflowX: 'auto' },
  table: { width: '100%', borderCollapse: 'collapse', fontSize: '14px' },
  tableHead: { backgroundColor: '#f8fafc' },
  th: { padding: '10px 14px', textAlign: 'left', fontSize: '12px', fontWeight: 700, color: '#64748b', letterSpacing: '0.04em', textTransform: 'uppercase', borderBottom: '1px solid #e2e8f0' },
  tableRow: { borderBottom: '1px solid #f1f5f9' },
  td: { padding: '12px 14px', fontSize: '14px', color: '#0f172a' },
};