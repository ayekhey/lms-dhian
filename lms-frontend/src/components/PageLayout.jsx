import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from './Sidebar';
import { useAuth } from '../context/AuthContext';

export default function PageLayout({ children, title, subtitle, action }) {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div style={s.root}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');

        .signout-btn:hover { background: #fef2f2 !important; color: #dc2626 !important; }
        .menu-btn:hover { background: #f1f5f9 !important; }

        @media (max-width: 768px) {
          .sidebar-wrap { display: ${menuOpen ? 'block' : 'none'} !important; }
          .main-content { margin-left: 0 !important; }
          .topbar { padding: 0 16px !important; }
          .page-content { padding: 20px 16px !important; }
        }
      `}</style>

      {/* Sidebar */}
      <div className="sidebar-wrap" style={s.sidebarWrap}>
        <Sidebar />
      </div>

      {/* Overlay for mobile */}
      {menuOpen && (
        <div
          style={s.overlay}
          onClick={() => setMenuOpen(false)}
        />
      )}

      {/* Main */}
      <div className="main-content" style={s.mainWrap}>
        {/* Top navbar */}
        <div className="topbar" style={s.topbar}>
          {/* Hamburger for mobile */}
          <button
            className="menu-btn"
            onClick={() => setMenuOpen(m => !m)}
            style={s.menuBtn}
          >
            <span style={s.hamburger}>☰</span>
          </button>

          <div style={s.topbarRight}>
            <button
              className="signout-btn"
              onClick={() => { logout(); navigate('/login'); }}
              style={s.signOutBtn}
            >
              ↩ Sign Out
            </button>
          </div>
        </div>

        {/* Page content */}
        <main className="page-content" style={s.content}>
          {(title || subtitle || action) && (
            <div style={s.pageHeader}>
              <div>
                {title && <h1 style={s.title}>{title}</h1>}
                {subtitle && <p style={s.subtitle}>{subtitle}</p>}
              </div>
              {action && <div>{action}</div>}
            </div>
          )}
          {children}
        </main>
      </div>
    </div>
  );
}

const s = {
  root: {
    display: 'flex',
    minHeight: '100vh',
    backgroundColor: '#f8fafc',
    fontFamily: "'Inter', sans-serif",
  },
  sidebarWrap: {
    display: 'block',
  },
  overlay: {
    position: 'fixed',
    inset: 0,
    backgroundColor: 'rgba(0,0,0,0.3)',
    zIndex: 99,
  },
  mainWrap: {
    marginLeft: '220px',
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    minWidth: 0,
  },
  topbar: {
    height: '56px',
    backgroundColor: '#ffffff',
    borderBottom: '1px solid #e2e8f0',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '0 32px',
    position: 'sticky',
    top: 0,
    zIndex: 50,
  },
  menuBtn: {
    width: '36px',
    height: '36px',
    borderRadius: '8px',
    border: 'none',
    background: 'transparent',
    cursor: 'pointer',
    display: 'none',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'background 0.15s',
  },
  hamburger: {
    fontSize: '18px',
    color: '#64748b',
  },
  topbarRight: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    marginLeft: 'auto',
  },
  signOutBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    padding: '8px 16px',
    borderRadius: '8px',
    border: '1px solid #e2e8f0',
    background: '#ffffff',
    color: '#64748b',
    fontSize: '13px',
    fontWeight: 600,
    cursor: 'pointer',
    fontFamily: "'Inter', sans-serif",
    transition: 'all 0.15s',
  },
  content: {
    padding: '32px 36px',
    flex: 1,
  },
  pageHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: '24px',
  },
  title: {
    fontSize: '22px',
    fontWeight: 800,
    color: '#0f172a',
    margin: '0 0 4px 0',
    letterSpacing: '-0.02em',
    fontFamily: "'Inter', sans-serif",
  },
  subtitle: {
    fontSize: '14px',
    color: '#64748b',
    margin: 0,
  },
};