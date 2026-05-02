import ChatListItem from './ChatListItem';
import { HiOutlineChatAlt2 } from 'react-icons/hi';
import './ChatList.css';

const ChatList = ({ chats, selectedChat, onSelectChat }) => {
  if (!chats || chats.length === 0) {
    return (
      <div className="chat-list">
        <div className="chat-list-empty">
          <div className="chat-list-empty-icon">
            <HiOutlineChatAlt2 />
          </div>
          <h3>No conversations yet</h3>
          <p>
            Click the <strong>+</strong> button above to start<br />
            a new conversation
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="chat-list" id="chat-list">
      {chats.map((chat) => (
        <ChatListItem
          key={chat._id}
          chat={chat}
          isActive={selectedChat?._id === chat._id}
          onClick={() => onSelectChat(chat)}
        />
      ))}
    </div>
  );
};

export default ChatList;
