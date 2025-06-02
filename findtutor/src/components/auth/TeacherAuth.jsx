import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext'; // Import useAuth
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';

const TeacherAuth = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, register, user, loading: authLoading } = useAuth(); // Use AuthContext
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    name: ''
  });

  useEffect(() => {
    // Check if we're on the login or register route
    setIsLogin(location.pathname.includes('/login'));
  }, [location]);

  useEffect(() => {
    // Check if user is already logged in via AuthContext
    if (user && user.role === 'teacher') {
      navigate('/dashboard/teacher', { replace: true });
    }
  }, [user, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isLogin) {
        // Login logic using AuthContext
        if (!formData.email || !formData.password) {
          throw new Error('Please fill in all required fields');
        }

        console.log('Attempting login for teacher...');
        
        // Use AuthContext login function
        const userData = await login(formData.email, formData.password, 'teacher');
        
        console.log('Login successful:', userData);
        
        if (userData.role !== 'teacher') {
          throw new Error('Invalid account type. Please use teacher login.');
        }
        
        // Navigation will happen automatically via useEffect when user state updates
        
      } else {
        // Registration logic using AuthContext
        if (!formData.email || !formData.password || !formData.name) {
          throw new Error('Please fill in all required fields');
        }

        if (formData.password !== formData.confirmPassword) {
          throw new Error('Passwords do not match');
        }

        const userData = {
          email: formData.email,
          password: formData.password,
          name: formData.name,
          role: 'teacher'
        };

        console.log('Attempting registration for teacher...');
        
        // Use AuthContext register function
        const newUser = await register(userData);
        
        console.log('Registration successful:', newUser);
        
        if (newUser.role !== 'teacher') {
          throw new Error('Registration failed. Please try again.');
        }
        
        // Navigation will happen automatically via useEffect when user state updates
      }
    } catch (error) {
      console.error('Auth error:', error);
      setError(error.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  // Show loading if AuthContext is still loading
  if (authLoading) {
    return (
      <div className="container mt-5">
        <div className="row justify-content-center">
          <div className="col-md-6 col-lg-5">
            <div className="text-center">
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
              <p className="mt-3">Loading...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mt-5">
      <div className="row justify-content-center">
        <div className="col-md-6 col-lg-5">
          <div className="card shadow">
            <div className="card-body p-5">
              <div className="text-center mb-4">
                <h2 className="fw-bold">
                  {isLogin ? 'Teacher Login' : 'Teacher Registration'}
                </h2>
                <p className="text-muted">
                  {isLogin 
                    ? 'Welcome back! Please login to your account.'
                    : 'Create your teacher account to start teaching'}
                </p>
              </div>

              {error && (
                <div className="alert alert-danger" role="alert">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit}>
                {!isLogin && (
                  <div className="mb-3">
                    <label htmlFor="name" className="form-label">Full Name</label>
                    <input
                      type="text"
                      className="form-control"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                    />
                  </div>
                )}

                <div className="mb-3">
                  <label htmlFor="email" className="form-label">Email address</label>
                  <input
                    type="email"
                    className="form-control"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="mb-3">
                  <label htmlFor="password" className="form-label">Password</label>
                  <input
                    type="password"
                    className="form-control"
                    id="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    required
                  />
                </div>

                {!isLogin && (
                  <div className="mb-3">
                    <label htmlFor="confirmPassword" className="form-label">Confirm Password</label>
                    <input
                      type="password"
                      className="form-control"
                      id="confirmPassword"
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      required
                    />
                  </div>
                )}

                <button
                  type="submit"
                  className="btn btn-primary w-100 py-2"
                  disabled={loading}
                >
                  {loading ? (
                    <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                  ) : null}
                  {isLogin ? 'Login' : 'Register'}
                </button>
              </form>

              <div className="text-center mt-4">
                <p className="mb-0">
                  {isLogin ? "Don't have an account? " : "Already have an account? "}
                  <button
                    className="btn btn-link p-0"
                    onClick={() => navigate(isLogin ? '/register/teacher' : '/login/teacher')}
                  >
                    {isLogin ? 'Register here' : 'Login here'}
                  </button>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .card {
          border: none;
          border-radius: 15px;
        }

        .form-control {
          border-radius: 8px;
          padding: 10px 15px;
        }

        .form-control:focus {
          box-shadow: 0 0 0 0.2rem rgba(13, 110, 253, 0.25);
        }

        .btn-primary {
          border-radius: 8px;
          padding: 10px 20px;
          font-weight: 500;
        }

        .btn-link {
          color: #0d6efd;
          text-decoration: none;
        }

        .btn-link:hover {
          text-decoration: underline;
        }
      `}</style>
    </div>
  );
};

export default TeacherAuth;