import React, { useState } from 'react';
import { Eye, EyeOff, ShieldCheck, UserX, Sparkles, HelpCircle, Star } from 'lucide-react';
import { PrivatePlayerInfo } from 'echo-shared';
import { useAudio } from '../hooks/useAudio';

interface CardProps {
  privateInfo: PrivatePlayerInfo | null;
  onConfirmReady?: () => void;
  isConfirmedReady?: boolean;
}

export const Card: React.FC<CardProps> = ({
  privateInfo,
  onConfirmReady,
  isConfirmedReady = false
}) => {
  const [isFlipped, setIsFlipped] = useState(false);
  const { playReveal, playClick } = useAudio();

  const handleToggleFlip = () => {
    playClick();
    if (!isFlipped) {
      playReveal();
    }
    setIsFlipped(!isFlipped);
  };

  const isImposter = privateInfo?.role === 'Imposter';
  const categoryWords = privateInfo?.categoryWords || [];
  const secretWord = privateInfo?.secretWord;

  return (
    <div className="flex flex-col items-center max-w-xl w-full mx-auto">
      
      {/* 3D Flipping Card Container */}
      <div
        onClick={handleToggleFlip}
        className="w-full h-[580px] perspective-1000 cursor-pointer group select-none"
      >
        <div
          className={`relative w-full h-full duration-700 transform-style-3d transition-transform ${
            isFlipped ? 'rotate-y-180' : ''
          }`}
        >
          
          {/* FRONT OF CARD (Cover) */}
          <div className="absolute inset-0 w-full h-full rounded-3xl bg-white border-3 border-[#2B477D] p-6 flex flex-col items-center justify-between text-center backface-hidden shadow-2xl group-hover:border-[#1D3159] transition-colors">
            
            <div className="flex items-center gap-2 text-xs font-black tracking-widest text-[#2B477D] uppercase">
              <Sparkles className="w-4 h-4 text-[#FFD166] fill-[#FFD166]" />
              <span>Top Secret Role Card</span>
            </div>

            <div className="my-auto flex flex-col items-center gap-4">
              <div className="w-24 h-24 rounded-full bg-[#ADD8E6]/40 border-3 border-[#2B477D] flex items-center justify-center shadow-md group-hover:scale-110 transition-transform">
                <HelpCircle className="w-12 h-12 text-[#2B477D] animate-pulse" />
              </div>
              <div>
                <h3 className="font-heading font-black text-2xl text-[#2B477D]">
                  Tap to Reveal Secret Grid
                </h3>
                <p className="text-xs text-[#2B477D]/70 font-semibold mt-1 max-w-[240px]">
                  Keep your screen hidden from other players!
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 text-xs font-bold text-[#2B477D] bg-[#F8E9C7] px-4 py-2 rounded-full border border-[#2B477D]/30">
              <Eye className="w-4 h-4 text-[#2B477D]" />
              <span>Click card to flip</span>
            </div>

          </div>

          {/* BACK OF CARD (Role Contents & Square Word Grid) */}
          <div
            className={`absolute inset-0 w-full h-full rounded-3xl border-3 p-5 flex flex-col items-center justify-between text-center backface-hidden rotate-y-180 shadow-2xl overflow-y-auto bg-white ${
              isImposter
                ? 'border-[#F25F5C]'
                : 'border-[#4CAF50]'
            }`}
          >
            
            {/* Header Badge */}
            <div className="w-full flex items-center justify-between pb-2 border-b-2 border-[#2B477D]/15 shrink-0">
              <span className={`px-3 py-1 rounded-full text-xs font-black border-2 uppercase tracking-wider ${
                isImposter
                  ? 'bg-[#F25F5C]/15 text-[#F25F5C] border-[#F25F5C]'
                  : 'bg-[#4CAF50]/15 text-[#4CAF50] border-[#4CAF50]'
              }`}>
                {isImposter ? 'ROLE: IMPOSTER' : 'ROLE: PLAYER'}
              </span>

              <div className="text-xs font-black text-[#2B477D]">
                {privateInfo?.category || 'Category'}
              </div>

              <button
                onClick={(e) => { e.stopPropagation(); handleToggleFlip(); }}
                className="p-1.5 rounded-lg bg-[#F8E9C7] text-[#2B477D] hover:bg-[#FFD166] border border-[#2B477D]/20 cursor-pointer"
                title="Hide Card"
              >
                <EyeOff className="w-4 h-4" />
              </button>
            </div>

            {/* Square Word Grid Container */}
            <div className="my-auto py-2 w-full space-y-2.5">
              
              <div className="flex items-center justify-between px-1">
                <span className="text-[11px] font-black uppercase tracking-wider text-[#2B477D]">
                  {privateInfo?.category} Word Bank Grid
                </span>
                <span className="text-[10px] font-bold text-[#2B477D]/60">
                  4x4 Matrix ({categoryWords.length} words)
                </span>
              </div>

              {/* 4x4 Square Matrix Grid */}
              <div className="grid grid-cols-4 gap-2 w-full">
                {categoryWords.map((word) => {
                  const isSecret = !isImposter && secretWord && word.toLowerCase() === secretWord.toLowerCase();

                  return (
                    <div
                      key={word}
                      className={`aspect-square p-1.5 sm:p-2 rounded-2xl border-2 flex flex-col items-center justify-center text-center relative transition-all shadow-sm overflow-hidden ${
                        isSecret
                          ? 'bg-[#4CAF50] border-[#2E7D32] text-white shadow-lg scale-105 ring-2 ring-[#4CAF50]/60 z-10'
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

              {/* Role Context Notification */}
              {isImposter ? (
                <div className="p-2.5 rounded-2xl bg-[#F25F5C]/15 border-2 border-[#F25F5C] text-left flex items-start gap-2.5">
                  <UserX className="w-4 h-4 text-[#F25F5C] shrink-0 mt-0.5" />
                  <div className="text-xs">
                    <strong className="text-[#F25F5C] block font-black text-[11px]">YOU ARE THE IMPOSTER</strong>
                    <span className="text-[#2B477D] text-[10px] font-semibold leading-tight block">
                      One of the 16 words in the square grid above is the Secret Word. Listen to clues to figure out which one!
                    </span>
                  </div>
                </div>
              ) : (
                <div className="p-2.5 rounded-2xl bg-[#4CAF50]/15 border-2 border-[#4CAF50] text-left flex items-start gap-2.5">
                  <ShieldCheck className="w-4 h-4 text-[#4CAF50] shrink-0 mt-0.5" />
                  <div className="text-xs">
                    <strong className="text-[#4CAF50] block font-black text-[11px]">YOUR SECRET WORD IS HIGHLIGHTED</strong>
                    <span className="text-[#2B477D] text-[10px] font-semibold leading-tight block">
                      Your secret word is <strong className="text-[#4CAF50] underline font-black">{secretWord}</strong> (highlighted in green). Give a subtle clue!
                    </span>
                  </div>
                </div>
              )}

            </div>

            <div className="text-[11px] text-[#2B477D]/70 font-bold shrink-0 pt-1">
              Click card to hide secret view
            </div>

          </div>

        </div>
      </div>

      {/* Confirmation Button */}
      {onConfirmReady && (
        <button
          onClick={() => { playClick(); onConfirmReady(); }}
          disabled={isConfirmedReady}
          className={`mt-6 w-full py-4 px-6 rounded-2xl font-heading font-black text-base transition-all duration-300 shadow-xl flex items-center justify-center gap-2 border-2 ${
            isConfirmedReady
              ? 'bg-[#4CAF50]/20 text-[#4CAF50] border-[#4CAF50] cursor-not-allowed'
              : 'bg-[#2B477D] hover:bg-[#1D3159] text-white border-[#2B477D] transform hover:scale-[1.02] cursor-pointer'
          }`}
        >
          {isConfirmedReady ? (
            <>
              <ShieldCheck className="w-5 h-5" />
              <span>Ready & Waiting for Others...</span>
            </>
          ) : (
            <>
              <span>I Have Memorized My Role</span>
            </>
          )}
        </button>
      )}

    </div>
  );
};
