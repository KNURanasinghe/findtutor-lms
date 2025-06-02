import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';

const UniversalProfile = () => {
  const { profileId } = useParams(); // Get profile ID from URL (can be teacher or student)
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('profile');
  const [isEditing, setIsEditing] = useState(false);
  const [editedUser, setEditedUser] = useState({});
  const [successMessage, setSuccessMessage] = useState('');
  const [isOwnProfile, setIsOwnProfile] = useState(false);
  const [userRole, setUserRole] = useState(null); // 'teacher' or 'student'
  const [updateLoading, setUpdateLoading] = useState(false);

  // Mock data for fallback
  const mockTeacher = {
    id: 1,
    name: 'Dr. Sarah Johnson',
    email: 'sarah.johnson@example.com',
    subjects: 'Mathematics, Physics, Chemistry',
    experience: '8 years',
    qualifications: 'PhD in Mathematics from University of Cambridge',
    hourlyRate: 'LKR 2500',
    phone: '+94 77 123 4567',
    location: 'Colombo, Sri Lanka',
    bio: 'Passionate educator with over 8 years of experience.',
    profilePicture: 'https://randomuser.me/api/portraits/women/1.jpg',
    dateJoined: '2020-03-15',
    totalStudents: 156,
    rating: 4.8,
    reviews: 89,
    availability: 'Weekdays 2PM-8PM, Weekends 9AM-5PM',
    preferredMedium: 'English, Sinhala',
    education: 'University of Cambridge',
    achievements: ['Best Teacher Award 2023', 'Top Rated Tutor']
  };

  const mockStudent = {
    id: 1,
    name: 'John Doe',
    email: 'john.doe@example.com',
    phone: '+94 77 987 6543',
    location: 'Colombo, Sri Lanka',
    bio: 'Enthusiastic student looking to improve my academic performance.',
    profilePicture: 'https://randomuser.me/api/portraits/men/1.jpg',
    dateJoined: '2023-01-15',
    educationLevel: 'College',
    subjects: 'Mathematics, Science',
    achievements: ['Honor Roll 2023', 'Science Fair Winner']
  };

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Get logged-in user data from localStorage
        const userData = localStorage.getItem('user');
        let loggedInUserId = null;
        let loggedInUserRole = null;
        
        if (userData) {
          try {
            const parsedUser = JSON.parse(userData);
            loggedInUserId = parsedUser.user_id || parsedUser.id;
            loggedInUserRole = parsedUser.role; // 'teacher' or 'student'
            setUserRole(loggedInUserRole);
            console.log('Logged in user ID:', loggedInUserId, 'Role:', loggedInUserRole);
          } catch (parseError) {
            console.error('Error parsing logged-in user data:', parseError);
          }
        }
        
        let currentProfile;
        let profileRole = loggedInUserRole; // Default to logged-in user's role
        
        if (profileId) {
          // Viewing a specific profile from URL parameter
          console.log('=== DEBUGGING PROFILE FETCH ===');
          console.log('ProfileId from URL:', profileId, typeof profileId);
          
          // Convert profileId to number for comparison
          const numericProfileId = parseInt(profileId, 10);
          console.log('Numeric ProfileId:', numericProfileId);
          
          // Try teachers first
          try {
            console.log('Fetching teachers from API...');
            const teachersResponse = await fetch('http://145.223.21.62:5000/api/teachers');
            
            if (teachersResponse.ok) {
              const teachers = await teachersResponse.json();
              console.log('All teachers from API:', teachers.map(t => ({ 
                teacher_id: t.teacher_id, 
                name: t.name,
                user_id: t.user_id 
              })));
              
              // Try multiple matching strategies
              currentProfile = teachers.find(teacher => {
                const matchById = teacher.teacher_id === numericProfileId || teacher.teacher_id === profileId;
                const matchByString = String(teacher.teacher_id) === String(profileId);
                console.log(`Checking teacher ${teacher.name}: teacher_id=${teacher.teacher_id}, matches=${matchById || matchByString}`);
                return matchById || matchByString;
              });
              
              console.log('Teacher search result:', currentProfile);
              
              if (currentProfile) {
                profileRole = 'teacher';
                console.log('Found teacher profile:', currentProfile.name);
                
                // Check if this is the logged-in user's own profile
                if (loggedInUserId && loggedInUserRole === 'teacher') {
                  const loggedInTeacher = teachers.find(teacher => {
                    const matches = teacher.user_id === parseInt(loggedInUserId) || teacher.user_id === loggedInUserId;
                    return matches;
                  });
                  if (loggedInTeacher) {
                    setIsOwnProfile(currentProfile.teacher_id === loggedInTeacher.teacher_id);
                  }
                } else {
                  setIsOwnProfile(false); // Not own profile if different role or not logged in
                }
              }
            } else {
              console.error('Failed to fetch teachers:', teachersResponse.status);
            }
          } catch (teacherError) {
            console.error('Error fetching teachers:', teacherError);
          }
          
          // If not found in teachers, try students
          if (!currentProfile) {
            try {
              console.log('Teacher not found, trying students...');
              const studentsResponse = await fetch('http://145.223.21.62:5000/api/students');
              
              if (studentsResponse.ok) {
                const students = await studentsResponse.json();
                console.log('All students from API:', students.map(s => ({ 
                  student_id: s.student_id, 
                  name: s.name,
                  user_id: s.user_id 
                })));
                
                currentProfile = students.find(student => {
                  const matchById = student.student_id === numericProfileId || student.student_id === profileId;
                  const matchByString = String(student.student_id) === String(profileId);
                  console.log(`Checking student ${student.name}: student_id=${student.student_id}, matches=${matchById || matchByString}`);
                  return matchById || matchByString;
                });
                
                console.log('Student search result:', currentProfile);
                
                if (currentProfile) {
                  profileRole = 'student';
                  console.log('Found student profile:', currentProfile.name);
                  
                  // Check if this is the logged-in user's own profile
                  if (loggedInUserId && loggedInUserRole === 'student') {
                    const loggedInStudent = students.find(student => {
                      const matches = student.user_id === parseInt(loggedInUserId) || student.user_id === loggedInUserId;
                      return matches;
                    });
                    if (loggedInStudent) {
                      setIsOwnProfile(currentProfile.student_id === loggedInStudent.student_id);
                    }
                  } else {
                    setIsOwnProfile(false); // Not own profile if different role or not logged in
                  }
                }
              } else {
                console.error('Failed to fetch students:', studentsResponse.status);
              }
            } catch (studentError) {
              console.error('Error fetching students:', studentError);
            }
          }
          
          if (!currentProfile) {
            console.error('=== PROFILE NOT FOUND ===');
            console.error('Searched for profileId:', profileId);
            console.error('Searched in both teachers and students');
            throw new Error(`Profile not found for ID: ${profileId}. This profile may not exist or there may be a data issue.`);
          }
        } else {
          // No specific profile ID in URL - show logged-in user's profile
          console.log('No profileId in URL, showing logged-in user profile');
          
          if (!loggedInUserId || !loggedInUserRole) {
            console.warn('No user data found in localStorage and no profile ID in URL');
            setUser(loggedInUserRole === 'student' ? mockStudent : mockTeacher);
            setEditedUser(loggedInUserRole === 'student' ? mockStudent : mockTeacher);
            setIsOwnProfile(true);
            setLoading(false);
            return;
          }
          
          if (loggedInUserRole === 'teacher') {
            // Fetch teachers and find logged-in user's profile
            const teachersResponse = await fetch('http://145.223.21.62:5000/api/teachers');
            if (!teachersResponse.ok) {
              throw new Error(`Failed to fetch teachers: ${teachersResponse.status}`);
            }
            
            const teachers = await teachersResponse.json();
            currentProfile = teachers.find(teacher => 
              teacher.user_id === parseInt(loggedInUserId) || teacher.user_id === loggedInUserId
            );
            
            if (!currentProfile) {
              // Create a basic teacher profile for new teachers
              const basicProfile = {
                teacher_id: loggedInUserId,
                user_id: loggedInUserId,
                name: JSON.parse(userData).name || 'Teacher',
                bio: 'Welcome! Please update your profile information.',
                years_experience: 0,
                education: '',
                hourly_rate: 0,
                location: '',
                lat: 0,
                lng: 0,
                is_subscribed: false,
                profile_picture: 'https://randomuser.me/api/portraits/women/1.jpg'
              };
              currentProfile = basicProfile;
            }
            profileRole = 'teacher';
          } else if (loggedInUserRole === 'student') {
            // Fetch students and find logged-in user's profile
            const studentsResponse = await fetch('http://145.223.21.62:5000/api/students');
            if (!studentsResponse.ok) {
              throw new Error(`Failed to fetch students: ${studentsResponse.status}`);
            }
            
            const students = await studentsResponse.json();
            currentProfile = students.find(student => 
              student.user_id === parseInt(loggedInUserId) || student.user_id === loggedInUserId
            );
            
            if (!currentProfile) {
              // Create a basic student profile for new students
              const basicProfile = {
                student_id: loggedInUserId,
                user_id: loggedInUserId,
                name: JSON.parse(userData).name || 'Student',
                bio: 'Welcome! Please update your profile information.',
                education_level: '',
                location: '',
                profile_picture: 'https://randomuser.me/api/portraits/men/1.jpg'
              };
              currentProfile = basicProfile;
            }
            profileRole = 'student';
          }
          
          setIsOwnProfile(true); // Always own profile when no URL param
        }
        
        console.log('=== FINAL RESULTS ===');
        console.log('Found profile:', currentProfile?.name);
        console.log('Profile role:', profileRole);
        console.log('Is own profile:', isOwnProfile);
        
        // Map API response to component structure based on role
        let mappedUser;
        
        if (profileRole === 'teacher') {
          mappedUser = {
            id: currentProfile.teacher_id,
            user_id: currentProfile.user_id,
            name: currentProfile.name,
            email: currentProfile.email || '', 
            subjects: currentProfile.subjects || 'General', 
            experience: `${currentProfile.years_experience || 0} years`,
            qualifications: currentProfile.education || '',
            hourlyRate: `LKR ${currentProfile.hourly_rate || 0}`,
            phone: currentProfile.phone || '', // Get phone from API response
            location: currentProfile.location || '',
            bio: currentProfile.bio || 'Experienced teacher ready to help you learn.',
            profilePicture: currentProfile.profile_picture || 'https://randomuser.me/api/portraits/women/1.jpg',
            dateJoined: currentProfile.date_joined || new Date().toISOString().split('T')[0],
            totalStudents: currentProfile.total_students || 0,
            rating: currentProfile.rating || 4.5,
            reviews: currentProfile.reviews_count || 0,
            availability: currentProfile.availability || 'Contact for availability',
            preferredMedium: currentProfile.preferred_medium || 'English',
            education: currentProfile.education || '',
            achievements: currentProfile.achievements || [],
            lat: currentProfile.lat || 0,
            lng: currentProfile.lng || 0,
            is_subscribed: currentProfile.is_subscribed || false,
            role: 'teacher'
          };
        } else if (profileRole === 'student') {
          mappedUser = {
            id: currentProfile.student_id,
            user_id: currentProfile.user_id,
            name: currentProfile.name,
            email: currentProfile.email || '', // Get email from API response
            phone: currentProfile.phone || '', // Get phone from API response
            location: currentProfile.location || '',
            bio: currentProfile.bio || 'Student eager to learn and grow.',
            profilePicture: currentProfile.profile_picture || 'https://randomuser.me/api/portraits/men/1.jpg',
            dateJoined: currentProfile.date_joined || new Date().toISOString().split('T')[0],
            educationLevel: currentProfile.education_level || '',
            subjects: currentProfile.subjects || 'Various', // Get subjects from API or default
            achievements: currentProfile.achievements || [],
            role: 'student'
          };
        }
        
        // If viewing own profile and logged in, get email from localStorage
        if (isOwnProfile && userData) {
          try {
            const parsedUser = JSON.parse(userData);
            mappedUser.email = parsedUser.email || '';
          } catch (e) {
            console.error('Error parsing user data for email:', e);
          }
        }
        
        console.log('Mapped user:', mappedUser);
        
        setUser(mappedUser);
        setEditedUser(mappedUser);
        setUserRole(profileRole);
      } catch (err) {
        console.error('Error fetching profile:', err);
        console.log('Profile ID that failed:', profileId);
        console.log('Error details:', err.message);
        setError(err.message || 'Failed to load profile');
        
        // DO NOT use fallback for viewing other people's profiles
        if (profileId) {
          console.log('Not using fallback because we are viewing a specific profile ID:', profileId);
          return; // Don't show fallback for other people's profiles
        }
        
        console.log('Using fallback only because no profileId was provided (viewing own profile)');
        // Fallback only if viewing own profile
        if (!profileId) {
          const userData = localStorage.getItem('user');
          if (userData) {
            try {
              const parsedUser = JSON.parse(userData);
              const role = parsedUser.role || 'teacher';
              const basicProfile = role === 'student' ? {
                id: parsedUser.user_id || parsedUser.id || 1,
                user_id: parsedUser.user_id || parsedUser.id || 1,
                name: parsedUser.name || 'Student',
                email: parsedUser.email || '',
                phone: '',
                location: '',
                bio: 'Welcome! Please update your profile information.',
                profilePicture: 'https://randomuser.me/api/portraits/men/1.jpg',
                dateJoined: new Date().toISOString().split('T')[0],
                educationLevel: '',
                subjects: 'Various',
                achievements: [],
                role: 'student'
              } : {
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
                is_subscribed: false,
                role: 'teacher'
              };
              
              setUser(basicProfile);
              setEditedUser(basicProfile);
              setIsOwnProfile(true);
              setUserRole(role);
            } catch (parseError) {
              console.error('Error creating basic profile:', parseError);
              const defaultProfile = mockTeacher;
              setUser(defaultProfile);
              setEditedUser(defaultProfile);
              setIsOwnProfile(true);
              setUserRole('teacher');
            }
          } else {
            setUser(mockTeacher);
            setEditedUser(mockTeacher);
            setIsOwnProfile(true);
            setUserRole('teacher');
          }
        }
      } finally {
        setLoading(false);
      }
    };

    fetchUserProfile();
  }, [profileId]); // Re-run when profileId changes

  const handleLogout = () => {
    localStorage.removeItem('user');
    const loginPath = userRole === 'student' ? '/login/student' : '/login/teacher';
    window.location.href = loginPath;
  };

  const handleEdit = () => {
    setIsEditing(true);
    setEditedUser({ ...user });
  };

  const handleSave = async () => {
    try {
      if (!validateForm()) {
        return;
      }

      setUpdateLoading(true);
      setError(null);
      
      const userData = localStorage.getItem('user');
      if (!userData) {
        throw new Error('No user data found. Please log in again.');
      }
      
      const parsedUser = JSON.parse(userData);
      const userId = parsedUser.user_id || parsedUser.id;
      
      if (!userId) {
        throw new Error('No user ID found. Cannot save profile.');
      }
      
      console.log('User ID from localStorage:', userId);
      console.log('User role:', userRole);
      
      let profileId, apiData, apiUrl;
      
      if (userRole === 'teacher') {
        // Get the teacher ID using the user ID
        profileId = await getTeacherIdFromUserId(userId);
        console.log('Resolved teacher ID:', profileId);
        
        // Extract years from experience string (e.g., "5 years" -> 5)
        const experienceYears = parseInt(editedUser.experience?.replace(/\D/g, '') || '0');
        
        // Extract rate from hourly rate string (e.g., "LKR 2500" -> 2500)
        const hourlyRateValue = parseFloat(editedUser.hourlyRate?.replace(/[^\d.]/g, '') || '0');
        
        // Prepare data for teacher API
        apiData = {
          bio: editedUser.bio || '',
          years_experience: experienceYears,
          education: editedUser.education || editedUser.qualifications || '',
          hourly_rate: hourlyRateValue,
          availability: editedUser.availability || '',
          location: editedUser.location || '',
          lat: editedUser.lat || 0,
          lng: editedUser.lng || 0
        };
        
        apiUrl = `http://145.223.21.62:5000/api/teachers/${profileId}`;
      } else if (userRole === 'student') {
        // Get the student ID using the user ID
        profileId = await getStudentIdFromUserId(userId);
        console.log('Resolved student ID:', profileId);
        
        // Prepare data for student API
        apiData = {
          bio: editedUser.bio || '',
          education_level: editedUser.educationLevel || '',
          location: editedUser.location || ''
        };
        
        apiUrl = `http://145.223.21.62:5000/api/students/${profileId}`;
      } else {
        throw new Error('Invalid user role. Cannot save profile.');
      }
      
      console.log('Updating profile with data:', apiData);
      console.log('Using API URL:', apiUrl);
      
      // Make API call to update profile
      const response = await fetch(apiUrl, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(apiData)
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Failed to update profile: ${response.status}`);
      }
      
      const updatedProfile = await response.json();
      console.log('Profile updated successfully:', updatedProfile);
      
      // Update local state with new data
      setUser(editedUser);
      setIsEditing(false);
      
      // Show success message
      setSuccessMessage('Profile updated successfully!');
      
      // Clear success message after 3 seconds
      setTimeout(() => {
        setSuccessMessage('');
      }, 3000);
      
      console.log('Profile updated successfully!');
      
    } catch (err) {
      console.error('Error saving profile:', err);
      setError(err.message || 'Failed to save profile. Please try again.');
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
    
    // Clear any previous errors
    if (error && !error.includes('Access denied')) {
      setError('');
    }
  };

  const validateForm = () => {
    if (isEditing) {
      if (userRole === 'teacher') {
        // Validate experience contains a number
        const experienceYears = parseInt(editedUser.experience?.replace(/\D/g, '') || '0');
        if (isNaN(experienceYears) || experienceYears < 0) {
          setError('Please enter a valid number of years of experience (e.g., "5 years")');
          return false;
        }

        // Validate hourly rate contains a valid number
        const hourlyRateValue = parseFloat(editedUser.hourlyRate?.replace(/[^\d.]/g, '') || '0');
        if (isNaN(hourlyRateValue) || hourlyRateValue < 0) {
          setError('Please enter a valid hourly rate (e.g., "LKR 2500")');
          return false;
        }
      }
      // For students, basic validation is sufficient
    }
    return true;
  };

  // Helper function to get teacher ID from user ID
  const getTeacherIdFromUserId = async (userId) => {
    const response = await fetch('http://145.223.21.62:5000/api/teachers');
    
    if (!response.ok) {
      throw new Error(`Failed to fetch teachers: ${response.status}`);
    }
    
    const teachers = await response.json();
    const teacherRecord = teachers.find(teacher => 
      teacher.user_id === parseInt(userId) || teacher.user_id === userId
    );
    
    if (!teacherRecord) {
      throw new Error('Teacher record not found. You may need to complete your teacher registration first.');
    }
    
    return teacherRecord.teacher_id;
  };

  // Helper function to get student ID from user ID
  const getStudentIdFromUserId = async (userId) => {
    const response = await fetch('http://145.223.21.62:5000/api/students');
    
    if (!response.ok) {
      throw new Error(`Failed to fetch students: ${response.status}`);
    }
    
    const students = await response.json();
    const studentRecord = students.find(student => 
      student.user_id === parseInt(userId) || student.user_id === userId
    );
    
    if (!studentRecord) {
      throw new Error('Student record not found. You may need to complete your student registration first.');
    }
    
    return studentRecord.student_id;
  };

  if (loading) {
    return (
      <div className="profile-container">
        <div className="container-fluid">
          <div className="text-center py-5">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
            <p className="mt-3">Loading {userRole || 'user'} profile...</p>
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
              onClick={() => window.location.href = `/login/${userRole || 'teacher'}`}
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
            <p className="text-muted mb-3">
              {profileId ? 'The requested profile could not be found.' : "Don't worry! We're showing your basic profile."}
            </p>
            <div className="btn-group">
              <button 
                className="btn btn-primary" 
                onClick={() => {
                  setError(null);
                  window.location.reload();
                }}
              >
                <i className="bi bi-arrow-clockwise me-2"></i>
                Try Again
              </button>
              {profileId && (
                <button 
                  className="btn btn-outline-secondary" 
                  onClick={() => window.history.back()}
                >
                  <i className="bi bi-arrow-left me-2"></i>
                  Go Back
                </button>
              )}
            </div>
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
                const fallback = userRole === 'student' ? mockStudent : mockTeacher;
                setUser(fallback);
                setEditedUser(fallback);
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
      {/* <div className="debug-panel">
        <div className="container-fluid">
          <div className="alert alert-info" role="alert">
            <strong>Debug Info:</strong> 
            <span className="ms-2">
              URL Profile ID: {profileId || 'None (Own Profile)'}
            </span>
            <span className="ms-3">
              User Role: {userRole || 'Unknown'}
            </span>
            <span className="ms-3">
              Is Own Profile: {isOwnProfile ? 'Yes' : 'No'}
            </span>
            <span className="ms-3">
              User ID: {(() => {
                try {
                  const userData = localStorage.getItem('user');
                  if (userData) {
                    const parsed = JSON.parse(userData);
                    return parsed.user_id || parsed.id || 'Not Found';
                  }
                  return 'None';
                } catch (e) {
                  return 'Invalid JSON';
                }
              })()}
            </span>
            <span className="ms-3">
              Profile ID: {user?.id || 'Not Resolved'}
            </span>
            <span className="ms-3">Profile: {user ? 'Loaded' : 'Not Loaded'}</span>
            <button 
              className="btn btn-sm btn-outline-primary ms-3"
              onClick={() => {
                localStorage.clear();
                window.location.reload();
              }}
            >
              Clear Storage
            </button>
            <button 
              className="btn btn-sm btn-outline-secondary ms-2"
              onClick={() => {
                console.log('Current state:', { user, error, loading, isOwnProfile, profileId, userRole });
                console.log('localStorage user:', localStorage.getItem('user'));
              }}
            >
              Log State
            </button>
          </div>
        </div>
      </div> */}

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
                    const defaultImg = userRole === 'student' 
                      ? 'https://randomuser.me/api/portraits/men/1.jpg'
                      : 'https://randomuser.me/api/portraits/women/1.jpg';
                    e.target.src = defaultImg;
                  }}
                />
                {userRole === 'teacher' && (
                  <div className="rating-badge">
                    <i className="bi bi-star-fill"></i>
                    <span>{currentUser?.rating || '4.5'}</span>
                  </div>
                )}
                {userRole === 'student' && (
                  <div className="student-badge">
                    <i className="bi bi-mortarboard-fill"></i>
                  </div>
                )}
              </div>
            </div>
            <div className="col">
              <h2 className="mb-1">{currentUser?.name}</h2>
              <p className="text-muted mb-2">
                {userRole === 'teacher' ? currentUser?.subjects : `Student - ${currentUser?.subjects}`}
              </p>
              <div className="profile-stats">
                {userRole === 'teacher' ? (
                  <>
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
                  </>
                ) : (
                  <>
                    <span className="stat-item">
                      <i className="bi bi-mortarboard"></i>
                      {currentUser?.educationLevel || 'Not specified'}
                    </span>
                    <span className="stat-item">
                      <i className="bi bi-calendar-check"></i>
                      Since {currentUser?.dateJoined ? new Date(currentUser.dateJoined).getFullYear() : 'N/A'}
                    </span>
                    <span className="stat-item">
                      <i className="bi bi-geo-alt"></i>
                      {currentUser?.location || 'Location not set'}
                    </span>
                  </>
                )}
              </div>
            </div>
            <div className="col-auto">
              {isOwnProfile && (
                <>
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
                </>
              )}
              {!isOwnProfile && (
                <div className="btn-group">
                  <button className="btn btn-primary">
                    <i className="bi bi-chat-dots me-2"></i>
                    Message {userRole === 'teacher' ? 'Teacher' : 'Student'}
                  </button>
                  <button className="btn btn-outline-primary">
                    <i className="bi bi-heart me-2"></i>
                    Save
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
            {userRole === 'teacher' && (
              <li className="nav-item">
                <button 
                  className={`nav-link ${activeTab === 'education' ? 'active' : ''}`}
                  onClick={() => setActiveTab('education')}
                >
                  <i className="bi bi-mortarboard me-2"></i>
                  Education
                </button>
              </li>
            )}
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
          {/* Success Message */}
          {successMessage && (
            <div className="alert alert-success alert-dismissible fade show" role="alert">
              <i className="bi bi-check-circle-fill me-2"></i>
              {successMessage}
              <button 
                type="button" 
                className="btn-close" 
                onClick={() => setSuccessMessage('')}
              ></button>
            </div>
          )}
          
          {/* Error Message */}
          {error && !error.includes('Access denied') && (
            <div className="alert alert-danger alert-dismissible fade show" role="alert">
              <i className="bi bi-exclamation-triangle-fill me-2"></i>
              {error}
              <button 
                type="button" 
                className="btn-close" 
                onClick={() => setError('')}
              ></button>
            </div>
          )}

          {activeTab === 'profile' && (
            <div>
              <h4 className="mb-4">Profile Information</h4>
              <div className="row">
                <div className="col-md-6">
                  <div className="mb-3">
                    <label className="form-label">Full Name</label>
                    {isEditing && isOwnProfile ? (
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
                    {isEditing && isOwnProfile ? (
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
                    {isEditing && isOwnProfile ? (
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
                    {isEditing && isOwnProfile ? (
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
                  {userRole === 'student' && (
                    <div className="mb-3">
                      <label className="form-label">Education Level</label>
                      {isEditing && isOwnProfile ? (
                        <select 
                          className="form-control" 
                          value={currentUser?.educationLevel || ''} 
                          onChange={(e) => handleInputChange('educationLevel', e.target.value)}
                        >
                          <option value="">Select Education Level</option>
                          <option value="High School">High School</option>
                          <option value="College">College</option>
                          <option value="University">University</option>
                          <option value="Graduate">Graduate</option>
                          <option value="Other">Other</option>
                        </select>
                      ) : (
                        <input type="text" className="form-control" value={currentUser?.educationLevel || ''} readOnly />
                      )}
                    </div>
                  )}
                  {userRole === 'teacher' && (
                    <div className="mb-3">
                      <label className="form-label">Subjects</label>
                      {isEditing && isOwnProfile ? (
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
                  )}
                </div>
                <div className="col-md-6">
                  {userRole === 'teacher' && (
                    <>
                      <div className="mb-3">
                        <label className="form-label">Experience</label>
                        {isEditing && isOwnProfile ? (
                          <>
                            <input 
                              type="text" 
                              className="form-control" 
                              value={currentUser?.experience || ''} 
                              onChange={(e) => handleInputChange('experience', e.target.value)}
                              placeholder="e.g., 5 years"
                            />
                            <div className="form-text">Enter number of years (e.g., "5 years")</div>
                          </>
                        ) : (
                          <input type="text" className="form-control" value={currentUser?.experience || ''} readOnly />
                        )}
                      </div>
                      <div className="mb-3">
                        <label className="form-label">Hourly Rate</label>
                        {isEditing && isOwnProfile ? (
                          <>
                            <input 
                              type="text" 
                              className="form-control" 
                              value={currentUser?.hourlyRate || ''} 
                              onChange={(e) => handleInputChange('hourlyRate', e.target.value)}
                              placeholder="e.g., LKR 2500"
                            />
                            <div className="form-text">Enter rate with currency (e.g., "LKR 2500")</div>
                          </>
                        ) : (
                          <input type="text" className="form-control" value={currentUser?.hourlyRate || ''} readOnly />
                        )}
                      </div>
                      <div className="mb-3">
                        <label className="form-label">Availability</label>
                        {isEditing && isOwnProfile ? (
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
                        {isEditing && isOwnProfile ? (
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
                    </>
                  )}
                  <div className="mb-3">
                    <label className="form-label">Bio</label>
                    {isEditing && isOwnProfile ? (
                      <textarea 
                        className="form-control" 
                        rows="4" 
                        value={currentUser?.bio || ''} 
                        onChange={(e) => handleInputChange('bio', e.target.value)}
                        placeholder={userRole === 'teacher' 
                          ? "Tell us about yourself and your teaching approach..." 
                          : "Tell us about yourself and your learning goals..."
                        }
                      />
                    ) : (
                      <textarea className="form-control" rows="4" value={currentUser?.bio || ''} readOnly />
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'education' && userRole === 'teacher' && (
            <div>
              <h4 className="mb-4">Education & Qualifications</h4>
              <div className="row">
                <div className="col-12">
                  <div className="mb-3">
                    <label className="form-label">Education</label>
                    {isEditing && isOwnProfile ? (
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
                    {isEditing && isOwnProfile ? (
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
                            <p className="text-muted mb-0">
                              {userRole === 'teacher' 
                                ? 'Professional recognition in teaching excellence' 
                                : 'Academic achievement and recognition'
                              }
                            </p>
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

        .student-badge {
          position: absolute;
          bottom: -5px;
          right: -5px;
          background: #10b981;
          color: white;
          padding: 0.5rem;
          border-radius: 50%;
          font-size: 0.75rem;
          font-weight: 600;
          display: flex;
          align-items: center;
          justify-content: center;
          width: 30px;
          height: 30px;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
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

        .form-text {
          font-size: 0.75rem;
          color: #6c757d;
          margin-top: 0.25rem;
        }

        .alert {
          border-radius: 0.5rem;
          margin-bottom: 1rem;
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

export default UniversalProfile;