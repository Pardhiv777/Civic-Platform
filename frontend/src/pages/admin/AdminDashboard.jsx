import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { issuesAPI } from '../../api';
import { StatusBadge, CategoryBadge } from '../../components/StatusBadge';

const STATUSES = ['All', 'Open', 'In Progress', 'Resolved'];
const CATEGORIES = ['All', 'Road', 'Water', 'Electricity', 'Garbage'];

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [issues, setIssues] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ category: '', status: '', dateFrom: '', dateTo: '' });
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);

  const fetchIssues = async () => {
    setLoading(true);
    try {
      const params = { page, limit: 15 };
      if (filters.category) params.category = filters.category;
      if (filters.status)   params.status   = filters.status;
      if (filters.dateFrom) params.dateFrom  = filters.dateFrom;
      if (filters.dateTo)   params.dateTo    = filters.dateTo;

      const { data } = await issuesAPI.getAll(params);
      setIssues(data.issues);
      setTotal(data.total);
      setPages(data.pages);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchIssues(); }, [filters, page]);

  const handleFilterChange = (e) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
    setPage(1);
  };

  const clearFilters = () => {
    setFilters({ category: '', status: '', dateFrom: '', dateTo: '' });
    setPage(1);
  };

  const formatDate = (d) =>
    new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });

  const openCount   = issues.filter((i) => i.status === 'Open').length;
  const inProgCount = issues.filter((i) => i.status === 'In Progress').length;
  const resCount    = issues.filter((i) => i.status === 'Resolved').length;

  return (
    <div className="page-wrapper">
      <div className="container">
        <div className="page-header">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
            <div>
              <h1 className="page-title">🛡️ Admin Dashboard</h1>
              <p className="page-sub">Manage and resolve civic issues across all categories.</p>
            </div>
            <button className="btn btn-secondary" onClick={() => navigate('/admin/analytics')}>
              📊 View Analytics
            </button>
          </div>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-4" style={{ gap: '16px', marginBottom: '32px' }}>
          {[
            { label: 'Total Issues',  value: total,      color: 'accent',  icon: '📋' },
            { label: 'Open',          value: openCount,  color: 'danger',  icon: '🔴' },
            { label: 'In Progress',   value: inProgCount,color: 'warning', icon: '🟡' },
            { label: 'Resolved',      value: resCount,   color: 'success', icon: '🟢' },
          ].map((s) => (
            <div key={s.label} className={`stat-card ${s.color}`}>
              <div className="stat-card-icon">{s.icon}</div>
              <div className="stat-card-value">{s.value}</div>
              <div className="stat-card-label">{s.label}</div>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div className="filter-bar" style={{ marginBottom: '20px' }}>
          <select id="filter-status" name="status" className="form-input form-select" value={filters.status} onChange={handleFilterChange}>
            <option value="">All Statuses</option>
            {STATUSES.filter((s) => s !== 'All').map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
          <select id="filter-category" name="category" className="form-input form-select" value={filters.category} onChange={handleFilterChange}>
            <option value="">All Categories</option>
            {CATEGORIES.filter((c) => c !== 'All').map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
          <input id="filter-date-from" name="dateFrom" type="date" className="form-input" value={filters.dateFrom} onChange={handleFilterChange} />
          <input id="filter-date-to"   name="dateTo"   type="date" className="form-input" value={filters.dateTo}   onChange={handleFilterChange} />
          <button className="btn btn-ghost btn-sm" onClick={clearFilters}>✕ Clear</button>
        </div>

        {/* Issues Table */}
        {loading ? (
          <div className="loading-spinner" />
        ) : issues.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">🔍</div>
            <h3>No issues found</h3>
            <p>Try adjusting your filters.</p>
          </div>
        ) : (
          <>
            <div className="table-wrapper">
              <table className="table">
                <thead>
                  <tr>
                    <th>Title</th>
                    <th>Category</th>
                    <th>Status</th>
                    <th>Submitted By</th>
                    <th>Date</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {issues.map((issue) => (
                    <tr key={issue._id}>
                      <td className="primary-col" style={{ maxWidth: 240 }}>
                        <span style={{ display: '-webkit-box', WebkitLineClamp: 1, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                          {issue.title}
                        </span>
                      </td>
                      <td><CategoryBadge category={issue.category} /></td>
                      <td><StatusBadge status={issue.status} /></td>
                      <td>{issue.submittedBy?.name || '—'}</td>
                      <td>{formatDate(issue.createdAt)}</td>
                      <td>
                        <button
                          className="btn btn-secondary btn-sm"
                          onClick={() => navigate(`/admin/issues/${issue._id}`)}
                        >
                          View →
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {pages > 1 && (
              <div className="pagination">
                <button
                  className="btn btn-secondary btn-sm"
                  disabled={page <= 1}
                  onClick={() => setPage(page - 1)}
                >
                  ← Prev
                </button>
                <span style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                  Page {page} of {pages}
                </span>
                <button
                  className="btn btn-secondary btn-sm"
                  disabled={page >= pages}
                  onClick={() => setPage(page + 1)}
                >
                  Next →
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
