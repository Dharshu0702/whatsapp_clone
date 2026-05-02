import { useAuth } from '../../context/AuthContext';
import { useSocket } from '../../context/SocketContext';

const ChatListItem = ({ chat, isActive, onClick }) => {
  const { user } = useAuth();
  const { isUserOnline } = useSocket();

  const otherUser = chat.participants?.find((p) => p._id !== user?._id);

  if (!otherUser) return null;

  const formatTime = (dateStr) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    const now = new Date();
    const isToday = date.toDateString() === now.toDateString();

    if (isToday) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }

    const yesterday = new Date(now);
    yesterday.setDate(yesterday.getDate() - 1);
    if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    }

    return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
  };

  const lastMessageText = chat.lastMessage?.content || 'No messages yet';
  const lastMessageTime = chat.lastMessage?.createdAt || chat.updatedAt;
  const isOnline = isUserOnline(otherUser._id);

  return (
    <div
      className={`chat-list-item ${isActive ? 'active' : ''}`}
      onClick={onClick}
      id={`chat-item-${chat._id}`}
    >
      <div className="chat-item-avatar">
        {otherUser.profilePicture ? (
          <img
            src={otherUser.profilePicture}
            alt={otherUser.username}
            className="chat-item-avatar-img"
          />
        ) : (
          otherUser.avatar || otherUser.username?.[0]?.toUpperCase()
        )}
        {isOnline && <span className="chat-item-online-dot" />}
      </div>

      <div className="chat-item-content">
        <div className="chat-item-top">
          <span className="chat-item-name">{otherUser.username}</span>
          <span className="chat-item-time">{formatTime(lastMessageTime)}</span>
        </div>
        <div className="chat-item-bottom">
          <span className="chat-item-last-message">{lastMessageText}</span>
        </div>
      </div>
    </div>
  );
};

export default ChatListItem;
