'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Message } from '@/utils/dataParser';
import Pagination from './Pagination';
import { format } from 'date-fns';
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { ChevronUp, ChevronDown, Search } from 'lucide-react'

interface MessageListProps {
  messages: Message[];
}

interface SearchResult {
  messageIndex: number;
  pageIndex: number;
}

export default function MessageList({ messages }: MessageListProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const [currentMessages, setCurrentMessages] = useState<Message[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [currentSearchIndex, setCurrentSearchIndex] = useState(-1);
  const messagesPerPage = 25;
  const messageRefs = useRef<(HTMLDivElement | null)[]>([]);

  const updateCurrentMessages = useCallback(() => {
    const indexOfLastMessage = currentPage * messagesPerPage;
    const indexOfFirstMessage = indexOfLastMessage - messagesPerPage;
    setCurrentMessages(messages.slice(indexOfFirstMessage, indexOfLastMessage));
  }, [currentPage, messages, messagesPerPage]);

  useEffect(() => {
    updateCurrentMessages();
  }, [updateCurrentMessages]);

  useEffect(() => {
    if (searchResults.length > 0 && currentSearchIndex !== -1) {
      const { pageIndex } = searchResults[currentSearchIndex];
      if (pageIndex !== currentPage - 1) {
        setCurrentPage(pageIndex + 1);
      }
    }
  }, [currentSearchIndex, searchResults, currentPage]);

  const totalPages = Math.ceil(messages.length / messagesPerPage);

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
  };

  const handleSearch = () => {
    if (searchTerm.trim() === '') {
      setSearchResults([]);
      setCurrentSearchIndex(-1);
      return;
    }

    const results: SearchResult[] = [];
    messages.forEach((message, index) => {
      const textToSearch = getMessageText(message);
      if (textToSearch.toLowerCase().includes(searchTerm.toLowerCase())) {
        results.push({
          messageIndex: index,
          pageIndex: Math.floor(index / messagesPerPage)
        });
      }
    });

    setSearchResults(results);
    if (results.length > 0) {
      setCurrentSearchIndex(0);
      const firstResult = results[0];
      setCurrentPage(firstResult.pageIndex + 1);
    } else {
      setCurrentSearchIndex(-1);
    }
  };

  const navigateSearch = (direction: 'up' | 'down') => {
    if (searchResults.length === 0) return;
    
    let newIndex;
    if (direction === 'up') {
      newIndex = (currentSearchIndex - 1 + searchResults.length) % searchResults.length;
    } else {
      newIndex = (currentSearchIndex + 1) % searchResults.length;
    }
    setCurrentSearchIndex(newIndex);
  };

  const getMessageText = (message: Message): string => {
    if (typeof message.text === 'string') {
      return message.text;
    } else if (Array.isArray(message.text_entities)) {
      return message.text_entities.map(entity => entity.text).join('');
    } else {
      return JSON.stringify(message.text);
    }
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
      const textToRender = getMessageText(message);

      if (searchTerm && textToRender.toLowerCase().includes(searchTerm.toLowerCase())) {
        const parts = textToRender.split(new RegExp(`(${searchTerm})`, 'gi'));
        return (
          <span>
            {parts.map((part, i) => 
              part.toLowerCase() === searchTerm.toLowerCase() ? (
                <span key={i} className="bg-yellow-200">{part}</span>
              ) : (
                part
              )
            )}
          </span>
        );
      } else {
        return <span>{textToRender}</span>;
      }
    }
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center space-x-2 mb-4">
        <Input
          type="text"
          placeholder="Search messages..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              handleSearch();
            }
          }}
          className="flex-grow"
        />
         {searchResults.length > 0 && (
        <div className="mt-2 text-sm text-gray-600">
          Showing result {currentSearchIndex + 1} of {searchResults.length}
        </div>
      )}
        <Button onClick={handleSearch}>
          <Search className="h-4 w-4 mr-2" />
          Search
        </Button>
        <Button onClick={() => navigateSearch('up')} disabled={searchResults.length === 0}>
          <ChevronUp className="h-4 w-4" />
        </Button>
        <Button onClick={() => navigateSearch('down')} disabled={searchResults.length === 0}>
          <ChevronDown className="h-4 w-4" />
        </Button>
      </div>
      <div className="flex-grow overflow-y-auto">
        <h2 className="text-xl font-bold mb-4">Messages</h2>
        <div className="space-y-2">
          {currentMessages.map((message, index) => {
            const globalIndex = (currentPage - 1) * messagesPerPage + index;
            const isHighlighted = searchResults.some(result => result.messageIndex === globalIndex);
            return (
              <div
                key={message.id}
                ref={(el) => {
                  if (el) messageRefs.current[index] = el;
                }}
                className={`bg-white p-3 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200 ${
                  isHighlighted ? 'border-2 border-yellow-400' : ''
                }`}
              >
                <div className="flex justify-between items-start mb-1">
                  <span className="font-semibold text-sm">
                    {message.type === 'service' ? message.actor : message.from || 'Unknown User'}
                  </span>
                  <span className="text-xs text-gray-500">
                    {format(new Date(message.date), 'MMM d, yyyy HH:mm')}
                  </span>
                </div>
                <div className="text-sm">{renderMessageText(message)}</div>
                {message.type === 'message' && message.reactions && (
                  <div className="mt-1 flex flex-wrap gap-1">
                    {message.reactions.map((reaction, i) => (
                      <span key={i} className="text-xs bg-gray-100 px-1 py-0.5 rounded">
                        {reaction.emoji} {reaction.count}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
      <div className="mt-4">
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={handlePageChange}
        />
      </div>
    </div>
  );
}
