import React, { useState, useEffect } from 'react';
import Login from './components/Login';
import Landing from './components/Landing';
import SuperDashboard from './components/SuperDashboard';
import AdminDashboard from './components/AdminDashboard';
import translations from './translations';
import { Sun, Moon, Globe } from 'lucide-react';

const API_BASE = import.meta.env.VITE_API_BASE || '';

export function HeaderControls({ lang, theme, toggleLang, toggleTheme }) {
  return (
    <div style={{
      display: 'inline-flex',
      alignItems: 'center',
      gap: '0.75rem',
      padding: '0.4rem 0.75rem',
      borderRadius: '24px',
      background: 'var(--bg-card)',
      border: '1px solid var(--color-border)',
      backdropFilter: 'blur(8px)'
    }}>
      {/* Theme Toggle Button */}
      <button 
        id="theme-toggle"
        onClick={toggleTheme} 
        className="header-control-btn"
        title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
      >
        {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
      </button>

      {/* Divider */}
      <div style={{ width: '1px', height: '12px', background: 'var(--color-border)' }}></div>

      {/* Language Toggle Button */}
      <button 
        id="language-toggle"
        onClick={toggleLang}
        className="header-control-btn-lang"
        title="Toggle Language / ભાષા બદલો"
      >
        <Globe size={13} style={{ color: 'var(--accent-teal)' }} />
        <span>{lang === 'en' ? 'EN' : 'ગુજરાતી'}</span>
      </button>
    </div>
  );
}

export default function App() {
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showLogin, setShowLogin] = useState(false);
  
  // Theme & Language Global States
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'dark');
  const [lang, setLang] = useState(localStorage.getItem('lang') || 'en');

  // Sync theme attribute to HTML tag
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  // Sync language selection
  useEffect(() => {
    localStorage.setItem('lang', lang);
  }, [lang]);

  // Translation helper function
  const t = (key) => {
    if (translations[lang] && translations[lang][key]) {
      return translations[lang][key];
    }
    return key;
  };

  const toggleTheme = () => setTheme(prev => prev === 'dark' ? 'light' : 'dark');
  const toggleLang = () => setLang(prev => prev === 'en' ? 'gu' : 'en');

  // Validate session on mount
  useEffect(() => {
    const checkSession = async () => {
      const storedToken = localStorage.getItem('token');
      if (!storedToken) {
        setLoading(false);
        return;
      }

      try {
        const response = await fetch(`${API_BASE}/api/auth/me`, {
          headers: {
            'Authorization': `Bearer ${storedToken}`
          }
        });

        if (response.ok) {
          const data = await response.json();
          setToken(storedToken);
          setUser(data.user);
        } else {
          handleLogout();
        }
      } catch (err) {
        console.error('Session validation error:', err);
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
          setUser(JSON.parse(storedUser));
        } else {
          handleLogout();
        }
      } finally {
        setLoading(false);
      }
    };

    checkSession();
  }, []);

  const handleLoginSuccess = (newToken, loggedUser) => {
    setToken(newToken);
    setUser(loggedUser);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setToken(null);
    setUser(null);
  };

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        backgroundColor: theme === 'dark' ? '#080c16' : '#f1f5f9',
        color: theme === 'dark' ? '#f8fafc' : '#0f172a',
        fontFamily: 'sans-serif'
      }}>
        <div style={{
          width: '40px',
          height: '40px',
          border: '3px solid rgba(255, 255, 255, 0.1)',
          borderTopColor: '#06b6d4',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite',
          marginBottom: '1rem'
        }}></div>
        <p style={{ fontSize: '0.9rem', opacity: 0.8 }}>{t('loadingText')}</p>
        <style>{`
          @keyframes spin {
            to { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  // Router logic based on auth role
  if (!token || !user) {
    if (showLogin) {
      return (
        <div style={{ position: 'relative', minHeight: '100vh' }}>
          {/* Floating header controls for login page */}
          <div style={{ position: 'fixed', top: '1.25rem', right: '1.25rem', zIndex: 1000 }}>
            <HeaderControls lang={lang} theme={theme} toggleLang={toggleLang} toggleTheme={toggleTheme} />
          </div>
          <Login onLoginSuccess={handleLoginSuccess} onBackToHome={() => setShowLogin(false)} t={t} />
        </div>
      );
    }
    return (
      <Landing 
        lang={lang} 
        theme={theme} 
        toggleLang={toggleLang} 
        toggleTheme={toggleTheme} 
        onAccessDashboard={() => setShowLogin(true)} 
      />
    );
  }

  const commonProps = {
    token,
    user,
    onLogout: handleLogout,
    t,
    lang,
    theme,
    toggleLang,
    toggleTheme
  };

  if (user.role === 'super_admin') {
    return (
      <SuperDashboard {...commonProps} />
    );
  }

  if (user.role === 'admin') {
    return (
      <AdminDashboard {...commonProps} />
    );
  }

  return (
    <div style={{ position: 'relative', minHeight: '100vh' }}>
      <div style={{ position: 'fixed', top: '1.25rem', right: '1.25rem', zIndex: 1000 }}>
        <HeaderControls lang={lang} theme={theme} toggleLang={toggleLang} toggleTheme={toggleTheme} />
      </div>
      <Login onLoginSuccess={handleLoginSuccess} t={t} />
    </div>
  );
}
