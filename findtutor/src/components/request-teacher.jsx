import React, { useState, useEffect } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';

const RequestTeacher = ({ 
  teacherId, 
  teacherName, 
  classId = null, 
  subjectId = null, 
  className = null,
  onRequestSent = null,
  buttonSize = 'md',
  buttonVariant = 'primary',
  buttonText = 'Send Request'
}) => {
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [studentId, setStudentId] = useState(null);
  const [subjects, setSubjects] = useState([]);
  
  const [formData, setFormData] = useState({
    subject_id: subjectId || '',
    message: '',
    budget: '',
    location: ''
  });

  const API_BASE_URL = 'http://145.223.21.62:5000';

  // Default subjects - you should fetch these from your API
  const defaultSubjects = [
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

  useEffect(() => {
    // Get student ID from localStorage
    const userData = localStorage.getItem('user');
    if (userData) {
      try {
        const parsedUser = JSON.parse(userData);
        if (parsedUser.role === 'student') {
          fetchStudentId(parsedUser.user_id || parsedUser.id);
        }
      } catch (error) {
        console.error('Error parsing user data:', error);
      }
    }

    // Fetch subjects from API or use defaults
    fetchSubjects();
  }, []);

  useEffect(() => {
    // Set subject if provided as prop
    if (subjectId) {
      setFormData(prev => ({ ...prev, subject_id: subjectId }));
    }
  }, [subjectId]);

  const fetchStudentId = async (userId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/students`);
      if (response.ok) {
        const students = await response.json();
        const studentRecord = students.find(student => 
          student.user_id === parseInt(userId) || student.user_id === userId
        );
        if (studentRecord) {
          setStudentId(studentRecord.student_id);
        } else {
          setError('Student profile not found. Please complete your registration.');
        }
      }
    } catch (error) {
      console.error('Error fetching student ID:', error);
      setError('Failed to load student profile.');
    }
  };

  const fetchSubjects = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/subjects`);
      if (response.ok) {
        const subjectsData = await response.json();
        setSubjects(subjectsData);
      } else {
        // Use default subjects if API fails
        setSubjects(defaultSubjects);
      }
    } catch (error) {
      console.error('Error fetching subjects:', error);
      setSubjects(defaultSubjects);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!studentId) {
      setError('Student profile not found. Please log in again.');
      return;
    }

    if (!teacherId) {
      setError('Teacher ID is required.');
      return;
    }

    if (!formData.subject_id) {
      setError('Please select a subject.');
      return;
    }

    if (!formData.message.trim()) {
      setError('Please enter a message.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const requestData = {
        student_id: studentId,
        teacher_id: teacherId,
        subject_id: parseInt(formData.subject_id),
        class_id: classId,
        message: formData.message.trim(),
        budget: formData.budget ? parseFloat(formData.budget) : null,
        location: formData.location.trim() || null
      };

      console.log('Sending request:', requestData);

      const response = await fetch(`${API_BASE_URL}/api/requests`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `Failed to send request: ${response.status}`);
      }

      const result = await response.json();
      console.log('Request sent successfully:', result);

      setSuccess('Request sent successfully! The teacher will be notified.');
      
      // Reset form
      setFormData({
        subject_id: subjectId || '',
        message: '',
        budget: '',
        location: ''
      });

      // Call callback if provided
      if (onRequestSent) {
        onRequestSent(result);
      }

      // Close modal after a delay to show success message
      setTimeout(() => {
        setShowModal(false);
        setSuccess('');
      }, 2000);

    } catch (error) {
      console.error('Error sending request:', error);
      setError(error.message || 'Failed to send request. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setError('');
    setSuccess('');
    setFormData({
      subject_id: subjectId || '',
      message: '',
      budget: '',
      location: ''
    });
  };

  const getButtonSizeClass = () => {
    switch (buttonSize) {
      case 'sm': return 'btn-sm';
      case 'lg': return 'btn-lg';
      default: return '';
    }
  };

  const getSubjectName = (subjectId) => {
    const subject = subjects.find(s => s.id === parseInt(subjectId));
    return subject ? subject.name : 'Unknown Subject';
  };

  return (
    <>
      {/* Request Button */}
      <button
        className={`btn btn-${buttonVariant} ${getButtonSizeClass()}`}
        onClick={() => setShowModal(true)}
        disabled={!studentId}
        title={!studentId ? 'Please log in as a student to send requests' : `Send request to ${teacherName}`}
      >
        <i className="bi bi-send me-2"></i>
        {buttonText}
      </button>

      {/* Request Modal */}
      {showModal && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-lg modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">
                  <i className="bi bi-send me-2"></i>
                  Send Request to {teacherName}
                </h5>
                <button 
                  type="button" 
                  className="btn-close" 
                  onClick={handleCloseModal}
                  disabled={loading}
                ></button>
              </div>
              
              <form onSubmit={handleSubmit}>
                <div className="modal-body">
                  {/* Class Info (if requesting for a specific class) */}
                  {className && (
                    <div className="alert alert-info" role="alert">
                      <i className="bi bi-info-circle me-2"></i>
                      You are requesting to join: <strong>{className}</strong>
                    </div>
                  )}

                  {/* Error Alert */}
                  {error && (
                    <div className="alert alert-danger" role="alert">
                      <i className="bi bi-exclamation-triangle-fill me-2"></i>
                      {error}
                    </div>
                  )}

                  {/* Success Alert */}
                  {success && (
                    <div className="alert alert-success" role="alert">
                      <i className="bi bi-check-circle-fill me-2"></i>
                      {success}
                    </div>
                  )}

                  <div className="row g-3">
                    {/* Subject Selection */}
                    <div className="col-12">
                      <label className="form-label">
                        <i className="bi bi-book me-1"></i>
                        Subject *
                      </label>
                      <select
                        className="form-select"
                        value={formData.subject_id}
                        onChange={(e) => handleInputChange('subject_id', e.target.value)}
                        required
                        disabled={!!subjectId} // Disable if subject is pre-selected
                      >
                        <option value="">Select a Subject</option>
                        {subjects.map((subject) => (
                          <option key={subject.id} value={subject.id}>
                            {subject.name}
                          </option>
                        ))}
                      </select>
                      {subjectId && (
                        <small className="form-text text-muted">
                          Subject pre-selected for this class
                        </small>
                      )}
                    </div>

                    {/* Message */}
                    <div className="col-12">
                      <label className="form-label">
                        <i className="bi bi-chat-text me-1"></i>
                        Message *
                      </label>
                      <textarea
                        className="form-control"
                        rows="4"
                        value={formData.message}
                        onChange={(e) => handleInputChange('message', e.target.value)}
                        placeholder="Tell the teacher about your learning goals, current level, and what you hope to achieve..."
                        required
                        maxLength="1000"
                      />
                      <small className="form-text text-muted">
                        {formData.message.length}/1000 characters
                      </small>
                    </div>

                    {/* Budget */}
                    <div className="col-md-6">
                      <label className="form-label">
                        <i className="bi bi-currency-dollar me-1"></i>
                        Budget per Hour (Optional)
                      </label>
                      <div className="input-group">
                        <span className="input-group-text">LKR</span>
                        <input
                          type="number"
                          className="form-control"
                          value={formData.budget}
                          onChange={(e) => handleInputChange('budget', e.target.value)}
                          placeholder="0.00"
                          step="0.01"
                          min="0"
                        />
                      </div>
                      <small className="form-text text-muted">
                        Your preferred hourly rate
                      </small>
                    </div>

                    {/* Location */}
                    <div className="col-md-6">
                      <label className="form-label">
                        <i className="bi bi-geo-alt me-1"></i>
                        Location (Optional)
                      </label>
                      <input
                        type="text"
                        className="form-control"
                        value={formData.location}
                        onChange={(e) => handleInputChange('location', e.target.value)}
                        placeholder="e.g., Online, New York, My place"
                        maxLength="255"
                      />
                      <small className="form-text text-muted">
                        Where you'd prefer to have lessons
                      </small>
                    </div>
                  </div>

                  {/* Request Summary */}
                  <div className="mt-4 p-3 bg-light rounded">
                    <h6 className="mb-2">
                      <i className="bi bi-list-check me-1"></i>
                      Request Summary
                    </h6>
                    <div className="row g-2">
                      <div className="col-md-6">
                        <small className="text-muted">Teacher:</small>
                        <div className="fw-bold">{teacherName}</div>
                      </div>
                      <div className="col-md-6">
                        <small className="text-muted">Subject:</small>
                        <div className="fw-bold">
                          {formData.subject_id ? getSubjectName(formData.subject_id) : 'Not selected'}
                        </div>
                      </div>
                      {className && (
                        <div className="col-md-6">
                          <small className="text-muted">Class:</small>
                          <div className="fw-bold">{className}</div>
                        </div>
                      )}
                      {formData.budget && (
                        <div className="col-md-6">
                          <small className="text-muted">Budget:</small>
                          <div className="fw-bold">LKR{parseFloat(formData.budget).toFixed(2)}/hour</div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="modal-footer">
                  <button 
                    type="button" 
                    className="btn btn-secondary" 
                    onClick={handleCloseModal}
                    disabled={loading}
                  >
                    <i className="bi bi-x-lg me-1"></i>
                    Cancel
                  </button>
                  <button 
                    type="submit" 
                    className="btn btn-primary"
                    disabled={loading || !formData.subject_id || !formData.message.trim()}
                  >
                    {loading ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                        Sending...
                      </>
                    ) : (
                      <>
                        <i className="bi bi-send me-2"></i>
                        Send Request
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        .modal {
          z-index: 1050;
        }

        .form-label {
          font-weight: 500;
          color: #1e293b;
          margin-bottom: 0.5rem;
        }

        .form-control, .form-select {
          border-radius: 0.5rem;
          border: 1px solid #e2e8f0;
          padding: 0.75rem;
          transition: all 0.3s ease;
        }

        .form-control:focus, .form-select:focus {
          border-color: #2563eb;
          box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
        }

        .btn {
          border-radius: 0.5rem;
          font-weight: 500;
          transition: all 0.3s ease;
        }

        .btn:hover {
          transform: translateY(-1px);
        }

        .alert {
          border-radius: 0.5rem;
        }

        .bg-light {
          background-color: #f8fafc !important;
        }

        .spinner-border-sm {
          width: 1rem;
          height: 1rem;
        }

        .input-group-text {
          background-color: #f8fafc;
          border-color: #e2e8f0;
        }

        .modal-content {
          border: none;
          box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
          border-radius: 1rem;
        }

        .modal-header {
          border-bottom: 1px solid #e2e8f0;
          padding: 1.5rem;
        }

        .modal-body {
          padding: 1.5rem;
        }

        .modal-footer {
          border-top: 1px solid #e2e8f0;
          padding: 1.5rem;
        }

        @media (max-width: 576px) {
          .modal-dialog {
            margin: 0.5rem;
          }
          
          .modal-content {
            border-radius: 0.5rem;
          }
        }
      `}</style>
    </>
  );
};

export default RequestTeacher;