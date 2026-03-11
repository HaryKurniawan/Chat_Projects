/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable jsx-a11y/click-events-have-key-events */
/* eslint-disable jsx-a11y/no-static-element-interactions */
import React from 'react';
import { LogOut } from 'lucide-react';

import { Avatar, AvatarFallback } from '../ui/avatar';
import { Button } from '../ui/button';
import { ScrollArea } from '../ui/scroll-area';

interface ChatSidebarProps {
  user: any;
  users: any[];
  selectedUser: any | null;
  onSelectUser: (user: any) => void;
  onLogout: () => void;
}

const ChatSidebar: React.FC<ChatSidebarProps> = ({
  user,
  users,
  selectedUser,
  onSelectUser,
  onLogout,
}) => {
  return (
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
        <Button variant="ghost" size="icon" onClick={onLogout} title="Logout">
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
                onClick={() => onSelectUser(u)}
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
  );
};

export default ChatSidebar;
