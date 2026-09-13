// YouTube-style Studios & Channels System
// Studio and channel brand names are strictly in English per user specifications

export const CHANNELS = [
    {
        id: 'marvel',
        name: 'Marvel Studios',
        handle: '@marvelstudios',
        verified: true,
        subscribers: '31.4M',
        color: 'from-red-600 to-red-950',
        badgeColor: 'bg-red-600 text-white',
        avatarText: 'MCU',
        description: {
            ar: 'The official home for Marvel Cinematic Universe (MCU) blockbusters and Avengers superheroes.',
            en: 'The official home for Marvel Cinematic Universe (MCU) blockbusters and Avengers superheroes.'
        },
        keywords: [
            'marvel', 'avenger', 'iron man', 'spider-man', 'spiderman', 'thor',
            'captain america', 'hulk', 'deadpool', 'wolverine', 'guardians of the galaxy',
            'black panther', 'doctor strange', 'ant-man', 'loki', 'wandavision',
            'eternals', 'thanos', 'daredevil', 'hawkeye', 'wakanda'
        ]
    },
    {
        id: 'dc',
        name: 'DC Studios',
        handle: '@dcstudios',
        verified: true,
        subscribers: '23.1M',
        color: 'from-blue-700 to-slate-950',
        badgeColor: 'bg-blue-600 text-white',
        avatarText: 'DC',
        description: {
            ar: 'The world of legendary DC superheroes and villains: Batman, Superman, Joker, and the Justice League.',
            en: 'The world of legendary DC superheroes and villains: Batman, Superman, Joker, and the Justice League.'
        },
        keywords: [
            'batman', 'superman', 'joker', 'justice league', 'dark knight',
            'flash', 'aquaman', 'wonder woman', 'suicide squad', 'shazam',
            'gotham', 'harley quinn', 'krypton', 'penguin'
        ]
    },
    {
        id: 'anime_studios',
        name: 'Anime Studios (MAPPA & Ufotable)',
        handle: '@animestudios',
        verified: true,
        subscribers: '28.6M',
        color: 'from-purple-600 to-slate-950',
        badgeColor: 'bg-purple-600 text-white',
        avatarText: 'ANIME',
        description: {
            ar: 'Premier destination for epic Japanese anime series & films with original Japanese audio.',
            en: 'Premier destination for epic Japanese anime series & films with original Japanese audio.'
        },
        keywords: [
            'attack on titan', 'demon slayer', 'jujutsu kaisen', 'naruto', 'one piece',
            'death note', 'bleach', 'hunter x hunter', 'chainsaw man', 'solo leveling',
            'fullmetal alchemist', 'vinland saga', 'tokyo ghoul', 'dragon ball', 'sword art online'
        ]
    },
    {
        id: 'ghibli',
        name: 'Studio Ghibli',
        handle: '@studioghibli',
        verified: true,
        subscribers: '14.8M',
        color: 'from-teal-600 to-emerald-950',
        badgeColor: 'bg-emerald-600 text-white',
        avatarText: 'GHIBLI',
        description: {
            ar: 'Enchanting cinematic anime masterpieces created by legendary director Hayao Miyazaki.',
            en: 'Enchanting cinematic anime masterpieces created by legendary director Hayao Miyazaki.'
        },
        keywords: [
            'ghibli', 'spirited away', 'howl', 'totoro', 'mononoke', 'kiki',
            'castle in the sky', 'wind rises', 'ponyo', 'miyazaki', 'boy and the heron'
        ]
    },
    {
        id: 'warner_nolan',
        name: 'Warner Bros & Nolan',
        handle: '@warnernolan',
        verified: true,
        subscribers: '19.9M',
        color: 'from-amber-600 to-stone-950',
        badgeColor: 'bg-amber-600 text-black',
        avatarText: 'WB',
        description: {
            ar: 'Masterpiece sci-fi & mind-bending thrillers: Oppenheimer, Inception, Interstellar, Dune.',
            en: 'Masterpiece sci-fi & mind-bending thrillers: Oppenheimer, Inception, Interstellar, Dune.'
        },
        keywords: [
            'oppenheimer', 'interstellar', 'inception', 'tenet', 'dune',
            'dunkirk', 'prestige', 'memento', 'matrix', 'warner', 'blade runner'
        ]
    },
    {
        id: 'disney_pixar',
        name: 'Disney & Pixar',
        handle: '@disneypixar',
        verified: true,
        subscribers: '26.4M',
        color: 'from-sky-500 to-blue-950',
        badgeColor: 'bg-sky-500 text-white',
        avatarText: 'DISNEY',
        description: {
            ar: 'Enchanting family animations, Pixar stories, and timeless Disney adventures for all generations.',
            en: 'Enchanting family animations, Pixar stories, and timeless Disney adventures for all generations.'
        },
        keywords: [
            'disney', 'pixar', 'toy story', 'lion king', 'nemo', 'coco',
            'frozen', 'up', 'wall-e', 'monsters', 'aladdin', 'inside out',
            'shrek', 'kung fu panda', 'moana', 'encanto', 'ratatouille'
        ]
    },
    {
        id: 'hbo',
        name: 'HBO Originals',
        handle: '@hbodrama',
        verified: true,
        subscribers: '18.9M',
        color: 'from-neutral-700 to-zinc-950',
        badgeColor: 'bg-neutral-800 text-white',
        avatarText: 'HBO',
        description: {
            ar: 'Emmy-winning prestige television: Game of Thrones, House of the Dragon, Chernobyl, Succession.',
            en: 'Emmy-winning prestige television: Game of Thrones, House of the Dragon, Chernobyl, Succession.'
        },
        keywords: [
            'game of thrones', 'house of the dragon', 'chernobyl', 'last of us',
            'breaking bad', 'better call saul', 'succession', 'sopranos', 'wire',
            'peaky blinders', 'viking', 'true detective'
        ]
    },
    {
        id: 'action_saga',
        name: 'Action & Speed Saga',
        handle: '@actionsaga',
        verified: true,
        subscribers: '16.7M',
        color: 'from-orange-600 to-red-950',
        badgeColor: 'bg-orange-600 text-white',
        avatarText: 'ACTION',
        description: {
            ar: 'High-octane blockbusters: John Wick, Fast & Furious franchise, Mission Impossible, Top Gun.',
            en: 'High-octane blockbusters: John Wick, Fast & Furious franchise, Mission Impossible, Top Gun.'
        },
        keywords: [
            'john wick', 'fast and furious', 'fast & furious', 'mission impossible',
            'top gun', 'mad max', 'gladiator', 'transformers', 'die hard',
            'expendables', 'bourne', 'taken'
        ]
    },
    {
        id: 'cinema_premiere',
        name: 'Cinema Premiere',
        handle: '@cinemapremiere',
        verified: true,
        subscribers: '15.2M',
        color: 'from-red-700 to-zinc-950',
        badgeColor: 'bg-red-700 text-white',
        avatarText: 'CINEMA',
        description: {
            ar: 'Worldwide box office hits, award-winning features, and top trending cinema releases.',
            en: 'Worldwide box office hits, award-winning features, and top trending cinema releases.'
        },
        keywords: []
    },
    {
        id: 'tv_hub',
        name: 'TV Premier Hub',
        handle: '@tvpremier',
        verified: true,
        subscribers: '12.8M',
        color: 'from-emerald-700 to-zinc-950',
        badgeColor: 'bg-emerald-700 text-white',
        avatarText: 'TV',
        description: {
            ar: 'Exclusive hit television series, worldwide miniseries, and episodic releases.',
            en: 'Exclusive hit television series, worldwide miniseries, and episodic releases.'
        },
        keywords: []
    }
];

// Helper to determine the channel of any movie/series
export function getChannelForMovie(movie) {
    if (!movie) return CHANNELS[8]; // Fallback to Cinema Premiere

    const textToMatch = `${movie.title || ''} ${movie.summary || ''}`.toLowerCase();

    // 1. Check Anime first
    if (movie.type === 'anime') {
        const ghibliKeywords = CHANNELS.find(c => c.id === 'ghibli')?.keywords || [];
        for (const kw of ghibliKeywords) {
            if (textToMatch.includes(kw)) {
                return CHANNELS.find(c => c.id === 'ghibli');
            }
        }
        return CHANNELS.find(c => c.id === 'anime_studios');
    }

    // 2. Check each specific studio channel
    const specificChannels = ['marvel', 'dc', 'ghibli', 'warner_nolan', 'disney_pixar', 'hbo', 'action_saga'];
    for (const chId of specificChannels) {
        const ch = CHANNELS.find(c => c.id === chId);
        if (ch) {
            for (const kw of ch.keywords) {
                if (textToMatch.includes(kw)) {
                    return ch;
                }
            }
        }
    }

    // 3. If series, assign to TV Hub
    if (movie.type === 'series') {
        return CHANNELS.find(c => c.id === 'tv_hub');
    }

    // 4. Default movie to Cinema Premiere
    return CHANNELS.find(c => c.id === 'cinema_premiere');
}
