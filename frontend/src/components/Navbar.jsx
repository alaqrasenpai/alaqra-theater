import React, { useState, useEffect, useRef } from 'react';
import { 
    Search, Clapperboard, Film, Tv, Sparkles, Clock, 
    Languages, Code2, ExternalLink, Layers, X, Star, ArrowRight, ArrowLeft, Loader2
} from 'lucide-react';
import { fetchAutocomplete } from '../services/api';

export default function Navbar({ onSearch, activeTab, setActiveTab, uiLang, setUiLang, t, onSelectMovie }) {
    const [query, setQuery] = useState('');
    const [suggestions, setSuggestions] = useState([]);
    const [loadingSuggestions, setLoadingSuggestions] = useState(false);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [mobileSearchOpen, setMobileSearchOpen] = useState(false);

    const searchContainerRef = useRef(null);
    const mobileInputRef = useRef(null);
    const isRtl = uiLang === 'ar';

    // Click outside listener to dismiss autocomplete
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (searchContainerRef.current && !searchContainerRef.current.contains(e.target)) {
                setShowSuggestions(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Live Autocomplete Debounced Search
    useEffect(() => {
        if (!query.trim() || query.trim().length < 2) {
            setSuggestions([]);
            setLoadingSuggestions(false);
            return;
        }

        const timer = setTimeout(async () => {
            setLoadingSuggestions(true);
            const results = await fetchAutocomplete(query);
            setSuggestions(results);
            setLoadingSuggestions(false);
            setShowSuggestions(true);
        }, 220);

        return () => clearTimeout(timer);
    }, [query]);

    // Handle Search Submission
    const handleSubmit = (e) => {
        if (e) e.preventDefault();
        setShowSuggestions(false);
        setMobileSearchOpen(false);
        onSearch(query);
    };

    // Handle Selecting a Suggestion
    const handleSelectSuggestion = (item) => {
        setShowSuggestions(false);
        setMobileSearchOpen(false);
        setQuery(item.title);
        if (onSelectMovie) {
            onSelectMovie(item);
        } else {
            onSearch(item.title);
        }
    };

    // Focus mobile input when opening
    useEffect(() => {
        if (mobileSearchOpen && mobileInputRef.current) {
            setTimeout(() => mobileInputRef.current?.focus(), 100);
        }
    }, [mobileSearchOpen]);

    return (
        <nav className="bg-[#0f0f0f]/95 backdrop-blur-xl border-b border-[#222222] sticky top-0 z-50 px-3 sm:px-6 py-2.5 flex flex-col gap-2.5 shadow-2xl transition-all">
            {/* Mobile Fullscreen Search Bar Overlay */}
            {mobileSearchOpen ? (
                <div className="flex items-center gap-2 w-full py-1">
                    <button
                        onClick={() => {
                            setMobileSearchOpen(false);
                            setShowSuggestions(false);
                        }}
                        className="p-2 text-gray-400 hover:text-white transition rounded-xl bg-[#1a1a1a]"
                        aria-label="Close search"
                    >
                        {isRtl ? <ArrowRight size={20} /> : <ArrowLeft size={20} />}
                    </button>

                    <div className="relative flex-1" ref={searchContainerRef}>
                        <form onSubmit={handleSubmit} className="w-full">
                            <div className="flex items-center bg-[#181818] border border-[#333333] rounded-full overflow-hidden focus-within:border-red-500 shadow-inner px-3 py-1.5">
                                <Search size={16} className="text-gray-400 shrink-0 ml-1 mr-1" />
                                <input
                                    ref={mobileInputRef}
                                    type="text"
                                    placeholder={t.searchPlaceholder}
                                    dir={isRtl ? 'rtl' : 'ltr'}
                                    value={query}
                                    onChange={(e) => {
                                        setQuery(e.target.value);
                                        setShowSuggestions(true);
                                    }}
                                    className="w-full bg-transparent text-white px-2 text-sm outline-none placeholder-gray-500"
                                />
                                {query && (
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setQuery('');
                                            setSuggestions([]);
                                        }}
                                        className="text-gray-400 hover:text-white p-1"
                                    >
                                        <X size={16} />
                                    </button>
                                )}
                            </div>
                        </form>

                        {/* Mobile Autocomplete Suggestions Dropdown */}
                        {showSuggestions && (query.trim().length >= 2) && (
                            <div className="absolute top-full mt-2 inset-x-0 bg-[#161616]/98 backdrop-blur-2xl border border-[#2e2e2e] rounded-2xl shadow-2xl overflow-hidden z-50 flex flex-col max-h-80 overflow-y-auto">
                                {loadingSuggestions ? (
                                    <div className="flex items-center justify-center p-4 gap-2 text-xs text-gray-400">
                                        <Loader2 size={16} className="animate-spin text-red-500" />
                                        <span>{t.loading}</span>
                                    </div>
                                ) : suggestions.length > 0 ? (
                                    <div className="flex flex-col divide-y divide-white/5">
                                        {suggestions.map((item) => (
                                            <div
                                                key={item.id}
                                                onClick={() => handleSelectSuggestion(item)}
                                                className="flex items-center gap-3 p-2.5 hover:bg-white/5 transition-colors cursor-pointer"
                                            >
                                                {item.poster ? (
                                                    <img src={item.poster} alt={item.title} className="w-9 h-12 rounded-lg object-cover shrink-0 shadow" />
                                                ) : (
                                                    <div className="w-9 h-12 rounded-lg bg-[#222] flex items-center justify-center shrink-0">
                                                        <Clapperboard size={16} className="text-gray-500" />
                                                    </div>
                                                )}
                                                <div className="flex flex-col flex-1 min-w-0">
                                                    <span className="text-white text-xs font-bold truncate">{item.title}</span>
                                                    <div className="flex items-center gap-2 text-[10px] text-gray-400 mt-0.5">
                                                        <span className={`px-1.5 py-0.2 rounded font-semibold ${
                                                            item.type === 'anime' ? 'bg-purple-900/40 text-purple-300 border border-purple-500/20' :
                                                            item.type === 'kdrama' ? 'bg-pink-900/40 text-pink-300 border border-pink-500/20' :
                                                            item.type === 'series' ? 'bg-emerald-900/40 text-emerald-300 border border-emerald-500/20' :
                                                            'bg-blue-900/40 text-blue-300 border border-blue-500/20'
                                                        }`}>
                                                            {item.type === 'anime' ? (t.animeBadge || 'أنمي') : item.type === 'kdrama' ? (t.kdramaBadge || 'دراما كورية') : item.type === 'series' ? (t.seriesBadge || 'مسلسل') : (t.movieBadge || 'فيلم')}
                                                        </span>
                                                        <span>{item.year}</span>
                                                        {item.rating && item.rating !== 'N/A' && (
                                                            <span className="flex items-center gap-0.5 text-yellow-400 font-bold">
                                                                <Star size={9} className="fill-yellow-400" /> {item.rating}
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                        <button
                                            onClick={handleSubmit}
                                            className="w-full text-center py-2 text-xs font-bold text-red-400 hover:bg-white/5 transition"
                                        >
                                            {t.viewAllResults || 'عرض كافة النتائج لـ'} "{query}"
                                        </button>
                                    </div>
                                ) : (
                                    <div className="p-3 text-center text-xs text-gray-400">
                                        {t.noResults}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            ) : (
                /* Standard Row 1: Logo | Desktop Search Bar | Actions */
                <div className="max-w-7xl mx-auto w-full flex items-center justify-between gap-2.5 sm:gap-6">
                    {/* Logo */}
                    <div 
                        className="flex items-center gap-2 sm:gap-2.5 cursor-pointer select-none shrink-0 group"
                        onClick={() => { setActiveTab('all'); onSearch(''); setQuery(''); }}
                    >
                        <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-tr from-red-600 via-red-500 to-rose-600 flex items-center justify-center shadow-lg shadow-red-900/30 group-hover:scale-105 transition-transform">
                            <Clapperboard size={18} className="text-white drop-shadow" />
                        </div>
                        <div className="flex flex-col">
                            <span className="text-sm sm:text-lg md:text-xl font-black text-white tracking-wide leading-none">{t.siteName}</span>
                            <span className="text-[9px] sm:text-[10px] text-gray-400 font-medium hidden sm:block mt-1">{t.siteSubtitle}</span>
                        </div>
                    </div>
                    
                    {/* Desktop & Tablet Centered Search Bar with Floating Autocomplete */}
                    <div className="hidden sm:block flex-1 max-w-sm md:max-w-lg lg:max-w-xl mx-2 relative" ref={searchContainerRef}>
                        <form onSubmit={handleSubmit} className="w-full">
                            <div className="flex items-center bg-[#141414] border border-[#2b2b2b] rounded-full overflow-hidden focus-within:border-red-500/80 focus-within:ring-2 focus-within:ring-red-500/20 transition-all shadow-inner">
                                <input
                                    type="text"
                                    placeholder={t.searchPlaceholder}
                                    dir={isRtl ? 'rtl' : 'ltr'}
                                    value={query}
                                    onFocus={() => { if (query.trim().length >= 2) setShowSuggestions(true); }}
                                    onChange={(e) => {
                                        setQuery(e.target.value);
                                        setShowSuggestions(true);
                                    }}
                                    className="w-full bg-transparent text-white px-4 py-2 sm:py-2.5 text-xs sm:text-sm outline-none placeholder-gray-500"
                                />
                                {query && (
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setQuery('');
                                            setSuggestions([]);
                                        }}
                                        className="text-gray-400 hover:text-white p-1 mr-1"
                                    >
                                        <X size={14} />
                                    </button>
                                )}
                                <button 
                                    type="submit" 
                                    className="bg-[#202020] hover:bg-red-600 hover:text-white px-4 py-2 sm:py-2.5 border-r border-l border-[#2e2e2e] text-gray-300 transition flex items-center justify-center shrink-0"
                                    title={t.searchTitle}
                                >
                                    <Search size={16} />
                                </button>
                            </div>
                        </form>

                        {/* Floating Suggestions Dropdown */}
                        {showSuggestions && (query.trim().length >= 2) && (
                            <div className="absolute top-full mt-2 inset-x-0 bg-[#151515]/95 backdrop-blur-2xl border border-[#2e2e2e] rounded-2xl shadow-2xl overflow-hidden z-50 flex flex-col max-h-88 overflow-y-auto">
                                <div className="px-3 py-1.5 bg-[#1c1c1c] border-b border-white/5 flex items-center justify-between text-[11px] text-gray-400 font-semibold">
                                    <span>{t.searchSuggestions || 'اقتراحات سريعة'}</span>
                                    {loadingSuggestions && <Loader2 size={12} className="animate-spin text-red-500" />}
                                </div>

                                {suggestions.length > 0 ? (
                                    <div className="flex flex-col divide-y divide-white/5">
                                        {suggestions.map((item) => (
                                            <div
                                                key={item.id}
                                                onClick={() => handleSelectSuggestion(item)}
                                                className="flex items-center gap-3 p-2.5 hover:bg-white/5 transition-colors cursor-pointer group"
                                            >
                                                {item.poster ? (
                                                    <img src={item.poster} alt={item.title} className="w-10 h-14 rounded-lg object-cover shrink-0 shadow group-hover:scale-105 transition-transform" />
                                                ) : (
                                                    <div className="w-10 h-14 rounded-lg bg-[#202020] flex items-center justify-center shrink-0">
                                                        <Clapperboard size={18} className="text-gray-500" />
                                                    </div>
                                                )}
                                                <div className="flex flex-col flex-1 min-w-0">
                                                    <span className="text-white text-xs sm:text-sm font-bold truncate group-hover:text-red-400 transition-colors">{item.title}</span>
                                                    <div className="flex items-center gap-2 text-[11px] text-gray-400 mt-1">
                                                        <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                                                            item.type === 'anime' ? 'bg-purple-900/40 text-purple-300 border border-purple-500/30' :
                                                            item.type === 'kdrama' ? 'bg-pink-900/40 text-pink-300 border border-pink-500/30' :
                                                            item.type === 'series' ? 'bg-emerald-900/40 text-emerald-300 border border-emerald-500/30' :
                                                            'bg-blue-900/40 text-blue-300 border border-blue-500/30'
                                                        }`}>
                                                            {item.type === 'anime' ? (t.animeBadge || 'أنمي') : item.type === 'kdrama' ? (t.kdramaBadge || 'دراما كورية') : item.type === 'series' ? (t.seriesBadge || 'مسلسل') : (t.movieBadge || 'فيلم')}
                                                        </span>
                                                        <span>{item.year}</span>
                                                        {item.rating && item.rating !== 'N/A' && (
                                                            <span className="flex items-center gap-1 text-yellow-400 font-bold">
                                                                <Star size={11} className="fill-yellow-400" /> {item.rating}
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                        <button
                                            onClick={handleSubmit}
                                            className="w-full text-center py-2.5 text-xs font-bold text-red-400 hover:bg-red-500/10 transition"
                                        >
                                            {t.viewAllResults || 'عرض كافة النتائج لـ'} "{query}"
                                        </button>
                                    </div>
                                ) : !loadingSuggestions ? (
                                    <div className="p-4 text-center text-xs text-gray-400">
                                        {t.noResults}
                                    </div>
                                ) : null}
                            </div>
                        )}
                    </div>

                    {/* Right Utility Actions */}
                    <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
                        {/* Mobile Search Toggle Icon */}
                        <button
                            onClick={() => setMobileSearchOpen(true)}
                            className="sm:hidden p-2 bg-[#1c1c1c] text-gray-200 hover:text-white border border-[#2b2b2b] rounded-xl text-xs transition active:scale-95"
                            aria-label="Open search"
                        >
                            <Search size={16} className="text-red-500" />
                        </button>

                        {/* Language Switcher Button */}
                        <button
                            onClick={() => setUiLang(uiLang === 'ar' ? 'en' : 'ar')}
                            className="flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3 py-1.5 bg-[#1b1b1b] hover:bg-[#252525] text-gray-200 border border-[#2f2f2f] rounded-xl text-[11px] sm:text-xs font-bold transition shadow-sm shrink-0 active:scale-95"
                            title={uiLang === 'ar' ? 'Switch to English' : 'التحويل للعربية'}
                        >
                            <Languages size={13} className="text-red-500" />
                            <span>{t.langSwitch}</span>
                        </button>

                        {/* Developer Website Link */}
                        <a
                            href="https://alaqra.dev"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1 sm:gap-1.5 px-2 sm:px-3 py-1.5 bg-gradient-to-r from-red-950/60 to-[#181818] hover:from-red-900/70 hover:to-[#242424] text-white border border-red-500/30 hover:border-red-500/70 rounded-xl text-[11px] sm:text-xs font-bold transition shadow-md group shrink-0 active:scale-95"
                            title="Developer Portfolio: alaqra.dev"
                        >
                            <Code2 size={14} className="text-red-400 group-hover:rotate-12 transition-transform shrink-0" />
                            <span className="font-mono tracking-tight text-[11px] hidden xs:inline">alaqra.dev</span>
                            <ExternalLink size={10} className="text-gray-400 group-hover:text-white transition-colors hidden sm:inline" />
                        </a>
                    </div>
                </div>
            )}

            {/* Row 2: Desktop/Tablet Category Navigation Tabs - Clean, no scrollbar, full-width (Hidden on Mobile, handled by BottomNav) */}
            <div className="max-w-7xl mx-auto w-full hidden sm:flex items-center gap-2 overflow-x-auto no-scrollbar py-0.5 text-xs sm:text-sm font-medium">
                <button
                    onClick={() => { setActiveTab('all'); onSearch(''); setQuery(''); }}
                    className={`px-3.5 py-1.5 rounded-xl transition-all whitespace-nowrap shrink-0 flex items-center gap-1.5 ${
                        activeTab === 'all' 
                            ? 'bg-white text-black font-extrabold shadow-lg shadow-white/10' 
                            : 'bg-[#181818] text-gray-300 hover:bg-[#252525] border border-[#262626]'
                    }`}
                >
                    {t.all}
                </button>
                <button
                    onClick={() => setActiveTab('movies')}
                    className={`px-3.5 py-1.5 rounded-xl transition-all whitespace-nowrap shrink-0 flex items-center gap-1.5 ${
                        activeTab === 'movies' 
                            ? 'bg-white text-black font-extrabold shadow-lg shadow-white/10' 
                            : 'bg-[#181818] text-gray-300 hover:bg-[#252525] border border-[#262626]'
                    }`}
                >
                    <Film size={14} className={activeTab === 'movies' ? 'text-blue-600' : 'text-blue-400'} />
                    {t.movies}
                </button>
                <button
                    onClick={() => setActiveTab('series')}
                    className={`px-3.5 py-1.5 rounded-xl transition-all whitespace-nowrap shrink-0 flex items-center gap-1.5 ${
                        activeTab === 'series' 
                            ? 'bg-white text-black font-extrabold shadow-lg shadow-white/10' 
                            : 'bg-[#181818] text-gray-300 hover:bg-[#252525] border border-[#262626]'
                    }`}
                >
                    <Tv size={14} className={activeTab === 'series' ? 'text-emerald-600' : 'text-emerald-400'} />
                    {t.series}
                </button>
                <button
                    onClick={() => setActiveTab('anime')}
                    className={`px-3.5 py-1.5 rounded-xl transition-all whitespace-nowrap shrink-0 flex items-center gap-1.5 ${
                        activeTab === 'anime' 
                            ? 'bg-white text-black font-extrabold shadow-lg shadow-white/10' 
                            : 'bg-[#181818] text-gray-300 hover:bg-[#252525] border border-[#262626]'
                    }`}
                >
                    <Sparkles size={14} className={activeTab === 'anime' ? 'text-purple-600' : 'text-purple-400'} />
                    {t.anime}
                </button>
                <button
                    onClick={() => setActiveTab('kdrama')}
                    className={`px-3.5 py-1.5 rounded-xl transition-all whitespace-nowrap shrink-0 flex items-center gap-1.5 ${
                        activeTab === 'kdrama' 
                            ? 'bg-white text-black font-extrabold shadow-lg shadow-white/10' 
                            : 'bg-[#181818] text-gray-300 hover:bg-[#252525] border border-[#262626]'
                    }`}
                >
                    <Sparkles size={14} className={activeTab === 'kdrama' ? 'text-pink-600' : 'text-pink-400'} />
                    {t.kdrama || 'دراما كورية'}
                </button>
                <button
                    onClick={() => setActiveTab('history')}
                    className={`px-3.5 py-1.5 rounded-xl transition-all whitespace-nowrap shrink-0 flex items-center gap-1.5 ${
                        activeTab === 'history' 
                            ? 'bg-white text-black font-extrabold shadow-lg shadow-white/10' 
                            : 'bg-[#181818] text-gray-300 hover:bg-[#252525] border border-[#262626]'
                    }`}
                >
                    <Clock size={14} />
                    {t.history}
                </button>
            </div>
        </nav>
    );
}
