import React from 'react';
import { AVATAR_COLORS, AVATAR_ICONS } from '../utils/formatters';

interface AvatarPickerProps {
  selectedColor: string;
  selectedIcon: string;
  onSelectColor: (color: string) => void;
  onSelectIcon: (icon: string) => void;
}

export const AvatarPicker: React.FC<AvatarPickerProps> = ({
  selectedColor,
  selectedIcon,
  onSelectColor,
  onSelectIcon
}) => {
  return (
    <div className="space-y-4">
      <div>
        <label className="block text-xs font-black text-[#2B477D] mb-2 uppercase tracking-wider">
          Choose Avatar Icon
        </label>
        <div className="grid grid-cols-6 gap-2">
          {AVATAR_ICONS.map((icon) => (
            <button
              key={icon}
              type="button"
              onClick={() => onSelectIcon(icon)}
              className={`text-2xl p-2.5 rounded-xl border-2 transition-all duration-200 transform hover:scale-110 cursor-pointer ${
                selectedIcon === icon
                  ? 'bg-[#ADD8E6]/60 border-[#2B477D] shadow-md scale-105'
                  : 'bg-[#F8E9C7]/40 border-[#2B477D]/20 hover:border-[#2B477D]/50'
              }`}
            >
              {icon}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-xs font-black text-[#2B477D] mb-2 uppercase tracking-wider">
          Choose Color Theme
        </label>
        <div className="grid grid-cols-4 sm:grid-cols-8 gap-2">
          {AVATAR_COLORS.map((color) => (
            <button
              key={color.name}
              type="button"
              onClick={() => onSelectColor(color.bg)}
              className={`h-10 rounded-xl transition-all duration-200 cursor-pointer ${color.bg} ${
                selectedColor === color.bg
                  ? `ring-4 ${color.ring} ring-offset-2 ring-offset-white scale-105 border-2 border-[#2B477D]`
                  : 'opacity-80 hover:opacity-100 hover:scale-105'
              }`}
              title={color.name}
            />
          ))}
        </div>
      </div>
    </div>
  );
};
