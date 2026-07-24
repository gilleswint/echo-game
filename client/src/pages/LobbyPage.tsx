import React from 'react';
import { Users, Play, Crown, Trash2, Sparkles, AlertTriangle } from 'lucide-react';
import { useGame } from '../context/GameContext';
import { Header } from '../components/Header';
import { useAudio } from '../hooks/useAudio';

export const LobbyPage: React.FC = () => {
  const { gameState, isHost, startGame, selectCategory, categories, kickPlayer, myPlayerId } = useGame();
  const { playClick } = useAudio();

  if (!gameState) return null;

  const playerCount = gameState.players.length;
  const canStart = playerCount >= 3;

  return (
    <div className="min-h-screen flex flex-col bg-[#F8E9C7] pb-12">
      <Header />

      <main className="flex-1 max-w-5xl w-full mx-auto p-4 sm:p-6 space-y-6">
        
        {/* Banner */}
        <div className="bg-white rounded-3xl p-6 border-3 border-[#2B477D] flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xl">
          <div className="flex items-center gap-3 text-center sm:text-left">
            <div className="w-12 h-12 rounded-2xl bg-[#ADD8E6]/50 border-2 border-[#2B477D] flex items-center justify-center text-[#2B477D]">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <h2 className="font-heading font-black text-2xl text-[#2B477D]">
                Party Lobby
              </h2>
              <p className="text-xs text-[#2B477D]/70 font-semibold">
                {playerCount} / 12 Players joined • Minimum 3 players required to start
              </p>
            </div>
          </div>

          {/* Host Start Button */}
          {isHost ? (
            <button
              onClick={() => { playClick(); startGame(); }}
              disabled={!canStart}
              className={`w-full sm:w-auto px-8 py-3.5 rounded-2xl font-heading font-black text-base transition-all duration-300 shadow-xl flex items-center justify-center gap-2 ${
                canStart
                  ? 'bg-[#4CAF50] hover:bg-[#43A047] text-white border-2 border-[#2E7D32] transform hover:scale-[1.03] cursor-pointer'
                  : 'bg-gray-200 text-gray-400 border-2 border-gray-300 cursor-not-allowed'
              }`}
            >
              <Play className="w-5 h-5 fill-current" />
              <span>Start Round</span>
            </button>
          ) : (
            <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#FFD166]/40 border-2 border-[#FFD166] text-xs font-black text-[#2B477D]">
              <Sparkles className="w-4 h-4 text-[#2B477D] animate-spin-slow" />
              <span>Waiting for Host to start game...</span>
            </div>
          )}
        </div>

        {/* Category Picker Section */}
        <div className="bg-white rounded-3xl p-6 border-2 border-[#2B477D]/20 shadow-lg space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-[#2B477D]" />
              <h3 className="font-heading font-black text-lg text-[#2B477D]">
                Word Category
              </h3>
            </div>
            <span className="text-xs font-bold text-[#2B477D]/70">
              {isHost ? 'Select a category or leave random' : 'Chosen by Host'}
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {/* Random option */}
            <button
              type="button"
              disabled={!isHost}
              onClick={() => { playClick(); selectCategory(''); }}
              className={`p-3.5 rounded-2xl border-2 text-left transition-all ${
                !gameState.selectedCategoryId
                  ? 'bg-[#FFD166]/60 border-[#2B477D] shadow-md text-[#2B477D]'
                  : 'bg-[#F8E9C7]/30 border-[#2B477D]/20 text-[#2B477D]/70 hover:border-[#2B477D]/40'
              } ${isHost ? 'cursor-pointer hover:scale-[1.02]' : 'cursor-default'}`}
            >
              <div className="text-xl mb-1">🎲</div>
              <div className="font-extrabold text-sm text-[#2B477D]">Random Category</div>
              <div className="text-[11px] font-medium text-[#2B477D]/70">Surprise each round</div>
            </button>

            {categories.map((cat) => {
              const isSelected = gameState.selectedCategoryId === cat.id;

              return (
                <button
                  key={cat.id}
                  type="button"
                  disabled={!isHost}
                  onClick={() => { playClick(); selectCategory(cat.id); }}
                  className={`p-3.5 rounded-2xl border-2 text-left transition-all ${
                    isSelected
                      ? 'bg-[#ADD8E6]/60 border-[#2B477D] shadow-md text-[#2B477D]'
                      : 'bg-[#F8E9C7]/30 border-[#2B477D]/20 text-[#2B477D]/70 hover:border-[#2B477D]/40'
                  } ${isHost ? 'cursor-pointer hover:scale-[1.02]' : 'cursor-default'}`}
                >
                  <div className="text-xl mb-1">{cat.icon}</div>
                  <div className="font-extrabold text-sm text-[#2B477D] truncate">{cat.category}</div>
                  <div className="text-[11px] font-medium text-[#2B477D]/70">{cat.words.length} words</div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Players Grid */}
        <div className="bg-white rounded-3xl p-6 border-2 border-[#2B477D]/20 shadow-lg space-y-4">
          <h3 className="font-heading font-black text-lg text-[#2B477D] flex items-center gap-2">
            <span>Joined Players</span>
            <span className="text-xs font-extrabold px-2.5 py-0.5 rounded-full bg-[#ADD8E6]/50 text-[#2B477D] border border-[#2B477D]/20">
              {playerCount}
            </span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {gameState.players.map((player) => {
              const isMe = player.id === myPlayerId;

              return (
                <div
                  key={player.id}
                  className={`flex items-center justify-between p-4 rounded-2xl border-2 transition-all ${
                    isMe
                      ? 'bg-[#ADD8E6]/25 border-[#2B477D] shadow-md'
                      : 'bg-[#F8E9C7]/20 border-[#2B477D]/20'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-12 h-12 rounded-2xl ${player.avatarColor} flex items-center justify-center text-2xl shadow shrink-0 border border-[#2B477D]/20`}>
                      {player.avatarIcon}
                    </div>

                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="font-extrabold text-[#2B477D] text-base">
                          {player.name}
                        </span>
                        {isMe && (
                          <span className="text-[10px] font-black px-1.5 py-0.5 rounded bg-[#FFD166] text-[#2B477D] border border-[#2B477D]/30">
                            YOU
                          </span>
                        )}
                        {player.isHost && (
                          <span title="Host">
                            <Crown className="w-4 h-4 text-[#FFD166] fill-[#FFD166]" />
                          </span>
                        )}
                      </div>

                      <span className="text-xs text-[#2B477D]/70 font-semibold">
                        Score: <strong className="text-[#2B477D]">{player.score}</strong> pts
                      </span>
                    </div>
                  </div>

                  {/* Host action: Kick */}
                  {isHost && !player.isHost && (
                    <button
                      onClick={() => { playClick(); kickPlayer(player.id); }}
                      className="p-2 rounded-xl bg-[#F25F5C]/10 hover:bg-[#F25F5C] text-[#F25F5C] hover:text-white transition-colors border border-[#F25F5C]/30 cursor-pointer"
                      title="Kick Player"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              );
            })}
          </div>

          {!canStart && (
            <div className="p-4 rounded-2xl bg-[#FFD166]/30 border-2 border-[#FFD166] text-[#2B477D] text-xs font-black flex items-center gap-2 justify-center mt-4">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>Need at least {3 - playerCount} more player(s) to launch the round. Share your room code!</span>
            </div>
          )}
        </div>

      </main>
    </div>
  );
};
