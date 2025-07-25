import { useState, useEffect, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useParams } from "wouter";
import { ArrowLeft, Phone, Camera, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { useLanguage } from "@/hooks/use-language";
import { apiRequest } from "@/lib/queryClient";
import { useWebSocket } from "@/lib/websocket";

export default function Chat() {
  const { jobId } = useParams();
  const { t } = useLanguage();
  const [message, setMessage] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const queryClient = useQueryClient();

  const { data: messages = [], isLoading } = useQuery({
    queryKey: ["/api/messages", jobId],
    enabled: !!jobId,
  });

  const { data: job } = useQuery({
    queryKey: ["/api/jobs", jobId],
    enabled: !!jobId,
  });

  const sendMessageMutation = useMutation({
    mutationFn: async (messageData: any) => {
      return await apiRequest("POST", "/api/messages", messageData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/messages", jobId] });
      setMessage("");
    },
  });

  // WebSocket connection for real-time messages
  useWebSocket((wsMessage) => {
    if (wsMessage.type === 'new_message' && wsMessage.message.jobId === jobId) {
      queryClient.invalidateQueries({ queryKey: ["/api/messages", jobId] });
    }
  });

  const handleSendMessage = () => {
    if (!message.trim() || !jobId) return;

    sendMessageMutation.mutate({
      jobId,
      content: message,
      senderId: "current-user-id", // This should come from auth context
      receiverId: "other-user-id", // This should be determined from job
      messageType: "text",
    });
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-kenyan-red mx-auto mb-4"></div>
          <p>{t('loading')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen">
      {/* Chat Header */}
      <div className="kenyan-gradient text-white p-4 flex items-center">
        <Button variant="ghost" size="sm" className="mr-3 p-2 hover:bg-white/20 rounded-full text-white">
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <div className="flex items-center flex-1">
          <div className="w-10 h-10 bg-gray-300 rounded-full mr-3"></div>
          <div>
            <h4 className="font-semibold">Provider Name</h4>
            <p className="text-sm opacity-80">Professional Service</p>
          </div>
        </div>
        <Button variant="ghost" size="sm" className="p-2 hover:bg-white/20 rounded-full text-white">
          <Phone className="w-4 h-4" />
        </Button>
      </div>

      {/* Chat Messages */}
      <div className="flex-1 p-4 overflow-y-auto space-y-4 bg-gray-50">
        {messages.map((msg, index) => (
          <div key={index} className={`flex ${msg.senderId === 'current-user-id' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-xs p-3 rounded-lg ${
              msg.senderId === 'current-user-id' 
                ? 'chat-bubble-user text-white' 
                : 'chat-bubble-provider text-gray-800'
            }`}>
              <p>{msg.content}</p>
              <span className={`text-xs mt-1 block ${
                msg.senderId === 'current-user-id' ? 'text-white/80' : 'text-gray-500'
              }`}>
                {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
          </div>
        ))}

        {job?.status === 'accepted' && (
          <div className="text-center py-2">
            <span className="bg-kenyan-green text-white px-3 py-1 rounded-full text-sm">
              <i className="fas fa-check-circle mr-1"></i>
              {t('jobAccepted')}
            </span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Chat Input */}
      <div className="border-t border-gray-200 p-4 bg-white">
        <div className="flex items-center space-x-3">
          <Button variant="ghost" size="sm" className="p-2 text-gray-500 hover:text-kenyan-red">
            <Camera className="w-4 h-4" />
          </Button>
          <Input
            type="text"
            placeholder={t('typeMessage')}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
            className="flex-1 rounded-full"
          />
          <Button
            onClick={handleSendMessage}
            disabled={!message.trim() || sendMessageMutation.isPending}
            size="sm"
            className="bg-kenyan-red hover:bg-red-700 text-white p-3 rounded-full"
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
