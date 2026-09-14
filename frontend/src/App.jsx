import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Navbar from './components/Navbar';
import MovieCard from './components/MovieCard';
import VideoPlayer from './components/VideoPlayer';
import FeaturedHero from './components/FeaturedHero';
import BottomNav from './components/BottomNav';
import { useLocalStorage } from './hooks/useLocalStorage';
import { translations } from './locales/translations';
import { Film, Tv, Sparkles, Clock, AlertCircle } from 'lucide-react';
import { fetchMovies, fetchSeries, fetchAnime, fetchKDrama } from './services/api';

function App() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeItem, setActiveItem] = useState(null);
  const [activeTab, setActiveTab] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [watchHistory, setWatchHistory] = useLocalStorage('alaqra_watch_history', []);
  const [displayLimit, setDisplayLimit] = useState(24);
  
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

    // Prioritize anime and kdrama entries so they remain categorized properly
    const sorted = [...mediaList].sort((a, b) => {
      if ((a.type === 'anime' || a.type === 'kdrama') && b.type === 'series') return -1;
      if ((b.type === 'anime' || b.type === 'kdrama') && a.type === 'series') return 1;
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
      } else if (tab === 'kdrama') {
        const results = await fetchKDrama(query);
        setItems(deduplicateMedia(results));
      } else {
        // 'all': fetch movies, series, anime, and kdrama in parallel
        const [moviesList, seriesList, animeList, kdramaList] = await Promise.all([
          fetchMovies(query),
          fetchSeries(query),
          fetchAnime(query),
          fetchKDrama(query)
        ]);

        // Mix evenly
        const combined = [];
        const maxLen = Math.max(moviesList.length, seriesList.length, animeList.length, kdramaList.length);
        for (let i = 0; i < maxLen; i++) {
          if (kdramaList[i]) combined.push(kdramaList[i]);
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
    setDisplayLimit(24);
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
    <div className="min-h-screen bg-[#09090b] bg-[radial-gradient(ellipse_80%_80%_at_50%_-15%,rgba(220,38,38,0.1),rgba(255,255,255,0))] text-white font-sans antialiased flex flex-col relative overflow-x-hidden selection:bg-red-600 selection:text-white" dir={isRtl ? 'rtl' : 'ltr'}>
      {!activeItem && (
        <Navbar 
          onSearch={handleSearch} 
          activeTab={activeTab} 
          setActiveTab={(tab) => {
            setDisplayLimit(24);
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
            uiLang={uiLang}
            t={t}
          />
        ) : (
          <div className="flex flex-col gap-4 sm:gap-6">
            {/* Cinematic Featured Billboard Hero (visible on main feeds when not searching) */}
            {!searchQuery && activeTab !== 'history' && items.length > 0 && (
              <FeaturedHero 
                movies={items} 
                onPlay={handlePlayItem} 
                uiLang={uiLang} 
                t={t} 
              />
            )}

            {/* Header / Title */}
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5 flex-wrap">
                {activeTab === 'movies' && <Film className="text-red-500" size={24} />}
                {activeTab === 'series' && <Tv className="text-emerald-400" size={24} />}
                {activeTab === 'anime' && <Sparkles className="text-purple-400" size={24} />}
                {activeTab === 'kdrama' && <Sparkles className="text-pink-400" size={24} />}
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
                            : activeTab === 'kdrama'
                              ? (t.popularKdrama || 'أشهر المسلسلات والدراما الكورية')
                              : t.latestAndRecommended}
                </h2>
                {!loading && items.length > 0 && (
                  <span className="text-[11px] bg-white/10 text-gray-300 font-bold px-2 py-0.5 rounded-full border border-white/10">
                    {items.length}
                  </span>
                )}
              </div>

              {activeTab === 'history' && items.length > 0 && (
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
              <div className="flex flex-col gap-6">
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-5">
                  {items.slice(0, displayLimit).map(item => (
                    <MovieCard 
                      key={item.id} 
                      movie={item} 
                      onPlay={handlePlayItem} 
                      uiLang={uiLang}
                      t={t}
                    />
                  ))}
                </div>

                {/* Lightweight Load More Button */}
                {items.length > displayLimit && (
                  <div className="flex justify-center pt-2 pb-2">
                    <button
                      onClick={() => setDisplayLimit(prev => prev + 24)}
                      className="px-6 py-2.5 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs sm:text-sm font-bold text-gray-200 hover:text-white transition active:scale-95 shadow-md flex items-center gap-2"
                    >
                      <span>{uiLang === 'ar' ? 'عرض المزيد من الأعمال' : 'Load More Titles'}</span>
                      <span className="text-[10px] bg-white/10 px-2 py-0.5 rounded-full text-gray-400 font-mono">
                        +{Math.min(24, items.length - displayLimit)}
                      </span>
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </main>

      {/* Footer with Developer Link */}
      {!activeItem && (
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
            setDisplayLimit(24);
            setActiveTab(tab);
          }} 
          t={t} 
        />
      )}
    </div>
  );
}

export default App;
