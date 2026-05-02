import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { HiArrowLeft, HiCamera, HiPencil, HiCheck, HiX } from 'react-icons/hi';
import { useAuth } from '../context/AuthContext';
import { updateProfile, deleteProfilePicture, fetchUsers } from '../services/api';
import './ProfilePage.css';

const ProfilePage = () => {
  const { user, updateUser } = useAuth();
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const [username, setUsername] = useState(user?.username || '');
  const [status, setStatus] = useState(user?.status || '');
  const [editingUsername, setEditingUsername] = useState(false);
  const [editingStatus, setEditingStatus] = useState(false);
  const [loading, setLoading] = useState(false);
  const [picLoading, setPicLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const hasProfilePic = !!user?.profilePicture;

  const showSuccess = (msg) => {
    setSuccess(msg);
    setTimeout(() => setSuccess(''), 3000);
  };

  const showError = (msg) => {
    setError(msg);
    setTimeout(() => setError(''), 4000);
  };

  const handleSaveUsername = async () => {
    if (!username.trim() || username === user.username) {
      setEditingUsername(false);
      setUsername(user.username);
      return;
    }
    setLoading(true);
    try {
      const { data } = await updateProfile({ username });
      updateUser(data);
      showSuccess('Username updated!');
    } catch (err) {
      showError(err.response?.data?.message || 'Failed to update username');
      setUsername(user.username);
    }
    setLoading(false);
    setEditingUsername(false);
  };

  const handleSaveStatus = async () => {
    if (status === user.status) {
      setEditingStatus(false);
      return;
    }
    setLoading(true);
    try {
      const { data } = await updateProfile({ status });
      updateUser(data);
      showSuccess('About updated!');
    } catch (err) {
      showError('Failed to update about');
      setStatus(user.status);
    }
    setLoading(false);
    setEditingStatus(false);
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      showError('Please select a valid image file');
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      showError('Image must be smaller than 2MB');
      return;
    }

    const reader = new FileReader();
    reader.onload = async (ev) => {
      const base64 = ev.target.result;
      setPicLoading(true);
      try {
        const { data } = await updateProfile({ profilePicture: base64 });
        updateUser(data);
        showSuccess(hasProfilePic ? 'Profile picture updated!' : 'Profile picture uploaded!');
      } catch (err) {
        showError('Failed to save profile picture');
      }
      setPicLoading(false);
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const handleDeletePicture = async () => {
    if (!window.confirm('Remove your profile picture?')) return;
    setPicLoading(true);
    try {
      const { data } = await deleteProfilePicture();
      updateUser(data);
      showSuccess('Profile picture removed');
    } catch (err) {
      showError('Failed to remove profile picture');
    }
    setPicLoading(false);
  };

  return (
    <div className="profile-page" id="profile-page">
      <div className="profile-header">
        <button
          className="profile-back-btn"
          onClick={() => navigate('/')}
          id="profile-back-btn"
        >
          <HiArrowLeft />
        </button>
        <h2>Profile</h2>
      </div>

      <div className="profile-content">
        {error && <div className="profile-alert profile-alert-error">{error}</div>}
        {success && <div className="profile-alert profile-alert-success">{success}</div>}

        <div className="profile-pic-section">
          <div className="profile-pic-wrapper">
            {picLoading ? (
              <div className="profile-pic-loading">
                <div className="loading-spinner" />
              </div>
            ) : user?.profilePicture ? (
              <img
                src={user.profilePicture}
                alt="Profile"
                className="profile-pic-img"
              />
            ) : (
              <div className="profile-pic-placeholder">
                {user?.avatar || user?.username?.[0]?.toUpperCase()}
              </div>
            )}

            {/* Camera overlay — opens file picker */}
            <button
              className="profile-pic-camera"
              onClick={() => fileInputRef.current?.click()}
              title={hasProfilePic ? 'Update photo' : 'Upload photo'}
            >
              <HiCamera />
            </button>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              style={{ display: 'none' }}
              onChange={handleImageChange}
              id="profile-pic-input"
            />
          </div>

          {/* Upload / Update / Delete buttons */}
          <div className="profile-pic-actions">
            <button
              className="profile-pic-btn primary"
              onClick={() => fileInputRef.current?.click()}
              id={hasProfilePic ? 'update-pic-btn' : 'upload-pic-btn'}
            >
              {hasProfilePic ? 'Update Photo' : 'Upload Photo'}
            </button>
            {hasProfilePic && (
              <button
                className="profile-pic-btn danger"
                onClick={handleDeletePicture}
                id="delete-pic-btn"
              >
                Delete Photo
              </button>
            )}
          </div>
        </div>

        <div className="profile-info-section">
          <div className="profile-info-card">
            <div className="profile-info-label">Username</div>
            <div className="profile-info-row">
              {editingUsername ? (
                <>
                  <input
                    className="profile-info-input"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    maxLength={30}
                    autoFocus
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleSaveUsername();
                      if (e.key === 'Escape') {
                        setUsername(user.username);
                        setEditingUsername(false);
                      }
                    }}
                    id="username-input"
                  />
                  <button className="profile-icon-btn save" onClick={handleSaveUsername}><HiCheck /></button>
                  <button className="profile-icon-btn cancel" onClick={() => { setUsername(user.username); setEditingUsername(false); }}><HiX /></button>
                </>
              ) : (
                <>
                  <span className="profile-info-value">{user?.username}</span>
                  <button className="profile-icon-btn edit" onClick={() => setEditingUsername(true)} id="edit-username-btn"><HiPencil /></button>
                </>
              )}
            </div>
          </div>

          <div className="profile-info-card">
            <div className="profile-info-label">Email</div>
            <div className="profile-info-row">
              <span className="profile-info-value muted">{user?.email}</span>
            </div>
          </div>

          <div className="profile-info-card">
            <div className="profile-info-label">About</div>
            <div className="profile-info-row">
              {editingStatus ? (
                <>
                  <input
                    className="profile-info-input"
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                    maxLength={140}
                    autoFocus
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleSaveStatus();
                      if (e.key === 'Escape') {
                        setStatus(user.status);
                        setEditingStatus(false);
                      }
                    }}
                    id="status-input"
                  />
                  <button className="profile-icon-btn save" onClick={handleSaveStatus}><HiCheck /></button>
                  <button className="profile-icon-btn cancel" onClick={() => { setStatus(user.status); setEditingStatus(false); }}><HiX /></button>
                </>
              ) : (
                <>
                  <span className="profile-info-value">{user?.status || 'Hey there! I am using WhatsApp'}</span>
                  <button className="profile-icon-btn edit" onClick={() => setEditingStatus(true)} id="edit-status-btn"><HiPencil /></button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
