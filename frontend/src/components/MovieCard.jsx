import React, { useState } from 'react';
import { Play, Star, Film, Tv, Sparkles } from 'lucide-react';

export default function MovieCard({ movie, onPlay, t, uiLang = 'ar' }) {
    const [imgError, setImgError] = useState(false);

    const animeLabel = t?.animeBadge || 'أنمي';
    const seriesLabel = t?.seriesBadge || 'مسلسل';
    const kdramaLabel = t?.kdramaBadge || 'دراما كورية';
    const movieLabel = t?.movieBadge || 'فيلم';
    const episodesLabel = t?.episodesCount || 'حلقة';

    return (
        <div 
            className="group flex flex-col gap-1.5 sm:gap-2 cursor-pointer select-none transition-all duration-300 hover:-translate-y-1 active:scale-[0.97]" 
            onClick={() => onPlay(movie)}
        >
            <div className="relative aspect-[2/3] w-full rounded-2xl overflow-hidden bg-[#161618] border border-white/10 group-hover:border-red-500/50 shadow-lg group-hover:shadow-red-500/20 transition-all duration-300">
                {!imgError && movie.poster ? (
                    <img 
                        src={movie.poster} 
                        alt={movie.title} 
                        onError={() => setImgError(true)}
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                        loading="lazy"
                        decoding="async"
                    />
                ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center p-3 text-center bg-[#161618] text-gray-500">
                        {movie.type === 'anime' ? <Sparkles size={32} className="mb-2 opacity-50 text-purple-400" /> : movie.type === 'kdrama' ? <Sparkles size={32} className="mb-2 opacity-50 text-pink-400" /> : movie.type === 'series' ? <Tv size={32} className="mb-2 opacity-50 text-emerald-400" /> : <Film size={32} className="mb-2 opacity-50 text-blue-400" />}
                        <span className="text-[11px] font-semibold line-clamp-2 px-1">{movie.title}</span>
                    </div>
                )}
                
                {/* Gradient Bottom Shadow */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-70 group-hover:opacity-40 transition-opacity" />

                {/* Dark overlay with Play button */}
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity duration-200">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-red-600 text-white flex items-center justify-center shadow-xl shadow-red-600/40 transform group-hover:scale-110 transition-transform">
                        <Play size={20} className="fill-white translate-x-0.5" />
                    </div>
                </div>

                {/* Rating Badge */}
                {movie.rating && movie.rating !== 'N/A' && (
                    <div className="absolute top-2 right-2 bg-black/85 text-amber-300 px-1.5 sm:px-2 py-0.5 rounded-lg text-[10px] sm:text-[11px] font-bold flex items-center gap-0.5 border border-white/10 shadow-sm">
                        <Star size={10} className="fill-amber-400 text-amber-400" />
                        <span>{movie.rating}</span>
                    </div>
                )}

                {/* Type Badge */}
                <div className="absolute bottom-2 left-2 bg-black/85 px-1.5 sm:px-2 py-0.5 rounded-lg text-[9px] sm:text-[10px] font-bold flex items-center gap-1 border border-white/10 shadow-sm">
                    {movie.type === 'anime' ? (
                        <>
                            <Sparkles size={10} className="text-purple-400" />
                            <span className="text-purple-300">{animeLabel}</span>
                        </>
                    ) : movie.type === 'kdrama' ? (
                        <>
                            <Sparkles size={10} className="text-pink-400" />
                            <span className="text-pink-300">{kdramaLabel}</span>
                        </>
                    ) : movie.type === 'series' ? (
                        <>
                            <Tv size={10} className="text-emerald-400" />
                            <span className="text-emerald-300">{seriesLabel}</span>
                        </>
                    ) : (
                        <>
                            <Film size={10} className="text-blue-400" />
                            <span className="text-blue-300">{movieLabel}</span>
                        </>
                    )}
                </div>

                {/* HD Quality Pill */}
                <div className="absolute top-2 left-2 bg-black/80 px-1.5 py-0.5 rounded text-[8px] sm:text-[9px] font-extrabold text-gray-200 border border-white/10 opacity-90 group-hover:opacity-100">
                    HD
                </div>
            </div>

            <div className="px-0.5 flex flex-col gap-0.5 sm:gap-1">
                <h3 className="font-bold text-xs sm:text-sm text-white line-clamp-1 group-hover:text-red-400 transition-colors">
                    {movie.title}
                </h3>
                
                <div className="flex items-center gap-1.5 text-[10px] sm:text-xs text-gray-400">
                    <span>{movie.year}</span>
                    {movie.episodes && (
                        <>
                            <span>•</span>
                            <span>{movie.episodes} {episodesLabel}</span>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}
