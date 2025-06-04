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

  // Function to render user avatar with initials
  const renderAvatar = () => {
    const initials = user?.name 
      ? user.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
      : 'U';
    
    // Generate a consistent color based on user name
    const getAvatarColor = (name) => {
      if (!name) return '#6c757d';
      
      const colors = [
        '#007bff', // Blue
        '#28a745', // Green
        '#dc3545', // Red
        '#ffc107', // Yellow
        '#17a2b8', // Cyan
        '#6f42c1', // Purple
        '#e83e8c', // Pink
        '#fd7e14', // Orange
        '#20c997', // Teal
        '#6610f2'  // Indigo
      ];
      
      let hash = 0;
      for (let i = 0; i < name.length; i++) {
        hash = name.charCodeAt(i) + ((hash << 5) - hash);
      }
      
      return colors[Math.abs(hash) % colors.length];
    };
    
    return (
      <div 
        className="user-avatar rounded-circle me-2 d-flex align-items-center justify-content-center"
        style={{ 
          width: '32px', 
          height: '32px', 
          backgroundColor: getAvatarColor(user?.name),
          color: 'white',
          fontSize: '13px',
          fontWeight: '600',
          border: '2px solid #fff',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
        }}
      >
        {initials}
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
                    className="btn btn-link text-dark text-decoration-none d-flex align-items-center"
                    onClick={() => setShowDropdown(!showDropdown)}
                    style={{ border: 'none', background: 'none', padding: '0' }}
                  >
                    {renderAvatar()}
                    <span>{user.name}</span>
                  </button>
                  {showDropdown && (
                    <div className="dropdown-menu show position-absolute end-0 mt-2">
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
    </header>
  );
};

export default Header;