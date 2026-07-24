import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import { Trophy, Play, RotateCcw, UserX, Sparkles } from 'lucide-react';
import { useGame } from '../context/GameContext';
import { Header } from '../components/Header';
import { useAudio } from '../hooks/useAudio';

export const GameOverPage: React.FC = () => {
  const { gameState, isHost, nextRound, returnToLobby, myPlayerId } = useGame();
  const { playWin, playClick } = useAudio();

  useEffect(() => {
    // Trigger festive confetti explosion
    playWin();

    const duration = 2.5 * 1000;
    const end = Date.now() + duration;

    const frame = () => {
      confetti({
        particleCount: 3,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
        colors: ['#2B477D', '#ADD8E6', '#FFD166', '#4CAF50']
      });
      confetti({
        particleCount: 3,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
        colors: ['#2B477D', '#ADD8E6', '#FFD166', '#4CAF50']
      });

      if (Date.now() < end) {
        requestAnimationFrame(frame);
      }
    };

    frame();
  }, [playWin]);

  if (!gameState) return null;

  const imposterPlayer = gameState.players.find(p => p.id === gameState.imposterId);
  const isImposterWin = gameState.winningTeam === 'Imposter';
  const me = gameState.players.find(p => p.id === myPlayerId);
  const isMyTeamWinner = me?.role === gameState.winningTeam;

  const winReasonText: Record<string, string> = {
    ImposterSurvived: 'The Imposter survived the vote without being detected!',
    ImposterGuessedWord: 'The Imposter was voted out, but successfully stole victory by guessing the Secret Word!',
    PlayersCaughtImposter: 'The Players identified and voted out the Imposter!',
    ImposterFailedGuess: 'The Imposter failed to guess the Secret Word!'
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#F8E9C7] pb-12">
      <Header />

      <main className="flex-1 max-w-3xl w-full mx-auto p-4 sm:p-6 space-y-6 flex flex-col justify-center">
        
        {/* Victory Hero Card */}
        <div className={`bg-white rounded-3xl p-6 sm:p-8 border-3 text-center space-y-6 shadow-2xl ${
          isImposterWin
            ? 'border-[#F25F5C]'
            : 'border-[#4CAF50]'
        }`}>
          
          {/* Winner Title */}
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#FFD166] text-[#2B477D] border-2 border-[#2B477D] text-xs font-black uppercase tracking-wider shadow-sm">
              <Trophy className="w-4 h-4 text-[#2B477D] fill-current" />
              <span>{isMyTeamWinner ? '🎉 YOUR TEAM WON!' : 'ROUND OVER'}</span>
            </div>

            <h1 className={`font-heading font-black text-4xl sm:text-5xl tracking-tight ${
              isImposterWin ? 'text-[#F25F5C]' : 'text-[#4CAF50]'
            }`}>
              {isImposterWin ? 'IMPOSTER VICTORY!' : 'PLAYERS VICTORY!'}
            </h1>

            <p className="text-[#2B477D] text-sm max-w-md mx-auto font-bold">
              {winReasonText[gameState.winReason || ''] || 'Round completed.'}
            </p>
          </div>

          {/* Reveal Highlights */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-left">
            
            {/* Secret Word Reveal Box */}
            <div className="p-4 rounded-2xl bg-[#ADD8E6]/30 border-2 border-[#2B477D]/30 space-y-1">
              <div className="flex items-center gap-1.5 text-xs font-black text-[#2B477D] uppercase tracking-wider">
                <Sparkles className="w-4 h-4" />
                <span>Secret Word</span>
              </div>
              <div className="font-heading font-black text-2xl text-[#2B477D]">
                {gameState.secretWord || '???'}
              </div>
              <div className="text-xs text-[#2B477D]/80 font-bold">
                Category: <strong className="text-[#2B477D]">{gameState.category}</strong>
              </div>
            </div>

            {/* Imposter Identity Box */}
            <div className="p-4 rounded-2xl bg-[#F25F5C]/15 border-2 border-[#F25F5C]/40 space-y-1">
              <div className="flex items-center gap-1.5 text-xs font-black text-[#F25F5C] uppercase tracking-wider">
                <UserX className="w-4 h-4" />
                <span>The Imposter Was</span>
              </div>
              <div className="flex items-center gap-2">
                <div className={`w-8 h-8 rounded-xl ${imposterPlayer?.avatarColor || 'bg-[#F25F5C]'} flex items-center justify-center text-lg shadow border border-[#2B477D]/20`}>
                  {imposterPlayer?.avatarIcon || '🎭'}
                </div>
                <div className="font-heading font-black text-xl text-[#2B477D]">
                  {imposterPlayer?.name || 'Unknown'}
                </div>
              </div>
              {gameState.imposterGuess && (
                <div className="text-xs text-[#2B477D]/80 font-bold mt-1">
                  Guessed word: <strong className="text-[#F25F5C]">"{gameState.imposterGuess}"</strong>
                </div>
              )}
            </div>

          </div>

          {/* Host Next Controls */}
          {isHost ? (
            <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3">
              <button
                onClick={() => { playClick(); nextRound(); }}
                className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-[#2B477D] hover:bg-[#1D3159] text-white border-2 border-[#2B477D] font-heading font-black text-base transition-all duration-300 shadow-xl flex items-center justify-center gap-2 transform hover:scale-105 cursor-pointer"
              >
                <Play className="w-5 h-5 fill-current" />
                <span>Next Round</span>
              </button>

              <button
                onClick={() => { playClick(); returnToLobby(); }}
                className="w-full sm:w-auto px-6 py-4 rounded-2xl bg-[#F8E9C7] hover:bg-[#FFD166] text-[#2B477D] border-2 border-[#2B477D]/40 font-heading font-extrabold text-base transition-all flex items-center justify-center gap-2 cursor-pointer shadow-sm"
              >
                <RotateCcw className="w-5 h-5" />
                <span>Return to Lobby</span>
              </button>
            </div>
          ) : (
            <div className="pt-2 text-xs font-black text-[#2B477D]/70 animate-pulse">
              Waiting for Host to start the next round...
            </div>
          )}

        </div>

      </main>
    </div>
  );
};
