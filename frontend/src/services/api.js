import axios from 'axios';
import { POPULAR_ANIME_CATALOG } from '../data/animeCatalog';
import { POPULAR_MOVIES_CATALOG } from '../data/fallbackMovies';
import { POPULAR_KDRAMA_CATALOG } from '../data/kdramaCatalog';

export const API_BASE = import.meta.env.VITE_API_URL || '';

// Strict Adult / NSFW Content Filter
const ADULT_GENRES = new Set(['Adult', 'Erotica', 'Pornography', 'Hentai', 'Ecchi', 'Sex']);
const ADULT_REGEX = /\b(xxx|porn|pornstar|erotic|erotica|sex|sexy|adult|nude|nudity|naked|stripper|blowjob|masturbat|gangbang|hardcore|softcore|hentai|jav|fetish|milf|camgirl|dildo|vagina|penis|boobs)\b/i;

export function isSafeContent(title = '', summary = '', genres = []) {
    if (genres && Array.isArray(genres)) {
        if (genres.some(g => ADULT_GENRES.has(g))) return false;
    }
    const text = `${title} ${summary}`;
    if (ADULT_REGEX.test(text)) return false;
    return true;
}

// 1. Fetch Movies
export async function fetchMovies(query = '') {
    try {
        const res = await axios.get(`${API_BASE}/api/search/movies`, { params: { query }, timeout: 6000 });
        if (res.data?.results && res.data.results.length > 0) {
            return res.data.results.filter(m => isSafeContent(m.title, m.summary, m.genres));
        }
    } catch (err) {
        console.warn('Backend movie search unreachable, using fallback catalog:', err.message);
    }

    // Client-side fallback if backend is offline on Netlify
    if (query.trim()) {
        const q = query.toLowerCase();
        return POPULAR_MOVIES_CATALOG
            .filter(m => isSafeContent(m.title, m.summary, m.genres))
            .filter(m => m.title.toLowerCase().includes(q) || m.summary.toLowerCase().includes(q));
    }
    return POPULAR_MOVIES_CATALOG.filter(m => isSafeContent(m.title, m.summary, m.genres));
}

// 2. Fetch Series (Strictly excludes anime and adult content)
export async function fetchSeries(query = '') {
    try {
        const res = await axios.get(`${API_BASE}/api/search/series`, { params: { query }, timeout: 6000 });
        if (res.data?.results && res.data.results.length > 0) {
            return res.data.results
                .filter(s => !s.genres?.includes('Anime'))
                .filter(s => isSafeContent(s.title, s.summary, s.genres));
        }
    } catch (err) {
        console.warn('Backend series search unreachable, fetching directly from TVMaze:', err.message);
    }

    // Direct TVMaze API fallback (CORS is completely enabled on TVMaze API)
    try {
        const url = query.trim()
            ? `https://api.tvmaze.com/search/shows?q=${encodeURIComponent(query.trim())}`
            : 'https://api.tvmaze.com/shows?page=1';
        const tvmazeRes = await axios.get(url, { timeout: 6000 });
        const raw = query.trim() ? (tvmazeRes.data || []).map(item => item.show) : (tvmazeRes.data || []).slice(0, 36);

        return raw
            .filter(show => {
                if (!show) return false;
                // Exclude anime so it never duplicates with the anime category
                if (show.genres?.includes('Anime')) return false;
                return isSafeContent(show.name, show.summary, show.genres);
            })
            .slice(0, 24)
            .map(show => ({
                id: `series-${show.id}`,
                showId: show.id,
                title: show.name,
                year: show.premiered ? show.premiered.split('-')[0] : 'N/A',
                rating: show.rating?.average || 'N/A',
                poster: show.image?.medium || show.image?.original || '',
                summary: show.summary ? show.summary.replace(/<[^>]+>/g, '') : '',
                type: 'series',
                imdbCode: show.externals?.imdb || '',
                genres: show.genres || []
            }));
    } catch (e) {
        console.error('TVMaze direct fallback error:', e.message);
        return [];
    }
}

// 3. Fetch Anime
export async function fetchAnime(query = '') {
    try {
        const res = await axios.get(`${API_BASE}/api/search/anime`, { params: { query }, timeout: 6000 });
        if (res.data?.results && res.data.results.length > 0) {
            return res.data.results.filter(a => isSafeContent(a.title, a.summary, a.genres));
        }
    } catch (err) {
        console.warn('Backend anime search unreachable, using client anime catalog:', err.message);
    }

    // Filter local anime catalog if query provided
    if (query.trim()) {
        const q = query.toLowerCase();
        const filtered = POPULAR_ANIME_CATALOG
            .filter(a => isSafeContent(a.title, a.summary, a.genres))
            .filter(a => 
                a.title.toLowerCase().includes(q) || 
                a.summary.toLowerCase().includes(q)
            );
        if (filtered.length > 0) return filtered;

        // Try direct TVMaze for anime search
        try {
            const tvRes = await axios.get(`https://api.tvmaze.com/search/shows?q=${encodeURIComponent(query.trim())}`);
            return (tvRes.data || [])
                .filter(item => isSafeContent(item.show?.name, item.show?.summary, item.show?.genres))
                .map(item => ({
                    id: `anime-${item.show.id}`,
                    showId: item.show.id,
                    title: item.show.name,
                    year: item.show.premiered ? item.show.premiered.split('-')[0] : 'N/A',
                    rating: item.show.rating?.average || '8.5',
                    poster: item.show.image?.medium || item.show.image?.original || '',
                    summary: item.show.summary ? item.show.summary.replace(/<[^>]+>/g, '') : '',
                    type: 'anime',
                    imdbCode: item.show.externals?.imdb || '',
                    genres: item.show.genres || ['Anime']
                }));
        } catch (e) {
            return [];
        }
    }

    return POPULAR_ANIME_CATALOG.filter(a => isSafeContent(a.title, a.summary, a.genres));
}

// 4. Fetch Korean Dramas (K-Drama)
export async function fetchKDrama(query = '') {
    try {
        const res = await axios.get(`${API_BASE}/api/search/kdrama`, { params: { query }, timeout: 6000 });
        if (res.data?.results && res.data.results.length > 0) {
            return res.data.results.filter(k => isSafeContent(k.title, k.summary, k.genres));
        }
    } catch (err) {
        console.warn('Backend kdrama search unreachable, using client kdrama catalog:', err.message);
    }

    // Filter local K-Drama catalog if query provided
    if (query.trim()) {
        const q = query.toLowerCase();
        const filtered = POPULAR_KDRAMA_CATALOG
            .filter(k => isSafeContent(k.title, k.summary, k.genres))
            .filter(k => 
                k.title.toLowerCase().includes(q) || 
                k.summary.toLowerCase().includes(q)
            );
        if (filtered.length > 0) return filtered;

        // Try direct TVMaze for K-Drama search
        try {
            const tvRes = await axios.get(`https://api.tvmaze.com/search/shows?q=${encodeURIComponent(query.trim())}`);
            return (tvRes.data || [])
                .filter(item => {
                    const s = item.show;
                    if (!s) return false;
                    if (s.genres?.includes('Anime')) return false;
                    const preMatched = POPULAR_KDRAMA_CATALOG.find(k => 
                        k.showId === s.id || 
                        (s.name && k.title.toLowerCase().includes(s.name.toLowerCase()))
                    );
                    if (preMatched) return isSafeContent(s.name, s.summary, s.genres);
                    const country = s.network?.country?.code || s.webChannel?.country?.code || '';
                    const isKorean = country === 'KR' || /korean|k-drama|kdrama|south korea/i.test(`${s.name} ${s.summary}`);
                    if (!isKorean) return false;
                    return isSafeContent(s.name, s.summary, s.genres);
                })
                .map(item => {
                    const s = item.show;
                    const preMatched = POPULAR_KDRAMA_CATALOG.find(k => 
                        k.showId === s.id || 
                        (s.name && k.title.toLowerCase().includes(s.name.toLowerCase()))
                    );
                    return {
                        id: `kdrama-${s.id}`,
                        showId: s.id,
                        title: preMatched ? preMatched.title : s.name,
                        year: s.premiered ? s.premiered.split('-')[0] : 'N/A',
                        rating: preMatched ? preMatched.rating : (s.rating?.average ? String(s.rating.average) : '8.5'),
                        poster: preMatched ? preMatched.poster : (s.image?.medium || s.image?.original || ''),
                        summary: preMatched ? preMatched.summary : (s.summary ? s.summary.replace(/<[^>]+>/g, '') : ''),
                        type: 'kdrama',
                        imdbCode: preMatched?.imdbCode || s.externals?.imdb || '',
                        genres: s.genres || ['Drama', 'K-Drama']
                    };
                });
        } catch (e) {
            return [];
        }
    }

    return POPULAR_KDRAMA_CATALOG.filter(k => isSafeContent(k.title, k.summary, k.genres));
}

// 5. Fetch Episodes for Series, Anime, or KDrama
export async function fetchEpisodes(id) {
    const cleanId = String(id).replace(/^(series|anime|kdrama)-/, '');
    try {
        const res = await axios.get(`${API_BASE}/api/search/series/${id}/episodes`, { timeout: 6000 });
        if (res.data?.episodes && res.data.episodes.length > 0) {
            return res.data.episodes;
        }
    } catch (err) {
        console.warn('Backend episodes unreachable, fetching directly from TVMaze:', err.message);
    }

    try {
        const tvmazeRes = await axios.get(`https://api.tvmaze.com/shows/${cleanId}/episodes`, { timeout: 6000 });
        return (tvmazeRes.data || []).map(ep => ({
            id: ep.id,
            name: ep.name,
            season: ep.season,
            number: ep.number,
            summary: ep.summary ? ep.summary.replace(/<[^>]+>/g, '') : '',
            image: ep.image?.medium || '',
            airdate: ep.airdate
        }));
    } catch (e) {
        console.error('TVMaze episodes direct error:', e.message);
        return [];
    }
}

// 6. Live Search Autocomplete Suggestions (Fast, Safe, Deduplicated across Movies, Series, Anime, KDrama)
export async function fetchAutocomplete(query = '') {
    if (!query || query.trim().length < 2) return [];
    const q = query.trim().toLowerCase();

    try {
        const [movies, series, animes, kdramas] = await Promise.all([
            fetchMovies(q),
            fetchSeries(q),
            fetchAnime(q),
            fetchKDrama(q)
        ]);

        const pool = [];
        const seen = new Set();

        const addIfUnique = (item) => {
            if (!item || !item.title) return;
            const key = item.title.toLowerCase().replace(/[^a-z0-9]/g, '');
            if (!key || seen.has(key)) return;
            seen.add(key);
            pool.push(item);
        };

        // Prioritize kdrama, animes, and movies
        (kdramas || []).forEach(addIfUnique);
        (animes || []).forEach(addIfUnique);
        (movies || []).forEach(addIfUnique);
        (series || []).forEach(addIfUnique);

        return pool.slice(0, 6);
    } catch (e) {
        return [];
    }
}
