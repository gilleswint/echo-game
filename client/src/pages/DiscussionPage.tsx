import React from 'react';
import { MessageCircle, Vote, Sparkles } from 'lucide-react';
import { useGame } from '../context/GameContext';
import { Header } from '../components/Header';
import { CountdownTimer } from '../components/CountdownTimer';
import { ClueHistory } from '../components/ClueHistory';

export const DiscussionPage: React.FC = () => {
  const { gameState } = useGame();

  if (!gameState) return null;

  return (
    <div className="min-h-screen flex flex-col bg-[#F8E9C7] pb-12">
      <Header />

      <main className="flex-1 max-w-4xl w-full mx-auto p-4 sm:p-6 space-y-6">
        
        {/* Banner */}
        <div className="bg-white rounded-3xl p-6 border-3 border-[#2B477D] shadow-xl flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-4 text-center sm:text-left">
            <div className="w-14 h-14 rounded-2xl bg-[#FFD166]/50 border-2 border-[#2B477D] flex items-center justify-center text-[#2B477D] shrink-0">
              <MessageCircle className="w-7 h-7" />
            </div>

            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-[#FFD166] text-[#2B477D] text-xs font-black uppercase tracking-wider mb-1 border border-[#2B477D]/20">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Phase 3 • Open Discussion</span>
              </div>
              <h2 className="font-heading font-black text-2xl sm:text-3xl text-[#2B477D]">
                Analyze Clues & Debate!
              </h2>
              <p className="text-xs font-semibold text-[#2B477D]/70">
                Discuss out loud with your group. Who gave a suspicious or disconnected clue?
              </p>
            </div>
          </div>

          <CountdownTimer
            remainingSeconds={gameState.timerRemaining}
            totalDuration={gameState.timerDuration || 60}
            label="Discussion Period"
          />
        </div>

        {/* Voting Teaser Box */}
        <div className="p-4 rounded-2xl bg-white border-2 border-[#2B477D]/20 text-center text-xs font-black text-[#2B477D] flex items-center justify-center gap-2 shadow-sm">
          <Vote className="w-4 h-4 text-[#2B477D]" />
          <span>Voting phase will begin automatically when timer reaches zero!</span>
        </div>

        {/* Clue History Reference */}
        <ClueHistory clues={gameState.clues} />

      </main>
    </div>
  );
};
