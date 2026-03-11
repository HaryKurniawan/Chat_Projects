/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react';
import { ArrowLeft, ShieldAlert, ShieldCheck } from 'lucide-react';

import { Avatar, AvatarFallback } from '../ui/avatar';
import { Button } from '../ui/button';
import { ScrollArea } from '../ui/scroll-area';
import { Badge } from '../ui/badge';

interface AdminMainAreaProps {
  selectedConv: any | null;
  onBack: () => void;
  onShowBanModal: (msg: any) => void;
  scrollRef: React.RefObject<HTMLDivElement | null>;
}

const AdminMainArea: React.FC<AdminMainAreaProps> = ({
  selectedConv,
  onBack,
  onShowBanModal,
  scrollRef,
}) => {
  return (
    <div className={`flex-1 flex flex-col bg-[#efeae2] relative ${selectedConv ? 'flex' : 'hidden md:flex'}`}>
      {selectedConv ? (
        <>
          <div className="bg-gray-100 border-b border-gray-200 p-3 md:p-4 flex items-center shadow-sm z-10 sticky top-0 shrink-0">
            <Button 
              variant="ghost" 
              size="icon" 
              className="md:hidden mr-2 h-8 w-8 text-gray-600 hover:bg-gray-200 shrink-0" 
              onClick={onBack}
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

              {selectedConv.messages.map((msg: any, idx: number) => {
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
                            onClick={() => onShowBanModal(msg)}
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
                              ? 'bg-white border text-gray-800' // user A warna putih
                              : 'bg-[#e7ffdb] border border-green-200 text-gray-800' // user B warna hijau muda (seperti status pesan terkirim di WA)
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

                        {/* Tombol Ban User A (Di sisi kanan bubble) */}
                        {isUserA && (
                          <Button 
                            variant={isBanned ? "secondary" : "ghost"} 
                            size="icon"
                            onClick={() => onShowBanModal(msg)}
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

          {/* Panel Input Admin (Dinonaktifkan) */}
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
  );
};

export default AdminMainArea;
