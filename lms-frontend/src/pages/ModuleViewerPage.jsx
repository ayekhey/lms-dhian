import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../api/axios';
import ModuleRenderer from '../components/editor/ModuleRenderer';
import { useAuth } from '../context/AuthContext';

function RevealBlock({ label, openLabel, children, accent = 'blue' }) {
  const [open, setOpen] = useState(false);

  const accents = {
    blue: { border: '#bfdbfe', bg: '#eff6ff', btn: '#dbeafe', text: '#1d4ed8' },
    amber: { border: '#fde68a', bg: '#fffbeb', btn: '#fef3c7', text: '#92400e' },
  };
  const a = accents[accent];

  return (
    <div style={{ marginTop: '12px' }}>
      <button
        onClick={() => setOpen(o => !o)}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '6px',
          padding: '5px 12px',
          borderRadius: '99px',
          border: `1px solid ${open ? a.border : '#e2e8f0'}`,
          backgroundColor: open ? a.btn : '#f8fafc',
          fontSize: '12px',
          fontWeight: 600,
          color: open ? a.text : '#64748b',
          cursor: 'pointer',
          fontFamily: "'Inter', sans-serif",
          transition: 'all 0.15s',
          marginBottom: '8px',
        }}
      >
        <svg
          width="13" height="13" viewBox="0 0 24 24" fill="none"
          stroke="currentColor" strokeWidth="2.5"
          style={{ transform: open ? 'rotate(180deg)' : 'rotate(0)', transition: 'transform 0.2s' }}
        >
          <path d="M6 9l6 6 6-6"/>
        </svg>
        {open ? openLabel : label}
      </button>

      <div style={{
        overflow: 'hidden',
        maxHeight: open ? '1000px' : '0',
        opacity: open ? 1 : 0,
        transition: 'max-height 0.35s ease, opacity 0.25s ease',
      }}>
        <div style={{
          backgroundColor: a.bg,
          border: `1px solid ${a.border}`,
          borderRadius: '10px',
          padding: '14px 16px',
          fontSize: '14px',
          color: '#374151',
          lineHeight: 1.7,
        }}>
          {children}
        </div>
      </div>
    </div>
  );
}

function MiniQuiz({ quiz }) {
  const [answer, setAnswer] = useState(null);
  const correct = answer === quiz.correctOption;

  return (
    <div style={q.wrap}>
      <p style={q.label}>Mini Quiz</p>
      <p style={q.question}>{quiz.questionText}</p>
      <div style={q.opts}>
        {quiz.options.map((opt, i) => {
          const selected = answer === i;
          const isCorrect = selected && correct;
          const isWrong = selected && !correct;
          return (
            <button
              key={i}
              disabled={answer !== null}
              onClick={() => setAnswer(i)}
              style={{
                ...q.opt,
                ...(isCorrect ? q.optCorrect : {}),
                ...(isWrong ? q.optWrong : {}),
                ...(answer === null ? {} : { cursor: 'default' }),
              }}
            >
              <div style={{
                ...q.radio,
                borderColor: isCorrect ? '#16a34a' : isWrong ? '#dc2626' : '#cbd5e1',
                backgroundColor: isCorrect ? '#dcfce7' : isWrong ? '#fee2e2' : 'white',
              }}>
                {isCorrect && <span style={{ fontSize: '10px', color: '#16a34a' }}>✓</span>}
                {isWrong && <span style={{ fontSize: '10px', color: '#dc2626' }}>✕</span>}
              </div>
              <span>{opt}</span>
            </button>
          );
        })}
      </div>
      {answer !== null && (
        <p style={{ fontSize: '13px', fontWeight: 600, color: correct ? '#16a34a' : '#dc2626', marginTop: '10px' }}>
          {correct ? '✅ Correct!' : '❌ Incorrect — try reviewing the content above.'}
        </p>
      )}
    </div>
  );
}

export default function ModuleViewerPage() {
  const [pages, setPages] = useState([]);
  const [loading, setLoading] = useState(true);
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();  // ADD THIS

  useEffect(() => {
    api.get(`/modules/${id}/pages`)
      .then(res => setPages(res.data))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'Inter', sans-serif", backgroundColor: '#f8fafc' }}>
      <div style={s.spinner} />
    </div>
  );

  if (!pages.length) return (
    <div style={{ padding: '40px', fontFamily: "'Inter', sans-serif" }}>
      <p style={{ color: '#64748b' }}>No pages found for this module.</p>
    </div>
  );

  return (
    <div style={s.root}>
      <style>{css}</style>

      {/* Top bar */}
      <div style={s.topbar}>
        <button onClick={() => navigate('/student/modules')} style={s.backBtn}>
          ← Back to Modules
        </button>
        <span style={s.pageCount}>{pages.length} page{pages.length !== 1 ? 's' : ''}</span>
      </div>

      {/* Content */}
      <div style={s.content}>
        {pages.map((page, pi) => (
          <div key={page.id} style={s.pageSection}>
            {/* Page label */}
            <div style={s.pageLabel}>
              <span style={s.pageLabelNum}>Page {page.pageNumber}</span>
              {page.extendContent && (
                <span style={s.badge}>📘 Extend available</span>
              )}
              {page.helpContent && (
                <span style={{ ...s.badge, backgroundColor: '#fef9c3', color: '#854d0e' }}>💡 Help available</span>
              )}
            </div>

            {/* Main content card */}
            <div style={s.card}>
              <p style={s.topicLabel}>Reading</p>
              <ModuleRenderer content={page.content} tier={user?.tier || 1} />

              {/* Extend toggle */}
              {page.extendContent && (
                <RevealBlock label="Show more" openLabel="Hide" accent="blue">
                  {page.extendContent}
                </RevealBlock>
              )}

              {/* Help toggle */}
              {page.helpContent && (
                <RevealBlock label="Show hint" openLabel="Hide hint" accent="amber">
                  {page.helpContent}
                </RevealBlock>
              )}
            </div>

            {/* Mini quiz */}
            {page.miniQuiz && (
              <MiniQuiz quiz={page.miniQuiz} />
            )}

            {/* Divider between pages */}
            {pi < pages.length - 1 && <div style={s.divider} />}
          </div>
        ))}

        {/* Finish button */}
        <div style={s.finishWrap}>
          <button
            onClick={() => navigate('/student/modules')}
            style={s.finishBtn}
          >
            ✓ Finish Module
          </button>
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
  root: {
    minHeight: '100vh',
    backgroundColor: '#f8fafc',
    fontFamily: "'Inter', sans-serif",
  },
  spinner: {
    width: '36px',
    height: '36px',
    border: '3px solid #e2e8f0',
    borderTop: '3px solid #3b82f6',
    borderRadius: '50%',
    animation: 'spin 0.8s linear infinite',
  },
  topbar: {
    backgroundColor: '#ffffff',
    borderBottom: '1px solid #e2e8f0',
    padding: '14px 24px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    position: 'sticky',
    top: 0,
    zIndex: 50,
  },
  backBtn: {
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: 600,
    color: '#3b82f6',
    fontFamily: "'Inter', sans-serif",
    padding: 0,
  },
  pageCount: {
    fontSize: '13px',
    color: '#94a3b8',
    fontWeight: 500,
  },
  content: {
    maxWidth: '720px',
    margin: '0 auto',
    padding: '40px 24px 80px',
  },
  pageSection: {
    marginBottom: '8px',
  },
  pageLabel: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    marginBottom: '10px',
  },
  pageLabelNum: {
    fontSize: '11px',
    fontWeight: 700,
    color: '#94a3b8',
    letterSpacing: '0.08em',
    textTransform: 'uppercase',
  },
  badge: {
    fontSize: '11px',
    fontWeight: 600,
    backgroundColor: '#eff6ff',
    color: '#1d4ed8',
    padding: '2px 8px',
    borderRadius: '20px',
  },
  card: {
    backgroundColor: '#ffffff',
    border: '1px solid #e2e8f0',
    borderRadius: '16px',
    padding: '24px 28px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
    marginBottom: '12px',
  },
  topicLabel: {
    fontSize: '11px',
    fontWeight: 600,
    textTransform: 'uppercase',
    letterSpacing: '0.06em',
    color: '#94a3b8',
    margin: '0 0 10px 0',
  },
  bodyText: {
    fontSize: '15px',
    color: '#374151',
    lineHeight: 1.75,
  },
  divider: {
    height: '1px',
    backgroundColor: '#e2e8f0',
    margin: '32px 0',
  },
  finishWrap: {
    display: 'flex',
    justifyContent: 'center',
    paddingTop: '24px',
  },
  finishBtn: {
    background: 'linear-gradient(135deg, #1d4ed8, #3b82f6)',
    color: 'white',
    border: 'none',
    borderRadius: '12px',
    padding: '14px 32px',
    fontSize: '15px',
    fontWeight: 600,
    cursor: 'pointer',
    fontFamily: "'Inter', sans-serif",
    boxShadow: '0 4px 12px rgba(59,130,246,0.35)',
  },
};

const q = {
  wrap: {
    backgroundColor: '#ffffff',
    border: '1px solid #e2e8f0',
    borderRadius: '14px',
    padding: '20px 24px',
    marginBottom: '12px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
  },
  label: {
    fontSize: '11px',
    fontWeight: 600,
    textTransform: 'uppercase',
    letterSpacing: '0.06em',
    color: '#94a3b8',
    margin: '0 0 10px 0',
  },
  question: {
    fontSize: '15px',
    fontWeight: 600,
    color: '#0f172a',
    marginBottom: '14px',
    lineHeight: 1.5,
  },
  opts: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  opt: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    padding: '11px 14px',
    borderRadius: '10px',
    border: '1.5px solid #e2e8f0',
    backgroundColor: '#f8fafc',
    cursor: 'pointer',
    fontSize: '14px',
    color: '#374151',
    fontFamily: "'Inter', sans-serif",
    textAlign: 'left',
    transition: 'all 0.15s',
  },
  optCorrect: {
    borderColor: '#86efac',
    backgroundColor: '#f0fdf4',
    color: '#166534',
  },
  optWrong: {
    borderColor: '#fecaca',
    backgroundColor: '#fef2f2',
    color: '#991b1b',
  },
  radio: {
    width: '18px',
    height: '18px',
    borderRadius: '50%',
    border: '2px solid #cbd5e1',
    flexShrink: 0,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
};