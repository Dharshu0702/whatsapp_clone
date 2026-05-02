import { useState, useEffect, useRef, useCallback } from 'react';
import { HiOutlineLockClosed, HiChevronDown } from 'react-icons/hi';
import { HiOutlineChatBubbleLeftRight } from 'react-icons/hi2';
import { useAuth } from '../../context/AuthContext';
import { useSocket } from '../../context/SocketContext';
import { fetchMessages, sendMessage as sendMessageAPI } from '../../services/api';
import MessageBubble from './MessageBubble';
import MessageInput from './MessageInput';
import './ChatWindow.css';

const ChatWindow = ({ chat, onMessageSent }) => {
  const { user } = useAuth();
  const { socket, joinChat, leaveChat, sendMessage: emitMessage, isUserOnline } = useSocket();
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [showScrollBtn, setShowScrollBtn] = useState(false);
  const messagesEndRef = useRef(null);
  const messagesContainerRef = useRef(null);
  const prevChatRef = useRef(null);

  const otherUser = chat?.participants?.find((p) => p._id !== user?._id);

  useEffect(() => {
    if (!chat?._id) return;

    if (prevChatRef.current && prevChatRef.current !== chat._id) {
      leaveChat(prevChatRef.current);
    }

    prevChatRef.current = chat._id;

    joinChat(chat._id);

    const loadMessages = async () => {
      setLoading(true);
      try {
        const { data } = await fetchMessages(chat._id);
        setMessages(data);
      } catch (err) {
        console.error('Error fetching messages:', err);
      }
      setLoading(false);
    };

    loadMessages();

    return () => {
      if (chat?._id) {
        leaveChat(chat._id);
      }
    };
  }, [chat?._id]);

  useEffect(() => {
    if (!socket) return;

    const handleMessageReceived = (message) => {
      const msgChatId = message.chat?._id || message.chat;
      if (msgChatId === chat?._id) {
        setMessages((prev) => [...prev, message]);
        scrollToBottom();
      }
    };

    const handleTyping = ({ chatId, userId }) => {
      if (chatId === chat?._id && userId !== user?._id) {
        setIsTyping(true);
      }
    };

    const handleStopTyping = ({ chatId, userId }) => {
      if (chatId === chat?._id && userId !== user?._id) {
        setIsTyping(false);
      }
    };

    socket.on('message-received', handleMessageReceived);
    socket.on('typing', handleTyping);
    socket.on('stop-typing', handleStopTyping);

    return () => {
      socket.off('message-received', handleMessageReceived);
      socket.off('typing', handleTyping);
      socket.off('stop-typing', handleStopTyping);
    };
  }, [socket, chat?._id, user?._id]);

  useEffect(() => {
    if (!loading) {
      scrollToBottom();
    }
  }, [messages, loading]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleScroll = () => {
    if (!messagesContainerRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = messagesContainerRef.current;
    setShowScrollBtn(scrollHeight - scrollTop - clientHeight > 100);
  };

  const handleSendMessage = async (content) => {
    try {
      const { data } = await sendMessageAPI(chat._id, content);
      setMessages((prev) => [...prev, data]);

      emitMessage({ ...data, chat });

      if (onMessageSent) {
        onMessageSent(data);
      }

      scrollToBottom();
    } catch (err) {
      console.error('Error sending message:', err);
    }
  };

  if (!chat) {
    return (
      <div className="chat-window">
        <div className="chat-window-empty">
          <div className="chat-window-empty-icon">
            <HiOutlineChatBubbleLeftRight />
          </div>
          <h2>WhatsApp Web</h2>
          <p> </p>
          <p>
            Welcome back. Let’s chat.
          </p>
          <div className="chat-window-empty-footer">
            <HiOutlineLockClosed />
            <span>End-to-end encrypted</span>
          </div>
        </div>
      </div>
    );
  }

  const isOnline = otherUser ? isUserOnline(otherUser._id) : false;

  return (
    <div className="chat-window" id="chat-window">
      {/* Header */}
      <div className="chat-header" id="chat-header">
        <div className="chat-header-avatar">
          {otherUser?.profilePicture ? (
            <img src={otherUser.profilePicture} alt={otherUser.username} className="chat-header-avatar-img" />
          ) : (
            otherUser?.avatar || otherUser?.username?.[0]?.toUpperCase()
          )}
        </div>
        <div className="chat-header-info">
          <div className="chat-header-name">{otherUser?.username}</div>
          <div className={`chat-header-status ${isTyping ? 'typing' : isOnline ? 'online' : ''}`}>
            {isTyping ? 'typing...' : isOnline ? 'online' : 'offline'}
          </div>
        </div>
      </div>

      {/* Messages */}
      <div
        className="chat-messages"
        ref={messagesContainerRef}
        onScroll={handleScroll}
        id="messages-container"
      >
        {loading ? (
          <div className="chat-messages-loading">
            <div className="loading-spinner" />
          </div>
        ) : (
          <>
            {messages.map((msg, index) => (
              <MessageBubble
                key={msg._id}
                message={msg}
                previousMessage={index > 0 ? messages[index - 1] : null}
              />
            ))}

            {isTyping && (
              <div className="typing-indicator">
                <div className="typing-indicator-dots">
                  <span className="typing-dot" />
                  <span className="typing-dot" />
                  <span className="typing-dot" />
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      {/* Scroll to bottom button */}
      {showScrollBtn && (
        <button className="scroll-bottom-btn" onClick={scrollToBottom} id="scroll-bottom-btn">
          <HiChevronDown />
        </button>
      )}

      {/* Message Input */}
      <MessageInput chatId={chat._id} onSend={handleSendMessage} />
    </div>
  );
};

export default ChatWindow;
