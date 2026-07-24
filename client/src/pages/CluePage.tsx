import React, { useState } from 'react';
import { Send, Sparkles, User, Grid, ChevronDown, ChevronUp, Star } from 'lucide-react';
import { useGame } from '../context/GameContext';
import { Header } from '../components/Header';
import { CountdownTimer } from '../components/CountdownTimer';
import { ClueHistory } from '../components/ClueHistory';
import { useAudio } from '../hooks/useAudio';

export const CluePage: React.FC = () => {
  const { gameState, submitClue, myPlayerId, privateInfo } = useGame();
  const { playClick } = useAudio();
  const [clueText, setClueText] = useState('');
  const [showGrid, setShowGrid] = useState(false);

  if (!gameState) return null;

  const currentTurnPlayer = gameState.players.find(p => p.id === gameState.currentTurnPlayerId);
  const isMyTurn = gameState.currentTurnPlayerId === myPlayerId;
  const isImposter = privateInfo?.role === 'Imposter';
  const categoryWords = privateInfo?.categoryWords || [];
  const secretWord = privateInfo?.secretWord;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!clueText.trim()) return;
    playClick();
    submitClue(clueText.trim());
    setClueText('');
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#F8E9C7] pb-12">
      <Header />

      <main className="flex-1 max-w-4xl w-full mx-auto p-4 sm:p-6 space-y-6">
        
        {/* Category & Role Info Bar with Word Grid Toggle */}
        <div className="bg-white rounded-2xl p-4 border-2 border-[#2B477D]/20 flex flex-wrap items-center justify-between gap-4 shadow-md">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-[#2B477D]" />
            <div>
              <span className="text-[10px] font-black text-[#2B477D]/60 uppercase tracking-widest block">
                Category
              </span>
              <span className="font-heading font-black text-lg text-[#2B477D]">
                {gameState.category || '???'}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => { playClick(); setShowGrid(!showGrid); }}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-[#ADD8E6]/40 hover:bg-[#ADD8E6] border-2 border-[#2B477D]/30 text-xs font-black text-[#2B477D] transition-colors cursor-pointer"
            >
              <Grid className="w-4 h-4 text-[#2B477D]" />
              <span>{showGrid ? 'Hide Word Grid' : 'View Category Grid'}</span>
              {showGrid ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>

            <div className="px-4 py-2 rounded-xl bg-[#F8E9C7] border-2 border-[#2B477D]/20 text-xs font-black text-[#2B477D]">
              Role: <span className={isImposter ? 'text-[#F25F5C] font-black' : 'text-[#4CAF50] font-black'}>
                {isImposter ? 'IMPOSTER' : `PLAYER (${secretWord})`}
              </span>
            </div>
          </div>
        </div>

        {/* Expandable Category Word Grid Drawer */}
        {showGrid && (
          <div className="bg-white rounded-3xl p-5 border-3 border-[#2B477D] shadow-xl space-y-3 animate-fade-in">
            <div className="flex items-center justify-between px-1">
              <span className="text-xs font-black uppercase tracking-wider text-[#2B477D]">
                {gameState.category} Word Bank Grid
              </span>
              <span className="text-[11px] text-[#2B477D]/70 font-bold">
                {isImposter ? 'Imposter View: Secret word is hidden' : `Secret Word: ${secretWord}`}
              </span>
            </div>

            <div className="grid grid-cols-4 gap-2 w-full">
              {categoryWords.map((word) => {
                const isSecret = !isImposter && secretWord && word.toLowerCase() === secretWord.toLowerCase();

                return (
                  <div
                    key={word}
                    className={`aspect-square p-1.5 sm:p-2 rounded-2xl border-2 flex flex-col items-center justify-center text-center relative transition-all shadow-sm overflow-hidden ${
                      isSecret
                        ? 'bg-[#4CAF50] border-[#2E7D32] text-white shadow-md scale-105 ring-2 ring-[#4CAF50]/60 z-10'
                        : 'bg-[#F8E9C7]/30 border-[#2B477D]/20 text-[#2B477D] hover:border-[#2B477D]/50'
                    }`}
                  >
                    {isSecret && (
                      <div className="absolute top-1 right-1 bg-[#FFD166] text-[#2B477D] p-0.5 rounded-full shadow z-20">
                        <Star className="w-2.5 h-2.5 fill-current" />
                      </div>
                    )}
                    <span className="w-full text-[10px] sm:text-xs font-heading font-black uppercase leading-[1.15] tracking-tight break-words text-balance">
                      {word}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Turn Indicator & Timer */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
          
          <div className="md:col-span-2 bg-white rounded-3xl p-6 border-3 border-[#2B477D] shadow-xl space-y-4">
            <div className="flex items-center gap-3">
              <div className={`w-12 h-12 rounded-2xl ${currentTurnPlayer?.avatarColor || 'bg-[#2B477D]'} flex items-center justify-center text-2xl shrink-0 shadow-md border border-[#2B477D]/20`}>
                {currentTurnPlayer?.avatarIcon || '👤'}
              </div>

              <div>
                <span className="text-xs font-black text-[#2B477D] uppercase tracking-wider block">
                  {isMyTurn ? '🌟 IT IS YOUR TURN!' : 'CURRENT TURN'}
                </span>
                <h2 className="font-heading font-black text-2xl text-[#2B477D]">
                  {isMyTurn ? 'Give Exactly 1 Clue' : `${currentTurnPlayer?.name || 'Player'}'s Turn`}
                </h2>
              </div>
            </div>

            {/* Input Form if My Turn */}
            {isMyTurn ? (
              <form onSubmit={handleSubmit} className="space-y-3 pt-2">
                <div className="relative">
                  <input
                    type="text"
                    required
                    maxLength={30}
                    value={clueText}
                    onChange={(e) => setClueText(e.target.value)}
                    placeholder="Type a 1-word or short clue..."
                    className="w-full px-4 py-3.5 pr-24 rounded-2xl bg-[#F8E9C7]/40 border-3 border-[#2B477D] text-[#2B477D] placeholder-[#2B477D]/50 font-black text-base focus:outline-none focus:ring-4 focus:ring-[#2B477D]/20 shadow-inner"
                  />
                  <button
                    type="submit"
                    className="absolute right-2 top-2 bottom-2 px-5 rounded-xl bg-[#2B477D] hover:bg-[#1D3159] text-white font-heading font-black text-sm flex items-center gap-1 shadow cursor-pointer border border-[#2B477D]"
                  >
                    <span>Send</span>
                    <Send className="w-4 h-4" />
                  </button>
                </div>
                <p className="text-[11px] text-[#2B477D]/70 font-semibold">
                  {isImposter
                    ? 'Tip: Look at the Word Bank Grid and give a clue that could match one of those words!'
                    : 'Tip: Give a clue that relates to the secret word without making it too obvious.'}
                </p>
              </form>
            ) : (
              <div className="p-4 rounded-2xl bg-[#F8E9C7]/40 border-2 border-[#2B477D]/20 text-[#2B477D] text-sm flex items-center gap-2 animate-pulse font-semibold">
                <User className="w-4 h-4 text-[#2B477D]" />
                <span>Waiting for <strong className="text-[#2B477D] font-black">{currentTurnPlayer?.name}</strong> to submit their clue...</span>
              </div>
            )}
          </div>

          {/* Turn Countdown */}
          <div className="flex justify-center">
            <CountdownTimer
              remainingSeconds={gameState.timerRemaining}
              totalDuration={gameState.timerDuration || 30}
              label="Turn Timer"
            />
          </div>

        </div>

        {/* Live Clues Feed */}
        <ClueHistory clues={gameState.clues} />

      </main>
    </div>
  );
};
