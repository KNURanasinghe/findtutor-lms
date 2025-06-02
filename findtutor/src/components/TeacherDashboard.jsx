import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import UniversalProfile from './profilePage';

const TeacherDashboard = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('requests');
  
  // State for requests
  const [studentRequests, setStudentRequests] = useState([]);
  const [requestsLoading, setRequestsLoading] = useState(true);
  const [requestsError, setRequestsError] = useState(null);
  const [teacherId, setTeacherId] = useState(null);

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
    }
  }, [teacherId]);

  // Fetch teacher ID from teachers API using user_id
  const fetchTeacherId = async () => {
    try {
      if (!user?.user_id && !user?.id) {
        console.error('No user ID found');
        return;
      }

      const userId = user.user_id || user.id;
      console.log('Fetching teacher ID for user:', userId);

      const response = await fetch('http://145.223.21.62:5000/api/teachers');
      
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
      
      const response = await fetch(`http://145.223.21.62:5000/api/requests?teacher_id=${teacherId}`);
      
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

  // Handle request status update (accept/decline)
  const handleRequestAction = async (requestId, newStatus) => {
    try {
      console.log(`Updating request ${requestId} to status: ${newStatus}`);
      
      const response = await fetch(`http://145.223.21.62:5000/api/requests/${requestId}`, {
        method: 'PUT',
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

  // Mock data for classes
  const classes = [
    {
      id: 1,
      subject: 'Mathematics',
      students: 5,
      schedule: 'Mon, Wed 10:00 AM',
      status: 'active'
    },
    {
      id: 2,
      subject: 'Physics',
      students: 3,
      schedule: 'Tue, Thu 2:00 PM',
      status: 'active'
    }
  ];

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
      {/* Sidebar */}
      <div className="sidebar">
        <div className="sidebar-header">
          <img
            src={user?.profile_picture || 'https://via.placeholder.com/100'}
            alt="Profile"
            className="profile-image"
          />
          <h5>{user?.name || 'Teacher Name'}</h5>
          <p className="text-muted">Teacher</p>
          {teacherId && (
            <small className="text-muted">ID: {teacherId}</small>
          )}
        </div>

        <ul className="nav flex-column">
          <li className="nav-item">
            <button
              className={`nav-link ${activeTab === 'requests' ? 'active' : ''}`}
              onClick={() => setActiveTab('requests')}
            >
              <i className="bi bi-envelope me-2"></i>
              Student Requests
              {studentRequests.length > 0 && (
                <span className="badge bg-primary ms-2">{studentRequests.length}</span>
              )}
            </button>
          </li>
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
              className={`nav-link ${activeTab === 'classes' ? 'active' : ''}`}
              onClick={() => setActiveTab('classes')}
            >
              <i className="bi bi-book me-2"></i>
              Classes
            </button>
          </li>
          <li className="nav-item">
            <button
              className={`nav-link ${activeTab === 'location' ? 'active' : ''}`}
              onClick={() => setActiveTab('location')}
            >
              <i className="bi bi-geo-alt me-2"></i>
              Location
            </button>
          </li>
          <li className="nav-item mt-3">
            <button
              className="nav-link text-danger"
              onClick={handleLogout}
            >
              <i className="bi bi-box-arrow-right me-2"></i>
              Logout
            </button>
          </li>
        </ul>
      </div>

      {/* Main Content */}
      <main className="main-content">
        <div className="content-header">
          <h1>
            {activeTab === 'requests' && 'Student Requests'}
            {activeTab === 'profile' && 'Profile Management'}
            {activeTab === 'classes' && 'Class Management'}
            {activeTab === 'location' && 'Location Management'}
          </h1>
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
                                ${request.budget ? parseFloat(request.budget).toFixed(2) : '0.00'}
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
            // <div className="card">
            //   <div className="card-body">
            //     <h5 className="card-title">Profile Information</h5>
            //     <div className="row">
            //       <div className="col-md-6">
            //         <div className="mb-3">
            //           <label className="form-label">Name</label>
            //           <input type="text" className="form-control" value={profileData.name} readOnly />
            //         </div>
            //         <div className="mb-3">
            //           <label className="form-label">Email</label>
            //           <input type="email" className="form-control" value={profileData.email} readOnly />
            //         </div>
            //         <div className="mb-3">
            //           <label className="form-label">Subjects</label>
            //           <input type="text" className="form-control" value={profileData.subjects.join(', ')} readOnly />
            //         </div>
            //       </div>
            //       <div className="col-md-6">
            //         <div className="mb-3">
            //           <label className="form-label">Experience</label>
            //           <input type="text" className="form-control" value={profileData.experience} readOnly />
            //         </div>
            //         <div className="mb-3">
            //           <label className="form-label">Rating</label>
            //           <input type="text" className="form-control" value={profileData.rating} readOnly />
            //         </div>
            //         <div className="mb-3">
            //           <label className="form-label">Total Students</label>
            //           <input type="text" className="form-control" value={profileData.totalStudents} readOnly />
            //         </div>
            //       </div>
            //     </div>
            //     <button 
            //       className="btn btn-primary"
            //       onClick={() => navigate('/profile')}
            //     >
            //       Edit Profile
            //     </button>
            //   </div>
            // </div>
            <UniversalProfile/>
          )}

          {activeTab === 'classes' && (
            <div className="card">
              <div className="card-body">
                <h5 className="card-title">Class Management</h5>
                <div className="table-responsive">
                  <table className="table">
                    <thead>
                      <tr>
                        <th>Subject</th>
                        <th>Students</th>
                        <th>Schedule</th>
                        <th>Status</th>
                        <th>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {classes.map(cls => (
                        <tr key={cls.id}>
                          <td>{cls.subject}</td>
                          <td>{cls.students}</td>
                          <td>{cls.schedule}</td>
                          <td>
                            <span className="badge bg-success">{cls.status}</span>
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
                <button className="btn btn-primary mt-3">Add New Class</button>
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

      <style jsx>{`
        .dashboard-container {
          display: flex;
          min-height: 100vh;
          padding-top: 120px; /* Height of the header */
        }

        .sidebar {
          width: 280px;
          background-color: #f8f9fa;
          padding: 20px;
          position: fixed;
          height: calc(100vh - 80px);
          overflow-y: auto;
          border-right: 1px solid #dee2e6;
          padding-top: 120px;
        }

        .sidebar-header {
          text-align: center;
          padding-bottom: 20px;
          border-bottom: 1px solid #dee2e6;
          margin-bottom: 20px;
        }

        .profile-image {
          width: 100px;
          height: 100px;
          border-radius: 50%;
          object-fit: cover;
          margin-bottom: 10px;
        }

        .nav-link {
          color: #333;
          padding: 10px 15px;
          border-radius: 5px;
          margin: 5px 0;
          text-align: left;
          width: 100%;
          background: none;
          border: none;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .nav-link:hover {
          background-color: #e9ecef;
        }

        .nav-link.active {
          background-color: #0d6efd;
          color: white;
        }

        .main-content {
          flex: 1;
          margin-left: 280px;
          padding: 20px;
        }

        .content-header {
          margin-bottom: 20px;
          padding-bottom: 10px;
          border-bottom: 1px solid #dee2e6;
          display: flex;
          justify-content: space-between;
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

        @media (max-width: 768px) {
          .sidebar {
            width: 100%;
            position: relative;
            height: auto;
          }

          .main-content {
            margin-left: 0;
          }

          .dashboard-container {
            flex-direction: column;
          }

          .content-header {
            flex-direction: column;
            align-items: flex-start;
            gap: 10px;
          }
        }
      `}</style>
    </div>
  );
};

export default TeacherDashboard;