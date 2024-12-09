import fs from 'fs/promises';
import path from 'path';

interface TextEntity {
  type: string;
  text: string;
}

export interface ServiceMessage {
  id: number;
  type: 'service';
  date: string;
  date_unixtime: string;
  actor: string;
  actor_id: string;
  action: string;
  title?: string;
  members?: string[];
  text: string;
  text_entities: TextEntity[];
}

export interface TextMessage {
  id: number;
  type: 'message';
  date: string;
  date_unixtime: string;
  from: string;
  from_id: string;
  text: string;
  text_entities: TextEntity[];
  reactions?: Array<{
    type: string;
    count: number;
    emoji: string;
    recent: Array<{
      from: string;
      from_id: string;
      date: string;
    }>;
  }>;
}

export type Message = ServiceMessage | TextMessage;

export interface Chat {
  name: string;
  type: string;
  id: number;
  messages: Message[];
}

export async function parseTextFile(filePath: string): Promise<{ chats: Chat[], error: string | null }> {
  try {
    const fullPath = path.join(process.cwd(), 'public', filePath);
    const fileContents = await fs.readFile(fullPath, 'utf8');
    const jsonData = JSON.parse(fileContents);
    
    if (!jsonData.chats || !Array.isArray(jsonData.chats.list)) {
      return { chats: [], error: 'Invalid data format: chats.list is not an array' };
    }

    const chats: Chat[] = jsonData.chats.list.map((chat: any) => {
      const messages = chat.messages.filter((message: any) => 
        (message.type === 'service' || message.type === 'message') &&
        typeof message.id === 'number' &&
        typeof message.date === 'string'
      );

      const davidIndex = findDavidIndex(messages);
      const filteredMessages = messages.slice(davidIndex);

      return {
        name: chat.name,
        type: chat.type,
        id: chat.id,
        messages: filteredMessages,
      };
    });

    return { chats, error: null };
  } catch (error) {
    console.error('Error parsing JSON file:', error);
    return { chats: [], error: 'Error parsing JSON file' };
  }
}

function findDavidIndex(messages: Message[]): number {
  return messages.findIndex(message => 
    (message.type === 'message' && message.from?.includes('David')) ||
    (message.type === 'service' && message.actor?.includes('David'))
  );
}

