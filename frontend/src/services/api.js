import axios from 'axios';
import { POPULAR_ANIME_CATALOG } from '../data/animeCatalog';
import { POPULAR_MOVIES_CATALOG } from '../data/fallbackMovies';

export const API_BASE = import.meta.env.VITE_API_URL || '';

// 1. Fetch Movies
export async function fetchMovies(query = '') {
    try {
        const res = await axios.get(`${API_BASE}/api/search/movies`, { params: { query }, timeout: 6000 });
        if (res.data?.results && res.data.results.length > 0) {
            return res.data.results;
        }
    } catch (err) {
        console.warn('Backend movie search unreachable, using fallback catalog:', err.message);
    }

    // Client-side fallback if backend is offline on Netlify
    if (query.trim()) {
        const q = query.toLowerCase();
        return POPULAR_MOVIES_CATALOG.filter(m => m.title.toLowerCase().includes(q) || m.summary.toLowerCase().includes(q));
    }
    return POPULAR_MOVIES_CATALOG;
}

// 2. Fetch Series (Direct TVMaze fallback works in all browsers with zero CORS issues)
export async function fetchSeries(query = '') {
    try {
        const res = await axios.get(`${API_BASE}/api/search/series`, { params: { query }, timeout: 6000 });
        if (res.data?.results && res.data.results.length > 0) {
            return res.data.results;
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
        const raw = query.trim() ? (tvmazeRes.data || []).map(item => item.show) : (tvmazeRes.data || []).slice(0, 24);

        return raw.map(show => ({
            id: `series-${show.id}`,
            showId: show.id,
            title: show.name,
            year: show.premiered ? show.premiered.split('-')[0] : 'N/A',
            rating: show.rating?.average || 'N/A',
            poster: show.image?.original || show.image?.medium || '',
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
            return res.data.results;
        }
    } catch (err) {
        console.warn('Backend anime search unreachable, using client anime catalog:', err.message);
    }

    // Filter local anime catalog if query provided
    if (query.trim()) {
        const q = query.toLowerCase();
        const filtered = POPULAR_ANIME_CATALOG.filter(a => 
            a.title.toLowerCase().includes(q) || 
            a.summary.toLowerCase().includes(q)
        );
        if (filtered.length > 0) return filtered;

        // Try direct TVMaze for anime search
        try {
            const tvRes = await axios.get(`https://api.tvmaze.com/search/shows?q=${encodeURIComponent(query.trim())}`);
            return (tvRes.data || []).map(item => ({
                id: `anime-${item.show.id}`,
                showId: item.show.id,
                title: item.show.name,
                year: item.show.premiered ? item.show.premiered.split('-')[0] : 'N/A',
                rating: item.show.rating?.average || '8.5',
                poster: item.show.image?.original || item.show.image?.medium || '',
                summary: item.show.summary ? item.show.summary.replace(/<[^>]+>/g, '') : '',
                type: 'anime',
                imdbCode: item.show.externals?.imdb || '',
                genres: item.show.genres || ['Anime']
            }));
        } catch (e) {
            return [];
        }
    }

    return POPULAR_ANIME_CATALOG;
}

// 4. Fetch Episodes for Series or Anime
export async function fetchEpisodes(id) {
    const cleanId = String(id).replace(/^(series|anime)-/, '');
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
