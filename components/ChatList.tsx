'use client';

import { useState } from 'react';
import { Chat } from '@/utils/dataParser';
import MessageList from './MessageList';
import Summary from './Summary';

interface ChatListProps {
  chats: Chat[];
}

export default function ChatList({ chats }: ChatListProps) {
  const [selectedChat, setSelectedChat] = useState<Chat | null>(chats[0] || null);

  return (
    <div className="flex flex-col lg:flex-row space-y-4 lg:space-y-0 lg:space-x-4">
      <div className="w-full lg:w-1/5">
        <h2 className="text-xl font-bold mb-2">Chats</h2>
        <div className="bg-white rounded-lg shadow-sm p-2 max-h-[calc(100vh-200px)] overflow-y-auto">
          {chats.map((chat) => (
            <button
              key={chat.id}
              onClick={() => setSelectedChat(chat)}
              className={`w-full text-left p-2 rounded mb-1 text-sm ${
                selectedChat?.id === chat.id ? 'bg-blue-500 text-white' : 'bg-gray-100 hover:bg-gray-200'
              }`}
            >
              {chat.name}
            </button>
          ))}
        </div>
      </div>
      {selectedChat && (
        <div className="w-full lg:w-4/5">
          <div className="bg-white rounded-lg shadow-sm p-4">
            <div className="mb-4">
              <MessageList messages={selectedChat.messages} />
            </div>
            <Summary messages={selectedChat.messages} />
          </div>
        </div>
      )}
    </div>
  );
}

