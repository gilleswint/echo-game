import React, { useState } from 'react';
import { Copy, Check, LogOut, Trophy, Radio, RefreshCw } from 'lucide-react';
import { useGame } from '../context/GameContext';
import { ScoreboardModal } from './ScoreboardModal';
import { useAudio } from '../hooks/useAudio';

export const Header: React.FC = () => {
  const { gameState, leaveRoom, isHost, skipCategory } = useGame();
  const { playClick } = useAudio();
  const [copied, setCopied] = useState(false);
  const [showScoreboard, setShowScoreboard] = useState(false);

  if (!gameState) return null;

  const handleCopyCode = () => {
    playClick();
    const inviteUrl = `${window.location.origin}/?code=${gameState.roomCode}`;
    navigator.clipboard.writeText(inviteUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const phaseBadges: Record<string, { label: string; color: string }> = {
    Lobby: { label: 'Lobby', color: 'bg-[#ADD8E6]/40 text-[#2B477D] border-[#2B477D]/20' },
    RoleReveal: { label: 'Role Reveal', color: 'bg-[#FFD166]/40 text-[#2B477D] border-[#FFD166]' },
    Clues: { label: 'Clue Phase', color: 'bg-[#ADD8E6]/60 text-[#2B477D] border-[#2B477D]/30' },
    Discussion: { label: 'Discussion', color: 'bg-[#FFD166]/50 text-[#2B477D] border-[#FFD166]' },
    Voting: { label: 'Voting', color: 'bg-[#F25F5C]/20 text-[#F25F5C] border-[#F25F5C]/40' },
    Reveal: { label: 'Vote Result', color: 'bg-[#2B477D]/10 text-[#2B477D] border-[#2B477D]/30' },
    GameOver: { label: 'Round Summary', color: 'bg-[#4CAF50]/20 text-[#2E7D32] border-[#4CAF50]/40' },
  };

  const currentBadge = phaseBadges[gameState.phase] || phaseBadges.Lobby;

  return (
    <>
      <header className="sticky top-0 z-40 w-full bg-white/95 backdrop-blur-md border-b-2 border-[#2B477D]/15 px-4 py-3 shadow-md">
        <div className="max-w-6xl mx-auto flex items-center justify-between gap-4">
          
          {/* Logo & Title */}
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-[#2B477D] text-white flex items-center justify-center shadow-md">
              <Radio className="w-5 h-5 animate-pulse text-[#FFD166]" />
            </div>
            <div>
              <span className="font-heading font-black text-2xl tracking-wider text-[#2B477D]">
                ECHO
              </span>
              <span className="hidden sm:inline-block ml-2.5 text-xs font-bold px-2.5 py-0.5 rounded-full bg-[#F8E9C7] text-[#2B477D] border border-[#2B477D]/20">
                R{gameState.roundNumber || 1}
              </span>
            </div>
          </div>

          {/* Room Code & Phase Badge */}
          <div className="flex items-center gap-2 sm:gap-3">
            <button
              onClick={handleCopyCode}
              className="flex items-center gap-2 px-3.5 py-1.5 rounded-2xl bg-[#F8E9C7]/80 hover:bg-[#F8E9C7] border-2 border-[#2B477D]/30 hover:border-[#2B477D] transition-all group cursor-pointer shadow-sm"
              title="Click to copy room code"
            >
              <span className="text-[11px] text-[#2B477D]/70 uppercase font-extrabold tracking-wider">Code:</span>
              <span className="font-mono font-extrabold tracking-widest text-[#2B477D] text-sm">
                {gameState.roomCode}
              </span>
              {copied ? (
                <Check className="w-4 h-4 text-[#4CAF50]" />
              ) : (
                <Copy className="w-4 h-4 text-[#2B477D]/60 group-hover:text-[#2B477D] transition-colors" />
              )}
            </button>

            <span className={`px-3.5 py-1 rounded-full text-xs font-extrabold border ${currentBadge.color}`}>
              {currentBadge.label}
            </span>
          </div>

          {/* Right Action Controls */}
          <div className="flex items-center gap-2">
            {isHost && (gameState.phase === 'RoleReveal' || gameState.phase === 'Clues' || gameState.phase === 'Discussion') && (
              <button
                onClick={() => { playClick(); skipCategory(); }}
                className="px-3 py-2 rounded-2xl bg-[#FFD166] hover:bg-[#ffc63a] border-2 border-[#2B477D] text-[#2B477D] transition-all flex items-center gap-1.5 text-xs font-black cursor-pointer shadow-sm transform hover:scale-105"
                title="Skip current category & pick a new secret word"
              >
                <RefreshCw className="w-3.5 h-3.5 text-[#2B477D]" />
                <span className="hidden md:inline">Skip Category</span>
              </button>
            )}

            <button
              onClick={() => { playClick(); setShowScoreboard(true); }}
              className="p-2.5 rounded-2xl bg-[#ADD8E6]/40 hover:bg-[#ADD8E6] border-2 border-[#2B477D]/30 text-[#2B477D] transition-all flex items-center gap-1.5 text-xs font-extrabold cursor-pointer shadow-sm"
              title="View Scoreboard"
            >
              <Trophy className="w-4 h-4 text-[#2B477D]" />
              <span className="hidden sm:inline">Scores</span>
            </button>

            <button
              onClick={() => { playClick(); leaveRoom(); }}
              className="p-2.5 rounded-2xl bg-[#F25F5C]/10 hover:bg-[#F25F5C]/25 border-2 border-[#F25F5C]/40 text-[#F25F5C] transition-all cursor-pointer shadow-sm"
              title="Leave Room"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>

        </div>
      </header>

      {showScoreboard && (
        <ScoreboardModal onClose={() => setShowScoreboard(false)} />
      )}
    </>
  );
};
