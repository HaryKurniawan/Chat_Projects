/* eslint-disable @typescript-eslint/no-explicit-any */
 
import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Modal, message } from 'antd';

import { adminAPI, authAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import AdminSidebar from '../components/admin/AdminSidebar';
import AdminMainArea from '../components/admin/AdminMainArea';

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
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
      const allMsgs = res.data.data; // Diurutkan menurun (descending) secara default dari backend

      const convMap = new Map<string, Conversation>();

      allMsgs.forEach((msg: any) => {
        // Membuat ID unik untuk menghubungkan pasangan pengguna
        const u1 = msg.sender.id < msg.receiver.id ? msg.sender : msg.receiver;
        const u2 = msg.sender.id < msg.receiver.id ? msg.receiver : msg.sender;
        const convId = `${u1.id}-${u2.id}`;

        if (!convMap.has(convId)) {
          convMap.set(convId, {
            id: convId,
            userA: u1,
            userB: u2,
            messages: [],
            lastMessage: msg, // Karena diurut menurun, elemen pertama yang ditemukan adalah yang paling baru
          });
        }
        
        // Unshift untuk membuat pesan berurutan naik (ascending / terlama berada di awal)
        convMap.get(convId)!.messages.unshift(msg);
      });

      const convArray = Array.from(convMap.values());
      setConversations(convArray);

      // Jika suatu percakapan sudah dipilih, perbarui dengan pesan-pesan baru
      if (selectedConv) {
        const updatedConv = convMap.get(selectedConv.id);
        // Pastikan kita membuat referensi objek yang baru agar React me-render ulang tampilan percakapan yang dipilih
        if (updatedConv) {
          setSelectedConv({ ...updatedConv });
        }
      }

    } catch {
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
      
      // Pembaruan Optimistic UI untuk percakapan yang sedang dipilih
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
      fetchMessages(); // Memuat ulang daftar percakapan di latar belakang
    } catch {
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
    } catch {
      console.error('Logout failed');
    }
  };

  return (
    <div className="flex h-[100dvh] bg-gray-50 overflow-hidden">
      <AdminSidebar
        conversations={conversations}
        selectedConv={selectedConv}
        loading={loading}
        onSelectConv={setSelectedConv}
        onLogout={handleLogout}
      />
      
      <AdminMainArea
        selectedConv={selectedConv}
        onBack={() => setSelectedConv(null)}
        onShowBanModal={showBanModal}
        scrollRef={scrollRef}
      />


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
              &quot;{selectedMessage?.content}&quot;
            </p>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default AdminPage;
