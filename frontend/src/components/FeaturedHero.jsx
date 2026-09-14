import React, { useState, useEffect } from 'react';
import { Play, Star, Sparkles, Tv, Film, ChevronRight, ChevronLeft, CheckCircle2 } from 'lucide-react';
import { getChannelForMovie } from '../data/channels';

export default function FeaturedHero({ movies = [], onPlay, onSelectChannel, uiLang = 'ar', t }) {
    const [currentIndex, setCurrentIndex] = useState(0);
    const isRtl = uiLang === 'ar';

    // Filter top high-rated titles with posters
    const featuredList = movies
        .filter(m => m && m.poster && m.title)
        .slice(0, 5);

    useEffect(() => {
        if (featuredList.length <= 1) return;
        const timer = setInterval(() => {
            setCurrentIndex(prev => (prev + 1) % featuredList.length);
        }, 7000);
        return () => clearInterval(timer);
    }, [featuredList.length]);

    if (featuredList.length === 0) return null;

    const current = featuredList[currentIndex] || featuredList[0];
    const channel = getChannelForMovie(current);
    const channelName = channel ? (typeof channel.name === 'string' ? channel.name : (channel.name?.en || channel.name?.ar)) : '';

    const handleNext = () => setCurrentIndex((currentIndex + 1) % featuredList.length);
    const handlePrev = () => setCurrentIndex((currentIndex - 1 + featuredList.length) % featuredList.length);

    return (
        <div className="relative w-full rounded-2xl sm:rounded-3xl overflow-hidden bg-[#111114] border border-white/10 shadow-2xl mb-4 sm:mb-6 select-none group">
            {/* Background Backdrop Image with Deep Cinematic Gradients */}
            <div className="relative w-full h-[340px] sm:h-[400px] md:h-[460px] overflow-hidden">
                <img 
                    key={current.id}
                    src={current.poster} 
                    alt={current.title}
                    className="w-full h-full object-cover object-top filter brightness-[0.55] sm:brightness-[0.45] transition-all duration-1000 scale-105 group-hover:scale-100"
                />

                {/* Dark Vignette & Gradient Overlays */}
                <div className="absolute inset-0 bg-gradient-to-t from-[#09090b] via-[#09090b]/70 to-transparent" />
                <div className={`absolute inset-0 bg-gradient-to-r ${isRtl ? 'from-[#09090b] via-[#09090b]/80 to-transparent' : 'from-transparent via-[#09090b]/80 to-[#09090b]'}`} />

                {/* Content Overlay */}
                <div className="absolute inset-0 p-4 sm:p-8 md:p-10 flex flex-col justify-end gap-2.5 sm:gap-3.5 max-w-2xl z-10">
                    {/* Trending Pill & Channel Tag */}
                    <div className="flex items-center gap-2 flex-wrap">
                        <span className="px-2.5 py-1 rounded-lg bg-red-600/95 text-white font-black text-[10px] sm:text-xs flex items-center gap-1 shadow-lg shadow-red-600/30">
                            <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                            {uiLang === 'ar' ? 'مميز الآن 🔥' : 'TRENDING NOW 🔥'}
                        </span>

                        <span className={`px-2 py-0.5 rounded-md text-[10px] sm:text-xs font-bold border backdrop-blur-md ${
                            current.type === 'anime' ? 'bg-purple-900/50 text-purple-300 border-purple-500/30' :
                            current.type === 'series' ? 'bg-emerald-900/50 text-emerald-300 border-emerald-500/30' :
                            'bg-blue-900/50 text-blue-300 border-blue-500/30'
                        }`}>
                            {current.type === 'anime' ? (t?.animeBadge || 'أنمي') : current.type === 'series' ? (t?.seriesBadge || 'مسلسل') : (t?.movieBadge || 'فيلم')}
                        </span>

                        {current.rating && current.rating !== 'N/A' && (
                            <span className="bg-black/60 backdrop-blur-md text-amber-400 border border-amber-400/20 px-2 py-0.5 rounded-md text-[10px] sm:text-xs font-bold flex items-center gap-1">
                                <Star size={11} className="fill-amber-400" />
                                {current.rating}
                            </span>
                        )}

                        <span className="text-[11px] sm:text-xs text-gray-300 font-semibold">
                            {current.year}
                        </span>
                    </div>

                    {/* Big Bold Cinematic Title */}
                    <h1 className="text-xl sm:text-3xl md:text-4xl font-black text-white leading-tight tracking-tight drop-shadow-lg line-clamp-2">
                        {current.title}
                    </h1>

                    {/* Synopsis */}
                    {current.summary && (
                        <p className="text-xs sm:text-sm text-gray-300 line-clamp-2 leading-relaxed drop-shadow max-w-xl">
                            {current.summary}
                        </p>
                    )}

                    {/* Action Buttons: Big Watch Now + Channel Link */}
                    <div className="flex items-center gap-2.5 pt-1 flex-wrap">
                        <button
                            onClick={() => onPlay(current)}
                            className="flex items-center gap-2 px-5 sm:px-7 py-2.5 sm:py-3 rounded-xl sm:rounded-2xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white font-extrabold text-xs sm:text-sm shadow-xl shadow-red-600/40 hover:shadow-red-600/60 transition-all duration-300 transform active:scale-95"
                        >
                            <Play size={18} className="fill-white" />
                            <span>{uiLang === 'ar' ? 'تشغيل الآن' : 'Watch Now'}</span>
                        </button>

                        {channel && (
                            <button
                                onClick={() => onSelectChannel && onSelectChannel(channel)}
                                className="flex items-center gap-2 px-3.5 sm:px-4 py-2 sm:py-2.5 rounded-xl sm:rounded-2xl bg-white/10 hover:bg-white/20 backdrop-blur-md text-white font-bold text-xs sm:text-sm border border-white/15 transition-all duration-200 active:scale-95"
                            >
                                <div className={`w-4 h-4 rounded-full bg-gradient-to-tr ${channel.color} flex items-center justify-center text-[7px] font-black text-white shrink-0`}>
                                    {channel.avatarText.slice(0, 2)}
                                </div>
                                <span className="truncate max-w-[120px]">{channelName}</span>
                                <CheckCircle2 size={12} className="text-blue-400 shrink-0" />
                            </button>
                        )}
                    </div>
                </div>

                {/* Slider Navigation Dots and Arrows */}
                {featuredList.length > 1 && (
                    <>
                        <div className="absolute top-3 right-3 sm:top-4 sm:right-4 z-20 flex items-center gap-1.5 bg-black/50 backdrop-blur-md p-1 rounded-full border border-white/10">
                            <button 
                                onClick={isRtl ? handleNext : handlePrev}
                                className="w-7 h-7 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition"
                                aria-label="Previous"
                            >
                                {isRtl ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
                            </button>
                            <button 
                                onClick={isRtl ? handlePrev : handleNext}
                                className="w-7 h-7 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition"
                                aria-label="Next"
                            >
                                {isRtl ? <ChevronLeft size={16} /> : <ChevronRight size={16} />}
                            </button>
                        </div>

                        {/* Bottom Dots Indicator */}
                        <div className="absolute bottom-3 right-3 sm:right-8 z-20 flex items-center gap-1.5">
                            {featuredList.map((_, idx) => (
                                <button
                                    key={idx}
                                    onClick={() => setCurrentIndex(idx)}
                                    className={`h-1.5 rounded-full transition-all duration-300 ${
                                        idx === currentIndex ? 'w-6 bg-red-600' : 'w-2 bg-white/30 hover:bg-white/50'
                                    }`}
                                    aria-label={`Slide ${idx + 1}`}
                                />
                            ))}
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}
