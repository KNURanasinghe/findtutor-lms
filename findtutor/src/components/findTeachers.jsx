import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';

const FindTeachers = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('');
  const [location, setLocation] = useState('');
  const [teachers, setTeachers] = useState([]);
  const locationInputRef = useRef(null);
  const autocompleteRef = useRef(null);

  // Sample subjects - replace with your actual subjects
  const subjects = [
    'Mathematics', 'Physics', 'Chemistry', 'Biology',
    'English', 'History', 'Geography', 'Computer Science',
    'Economics', 'Business Studies', 'Art', 'Music'
  ];

  // Sample teachers data - replace with your actual data
  const sampleTeachers = [
    {
      id: 1,
      name: 'John Smith',
      subject: 'Mathematics',
      rating: 4.8,
      reviews: 125,
      experience: '5 years',
      location: 'Colombo',
      image: 'https://randomuser.me/api/portraits/men/1.jpg',
      price: 'LKR 1500/hr',
      availability: 'Weekdays, Weekends',
      description: 'Experienced math tutor specializing in calculus and algebra.',
      reviewsList: [
        { id: 1, rating: 5, comment: 'Excellent teacher! Very patient and knowledgeable.', student: 'Sarah J.' },
        { id: 2, rating: 4, comment: 'Great at explaining complex concepts.', student: 'Michael T.' }
      ]
    },
    {
      id: 2,
      name: 'Sarah Johnson',
      subject: 'English',
      rating: 4.9,
      reviews: 98,
      experience: '7 years',
      location: 'Kandy',
      image: 'https://randomuser.me/api/portraits/women/2.jpg',
      price: 'LKR 1800/hr',
      availability: 'Weekdays',
      description: 'Expert in English literature and language teaching.',
      reviewsList: [
        { id: 1, rating: 5, comment: 'Amazing teacher! Improved my writing skills significantly.', student: 'David R.' },
        { id: 2, rating: 5, comment: 'Very professional and engaging lessons.', student: 'Emma W.' }
      ]
    },
    {
      id: 3,
      name: 'Michael Brown',
      subject: 'Physics',
      rating: 4.7,
      reviews: 76,
      experience: '4 years',
      location: 'Galle',
      image: 'https://randomuser.me/api/portraits/men/3.jpg',
      price: 'LKR 1600/hr',
      availability: 'Weekends',
      description: 'Specialized in physics and mathematics for advanced level students.',
      reviewsList: [
        { id: 1, rating: 4, comment: 'Clear explanations and practical examples.', student: 'James K.' },
        { id: 2, rating: 5, comment: 'Helped me understand complex physics concepts.', student: 'Lisa M.' }
      ]
    }
  ];

  useEffect(() => {
    // Initialize Google Places Autocomplete
    // const initAutocomplete = () => {
    //   if (window.google && locationInputRef.current) {
    //     autocompleteRef.current = new window.google.maps.places.Autocomplete(
    //       locationInputRef.current,
    //       {
    //         types: ['(cities)'],
    //         componentRestrictions: { country: 'lk' }
    //       }
    //     );

    //     autocompleteRef.current.addListener('place_changed', () => {
    //       const place = autocompleteRef.current.getPlace();
    //       if (place.geometry) {
    //         setLocation(place.formatted_address);
    //       }
    //     });
    //   }
    // };

    // // Load Google Maps script
    // if (!window.google) {
    //   const script = document.createElement('script');
    //   script.src = `https://maps.googleapis.com/maps/api/js?key=YOUR_API_KEY&libraries=places`;
    //   script.async = true;
    //   script.onload = initAutocomplete;
    //   document.head.appendChild(script);
    // } else {
    //   initAutocomplete();
    // }

    // Set initial teachers data
    setTeachers(sampleTeachers);
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    // Implement search logic here
    console.log('Searching for:', { searchQuery, selectedSubject, location });
  };

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
                <div className="col-md-4">
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
                <div className="col-md-4">
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
                <div className="col-md-4">
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
                <button type="submit" className="btn btn-primary btn-lg">
                  <i className="bi bi-search me-2"></i>
                  Find Teachers
                </button>
              </div>
            </form>
          </div>
        </div>
      </section>

      {/* Teachers List Section */}
      <section className="teachers-section">
        <div className="container">
          <div className="teachers-list">
            {teachers.map((teacher) => (
              <div key={teacher.id} className="teacher-card">
                <div className="row align-items-center">
                  <div className="col-md-2">
                    <div className="teacher-image">
                      <img src={teacher.image} alt={teacher.name} />
                      <div className="rating-badge">
                        <i className="bi bi-star-fill"></i>
                        <span>{teacher.rating}</span>
                      </div>
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