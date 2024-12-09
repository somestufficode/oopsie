import { parseTextFile } from '../utils/dataParser';
import ChatList from '@/components/ChatList';

export default async function Home() {
  const { chats, error } = await parseTextFile('results_dotfun.txt');

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <main className="container mx-auto">
        <h1 className="text-2xl font-bold mb-4">Chat Summary (From David's inclusion)!</h1>
        {error ? (
          <p className="text-red-500">{error}</p>
        ) : chats.length > 0 ? (
          <ChatList chats={chats} />
        ) : (
          <p className="text-yellow-500">No valid chats found in the file.</p>
        )}
      </main>
    </div>
  );
}

