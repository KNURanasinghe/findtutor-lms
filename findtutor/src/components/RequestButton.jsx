import React, { useState, useEffect } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';

// Base API URL
const API_BASE_URL = 'http://145.223.21.62:5000/api';

const RequestButton = ({ 
  teacherId, 
  studentId, 
  initialRequestStatus = null,
  initialRequestId = null,
  subjectId = 1, // Default subject ID, make this configurable
  message = "Hi! I would like to request tutoring sessions with you.",
  budget = null,
  location = null,
  onRequestSent = () => {}, 
  onRequestCanceled = () => {},
  className = ''
}) => {
  const [requestStatus, setRequestStatus] = useState(initialRequestStatus);
  const [requestId, setRequestId] = useState(initialRequestId);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Check for existing request on component mount (optional - implement if you have a get requests endpoint)
  useEffect(() => {
    if (teacherId && studentId && initialRequestStatus === null && initialRequestId === null) {
      // Since you don't have a check endpoint, we'll skip this for now
      // You can implement this later if you add a GET endpoint
      console.log('Skipping existing request check - no endpoint available');
    }
  }, [teacherId, studentId]);

  // Send a new request using your POST /api/requests endpoint
  const handleSendRequest = async () => {
    try {
      setLoading(true);
      setError('');

      // Get current user data
      const userData = localStorage.getItem('user');
      if (!userData) {
        throw new Error('Please log in to send a request');
      }

      const parsedUser = JSON.parse(userData);
      const currentUserId = parsedUser.user_id || parsedUser.id;

      // Prepare request data according to your API
      const requestData = {
        student_id: studentId || currentUserId,
        teacher_id: teacherId,
        subject_id: subjectId, // Required by your API
        message: message,
        budget: budget,
        location: location
        // class_id is optional, not including it
      };

      console.log('Sending request with data:', requestData);

      const response = await fetch(`${API_BASE_URL}/requests`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestData)
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Failed to send request: ${response.status}`);
      }

      const newRequest = await response.json();
      console.log('Request created successfully:', newRequest);
      
      // Store the request ID and update status
      setRequestId(newRequest.id);
      setRequestStatus('pending');
      
      // Call callback function
      onRequestSent(newRequest);

    } catch (err) {
      console.error('Error sending request:', err);
      setError(err.message || 'Failed to send request');
    } finally {
      setLoading(false);
    }
  };

  // Cancel an existing request using your DELETE /api/requests/{id} endpoint
  const handleCancelRequest = async () => {
    try {
      setLoading(true);
      setError('');

      if (!requestId) {
        throw new Error('No request ID found. Cannot cancel request.');
      }

      console.log('Canceling request with ID:', requestId);

      const response = await fetch(`${API_BASE_URL}/requests/${requestId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Failed to cancel request: ${response.status}`);
      }

      const result = await response.json();
      console.log('Request canceled successfully:', result);

      // Reset state
      setRequestStatus(null);
      setRequestId(null);
      
      // Call callback function
      onRequestCanceled();

    } catch (err) {
      console.error('Error canceling request:', err);
      setError(err.message || 'Failed to cancel request');
    } finally {
      setLoading(false);
    }
  };

  // Don't render if missing required props
  if (!teacherId) {
    return null;
  }

  // If request is accepted or rejected, don't show button
  if (requestStatus === 'accepted' || requestStatus === 'rejected') {
    return null;
  }

  const isPending = requestStatus === 'pending';

  return (
    <div className={`request-button-container ${className}`}>
      <button
        className={`fb-request-btn ${isPending ? 'cancel' : 'send'}`}
        onClick={isPending ? handleCancelRequest : handleSendRequest}
        disabled={loading}
        type="button"
      >
        {loading ? (
          <div className="loading-spinner"></div>
        ) : (
          <>
            {isPending ? (
              <>
                <i className="bi bi-person-dash"></i>
                <span>Cancel Request</span>
              </>
            ) : (
              <>
                <i className="bi bi-person-plus"></i>
                <span>Send Request</span>
              </>
            )}
          </>
        )}
      </button>

      {/* Error Message */}
      {error && (
        <div className="error-message">
          <small className="text-danger">
            <i className="bi bi-exclamation-triangle me-1"></i>
            {error}
          </small>
        </div>
      )}

      <style jsx>{`
        .request-button-container {
          display: inline-block;
          position: relative;
        }

        .fb-request-btn {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 6px 12px;
          font-size: 13px;
          font-weight: 600;
          border: none;
          border-radius: 6px;
          cursor: pointer;
          transition: all 0.2s ease;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          white-space: nowrap;
          min-height: 32px;
        }

        .fb-request-btn:disabled {
          cursor: not-allowed;
          opacity: 0.6;
        }

        .fb-request-btn.send {
          background-color: #1877f2;
          color: white;
        }

        .fb-request-btn.send:hover:not(:disabled) {
          background-color: #166fe5;
        }

        .fb-request-btn.send:active {
          background-color: #1464d0;
          transform: scale(0.98);
        }

        .fb-request-btn.cancel {
          background-color: #e4e6ea;
          color: #1c1e21;
        }

        .fb-request-btn.cancel:hover:not(:disabled) {
          background-color: #d8dadf;
        }

        .fb-request-btn.cancel:active {
          background-color: #ccd0d5;
          transform: scale(0.98);
        }

        .fb-request-btn i {
          font-size: 14px;
        }

        .loading-spinner {
          width: 14px;
          height: 14px;
          border: 2px solid transparent;
          border-top: 2px solid currentColor;
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }

        .error-message {
          position: absolute;
          top: 100%;
          left: 0;
          right: 0;
          margin-top: 4px;
          text-align: center;
        }

        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        /* Responsive adjustments */
        @media (max-width: 576px) {
          .fb-request-btn {
            font-size: 12px;
            padding: 5px 10px;
            min-height: 28px;
          }
          
          .fb-request-btn i {
            font-size: 12px;
          }
        }
      `}</style>
    </div>
  );
};

export default RequestButton;