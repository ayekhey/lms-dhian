import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await api.post('/auth/login', { email, password });
      const { token, user } = res.data;
      login(token, user);
      if (user.role === 'TEACHER') navigate('/teacher/dashboard');
      else if (!user.diagnosticDone) navigate('/diagnostic');
      else navigate('/student/dashboard');
    } catch {
      setError('Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={s.root}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .login-card {
          animation: fadeUp 0.5s ease forwards;
          background: rgba(255,255,255,0.97);
          border-radius: 20px;
          padding: 48px 44px;
          width: 100%;
          max-width: 420px;
          box-shadow: 0 20px 60px rgba(0,0,0,0.15), 0 4px 16px rgba(0,0,0,0.08);
        }

        .login-input {
          width: 100%;
          border: 1.5px solid #e2e8f0;
          border-radius: 10px;
          padding: 13px 16px;
          font-size: 15px;
          font-family: 'Inter', sans-serif;
          color: #1a202c;
          background: #f8fafc;
          outline: none;
          transition: border-color 0.2s, background 0.2s, box-shadow 0.2s;
        }
        .login-input:focus {
          border-color: #3b82f6;
          background: #ffffff;
          box-shadow: 0 0 0 3px rgba(59,130,246,0.12);
        }
        .login-input::placeholder { color: #a0aec0; }

        .login-btn {
          width: 100%;
          background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
          color: white;
          border: none;
          border-radius: 10px;
          padding: 14px;
          font-size: 16px;
          font-weight: 600;
          font-family: 'Inter', sans-serif;
          cursor: pointer;
          transition: opacity 0.2s, transform 0.1s;
          letter-spacing: 0.01em;
        }
        .login-btn:hover:not(:disabled) { opacity: 0.92; transform: translateY(-1px); }
        .login-btn:active { transform: translateY(0); }
        .login-btn:disabled { opacity: 0.6; cursor: not-allowed; }

        .show-btn {
          position: absolute;
          right: 14px;
          top: 50%;
          transform: translateY(-50%);
          background: none;
          border: none;
          cursor: pointer;
          color: #94a3b8;
          font-size: 13px;
          font-family: 'Inter', sans-serif;
          font-weight: 500;
          padding: 0;
        }
        .show-btn:hover { color: #3b82f6; }

        @media (max-width: 480px) {
          .login-card {
            padding: 36px 24px;
            border-radius: 16px;
            max-width: 100%;
          }
        }
      `}</style>

      {/* Background */}
      <div style={s.bg} />

      {/* Card */}
      <div className="login-card">
        {/* Logo */}
        <div style={s.logoRow}>
          <div style={s.logoBox}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <span style={s.logoText}>LMS Platform</span>
        </div>

        <h1 style={s.heading}>Welcome back</h1>
        <p style={s.sub}>Sign in to access your learning dashboard</p>

        {error && (
          <div style={s.errorBox}>
            <span style={s.errorIcon}>!</span>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={s.form}>
          <div style={s.field}>
            <label style={s.label}>Email address</label>
            <input
              className="login-input"
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="you@school.edu"
              required
            />
          </div>

          <div style={s.field}>
            <label style={s.label}>Password</label>
            <div style={{ position: 'relative' }}>
              <input
                className="login-input"
                type={showPass ? 'text' : 'password'}
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="Enter your password"
                required
                style={{ paddingRight: '56px' }}
              />
              <button
                type="button"
                className="show-btn"
                onClick={() => setShowPass(p => !p)}
              >
                {showPass ? 'Hide' : 'Show'}
              </button>
            </div>
          </div>

          <button className="login-btn" type="submit" disabled={loading}>
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <p style={s.footer}>
          Contact your teacher if you don't have an account.
        </p>
      </div>
    </div>
  );
}

const s = {
  root: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontFamily: "'Inter', sans-serif",
    padding: '24px 16px',
    position: 'relative',
    overflow: 'hidden',
  },
  bg: {
    position: 'fixed',
    inset: 0,
    background: 'linear-gradient(135deg, #1e3a8a 0%, #1d4ed8 30%, #3b82f6 60%, #60a5fa 85%, #93c5fd 100%)',
    zIndex: -1,
  },
  logoRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    marginBottom: '28px',
  },
  logoBox: {
    width: '36px',
    height: '36px',
    borderRadius: '10px',
    background: 'linear-gradient(135deg, #1d4ed8, #3b82f6)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0 2px 8px rgba(59,130,246,0.4)',
  },
  logoText: {
    fontSize: '16px',
    fontWeight: 700,
    color: '#1e293b',
    letterSpacing: '-0.01em',
  },
  heading: {
    fontSize: '28px',
    fontWeight: 800,
    color: '#0f172a',
    letterSpacing: '-0.02em',
    marginBottom: '6px',
  },
  sub: {
    fontSize: '14px',
    color: '#64748b',
    marginBottom: '28px',
    lineHeight: 1.5,
  },
  errorBox: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    backgroundColor: '#fef2f2',
    border: '1px solid #fecaca',
    color: '#dc2626',
    padding: '12px 14px',
    borderRadius: '10px',
    fontSize: '14px',
    marginBottom: '20px',
    fontWeight: 500,
  },
  errorIcon: {
    width: '20px',
    height: '20px',
    borderRadius: '50%',
    backgroundColor: '#dc2626',
    color: 'white',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '12px',
    fontWeight: 700,
    flexShrink: 0,
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '18px',
  },
  field: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
  },
  label: {
    fontSize: '13px',
    fontWeight: 600,
    color: '#374151',
    letterSpacing: '0.01em',
  },
  footer: {
    marginTop: '24px',
    fontSize: '13px',
    color: '#94a3b8',
    textAlign: 'center',
    lineHeight: 1.5,
  },
};