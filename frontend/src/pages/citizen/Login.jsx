import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authAPI } from '../../api';
import { useAuth } from '../../context/AuthContext';

const Login = () => {
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
      login(data.user, data.token);
      navigate(data.user.role === 'admin' ? '/admin' : '/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const fillDemo = (type) => {
    if (type === 'citizen') setForm({ email: 'citizen@test.com', password: 'Test@123' });
    if (type === 'admin')   setForm({ email: 'admin@civic.gov',  password: 'Admin@123' });
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-header">
          <div className="auth-logo">🏛️</div>
          <h1 className="auth-title">Welcome Back</h1>
          <p className="auth-sub">Sign in to your CivicFix account</p>
        </div>

        {/* Demo Fill Buttons */}
        <div style={{ display: 'flex', gap: '8px', marginBottom: '20px' }}>
          <button type="button" className="btn btn-secondary btn-sm" style={{ flex: 1 }}
            onClick={() => fillDemo('citizen')}>👤 Demo Citizen</button>
          <button type="button" className="btn btn-secondary btn-sm" style={{ flex: 1 }}
            onClick={() => fillDemo('admin')}>🛡️ Demo Admin</button>
        </div>

        {error && <div className="alert alert-error" style={{ marginBottom: '20px' }}>{error}</div>}

        <form className="auth-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label" htmlFor="login-email">Email Address</label>
            <input
              id="login-email" name="email" type="email"
              className="form-input" placeholder="you@example.com"
              value={form.email} onChange={handleChange} required
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="login-password">Password</label>
            <input
              id="login-password" name="password" type="password"
              className="form-input" placeholder="Your password"
              value={form.password} onChange={handleChange} required
            />
          </div>

          <button type="submit" className="btn btn-primary btn-lg btn-full" disabled={loading}>
            {loading ? 'Signing in…' : '🔐 Sign In'}
          </button>
        </form>

        <div className="auth-divider">
          New to CivicFix? <Link to="/register">Create an account</Link>
        </div>
      </div>
    </div>
  );
};

export default Login;
