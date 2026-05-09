import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  Shield,
  Lock,
  Bell,
  Users,
  Eye,
  Zap,
  ArrowRight,
} from 'lucide-react';

export default function Home() {
  const { user } = useAuth();

  const features = [
    {
      icon: Lock,
      title: 'Secure Authentication',
      description: 'JWT-based auth with bcrypt password hashing, rate limiting, and account lockout protection.',
    },
    {
      icon: Eye,
      title: 'Access Monitoring',
      description: 'Every unauthorized access attempt is logged with IP, device info, and timestamps.',
    },
    {
      icon: Bell,
      title: 'Real-time Alerts',
      description: 'Instant security alerts for failed logins, brute force attempts, and unauthorized access.',
    },
    {
      icon: Users,
      title: 'Admin Dashboard',
      description: 'Full admin panel to manage users, view login logs, and monitor security alerts.',
    },
    {
      icon: Shield,
      title: 'Route Protection',
      description: 'Protected routes prevent direct URL access. Unauthorized visitors are detected and logged.',
    },
    {
      icon: Zap,
      title: 'Brute Force Detection',
      description: 'Automatic account lockout after repeated failed attempts with admin notifications.',
    },
  ];

  return (
    <div className="home-page">
      <section className="hero">
        <div className="hero-content">
          <div className="hero-badge">
            <Shield size={16} />
            Enterprise-Grade Security
          </div>
          <h1>AI Digital Identity<br />Protector</h1>
          <p>
            A comprehensive security platform that monitors, detects, and protects
            against unauthorized access attempts in real-time.
          </p>
          <div className="hero-actions">
            {user ? (
              <Link to="/dashboard" className="btn btn-primary btn-lg">
                Go to Dashboard <ArrowRight size={20} />
              </Link>
            ) : (
              <>
                <Link to="/register" className="btn btn-primary btn-lg">
                  Get Started <ArrowRight size={20} />
                </Link>
                <Link to="/login" className="btn btn-outline btn-lg">
                  Sign In
                </Link>
              </>
            )}
          </div>
        </div>
      </section>

      <section className="features">
        <h2>Security Features</h2>
        <div className="features-grid">
          {features.map((feature) => (
            <div key={feature.title} className="feature-card">
              <feature.icon size={32} className="feature-icon" />
              <h3>{feature.title}</h3>
              <p>{feature.description}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
