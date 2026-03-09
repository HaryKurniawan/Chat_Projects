import React, { useEffect, useState, useRef } from 'react';
import { adminAPI, authAPI } from '../services/api';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Avatar, AvatarFallback } from '../components/ui/avatar';
import { ScrollArea } from '../components/ui/scroll-area';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Modal, message } from 'antd';
import { LogOut, ArrowLeft, ShieldAlert, ShieldCheck } from 'lucide-react';

interface Conversation {
  id: string;
  userA: any;
  userB: any;
  messages: any[];
  lastMessage: any;
}

const AdminPage: React.FC = () => {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConv, setSelectedConv] = useState<Conversation | null>(null);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedMessage, setSelectedMessage] = useState<any | null>(null);
  
  const { setIsAuthenticated, setUser } = useAuth();
  const navigate = useNavigate();
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchMessages();
  }, []);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [selectedConv, conversations]);

  const fetchMessages = async () => {
    try {
      setLoading(true);
      const res = await adminAPI.getAllMessages();
      const allMsgs = res.data.data; // Ordered desc by default from backend

      const convMap = new Map<string, Conversation>();

      allMsgs.forEach((msg: any) => {
        // Create unique ID for the pair of users
        const u1 = msg.sender.id < msg.receiver.id ? msg.sender : msg.receiver;
        const u2 = msg.sender.id < msg.receiver.id ? msg.receiver : msg.sender;
        const convId = `${u1.id}-${u2.id}`;

        if (!convMap.has(convId)) {
          convMap.set(convId, {
            id: convId,
            userA: u1,
            userB: u2,
            messages: [],
            lastMessage: msg, // Since descending, first encountered is the latest
          });
        }
        
        // Unshift to make messages ascending (oldest first)
        convMap.get(convId)!.messages.unshift(msg);
      });

      const convArray = Array.from(convMap.values());
      setConversations(convArray);

      // If a conversation is already selected, update it with new messages
      if (selectedConv) {
        const updatedConv = convMap.get(selectedConv.id);
        // Ensure we create a new object reference so React re-renders the selected conversation view
        if (updatedConv) {
          setSelectedConv({ ...updatedConv });
        }
      }

    } catch (error) {
      message.error('Failed to fetch messages');
    } finally {
      setLoading(false);
    }
  };

  const showBanModal = (msg: any) => {
    setSelectedMessage(msg);
    setIsModalOpen(true);
  };

  const handleToggleBan = async () => {
    if (!selectedMessage) return;
    
    try {
      const newStatus = !selectedMessage.isBanned;
      
      // Optimistic UI Update for the selected conversation
      if (selectedConv) {
         const updatedMessages = selectedConv.messages.map(msg => 
           msg.id === selectedMessage.id ? { ...msg, isBanned: newStatus } : msg
         );
         
         const updatedLastMessage = selectedConv.lastMessage.id === selectedMessage.id 
           ? { ...selectedConv.lastMessage, isBanned: newStatus } 
           : selectedConv.lastMessage;

         setSelectedConv({
           ...selectedConv,
           messages: updatedMessages,
           lastMessage: updatedLastMessage
         });

         setConversations(prev => prev.map(conv => {
            if (conv.id === selectedConv.id) {
               return { ...conv, messages: updatedMessages, lastMessage: updatedLastMessage };
            }
            return conv;
         }));
      }

      await adminAPI.banMessage(selectedMessage.id, newStatus);
      
      Modal.success({
        title: newStatus ? 'Pesan Di-takedown' : 'Blokir Dibuka',
        content: `Pesan berhasil di-${newStatus ? 'takedown (ban)' : 'unban'}. Pengguna kini ${newStatus ? 'tidak ' : ''}dapat melihat pesan ini lagi.`,
        okText: 'Tutup',
        centered: true
      });
      
      setIsModalOpen(false);
      fetchMessages(); // refresh list in background
    } catch (error) {
      Modal.error({
        title: 'Gagal Memperbarui',
        content: 'Terjadi kesalahan saat memproses permintaan Anda ke server.',
        okText: 'Tutup'
      });
    }
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
      {/* Sidebar: Daftar Percakapan */}
      <div className={`w-full md:w-80 border-r border-gray-200 bg-white flex flex-col shrink-0 ${selectedConv ? 'hidden md:flex' : 'flex'}`}>
        <div className="p-4 border-b border-gray-200 flex justify-between items-center bg-gray-50 shrink-0">
          <div className="flex items-center gap-3">
            <Avatar>
              <AvatarFallback className="bg-red-100 text-red-700 font-bold border border-red-200">
                A
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="font-semibold text-sm">Admin Dashboard</p>
              <p className="text-xs text-red-600 font-medium">Monitoring Chat</p>
            </div>
          </div>
          <Button variant="ghost" size="icon" onClick={handleLogout} title="Logout">
            <LogOut className="h-5 w-5 text-gray-600" />
          </Button>
        </div>
        
        <div className="p-4 flex-1 overflow-hidden flex flex-col">
          <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-4">Semua Percakapan</h2>
          <ScrollArea className="flex-1 -mx-4 px-4">
            <div className="space-y-2">
              {conversations.map((conv) => (
                <div
                  key={conv.id}
                  onClick={() => setSelectedConv(conv)}
                  className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-colors ${
                    selectedConv?.id === conv.id ? 'bg-red-50 border border-red-100' : 'hover:bg-gray-100 border border-transparent'
                  }`}
                >
                  <div className="relative flex shrink-0">
                    <Avatar className="h-10 w-10 border-2 border-white absolute left-0 z-10">
                      <AvatarFallback className="bg-blue-100 text-blue-700 text-xs">
                        {conv.userA.name.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <Avatar className="h-10 w-10 border-2 border-white ml-5 relative z-0">
                      <AvatarFallback className="bg-teal-100 text-teal-700 text-xs">
                        {conv.userB.name.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                  </div>
                  <div className="flex-1 min-w-0 ml-2">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {conv.userA.name} & {conv.userB.name}
                    </p>
                    <p className="text-xs text-gray-500 truncate">
                      {conv.lastMessage.isBanned ? '[Pesan Dihapus]' : conv.lastMessage.content}
                    </p>
                  </div>
                </div>
              ))}
              {!loading && conversations.length === 0 && (
                <p className="text-sm text-gray-500 text-center py-4">Belum ada percakapan.</p>
              )}
            </div>
          </ScrollArea>
        </div>
      </div>

      {/* Main Chat Area: Monitor Percakapan */}
      <div className={`flex-1 flex flex-col bg-[#efeae2] relative ${selectedConv ? 'flex' : 'hidden md:flex'}`}>
        {selectedConv ? (
          <>
            <div className="bg-gray-100 border-b border-gray-200 p-3 md:p-4 flex items-center shadow-sm z-10 sticky top-0 shrink-0">
              <Button 
                variant="ghost" 
                size="icon" 
                className="md:hidden mr-2 h-8 w-8 text-gray-600 hover:bg-gray-200 shrink-0" 
                onClick={() => setSelectedConv(null)}
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
              
              <div className="flex items-center gap-2">
                <Avatar className="h-8 w-8">
                  <AvatarFallback className="bg-blue-100 text-blue-700 text-xs font-semibold">
                    {selectedConv.userA.name.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="text-xs font-medium text-gray-600">&</div>
                <Avatar className="h-8 w-8">
                  <AvatarFallback className="bg-teal-100 text-teal-700 text-xs font-semibold">
                    {selectedConv.userB.name.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
              </div>

              <div className="flex-1 min-w-0 ml-3">
                <h3 className="font-semibold text-gray-900 truncate">
                  {selectedConv.userA.name} & {selectedConv.userB.name}
                </h3>
                <p className="text-xs text-red-600 font-medium truncate">Mode Monitor (Hanya Baca)</p>
              </div>
            </div>

            <ScrollArea className="flex-1 p-4 md:p-6 bg-[#efeae2]">
              <div className="space-y-6">
                <div className="flex justify-center mb-6">
                  <Badge variant="outline" className="bg-[#ffeebc] border-none text-gray-700 px-3 py-1 font-normal shadow-sm">
                    Anda sedang memantau obrolan pengguna
                  </Badge>
                </div>

                {selectedConv.messages.map((msg, idx) => {
                  // User A di kiri, User B di kanan
                  const isUserA = msg.sender.id === selectedConv.userA.id;
                  const isBanned = msg.isBanned;

                  return (
                    <div key={idx} className={`flex ${isUserA ? 'justify-start' : 'justify-end'}`}>
                      <div className={`max-w-[80%] md:max-w-[65%] flex flex-col ${isUserA ? 'items-start' : 'items-end'}`}>
                        {/* Nama Pengirim */}
                        <span className={`text-xs font-semibold mb-1 ${isUserA ? 'text-blue-600 ml-1' : 'text-teal-600 mr-1'}`}>
                          {msg.sender.name}
                        </span>

                        <div className="flex items-center gap-2 group">
                          {/* Ban Button (Positioned based on side) */}
                          {!isUserA && (
                            <Button 
                              variant={isBanned ? "secondary" : "ghost"} 
                              size="icon"
                              onClick={() => showBanModal(msg)}
                              className={`h-8 w-8 shrink-0 rounded-full transition-opacity opacity-0 group-hover:opacity-100 ${isBanned ? 'bg-gray-200 text-gray-700' : 'text-red-500 hover:bg-red-100 hover:text-red-600'}`}
                              title={isBanned ? "Pesan ini dibanned (Klik untuk unban)" : "Ban Pesan"}
                            >
                              {isBanned ? <ShieldCheck className="h-4 w-4" /> : <ShieldAlert className="h-4 w-4" />}
                            </Button>
                          )}

                          {/* Bubble Pesan */}
                          <div
                            className={`rounded-2xl px-4 py-2 shadow-sm relative ${
                              isBanned
                                ? 'bg-red-50 border border-red-200 text-red-500 italic'
                                : isUserA
                                ? 'bg-white border text-gray-800' // user A di putih
                                : 'bg-[#e7ffdb] border border-green-200 text-gray-800' // user B di hijau muda (seperti sent msg WA)
                            }`}
                          >
                            <p className="text-[14px] leading-relaxed break-words whitespace-pre-wrap">
                              {msg.content}
                            </p>
                            
                            <div className={`flex justify-end items-center gap-2 mt-1 ${isBanned ? 'text-red-400' : 'text-gray-400'}`}>
                              {isBanned && <span className="text-[10px] font-medium tracking-wide">[BANNED]</span>}
                              <span className="text-[10px]">
                                {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </span>
                            </div>
                          </div>

                          {/* Ban Button User A (Right sid of bubble) */}
                          {isUserA && (
                            <Button 
                              variant={isBanned ? "secondary" : "ghost"} 
                              size="icon"
                              onClick={() => showBanModal(msg)}
                              className={`h-8 w-8 shrink-0 rounded-full transition-opacity opacity-0 group-hover:opacity-100 ${isBanned ? 'bg-gray-200 text-gray-700' : 'text-red-500 hover:bg-red-100 hover:text-red-600'}`}
                              title={isBanned ? "Pesan ini dibanned (Klik untuk unban)" : "Ban Pesan"}
                            >
                              {isBanned ? <ShieldCheck className="h-4 w-4" /> : <ShieldAlert className="h-4 w-4" />}
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
                <div ref={scrollRef} />
              </div>
            </ScrollArea>

            {/* Admin Input Panel (Disabled) */}
            <div className="p-3 md:p-4 bg-gray-100 border-t border-gray-200 flex justify-center text-center">
              <p className="text-sm font-medium text-gray-500 py-2">
                Sebagai Admin, Anda tidak dapat membalas percakapan ini.
              </p>
            </div>
          </>
        ) : (
          <div className="flex-1 hidden md:flex items-center justify-center bg-[#f0f2f5] flex-col border-b-[6px] border-red-500">
            <div className="w-64 h-64 bg-slate-200 rounded-full flex items-center justify-center mb-8 opacity-50 overflow-hidden">
               <svg viewBox="0 0 100 100" className="w-32 h-32 fill-gray-400">
                 <path d="M50,15 A35,35 0 1,0 85,50 A35,35 0 0,0 50,15 Z M50,30 A10,10 0 1,1 40,40 A10,10 0 0,1 50,30 Z M50,75 C38,75 28,68 28,58 L72,58 C72,68 62,75 50,75 Z" fill="none" stroke="currentColor" strokeWidth="3" />
               </svg>
            </div>
            <h3 className="text-3xl font-light text-gray-700">Admin Monitoring</h3>
            <p className="text-gray-500 mt-4 text-sm font-medium">Pilih percakapan dari panel kiri untuk memantau.</p>
          </div>
        )}
      </div>

      <Modal
        title={selectedMessage?.isBanned ? "Buka Blokir (Unban)" : "Blokir (Ban) Pesan"}
        open={isModalOpen}
        onOk={handleToggleBan}
        onCancel={() => setIsModalOpen(false)}
        okText={selectedMessage?.isBanned ? "Ya, Unban" : "Ya, Takedown Pesan"}
        okButtonProps={{ danger: !selectedMessage?.isBanned }}
        cancelText="Batal"
      >
        <div className="py-4">
          <p className="mb-4">
            Apakah Anda yakin ingin melakukan {selectedMessage?.isBanned ? "unban pada" : "takedown (ban) untuk"} pesan ini?
          </p>
          <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
            <p className="text-xs text-gray-500 mb-1">
              Dari: <span className="font-semibold text-gray-700">{selectedMessage?.sender?.name}</span>
            </p>
            <p className="text-sm text-gray-800 italic border-l-2 border-gray-300 pl-3 mt-2 break-words whitespace-pre-wrap">
              "{selectedMessage?.content}"
            </p>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default AdminPage;
