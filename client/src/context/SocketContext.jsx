import { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext';

const SocketContext = createContext(null);

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
};

const SOCKET_URL = 'http://localhost:5000';

export const SocketProvider = ({ children }) => {
  const { user, isAuthenticated } = useAuth();
  const [socket, setSocket] = useState(null);
  const [onlineUsers, setOnlineUsers] = useState(new Set());
  const [isConnected, setIsConnected] = useState(false);
  const socketRef = useRef(null);

  useEffect(() => {
    if (isAuthenticated && user?._id) {
      const newSocket = io(SOCKET_URL, {
        transports: ['websocket', 'polling'],
      });

      newSocket.on('connect', () => {
        console.log('🔌 Socket connected');
        setIsConnected(true);
        newSocket.emit('setup', user._id);
      });

      newSocket.on('disconnect', () => {
        console.log('🔌 Socket disconnected');
        setIsConnected(false);
      });

      newSocket.on('online-users', (users) => {
        setOnlineUsers(new Set(users));
      });

      newSocket.on('user-online', (userId) => {
        setOnlineUsers((prev) => new Set([...prev, userId]));
      });

      newSocket.on('user-offline', (userId) => {
        setOnlineUsers((prev) => {
          const next = new Set(prev);
          next.delete(userId);
          return next;
        });
      });

      socketRef.current = newSocket;
      setSocket(newSocket);

      return () => {
        newSocket.disconnect();
        socketRef.current = null;
        setSocket(null);
        setIsConnected(false);
      };
    } else {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
        setSocket(null);
        setIsConnected(false);
        setOnlineUsers(new Set());
      }
    }
  }, [isAuthenticated, user?._id]);

  const joinChat = useCallback(
    (chatId) => {
      if (socketRef.current) {
        socketRef.current.emit('join-chat', chatId);
      }
    },
    []
  );

  const leaveChat = useCallback(
    (chatId) => {
      if (socketRef.current) {
        socketRef.current.emit('leave-chat', chatId);
      }
    },
    []
  );

  const sendMessage = useCallback(
    (message) => {
      if (socketRef.current) {
        socketRef.current.emit('new-message', message);
      }
    },
    []
  );

  const emitTyping = useCallback(
    (chatId) => {
      if (socketRef.current && user?._id) {
        socketRef.current.emit('typing', { chatId, userId: user._id });
      }
    },
    [user?._id]
  );

  const emitStopTyping = useCallback(
    (chatId) => {
      if (socketRef.current && user?._id) {
        socketRef.current.emit('stop-typing', { chatId, userId: user._id });
      }
    },
    [user?._id]
  );

  const isUserOnline = useCallback(
    (userId) => {
      return onlineUsers.has(userId);
    },
    [onlineUsers]
  );

  const value = {
    socket,
    isConnected,
    onlineUsers,
    joinChat,
    leaveChat,
    sendMessage,
    emitTyping,
    emitStopTyping,
    isUserOnline,
  };

  return <SocketContext.Provider value={value}>{children}</SocketContext.Provider>;
};

export default SocketContext;
