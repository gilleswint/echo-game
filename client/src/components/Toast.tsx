import React, { useEffect } from 'react';
import { AlertCircle, CheckCircle2, Info, X } from 'lucide-react';
import { useGame } from '../context/GameContext';

export const Toast: React.FC = () => {
  const { toastMessage, clearToast } = useGame();

  useEffect(() => {
    if (!toastMessage) return;
    const timer = setTimeout(() => {
      clearToast();
    }, 4000);
    return () => clearTimeout(timer);
  }, [toastMessage, clearToast]);

  if (!toastMessage) return null;

  const bgStyles = {
    error: 'bg-[#F25F5C] text-white border-2 border-[#E04B48]',
    success: 'bg-[#4CAF50] text-white border-2 border-[#388E3C]',
    info: 'bg-[#2B477D] text-white border-2 border-[#1D3159]'
  }[toastMessage.type || 'info'];

  const getIcon = () => {
    switch (toastMessage.type) {
      case 'error': return <AlertCircle className="w-5 h-5 shrink-0" />;
      case 'success': return <CheckCircle2 className="w-5 h-5 shrink-0" />;
      default: return <Info className="w-5 h-5 shrink-0" />;
    }
  };

  return (
    <div className="fixed top-5 right-5 z-50 animate-bounce-short max-w-md w-full px-4">
      <div className={`flex items-center gap-3 p-4 rounded-2xl shadow-2xl ${bgStyles}`}>
        {getIcon()}
        <span className="text-sm font-black flex-1">{toastMessage.text}</span>
        <button onClick={clearToast} className="p-1 hover:opacity-80 rounded cursor-pointer">
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
