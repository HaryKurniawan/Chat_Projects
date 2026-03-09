import React, { useEffect, useState, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { chatAPI } from '../services/api';
import { io, Socket } from 'socket.io-client';
import { Input } from '../components/ui/input';
import { Button } from '../components/ui/button';
import { ScrollArea } from '../components/ui/scroll-area';
import { Avatar, AvatarFallback } from '../components/ui/avatar';
import { LogOut, ArrowLeft } from 'lucide-react';
import { authAPI } from '../services/api';
import { useNavigate } from 'react-router-dom';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';
const SOCKET_URL = API_URL.replace('/api', '');

const ChatPage: React.FC = () => {
  const { user, setIsAuthenticated, setUser } = useAuth();
  const navigate = useNavigate();
  const [users, setUsers] = useState<any[]>([]);
  const [selectedUser, setSelectedUser] = useState<any | null>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const socketRef = useRef<Socket | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchUsers();
    
    // Initialize socket connection
    const socket = io(SOCKET_URL, {
      withCredentials: true,
    });
    
    socketRef.current = socket;
    
    if (user?.id) {
      socket.emit('join', user.id);
    }

    socket.on('receiveMessage', (message) => {
      setMessages((prev) => [...prev, message]);
    });

    socket.on('messageStatusUpdated', (updatedMessage) => {
      setMessages((prev) => 
        prev.map(msg => msg.id === updatedMessage.id ? { ...msg, isBanned: updatedMessage.isBanned } : msg)
      );
    });

    return () => {
      socket.off('receiveMessage');
      socket.off('messageStatusUpdated');
      socket.disconnect();
    };
  }, [user]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  const fetchUsers = async () => {
    try {
      const res = await chatAPI.getUsers();
      setUsers(res.data.data);
    } catch (error) {
      console.error('Failed to fetch users', error);
    }
  };

  const loadConversation = async (contactId: number) => {
    try {
      const res = await chatAPI.getConversation(contactId);
      setMessages(res.data.data);
    } catch (error) {
      console.error('Failed to load conversation', error);
    }
  };

  const handleSelectUser = (contact: any) => {
    setSelectedUser(contact);
    loadConversation(contact.id);
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedUser || !user) return;

    const messageData = {
      senderId: user.id,
      receiverId: selectedUser.id,
      content: newMessage.trim(),
    };

    socketRef.current?.emit('sendMessage', messageData);
    setNewMessage('');
  };

  const handleLogout = async () => {
    try {
      await authAPI.logout();
      setIsAuthenticated(false);
      setUser(null);
      navigate('/login');
    } catch (error) {
      console.error('Logout failed', error);
    }
  };

  return (
    <div className="flex h-[100dvh] bg-gray-50 overflow-hidden">
      {/* Sidebar */}
      <div className={`w-full md:w-80 border-r border-gray-200 bg-white flex flex-col shrink-0 ${selectedUser ? 'hidden md:flex' : 'flex'}`}>
        <div className="p-4 border-b border-gray-200 flex justify-between items-center bg-gray-50">
          <div className="flex items-center gap-3">
            <Avatar>
              <AvatarFallback className="bg-blue-100 text-blue-700">
                {user?.name?.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="font-semibold text-sm">{user?.name}</p>
              <p className="text-xs text-gray-500">{user?.role === 'ADMIN' ? 'Admin' : 'User'}</p>
            </div>
          </div>
          <Button variant="ghost" size="icon" onClick={handleLogout} title="Logout">
            <LogOut className="h-5 w-5 text-gray-600" />
          </Button>
        </div>
        
        <div className="p-4 flex-1 overflow-hidden flex flex-col">
          <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-4">Contacts</h2>
          <ScrollArea className="flex-1 -mx-4 px-4">
            <div className="space-y-2">
              {users.map((u) => (
                <div
                  key={u.id}
                  onClick={() => handleSelectUser(u)}
                  className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-colors ${
                    selectedUser?.id === u.id ? 'bg-blue-50 border border-blue-100' : 'hover:bg-gray-100'
                  }`}
                >
                  <Avatar>
                    <AvatarFallback>{u.name.charAt(0).toUpperCase()}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{u.name}</p>
                    <p className="text-xs text-gray-500 truncate">{u.email}</p>
                  </div>
                </div>
              ))}
              {users.length === 0 && (
                <p className="text-sm text-gray-500 text-center py-4">No contacts found.</p>
              )}
            </div>
          </ScrollArea>
        </div>
      </div>

      {/* Main Chat Area */}
      <div className={`flex-1 flex flex-col bg-[#efeae2] relative ${selectedUser ? 'flex' : 'hidden md:flex'}`}>
        {selectedUser ? (
          <>
            <div className="bg-gray-100 border-b border-gray-200 p-3 md:p-4 flex items-center shadow-sm z-10 sticky top-0">
              <Button 
                variant="ghost" 
                size="icon" 
                className="md:hidden mr-2 h-8 w-8 text-gray-600 hover:bg-gray-200 shrink-0" 
                onClick={() => setSelectedUser(null)}
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
              {/* WhatsApp background style could be added here */}
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
                          <p className="text-[15px] leading-relaxed break-words whitespace-pre-wrap">
                            {isBanned 
                              ? '🚫 [Pesan telah diblokir oleh Admin]' 
                              : msg.content}
                          </p>
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
              <form onSubmit={handleSendMessage} className="flex gap-2.5">
                <Input
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Ketik pesan..."
                  className="flex-1 rounded-full px-5 bg-white border-none shadow-sm h-11 focus-visible:ring-0 focus-visible:ring-offset-0"
                />
                <Button type="submit" disabled={!newMessage.trim()} className="rounded-full w-11 h-11 p-0 flex shrink-0 justify-center items-center shadow-sm bg-teal-600 hover:bg-teal-700">
                  <svg viewBox="0 0 24 24" height="24" width="24" preserveAspectRatio="xMidYMid meet" className="fill-white ml-1">
                    <path d="M1.101,21.757L23.8,12.028L1.101,2.3l0.011,7.912l13.623,1.816L1.112,13.845 L1.101,21.757z"></path>
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
    </div>
  );
};

export default ChatPage;
