import React from 'react';
import { Trophy, X, Crown, Award } from 'lucide-react';
import { useGame } from '../context/GameContext';

interface ScoreboardModalProps {
  onClose: () => void;
}

export const ScoreboardModal: React.FC<ScoreboardModalProps> = ({ onClose }) => {
  const { gameState } = useGame();

  if (!gameState) return null;

  const sortedPlayers = [...gameState.players].sort((a, b) => b.score - a.score);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#2B477D]/60 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-lg bg-white rounded-3xl p-6 shadow-2xl border-3 border-[#2B477D]">
        
        <div className="flex items-center justify-between pb-4 border-b-2 border-[#2B477D]/15">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-[#FFD166] text-[#2B477D] border border-[#2B477D]/30 shadow-sm">
              <Trophy className="w-6 h-6 fill-current" />
            </div>
            <div>
              <h3 className="font-heading font-black text-xl text-[#2B477D]">
                Scoreboard
              </h3>
              <p className="text-xs font-bold text-[#2B477D]/70">
                Round {gameState.roundNumber || 1} • Room {gameState.roomCode}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-[#F8E9C7] hover:bg-[#FFD166] text-[#2B477D] transition-all border border-[#2B477D]/20 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="mt-4 space-y-2.5 max-h-[60vh] overflow-y-auto pr-1">
          {sortedPlayers.map((player, idx) => {
            const isTop = idx === 0 && player.score > 0;

            return (
              <div
                key={player.id}
                className={`flex items-center justify-between p-3.5 rounded-2xl border-2 transition-all ${
                  isTop
                    ? 'bg-[#FFD166]/40 border-[#FFD166] shadow-md'
                    : 'bg-[#F8E9C7]/30 border-[#2B477D]/20'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="font-mono text-xs font-black text-[#2B477D]/60 w-5 text-center">
                    #{idx + 1}
                  </span>

                  <div className={`w-10 h-10 rounded-xl ${player.avatarColor} flex items-center justify-center text-xl shadow border border-[#2B477D]/20`}>
                    {player.avatarIcon}
                  </div>

                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-black text-[#2B477D] text-sm">
                        {player.name}
                      </span>
                      {player.isHost && (
                        <span title="Host">
                          <Crown className="w-3.5 h-3.5 text-[#FFD166] fill-[#FFD166]" />
                        </span>
                      )}
                    </div>

                    <span className="text-xs font-bold text-[#2B477D]/60">
                      {player.isConnected ? 'Connected' : 'Offline'}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <div className="text-right">
                    <span className="font-heading font-black text-lg text-[#2B477D]">
                      {player.score}
                    </span>
                    <span className="text-[10px] text-[#2B477D]/70 ml-1 uppercase font-black">
                      pts
                    </span>
                  </div>
                  {isTop && <Award className="w-5 h-5 text-[#FFD166] fill-[#FFD166]" />}
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-6 pt-4 border-t-2 border-[#2B477D]/10 text-center text-xs font-extrabold text-[#2B477D]/70">
          +1 point awarded per round victory. Scores reset when room closes.
        </div>

      </div>
    </div>
  );
};
