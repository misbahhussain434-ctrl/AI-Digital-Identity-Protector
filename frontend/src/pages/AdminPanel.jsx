import { useState, useEffect, useCallback } from 'react';
import { adminAPI } from '../services/api';
import AlertBanner from '../components/AlertBanner';
import {
  Users,
  FileText,
  AlertTriangle,
  BarChart3,
  UserX,
  UserCheck,
  Bell,
  CheckCheck,
  Shield,
  Clock,
  Globe,
  Monitor,
} from 'lucide-react';

function StatsCards({ stats }) {
  const cards = [
    { label: 'Total Users', value: stats.totalUsers, icon: Users, color: 'blue' },
    { label: 'Blocked Users', value: stats.blockedUsers, icon: UserX, color: 'red' },
    { label: 'Successful Logins', value: stats.totalLogins, icon: FileText, color: 'green' },
    { label: 'Failed Logins', value: stats.failedLogins, icon: AlertTriangle, color: 'orange' },
    { label: 'Total Alerts', value: stats.totalAlerts, icon: Bell, color: 'purple' },
    { label: 'Critical Alerts', value: stats.criticalAlerts, icon: Shield, color: 'red' },
  ];

  return (
    <div className="stats-grid">
      {cards.map((card) => (
        <div key={card.label} className={`stat-card stat-${card.color}`}>
          <card.icon size={24} />
          <div>
            <h3>{card.value ?? 0}</h3>
            <p>{card.label}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

export default function AdminPanel() {
  const [tab, setTab] = useState('overview');
  const [stats, setStats] = useState({});
  const [users, setUsers] = useState([]);
  const [logs, setLogs] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [logFilter, setLogFilter] = useState('');

  const loadStats = useCallback(async () => {
    try {
      const res = await adminAPI.getStats();
      setStats(res.data.data);
    } catch { /* ignore */ }
  }, []);

  const loadUsers = useCallback(async () => {
    try {
      const res = await adminAPI.getUsers();
      setUsers(res.data.data.users);
    } catch { /* ignore */ }
  }, []);

  const loadLogs = useCallback(async () => {
    try {
      const res = await adminAPI.getLoginLogs(1, logFilter);
      setLogs(res.data.data.logs);
    } catch { /* ignore */ }
  }, [logFilter]);

  const loadAlerts = useCallback(async () => {
    try {
      const res = await adminAPI.getAlerts();
      setAlerts(res.data.data.alerts);
      setUnreadCount(res.data.data.unreadCount);
    } catch { /* ignore */ }
  }, []);

  useEffect(() => {
    const loadAll = async () => {
      setLoading(true);
      await Promise.all([loadStats(), loadUsers(), loadLogs(), loadAlerts()]);
      setLoading(false);
    };
    loadAll();
  }, [loadStats, loadUsers, loadLogs, loadAlerts]);

  const handleBlock = async (userId, email) => {
    try {
      await adminAPI.blockUser(userId);
      setMessage(`User ${email} has been blocked.`);
      await loadUsers();
      await loadAlerts();
    } catch {
      setError('Failed to block user.');
    }
  };

  const handleUnblock = async (userId, email) => {
    try {
      await adminAPI.unblockUser(userId);
      setMessage(`User ${email} has been unblocked.`);
      await loadUsers();
      await loadAlerts();
    } catch {
      setError('Failed to unblock user.');
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await adminAPI.markAllAlertsRead();
      setUnreadCount(0);
      await loadAlerts();
    } catch {
      setError('Failed to mark alerts as read.');
    }
  };

  const formatDate = (d) => (d ? new Date(d).toLocaleString() : 'N/A');

  const severityClass = {
    low: 'badge-success',
    medium: 'badge-warning',
    high: 'badge-danger',
    critical: 'badge-critical',
  };

  const actionLabels = {
    login_success: { label: 'Success', className: 'badge-success' },
    login_failed: { label: 'Failed', className: 'badge-danger' },
    logout: { label: 'Logout', className: 'badge-neutral' },
    register: { label: 'Register', className: 'badge-info' },
  };

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="spinner" />
        <p>Loading admin panel...</p>
      </div>
    );
  }

  return (
    <div className="admin-page">
      <div className="page-header">
        <h1>
          <BarChart3 size={28} />
          Admin Panel
        </h1>
        <p>Monitor security, manage users, and review alerts</p>
      </div>

      {message && <AlertBanner type="success" message={message} onClose={() => setMessage('')} />}
      {error && <AlertBanner type="error" message={error} onClose={() => setError('')} />}

      <div className="admin-tabs">
        {[
          { id: 'overview', label: 'Overview', icon: BarChart3 },
          { id: 'users', label: 'Users', icon: Users },
          { id: 'logs', label: 'Login Logs', icon: FileText },
          { id: 'alerts', label: `Alerts${unreadCount ? ` (${unreadCount})` : ''}`, icon: Bell },
        ].map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            className={`tab-btn ${tab === id ? 'active' : ''}`}
            onClick={() => setTab(id)}
          >
            <Icon size={16} />
            {label}
          </button>
        ))}
      </div>

      {tab === 'overview' && <StatsCards stats={stats} />}

      {tab === 'users' && (
        <div className="card">
          <div className="card-header">
            <h2><Users size={20} /> Registered Users</h2>
          </div>
          <div className="card-body table-wrapper">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Status</th>
                  <th>Joined</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u._id}>
                    <td>{u.name}</td>
                    <td>{u.email}</td>
                    <td><span className={`badge ${u.role === 'admin' ? 'badge-info' : 'badge-neutral'}`}>{u.role}</span></td>
                    <td>
                      <span className={`badge ${u.isBlocked ? 'badge-danger' : 'badge-success'}`}>
                        {u.isBlocked ? 'Blocked' : 'Active'}
                      </span>
                    </td>
                    <td>{formatDate(u.createdAt)}</td>
                    <td>
                      {u.role !== 'admin' && (
                        u.isBlocked ? (
                          <button className="btn btn-sm btn-success" onClick={() => handleUnblock(u._id, u.email)}>
                            <UserCheck size={14} /> Unblock
                          </button>
                        ) : (
                          <button className="btn btn-sm btn-danger" onClick={() => handleBlock(u._id, u.email)}>
                            <UserX size={14} /> Block
                          </button>
                        )
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {tab === 'logs' && (
        <div className="card">
          <div className="card-header">
            <h2><FileText size={20} /> Login Logs</h2>
            <select className="filter-select" value={logFilter} onChange={(e) => setLogFilter(e.target.value)}>
              <option value="">All Actions</option>
              <option value="login_success">Success</option>
              <option value="login_failed">Failed</option>
              <option value="logout">Logout</option>
              <option value="register">Register</option>
            </select>
          </div>
          <div className="card-body table-wrapper">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Action</th>
                  <th>Email</th>
                  <th>IP Address</th>
                  <th>Browser</th>
                  <th>OS</th>
                  <th>Time</th>
                </tr>
              </thead>
              <tbody>
                {logs.map((log) => {
                  const info = actionLabels[log.action] || { label: log.action, className: 'badge-neutral' };
                  return (
                    <tr key={log._id}>
                      <td><span className={`badge ${info.className}`}>{info.label}</span></td>
                      <td>{log.email}</td>
                      <td><Globe size={12} /> {log.ipAddress}</td>
                      <td><Monitor size={12} /> {log.deviceInfo?.browser || 'N/A'}</td>
                      <td>{log.deviceInfo?.os || 'N/A'}</td>
                      <td><Clock size={12} /> {formatDate(log.timestamp)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {tab === 'alerts' && (
        <div className="card">
          <div className="card-header">
            <h2><Bell size={20} /> Security Alerts</h2>
            {unreadCount > 0 && (
              <button className="btn btn-sm btn-outline" onClick={handleMarkAllRead}>
                <CheckCheck size={14} /> Mark All Read
              </button>
            )}
          </div>
          <div className="card-body">
            {alerts.length === 0 ? (
              <p className="empty-state">No security alerts. Everything looks safe!</p>
            ) : (
              <div className="alerts-list">
                {alerts.map((alert) => (
                  <div key={alert._id} className={`alert-item ${!alert.isRead ? 'unread' : ''}`}>
                    <div className="alert-item-header">
                      <span className={`badge ${severityClass[alert.severity] || 'badge-neutral'}`}>
                        {alert.severity?.toUpperCase()}
                      </span>
                      <span className="badge badge-neutral">{alert.type?.replace(/_/g, ' ')}</span>
                      <span className="alert-time">{formatDate(alert.timestamp)}</span>
                    </div>
                    <p className="alert-message">{alert.message}</p>
                    {alert.details && (
                      <div className="alert-details">
                        {alert.details.ipAddress && <span><Globe size={12} /> {alert.details.ipAddress}</span>}
                        {alert.details.targetRoute && <span>Route: {alert.details.targetRoute}</span>}
                        {alert.details.deviceInfo?.browser && (
                          <span><Monitor size={12} /> {alert.details.deviceInfo.browser}</span>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
