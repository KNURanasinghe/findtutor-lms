import React, { useState, useEffect } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';

const TeacherProfile = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('profile');
  const [isEditing, setIsEditing] = useState(false);
  const [editedUser, setEditedUser] = useState({});

  // Mock user data - fallback when API fails or no teacher ID
  const mockUser = {
    id: 1,
    name: 'Dr. Sarah Johnson',
    email: 'sarah.johnson@example.com',
    subjects: 'Mathematics, Physics, Chemistry',
    experience: '8 years',
    qualifications: 'PhD in Mathematics from University of Cambridge, Masters in Applied Physics, Certified Secondary Education Teacher',
    hourlyRate: 'LKR 2500',
    phone: '+94 77 123 4567',
    location: 'Colombo, Sri Lanka',
    bio: 'Passionate educator with over 8 years of experience in teaching mathematics and physics. Specialized in helping students excel in advanced level examinations.',
    profilePicture: 'https://randomuser.me/api/portraits/women/1.jpg',
    dateJoined: '2020-03-15',
    totalStudents: 156,
    rating: 4.8,
    reviews: 89,
    availability: 'Weekdays 2PM-8PM, Weekends 9AM-5PM',
    preferredMedium: 'English, Sinhala',
    education: 'University of Cambridge',
    achievements: ['Best Teacher Award 2023', 'Top Rated Tutor', '95% Student Success Rate']
  };
  const [updateLoading, setUpdateLoading] = useState(false);

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Get user data from localStorage (stored by TeacherAuth)
        const userData = localStorage.getItem('user');
        console.log('Raw user data from localStorage:', userData);
        
        if (!userData) {
          console.warn('No user data found in localStorage');
          setUser(mockUser);
          setEditedUser(mockUser);
          setLoading(false);
          return;
        }
        
        // Parse the user data
        let parsedUser;
        try {
          parsedUser = JSON.parse(userData);
          console.log('Parsed user data:', parsedUser);
        } catch (parseError) {
          console.error('Error parsing user data:', parseError);
          setUser(mockUser);
          setEditedUser(mockUser);
          setLoading(false);
          return;
        }
        
        // Extract teacher ID from parsed user data
        const teacherId = parsedUser.user_id || parsedUser.teacher_id || parsedUser.id;
        console.log('Extracted teacher ID:', teacherId);
        console.log('User role:', parsedUser.role);
        
        if (!teacherId) {
          console.warn('No teacher ID found in user data');
          setUser(mockUser);
          setEditedUser(mockUser);
          setLoading(false);
          return;
        }
        
        // Verify user is a teacher
        if (parsedUser.role !== 'teacher') {
          console.warn('User is not a teacher, role:', parsedUser.role);
          setError('Access denied. This page is for teachers only.');
          return;
        }
        
        // Fetch all teachers from API
        console.log('Fetching teachers from API...');
        const response = await fetch('http://145.223.21.62:5000/api/teachers');
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const teachers = await response.json();
        console.log('API Response:', teachers);
        console.log('Looking for teacher with ID:', teacherId);
        
        // Find the specific teacher by ID
        const currentTeacher = teachers.find(teacher => {
          console.log('Checking teacher:', teacher.teacher_id, teacher.user_id);
          return teacher.teacher_id === parseInt(teacherId) || 
                 teacher.user_id === parseInt(teacherId) ||
                 teacher.teacher_id === teacherId ||
                 teacher.user_id === teacherId;
        });
        
        console.log('Found teacher:', currentTeacher);
        
        if (!currentTeacher) {
          console.error('Teacher not found, available teachers:', teachers.map(t => ({ id: t.teacher_id, user_id: t.user_id, name: t.name })));
          // Create a basic profile from login data if teacher not found in teachers API
          const basicProfile = {
            id: teacherId,
            user_id: teacherId,
            name: parsedUser.name || 'Teacher',
            email: parsedUser.email || '',
            subjects: 'General',
            experience: '0 years',
            qualifications: '',
            hourlyRate: 'LKR 0',
            phone: '',
            location: '',
            bio: 'Welcome! Please update your profile information.',
            profilePicture: 'https://randomuser.me/api/portraits/women/1.jpg',
            dateJoined: new Date().toISOString().split('T')[0],
            totalStudents: 0,
            rating: 0,
            reviews: 0,
            availability: 'Contact for availability',
            preferredMedium: 'English',
            education: '',
            achievements: [],
            lat: 0,
            lng: 0,
            is_subscribed: false
          };
          
          setUser(basicProfile);
          setEditedUser(basicProfile);
          setLoading(false);
          return;
        }
        
        // Map API response to component structure
        const mappedUser = {
          id: currentTeacher.teacher_id,
          user_id: currentTeacher.user_id,
          name: currentTeacher.name || parsedUser.name,
          email: parsedUser.email || currentTeacher.email || '', 
          subjects: 'General', // Default since not provided by API
          experience: `${currentTeacher.years_experience || 0} years`,
          qualifications: currentTeacher.education || '',
          hourlyRate: `LKR ${currentTeacher.hourly_rate || 0}`,
          phone: currentTeacher.phone || '', 
          location: currentTeacher.location || '',
          bio: currentTeacher.bio || 'Experienced teacher ready to help you learn.',
          profilePicture: currentTeacher.profile_picture || 'https://randomuser.me/api/portraits/women/1.jpg',
          dateJoined: currentTeacher.date_joined || new Date().toISOString().split('T')[0],
          totalStudents: currentTeacher.total_students || 0,
          rating: currentTeacher.rating || 0,
          reviews: currentTeacher.reviews_count || 0,
          availability: currentTeacher.availability || 'Contact for availability',
          preferredMedium: currentTeacher.preferred_medium || 'English',
          education: currentTeacher.education || '',
          achievements: currentTeacher.achievements || [],
          lat: currentTeacher.lat || 0,
          lng: currentTeacher.lng || 0,
          is_subscribed: currentTeacher.is_subscribed || false
        };
        
        console.log('Mapped user:', mappedUser);
        
        setUser(mappedUser);
        setEditedUser(mappedUser);
      } catch (err) {
        console.error('Error fetching teacher profile:', err);
        setError(err.message || 'Failed to load profile');
        
        // Try to create basic profile from localStorage data
        const userData = localStorage.getItem('user');
        if (userData) {
          try {
            const parsedUser = JSON.parse(userData);
            const basicProfile = {
              id: parsedUser.user_id || parsedUser.id || 1,
              user_id: parsedUser.user_id || parsedUser.id || 1,
              name: parsedUser.name || 'Teacher',
              email: parsedUser.email || '',
              subjects: 'General',
              experience: '0 years',
              qualifications: '',
              hourlyRate: 'LKR 0',
              phone: '',
              location: '',
              bio: 'Welcome! Please update your profile information.',
              profilePicture: 'https://randomuser.me/api/portraits/women/1.jpg',
              dateJoined: new Date().toISOString().split('T')[0],
              totalStudents: 0,
              rating: 0,
              reviews: 0,
              availability: 'Contact for availability',
              preferredMedium: 'English',
              education: '',
              achievements: [],
              lat: 0,
              lng: 0,
              is_subscribed: false
            };
            
            setUser(basicProfile);
            setEditedUser(basicProfile);
          } catch (parseError) {
            console.error('Error creating basic profile:', parseError);
            setUser(mockUser);
            setEditedUser(mockUser);
          }
        } else {
          setUser(mockUser);
          setEditedUser(mockUser);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchUserProfile();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('user');
    window.location.href = '/login/teacher'; // Redirect to login page
  };

  const handleEdit = () => {
    setIsEditing(true);
    setEditedUser({ ...user });
  };

  const handleSave = async () => {
    try {
      setUpdateLoading(true);
      setError(null);
      
      const teacherId = localStorage.getItem('teacherId') || localStorage.getItem('teacher_id');
      
      if (!teacherId) {
        throw new Error('No teacher ID found. Cannot save profile.');
      }
      
      // Prepare data for API (map back to API structure)
      const apiData = {
        name: editedUser.name,
        bio: editedUser.bio,
        education: editedUser.education,
        hourly_rate: parseFloat(editedUser.hourlyRate.replace('LKR ', '')),
        location: editedUser.location,
        // Add other fields that your API supports for updates
      };
      
      // TODO: Replace with actual API endpoint when available
      // const response = await fetch(`http://145.223.21.62:5000/api/teachers/${teacherId}`, {
      //   method: 'PUT',
      //   headers: {
      //     'Content-Type': 'application/json',
      //   },
      //   body: JSON.stringify(apiData)
      // });
      
      // if (!response.ok) {
      //   throw new Error('Failed to update profile');
      // }
      
      // For now, just update local state (remove this when API is available)
      console.log('Profile update data:', apiData);
      
      setUser(editedUser);
      setIsEditing(false);
    } catch (err) {
      console.error('Error saving profile:', err);
      setError(err.message || 'Failed to save profile');
    } finally {
      setUpdateLoading(false);
    }
  };

  const handleCancel = () => {
    setEditedUser({ ...user });
    setIsEditing(false);
  };

  const handleInputChange = (field, value) => {
    setEditedUser(prev => ({
      ...prev,
      [field]: value
    }));
  };

  if (loading) {
    return (
      <div className="profile-container">
        <div className="container-fluid">
          <div className="text-center py-5">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
            <p className="mt-3">Loading teacher profile...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error && error.includes('Access denied')) {
    return (
      <div className="profile-container">
        <div className="container-fluid">
          <div className="text-center py-5">
            <div className="alert alert-danger" role="alert">
              <i className="bi bi-shield-exclamation me-2"></i>
              {error}
            </div>
            <button 
              className="btn btn-primary"
              onClick={() => window.location.href = '/login/teacher'}
            >
              <i className="bi bi-box-arrow-in-right me-2"></i>
              Go to Login
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="profile-container">
        <div className="container-fluid">
          <div className="text-center py-5">
            <div className="alert alert-warning" role="alert">
              <i className="bi bi-exclamation-triangle-fill me-2"></i>
              {error}
            </div>
            <p className="text-muted mb-3">Don't worry! We're showing your basic profile.</p>
            <button 
              className="btn btn-primary me-2" 
              onClick={() => {
                setError(null);
                window.location.reload();
              }}
            >
              <i className="bi bi-arrow-clockwise me-2"></i>
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  const currentUser = isEditing ? editedUser : user;

  // If no user data, show loading or fallback
  if (!currentUser && !loading && !error) {
    return (
      <div className="profile-container">
        <div className="container-fluid">
          <div className="text-center py-5">
            <div className="alert alert-warning" role="alert">
              <i className="bi bi-person-x me-2"></i>
              No profile data available
            </div>
            <button 
              className="btn btn-primary"
              onClick={() => {
                setUser(mockUser);
                setEditedUser(mockUser);
              }}
            >
              Load Sample Profile
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="profile-container">
      {/* Debug Panel - Remove in production */}
      <div className="debug-panel">
        <div className="container-fluid">
          <div className="alert alert-info" role="alert">
            <strong>Debug Info:</strong> 
            <span className="ms-2">
              User Data: {localStorage.getItem('user') ? 'Found' : 'Not Found'}
            </span>
            <span className="ms-3">
              Parsed User: {(() => {
                try {
                  const userData = localStorage.getItem('user');
                  if (userData) {
                    const parsed = JSON.parse(userData);
                    return `${parsed.name || 'Unknown'} (${parsed.role || 'No Role'})`;
                  }
                  return 'None';
                } catch (e) {
                  return 'Invalid JSON';
                }
              })()}
            </span>
            <span className="ms-3">Profile: {user ? 'Loaded' : 'Not Loaded'}</span>
            <button 
              className="btn btn-sm btn-outline-primary ms-3"
              onClick={() => {
                // Clear localStorage and reload
                localStorage.clear();
                window.location.reload();
              }}
            >
              Clear Storage
            </button>
            <button 
              className="btn btn-sm btn-outline-secondary ms-2"
              onClick={() => {
                console.log('Current state:', { user, error, loading });
                console.log('localStorage user:', localStorage.getItem('user'));
                try {
                  const userData = localStorage.getItem('user');
                  if (userData) {
                    console.log('Parsed user data:', JSON.parse(userData));
                  }
                } catch (e) {
                  console.error('Error parsing user data:', e);
                }
              }}
            >
              Log State
            </button>
          </div>
        </div>
      </div>
      {/* Profile Header */}
      <div className="profile-header">
        <div className="container-fluid">
          <div className="row align-items-center">
            <div className="col-auto">
              <div className="profile-avatar">
                <img 
                  src={currentUser?.profilePicture} 
                  alt={currentUser?.name}
                  onError={(e) => {
                    e.target.src = 'https://randomuser.me/api/portraits/women/1.jpg';
                  }}
                />
                <div className="rating-badge">
                  <i className="bi bi-star-fill"></i>
                  <span>{currentUser?.rating || '4.5'}</span>
                </div>
              </div>
            </div>
            <div className="col">
              <h2 className="mb-1">{currentUser?.name}</h2>
              <p className="text-muted mb-2">{currentUser?.subjects}</p>
              <div className="profile-stats">
                <span className="stat-item">
                  <i className="bi bi-people-fill"></i>
                  {currentUser?.totalStudents || 0} Students
                </span>
                <span className="stat-item">
                  <i className="bi bi-star-fill"></i>
                  {currentUser?.rating || 'N/A'} ({currentUser?.reviews || 0} reviews)
                </span>
                <span className="stat-item">
                  <i className="bi bi-calendar-check"></i>
                  Since {currentUser?.dateJoined ? new Date(currentUser.dateJoined).getFullYear() : 'N/A'}
                </span>
                {currentUser?.is_subscribed && (
                  <span className="stat-item subscription-badge">
                    <i className="bi bi-check-circle-fill"></i>
                    Subscribed
                  </span>
                )}
              </div>
            </div>
            <div className="col-auto">
              <div className="btn-group me-3">
                <button 
                  className="btn btn-outline-danger btn-sm"
                  onClick={handleLogout}
                >
                  <i className="bi bi-box-arrow-right me-2"></i>
                  Logout
                </button>
              </div>
              {!isEditing ? (
                <button className="btn btn-primary" onClick={handleEdit}>
                  <i className="bi bi-pencil me-2"></i>
                  Edit Profile
                </button>
              ) : (
                <div className="btn-group">
                  <button 
                    className="btn btn-success" 
                    onClick={handleSave}
                    disabled={updateLoading}
                  >
                    {updateLoading ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                        Saving...
                      </>
                    ) : (
                      <>
                        <i className="bi bi-check-lg me-2"></i>
                        Save
                      </>
                    )}
                  </button>
                  <button 
                    className="btn btn-outline-secondary" 
                    onClick={handleCancel}
                    disabled={updateLoading}
                  >
                    <i className="bi bi-x-lg me-2"></i>
                    Cancel
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="profile-nav">
        <div className="container-fluid">
          <ul className="nav nav-tabs">
            <li className="nav-item">
              <button 
                className={`nav-link ${activeTab === 'profile' ? 'active' : ''}`}
                onClick={() => setActiveTab('profile')}
              >
                <i className="bi bi-person me-2"></i>
                Profile
              </button>
            </li>
            <li className="nav-item">
              <button 
                className={`nav-link ${activeTab === 'education' ? 'active' : ''}`}
                onClick={() => setActiveTab('education')}
              >
                <i className="bi bi-mortarboard me-2"></i>
                Education
              </button>
            </li>
            <li className="nav-item">
              <button 
                className={`nav-link ${activeTab === 'achievements' ? 'active' : ''}`}
                onClick={() => setActiveTab('achievements')}
              >
                <i className="bi bi-award me-2"></i>
                Achievements
              </button>
            </li>
          </ul>
        </div>
      </div>

      {/* Tab Content */}
      <div className="profile-content">
        <div className="container-fluid">
          {activeTab === 'profile' && (
            <div>
              <h4 className="mb-4">Profile Information</h4>
              <div className="row">
                <div className="col-md-6">
                  <div className="mb-3">
                    <label className="form-label">Full Name</label>
                    {isEditing ? (
                      <input 
                        type="text" 
                        className="form-control" 
                        value={currentUser?.name || ''} 
                        onChange={(e) => handleInputChange('name', e.target.value)}
                      />
                    ) : (
                      <input type="text" className="form-control" value={currentUser?.name || ''} readOnly />
                    )}
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Email</label>
                    {isEditing ? (
                      <input 
                        type="email" 
                        className="form-control" 
                        value={currentUser?.email || ''} 
                        onChange={(e) => handleInputChange('email', e.target.value)}
                      />
                    ) : (
                      <input type="email" className="form-control" value={currentUser?.email || ''} readOnly />
                    )}
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Phone</label>
                    {isEditing ? (
                      <input 
                        type="tel" 
                        className="form-control" 
                        value={currentUser?.phone || ''} 
                        onChange={(e) => handleInputChange('phone', e.target.value)}
                      />
                    ) : (
                      <input type="tel" className="form-control" value={currentUser?.phone || ''} readOnly />
                    )}
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Location</label>
                    {isEditing ? (
                      <input 
                        type="text" 
                        className="form-control" 
                        value={currentUser?.location || ''} 
                        onChange={(e) => handleInputChange('location', e.target.value)}
                      />
                    ) : (
                      <input type="text" className="form-control" value={currentUser?.location || ''} readOnly />
                    )}
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Subjects</label>
                    {isEditing ? (
                      <input 
                        type="text" 
                        className="form-control" 
                        value={currentUser?.subjects || ''} 
                        onChange={(e) => handleInputChange('subjects', e.target.value)}
                        placeholder="e.g., Mathematics, Physics, Chemistry"
                      />
                    ) : (
                      <input type="text" className="form-control" value={currentUser?.subjects || ''} readOnly />
                    )}
                  </div>
                </div>
                <div className="col-md-6">
                  <div className="mb-3">
                    <label className="form-label">Experience</label>
                    {isEditing ? (
                      <input 
                        type="text" 
                        className="form-control" 
                        value={currentUser?.experience || ''} 
                        onChange={(e) => handleInputChange('experience', e.target.value)}
                      />
                    ) : (
                      <input type="text" className="form-control" value={currentUser?.experience || ''} readOnly />
                    )}
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Hourly Rate</label>
                    {isEditing ? (
                      <input 
                        type="text" 
                        className="form-control" 
                        value={currentUser?.hourlyRate || ''} 
                        onChange={(e) => handleInputChange('hourlyRate', e.target.value)}
                      />
                    ) : (
                      <input type="text" className="form-control" value={currentUser?.hourlyRate || ''} readOnly />
                    )}
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Availability</label>
                    {isEditing ? (
                      <input 
                        type="text" 
                        className="form-control" 
                        value={currentUser?.availability || ''} 
                        onChange={(e) => handleInputChange('availability', e.target.value)}
                      />
                    ) : (
                      <input type="text" className="form-control" value={currentUser?.availability || ''} readOnly />
                    )}
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Preferred Medium</label>
                    {isEditing ? (
                      <input 
                        type="text" 
                        className="form-control" 
                        value={currentUser?.preferredMedium || ''} 
                        onChange={(e) => handleInputChange('preferredMedium', e.target.value)}
                      />
                    ) : (
                      <input type="text" className="form-control" value={currentUser?.preferredMedium || ''} readOnly />
                    )}
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Bio</label>
                    {isEditing ? (
                      <textarea 
                        className="form-control" 
                        rows="3" 
                        value={currentUser?.bio || ''} 
                        onChange={(e) => handleInputChange('bio', e.target.value)}
                        placeholder="Tell us about yourself and your teaching approach..."
                      />
                    ) : (
                      <textarea className="form-control" rows="3" value={currentUser?.bio || ''} readOnly />
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'education' && (
            <div>
              <h4 className="mb-4">Education & Qualifications</h4>
              <div className="row">
                <div className="col-12">
                  <div className="mb-3">
                    <label className="form-label">Education</label>
                    {isEditing ? (
                      <input 
                        type="text" 
                        className="form-control" 
                        value={currentUser?.education || ''} 
                        onChange={(e) => handleInputChange('education', e.target.value)}
                      />
                    ) : (
                      <input type="text" className="form-control" value={currentUser?.education || ''} readOnly />
                    )}
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Qualifications</label>
                    {isEditing ? (
                      <textarea 
                        className="form-control" 
                        rows="4" 
                        value={currentUser?.qualifications || ''} 
                        onChange={(e) => handleInputChange('qualifications', e.target.value)}
                        placeholder="List your degrees, certifications, and qualifications..."
                      />
                    ) : (
                      <textarea className="form-control" rows="4" value={currentUser?.qualifications || ''} readOnly />
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'achievements' && (
            <div>
              <h4 className="mb-4">Achievements & Recognition</h4>
              <div className="row">
                <div className="col-12">
                  {currentUser?.achievements && currentUser.achievements.length > 0 ? (
                    <div className="achievements-list">
                      {currentUser.achievements.map((achievement, index) => (
                        <div key={index} className="achievement-item">
                          <div className="achievement-icon">
                            <i className="bi bi-award-fill"></i>
                          </div>
                          <div className="achievement-content">
                            <h6>{achievement}</h6>
                            <p className="text-muted mb-0">Professional recognition in teaching excellence</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-5">
                      <i className="bi bi-award display-1 text-muted"></i>
                      <h5 className="mt-3">No achievements listed yet</h5>
                      <p className="text-muted">Your achievements and recognition will appear here.</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <style jsx>{`
        .profile-container {
          background: #f8fafc;
          min-height: 100vh;
        }

        .profile-header {
          background: white;
          padding: 2rem 0;
          border-bottom: 1px solid #e2e8f0;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        }

        .profile-avatar {
          position: relative;
          width: 100px;
          height: 100px;
          border-radius: 50%;
          overflow: hidden;
          border: 4px solid #e2e8f0;
          box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
        }

        .profile-avatar img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .rating-badge {
          position: absolute;
          bottom: -5px;
          right: -5px;
          background: #2563eb;
          color: white;
          padding: 0.25rem 0.5rem;
          border-radius: 1rem;
          font-size: 0.75rem;
          font-weight: 600;
          display: flex;
          align-items: center;
          gap: 0.25rem;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        }

        .rating-badge i {
          color: #fbbf24;
          font-size: 0.75rem;
        }

        .profile-stats {
          display: flex;
          gap: 1.5rem;
          flex-wrap: wrap;
        }

        .stat-item {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          color: #64748b;
          font-size: 0.875rem;
        }

        .stat-item i {
          color: #2563eb;
        }

        .subscription-badge {
          background: #10b981;
          color: white;
          padding: 0.25rem 0.75rem;
          border-radius: 1rem;
          font-size: 0.75rem;
          font-weight: 600;
        }

        .subscription-badge i {
          color: white;
        }

        .profile-nav {
          background: white;
          border-bottom: 1px solid #e2e8f0;
        }

        .nav-tabs {
          border-bottom: none;
        }

        .nav-link {
          background: none;
          border: none;
          color: #64748b;
          padding: 1rem 1.5rem;
          font-weight: 500;
          border-bottom: 3px solid transparent;
          transition: all 0.3s ease;
        }

        .nav-link:hover {
          color: #2563eb;
          background: #f8fafc;
        }

        .nav-link.active {
          color: #2563eb;
          border-bottom-color: #2563eb;
          background: #f8fafc;
        }

        .profile-content {
          padding: 2rem 0;
        }

        .form-label {
          font-weight: 500;
          color: #1e293b;
          margin-bottom: 0.5rem;
        }

        .form-control {
          border-radius: 0.5rem;
          border: 1px solid #e2e8f0;
          padding: 0.75rem;
          transition: all 0.3s ease;
        }

        .form-control:focus {
          border-color: #2563eb;
          box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
        }

        .form-control[readonly] {
          background-color: #f8fafc;
          color: #64748b;
        }

        .achievements-list {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .achievement-item {
          display: flex;
          align-items: center;
          gap: 1rem;
          padding: 1rem;
          background: white;
          border-radius: 0.75rem;
          border: 1px solid #e2e8f0;
          transition: all 0.3s ease;
        }

        .achievement-item:hover {
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        }

        .achievement-icon {
          width: 50px;
          height: 50px;
          background: linear-gradient(135deg, #fbbf24, #f59e0b);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-size: 1.25rem;
        }

        .achievement-content h6 {
          margin: 0;
          color: #1e293b;
          font-weight: 600;
        }

        .btn {
          border-radius: 0.5rem;
          font-weight: 500;
          transition: all 0.3s ease;
        }

        .btn:hover {
          transform: translateY(-1px);
        }

        .spinner-border {
          width: 3rem;
          height: 3rem;
        }

        @media (max-width: 768px) {
          .profile-header {
            padding: 1rem 0;
          }

          .profile-avatar {
            width: 80px;
            height: 80px;
          }

          .profile-stats {
            flex-direction: column;
            gap: 0.5rem;
          }

          .profile-content {
            padding: 1rem 0;
          }

          .nav-link {
            padding: 0.75rem 1rem;
            font-size: 0.875rem;
          }
        }
      `}</style>
    </div>
  );
};

export default TeacherProfile;