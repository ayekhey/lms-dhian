import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import PageLayout from '../components/PageLayout';

export default function StudentDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const tierMap = {
    1: { label: 'Advanced', desc: 'You scored in the top range.' },
    2: { label: 'Intermediate', desc: 'You scored in the middle range.' },
    3: { label: 'Foundation', desc: 'You scored in the lower range.' },
  };
  const tier = tierMap[user?.tier];

  const cards = [
    {
      path: '/student/modules',
      icon: '📖',
      label: 'Modules',
      desc: 'Browse and read learning modules',
      accent: '#1d4ed8',
      light: '#eff6ff',
    },
    {
      path: '/student/media',
      icon: '📲',
      label: 'Media',
      desc: 'Scan QR codes for extra resources',
      accent: '#059669',
      light: '#ecfdf5',
    },
    {
      path: '/student/posttest',
      icon: '📝',
      label: 'Post Test',
      desc: user?.postTestDone
        ? 'You have completed the post test'
        : 'Take the post test after finishing modules',
      accent: user?.postTestDone ? '#64748b' : '#7c3aed',
      light: user?.postTestDone ? '#f8fafc' : '#f5f3ff',
      done: user?.postTestDone,
    },
  ];

  const now = new Date();
  const hour = now.getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

  return (
    <PageLayout>
      {/* Welcome banner */}
      <div style={s.banner}>
        <div>
          <p style={s.bannerGreeting}>{greeting} 👋</p>
          <h1 style={s.bannerName}>{user?.name}</h1>
          {tier && (
            <p style={s.bannerSub}>
              Tier {user?.tier} — {tier.label} · {tier.desc}
            </p>
          )}
        </div>
        <div style={s.bannerBadge}>Student</div>
      </div>

      <p style={s.sectionLabel}>Quick Access</p>

      <div style={s.grid}>
        {cards.map(card => (
          <button
            key={card.path}
            onClick={() => navigate(card.path)}
            style={s.card}
            onMouseEnter={e => {
              e.currentTarget.style.transform = 'translateY(-3px)';
              e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.1)';
              e.currentTarget.style.borderColor = card.accent + '40';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.06)';
              e.currentTarget.style.borderColor = '#e2e8f0';
            }}
          >
            <div style={{ ...s.iconWrap, background: card.light }}>
              <span style={s.icon}>{card.icon}</span>
            </div>
            <div style={s.cardContent}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                <h3 style={{ ...s.cardTitle, color: card.accent }}>{card.label}</h3>
                {card.done && (
                  <span style={s.doneBadge}>✓ Done</span>
                )}
              </div>
              <p style={s.cardDesc}>{card.desc}</p>
            </div>
            <span style={{ ...s.arrow, color: card.accent }}>→</span>
          </button>
        ))}
      </div>
    </PageLayout>
  );
}

const s = {
  banner: {
    background: 'linear-gradient(135deg, #1e3a8a 0%, #1d4ed8 60%, #3b82f6 100%)',
    borderRadius: '16px', padding: '32px 36px', marginBottom: '32px',
    display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: 'white',
  },
  bannerGreeting: { fontSize: '14px', fontWeight: 500, color: 'rgba(255,255,255,0.75)', margin: '0 0 4px 0' },
  bannerName: { fontSize: '26px', fontWeight: 800, margin: '0 0 6px 0', letterSpacing: '-0.02em', fontFamily: "'Inter', sans-serif" },
  bannerSub: { fontSize: '14px', color: 'rgba(255,255,255,0.65)', margin: 0 },
  bannerBadge: { backgroundColor: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.25)', borderRadius: '20px', padding: '6px 16px', fontSize: '13px', fontWeight: 600, color: 'white', flexShrink: 0 },
  sectionLabel: { fontSize: '11px', fontWeight: 700, color: '#94a3b8', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '14px' },
  grid: { display: 'flex', flexDirection: 'column', gap: '10px' },
  card: {
    display: 'flex', alignItems: 'center', gap: '16px',
    backgroundColor: '#ffffff', border: '1px solid #e2e8f0',
    borderRadius: '14px', padding: '18px 20px', cursor: 'pointer',
    textAlign: 'left', transition: 'transform 0.2s, box-shadow 0.2s, border-color 0.2s',
    boxShadow: '0 1px 3px rgba(0,0,0,0.06)', fontFamily: "'Inter', sans-serif",
  },
  iconWrap: { width: '48px', height: '48px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  icon: { fontSize: '22px' },
  cardContent: { flex: 1 },
  cardTitle: { fontSize: '15px', fontWeight: 700, margin: 0, fontFamily: "'Inter', sans-serif" },
  cardDesc: { fontSize: '13px', color: '#64748b', margin: 0, lineHeight: 1.4 },
  arrow: { fontSize: '18px', flexShrink: 0, opacity: 0.6 },
  doneBadge: { fontSize: '11px', fontWeight: 600, backgroundColor: '#dcfce7', color: '#166534', padding: '2px 8px', borderRadius: '20px' },
};