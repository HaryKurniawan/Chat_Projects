/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react';
import { ArrowLeft } from 'lucide-react';

import { Avatar, AvatarFallback } from '../ui/avatar';
import { Button } from '../ui/button';
import { ScrollArea } from '../ui/scroll-area';
import { Input } from '../ui/input';

interface ChatMainAreaProps {
  user: any;
  selectedUser: any | null;
  messages: any[];
  newMessage: string;
  setNewMessage: (msg: string) => void;
  onSendMessage: (e: React.FormEvent) => void;
  onBack: () => void;
  scrollRef: React.RefObject<HTMLDivElement | null>;
}

const ChatMainArea: React.FC<ChatMainAreaProps> = ({
  user,
  selectedUser,
  messages,
  newMessage,
  setNewMessage,
  onSendMessage,
  onBack,
  scrollRef,
}) => {
  return (
    <div className={`flex-1 flex flex-col bg-[#efeae2] relative ${selectedUser ? 'flex' : 'hidden md:flex'}`}>
      {selectedUser ? (
        <>
          <div className="bg-gray-100 border-b border-gray-200 p-3 md:p-4 flex items-center shadow-sm z-10 sticky top-0">
            <Button 
              variant="ghost" 
              size="icon" 
              className="md:hidden mr-2 h-8 w-8 text-gray-600 hover:bg-gray-200 shrink-0" 
              onClick={onBack}
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <Avatar className="h-10 w-10 mr-3 cursor-pointer shrink-0">
              <AvatarFallback className="bg-white text-gray-700 font-semibold border border-gray-200">
                {selectedUser.name.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-gray-900 truncate">{selectedUser.name}</h3>
              <p className="text-xs text-gray-500 truncate">{selectedUser.email}</p>
            </div>
          </div>

          <ScrollArea className="flex-1 p-4 md:p-6 bg-[#efeae2] bg-cover bg-center">
            {/* Gaya background chat (seperti WhatsApp) bisa ditambahkan di sini */}
            <div className="space-y-6">
              {messages.map((msg, idx) => {
                const isMine = msg.senderId === user?.id;
                const isBanned = msg.isBanned;

                return (
                  <div key={idx} className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[70%] flex flex-col ${isMine ? 'items-end' : 'items-start'}`}>
                      <div
                        className={`rounded-2xl px-5 py-3 shadow-sm ${
                          isBanned
                            ? 'bg-red-50 border border-red-100 text-red-500 italic'
                            : isMine
                            ? 'bg-[#d9fdd3] border border-green-200 text-gray-800 rounded-br-none'
                            : 'bg-white border border-gray-100 text-gray-800 rounded-bl-none'
                        }`}
                      >
                        {/* =========================================
                            MODE AMAN (SECURE) - AKTIF
                            React escape semua string menjadi teks biasa.
                            Tag HTML dan script tidak akan tereksekusi.
                        ========================================= */}
                        <p className="text-[15px] leading-relaxed break-words whitespace-pre-wrap">
                          {isBanned 
                            ? '🚫 [Pesan telah diblokir oleh Admin]' 
                            : msg.content}
                        </p>

                        {/* =========================================
                            MODE RENTAN (INSECURE / XSS) - DINONAKTIFKAN
                            Untuk latihan XSS: 
                        ========================================= */}
                        {/* 
                        {isBanned ? (
                          <p className="text-[15px] leading-relaxed break-words whitespace-pre-wrap">🚫 [Pesan telah diblokir oleh Admin]</p>
                        ) : (
                          <p 
                            className="text-[15px] leading-relaxed break-words whitespace-pre-wrap" 
                            dangerouslySetInnerHTML={{ __html: msg.content }} 
                          />
                        )}
                        */}
                        <div className={`flex justify-end items-center gap-1 mt-1 ${isBanned ? 'text-red-400' : 'text-gray-400'}`}>
                           <span className="text-[10px]">
                             {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                           </span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
              <div ref={scrollRef} />
            </div>
          </ScrollArea>

          <div className="p-3 md:p-4 bg-gray-100 border-t border-gray-200">
            <form onSubmit={onSendMessage} className="flex gap-2.5">
              <Input
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Ketik pesan..."
                className="flex-1 rounded-full px-5 bg-white border-none shadow-sm h-11 focus-visible:ring-0 focus-visible:ring-offset-0"
              />
              <Button type="submit" disabled={!newMessage.trim()} className="rounded-full w-11 h-11 p-0 flex shrink-0 justify-center items-center shadow-sm bg-teal-600 hover:bg-teal-700">
                <svg viewBox="0 0 24 24" height="24" width="24" preserveAspectRatio="xMidYMid meet" className="fill-white ml-1">
                  <path d="M1.101,21.757L23.8,12.028L1.101,2.3l0.011,7.912l13.623,1.816L1.112,13.845 L1.101,21.757z" />
                </svg>
              </Button>
            </form>
          </div>
        </>
      ) : (
        <div className="flex-1 hidden md:flex items-center justify-center bg-[#f0f2f5] flex-col border-b-[6px] border-teal-500">
          <div className="w-64 h-64 bg-slate-200 rounded-full flex items-center justify-center mb-8 opacity-50 overflow-hidden">
             <svg viewBox="0 0 100 100" className="w-32 h-32 fill-gray-400">
               <path d="M50,10 C27.9,10 10,27.9 10,50 C10,58.8 12.8,66.9 17.6,73.6 L13.3,86.7 L26.4,82.4 C33.1,87.2 41.2,90 50,90 C72.1,90 90,72.1 90,50 C90,27.9 72.1,10 50,10 Z" fill="none" stroke="currentColor" strokeWidth="4" />
               <path d="M40,40 L60,40 M40,50 L60,50 M40,60 L52,60" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
             </svg>
          </div>
          <h3 className="text-3xl font-light text-gray-700">Simple Web Chat</h3>
          <p className="text-gray-500 mt-4 text-sm font-medium">Send and receive messages without keeping your phone online.</p>
        </div>
      )}
    </div>
  );
};

export default ChatMainArea;
