import { useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { issuesAPI } from '../../api';
import { StatusBadge, CategoryBadge } from '../../components/StatusBadge';

const STATUSES = ['Open', 'In Progress', 'Resolved'];

const IssueDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const mapRef = useRef(null);
  const mapInitRef = useRef(false);

  const [issue, setIssue] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [newStatus, setNewStatus] = useState('');
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => {
    issuesAPI.getById(id)
      .then(({ data }) => {
        setIssue(data.issue);
        setNewStatus(data.issue.status);
      })
      .catch(() => setError('Issue not found.'))
      .finally(() => setLoading(false));
  }, [id]);

  // Init map when issue loads
  useEffect(() => {
    if (!issue?.location?.lat || mapInitRef.current) return;

    import('leaflet').then((L) => {
      if (mapInitRef.current || !mapRef.current) return;
      mapInitRef.current = true;

      delete L.Icon.Default.prototype._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
        iconUrl:       'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
        shadowUrl:     'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
      });

      const map = L.map(mapRef.current).setView([issue.location.lat, issue.location.lng], 14);
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors',
      }).addTo(map);
      L.marker([issue.location.lat, issue.location.lng])
        .addTo(map)
        .bindPopup(issue.title)
        .openPopup();
    });
  }, [issue]);

  const handleStatusUpdate = async () => {
    if (newStatus === issue.status) return;
    setUpdating(true);
    setError('');
    setSuccessMsg('');
    try {
      const { data } = await issuesAPI.updateStatus(id, newStatus);
      setIssue(data.issue);
      setSuccessMsg(`Status updated to "${newStatus}" successfully.`);
    } catch (err) {
      setError('Failed to update status. Please try again.');
    } finally {
      setUpdating(false);
    }
  };

  const formatDate = (d) => d
    ? new Date(d).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })
    : '—';

  if (loading) return <div className="page-wrapper"><div className="container"><div className="loading-spinner" /></div></div>;

  if (!issue) return (
    <div className="page-wrapper">
      <div className="container">
        <div className="empty-state">
          <div className="empty-state-icon">❌</div>
          <h3>Issue not found</h3>
          <button className="btn btn-secondary" onClick={() => navigate('/admin/issues')}>← Back</button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="page-wrapper">
      <div className="container" style={{ maxWidth: 800 }}>
        {/* Back */}
        <button className="btn btn-ghost btn-sm" onClick={() => navigate('/admin/issues')} style={{ marginBottom: '20px' }}>
          ← Back to All Issues
        </button>

        {/* Header */}
        <div className="card" style={{ marginBottom: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '12px', flexWrap: 'wrap', marginBottom: '16px' }}>
            <div>
              <h1 style={{ fontSize: '1.4rem', marginBottom: '8px' }}>{issue.title}</h1>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                <CategoryBadge category={issue.category} />
                <StatusBadge status={issue.status} />
              </div>
            </div>
          </div>

          <p style={{ color: 'var(--text-secondary)', lineHeight: 1.7, marginBottom: '20px' }}>
            {issue.description}
          </p>

          {/* Meta */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '16px', paddingTop: '16px', borderTop: '1px solid var(--border)' }}>
            {[
              { label: 'Submitted By', value: issue.submittedBy?.name || '—' },
              { label: 'Email',        value: issue.submittedBy?.email || '—' },
              { label: 'Submitted On', value: formatDate(issue.createdAt) },
              { label: 'Resolved On',  value: formatDate(issue.resolvedAt) },
              { label: 'Location',     value: issue.location?.address || 'Not specified' },
            ].map(({ label, value }) => (
              <div key={label}>
                <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '4px' }}>
                  {label}
                </div>
                <div style={{ fontSize: '0.875rem', color: 'var(--text-primary)' }}>{value}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Photo */}
        {issue.photoURL && (
          <div className="card" style={{ marginBottom: '20px' }}>
            <h3 style={{ marginBottom: '16px', fontSize: '0.9rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Submitted Photo
            </h3>
            <img src={issue.photoURL} alt="Issue" style={{ width: '100%', maxHeight: '400px', objectFit: 'cover', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)' }} />
          </div>
        )}

        {/* Map */}
        {issue.location?.lat && (
          <div className="card" style={{ marginBottom: '20px' }}>
            <h3 style={{ marginBottom: '16px', fontSize: '0.9rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Issue Location
            </h3>
            <div className="map-container" style={{ height: '260px' }}>
              <div ref={mapRef} style={{ width: '100%', height: '100%' }} />
            </div>
          </div>
        )}

        {/* Status Update */}
        <div className="card">
          <h3 style={{ marginBottom: '16px', fontSize: '0.9rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Update Status
          </h3>

          {error   && <div className="alert alert-error"   style={{ marginBottom: '16px' }}>{error}</div>}
          {successMsg && <div className="alert alert-success" style={{ marginBottom: '16px' }}>{successMsg}</div>}

          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            {STATUSES.map((s) => (
              <label key={s} style={{
                display: 'flex', alignItems: 'center', gap: '8px',
                padding: '10px 18px',
                background: newStatus === s ? 'var(--accent-dim)' : 'var(--bg-tertiary)',
                border: `2px solid ${newStatus === s ? 'var(--accent)' : 'var(--border)'}`,
                borderRadius: 'var(--radius-md)', cursor: 'pointer', transition: 'var(--transition)',
                fontSize: '0.875rem', fontWeight: 600,
                color: newStatus === s ? 'var(--accent)' : 'var(--text-secondary)',
              }}>
                <input type="radio" name="new-status" value={s}
                  checked={newStatus === s}
                  onChange={() => setNewStatus(s)}
                  style={{ display: 'none' }}
                />
                {s === 'Open' ? '🔴' : s === 'In Progress' ? '🟡' : '🟢'} {s}
              </label>
            ))}
          </div>

          <button
            className="btn btn-primary"
            style={{ marginTop: '16px' }}
            onClick={handleStatusUpdate}
            disabled={updating || newStatus === issue.status}
          >
            {updating ? 'Updating…' : '✅ Apply Status Change'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default IssueDetail;
