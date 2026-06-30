import { useNavigate } from 'react-router-dom';
import { StatusBadge, CategoryBadge } from './StatusBadge';

const IssueCard = ({ issue, isAdmin = false, onStatusChange }) => {
  const navigate = useNavigate();

  const formatDate = (dateStr) =>
    new Date(dateStr).toLocaleDateString('en-IN', {
      day: 'numeric', month: 'short', year: 'numeric',
    });

  const handleClick = () => {
    if (isAdmin) navigate(`/admin/issues/${issue._id}`);
  };

  return (
    <div className="issue-card" onClick={handleClick} role={isAdmin ? 'button' : undefined}>
      {issue.photoURL && (
        <img src={issue.photoURL} alt={issue.title} className="issue-card-photo" />
      )}

      <div className="issue-card-header">
        <h4 className="issue-card-title">{issue.title}</h4>
        <StatusBadge status={issue.status} />
      </div>

      <p className="issue-card-desc">{issue.description}</p>

      <div className="issue-card-meta">
        <CategoryBadge category={issue.category} />
        {issue.location?.address && (
          <span>📍 {issue.location.address}</span>
        )}
        <span>📅 {formatDate(issue.createdAt)}</span>
        {isAdmin && issue.submittedBy?.name && (
          <span>👤 {issue.submittedBy.name}</span>
        )}
      </div>
    </div>
  );
};

export default IssueCard;
