import React, { useState } from 'react';
import { HelpCircle, Send, Sparkles } from 'lucide-react';
import { useGame } from '../context/GameContext';
import { CountdownTimer } from './CountdownTimer';
import { useAudio } from '../hooks/useAudio';

export const WordGuessModal: React.FC = () => {
  const { gameState, privateInfo, guessWord, myPlayerId, categories } = useGame();
  const { playClick } = useAudio();
  const [typedGuess, setTypedGuess] = useState('');

  if (!gameState || !privateInfo) return null;

  const isImposter = gameState.imposterId === myPlayerId;
  const imposterPlayer = gameState.players.find(p => p.id === gameState.imposterId);

  // Find active category word options
  const activeCategory = categories.find(c => c.category === gameState.category);
  const wordOptions = activeCategory ? activeCategory.words : [];

  const handleSelectWord = (word: string) => {
    playClick();
    guessWord(word);
  };

  const handleSubmitCustom = (e: React.FormEvent) => {
    e.preventDefault();
    if (typedGuess.trim()) {
      playClick();
      guessWord(typedGuess.trim());
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#2B477D]/60 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-xl bg-white rounded-3xl p-6 sm:p-8 border-3 border-[#F25F5C] shadow-2xl space-y-6 text-center">
        
        {/* Header */}
        <div className="flex flex-col items-center gap-2">
          <div className="w-16 h-16 rounded-2xl bg-[#F25F5C]/15 border-2 border-[#F25F5C] flex items-center justify-center text-[#F25F5C]">
            <HelpCircle className="w-9 h-9 animate-bounce" />
          </div>

          <h2 className="font-heading font-black text-2xl sm:text-3xl text-[#2B477D]">
            {isImposter ? 'YOU WERE CAUGHT!' : 'IMPOSTER CAUGHT!'}
          </h2>

          <p className="text-sm font-semibold text-[#2B477D]/80 max-w-md">
            {isImposter
              ? 'The players voted you out! But you have ONE last chance to steal the victory by guessing the Secret Word.'
              : `${imposterPlayer?.name || 'The Imposter'} was voted out! They are now attempting to guess the Secret Word...`}
          </p>
        </div>

        {/* Timer */}
        <CountdownTimer
          remainingSeconds={gameState.timerRemaining}
          totalDuration={gameState.timerDuration || 30}
          label="Imposter Decision Timer"
        />

        {/* Imposter Interactive Guess Controls */}
        {isImposter ? (
          <div className="space-y-4 pt-2">
            <div className="text-xs font-black uppercase tracking-wider text-[#2B477D] flex items-center justify-center gap-1">
              <Sparkles className="w-4 h-4 text-[#2B477D]" />
              <span>Select Category Word or Type Guess</span>
            </div>

            {/* Word Chips */}
            {wordOptions.length > 0 && (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 max-h-48 overflow-y-auto p-1">
                {wordOptions.map((w) => (
                  <button
                    key={w}
                    type="button"
                    onClick={() => handleSelectWord(w)}
                    className="p-3 rounded-xl bg-[#F8E9C7]/40 border-2 border-[#2B477D]/20 hover:border-[#F25F5C] hover:bg-[#F25F5C]/10 font-extrabold text-sm text-[#2B477D] transition-all cursor-pointer transform hover:scale-105 shadow-sm"
                  >
                    {w}
                  </button>
                ))}
              </div>
            )}

            {/* Manual input fallback */}
            <form onSubmit={handleSubmitCustom} className="flex gap-2">
              <input
                type="text"
                value={typedGuess}
                onChange={(e) => setTypedGuess(e.target.value)}
                placeholder="Or type secret word..."
                className="flex-1 px-4 py-3 rounded-xl bg-[#F8E9C7]/40 border-2 border-[#2B477D]/30 text-[#2B477D] placeholder-[#2B477D]/50 font-black text-sm focus:outline-none focus:border-[#F25F5C]"
              />
              <button
                type="submit"
                className="px-5 py-3 rounded-xl bg-[#F25F5C] hover:bg-[#E04B48] font-black text-white shadow-lg flex items-center gap-1 cursor-pointer border-2 border-[#F25F5C]"
              >
                <span>Submit</span>
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>
        ) : (
          <div className="p-6 rounded-2xl bg-[#F8E9C7]/40 border-2 border-[#2B477D]/20 text-[#2B477D] text-sm font-semibold animate-pulse">
            Waiting for <span className="text-[#F25F5C] font-black">{imposterPlayer?.name}</span> to submit their final word guess...
          </div>
        )}

      </div>
    </div>
  );
};
