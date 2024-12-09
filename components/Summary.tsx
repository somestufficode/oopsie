import { Message } from '@/utils/dataParser';
import { format } from 'date-fns';

interface SummaryProps {
  messages: Message[];
}

export default function Summary({ messages }: SummaryProps) {
  if (messages.length === 0) {
    return (
      <div className="bg-gray-100 p-3 rounded-lg">
        <h2 className="text-lg font-semibold mb-2">Summary</h2>
        <p className="text-sm">No messages to summarize.</p>
      </div>
    );
  }

  const totalMessages = messages.length;
  const uniqueUsers = new Set(messages.map(m => m.type === 'service' ? m.actor : m.from)).size;
  const latestMessage = messages[messages.length - 1];
  const earliestMessage = messages[0];
  const totalReactions = messages.reduce((sum, message) => {
    if (message.type === 'message' && message.reactions) {
      return sum + message.reactions.reduce((reactionSum, reaction) => reactionSum + reaction.count, 0);
    }
    return sum;
  }, 0);
  const serviceMessages = messages.filter(m => m.type === 'service').length;

  return (
    <div className="bg-gray-100 p-3 rounded-lg">
      <h2 className="text-lg font-semibold mb-2">Summary (Since David's inclusion)</h2>
      <div className="grid grid-cols-2 gap-2 text-sm">
        <div><strong>Total Messages:</strong> {totalMessages}</div>
        <div><strong>Unique Users:</strong> {uniqueUsers}</div>
        <div><strong>Date Range:</strong> {format(new Date(earliestMessage.date), 'MMM d, yyyy')} - {format(new Date(latestMessage.date), 'MMM d, yyyy')}</div>
        <div><strong>Most Active User:</strong> {getMostActiveUser(messages)}</div>
        <div><strong>Most Used Emoji:</strong> {getMostUsedEmoji(messages)}</div>
        <div><strong>Total Reactions:</strong> {totalReactions}</div>
        <div><strong>Service Messages:</strong> {serviceMessages}</div>
      </div>
    </div>
  );
}

function getMostActiveUser(messages: Message[]): string {
  const userCounts = messages.reduce((acc, message) => {
    const user = message.type === 'service' ? message.actor : message.from;
    acc[user] = (acc[user] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const sortedUsers = Object.entries(userCounts).sort((a, b) => b[1] - a[1]);
  return sortedUsers.length > 0 ? `${sortedUsers[0][0]} (${sortedUsers[0][1]})` : 'N/A';
}

function getMostUsedEmoji(messages: Message[]): string {
  const emojiCounts = messages.reduce((acc, message) => {
    if (message.type === 'message' && message.reactions) {
      message.reactions.forEach(reaction => {
        acc[reaction.emoji] = (acc[reaction.emoji] || 0) + reaction.count;
      });
    }
    return acc;
  }, {} as Record<string, number>);

  const sortedEmojis = Object.entries(emojiCounts).sort((a, b) => b[1] - a[1]);
  return sortedEmojis.length > 0 ? `${sortedEmojis[0][0]} (${sortedEmojis[0][1]})` : 'N/A';
}

