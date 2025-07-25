import { useState, useEffect, useRef } from "react";
import { Send, Camera, Phone, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useLanguage } from "@/hooks/use-language";
import { useWebSocket } from "@/lib/websocket";
import type { Message, User } from "@shared/schema";

interface ChatInterfaceProps {
  jobId: string;
  messages: (Message & { sender: User; receiver: User })[];
  currentUserId: string;
  otherUser: User;
  onSendMessage: (content: string) => void;
  onClose?: () => void;
  isLoading?: boolean;
}

export default function ChatInterface({
  jobId,
  messages,
  currentUserId,
  otherUser,
  onSendMessage,
  onClose,
  isLoading = false
}: ChatInterfaceProps) {
  const { t } = useLanguage();
  const [newMessage, setNewMessage] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = () => {
    if (!newMessage.trim()) return;
    onSendMessage(newMessage);
    setNewMessage("");
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Chat Header */}
      <div className="kenyan-gradient text-white p-4 flex items-center shadow-lg">
        {onClose && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="mr-3 p-2 hover:bg-white/20 rounded-full text-white"
          >
            <ArrowLeft className="w-4 h-4" />
          </Button>
        )}
        
        <div className="flex items-center flex-1">
          <div className="w-10 h-10 bg-white/20 rounded-full mr-3 overflow-hidden">
            {otherUser.profileImageUrl ? (
              <img
                src={otherUser.profileImageUrl}
                alt={`${otherUser.firstName} ${otherUser.lastName}`}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-white font-semibold">
                {otherUser.firstName[0]}{otherUser.lastName[0]}
              </div>
            )}
          </div>
          <div>
            <h4 className="font-semibold">
              {otherUser.firstName} {otherUser.lastName}
            </h4>
            <p className="text-sm opacity-80">
              {otherUser.userType === 'provider' ? 'Professional Service Provider' : 'Customer'}
            </p>
          </div>
        </div>
        
        <Button
          variant="ghost"
          size="sm"
          className="p-2 hover:bg-white/20 rounded-full text-white"
        >
          <Phone className="w-4 h-4" />
        </Button>
      </div>

      {/* Messages Area */}
      <div className="flex-1 p-4 overflow-y-auto bg-gray-50 space-y-4">
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-kenyan-red"></div>
          </div>
        ) : (
          <>
            {messages.map((message) => {
              const isOwnMessage = message.senderId === currentUserId;
              return (
                <div
                  key={message.id}
                  className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-xs lg:max-w-md px-4 py-2 rounded-2xl ${
                      isOwnMessage
                        ? 'chat-bubble-user text-white'
                        : 'chat-bubble-provider text-gray-800'
                    }`}
                  >
                    <p className="break-words">{message.content}</p>
                    <span
                      className={`text-xs mt-1 block ${
                        isOwnMessage ? 'text-white/80' : 'text-gray-500'
                      }`}
                    >
                      {formatTime(message.createdAt)}
                    </span>
                  </div>
                </div>
              );
            })}
            
            {messages.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                <p>Start a conversation</p>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      {/* Message Input */}
      <div className="border-t border-gray-200 p-4 bg-white">
        <div className="flex items-center space-x-3">
          <Button
            variant="ghost"
            size="sm"
            className="p-2 text-gray-500 hover:text-kenyan-red flex-shrink-0"
          >
            <Camera className="w-4 h-4" />
          </Button>
          
          <Input
            type="text"
            placeholder={t('typeMessage')}
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            className="flex-1 rounded-full border-gray-300 focus:border-kenyan-red focus:ring-kenyan-red"
          />
          
          <Button
            onClick={handleSendMessage}
            disabled={!newMessage.trim()}
            size="sm"
            className="bg-kenyan-red hover:bg-red-700 text-white p-3 rounded-full flex-shrink-0 disabled:opacity-50"
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
