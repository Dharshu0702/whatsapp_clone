import { useState, useEffect, useCallback } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import { fetchChats } from '../services/api';
import Sidebar from '../components/Sidebar/Sidebar';
import ChatWindow from '../components/ChatWindow/ChatWindow';
import '../App.css';

const ChatPage = () => {
  const { isAuthenticated, loading, user } = useAuth();
  const { socket } = useSocket();
  const [chats, setChats] = useState([]);
  const [selectedChat, setSelectedChat] = useState(null);
  const [chatsLoading, setChatsLoading] = useState(true);

  useEffect(() => {
    if (isAuthenticated) {
      loadChats();
    }
  }, [isAuthenticated]);

  useEffect(() => {
    if (!socket) return;

    const handleChatUpdated = (message) => {

      loadChats();
    };

    socket.on('chat-updated', handleChatUpdated);

    return () => {
      socket.off('chat-updated', handleChatUpdated);
    };
  }, [socket]);

  const loadChats = async () => {
    try {
      const { data } = await fetchChats();
      setChats(data);
    } catch (err) {
      console.error('Error fetching chats:', err);
    }
    setChatsLoading(false);
  };

  const handleSelectChat = useCallback((chat) => {
    setSelectedChat(chat);
  }, []);

  const handleMessageSent = useCallback((message) => {
    setChats((prev) =>
      prev.map((c) => {
        if (c._id === message.chat?._id || c._id === message.chat) {
          return {
            ...c,
            lastMessage: message,
            updatedAt: new Date().toISOString(),
          };
        }
        return c;
      }).sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))
    );
  }, []);

  if (loading) {
    return (
      <div className="app-container">
        <div className="loading-spinner" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/auth" replace />;
  }

  return (
    <div className="app-container" id="chat-page">
      <div className="app-wrapper">
        <Sidebar
          chats={chats}
          setChats={setChats}
          selectedChat={selectedChat}
          onSelectChat={handleSelectChat}
        />
        <ChatWindow
          chat={selectedChat}
          onMessageSent={handleMessageSent}
        />
      </div>
    </div>
  );
};

export default ChatPage;
