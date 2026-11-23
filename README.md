# 🧩 Łamigłówki logiczne

Darmowa, rosnąca kolekcja gier logicznych działających prosto w przeglądarce — bez instalacji, bez reklam, bez konta.

**▶️ Graj online: https://dxavvv.github.io/logic-puzzles/**

## 🎮 Dostępne gry

| Gra | Opis |
| --- | --- |
| 🔢 **OD (0) DO (9)** | Cyfry 0–9, unikalne w wierszach, bez sąsiedztwa identycznych w kolumnach. Sumy kolumn jako podpowiedzi. |
| 🧮 **Sudoku** | Klasyczna łamigłówka w rozmiarach 6×6, 9×9 i 12×12, z trzema poziomami trudności. |
| 💡 **Zgaś światła** | Kliknięcie lampki przełącza ją i jej sąsiadów. Zgaś wszystkie w jak najmniejszej liczbie ruchów. |

Kolejne gry pojawiają się regularnie.

## 🚀 Jak zagrać?

1. Wejdź na stronę: **https://dxavvv.github.io/logic-puzzles/**
2. Wybierz grę z listy.
3. Przeczytaj zasady na górze ekranu i baw się dobrze — działa na komputerze i telefonie.

## 💻 Uruchomienie lokalne

Projekt to czysty HTML, CSS i JavaScript — nie wymaga budowania ani zależności.

```bash
git clone https://github.com/dxavvv/logic-puzzles.git
cd logic-puzzles
# otwórz index.html w przeglądarce, albo uruchom prosty serwer:
python -m http.server 8000   # następnie http://localhost:8000
```

## 🗂️ Struktura projektu

```
.
├── index.html        # strona główna z listą gier
├── style.css
├── script.js
└── games/
    └── <nazwa-gry>/  # każda gra w osobnym katalogu
        ├── index.html
        ├── style.css
        └── script.js
```

## ➕ Dodawanie nowej gry

1. Utwórz katalog `games/<nazwa-gry>/` z plikami `index.html`, `style.css` i `script.js`.
2. Dodaj link powrotu (`../../index.html`) oraz krótki opis zasad.
3. Dodaj kartę gry w głównym `index.html` i wpis w tabeli powyżej.

## 🌐 Hosting

Strona jest hostowana bezpłatnie na [GitHub Pages](https://pages.github.com/) bezpośrednio z gałęzi `main`.

## 📄 Licencja

Projekt udostępniony na licencji [MIT](LICENSE).
