import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import {
  Shield,
  LogOut,
  User,
  LayoutDashboard,
  Users,
  Sun,
  Moon,
  Menu,
  X,
} from 'lucide-react';
import { useState } from 'react';

export default function Navbar() {
  const { user, logout } = useAuth();
  const { darkMode, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/" className="navbar-brand">
          <Shield size={28} />
          <span>AI Identity Protector</span>
        </Link>

        <button className="mobile-toggle" onClick={() => setMobileOpen(!mobileOpen)}>
          {mobileOpen ? <X size={24} /> : <Menu size={24} />}
        </button>

        <div className={`navbar-links ${mobileOpen ? 'open' : ''}`}>
          {user ? (
            <>
              <Link to="/dashboard" onClick={() => setMobileOpen(false)}>
                <LayoutDashboard size={18} />
                <span>Dashboard</span>
              </Link>
              {user.role === 'admin' && (
                <Link to="/admin" onClick={() => setMobileOpen(false)}>
                  <Users size={18} />
                  <span>Admin</span>
                </Link>
              )}
              <div className="navbar-user">
                <User size={18} />
                <span>{user.name}</span>
              </div>
              <button className="theme-toggle" onClick={toggleTheme} title="Toggle theme">
                {darkMode ? <Sun size={18} /> : <Moon size={18} />}
              </button>
              <button className="btn btn-outline btn-sm" onClick={handleLogout}>
                <LogOut size={16} />
                <span>Logout</span>
              </button>
            </>
          ) : (
            <>
              <Link to="/login" onClick={() => setMobileOpen(false)}>Login</Link>
              <Link to="/register" className="btn btn-primary btn-sm" onClick={() => setMobileOpen(false)}>
                Sign Up
              </Link>
              <button className="theme-toggle" onClick={toggleTheme} title="Toggle theme">
                {darkMode ? <Sun size={18} /> : <Moon size={18} />}
              </button>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
