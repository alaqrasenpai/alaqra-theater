import React from 'react';
import { CHANNELS } from '../data/channels';
import { CheckCircle2, Layers } from 'lucide-react';

export default function ChannelsBar({ selectedChannel, onSelectChannel, uiLang = 'ar', t }) {
    return (
        <div className="w-full flex items-center gap-2 overflow-x-auto py-2 no-scrollbar select-none scroll-smooth">
            {/* All / Explore Button */}
            <button
                onClick={() => onSelectChannel(null)}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all duration-200 active:scale-95 whitespace-nowrap shadow-sm shrink-0 ${
                    !selectedChannel
                        ? 'bg-white text-black font-extrabold shadow-md shadow-white/10'
                        : 'bg-[#18181b] text-gray-300 hover:bg-[#242429] hover:text-white border border-white/5'
                }`}
            >
                <Layers size={14} />
                <span>{t?.all || 'الكل'}</span>
            </button>

            {/* Channels List */}
            {CHANNELS.map(ch => {
                const isSelected = selectedChannel?.id === ch.id;
                const name = typeof ch.name === 'string' ? ch.name : (ch.name?.en || ch.name?.ar);

                return (
                    <button
                        key={ch.id}
                        onClick={() => onSelectChannel(ch)}
                        className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all duration-200 active:scale-95 whitespace-nowrap shadow-sm shrink-0 border ${
                            isSelected
                                ? 'bg-red-600 text-white border-red-500 shadow-lg shadow-red-600/30 font-bold'
                                : 'bg-[#18181b] hover:bg-[#242429] text-gray-300 hover:text-white border-white/5'
                        }`}
                    >
                        {/* Mini Channel Avatar Dot */}
                        <div className={`w-5 h-5 rounded-full bg-gradient-to-tr ${ch.color} flex items-center justify-center text-[8px] font-black text-white shrink-0 shadow-inner ring-1 ring-white/10`}>
                            {ch.avatarText.slice(0, 2)}
                        </div>

                        <span>{name}</span>
                        {ch.verified && (
                            <CheckCircle2 size={12} className={isSelected ? 'text-white' : 'text-blue-400/80'} />
                        )}
                    </button>
                );
            })}
        </div>
    );
}
