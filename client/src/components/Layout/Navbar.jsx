import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { getInitials, stringToColor } from '../../utils/helpers';
import { HiOutlineMenu, HiOutlineX, HiOutlineLogout, HiOutlineUser } from 'react-icons/hi';
import './Navbar.css';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [showMenu, setShowMenu] = useState(false);
  const [showProfile, setShowProfile] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navLinks = [
    { path: '/dashboard', label: 'Dashboard' },
    { path: '/projects', label: 'Projects' },
  ];

  return (
    <nav className="navbar">
      <div className="navbar-inner">
        <div className="navbar-left">
          <Link to="/dashboard" className="navbar-brand">
            <div className="navbar-logo">
              <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
                <rect width="28" height="28" rx="8" fill="url(#logo-gradient)" />
                <path d="M8 14L12 18L20 10" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                <defs>
                  <linearGradient id="logo-gradient" x1="0" y1="0" x2="28" y2="28">
                    <stop stopColor="#6366f1" />
                    <stop offset="1" stopColor="#a78bfa" />
                  </linearGradient>
                </defs>
              </svg>
            </div>
            <span className="navbar-title">TaskFlow</span>
          </Link>

          <div className={`navbar-links ${showMenu ? 'active' : ''}`}>
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`navbar-link ${location.pathname === link.path ? 'active' : ''}`}
                onClick={() => setShowMenu(false)}
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>

        <div className="navbar-right">
          <div className="navbar-profile" onClick={() => setShowProfile(!showProfile)}>
            <div
              className="avatar"
              style={{ background: stringToColor(user?.name || 'U') }}
            >
              {getInitials(user?.name || 'U')}
            </div>
            <span className="navbar-username">{user?.name}</span>
          </div>

          {showProfile && (
            <>
              <div className="profile-backdrop" onClick={() => setShowProfile(false)} />
              <div className="profile-dropdown">
                <div className="profile-dropdown-header">
                  <div
                    className="avatar avatar-lg"
                    style={{ background: stringToColor(user?.name || 'U') }}
                  >
                    {getInitials(user?.name || 'U')}
                  </div>
                  <div>
                    <p className="profile-name">{user?.name}</p>
                    <p className="profile-email">{user?.email}</p>
                  </div>
                </div>
                <div className="profile-dropdown-divider" />
                <Link
                  to="/profile"
                  className="profile-dropdown-item"
                  onClick={() => setShowProfile(false)}
                >
                  <HiOutlineUser /> Profile Settings
                </Link>
                <button className="profile-dropdown-item danger" onClick={handleLogout}>
                  <HiOutlineLogout /> Sign Out
                </button>
              </div>
            </>
          )}

          <button
            className="navbar-toggle"
            onClick={() => setShowMenu(!showMenu)}
          >
            {showMenu ? <HiOutlineX size={22} /> : <HiOutlineMenu size={22} />}
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
