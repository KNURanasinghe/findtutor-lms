import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';

const StudentPosts = () => {
  const navigate = useNavigate();
  const [showPostForm, setShowPostForm] = useState(false);
  const [loading, setLoading] = useState(true);
   const [user, setUser] = useState(null);
  const [newPost, setNewPost] = useState({
    subject: '',
    grade: '',
    description: '',
    budget: '',
    contact: ''
  });
  const [studentPosts, setStudentPosts] = useState([]);
  const [selectedSubject, setSelectedSubject] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  // Sample subjects
  const subjects = [
    'Mathematics', 'Physics', 'Chemistry', 'Biology',
    'English', 'History', 'Geography', 'Computer Science',
    'Economics', 'Business Studies', 'Art', 'Music'
  ];

  // Sample grades
  const grades = [
    'Grade 6', 'Grade 7', 'Grade 8', 'Grade 9', 'Grade 10',
    'Grade 11', 'Grade 12', 'A/L', 'O/L', 'University'
  ];

  // Sample student posts
  const sampleStudentPosts = [
    {
      id: 1,
      studentName: 'Sarah Johnson',
      subject: 'Mathematics',
      grade: 'Grade 10',
      description: 'Looking for a math tutor to help with algebra and geometry. Need help with exam preparation.',
      budget: 'LKR 1500/hr',
      contact: 'sarah.j@email.com',
      postedDate: '2 days ago',
      location: 'Colombo'
    },
    {
      id: 2,
      studentName: 'Michael Brown',
      subject: 'Physics',
      grade: 'A/L',
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
          
          // Check if user is a student
          if (parsedUser.role !== 'student') {
            alert('Access denied. This page is for students only.');
            navigate('/login/student');
            return;
          }
          
          setUser(parsedUser);
          setNewPost(prev => ({
            ...prev,
            contact: parsedUser.email || ''
          }));
        } else {
          navigate('/login/student');
        }
      } catch (error) {
        console.error('Error loading user data:', error);
        navigate('/login/student');
      } finally {
        setLoading(false);
      }
    };

    loadUserData();
  }, [navigate]);

  useEffect(() => {
    setStudentPosts(sampleStudentPosts);
  }, []);

  const handlePostSubmit = (e) => {
    e.preventDefault();
    const post = {
      id: studentPosts.length + 1,
      studentName: user.name, // Replace with actual user name
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

  return (
    <div className="student-posts-page">
      {/* Hero Section */}
      <section className="hero-section">
        <div className="container">
          <div className="row justify-content-center">
            <div className="col-lg-8 text-center">
              <h1 className="display-4 fw-bold mb-4">Find Your Perfect Teacher</h1>
              <p className="lead mb-5">
                Post your requirements and let teachers find you. Or browse existing posts to connect with students.
              </p>
              <button 
                className="btn btn-primary btn-lg"
                onClick={() => setShowPostForm(true)}
              >
                <i className="bi bi-plus-circle me-2"></i>
                Create New Post
              </button>
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
                      <option key={subject} value={subject}>
                        {subject}
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

      {/* Post Form */}
      {showPostForm && (
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
                          <option key={subject} value={subject}>
                            {subject}
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

      {/* Posts List */}
      <section className="posts-section">
        <div className="container">
          <div className="posts-list">
            {filteredPosts.map((post) => (
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
                  <button className="btn btn-outline-primary btn-sm">
                    <i className="bi bi-chat-dots me-1"></i>
                    Contact Student
                  </button>
                </div>
              </div>
            ))}
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