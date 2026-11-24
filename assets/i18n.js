/* Wersje językowe (PL / EN). Polski jest domyślnym tekstem w kodzie i w HTML,
   a angielski jest podmieniany w przeglądarce: słownik + wzorce dla komunikatów
   z liczbami, także dla tekstów tworzonych dynamicznie (statusy, podpowiedzi itp.).
   Wybór języka: ?lang=en|pl w adresie, zapisany w localStorage, a domyślnie język przeglądarki. */
(function () {
    const store = {
        get(k) { try { return localStorage.getItem(k); } catch (e) { return null; } },
        set(k, v) { try { localStorage.setItem(k, v); } catch (e) { /* tryb prywatny */ } }
    };
    // Bez zewnętrznych usług geolokalizacji (prywatność i hosting statyczny): kraj odgadujemy lokalnie
    // z preferowanego języka przeglądarki oraz strefy czasowej (Europe/Warsaw = Polska).
    function detect() {
        const langs = (navigator.languages && navigator.languages.length ? navigator.languages : [navigator.language || '']);
        if (/^pl\b/i.test(langs[0] || '')) return 'pl';
        let tz = '';
        try { tz = Intl.DateTimeFormat().resolvedOptions().timeZone || ''; } catch (e) { /* brak Intl */ }
        if (tz === 'Europe/Warsaw') return 'pl';
        return 'en';
    }
    const q = new URLSearchParams(location.search).get('lang');
    if (q === 'pl' || q === 'en') store.set('lp:lang', q);
    let lang = store.get('lp:lang');
    if (lang !== 'pl' && lang !== 'en') lang = detect();
    document.documentElement.lang = lang;

    // ---------- słownik dokładnych dopasowań ----------
    const EXACT = {
        // wspólne
        'Powrót do menu': 'Back to menu', 'Zasady:': 'Rules:', 'Rozmiar:': 'Size:', 'Poziom:': 'Level:',
        'Łatwy': 'Easy', 'Średni': 'Medium', 'Trudny': 'Hard',
        'Nowa gra': 'New game', 'Sprawdź': 'Check', 'Rozwiąż': 'Solve', 'Resetuj': 'Reset',
        'Własna plansza': 'Custom board', 'Zagraj': 'Play', 'Wyczyść': 'Clear', 'Anuluj': 'Cancel',
        'Ułóż własną planszę': 'Create your own board', 'Wiersze': 'Rows', 'Kolumny': 'Columns',
        'Rozmiar n×n': 'Size n×n', 'Wyzwanie dnia': 'Daily challenge', 'Udostępnij': 'Share', 'Dźwięk': 'Sound',
        'Noc': 'Night', 'Retro': 'Retro', 'Zmierzch': 'Dusk', 'Lód': 'Ice', 'Czas': 'Time',
        'Tryb': 'Mode', 'Działanie': 'Operation', 'Wynik': 'Result', 'Obszar': 'Region', 'Kierunek': 'Direction',
        'Układ planszy': 'Board layout', 'Sumy': 'Sums', 'Cyfry': 'Digits', 'Obszary': 'Regions',
        'Układ klepek': 'Plank layout', 'poziomo': 'horizontal', 'pionowo': 'vertical', 'Linie': 'Lines', 'Kółka': 'Circles',
        'Nowy obszar': 'New region', 'Nowa linia': 'New line', 'Losowy układ': 'Random layout',
        '= (cyfra)': '= (digit)', 'P (parzyste)': 'P (even)', 'N (nieparzyste)': 'N (odd)',
        'Długość klepki': 'Plank length', 'Flota (długości okrętów)': 'Fleet (ship lengths)',
        'Rozmiar (4, 6 lub 9)': 'Size (4, 6 or 9)', 'Wysokość (H)': 'Height (H)', 'Szerokość (W)': 'Width (W)',
        'Generuj nową': 'Generate new', 'Generuj pustą': 'Generate empty', 'Rozwiąż za mnie': 'Solve for me',
        'Pusta plansza': 'Empty board', 'Podpowiedź': 'Hint',
        'Generuj łamigłówkę z częściowo ukrytymi polami': 'Generate a puzzle with some cells hidden',
        'Generuj całkowicie pustą planszę (tylko sumy kolumn)': 'Generate a completely empty board (column sums only)',
        'Sprawdź poprawność wypełnienia': 'Check that the board is filled in correctly',
        'Rozwiąż za mnie (solver)': 'Solve it for me (solver)',
        'Przywróć stan początkowy': 'Restore the initial state',
        'Skopiuj link:': 'Copy the link:',
        'Link skopiowany do schowka': 'Link copied to the clipboard',
        'Własnej planszy nie da się udostępnić linkiem': 'A custom board cannot be shared as a link',
        'Nowy rekord!': 'New record!', 'Pierwszy wynik zapisany!': 'First result saved!',
        // strona główna
        'Łamigłówki logiczne': 'Logic puzzles', 'Łamigłówka logiczna': 'Logic puzzle',
        'Wybierz grę i wytęż umysł': 'Pick a game and exercise your mind',
        'Wszystkie': 'All', 'Zamalowywanie': 'Painting', 'Rozmieszczanie': 'Placement', 'Losowa gra': 'Random game',
        'Szukaj gry…': 'Search games…', 'Szukaj gry': 'Search games', 'Kategoria': 'Category',
        'Wyszukiwanie i filtry': 'Search and filters',
        'Brak gier pasujących do wyszukiwania.': 'No games match your search.',
        'Graj →': 'Play →', 'Wkrótce…': 'Coming soon…', 'Nowe wyzwania już w przygotowaniu.': 'New challenges are on the way.',
        'Już niedługo': 'Soon', 'Miłego rozwiązywania!': 'Happy solving!',
        'Gry:': 'Games:', 'Rozwiązane:': 'Solved:', 'Różne gry:': 'Different games:', 'Seria dni:': 'Day streak:',
        // nazwy gier
        'OD (0) DO (9)': 'FROM (0) TO (9)', 'Zgaś światła': 'Lights Out', 'Piramidy': 'Pyramids', 'Lampki': 'Lamps',
        'Wielokropka': 'Dot Loop', 'Łamigłówka architekta': "Architect's Puzzle", 'W sapera': 'Minesweeper Path',
        'Saper na morzu': 'Sea Minesweeper', 'Działania': 'Operations', 'Ukośne działania': 'Diagonal Operations',
        'Łańcuch sudoku': 'Chain Sudoku', 'Chmury': 'Clouds', 'Tratwy': 'Rafts', 'Latarnie': 'Lighthouses',
        'Wieże': 'Towers', 'Krzyżówka liczbowa': 'Number Crossword', 'Obrazek logiczny': 'Picture Logic',
        'Sudoku Renban': 'Renban Sudoku', 'Mozaika': 'Mosaic', 'Mniejsze–większe': 'Less–Greater', 'Parkiet': 'Parquet',
        // opisy kart
        'Cyfry 0–9, unikalne w wierszach, bez sąsiedztwa identycznych w kolumnach. Sumy kolumn jako podpowiedzi.':
            'Digits 0–9, unique in every row, with no identical digits touching in the columns. Column sums are the clues.',
        'Klasyczna łamigłówka 9×9. Wypełnij planszę tak, aby w każdym wierszu, kolumnie i bloku 3×3 znalazły się cyfry od 1 do 9.':
            'The classic 9×9 puzzle. Fill the grid so that every row, column and 3×3 block contains the digits 1 to 9.',
        'Kliknięcie lampki przełącza ją i jej sąsiadów. Zgaś wszystkie światła w jak najmniejszej liczbie ruchów.':
            'Clicking a light toggles it and its neighbours. Turn all the lights off in as few moves as possible.',
        'Wpisz wysokości piramid tak, aby zgadzały się liczby widocznych piramid z każdej strony planszy.':
            'Enter the pyramid heights so that the number of visible pyramids matches the clues on every side.',
        'Ustaw lampki tak, aby oświetlić wszystkie białe pola, a żadna lampka nie świeciła na inną.':
            'Place lamps so that every white cell is lit and no lamp shines on another.',
        'Połącz kropki jedną pętlą tak, aby liczby w kratkach mówiły, po ilu bokach biegnie pętla.':
            'Join the dots with one loop so that each number tells how many of its sides the loop runs along.',
        'Przy każdym domku umieść zbiornik z gazem tak, aby zbiorniki nie stykały się nawet rogami.':
            'Put a gas tank next to every house so that no tanks touch, not even at the corners.',
        'Zamaluj pola tak, aby cyfry mówiły, ile sąsiednich pól jest zamalowanych, a całość tworzyła jedną ścieżkę.':
            'Shade cells so that the digits tell how many neighbouring cells are shaded and everything forms one path.',
        'Rozmieść okręty tak, aby cyfry mówiły, na ilu sąsiednich polach stoją okręty.':
            'Place ships so that the digits tell on how many neighbouring cells ships stand.',
        'Wpisz cyfry bez powtórzeń w wierszach i kolumnach tak, aby pogrubione obszary dawały podane wyniki.':
            'Enter digits with no repeats in rows and columns so that the bold regions give the stated results.',
        'Cyfry w czterech polach wokół kółka muszą dawać wynik działania po obu przekątnych.':
            'The digits in the four cells around a circle must give the stated result along both diagonals.',
        'Sudoku z nieregularnymi obszarami (łańcuchami) zamiast kwadratów 3×3.':
            'Sudoku with irregular regions (chains) instead of 3×3 squares.',
        'Rozmieść prostokątne chmury tak, aby nie stykały się nawet rogami, a liczby zgadzały się z wierszami i kolumnami.':
            'Place rectangular clouds so that they do not touch, not even at the corners, and the numbers match the rows and columns.',
        'Podziel planszę na bloki i uzupełnij cyfry – każdy blok ma tyle pól, ile wskazuje jego liczba.':
            'Split the board into blocks and fill in the digits: every block has as many cells as its number says.',
        'Zamaluj pola tak, aby białe tratwy-prostokąty miały podane rozmiary i łączyły się rogami.':
            'Shade cells so that the white rectangular rafts have the given sizes and connect at their corners.',
        'Rozmieść statki tak, aby każdy był oświetlony, a liczby przy latarniach się zgadzały.':
            'Place ships so that each one is lit and the numbers next to the lighthouses match.',
        'Ustaw wieże tak, aby liczby pokazywały, ile białych pól widać, a białe pola tworzyły jedną całość.':
            'Place towers so that the numbers show how many white cells are visible and the white cells form one connected area.',
        'Kakuro: wpisz cyfry 1–9 tak, aby zgadzały się sumy poziome i pionowe.':
            'Kakuro: enter the digits 1–9 so that the horizontal and vertical sums match.',
        'Nonogram: zamaluj pola według liczb przy wierszach i kolumnach, aby odkryć obrazek.':
            'Nonogram: shade cells according to the numbers beside the rows and columns to reveal the picture.',
        'Sudoku z obszarami, w których cyfry tworzą zbiór kolejnych liczb w dowolnej kolejności.':
            'Sudoku with lines on which the digits form a set of consecutive numbers in any order.',
        'Zamaluj kratki tak, aby cyfry mówiły, ile pól wokół (razem z nimi) jest zamalowanych.':
            'Shade cells so that each digit tells how many cells around it (including itself) are shaded.',
        'Wpisz cyfry bez powtórzeń tak, aby spełnione były wszystkie znaki nierówności.':
            'Enter digits with no repeats so that all the inequality signs hold.',
        'Wpisz cyfry w klepki parkietu tak, aby w każdym wierszu i kolumnie było tyle samo cyfr każdego rodzaju.':
            'Enter digits in the parquet planks so that every row and column has the same number of each digit.',
        // statusy i komunikaty
        'Uzupełnij planszę.': 'Fill in the board.', 'Uzupełnij brakujące cyfry.': 'Fill in the missing digits.',
        'Uzupełnij klepki.': 'Fill in the planks.', 'Uzupełnij białe pola cyframi 1–9.': 'Fill the white cells with digits 1–9.',
        'Są błędy – zaznaczone pola łamią zasady.': 'There are errors: the highlighted cells break the rules.',
        'Są błędy – zaznaczone pola lub kółka łamią zasady.': 'There are errors: the highlighted cells or circles break the rules.',
        'Są błędy – zaznaczone bloki mają zły rozmiar.': 'There are errors: the highlighted blocks have the wrong size.',
        'Brawo! Rozwiązane.': 'Well done! Solved.', 'Brawo! Wszystko oświetlone.': 'Well done! Everything is lit.',
        'Brawo! Wszystkie sumy się zgadzają.': 'Well done! All the sums match.',
        'Brawo! Obrazek odkryty.': 'Well done! Picture revealed.', 'Brawo! Pętla jest poprawna.': 'Well done! The loop is correct.',
        'Gratulacje! Plansza całkowicie poprawna!': 'Congratulations! The board is completely correct!',
        'Gratulacje! Sudoku rozwiązane!': 'Congratulations! Sudoku solved!',
        'Pokazano przykładowe rozwiązanie.': 'Showing an example solution.',
        'Niektóre liczby (czerwone) się nie zgadzają.': 'Some numbers (red) do not match.',
        'Postaw przy każdym domku zbiornik.': 'Put a tank next to every house.',
        'Zbiorniki nie mogą się stykać – nawet rogiem.': 'Tanks cannot touch, not even at a corner.',
        'Przy każdym domku musi stać dokładnie jeden zbiornik (po jego boku).': 'Exactly one tank must stand next to every house (on its side).',
        'Postaw przynajmniej jeden domek.': 'Place at least one house.',
        'Zamaluj pola, w których są chmury.': 'Shade the cells that contain clouds.',
        'Chmury muszą być prostokątami o bokach ≥ 2 i nie mogą się stykać (nawet rogami).': 'Clouds must be rectangles with sides ≥ 2 and cannot touch (not even at corners).',
        'Zamaluj pola chmur.': 'Shade the cloud cells.',
        'Każde pole musi należeć do jakiegoś obszaru.': 'Every cell must belong to a region.',
        'Każdy obszar potrzebuje wyniku (dodatnia liczba).': 'Every region needs a result (a positive number).',
        'Działania „−” i „:” wymagają obszaru z dokładnie dwóch pól.': 'The operations “−” and “:” need a region of exactly two cells.',
        'Obszar „=” to jedno pole z cyfrą od 1 do n.': 'A “=” region is a single cell with a digit from 1 to n.',
        'Każdy obszar musi być spójny (pola stykają się bokami).': 'Every region must be connected (cells touch along their sides).',
        'Wpisz co najmniej jedną cyfrę.': 'Enter at least one digit.',
        'Plansza nie ma żadnych białych pól.': 'The board has no white cells.',
        'Seria może mieć najwyżej 9 pól (cyfry się nie powtarzają).': 'A run can have at most 9 cells (digits cannot repeat).',
        'Oświetl wszystkie białe pola.': 'Light up all the white cells.',
        'Niektóre lampki oświetlają się nawzajem.': 'Some lamps light each other.',
        'Liczby przy czarnych polach nie zgadzają się z lampkami.': 'The numbers next to black cells do not match the lamps.',
        'Potrzebne jest co najmniej jedno białe pole.': 'At least one white cell is needed.',
        'Cyfry początkowe łamią zasady (powtórzenie w wierszu, kolumnie lub obszarze).': 'The starting digits break the rules (a repeat in a row, column or region).',
        'Rozmieść statki w zasięgu latarni.': 'Place ships within reach of the lighthouses.',
        'Statki nie mogą stykać się ze sobą ani z latarniami – także rogami.': 'Ships cannot touch each other or the lighthouses, not even at corners.',
        'Każdy statek musi być oświetlony przez latarnię.': 'Every ship must be lit by a lighthouse.',
        'Liczby przy latarniach (czerwone) się nie zgadzają.': 'The numbers next to the lighthouses (red) do not match.',
        'Rozmieść statki.': 'Place the ships.',
        'Wpisz co najmniej jedną latarnię.': 'Enter at least one lighthouse.',
        'Latarnie nie mogą się stykać (nawet rogami).': 'Lighthouses cannot touch (not even at corners).',
        'Zgaś wszystkie światła.': 'Turn off all the lights.',
        'Zapal przynajmniej jedną lampkę.': 'Light at least one lamp.',
        'Tego układu nie da się rozwiązać – zmień zapalone lampki.': 'This layout cannot be solved: change which lamps are lit.',
        'Własna plansza – zgaś wszystkie światła.': 'Custom board: turn off all the lights.',
        'Brak rozwiązania z tego stanu.': 'There is no solution from this state.',
        'Cyfry początkowe powtarzają się w wierszu lub kolumnie.': 'The starting digits repeat in a row or column.',
        'Zamaluj kratki zgodnie z cyframi.': 'Shade cells according to the digits.',
        'Zamaluj pola według liczb.': 'Shade cells according to the numbers.',
        'Któryś wiersz ma bloki, które nie mieszczą się w jego długości.': 'A row has blocks that do not fit into its length.',
        'Któraś kolumna ma bloki, które nie mieszczą się w jej długości.': 'A column has blocks that do not fit into its length.',
        'Sumy zmienione – teraz to własna łamigłówka.': 'Sums changed: this is now your own puzzle.',
        'Generowanie łamigłówki...': 'Generating the puzzle...',
        'Nie udało się wygenerować planszy.': 'Could not generate a board.',
        'Pusta plansza gotowa. Możesz też edytować sumy.': 'Empty board ready. You can also edit the sums.',
        'Najpierw wygeneruj łamigłówkę.': 'Generate a puzzle first.',
        'Rozwiązanie pokazane. Zresetuj, by sprawdzać.': 'Solution shown. Reset to keep checking.',
        'Najpierw wygeneruj.': 'Generate one first.',
        'Plansza zresetowana.': 'Board reset.',
        'Rozwiązanie już pokazane.': 'The solution is already shown.',
        'Rozwiązanie znalezione!': 'Solution found!',
        'Solver nie znalazł rozwiązania. Sprawdź wpisane cyfry i sumy.': 'The solver found no solution. Check the digits and sums you entered.',
        'Gotowy. Możesz edytować sumy kolumn (szare pola).': 'Ready. You can edit the column sums (grey cells).',
        'Gotowy do gry. Możesz edytować sumy kolumn (szare pola).': 'Ready to play. You can edit the column sums (grey cells).',
        'Klepka się tu nie mieści lub zachodzi na inną.': 'The plank does not fit here or overlaps another one.',
        'Plansza nie dzieli się na klepki tej długości.': 'The board cannot be split into planks of this length.',
        'Klepki muszą pokrywać całą planszę.': 'Planks must cover the whole board.',
        'Cyfry początkowe łamią zasady (powtórzenia w klepce, sąsiednie jednakowe lub za dużo w wierszu/kolumnie).': 'The starting digits break the rules (repeats in a plank, equal neighbours or too many in a row/column).',
        'Rozmieść okręty zgodnie z cyframi.': 'Place the ships according to the digits.',
        'Okręty muszą być prostymi liniami i nie mogą się stykać – nawet rogami.': 'Ships must be straight lines and cannot touch, not even at corners.',
        'Flota nie zgadza się z podaną (rozmiary okrętów).': 'The fleet does not match the one given (ship sizes).',
        'Podaj flotę – długości okrętów oddzielone spacjami, np. „3 2 2 1”.': 'Enter a fleet: ship lengths separated by spaces, e.g. “3 2 2 1”.',
        'Okręt nie zmieści się na planszy.': 'A ship does not fit on the board.',
        'Błąd generowania – spróbuj ponownie.': 'Generation error. Please try again.',
        'Pusta plansza gotowa. Wpisz cyfry i sprawdź, czy istnieje rozwiązanie.': 'Empty board ready. Enter digits and check whether a solution exists.',
        'Brak możliwego rozwiązania przy tych cyfrach.': 'There is no possible solution with these digits.',
        'Poprawnie – istnieje co najmniej jedno rozwiązanie.': 'Correct so far: at least one solution exists.',
        'Plansza rozwiązana.': 'Board solved.',
        'Brak rozwiązania – sprawdź wpisane cyfry.': 'No solution. Check the digits you entered.',
        'Każda linia musi mieć co najmniej 2 pola.': 'Every line needs at least 2 cells.',
        'Każda linia musi być spójna (pola stykają się bokami).': 'Every line must be connected (cells touch along their sides).',
        'Cyfry początkowe łamią zasady sudoku (powtórzenie w wierszu, kolumnie lub bloku).': 'The starting digits break the sudoku rules (a repeat in a row, column or block).',
        'Cyfry na jednej linii nie mogą się powtarzać.': 'Digits on one line cannot repeat.',
        'Cyfry początkowe na linii nie mogą się zmieścić w ciągu kolejnych liczb.': 'The starting digits on a line cannot fit into a run of consecutive numbers.',
        'Zamaluj pola, aby powstały tratwy-prostokąty.': 'Shade cells to form rectangular rafts.',
        'Tratwy muszą być prostokątami z jedną liczbą równą ich polu (lub bez liczby).': 'Rafts must be rectangles with one number equal to their area (or no number).',
        'Zamalowane pola nie mogą zawierać kwadratu 2×2.': 'Shaded cells cannot contain a 2×2 square.',
        'Wszystkie tratwy muszą tworzyć całość połączoną rogami.': 'All rafts must form one whole connected at the corners.',
        'Zamaluj pola.': 'Shade cells.',
        'Wpisz co najmniej jedną liczbę.': 'Enter at least one number.',
        'Najpierw wpisz wynik działania (pole „Wynik”).': 'Enter the result of the operation first (the “Result” field).',
        'Narysuj jedną zamkniętą pętlę.': 'Draw one closed loop.',
        'Najpierw narysuj pętlę.': 'Draw a loop first.',
        'Pętla ma rozgałęzienia lub nie jest domknięta.': 'The loop branches or is not closed.',
        'Jest więcej niż jedna pętla – ma być tylko jedna.': 'There is more than one loop; there must be exactly one.',
        'Ustaw wieże (zamaluj pola).': 'Place towers (shade cells).',
        'Są błędy: wieże stykają się bokami lub liczby się nie zgadzają.': 'There are errors: towers touch along their sides or numbers do not match.',
        'Białe pola muszą tworzyć jedną całość.': 'White cells must form one connected area.',
        'Ustaw wieże.': 'Place the towers.',
        'Zamaluj pola tak, aby powstała jedna ścieżka.': 'Shade cells so that a single path forms.',
        'Zamalowane pola muszą tworzyć jedną całość.': 'Shaded cells must form one connected area.',
        'Wielokąt musi mieć co najmniej dwa pola.': 'The polygon must have at least two cells.',
        'Własna plansza – powodzenia! (Przycisk „Rozwiąż” nie jest dla niej dostępny).': 'Custom board: good luck! (The “Solve” button is not available for it.)',
        'Dla własnej planszy nie ma rozwiązania wzorcowego – sprawdź ją przyciskiem „Sprawdź”.': 'A custom board has no reference solution: use the “Check” button instead.',
        'Tryb edycji: klikaj lampki, aby ustawić układ startowy.': 'Edit mode: click lamps to set the starting layout.',
        'Klikaj lampki, aby ustawić, które mają być zapalone na starcie. Plansza musi dać się rozwiązać.': 'Click lamps to choose which ones start lit. The board must be solvable.',
        'Wiersz': 'Row',
        // podpowiedzi edytora
        'Klikaj pola, aby ustawić lub zdjąć domki (🏠). Wpisz też liczby zbiorników w wierszach i kolumnach (puste = brak wskazówki).': 'Click cells to place or remove houses (🏠). Also enter the number of tanks per row and column (empty = no clue).',
        'Wpisz, ile pól zajmują chmury w wierszach (po lewej) i kolumnach (u góry). Puste = brak wskazówki; 0 też jest dozwolone.': 'Enter how many cells the clouds take up in each row (left) and column (top). Empty = no clue; 0 is allowed too.',
        'Kliknij pola, aby dodać je do aktywnego (niebieskiego) obszaru; ponowne kliknięcie zwalnia pole. „Nowy obszar” zaczyna kolejny. Ustaw działanie i wynik. Obszar „=” to jedno pole z gotową cyfrą.': 'Click cells to add them to the active (blue) region; clicking again releases the cell. “New region” starts the next one. Set the operation and result. A “=” region is a single cell with a ready digit.',
        'Wpisz cyfry początkowe (1–9). Cyfra n musi na końcu tworzyć spójny blok dokładnie n pól; puste pola uzupełni gracz.': 'Enter the starting digits (1–9). In the end, digit n must form a connected block of exactly n cells; the player fills in the empty cells.',
        'Tryb „Układ”: klikaj pola, aby zrobić czarne/białe (pierwszy wiersz i kolumna są zawsze czarne). Tryb „Sumy”: wpisz sumy w czarnych polach – górna dla serii w prawo, dolna dla serii w dół.': '“Layout” mode: click cells to make them black/white (the first row and column are always black). “Sums” mode: enter sums in black cells: the upper one for runs going right, the lower one for runs going down.',
        'Klikaj pola: białe → czarne → liczby 0–4 (ile lampek ma stać obok) → znów białe.': 'Click cells: white → black → numbers 0–4 (how many lamps stand next to it) → white again.',
        'Tryb „Obszary”: wybierz numer obszaru i klikaj pola, aby je do niego przypisać (każdy obszar ma mieć dokładnie n spójnych pól). Tryb „Cyfry”: wpisz cyfry początkowe.': '“Regions” mode: pick a region number and click cells to assign them to it (every region must have exactly n connected cells). “Digits” mode: enter the starting digits.',
        'Wpisz liczbę w polu, aby postawić tam latarnię (liczba = ile statków ma stać w jej wierszu i kolumnie, 0 też można). Puste pole to zwykłe pole.': 'Type a number in a cell to place a lighthouse there (the number = how many ships stand in its row and column; 0 is allowed). An empty cell is an ordinary cell.',
        'Klikaj pola między cyframi, aby ustawić znak < / > (lub ⋀ / ⋁); wpisz też cyfry początkowe, jeśli chcesz.': 'Click the cells between digits to set a < / > sign (or ⋀ / ⋁); you can also enter starting digits.',
        'Wpisz w polach cyfry 0–9: ile z 9 pól wokół (razem z tym) ma być zamalowanych. Puste pole = brak wskazówki.': 'Enter digits 0–9: how many of the 9 cells around (including this one) should be shaded. Empty = no clue.',
        'Wpisz długości kolejnych bloków oddzielone spacją (np. „3 1 2”) przy każdym wierszu (po lewej) i kolumnie (u góry). Puste = pusty wiersz/kolumna.': 'Enter the lengths of consecutive blocks separated by spaces (e.g. “3 1 2”) for every row (left) and column (top). Empty = empty row/column.',
        'Tryb „Układ”: kliknij pole, aby położyć klepkę w wybranym kierunku (kliknięcie klepki ją zdejmuje). Tryb „Cyfry”: wpisz cyfry początkowe. Rozmiar musi dzielić się przez długość klepki.': '“Layout” mode: click a cell to lay a plank in the chosen direction (clicking a plank removes it). “Digits” mode: enter the starting digits. The size must be divisible by the plank length.',
        'Wpisz liczby widocznych piramid przy brzegach (puste = brak wskazówki) oraz, jeśli chcesz, cyfry początkowe w polach.': 'Enter the numbers of visible pyramids along the edges (empty = no clue) and, if you like, starting digits in the cells.',
        'Wpisz w polach cyfry 0–8 (ile z 8 sąsiednich pól ma być zajętych okrętami; puste = brak cyfry) i podaj długości okrętów, np. „4 3 2 2 1 1”.': 'Enter digits 0–8 (how many of the 8 neighbouring cells hold ships; empty = no digit) and give the ship lengths, e.g. “4 3 2 2 1 1”.',
        'Tryb „Linie”: kliknij pola, aby dodać je do aktywnej linii (ponowne kliknięcie zdejmuje pole z linii); „Nowa linia” zaczyna kolejną. Cyfry na linii muszą tworzyć ciąg kolejnych liczb. Tryb „Cyfry”: wpisz cyfry początkowe. Rozmiar: 4 (bloki 2×2), 6 (2×3) lub 9 (3×3).': '“Lines” mode: click cells to add them to the active line (clicking again removes the cell); “New line” starts the next one. Digits on a line must form a run of consecutive numbers. “Digits” mode: enter the starting digits. Size: 4 (2×2 blocks), 6 (2×3) or 9 (3×3).',
        'Wpisz w polach liczby – pole tratwy, do której należą (np. 6 dla tratwy 2×3). Puste pola uzupełni gracz.': 'Enter numbers in cells: the area of the raft they belong to (e.g. 6 for a 2×3 raft). The player fills in the empty cells.',
        'Tryb „Cyfry”: wpisz cyfry początkowe. Tryb „Kółka”: wybierz działanie i wynik, kliknij skrzyżowanie czterech pól, by dodać kółko; kliknięcie istniejącego kółka je usuwa. P = wszystkie cztery parzyste, N = wszystkie nieparzyste.': '“Digits” mode: enter the starting digits. “Circles” mode: choose an operation and result, then click the corner shared by four cells to add a circle; clicking an existing circle removes it. P = all four even, N = all four odd.',
        'Klikaj kratki, aby ustawić liczbę 0–4 (po ilu jej bokach ma biec pętla); kolejne kliknięcia zwiększają liczbę, po 4 kratka znów jest pusta.': 'Click cells to set a number 0–4 (along how many of its sides the loop should run); further clicks increase the number, and after 4 the cell is empty again.',
        'Wpisz w polach liczby (ile pól widać z wieży: samo pole + pola w czterech kierunkach do zamalowanego). Puste pola zostaną do uzupełnienia.': 'Enter numbers in cells (how many cells are visible from the tower: the cell itself + cells in four directions up to a shaded one). Empty cells are left for the player.',
        'W polach wpisz liczbę zamalowanych sąsiadów (0–8), a dla kilku oddzielnych grup podaj je po separatorze, np. „2·1” lub „2.1”. Puste pole = bez cyfry.': 'Enter the number of shaded neighbours (0–8) in cells; for several separate groups give them with a separator, e.g. “2·1” or “2.1”. Empty = no digit.',
        // legendy / etykiety stron
        'Zasady': 'Rules',
        'Wygeneruj planszę lub stwórz pustą.': 'Generate a board or create an empty one.',
        'Flota': 'Fleet'
    };

    // ---------- wzorce (komunikaty z liczbami) ----------
    const diffs = { easy: 'easy', medium: 'medium', hard: 'hard' };
    const PATTERNS = [
        [/^Na razie bez błędów\. Puste pola: (\d+)\.$/, 'No errors so far. Empty cells: $1.'],
        [/^Brak sumy przy serii zaczynającej się w wierszu (\d+), kolumnie (\d+)\.$/, 'Missing sum for the run starting at row $1, column $2.'],
        [/^Suma (\d+) jest niemożliwa dla serii (\d+) pól \(dozwolone (\d+)–(\d+)\)\.$/, 'Sum $1 is impossible for a run of $2 cells (allowed $3–$4).'],
        [/^Brak błędów, ale (\d+) pól jest jeszcze ciemnych\.$/, 'No errors, but $1 cells are still dark.'],
        [/^Obszar (\d+) ma (\d+) pól, a powinien mieć (\d+)\.$/, 'Region $1 has $2 cells but should have $3.'],
        [/^Obszar (\d+) nie jest spójny\.$/, 'Region $1 is not connected.'],
        [/^Lampka (\d+), (\d+): włączona$/, 'Light $1, $2: on'],
        [/^Lampka (\d+), (\d+): wyłączona$/, 'Light $1, $2: off'],
        [/^Ruchy: (\d+)$/, 'Moves: $1'],
        [/^Zapalone: (\d+)$/, 'Lit: $1'],
        [/^Brawo! Rozwiązane w (\d+) ruchach\.$/, 'Well done! Solved in $1 moves.'],
        [/^Podpowiedź: kliknij zaznaczoną lampkę \(wiersz (\d+), kolumna (\d+)\)\.$/, 'Hint: click the highlighted lamp (row $1, column $2).'],
        [/^Cyfry w (\d+) polach się nie zgadzają\.$/, 'The digits in $1 cells do not match.'],
        [/^Liczby w (\d+) wierszach\/kolumnach \(czerwone\) nie pasują\.$/, 'The numbers in $1 rows/columns (red) do not fit.'],
        [/^Suma pól w wierszach \((\d+)\) musi równać się sumie w kolumnach \((\d+)\)\.$/, 'The total of the row clues ($1) must equal the total of the column clues ($2).'],
        [/^Pól: (\d+)$/, 'Cells: $1'],
        [/^Wypełnione: (\d+)$/, 'Filled: $1'],
        [/^Wiersz (\d+): cyfra (\d+) powtarza się\.$/, 'Row $1: the digit $2 repeats.'],
        [/^Sąsiedztwo (\d+) na \((\d+),(\d+)\) i \((\d+),(\d+)\)\.$/, 'The digit $1 touches itself at ($2,$3) and ($4,$5).'],
        [/^Kol\. (\d+): suma niemożliwa do osiągnięcia\.$/, 'Col. $1: the sum cannot be reached.'],
        [/^Usunięto (\d+) z (\d+) pól\. Rozwiązanie jednoznaczne\.$/, 'Removed $1 of $2 cells. The solution is unique.'],
        [/^(\d+) błędów: (.+)$/, (m, a, b) => a + ' errors: ' + t(b)],
        [/^Klepki mają długość (\d+): w każdej cyfry (.+)\. W każdym wierszu i kolumnie po (\d+) razy każda cyfra\.$/,
            (m, l, d, n) => 'Planks have length ' + l + ': each contains the digits ' + d.replace(' i ', ' and ') + '. Every row and column has each digit ' + n + ' times.'],
        [/^Rozmiar (\d+) musi dzielić się przez długość klepki (\d+)\.$/, 'Size $1 must be divisible by the plank length $2.'],
        [/^(\d+)× okręt (\d+)-polowy$/, '$1× ship of length $2'],
        [/^Flota: (.+)$/, (m, b) => 'Fleet: ' + b.split(', ').map(x => t(x)).join(', ')],
        [/^Nowa plansza \((\d+)×(\d+), (.+)\)\. Podanych: (\d+)\.$/, 'New board ($1×$2, $3). Givens: $4.'],
        [/^Linia nie może mieć więcej niż (\d+) pól\.$/, 'A line cannot have more than $1 cells.'],
        [/^Liczby w (\d+) kratkach \(czerwone\) się nie zgadzają\.$/, 'The numbers in $1 cells (red) do not match.'],
        [/^Plansza #(.+)$/, 'Board #$1'],
        [/^Wyzwanie dnia (\d\d\.\d\d)$/, 'Daily challenge $1'],
        [/^Rozwiązane w (\S+)!$/, 'Solved in $1!'],
        [/^Rozwiązano (\d+) razy$/, 'Solved $1 times'],
        [/^(\d+×\d+) \(klepki (\d+)\)$/, '$1 (planks $2)'],
        [/^Tryb edycji: (.+)$/, (m, b) => 'Edit mode: ' + t(b)],
        [/^Dźwięk$/, 'Sound']
    ];

    // ---------- zasady gier (kolejne <li>) ----------
    const RULES = {
        architekt: [
            'Click an empty cell to place or remove a <strong>tank</strong> (⛽).',
            'Exactly one tank must stand next to every house (🏠), on its side, not diagonally.',
            'Tanks <strong>cannot touch</strong> each other, neither along sides nor at corners. The numbers on the edges tell how many tanks are in the row or column.'],
        chmury: [
            'Click a cell to shade it (cloud).',
            'Clouds are <strong>rectangles</strong> with sides of at least 2 and <strong>do not touch</strong>, not even at corners.',
            'The number beside a row or column tells how many cells the clouds take up in it (in total).'],
        dzialania: [
            'Enter the digits from <strong>1</strong> to <strong>n</strong> so that they do not repeat in rows and columns.',
            'Every bold region contains digits that give the stated result of the operation (+, −, ×, :). The order of the digits within a region does not matter.'],
        filomino: [
            'Fill the empty cells with digits (1–9) so that <strong>every connected group</strong> of cells with the same digit has exactly as many cells as that digit.',
            'Two blocks of the same size cannot touch along a side. You can create new blocks by writing in more digits.'],
        krzyzowkaliczbowa: [
            'Fill the white cells with the digits from <strong>1</strong> to <strong>9</strong> so that the horizontal and vertical sums match.',
            'The number above the diagonal line is the sum to the right, the one below it is the sum downwards. Within one sum the digits <strong>cannot repeat</strong> (16 = 7+9 works, 8+8 does not).'],
        lampki: [
            'Click a white cell to place or remove a lamp. A lamp shines along its row and column up to a black cell.',
            '<strong>Every white cell</strong> must be lit and <strong>no lamp</strong> may shine on another.',
            'The number in a black cell tells how many lamps stand directly next to it (from 0 to 4).'],
        lancuchsudoku: [
            'Fill in the digits so that every <strong>row</strong>, every <strong>column</strong> and every <strong>chain</strong> (region with a thick outline) contains all the different digits from 1 to n.'],
        latarnie: [
            'Click an empty cell to place or remove a <strong>ship</strong> (🚢).',
            'The number next to a lighthouse tells how many ships stand in its row and column (even behind obstacles).',
            'Every ship must be lit by at least one lighthouse. Ships touch neither each other nor the lighthouses, not even at corners.'],
        lightsout: [
            'Clicking a lamp toggles it and its <strong>four neighbouring</strong> lamps (up, down, left, right).',
            'The goal is to <strong>turn all</strong> the lights <strong>off</strong>.',
            'Every board is solvable. Try to do it in as few moves as possible.'],
        mniejszewieksze: [
            'Enter the digits from <strong>1</strong> to <strong>n</strong> so that they do not repeat in rows and columns.',
            'A &lt; or &gt; sign between neighbouring cells shows which of them has the <strong>smaller</strong> digit.'],
        mozaika: [
            'Click a cell to shade it.',
            'A digit (0–9) tells how many cells in the 3×3 square around it, <strong>including the cell with the digit</strong>, are shaded.'],
        obrazeklogiczny: [
            'Click a cell to shade it.',
            'The numbers beside a row or column are the <strong>lengths of the blocks</strong> of shaded cells, in the given order. There must be at least one empty cell between blocks.'],
        od0do9: [
            'In every <strong>row</strong> the digits must be <strong>unique</strong> (chosen from 0–9).',
            'In <strong>columns</strong> digits may repeat, but <strong>identical digits cannot touch along a side or at a corner</strong> (8 directions).',
            'The bottom row (grey background) shows the <strong>sum of the numbers in each column</strong>. You can edit it to create your own puzzle.',
            'Fill the empty cells with digits, obeying all the rules.'],
        parkiet: [
            'The parquet is made of planks of length 2 or 3. In a 2-cell plank enter <strong>1 and 2</strong>, in a 3-cell plank <strong>1, 2 and 3</strong> (each once).',
            'Every row and every column must contain <strong>the same number of ones, twos and threes</strong>.',
            'Equal digits cannot stand in cells that touch along a side. In one puzzle all the planks have the same length.'],
        piramidy: [
            'Enter the digits from <strong>1</strong> to <strong>n</strong> (n = number of columns) so that every digit appears once in every row and column.',
            'The digit in a cell is the <strong>height of a pyramid</strong>. The numbers on the edge tell how many pyramids are visible from that spot: taller ones hide shorter ones.'],
        sapernamorzu: [
            'Click a cell to place or remove a piece of a ship. Cells with digits stay empty.',
            'Use exactly the <strong>ships shown below the board</strong> (straight, 1×n). Ships cannot touch along sides or at corners.',
            'A digit tells on how many of the <strong>8 neighbouring</strong> cells ships stand.'],
        sudoku: [
            'Fill the grid with the digits from <strong>1</strong> to <strong><span id="maxDigit">9</span></strong>.',
            'In every <strong>row</strong>, <strong>column</strong> and <strong>block</strong> the digits must be <strong>unique</strong>.',
            'You cannot change the starting (bold) digits.'],
        sudokurenban: [
            'Enter the digits from 1 to 9 so that each appears once in every row, column and 3×3 block.',
            'On the <strong>marked lines</strong> (runs of cells) digits cannot repeat and must form a set of consecutive numbers in any order (e.g. 4, 6, 5).'],
        tratwy: [
            'Click a cell to shade it. White cells form <strong>rafts</strong>, which are rectangles.',
            'A raft contains <strong>one cell with a number</strong> (its area) or none. Rafts share no sides, but each one touches another at a corner, forming one whole.',
            'Shaded cells cannot contain a 2×2 square.'],
        ukosnedzialania: [
            'Enter the digits from <strong>1</strong> to <strong>n</strong> so that each appears once in every row and column.',
            'The result of the operation in a circle must hold along <strong>both diagonals</strong> of the four cells around it (e.g. “1−”: the difference of both pairs is 1).',
            'The letter <strong>P</strong> means that all four digits are even, and <strong>N</strong> that they are all odd.'],
        wielokropka: [
            'Click a segment between dots to draw or remove it.',
            'Draw <strong>one closed loop</strong> that neither crosses itself nor breaks.',
            'The number in a cell tells <strong>along how many of its sides</strong> the loop runs.'],
        wieze: [
            'Click a cell to place a tower (shade it). Cells with numbers stay white.',
            'A number tells how many white cells are visible from that cell vertically and horizontally (including itself). <strong>Towers block the view.</strong>',
            'Towers cannot touch along sides, and all the white cells must be connected.'],
        wsapera: [
            'Click an empty cell to shade it. Cells with digits cannot be shaded.',
            'A digit tells how many of the <strong>8 neighbouring</strong> cells (including corners) are shaded. Two digits (e.g. 2·1) mean two separate groups of shaded cells.',
            'Shaded cells form <strong>one connected polygon</strong> with no 2×2 square.']
    };

    // ---------- tłumaczenie tekstu ----------
    const SPLIT = /^([^\p{L}\p{N}]*)([\s\S]*?)(\s*)$/u;
    function lookup(core) {
        if (Object.prototype.hasOwnProperty.call(EXACT, core)) return EXACT[core];
        if (core.endsWith(':')) {
            const k = core.slice(0, -1);
            if (Object.prototype.hasOwnProperty.call(EXACT, k)) return EXACT[k] + ':';
        }
        for (const [re, rep] of PATTERNS) {
            if (re.test(core)) return core.replace(re, rep);
        }
        return undefined;
    }
    function t(s) {
        if (lang !== 'en' || !s) return s;
        const m = SPLIT.exec(s);
        if (!m || !m[2]) return s;
        const out = lookup(m[2]);
        return out === undefined ? s : m[1] + out + m[3];
    }

    const ATTRS = ['placeholder', 'aria-label', 'title'];
    const SKIP = { SCRIPT: 1, STYLE: 1, TEXTAREA: 1 };

    function convert(root) {
        if (lang !== 'en' || !root) return;
        if (root.nodeType === 3) { const v = t(root.nodeValue); if (v !== root.nodeValue) root.nodeValue = v; return; }
        if (root.nodeType !== 1 && root.nodeType !== 11) return;
        const w = document.createTreeWalker(root, 5); // elementy + tekst
        let n = w.currentNode;
        const nodes = [];
        if (root.nodeType === 1) nodes.push(root);
        while ((n = w.nextNode())) nodes.push(n);
        for (const x of nodes) {
            if (x.nodeType === 3) {
                if (SKIP[(x.parentNode.nodeName || '').toUpperCase()]) continue;
                const v = t(x.nodeValue);
                if (v !== x.nodeValue) x.nodeValue = v;
            } else {
                for (const a of ATTRS) {
                    if (x.hasAttribute && x.hasAttribute(a)) {
                        const v = t(x.getAttribute(a));
                        if (v !== x.getAttribute(a)) x.setAttribute(a, v);
                    }
                }
            }
        }
    }

    function applyRules() {
        const parts = location.pathname.split('/').filter(Boolean);
        const gi = parts.indexOf('games');
        const id = gi >= 0 ? parts[gi + 1] : '';
        const box = document.querySelector('.rules-box');
        const rules = RULES[id];
        if (!box || !rules) return;
        const lis = box.querySelectorAll('li');
        if (lis.length !== rules.length) return;
        rules.forEach((html, i) => { lis[i].innerHTML = html; });
    }

    function start() {
        if (lang === 'en') {
            applyRules();
            convert(document.documentElement);
            // tytuł w formie „Gra – Łamigłówki logiczne”
            const parts = document.title.split(' – ');
            if (parts.length === 2) document.title = t(parts[0]) + ' – ' + t(parts[1]);
            else document.title = t(document.title);
            new MutationObserver(list => {
                for (const m of list) {
                    m.addedNodes.forEach(n => convert(n));
                    if (m.type === 'characterData') convert(m.target);
                }
            }).observe(document.documentElement, { childList: true, subtree: true, characterData: true });
        }
    }

    window.I18N = {
        get lang() { return lang; },
        t,
        set(l) {
            if (l !== 'pl' && l !== 'en') return;
            store.set('lp:lang', l);
            const u = new URL(location.href);
            u.searchParams.delete('lang');
            location.href = u.toString();
        },
        toggle() { window.I18N.set(lang === 'en' ? 'pl' : 'en'); }
    };
    start();
})();
