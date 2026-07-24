import React from 'react';
import { MessageSquareText } from 'lucide-react';
import { ClueEntry } from 'echo-shared';

interface ClueHistoryProps {
  clues: ClueEntry[];
  currentTurnPlayerName?: string;
}

export const ClueHistory: React.FC<ClueHistoryProps> = ({ clues, currentTurnPlayerName }) => {
  return (
    <div className="w-full bg-white rounded-3xl p-5 border-2 border-[#2B477D]/20 shadow-lg space-y-4">
      <div className="flex items-center justify-between pb-3 border-b-2 border-[#2B477D]/10">
        <div className="flex items-center gap-2">
          <MessageSquareText className="w-5 h-5 text-[#2B477D]" />
          <h3 className="font-heading font-black text-[#2B477D] text-base">
            Round Clues
          </h3>
        </div>
        <span className="text-xs font-black px-2.5 py-0.5 rounded-full bg-[#ADD8E6]/50 text-[#2B477D] border border-[#2B477D]/20">
          {clues.length} submitted
        </span>
      </div>

      <div className="space-y-3 max-h-64 overflow-y-auto pr-1">
        {clues.length === 0 ? (
          <div className="text-center py-6 text-[#2B477D]/60 text-sm font-semibold italic">
            No clues submitted yet. First player is preparing their clue!
          </div>
        ) : (
          clues.map((item, idx) => (
            <div
              key={idx}
              className="flex items-start gap-3 p-3.5 rounded-2xl bg-[#F8E9C7]/30 border-2 border-[#2B477D]/15 animate-fade-in"
            >
              <div className={`w-9 h-9 rounded-xl ${item.avatarColor} flex items-center justify-center text-lg shrink-0 shadow border border-[#2B477D]/20`}>
                {item.avatarColor.includes('bg-') ? '👤' : item.avatarColor}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <span className="font-black text-sm text-[#2B477D] truncate">
                    {item.playerName}
                  </span>
                  <span className="font-mono text-[10px] font-black text-[#2B477D] bg-[#ADD8E6]/60 px-2 py-0.5 rounded-full border border-[#2B477D]/20">
                    #{item.order}
                  </span>
                </div>
                <p className="text-sm font-black text-[#2B477D] mt-1 bg-white px-3 py-1.5 rounded-xl border-2 border-[#2B477D]/30 inline-block shadow-sm">
                  "{item.clueText}"
                </p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
