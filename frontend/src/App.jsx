import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Navbar from './components/Navbar';
import MovieCard from './components/MovieCard';
import VideoPlayer from './components/VideoPlayer';
import ChannelsBar from './components/ChannelsBar';
import ChannelView from './components/ChannelView';
import FeaturedHero from './components/FeaturedHero';
import BottomNav from './components/BottomNav';
import { CHANNELS } from './data/channels';
import { useLocalStorage } from './hooks/useLocalStorage';
import { translations } from './locales/translations';
import { Film, Tv, Sparkles, Clock, AlertCircle, Layers, CheckCircle2 } from 'lucide-react';
import { fetchMovies, fetchSeries, fetchAnime } from './services/api';

function App() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeItem, setActiveItem] = useState(null);
  const [activeTab, setActiveTab] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedChannel, setSelectedChannel] = useState(null);
  const [watchHistory, setWatchHistory] = useLocalStorage('alaqra_watch_history', []);
  
  // Bilingual UI state
  const [uiLang, setUiLang] = useLocalStorage('ui_lang', 'ar');
  const t = translations[uiLang] || translations.ar;
  const isRtl = uiLang === 'ar';

  // Clean alphanumeric normalized title for deduplication
  const normalizeTitle = (str = '') => {
    return (str || '')
      .toLowerCase()
      .replace(/\(.*?\)/g, '')
      .replace(/[^a-z0-9\u0600-\u06FF]/g, '')
      .trim();
  };

  const deduplicateMedia = (mediaList = []) => {
    const seenTitles = new Set();
    const seenImdb = new Set();
    const result = [];

    // Prioritize anime entries so anime shows remain categorized under 'anime'
    const sorted = [...mediaList].sort((a, b) => {
      if (a.type === 'anime' && b.type !== 'anime') return -1;
      if (b.type === 'anime' && a.type !== 'anime') return 1;
      return 0;
    });

    for (const item of sorted) {
      if (!item || !item.title) continue;
      const norm = normalizeTitle(item.title);
      const imdb = item.imdbCode ? item.imdbCode.trim().toLowerCase() : null;

      if (norm && seenTitles.has(norm)) continue;
      if (imdb && seenImdb.has(imdb)) continue;

      if (norm) seenTitles.add(norm);
      if (imdb) seenImdb.add(imdb);

      result.push(item);
    }

    return result;
  };

  // Fetch content based on query and active tab
  const fetchData = async (query = '', tab = activeTab) => {
    setLoading(true);
    try {
      if (tab === 'history') {
        setItems(deduplicateMedia(watchHistory));
        setLoading(false);
        return;
      }

      if (tab === 'movies') {
        const results = await fetchMovies(query);
        setItems(deduplicateMedia(results));
      } else if (tab === 'series') {
        const results = await fetchSeries(query);
        setItems(deduplicateMedia(results));
      } else if (tab === 'anime') {
        const results = await fetchAnime(query);
        setItems(deduplicateMedia(results));
      } else {
        // 'all' or 'channels': fetch movies, series, and anime in parallel
        const [moviesList, seriesList, animeList] = await Promise.all([
          fetchMovies(query),
          fetchSeries(query),
          fetchAnime(query)
        ]);

        // Mix evenly
        const combined = [];
        const maxLen = Math.max(moviesList.length, seriesList.length, animeList.length);
        for (let i = 0; i < maxLen; i++) {
          if (animeList[i]) combined.push(animeList[i]);
          if (moviesList[i]) combined.push(moviesList[i]);
          if (seriesList[i]) combined.push(seriesList[i]);
        }
        setItems(deduplicateMedia(combined));
      }
    } catch (err) {
      console.error('Error fetching data:', err);
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData(searchQuery, activeTab);
  }, [activeTab]);

  const handleSearch = (q) => {
    setSearchQuery(q);
    setSelectedChannel(null);
    fetchData(q, activeTab);
  };

  const handlePlayItem = (item) => {
    setActiveItem(item);
    // Add to history without DB
    const updated = [item, ...watchHistory.filter(m => m.id !== item.id)].slice(0, 30);
    setWatchHistory(updated);
  };

  const clearHistory = () => {
    setWatchHistory([]);
    if (activeTab === 'history') {
      setItems([]);
    }
  };

  return (
    <div className="min-h-screen bg-[#09090b] text-white font-sans antialiased flex flex-col relative overflow-x-hidden selection:bg-red-600 selection:text-white" dir={isRtl ? 'rtl' : 'ltr'}>
      {/* Ambient Cinematic Light Glows */}
      <div className="fixed top-0 left-1/4 w-80 sm:w-96 h-80 sm:h-96 bg-red-600/10 rounded-full blur-[120px] pointer-events-none -z-10" />
      <div className="fixed bottom-1/3 right-10 w-80 sm:w-96 h-80 sm:h-96 bg-purple-600/10 rounded-full blur-[140px] pointer-events-none -z-10" />

      {!activeItem && (
        <Navbar 
          onSearch={handleSearch} 
          activeTab={activeTab} 
          setActiveTab={(tab) => {
            setSelectedChannel(null);
            setActiveTab(tab);
          }}
          uiLang={uiLang}
          setUiLang={setUiLang}
          t={t}
          onSelectMovie={handlePlayItem}
        />
      )}
      
      <main className="flex-1 px-3 sm:px-6 py-3 sm:py-6 max-w-7xl mx-auto w-full pb-24 sm:pb-10">
        {activeItem ? (
          <VideoPlayer 
            movie={activeItem} 
            onBack={() => setActiveItem(null)} 
            allMovies={items}
            onPlayOtherMovie={handlePlayItem}
            onSelectChannel={(ch) => {
              setActiveItem(null);
              setSelectedChannel(ch);
            }}
            uiLang={uiLang}
            t={t}
          />
        ) : selectedChannel ? (
          <ChannelView 
            channel={selectedChannel} 
            movies={items} 
            onPlayMovie={handlePlayItem} 
            onBack={() => setSelectedChannel(null)} 
            uiLang={uiLang} 
            t={t} 
          />
        ) : (
          <div className="flex flex-col gap-4 sm:gap-6">
            {/* Cinematic Featured Billboard Hero (visible on main feeds when not searching) */}
            {!searchQuery && activeTab !== 'history' && activeTab !== 'channels' && items.length > 0 && (
              <FeaturedHero 
                movies={items} 
                onPlay={handlePlayItem} 
                onSelectChannel={(ch) => setSelectedChannel(ch)} 
                uiLang={uiLang} 
                t={t} 
              />
            )}

            {/* YouTube-style Horizontal Channels Filter Bar */}
            {activeTab !== 'history' && (
              <ChannelsBar 
                selectedChannel={selectedChannel} 
                onSelectChannel={(ch) => setSelectedChannel(ch)} 
                uiLang={uiLang} 
                t={t} 
              />
            )}

            {/* If tab is 'channels', show Channel Hub Cards Grid */}
            {activeTab === 'channels' ? (
              <div className="flex flex-col gap-4">
                <div className="flex items-center gap-2">
                  <Layers size={22} className="text-red-500" />
                  <h2 className="text-xl sm:text-2xl font-bold tracking-tight">
                    {t.allChannels}
                  </h2>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {CHANNELS.map(ch => {
                    const chName = typeof ch.name === 'string' ? ch.name : (ch.name?.en || ch.name?.ar);
                    const chDesc = ch.description[uiLang] || ch.description.ar;
                    return (
                      <div
                        key={ch.id}
                        onClick={() => setSelectedChannel(ch)}
                        className="bg-[#181818] hover:bg-[#202020] p-5 rounded-3xl border border-[#272727] hover:border-red-500/50 cursor-pointer transition-all flex flex-col gap-3 group shadow-lg"
                      >
                        <div className="flex items-center gap-3">
                          <div className={`w-14 h-14 rounded-2xl bg-gradient-to-tr ${ch.color} flex items-center justify-center text-white font-black text-base shadow-md group-hover:scale-105 transition-transform shrink-0 ring-2 ring-white/10`}>
                            {ch.avatarText}
                          </div>
                          <div className="flex flex-col overflow-hidden">
                            <div className="flex items-center gap-1.5">
                              <span className="font-bold text-white text-sm group-hover:text-red-400 truncate">
                                {chName}
                              </span>
                              {ch.verified && <CheckCircle2 size={13} className="text-gray-400 fill-white shrink-0" />}
                            </div>
                            <span className="text-[11px] font-mono text-gray-400">{ch.handle}</span>
                            <span className="text-[11px] text-gray-300 font-bold">{ch.subscribers} {t.subscribers}</span>
                          </div>
                        </div>

                        <p className="text-xs text-gray-400 line-clamp-2 leading-relaxed">
                          {chDesc}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : (
              <>
                {/* Header / Title */}
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5 flex-wrap">
                    {activeTab === 'movies' && <Film className="text-red-500" size={24} />}
                    {activeTab === 'series' && <Tv className="text-emerald-400" size={24} />}
                    {activeTab === 'anime' && <Sparkles className="text-purple-400" size={24} />}
                    {activeTab === 'history' && <Clock className="text-blue-400" size={24} />}
                    <h2 className="text-lg sm:text-2xl font-bold tracking-tight">
                      {activeTab === 'history' 
                        ? t.watchHistoryTitle 
                        : searchQuery 
                          ? `${t.searchResultsFor} "${searchQuery}"` 
                          : activeTab === 'movies' 
                            ? t.latestMovies 
                            : activeTab === 'series' 
                              ? t.seriesAndEpisodes 
                              : activeTab === 'anime' 
                                ? t.popularAnime 
                                : t.latestAndRecommended}
                    </h2>
                    {!loading && items.length > 0 && (
                      <span className="text-[11px] bg-white/10 text-gray-300 font-bold px-2 py-0.5 rounded-full border border-white/10">
                        {items.length}
                      </span>
                    )}
                  </div>

                  {activeTab === 'history' && watchHistory.length > 0 && (
                    <button 
                      onClick={clearHistory}
                      className="text-xs text-red-400 hover:text-red-300 font-semibold bg-red-950/40 border border-red-800/40 px-3 py-1.5 rounded-xl transition"
                    >
                      {t.clearHistory}
                    </button>
                  )}
                </div>
                
                {/* Content Display */}
                {loading ? (
                  <div className="flex flex-col items-center justify-center py-24 gap-3">
                    <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-red-600"></div>
                    <span className="text-xs text-gray-400">{t.loading}</span>
                  </div>
                ) : items.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-20 text-gray-400 gap-3">
                    <AlertCircle size={40} className="text-gray-600" />
                    <p className="text-base font-semibold">{t.noResults}</p>
                    {activeTab === 'history' && (
                      <p className="text-xs text-gray-500">{t.noHistory}</p>
                    )}
                  </div>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-5">
                    {items.map(item => (
                      <MovieCard 
                        key={item.id} 
                        movie={item} 
                        onPlay={handlePlayItem} 
                        onSelectChannel={(ch) => setSelectedChannel(ch)}
                        uiLang={uiLang}
                        t={t}
                      />
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        )}
      </main>

      {/* Footer with Developer Link */}
      {!activeItem && !selectedChannel && (
        <footer className="border-t border-white/5 bg-[#08080a] py-6 px-4 text-center text-xs text-gray-500 mt-auto flex flex-col items-center gap-2 mb-16 sm:mb-0">
          <p className="font-bold text-gray-300 text-sm tracking-wide">{t.footerTitle}</p>
          <p className="text-gray-400 max-w-xl">{t.footerDesc}</p>
          <div className="flex items-center gap-1.5 mt-2 text-gray-400">
            <span>{t.developedBy}</span>
            <a 
              href="https://alaqra.dev" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="text-red-500 hover:text-red-400 font-bold underline transition tracking-wider"
            >
              alaqra.dev
            </a>
          </div>
        </footer>
      )}

      {/* Mobile-First Bottom Navigation Bar */}
      {!activeItem && (
        <BottomNav 
          activeTab={activeTab} 
          setActiveTab={(tab) => {
            setSelectedChannel(null);
            setActiveTab(tab);
          }} 
          onSelectChannel={setSelectedChannel} 
          t={t} 
        />
      )}
    </div>
  );
}

export default App;
