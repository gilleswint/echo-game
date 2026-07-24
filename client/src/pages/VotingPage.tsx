import React, { useState } from 'react';
import { Vote, CheckCircle2 } from 'lucide-react';
import { useGame } from '../context/GameContext';
import { Header } from '../components/Header';
import { CountdownTimer } from '../components/CountdownTimer';
import { useAudio } from '../hooks/useAudio';

export const VotingPage: React.FC = () => {
  const { gameState, submitVote, myPlayerId } = useGame();
  const { playVote, playClick } = useAudio();
  const [selectedTargetId, setSelectedTargetId] = useState<string | null>(null);

  if (!gameState) return null;

  const me = gameState.players.find(p => p.id === myPlayerId);
  const hasVoted = me?.hasVoted || false;
  const totalVotesCount = gameState.players.filter(p => p.hasVoted).length;

  const handleConfirmVote = () => {
    if (!selectedTargetId || hasVoted) return;
    playVote();
    submitVote(selectedTargetId);
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#F8E9C7] pb-12">
      <Header />

      <main className="flex-1 max-w-4xl w-full mx-auto p-4 sm:p-6 space-y-6">
        
        {/* Banner Header */}
        <div className="bg-white rounded-3xl p-6 border-3 border-[#2B477D] shadow-xl flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-4 text-center sm:text-left">
            <div className="w-14 h-14 rounded-2xl bg-[#F25F5C]/15 border-2 border-[#F25F5C] flex items-center justify-center text-[#F25F5C] shrink-0">
              <Vote className="w-7 h-7" />
            </div>

            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-[#F25F5C]/20 text-[#F25F5C] text-xs font-black uppercase tracking-wider mb-1 border border-[#F25F5C]/30">
                <span>Phase 4 • Voting</span>
              </div>
              <h2 className="font-heading font-black text-2xl sm:text-3xl text-[#2B477D]">
                Cast Your Secret Ballot
              </h2>
              <p className="text-xs font-semibold text-[#2B477D]/70">
                Select the player you suspect is the Imposter. You cannot vote for yourself!
              </p>
            </div>
          </div>

          <CountdownTimer
            remainingSeconds={gameState.timerRemaining}
            totalDuration={gameState.timerDuration || 45}
            label="Voting Timer"
          />
        </div>

        {/* Voting Target Selection Grid */}
        <div className="bg-white rounded-3xl p-6 border-2 border-[#2B477D]/20 shadow-lg space-y-6">
          
          <div className="flex items-center justify-between">
            <h3 className="font-heading font-black text-lg text-[#2B477D]">
              Select Suspect
            </h3>
            <span className="text-xs font-extrabold px-3 py-1 rounded-full bg-[#ADD8E6]/50 text-[#2B477D] border border-[#2B477D]/20">
              {totalVotesCount} / {gameState.players.length} Votes Cast
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {gameState.players.map((player) => {
              const isSelf = player.id === myPlayerId;
              const isSelected = selectedTargetId === player.id;

              return (
                <button
                  key={player.id}
                  type="button"
                  disabled={isSelf || hasVoted}
                  onClick={() => {
                    playClick();
                    setSelectedTargetId(player.id);
                  }}
                  className={`p-4 rounded-2xl border-2 text-left transition-all duration-200 flex items-center justify-between ${
                    isSelf
                      ? 'bg-gray-100 border-gray-200 opacity-50 cursor-not-allowed'
                      : isSelected
                      ? 'bg-[#F25F5C]/15 border-[#F25F5C] shadow-md scale-[1.02] cursor-pointer'
                      : 'bg-[#F8E9C7]/20 border-[#2B477D]/20 hover:border-[#2B477D]/50 cursor-pointer hover:scale-[1.01]'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-11 h-11 rounded-2xl ${player.avatarColor} flex items-center justify-center text-xl shadow shrink-0 border border-[#2B477D]/20`}>
                      {player.avatarIcon}
                    </div>

                    <div>
                      <div className="font-black text-[#2B477D] text-base">
                        {player.name}
                      </div>
                      {isSelf && (
                        <span className="text-[10px] font-black text-gray-400 uppercase">
                          Cannot Vote Self
                        </span>
                      )}
                    </div>
                  </div>

                  {isSelected && (
                    <div className="w-6 h-6 rounded-full bg-[#F25F5C] text-white flex items-center justify-center font-black text-xs shadow">
                      ✓
                    </div>
                  )}
                </button>
              );
            })}
          </div>

          {/* Action Submit Button */}
          {!hasVoted ? (
            <button
              onClick={handleConfirmVote}
              disabled={!selectedTargetId}
              className={`w-full py-4 px-6 rounded-2xl font-heading font-black text-base transition-all duration-300 shadow-xl flex items-center justify-center gap-2 border-2 ${
                selectedTargetId
                  ? 'bg-[#F25F5C] hover:bg-[#E04B48] text-white border-[#F25F5C] transform hover:scale-[1.02] cursor-pointer'
                  : 'bg-gray-200 text-gray-400 border-gray-300 cursor-not-allowed'
              }`}
            >
              <Vote className="w-5 h-5" />
              <span>Confirm Secret Vote</span>
            </button>
          ) : (
            <div className="p-4 rounded-2xl bg-[#4CAF50]/15 border-2 border-[#4CAF50] text-[#2E7D32] text-sm font-black flex items-center justify-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-[#4CAF50]" />
              <span>Your vote has been submitted! Waiting for remaining votes...</span>
            </div>
          )}

        </div>

      </main>
    </div>
  );
};
