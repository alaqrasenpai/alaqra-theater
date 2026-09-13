import React from 'react';
import { ArrowRight, ArrowLeft, CheckCircle2, Bell, Sparkles, Play, Film, Tv } from 'lucide-react';
import MovieCard from './MovieCard';
import { useLocalStorage } from '../hooks/useLocalStorage';

export default function ChannelView({ channel, movies = [], onPlayMovie, onBack, uiLang = 'ar', t }) {
    const isRtl = uiLang === 'ar';
    const [subscriptions, setSubscriptions] = useLocalStorage('alaqra_channel_subs', {});

    const isSubscribed = !!subscriptions[channel?.id];

    const toggleSubscribe = (e) => {
        e.stopPropagation();
        setSubscriptions(prev => ({
            ...prev,
            [channel.id]: !prev[channel.id]
        }));
    };

    if (!channel) return null;

    const channelName = typeof channel.name === 'string' ? channel.name : (channel.name?.en || channel.name?.ar);
    const channelDesc = channel.description[uiLang] || channel.description.ar;

    // Filter movies that belong to this channel
    const channelMovies = movies.filter(m => {
        const text = `${m.title || ''} ${m.summary || ''}`.toLowerCase();
        if (channel.keywords && channel.keywords.length > 0) {
            return channel.keywords.some(kw => text.includes(kw));
        }
        if (channel.id === 'anime_studios') return m.type === 'anime';
        if (channel.id === 'tv_hub') return m.type === 'series';
        return true;
    });

    return (
        <div className="flex flex-col w-full max-w-7xl mx-auto p-3 sm:p-6 gap-6" dir={isRtl ? 'rtl' : 'ltr'}>
            {/* Top Back Navigation */}
            <button 
                onClick={onBack}
                className="flex items-center gap-2 text-gray-400 hover:text-white self-start transition-colors bg-[#181818] px-4 py-2 rounded-xl border border-[#272727] text-xs sm:text-sm font-semibold"
            >
                {isRtl ? <ArrowRight size={18} /> : <ArrowLeft size={18} />}
                <span>{t?.backToHome || 'العودة للرئيسية'}</span>
            </button>

            {/* YouTube-style Channel Header */}
            <div className="relative w-full rounded-3xl overflow-hidden border border-[#272727] bg-[#141414] shadow-2xl">
                {/* Channel Banner */}
                <div className={`w-full h-36 sm:h-52 bg-gradient-to-r ${channel.color} relative flex items-end p-6`}>
                    <div className="absolute inset-0 bg-black/30 backdrop-blur-[2px]"></div>
                    <div className="relative z-10 flex items-center gap-2 text-white/80 text-xs font-mono">
                        <Sparkles size={14} className="text-yellow-400" />
                        <span>Alaqra Verified Channel Network</span>
                    </div>
                </div>

                {/* Channel Profile Info Bar */}
                <div className="p-6 sm:p-8 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                    <div className="flex items-center gap-5">
                        {/* Channel Avatar */}
                        <div className={`w-20 h-20 sm:w-24 sm:h-24 -mt-16 sm:-mt-20 rounded-full bg-gradient-to-tr ${channel.color} border-4 border-[#141414] flex items-center justify-center text-white font-black text-xl sm:text-2xl shadow-2xl shrink-0 ring-2 ring-white/10 select-none`}>
                            {channel.avatarText}
                        </div>

                        {/* Title & Metadata */}
                        <div className="flex flex-col gap-1">
                            <div className="flex items-center gap-2">
                                <h1 className="text-xl sm:text-2xl font-black text-white">{channelName}</h1>
                                {channel.verified && (
                                    <CheckCircle2 size={18} className="text-gray-400 fill-white" />
                                )}
                            </div>
                            <div className="flex items-center gap-2 text-xs text-gray-400">
                                <span className="font-mono text-gray-300">{channel.handle}</span>
                                <span>•</span>
                                <span className="font-bold text-white">{channel.subscribers} {t?.subscribers || 'مشترك'}</span>
                                <span>•</span>
                                <span>{channelMovies.length} {t?.videosCount || 'عمل'}</span>
                            </div>
                            <p className="text-xs text-gray-300 mt-1 max-w-2xl leading-relaxed">
                                {channelDesc}
                            </p>
                        </div>
                    </div>

                    {/* YouTube Subscribe Button */}
                    <button
                        onClick={toggleSubscribe}
                        className={`flex items-center justify-center gap-2 px-6 py-2.5 rounded-full text-sm font-bold transition shadow-lg shrink-0 self-start sm:self-center ${
                            isSubscribed
                                ? 'bg-[#272727] hover:bg-[#333333] text-gray-200'
                                : 'bg-red-600 hover:bg-red-700 text-white shadow-red-900/40'
                        }`}
                    >
                        {isSubscribed ? (
                            <>
                                <Bell size={16} className="fill-gray-200" />
                                <span>{t?.subscribed || 'مشترك ✓'}</span>
                            </>
                        ) : (
                            <span>{t?.subscribe || 'اشتراك'}</span>
                        )}
                    </button>
                </div>
            </div>

            {/* Channel Movie Catalog */}
            <div className="flex flex-col gap-4">
                <div className="flex items-center justify-between border-b border-[#252525] pb-3">
                    <h2 className="text-lg font-bold text-white flex items-center gap-2">
                        <Film size={20} className="text-red-500" />
                        <span>{channelName} ({channelMovies.length})</span>
                    </h2>
                </div>

                {channelMovies.length === 0 ? (
                    <div className="py-16 text-center text-gray-500 text-sm">
                        لم يتم العثور على أعمال مطابقة مباشرة لهذه القناة حالياً.
                    </div>
                ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 sm:gap-6">
                        {channelMovies.map(item => (
                            <MovieCard 
                                key={item.id} 
                                movie={item} 
                                onPlay={onPlayMovie} 
                                t={t}
                                uiLang={uiLang}
                            />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
