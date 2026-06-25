import React, { useState, useEffect } from 'react';
import { 
  UserPlus, Edit2, Trash2, Power, PowerOff, Shield, Users, CheckCircle, 
  XCircle, LogOut, Mail, Lock, User, AlertCircle, X, Search 
} from 'lucide-react';
import { HeaderControls } from '../App';

const API_BASE = import.meta.env.VITE_API_BASE || '';

export default function SuperDashboard({ 
  token, user, onLogout, t, lang, theme, toggleLang, toggleTheme 
}) {
  const [admins, setAdmins] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Metrics state
  const [metrics, setMetrics] = useState({ total: 0, active: 0, suspended: 0 });

  // Pagination states
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  // Modal states
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingAdmin, setEditingAdmin] = useState(null);

  // Form states
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    enabled: true
  });
  const [formError, setFormError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Fetch metrics (unpaginated)
  const fetchMetrics = async () => {
    try {
      const response = await fetch(`${API_BASE}/api/super/admins`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      if (response.ok && Array.isArray(data)) {
        const total = data.filter(a => a.role === 'admin').length;
        const active = data.filter(a => a.role === 'admin' && a.enabled).length;
        const suspended = total - active;
        setMetrics({ total, active, suspended });
      }
    } catch (err) {
      console.error('Fetch metrics error:', err);
    }
  };

  // Fetch paginated admins
  const fetchAdmins = async (search = searchQuery, pageNum = page, limitNum = limit) => {
    setLoading(true);
    setError('');
    try {
      const response = await fetch(`${API_BASE}/api/super/admins?search=${encodeURIComponent(search)}&page=${pageNum}&limit=${limitNum}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to fetch admins.');
      
      if (data.pagination) {
        setAdmins(data.data);
        setTotalPages(data.pagination.totalPages);
        setTotalCount(data.pagination.totalCount);
      } else {
        setAdmins(data);
        setTotalPages(1);
        setTotalCount(data.length);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Debounced search trigger
  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      fetchAdmins(searchQuery, page, limit);
    }, 300);

    return () => clearTimeout(delayDebounce);
  }, [searchQuery, page, limit, token]);

  // Initial load for metrics
  useEffect(() => {
    fetchMetrics();
  }, [token]);

  // Handle Form Change
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  // Open Create Modal
  const openCreateModal = () => {
    setFormData({ name: '', email: '', password: '', enabled: true });
    setFormError('');
    setShowCreateModal(true);
  };

  // Submit Create Admin
  const handleCreateAdmin = async (e) => {
    e.preventDefault();
    setFormError('');
    setSubmitting(true);

    try {
      const response = await fetch(`${API_BASE}/api/super/admins`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to create admin.');
      
      setShowCreateModal(false);
      fetchAdmins(searchQuery, page, limit);
      fetchMetrics();
    } catch (err) {
      setFormError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  // Open Edit Modal
  const openEditModal = (admin) => {
    setEditingAdmin(admin);
    setFormData({
      name: admin.name,
      email: admin.email,
      password: '', // Leave blank unless changing
      enabled: admin.enabled === 1 || admin.enabled === true
    });
    setFormError('');
    setShowEditModal(true);
  };

  // Submit Edit Admin
  const handleEditAdmin = async (e) => {
    e.preventDefault();
    setFormError('');
    setSubmitting(true);

    try {
      const payload = {
        name: formData.name,
        email: formData.email,
        enabled: formData.enabled
      };
      if (formData.password) {
        payload.password = formData.password;
      }

      const response = await fetch(`${API_BASE}/api/super/admins/${editingAdmin.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to update admin.');

      setShowEditModal(false);
      setEditingAdmin(null);
      fetchAdmins(searchQuery, page, limit);
      fetchMetrics();
    } catch (err) {
      setFormError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  // Toggle Admin Enable/Disable Status Directly
  const toggleAdminStatus = async (admin) => {
    try {
      const newEnabledState = !(admin.enabled === 1 || admin.enabled === true);
      const response = await fetch(`${API_BASE}/api/super/admins/${admin.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          name: admin.name,
          email: admin.email,
          enabled: newEnabledState
        })
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to update status.');
      fetchAdmins(searchQuery, page, limit);
      fetchMetrics();
    } catch (err) {
      alert(`Error toggling status: ${err.message}`);
    }
  };

  // Delete Admin
  const handleDeleteAdmin = async (adminId) => {
    if (!window.confirm('Are you sure you want to delete this admin account? This will permanently erase their details and schedules.')) {
      return;
    }

    try {
      const response = await fetch(`${API_BASE}/api/super/admins/${adminId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to delete admin.');
      fetchAdmins(searchQuery, page, limit);
      fetchMetrics();
    } catch (err) {
      alert(`Error deleting admin: ${err.message}`);
    }
  };

  // Calculate Metrics
  const totalAdmins = metrics.total;
  const enabledAdmins = metrics.active;
  const disabledAdmins = metrics.suspended;

  return (
    <div className="app-container">
      <div className="bg-gradient-glow"></div>
      
      {/* Header Bar */}
      <header className="glass-card" style={{
        borderRadius: '0 0 var(--radius-lg) var(--radius-lg)',
        borderTop: 'none',
        padding: '1.25rem 2rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: '2rem'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{
            background: 'linear-gradient(135deg, #06b6d4 0%, #10b981 100%)',
            padding: '0.5rem',
            borderRadius: '10px',
            color: '#fff',
            display: 'flex',
            alignItems: 'center'
          }}>
            <Shield size={22} />
          </div>
          <div>
            <h1 style={{ fontSize: '1.25rem', fontWeight: 800 }}>{t('superConsole')}</h1>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{t('loggedInAs')} {user.name}</span>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
          {/* Theme & Language Controls inside header */}
          <HeaderControls lang={lang} theme={theme} toggleLang={toggleLang} toggleTheme={toggleTheme} />
          
          <button onClick={onLogout} className="btn btn-secondary" style={{ padding: '0.5rem 1rem' }}>
            <LogOut size={16} />
            {t('logout')}
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="dashboard-container" style={{ paddingTop: 0 }}>
        
        {/* Metric Cards */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
          gap: '1.5rem',
          marginBottom: '2.5rem'
        }}>
          <div className="glass-card" style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
            <div style={{
              background: 'rgba(6, 182, 212, 0.1)',
              color: 'var(--accent-teal)',
              padding: '1rem',
              borderRadius: '12px',
              display: 'flex'
            }}>
              <Users size={28} />
            </div>
            <div>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{t('totalAdmins')}</span>
              <h3 style={{ fontSize: '1.75rem', fontWeight: 800, marginTop: '0.25rem' }}>{totalAdmins}</h3>
            </div>
          </div>

          <div className="glass-card" style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
            <div style={{
              background: 'rgba(16, 185, 129, 0.1)',
              color: 'var(--accent-green)',
              padding: '1rem',
              borderRadius: '12px',
              display: 'flex'
            }}>
              <CheckCircle size={28} />
            </div>
            <div>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{t('activeAdmins')}</span>
              <h3 style={{ fontSize: '1.75rem', fontWeight: 800, marginTop: '0.25rem', color: 'var(--accent-green)' }}>{enabledAdmins}</h3>
            </div>
          </div>

          <div className="glass-card" style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
            <div style={{
              background: 'rgba(239, 68, 68, 0.1)',
              color: 'var(--color-error)',
              padding: '1rem',
              borderRadius: '12px',
              display: 'flex'
            }}>
              <XCircle size={28} />
            </div>
            <div>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{t('suspendedAdmins')}</span>
              <h3 style={{ fontSize: '1.75rem', fontWeight: 800, marginTop: '0.25rem', color: 'var(--color-error)' }}>{disabledAdmins}</h3>
            </div>
          </div>
        </div>

        {/* Section Title & Action */}
        <div className="section-header">
          <div>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 800 }}>{t('adminAccounts')}</h2>
            <p style={{ fontSize: '0.875rem' }}>{t('adminDesc')}</p>
          </div>
          
          <button onClick={openCreateModal} className="btn btn-primary">
            <UserPlus size={16} />
            {t('createAdmin')}
          </button>
        </div>

        {/* Error Notification */}
        {error && (
          <div className="glass-card" style={{
            borderColor: 'rgba(239, 68, 68, 0.2)',
            background: 'rgba(239, 68, 68, 0.05)',
            color: 'var(--color-error)',
            marginBottom: '1.5rem',
            padding: '1rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem'
          }}>
            <AlertCircle size={20} />
            <span>{error}</span>
          </div>
        )}

        {/* Search Bar */}
        <div style={{ marginBottom: '1rem', position: 'relative' }}>
          <input
            type="text"
            className="form-input"
            placeholder={t('searchAdmins')}
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setPage(1);
            }}
            style={{ paddingLeft: '2.5rem' }}
          />
          <span style={{
            position: 'absolute',
            left: '1rem',
            top: '50%',
            transform: 'translateY(-50%)',
            color: 'var(--text-secondary)',
            display: 'flex',
            alignItems: 'center',
            pointerEvents: 'none'
          }}>
            <Search size={18} />
          </span>
        </div>

        {/* Admins Table */}
        <div className="glass-card" style={{ padding: 0, overflow: 'hidden' }}>
          {loading ? (
            <div style={{ padding: '3rem', textAlign: 'center' }}>
              <div className="spinner" style={{
                width: '32px',
                height: '32px',
                border: '3px solid rgba(255,255,255,0.1)',
                borderTopColor: 'var(--accent-teal)',
                borderRadius: '50%',
                animation: 'spin 1s linear infinite',
                margin: '0 auto 1rem auto'
              }}></div>
              <p>{t('loadingAdmins')}</p>
            </div>
          ) : admins.length === 0 ? (
            <div style={{ padding: '4rem 2rem', textAlign: 'center' }}>
              <Users size={48} style={{ color: 'var(--text-muted)', marginBottom: '1rem' }} />
              <p style={{ fontSize: '1.05rem', color: 'var(--text-secondary)' }}>{t('noAdmins')}</p>
            </div>
          ) : (
            <div className="table-wrapper">
              <table className="table">
                <thead>
                  <tr>
                    <th>{t('nameLabel')}</th>
                    <th>{t('emailLabel')}</th>
                    <th>{t('roleLabel')}</th>
                    <th>{t('statusLabel')}</th>
                    <th>{t('createdAtLabel')}</th>
                    <th style={{ textAlign: 'right' }}>{t('actionsLabel')}</th>
                  </tr>
                </thead>
                <tbody>
                  {admins.map((admin) => (
                    <tr key={admin.id}>
                      <td style={{ fontWeight: 600 }}>{admin.name}</td>
                      <td>{admin.email}</td>
                      <td>
                        <span className={`badge ${admin.role === 'super_admin' ? 'badge-info' : 'badge-success'}`} style={{ fontSize: '0.7rem' }}>
                          {admin.role === 'super_admin' ? 'Super Admin' : 'Admin'}
                        </span>
                      </td>
                      <td>
                        <span 
                          onClick={() => admin.role !== 'super_admin' && toggleAdminStatus(admin)}
                          className={`badge ${admin.enabled ? 'badge-success' : 'badge-danger'}`} 
                          style={{ 
                            fontSize: '0.7rem', 
                            cursor: admin.role !== 'super_admin' ? 'pointer' : 'default',
                            userSelect: 'none'
                          }}
                          title={admin.role !== 'super_admin' ? "Click to toggle" : undefined}
                        >
                          {admin.enabled ? 'Enabled' : 'Disabled'}
                        </span>
                      </td>
                      <td style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                        {new Date(admin.created_at).toLocaleDateString(undefined, { 
                          year: 'numeric', month: 'short', day: 'numeric' 
                        })}
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                          <button 
                            onClick={() => openEditModal(admin)} 
                            className="btn-icon btn-icon-edit" 
                            title="Edit Admin"
                          >
                            <Edit2 size={14} />
                          </button>
                          
                          {admin.role !== 'super_admin' && (
                            <>
                              <button 
                                onClick={() => toggleAdminStatus(admin)} 
                                className={`btn-icon ${admin.enabled ? 'btn-danger' : 'btn-icon-success'}`}
                                title={admin.enabled ? "Disable Account" : "Enable Account"}
                              >
                                {admin.enabled ? <PowerOff size={14} /> : <Power size={14} />}
                              </button>
                              
                              <button 
                                onClick={() => handleDeleteAdmin(admin.id)} 
                                className="btn-icon btn-danger"
                                title="Delete Admin"
                              >
                                <Trash2 size={14} />
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Pagination Controls */}
              <div className="pagination-container">
                {/* Left: Total Info */}
                <div className="pagination-info">
                  {lang === 'en' ? `Showing ${admins.length} of ${totalCount} entries` : `કુલ ${totalCount} માંથી ${admins.length} દર્શાવેલ છે`}
                </div>

                {/* Right: Controls & Page Info */}
                <div className="pagination-controls">
                  {/* Page Size Selector */}
                  <div className="pagination-limit-wrapper">
                    <span className="pagination-limit-label">
                      {lang === 'en' ? 'Show:' : 'દર્શાવો:'}
                    </span>
                    <select
                      value={limit}
                      onChange={(e) => {
                        const val = parseInt(e.target.value, 10);
                        setLimit(val);
                        setPage(1);
                      }}
                      className="pagination-limit-select"
                    >
                      <option value={5}>5</option>
                      <option value={10}>10</option>
                      <option value={20}>20</option>
                      <option value={50}>50</option>
                    </select>
                  </div>

                  {/* Page Numbers Navigation */}
                  <div className="pagination-pages">
                    <button
                      onClick={() => setPage(prev => Math.max(prev - 1, 1))}
                      disabled={page === 1}
                      className="pagination-btn"
                      title={lang === 'en' ? 'Previous Page' : 'પાછલું પાનું'}
                    >
                      ‹
                    </button>

                    {/* Render Page Numbers dynamically */}
                    {Array.from({ length: totalPages }, (_, i) => i + 1)
                      .filter(p => p === 1 || p === totalPages || Math.abs(p - page) <= 1)
                      .map((p, index, arr) => {
                        const showEllipsisBefore = index > 0 && p - arr[index - 1] > 1;
                        return (
                          <React.Fragment key={p}>
                            {showEllipsisBefore && <span className="pagination-ellipsis">...</span>}
                            <button
                              onClick={() => setPage(p)}
                              className={`pagination-btn ${p === page ? 'active' : ''}`}
                            >
                              {p}
                            </button>
                          </React.Fragment>
                        );
                      })}

                    <button
                      onClick={() => setPage(prev => Math.min(prev + 1, totalPages))}
                      disabled={page === totalPages || totalPages === 0}
                      className="pagination-btn"
                      title={lang === 'en' ? 'Next Page' : 'આગલું પાનું'}
                    >
                      ›
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Create Admin Modal */}
      {showCreateModal && (
        <div className="modal-overlay">
          <div className="glass-card modal-content" style={{ padding: '2rem' }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '1.5rem',
              borderBottom: '1px solid var(--color-border)',
              paddingBottom: '1rem'
            }}>
              <h3 style={{ fontSize: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <UserPlus size={20} style={{ color: 'var(--accent-teal)' }} />
                {t('createAdmin')}
              </h3>
              <button 
                onClick={() => setShowCreateModal(false)} 
                style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
              >
                <X size={20} />
              </button>
            </div>

            {formError && (
              <div style={{
                background: 'rgba(239, 68, 68, 0.1)',
                border: '1px solid rgba(239, 68, 68, 0.2)',
                borderRadius: '8px',
                padding: '0.75rem',
                marginBottom: '1rem',
                color: 'var(--color-error)',
                fontSize: '0.85rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}>
                <AlertCircle size={16} />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleCreateAdmin}>
              <div className="form-group">
                <label className="form-label">{t('name')}</label>
                <div style={{ position: 'relative' }}>
                  <span style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)', display: 'flex' }}>
                    <User size={16} />
                  </span>
                  <input
                    type="text"
                    required
                    name="name"
                    className="form-input"
                    placeholder="John Doe"
                    value={formData.name}
                    onChange={handleInputChange}
                    style={{ paddingLeft: '2.5rem' }}
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">{t('emailLabel')}</label>
                <div style={{ position: 'relative' }}>
                  <span style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)', display: 'flex' }}>
                    <Mail size={16} />
                  </span>
                  <input
                    type="email"
                    required
                    name="email"
                    className="form-input"
                    placeholder="john@example.com"
                    value={formData.email}
                    onChange={handleInputChange}
                    style={{ paddingLeft: '2.5rem' }}
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">{t('password')}</label>
                <div style={{ position: 'relative' }}>
                  <span style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)', display: 'flex' }}>
                    <Lock size={16} />
                  </span>
                  <input
                    type="password"
                    required
                    name="password"
                    className="form-input"
                    placeholder="Minimum 6 characters"
                    value={formData.password}
                    onChange={handleInputChange}
                    style={{ paddingLeft: '2.5rem' }}
                    minLength={6}
                  />
                </div>
              </div>

              <div className="form-group" style={{ marginTop: '1.25rem', marginBottom: '1.5rem' }}>
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    name="enabled"
                    checked={formData.enabled}
                    onChange={handleInputChange}
                  />
                  <span>{t('enableImmediately')}</span>
                </label>
              </div>

              <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end', marginTop: '2rem' }}>
                <button 
                  type="button" 
                  onClick={() => setShowCreateModal(false)} 
                  className="btn btn-secondary"
                  disabled={submitting}
                >
                  {t('cancel')}
                </button>
                <button 
                  type="submit" 
                  className="btn btn-primary"
                  disabled={submitting}
                >
                  {submitting ? '...' : t('createAccount')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Admin Modal */}
      {showEditModal && (
        <div className="modal-overlay">
          <div className="glass-card modal-content" style={{ padding: '2rem' }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '1.5rem',
              borderBottom: '1px solid var(--color-border)',
              paddingBottom: '1rem'
            }}>
              <h3 style={{ fontSize: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Edit2 size={20} style={{ color: 'var(--accent-teal)' }} />
                {t('editAdmin')}
              </h3>
              <button 
                onClick={() => { setShowEditModal(false); setEditingAdmin(null); }} 
                style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
              >
                <X size={20} />
              </button>
            </div>

            {formError && (
              <div style={{
                background: 'rgba(239, 68, 68, 0.1)',
                border: '1px solid rgba(239, 68, 68, 0.2)',
                borderRadius: '8px',
                padding: '0.75rem',
                marginBottom: '1rem',
                color: 'var(--color-error)',
                fontSize: '0.85rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}>
                <AlertCircle size={16} />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleEditAdmin}>
              <div className="form-group">
                <label className="form-label">{t('name')}</label>
                <div style={{ position: 'relative' }}>
                  <span style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)', display: 'flex' }}>
                    <User size={16} />
                  </span>
                  <input
                    type="text"
                    required
                    name="name"
                    className="form-input"
                    value={formData.name}
                    onChange={handleInputChange}
                    style={{ paddingLeft: '2.5rem' }}
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">{t('emailLabel')}</label>
                <div style={{ position: 'relative' }}>
                  <span style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)', display: 'flex' }}>
                    <Mail size={16} />
                  </span>
                  <input
                    type="email"
                    required
                    name="email"
                    className="form-input"
                    value={formData.email}
                    onChange={handleInputChange}
                    style={{ paddingLeft: '2.5rem' }}
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">{t('password')} ({lang === 'en' ? 'Leave blank to keep current' : 'ચાલુ રાખવા માટે ખાલી રાખો'})</label>
                <div style={{ position: 'relative' }}>
                  <span style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)', display: 'flex' }}>
                    <Lock size={16} />
                  </span>
                  <input
                    type="password"
                    name="password"
                    className="form-input"
                    placeholder="Enter new password to change"
                    value={formData.password}
                    onChange={handleInputChange}
                    style={{ paddingLeft: '2.5rem' }}
                    minLength={6}
                  />
                </div>
              </div>

              {editingAdmin && editingAdmin.role !== 'super_admin' && (
                <div className="form-group" style={{ marginTop: '1.25rem', marginBottom: '1.5rem' }}>
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      name="enabled"
                      checked={formData.enabled}
                      onChange={handleInputChange}
                    />
                    <span>{t('statusLabel')} (Enabled)</span>
                  </label>
                </div>
              )}

              <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end', marginTop: '2rem' }}>
                <button 
                  type="button" 
                  onClick={() => { setShowEditModal(false); setEditingAdmin(null); }} 
                  className="btn btn-secondary"
                  disabled={submitting}
                >
                  {t('cancel')}
                </button>
                <button 
                  type="submit" 
                  className="btn btn-primary"
                  disabled={submitting}
                >
                  {submitting ? '...' : t('saveChanges')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
