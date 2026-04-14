import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import PageLayout from '../components/PageLayout';
import api from '../api/axios';

export default function TeacherDiagnosticPage() {
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [questionText, setQuestionText] = useState('');
  const [options, setOptions] = useState(['', '', '', '']);
  const [correctOption, setCorrectOption] = useState(0);
  const [activeTab, setActiveTab] = useState('questions'); // 'questions' | 'pretest' | 'posttest'
  const [successMsg, setSuccessMsg] = useState('');

  // Pre test config
  const [preTimer, setPreTimer] = useState('');
  const [preRandomize, setPreRandomize] = useState(false);
  const [preMaxScore, setPreMaxScore] = useState('');

  // Post test config
  const [postTimer, setPostTimer] = useState('');
  const [postRandomize, setPostRandomize] = useState(false);
  const [postMaxScore, setPostMaxScore] = useState('');

  // Results
  const [preResults, setPreResults] = useState([]);
  const [postResults, setPostResults] = useState([]);

  useEffect(() => {
    fetchAll();
  }, []);

  const fetchAll = async () => {
    try {
      const [qRes, preRes, postRes, preResultsRes, postResultsRes] = await Promise.all([
        api.get('/diagnostic/manage'),
        api.get('/diagnostic/config'),
        api.get('/posttest/config'),
        api.get('/diagnostic/results').catch(() => ({ data: [] })),
        api.get('/posttest/results'),
      ]);
      setQuestions(qRes.data);
      setPreTimer(preRes.data.timerMinutes || '');
      setPreRandomize(preRes.data.randomize || false);
      setPreMaxScore(preRes.data.maxScore || '');
      setPostTimer(postRes.data.timerMinutes || '');
      setPostRandomize(postRes.data.randomize || false);
      setPostMaxScore(postRes.data.maxScore || '');
      setPreResults(preResultsRes.data);
      setPostResults(postResultsRes.data);
    } finally {
      setLoading(false);
    }
  };

  const showSuccess = (msg) => {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(''), 3000);
  };

  const handleOptionChange = (i, val) => {
    const updated = [...options];
    updated[i] = val;
    setOptions(updated);
  };

  const handleCreate = async () => {
    if (!questionText) return alert('Question text is required');
    if (options.some(o => !o)) return alert('All options must be filled in');
    await api.post('/diagnostic/questions', { questionText, options, correctOption });
    setQuestionText(''); setOptions(['', '', '', '']); setCorrectOption(0);
    fetchAll();
    showSuccess('Question added');
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this question?')) return;
    await api.delete(`/diagnostic/questions/${id}`);
    fetchAll();
    showSuccess('Question deleted');
  };

  const handleSavePreConfig = async () => {
    await api.put('/diagnostic/config', {
      timerMinutes: preTimer ? parseInt(preTimer) : null,
      randomize: preRandomize,
      maxScore: preMaxScore ? parseInt(preMaxScore) : null,
    });
    showSuccess('Pre test settings saved');
  };

  const handleSavePostConfig = async () => {
    await api.put('/posttest/config', {
      randomize: postRandomize,
      maxScore: postMaxScore ? parseInt(postMaxScore) : null,
      timerMinutes: postTimer ? parseInt(postTimer) : null,
    });
    showSuccess('Post test settings saved');
  };

  const tabs = [
    { id: 'questions', label: '📋 Questions' },
    { id: 'pretest', label: '🔵 Pre Test Settings' },
    { id: 'posttest', label: '🟣 Post Test Settings' },
  ];

  return (
    <PageLayout title="Diagnostic" subtitle="Manage questions and test settings.">
      <style>{css}</style>

      {successMsg && <div style={s.successBanner}>✓ {successMsg}</div>}

      {/* Tabs */}
      <div style={s.tabs}>
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            style={{ ...s.tab, ...(activeTab === tab.id ? s.tabActive : {}) }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Questions tab */}
      {activeTab === 'questions' && (
        <div style={s.layout}>
          <div style={s.card}>
            <h2 style={s.cardTitle}>Add Question</h2>
            <p style={s.cardSub}>Questions are shared between pre test and post test.</p>
            <div style={s.fieldGroup}>
              <label style={s.label}>Question text</label>
              <textarea
                className="lms-input"
                placeholder="e.g. What is the capital of France?"
                value={questionText}
                onChange={e => setQuestionText(e.target.value)}
                style={{ ...s.input, ...s.textarea }}
                rows={3}
              />
            </div>
            <div style={s.fieldGroup}>
              <label style={s.label}>Options <span style={s.optional}>(select correct answer)</span></label>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {options.map((opt, i) => (
                  <div key={i} style={s.optRow}>
                    <input type="radio" name="correct" checked={correctOption === i} onChange={() => setCorrectOption(i)} />
                    <input className="lms-input" placeholder={`Option ${i + 1}`} value={opt} onChange={e => handleOptionChange(i, e.target.value)} style={{ ...s.input, flex: 1 }} />
                  </div>
                ))}
              </div>
            </div>
            <button onClick={handleCreate} style={s.btnPrimary}>Add Question</button>
          </div>

          <div style={s.card}>
            <h2 style={s.cardTitle}>Questions <span style={s.count}>({questions.length})</span></h2>
            {loading ? <p style={s.empty}>Loading...</p> : questions.length === 0 ? (
              <div style={s.emptyState}>
                <span style={{ fontSize: '32px' }}>🧪</span>
                <p style={s.emptyTitle}>No questions yet</p>
                <p style={s.emptySub}>Add your first question on the left</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {questions.map((q, i) => (
                  <div key={q.id} style={s.qCard}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '12px', marginBottom: '10px' }}>
                      <div style={{ display: 'flex', gap: '10px', flex: 1 }}>
                        <div style={s.qNum}>Q{i + 1}</div>
                        <p style={s.qText}>{typeof q.questionText === 'string' && q.questionText.startsWith('{') ? JSON.parse(q.questionText)?.content?.[0]?.content?.[0]?.text || 'Rich text question' : q.questionText}</p>
                      </div>
                      <button onClick={() => handleDelete(q.id)} style={s.deleteBtn}>🗑</button>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', paddingLeft: '36px' }}>
                      {q.options.map((opt, j) => (
                        <div key={j} style={{
                          display: 'flex', alignItems: 'center', gap: '8px',
                          padding: '6px 10px', borderRadius: '8px', fontSize: '13px',
                          backgroundColor: j === q.correctOption ? '#dcfce7' : '#f8fafc',
                          color: j === q.correctOption ? '#166534' : '#64748b',
                          fontWeight: j === q.correctOption ? 600 : 400,
                          border: `1px solid ${j === q.correctOption ? '#86efac' : '#e2e8f0'}`,
                        }}>
                          {j === q.correctOption && <span style={{ fontSize: '11px' }}>✓</span>}
                          {typeof opt === 'string' && opt.startsWith('{') ? JSON.parse(opt)?.content?.[0]?.content?.[0]?.text || opt : opt}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Pre test settings */}
      {activeTab === 'pretest' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div style={s.card}>
            <h2 style={s.cardTitle}>Pre Test Settings</h2>
            <p style={s.cardSub}>Students take this before accessing the dashboard. Results determine their tier.</p>

            <div style={s.row3}>
              <div style={s.fieldGroup}>
                <label style={s.label}>Timer (minutes)</label>
                <input className="lms-input" type="number" placeholder="No limit" value={preTimer} onChange={e => setPreTimer(e.target.value)} style={s.input} />
              </div>
              <div style={s.fieldGroup}>
                <label style={s.label}>Max score</label>
                <input className="lms-input" type="number" placeholder="Defaults to question count" value={preMaxScore} onChange={e => setPreMaxScore(e.target.value)} style={s.input} />
              </div>
              <div style={s.fieldGroup}>
                <label style={s.label}>Randomize</label>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', paddingTop: '11px' }}>
                  <input type="checkbox" checked={preRandomize} onChange={e => setPreRandomize(e.target.checked)} id="preRand" />
                  <label htmlFor="preRand" style={{ fontSize: '14px', color: '#374151', cursor: 'pointer' }}>
                    Randomize questions & answers
                  </label>
                </div>
              </div>
            </div>
            <button onClick={handleSavePreConfig} style={s.btnPrimary}>Save Pre Test Settings</button>
          </div>

          {/* Pre test results */}
          <div style={s.card}>
            <h2 style={s.cardTitle}>Pre Test Results <span style={s.count}>({preResults.length} submissions)</span></h2>
            {preResults.length === 0 ? (
              <p style={s.empty}>No submissions yet.</p>
            ) : (
              <div style={s.tableWrap}>
                <table style={s.table}>
                  <thead>
                    <tr style={s.tableHead}>
                      <th style={s.th}>Student</th>
                      <th style={s.th}>Email</th>
                      <th style={s.th}>Tier</th>
                      <th style={s.th}>Score</th>
                      <th style={s.th}>Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {preResults.map(r => (
                      <tr key={r.id} style={s.tableRow}>
                        <td style={s.td}>{r.student?.name}</td>
                        <td style={{ ...s.td, color: '#64748b' }}>{r.student?.email}</td>
                        <td style={s.td}>
                          <span style={{ fontSize: '12px', fontWeight: 700, backgroundColor: '#eff6ff', color: '#1d4ed8', padding: '3px 10px', borderRadius: '20px' }}>
                            Tier {r.student?.tier || '—'}
                          </span>
                        </td>
                        <td style={s.td}>{r.score}/{r.total}</td>
                        <td style={{ ...s.td, color: '#64748b' }}>{new Date(r.submittedAt).toLocaleDateString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Post test settings */}
      {activeTab === 'posttest' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div style={s.card}>
            <h2 style={s.cardTitle}>Post Test Settings</h2>
            <p style={s.cardSub}>Students take this after finishing all module pages. Uses the same question bank.</p>

            <div style={s.row3}>
  <div style={s.fieldGroup}>
    <label style={s.label}>Timer (minutes)</label>
    <input className="lms-input" type="number" placeholder="No limit" value={postTimer} onChange={e => setPostTimer(e.target.value)} style={s.input} />
  </div>
  <div style={s.fieldGroup}>
    <label style={s.label}>Max score</label>
    <input className="lms-input" type="number" placeholder="Defaults to question count" value={postMaxScore} onChange={e => setPostMaxScore(e.target.value)} style={s.input} />
  </div>
  <div style={s.fieldGroup}>
    <label style={s.label}>Randomize</label>
    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', paddingTop: '11px' }}>
      <input type="checkbox" checked={postRandomize} onChange={e => setPostRandomize(e.target.checked)} id="postRand" />
      <label htmlFor="postRand" style={{ fontSize: '14px', color: '#374151', cursor: 'pointer' }}>
        Randomize questions & answers
      </label>
    </div>
  </div>
</div>
            <button onClick={handleSavePostConfig} style={s.btnPrimary}>Save Post Test Settings</button>
          </div>

          {/* Post test results */}
          <div style={s.card}>
            <h2 style={s.cardTitle}>Post Test Results <span style={s.count}>({postResults.length} submissions)</span></h2>
            {postResults.length === 0 ? (
              <p style={s.empty}>No submissions yet.</p>
            ) : (
              <div style={s.tableWrap}>
                <table style={s.table}>
                  <thead>
                    <tr style={s.tableHead}>
                      <th style={s.th}>Student</th>
                      <th style={s.th}>Email</th>
                      <th style={s.th}>Tier</th>
                      <th style={s.th}>Score</th>
                      <th style={s.th}>Max</th>
                      <th style={s.th}>Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {postResults.map(r => (
                      <tr key={r.id} style={s.tableRow}>
                        <td style={s.td}>{r.student?.name}</td>
                        <td style={{ ...s.td, color: '#64748b' }}>{r.student?.email}</td>
                        <td style={s.td}>
                          <span style={{ fontSize: '12px', fontWeight: 700, backgroundColor: '#f5f3ff', color: '#7c3aed', padding: '3px 10px', borderRadius: '20px' }}>
                            Tier {r.student?.tier || '—'}
                          </span>
                        </td>
                        <td style={s.td}><strong>{r.score}</strong></td>
                        <td style={{ ...s.td, color: '#64748b' }}>{r.maxScore}</td>
                        <td style={{ ...s.td, color: '#64748b' }}>{new Date(r.submittedAt).toLocaleDateString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
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
  tabs: { display: 'flex', gap: '8px', marginBottom: '24px', flexWrap: 'wrap' },
  tab: { padding: '8px 16px', borderRadius: '10px', border: '1.5px solid #e2e8f0', backgroundColor: '#ffffff', color: '#64748b', fontSize: '13px', fontWeight: 600, cursor: 'pointer', fontFamily: "'Inter', sans-serif", transition: 'all 0.15s' },
  tabActive: { backgroundColor: '#1d4ed8', borderColor: '#1d4ed8', color: '#ffffff' },
  layout: { display: 'grid', gridTemplateColumns: '380px 1fr', gap: '24px', alignItems: 'start' },
  card: { backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' },
  cardTitle: { fontSize: '16px', fontWeight: 700, color: '#0f172a', margin: '0 0 4px 0', fontFamily: "'Inter', sans-serif" },
  cardSub: { fontSize: '13px', color: '#94a3b8', margin: '0 0 20px 0' },
  count: { fontSize: '14px', fontWeight: 500, color: '#94a3b8' },
  row2: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' },
  row3: { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginBottom: '16px' },
  fieldGroup: { marginBottom: '0' },
  label: { display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', fontWeight: 600, color: '#374151', marginBottom: '6px' },
  optional: { fontSize: '12px', fontWeight: 400, color: '#94a3b8' },
  input: { width: '100%', border: '1.5px solid #e2e8f0', borderRadius: '10px', padding: '11px 14px', fontSize: '14px', color: '#0f172a', backgroundColor: '#f8fafc', fontFamily: "'Inter', sans-serif", boxSizing: 'border-box' },
  textarea: { resize: 'vertical', lineHeight: 1.6 },
  optRow: { display: 'flex', alignItems: 'center', gap: '8px' },
  btnPrimary: { backgroundColor: '#1d4ed8', color: '#ffffff', border: 'none', borderRadius: '10px', padding: '11px 20px', fontSize: '14px', fontWeight: 600, cursor: 'pointer', fontFamily: "'Inter', sans-serif" },
  empty: { color: '#94a3b8', fontSize: '14px' },
  emptyState: { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', padding: '32px 0', textAlign: 'center' },
  emptyTitle: { fontSize: '15px', fontWeight: 600, color: '#374151', margin: 0 },
  emptySub: { fontSize: '13px', color: '#94a3b8', margin: 0 },
  qCard: { border: '1.5px solid #e2e8f0', borderRadius: '12px', padding: '16px', backgroundColor: '#f8fafc' },
  qNum: { width: '28px', height: '28px', borderRadius: '8px', backgroundColor: '#eff6ff', color: '#1d4ed8', fontSize: '12px', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  qText: { fontSize: '14px', fontWeight: 600, color: '#0f172a', margin: 0, lineHeight: 1.5 },
  deleteBtn: { background: 'none', border: 'none', cursor: 'pointer', fontSize: '16px', color: '#94a3b8', padding: '2px', flexShrink: 0 },
  tableWrap: { overflowX: 'auto' },
  table: { width: '100%', borderCollapse: 'collapse', fontSize: '14px' },
  tableHead: { backgroundColor: '#f8fafc' },
  th: { padding: '10px 14px', textAlign: 'left', fontSize: '12px', fontWeight: 700, color: '#64748b', letterSpacing: '0.04em', textTransform: 'uppercase', borderBottom: '1px solid #e2e8f0' },
  tableRow: { borderBottom: '1px solid #f1f5f9' },
  td: { padding: '12px 14px', fontSize: '14px', color: '#0f172a' },
};