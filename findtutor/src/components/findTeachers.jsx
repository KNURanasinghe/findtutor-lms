import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';

const FindTeachers = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('');
  const [location, setLocation] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  // Add a separate state for all teachers and filtered teachers
  const [allTeachers, setAllTeachers] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isSearching, setIsSearching] = useState(false);
  const locationInputRef = useRef(null);
  const autocompleteRef = useRef(null);

  // Sample subjects - replace with your actual subjects
  const subjects = [
    'Mathematics', 'Physics', 'Chemistry', 'Biology',
    'English', 'History', 'Geography', 'Computer Science',
    'Economics', 'Business Studies', 'Art', 'Music'
  ];

  // Fetch all teachers on initial load
  const fetchTeachers = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Try the original endpoint first
      const response = await fetch('http://145.223.21.62:5000/api/teachers');
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const apiTeachers = await response.json();
      
      // Map API response to component structure
      const mappedTeachers = apiTeachers.map(teacher => ({
        id: teacher.teacher_id,
        user_id: teacher.user_id,
        name: teacher.name,
        subject: 'General', // Default since not provided by API
        rating: 4.5, // Default rating since not provided by API
        reviews: 0, // Default since not provided by API
        experience: `${teacher.years_experience} years`,
        location: teacher.location,
        image: teacher.profile_picture || 'https://randomuser.me/api/portraits/men/1.jpg', // Fallback image
        price: `LKR ${teacher.hourly_rate}/hr`,
        hourly_rate: teacher.hourly_rate, // Keep original rate for filtering
        availability: 'Contact for availability', // Default since not provided by API
        description: teacher.bio || 'Experienced teacher ready to help you learn.',
        education: teacher.education,
        lat: teacher.lat,
        lng: teacher.lng,
        is_subscribed: teacher.is_subscribed,
        reviewsList: [] // Default empty array since not provided by API
      }));
      
      setAllTeachers(mappedTeachers);
      setTeachers(mappedTeachers);
    } catch (err) {
      console.error('Error fetching teachers:', err);
      setError('Failed to load teachers. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTeachers();
  }, []);

  // Real-time search with debounce
  useEffect(() => {
    if (allTeachers.length > 0) { // Only search if teachers are loaded
      const timeoutId = setTimeout(() => {
        if (selectedSubject || location || maxPrice || searchQuery) {
          searchTeachers();
        } else {
          setTeachers(allTeachers); // Show all teachers if no filters
        }
      }, 500); // 500ms debounce

      return () => clearTimeout(timeoutId);
    }
  }, [selectedSubject, location, maxPrice, searchQuery, allTeachers]);

  // Search teachers using client-side filtering (since API search endpoint is not available)
  const searchTeachers = async (searchParams = {}) => {
    try {
      setIsSearching(true);
      setError(null);
      
      // Add small delay to show loading state
      await new Promise(resolve => setTimeout(resolve, 300));
      
      // Get current filter values
      const currentSubject = searchParams.subject !== undefined ? searchParams.subject : selectedSubject;
      const currentLocation = searchParams.location !== undefined ? searchParams.location : location;
      const currentMaxPrice = searchParams.maxPrice !== undefined ? searchParams.maxPrice : maxPrice;
      const currentSearchQuery = searchParams.searchQuery !== undefined ? searchParams.searchQuery : searchQuery;
      
      // Filter teachers based on criteria
      let filteredTeachers = allTeachers.filter(teacher => {
        // Subject filter
        const matchesSubject = !currentSubject || teacher.subject.toLowerCase().includes(currentSubject.toLowerCase());
        
        // Location filter
        const matchesLocation = !currentLocation || teacher.location.toLowerCase().includes(currentLocation.toLowerCase());
        
        // Max price filter
        const matchesPrice = !currentMaxPrice || teacher.hourly_rate <= parseFloat(currentMaxPrice);
        
        // Search query filter (name, description, education)
        const matchesQuery = !currentSearchQuery || 
          teacher.name.toLowerCase().includes(currentSearchQuery.toLowerCase()) ||
          teacher.description.toLowerCase().includes(currentSearchQuery.toLowerCase()) ||
          teacher.education?.toLowerCase().includes(currentSearchQuery.toLowerCase());
        
        return matchesSubject && matchesLocation && matchesPrice && matchesQuery;
      });
      
      setTeachers(filteredTeachers);
    } catch (err) {
      console.error('Error searching teachers:', err);
      setError('Failed to search teachers. Please try again later.');
    } finally {
      setIsSearching(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    searchTeachers();
  };

  const handleRetry = () => {
    fetchTeachers();
  };

  // Loading state
  if (loading) {
    return (
      <div className="find-teachers-page">
        <div className="container">
          <div className="text-center py-5">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
            <p className="mt-3">Loading teachers...</p>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="find-teachers-page">
        <div className="container">
          <div className="text-center py-5">
            <div className="alert alert-danger" role="alert">
              <i className="bi bi-exclamation-triangle-fill me-2"></i>
              {error}
            </div>
            <button className="btn btn-primary" onClick={handleRetry}>
              <i className="bi bi-arrow-clockwise me-2"></i>
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="find-teachers-page">
      {/* Hero Section */}
      <section className="search-hero">
        <div className="container">
          <div className="row justify-content-center">
            <div className="col-lg-8 text-center">
              <h1 className="display-4 fw-bold mb-4">Find Your Perfect Teacher</h1>
              <p className="lead mb-5">
                Discover experienced teachers in your area. Filter by subject, location, and more to find the right match for your learning needs.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Search Section */}
      <section className="search-section">
        <div className="container">
          <div className="search-card">
            <form onSubmit={handleSearch}>
              <div className="row g-3">
                <div className="col-md-3">
                  <div className="form-group">
                    <label className="form-label">Subject</label>
                    <select
                      className="form-select"
                      value={selectedSubject}
                      onChange={(e) => setSelectedSubject(e.target.value)}
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
                <div className="col-md-3">
                  <div className="form-group">
                    <label className="form-label">Location</label>
                    <input
                      ref={locationInputRef}
                      type="text"
                      className="form-control"
                      placeholder="Enter your location"
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                    />
                  </div>
                </div>
                <div className="col-md-3">
                  <div className="form-group">
                    <label className="form-label">Max Price (LKR/hr)</label>
                    <input
                      type="number"
                      className="form-control"
                      placeholder="Maximum hourly rate"
                      value={maxPrice}
                      onChange={(e) => setMaxPrice(e.target.value)}
                      min="0"
                      step="100"
                    />
                  </div>
                </div>
                <div className="col-md-3">
                  <div className="form-group">
                    <label className="form-label">Search</label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Search by name or keyword"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                </div>
              </div>
              <div className="text-center mt-4">
                <button 
                  type="submit" 
                  className="btn btn-primary btn-lg me-3"
                  disabled={isSearching}
                >
                  {isSearching ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                      Searching...
                    </>
                  ) : (
                    <>
                      <i className="bi bi-search me-2"></i>
                      Find Teachers
                    </>
                  )}
                </button>
                <button 
                  type="button" 
                  className="btn btn-outline-secondary"
                  onClick={() => {
                    setSelectedSubject('');
                    setLocation('');
                    setMaxPrice('');
                    setSearchQuery('');
                    setTeachers(allTeachers); // Reset to show all teachers
                  }}
                >
                  <i className="bi bi-arrow-counterclockwise me-2"></i>
                  Clear Filters
                </button>
              </div>
            </form>
          </div>
        </div>
      </section>

      {/* Teachers List Section */}
      <section className="teachers-section">
        <div className="container">
          <div className="d-flex justify-content-between align-items-center mb-4">
            <h2>Available Teachers ({teachers.length})</h2>
            <button className="btn btn-outline-primary btn-sm" onClick={() => {
              setSelectedSubject('');
              setLocation('');
              setMaxPrice('');
              setSearchQuery('');
              fetchTeachers();
            }}>
              <i className="bi bi-arrow-clockwise me-1"></i>
              Refresh
            </button>
          </div>
          
          {teachers.length === 0 ? (
            <div className="text-center py-5">
              <i className="bi bi-people display-1 text-muted"></i>
              <h3 className="mt-3">No teachers found</h3>
              <p className="text-muted">Try adjusting your search criteria or check back later.</p>
            </div>
          ) : (
            <div className="teachers-list">
              {teachers.map((teacher) => (
                <div key={teacher.id} className="teacher-card">
                  <div className="row align-items-center">
                    <div className="col-md-2">
                      <div className="teacher-image">
                        <img 
                          src={teacher.image} 
                          alt={teacher.name}
                          onError={(e) => {
                            e.target.src = 'https://randomuser.me/api/portraits/men/1.jpg';
                          }}
                        />
                        <div className="rating-badge">
                          <i className="bi bi-star-fill"></i>
                          <span>{teacher.rating}</span>
                        </div>
                        {teacher.is_subscribed && (
                          <div className="subscription-badge">
                            <i className="bi bi-check-circle-fill"></i>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="col-md-7">
                      <div className="teacher-info">
                        <div className="teacher-header">
                          <h3>{teacher.name}</h3>
                          <span className="subject-badge">{teacher.subject}</span>
                        </div>
                        <div className="details">
                          <span><i className="bi bi-geo-alt"></i> {teacher.location}</span>
                          <span><i className="bi bi-clock"></i> {teacher.availability}</span>
                          <span><i className="bi bi-cash"></i> {teacher.price}</span>
                          <span><i className="bi bi-award"></i> {teacher.experience}</span>
                          {teacher.education && (
                            <span><i className="bi bi-mortarboard"></i> {teacher.education}</span>
                          )}
                        </div>
                        <p className="description">{teacher.description}</p>
                        <div className="reviews-summary">
                          <div className="rating-stars">
                            {[...Array(5)].map((_, i) => (
                              <i
                                key={i}
                                className={`bi bi-star${i < Math.floor(teacher.rating) ? '-fill' : ''}`}
                              ></i>
                            ))}
                          </div>
                          <span className="reviews-count">{teacher.reviews} reviews</span>
                        </div>
                      </div>
                    </div>
                    <div className="col-md-3">
                      <div className="teacher-actions">
                        <Link to={`/teacher/${teacher.id}`} className="btn btn-primary">
                          View Profile
                        </Link>
                        <button className="btn btn-outline-primary">
                          <i className="bi bi-chat-dots"></i>
                          Message
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      <style jsx>{`
        .find-teachers-page {
          padding-top: 80px;
        }

        .search-hero {
          padding: 3rem 0;
          background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
        }

        .search-section {
          padding: 1.5rem 0;
          margin-top: -30px;
        }

        .search-card {
          background: white;
          padding: 1.5rem;
          border-radius: 1rem;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
        }

        .form-group {
          margin-bottom: 0.75rem;
        }

        .form-label {
          font-weight: 500;
          color: #1e293b;
          margin-bottom: 0.25rem;
          font-size: 0.875rem;
        }

        .form-control,
        .form-select {
          padding: 0.5rem 0.75rem;
          border-radius: 0.5rem;
          border: 1px solid #e2e8f0;
          transition: all 0.3s ease;
          font-size: 0.875rem;
        }

        .form-control:focus,
        .form-select:focus {
          border-color: #2563eb;
          box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
        }

        .teachers-section {
          padding: 2rem 0;
        }

        .teachers-list {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .teacher-card {
          background: white;
          border-radius: 0.75rem;
          padding: 1rem;
          box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
          transition: all 0.3s ease;
          margin-bottom: 1rem;
        }

        .teacher-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 15px rgba(0, 0, 0, 0.15);
        }

        .teacher-image {
          position: relative;
          width: 70px;
          height: 70px;
          border-radius: 50%;
          overflow: hidden;
          margin: 0 auto;
          border: 2px solid #e2e8f0;
        }

        .teacher-image img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .rating-badge {
          position: absolute;
          bottom: -5px;
          left: 50%;
          transform: translateX(-50%);
          background: #2563eb;
          color: white;
          padding: 0.15rem 0.5rem;
          border-radius: 1rem;
          font-size: 0.7rem;
          font-weight: 600;
          display: flex;
          align-items: center;
          gap: 0.15rem;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        }

        .rating-badge i {
          color: #fbbf24;
          font-size: 0.7rem;
        }

        .subscription-badge {
          position: absolute;
          top: -5px;
          right: -5px;
          background: #10b981;
          color: white;
          border-radius: 50%;
          width: 20px;
          height: 20px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 0.6rem;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        }

        .teacher-info {
          padding: 0 0.75rem;
        }

        .teacher-header {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          margin-bottom: 0.5rem;
        }

        .teacher-header h3 {
          font-size: 1rem;
          font-weight: 600;
          margin: 0;
          color: #1e293b;
        }

        .subject-badge {
          background: #e0f2fe;
          color: #0369a1;
          padding: 0.15rem 0.5rem;
          border-radius: 0.5rem;
          font-size: 0.75rem;
          font-weight: 500;
        }

        .details {
          display: flex;
          flex-wrap: wrap;
          gap: 0.75rem;
          margin-bottom: 0.5rem;
        }

        .details span {
          display: flex;
          align-items: center;
          gap: 0.25rem;
          color: #64748b;
          font-size: 0.75rem;
        }

        .details i {
          color: #2563eb;
          font-size: 0.8rem;
        }

        .description {
          color: #475569;
          font-size: 0.75rem;
          margin-bottom: 0.5rem;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
          line-height: 1.4;
        }

        .reviews-summary {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .rating-stars {
          color: #fbbf24;
          font-size: 0.75rem;
        }

        .reviews-count {
          color: #64748b;
          font-size: 0.7rem;
        }

        .teacher-actions {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .teacher-actions .btn {
          width: 100%;
          padding: 0.375rem 0.75rem;
          font-size: 0.75rem;
          border-radius: 0.5rem;
        }

        .teacher-actions .btn-primary {
          background: #2563eb;
          border: none;
        }

        .teacher-actions .btn-outline-primary {
          color: #2563eb;
          border-color: #2563eb;
        }

        .teacher-actions .btn:hover {
          transform: translateY(-1px);
        }

        .spinner-border {
          width: 3rem;
          height: 3rem;
        }

        @media (max-width: 768px) {
          .search-hero {
            padding: 2rem 0;
          }

          .search-section {
            margin-top: 0;
          }

          .teacher-image {
            width: 60px;
            height: 60px;
            margin-bottom: 0.5rem;
          }

          .teacher-info {
            padding: 0;
            margin-bottom: 0.5rem;
          }

          .teacher-actions {
            flex-direction: row;
          }

          .teacher-actions .btn {
            flex: 1;
          }
        }
      `}</style>
    </div>
  );
};

export default FindTeachers;