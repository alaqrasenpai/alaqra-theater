import React, { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import { 
    ArrowRight, ArrowLeft, Loader2, Subtitles, Upload, 
    ExternalLink, AlertCircle, PlayCircle, Film,
    Zap, Radio, Tv, Check, Globe, HelpCircle, Maximize2, Minimize2, RotateCcw,
    CheckCircle2, Bell, Volume2, Settings, Sparkles, Info, ShieldCheck
} from 'lucide-react';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { getChannelForMovie } from '../data/channels';
import { API_BASE, fetchEpisodes } from '../services/api';

// Helper to parse WebVTT text into cue objects for custom overlay
function parseVttCues(vttText) {
    if (!vttText) return [];
    const lines = vttText.split(/\r?\n/);
    const cues = [];
    let currentCue = null;
    const timeRegex = /(\d{2}):(\d{2}):(\d{2})[.,](\d{3})\s*-->\s*(\d{2}):(\d{2}):(\d{2})[.,](\d{3})/;

    for (let line of lines) {
        line = line.trim();
        const match = line.match(timeRegex);
        if (match) {
            const start = parseInt(match[1])*3600 + parseInt(match[2])*60 + parseInt(match[3]) + parseInt(match[4])/1000;
            const end = parseInt(match[5])*3600 + parseInt(match[6])*60 + parseInt(match[7]) + parseInt(match[8])/1000;
            currentCue = { start, end, text: '' };
            cues.push(currentCue);
        } else if (currentCue && line && !line.match(/^\d+$/) && !line.startsWith('WEBVTT')) {
            currentCue.text = currentCue.text ? currentCue.text + '\n' + line : line;
        }
    }
    return cues;
}

export default function VideoPlayer({ 
    movie, 
    onBack, 
    allMovies = [], 
    onPlayOtherMovie, 
    onSelectChannel, 
    uiLang = 'ar', 
    t 
}) {
    const isRtl = uiLang === 'ar';
    const channel = getChannelForMovie(movie);
    const channelName = channel ? (typeof channel.name === 'string' ? channel.name : (channel.name?.en || channel.name?.ar)) : '';
    const [subscriptions, setSubscriptions] = useLocalStorage('alaqra_channel_subs', {});
    const isSubscribed = channel ? !!subscriptions[channel.id] : false;

    const toggleSubscribe = () => {
        if (!channel) return;
        setSubscriptions(prev => ({
            ...prev,
            [channel.id]: !prev[channel.id]
        }));
    };

    // Mode: Default is 'direct' with Server 1 (VidSrc PM - Fast, HD, and Working Arabic Subtitles on Screen)
    const [playMode, setPlayMode] = useState('direct');
    const [directServer, setDirectServer] = useState(1); // 1: VidSrc PM (Default with Working Subtitles), 2: VidSrc ME, 3: MultiEmbed
    
    // Series Episodes State
    const [episodes, setEpisodes] = useState([]);
    const [selectedSeason, setSelectedSeason] = useState(1);
    const [selectedEpisode, setSelectedEpisode] = useState(1);
    const [loadingEpisodes, setLoadingEpisodes] = useState(false);

    // Torrent Stream State
    const [streamData, setStreamData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [torrentStats, setTorrentStats] = useState({ speed: 0, peers: 0, progress: 0 });
    
    // Anime torrent selection
    const [animeTorrents, setAnimeTorrents] = useState([]);
    const [selectedAnimeTorrent, setSelectedAnimeTorrent] = useState(null);

    // Subtitle state & automatic preference
    const [preferredLang, setPreferredLang] = useLocalStorage('preferred_sub_lang', 'ara');
    const [activeSubLang, setActiveSubLang] = useState(preferredLang);
    const [subtitleUrl, setSubtitleUrl] = useState(null);
    const [subtitleStatus, setSubtitleStatus] = useState('تم تفعيل الترجمة العربية');
    const [loadingSub, setLoadingSub] = useState(false);
    const [subCues, setSubCues] = useState([]);
    const [currentVideoTime, setCurrentVideoTime] = useState(0);

    // Player controls state
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [showControls, setShowControls] = useState(true);
    const [reloadKey, setReloadKey] = useState(0);

    const videoRef = useRef(null);
    const playerContainerRef = useRef(null);
    const fileInputRef = useRef(null);
    const pollIntervalRef = useRef(null);
    const controlsTimeoutRef = useRef(null);

    // Convert SRT to WebVTT in-browser if user uploads local file
    const srtToVtt = (srt) => {
        let clean = (srt || '').replace(/^\uFEFF/, '').replace(/\uFEFF/g, '').replace(/\r\n|\r/g, '\n');
        let vtt = "WEBVTT\n\n";
        vtt += clean.replace(/(\d\d:\d\d:\d\d),(\d\d\d)/g, '$1.$2');
        return vtt;
    };

    const handleFileUpload = (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (event) => {
            const content = event.target?.result;
            if (typeof content === 'string') {
                let vttText = content;
                if (file.name.endsWith('.srt')) {
                    vttText = srtToVtt(content);
                }
                const blob = new Blob([vttText], { type: 'text/vtt;charset=utf-8' });
                const objectUrl = URL.createObjectURL(blob);
                setSubtitleUrl(objectUrl);
                setActiveSubLang('custom');
                setSubCues(parseVttCues(vttText));
                setSubtitleStatus(`تم تحميل الملف: ${file.name}`);
            }
        };
        reader.readAsText(file);
    };

    const formatSpeed = (bytes) => {
        if (!bytes || bytes === 0) return '0 KB/s';
        if (bytes > 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB/s`;
        return `${(bytes / 1024).toFixed(0)} KB/s`;
    };

    // Auto-fetch subtitle from OpenSubtitles open-source API
    const fetchAutoSubtitle = async (lang, seasonNum = selectedSeason, epNum = selectedEpisode) => {
        if (lang === 'off' || lang === 'custom') {
            setSubCues([]);
            return;
        }

        setLoadingSub(true);
        setSubtitleStatus(lang === 'ara' ? 'جاري جلب الترجمة العربية...' : 'جاري جلب الترجمة الإنجليزية...');

        try {
            const params = {
                imdb: movie.imdbCode || '',
                lang: lang,
                query: movie.title || ''
            };
            if (movie.type === 'series') {
                params.season = seasonNum;
                params.episode = epNum;
            }

            const subApiUrl = `${API_BASE}/api/subtitles/auto?${new URLSearchParams(params).toString()}`;
            setSubtitleUrl(subApiUrl);

            const res = await axios.get(subApiUrl);
            const cues = parseVttCues(res.data);
            setSubCues(cues);

            setSubtitleStatus(lang === 'ara' ? 'تم تفعيل الترجمة العربية' : 'تم تفعيل الترجمة الإنجليزية');
        } catch (err) {
            console.error('Subtitle auto-fetch error:', err);
            setSubtitleStatus('تعذر العثور على ترجمة تلقائية');
        } finally {
            setLoadingSub(false);
        }
    };

    // Handle Subtitle Language Change
    const handleLanguageChange = (lang) => {
        setActiveSubLang(lang);
        if (lang !== 'custom') {
            setPreferredLang(lang);
        }
        if (lang === 'off') {
            setSubtitleUrl(null);
            setSubCues([]);
            setSubtitleStatus('الترجمة معطلة');
        } else if (lang !== 'custom') {
            fetchAutoSubtitle(lang);
        }
    };

    // Toggle [CC] directly from the YouTube player toolbar
    const handleToggleCC = () => {
        if (activeSubLang !== 'off') {
            handleLanguageChange('off');
        } else {
            handleLanguageChange('ara');
        }
    };

    // Fullscreen Toggle
    const handleToggleFullscreen = () => {
        if (!playerContainerRef.current) return;
        if (!document.fullscreenElement) {
            playerContainerRef.current.requestFullscreen().then(() => setIsFullscreen(true)).catch(() => {});
        } else {
            document.exitFullscreen().then(() => setIsFullscreen(false)).catch(() => {});
        }
    };

    // Start Torrent Buffer Stream
    const startTorrentStream = async (torrentParams) => {
        try {
            setLoading(true);
            setError(null);
            clearInterval(pollIntervalRef.current);

            const res = await axios.get(`${API_BASE}/api/torrent/start`, {
                params: torrentParams
            });
            
            setStreamData(res.data);
            setLoading(false);

            const hash = res.data.infoHash;
            pollIntervalRef.current = setInterval(async () => {
                try {
                    const statusRes = await axios.get(`${API_BASE}/api/torrent/status/${hash}`);
                    setTorrentStats({
                        speed: statusRes.data.downloadSpeed,
                        peers: statusRes.data.peers,
                        progress: statusRes.data.progress
                    });
                } catch (e) {
                    // ignore poll error
                }
            }, 1500);

        } catch (err) {
            console.error('Torrent start error:', err);
            const msg = err.response?.data?.error || 'استغرق الاتصال بالموزعين وقتاً طويلاً.';
            setError(msg);
            setLoading(false);
        }
    };

    // Initial load: Fetch series episodes or anime torrents
    useEffect(() => {
        if (!movie) return;

        if (movie.type === 'series' || movie.type === 'anime') {
            const loadEpisodes = async () => {
                setLoadingEpisodes(true);
                try {
                    const eps = await fetchEpisodes(movie.id);
                    setEpisodes(eps);
                    if (eps.length > 0) {
                        setSelectedSeason(eps[0].season);
                        setSelectedEpisode(eps[0].number || 1);
                    }
                } catch (err) {
                    console.error('Fetch episodes error:', err);
                } finally {
                    setLoadingEpisodes(false);
                }
            };
            loadEpisodes();
        }

        if (movie.type === 'anime') {
            const fetchAnimeTorrents = async () => {
                try {
                    const res = await axios.get(`${API_BASE}/api/search/anime-torrents`, {
                        params: { title: movie.title }
                    });
                    const found = res.data.torrents || [];
                    setAnimeTorrents(found);
                    if (found.length > 0) {
                        setSelectedAnimeTorrent(found[0]);
                    }
                } catch (err) {
                    console.error('Anime torrent error:', err);
                }
            };
            fetchAnimeTorrents();
        }

        fetchAutoSubtitle(preferredLang, 1, 1);

        return () => {
            clearInterval(pollIntervalRef.current);
        };
    }, [movie]);

    // Handle Episode Selection
    const handleEpisodeSelect = (seasonNum, epNum) => {
        setSelectedSeason(seasonNum);
        setSelectedEpisode(epNum);
        if (activeSubLang !== 'off' && activeSubLang !== 'custom') {
            fetchAutoSubtitle(activeSubLang, seasonNum, epNum);
        }
    };

    // Force browser native track to show in torrent mode
    useEffect(() => {
        if (videoRef.current && videoRef.current.textTracks) {
            for (let i = 0; i < videoRef.current.textTracks.length; i++) {
                videoRef.current.textTracks[i].mode = 'showing';
            }
        }
    }, [subtitleUrl, streamData]);

    // Group episodes by season
    const seasonsList = [...new Set(episodes.map(ep => ep.season))].sort((a, b) => a - b);
    const currentSeasonEpisodes = episodes.filter(ep => ep.season === selectedSeason);

    // Active subtitle cue for on-screen overlay
    const activeCue = activeSubLang !== 'off' 
        ? subCues.find(c => currentVideoTime >= c.start && currentVideoTime <= c.end)
        : null;

    // Get Direct Stream URL
    // Server 1 (Default): VidSrc PM - Instant Fast Load + Subtitles on Screen (Adaptive up to 1080p)
    // Server 2: 2Embed FHD - Dedicated High Bitrate 1080p Stream
    // Server 3: MultiEmbed - Multi-source fallback
    const getDirectStreamUrl = () => {
        const imdb = movie.imdbCode;
        const isEpisodic = movie.type === 'series' || movie.type === 'anime';
        const isAnime = movie.type === 'anime';
        const animeQuery = isAnime ? '?dub=0&sub=1&audio=ja' : '';
        const animeAmp = isAnime ? '&dub=0&sub=1&audio=ja' : '';

        if (directServer === 1) {
            if (isEpisodic && imdb) {
                return `https://vidsrc.pm/embed/tv/${imdb}/${selectedSeason}/${selectedEpisode}${animeQuery}`;
            }
            if (imdb) {
                return `https://vidsrc.pm/embed/movie/${imdb}${animeQuery}`;
            }
            return `https://vidsrc.pm/embed/movie/${encodeURIComponent(movie.title)}${animeQuery}`;
        }

        if (directServer === 2) {
            // Dedicated 2Embed FHD 1080p Stream
            if (isEpisodic && imdb) {
                return `https://2embed.cc/embedtv/${imdb}&s=${selectedSeason}&e=${selectedEpisode}${animeAmp}`;
            }
            if (imdb) {
                return `https://2embed.cc/embed/${imdb}${animeAmp}`;
            }
            return `https://2embed.cc/embed/${encodeURIComponent(movie.title)}${animeAmp}`;
        }

        if (directServer === 3) {
            // MultiEmbed Backup Server
            if (isEpisodic && imdb) {
                return `https://multiembed.mov/?video_id=${imdb}&s=${selectedSeason}&e=${selectedEpisode}${animeAmp}`;
            }
            if (imdb) {
                return `https://multiembed.mov/?video_id=${imdb}${animeAmp}`;
            }
            return `https://multiembed.mov/?video_id=${encodeURIComponent(movie.title)}${animeAmp}`;
        }

        if (directServer === 4) {
            // EmbedMaster - Fast Aggregator with Strict Ad Sandbox
            if (isEpisodic && imdb) {
                return `https://embedmaster.link/tv/${imdb}/${selectedSeason}/${selectedEpisode}`;
            }
            if (imdb) {
                return `https://embedmaster.link/movie/${imdb}`;
            }
            return `https://embedmaster.link/movie/${encodeURIComponent(movie.title)}`;
        }

        return `https://vidsrc.pm/embed/movie/${imdb || encodeURIComponent(movie.title)}${animeQuery}`;
    };

    return (
        <div className="flex flex-col w-full max-w-6xl mx-auto p-2 sm:p-4 gap-4" dir={isRtl ? 'rtl' : 'ltr'}>
            {/* Top Navigation & Server Switcher */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <button 
                    onClick={onBack} 
                    className="flex items-center gap-2 text-gray-400 hover:text-white self-start transition-colors bg-[#181818] px-4 py-2 rounded-xl border border-[#272727]"
                >
                    {isRtl ? <ArrowRight size={18} /> : <ArrowLeft size={18} />}
                    <span className="font-semibold text-sm">{t?.backToHome || 'العودة للرئيسية'}</span>
                </button>

                {/* Server Mode Switcher */}
                <div className="flex items-center bg-[#151515] p-1 rounded-2xl border border-[#272727] shadow-inner">
                    <button
                        onClick={() => setPlayMode('direct')}
                        className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                            playMode === 'direct'
                                ? 'bg-red-600 text-white shadow-lg shadow-red-900/40'
                                : 'text-gray-400 hover:text-white'
                        }`}
                    >
                        <Zap size={16} />
                        <span>{t?.server1 || 'السيرفر 1 (الترجمة تظهر على الشاشة فوراً)'}</span>
                    </button>
                    <button
                        onClick={() => {
                            setPlayMode('torrent');
                            if (movie.type === 'anime' && selectedAnimeTorrent) {
                                startTorrentStream({ torrentUrl: selectedAnimeTorrent.torrentUrl });
                            } else if (movie.torrents?.[0]?.magnet) {
                                startTorrentStream({ magnet: movie.torrents[0].magnet });
                            }
                        }}
                        className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                            playMode === 'torrent'
                                ? 'bg-red-600 text-white shadow-lg shadow-red-900/40'
                                : 'text-gray-400 hover:text-white'
                        }`}
                    >
                        <Radio size={16} />
                        <span>{t?.torrentMode || 'بث التورنت (P2P)'}</span>
                    </button>
                </div>
            </div>

            {/* Server Quick Selector Bar */}
            {playMode === 'direct' && (
                <div className="bg-[#181818] border border-[#272727] rounded-2xl px-4 py-2.5 flex flex-wrap items-center justify-between gap-3 text-xs">
                    <div className="flex items-center gap-2 text-gray-300">
                        <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                        <span>
                            {t?.activeServer || 'السيرفر المفعّل:'} <strong className="text-white">{directServer === 1 ? (t?.server1Name || 'سيرفر 1 (الأساسي)') : directServer === 2 ? (t?.server2Name || 'سيرفر 2') : directServer === 3 ? (t?.server3Name || 'سيرفر 3') : (t?.server4Name || 'سيرفر 4')}</strong>
                        </span>
                        {directServer === 4 && (
                            <span className="bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 px-2 py-0.5 rounded-md text-[10px] font-bold flex items-center gap-1">
                                <ShieldCheck size={11} />
                                <span>حظر الإعلانات مفعل</span>
                            </span>
                        )}
                    </div>

                    <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="text-gray-400 text-[11px] ml-1">{t?.switchServer || 'تبديل السيرفر:'}</span>
                        <button
                            onClick={() => setDirectServer(1)}
                            className={`px-3 py-1 rounded-xl font-bold transition flex items-center gap-1 ${
                                directServer === 1 ? 'bg-red-600 text-white shadow' : 'bg-[#252525] text-gray-300 hover:bg-[#303030]'
                            }`}
                        >
                            <span>{t?.server1Name || 'سيرفر 1 (الأساسي)'}</span>
                            {directServer === 1 && <Check size={12} />}
                        </button>
                        <button
                            onClick={() => setDirectServer(2)}
                            className={`px-3 py-1 rounded-xl font-bold transition ${
                                directServer === 2 ? 'bg-red-600 text-white shadow' : 'bg-[#252525] text-gray-300 hover:bg-[#303030]'
                            }`}
                        >
                            {t?.server2Name || 'سيرفر 2'}
                        </button>
                        <button
                            onClick={() => setDirectServer(3)}
                            className={`px-3 py-1 rounded-xl font-bold transition ${
                                directServer === 3 ? 'bg-red-600 text-white shadow' : 'bg-[#252525] text-gray-300 hover:bg-[#303030]'
                            }`}
                        >
                            {t?.server3Name || 'سيرفر 3'}
                        </button>
                        <button
                            onClick={() => setDirectServer(4)}
                            className={`px-3 py-1 rounded-xl font-bold transition flex items-center gap-1 ${
                                directServer === 4 ? 'bg-emerald-600 text-white shadow' : 'bg-[#252525] text-gray-300 hover:bg-[#303030]'
                            }`}
                        >
                            <ShieldCheck size={13} className="text-emerald-300" />
                            <span>{t?.server4Name || 'سيرفر 4'}</span>
                            {directServer === 4 && <Check size={12} />}
                        </button>
                    </div>
                </div>
            )}

            {/* Helpful Quality Tip Banner */}
            {playMode === 'direct' && (
                <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-xl px-3.5 py-2 flex items-center justify-between gap-2 text-[11px] text-yellow-200/90">
                    <div className="flex items-center gap-2">
                        <Info size={14} className="text-yellow-400 shrink-0" />
                        <span>{t?.qualityTip || 'إذا شعرت أن الجودة أقل من 1080p: اضغط على ترس الإعدادات ⚙️ أسفل شاشة الفيديو واختر 1080p يدوياً، أو اختر سيرفر 2 / بث التورنت.'}</span>
                    </div>
                    <button 
                        onClick={() => setDirectServer(2)}
                        className="bg-yellow-500/20 hover:bg-yellow-500/30 text-yellow-300 font-bold px-2.5 py-1 rounded-lg transition text-[10px] whitespace-nowrap shrink-0"
                    >
                        {t?.server2Name || 'سيرفر 2 (جودة فائقة)'}
                    </button>
                </div>
            )}

            {/* YOUTUBE-STYLE VIDEO PLAYER CONTAINER */}
            <div 
                ref={playerContainerRef}
                className="group relative w-full aspect-video bg-black rounded-3xl overflow-hidden shadow-2xl border border-[#222222] select-none flex flex-col justify-between"
                onMouseEnter={() => setShowControls(true)}
                onMouseMove={() => {
                    setShowControls(true);
                    clearTimeout(controlsTimeoutRef.current);
                    controlsTimeoutRef.current = setTimeout(() => setShowControls(false), 3500);
                }}
            >
                {/* 1. YouTube-style Top Overlay Bar */}
                <div className={`absolute top-0 inset-x-0 z-30 p-4 bg-gradient-to-b from-black/80 via-black/40 to-transparent transition-opacity duration-300 pointer-events-none flex items-center justify-between ${showControls ? 'opacity-100' : 'opacity-0'}`}>
                    <div className="flex items-center gap-2.5 pointer-events-auto">
                        <div className="w-8 h-8 rounded-lg bg-red-600 flex items-center justify-center shadow-md">
                            <span className="text-white text-xs font-black">▶</span>
                        </div>
                        <div className="flex flex-col">
                            <span className="text-white font-bold text-sm sm:text-base drop-shadow-md truncate max-w-md">
                                {movie.title} {movie.type === 'series' && `• ${t?.season || 'الموسم'} ${selectedSeason} (${t?.episode || 'الحلقة'} ${selectedEpisode})`}
                            </span>
                            <span className="text-[11px] text-gray-300 font-medium">
                                Alaqra YouTube Player • {directServer === 1 ? (t?.server1Name || 'سيرفر 1') : directServer === 2 ? (t?.server2Name || 'سيرفر 2') : directServer === 3 ? (t?.server3Name || 'سيرفر 3') : (t?.server4Name || 'سيرفر 4')}
                            </span>
                        </div>
                    </div>

                    <div className="flex items-center gap-2 pointer-events-auto relative group/quality">
                        <div className="flex items-center gap-1.5 bg-black/70 backdrop-blur-md border border-white/20 px-3 py-1 rounded-xl text-[11px] font-bold text-white shadow-lg cursor-pointer hover:border-yellow-500/60 transition">
                            <span className={`w-2 h-2 rounded-full ${playMode === 'torrent' ? 'bg-green-400 animate-pulse' : 'bg-emerald-400'}`}></span>
                            <span>{playMode === 'torrent' ? (t?.qualityRaw1080 || '1080p FHD خام (P2P)') : (t?.qualityAutoFHD || 'Auto HD (حتى 1080p)')}</span>
                            <Settings size={12} className="text-gray-400 ml-0.5" />
                        </div>

                        {/* Quality Tooltip / Guidance popup on hover */}
                        <div className="absolute top-full mt-2 left-0 sm:right-0 sm:left-auto w-72 p-3 bg-[#181818]/95 backdrop-blur-md border border-[#383838] rounded-2xl text-[11px] text-gray-200 shadow-2xl opacity-0 group-hover/quality:opacity-100 transition-opacity pointer-events-none z-50 flex flex-col gap-1.5">
                            <div className="font-bold text-white flex items-center gap-1.5 text-xs border-b border-white/10 pb-1.5">
                                <Sparkles size={13} className="text-yellow-400" />
                                <span>{t?.qualityInfoTitle || 'تأكيد دقة 1080p'}</span>
                            </div>
                            <p className="text-gray-300 leading-relaxed text-[11px]">
                                {playMode === 'torrent'
                                    ? (t?.qualityP2PDesc || 'أنت تشاهد حالياً عبر ملف التورنت الأصلي بأعلى معدل بت (Bitrate) غير مضغوط وبدقة 1080p كاملة.')
                                    : (t?.qualityDirectDesc || 'البث المباشر يعمل بجودة تلقائية تتكيف مع سرعتك. لتثبيت 1080p: اضغط ⚙️ في المشغل، أو بدّل لسيرفر 2 أو بث التورنت.')}
                            </p>
                        </div>
                    </div>
                </div>

                {/* 2. Video Player Frame */}
                <div className="w-full h-full relative flex items-center justify-center">
                    {playMode === 'direct' ? (
                        <iframe
                            key={`${movie.id}-${selectedSeason}-${selectedEpisode}-${directServer}-${reloadKey}`}
                            src={getDirectStreamUrl()}
                            title={movie.title}
                            className="w-full h-full border-0"
                            allowFullScreen
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
                            sandbox="allow-scripts allow-same-origin allow-forms allow-presentation"
                            referrerPolicy="no-referrer"
                        />
                    ) : (
                        loading ? (
                            <div className="flex flex-col items-center gap-4 text-center px-4">
                                <Loader2 size={50} className="animate-spin text-red-500" />
                                <div className="flex flex-col gap-1">
                                    <p className="text-lg font-bold text-white">{t?.buffering || 'جاري التخزين المؤقت (Buffering)...'}</p>
                                    <p className="text-xs text-gray-400">{t?.bufferingDesc || 'يبدأ التشغيل تدريجياً دون تحميل الفيلم كاملاً'}</p>
                                </div>
                            </div>
                        ) : error ? (
                            <div className="flex flex-col items-center gap-4 text-center px-6 max-w-md">
                                <AlertCircle size={44} className="text-red-500" />
                                <p className="text-white font-semibold text-sm">{error}</p>
                                <button
                                    onClick={() => setPlayMode('direct')}
                                    className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-5 py-2.5 rounded-xl text-xs font-bold transition shadow-lg"
                                >
                                    <Zap size={16} />
                                    <span>{t?.switchToDirect || 'التحويل للسيرفر 1 المباشر (موصى به)'}</span>
                                </button>
                            </div>
                        ) : streamData ? (
                            <div className="relative w-full h-full flex items-center justify-center">
                                <video 
                                    ref={videoRef}
                                    controls 
                                    autoPlay 
                                    className="w-full h-full object-contain"
                                    crossOrigin="anonymous"
                                    onTimeUpdate={(e) => setCurrentVideoTime(e.target.currentTime)}
                                >
                                    <source src={streamData.streamUrl} type="video/mp4" />
                                    {subtitleUrl && activeSubLang !== 'off' && (
                                        <track 
                                            kind="subtitles" 
                                            src={subtitleUrl} 
                                            srcLang={activeSubLang === 'ara' ? 'ar' : 'en'} 
                                            label={activeSubLang === 'ara' ? 'العربية' : 'English'} 
                                            default 
                                        />
                                    )}
                                </video>

                                {/* Live Subtitle Overlay in Torrent Mode */}
                                {activeCue && (
                                    <div className="absolute bottom-16 left-4 right-4 text-center pointer-events-none z-30 select-none">
                                        <span 
                                            className="inline-block bg-black/85 text-yellow-300 font-bold px-4 py-1.5 rounded-xl text-lg sm:text-2xl shadow-2xl tracking-wide font-sans leading-relaxed border border-yellow-500/20"
                                            style={{ textShadow: '0 2px 5px rgba(0,0,0,0.95)' }}
                                        >
                                            {activeCue.text}
                                        </span>
                                    </div>
                                )}
                            </div>
                        ) : null
                    )}
                </div>
            </div>

            {/* YOUTUBE WATCH PAGE: Title, Channel Bar & Japanese Audio Pill */}
            <div className="bg-[#181818] border border-[#272727] rounded-3xl p-5 flex flex-col gap-4 shadow-xl select-none">
                {/* Video Title & Audio Mode Badge */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#262626] pb-4">
                    <div className="flex flex-col gap-1">
                        <h1 className="text-xl sm:text-2xl font-black text-white">
                            {movie.title}
                        </h1>
                        {(movie.type === 'series' || movie.type === 'anime') && (
                            <span className="text-xs text-red-400 font-semibold">
                                {t?.season || 'الموسم'} {selectedSeason} • {t?.episode || 'الحلقة'} {selectedEpisode}
                            </span>
                        )}
                    </div>

                    {/* Japanese Audio Indicator Pill */}
                    {movie.type === 'anime' && (
                        <div className="flex items-center gap-2 bg-gradient-to-r from-purple-950/60 to-indigo-950/60 border border-purple-500/40 px-3.5 py-1.5 rounded-2xl shadow-inner self-start sm:self-center">
                            <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></span>
                            <Volume2 size={15} className="text-purple-300" />
                            <span className="text-xs font-bold text-purple-200">
                                {t?.originalJpAudio || 'الصوت: ياباني أصلي 🇯🇵'}
                            </span>
                        </div>
                    )}
                </div>

                {/* YouTube Channel Row: Avatar + Name + Subscribers + Subscribe Button */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-3.5">
                        {/* Channel Avatar */}
                        <div 
                            onClick={() => onSelectChannel && onSelectChannel(channel)}
                            className={`w-12 h-12 rounded-full bg-gradient-to-tr ${channel.color} flex items-center justify-center text-xs font-black text-white shadow-lg cursor-pointer hover:scale-105 transition-transform ring-2 ring-white/10 shrink-0`}
                        >
                            {channel.avatarText}
                        </div>

                        {/* Channel Details */}
                        <div className="flex flex-col">
                            <div 
                                onClick={() => onSelectChannel && onSelectChannel(channel)}
                                className="flex items-center gap-1.5 cursor-pointer hover:underline"
                            >
                                <span className="font-bold text-white text-sm sm:text-base">
                                    {channelName}
                                </span>
                                {channel.verified && (
                                    <CheckCircle2 size={15} className="text-gray-400 fill-white" />
                                )}
                            </div>
                            <span className="text-xs text-gray-400">
                                {channel.subscribers} {t?.subscribers || 'مشترك'}
                            </span>
                        </div>
                    </div>

                    {/* YouTube Subscribe Button */}
                    <button
                        onClick={toggleSubscribe}
                        className={`flex items-center justify-center gap-2 px-5 py-2 rounded-full text-xs font-bold transition shadow-md self-start sm:self-center ${
                            isSubscribed
                                ? 'bg-[#2a2a2a] hover:bg-[#333333] text-gray-200'
                                : 'bg-red-600 hover:bg-red-700 text-white shadow-red-900/40'
                        }`}
                    >
                        {isSubscribed ? (
                            <>
                                <Bell size={14} className="fill-gray-200" />
                                <span>{t?.subscribed || 'مشترك ✓'}</span>
                            </>
                        ) : (
                            <span>{t?.subscribe || 'اشتراك'}</span>
                        )}
                    </button>
                </div>

                {/* More from this channel (Horizontal List) */}
                {allMovies && allMovies.length > 0 && (
                    <div className="mt-2 pt-3 border-t border-[#242424] flex flex-col gap-2.5">
                        <span className="text-xs font-bold text-gray-400">
                            {t?.moreFromChannel || 'المزيد من هذه القناة'}:
                        </span>
                        <div className="flex items-center gap-3 overflow-x-auto pb-2 no-scrollbar">
                            {allMovies
                                .filter(m => m.id !== movie.id && getChannelForMovie(m)?.id === channel?.id)
                                .slice(0, 10)
                                .map(relMovie => (
                                    <div
                                        key={relMovie.id}
                                        onClick={() => onPlayOtherMovie && onPlayOtherMovie(relMovie)}
                                        className="flex items-center gap-2.5 bg-[#202020] hover:bg-[#2a2a2a] p-2 rounded-2xl cursor-pointer border border-[#2b2b2b] hover:border-red-500/50 transition-all shrink-0 w-56 group"
                                    >
                                        <img 
                                            src={relMovie.poster} 
                                            alt={relMovie.title}
                                            className="w-10 h-14 object-cover rounded-xl shrink-0" 
                                        />
                                        <div className="flex flex-col overflow-hidden">
                                            <span className="text-xs font-bold text-white truncate group-hover:text-red-400">
                                                {relMovie.title}
                                            </span>
                                            <span className="text-[10px] text-gray-400">
                                                {relMovie.year} {relMovie.type === 'series' ? '• مسلسل' : relMovie.type === 'anime' ? '• أنمي' : '• فيلم'}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                        </div>
                    </div>
                )}
            </div>

            {/* SUBTITLE MENU BAR - Matched Exactly to User's Uploaded Picture */}
            <div className="bg-[#181818] border border-[#272727] rounded-2xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 select-none">
                {/* Right Side: Title & Status with Red Icon */}
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-red-950/40 border border-red-600/30 text-red-500 flex items-center justify-center shrink-0 shadow-inner">
                        <Globe size={22} className="text-red-500" />
                    </div>
                    <div>
                        <span className="text-sm font-bold text-white block">{t?.subLanguage || 'لغة الترجمة:'}</span>
                        <div className="flex items-center gap-1.5 text-xs text-gray-400">
                            {loadingSub ? (
                                <span className="flex items-center gap-1 text-yellow-400">
                                    <Loader2 size={12} className="animate-spin" />
                                    <span>{t?.connectingSub || 'جاري الاتصال بقاعدة الترجمة...'}</span>
                                </span>
                            ) : (
                                <span className="text-gray-300">
                                    {subtitleStatus ? `✓ ${subtitleStatus}` : (t?.chooseSubLang || 'اختر لغة ليتم تفعيلها تلقائياً')}
                                </span>
                            )}
                        </div>
                    </div>
                </div>

                {/* Left Side: Buttons in Exact Pill Styling */}
                <div className="flex items-center gap-2 flex-wrap">
                    {/* Arabic Auto Button */}
                    <button
                        onClick={() => handleLanguageChange('ara')}
                        className={`flex items-center gap-2 px-5 py-2 rounded-xl text-xs font-bold transition shadow-md ${
                            activeSubLang === 'ara'
                                ? 'bg-red-600 hover:bg-red-700 text-white shadow-red-950/60 ring-2 ring-red-500/30'
                                : 'bg-[#222222] hover:bg-[#2c2c2c] text-gray-200 border border-[#333333]'
                        }`}
                    >
                        {activeSubLang === 'ara' && <Check size={14} className="stroke-[3]" />}
                        <span>{t?.arabicAuto || 'عربي (تلقائي)'}</span>
                        <span className="text-[10px] opacity-80 uppercase font-mono">SA</span>
                    </button>

                    {/* English Auto Button */}
                    <button
                        onClick={() => handleLanguageChange('eng')}
                        className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition ${
                            activeSubLang === 'eng'
                                ? 'bg-red-600 hover:bg-red-700 text-white shadow-red-950/60 ring-2 ring-red-500/30'
                                : 'bg-[#222222] hover:bg-[#2c2c2c] text-gray-200 border border-[#333333]'
                        }`}
                    >
                        {activeSubLang === 'eng' && <Check size={14} className="stroke-[3]" />}
                        <span>{t?.englishAuto || 'English (Auto)'}</span>
                        <span className="text-[10px] opacity-80 uppercase font-mono">GB</span>
                    </button>

                    {/* Disable Subtitles */}
                    <button
                        onClick={() => handleLanguageChange('off')}
                        className={`px-4 py-2 rounded-xl text-xs font-bold transition border ${
                            activeSubLang === 'off'
                                ? 'bg-gray-800 text-white border-gray-600'
                                : 'bg-[#222222] hover:bg-[#2c2c2c] text-gray-400 border-[#333333]'
                        }`}
                    >
                        {t?.subOff || 'إيقاف'}
                    </button>

                    {/* Upload Custom (.srt / .vtt) */}
                    <input 
                        type="file" 
                        ref={fileInputRef} 
                        onChange={handleFileUpload} 
                        accept=".srt,.vtt" 
                        className="hidden" 
                    />
                    <button
                        onClick={() => fileInputRef.current?.click()}
                        className="flex items-center gap-1.5 px-4 py-2 bg-[#222222] hover:bg-[#2c2c2c] text-gray-300 border border-[#333333] rounded-xl text-xs font-semibold transition"
                        title={t?.uploadCustomSub || 'رفع ملف ترجمة من جهازك'}
                    >
                        <Upload size={13} />
                        <span>{t?.uploadSub || 'رفع (.srt)'}</span>
                    </button>

                    {/* External Link */}
                    <a
                        href={`https://www.opensubtitles.org/ar/search/sublanguageid-ara/moviename-${encodeURIComponent(movie.title)}`}
                        target="_blank"
                        rel="noreferrer"
                        className="p-2 bg-[#222222] hover:bg-[#2c2c2c] text-gray-400 border border-[#333333] rounded-xl transition"
                        title={t?.externalSubSearch || 'البحث الخارجي في OpenSubtitles'}
                    >
                        <ExternalLink size={14} />
                    </a>
                </div>
            </div>

            {/* SERIES & ANIME EPISODES SECTION: Season & Episode Splitting */}
            {(movie.type === 'series' || movie.type === 'anime') && (
                <div className="bg-[#181818] border border-[#272727] rounded-3xl p-5 flex flex-col gap-4">
                    <div className="flex items-center justify-between border-b border-[#282828] pb-3">
                        <div className="flex items-center gap-2">
                            {movie.type === 'anime' ? <Film size={20} className="text-purple-400" /> : <Tv size={20} className="text-emerald-400" />}
                            <h3 className="text-base font-bold text-white">
                                {movie.type === 'anime' ? (t?.animeEpisodesAndSeasons || 'قائمة حلقات ومواسم الأنمي:') : (t?.episodesAndSeasons || 'قائمة الحلقات والمواسم:')}
                            </h3>
                        </div>
                        <span className="text-xs text-gray-400">
                            {t?.currentEp || 'الحلقة الحالية:'} <strong className="text-white">{t?.season || 'الموسم'} {selectedSeason} • {t?.episode || 'الحلقة'} {selectedEpisode}</strong>
                        </span>
                    </div>

                    {loadingEpisodes ? (
                        <div className="flex items-center justify-center py-10 gap-2 text-gray-400">
                            <Loader2 size={24} className="animate-spin text-red-500" />
                            <span className="text-xs">{t?.loadingEpisodes || 'جاري تحميل قائمة الحلقات...'}</span>
                        </div>
                    ) : episodes.length === 0 ? (
                        <p className="text-xs text-gray-500 py-4">{t?.noEpisodes || 'لم تتوفر قائمة تفصيلية للحلقات، يمكنك استخدام البث المباشر.'}</p>
                    ) : (
                        <>
                            {/* Season Selector Tabs */}
                            {seasonsList.length > 1 && (
                                <div className="flex items-center gap-2 overflow-x-auto pb-2">
                                    {seasonsList.map(seasonNum => (
                                        <button
                                            key={seasonNum}
                                            onClick={() => setSelectedSeason(seasonNum)}
                                            className={`px-4 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap ${
                                                selectedSeason === seasonNum
                                                    ? 'bg-emerald-600 text-white shadow-md shadow-emerald-950'
                                                    : 'bg-[#222222] text-gray-300 hover:bg-[#2c2c2c]'
                                            }`}
                                        >
                                            {t?.season || 'الموسم'} {seasonNum}
                                        </button>
                                    ))}
                                </div>
                            )}

                            {/* Episodes Grid / List */}
                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2.5 max-h-72 overflow-y-auto pr-1">
                                {currentSeasonEpisodes.map(ep => {
                                    const isCurrent = ep.season === selectedSeason && ep.number === selectedEpisode;
                                    return (
                                        <button
                                            key={ep.id}
                                            onClick={() => handleEpisodeSelect(ep.season, ep.number)}
                                            className={`flex flex-col p-3 rounded-2xl border ${isRtl ? 'text-right' : 'text-left'} transition group relative overflow-hidden ${
                                                isCurrent
                                                    ? 'bg-red-950/60 border-red-600 text-white shadow-lg'
                                                    : 'bg-[#202020] hover:bg-[#282828] border-[#2c2c2c] text-gray-300'
                                            }`}
                                        >
                                            <div className="flex items-center justify-between w-full mb-1">
                                                <span className={`text-xs font-black ${isCurrent ? 'text-red-400' : 'text-gray-400'}`}>
                                                    {t?.episode || 'الحلقة'} {ep.number}
                                                </span>
                                                <PlayCircle size={14} className={isCurrent ? 'text-red-400' : 'text-gray-600 group-hover:text-white'} />
                                            </div>
                                            <span className="text-[11px] font-semibold truncate w-full text-white">
                                                {ep.name || `${t?.episode || 'الحلقة'} ${ep.number}`}
                                            </span>
                                            {ep.airdate && (
                                                <span className="text-[10px] text-gray-500 mt-1">
                                                    {ep.airdate}
                                                </span>
                                            )}
                                        </button>
                                    );
                                })}
                            </div>
                        </>
                    )}
                </div>
            )}

            {/* Anime Releases / Torrents from Nyaa */}
            {movie.type === 'anime' && animeTorrents.length > 0 && (
                <div className="bg-[#181818] border border-[#272727] rounded-3xl p-5">
                    <h3 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
                        <Film size={16} className="text-purple-400" />
                        <span>{t?.animeTorrentsTitle || 'إصدارات وحلقات الأنمي من Nyaa.si:'}</span>
                    </h3>
                    <div className="flex flex-col gap-2 max-h-56 overflow-y-auto pr-1">
                        {animeTorrents.map((tor, idx) => (
                            <div 
                                key={idx}
                                onClick={() => {
                                    setSelectedAnimeTorrent(tor);
                                    setPlayMode('torrent');
                                    startTorrentStream({ torrentUrl: tor.torrentUrl });
                                }}
                                className={`flex items-center justify-between p-2.5 rounded-xl cursor-pointer border transition ${
                                    selectedAnimeTorrent?.torrentUrl === tor.torrentUrl
                                        ? 'bg-purple-950/40 border-purple-600'
                                        : 'bg-[#202020] hover:bg-[#282828] border-[#2e2e2e]'
                                }`}
                            >
                                <div className="flex items-center gap-2 overflow-hidden">
                                    <PlayCircle size={16} className="text-purple-400 shrink-0" />
                                    <span className="text-xs text-white truncate">{tor.title}</span>
                                </div>
                                <div className="flex items-center gap-2.5 text-[11px] text-gray-400 shrink-0">
                                    <span className="bg-purple-950/60 border border-purple-500/30 text-purple-300 px-2 py-0.5 rounded text-[10px] font-bold">
                                        🇯🇵 صوت ياباني
                                    </span>
                                    <span className="bg-[#121212] px-2 py-0.5 rounded text-gray-300 font-mono">{tor.size}</span>
                                    <span className="text-green-400 font-semibold">{tor.seeders} {t?.seeders || 'موزّع'}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Movie / Series Info */}
            <div className="bg-[#181818] border border-[#272727] rounded-3xl p-6 flex flex-col gap-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <h1 className="text-2xl font-black text-white">{movie.title}</h1>
                    <div className="flex items-center gap-3 text-sm text-gray-400">
                        <span>{t?.releaseYear || 'سنة الإنتاج:'} {movie.year}</span>
                        {movie.rating && (
                            <span className="bg-yellow-500/10 text-yellow-400 border border-yellow-500/30 px-2.5 py-0.5 rounded-lg text-xs font-bold">
                                ★ {movie.rating}
                            </span>
                        )}
                    </div>
                </div>
                
                <p className="text-gray-300 text-sm leading-relaxed mt-2">
                    {movie.summary || (t?.noSummary || 'لا يوجد وصف متاح لهذا العمل.')}
                </p>
            </div>
        </div>
    );
}
