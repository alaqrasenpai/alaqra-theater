const express = require('express');
const axios = require('axios');
const zlib = require('zlib');
const router = express.Router();

// Helper to convert SRT to WebVTT format
function srtToVtt(srtText) {
    let clean = (srtText || '')
        .replace(/^\uFEFF/, '')
        .replace(/\uFEFF/g, '')
        .replace(/\r\n|\r/g, '\n');
    
    let vtt = 'WEBVTT\n\n';
    vtt += clean.replace(/(\d\d:\d\d:\d\d),(\d\d\d)/g, '$1.$2');
    return vtt;
}

// Convert uploaded or pasted SRT to WebVTT
router.post('/convert', express.text({ limit: '10mb' }), (req, res) => {
    try {
        const srtContent = req.body || '';
        const vttContent = srtToVtt(srtContent);
        res.setHeader('Content-Type', 'text/vtt; charset=utf-8');
        res.send(vttContent);
    } catch (err) {
        res.status(500).send('Error converting subtitles');
    }
});

// Auto-search and fetch subtitle in requested language (ara, eng, etc.)
router.get('/auto', async (req, res) => {
    const { imdb = '', lang = 'ara', season = '', episode = '', query = '' } = req.query;

    const cleanImdb = imdb.replace(/^tt/, '');
    const cleanLang = lang === 'ar' || lang === 'ara' ? 'ara' : (lang === 'en' || lang === 'eng' ? 'eng' : lang);

    try {
        let searchUrls = [];

        // 1. Build search criteria
        if (cleanImdb) {
            let imdbPath = `imdbid-${cleanImdb}/sublanguageid-${cleanLang}`;
            if (season && episode) {
                imdbPath += `/season-${season}/episode-${episode}`;
            }
            searchUrls.push(`https://rest.opensubtitles.org/search/${imdbPath}`);
        }

        if (query) {
            let qPath = `query-${encodeURIComponent(query)}/sublanguageid-${cleanLang}`;
            if (season && episode) {
                qPath += `/season-${season}/episode-${episode}`;
            }
            searchUrls.push(`https://rest.opensubtitles.org/search/${qPath}`);
        }

        let downloadLink = null;
        let subtitleFileName = '';

        for (const url of searchUrls) {
            try {
                const searchRes = await axios.get(url, {
                    headers: { 'User-Agent': 'TemporaryUserAgent v1.0' },
                    timeout: 4500
                });

                if (Array.isArray(searchRes.data) && searchRes.data.length > 0) {
                    const match = searchRes.data[0];
                    if (match.SubDownloadLink) {
                        downloadLink = match.SubDownloadLink;
                        subtitleFileName = match.SubFileName || '';
                        break;
                    }
                }
            } catch (err) {
                continue;
            }
        }

        if (downloadLink) {
            // Download the .gz archive
            const subRes = await axios.get(downloadLink, {
                responseType: 'arraybuffer',
                headers: { 'User-Agent': 'TemporaryUserAgent v1.0' },
                timeout: 5000
            });

            // Decompress gzip
            let srtText = '';
            try {
                srtText = zlib.gunzipSync(subRes.data).toString('utf-8');
            } catch (gunzipErr) {
                // If it wasn't compressed, use as string
                srtText = subRes.data.toString('utf-8');
            }

            const vtt = srtToVtt(srtText);
            res.setHeader('Content-Type', 'text/vtt; charset=utf-8');
            res.setHeader('X-Subtitle-Name', encodeURIComponent(subtitleFileName));
            return res.send(vtt);
        }

        // If no subtitle found, return minimal notification VTT
        const fallbackVtt = `WEBVTT

1
00:00:01.000 --> 00:00:06.000
لم يتم العثور على ملف ترجمة تلقائي لهذه الحلقة، يمكنك رفع ملف الترجمة يدوياً.
`;
        res.setHeader('Content-Type', 'text/vtt; charset=utf-8');
        res.send(fallbackVtt);

    } catch (error) {
        console.error('Subtitle auto-fetch error:', error.message);
        const errVtt = `WEBVTT

1
00:00:01.000 --> 00:00:05.000
تعذر الاتصال بخادم الترجمة
`;
        res.setHeader('Content-Type', 'text/vtt; charset=utf-8');
        res.send(errVtt);
    }
});

module.exports = router;
