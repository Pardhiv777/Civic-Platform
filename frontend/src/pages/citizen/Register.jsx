import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authAPI } from '../../api';
import { useAuth } from '../../context/AuthContext';

const Register = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [form, setForm] = useState({ name: '', email: '', password: '', confirmPassword: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (form.password !== form.confirmPassword) {
      return setError('Passwords do not match.');
    }
    if (form.password.length < 6) {
      return setError('Password must be at least 6 characters.');
    }

    setLoading(true);
    try {
      const { data } = await authAPI.register({
        name: form.name, email: form.email, password: form.password,
      });
      login(data.user, data.token);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-header">
          <div className="auth-logo">🏛️</div>
          <h1 className="auth-title">Create Account</h1>
          <p className="auth-sub">Join CivicFix and report issues in your community</p>
        </div>

        {error && <div className="alert alert-error" style={{ marginBottom: '20px' }}>{error}</div>}

        <form className="auth-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label" htmlFor="name">Full Name</label>
            <input
              id="name" name="name" type="text"
              className="form-input" placeholder="Ravi Kumar"
              value={form.name} onChange={handleChange} required
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="email">Email Address</label>
            <input
              id="email" name="email" type="email"
              className="form-input" placeholder="you@example.com"
              value={form.email} onChange={handleChange} required
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="password">Password</label>
            <input
              id="password" name="password" type="password"
              className="form-input" placeholder="Min. 6 characters"
              value={form.password} onChange={handleChange} required
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="confirmPassword">Confirm Password</label>
            <input
              id="confirmPassword" name="confirmPassword" type="password"
              className="form-input" placeholder="Repeat your password"
              value={form.confirmPassword} onChange={handleChange} required
            />
          </div>

          <button type="submit" className="btn btn-primary btn-lg btn-full" disabled={loading}>
            {loading ? 'Creating account…' : '🚀 Create Account'}
          </button>
        </form>

        <div className="auth-divider">
          Already have an account? <Link to="/login">Sign in</Link>
        </div>
      </div>
    </div>
  );
};

export default Register;
