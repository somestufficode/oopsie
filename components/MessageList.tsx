'use client';

import { useState, useEffect } from 'react';
import { Message } from '@/utils/dataParser';
import Pagination from './Pagination';
import { format } from 'date-fns';

interface MessageListProps {
  messages: Message[];
}

export default function MessageList({ messages }: MessageListProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const [currentMessages, setCurrentMessages] = useState<Message[]>([]);
  const messagesPerPage = 25;

  useEffect(() => {
    const indexOfLastMessage = currentPage * messagesPerPage;
    const indexOfFirstMessage = indexOfLastMessage - messagesPerPage;
    setCurrentMessages(messages.slice(indexOfFirstMessage, indexOfLastMessage));
  }, [currentPage, messages]);

  const totalPages = Math.ceil(messages.length / messagesPerPage);

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
  };

  const renderMessageText = (message: Message) => {
    if (message.type === 'service') {
      return (
        <p className="italic text-sm text-gray-600">
          {message.action === 'migrate_from_group'
            ? `Migrated from group "${message.title}"`
            : message.action === 'invite_members'
            ? `Invited members: ${message.members?.join(', ')}`
            : message.action}
        </p>
      );
    } else {
      return message.text_entities.map((entity, index) => (
        <span key={index} className={entity.type === 'bold' ? 'font-bold' : ''}>
          {entity.text}
        </span>
      ));
    }
  };

  return (
    <div>
      <h2 className="text-xl font-bold mb-4">Messages (Starting from David's inclusion)</h2>
      <div className="space-y-2">
        {currentMessages.map((message) => (
          <div key={message.id} className="bg-white p-3 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200">
            <div className="flex justify-between items-start mb-1">
              <span className="font-semibold text-sm">
                {message.type === 'service' ? message.actor : message.from}
              </span>
              <span className="text-xs text-gray-500">
                {format(new Date(message.date), 'MMM d, yyyy HH:mm')}
              </span>
            </div>
            <div className="text-sm">{renderMessageText(message)}</div>
            {message.type === 'message' && message.reactions && (
              <div className="mt-1 flex flex-wrap gap-1">
                {message.reactions.map((reaction, index) => (
                  <span key={index} className="text-xs bg-gray-100 px-1 py-0.5 rounded">
                    {reaction.emoji} {reaction.count}
                  </span>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={handlePageChange}
      />
    </div>
  );
}
