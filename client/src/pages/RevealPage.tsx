import React from 'react';
import { Vote, AlertTriangle, ShieldCheck } from 'lucide-react';
import { useGame } from '../context/GameContext';
import { Header } from '../components/Header';
import { WordGuessModal } from '../components/WordGuessModal';

export const RevealPage: React.FC = () => {
  const { gameState } = useGame();

  if (!gameState) return null;

  const eliminatedPlayer = gameState.players.find(p => p.id === gameState.eliminatedPlayerId);
  const isImposterCaught = gameState.eliminatedPlayerId === gameState.imposterId;

  // Calculate vote count per player
  const voteCounts: Record<string, number> = {};
  Object.values(gameState.votes).forEach(targetId => {
    voteCounts[targetId] = (voteCounts[targetId] || 0) + 1;
  });

  return (
    <div className="min-h-screen flex flex-col bg-[#F8E9C7] pb-12">
      <Header />

      <main className="flex-1 max-w-4xl w-full mx-auto p-4 sm:p-6 space-y-6">
        
        {/* Voting Result Banner */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border-3 border-[#2B477D] shadow-xl text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#ADD8E6]/50 text-[#2B477D] border border-[#2B477D]/20 text-xs font-black uppercase tracking-wider">
            <Vote className="w-4 h-4" />
            <span>Phase 5 • Vote Tally Result</span>
          </div>

          {eliminatedPlayer ? (
            <div className="space-y-2">
              <h2 className="font-heading font-black text-3xl sm:text-4xl text-[#2B477D]">
                <span className="text-[#F25F5C] font-black">{eliminatedPlayer.name}</span> Was Majority Voted Out!
              </h2>

              <div className="pt-2 flex justify-center">
                {isImposterCaught ? (
                  <span className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-[#4CAF50]/15 border-2 border-[#4CAF50] text-[#2E7D32] font-black text-sm">
                    <ShieldCheck className="w-5 h-5 text-[#4CAF50]" />
                    <span>THE IMPOSTER WAS FOUND!</span>
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-[#F25F5C]/15 border-2 border-[#F25F5C] text-[#F25F5C] font-black text-sm">
                    <AlertTriangle className="w-5 h-5 text-[#F25F5C]" />
                    <span>AN INNOCENT PLAYER WAS ELIMINATED!</span>
                  </span>
                )}
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              <h2 className="font-heading font-black text-3xl text-[#2B477D]">
                It Was a Tie Vote!
              </h2>
              <p className="text-sm text-[#2B477D]/80 font-semibold">
                No single player received a majority vote. The Imposter escapes elimination!
              </p>
            </div>
          )}
        </div>

        {/* Voting Breakdown Table / Cards */}
        <div className="bg-white rounded-3xl p-6 border-2 border-[#2B477D]/20 shadow-lg space-y-4">
          <h3 className="font-heading font-black text-lg text-[#2B477D]">
            Ballot Breakdown
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {gameState.players.map((player) => {
              const count = voteCounts[player.id] || 0;
              const isEliminated = player.id === gameState.eliminatedPlayerId;

              return (
                <div
                  key={player.id}
                  className={`p-4 rounded-2xl border-2 flex items-center justify-between transition-all ${
                    isEliminated
                      ? 'bg-[#F25F5C]/15 border-[#F25F5C] shadow-md'
                      : 'bg-[#F8E9C7]/20 border-[#2B477D]/20'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-xl ${player.avatarColor} flex items-center justify-center text-xl shadow shrink-0 border border-[#2B477D]/20`}>
                      {player.avatarIcon}
                    </div>

                    <div>
                      <div className="font-black text-[#2B477D] text-sm">
                        {player.name}
                      </div>
                      {isEliminated && (
                        <span className="text-[10px] font-black text-[#F25F5C] uppercase">
                          Eliminated
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="font-heading font-black text-xl text-[#2B477D]">
                      {count}
                    </span>
                    <span className="text-[10px] text-[#2B477D]/70 uppercase font-black ml-1">
                      {count === 1 ? 'vote' : 'votes'}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Render Imposter Guess Modal if Imposter was caught */}
        {isImposterCaught && <WordGuessModal />}

      </main>
    </div>
  );
};
