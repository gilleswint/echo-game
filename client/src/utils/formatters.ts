export function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
}

export const AVATAR_COLORS = [
  { name: 'Primary Blue', bg: 'bg-[#2B477D]', hex: '#2B477D', ring: 'ring-[#2B477D]' },
  { name: 'Light Blue', bg: 'bg-[#ADD8E6]', hex: '#ADD8E6', ring: 'ring-[#ADD8E6]' },
  { name: 'Golden Yellow', bg: 'bg-[#FFD166]', hex: '#FFD166', ring: 'ring-[#FFD166]' },
  { name: 'Fresh Green', bg: 'bg-[#4CAF50]', hex: '#4CAF50', ring: 'ring-[#4CAF50]' },
  { name: 'Soft Red', bg: 'bg-[#F25F5C]', hex: '#F25F5C', ring: 'ring-[#F25F5C]' },
  { name: 'Deep Indigo', bg: 'bg-[#3F51B5]', hex: '#3F51B5', ring: 'ring-[#3F51B5]' },
  { name: 'Teal Spark', bg: 'bg-[#009688]', hex: '#009688', ring: 'ring-[#009688]' },
  { name: 'Warm Amber', bg: 'bg-[#FF9800]', hex: '#FF9800', ring: 'ring-[#FF9800]' },
];

export const AVATAR_ICONS = ['🦊', '🦉', '🐱', '🐼', '🤖', '👾', '🚀', '⚡', '👑', '🔮', '🎭', '🐺'];
