import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getInitials = (name = '') =>
    name.split(' ').map((n) => n[0]).slice(0, 2).join('').toUpperCase();

  return (
    <nav className="navbar">
      <div className="navbar-inner">
        {/* Logo */}
        <Link to={isAdmin ? '/admin' : isAuthenticated ? '/dashboard' : '/'} className="navbar-logo">
          <div className="navbar-logo-icon">🏛️</div>
          <span className="navbar-logo-text">Civic<span>Fix</span></span>
        </Link>

        {/* Nav Links */}
        <div className="navbar-links">
          {isAuthenticated && !isAdmin && (
            <>
              <NavLink to="/dashboard" className={({ isActive }) => `navbar-link${isActive ? ' active' : ''}`}>
                Dashboard
              </NavLink>
              <NavLink to="/submit" className={({ isActive }) => `navbar-link${isActive ? ' active' : ''}`}>
                Report Issue
              </NavLink>
              <NavLink to="/my-issues" className={({ isActive }) => `navbar-link${isActive ? ' active' : ''}`}>
                My Reports
              </NavLink>
            </>
          )}
          {isAdmin && (
            <>
              <NavLink to="/admin" className={({ isActive }) => `navbar-link${isActive ? ' active' : ''}`}>
                Dashboard
              </NavLink>
              <NavLink to="/admin/issues" className={({ isActive }) => `navbar-link${isActive ? ' active' : ''}`}>
                All Issues
              </NavLink>
              <NavLink to="/admin/analytics" className={({ isActive }) => `navbar-link${isActive ? ' active' : ''}`}>
                Analytics
              </NavLink>
            </>
          )}
        </div>

        {/* User Section */}
        <div className="navbar-user">
          {isAuthenticated ? (
            <>
              <div className="navbar-avatar" title={user?.name}>
                {getInitials(user?.name)}
              </div>
              <button className="btn btn-ghost btn-sm" onClick={handleLogout}>
                Sign Out
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="btn btn-ghost btn-sm">Login</Link>
              <Link to="/register" className="btn btn-primary btn-sm">Register</Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
