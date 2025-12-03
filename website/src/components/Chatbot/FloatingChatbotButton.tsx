import React from 'react';

interface FloatingChatbotButtonProps {
  onClick: () => void;
}

function FloatingChatbotButton({ onClick }: FloatingChatbotButtonProps): JSX.Element {
  return (
    <button
      className="fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-teal-500 text-white shadow-lg transition-transform hover:scale-110 focus:outline-none focus:ring-4 focus:ring-primary/50"
      aria-label="Open chatbot"
      onClick={onClick}
    >
      <span className="material-symbols-outlined text-3xl">smart_toy</span>
    </button>
  );
}

export default FloatingChatbotButton;
