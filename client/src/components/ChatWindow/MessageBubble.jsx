import { useAuth } from '../../context/AuthContext';
import { HiCheck } from 'react-icons/hi';

const MessageBubble = ({ message, previousMessage }) => {
  const { user } = useAuth();

  const isSent = message.sender?._id === user?._id || message.sender === user?._id;
  const senderName = message.sender?.username || '';

  const formatTime = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const shouldShowDateSep = () => {
    if (!previousMessage) return true;
    const prevDate = new Date(previousMessage.createdAt).toDateString();
    const currDate = new Date(message.createdAt).toDateString();
    return prevDate !== currDate;
  };

  const formatDateSep = (dateStr) => {
    const date = new Date(dateStr);
    const now = new Date();
    const isToday = date.toDateString() === now.toDateString();
    const yesterday = new Date(now);
    yesterday.setDate(yesterday.getDate() - 1);
    const isYesterday = date.toDateString() === yesterday.toDateString();

    if (isToday) return 'Today';
    if (isYesterday) return 'Yesterday';
    return date.toLocaleDateString([], {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });
  };

  return (
    <>
      {shouldShowDateSep() && (
        <div className="message-date-separator">
          <span>{formatDateSep(message.createdAt)}</span>
        </div>
      )}

      <div className={`message-wrapper ${isSent ? 'sent' : 'received'}`}>
        <div className={`message-bubble ${isSent ? 'sent' : 'received'}`}>
          <span className="message-content">{message.content}</span>
          <span className="message-meta">
            <span className="message-time">{formatTime(message.createdAt)}</span>
            {isSent && (
              <span className="message-read-receipt">
                <HiCheck />
              </span>
            )}
          </span>
        </div>
      </div>
    </>
  );
};

export default MessageBubble;
