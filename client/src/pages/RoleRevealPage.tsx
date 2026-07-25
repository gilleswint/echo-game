import React from 'react';
import { useGame } from '../context/GameContext';
import { Header } from '../components/Header';
import { Card } from '../components/Card';
import { CountdownTimer } from '../components/CountdownTimer';
import { Users, CheckCircle2, RefreshCw } from 'lucide-react';
import { useAudio } from '../hooks/useAudio';

export const RoleRevealPage: React.FC = () => {
  const { gameState, privateInfo, playerReady, myPlayerId, isHost, skipCategory } = useGame();
  const { playClick } = useAudio();

  if (!gameState) return null;

  const me = gameState.players.find(p => p.id === myPlayerId);
  const readyCount = gameState.players.filter(p => p.isReady).length;

  return (
    <div className="min-h-screen flex flex-col bg-[#F8E9C7] pb-12">
      <Header />

      <main className="flex-1 max-w-2xl w-full mx-auto p-4 sm:p-6 space-y-6 flex flex-col items-center justify-center">
        
        {/* Banner */}
        <div className="text-center space-y-2 flex flex-col items-center">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#FFD166] border-2 border-[#2B477D] text-[#2B477D] text-xs font-black uppercase tracking-wider shadow-sm">
            <Users className="w-3.5 h-3.5" />
            <span>Phase 1 • Role Reveal</span>
          </div>

          <h2 className="font-heading font-black text-3xl sm:text-4xl text-[#2B477D]">
            View Your Secret Assignment
          </h2>

          <p className="text-sm font-semibold text-[#2B477D]/80 max-w-md mx-auto">
            Tap the card below to reveal your secret role and category. Keep your screen private!
          </p>

          <div className="pt-2">
            <CountdownTimer
              remainingSeconds={gameState.timerRemaining}
              totalDuration={gameState.timerDuration || 10}
              label="Auto-starts in"
            />
          </div>
        </div>

        {/* Secret Card */}
        <Card
          privateInfo={privateInfo}
          onConfirmReady={playerReady}
          isConfirmedReady={me?.isReady}
        />

        {/* Controls Bar */}
        <div className="flex flex-wrap items-center justify-center gap-3">
          {/* Players Ready Counter */}
          <div className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-white border-2 border-[#2B477D]/20 text-xs font-bold text-[#2B477D] shadow-sm">
            <CheckCircle2 className="w-4 h-4 text-[#4CAF50]" />
            <span>
              <strong className="text-[#2B477D] font-black">{readyCount}</strong> / {gameState.players.length} players ready
            </span>
          </div>

          {/* Host Skip Category Button */}
          {isHost && (
            <button
              onClick={() => { playClick(); skipCategory(); }}
              className="flex items-center gap-1.5 px-4 py-2 rounded-2xl bg-[#FFD166] hover:bg-[#ffc63a] border-2 border-[#2B477D] text-xs font-black text-[#2B477D] shadow-sm cursor-pointer transform hover:scale-105 transition-all"
            >
              <RefreshCw className="w-4 h-4 text-[#2B477D]" />
              <span>Host: Skip & Reshuffle Category</span>
            </button>
          )}
        </div>

      </main>
    </div>
  );
};
