import React, { useState, useRef, useEffect } from 'react';
import clsx from 'clsx';

interface ChatbotPanelProps {
  isOpen: boolean;
  onClose: () => void;
  initialMessage?: string;
  onAskWithSelectedText?: () => void; // Added for the button in Root.tsx
}

interface ChatMessage {
  id: number;
  sender: 'user' | 'bot';
  text: string;
  isInitial?: boolean;
  citations?: string[];
}

function ChatbotPanel({ isOpen, onClose, initialMessage }: ChatbotPanelProps): JSX.Element {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  useEffect(() => {
    // Process initialMessage when panel opens or initialMessage changes
    if (isOpen && initialMessage && messages.filter(m => m.isInitial).length === 0) {
        const newUserMessage: ChatMessage = { id: messages.length + 1, sender: 'user', text: initialMessage, isInitial: true };
        setMessages((prevMessages) => [...prevMessages, newUserMessage]);
        sendApiRequest(initialMessage, initialMessage); // Use initialMessage as selectedText for the API
    }
  }, [isOpen, initialMessage]); // Removed 'messages' from dependency array to prevent infinite loop

  const sendApiRequest = async (query: string, selectedText: string | undefined = undefined) => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ query, selected_text: selectedText }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      const botResponse: ChatMessage = {
        id: messages.length + 2,
        sender: 'bot',
        text: data.response,
        citations: data.citations,
      };
      setMessages((prevMessages) => [...prevMessages, botResponse]);
    } catch (error) {
      console.error('Error fetching chat response:', error);
      const errorMessage: ChatMessage = {
        id: messages.length + 2,
        sender: 'bot',
        text: 'Sorry, I am having trouble connecting right now. Please try again later.',
      };
      setMessages((prevMessages) => [...prevMessages, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendMessage = () => {
    if (inputMessage.trim()) {
      const newUserMessage: ChatMessage = { id: messages.length + 1, sender: 'user', text: inputMessage };
      setMessages((prevMessages) => [...prevMessages, newUserMessage]);
      sendApiRequest(inputMessage);
      setInputMessage('');
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputMessage(e.target.value);
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !isLoading) {
      handleSendMessage();
    }
  };

  return (
    <div className={clsx(
        "fixed bottom-24 right-6 z-50 flex h-[600px] w-[400px] flex-col overflow-hidden rounded-xl bg-background-light dark:bg-background-dark shadow-2xl border border-gray-200/50 dark:border-white/10 transition-transform duration-300",
        isOpen ? "translate-x-0" : "translate-x-full"
      )}>
      {/* Chat Header */}
      <div className="flex items-center justify-between p-4 flex-shrink-0 bg-gradient-to-r from-blue-600 to-teal-500 text-white">
        <h3 className="text-lg font-bold">AI Book Assistant</h3>
        <button className="rounded-full p-1.5 hover:bg-white/20" onClick={onClose}>
          <span className="material-symbols-outlined text-2xl">close</span>
        </button>
      </div>

      {/* Message Area */}
      <div className="flex-1 space-y-4 overflow-y-auto p-4">
        {messages.length === 0 && !initialMessage && (
          <div className="flex items-start gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/20 text-primary flex-shrink-0">
              <span className="material-symbols-outlined text-xl">smart_toy</span>
            </div>
            <div className="rounded-lg rounded-tl-none bg-gray-200/50 dark:bg-white/10 p-3 text-sm">
              <p>Hello! I'm the AI Book Assistant. How can I help you understand this book?</p>
            </div>
          </div>
        )}
        {messages.map((message) => (
          <div
            key={message.id}
            className={clsx('flex items-start gap-3', {
              'justify-end': message.sender === 'user',
            })}
          >
            {message.sender === 'bot' && (
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/20 text-primary flex-shrink-0">
                <span className="material-symbols-outlined text-xl">smart_toy</span>
              </div>
            )}
            <div
              className={clsx('rounded-lg p-3 text-sm max-w-[80%]', {
                'rounded-tl-none bg-gray-200/50 dark:bg-white/10': message.sender === 'bot',
                'rounded-br-none bg-primary text-white': message.sender === 'user',
              })}
            >
              <p>{message.text}</p>
              {message.citations && message.citations.length > 0 && message.sender === 'bot' && (
                <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  <strong>Citations:</strong> {message.citations.join(', ')}
                </div>
              )}
            </div>
            {message.sender === 'user' && (
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-300/20 text-blue-300 flex-shrink-0">
                <span className="material-symbols-outlined text-xl">person</span>
              </div>
            )}
          </div>
        ))}
        {isLoading && (
          <div className="flex items-start gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/20 text-primary flex-shrink-0">
              <span className="material-symbols-outlined text-xl">smart_toy</span>
            </div>
            <div className="rounded-lg rounded-tl-none bg-gray-200/50 dark:bg-white/10 p-3 text-sm">
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 animate-[pulse_1s_cubic-bezier(0.4,0,0.6,1)_infinite] rounded-full bg-gray-400"></span>
                <span className="h-2 w-2 animate-[pulse_1s_cubic-bezier(0.4,0,0.6,1)_infinite_0.2s] rounded-full bg-gray-400"></span>
                <span className="h-2 w-2 animate-[pulse_1s_cubic-bezier(0.4,0,0.6,1)_infinite_0.4s] rounded-full bg-gray-400"></span>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="border-t border-gray-200/50 dark:border-white/10 p-4 flex-shrink-0">
        <div className="relative">
          <input
            className="w-full rounded-lg border-gray-200/50 dark:border-white/10 bg-white/50 dark:bg-black/20 pr-12 text-sm placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:border-primary focus:ring-primary"
            placeholder="Ask about the book..."
            type="text"
            value={inputMessage}
            onChange={handleInputChange}
            onKeyPress={handleKeyPress}
            disabled={isLoading}
          />
          <button
            className="absolute top-1/2 right-2 -translate-y-1/2 flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-white hover:bg-primary/90"
            onClick={handleSendMessage}
            disabled={isLoading}
          >
            <span className="material-symbols-outlined text-xl">send</span>
          </button>
        </div>
      </div>
    </div>
  );
}

export default ChatbotPanel;
