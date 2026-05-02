import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { HiOutlineSearch, HiOutlineLogout, HiOutlineUserAdd } from 'react-icons/hi';
import { useAuth } from '../../context/AuthContext';
import { useSocket } from '../../context/SocketContext';
import { fetchUsers, createChat, fetchChats } from '../../services/api';
import ChatList from '../ChatList/ChatList';
import './Sidebar.css';

const Sidebar = ({ chats, setChats, selectedChat, onSelectChat, onNewChat }) => {
  const { user, logout } = useAuth();
  const { isUserOnline } = useSocket();
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [users, setUsers] = useState([]);
  const [showNewChat, setShowNewChat] = useState(false);
  const [loadingUsers, setLoadingUsers] = useState(false);

  useEffect(() => {
    if (showNewChat) {
      loadUsers();
    }
  }, [showNewChat]);

  const loadUsers = async () => {
    setLoadingUsers(true);
    try {
      const { data } = await fetchUsers();
      const existingChatUserIds = new Set(
        chats.flatMap((c) =>
          c.participants?.filter((p) => p._id !== user?._id).map((p) => p._id) || []
        )
      );
      const filteredUsers = data.filter((u) => !existingChatUserIds.has(u._id));
      setUsers(filteredUsers);
    } catch (err) {
      console.error('Error fetching users:', err);
    }
    setLoadingUsers(false);
  };

  const handleStartChat = async (userId) => {
    try {
      const { data } = await createChat(userId);
      setShowNewChat(false);

      const exists = chats.find((c) => c._id === data._id);
      if (!exists) {
        setChats((prev) => [data, ...prev]);
      }

      onSelectChat(data);
    } catch (err) {
      console.error('Error creating chat:', err);
    }
  };

  const handleLogout = () => {
    logout();
  };

  const filteredChats = chats.filter((chat) => {
    if (!search.trim()) return true;
    const otherUser = chat.participants?.find((p) => p._id !== user?._id);
    return otherUser?.username?.toLowerCase().includes(search.toLowerCase());
  });

  return (
    <div className="sidebar" id="sidebar">

      <div className="sidebar-header">
        <div className="sidebar-user-info">
          <div
            className="sidebar-avatar clickable"
            onClick={() => navigate('/profile')}
            title="View profile"
            id="sidebar-avatar-btn"
          >
            {user?.profilePicture ? (
              <img src={user.profilePicture} alt={user.username} className="sidebar-avatar-img" />
            ) : (
              user?.avatar || user?.username?.[0]?.toUpperCase()
            )}
          </div>
          <span className="sidebar-username">{user?.username}</span>
        </div>
        <div className="sidebar-actions">
          <button
            className="sidebar-action-btn"
            onClick={() => setShowNewChat(!showNewChat)}
            title="New Chat"
            id="new-chat-btn"
          >
            <HiOutlineUserAdd />
          </button>
        </div>
      </div>

      <div className="sidebar-search">
        <div className="sidebar-search-input-wrapper">
          <HiOutlineSearch className="sidebar-search-icon" />
          <input
            className="sidebar-search-input"
            type="text"
            placeholder="Search or start new chat"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            id="chat-search-input"
          />
        </div>
      </div>

      {showNewChat && (
        <div className="new-chat-section">
          <div className="new-chat-header">
            <h3>Start new chat</h3>
            <button
              className="new-chat-toggle-btn"
              onClick={() => setShowNewChat(false)}
            >
              Close
            </button>
          </div>
          <div className="users-list">
            {loadingUsers ? (
              <div style={{ padding: '20px', textAlign: 'center', color: 'var(--wa-text-secondary)' }}>
                Loading users...
              </div>
            ) : users.length === 0 ? (
              <div style={{ padding: '20px', textAlign: 'center', color: 'var(--wa-text-secondary)' }}>
                No other users found
              </div>
            ) : (
              users.map((u) => (
                <div
                  key={u._id}
                  className="user-list-item"
                  onClick={() => handleStartChat(u._id)}
                  id={`user-${u._id}`}
                >
                  <div className="user-list-avatar">
                    {u.avatar || u.username?.[0]?.toUpperCase()}
                    {isUserOnline(u._id) && (
                      <span
                        style={{
                          position: 'absolute',
                          bottom: 0,
                          right: 0,
                          width: 10,
                          height: 10,
                          background: 'var(--wa-green)',
                          borderRadius: '50%',
                          border: '2px solid var(--wa-bg-primary)',
                        }}
                      />
                    )}
                  </div>
                  <div>
                    <div className="user-list-name">{u.username}</div>
                    <div className="user-list-status">{u.status}</div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}


      <ChatList
        chats={filteredChats}
        selectedChat={selectedChat}
        onSelectChat={onSelectChat}
      />


      <div className="sidebar-footer">
        <button className="logout-btn" onClick={handleLogout} id="logout-btn">
          <HiOutlineLogout />
          Sign Out
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
