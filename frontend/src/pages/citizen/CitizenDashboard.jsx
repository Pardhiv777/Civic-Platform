import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { issuesAPI } from '../../api';
import { useAuth } from '../../context/AuthContext';
import IssueCard from '../../components/IssueCard';

const CitizenDashboard = () => {
  const { user } = useAuth();
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    issuesAPI.getMine()
      .then(({ data }) => setIssues(data.issues))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const countByStatus = (status) => issues.filter((i) => i.status === status).length;

  const stats = [
    { label: 'Total Reported',  value: issues.length,             color: 'accent',  icon: '📋' },
    { label: 'Open Issues',     value: countByStatus('Open'),     color: 'danger',  icon: '🔴' },
    { label: 'In Progress',     value: countByStatus('In Progress'), color: 'warning', icon: '🟡' },
    { label: 'Resolved',        value: countByStatus('Resolved'), color: 'success', icon: '🟢' },
  ];

  const recentIssues = [...issues].slice(0, 3);

  return (
    <div className="page-wrapper">
      <div className="container">
        <div className="page-header">
          <h1 className="page-title">Welcome, {user?.name?.split(' ')[0]} 👋</h1>
          <p className="page-sub">Track all your reported civic issues and their resolution status.</p>
        </div>

        {/* Quick Actions */}
        <div style={{ display: 'flex', gap: '12px', marginBottom: '32px', flexWrap: 'wrap' }}>
          <Link to="/submit" className="btn btn-primary btn-lg">
            ➕ Report New Issue
          </Link>
          <Link to="/my-issues" className="btn btn-secondary btn-lg">
            📋 View All My Reports
          </Link>
        </div>

        {/* Stats */}
        <div className="grid grid-4" style={{ gap: '16px', marginBottom: '40px' }}>
          {stats.map((s) => (
            <div key={s.label} className={`stat-card ${s.color}`}>
              <div className="stat-card-icon">{s.icon}</div>
              <div className="stat-card-value">{s.value}</div>
              <div className="stat-card-label">{s.label}</div>
            </div>
          ))}
        </div>

        {/* Recent Issues */}
        <div style={{ marginBottom: '16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <h2 style={{ fontSize: '1.1rem', fontWeight: 700 }}>Recent Reports</h2>
          <Link to="/my-issues" style={{ fontSize: '0.875rem', color: 'var(--accent)' }}>
            View all →
          </Link>
        </div>

        {loading ? (
          <div className="loading-spinner" />
        ) : recentIssues.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">📭</div>
            <h3>No issues reported yet</h3>
            <p>Be the first to report a civic problem in your area.</p>
            <Link to="/submit" className="btn btn-primary" style={{ marginTop: '16px' }}>
              Report Your First Issue
            </Link>
          </div>
        ) : (
          <div className="grid grid-3" style={{ gap: '16px' }}>
            {recentIssues.map((issue) => (
              <IssueCard key={issue._id} issue={issue} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default CitizenDashboard;
