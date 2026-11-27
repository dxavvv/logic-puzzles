<div align="center">

# 🧩 Logic Puzzles

**A free collection of logic puzzles that run right in your browser.**
No installation, no ads, no account.

[![Play online](https://img.shields.io/badge/▶_Play_online-dxavvv.github.io-5eb8f7?style=for-the-badge)](https://dxavvv.github.io/logic-puzzles/)

![Games](https://img.shields.io/badge/games-27-5cdb8b) ![Tech](https://img.shields.io/badge/HTML%20%7C%20CSS%20%7C%20JS-no%20dependencies-f0c060) ![License](https://img.shields.io/badge/license-MIT-8899bb)

🇬🇧 English · 🇵🇱 [Wersja polska](README.pl.md)

</div>

---

## ✨ Why you'll like it

- 🎲 **Endless boards** – every game generates new puzzles in several sizes and on three difficulty levels.
- ✏️ **Your own puzzles** – almost every game lets you build a custom board of any size (see [below](#️-your-own-puzzles)).
- 📅 **Daily challenge and shareable boards** – the same puzzle for everyone, and you can send any board to a friend as a link.
- ⏱️ **Timer, records and stats** – a solving timer, a best time for every size and level, and a streak of days with a solved puzzle.
- 🎨 **Pixel-art look** – hand-drawn pixel-art icons, pixel confetti after a win and four colour themes.
- 🌐 **Polish and English** – switch the language with one click; the site picks the language from your browser settings and time zone (Polish for Poland, English elsewhere) and remembers your choice.
- ✅ **Rule-based checking** – any valid solution is accepted, not just the "reference" one.
- 📱 **Built for phones** – compact layout, an on-screen number pad instead of the keyboard, collapsible rules, and you can install it as an app and play offline (see [below](#-on-your-phone)).
- 🔒 **Private** – everything happens in your browser; records and settings are stored locally only (`localStorage`), nothing is sent anywhere.

## 🚀 Getting started

1. Open **https://dxavvv.github.io/logic-puzzles/** (add `?lang=pl` for the Polish version)
2. Pick a game from the list.
3. Read the short rules at the top of the page and start playing.

Every game page has the same buttons:

| Button | What it does |
| --- | --- |
| 🎲 **New game** | Generates a new board (choose the size and level above). |
| ✅ **Check** | Highlights mistakes or congratulates you on solving it. |
| 🤖 **Solve** | Shows an example solution (a revealed solution does not count towards records). |
| 🔄 **Reset** | Goes back to the start of the current board. |
| ✏️ **Custom board** | Opens the editor where you build your own variant. |

Below them is a bar with extras:

| Item | What it does |
| --- | --- |
| ⏱️ **Time** | Measures your solving time; it stops after a win and while the tab is in the background. |
| 🏆 **Record** | Your best time for the given game, size and level. |
| 📅 **Daily challenge** | Loads the board that is the same for all players today. |
| 📤 **Share** | Copies a link to the current board; whoever opens it sees exactly the same puzzle. |
| 🔊 **Sound** | Turns short retro sounds on and off (on by default). |
| 🎨 **Theme** | Cycles through the themes: Night, Retro, Dusk and Ice. |
| 🌐 **Language** | Switches between Polish and English and keeps your current board. |

The home page also has a **search box**, **category filters**, a **random game** button, statistics and badges next to the games you have solved.

## 🎮 Games

### 🔢 Digits and Latin squares

| Game | Rules in short |
| --- | --- |
| 🔢 **FROM (0) TO (9)** (*OD (0) DO (9)*) | Digits 0–9 are unique in every row, identical digits cannot touch in the columns; column sums are the clues. |
| 🧮 **Sudoku** | The classic, in 6×6, 9×9 and 12×12. |
| 🔗 **Chain Sudoku** (*Łańcuch sudoku*) | Sudoku with irregular regions instead of 3×3 blocks. |
| 🔟 **Renban Sudoku** (*Sudoku Renban*) | Sudoku with lines on which the digits form a set of consecutive numbers in any order. |
| 🔺 **Pyramids** (*Piramidy*) | Enter pyramid heights so that the numbers of visible pyramids match the clues on every side. |
| ➕ **Operations** (*Działania*) | The bold regions must give the stated results of operations (+, −, ×, :). |
| ✖️ **Diagonal Operations** (*Ukośne działania*) | The digits around a circle must give the stated result along both diagonals. |
| ↔️ **Less–Greater** (*Mniejsze–większe*) | Enter digits with no repeats so that all the inequality signs hold. |
| 🪵 **Parquet** (*Parkiet*) | Enter digits into the parquet planks so that every row and column holds each digit the same number of times. |
| 🧱 **Filomino** | Fill in digits so that the block of digit *n* consists of exactly *n* cells. |
| 📰 **Number Crossword** (*Krzyżówka liczbowa*) | Kakuro: enter digits 1–9 so that the horizontal and vertical sums match. |

### 🖌️ Painting

| Game | Rules in short |
| --- | --- |
| 🔵 **Binairo** | Fill the board with blue and orange dots: equal numbers in every row and column, never three alike in a row, no identical lines. |
| 🏝️ **Nurikabe** | Shade the sea so every island has exactly one number and as many cells as it says; the sea stays connected with no 2×2 blocks. |
| ⬛ **Hitori** | Shade repeated numbers so every row and column keeps unique ones, shaded cells do not touch and the rest stays connected. |
| 🖼️ **Picture Logic** (*Obrazek logiczny*) | Nonogram: shade cells according to the numbers beside rows and columns to reveal the picture. |
| 🎨 **Mosaic** (*Mozaika*) | A digit tells how many cells around it (including itself) are shaded. |
| 💣 **Minesweeper Path** (*W sapera*) | Shaded cells must form one path that matches the digits. |
| ☁️ **Clouds** (*Chmury*) | Place rectangular clouds that do not touch, not even at corners. |
| 🛶 **Rafts** (*Tratwy*) | White rectangular rafts have the given sizes and connect at their corners. |
| 🏰 **Towers** (*Wieże*) | Numbers show how many white cells are visible from a tower; the white cells form one whole. |

### 🧭 Placement and loops

| Game | Rules in short |
| --- | --- |
| 🔦 **Lamps** (*Lampki*) | Light up all the white cells so that no lamp shines on another. |
| 🏠 **Architect's Puzzle** (*Łamigłówka architekta*) | Put a gas tank next to every house; tanks cannot touch. |
| ⚓ **Sea Minesweeper** (*Saper na morzu*) | Place ships according to the digits and the given fleet. |
| 🗼 **Lighthouses** (*Latarnie*) | Every ship must be lit and the numbers next to the lighthouses must match. |
| ⭕ **Dot Loop** (*Wielokropka*) | Join the dots with one loop so that numbers tell along how many sides of a cell the loop runs. |
| 💡 **Lights Out** (*Zgaś światła*) | Clicking a lamp toggles it and its neighbours. Turn them all off in as few moves as possible. |
| 🥞 **Tower of Hanoi** (*Wieże Hanoi*) | Move the discs between pegs one at a time, never a larger one onto a smaller one. Fewest moves wins; the optimal count is shown. |

> More puzzles are added regularly.

## ✏️ Your own puzzles

Most games have a **"✏️ Custom board"** button that lets you build your own variant:

1. **Choose the size** – any number of rows and columns (or an `n×n` size in Latin-square games).
2. **Enter the clues** – sums along the edges, starting digits, numbers in cells, inequality signs, circles at crossings, your own fleet of ships and so on.
3. **Draw the structure** – in games with regions, lines or planks (Operations, Chain Sudoku, Renban Sudoku, Parquet, Number Crossword) you draw them yourself.
4. **Press ▶ Play** – the game checks that the board is set up correctly and you can start solving right away.

💡 **Tips**

- If you open the editor in the middle of a game, it starts from the current puzzle, so you can simply tweak it.
- For custom boards the "Solve" button is unavailable (there is no reference solution), but **Check** still points out mistakes.
- **Lights Out**, **Sudoku** and **FROM (0) TO (9)** have their own modes: any size, your own lamp layout, an empty board for entering your own digits and editable sums.

## 📱 On your phone

- **Number pad** – on touch screens a big on-screen keypad replaces the system keyboard, so it never covers the board (it only enables the digits the board allows).
- **Compact layout** – a wide board, large tap targets and a toolbar reduced to icons; boards that are too large for the screen scroll sideways instead of getting tiny cells.
- **Rules that get out of the way** – the rules are open the first time you visit a game and fold into one line afterwards (tap them to open).
- **Install it** – use "Add to Home screen" (or "Install app" in Chrome) and the site opens like a native app, full screen.
- **Offline** – after the first visit the games work without a connection.

## 💻 Running locally

The project is plain HTML, CSS and JavaScript – no build step and no dependencies.

```bash
git clone https://github.com/dxavvv/logic-puzzles.git
cd logic-puzzles
# open index.html in a browser, or start a simple server:
python -m http.server 8000   # then http://localhost:8000
```

## 🗂️ Project structure

```
.
├── index.html            # home page with the list of games
├── manifest.webmanifest  # installable app description
├── sw.js                 # service worker: offline play
├── assets/
│   ├── base.css          # shared game styles
│   ├── common.js         # shared library (object G): boards, generators, editor, board seeds
│   ├── pixel.js          # pixel-art engine: SVG sprites instead of emoji
│   ├── fx.js             # timer, records, confetti, sound, themes
│   ├── i18n.js           # Polish / English language support
│   ├── mobile.css        # phone layout and the number pad
│   ├── mobile.js         # number pad, collapsible rules, service worker registration
│   └── icons/            # app icons (PWA)
└── games/
    └── <game-name>/      # every game in its own directory
        ├── index.html    # game page and rules
        └── script.js     # logic: generating, checking, editor
```

Icons and emoji in text are replaced automatically by `assets/pixel.js`: add a new sprite as a 12×12 character map in the `S` object and assign it an emoji in `E`.

Texts are written in Polish in the code and HTML, and `assets/i18n.js` swaps them for English in the browser (a dictionary plus patterns for messages with numbers). The language is chosen with `?lang=en` / `?lang=pl` and remembered in `localStorage`. Without a choice it is guessed locally from the browser's preferred language and time zone (no geolocation service is contacted, so nothing about visitors leaves their browser): Polish for Polish-language browsers or the Europe/Warsaw time zone, English otherwise.

All paths are relative, so the site works both locally and under `/logic-puzzles/`.

## ➕ Adding a new game

1. Create a `games/<game-name>/` directory with `index.html` and `script.js` (you can model it on any existing game).
2. Add a back link (`../../index.html`) and a short description of the rules in Polish.
3. Hook the game up with `G.wire({ newGame, check, solve, reset })`. Base checking on the rules rather than on comparing with a stored solution.
4. Optionally add an `edit` object (`params`, `hint`, `begin`, `play`) and the game gets a "Custom board" button.
5. Include `assets/i18n.js`, `assets/pixel.js`, `assets/fx.js` and `assets/mobile.js` before `common.js`, plus `assets/mobile.css` – the game immediately gets a timer, records, a board link and the daily challenge.
6. Add English translations of the new texts to `assets/i18n.js` (`EXACT`, `PATTERNS` and the `RULES` entry for the game's rules).
7. Add the game card to the main `index.html` (and its category in `script.js`) and an entry in the tables above.
8. Add the game's files to the `FILES` list in `sw.js` and bump `VERSION`, so it also works offline.

## 🌐 Hosting

The site is hosted for free on [GitHub Pages](https://pages.github.com/) straight from the `main` branch (root directory).

## 📄 License

Released under the [MIT license](LICENSE).
