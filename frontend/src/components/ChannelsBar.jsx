import React from 'react';
import { CHANNELS } from '../data/channels';
import { CheckCircle2, Layers } from 'lucide-react';

export default function ChannelsBar({ selectedChannel, onSelectChannel, uiLang = 'ar', t }) {
    return (
        <div className="w-full flex items-center gap-2 overflow-x-auto py-2 no-scrollbar select-none">
            {/* All / Explore Button */}
            <button
                onClick={() => onSelectChannel(null)}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap shadow-sm shrink-0 ${
                    !selectedChannel
                        ? 'bg-white text-black font-extrabold'
                        : 'bg-[#1c1c1c] text-gray-300 hover:bg-[#282828] border border-[#2b2b2b]'
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
                        className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition whitespace-nowrap shadow-sm shrink-0 border ${
                            isSelected
                                ? 'bg-red-600 text-white border-red-500 shadow-md shadow-red-950/40'
                                : 'bg-[#181818] hover:bg-[#222222] text-gray-300 border-[#282828]'
                        }`}
                    >
                        {/* Mini Channel Avatar Dot */}
                        <div className={`w-5 h-5 rounded-full bg-gradient-to-tr ${ch.color} flex items-center justify-center text-[8px] font-black text-white shrink-0 shadow-inner`}>
                            {ch.avatarText.slice(0, 2)}
                        </div>

                        <span>{name}</span>
                        {ch.verified && (
                            <CheckCircle2 size={12} className={isSelected ? 'text-white' : 'text-gray-400'} />
                        )}
                    </button>
                );
            })}
        </div>
    );
}
