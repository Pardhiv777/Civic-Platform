import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { issuesAPI } from '../../api';
import IssueCard from '../../components/IssueCard';
import { StatusBadge, CategoryBadge } from '../../components/StatusBadge';

const STATUSES = ['All', 'Open', 'In Progress', 'Resolved'];
const CATEGORIES = ['All', 'Road', 'Water', 'Electricity', 'Garbage'];

const MyIssues = () => {
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('All');
  const [categoryFilter, setCategoryFilter] = useState('All');

  useEffect(() => {
    issuesAPI.getMine()
      .then(({ data }) => setIssues(data.issues))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const filtered = issues.filter((i) => {
    const matchStatus = statusFilter === 'All' || i.status === statusFilter;
    const matchCat = categoryFilter === 'All' || i.category === categoryFilter;
    return matchStatus && matchCat;
  });

  return (
    <div className="page-wrapper">
      <div className="container">
        <div className="page-header">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
            <div>
              <h1 className="page-title">My Reports</h1>
              <p className="page-sub">All civic issues you have submitted — {issues.length} total</p>
            </div>
            <Link to="/submit" className="btn btn-primary">➕ Report New Issue</Link>
          </div>
        </div>

        {/* Filters */}
        <div className="filter-bar">
          <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>Filter by:</span>
          <select
            id="status-filter"
            className="form-input form-select"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            {STATUSES.map((s) => <option key={s} value={s}>{s === 'All' ? 'All Statuses' : s}</option>)}
          </select>
          <select
            id="category-filter"
            className="form-input form-select"
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
          >
            {CATEGORIES.map((c) => <option key={c} value={c}>{c === 'All' ? 'All Categories' : c}</option>)}
          </select>
        </div>

        {loading ? (
          <div className="loading-spinner" />
        ) : filtered.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">{issues.length === 0 ? '📭' : '🔍'}</div>
            <h3>{issues.length === 0 ? 'No issues yet' : 'No matches found'}</h3>
            <p>{issues.length === 0
              ? 'You haven\'t reported any civic issues yet.'
              : 'Try adjusting your filters.'}
            </p>
            {issues.length === 0 && (
              <Link to="/submit" className="btn btn-primary" style={{ marginTop: '16px' }}>
                Report First Issue
              </Link>
            )}
          </div>
        ) : (
          <div className="grid grid-3" style={{ gap: '16px' }}>
            {filtered.map((issue) => (
              <IssueCard key={issue._id} issue={issue} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyIssues;
