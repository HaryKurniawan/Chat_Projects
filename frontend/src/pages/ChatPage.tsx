/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react-hooks/set-state-in-effect */
import React, { useEffect, useState, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { useNavigate } from 'react-router-dom';

import { useAuth } from '../context/AuthContext';
import { chatAPI , authAPI } from '../services/api';
import ChatSidebar from '../components/chat/ChatSidebar';
import ChatMainArea from '../components/chat/ChatMainArea';

const API_URL = import.meta.env.VITE_API_URL;
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

  const fetchUsers = async () => {
    try {
      const res = await chatAPI.getUsers();
      setUsers(res.data.data);
    } catch {
      console.error('Failed to fetch users');
    }
  };

  const loadConversation = async (contactId: number) => {
    try {
      const res = await chatAPI.getConversation(contactId);
      setMessages(res.data.data);
    } catch {
      console.error('Failed to load conversation');
    }
  };

  useEffect(() => {
    fetchUsers();
    
    // Inisialisasi koneksi socket
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
    } catch {
      console.error('Logout failed');
    }
  };

  return (
    <div className="flex h-[100dvh] bg-gray-50 overflow-hidden">
      <ChatSidebar 
        user={user}
        users={users}
        selectedUser={selectedUser}
        onSelectUser={handleSelectUser}
        onLogout={handleLogout}
      />
      <ChatMainArea
        user={user}
        selectedUser={selectedUser}
        messages={messages}
        newMessage={newMessage}
        setNewMessage={setNewMessage}
        onSendMessage={handleSendMessage}
        onBack={() => setSelectedUser(null)}
        scrollRef={scrollRef}
      />
    </div>
  );
};

export default ChatPage;
