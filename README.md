# 🧩 Łamigłówki logiczne

Darmowa, rosnąca kolekcja gier logicznych działających prosto w przeglądarce — bez instalacji, bez reklam, bez konta.

**▶️ Graj online: https://dxavvv.github.io/logic-puzzles/**

## 🎮 Dostępne gry

| Gra | Opis |
| --- | --- |
| 🔢 **OD (0) DO (9)** | Cyfry 0–9, unikalne w wierszach, bez sąsiedztwa identycznych w kolumnach. Sumy kolumn jako podpowiedzi. |
| 🧮 **Sudoku** | Klasyczna łamigłówka w rozmiarach 6×6, 9×9 i 12×12, z trzema poziomami trudności. |
| 💡 **Zgaś światła** | Kliknięcie lampki przełącza ją i jej sąsiadów. Zgaś wszystkie w jak najmniejszej liczbie ruchów. |
| 🔺 **Piramidy** | Wpisz wysokości piramid tak, aby zgadzały się liczby widocznych piramid z każdej strony planszy. |
| 🔦 **Lampki** | Ustaw lampki tak, aby oświetlić wszystkie białe pola, a żadna lampka nie świeciła na inną. |
| ⭕ **Wielokropka** | Połącz kropki jedną pętlą tak, aby liczby w kratkach mówiły, po ilu bokach biegnie pętla. |
| 🏠 **Łamigłówka architekta** | Przy każdym domku umieść zbiornik z gazem tak, aby zbiorniki nie stykały się nawet rogami. |
| 💣 **W sapera** | Zamaluj pola tak, aby cyfry mówiły, ile sąsiednich pól jest zamalowanych, a całość tworzyła jedną ścieżkę. |
| ⚓ **Saper na morzu** | Rozmieść okręty tak, aby cyfry mówiły, na ilu sąsiednich polach stoją okręty. |
| ➕ **Działania** | Wpisz cyfry bez powtórzeń w wierszach i kolumnach tak, aby pogrubione obszary dawały podane wyniki. |
| ✖️ **Ukośne działania** | Cyfry w czterech polach wokół kółka muszą dawać wynik działania po obu przekątnych. |
| 🔗 **Łańcuch sudoku** | Sudoku z nieregularnymi obszarami (łańcuchami) zamiast kwadratów 3×3. |
| ☁️ **Chmury** | Rozmieść prostokątne chmury tak, aby nie stykały się nawet rogami, a liczby zgadzały się z wierszami i kolumnami. |
| 🧱 **Filomino** | Podziel planszę na bloki i uzupełnij cyfry – każdy blok ma tyle pól, ile wskazuje jego liczba. |
| 🛶 **Tratwy** | Zamaluj pola tak, aby białe tratwy-prostokąty miały podane rozmiary i łączyły się rogami. |
| 🗼 **Latarnie** | Rozmieść statki tak, aby każdy był oświetlony, a liczby przy latarniach się zgadzały. |
| 🏰 **Wieże** | Ustaw wieże tak, aby liczby pokazywały, ile białych pól widać, a białe pola tworzyły jedną całość. |
| 📰 **Krzyżówka liczbowa** | Kakuro: wpisz cyfry 1–9 tak, aby zgadzały się sumy poziome i pionowe. |
| 🖼️ **Obrazek logiczny** | Nonogram: zamaluj pola według liczb przy wierszach i kolumnach, aby odkryć obrazek. |
| 🔟 **Sudoku Renban** | Sudoku z obszarami, w których cyfry tworzą zbiór kolejnych liczb w dowolnej kolejności. |
| 🎨 **Mozaika** | Zamaluj kratki tak, aby cyfry mówiły, ile pól wokół (razem z nimi) jest zamalowanych. |
| ↔️ **Mniejsze–większe** | Wpisz cyfry bez powtórzeń tak, aby spełnione były wszystkie znaki nierówności. |
| 🪵 **Parkiet** | Wpisz cyfry w klepki parkietu tak, aby w każdym wierszu i kolumnie było tyle samo cyfr każdego rodzaju. |

Kolejne gry pojawiają się regularnie.

## 🚀 Jak zagrać?

1. Wejdź na stronę: **https://dxavvv.github.io/logic-puzzles/**
2. Wybierz grę z listy.
3. Przeczytaj zasady na górze ekranu i baw się dobrze — działa na komputerze i telefonie.

## ✏️ Własne łamigłówki

Większość gier ma przycisk **„✏️ Własna plansza”**. Pozwala on ułożyć własny wariant:

- wybierasz **dowolną liczbę wierszy i kolumn** (albo rozmiar `n×n` dla gier z kwadratem łacińskim),
- sam wpisujesz **wskazówki i liczby** (np. sumy przy brzegach, cyfry początkowe, liczby w polach),
- w grach z obszarami, liniami lub klepkami **rysujesz je sam** (Działania, Łańcuch sudoku, Sudoku Renban, Parkiet, Krzyżówka liczbowa),
- klikasz **▶ Zagraj** i rozwiązujesz własną planszę – gra sprawdza ją według zasad.

Przycisk „Rozwiąż” nie działa dla własnych plansz (nie ma rozwiązania wzorcowego), za to „Sprawdź” podpowiada błędy.
Jeśli zaczniesz edycję w trakcie gry, plansza startuje od bieżącej łamigłówki, więc możesz ją po prostu zmodyfikować.
W **Zgaś światła**, **Sudoku** i **OD (0) DO (9)** własne układy są dostępne w ich własnych panelach.

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
4. Opcjonalnie przekaż w `G.wire({ ..., edit })` obiekt edytora (`params`, `begin`, `play`), aby gra dostała przycisk „Własna plansza”.

## 🌐 Hosting

Strona jest hostowana bezpłatnie na [GitHub Pages](https://pages.github.com/) bezpośrednio z gałęzi `main`.

## 📄 Licencja

Projekt udostępniony na licencji [MIT](LICENSE).
