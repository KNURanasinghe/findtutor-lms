import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';

const StudentPosts = () => {
  const navigate = useNavigate();
  const [showPostForm, setShowPostForm] = useState(false);
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [selectedPost, setSelectedPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [requestLoading, setRequestLoading] = useState(false);
  const [user, setUser] = useState(null);
  const [newPost, setNewPost] = useState({
    subject: '',
    grade: '',
    description: '',
    budget: '',
    contact: ''
  });
  const [requestData, setRequestData] = useState({
    message: '',
    budget: '',
    location: ''
  });
  const [studentPosts, setStudentPosts] = useState([]);
  const [selectedSubject, setSelectedSubject] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  const API_BASE_URL = 'http://145.223.21.62:5000';

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

  // Sample grades
  const grades = [
    'Grade 6', 'Grade 7', 'Grade 8', 'Grade 9', 'Grade 10',
    'Grade 11', 'Grade 12', 'A/L', 'O/L', 'University'
  ];

  // Sample student posts with IDs
  const sampleStudentPosts = [
    {
      id: 1,
      student_id: 1,
      studentName: 'Sarah Johnson',
      subject: 'Mathematics',
      subject_id: 1,
      grade: 'Grade 10',
      class_id: 1,
      description: 'Looking for a math tutor to help with algebra and geometry. Need help with exam preparation.',
      budget: 'LKR 1500/hr',
      contact: 'sarah.j@email.com',
      postedDate: '2 days ago',
      location: 'Colombo'
    },
    {
      id: 2,
      student_id: 2,
      studentName: 'Michael Brown',
      subject: 'Physics',
      subject_id: 2,
      grade: 'A/L',
      class_id: 2,
      description: 'Need an experienced physics teacher for advanced level preparation. Focus on mechanics and electricity.',
      budget: 'LKR 2000/hr',
      contact: 'michael.b@email.com',
      postedDate: '1 day ago',
      location: 'Kandy'
    }
  ];

  useEffect(() => {
    const loadUserData = () => {
      try {
        const userData = localStorage.getItem('user');
        if (userData) {
          const parsedUser = JSON.parse(userData);
          
          // Allow both students and teachers to access the page
          if (parsedUser.role !== 'student' && parsedUser.role !== 'teacher') {
            alert('Access denied. Please login as a student or teacher.');
            navigate('/login');
            return;
          }
          
          setUser(parsedUser);
          
          // Only set contact for students (for creating posts)
          if (parsedUser.role === 'student') {
            setNewPost(prev => ({
              ...prev,
              contact: parsedUser.email || ''
            }));
          }
        } else {
          navigate('/login');
        }
      } catch (error) {
        console.error('Error loading user data:', error);
        navigate('/login');
      } finally {
        setLoading(false);
      }
    };

    loadUserData();
  }, [navigate]);

  useEffect(() => {
    setStudentPosts(sampleStudentPosts);
  }, []);

  // Create request function
  const createRequest = async (requestPayload) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/requests`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestPayload)
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      return result;
    } catch (error) {
      console.error('Error creating request:', error);
      throw error;
    }
  };

  // Handle request submission
  const handleRequestSubmit = async (e) => {
    e.preventDefault();
    setRequestLoading(true);

    try {
      if (!selectedPost || !user) {
        throw new Error('Missing required data');
      }

      const requestPayload = {
        student_id: selectedPost.student_id,
        teacher_id: user.id, // Assuming teacher ID is stored in user.id
        subject_id: selectedPost.subject_id,
        class_id: selectedPost.class_id || null,
        message: requestData.message,
        budget: parseFloat(requestData.budget) || null,
        location: requestData.location || selectedPost.location
      };

      const result = await createRequest(requestPayload);
      
      alert('Request sent successfully!');
      setShowRequestModal(false);
      setRequestData({ message: '', budget: '', location: '' });
      setSelectedPost(null);
      
    } catch (error) {
      console.error('Error sending request:', error);
      alert('Failed to send request. Please try again.');
    } finally {
      setRequestLoading(false);
    }
  };

  // Handle contact student button click
  const handleContactStudent = (post) => {
    if (user?.role === 'teacher') {
      setSelectedPost(post);
      setRequestData(prev => ({
        ...prev,
        location: post.location,
        budget: post.budget.replace(/[^\d.]/g, '') // Extract numeric value from budget
      }));
      setShowRequestModal(true);
    } else {
      // For students, just show contact info or redirect to messaging
      alert(`Contact: ${post.contact}`);
    }
  };

  const handlePostSubmit = (e) => {
    e.preventDefault();
    
    // Only allow students to create posts
    if (user.role !== 'student') {
      alert('Only students can create posts.');
      return;
    }
    
    const post = {
      id: studentPosts.length + 1,
      student_id: user.id,
      studentName: user.name,
      subject_id: subjects.find(s => s.name === newPost.subject)?.id || 1,
      class_id: 1, // You might want to make this dynamic
      ...newPost,
      postedDate: 'Just now',
      location: 'Not specified'
    };
    setStudentPosts([post, ...studentPosts]);
    setShowPostForm(false);
    setNewPost({
      subject: '',
      grade: '',
      description: '',
      budget: '',
      contact: ''
    });
  };

  const filteredPosts = studentPosts.filter(post => {
    const matchesSubject = !selectedSubject || post.subject === selectedSubject;
    const matchesSearch = !searchQuery || 
      post.studentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSubject && matchesSearch;
  });

  // Show loading state
  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ height: '100vh' }}>
        <div className="spinner-border" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="student-posts-page">
      {/* Hero Section */}
      <section className="hero-section">
        <div className="container">
          <div className="row justify-content-center">
            <div className="col-lg-8 text-center">
              <h1 className="display-4 fw-bold mb-4">
                {user?.role === 'student' ? 'Find Your Perfect Teacher' : 'Connect with Students'}
              </h1>
              <p className="lead mb-5">
                {user?.role === 'student' 
                  ? 'Post your requirements and let teachers find you. Or browse existing posts to connect with students.'
                  : 'Browse student posts and connect with those seeking tutoring in your expertise.'
                }
              </p>
              {/* Only show Create Post button for students */}
              {user?.role === 'student' && (
                <button 
                  className="btn btn-primary btn-lg"
                  onClick={() => setShowPostForm(true)}
                >
                  <i className="bi bi-plus-circle me-2"></i>
                  Create New Post
                </button>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Search Section */}
      <section className="search-section">
        <div className="container">
          <div className="search-card">
            <div className="row g-3">
              <div className="col-md-6">
                <div className="form-group">
                  <label className="form-label">Filter by Subject</label>
                  <select
                    className="form-select"
                    value={selectedSubject}
                    onChange={(e) => setSelectedSubject(e.target.value)}
                  >
                    <option value="">All Subjects</option>
                    {subjects.map((subject) => (
                      <option key={subject.id} value={subject.name}>
                        {subject.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="col-md-6">
                <div className="form-group">
                  <label className="form-label">Search Posts</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Search by name or description..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Post Form - Only show for students */}
      {showPostForm && user?.role === 'student' && (
        <section className="post-form-section">
          <div className="container">
            <div className="post-form-card">
              <div className="d-flex justify-content-between align-items-center mb-4">
                <h2 className="form-title">Create New Post</h2>
                <button 
                  className="btn btn-outline-secondary"
                  onClick={() => setShowPostForm(false)}
                >
                  <i className="bi bi-x-lg"></i>
                </button>
              </div>
              <form onSubmit={handlePostSubmit}>
                <div className="row g-3">
                  <div className="col-md-6">
                    <div className="form-group">
                      <label className="form-label">Subject</label>
                      <select
                        className="form-select"
                        value={newPost.subject}
                        onChange={(e) => setNewPost({...newPost, subject: e.target.value})}
                        required
                      >
                        <option value="">Select a Subject</option>
                        {subjects.map((subject) => (
                          <option key={subject.id} value={subject.name}>
                            {subject.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="form-group">
                      <label className="form-label">Grade</label>
                      <select
                        className="form-select"
                        value={newPost.grade}
                        onChange={(e) => setNewPost({...newPost, grade: e.target.value})}
                        required
                      >
                        <option value="">Select Grade</option>
                        {grades.map((grade) => (
                          <option key={grade} value={grade}>
                            {grade}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <div className="col-12">
                    <div className="form-group">
                      <label className="form-label">Description</label>
                      <textarea
                        className="form-control"
                        rows="3"
                        value={newPost.description}
                        onChange={(e) => setNewPost({...newPost, description: e.target.value})}
                        placeholder="Describe what you're looking for in a teacher..."
                        required
                      ></textarea>
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="form-group">
                      <label className="form-label">Budget (per hour)</label>
                      <input
                        type="text"
                        className="form-control"
                        value={newPost.budget}
                        onChange={(e) => setNewPost({...newPost, budget: e.target.value})}
                        placeholder="e.g., LKR 1500"
                        required
                      />
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="form-group">
                      <label className="form-label">Contact Information</label>
                      <input
                        type="text"
                        className="form-control"
                        value={newPost.contact}
                        onChange={(e) => setNewPost({...newPost, contact: e.target.value})}
                        placeholder="Email or phone number"
                        required
                      />
                    </div>
                  </div>
                </div>
                <div className="text-end mt-4">
                  <button type="button" className="btn btn-outline-secondary me-2" onClick={() => setShowPostForm(false)}>
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary">
                    Post Request
                  </button>
                </div>
              </form>
            </div>
          </div>
        </section>
      )}

      {/* Request Modal - For teachers to send requests */}
      {showRequestModal && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Send Tutoring Request</h5>
                <button 
                  type="button" 
                  className="btn-close" 
                  onClick={() => setShowRequestModal(false)}
                ></button>
              </div>
              <form onSubmit={handleRequestSubmit}>
                <div className="modal-body">
                  {selectedPost && (
                    <div className="mb-3">
                      <div className="alert alert-info">
                        <strong>Student:</strong> {selectedPost.studentName}<br/>
                        <strong>Subject:</strong> {selectedPost.subject}<br/>
                        <strong>Grade:</strong> {selectedPost.grade}
                      </div>
                    </div>
                  )}
                  <div className="mb-3">
                    <label className="form-label">Message *</label>
                    <textarea
                      className="form-control"
                      rows="3"
                      value={requestData.message}
                      onChange={(e) => setRequestData({...requestData, message: e.target.value})}
                      placeholder="Introduce yourself and explain how you can help..."
                      required
                    ></textarea>
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Your Rate (LKR per hour)</label>
                    <input
                      type="number"
                      className="form-control"
                      value={requestData.budget}
                      onChange={(e) => setRequestData({...requestData, budget: e.target.value})}
                      placeholder="e.g., 1500"
                      step="0.01"
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Preferred Location</label>
                    <input
                      type="text"
                      className="form-control"
                      value={requestData.location}
                      onChange={(e) => setRequestData({...requestData, location: e.target.value})}
                      placeholder="e.g., Online, Colombo, etc."
                    />
                  </div>
                </div>
                <div className="modal-footer">
                  <button 
                    type="button" 
                    className="btn btn-secondary" 
                    onClick={() => setShowRequestModal(false)}
                    disabled={requestLoading}
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit" 
                    className="btn btn-primary"
                    disabled={requestLoading}
                  >
                    {requestLoading ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                        Sending...
                      </>
                    ) : (
                      'Send Request'
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Posts List */}
      <section className="posts-section">
        <div className="container">
          <div className="posts-list">
            {filteredPosts.length > 0 ? (
              filteredPosts.map((post) => (
                <div key={post.id} className="post-card">
                  <div className="post-header">
                    <div className="post-meta">
                      <span className="student-name">{post.studentName}</span>
                      <span className="post-date">{post.postedDate}</span>
                    </div>
                    <div className="post-subject">
                      <span className="subject-badge">{post.subject}</span>
                      <span className="grade-badge">{post.grade}</span>
                    </div>
                  </div>
                  <div className="post-content">
                    <p className="post-description">{post.description}</p>
                    <div className="post-details">
                      <span><i className="bi bi-geo-alt"></i> {post.location}</span>
                      <span><i className="bi bi-cash"></i> {post.budget}</span>
                    </div>
                  </div>
                  <div className="post-footer">
                    <div className="contact-info">
                      <i className="bi bi-envelope"></i>
                      <span>{post.contact}</span>
                    </div>
                    <button 
                      className="btn btn-outline-primary btn-sm"
                      onClick={() => handleContactStudent(post)}
                    >
                      <i className="bi bi-chat-dots me-1"></i>
                      {user?.role === 'teacher' ? 'Send Request' : 'View Details'}
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-5">
                <i className="bi bi-search display-1 text-muted mb-3"></i>
                <h3 className="text-muted">No posts found</h3>
                <p className="text-muted">Try adjusting your search criteria or check back later.</p>
              </div>
            )}
          </div>
        </div>
      </section>

      <style jsx>{`
        .student-posts-page {
          padding-top: 80px;
        }

        .hero-section {
          padding: 4rem 0;
          background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
        }

        .search-section {
          padding: 2rem 0;
          margin-top: -50px;
        }

        .search-card {
          background: white;
          padding: 1.5rem;
          border-radius: 1rem;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
        }

        .post-form-section {
          padding: 2rem 0;
        }

        .post-form-card {
          background: white;
          border-radius: 1rem;
          padding: 2rem;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
        }

        .form-title {
          font-size: 1.5rem;
          font-weight: 600;
          color: #1e293b;
          margin: 0;
        }

        .posts-section {
          padding: 2rem 0;
        }

        .posts-list {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .post-card {
          background: white;
          border-radius: 1rem;
          padding: 1.5rem;
          box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
          transition: all 0.3s ease;
        }

        .post-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 15px rgba(0, 0, 0, 0.15);
        }

        .post-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1rem;
        }

        .post-meta {
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
        }

        .student-name {
          font-weight: 600;
          color: #1e293b;
          font-size: 1.1rem;
        }

        .post-date {
          font-size: 0.75rem;
          color: #64748b;
        }

        .post-subject {
          display: flex;
          gap: 0.5rem;
        }

        .subject-badge {
          background: #e0f2fe;
          color: #0369a1;
          padding: 0.25rem 0.75rem;
          border-radius: 0.5rem;
          font-size: 0.75rem;
          font-weight: 500;
        }

        .grade-badge {
          background: #f0fdf4;
          color: #15803d;
          padding: 0.25rem 0.75rem;
          border-radius: 0.5rem;
          font-size: 0.75rem;
          font-weight: 500;
        }

        .post-content {
          margin-bottom: 1rem;
        }

        .post-description {
          color: #475569;
          font-size: 0.875rem;
          margin-bottom: 1rem;
          line-height: 1.5;
        }

        .post-details {
          display: flex;
          gap: 1rem;
          font-size: 0.75rem;
          color: #64748b;
        }

        .post-details i {
          color: #2563eb;
        }

        .post-footer {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding-top: 1rem;
          border-top: 1px solid #e2e8f0;
        }

        .contact-info {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          color: #64748b;
          font-size: 0.75rem;
        }

        .contact-info i {
          color: #2563eb;
        }

        .form-group {
          margin-bottom: 1rem;
        }

        .form-label {
          font-weight: 500;
          color: #1e293b;
          margin-bottom: 0.5rem;
        }

        .form-control,
        .form-select {
          padding: 0.75rem 1rem;
          border-radius: 0.5rem;
          border: 1px solid #e2e8f0;
          transition: all 0.3s ease;
        }

        .form-control:focus,
        .form-select:focus {
          border-color: #2563eb;
          box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
        }

        .modal {
          z-index: 1050;
        }

        @media (max-width: 768px) {
          .hero-section {
            padding: 3rem 0;
          }

          .search-section {
            margin-top: 0;
          }

          .post-header {
            flex-direction: column;
            align-items: flex-start;
            gap: 0.75rem;
          }

          .post-footer {
            flex-direction: column;
            gap: 1rem;
            align-items: flex-start;
          }
        }
      `}</style>
    </div>
  );
};

export default StudentPosts;