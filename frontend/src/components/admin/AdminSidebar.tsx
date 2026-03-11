/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable jsx-a11y/click-events-have-key-events */
/* eslint-disable jsx-a11y/no-static-element-interactions */
import React from 'react';
import { LogOut } from 'lucide-react';

import { Avatar, AvatarFallback } from '../ui/avatar';
import { Button } from '../ui/button';
import { ScrollArea } from '../ui/scroll-area';

interface AdminSidebarProps {
  conversations: any[];
  selectedConv: any | null;
  loading: boolean;
  onSelectConv: (conv: any) => void;
  onLogout: () => void;
}

const AdminSidebar: React.FC<AdminSidebarProps> = ({
  conversations,
  selectedConv,
  loading,
  onSelectConv,
  onLogout,
}) => {
  return (
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
        <Button variant="ghost" size="icon" onClick={onLogout} title="Logout">
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
                onClick={() => onSelectConv(conv)}
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
  );
};

export default AdminSidebar;
