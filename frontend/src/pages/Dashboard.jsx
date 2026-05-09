import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { userAPI } from '../services/api';
import AlertBanner from '../components/AlertBanner';
import {
  User,
  Mail,
  Calendar,
  Clock,
  Activity,
  Shield,
  Edit3,
  Save,
  X,
  Monitor,
  Globe,
  Smartphone,
} from 'lucide-react';

export default function Dashboard() {
  const { user, fetchProfile } = useAuth();
  const [activity, setActivity] = useState([]);
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(user?.name || '');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadActivity = async () => {
      try {
        const res = await userAPI.getActivity();
        setActivity(res.data.data);
      } catch {
        // silently fail
      } finally {
        setLoading(false);
      }
    };
    loadActivity();
  }, []);

  const handleSave = async () => {
    try {
      await userAPI.updateProfile({ name });
      await fetchProfile();
      setEditing(false);
      setMessage('Profile updated successfully');
      setError('');
    } catch {
      setError('Failed to update profile');
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return 'Never';
    return new Date(dateStr).toLocaleString();
  };

  const actionLabels = {
    login_success: { label: 'Login', className: 'badge-success' },
    login_failed: { label: 'Failed Login', className: 'badge-danger' },
    logout: { label: 'Logout', className: 'badge-neutral' },
    register: { label: 'Registered', className: 'badge-info' },
  };

  return (
    <div className="dashboard-page">
      <div className="page-header">
        <h1>
          <Shield size={28} />
          Dashboard
        </h1>
        <p>Welcome back, {user?.name}!</p>
      </div>

      {message && <AlertBanner type="success" message={message} onClose={() => setMessage('')} />}
      {error && <AlertBanner type="error" message={error} onClose={() => setError('')} />}

      <div className="dashboard-grid">
        <div className="card profile-card">
          <div className="card-header">
            <h2>
              <User size={20} />
              Profile Information
            </h2>
            {!editing && (
              <button className="btn btn-ghost btn-sm" onClick={() => setEditing(true)}>
                <Edit3 size={16} />
                Edit
              </button>
            )}
          </div>
          <div className="card-body">
            <div className="profile-info">
              <div className="profile-avatar">
                {user?.name?.charAt(0).toUpperCase()}
              </div>
              <div className="profile-details">
                {editing ? (
                  <div className="edit-form">
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="edit-input"
                    />
                    <div className="edit-actions">
                      <button className="btn btn-primary btn-sm" onClick={handleSave}>
                        <Save size={14} /> Save
                      </button>
                      <button className="btn btn-ghost btn-sm" onClick={() => { setEditing(false); setName(user?.name); }}>
                        <X size={14} /> Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <h3>{user?.name}</h3>
                )}
                <p className="profile-meta">
                  <Mail size={14} /> {user?.email}
                </p>
                <p className="profile-meta">
                  <Calendar size={14} /> Joined {formatDate(user?.createdAt)}
                </p>
                <p className="profile-meta">
                  <Clock size={14} /> Last login {formatDate(user?.lastLogin)}
                </p>
                <span className={`badge ${user?.role === 'admin' ? 'badge-info' : 'badge-success'}`}>
                  {user?.role?.toUpperCase()}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="card activity-card">
          <div className="card-header">
            <h2>
              <Activity size={20} />
              Recent Activity
            </h2>
          </div>
          <div className="card-body">
            {loading ? (
              <div className="loading-inline"><div className="spinner" /></div>
            ) : activity.length === 0 ? (
              <p className="empty-state">No activity recorded yet.</p>
            ) : (
              <div className="activity-list">
                {activity.map((log) => {
                  const info = actionLabels[log.action] || { label: log.action, className: 'badge-neutral' };
                  return (
                    <div key={log._id} className="activity-item">
                      <div className="activity-main">
                        <span className={`badge ${info.className}`}>{info.label}</span>
                        <span className="activity-time">{formatDate(log.timestamp)}</span>
                      </div>
                      <div className="activity-details">
                        {log.deviceInfo && (
                          <>
                            <span><Globe size={12} /> {log.ipAddress}</span>
                            <span><Monitor size={12} /> {log.deviceInfo.browser}</span>
                            <span><Smartphone size={12} /> {log.deviceInfo.os}</span>
                          </>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
