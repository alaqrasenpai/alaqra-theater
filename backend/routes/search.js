const express = require('express');
const axios = require('axios');
const router = express.Router();

const YTS_MIRRORS = [
    'https://yts.am',
    'https://yts.lt',
    'https://yts.bz',
    'https://yts.rs',
    'https://yts.mx'
];

const { POPULAR_KDRAMA_CATALOG } = require('../data/kdramaCatalog');

// Top Legendary Anime Catalog with pre-matched IMDB codes and TVMaze show IDs
const POPULAR_ANIME_CATALOG = [
    {
        id: 'anime-919',
        showId: 919,
        title: 'Attack on Titan (هجوم العمالقة)',
        year: '2013',
        rating: '9.1',
        poster: 'https://static.tvmaze.com/uploads/images/original_untouched/632/1582290.jpg',
        summary: 'بعد تدمير مسقط رأسه وقتل والدته، يتعهد إيرين ييغر بتطهير الأرض من العمالقة الشبيهة بالبشر الذين قادوا البشرية إلى حافة الانقراض.',
        type: 'anime',
        imdbCode: 'tt2560140',
        genres: ['Action', 'Fantasy', 'Anime']
    },
    {
        id: 'anime-41469',
        showId: 41469,
        title: 'Demon Slayer: Kimetsu no Yaiba (قاتل الشياطين)',
        year: '2019',
        rating: '8.7',
        poster: 'https://static.tvmaze.com/uploads/images/original_untouched/456/1140750.jpg',
        summary: 'ينطلق تانجيرو كامادو في رحلة محفوفة بالمخاطر للانتقام لعائلته المذبوحة وإيجاد علاج لأخته التي تحولت إلى شيطانة.',
        type: 'anime',
        imdbCode: 'tt9335498',
        genres: ['Action', 'Supernatural', 'Anime']
    },
    {
        id: 'anime-48450',
        showId: 48450,
        title: 'Jujutsu Kaisen (جوجيتسو كايسن)',
        year: '2020',
        rating: '8.6',
        poster: 'https://static.tvmaze.com/uploads/images/original_untouched/608/1521905.jpg',
        summary: 'يقرر الفتى يوجي إيتادوري ابتلاع إصبع ملعون لإنقاذ أصدقائه، ليجد نفسه متورطاً في عالم سحرة الجوجيتسو واللعنات القاتلة.',
        type: 'anime',
        imdbCode: 'tt12343534',
        genres: ['Action', 'Fantasy', 'Anime']
    },
    {
        id: 'anime-40',
        showId: 40,
        title: 'Death Note (مذكرة الموت)',
        year: '2006',
        rating: '9.0',
        poster: 'https://static.tvmaze.com/uploads/images/original_untouched/499/1249019.jpg',
        summary: 'يعثر الطالب العبقري لايت ياغامي على مذكرة غامضة تمنحه القدرة على قتل أي شخص يكتب اسمه بداخلها.',
        type: 'anime',
        imdbCode: 'tt0877057',
        genres: ['Mystery', 'Thriller', 'Anime']
    },
    {
        id: 'anime-488',
        showId: 488,
        title: 'Naruto Shippuden (ناروتو شيبودن)',
        year: '2007',
        rating: '8.7',
        poster: 'https://static.tvmaze.com/uploads/images/original_untouched/3/9413.jpg',
        summary: 'يعود ناروتو بعد سنوات من التدريب الشاق لحماية قريته وأصدقائه من منظمة الأكاتسكي الغامضة.',
        type: 'anime',
        imdbCode: 'tt0988824',
        genres: ['Action', 'Adventure', 'Anime']
    },
    {
        id: 'anime-1505',
        showId: 1505,
        title: 'One Piece (ون بيس)',
        year: '1999',
        rating: '9.0',
        poster: 'https://static.tvmaze.com/uploads/images/original_untouched/504/1262497.jpg',
        summary: 'مونكي دي لوفي وطاقمه من قراصنة قبعة القش يبحرون عبر الغراند لاين بحثاً عن الكنز الأسطوري ون بيس.',
        type: 'anime',
        imdbCode: 'tt0388629',
        genres: ['Action', 'Adventure', 'Anime']
    },
    {
        id: 'anime-64632',
        showId: 64632,
        title: 'Solo Leveling (سولو ليفلينج)',
        year: '2024',
        rating: '8.5',
        poster: 'https://static.tvmaze.com/uploads/images/original_untouched/497/1244908.jpg',
        summary: 'في عالم تظهر فيه بوابات مليئة بالوحوش، يُمنح الصياد الأضعف سونغ جين وو قدرة خارقة غامضة تسمح له برفع مستواه بلا حدود.',
        type: 'anime',
        imdbCode: 'tt21209876',
        genres: ['Action', 'Fantasy', 'Anime']
    },
    {
        id: 'anime-1536',
        showId: 1536,
        title: 'Hunter x Hunter (القناص)',
        year: '2011',
        rating: '9.0',
        poster: 'https://static.tvmaze.com/uploads/images/original_untouched/223/559165.jpg',
        summary: 'غون فريكس ينطلق ليصبح صياداً محترفاً على أمل العثور على والده المفقود، ويلتقي بأصدقاء يخوضون معه مغامرات ملحمية.',
        type: 'anime',
        imdbCode: 'tt2098220',
        genres: ['Action', 'Adventure', 'Anime']
    },
    {
        id: 'anime-1905',
        showId: 1905,
        title: 'Bleach (بليتش)',
        year: '2004',
        rating: '8.2',
        poster: 'https://static.tvmaze.com/uploads/images/original_untouched/459/1148800.jpg',
        summary: 'إيتشيغو كوروساكي يكتسب قوى الشينيغامي ويتحمل مسؤولية حماية الأرواح ومحاربة الوحوش الضالة.',
        type: 'anime',
        imdbCode: 'tt0434665',
        genres: ['Action', 'Supernatural', 'Anime']
    },
    {
        id: 'anime-63451',
        showId: 63451,
        title: 'Chainsaw Man (رجل المنشار)',
        year: '2022',
        rating: '8.4',
        poster: 'https://static.tvmaze.com/uploads/images/original_untouched/422/1056726.jpg',
        summary: 'دنجي يعيش كصياد شياطين مثقل بالديون حتى يندمج مع شيطان المنشار بوتشيتا ليبدأ حياة جديدة مليئة بالمخاطر.',
        type: 'anime',
        imdbCode: 'tt13616990',
        genres: ['Action', 'Horror', 'Anime']
    },
    {
        id: 'anime-2071',
        showId: 2071,
        title: 'Fullmetal Alchemist: Brotherhood (الكيميائي المعدني الكامل)',
        year: '2009',
        rating: '9.1',
        poster: 'https://static.tvmaze.com/uploads/images/original_untouched/485/1214095.jpg',
        summary: 'الأخوان إدوارد وألفونس إلريك يسعيان وراء حجر الفلاسفة الأسطوري لاستعادة جسديهما بعد تجربة كيميائية محرمة.',
        type: 'anime',
        imdbCode: 'tt1355642',
        genres: ['Action', 'Fantasy', 'Anime']
    },
    {
        id: 'anime-42155',
        showId: 42155,
        title: 'Vinland Saga (فاينلاند ساغا)',
        year: '2019',
        rating: '8.8',
        poster: 'https://static.tvmaze.com/uploads/images/original_untouched/508/1270295.jpg',
        summary: 'ثورفين الشاب يقسم على الانتقام لموت والده وينضم لفرقة الفايكنج التي قتلت أباه لانتزاع حقه في مبارزة عادلة.',
        type: 'anime',
        imdbCode: 'tt10233448',
        genres: ['Action', 'Historical', 'Anime']
    }
];

// Fallback sample movies
const FALLBACK_MOVIES = [
    {
        id: 'fallback-1',
        title: 'Big Buck Bunny',
        year: 2008,
        rating: 8.5,
        poster: 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c5/Big_buck_bunny_poster_big.jpg/640px-Big_buck_bunny_poster_big.jpg',
        summary: 'A large and lovable rabbit takes revenge on three bullying rodents.',
        type: 'movie',
        imdbCode: 'tt1254207',
        torrents: [{
            quality: '1080p',
            size: '560 MB',
            magnet: 'magnet:?xt=urn:btih:dd8255ecdc7ca55fb0bbf81323d87062db1f6d1c&dn=Big+Buck+Bunny'
        }]
    }
];

// Strict Adult / NSFW Content Filter
const ADULT_GENRES = new Set(['Adult', 'Erotica', 'Pornography', 'Hentai', 'Ecchi', 'Sex']);
const ADULT_REGEX = /\b(xxx|porn|pornstar|erotic|erotica|sex|sexy|adult|nude|nudity|naked|stripper|blowjob|masturbat|gangbang|hardcore|softcore|hentai|jav|fetish|milf|camgirl|dildo|vagina|penis|boobs)\b/i;

function isSafeContent(title = '', summary = '', genres = []) {
    if (genres && Array.isArray(genres)) {
        if (genres.some(g => ADULT_GENRES.has(g))) return false;
    }
    const textToCheck = `${title} ${summary}`;
    if (ADULT_REGEX.test(textToCheck)) return false;
    return true;
}

// Search Movies with auto-mirror failover
router.get('/movies', async (req, res) => {
    const { query = '', page = 1 } = req.query;
    let fetchedMovies = null;

    for (const mirror of YTS_MIRRORS) {
        try {
            let url = `${mirror}/api/v2/list_movies.json?limit=30&page=${page}&sort_by=download_count`;
            if (query.trim()) {
                url = `${mirror}/api/v2/list_movies.json?limit=30&page=${page}&query_term=${encodeURIComponent(query.trim())}`;
            }

            const response = await axios.get(url, { timeout: 4500 });
            if (response.data?.status === 'ok' && response.data?.data?.movies) {
                fetchedMovies = response.data.data.movies
                    .filter(movie => isSafeContent(movie.title, movie.summary || movie.description_full, movie.genres))
                    .map(movie => ({
                        id: `movie-${movie.id}`,
                        title: movie.title,
                        year: movie.year,
                        rating: movie.rating || 0,
                        poster: movie.medium_cover_image || movie.large_cover_image,
                        summary: movie.summary || movie.description_full || '',
                        type: 'movie',
                        imdbCode: movie.imdb_code || '',
                        genres: movie.genres || [],
                        torrents: (movie.torrents || []).map(t => ({
                            quality: t.quality,
                            size: t.size,
                            magnet: `magnet:?xt=urn:btih:${t.hash}&dn=${encodeURIComponent(movie.title)}&tr=udp://tracker.opentrackr.org:1337/announce&tr=udp://open.demonii.com:1337/announce&tr=udp://tracker.openbittorrent.com:80&tr=udp://tracker.coppersurfer.tk:6969`
                        }))
                    }))
                    .slice(0, 24);
                break;
            }
        } catch (err) {
            continue;
        }
    }

    if (fetchedMovies) {
        return res.json({ results: fetchedMovies });
    }

    return res.json({ 
        results: query ? [] : FALLBACK_MOVIES,
        warning: 'Could not reach YTS mirrors, showing fallback library.'
    });
});

// Search TV Series via TVMaze (Strictly filters out Anime and NSFW content)
router.get('/series', async (req, res) => {
    const { query = '' } = req.query;
    try {
        let url = 'https://api.tvmaze.com/shows?page=1';
        if (query.trim()) {
            url = `https://api.tvmaze.com/search/shows?q=${encodeURIComponent(query.trim())}`;
        }

        const response = await axios.get(url, { timeout: 5000 });
        const data = response.data || [];

        const rawList = query.trim() ? data.map(item => item.show) : data.slice(0, 40);
        
        // Exclude anime (they belong strictly to /anime) and filter out NSFW
        const safeSeries = rawList
            .filter(show => {
                if (!show) return false;
                if (show.genres?.includes('Anime')) return false;
                return isSafeContent(show.name, show.summary, show.genres);
            })
            .slice(0, 24);

        const seriesList = safeSeries.map(show => ({
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

        res.json({ results: seriesList });
    } catch (err) {
        console.error('Series fetch error:', err.message);
        res.json({ results: [] });
    }
});

// Get Episodes for Series, Anime, or KDrama
router.get('/series/:id/episodes', async (req, res) => {
    const { id } = req.params;
    const cleanId = id.replace(/^(series|anime|kdrama)-/, '');
    try {
        const response = await axios.get(`https://api.tvmaze.com/shows/${cleanId}/episodes`, { timeout: 5000 });
        const episodes = (response.data || []).map(ep => ({
            id: ep.id,
            name: ep.name,
            season: ep.season,
            number: ep.number,
            summary: ep.summary ? ep.summary.replace(/<[^>]+>/g, '') : '',
            image: ep.image?.medium || '',
            airdate: ep.airdate
        }));

        res.json({ episodes });
    } catch (err) {
        console.error('Episodes fetch error:', err.message);
        res.json({ episodes: [] });
    }
});

// Search Anime with Verified IMDB Codes for Seamless 100% Working Streaming
router.get('/anime', async (req, res) => {
    const { query = '' } = req.query;

    if (!query.trim()) {
        return res.json({ results: POPULAR_ANIME_CATALOG });
    }

    try {
        // Search TVMaze for the anime
        const searchUrl = `https://api.tvmaze.com/search/shows?q=${encodeURIComponent(query.trim())}`;
        const response = await axios.get(searchUrl, { timeout: 5000 });
        const rawResults = response.data || [];

        const results = rawResults.map(item => {
            const show = item.show;
            // Check if we have pre-matched catalog item
            const catalogMatch = POPULAR_ANIME_CATALOG.find(a => 
                a.title.toLowerCase().includes(show.name.toLowerCase()) || 
                show.name.toLowerCase().includes(a.title.split('(')[0].trim().toLowerCase())
            );

            return {
                id: `anime-${show.id}`,
                showId: show.id,
                title: catalogMatch?.title || show.name,
                year: show.premiered ? show.premiered.split('-')[0] : 'N/A',
                rating: show.rating?.average ? show.rating.average.toFixed(1) : (catalogMatch?.rating || '8.5'),
                poster: show.image?.medium || show.image?.original || catalogMatch?.poster || '',
                summary: show.summary ? show.summary.replace(/<[^>]+>/g, '') : (catalogMatch?.summary || ''),
                type: 'anime',
                imdbCode: show.externals?.imdb || catalogMatch?.imdbCode || '',
                genres: show.genres || ['Anime']
            };
        });

        const safeResults = results.filter(a => isSafeContent(a.title, a.summary, a.genres));

        // If TVMaze found nothing, filter our popular anime catalog
        if (safeResults.length === 0) {
            const filtered = POPULAR_ANIME_CATALOG.filter(a => 
                (a.title.toLowerCase().includes(query.toLowerCase()) || 
                a.summary.toLowerCase().includes(query.toLowerCase())) &&
                isSafeContent(a.title, a.summary, a.genres)
            );
            return res.json({ results: filtered });
        }

        res.json({ results: safeResults });
    } catch (err) {
        console.error('Anime search error:', err.message);
        res.json({ results: POPULAR_ANIME_CATALOG });
    }
});

// Search Korean Dramas (K-Drama) with Verified IMDb Codes & TVMaze Integration
router.get('/kdrama', async (req, res) => {
    const { query = '' } = req.query;

    if (!query.trim()) {
        return res.json({ results: POPULAR_KDRAMA_CATALOG });
    }

    try {
        const searchUrl = `https://api.tvmaze.com/search/shows?q=${encodeURIComponent(query.trim())}`;
        const response = await axios.get(searchUrl, { timeout: 5000 });
        const items = response.data || [];

        const kdramaResults = items
            .filter(item => {
                const show = item.show;
                if (!show) return false;
                if (show.genres?.includes('Anime')) return false;
                const preMatched = POPULAR_KDRAMA_CATALOG.find(k => 
                    k.showId === show.id || 
                    (show.name && k.title.toLowerCase().includes(show.name.toLowerCase()))
                );
                if (preMatched) return isSafeContent(show.name, show.summary, show.genres);
                const country = show.network?.country?.code || show.webChannel?.country?.code || '';
                const isKorean = country === 'KR' || /korean|k-drama|kdrama|south korea/i.test(`${show.name} ${show.summary}`);
                if (!isKorean) return false;
                return isSafeContent(show.name, show.summary, show.genres);
            })
            .map(item => {
                const show = item.show;
                const preMatched = POPULAR_KDRAMA_CATALOG.find(k => 
                    k.showId === show.id || 
                    (show.name && k.title.toLowerCase().includes(show.name.toLowerCase()))
                );

                return {
                    id: `kdrama-${show.id}`,
                    showId: show.id,
                    title: preMatched ? preMatched.title : show.name,
                    year: show.premiered ? show.premiered.split('-')[0] : 'N/A',
                    rating: preMatched ? preMatched.rating : (show.rating?.average ? String(show.rating.average) : 'N/A'),
                    poster: preMatched ? preMatched.poster : (show.image?.medium || show.image?.original || ''),
                    summary: preMatched ? preMatched.summary : (show.summary ? show.summary.replace(/<[^>]+>/g, '') : ''),
                    type: 'kdrama',
                    imdbCode: preMatched?.imdbCode || show.externals?.imdb || '',
                    genres: show.genres || ['Drama', 'K-Drama']
                };
            })
            .slice(0, 24);

        if (kdramaResults.length === 0) {
            // Fallback: search within local POPULAR_KDRAMA_CATALOG
            const filtered = POPULAR_KDRAMA_CATALOG.filter(k => 
                k.title.toLowerCase().includes(query.toLowerCase()) || 
                k.summary.toLowerCase().includes(query.toLowerCase())
            );
            return res.json({ results: filtered });
        }

        res.json({ results: kdramaResults });
    } catch (err) {
        console.error('K-Drama search error:', err.message);
        res.json({ results: POPULAR_KDRAMA_CATALOG });
    }
});

// Fetch Torrents for Anime from Nyaa.si RSS
router.get('/anime-torrents', async (req, res) => {
    const { title } = req.query;
    if (!title) return res.status(400).json({ error: 'Title required' });

    // Clean title for search
    const cleanTitle = title.split('(')[0].trim();

    try {
        const searchUrl = `https://nyaa.si/?page=rss&q=${encodeURIComponent(cleanTitle)}&c=1_2&f=0`;
        const response = await axios.get(searchUrl, { timeout: 5000 });
        const items = response.data.match(/<item>[\s\S]*?<\/item>/g) || [];

        const torrents = items.slice(0, 15).map(item => {
            const itemTitle = item.match(/<title>([\s\S]*?)<\/title>/)?.[1] || 'Unknown';
            const torrentUrl = item.match(/<link>([\s\S]*?)<\/link>/)?.[1] || '';
            const size = item.match(/<nyaa:size>([\s\S]*?)<\/nyaa:size>/)?.[1] || 'N/A';
            const seeders = item.match(/<nyaa:seeders>([\s\S]*?)<\/nyaa:seeders>/)?.[1] || '0';

            return {
                title: itemTitle,
                torrentUrl,
                size,
                seeders,
                quality: itemTitle.includes('1080p') ? '1080p' : (itemTitle.includes('720p') ? '720p' : 'HD')
            };
        });

        res.json({ torrents });
    } catch (err) {
        console.error('Nyaa fetch error:', err.message);
        res.json({ torrents: [] });
    }
});

module.exports = router;
