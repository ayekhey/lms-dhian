import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';

function PreviousResult({ }) {
  const [data, setData] = useState(null);

  useEffect(() => {
    api.get('/posttest/my-result').then(res => setData(res.data)).catch(() => {});
  }, []);

  if (!data) return (
    <div style={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '20px', padding: '48px 40px', textAlign: 'center', boxShadow: '0 4px 20px rgba(0,0,0,0.06)' }}>
      <div style={{ fontSize: '48px', marginBottom: '16px' }}>✅</div>
      <h2 style={{ fontSize: '22px', fontWeight: 800, color: '#0f172a', marginBottom: '8px', fontFamily: "'Inter', sans-serif" }}>Post Test Completed</h2>
      <p style={{ fontSize: '15px', color: '#64748b' }}>Contact your teacher if you need to retake it.</p>
    </div>
  );

  const pct = Math.round((data.score / data.maxScore) * 100);

  return (
    <div style={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '20px', padding: '48px 40px', textAlign: 'center', boxShadow: '0 4px 20px rgba(0,0,0,0.06)' }}>
      <div style={{ fontSize: '48px', marginBottom: '16px' }}>{pct >= 70 ? '🎉' : '📚'}</div>
      <h2 style={{ fontSize: '22px', fontWeight: 800, color: '#0f172a', marginBottom: '4px', fontFamily: "'Inter', sans-serif" }}>Post Test Completed</h2>
      <p style={{ fontSize: '14px', color: '#94a3b8', marginBottom: '24px' }}>
        Your result from {new Date(data.submittedAt).toLocaleDateString()}
      </p>
      <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'center', gap: '4px', marginBottom: '16px' }}>
        <span style={{ fontSize: '56px', fontWeight: 800, color: '#7c3aed', fontFamily: "'Inter', sans-serif" }}>{data.score}</span>
        <span style={{ fontSize: '24px', color: '#94a3b8', fontWeight: 600 }}>/{data.maxScore}</span>
      </div>
      <div style={{ height: '8px', backgroundColor: '#f1f5f9', borderRadius: '4px', overflow: 'hidden', marginBottom: '16px' }}>
        <div style={{ height: '100%', width: `${pct}%`, background: 'linear-gradient(90deg, #7c3aed, #a78bfa)', borderRadius: '4px' }} />
      </div>
      <p style={{ fontSize: '14px', color: '#64748b' }}>{pct}% — Contact your teacher to retake.</p>
    </div>
  );
}

function renderText(content) {
  if (!content) return '';
  if (typeof content === 'string') {
    if (content.startsWith('{')) {
      try {
        const doc = JSON.parse(content);
        return doc?.content?.[0]?.content?.[0]?.text || content;
      } catch {
        return content;
      }
    }
    return content;
  }
  return String(content);
}

export default function PostTestPage() {
  const [questions, setQuestions] = useState([]);
  const [originalOptionOrders, setOriginalOptionOrders] = useState({});
  const [maxScore, setMaxScore] = useState(null);
  const [answers, setAnswers] = useState({});
  const [current, setCurrent] = useState(0);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [alreadyDone, setAlreadyDone] = useState(false);
  const [timeLeft, setTimeLeft] = useState(null);

  const { user, login } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user?.postTestDone) {
      setAlreadyDone(true);
      setLoading(false);
      return;
    }
    api.get('/posttest/questions')
      .then(res => {
        setQuestions(res.data.questions);
        setMaxScore(res.data.maxScore);
        if (res.data.timerMinutes) setTimeLeft(res.data.timerMinutes * 60);
        const orders = {};
        res.data.questions.forEach(q => {
          orders[q.id] = q.originalOptionOrder;
        });
        setOriginalOptionOrders(orders);
      })
      .catch(() => setError('Failed to load questions'))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (timeLeft === null || timeLeft <= 0) {
      if (timeLeft === 0 && !result) handleSubmit();
      return;
    }
    const t = setInterval(() => setTimeLeft(n => n - 1), 1000);
    return () => clearInterval(t);
  }, [timeLeft]);

  const formatTime = (s) => {
    const m = Math.floor(s / 60).toString().padStart(2, '0');
    const sec = (s % 60).toString().padStart(2, '0');
    return `${m}:${sec}`;
  };

  const handleAnswer = (qId, i) => setAnswers(prev => ({ ...prev, [qId]: i }));

  const handleSubmit = async () => {
    setSubmitting(true);
    setError('');
    try {
      const res = await api.post('/posttest/submit', { answers, originalOptionOrders });
      setResult(res.data);
      setTimeLeft(null);
      const token = localStorage.getItem('token');
      const meRes = await api.get('/auth/me');
      login(token, meRes.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Submission failed.');
      setSubmitting(false);
    }
  };

  const handleManualSubmit = () => {
    if (Object.keys(answers).length < questions.length) {
      setError('Please answer all questions before submitting.');
      return;
    }
    handleSubmit();
  };

  const q = questions[current];
  const isLast = current === questions.length - 1;
  const answered = Object.keys(answers).length;
  const progress = questions.length > 0 ? ((current + 1) / questions.length) * 100 : 0;
  const timerWarning = timeLeft !== null && timeLeft < 60;

  if (loading) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'Inter', sans-serif" }}>
      <div style={s.spinner} />
    </div>
  );

  if (alreadyDone) return (
    <div style={s.root}>
      <style>{css}</style>
      <div style={s.header}>
        <div style={s.headerInner}>
          <div style={s.headerLeft}>
            <div style={s.logoBox}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"
                  stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <div>
              <h1 style={s.headerTitle}>Post Test</h1>
              <p style={s.headerSub}>Completed</p>
            </div>
          </div>
        </div>
        <div style={s.progressTrack}>
          <div style={{ ...s.progressFill, width: '100%' }} />
        </div>
      </div>
      <div style={{ maxWidth: '500px', margin: '60px auto', padding: '0 24px' }}>
        <PreviousResult />
        <button
          onClick={() => navigate('/student/dashboard')}
          style={{ ...s.btnPrimary, width: '100%', marginTop: '16px' }}
        >
          Back to Dashboard
        </button>
      </div>
    </div>
  );

  if (result) return (
    <div style={s.root}>
      <style>{css}</style>
      <div style={s.header}>
        <div style={s.headerInner}>
          <div style={s.headerLeft}>
            <div style={s.logoBox}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"
                  stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <div>
              <h1 style={s.headerTitle}>Post Test</h1>
              <p style={s.headerSub}>Submitted</p>
            </div>
          </div>
        </div>
        <div style={s.progressTrack}>
          <div style={{ ...s.progressFill, width: '100%' }} />
        </div>
      </div>
      <div style={{ maxWidth: '500px', margin: '60px auto', padding: '0 24px' }}>
        <div style={s.resultCard}>
          <div style={{ fontSize: '48px', marginBottom: '16px', textAlign: 'center' }}>
            {result.score >= (result.maxScore * 0.7) ? '🎉' : '📚'}
          </div>
          <h2 style={s.resultTitle}>Post Test Complete!</h2>
          <p style={{ fontSize: '14px', color: '#94a3b8', marginBottom: '24px', textAlign: 'center' }}>
            {result.correct} of {result.total} questions correct
          </p>
          <div style={s.scoreWrap}>
            <span style={s.scoreBig}>{result.score}</span>
            <span style={{ fontSize: '24px', color: '#94a3b8', fontWeight: 600 }}>/{result.maxScore}</span>
          </div>
          <div style={s.scoreBar}>
            <div style={{
              ...s.scoreBarFill,
              width: `${Math.round((result.score / result.maxScore) * 100)}%`,
            }} />
          </div>
          <button
            onClick={() => navigate('/student/dashboard')}
            style={{ ...s.btnPrimary, width: '100%' }}
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div style={s.root}>
      <style>{css}</style>

      {/* Header */}
      <div style={s.header}>
        <div style={s.headerInner}>
          <div style={s.headerLeft}>
            <div style={s.logoBox}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"
                  stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <div>
              <h1 style={s.headerTitle}>Post Test</h1>
              <p style={s.headerSub}>Question {current + 1} of {questions.length}</p>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            {maxScore && (
              <div style={s.maxScoreBadge}>Max: {maxScore} pts</div>
            )}
            {timeLeft !== null && (
              <div style={{
                ...s.maxScoreBadge,
                backgroundColor: timerWarning ? '#fef2f2' : '#f5f3ff',
                color: timerWarning ? '#dc2626' : '#7c3aed',
                borderColor: timerWarning ? '#fecaca' : '#ddd6fe',
                fontWeight: 700,
                fontSize: '16px',
              }}>
                ⏱ {formatTime(timeLeft)}
              </div>
            )}
          </div>
        </div>

        {/* Progress bar */}
        <div style={s.progressTrack}>
          <div style={{ ...s.progressFill, width: `${progress}%` }} />
        </div>

        {/* Question number buttons */}
        <div style={s.dotsRow}>
          {questions.map((_, i) => {
            const isActive = i === current;
            const isDone = answers[questions[i]?.id] !== undefined;
            return (
              <button
                key={i}
                onClick={() => setCurrent(i)}
                style={{
                  ...s.qNumBtn,
                  ...(isActive ? s.qNumActive : {}),
                  ...(isDone && !isActive ? s.qNumDone : {}),
                }}
              >
                {i + 1}
              </button>
            );
          })}
        </div>
      </div>

      {/* Question */}
      <div style={s.content}>
        {error && <div style={s.errorBox}>⚠️ {error}</div>}

        {q && (
          <div style={s.card} key={current}>
            <div style={s.questionTop}>
              <div style={s.qNum}>Q{current + 1}</div>
              <p style={{ fontSize: '18px', fontWeight: 700, color: '#0f172a', flex: 1, lineHeight: 1.4, paddingTop: '4px', margin: 0 }}>
                {renderText(q.questionText)}
              </p>
              {answers[q.id] !== undefined && (
                <span style={s.answeredTag}>✓ Answered</span>
              )}
            </div>

            <div style={s.options}>
              {q.options.map((opt, i) => {
                const sel = answers[q.id] === i;
                return (
                  <button
                    key={i}
                    onClick={() => handleAnswer(q.id, i)}
                    style={{ ...s.optBtn, ...(sel ? s.optSel : {}) }}
                    onMouseEnter={e => {
                      if (!sel) {
                        e.currentTarget.style.borderColor = '#7c3aed';
                        e.currentTarget.style.backgroundColor = '#faf5ff';
                      }
                    }}
                    onMouseLeave={e => {
                      if (!sel) {
                        e.currentTarget.style.borderColor = '#e2e8f0';
                        e.currentTarget.style.backgroundColor = '#f8fafc';
                      }
                    }}
                  >
                    <div style={sel ? s.radioSel : s.radio}>
                      {sel && <div style={s.radioDot} />}
                    </div>
                    <span style={{ fontSize: '15px', color: sel ? '#7c3aed' : '#374151', fontWeight: sel ? 600 : 500, flex: 1, textAlign: 'left' }}>
                      {renderText(opt)}
                    </span>
                    {sel && <span style={{ color: '#7c3aed', fontWeight: 700 }}>✓</span>}
                  </button>
                );
              })}
            </div>

            <div style={s.navRow}>
              <button
                onClick={() => setCurrent(c => c - 1)}
                disabled={current === 0}
                style={{ ...s.navBtn, ...(current === 0 ? { opacity: 0.4, cursor: 'not-allowed' } : {}) }}
              >
                ← Previous
              </button>
              <div style={{ flex: 1, display: 'flex', justifyContent: 'center' }}>
                {answers[q.id] !== undefined && (
                  <span style={s.answeredBadge}>✓ Answered</span>
                )}
              </div>
              {isLast ? (
                <button
                  onClick={handleManualSubmit}
                  disabled={submitting}
                  style={{ ...s.submitBtn, ...(submitting ? { opacity: 0.6 } : {}) }}
                >
                  {submitting ? 'Submitting...' : 'Submit →'}
                </button>
              ) : (
                <button onClick={() => setCurrent(c => c + 1)} style={s.nextBtn}>
                  Next →
                </button>
              )}
            </div>
          </div>
        )}

        {/* Summary bar */}
        <div style={s.summary}>
          <p style={{ fontSize: '13px', color: '#64748b', fontWeight: 500, margin: 0 }}>
            {answered} of {questions.length} questions answered
          </p>
          {answered === questions.length && (
            <button
              onClick={handleManualSubmit}
              disabled={submitting}
              style={s.submitBtn}
            >
              Submit Post Test →
            </button>
          )}
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
  spinner: { width: '36px', height: '36px', border: '3px solid #e2e8f0', borderTop: '3px solid #7c3aed', borderRadius: '50%', animation: 'spin 0.8s linear infinite' },
  header: { backgroundColor: '#ffffff', borderBottom: '1px solid #e2e8f0', position: 'sticky', top: 0, zIndex: 50 },
  headerInner: { maxWidth: '680px', margin: '0 auto', padding: '16px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  headerLeft: { display: 'flex', alignItems: 'center', gap: '12px' },
  logoBox: { width: '36px', height: '36px', borderRadius: '10px', background: 'linear-gradient(135deg, #7c3aed, #a78bfa)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, boxShadow: '0 2px 8px rgba(124,58,237,0.3)' },
  headerTitle: { fontSize: '15px', fontWeight: 700, color: '#0f172a', margin: 0 },
  headerSub: { fontSize: '12px', color: '#94a3b8', margin: 0, fontWeight: 500 },
  maxScoreBadge: { fontSize: '12px', fontWeight: 600, backgroundColor: '#f5f3ff', color: '#7c3aed', padding: '6px 14px', borderRadius: '10px', border: '1px solid #ddd6fe' },
  progressTrack: { height: '3px', backgroundColor: '#e2e8f0' },
  progressFill: { height: '100%', background: 'linear-gradient(90deg, #7c3aed, #a78bfa)', transition: 'width 0.4s ease' },
  dotsRow: { display: 'flex', gap: '6px', padding: '10px 24px', maxWidth: '680px', margin: '0 auto', flexWrap: 'wrap' },
  qNumBtn: { width: '32px', height: '32px', borderRadius: '8px', border: '1.5px solid #e2e8f0', backgroundColor: '#f8fafc', color: '#64748b', fontSize: '13px', fontWeight: 600, cursor: 'pointer', fontFamily: "'Inter', sans-serif", transition: 'all 0.15s' },
  qNumActive: { backgroundColor: '#7c3aed', borderColor: '#7c3aed', color: '#ffffff' },
  qNumDone: { backgroundColor: '#dcfce7', borderColor: '#86efac', color: '#16a34a' },
  content: { maxWidth: '680px', margin: '0 auto', padding: '40px 24px 60px' },
  errorBox: { backgroundColor: '#fef2f2', border: '1px solid #fecaca', color: '#dc2626', padding: '12px 16px', borderRadius: '10px', fontSize: '14px', fontWeight: 500, marginBottom: '20px' },
  card: { backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '20px', padding: '32px', boxShadow: '0 4px 16px rgba(0,0,0,0.06)', marginBottom: '16px' },
  questionTop: { display: 'flex', gap: '14px', alignItems: 'flex-start', marginBottom: '24px' },
  qNum: { width: '36px', height: '36px', borderRadius: '10px', backgroundColor: '#f5f3ff', color: '#7c3aed', fontSize: '13px', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  answeredTag: { fontSize: '11px', fontWeight: 600, color: '#16a34a', backgroundColor: '#dcfce7', padding: '4px 10px', borderRadius: '20px', whiteSpace: 'nowrap', flexShrink: 0 },
  options: { display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '32px' },
  optBtn: { display: 'flex', alignItems: 'center', gap: '12px', padding: '14px 18px', borderRadius: '12px', border: '1.5px solid #e2e8f0', backgroundColor: '#f8fafc', cursor: 'pointer', transition: 'all 0.15s', fontFamily: "'Inter', sans-serif" },
  optSel: { borderColor: '#7c3aed', backgroundColor: '#f5f3ff' },
  radio: { width: '20px', height: '20px', borderRadius: '50%', border: '2px solid #cbd5e1', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' },
  radioSel: { width: '20px', height: '20px', borderRadius: '50%', border: '2px solid #7c3aed', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' },
  radioDot: { width: '9px', height: '9px', borderRadius: '50%', backgroundColor: '#7c3aed' },
  navRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #f1f5f9', paddingTop: '24px' },
  answeredBadge: { fontSize: '12px', fontWeight: 600, color: '#16a34a', backgroundColor: '#dcfce7', padding: '4px 12px', borderRadius: '20px' },
  navBtn: { padding: '10px 20px', borderRadius: '10px', border: '1.5px solid #e2e8f0', backgroundColor: '#ffffff', color: '#374151', fontSize: '14px', fontWeight: 600, cursor: 'pointer', fontFamily: "'Inter', sans-serif" },
  nextBtn: { padding: '10px 24px', borderRadius: '10px', border: 'none', backgroundColor: '#7c3aed', color: '#ffffff', fontSize: '14px', fontWeight: 600, cursor: 'pointer', fontFamily: "'Inter', sans-serif", boxShadow: '0 2px 8px rgba(124,58,237,0.3)' },
  submitBtn: { padding: '10px 24px', borderRadius: '10px', border: 'none', background: 'linear-gradient(135deg, #16a34a, #22c55e)', color: '#ffffff', fontSize: '14px', fontWeight: 600, cursor: 'pointer', fontFamily: "'Inter', sans-serif", boxShadow: '0 2px 8px rgba(22,163,74,0.3)' },
  summary: { backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '14px', padding: '16px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' },
  resultCard: { backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '20px', padding: '48px 40px', boxShadow: '0 4px 20px rgba(0,0,0,0.06)' },
  resultTitle: { fontSize: '24px', fontWeight: 800, color: '#0f172a', margin: '0 0 8px 0', textAlign: 'center', fontFamily: "'Inter', sans-serif" },
  scoreWrap: { display: 'flex', alignItems: 'baseline', justifyContent: 'center', gap: '4px', marginBottom: '16px' },
  scoreBig: { fontSize: '56px', fontWeight: 800, color: '#7c3aed', fontVariantNumeric: 'tabular-nums', lineHeight: 1, fontFamily: "'Inter', sans-serif" },
  scoreBar: { height: '8px', backgroundColor: '#f1f5f9', borderRadius: '4px', overflow: 'hidden', marginBottom: '32px' },
  scoreBarFill: { height: '100%', background: 'linear-gradient(90deg, #7c3aed, #a78bfa)', borderRadius: '4px', transition: 'width 0.8s ease' },
  btnPrimary: { backgroundColor: '#7c3aed', color: '#ffffff', border: 'none', borderRadius: '10px', padding: '12px 24px', fontSize: '14px', fontWeight: 600, cursor: 'pointer', fontFamily: "'Inter', sans-serif" },
};