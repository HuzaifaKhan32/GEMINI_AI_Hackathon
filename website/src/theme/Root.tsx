import React, { useState, useRef, useEffect } from 'react';
import type { ReactNode } from 'react';
import FloatingChatbotButton from '@site/src/components/Chatbot/FloatingChatbotButton';
import ChatbotPanel from '@site/src/components/Chatbot/ChatbotPanel';
import useTextSelection from '@site/src/hooks/useTextSelection';
import clsx from 'clsx';

type Props = {
  children: ReactNode;
};

function Root({ children }: Props): JSX.Element {
  const contentRef = useRef<HTMLDivElement>(null);
  const selection = useTextSelection(contentRef);
  const [isChatbotOpen, setIsChatbotOpen] = useState(false);
  const [initialChatbotMessage, setInitialChatbotMessage] = useState<string>('');

  const toggleChatbot = () => {
    setIsChatbotOpen(prev => !prev);
    // Clear initial message if closing
    if (isChatbotOpen) {
      setInitialChatbotMessage('');
    }
  };

  const handleAskWithSelectedText = () => {
    if (selection) {
      setInitialChatbotMessage(`Can you tell me more about: "${selection.text}"`);
      setIsChatbotOpen(true);
      // Optionally clear selection visual
      window.getSelection()?.removeAllRanges();
    }
  };

  return (
    <div ref={contentRef}>
      {children}
      <FloatingChatbotButton onClick={toggleChatbot} />
      <ChatbotPanel
        isOpen={isChatbotOpen}
        onClose={toggleChatbot}
        initialMessage={initialChatbotMessage}
        onAskWithSelectedText={handleAskWithSelectedText} // Pass this to the panel for potential internal use
      />

      {selection && selection.rect && (
        <button
          id="selection-ask-button"
          onClick={handleAskWithSelectedText}
          className={clsx(
            "fixed bg-blue-500 text-white text-xs px-2 py-1 rounded shadow-lg transition-all duration-200 z-[9999]",
            "hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
          )}
          style={{
            top: selection.rect.top + window.scrollY - 30, // Position above selection
            left: selection.rect.left + window.scrollX + (selection.rect.width / 2) - 50, // Center horizontally
            opacity: selection ? 1 : 0,
            pointerEvents: selection ? 'auto' : 'none',
          }}
        >
          Ask Chatbot
        </button>
      )}
    </div>
  );
}

export default Root;
