import React from 'react';
import { Home, Film, Tv, Sparkles, Clock, Layers } from 'lucide-react';

export default function BottomNav({ activeTab, setActiveTab, onSelectChannel, t }) {
    const tabs = [
        { id: 'all', label: t?.all || 'الرئيسية', icon: Home },
        { id: 'movies', label: t?.movies || 'أفلام', icon: Film },
        { id: 'series', label: t?.series || 'مسلسلات', icon: Tv },
        { id: 'anime', label: t?.anime || 'أنمي', icon: Sparkles },
        { id: 'channels', label: t?.channels || 'قنوات', icon: Layers },
        { id: 'history', label: t?.history || 'السجل', icon: Clock },
    ];

    return (
        <div className="sm:hidden fixed bottom-0 inset-x-0 bg-[#0c0c0e]/95 backdrop-blur-2xl border-t border-white/10 z-50 px-2 py-1.5 flex items-center justify-around shadow-[0_-8px_30px_rgba(0,0,0,0.8)] select-none">
            {tabs.map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;

                return (
                    <button
                        key={tab.id}
                        onClick={() => {
                            if (onSelectChannel) onSelectChannel(null);
                            setActiveTab(tab.id);
                            window.scrollTo({ top: 0, behavior: 'smooth' });
                        }}
                        className={`flex flex-col items-center justify-center gap-1 py-1 px-2.5 rounded-xl transition-all duration-200 active:scale-90 relative ${
                            isActive 
                                ? 'text-red-500 font-bold' 
                                : 'text-gray-400 hover:text-gray-200'
                        }`}
                    >
                        <div className={`relative p-1 rounded-lg transition-colors ${
                            isActive ? 'bg-red-500/15' : 'bg-transparent'
                        }`}>
                            <Icon 
                                size={19} 
                                className={`transition-transform duration-200 ${isActive ? 'scale-110 text-red-500 stroke-[2.5]' : 'stroke-[1.75]'}`} 
                            />
                        </div>
                        <span className="text-[10px] tracking-tight leading-none">
                            {tab.label}
                        </span>

                        {isActive && (
                            <span className="w-1 h-1 rounded-full bg-red-500 absolute -bottom-0.5" />
                        )}
                    </button>
                );
            })}
        </div>
    );
}
