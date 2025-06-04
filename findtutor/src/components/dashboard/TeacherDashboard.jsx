import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import UniversalProfile from '../profilePage';

const TeacherDashboard = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('requests');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  
  // State for requests
  const [studentRequests, setStudentRequests] = useState([]);
  const [requestsLoading, setRequestsLoading] = useState(true);
  const [requestsError, setRequestsError] = useState(null);
  const [teacherId, setTeacherId] = useState(null);

  // State for classes
  const [classes, setClasses] = useState([]);
  const [classesLoading, setClassesLoading] = useState(false);
  const [classesError, setClassesError] = useState(null);
  const [showClassModal, setShowClassModal] = useState(false);
  const [editingClass, setEditingClass] = useState(null);
  const [classFormLoading, setClassFormLoading] = useState(false);
  const [classFormData, setClassFormData] = useState({
    title: '',
    subject_id: '',
    description: '',
    price: '',
    location: '',
    lat: '',
    lng: '',
    is_online: false
  });

  // Sample subjects with IDs (you should get these from your API)
  const subjects = [
    { id: 1, name: 'Mathematics' },
    { id: 2, name: 'Physics' },
    { id: 3, name: 'Chemistry' },
    { id: 4, name: 'Biology' },
    { id: 5, name: 'English' },
    { id: 6, name: 'History' },
    { id: 7, name: 'Geography' },
    { id: 8, name: 'Computer Science' },
    { id: 9, name: 'Economics' },
    { id: 10, name: 'Business Studies' },
    { id: 11, name: 'Art' },
    { id: 12, name: 'Music' }
  ];

  const API_BASE_URL = 'http://145.223.21.62:5000';

  useEffect(() => {
    // Check if user is logged in and is a teacher
    if (!user || user.role !== 'teacher') {
      navigate('/login/teacher');
    } else {
      // Fetch teacher ID when user is available
      fetchTeacherId();
    }
  }, [user, navigate]);

  useEffect(() => {
    // Fetch requests when teacher ID is available
    if (teacherId) {
      fetchStudentRequests();
      fetchClasses();
    }
  }, [teacherId]);

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

  // Fetch teacher ID from teachers API using user_id
  const fetchTeacherId = async () => {
    try {
      if (!user?.user_id && !user?.id) {
        console.error('No user ID found');
        return;
      }

      const userId = user.user_id || user.id;
      console.log('Fetching teacher ID for user:', userId);

      const response = await fetch(`${API_BASE_URL}/api/teachers`);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch teachers: ${response.status}`);
      }
      
      const teachers = await response.json();
      const teacherRecord = teachers.find(teacher => 
        teacher.user_id === parseInt(userId) || teacher.user_id === userId
      );
      
      if (teacherRecord) {
        console.log('Found teacher record:', teacherRecord);
        setTeacherId(teacherRecord.teacher_id);
      } else {
        console.error('Teacher record not found for user ID:', userId);
        setRequestsError('Teacher profile not found. Please complete your registration.');
      }
    } catch (error) {
      console.error('Error fetching teacher ID:', error);
      setRequestsError('Failed to load teacher profile.');
    }
  };

  // Fetch student requests for this teacher
  const fetchStudentRequests = async () => {
    try {
      setRequestsLoading(true);
      setRequestsError(null);
      
      console.log('Fetching requests for teacher ID:', teacherId);
      
      const response = await fetch(`${API_BASE_URL}/api/requests?teacher_id=${teacherId}`);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch requests: ${response.status}`);
      }
      
      const requests = await response.json();
      console.log('Fetched requests:', requests);
      setStudentRequests(requests);
    } catch (error) {
      console.error('Error fetching student requests:', error);
      setRequestsError('Failed to load student requests.');
      setStudentRequests([]);
    } finally {
      setRequestsLoading(false);
    }
  };

  // Fetch classes for this teacher
  const fetchClasses = async () => {
    try {
      setClassesLoading(true);
      setClassesError(null);
      
      console.log('Fetching classes for teacher ID:', teacherId);
      
      const response = await fetch(`${API_BASE_URL}/api/classes?teacher_id=${teacherId}`);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch classes: ${response.status}`);
      }
      
      const classesData = await response.json();
      console.log('Fetched classes:', classesData);
      setClasses(classesData);
    } catch (error) {
      console.error('Error fetching classes:', error);
      setClassesError('Failed to load classes.');
      setClasses([]);
    } finally {
      setClassesLoading(false);
    }
  };

  // Create new class
  const createClass = async (classData) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/classes`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          teacher_id: teacherId,
          ...classData,
          price: parseFloat(classData.price),
          lat: classData.lat ? parseFloat(classData.lat) : null,
          lng: classData.lng ? parseFloat(classData.lng) : null,
          subject_id: parseInt(classData.subject_id)
        })
      });

      if (!response.ok) {
        throw new Error(`Failed to create class: ${response.status}`);
      }

      const result = await response.json();
      return result;
    } catch (error) {
      console.error('Error creating class:', error);
      throw error;
    }
  };

  // Update class
  const updateClass = async (classId, classData) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/classes/${classId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...classData,
          price: classData.price ? parseFloat(classData.price) : undefined,
          lat: classData.lat ? parseFloat(classData.lat) : undefined,
          lng: classData.lng ? parseFloat(classData.lng) : undefined,
          subject_id: classData.subject_id ? parseInt(classData.subject_id) : undefined
        })
      });

      if (!response.ok) {
        throw new Error(`Failed to update class: ${response.status}`);
      }

      const result = await response.json();
      return result;
    } catch (error) {
      console.error('Error updating class:', error);
      throw error;
    }
  };

  // Delete class
  const deleteClass = async (classId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/classes/${classId}`, {
        method: 'DELETE'
      });

      if (!response.ok) {
        throw new Error(`Failed to delete class: ${response.status}`);
      }

      return true;
    } catch (error) {
      console.error('Error deleting class:', error);
      throw error;
    }
  };

  // Handle class form submission
  const handleClassSubmit = async (e) => {
    e.preventDefault();
    setClassFormLoading(true);

    try {
      if (editingClass) {
        // Update existing class
        await updateClass(editingClass.id, classFormData);
        alert('Class updated successfully!');
      } else {
        // Create new class
        await createClass(classFormData);
        alert('Class created successfully!');
      }
      
      // Reset form and refresh classes
      setShowClassModal(false);
      setEditingClass(null);
      setClassFormData({
        title: '',
        subject_id: '',
        description: '',
        price: '',
        location: '',
        lat: '',
        lng: '',
        is_online: false
      });
      fetchClasses();
      
    } catch (error) {
      console.error('Error saving class:', error);
      alert('Failed to save class. Please try again.');
    } finally {
      setClassFormLoading(false);
    }
  };

  // Handle edit class
  const handleEditClass = (classItem) => {
    setEditingClass(classItem);
    setClassFormData({
      title: classItem.title || '',
      subject_id: classItem.subject_id || '',
      description: classItem.description || '',
      price: classItem.price || '',
      location: classItem.location || '',
      lat: classItem.lat || '',
      lng: classItem.lng || '',
      is_online: classItem.is_online || false
    });
    setShowClassModal(true);
  };

  // Handle delete class
  const handleDeleteClass = async (classId, className) => {
    if (window.confirm(`Are you sure you want to delete "${className}"? This action cannot be undone.`)) {
      try {
        await deleteClass(classId);
        alert('Class deleted successfully!');
        fetchClasses();
      } catch (error) {
        console.error('Error deleting class:', error);
        alert('Failed to delete class. Please try again.');
      }
    }
  };

  // Handle new class button
  const handleNewClass = () => {
    setEditingClass(null);
    setClassFormData({
      title: '',
      subject_id: '',
      description: '',
      price: '',
      location: '',
      lat: '',
      lng: '',
      is_online: false
    });
    setShowClassModal(true);
  };

  // Handle request status update (accept/decline)
  const handleRequestAction = async (requestId, newStatus) => {
    try {
      console.log(`Updating request ${requestId} to status: ${newStatus}`);
      
      const response = await fetch(`${API_BASE_URL}/api/requests/${requestId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          status: newStatus
        })
      });
      
      if (!response.ok) {
        throw new Error(`Failed to update request: ${response.status}`);
      }
      
      // Refresh requests after successful update
      fetchStudentRequests();
      
      console.log(`Request ${requestId} successfully updated to ${newStatus}`);
    } catch (error) {
      console.error('Error updating request:', error);
      alert('Failed to update request. Please try again.');
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

  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      return new Date(dateString).toLocaleDateString();
    } catch {
      return 'Invalid Date';
    }
  };

  // Get status badge class
  const getStatusBadgeClass = (status) => {
    switch (status?.toLowerCase()) {
      case 'pending':
        return 'bg-warning';
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

  // Get subject name by ID
  const getSubjectName = (subjectId) => {
    const subject = subjects.find(s => s.id === parseInt(subjectId));
    return subject ? subject.name : 'Unknown Subject';
  };

  // Mock data for locations
  const locations = [
    {
      id: 1,
      name: 'Main Teaching Center',
      address: '123 Education St, City',
      capacity: 10,
      status: 'active'
    },
    {
      id: 2,
      name: 'Online Sessions',
      platform: 'Zoom',
      status: 'active'
    }
  ];

  // Profile data
  const profileData = {
    name: user?.name || 'Teacher Name',
    email: user?.email || 'teacher@example.com',
    subjects: ['Mathematics', 'Physics'],
    experience: '10 years',
    rating: 4.8,
    totalStudents: 50
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
              <h5>{user?.name || 'Teacher Name'}</h5>
              <p className="text-muted">Teacher</p>
              {teacherId && (
                <small className="text-muted">ID: {teacherId}</small>
              )}
            </>
          )}
        </div>

        <ul className="nav flex-column">
          <li className="nav-item">
            <button
              className={`nav-link ${activeTab === 'requests' ? 'active' : ''}`}
              onClick={() => setActiveTab('requests')}
              title="Student Requests"
            >
              <i className="bi bi-envelope me-2"></i>
              {!sidebarCollapsed && (
                <>
                  Student Requests
                  {studentRequests.length > 0 && (
                    <span className="badge bg-primary ms-2">{studentRequests.length}</span>
                  )}
                </>
              )}
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
          <li className="nav-item">
            <button
              className={`nav-link ${activeTab === 'classes' ? 'active' : ''}`}
              onClick={() => setActiveTab('classes')}
              title="Classes"
            >
              <i className="bi bi-book me-2"></i>
              {!sidebarCollapsed && (
                <>
                  Classes
                  {classes.length > 0 && (
                    <span className="badge bg-secondary ms-2">{classes.length}</span>
                  )}
                </>
              )}
            </button>
          </li>
          <li className="nav-item">
            <button
              className={`nav-link ${activeTab === 'location' ? 'active' : ''}`}
              onClick={() => setActiveTab('location')}
              title="Location"
            >
              <i className="bi bi-geo-alt me-2"></i>
              {!sidebarCollapsed && 'Location'}
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
            {activeTab === 'requests' && 'Student Requests'}
            {activeTab === 'profile' && 'Profile Management'}
            {activeTab === 'classes' && 'Class Management'}
            {activeTab === 'location' && 'Location Management'}
          </h1>
          <div className="header-actions">
            {activeTab === 'requests' && (
              <button 
                className="btn btn-outline-primary btn-sm"
                onClick={fetchStudentRequests}
                disabled={requestsLoading}
              >
                <i className="bi bi-arrow-clockwise me-1"></i>
                Refresh
              </button>
            )}
            {activeTab === 'classes' && (
              <div>
                <button 
                  className="btn btn-outline-primary btn-sm me-2"
                  onClick={fetchClasses}
                  disabled={classesLoading}
                >
                  <i className="bi bi-arrow-clockwise me-1"></i>
                  Refresh
                </button>
                <button 
                  className="btn btn-primary btn-sm"
                  onClick={handleNewClass}
                >
                  <i className="bi bi-plus me-1"></i>
                  Add New Class
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="content-body">
          {activeTab === 'requests' && (
            <div className="card">
              <div className="card-body">
                <h5 className="card-title">
                  Student Requests
                  {teacherId && (
                    <small className="text-muted ms-2">(Teacher ID: {teacherId})</small>
                  )}
                </h5>
                
                {requestsLoading ? (
                  <div className="text-center py-4">
                    <div className="spinner-border text-primary" role="status">
                      <span className="visually-hidden">Loading...</span>
                    </div>
                    <p className="mt-2">Loading requests...</p>
                  </div>
                ) : requestsError ? (
                  <div className="alert alert-danger" role="alert">
                    <i className="bi bi-exclamation-triangle-fill me-2"></i>
                    {requestsError}
                    <button 
                      className="btn btn-outline-danger btn-sm ms-3"
                      onClick={fetchStudentRequests}
                    >
                      Try Again
                    </button>
                  </div>
                ) : studentRequests.length === 0 ? (
                  <div className="text-center py-4">
                    <i className="bi bi-inbox display-1 text-muted"></i>
                    <h5 className="mt-3">No student requests</h5>
                    <p className="text-muted">You don't have any student requests at the moment.</p>
                  </div>
                ) : (
                  <div className="table-responsive">
                    <table className="table">
                      <thead>
                        <tr>
                          <th>Student</th>
                          <th>Subject</th>
                          <th>Message</th>
                          <th>Budget</th>
                          <th>Location</th>
                          <th>Date</th>
                          <th>Status</th>
                          <th>Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {studentRequests.map(request => (
                          <tr key={request.id}>
                            <td>
                              <div className="d-flex align-items-center">
                                <img 
                                  src={request.student_profile_picture || 'https://via.placeholder.com/40'} 
                                  alt={request.student_name}
                                  className="rounded-circle me-2"
                                  style={{ width: '40px', height: '40px', objectFit: 'cover' }}
                                  onError={(e) => {
                                    e.target.src = 'https://via.placeholder.com/40';
                                  }}
                                />
                                <div>
                                  <div className="fw-bold">{request.student_name}</div>
                                  <small className="text-muted">ID: {request.student_id}</small>
                                </div>
                              </div>
                            </td>
                            <td>
                              <div>
                                <div className="fw-bold">{request.subject_name}</div>
                                {request.class_title && (
                                  <small className="text-muted">{request.class_title}</small>
                                )}
                              </div>
                            </td>
                            <td>
                              <div 
                                className="text-truncate" 
                                style={{ maxWidth: '150px' }}
                                title={request.message}
                              >
                                {request.message || 'No message'}
                              </div>
                            </td>
                            <td>
                              <div className="fw-bold text-success">
                                LKR{request.budget ? parseFloat(request.budget).toFixed(2) : '0.00'}
                              </div>
                            </td>
                            <td>{request.location || 'Not specified'}</td>
                            <td>{formatDate(request.created_at)}</td>
                            <td>
                              <span className={`badge ${getStatusBadgeClass(request.status)}`}>
                                {request.status || 'unknown'}
                              </span>
                            </td>
                            <td>
                              {request.status === 'pending' ? (
                                <div className="btn-group" role="group">
                                  <button 
                                    className="btn btn-sm btn-success"
                                    onClick={() => handleRequestAction(request.id, 'accepted')}
                                    title="Accept Request"
                                  >
                                    <i className="bi bi-check"></i>
                                  </button>
                                  <button 
                                    className="btn btn-sm btn-danger"
                                    onClick={() => handleRequestAction(request.id, 'declined')}
                                    title="Decline Request"
                                  >
                                    <i className="bi bi-x"></i>
                                  </button>
                                </div>
                              ) : (
                                <span className="text-muted">No action needed</span>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'profile' && (
            <UniversalProfile/>
          )}

          {activeTab === 'classes' && (
            <div className="card">
              <div className="card-body">
                <h5 className="card-title">Class Management</h5>
                
                {classesLoading ? (
                  <div className="text-center py-4">
                    <div className="spinner-border text-primary" role="status">
                      <span className="visually-hidden">Loading...</span>
                    </div>
                    <p className="mt-2">Loading classes...</p>
                  </div>
                ) : classesError ? (
                  <div className="alert alert-danger" role="alert">
                    <i className="bi bi-exclamation-triangle-fill me-2"></i>
                    {classesError}
                    <button 
                      className="btn btn-outline-danger btn-sm ms-3"
                      onClick={fetchClasses}
                    >
                      Try Again
                    </button>
                  </div>
                ) : classes.length === 0 ? (
                  <div className="text-center py-4">
                    <i className="bi bi-book display-1 text-muted"></i>
                    <h5 className="mt-3">No classes yet</h5>
                    <p className="text-muted">You haven't created any classes yet. Start by adding your first class!</p>
                    <button 
                      className="btn btn-primary"
                      onClick={handleNewClass}
                    >
                      <i className="bi bi-plus me-1"></i>
                      Create Your First Class
                    </button>
                  </div>
                ) : (
                  <div className="table-responsive">
                    <table className="table">
                      <thead>
                        <tr>
                          <th>Title</th>
                          <th>Subject</th>
                          <th>Description</th>
                          <th>Price</th>
                          <th>Location</th>
                          <th>Type</th>
                          <th>Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {classes.map(cls => (
                          <tr key={cls.id}>
                            <td className="fw-bold">{cls.title}</td>
                            <td>{getSubjectName(cls.subject_id)}</td>
                            <td>
                              <div 
                                className="text-truncate" 
                                style={{ maxWidth: '200px' }}
                                title={cls.description}
                              >
                                {cls.description || 'No description'}
                              </div>
                            </td>
                            <td className="fw-bold text-success">${parseFloat(cls.price || 0).toFixed(2)}</td>
                            <td>{cls.location || 'Not specified'}</td>
                            <td>
                              <span className={`badge ${cls.is_online ? 'bg-info' : 'bg-secondary'}`}>
                                {cls.is_online ? 'Online' : 'In-Person'}
                              </span>
                            </td>
                            <td>
                              <div className="btn-group" role="group">
                                <button 
                                  className="btn btn-sm btn-outline-primary"
                                  onClick={() => handleEditClass(cls)}
                                  title="Edit Class"
                                >
                                  <i className="bi bi-pencil"></i>
                                </button>
                                <button 
                                  className="btn btn-sm btn-outline-danger"
                                  onClick={() => handleDeleteClass(cls.id, cls.title)}
                                  title="Delete Class"
                                >
                                  <i className="bi bi-trash"></i>
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'location' && (
            <div className="card">
              <div className="card-body">
                <h5 className="card-title">Location Management</h5>
                <div className="table-responsive">
                  <table className="table">
                    <thead>
                      <tr>
                        <th>Name</th>
                        <th>Address/Platform</th>
                        <th>Capacity</th>
                        <th>Status</th>
                        <th>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {locations.map(location => (
                        <tr key={location.id}>
                          <td>{location.name}</td>
                          <td>{location.address || location.platform}</td>
                          <td>{location.capacity || 'N/A'}</td>
                          <td>
                            <span className="badge bg-success">{location.status}</span>
                          </td>
                          <td>
                            <button className="btn btn-sm btn-primary me-2">Edit</button>
                            <button className="btn btn-sm btn-danger">Delete</button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <button className="btn btn-primary mt-3">Add New Location</button>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Class Modal */}
      {showClassModal && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-lg modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">
                  {editingClass ? 'Edit Class' : 'Create New Class'}
                </h5>
                <button 
                  type="button" 
                  className="btn-close" 
                  onClick={() => setShowClassModal(false)}
                ></button>
              </div>
              <form onSubmit={handleClassSubmit}>
                <div className="modal-body">
                  <div className="row g-3">
                    <div className="col-md-6">
                      <label className="form-label">Title *</label>
                      <input
                        type="text"
                        className="form-control"
                        value={classFormData.title}
                        onChange={(e) => setClassFormData({...classFormData, title: e.target.value})}
                        placeholder="e.g., Advanced Mathematics"
                        required
                      />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label">Subject *</label>
                      <select
                        className="form-select"
                        value={classFormData.subject_id}
                        onChange={(e) => setClassFormData({...classFormData, subject_id: e.target.value})}
                        required
                      >
                        <option value="">Select a Subject</option>
                        {subjects.map((subject) => (
                          <option key={subject.id} value={subject.id}>
                            {subject.name}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="col-12">
                      <label className="form-label">Description</label>
                      <textarea
                        className="form-control"
                        rows="3"
                        value={classFormData.description}
                        onChange={(e) => setClassFormData({...classFormData, description: e.target.value})}
                        placeholder="Describe your class, topics covered, and teaching approach..."
                      ></textarea>
                    </div>
                    <div className="col-md-6">
                      <label className="form-label">Price per Hour ($) *</label>
                      <input
                        type="number"
                        className="form-control"
                        value={classFormData.price}
                        onChange={(e) => setClassFormData({...classFormData, price: e.target.value})}
                        placeholder="e.g., 75.00"
                        step="0.01"
                        min="0"
                        required
                      />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label">Location</label>
                      <input
                        type="text"
                        className="form-control"
                        value={classFormData.location}
                        onChange={(e) => setClassFormData({...classFormData, location: e.target.value})}
                        placeholder="e.g., New York, Online"
                      />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label">Latitude (optional)</label>
                      <input
                        type="number"
                        className="form-control"
                        value={classFormData.lat}
                        onChange={(e) => setClassFormData({...classFormData, lat: e.target.value})}
                        placeholder="e.g., 40.7128"
                        step="any"
                      />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label">Longitude (optional)</label>
                      <input
                        type="number"
                        className="form-control"
                        value={classFormData.lng}
                        onChange={(e) => setClassFormData({...classFormData, lng: e.target.value})}
                        placeholder="e.g., -74.0060"
                        step="any"
                      />
                    </div>
                    <div className="col-12">
                      <div className="form-check">
                        <input
                          className="form-check-input"
                          type="checkbox"
                          id="isOnline"
                          checked={classFormData.is_online}
                          onChange={(e) => setClassFormData({...classFormData, is_online: e.target.checked})}
                        />
                        <label className="form-check-label" htmlFor="isOnline">
                          This is an online class
                        </label>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="modal-footer">
                  <button 
                    type="button" 
                    className="btn btn-secondary" 
                    onClick={() => setShowClassModal(false)}
                    disabled={classFormLoading}
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit" 
                    className="btn btn-primary"
                    disabled={classFormLoading}
                  >
                    {classFormLoading ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                        {editingClass ? 'Updating...' : 'Creating...'}
                      </>
                    ) : (
                      editingClass ? 'Update Class' : 'Create Class'
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

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
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .header-actions {
          display: flex;
          gap: 10px;
          align-items: center;
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

        .btn-group .btn {
          padding: 0.25rem 0.5rem;
        }

        .text-truncate {
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .modal {
          z-index: 1050;
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
            flex-direction: column;
            align-items: flex-start;
            gap: 10px;
            margin-left: 50px;
          }

          .header-actions {
            width: 100%;
            justify-content: flex-start;
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

export default TeacherDashboard;