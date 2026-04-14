import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const studentLinks = [
  { path: '/student/dashboard', label: 'Dashboard', icon: '▣' },
  { path: '/student/modules', label: 'Modules', icon: '📖' },
  { path: '/student/media', label: 'Media', icon: '📲' },
  // { path: '/student/exercises', label: 'Exercises', icon: '📝' },
];

const teacherLinks = [
  { path: '/teacher/dashboard', label: 'Dashboard', icon: '▣' },
  { path: '/teacher/modules', label: 'Modules', icon: '📖' },
  { path: '/teacher/media', label: 'Media', icon: '📲' },
  // { path: '/teacher/exercises', label: 'Exercises', icon: '📝' },
  { path: '/teacher/diagnostic', icon: '🧪', label: 'Diagnostic', desc: 'Manage pre/post test questions and results', accent: '#7c3aed', light: '#f5f3ff' },
  { path: '/teacher/students', label: 'Students', icon: '👥' },
];

const tierMap = {
  1: { label: 'Advanced', bg: '#dcfce7', color: '#166534', dot: '#16a34a' },
  2: { label: 'Intermediate', bg: '#fef9c3', color: '#854d0e', dot: '#ca8a04' },
  3: { label: 'Foundation', bg: '#fee2e2', color: '#991b1b', dot: '#dc2626' },
};

export default function Sidebar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const links = user?.role === 'TEACHER' ? teacherLinks : studentLinks;
  const tier = tierMap[user?.tier];

  return (
    <aside style={s.aside}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
        .nav-link:hover { background: #f1f5f9 !important; color: #1e40af !important; }
      `}</style>

      {/* Logo */}
      <div style={s.logo}>
        <div style={s.logoIcon}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
            <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"
              stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
        <span style={s.logoText}>LMS</span>
      </div>

      {/* User */}
      <div style={s.userCard}>
        <div style={s.avatar}>{user?.name?.charAt(0).toUpperCase()}</div>
        <div style={{ overflow: 'hidden' }}>
          <p style={s.userName}>{user?.name}</p>
          <p style={s.userRole}>{user?.role === 'TEACHER' ? 'Teacher' : 'Student'}</p>
        </div>
      </div>

      {/* Tier badge */}
      {user?.role === 'STUDENT' && tier && (
        <div style={{ ...s.tierBadge, background: tier.bg, color: tier.color }}>
          <span style={{ ...s.tierDot, background: tier.dot }} />
          Tier {user.tier} — {tier.label}
        </div>
      )}

      <div style={s.divider} />
      <p style={s.navSection}>Navigation</p>

      <nav style={s.nav}>
        {links.map(link => {
          const active = location.pathname === link.path;
          return (
            <button
              key={link.path}
              className="nav-link"
              onClick={() => navigate(link.path)}
              style={active ? { ...s.navBtn, ...s.navActive } : { ...s.navBtn, color: '#64748b' }}
            >
              <span style={s.navIcon}>{link.icon}</span>
              {link.label}
              {active && <span style={s.activePip} />}
            </button>
          );
        })}
      </nav>

      <div style={s.divider} />
<button
  className="logout-btn"
  onClick={() => { logout(); navigate('/login'); }}
  style={s.logoutBtn}
  onMouseEnter={e => Object.assign(e.currentTarget.style, { background: '#fef2f2', color: '#dc2626' })}
  onMouseLeave={e => Object.assign(e.currentTarget.style, { background: 'transparent', color: '#94a3b8' })}
>
  <span>↩</span> Sign Out
</button>
    </aside>
  );
}

const s = {
  aside: {
    width: '220px',
    minHeight: '100vh',
    backgroundColor: '#ffffff',
    borderRight: '1px solid #e2e8f0',
    display: 'flex',
    flexDirection: 'column',
    padding: '20px 12px',
    position: 'fixed',
    top: 0, left: 0, bottom: 0,
    fontFamily: "'Inter', sans-serif",
    zIndex: 100,
    overflowY: 'auto',
  },
  logo: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    padding: '4px 8px 20px',
  },
  logoIcon: {
    width: '34px',
    height: '34px',
    borderRadius: '9px',
    background: 'linear-gradient(135deg, #1d4ed8, #3b82f6)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0 2px 8px rgba(59,130,246,0.35)',
  },
  logoText: {
    fontSize: '18px',
    fontWeight: 800,
    color: '#0f172a',
    letterSpacing: '-0.02em',
  },
  userCard: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    padding: '10px 12px',
    backgroundColor: '#f8fafc',
    borderRadius: '12px',
    marginBottom: '10px',
    border: '1px solid #f1f5f9',
  },
  avatar: {
    width: '34px',
    height: '34px',
    borderRadius: '50%',
    background: 'linear-gradient(135deg, #1d4ed8, #3b82f6)',
    color: 'white',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: 700,
    fontSize: '14px',
    flexShrink: 0,
  },
  userName: {
    margin: 0,
    fontSize: '13px',
    fontWeight: 600,
    color: '#0f172a',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  userRole: {
    margin: 0,
    fontSize: '11px',
    color: '#94a3b8',
    fontWeight: 500,
  },
  tierBadge: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    fontSize: '12px',
    fontWeight: 600,
    padding: '6px 12px',
    borderRadius: '20px',
    marginBottom: '10px',
  },
  tierDot: {
    width: '6px',
    height: '6px',
    borderRadius: '50%',
    flexShrink: 0,
  },
  divider: {
    height: '1px',
    backgroundColor: '#f1f5f9',
    margin: '8px 0',
  },
  navSection: {
    fontSize: '10px',
    fontWeight: 700,
    color: '#94a3b8',
    letterSpacing: '0.1em',
    textTransform: 'uppercase',
    padding: '4px 12px 8px',
    margin: 0,
  },
  nav: {
    display: 'flex',
    flexDirection: 'column',
    gap: '2px',
  },
  navBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    padding: '9px 12px',
    borderRadius: '9px',
    border: 'none',
    background: 'transparent',
    fontSize: '13px',
    fontWeight: 500,
    cursor: 'pointer',
    textAlign: 'left',
    width: '100%',
    fontFamily: "'Inter', sans-serif",
    position: 'relative',
  },
  navActive: {
    backgroundColor: '#eff6ff',
    color: '#1d4ed8',
    fontWeight: 600,
  },
  navIcon: {
    fontSize: '15px',
    width: '20px',
    textAlign: 'center',
    flexShrink: 0,
  },
  activePip: {
    position: 'absolute',
    right: '10px',
    width: '6px',
    height: '6px',
    borderRadius: '50%',
    backgroundColor: '#3b82f6',
  },
  logoutBtn: {
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
  width: '100%',
  padding: '9px 12px',
  border: 'none',
  background: 'transparent',
  color: '#94a3b8',
  fontSize: '13px',
  fontWeight: 500,
  cursor: 'pointer',
  borderRadius: '9px',
  fontFamily: "'Inter', sans-serif",
  marginTop: '8px',
},
};