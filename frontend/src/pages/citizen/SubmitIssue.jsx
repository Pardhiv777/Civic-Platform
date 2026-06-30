import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { issuesAPI } from '../../api';
import { uploadPhoto } from '../../firebase';
import MapPicker from '../../components/MapPicker';

const CATEGORIES = ['Road', 'Water', 'Electricity', 'Garbage'];

const CATEGORY_ICONS = {
  Road: '🛣️', Water: '💧', Electricity: '⚡', Garbage: '🗑️',
};

const SubmitIssue = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    title: '', description: '', category: 'Road',
  });
  const [photo, setPhoto] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [location, setLocation] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 10 * 1024 * 1024) {
      setError('Photo must be under 10MB.');
      return;
    }
    setPhoto(file);
    setPhotoPreview(URL.createObjectURL(file));
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!form.title.trim()) return setError('Title is required.');
    if (!form.description.trim()) return setError('Description is required.');

    setLoading(true);
    try {
      let photoURL = null;

      // Upload photo to Firebase if selected
      if (photo) {
        setUploadProgress(1);
        photoURL = await uploadPhoto(photo, setUploadProgress);
        setUploadProgress(100);
      }

      // Create issue via API
      await issuesAPI.create({
        title: form.title.trim(),
        description: form.description.trim(),
        category: form.category,
        photoURL,
        location: location || { lat: null, lng: null, address: '' },
      });

      setSuccess(true);
      setTimeout(() => navigate('/my-issues'), 2000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit issue. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="page-wrapper">
        <div className="container" style={{ maxWidth: 480, paddingTop: 80 }}>
          <div className="card" style={{ textAlign: 'center', padding: '48px' }}>
            <div style={{ fontSize: '4rem', marginBottom: '16px' }}>✅</div>
            <h2>Issue Submitted!</h2>
            <p style={{ marginTop: '8px' }}>Your report has been submitted. Redirecting to your issues…</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="page-wrapper">
      <div className="container" style={{ maxWidth: 720 }}>
        <div className="page-header">
          <h1 className="page-title">Report a Civic Issue</h1>
          <p className="page-sub">Help your community by reporting problems that need official attention.</p>
        </div>

        {error && <div className="alert alert-error" style={{ marginBottom: '20px' }}>{error}</div>}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {/* Title */}
          <div className="form-group">
            <label className="form-label" htmlFor="issue-title">Issue Title *</label>
            <input
              id="issue-title" name="title" type="text"
              className="form-input" placeholder="e.g. Large pothole on MG Road"
              value={form.title} onChange={handleChange} required maxLength={100}
            />
          </div>

          {/* Category */}
          <div className="form-group">
            <label className="form-label">Category *</label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '10px' }}>
              {CATEGORIES.map((cat) => (
                <label key={cat} style={{
                  display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px',
                  padding: '14px 10px',
                  background: form.category === cat ? 'var(--accent-dim)' : 'var(--bg-tertiary)',
                  border: `2px solid ${form.category === cat ? 'var(--accent)' : 'var(--border)'}`,
                  borderRadius: 'var(--radius-md)', cursor: 'pointer', transition: 'var(--transition)',
                }}>
                  <input
                    type="radio" name="category" value={cat}
                    checked={form.category === cat}
                    onChange={handleChange} style={{ display: 'none' }}
                  />
                  <span style={{ fontSize: '1.5rem' }}>{CATEGORY_ICONS[cat]}</span>
                  <span style={{ fontSize: '0.8rem', fontWeight: 600, color: form.category === cat ? 'var(--accent)' : 'var(--text-secondary)' }}>
                    {cat}
                  </span>
                </label>
              ))}
            </div>
          </div>

          {/* Description */}
          <div className="form-group">
            <label className="form-label" htmlFor="issue-desc">Description *</label>
            <textarea
              id="issue-desc" name="description"
              className="form-input form-textarea"
              placeholder="Describe the issue in detail — location specifics, how long it's been there, impact on residents…"
              value={form.description} onChange={handleChange} required maxLength={1000}
              style={{ minHeight: '120px' }}
            />
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textAlign: 'right' }}>
              {form.description.length}/1000
            </span>
          </div>

          {/* Photo Upload */}
          <div className="form-group">
            <label className="form-label">Photo (optional)</label>
            {photoPreview ? (
              <div style={{ position: 'relative' }}>
                <img src={photoPreview} alt="Preview" className="photo-preview" />
                <button
                  type="button" className="btn btn-danger btn-sm"
                  style={{ marginTop: '8px' }}
                  onClick={() => { setPhoto(null); setPhotoPreview(null); }}
                >
                  Remove Photo
                </button>
              </div>
            ) : (
              <div className="photo-upload-area">
                <input type="file" accept="image/*" onChange={handlePhotoChange} id="photo-upload" />
                <div className="photo-upload-icon">📷</div>
                <div className="photo-upload-text">
                  <strong>Click to upload</strong> or drag a photo here<br />
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Max 10MB — JPG, PNG, WEBP</span>
                </div>
              </div>
            )}
            {uploadProgress > 0 && uploadProgress < 100 && (
              <div style={{ marginTop: '8px' }}>
                <div style={{ height: 4, background: 'var(--border)', borderRadius: 4 }}>
                  <div style={{ height: '100%', width: `${uploadProgress}%`, background: 'var(--accent)', borderRadius: 4, transition: 'width 0.3s' }} />
                </div>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Uploading… {uploadProgress}%</span>
              </div>
            )}
          </div>

          {/* Map */}
          <div className="form-group">
            <label className="form-label">Pin Location (optional)</label>
            <MapPicker value={location} onChange={setLocation} />
          </div>

          {/* Submit */}
          <div style={{ display: 'flex', gap: '12px', paddingBottom: '40px' }}>
            <button type="submit" className="btn btn-primary btn-lg" disabled={loading} style={{ flex: 1 }}>
              {loading ? 'Submitting…' : '📤 Submit Issue'}
            </button>
            <button type="button" className="btn btn-secondary btn-lg"
              onClick={() => navigate('/dashboard')} disabled={loading}>
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SubmitIssue;
