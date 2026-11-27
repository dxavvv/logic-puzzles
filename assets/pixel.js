/* Pixel-art: małe sprite'y (SVG generowane z mapy znaków) zamiast emotek.
   Każdy znak w wierszu to kolor z palety, kropka to przezroczystość. */
(function () {
    const PAL = {
        k: '#151528', w: '#f2f4ff', l: '#b8bdd6', g: '#7d84a6', d: '#4a5073',
        b: '#5eb8f7', B: '#2b6cb0', c: '#9af0f5', y: '#ffd35c', Y: '#d19a22',
        o: '#ff9a4d', O: '#c5622a', r: '#ff6b6b', R: '#b23a48', p: '#ff9ad5',
        v: '#b58cff', V: '#6b4fb8', n: '#5cdb8b', N: '#2f9a5a', t: '#d9a066', T: '#8a5a30'
    };

    const S = {
        digits: [
            'kkkkkkkkkkkk', 'kBBBBBBBBBBk', 'kBbbbbbbbbBk', 'kBbwwwwwwbBk', 'kBbbbbbwwbBk', 'kBbbbbwwbbBk',
            'kBbbbwwbbbBk', 'kBbbwwbbbbBk', 'kBbbwwbbbbBk', 'kBbbbbbbbbBk', 'kBBBBBBBBBBk', 'kkkkkkkkkkkk'],
        grid: [
            'kkkkkkkkkkkk', 'kwwwkwwwkwww', 'kwbwkwwwkwBw', 'kwwwkwwwkwww', 'kkkkkkkkkkkk', 'kwwwkwwwkwww', 'kwwwkwrwkwww', 'kwwwkwwwkwww', 'kkkkkkkkkkkk', 'kwwwkwwwkwww', 'kwBwkwwwkwbw', 'kwwwkwwwkwww'],
        bulb: [
            '....kkkk....', '...kyyyyk...', '..kyywyyyk..', '..kywyyyyk..', '..kyyyyyyk..', '..kyyyyyYk..',
            '...kyyyYk...', '....kYYk....', '....kddk....', '....kggk....', '....kddk....', '.....kk.....'],
        pyramid: [
            '............', '.....kk.....', '....kyyk....', '....kyYk....', '...kyyyYk...', '...kyyyYk...',
            '..kyyyyyYk..', '..kyyyyyYk..', '.kyyyyyyyYk.', '.kyyyyyyyYk.', 'kkkkkkkkkkkk', '............'],
        torch: [
            '....kkkk....', '...kyyyyk...', '..kywwyyyk..', '..kyyyyyYk..', '.kkkkkkkkkk.', '....kddk....', '....kddk....', '....kddk....', '....kddk....', '...kddddk...', '..kddddddk..', '..kkkkkkkk..'],
        ring: [
            '............', '...kkkkkk...', '..krrrrrrk..', '.krrkkkkrrk.', '.krk....krk.', '.krk....krk.',
            '.krk....krk.', '.krk....krk.', '.krrkkkkrrk.', '..kRrrrrRk..', '...kkkkkk...', '............'],
        house: [
            '.....kk.....', '....krRk....', '...krrrRk...', '..krrrrrRk..', '.krrrrrrrRk.', 'kkkkkkkkkkkk',
            '.kyyyyyyyyk.', '.kyccyyTTyk.', '.kyccyyTTyk.', '.kyyyyyTTyk.', '.kkkkkkkkkk.', '............'],
        bomb: [
            '.........o.y', '........ko..', '...kkkkkk...', '..kddddddk..', '.kddwdddddk.', '.kdwwdddddk.',
            '.kddddddddk.', '.kddddddddk.', '.kddddddddk.', '..kddddddk..', '...kkkkkk...', '............'],
        anchor: [
            '....kkkk....', '...kwllwk...', '...klkklk...', '...kwllwk...', '.kkkkllkkkk.', '.kwllllllwk.', '.kkkkllkkkk.', '....kllk....', 'kk..kllk..kk', 'klk.kllk.klk', '.kllllllllk.', '..kkkkkkkk..'],
        plus: [
            '............', '....kkkk....', '....knnk....', '....knnk....', '.kkkknnkkkk.', '.knnnnnnnnk.',
            '.knnnnnnnnk.', '.kkkknnkkkk.', '....knnk....', '....knnk....', '....kkkk....', '............'],
        times: [
            'kk........kk', 'krk......krk', '.krk....krk.', '..krk..krk..', '...krkkrk...', '....krrk....',
            '....krrk....', '...krkkrk...', '..krk..krk..', '.krk....krk.', 'krk......krk', 'kk........kk'],
        link: [
            '............', '.kkkk..kkkk.', 'kbbbbkkbbbbk', 'kbkkbbbbkkbk', 'kbk.kbbk.kbk', 'kbkkbbbbkkbk',
            'kbbbbkkbbbbk', '.kkkk..kkkk.', '............', '............', '............', '............'],
        cloud: [
            '............', '....kkk.....', '...kwwwk.kk.', '.kkkwwwkkwwk', 'kwwwwwwwwwwk', 'kwwwwwwwwwlk',
            'kwwwwwwwwllk', '.kllllllllk.', '..kkkkkkkk..', '............', '............', '............'],
        brick: [
            'kkkkkkkkkkkk', 'kooooOkooooO', 'kooooOkooooO', 'kkkkkkkkkkkk', 'ooOkooooOkoo', 'ooOkooooOkoo',
            'kkkkkkkkkkkk', 'kooooOkooooO', 'kooooOkooooO', 'kkkkkkkkkkkk', 'ooOkooooOkoo', 'ooOkooooOkoo'],
        raft: [
            '.......k....', '......kwk...', '.....kwwwk..', '....kwwwwwk.', '...kwwwwwwwk', '.......k....',
            'kkkkkkkkkkkk', 'kTTTTTTTTTTk', '.kTTTTTTTTk.', '..kkkkkkkk..', '............', '............'],
        lighthouse: [
            '....kyyk....', '...kkyykk...', '....kkkk....', '....krrk....', '....kwwk....', '....krrk....',
            '...kwwwwk...', '...krrrrk...', '...kwwwwk...', '..kkkkkkkk..', '............', '............'],
        castle: [
            'kkk.kkkk.kkk', 'kgk.kggk.kgk', 'kgkkkggkkkgk', '.kggggggggk.', '..kggggggk..', '..kggkkggk..',
            '..kggkkggk..', '..kggkkggk..', '.kggggggggk.', 'kkkkkkkkkkkk', '............', '............'],
        news: [
            'kkkkkkkkkkkk', 'kwwwwwwwwwwk', 'kkkkwkkkwwwk', 'kwwkwkwkwkwk', 'kwwkkkwkkkwk', 'kkkwwwwwwkkk',
            'kwwwkkkkwwwk', 'kwkwkwwkwkwk', 'kwkkkwwkkkwk', 'kwwwwwwwwwwk', 'kkkkkkkkkkkk', '............'],
        picture: [
            'kkkkkkkkkkkk', 'kTTTTTTTTTTk', 'kTccccyyccTk', 'kTcccyyyccTk', 'kTccccyyccTk', 'kTccnnccccTk',
            'kTcnNNnccnTk', 'kTnNNNNnnNTk', 'kTNNNNNNNNTk', 'kTTTTTTTTTTk', 'kkkkkkkkkkkk', '............'],
        ten: [
            'kkkkkkkkkkkk', 'kvvvvvvvvvvk', 'kvwvvwwwwwvk', 'kwwvvwvvvwvk', 'kvwvvwvvvwvk', 'kvwvvwvvvwvk',
            'kvwvvwvvvwvk', 'kvwvvwvvvwvk', 'kwwwvwwwwwvk', 'kvvvvvvvvvvk', 'kkkkkkkkkkkk', '............'],
        palette: [
            '............', '...kkkkkk...', '.kkoooorrkk.', 'kooyoooorrrk', 'koyyoookkrrk', 'kooooo.kkprk',
            'kvvoooo..ppk', 'kvvvoooookpk', '.kbbbbooook.', '..kkbbbbkk..', '....kkkk....', '............'],
        arrows: [
            '............', '............', '..k.....k...', '.kk.....kk..', 'kbbkkkkkbbk.', 'kbbbbbbbbbbk',
            'kbbkkkkkbbk.', '.kk.....kk..', '..k.....k...', '............', '............', '............'],
        plank: [
            '............', '..kkkkkkkk..', '.kttttttttk.', 'ktTttttTtttk', 'ktTTttTTttTk', 'kTtttTTttTtk',
            'ktttttttttTk', '.kTTTTTTTTk.', '..kkkkkkkk..', '............', '............', '............'],
        puzzle: [
            '....kkkk....', '...kvvvvk...', '...kvvvvk...', '.kkkvvvvkkk.', 'kvvvvvvvvvvk', 'kvvvvvvvvvvk',
            'kvvvvvvvvvvk', '.kkkvvvvkkk.', '...kvvvvVk..', '...kVVVVVk..', '....kkkkkk..', '............'],
        dice: [
            'kkkkkkkkkkkk', 'kwwwwwwwwwwk', 'kwkkwwwwkkwk', 'kwkkwwwwkkwk', 'kwwwwwwwwwwk', 'kwwwwkkwwwwk',
            'kwwwwkkwwwwk', 'kwwwwwwwwwwk', 'kwkkwwwwkkwk', 'kwkkwwwwkkwk', 'kllllllllllk', 'kkkkkkkkkkkk'],
        check: [
            '............', '............', '..........kk', '.........knk', '........knNk', 'kk.....knNk.',
            'knk...knNk..', '.knk.knNk...', '..knknNk....', '...knNk.....', '....kk......', '............'],
        robot: [
            '.....kk.....', '.....kr.....', '..kkkkkkkk..', '.kggggggggk.', '.kgkbkkbkgk.', '.kgkbkkbkgk.',
            '.kggggggggk.', '.kgkkkkkkgk.', '.kggggggggk.', '..kkkkkkkk..', '.kgk....kgk.', '.kkk....kkk.'],
        refresh: [
            '............', '...kkkkk....', '..kbbbbbk...', '.kbbkkkbbkk.', '.kbk...kbbk.', '.kbk....kbk.',
            '.kbk....kbk.', '.kkk....kbk.', '.......kbbk.', '......kbbk..', '.......kk...', '............'],
        pencil: [
            '.........kk.', '........koYk', '.......koOk.', '......koOk..', '.....kyyk...', '....kyyk....',
            '...kyyk.....', '..kyyk......', '.kttk.......', '.kTtk.......', 'kkkk........', '............'],
        play: [
            '............', '..kk........', '..kbk.......', '..kbbk......', '..kbbbk.....', '..kbbbbk....',
            '..kbbbbk....', '..kbbbk.....', '..kbbk......', '..kbk.......', '..kk........', '............'],
        broom: [
            '.........kk.', '........kTk.', '.......kTk..', '......kTk...', '.....kyyk...', '....kyyyyk..',
            '...kyYyYyk..', '..kyYyYyYyk.', '..kyYyYyYyk.', '..kkkkkkkkk.', '............', '............'],
        target: [
            '....kkkk....', '..kkrrrrkk..', '.krrwwwwrrk.', '.krwwrrwwrk.', 'krwwrkkrwwrk', 'krwrkwwkrwrk',
            'krwrkwwkrwrk', 'krwwrkkrwwrk', '.krwwrrwwrk.', '.krrwwwwrrk.', '..kkrrrrkk..', '....kkkk....'],
        party: [
            '..y.....v...', '.....o......', 'k.......p...', 'kyk..b......', 'krrk....n...', 'krrrk.......',
            'kyrrrk....y.', 'kyyrrrk..o..', 'kYyyrrrk....', '.kYyyyyk....', '..kkkkk.....', '............'],
        gas: [
            '..kkkkkk....', '..kccccck...', '..kcwwwck.k.', '..kccccck.kk', '..kkkkkkk.kk', '..krrrrrk.kk',
            '..krrrrrk.kk', '..krrrrrk.kk', '..krrrrrk.k.', '.kkkkkkkkk..', '.kddddddk...', '.kkkkkkkk...'],
        ship: [
            '.....kk.....', '.....kwk....', '..kkkkwkkk..', '..kwwkwwkwk.', '..kbbkbbkbk.', 'kkkkkkkkkkkk',
            'kRRRRRRRRRRk', '.kRRRRRRRRk.', '..kkkkkkkk..', 'bbbbbbbbbbbb', '.bbb.bbb.bbb', '............'],
        memo: [
            '..kkkkkkkk..', '.kwwwwwwwwk.', '.kwbbbbbwwk.', '.kwwwwwwwwk.', '.kwbbbbwwwk.', '.kwwwwwwwwk.',
            '.kwbbbbbbwk.', '.kwwwwwwwwk.', '.kwbbbwwwwk.', '.kwwwwwwwwk.', '.kkkkkkkkkk.', '............'],
        lock: [
            '....kkkk....', '...kgwwgk...', '...kg..gk...', '...kg..gk...', '.kkkkkkkkkk.', '.kyyyyyyyyk.',
            '.kyyyyyyyyk.', '.kyyykkyyyk.', '.kyyykkyyyk.', '.kYYYYYYYYk.', '.kkkkkkkkkk.', '............'],
        sparkle: [
            '.....kk.....', '.....ky.....', '....kyyk....', '..kkyywykk..', 'kyyywwwwyyyk', '..kkyywykk..',
            '....kyyk....', '.....ky.....', '.....kk.....', '.kk.....kk..', '.kyk...kyk..', '..k.....k...'],
        timer: [
            '....kkkk....', '....kddk....', '..kkkwwkkk..', '.kwwwwkwwwk.', 'kwwwwwkwwwwk', 'kwwwwwkwwwwk',
            'kwwwwwkkkwwk', 'kwwwwwwwwwwk', '.kwwwwwwwwk.', '..kkwwwwkk..', '....kkkk....', '............'],
        trophy: [
            'kkkkkkkkkkkk', 'kyyyyyyyyyyk', 'kyywyyyyyyYk', 'kyywyyyyyyYk', '.kyywyyyyYk.', '..kyyyyyYk..',
            '...kyyyYk...', '....kyYk....', '....kYYk....', '...kkYYkk...', '..kYYYYYYk..', '..kkkkkkkk..'],
        sound: [
            '............', '....k.......', '...kwk..c...', '.kkkwk...c..', 'kwwwwk.c..c.', 'kwwwwk.c..c.', '.kkkwk...c..', '...kwk..c...', '....k.......', '............', '............', '............'],
        mute: [
            '............', '....k.......', '...kwk......', '.kkkwk.r..r.', 'kwwwwk..rr..', 'kwwwwk..rr..', '.kkkwk.r..r.', '...kwk......', '....k.......', '............', '............', '............'],
        calendar: [
            '.kk......kk.', '.kk......kk.', 'kkkkkkkkkkkk', 'kRRRRRRRRRRk', 'kRRRRRRRRRRk', 'kkkkkkkkkkkk',
            'kwwkwwkwwkwk', 'kwwkwwkwwkwk', 'kkkkkkkkkkkk', 'kwwkwwkwwkwk', 'kwwkwwkwwkwk', 'kkkkkkkkkkkk'],
        fire: [
            '.....k......', '....kok.....', '...koyok.k..', '...koyyokok.', '..koyyyyoyok', '..koyyyyyyok',
            '..koyywyyyok', '..koyywwyyok', '...koyywyok.', '....kooook..', '.....kkkk...', '............'],
        star: [
            '.....kk.....', '.....kyk....', '....kyyk....', 'kkkkkyyykkkk', 'kyyyyyyyyyyk', '.kyyyyyyyyk.',
            '..kyyyyyyk..', '..kyyyyyYk..', '.kyyyYkYYYk.', '.kyyYk..kYYk', '.kYk......kk', '.kk.........'],
        tile: [
            '............', '.kkkkkkkkkk.', '.kwwwwwwwwk.', '.kwwwwwwwwk.', '.kwwwwwwwwk.', '.kwwwwwwwwk.',
            '.kwwwwwwwwk.', '.kwwwwwwwwk.', '.kwwwwwwwwk.', '.kkkkkkkkkk.', '............', '............'],
        eye: [
            '............', '............', '...kkkkkk...', '.kkwwwwwwkk.', 'kwwwbbbbwwwk', 'kwwbbkkbbwwk',
            'kwwbbkkbbwwk', 'kwwwbbbbwwwk', '.kkwwwwwwkk.', '...kkkkkk...', '............', '............'],
        warn: [
            '.....kk.....', '....kyyk....', '...kyyyyk...', '...kykkyk...', '..kyykkyyk..', '..kyykkyyk..',
            '.kyyyykkyyyk', '.kyyyyyyyyk.', 'kyyyykkyyyyk', 'kyyyykkyyyyk', 'kkkkkkkkkkkk', '............'],
        globe: [
            '....kkkk....', '..kkbbbbkk..', '.kbbnnbbbbk.', '.kbnnnnbbbk.', 'kbbnnnbbnnbk', 'kbbbnnbbnnbk',
            'kbbbbbbbnbbk', 'kbbbnbbbbbbk', '.kbbnnbbbbk.', '.kbbbnbbbbk.', '..kkbbbbkk..', '....kkkk....'],
        dotb: [
            '............', '....kkkk....', '..kkbbbbkk..', '..kbbwbbbk..', '.kbbwbbbbBk.', '.kbbbbbbbBk.', '.kbbbbbbbBk.', '.kbbbbbbBBk.', '..kbbbbBBk..', '..kkBBBBkk..', '....kkkk....', '............'],
        doto: [
            '............', '....kkkk....', '..kkooookk..', '..koowoook..', '.koowooooOk.', '.koooooooOk.', '.koooooooOk.', '.kooooooOOk.', '..kooooOOk..', '..kkOOOOkk..', '....kkkk....', '............'],
        discs: [
            '.....TT.....', '.....TT.....', '....kRRk....', '...kooook...', '..kyyyyyyk..', '.knnnnnnnnk.', 'kbbbbbbbbbbk', 'kTTTTTTTTTTk', 'kkkkkkkkkkkk'],
        hitori: [
            'kkkkkkkkkkkk', 'kdddkwwwkwww', 'kdddkwbwkwbw', 'kdddkwwwkwww', 'kkkkkkkkkkkk', 'kwwwkdddkwww', 'kwbwkdddkwbw', 'kwwwkdddkwww', 'kkkkkkkkkkkk', 'kwwwkwwwkddd', 'kwbwkwbwkddd', 'kwwwkwwwkddd'],
        island: [
            'bbbbbbbbbbbb', 'bbbbbnnbbbbb', 'bbbbnNNnbbbb', 'bbbbbTTbbbbb', 'bbbyyyTyyybb', 'bbyyyyyyyyyb',
            'byyyyyyyyyyb', 'bbyyyyyyyybb', 'bcbbbbbbbbcb', 'bbbcbbbbcbbb', 'bbbbbbbbbbbb', 'bbbbbbbbbbbb'],
        share: [
            '............', '.......kkk..', '......kbbbk.', '..kkk.kbbbk.', '.kbbbkkbbk..', '.kbbbbbk....',
            '.kbbbkkbbk..', '..kkk.kbbbk.', '......kbbbk.', '.......kkk..', '............', '............']
    };

    // emotka → nazwa sprite'a
    const E = {
        '🔢': 'digits', '🧮': 'grid', '💡': 'bulb', '🔺': 'pyramid', '🔦': 'torch', '⭕': 'ring', '🏠': 'house',
        '💣': 'bomb', '⚓': 'anchor', '➕': 'plus', '✖': 'times', '🔗': 'link', '☁': 'cloud', '🧱': 'brick',
        '🛶': 'raft', '🗼': 'lighthouse', '🏰': 'castle', '📰': 'news', '🖼': 'picture', '🔟': 'ten', '🎨': 'palette',
        '↔': 'arrows', '🪵': 'plank', '🧩': 'puzzle', '🎲': 'dice', '✅': 'check', '🤖': 'robot', '🔄': 'refresh',
        '✏': 'pencil', '▶': 'play', '🧹': 'broom', '🎯': 'target', '🎉': 'party', '⛽': 'gas', '🚢': 'ship',
        '📝': 'memo', '🔒': 'lock', '✨': 'sparkle', '⏱': 'timer', '🏆': 'trophy', '🔊': 'sound', '🔇': 'mute',
        '📅': 'calendar', '🔥': 'fire', '⭐': 'star', '📤': 'share', '🌐': 'globe', '🔵': 'dotb', '🟠': 'doto', '🥞': 'discs', '⬛': 'hitori', '⬜': 'tile', '📋': 'memo', '👁': 'eye', '⚠': 'warn', '❌': 'times', '🔜': 'play', '🏝': 'island'
    };

    const cache = {};
    function uri(name) {
        if (cache[name]) return cache[name];
        const rows = S[name];
        if (!rows) return '';
        const W = Math.max(...rows.map(r => r.length)), H = rows.length;
        let rects = '';
        rows.forEach((row, y) => {
            let x = 0;
            while (x < row.length) {
                const ch = row[x];
                if (ch === '.' || !PAL[ch]) { x++; continue; }
                let e = x;
                while (e + 1 < row.length && row[e + 1] === ch) e++;
                rects += `<rect x="${x}" y="${y}" width="${e - x + 1}" height="1" fill="${PAL[ch]}"/>`;
                x = e + 1;
            }
        });
        const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" shape-rendering="crispEdges">${rects}</svg>`;
        return (cache[name] = 'url("data:image/svg+xml,' + encodeURIComponent(svg) + '")');
    }

    function el(name, extraClass) {
        const s = document.createElement('span');
        s.className = 'px' + (extraClass ? ' ' + extraClass : '');
        s.setAttribute('aria-hidden', 'true');
        s.dataset.px = name;
        s.style.backgroundImage = uri(name);
        return s;
    }

    const css = document.createElement('style');
    css.textContent =
        '.px{display:inline-block;width:1.15em;height:1.15em;background-size:contain;background-repeat:no-repeat;' +
        'background-position:center;image-rendering:pixelated;vertical-align:-.2em;flex:none}' +
        '.cell .px{width:72%;height:72%;vertical-align:middle}' +
        'h1 .px{width:1.05em;height:1.05em;margin-right:.1em;vertical-align:-.12em}' +
        '.card-icon .px{width:56px;height:56px}' +
        'button .px{width:1.2em;height:1.2em;margin-right:.15em}';
    document.head.appendChild(css);

    const keys = Object.keys(E).sort((a, b) => b.length - a.length);
    const RE = new RegExp('(' + keys.join('|') + ')️?', 'g');
    const SKIP = { SCRIPT: 1, STYLE: 1, TEXTAREA: 1, INPUT: 1, SVG: 1, TITLE: 1 };

    function convert(root) {
        if (!root || (root.nodeType !== 1 && root.nodeType !== 3 && root.nodeType !== 11)) return;
        const texts = [];
        if (root.nodeType === 3) texts.push(root);
        else {
            const w = document.createTreeWalker(root, 4);
            let n;
            while ((n = w.nextNode())) if (!SKIP[(n.parentNode.nodeName || '').toUpperCase()]) texts.push(n);
        }
        for (const t of texts) {
            const s = t.nodeValue;
            RE.lastIndex = 0;
            if (!t.parentNode || !RE.test(s)) continue;
            RE.lastIndex = 0;
            const frag = document.createDocumentFragment();
            let last = 0, m;
            while ((m = RE.exec(s))) {
                if (m.index > last) frag.appendChild(document.createTextNode(s.slice(last, m.index)));
                frag.appendChild(el(E[m[1]]));
                last = m.index + m[0].length;
            }
            if (last < s.length) frag.appendChild(document.createTextNode(s.slice(last)));
            t.parentNode.replaceChild(frag, t);
        }
    }

    function start() {
        convert(document.body);
        new MutationObserver(list => {
            for (const m of list) m.addedNodes.forEach(n => convert(n));
        }).observe(document.body, { childList: true, subtree: true });
    }

    window.Px = { sprites: S, palette: PAL, emoji: E, uri, el, convert };
    if (document.body) start(); else document.addEventListener('DOMContentLoaded', start);
})();
