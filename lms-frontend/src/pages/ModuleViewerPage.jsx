import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import ModuleRenderer from '../components/editor/ModuleRenderer';

function TopicBlockRenderer({ topic, tier }) {
  // New block format
  if (topic.blocks && Array.isArray(topic.blocks) && topic.blocks.length > 0) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {topic.blocks.map((block, i) => {
          if (block.type === 'main') {
            return (
              <div key={i}>
                <ModuleRenderer content={block.content} tier={tier} />
              </div>
            );
          }

          if (block.type === 'show_hide') {
            const blockTier = block.tier;
            if (blockTier === 'extend' && tier < 2) return null;
            if (blockTier === 'help' && tier < 3) return null;

            const styles = {
              extend: { border: '#bfdbfe', bg: '#eff6ff', text: '#1d4ed8', accent: '#3b82f6' },
              help: { border: '#fde68a', bg: '#fffbeb', text: '#92400e', accent: '#d97706' },
              all: { border: '#bbf7d0', bg: '#f0fdf4', text: '#166534', accent: '#16a34a' },
            };
            const st = styles[blockTier] || styles.extend;

            return <ShowHideRenderer key={i} block={block} style={st} tier={tier} />;
          }

          if (block.type === 'quiz') {
            return <QuizRenderer key={i} block={block} tier={tier} />;
          }

          return null;
        })}
      </div>
    );
  }

  // Legacy format
  return <ModuleRenderer content={topic.content} tier={tier} />;
}

function ShowHideRenderer({ block, style: st, tier }) {
  const [open, setOpen] = useState(false);
  return (
    <div style={{ margin: '4px 0' }}>
      <button
        onClick={() => setOpen(o => !o)}
        style={{
          display: 'inline-flex', alignItems: 'center', gap: '6px',
          padding: '5px 12px', borderRadius: '99px',
          border: `1px solid ${open ? st.border : '#e2e8f0'}`,
          backgroundColor: open ? st.bg : '#f8fafc',
          fontSize: '12px', fontWeight: 600,
          color: open ? st.text : '#64748b',
          cursor: 'pointer', fontFamily: 'inherit', marginBottom: '6px', transition: 'all 0.15s',
        }}
      >
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"
          style={{ transform: open ? 'rotate(180deg)' : 'rotate(0)', transition: 'transform 0.2s' }}>
          <path d="M6 9l6 6 6-6"/>
        </svg>
        {open ? 'Hide' : block.label || 'Show more'}
      </button>
      <div style={{ maxHeight: open ? '800px' : '0', overflow: 'hidden', opacity: open ? 1 : 0, transition: 'max-height 0.35s ease, opacity 0.25s ease' }}>
        <div style={{ borderLeft: `3px solid ${st.accent}`, borderRadius: '0 8px 8px 0', padding: '12px 16px', backgroundColor: st.bg, fontSize: '14px', color: st.text, lineHeight: 1.7 }}>
          <ModuleRenderer content={block.content} tier={tier} />
        </div>
      </div>
    </div>
  );
}

function QuizRenderer({ block }) {
  const [answer, setAnswer] = useState(null);
  const labels = ['A', 'B', 'C', 'D', 'E'];

  return (
    <div style={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '14px', padding: '20px 24px', marginTop: '8px' }}>
      <p style={{ fontSize: '11px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', color: '#94a3b8', margin: '0 0 12px' }}>Quiz</p>
      <div style={{ fontSize: '15px', fontWeight: 600, color: '#0f172a', marginBottom: '16px', lineHeight: 1.5 }}>
        <ModuleRenderer content={block.question} tier={3} />
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {(block.options || []).map((opt, i) => {
          if (!opt) return null;
          const selected = answer === i;
          const isCorrect = selected && i === block.correctOption;
          const isWrong = selected && i !== block.correctOption;
          return (
            <button
              key={i}
              disabled={answer !== null}
              onClick={() => setAnswer(i)}
              style={{
                display: 'flex', alignItems: 'flex-start', gap: '10px',
                padding: '11px 14px', borderRadius: '10px', textAlign: 'left',
                border: `1.5px solid ${isCorrect ? '#86efac' : isWrong ? '#fecaca' : '#e2e8f0'}`,
                backgroundColor: isCorrect ? '#f0fdf4' : isWrong ? '#fef2f2' : '#f8fafc',
                cursor: answer === null ? 'pointer' : 'default', fontFamily: 'inherit',
                transition: 'all 0.15s',
              }}
            >
              <span style={{ fontSize: '12px', fontWeight: 700, color: isCorrect ? '#16a34a' : isWrong ? '#dc2626' : '#94a3b8', flexShrink: 0, paddingTop: '2px' }}>{labels[i]}</span>
              <div style={{ flex: 1, fontSize: '14px', color: isCorrect ? '#166534' : isWrong ? '#991b1b' : '#374151' }}>
                <ModuleRenderer content={opt} tier={3} />
              </div>
            </button>
          );
        })}
      </div>
      {answer !== null && (
        <p style={{ fontSize: '13px', fontWeight: 600, color: answer === block.correctOption ? '#16a34a' : '#dc2626', marginTop: '12px' }}>
          {answer === block.correctOption ? '✅ Correct!' : '❌ Incorrect — try reviewing the content above.'}
        </p>
      )}
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
  const [topics, setTopics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [current, setCurrent] = useState(0);
  const [showJump, setShowJump] = useState(false);
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    api.get(`/modules/${id}/pages`)
      .then(res => setTopics(res.data))
      .finally(() => setLoading(false));
  }, [id]);

  const topic = topics[current];
  const isFirst = current === 0;
  const isLast = current === topics.length - 1;
  const progress = topics.length > 0 ? ((current + 1) / topics.length) * 100 : 0;

  const handleFinish = () => navigate('/student/modules');

  if (loading) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'Inter', sans-serif", backgroundColor: '#f8fafc' }}>
      <div style={s.spinner} />
    </div>
  );

  if (!topics.length) return (
    <div style={{ padding: '40px', fontFamily: "'Inter', sans-serif" }}>
      <p style={{ color: '#64748b' }}>No topics found for this module.</p>
    </div>
  );

  return (
    <div style={s.root}>
      <style>{css}</style>

      {/* Top bar */}
      <div style={s.topbar}>
        <button onClick={() => navigate('/student/modules')} style={s.backBtn}>
          ← Modules
        </button>

        {/* Progress + jump */}
        <div style={s.topbarCenter}>
          <div style={s.progressTrack}>
            <div style={{ ...s.progressFill, width: `${progress}%` }} />
          </div>
          <button onClick={() => setShowJump(v => !v)} style={s.jumpBtn}>
            Topic {current + 1} of {topics.length} {showJump ? '▲' : '▼'}
          </button>
        </div>

        <div style={{ width: '80px' }} />
      </div>

      {/* Jump menu */}
      {showJump && (
        <div style={s.jumpMenu}>
          <p style={s.jumpTitle}>Jump to topic</p>
          <div style={s.jumpList}>
            {topics.map((t, i) => {
              const preview = (() => {
                try {
                  const doc = typeof t.content === 'string' ? JSON.parse(t.content) : t.content;
                  const texts = [];
                  const extract = (nodes) => nodes?.forEach(n => {
                    if (n.type === 'text') texts.push(n.text);
                    if (n.content) extract(n.content);
                  });
                  extract(doc.content);
                  return texts.join(' ').slice(0, 50) || `Topic ${i + 1}`;
                } catch { return `Topic ${i + 1}`; }
              })();

              return (
                <button
                  key={t.id}
                  onClick={() => { setCurrent(i); setShowJump(false); }}
                  style={{
                    ...s.jumpItem,
                    ...(i === current ? s.jumpItemActive : {}),
                  }}
                >
                  <div style={{ ...s.jumpNum, ...(i === current ? s.jumpNumActive : {}) }}>
                    {i < current ? '✓' : i + 1}
                  </div>
                  <span style={{ fontSize: '13px', color: i === current ? '#1d4ed8' : '#374151', fontWeight: i === current ? 600 : 400, flex: 1, textAlign: 'left', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {preview}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Content */}
      <div style={s.content}>
        {topic && (
          <div style={s.card}>
            <div style={s.topicHeader}>
              <span style={s.topicLabel}>Topic {current + 1}</span>
              <span style={s.topicOf}>of {topics.length}</span>
            </div>

            <div style={s.topicBody}>
  <TopicBlockRenderer topic={topic} tier={user?.tier || 1} />
</div>

            {topic.miniQuiz && <MiniQuiz quiz={topic.miniQuiz} />}
          </div>
        )}

        {/* Navigation */}
        <div style={s.navRow}>
          <button
            onClick={() => setCurrent(c => c - 1)}
            disabled={isFirst}
            style={{ ...s.navBtn, ...(isFirst ? s.navBtnDisabled : {}) }}
          >
            ← Previous
          </button>

          {/* Dot indicators */}
          <div style={s.dots}>
            {topics.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrent(i)}
                style={{
                  ...s.dot,
                  ...(i === current ? s.dotActive : {}),
                  ...(i < current ? s.dotDone : {}),
                }}
              />
            ))}
          </div>

          {isLast ? (
            <button onClick={handleFinish} style={s.finishBtn}>
              Finish ✓
            </button>
          ) : (
            <button onClick={() => setCurrent(c => c + 1)} style={s.nextBtn}>
              Next →
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
  spinner: { width: '36px', height: '36px', border: '3px solid #e2e8f0', borderTop: '3px solid #3b82f6', borderRadius: '50%', animation: 'spin 0.8s linear infinite' },
  topbar: { backgroundColor: '#ffffff', borderBottom: '1px solid #e2e8f0', padding: '12px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '16px', position: 'sticky', top: 0, zIndex: 50 },
  backBtn: { background: 'none', border: 'none', cursor: 'pointer', fontSize: '14px', fontWeight: 600, color: '#3b82f6', fontFamily: "'Inter', sans-serif", padding: 0, whiteSpace: 'nowrap' },
  topbarCenter: { flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' },
  progressTrack: { width: '100%', maxWidth: '320px', height: '4px', backgroundColor: '#e2e8f0', borderRadius: '2px', overflow: 'hidden' },
  progressFill: { height: '100%', backgroundColor: '#1d4ed8', borderRadius: '2px', transition: 'width 0.3s ease' },
  jumpBtn: { background: 'none', border: 'none', cursor: 'pointer', fontSize: '12px', fontWeight: 600, color: '#64748b', fontFamily: "'Inter', sans-serif", padding: '2px 8px', borderRadius: '6px', backgroundColor: '#f1f5f9' },
  jumpMenu: { backgroundColor: '#ffffff', borderBottom: '1px solid #e2e8f0', padding: '16px 24px', position: 'sticky', top: '65px', zIndex: 40, boxShadow: '0 4px 12px rgba(0,0,0,0.08)' },
  jumpTitle: { fontSize: '11px', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '10px' },
  jumpList: { display: 'flex', flexDirection: 'column', gap: '4px', maxHeight: '240px', overflowY: 'auto' },
  jumpItem: { display: 'flex', alignItems: 'center', gap: '10px', padding: '8px 12px', borderRadius: '8px', border: '1px solid transparent', backgroundColor: 'transparent', cursor: 'pointer', fontFamily: "'Inter', sans-serif', transition: 'all 0.15s', width: '100%' "},
  jumpItemActive: { backgroundColor: '#eff6ff', borderColor: '#bfdbfe' },
  jumpNum: { width: '24px', height: '24px', borderRadius: '6px', backgroundColor: '#f1f5f9', color: '#64748b', fontSize: '11px', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  jumpNumActive: { backgroundColor: '#1d4ed8', color: '#ffffff' },
  content: { maxWidth: '720px', margin: '0 auto', padding: '32px 24px 80px' },
  card: { backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '28px 32px', boxShadow: '0 1px 3px rgba(0,0,0,0.04)', marginBottom: '20px' },
  topicHeader: { display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px', paddingBottom: '16px', borderBottom: '1px solid #f1f5f9' },
  topicLabel: { fontSize: '12px', fontWeight: 700, color: '#1d4ed8', textTransform: 'uppercase', letterSpacing: '0.08em', backgroundColor: '#eff6ff', padding: '4px 10px', borderRadius: '6px' },
  topicOf: { fontSize: '12px', color: '#94a3b8', fontWeight: 500 },
  topicBody: { fontSize: '15px', lineHeight: 1.75, color: '#374151' },
  navRow: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '16px' },
  dots: { display: 'flex', gap: '6px', alignItems: 'center', flexWrap: 'wrap', justifyContent: 'center', flex: 1 },
  dot: { width: '8px', height: '8px', borderRadius: '50%', border: 'none', backgroundColor: '#e2e8f0', cursor: 'pointer', padding: 0, transition: 'all 0.2s', flexShrink: 0 },
  dotActive: { backgroundColor: '#1d4ed8', width: '24px', borderRadius: '4px' },
  dotDone: { backgroundColor: '#93c5fd' },
  navBtn: { padding: '10px 20px', borderRadius: '10px', border: '1.5px solid #e2e8f0', backgroundColor: '#ffffff', color: '#374151', fontSize: '14px', fontWeight: 600, cursor: 'pointer', fontFamily: "'Inter', sans-serif", whiteSpace: 'nowrap' },
  navBtnDisabled: { opacity: 0.4, cursor: 'not-allowed' },
  nextBtn: { padding: '10px 24px', borderRadius: '10px', border: 'none', backgroundColor: '#1d4ed8', color: '#ffffff', fontSize: '14px', fontWeight: 600, cursor: 'pointer', fontFamily: "'Inter', sans-serif", whiteSpace: 'nowrap' },
  finishBtn: { padding: '10px 24px', borderRadius: '10px', border: 'none', backgroundColor: '#16a34a', color: '#ffffff', fontSize: '14px', fontWeight: 600, cursor: 'pointer', fontFamily: "'Inter', sans-serif", whiteSpace: 'nowrap' },
};

const q = {
  wrap: { backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '20px 24px', marginTop: '20px' },
  label: { fontSize: '11px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', color: '#94a3b8', margin: '0 0 10px 0' },
  question: { fontSize: '15px', fontWeight: 600, color: '#0f172a', marginBottom: '14px', lineHeight: 1.5 },
  opts: { display: 'flex', flexDirection: 'column', gap: '8px' },
  opt: { display: 'flex', alignItems: 'center', gap: '10px', padding: '11px 14px', borderRadius: '10px', border: '1.5px solid #e2e8f0', backgroundColor: '#ffffff', cursor: 'pointer', fontSize: '14px', color: '#374151', fontFamily: "'Inter', sans-serif", textAlign: 'left', transition: 'all 0.15s' },
  optCorrect: { borderColor: '#86efac', backgroundColor: '#f0fdf4', color: '#166534' },
  optWrong: { borderColor: '#fecaca', backgroundColor: '#fef2f2', color: '#991b1b' },
  radio: { width: '18px', height: '18px', borderRadius: '50%', border: '2px solid #cbd5e1', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' },
};