import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import PageLayout from '../components/PageLayout';
import api from '../api/axios';

export default function ExercisePage() {
  const [exercises, setExercises] = useState([]);
  const [selected, setSelected] = useState(null);
  const [answers, setAnswers] = useState({});
  const [current, setCurrent] = useState(0);
  const [result, setResult] = useState(null);
  const [timeLeft, setTimeLeft] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/exercises')
      .then(res => setExercises(res.data))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (timeLeft === null || timeLeft <= 0) {
      if (timeLeft === 0 && selected && !result) handleSubmit();
      return;
    }
    const t = setInterval(() => setTimeLeft(n => n - 1), 1000);
    return () => clearInterval(t);
  }, [timeLeft]);

  const startExercise = (ex) => {
    setSelected(ex);
    setAnswers({});
    setResult(null);
    setCurrent(0);
    setTimeLeft(ex.timerMinutes ? ex.timerMinutes * 60 : null);
  };

  const handleAnswer = (i, j) => setAnswers(prev => ({ ...prev, [i]: j }));

  const handleSubmit = async () => {
    try {
      const res = await api.post(`/exercises/${selected.id}/submit`, { answers });
      setResult(res.data);
      setTimeLeft(null);
    } catch {
      alert('Submission failed');
    }
  };

  const formatTime = (s) => {
    const m = Math.floor(s / 60).toString().padStart(2, '0');
    const sec = (s % 60).toString().padStart(2, '0');
    return `${m}:${sec}`;
  };

  const timerWarning = timeLeft !== null && timeLeft < 60;
  const questions = selected?.questions || [];
  const total = questions.length;
  const answered = Object.keys(answers).length;
  const q = questions[current];
  const isLast = current === total - 1;

  // Exercise list
  if (!selected) {
    return (
      <PageLayout title="Exercises" subtitle="Select an exercise to begin.">
        {loading ? (
          <p style={{ color: '#64748b' }}>Loading...</p>
        ) : exercises.length === 0 ? (
          <div style={{ color: '#64748b' }}>No exercises available yet.</div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {exercises.map((ex, i) => (
              <button
                key={ex.id}
                onClick={() => startExercise(ex)}
                style={s.exCard}
                onMouseEnter={e => {
                  e.currentTarget.style.borderColor = '#3b82f6';
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.08)';
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.borderColor = '#e2e8f0';
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.04)';
                }}
              >
                <div style={s.exNum}>{String(i + 1).padStart(2, '0')}</div>
                <div style={{ flex: 1 }}>
                  <h3 style={s.exTitle}>{ex.title}</h3>
                  <div style={{ display: 'flex', gap: '8px', marginTop: '6px' }}>
                    <span style={s.metaTag}>📝 {ex.questions?.length || 0} questions</span>
                    {ex.timerMinutes && <span style={s.metaTag}>⏱ {ex.timerMinutes} min</span>}
                  </div>
                </div>
                <span style={{ fontSize: '20px', color: '#94a3b8' }}>→</span>
              </button>
            ))}
          </div>
        )}
      </PageLayout>
    );
  }

  // Result screen
  if (result) {
    const pct = Math.round((result.score / result.total) * 100);
    const passed = pct >= 50;
    return (
      <PageLayout>
        <div style={{ display: 'flex', justifyContent: 'center', padding: '20px 0' }}>
          <div style={s.resultCard}>
            <div style={{ ...s.resultIcon, backgroundColor: passed ? '#dcfce7' : '#fee2e2' }}>
              <span style={{ fontSize: '40px' }}>{passed ? '🎉' : '📚'}</span>
            </div>
            <h2 style={s.resultTitle}>{passed ? 'Great work!' : 'Keep practicing!'}</h2>
            <p style={{ fontSize: '14px', color: '#94a3b8', marginBottom: '28px' }}>{selected.title}</p>
            <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'center', gap: '12px', marginBottom: '16px' }}>
              <span style={s.scoreBig}>{result.score}<span style={{ fontSize: '28px', color: '#94a3b8', fontWeight: 600 }}>/{result.total}</span></span>
              <span style={{ fontSize: '24px', fontWeight: 700, color: passed ? '#16a34a' : '#dc2626' }}>{pct}%</span>
            </div>
            <div style={s.scoreBar}>
              <div style={{
                ...s.scoreBarFill,
                width: `${pct}%`,
                background: passed ? 'linear-gradient(90deg, #16a34a, #22c55e)' : 'linear-gradient(90deg, #dc2626, #f87171)',
              }} />
            </div>
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
              <button onClick={() => setSelected(null)} style={s.navBtn}>← Back to Exercises</button>
              <button onClick={() => startExercise(selected)} style={s.nextBtn}>Try Again</button>
            </div>
          </div>
        </div>
      </PageLayout>
    );
  }

  // One question per page
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
              <h1 style={s.headerTitle}>{selected.title}</h1>
              <p style={s.headerSub}>Question {current + 1} of {total}</p>
            </div>
          </div>

          {timeLeft !== null && (
            <div style={{ ...s.timer, ...(timerWarning ? s.timerWarn : {}) }}>
              <span>⏱</span>
              <span style={s.timerText}>{formatTime(timeLeft)}</span>
              {timerWarning && <span style={{ fontSize: '12px', fontWeight: 600, color: '#dc2626' }}>Hurry!</span>}
            </div>
          )}
        </div>

        {/* Progress bar */}
        <div style={s.progressTrack}>
          <div style={{ ...s.progressFill, width: `${total > 0 ? ((current + 1) / total) * 100 : 0}%` }} />
        </div>

        {/* Question number buttons */}
        <div style={s.dotsRow}>
          {questions.map((_, i) => {
            const isActive = i === current;
            const isDone = answers[i] !== undefined;
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

      {/* Question card */}
      <div style={s.content}>
        {q && (
          <div style={s.card} key={current}>
            <div style={s.questionTop}>
              <div style={s.qNum}>Q{current + 1}</div>
              <p style={s.questionText}>{q.questionText}</p>
              {answers[current] !== undefined && (
                <span style={s.answeredTag}>✓ Answered</span>
              )}
            </div>

            <div style={s.options}>
              {q.options.map((opt, j) => {
                const sel = answers[current] === j;
                return (
                  <button
                    key={j}
                    onClick={() => handleAnswer(current, j)}
                    style={{ ...s.optBtn, ...(sel ? s.optSel : {}) }}
                    onMouseEnter={e => {
                      if (!sel) {
                        e.currentTarget.style.borderColor = '#3b82f6';
                        e.currentTarget.style.backgroundColor = '#f0f7ff';
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
                    <span style={{ ...s.optLabel, ...(sel ? { color: '#1d4ed8', fontWeight: 600 } : {}) }}>
                      {opt}
                    </span>
                    {sel && <span style={{ color: '#3b82f6', fontWeight: 700 }}>✓</span>}
                  </button>
                );
              })}
            </div>

            {/* Nav */}
            <div style={s.navRow}>
              <button
                onClick={() => setCurrent(c => c - 1)}
                disabled={current === 0}
                style={{ ...s.navBtn, ...(current === 0 ? { opacity: 0.4, cursor: 'not-allowed' } : {}) }}
              >
                ← Previous
              </button>

              <div style={{ flex: 1, display: 'flex', justifyContent: 'center' }}>
                {answers[current] !== undefined && (
                  <span style={s.answeredBadge}>✓ Answered</span>
                )}
              </div>

              {isLast ? (
                <button onClick={handleSubmit} style={s.submitBtn}>
                  Submit →
                </button>
              ) : (
                <button onClick={() => setCurrent(c => c + 1)} style={s.nextBtn}>
                  Next →
                </button>
              )}
            </div>
          </div>
        )}

        {/* Summary */}
        <div style={s.summary}>
          <p style={{ fontSize: '13px', color: '#64748b', fontWeight: 500 }}>
            {answered} of {total} questions answered
          </p>
          {answered === total && (
            <button onClick={handleSubmit} style={s.submitBtn}>
              Submit Exercise →
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
  @keyframes slideIn {
    from { opacity: 0; transform: translateX(20px); }
    to { opacity: 1; transform: translateX(0); }
  }
`;

const s = {
  // List
  exCard: {
    display: 'flex', alignItems: 'center', gap: '20px',
    backgroundColor: '#ffffff', border: '1.5px solid #e2e8f0',
    borderRadius: '14px', padding: '20px 24px', cursor: 'pointer',
    textAlign: 'left', transition: 'all 0.2s',
    boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
    fontFamily: "'Inter', sans-serif",
  },
  exNum: { fontWeight: 800, fontSize: '22px', color: '#d1d5db', minWidth: '40px' },
  exTitle: { fontSize: '16px', fontWeight: 700, color: '#0f172a', margin: 0, fontFamily: "'Inter', sans-serif" },
  metaTag: { fontSize: '12px', fontWeight: 600, color: '#64748b', backgroundColor: '#f1f5f9', padding: '3px 10px', borderRadius: '20px' },

  // Result
  resultCard: {
    backgroundColor: '#ffffff', border: '1px solid #e2e8f0',
    borderRadius: '20px', padding: '48px 40px', textAlign: 'center',
    maxWidth: '420px', width: '100%', boxShadow: '0 4px 20px rgba(0,0,0,0.06)',
  },
  resultIcon: { width: '80px', height: '80px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' },
  resultTitle: { fontSize: '24px', fontWeight: 800, color: '#0f172a', margin: '0 0 4px 0', fontFamily: "'Inter', sans-serif" },
  scoreBig: { fontSize: '56px', fontWeight: 800, color: '#0f172a', fontVariantNumeric: 'tabular-nums', lineHeight: 1, fontFamily: "'Inter', sans-serif" },
  scoreBar: { height: '8px', backgroundColor: '#f1f5f9', borderRadius: '4px', overflow: 'hidden', marginBottom: '32px' },
  scoreBarFill: { height: '100%', borderRadius: '4px', transition: 'width 0.8s ease' },

  // Exercise
  root: { minHeight: '100vh', backgroundColor: '#f8fafc', fontFamily: "'Inter', sans-serif" },
  header: { backgroundColor: '#ffffff', borderBottom: '1px solid #e2e8f0', position: 'sticky', top: 0, zIndex: 50 },
  headerInner: { maxWidth: '680px', margin: '0 auto', padding: '16px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  headerLeft: { display: 'flex', alignItems: 'center', gap: '12px' },
  logoBox: {
    width: '36px', height: '36px', borderRadius: '10px',
    background: 'linear-gradient(135deg, #1d4ed8, #3b82f6)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    flexShrink: 0, boxShadow: '0 2px 8px rgba(59,130,246,0.3)',
  },
  headerTitle: { fontSize: '15px', fontWeight: 700, color: '#0f172a', margin: 0 },
  headerSub: { fontSize: '12px', color: '#94a3b8', margin: 0, fontWeight: 500 },
  timer: { display: 'flex', alignItems: 'center', gap: '6px', backgroundColor: '#f1f5f9', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '8px 14px' },
  timerWarn: { backgroundColor: '#fef2f2', borderColor: '#fecaca' },
  timerText: { fontSize: '18px', fontWeight: 800, color: '#0f172a', letterSpacing: '-0.02em', fontVariantNumeric: 'tabular-nums' },
  progressTrack: { height: '3px', backgroundColor: '#e2e8f0' },
  progressFill: { height: '100%', background: 'linear-gradient(90deg, #1d4ed8, #3b82f6)', transition: 'width 0.4s ease' },
  dotsRow: { display: 'flex', gap: '6px', padding: '10px 24px', maxWidth: '680px', margin: '0 auto', flexWrap: 'wrap' },
  qNumBtn: {
    width: '32px', height: '32px', borderRadius: '8px',
    border: '1.5px solid #e2e8f0', backgroundColor: '#f8fafc',
    color: '#64748b', fontSize: '13px', fontWeight: 600,
    cursor: 'pointer', fontFamily: "'Inter', sans-serif", transition: 'all 0.15s',
  },
  qNumActive: { backgroundColor: '#1d4ed8', borderColor: '#1d4ed8', color: '#ffffff' },
  qNumDone: { backgroundColor: '#dcfce7', borderColor: '#86efac', color: '#16a34a' },
  content: { maxWidth: '680px', margin: '0 auto', padding: '40px 24px 60px' },
  card: {
    backgroundColor: '#ffffff', border: '1px solid #e2e8f0',
    borderRadius: '20px', padding: '32px',
    boxShadow: '0 4px 16px rgba(0,0,0,0.06)',
    animation: 'slideIn 0.25s ease forwards', marginBottom: '16px',
  },
  questionTop: { display: 'flex', gap: '14px', alignItems: 'flex-start', marginBottom: '24px' },
  qNum: {
    width: '36px', height: '36px', borderRadius: '10px',
    backgroundColor: '#eff6ff', color: '#1d4ed8',
    fontSize: '13px', fontWeight: 700,
    display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
  },
  questionText: { fontSize: '20px', fontWeight: 700, color: '#0f172a', flex: 1, lineHeight: 1.4, paddingTop: '4px' },
  answeredTag: { fontSize: '11px', fontWeight: 600, color: '#16a34a', backgroundColor: '#dcfce7', padding: '4px 10px', borderRadius: '20px', whiteSpace: 'nowrap', flexShrink: 0 },
  options: { display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '32px' },
  optBtn: {
    display: 'flex', alignItems: 'center', gap: '12px',
    padding: '14px 18px', borderRadius: '12px',
    border: '1.5px solid #e2e8f0', backgroundColor: '#f8fafc',
    cursor: 'pointer', textAlign: 'left', transition: 'all 0.15s',
    fontFamily: "'Inter', sans-serif",
  },
  optSel: { borderColor: '#3b82f6', backgroundColor: '#eff6ff' },
  radio: { width: '20px', height: '20px', borderRadius: '50%', border: '2px solid #cbd5e1', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' },
  radioSel: { width: '20px', height: '20px', borderRadius: '50%', border: '2px solid #3b82f6', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' },
  radioDot: { width: '9px', height: '9px', borderRadius: '50%', backgroundColor: '#3b82f6' },
  optLabel: { fontSize: '15px', color: '#374151', fontWeight: 500, flex: 1 },
  navRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #f1f5f9', paddingTop: '24px' },
  answeredBadge: { fontSize: '12px', fontWeight: 600, color: '#16a34a', backgroundColor: '#dcfce7', padding: '4px 12px', borderRadius: '20px' },
  navBtn: {
    padding: '10px 20px', borderRadius: '10px',
    border: '1.5px solid #e2e8f0', backgroundColor: '#ffffff',
    color: '#374151', fontSize: '14px', fontWeight: 600,
    cursor: 'pointer', fontFamily: "'Inter', sans-serif",
  },
  nextBtn: {
    padding: '10px 24px', borderRadius: '10px', border: 'none',
    backgroundColor: '#1d4ed8', color: '#ffffff',
    fontSize: '14px', fontWeight: 600, cursor: 'pointer',
    fontFamily: "'Inter', sans-serif",
    boxShadow: '0 2px 8px rgba(29,78,216,0.3)',
  },
  submitBtn: {
    padding: '10px 24px', borderRadius: '10px', border: 'none',
    background: 'linear-gradient(135deg, #16a34a, #22c55e)',
    color: '#ffffff', fontSize: '14px', fontWeight: 600,
    cursor: 'pointer', fontFamily: "'Inter', sans-serif",
    boxShadow: '0 2px 8px rgba(22,163,74,0.3)',
  },
  summary: {
    backgroundColor: '#ffffff', border: '1px solid #e2e8f0',
    borderRadius: '14px', padding: '16px 20px',
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
  },
};