"use client";

import { useState, useEffect } from "react";
import { MessageSquare, RefreshCw, Copy, Check } from "lucide-react";

export default function TelegramAdminPage() {
  const [updates, setUpdates] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<number | null>(null);

  const fetchUpdates = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/telegram/get-updates");
      const data = await res.json();
      if (data.ok && data.result) {
        // Reverse so newest is at the top
        setUpdates(data.result.reverse());
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUpdates();
  }, []);

  const handleCopy = (id: number) => {
    navigator.clipboard.writeText(id.toString());
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="p-8 max-w-5xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-4xl font-black uppercase tracking-tighter text-white flex items-center gap-3">
            <MessageSquare className="w-8 h-8 text-tpc-orange" />
            Telegram <span className="text-gray-500">Integration</span>
          </h1>
          <p className="text-gray-400 text-sm mt-1">Map your employees' Telegram Chat IDs here.</p>
        </div>
        <button 
          onClick={fetchUpdates}
          disabled={loading}
          className="bg-white/10 text-white px-4 py-2 rounded-lg font-bold text-sm hover:bg-white/20 transition-all flex items-center gap-2"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          Refresh Messages
        </button>
      </div>

      <div className="bg-[#111] border border-white/5 rounded-2xl p-6 mb-8">
        <h2 className="text-lg font-bold text-white mb-2">How to map an employee:</h2>
        <ol className="list-decimal pl-5 text-gray-400 space-y-1 text-sm">
          <li>Tell your employee to open Telegram and search for your bot.</li>
          <li>Tell them to send a message like "Hello" to the bot.</li>
          <li>Click the Refresh button above.</li>
          <li>Their message and Chat ID will appear below. Copy the Chat ID and paste it into the <strong>TelegramChatID</strong> column of your Users Google Sheet!</li>
        </ol>
      </div>

      <div className="space-y-4">
        {updates.length === 0 && !loading && (
          <div className="text-center py-12 text-gray-500 italic bg-[#111] border border-white/5 rounded-2xl">
            No recent messages found. Send a message to your bot to see it here!
          </div>
        )}
        
        {updates.map((update: any) => {
          const msg = update.message || update.edited_message;
          if (!msg) return null;
          
          return (
            <div key={update.update_id} className="bg-[#151515] border border-white/5 p-4 rounded-xl flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-bold text-white">{msg.from?.first_name} {msg.from?.last_name}</span>
                  {msg.from?.username && <span className="text-gray-500 text-sm">@{msg.from.username}</span>}
                </div>
                <div className="text-gray-400 text-sm">{msg.text}</div>
                <div className="text-xs text-gray-600 mt-2">{new Date(msg.date * 1000).toLocaleString()}</div>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-right">
                  <div className="text-xs text-gray-500 uppercase tracking-wider mb-1">Chat ID</div>
                  <div className="font-mono text-tpc-orange font-bold bg-tpc-orange/10 px-2 py-1 rounded">
                    {msg.chat?.id}
                  </div>
                </div>
                <button
                  onClick={() => handleCopy(msg.chat?.id)}
                  className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-white transition-colors"
                >
                  {copiedId === msg.chat?.id ? <Check className="w-5 h-5 text-green-500" /> : <Copy className="w-5 h-5" />}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
