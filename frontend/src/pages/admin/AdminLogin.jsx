import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authAPI } from '../../api';
import { useAuth } from '../../context/AuthContext';

const AdminLogin = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const { data } = await authAPI.login(form);
      if (data.user.role !== 'admin') {
        setError('This login is for officials only. Citizens please use the main login.');
        setLoading(false);
        return;
      }
      login(data.user, data.token);
      navigate('/admin');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-header">
          <div className="auth-logo">🛡️</div>
          <h1 className="auth-title">Official Portal</h1>
          <p className="auth-sub">Sign in as a civic official to manage and resolve reports</p>
        </div>

        <div className="alert alert-info" style={{ marginBottom: '20px', fontSize: '0.8rem' }}>
          🔒 This portal is restricted to authorized civic officials only.
        </div>

        {error && <div className="alert alert-error" style={{ marginBottom: '20px' }}>{error}</div>}

        <form className="auth-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label" htmlFor="admin-email">Official Email</label>
            <input
              id="admin-email" name="email" type="email"
              className="form-input" placeholder="official@civic.gov"
              value={form.email} onChange={handleChange} required
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="admin-password">Password</label>
            <input
              id="admin-password" name="password" type="password"
              className="form-input" placeholder="Your password"
              value={form.password} onChange={handleChange} required
            />
          </div>

          <button
            type="button"
            className="btn btn-secondary btn-sm"
            onClick={() => setForm({ email: 'admin@civic.gov', password: 'Admin@123' })}
            style={{ width: '100%', justifyContent: 'center' }}
          >
            🧪 Fill Demo Admin Credentials
          </button>

          <button type="submit" className="btn btn-primary btn-lg btn-full" disabled={loading}>
            {loading ? 'Signing in…' : '🛡️ Sign In as Official'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AdminLogin;
