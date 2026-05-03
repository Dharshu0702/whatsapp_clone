import { useState, useEffect } from 'react';
import { HiX } from 'react-icons/hi';
import { fetchUserById } from '../../services/api';
import { useSocket } from '../../context/SocketContext';
import './ContactProfilePanel.css';

const ContactProfilePanel = ({ userId, onClose }) => {
  const [profileUser, setProfileUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const { isUserOnline } = useSocket();

  useEffect(() => {
    if (!userId) return;

    const loadUser = async () => {
      setLoading(true);
      try {
        const { data } = await fetchUserById(userId);
        setProfileUser(data);
      } catch (err) {
        console.error('Error fetching user profile:', err);
      }
      setLoading(false);
    };

    loadUser();
  }, [userId]);

  const isOnline = userId ? isUserOnline(userId) : false;

  return (
    <div className="contact-profile-panel" id="contact-profile-panel">
      {/* Overlay to close panel when clicking outside */}
      <div className="contact-profile-overlay" onClick={onClose} />

      <div className="contact-profile-drawer">
        {/* Header */}
        <div className="contact-profile-header">
          <button
            className="contact-profile-close-btn"
            onClick={onClose}
            id="contact-profile-close-btn"
          >
            <HiX />
          </button>
          <h3>Contact Info</h3>
        </div>

        {loading ? (
          <div className="contact-profile-loading">
            <div className="loading-spinner" />
          </div>
        ) : profileUser ? (
          <div className="contact-profile-body">
            {/* Profile Picture & Name Section */}
            <div className="contact-profile-avatar-section">
              <div className="contact-profile-avatar-wrapper">
                {profileUser.profilePicture ? (
                  <img
                    src={profileUser.profilePicture}
                    alt={profileUser.username}
                    className="contact-profile-avatar-img"
                  />
                ) : (
                  <div className="contact-profile-avatar-placeholder">
                    {profileUser.avatar || profileUser.username?.[0]?.toUpperCase()}
                  </div>
                )}
                {/* Online indicator dot */}
                <span
                  className={`contact-profile-online-dot ${isOnline ? 'online' : ''}`}
                />
              </div>

              <h2 className="contact-profile-username">{profileUser.username}</h2>
              <span className={`contact-profile-status-badge ${isOnline ? 'online' : 'offline'}`}>
                {isOnline ? 'Online' : 'Offline'}
              </span>
            </div>

            {/* Info Cards */}
            <div className="contact-profile-info-section">
              <div className="contact-profile-info-card">
                <div className="contact-profile-info-label">Username</div>
                <div className="contact-profile-info-value">{profileUser.username}</div>
              </div>

              <div className="contact-profile-info-card">
                <div className="contact-profile-info-label">Email</div>
                <div className="contact-profile-info-value muted">{profileUser.email}</div>
              </div>

              <div className="contact-profile-info-card">
                <div className="contact-profile-info-label">About</div>
                <div className="contact-profile-info-value">
                  {profileUser.status || 'Hey there! I am using WhatsApp'}
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="contact-profile-error">
            <p>Could not load profile.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ContactProfilePanel;
