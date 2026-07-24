import React, { useState, useEffect } from 'react';
import { Radio, PlusCircle, LogIn, Sparkles } from 'lucide-react';
import { useGame } from '../context/GameContext';
import { AvatarPicker } from '../components/AvatarPicker';
import { AVATAR_COLORS, AVATAR_ICONS } from '../utils/formatters';
import { useAudio } from '../hooks/useAudio';

export const LandingPage: React.FC = () => {
  const { createRoom, joinRoom } = useGame();
  const { playClick } = useAudio();
  const [tab, setTab] = useState<'create' | 'join'>('create');
  const [name, setName] = useState('');
  const [roomCode, setRoomCode] = useState('');
  const [color, setColor] = useState(AVATAR_COLORS[0].bg);
  const [icon, setIcon] = useState(AVATAR_ICONS[0]);

  // Check URL parameters for shareable room invite links (e.g. ?code=ECHO99)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const codeParam = params.get('code') || params.get('room');
    if (codeParam) {
      setRoomCode(codeParam.toUpperCase().trim());
      setTab('join');
    }
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    playClick();

    if (tab === 'create') {
      createRoom(name.trim(), color, icon);
    } else {
      if (!roomCode.trim()) return;
      joinRoom(roomCode.trim(), name.trim(), color, icon);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 sm:p-6 bg-[#F8E9C7]">
      <div className="w-full max-w-xl bg-white rounded-3xl p-6 sm:p-8 border-3 border-[#2B477D] shadow-2xl space-y-6">
        
        {/* Header Hero Title */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#FFD166] text-[#2B477D] border-2 border-[#2B477D] text-xs font-black uppercase tracking-wider mb-1 shadow-sm">
            <Sparkles className="w-4 h-4 fill-current" />
            <span>Social Deduction Word Game</span>
          </div>

          <div className="flex items-center justify-center gap-3">
            <div className="p-3.5 rounded-2xl bg-[#2B477D] text-white shadow-lg">
              <Radio className="w-9 h-9 animate-pulse text-[#FFD166]" />
            </div>
            <h1 className="font-heading font-black text-4xl sm:text-5xl tracking-tight text-[#2B477D]">
              ECHO
            </h1>
          </div>

          <p className="text-[#2B477D]/80 font-medium text-sm max-w-sm mx-auto">
            Find the secret word, give subtle clues, and catch the hidden Imposter!
          </p>
        </div>

        {/* Create / Join Tabs */}
        <div className="grid grid-cols-2 p-1.5 rounded-2xl bg-[#F8E9C7] border-2 border-[#2B477D]/30">
          <button
            type="button"
            onClick={() => { playClick(); setTab('create'); }}
            className={`py-3 px-4 rounded-xl font-heading font-extrabold text-sm transition-all flex items-center justify-center gap-2 cursor-pointer ${
              tab === 'create'
                ? 'bg-[#2B477D] text-white shadow-md'
                : 'text-[#2B477D]/70 hover:text-[#2B477D]'
            }`}
          >
            <PlusCircle className="w-4 h-4" />
            <span>Create Room</span>
          </button>

          <button
            type="button"
            onClick={() => { playClick(); setTab('join'); }}
            className={`py-3 px-4 rounded-xl font-heading font-extrabold text-sm transition-all flex items-center justify-center gap-2 cursor-pointer ${
              tab === 'join'
                ? 'bg-[#ADD8E6] text-[#2B477D] border-2 border-[#2B477D] shadow-md'
                : 'text-[#2B477D]/70 hover:text-[#2B477D]'
            }`}
          >
            <LogIn className="w-4 h-4" />
            <span>Join Room</span>
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          
          {/* Player Name */}
          <div>
            <label className="block text-xs font-black text-[#2B477D] mb-2 uppercase tracking-wider">
              Your Player Name
            </label>
            <input
              type="text"
              required
              maxLength={16}
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Agent Cipher"
              className="w-full px-4 py-3.5 rounded-2xl bg-[#F8E9C7]/40 border-2 border-[#2B477D]/30 text-[#2B477D] placeholder-[#2B477D]/50 focus:outline-none focus:border-[#2B477D] font-extrabold text-base transition-colors"
            />
          </div>

          {/* Room Code if Join tab */}
          {tab === 'join' && (
            <div className="animate-fade-in">
              <label className="block text-xs font-black text-[#2B477D] mb-2 uppercase tracking-wider">
                Room Code
              </label>
              <input
                type="text"
                required
                maxLength={8}
                value={roomCode}
                onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
                placeholder="e.g. ECHO99"
                className="w-full px-4 py-3.5 rounded-2xl bg-[#F8E9C7]/40 border-2 border-[#2B477D]/30 text-[#2B477D] placeholder-[#2B477D]/50 focus:outline-none focus:border-[#2B477D] font-mono font-extrabold tracking-widest text-lg uppercase transition-colors"
              />
            </div>
          )}

          {/* Avatar Customization */}
          <AvatarPicker
            selectedColor={color}
            selectedIcon={icon}
            onSelectColor={setColor}
            onSelectIcon={setIcon}
          />

          {/* Submit Action Button */}
          <button
            type="submit"
            className="w-full py-4 px-6 rounded-2xl font-heading font-black text-lg transition-all duration-300 shadow-xl flex items-center justify-center gap-2 cursor-pointer bg-[#2B477D] hover:bg-[#1D3159] text-white border-2 border-[#2B477D] transform hover:scale-[1.02]"
          >
            <span>{tab === 'create' ? 'Enter Party Lobby' : 'Join Room'}</span>
          </button>

        </form>

      </div>
    </div>
  );
};
