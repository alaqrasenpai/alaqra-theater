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
            className="group flex flex-col gap-2 cursor-pointer select-none transition-all duration-300 hover:-translate-y-1" 
            onClick={() => onPlay(movie)}
        >
            <div className="relative aspect-[2/3] w-full rounded-2xl overflow-hidden bg-[#181818] border border-[#272727] group-hover:border-red-500/50 shadow-md">
                {!imgError && movie.poster ? (
                    <img 
                        src={movie.poster} 
                        alt={movie.title} 
                        onError={() => setImgError(true)}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                        loading="lazy"
                    />
                ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center p-4 text-center bg-[#1e1e1e] text-gray-500">
                        {movie.type === 'series' ? <Tv size={36} className="mb-2 opacity-50" /> : <Film size={36} className="mb-2 opacity-50" />}
                        <span className="text-xs font-semibold">{movie.title}</span>
                    </div>
                )}
                
                {/* Dark overlay with Play button */}
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity duration-200">
                    <div className="w-12 h-12 rounded-full bg-red-600/90 text-white flex items-center justify-center shadow-lg transform group-hover:scale-110 transition-transform">
                        <Play size={24} className="fill-white translate-x-0.5" />
                    </div>
                </div>

                {/* Rating Badge */}
                {movie.rating && movie.rating !== 'N/A' && (
                    <div className="absolute top-2 right-2 bg-black/80 backdrop-blur-md text-yellow-400 px-2 py-0.5 rounded-lg text-xs font-bold flex items-center gap-1 border border-yellow-500/20">
                        <Star size={11} className="fill-yellow-400" />
                        <span>{movie.rating}</span>
                    </div>
                )}

                {/* Type Badge */}
                <div className="absolute bottom-2 left-2 bg-black/80 backdrop-blur-md px-2 py-0.5 rounded-md text-[10px] font-semibold text-gray-300 flex items-center gap-1 border border-white/10">
                    {movie.type === 'anime' ? (
                        <>
                            <Sparkles size={10} className="text-purple-400" />
                            <span>{animeLabel}</span>
                        </>
                    ) : movie.type === 'series' ? (
                        <>
                            <Tv size={10} className="text-emerald-400" />
                            <span>{seriesLabel}</span>
                        </>
                    ) : (
                        <>
                            <Film size={10} className="text-blue-400" />
                            <span>{movieLabel}</span>
                        </>
                    )}
                </div>
            </div>

            <div className="px-1 flex flex-col gap-1">
                <h3 className="font-semibold text-sm text-white line-clamp-1 group-hover:text-red-400 transition-colors">
                    {movie.title}
                </h3>
                
                {/* Channel Name with Verified Tick - YouTube Style */}
                {channel && (
                    <div 
                        className="flex items-center gap-1 text-[11px] text-gray-400 hover:text-white transition-colors group/ch w-fit"
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
                        <span className="truncate max-w-[130px] group-hover/ch:underline">
                            {channelName}
                        </span>
                        <CheckCircle2 size={10} className="text-gray-400 shrink-0" />
                    </div>
                )}

                <div className="flex items-center gap-2 text-xs text-gray-400">
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
