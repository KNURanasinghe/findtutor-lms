import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import UniversalProfile from './profilePage';

const StudentDashboard = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('requests');
  const [tutorRequests, setTutorRequests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [studentProfileId, setStudentProfileId] = useState(null);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  useEffect(() => {
    // Check if user is logged in and is a student
    if (!user || user.role !== 'student') {
      navigate('/login/student');
    }
  }, [user, navigate]);

  // Fetch student profile ID when component mounts
  useEffect(() => {
    if (user?.id) {
      fetchStudentProfileId();
    }
  }, [user?.id]);

  // Fetch tutor requests when we have student profile ID and activeTab is 'requests'
  useEffect(() => {
    if (activeTab === 'requests' && studentProfileId) {
      fetchTutorRequests();
    }
  }, [activeTab, studentProfileId]);

  // Handle window resize for responsive sidebar
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth <= 768) {
        setSidebarCollapsed(true);
      } else {
        setSidebarCollapsed(false);
      }
    };

    // Set initial state
    handleResize();

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const fetchStudentProfileId = async () => {
    try {
      const response = await fetch('http://145.223.21.62:5000/api/students');
      
      if (!response.ok) {
        throw new Error(`Failed to fetch students: ${response.status}`);
      }
      
      const students = await response.json();
      const studentProfile = students.find(student => 
        student.user_id === parseInt(user.id) || student.user_id === user.id
      );
      
      if (studentProfile) {
        setStudentProfileId(studentProfile.student_id);
        console.log('Found student profile ID:', studentProfile.student_id);
      } else {
        setError('Student profile not found. Please complete your registration.');
      }
    } catch (err) {
      console.error('Error fetching student profile ID:', err);
      setError('Failed to load student profile.');
    }
  };

  const fetchTutorRequests = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Use the correct API endpoint with student_id query parameter
      const response = await fetch(
        `http://145.223.21.62:5000/api/requests?student_id=${studentProfileId}`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            // Add authorization header if needed
            // 'Authorization': `Bearer ${user.token}`
          },
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setTutorRequests(data);
      console.log('Fetched tutor requests:', data);
    } catch (err) {
      console.error('Error fetching tutor requests:', err);
      setError('Failed to load tutor requests. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const updateRequestStatus = async (requestId, newStatus) => {
    try {
      const response = await fetch(
        `http://145.223.21.62:5000/api/requests/${requestId}/status`,
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ status: newStatus })
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to update request status: ${response.status}`);
      }

      // Refresh the requests list
      fetchTutorRequests();
      
      // Show success message
      const action = newStatus === 'accepted' ? 'accepted' : 'declined';
      alert(`Request ${action} successfully!`);
    } catch (err) {
      console.error('Error updating request status:', err);
      alert('Failed to update request status. Please try again.');
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const toggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusBadgeClass = (status) => {
    switch (status?.toLowerCase()) {
      case 'pending':
        return 'bg-warning text-dark';
      case 'accepted':
        return 'bg-success';
      case 'declined':
        return 'bg-danger';
      case 'completed':
        return 'bg-info';
      default:
        return 'bg-secondary';
    }
  };

  // Mock data for enrolled classes (keeping existing mock data for other sections)
  const enrolledClasses = [
    {
      id: 1,
      subject: 'Mathematics',
      teacher: 'Dr. Sarah Johnson',
      schedule: 'Mon, Wed 10:00 AM',
      progress: 75
    },
    {
      id: 2,
      subject: 'Physics',
      teacher: 'Prof. Michael Brown',
      schedule: 'Tue, Thu 2:00 PM',
      progress: 60
    }
  ];

  // Mock data for learning resources
  const learningResources = [
    {
      id: 1,
      title: 'Mathematics Fundamentals',
      type: 'PDF',
      subject: 'Mathematics',
      uploadDate: '2024-03-10'
    },
    {
      id: 2,
      title: 'Physics Practice Problems',
      type: 'Video',
      subject: 'Physics',
      uploadDate: '2024-03-12'
    }
  ];

  // Profile data
  const profileData = {
    name: user?.name || 'Student Name',
    email: user?.email || 'student@example.com',
    grade: '12th Grade',
    subjects: ['Mathematics', 'Physics'],
    joinDate: '2024-01-01'
  };

  return (
    <div className="dashboard-container">
      {/* Sidebar Toggle Button */}
      <button 
        className="sidebar-toggle"
        onClick={toggleSidebar}
        title={sidebarCollapsed ? 'Show Sidebar' : 'Hide Sidebar'}
      >
        <i className={`bi ${sidebarCollapsed ? 'bi-list' : 'bi-x-lg'}`}></i>
      </button>

      {/* Sidebar Overlay for mobile */}
      {!sidebarCollapsed && window.innerWidth <= 768 && (
        <div className="sidebar-overlay" onClick={toggleSidebar}></div>
      )}

      {/* Sidebar */}
      <div className={`sidebar ${sidebarCollapsed ? 'collapsed' : ''}`}>
        <div className="sidebar-header">
          <img
            src={user?.profile_picture || 'https://via.placeholder.com/100'}
            alt="Profile"
            className="profile-image"
          />
          {!sidebarCollapsed && (
            <>
              <h5>{user?.name || 'Student Name'}</h5>
              <p className="text-muted">Student</p>
              {studentProfileId && (
                <small className="text-muted">ID: {studentProfileId}</small>
              )}
            </>
          )}
        </div>

        <ul className="nav flex-column">
          <li className="nav-item">
            <button
              className={`nav-link ${activeTab === 'requests' ? 'active' : ''}`}
              onClick={() => setActiveTab('requests')}
              title="Tutor Requests"
            >
              <i className="bi bi-envelope me-2"></i>
              {!sidebarCollapsed && (
                <>
                  Tutor Requests
                  {tutorRequests.length > 0 && (
                    <span className="badge bg-primary ms-2">{tutorRequests.length}</span>
                  )}
                </>
              )}
            </button>
          </li>
          <li className="nav-item">
            <button
              className={`nav-link ${activeTab === 'classes' ? 'active' : ''}`}
              onClick={() => setActiveTab('classes')}
              title="My Classes"
            >
              <i className="bi bi-book me-2"></i>
              {!sidebarCollapsed && 'My Classes'}
            </button>
          </li>
          <li className="nav-item">
            <button
              className={`nav-link ${activeTab === 'resources' ? 'active' : ''}`}
              onClick={() => setActiveTab('resources')}
              title="Learning Resources"
            >
              <i className="bi bi-file-earmark-text me-2"></i>
              {!sidebarCollapsed && 'Learning Resources'}
            </button>
          </li>
          <li className="nav-item">
            <button
              className={`nav-link ${activeTab === 'profile' ? 'active' : ''}`}
              onClick={() => setActiveTab('profile')}
              title="Profile"
            >
              <i className="bi bi-person me-2"></i>
              {!sidebarCollapsed && 'Profile'}
            </button>
          </li>
          <li className="nav-item mt-3">
            <button
              className="nav-link text-danger"
              onClick={handleLogout}
              title="Logout"
            >
              <i className="bi bi-box-arrow-right me-2"></i>
              {!sidebarCollapsed && 'Logout'}
            </button>
          </li>
        </ul>
      </div>

      {/* Main Content */}
      <main className={`main-content ${sidebarCollapsed ? 'sidebar-collapsed' : ''}`}>
        <div className="content-header">
          <h1>
            {activeTab === 'requests' && 'Tutor Requests'}
            {activeTab === 'classes' && 'My Classes'}
            {activeTab === 'resources' && 'Learning Resources'}
            {activeTab === 'profile' && 'Profile Management'}
          </h1>
        </div>

        <div className="content-body">
          {activeTab === 'requests' && (
            <div className="card">
              <div className="card-body">
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <h5 className="card-title mb-0">
                    My Tutor Requests
                    {tutorRequests.length > 0 && (
                      <span className="badge bg-secondary ms-2">{tutorRequests.length}</span>
                    )}
                  </h5>
                  <button 
                    className="btn btn-outline-primary btn-sm"
                    onClick={fetchTutorRequests}
                    disabled={loading || !studentProfileId}
                  >
                    <i className="bi bi-arrow-clockwise me-1"></i>
                    {loading ? 'Refreshing...' : 'Refresh'}
                  </button>
                </div>

                {!studentProfileId && (
                  <div className="alert alert-warning" role="alert">
                    <i className="bi bi-exclamation-triangle me-2"></i>
                    Loading student profile...
                  </div>
                )}

                {error && (
                  <div className="alert alert-danger" role="alert">
                    <i className="bi bi-exclamation-triangle me-2"></i>
                    {error}
                  </div>
                )}

                {loading ? (
                  <div className="text-center py-4">
                    <div className="spinner-border" role="status">
                      <span className="visually-hidden">Loading...</span>
                    </div>
                    <p className="mt-2">Loading tutor requests...</p>
                  </div>
                ) : (
                  <>
                    {tutorRequests.length === 0 && studentProfileId ? (
                      <div className="text-center py-4">
                        <i className="bi bi-inbox display-4 text-muted"></i>
                        <h5 className="mt-2 text-muted">No tutor requests found</h5>
                        <p className="text-muted">You haven't sent any requests to teachers yet.</p>
                        <button 
                          className="btn btn-primary"
                          onClick={() => navigate('/find-teachers')}
                        >
                          <i className="bi bi-search me-2"></i>
                          Find Teachers
                        </button>
                      </div>
                    ) : tutorRequests.length > 0 ? (
                      <div className="table-responsive">
                        <table className="table table-hover">
                          <thead className="table-light">
                            <tr>
                              <th>Teacher</th>
                              <th>Subject</th>
                              <th>Class</th>
                              <th>Message</th>
                              <th>Budget</th>
                              <th>Location</th>
                              <th>Date</th>
                              <th>Status</th>
                              <th>Actions</th>
                            </tr>
                          </thead>
                          <tbody>
                            {tutorRequests.map(request => (
                              <tr key={request.id}>
                                <td>
                                  <div className="d-flex align-items-center">
                                    <img
                                      src={request.teacher_profile_picture || 'https://via.placeholder.com/100'}
                                      alt="Teacher"
                                      className="rounded-circle me-2"
                                      style={{ width: '32px', height: '32px', objectFit: 'cover' }}
                                      onError={(e) => {
                                        e.target.src = 'https://via.placeholder.com/100';
                                      }}
                                    />
                                    <div>
                                      <div className="fw-bold">{request.teacher_name}</div>
                                      <small className="text-muted">ID: {request.teacher_id}</small>
                                    </div>
                                  </div>
                                </td>
                                <td>
                                  <span className="badge bg-primary">{request.subject_name}</span>
                                </td>
                                <td>
                                  {request.class_title ? (
                                    <span className="badge bg-info">{request.class_title}</span>
                                  ) : (
                                    <span className="text-muted">General Request</span>
                                  )}
                                </td>
                                <td>
                                  <span 
                                    className="text-truncate d-inline-block" 
                                    style={{ maxWidth: '200px' }}
                                    title={request.message}
                                  >
                                    {request.message}
                                  </span>
                                </td>
                                <td>
                                  {request.budget ? (
                                    <span className="text-success fw-bold">LKR{request.budget}</span>
                                  ) : (
                                    <span className="text-muted">Not specified</span>
                                  )}
                                </td>
                                <td>
                                  <i className="bi bi-geo-alt text-muted me-1"></i>
                                  {request.location || 'Not specified'}
                                </td>
                                <td>
                                  <small>{formatDate(request.created_at)}</small>
                                </td>
                                <td>
                                  <span className={`badge ${getStatusBadgeClass(request.status)}`}>
                                    {request.status?.toUpperCase()}
                                  </span>
                                </td>
                                <td>
                                  <div className="btn-group btn-group-sm">
                                    <button 
                                      className="btn btn-outline-primary"
                                      title="View Details"
                                    >
                                      <i className="bi bi-eye"></i>
                                    </button>
                                    {request.status === 'pending' && (
                                      <button 
                                        className="btn btn-outline-danger"
                                        onClick={() => {
                                          if (window.confirm('Are you sure you want to cancel this request?')) {
                                            updateRequestStatus(request.id, 'declined');
                                          }
                                        }}
                                        title="Cancel Request"
                                      >
                                        <i className="bi bi-x-lg"></i>
                                      </button>
                                    )}
                                  </div>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    ) : null}
                  </>
                )}
                
                <div className="mt-3">
                  <button 
                    className="btn btn-primary"
                    onClick={() => navigate('/find-teachers')}
                  >
                    <i className="bi bi-plus me-2"></i>
                    Request New Tutor
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'classes' && (
            <div className="card">
              <div className="card-body">
                <h5 className="card-title">Enrolled Classes</h5>
                <div className="table-responsive">
                  <table className="table">
                    <thead>
                      <tr>
                        <th>Subject</th>
                        <th>Teacher</th>
                        <th>Schedule</th>
                        <th>Progress</th>
                        <th>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {enrolledClasses.map(cls => (
                        <tr key={cls.id}>
                          <td>{cls.subject}</td>
                          <td>{cls.teacher}</td>
                          <td>{cls.schedule}</td>
                          <td>
                            <div className="progress">
                              <div 
                                className="progress-bar" 
                                role="progressbar" 
                                style={{ width: `${cls.progress}%` }}
                                aria-valuenow={cls.progress} 
                                aria-valuemin="0" 
                                aria-valuemax="100"
                              >
                                {cls.progress}%
                              </div>
                            </div>
                          </td>
                          <td>
                            <button className="btn btn-sm btn-primary me-2">View Details</button>
                            <button className="btn btn-sm btn-danger">Leave Class</button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'resources' && (
            <div className="card">
              <div className="card-body">
                <h5 className="card-title">Learning Resources</h5>
                <div className="table-responsive">
                  <table className="table">
                    <thead>
                      <tr>
                        <th>Title</th>
                        <th>Type</th>
                        <th>Subject</th>
                        <th>Upload Date</th>
                        <th>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {learningResources.map(resource => (
                        <tr key={resource.id}>
                          <td>{resource.title}</td>
                          <td>
                            <span className={`badge bg-${resource.type === 'PDF' ? 'danger' : 'primary'}`}>
                              {resource.type}
                            </span>
                          </td>
                          <td>{resource.subject}</td>
                          <td>{resource.uploadDate}</td>
                          <td>
                            <button className="btn btn-sm btn-primary me-2">Download</button>
                            <button className="btn btn-sm btn-info">View</button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'profile' && (
            <UniversalProfile/>
          )}
        </div>
      </main>

      <style jsx>{`
        .dashboard-container {
          display: flex;
          min-height: 100vh;
          padding-top: 80px; /* Height of the header */
          position: relative;
        }

        .sidebar-toggle {
          position: fixed;
          top: 20px;
          left: 20px;
          z-index: 1001;
          background: #fff;
          border: 1px solid #dee2e6;
          border-radius: 50%;
          width: 45px;
          height: 45px;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
          transition: all 0.3s ease;
          cursor: pointer;
        }

        .sidebar-toggle:hover {
          background: #f8f9fa;
          transform: scale(1.05);
        }

        .sidebar-toggle i {
          font-size: 18px;
          color: #333;
        }

        .sidebar-overlay {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: rgba(0,0,0,0.5);
          z-index: 999;
        }

        .sidebar {
          width: 280px;
          background-color: #f8f9fa;
          padding: 20px;
          position: fixed;
          height: calc(100vh - 80px);
          overflow-y: auto;
          border-right: 1px solid #dee2e6;
          z-index: 1000;
          transition: all 0.3s ease;
          transform: translateX(0);
        }

        .sidebar.collapsed {
          width: 70px;
          padding: 20px 10px;
        }

        .sidebar-header {
          text-align: center;
          padding-bottom: 20px;
          border-bottom: 1px solid #dee2e6;
          margin-bottom: 20px;
          transition: all 0.3s ease;
        }

        .sidebar.collapsed .sidebar-header {
          padding-bottom: 10px;
        }

        .profile-image {
          width: 60px;
          height: 60px;
          border-radius: 50%;
          object-fit: cover;
          margin-bottom: 10px;
          transition: all 0.3s ease;
        }

        .sidebar.collapsed .profile-image {
          width: 40px;
          height: 40px;
          margin-bottom: 5px;
        }

        .nav-link {
          color: #333;
          padding: 12px 15px;
          border-radius: 8px;
          margin: 5px 0;
          text-align: left;
          width: 100%;
          background: none;
          border: none;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: flex-start;
          transition: all 0.3s ease;
          position: relative;
        }

        .sidebar.collapsed .nav-link {
          padding: 12px 8px;
          justify-content: center;
        }

        .nav-link:hover {
          background-color: #e9ecef;
          transform: translateX(2px);
        }

        .nav-link.active {
          background-color: #0d6efd;
          color: white;
        }

        .nav-link i {
          font-size: 16px;
          min-width: 20px;
        }

        .sidebar.collapsed .nav-link i {
          margin-right: 0 !important;
        }

        .main-content {
          flex: 1;
          margin-left: 280px;
          padding: 20px;
          transition: all 0.3s ease;
        }

        .main-content.sidebar-collapsed {
          margin-left: 70px;
        }

        .content-header {
          margin-bottom: 20px;
          padding-bottom: 10px;
          border-bottom: 1px solid #dee2e6;
        }

        .content-body {
          background-color: white;
        }

        .card {
          border: none;
          box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
          border-radius: 10px;
        }

        .table {
          margin-bottom: 0;
        }

        .badge {
          padding: 5px 10px;
        }

        .progress {
          height: 20px;
        }

        .text-truncate {
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .table-hover tbody tr:hover {
          background-color: #f8f9fa;
        }

        .btn-group-sm > .btn {
          padding: 0.25rem 0.5rem;
          font-size: 0.75rem;
        }

        /* Mobile Responsive */
        @media (max-width: 768px) {
          .sidebar {
            width: 280px;
            transform: translateX(-100%);
          }

          .sidebar:not(.collapsed) {
            transform: translateX(0);
            box-shadow: 0 0 20px rgba(0,0,0,0.3);
          }

          .sidebar.collapsed {
            transform: translateX(-100%);
          }

          .main-content,
          .main-content.sidebar-collapsed {
            margin-left: 0;
            padding: 10px;
          }

          .sidebar-toggle {
            left: 10px;
            top: 90px;
          }

          .content-header {
            margin-left: 50px;
          }
        }

        /* Smooth animations */
        @media (prefers-reduced-motion: no-preference) {
          .sidebar,
          .main-content,
          .nav-link,
          .sidebar-toggle {
            transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          }
        }

        /* Tooltips for collapsed sidebar */
        .sidebar.collapsed .nav-link {
          position: relative;
        }

        .sidebar.collapsed .nav-link:hover::after {
          content: attr(title);
          position: absolute;
          left: 70px;
          top: 50%;
          transform: translateY(-50%);
          background: #333;
          color: white;
          padding: 5px 10px;
          border-radius: 4px;
          font-size: 12px;
          white-space: nowrap;
          z-index: 1002;
          opacity: 0;
          animation: fadeIn 0.2s ease-in-out forwards;
        }

        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
      `}</style>
    </div>
  );
};

export default StudentDashboard;