import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';

export default function DiagnosticPage() {
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [current, setCurrent] = useState(0);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [timeLeft, setTimeLeft] = useState(null);

  const { login } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    Promise.all([
      api.get('/diagnostic/questions'),
      api.get('/diagnostic/config')
    ]).then(([qRes, cRes]) => {
      setQuestions(qRes.data);
      if (cRes.data.timerMinutes) setTimeLeft(cRes.data.timerMinutes * 60);
    }).catch(() => setError('Failed to load questions'))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (timeLeft === null || timeLeft <= 0) {
      if (timeLeft === 0) handleSubmit();
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
      await api.post('/diagnostic/submit', { answers });
      const token = localStorage.getItem('token');
      const meRes = await api.get('/auth/me');
      login(token, meRes.data);
      navigate('/student/dashboard');
    } catch {
      setError('Submission failed. Please try again.');
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
  const isAnswered = q && answers[q.id] !== undefined;
  const progress = questions.length > 0 ? ((current + 1) / questions.length) * 100 : 0;
  const timerWarning = timeLeft !== null && timeLeft < 60;

  if (loading) return (
    <div style={s.loadRoot}>
      <style>{css}</style>
      <div style={s.spinner} />
      <p style={{ color: '#64748b', marginTop: '16px', fontFamily: "'Inter', sans-serif" }}>
        Loading your assessment...
      </p>
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
              <h1 style={s.headerTitle}>Diagnostic Assessment</h1>
              <p style={s.headerSub}>Question {current + 1} of {questions.length}</p>
            </div>
          </div>

          {timeLeft !== null && (
            <div style={{ ...s.timer, ...(timerWarning ? s.timerWarn : {}) }}>
              <span>⏱</span>
              <span style={s.timerText}>{formatTime(timeLeft)}</span>
              {timerWarning && <span style={s.timerLabel}>Hurry!</span>}
            </div>
          )}
        </div>

        {/* Progress bar */}
        <div style={s.progressTrack}>
          <div style={{ ...s.progressFill, width: `${progress}%` }} />
        </div>

        {/* Step dots */}
        {/* Question number grid */}
<div style={s.dotsRow}>
  {questions.map((q2, i) => {
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

      {/* Question card */}
      <div style={s.content}>
        {error && (
          <div style={s.errorBox}>⚠️ {error}</div>
        )}

        {q && (
          <div style={s.card} key={q.id}>
            {/* Question */}
            <div style={s.questionTop}>
              <div style={s.qNum}>Q{current + 1}</div>
              <p style={s.questionText}>{q.questionText}</p>
            </div>

            {/* Options */}
            <div style={s.options}>
              {q.options.map((opt, i) => {
                const selected = answers[q.id] === i;
                return (
                  <button
                    key={i}
                    onClick={() => handleAnswer(q.id, i)}
                    style={{
                      ...s.optBtn,
                      ...(selected ? s.optSelected : {}),
                    }}
                    onMouseEnter={e => {
                      if (!selected) {
                        e.currentTarget.style.borderColor = '#3b82f6';
                        e.currentTarget.style.backgroundColor = '#f0f7ff';
                      }
                    }}
                    onMouseLeave={e => {
                      if (!selected) {
                        e.currentTarget.style.borderColor = '#e2e8f0';
                        e.currentTarget.style.backgroundColor = '#f8fafc';
                      }
                    }}
                  >
                    <div style={selected ? s.radioSelected : s.radio}>
                      {selected && <div style={s.radioDot} />}
                    </div>
                    <span style={{ ...s.optLabel, ...(selected ? { color: '#1d4ed8', fontWeight: 600 } : {}) }}>
                      {opt}
                    </span>
                    {selected && <span style={s.checkmark}>✓</span>}
                  </button>
                );
              })}
            </div>

            {/* Nav buttons */}
            <div style={s.navRow}>
              <button
                onClick={() => setCurrent(c => c - 1)}
                disabled={current === 0}
                style={{ ...s.navBtn, ...(current === 0 ? s.navBtnDisabled : {}) }}
              >
                ← Previous
              </button>

              <div style={s.navCenter}>
                {isAnswered && (
                  <span style={s.answeredTag}>✓ Answered</span>
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
                <button
                  onClick={() => setCurrent(c => c + 1)}
                  style={s.nextBtn}
                >
                  Next →
                </button>
              )}
            </div>
          </div>
        )}

        {/* Answer summary */}
        <div style={s.summary}>
  <p style={s.summaryText}>
    {Object.keys(answers).length} of {questions.length} questions answered
  </p>
</div>
      </div>
    </div>
  );
}

const css = `
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  @keyframes spin { to { transform: rotate(360deg); } }
  @keyframes slideIn {
    from { opacity: 0; transform: translateX(20px); }
    to { opacity: 1; transform: translateX(0); }
  }
  @keyframes pulse {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.5; }
  }
`;

const s = {
  root: {
    minHeight: '100vh',
    backgroundColor: '#f8fafc',
    fontFamily: "'Inter', sans-serif",
  },
  loadRoot: {
    minHeight: '100vh',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f8fafc',
  },
  spinner: {
    width: '36px',
    height: '36px',
    border: '3px solid #e2e8f0',
    borderTop: '3px solid #3b82f6',
    borderRadius: '50%',
    animation: 'spin 0.8s linear infinite',
  },
  header: {
    backgroundColor: '#ffffff',
    borderBottom: '1px solid #e2e8f0',
    position: 'sticky',
    top: 0,
    zIndex: 50,
  },
  headerInner: {
    maxWidth: '680px',
    margin: '0 auto',
    padding: '16px 24px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  logoBox: {
    width: '36px',
    height: '36px',
    borderRadius: '10px',
    background: 'linear-gradient(135deg, #1d4ed8, #3b82f6)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    boxShadow: '0 2px 8px rgba(59,130,246,0.3)',
  },
  headerTitle: {
    fontSize: '15px',
    fontWeight: 700,
    color: '#0f172a',
    margin: 0,
  },
  headerSub: {
    fontSize: '12px',
    color: '#94a3b8',
    margin: 0,
    fontWeight: 500,
  },
  timer: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    backgroundColor: '#f1f5f9',
    border: '1px solid #e2e8f0',
    borderRadius: '10px',
    padding: '8px 14px',
  },
  timerWarn: {
    backgroundColor: '#fef2f2',
    borderColor: '#fecaca',
    animation: 'pulse 1s ease-in-out infinite',
  },
  timerText: {
    fontSize: '18px',
    fontWeight: 800,
    color: '#0f172a',
    letterSpacing: '-0.02em',
    fontVariantNumeric: 'tabular-nums',
  },
  timerLabel: {
    fontSize: '12px',
    fontWeight: 600,
    color: '#dc2626',
  },
  progressTrack: {
    height: '3px',
    backgroundColor: '#e2e8f0',
  },
  progressFill: {
    height: '100%',
    background: 'linear-gradient(90deg, #1d4ed8, #3b82f6)',
    transition: 'width 0.4s ease',
  },
  dotsRow: {
  display: 'flex',
  gap: '6px',
  padding: '10px 24px',
  maxWidth: '680px',
  margin: '0 auto',
  flexWrap: 'wrap',
},
  dotsRow: {
  display: 'flex',
  gap: '6px',
  padding: '10px 24px',
  maxWidth: '680px',
  margin: '0 auto',
  flexWrap: 'wrap',
},
qNumBtn: {
  width: '32px',
  height: '32px',
  borderRadius: '8px',
  border: '1.5px solid #e2e8f0',
  backgroundColor: '#f8fafc',
  color: '#64748b',
  fontSize: '13px',
  fontWeight: 600,
  cursor: 'pointer',
  fontFamily: "'Inter', sans-serif",
  transition: 'all 0.15s',
},
qNumActive: {
  backgroundColor: '#1d4ed8',
  borderColor: '#1d4ed8',
  color: '#ffffff',
},
qNumDone: {
  backgroundColor: '#dcfce7',
  borderColor: '#86efac',
  color: '#16a34a',
},
  content: {
    maxWidth: '680px',
    margin: '0 auto',
    padding: '40px 24px 60px',
  },
  errorBox: {
    backgroundColor: '#fef2f2',
    border: '1px solid #fecaca',
    color: '#dc2626',
    padding: '12px 16px',
    borderRadius: '10px',
    fontSize: '14px',
    fontWeight: 500,
    marginBottom: '20px',
  },
  card: {
    backgroundColor: '#ffffff',
    border: '1px solid #e2e8f0',
    borderRadius: '20px',
    padding: '32px',
    boxShadow: '0 4px 16px rgba(0,0,0,0.06)',
    animation: 'slideIn 0.25s ease forwards',
    marginBottom: '16px',
  },
  questionTop: {
    display: 'flex',
    gap: '14px',
    alignItems: 'flex-start',
    marginBottom: '24px',
  },
  qNum: {
    width: '36px',
    height: '36px',
    borderRadius: '10px',
    backgroundColor: '#eff6ff',
    color: '#1d4ed8',
    fontSize: '13px',
    fontWeight: 700,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  questionText: {
    fontSize: '20px',
    fontWeight: 700,
    color: '#0f172a',
    lineHeight: 1.4,
    paddingTop: '4px',
  },
  options: {
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
    marginBottom: '32px',
  },
  optBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '14px 18px',
    borderRadius: '12px',
    border: '1.5px solid #e2e8f0',
    backgroundColor: '#f8fafc',
    cursor: 'pointer',
    textAlign: 'left',
    transition: 'all 0.15s',
    fontFamily: "'Inter', sans-serif",
  },
  optSelected: {
    borderColor: '#3b82f6',
    backgroundColor: '#eff6ff',
  },
  radio: {
    width: '20px',
    height: '20px',
    borderRadius: '50%',
    border: '2px solid #cbd5e1',
    flexShrink: 0,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioSelected: {
    width: '20px',
    height: '20px',
    borderRadius: '50%',
    border: '2px solid #3b82f6',
    flexShrink: 0,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioDot: {
    width: '9px',
    height: '9px',
    borderRadius: '50%',
    backgroundColor: '#3b82f6',
  },
  optLabel: {
    fontSize: '15px',
    color: '#374151',
    fontWeight: 500,
    flex: 1,
  },
  checkmark: {
    fontSize: '14px',
    color: '#3b82f6',
    fontWeight: 700,
  },
  navRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTop: '1px solid #f1f5f9',
    paddingTop: '24px',
  },
  navCenter: {
    flex: 1,
    display: 'flex',
    justifyContent: 'center',
  },
  answeredTag: {
    fontSize: '12px',
    fontWeight: 600,
    color: '#16a34a',
    backgroundColor: '#dcfce7',
    padding: '4px 12px',
    borderRadius: '20px',
  },
  navBtn: {
    padding: '10px 20px',
    borderRadius: '10px',
    border: '1.5px solid #e2e8f0',
    backgroundColor: '#ffffff',
    color: '#374151',
    fontSize: '14px',
    fontWeight: 600,
    cursor: 'pointer',
    fontFamily: "'Inter', sans-serif",
    transition: 'all 0.15s',
  },
  navBtnDisabled: {
    opacity: 0.4,
    cursor: 'not-allowed',
  },
  nextBtn: {
    padding: '10px 24px',
    borderRadius: '10px',
    border: 'none',
    backgroundColor: '#1d4ed8',
    color: '#ffffff',
    fontSize: '14px',
    fontWeight: 600,
    cursor: 'pointer',
    fontFamily: "'Inter', sans-serif",
    boxShadow: '0 2px 8px rgba(29,78,216,0.3)',
  },
  submitBtn: {
    padding: '10px 24px',
    borderRadius: '10px',
    border: 'none',
    background: 'linear-gradient(135deg, #16a34a, #22c55e)',
    color: '#ffffff',
    fontSize: '14px',
    fontWeight: 600,
    cursor: 'pointer',
    fontFamily: "'Inter', sans-serif",
    boxShadow: '0 2px 8px rgba(22,163,74,0.3)',
  },
  summary: {
    backgroundColor: '#ffffff',
    border: '1px solid #e2e8f0',
    borderRadius: '14px',
    padding: '16px 20px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '16px',
  },
  summaryText: {
    fontSize: '13px',
    color: '#64748b',
    fontWeight: 500,
    whiteSpace: 'nowrap',
  },
  summaryDots: {
    display: 'flex',
    gap: '6px',
    flexWrap: 'wrap',
    justifyContent: 'flex-end',
  },
  summaryDot: {
    width: '10px',
    height: '10px',
    borderRadius: '50%',
    transition: 'background-color 0.2s',
  },
};