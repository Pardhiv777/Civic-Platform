import { useEffect, useState } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line, PieChart, Pie, Cell, Legend,
} from 'recharts';
import { issuesAPI } from '../../api';

const COLORS = {
  Road: '#e36767', Water: '#5ba4cf', Electricity: '#e3c267', Garbage: '#6dbb6d',
};

const STATUS_COLORS = {
  Open: '#f85149', 'In Progress': '#d29922', Resolved: '#3fb950',
};

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div style={{
        background: 'var(--bg-elevated)', border: '1px solid var(--border)',
        borderRadius: 8, padding: '10px 14px', fontSize: '0.85rem',
      }}>
        <p style={{ color: 'var(--text-secondary)', marginBottom: 4 }}>{label}</p>
        {payload.map((p) => (
          <p key={p.name} style={{ color: p.color || 'var(--accent)' }}>
            {p.name}: <strong>{p.value}</strong>
          </p>
        ))}
      </div>
    );
  }
  return null;
};

const Analytics = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    issuesAPI.getAnalytics()
      .then(({ data: res }) => setData(res.analytics))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="page-wrapper">
      <div className="container"><div className="loading-spinner" /></div>
    </div>
  );

  if (!data) return null;

  // Format time series data
  const timeData = data.overTime.map((d) => ({
    name: `${d._id.day}/${d._id.month}`,
    Issues: d.count,
  }));

  // Format category data
  const catData = data.byCategory.map((d) => ({
    name: d._id,
    Issues: d.count,
    fill: COLORS[d._id] || '#8b949e',
  }));

  // Status pie data
  const statusData = data.byStatus.map((d) => ({
    name: d._id,
    value: d.count,
    color: STATUS_COLORS[d._id] || '#8b949e',
  }));

  const resolutionRate = data.totalIssues > 0
    ? Math.round((data.totalResolved / data.totalIssues) * 100)
    : 0;

  return (
    <div className="page-wrapper">
      <div className="container">
        <div className="page-header">
          <h1 className="page-title">📊 Analytics</h1>
          <p className="page-sub">Performance metrics and issue trend analysis for your jurisdiction.</p>
        </div>

        {/* Top Stats */}
        <div className="grid grid-4" style={{ gap: '16px', marginBottom: '32px' }}>
          {[
            { label: 'Total Issues',     value: data.totalIssues,     color: 'accent',  icon: '📋' },
            { label: 'Total Resolved',   value: data.totalResolved,   color: 'success', icon: '✅' },
            { label: 'Resolution Rate',  value: `${resolutionRate}%`, color: resolutionRate >= 50 ? 'success' : 'warning', icon: '📈' },
            {
              label: 'Avg. Resolution Time',
              value: data.avgResolutionHours !== null
                ? data.avgResolutionHours < 24
                  ? `${data.avgResolutionHours}h`
                  : `${Math.round(data.avgResolutionHours / 24)}d`
                : '—',
              color: 'accent', icon: '⏱️',
            },
          ].map((s) => (
            <div key={s.label} className={`stat-card ${s.color}`}>
              <div className="stat-card-icon">{s.icon}</div>
              <div className="stat-card-value">{s.value}</div>
              <div className="stat-card-label">{s.label}</div>
            </div>
          ))}
        </div>

        {/* Charts Row 1 */}
        <div className="grid grid-2" style={{ gap: '20px', marginBottom: '20px' }}>
          {/* Issues by Category Bar Chart */}
          <div className="chart-card">
            <div className="chart-title">Issues by Category</div>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={catData} margin={{ top: 4, right: 4, left: -20, bottom: 4 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                <XAxis dataKey="name" tick={{ fill: 'var(--text-muted)', fontSize: 12 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: 'var(--text-muted)', fontSize: 12 }} axisLine={false} tickLine={false} allowDecimals={false} />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.03)' }} />
                <Bar dataKey="Issues" radius={[4, 4, 0, 0]}>
                  {catData.map((entry, i) => (
                    <Cell key={i} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Status Pie Chart */}
          <div className="chart-card">
            <div className="chart-title">Status Breakdown</div>
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie
                  data={statusData}
                  cx="50%" cy="50%"
                  innerRadius={60} outerRadius={90}
                  paddingAngle={4}
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  labelLine={false}
                >
                  {statusData.map((entry, i) => (
                    <Cell key={i} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
                <Legend
                  formatter={(value) => <span style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>{value}</span>}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Time Series */}
        <div className="chart-card">
          <div className="chart-title">Issues Reported — Last 30 Days</div>
          {timeData.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
              No data for the last 30 days
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={timeData} margin={{ top: 4, right: 16, left: -20, bottom: 4 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                <XAxis dataKey="name" tick={{ fill: 'var(--text-muted)', fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: 'var(--text-muted)', fontSize: 11 }} axisLine={false} tickLine={false} allowDecimals={false} />
                <Tooltip content={<CustomTooltip />} />
                <Line
                  type="monotone" dataKey="Issues"
                  stroke="var(--accent)" strokeWidth={2.5}
                  dot={{ r: 4, fill: 'var(--accent)', strokeWidth: 0 }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>
    </div>
  );
};

export default Analytics;
