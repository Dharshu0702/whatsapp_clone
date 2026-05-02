import { useState, useRef, useEffect } from 'react';
import { HiPaperAirplane } from 'react-icons/hi';
import { useSocket } from '../../context/SocketContext';

const MessageInput = ({ chatId, onSend }) => {
  const [message, setMessage] = useState('');
  const { emitTyping, emitStopTyping } = useSocket();
  const textareaRef = useRef(null);
  const typingTimeoutRef = useRef(null);


  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 100)}px`;
    }
  }, [message]);


  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.focus();
    }
  }, [chatId]);

  const handleSubmit = () => {
    const trimmed = message.trim();
    if (!trimmed) return;

    onSend(trimmed);
    setMessage('');

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    emitStopTyping(chatId);

    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleChange = (e) => {
    setMessage(e.target.value);

    emitTyping(chatId);

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    typingTimeoutRef.current = setTimeout(() => {
      emitStopTyping(chatId);
    }, 2000);
  };

  return (
    <div className="chat-input-container" id="message-input-container">
      <div className="chat-input-wrapper">
        <textarea
          ref={textareaRef}
          className="chat-input"
          placeholder="Type a message"
          value={message}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          rows={1}
          id="message-input"
        />
      </div>
      <button
        className="send-btn"
        onClick={handleSubmit}
        title="Send message"
        id="send-message-btn"
      >
        <HiPaperAirplane style={{ transform: 'rotate(90deg)' }} />
      </button>
    </div>
  );
};

export default MessageInput;
