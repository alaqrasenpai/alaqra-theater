import React, { useState } from 'react';
import { Play, Star, Film, Tv, Sparkles, CheckCircle2 } from 'lucide-react';
import { getChannelForMovie } from '../data/channels';

export default function MovieCard({ movie, onPlay, onSelectChannel, t, uiLang = 'ar' }) {
    const [imgError, setImgError] = useState(false);

    const animeLabel = t?.animeBadge || 'أنمي';
    const seriesLabel = t?.seriesBadge || 'مسلسل';
    const movieLabel = t?.movieBadge || 'فيلم';
    const episodesLabel = t?.episodesCount || 'حلقة';

    const channel = getChannelForMovie(movie);
    const channelName = channel ? (typeof channel.name === 'string' ? channel.name : (channel.name?.en || channel.name?.ar)) : '';

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
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                        loading="lazy"
                    />
                ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center p-3 text-center bg-[#161618] text-gray-500">
                        {movie.type === 'anime' ? <Sparkles size={32} className="mb-2 opacity-50 text-purple-400" /> : movie.type === 'series' ? <Tv size={32} className="mb-2 opacity-50 text-emerald-400" /> : <Film size={32} className="mb-2 opacity-50 text-blue-400" />}
                        <span className="text-[11px] font-semibold line-clamp-2 px-1">{movie.title}</span>
                    </div>
                )}
                
                {/* Gradient Bottom Shadow */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent opacity-70 group-hover:opacity-40 transition-opacity" />

                {/* Dark overlay with Play button */}
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-all duration-200 backdrop-blur-[1px]">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-red-600 text-white flex items-center justify-center shadow-xl shadow-red-600/40 transform group-hover:scale-110 transition-transform">
                        <Play size={20} className="fill-white translate-x-0.5" />
                    </div>
                </div>

                {/* Rating Badge */}
                {movie.rating && movie.rating !== 'N/A' && (
                    <div className="absolute top-2 right-2 bg-black/75 backdrop-blur-md text-amber-300 px-1.5 sm:px-2 py-0.5 rounded-lg text-[10px] sm:text-[11px] font-bold flex items-center gap-0.5 border border-white/10 shadow-sm">
                        <Star size={10} className="fill-amber-400 text-amber-400" />
                        <span>{movie.rating}</span>
                    </div>
                )}

                {/* Type Badge */}
                <div className="absolute bottom-2 left-2 bg-black/80 backdrop-blur-md px-1.5 sm:px-2 py-0.5 rounded-lg text-[9px] sm:text-[10px] font-bold flex items-center gap-1 border border-white/10 shadow-sm">
                    {movie.type === 'anime' ? (
                        <>
                            <Sparkles size={10} className="text-purple-400" />
                            <span className="text-purple-300">{animeLabel}</span>
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
                <div className="absolute top-2 left-2 bg-white/15 backdrop-blur-md px-1.5 py-0.5 rounded text-[8px] sm:text-[9px] font-extrabold text-gray-200 border border-white/10 opacity-85 group-hover:opacity-100">
                    HD
                </div>
            </div>

            <div className="px-0.5 flex flex-col gap-0.5 sm:gap-1">
                <h3 className="font-bold text-xs sm:text-sm text-white line-clamp-1 group-hover:text-red-400 transition-colors">
                    {movie.title}
                </h3>
                
                {/* Channel Name with Verified Tick */}
                {channel && (
                    <div 
                        className="flex items-center gap-1 text-[10px] sm:text-[11px] text-gray-400 hover:text-white transition-colors group/ch w-fit"
                        onClick={(e) => {
                            if (onSelectChannel) {
                                e.stopPropagation();
                                onSelectChannel(channel);
                            }
                        }}
                    >
                        <div className={`w-3.5 h-3.5 rounded-full bg-gradient-to-tr ${channel.color} flex items-center justify-center text-[6px] font-black text-white shrink-0`}>
                            {channel.avatarText.slice(0, 2)}
                        </div>
                        <span className="truncate max-w-[100px] sm:max-w-[130px] group-hover/ch:underline">
                            {channelName}
                        </span>
                        <CheckCircle2 size={10} className="text-blue-400 shrink-0" />
                    </div>
                )}

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
