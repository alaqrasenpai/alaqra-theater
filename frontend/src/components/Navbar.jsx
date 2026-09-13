import React, { useState } from 'react';
import { Search, Clapperboard, Film, Tv, Sparkles, Clock, Languages, Code2, ExternalLink, Layers } from 'lucide-react';

export default function Navbar({ onSearch, activeTab, setActiveTab, uiLang, setUiLang, t }) {
    const [query, setQuery] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        onSearch(query);
    };

    return (
        <nav className="bg-[#0f0f0f] border-b border-[#272727] sticky top-0 z-50 px-3 sm:px-6 py-2.5 flex flex-col gap-2.5 shadow-md">
            {/* Row 1: Logo | Search Bar | Actions (Language & Developer Portfolio) */}
            <div className="max-w-7xl mx-auto w-full flex items-center justify-between gap-3 sm:gap-6">
                {/* Logo */}
                <div 
                    className="flex items-center gap-2.5 cursor-pointer select-none shrink-0"
                    onClick={() => { setActiveTab('all'); onSearch(''); }}
                >
                    <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-tr from-red-600 to-red-500 flex items-center justify-center shadow-lg shadow-red-900/40">
                        <Clapperboard size={20} className="text-white" />
                    </div>
                    <div className="flex flex-col">
                        <span className="text-base sm:text-xl font-black text-white tracking-wide">{t.siteName}</span>
                        <span className="text-[10px] text-gray-400 font-medium -mt-1 hidden sm:block">{t.siteSubtitle}</span>
                    </div>
                </div>
                
                {/* Search Bar */}
                <form onSubmit={handleSubmit} className="flex-1 max-w-xs sm:max-w-md md:max-w-xl mx-2 sm:mx-4">
                    <div className="flex items-center bg-[#121212] border border-[#303030] rounded-full overflow-hidden focus-within:border-red-500 transition-colors shadow-inner">
                        <input
                            type="text"
                            placeholder={t.searchPlaceholder}
                            dir={uiLang === 'ar' ? 'rtl' : 'ltr'}
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            className="w-full bg-transparent text-white px-3.5 sm:px-5 py-2 sm:py-2.5 text-xs sm:text-sm outline-none placeholder-gray-500"
                        />
                        <button 
                            type="submit" 
                            className="bg-[#222222] hover:bg-[#2e2e2e] px-3.5 sm:px-5 py-2 sm:py-2.5 border-r border-l border-[#303030] text-gray-300 transition flex items-center justify-center shrink-0"
                            title={t.searchTitle}
                        >
                            <Search size={16} />
                        </button>
                    </div>
                </form>

                {/* Right Utility Actions (Language & Developer Portfolio) - Never clipped */}
                <div className="flex items-center gap-2 shrink-0">
                    {/* Language Switcher Button */}
                    <button
                        onClick={() => setUiLang(uiLang === 'ar' ? 'en' : 'ar')}
                        className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 bg-[#202020] hover:bg-[#2b2b2b] text-gray-200 border border-[#333333] rounded-xl text-xs font-bold transition shadow-sm shrink-0"
                        title={uiLang === 'ar' ? 'Switch to English' : 'التحويل للعربية'}
                    >
                        <Languages size={14} className="text-red-500" />
                        <span>{t.langSwitch}</span>
                    </button>

                    {/* Developer Website Link */}
                    <a
                        href="https://alaqra.dev"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 bg-gradient-to-r from-red-950/60 to-[#1e1e1e] hover:from-red-900/70 hover:to-[#2a2a2a] text-white border border-red-500/40 hover:border-red-500/80 rounded-xl text-xs font-bold transition shadow-md group shrink-0"
                        title="Developer Portfolio: alaqra.dev"
                    >
                        <Code2 size={14} className="text-red-400 group-hover:rotate-12 transition-transform" />
                        <span className="font-mono tracking-tight text-[11px]">alaqra.dev</span>
                        <ExternalLink size={11} className="text-gray-400 group-hover:text-white transition-colors" />
                    </a>
                </div>
            </div>

            {/* Row 2: YouTube-style Category Navigation Tabs - Clean, no scrollbar, full-width */}
            <div className="max-w-7xl mx-auto w-full flex items-center gap-2 overflow-x-auto no-scrollbar py-0.5 text-xs sm:text-sm font-medium">
                <button
                    onClick={() => setActiveTab('all')}
                    className={`px-3.5 py-1.5 rounded-xl transition-all whitespace-nowrap shrink-0 flex items-center gap-1.5 ${
                        activeTab === 'all' 
                            ? 'bg-white text-black font-bold shadow' 
                            : 'bg-[#1e1e1e] text-gray-300 hover:bg-[#2a2a2a] border border-[#2b2b2b]'
                    }`}
                >
                    {t.all}
                </button>
                <button
                    onClick={() => setActiveTab('channels')}
                    className={`px-3.5 py-1.5 rounded-xl transition-all whitespace-nowrap shrink-0 flex items-center gap-1.5 ${
                        activeTab === 'channels' 
                            ? 'bg-white text-black font-bold shadow' 
                            : 'bg-[#1e1e1e] text-gray-300 hover:bg-[#2a2a2a] border border-[#2b2b2b]'
                    }`}
                >
                    <Layers size={14} />
                    {t.channels}
                </button>
                <button
                    onClick={() => setActiveTab('movies')}
                    className={`px-3.5 py-1.5 rounded-xl transition-all whitespace-nowrap shrink-0 flex items-center gap-1.5 ${
                        activeTab === 'movies' 
                            ? 'bg-white text-black font-bold shadow' 
                            : 'bg-[#1e1e1e] text-gray-300 hover:bg-[#2a2a2a] border border-[#2b2b2b]'
                    }`}
                >
                    <Film size={14} />
                    {t.movies}
                </button>
                <button
                    onClick={() => setActiveTab('series')}
                    className={`px-3.5 py-1.5 rounded-xl transition-all whitespace-nowrap shrink-0 flex items-center gap-1.5 ${
                        activeTab === 'series' 
                            ? 'bg-white text-black font-bold shadow' 
                            : 'bg-[#1e1e1e] text-gray-300 hover:bg-[#2a2a2a] border border-[#2b2b2b]'
                    }`}
                >
                    <Tv size={14} />
                    {t.series}
                </button>
                <button
                    onClick={() => setActiveTab('anime')}
                    className={`px-3.5 py-1.5 rounded-xl transition-all whitespace-nowrap shrink-0 flex items-center gap-1.5 ${
                        activeTab === 'anime' 
                            ? 'bg-white text-black font-bold shadow' 
                            : 'bg-[#1e1e1e] text-gray-300 hover:bg-[#2a2a2a] border border-[#2b2b2b]'
                    }`}
                >
                    <Sparkles size={14} />
                    {t.anime}
                </button>
                <button
                    onClick={() => setActiveTab('history')}
                    className={`px-3.5 py-1.5 rounded-xl transition-all whitespace-nowrap shrink-0 flex items-center gap-1.5 ${
                        activeTab === 'history' 
                            ? 'bg-white text-black font-bold shadow' 
                            : 'bg-[#1e1e1e] text-gray-300 hover:bg-[#2a2a2a] border border-[#2b2b2b]'
                    }`}
                >
                    <Clock size={14} />
                    {t.history}
                </button>
            </div>
        </nav>
    );
}
