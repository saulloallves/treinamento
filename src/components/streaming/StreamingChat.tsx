import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Send, X, MessageCircle } from 'lucide-react';

interface ChatMessage {
  id: string;
  participantId: string;
  participantName: string;
  message: string;
  timestamp: string;
}

interface StreamingChatProps {
  messages: ChatMessage[];
  onSendMessage: (message: string) => void;
  currentUserId: string;
  onClose: () => void;
}

const StreamingChat: React.FC<StreamingChatProps> = ({
  messages,
  onSendMessage,
  currentUserId,
  onClose
}) => {
  const [newMessage, setNewMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (newMessage.trim()) {
      onSendMessage(newMessage.trim());
      setNewMessage('');
      inputRef.current?.focus();
    }
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('pt-BR', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-gray-700 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <MessageCircle className="h-5 w-5 text-blue-400" />
          <h3 className="font-medium text-white">Chat</h3>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={onClose}
          className="text-gray-400 hover:text-white hover:bg-gray-700"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>

      {/* Messages */}
      <ScrollArea className="flex-1 p-4">
        <div className="space-y-3">
          {messages.length === 0 ? (
            <div className="text-center text-gray-500 py-8">
              <MessageCircle className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p className="text-sm">Nenhuma mensagem ainda</p>
              <p className="text-xs text-gray-600">Seja o primeiro a enviar uma mensagem!</p>
            </div>
          ) : (
            messages.map((message) => {
              const isOwn = message.participantId === currentUserId;
              
              return (
                <div
                  key={message.id}
                  className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[80%] rounded-lg px-3 py-2 ${
                      isOwn
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-700 text-gray-100'
                    }`}
                  >
                    {!isOwn && (
                      <div className="text-xs text-gray-300 mb-1 font-medium">
                        {message.participantName}
                      </div>
                    )}
                    <div className="text-sm break-words">
                      {message.message}
                    </div>
                    <div
                      className={`text-xs mt-1 ${
                        isOwn ? 'text-blue-200' : 'text-gray-400'
                      }`}
                    >
                      {formatTime(message.timestamp)}
                    </div>
                  </div>
                </div>
              );
            })
          )}
          <div ref={messagesEndRef} />
        </div>
      </ScrollArea>

      {/* Input */}
      <div className="p-4 border-t border-gray-700">
        <form onSubmit={handleSendMessage} className="flex gap-2">
          <Input
            ref={inputRef}
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Digite sua mensagem..."
            className="flex-1 bg-gray-700 border-gray-600 text-white placeholder:text-gray-400 focus:border-blue-500"
            maxLength={500}
          />
          <Button
            type="submit"
            size="sm"
            disabled={!newMessage.trim()}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            <Send className="h-4 w-4" />
          </Button>
        </form>
        <div className="text-xs text-gray-500 mt-2">
          {newMessage.length}/500 caracteres
        </div>
      </div>
    </div>
  );
};

export default StreamingChat;