import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import './Header.css';

const Header = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [showLoginDropdown, setShowLoginDropdown] = useState(false);
  const [showRegisterDropdown, setShowRegisterDropdown] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest('.dropdown')) {
        setShowLoginDropdown(false);
        setShowRegisterDropdown(false);
        setShowDropdown(false);
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  const isActive = (path) => {
    return location.pathname === path ? 'active' : '';
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  // Enhanced function to render user avatar with initials and profile picture support
  const renderAvatar = (name, size = 32, profilePicture = null) => {
    const initials = name
      ? name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
      : 'U';

    const getAvatarColor = (name) => {
      if (!name) return '#6c757d';

      const colors = [
        '#007bff', '#28a745', '#dc3545', '#ffc107', '#17a2b8',
        '#6f42c1', '#e83e8c', '#fd7e14', '#20c997', '#6610f2'
      ];

      let hash = 0;
      for (let i = 0; i < name.length; i++) {
        hash = name.charCodeAt(i) + ((hash << 5) - hash);
      }

      return colors[Math.abs(hash) % colors.length];
    };

    // Check if we should show profile picture or initials
    const showProfilePic = profilePicture &&
      profilePicture.trim() !== '' &&
      !profilePicture.includes('randomuser.me');

    return (
      <div
        className="user-avatar rounded-circle d-flex align-items-center justify-content-center"
        style={{
          width: `${size}px`,
          height: `${size}px`,
          backgroundColor: showProfilePic ? 'transparent' : getAvatarColor(name),
          color: 'white',
          fontSize: `${Math.max(10, size / 3)}px`,
          fontWeight: '600',
          border: '2px solid #fff',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
          flexShrink: 0,
          overflow: 'hidden',
          marginRight: '8px'
        }}
      >
        {showProfilePic ? (
          <img
            src={profilePicture}
            alt={name}
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover'
            }}
            onError={(e) => {
              e.target.style.display = 'none';
              e.target.parentElement.style.backgroundColor = getAvatarColor(name);
              e.target.parentElement.innerHTML = initials;
            }}
          />
        ) : (
          initials
        )}
      </div>
    );
  };

  return (
    <header className={`header ${isScrolled ? 'scrolled' : ''}`}>
      <nav className="navbar navbar-expand-lg">
        <div className="container">
          {/* Logo */}
          <Link className="navbar-brand" to="/">
            <div className="d-flex align-items-center">
              <div className="logo-icon me-2">
                <i className="bi bi-book-half"></i>
              </div>
              <span className="logo-text">FindTutor</span>
            </div>
          </Link>

          {/* Mobile Toggle Button */}
          <button
            className="navbar-toggler"
            type="button"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-expanded={isMenuOpen}
            aria-label="Toggle navigation"
          >
            <span className="navbar-toggler-icon"></span>
          </button>

          {/* Navigation Links */}
          <div className={`collapse navbar-collapse ${isMenuOpen ? 'show' : ''}`}>
            <ul className="navbar-nav mx-auto">
              <li className="nav-item">
                <Link className={`nav-link ${isActive('/')}`} to="/">
                  Home
                </Link>
              </li>
              <li className="nav-item">
                <Link className={`nav-link ${isActive('/find-teachers')}`} to="/find-teachers">
                  Find Teachers
                </Link>
              </li>
              <li className="nav-item">
                <Link className={`nav-link ${isActive('/student-posts')}`} to="/student-posts">
                  Student Posts
                </Link>
              </li>
              <li className="nav-item">
                <Link className={`nav-link ${isActive('/pricing')}`} to="/pricing">
                  Pricing
                </Link>
              </li>
              <li className="nav-item">
                <Link className={`nav-link ${isActive('/about')}`} to="/about">
                  About
                </Link>
              </li>
              <li className="nav-item">
                <Link className={`nav-link ${isActive('/contact')}`} to="/contact">
                  Contact
                </Link>
              </li>
            </ul>

            {/* Auth Buttons */}
            <div className="auth-buttons d-flex align-items-center gap-3">
              {user ? (
                <div className="dropdown position-relative">
                  <button
                    className="btn btn-link text-dark text-decoration-none d-flex align-items-center user-dropdown-btn"
                    onClick={() => setShowDropdown(!showDropdown)}
                    style={{ border: 'none', background: 'none', padding: '4px 8px' }}
                  >
                    {renderAvatar(user?.name || 'User', 32, user?.profile_picture)}
                    <span className="user-name">{user.name}</span>
                    <i className="bi bi-chevron-down ms-1" style={{ fontSize: '12px' }}></i>
                  </button>
                  {showDropdown && (
                    <div className="dropdown-menu show position-absolute end-0 mt-2">
                      <div className="dropdown-header d-flex align-items-center">
                        {renderAvatar(user?.name || 'User', 24, user?.profile_picture)}
                        <div>
                          <div className="fw-bold">{user.name}</div>
                          <small className="text-muted">{user.email}</small>
                          <div>
                            <span className={`badge ${user.role === 'teacher' ? 'bg-primary' : 'bg-success'} badge-sm`}>
                              {user.role || 'User'}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="dropdown-divider"></div>
                      <Link 
                        className="dropdown-item" 
                        to={user.role === 'teacher' ? '/dashboard/teacher' : '/dashboard/student'}
                        onClick={() => setShowDropdown(false)}
                      >
                        <i className="bi bi-speedometer2 me-2"></i>
                        Dashboard
                      </Link>
                      <Link 
                        className="dropdown-item" 
                        to="/teacher-profile"
                        onClick={() => setShowDropdown(false)}
                      >
                        <i className="bi bi-person me-2"></i>
                        Profile
                      </Link>
                      <Link 
                        className="dropdown-item" 
                        to="/settings"
                        onClick={() => setShowDropdown(false)}
                      >
                        <i className="bi bi-gear me-2"></i>
                        Settings
                      </Link>
                      <div className="dropdown-divider"></div>
                      <button className="dropdown-item text-danger" onClick={handleLogout}>
                        <i className="bi bi-box-arrow-right me-2"></i>
                        Logout
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="d-flex gap-2">
                  <div className="dropdown position-relative">
                    <button 
                      className="btn btn-primary"
                      onClick={() => setShowLoginDropdown(!showLoginDropdown)}
                    >
                      Login
                      <i className="bi bi-chevron-down ms-1" style={{ fontSize: '12px' }}></i>
                    </button>
                    {showLoginDropdown && (
                      <div className="dropdown-menu show position-absolute end-0 mt-2">
                        <Link 
                          className="dropdown-item" 
                          to="/login/student"
                          onClick={() => setShowLoginDropdown(false)}
                        >
                          <i className="bi bi-person me-2"></i>
                          Student Login
                        </Link>
                        <Link 
                          className="dropdown-item" 
                          to="/login/teacher"
                          onClick={() => setShowLoginDropdown(false)}
                        >
                          <i className="bi bi-person-workspace me-2"></i>
                          Teacher Login
                        </Link>
                      </div>
                    )}
                  </div>
                  <div className="dropdown position-relative">
                    <button 
                      className="btn btn-outline-primary"
                      onClick={() => setShowRegisterDropdown(!showRegisterDropdown)}
                    >
                      Register
                      <i className="bi bi-chevron-down ms-1" style={{ fontSize: '12px' }}></i>
                    </button>
                    {showRegisterDropdown && (
                      <div className="dropdown-menu show position-absolute end-0 mt-2">
                        <Link 
                          className="dropdown-item" 
                          to="/register/student"
                          onClick={() => setShowRegisterDropdown(false)}
                        >
                          <i className="bi bi-person me-2"></i>
                          Student Register
                        </Link>
                        <Link 
                          className="dropdown-item" 
                          to="/register/teacher"
                          onClick={() => setShowRegisterDropdown(false)}
                        >
                          <i className="bi bi-person-workspace me-2"></i>
                          Teacher Register
                        </Link>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>

      <style jsx>{`
        .user-dropdown-btn {
          transition: all 0.2s ease;
          border-radius: 25px !important;
          padding: 4px 12px 4px 4px !important;
        }

        .user-dropdown-btn:hover {
          background-color: #f8f9fa !important;
          transform: translateY(-1px);
        }

        .user-name {
          font-weight: 500;
          color: #333 !important;
          margin-left: 4px;
          margin-right: 4px;
        }

        .dropdown-menu {
          min-width: 280px;
          border: none;
          box-shadow: 0 10px 30px rgba(0,0,0,0.15);
          border-radius: 12px;
          padding: 8px 0;
          margin-top: 8px !important;
        }

        .dropdown-header {
          padding: 12px 16px;
          border-bottom: 1px solid #eee;
          margin-bottom: 8px;
          background-color: #f8f9fa;
          border-radius: 12px 12px 0 0;
        }

        .dropdown-item {
          padding: 8px 16px;
          font-size: 14px;
          transition: all 0.2s ease;
        }

        .dropdown-item:hover {
          background-color: #f8f9fa;
          transform: translateX(4px);
        }

        .dropdown-item i {
          width: 16px;
          text-align: center;
        }

        .badge-sm {
          font-size: 10px;
          padding: 2px 6px;
        }

        .dropdown-divider {
          margin: 8px 0;
        }

        /* Mobile responsive */
        @media (max-width: 768px) {
          .user-name {
            display: none;
          }
          
          .dropdown-menu {
            min-width: 250px;
            right: 0 !important;
            left: auto !important;
          }
        }

        /* Animation for dropdown */
        .dropdown-menu.show {
          animation: dropdownFadeIn 0.2s ease-out;
        }

        @keyframes dropdownFadeIn {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        /* Avatar hover effect */
        .user-avatar {
          transition: all 0.2s ease;
        }

        .user-dropdown-btn:hover .user-avatar {
          transform: scale(1.05);
          box-shadow: 0 4px 8px rgba(0,0,0,0.15) !important;
        }
      `}</style>
    </header>
  );
};

export default Header;