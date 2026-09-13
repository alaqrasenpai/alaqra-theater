const express = require('express');
const torrentStream = require('torrent-stream');
const axios = require('axios');
const os = require('os');
const path = require('path');
const router = express.Router();

// Active torrent engines
const activeEngines = {};

router.get('/start', async (req, res) => {
    const { magnet, torrentUrl } = req.query;
    if (!magnet && !torrentUrl) {
        return res.status(400).json({ error: 'رابط Magnet أو ملف Torrent مطلوب' });
    }

    try {
        let torrentSource = magnet;

        if (torrentUrl) {
            console.log('Fetching .torrent from URL:', torrentUrl);
            const torrentRes = await axios.get(torrentUrl, {
                responseType: 'arraybuffer',
                timeout: 10000,
                headers: { 'User-Agent': 'Mozilla/5.0' }
            });
            torrentSource = Buffer.from(torrentRes.data);
        }

        console.log('Initializing torrent buffer stream...');
        
        // Use temp cache directory for buffering chunks only
        const engine = torrentStream(torrentSource, {
            path: path.join(os.tmpdir(), 'alaqra-buffer'),
            trackers: [
                'udp://tracker.opentrackr.org:1337/announce',
                'udp://open.demonii.com:1337/announce',
                'udp://tracker.openbittorrent.com:80',
                'udp://tracker.coppersurfer.tk:6969',
                'udp://explodie.org:6969',
                'udp://tracker.leechers-paradise.org:6969',
                'udp://p4p.arenabg.com:1337',
                'udp://9.rarbg.to:2710/announce',
                'udp://9.rarbg.me:2710/announce',
                'udp://tracker.cyberia.is:6969/announce'
            ]
        });

        // 40-second timeout for DHT metadata
        const metadataTimeout = setTimeout(() => {
            if (!res.headersSent) {
                res.status(504).json({ 
                    error: 'استغرق الاتصال بالموزعين وقتاً طويلاً. يرجى استخدام خيار البث المباشر الفوري أو تجربة جودة أخرى.',
                    suggestDirect: true 
                });
            }
        }, 40000);

        engine.on('ready', () => {
            clearTimeout(metadataTimeout);
            console.log('Torrent metadata loaded successfully!');

            // Find video files
            const videoExtensions = ['.mp4', '.mkv', '.webm', '.avi', '.mov', '.m4v'];
            const videoFiles = engine.files.filter(f => 
                videoExtensions.some(ext => f.name.toLowerCase().endsWith(ext))
            );

            // Select largest file
            const targetFile = videoFiles.length > 0
                ? videoFiles.reduce((a, b) => a.length > b.length ? a : b)
                : engine.files.reduce((a, b) => a.length > b.length ? a : b);

            const infoHash = engine.infoHash;

            // Prioritize sequential buffering
            targetFile.select();

            activeEngines[infoHash] = { 
                engine, 
                file: targetFile,
                createdAt: Date.now()
            };

            if (!res.headersSent) {
                res.json({
                    infoHash,
                    filename: targetFile.name,
                    length: targetFile.length,
                    streamUrl: `http://localhost:3001/api/torrent/stream/${infoHash}`
                });
            }
        });

        engine.on('error', (err) => {
            clearTimeout(metadataTimeout);
            console.error('Torrent error:', err);
            if (!res.headersSent) {
                res.status(500).json({ error: 'حدث خطأ في محرك التورنت: ' + err.message });
            }
        });

    } catch (err) {
        console.error('Error in /start:', err.message);
        if (!res.headersSent) {
            res.status(500).json({ error: err.message });
        }
    }
});

// Live buffering status endpoint
router.get('/status/:infoHash', (req, res) => {
    const { infoHash } = req.params;
    const session = activeEngines[infoHash];
    if (!session) {
        return res.status(404).json({ error: 'Session not found' });
    }

    const swarm = session.engine.swarm;
    res.json({
        peers: swarm.wires.length,
        downloaded: swarm.downloaded,
        downloadSpeed: swarm.downloadSpeed(), // Bytes/sec
        fileSize: session.file.length,
        progress: session.file.length ? Math.min(100, ((swarm.downloaded / session.file.length) * 100).toFixed(1)) : 0
    });
});

// Stream video chunks (Buffering via Range Requests)
router.get('/stream/:infoHash', (req, res) => {
    const infoHash = req.params.infoHash;
    const session = activeEngines[infoHash];

    if (!session) {
        return res.status(404).send('جلسة البث غير موجودة.');
    }

    const file = session.file;
    const fileSize = file.length;
    const range = req.headers.range;

    let contentType = 'video/mp4';
    if (file.name.endsWith('.mkv')) contentType = 'video/mp4'; // Many browsers can parse mkv containers if mp4/h264
    if (file.name.endsWith('.webm')) contentType = 'video/webm';
    if (file.name.endsWith('.avi')) contentType = 'video/x-msvideo';

    if (range) {
        // Range buffering: only send the requested chunk
        const parts = range.replace(/bytes=/, "").split("-");
        const start = parseInt(parts[0], 10);
        // Default buffer chunk ~ 2MB
        const chunkLimit = start + (2 * 1024 * 1024);
        const end = parts[1] ? parseInt(parts[1], 10) : Math.min(chunkLimit, fileSize - 1);

        const chunkSize = (end - start) + 1;
        const stream = file.createReadStream({ start, end });

        res.writeHead(206, {
            'Content-Range': `bytes ${start}-${end}/${fileSize}`,
            'Accept-Ranges': 'bytes',
            'Content-Length': chunkSize,
            'Content-Type': contentType,
        });

        stream.pipe(res);
    } else {
        res.writeHead(200, {
            'Content-Length': fileSize,
            'Content-Type': contentType,
            'Accept-Ranges': 'bytes'
        });
        file.createReadStream().pipe(res);
    }
});

module.exports = router;
