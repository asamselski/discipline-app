// Decision tree for coaching messages based on user stats[cite: 1]

export const coachingRules = [
  {
    // Warunek 1: Poranny start (do 10:00) z 0 punktów
    condition: (stats) => stats.points === 0 && stats.hour < 10,
    messages: [
      "Dzień się zaczął, a Ty stoisz w miejscu! Jaki jest Twój najważniejszy Rezultat na dzisiaj? Uderzaj w to natychmiast!",
      "Poranek definiuje resztę dnia. Wybierz jedno małe zadanie, wygeneruj pierwsze punkty i wpraw maszynę w ruch.",
      "Słońce już wstało, a Ty masz zero na koncie. Przypomnij sobie swoje DLACZEGO i podejmij zmasowane działanie!",
      "Czas ucieka. Nie negocjuj ze sobą. Reguła 3 sekund: raz, dwa, trzy – idziesz robić pierwsze zadanie!"
    ]
  },
  {
    // Warunek 2: Absolutna dominacja (100% ukończonych zadań)
    condition: (stats) => stats.totalTasks > 0 && stats.doneTasks === stats.totalTasks,
    messages: [
      "Absolutna dominacja! Zmiażdżyłeś dzisiaj każdą pozycję na liście. Zbudowałeś potężne momentum, utrzymaj to!",
      "100% skuteczności. Tak wygląda dzień człowieka, który nie przyjmuje wymówek. Jesteś maszyną!",
      "Czysta karta, wszystkie cele osiągnięte. Uczcij to zwycięstwo, a potem zaplanuj jutro z jeszcze wyższym standardem.",
      "Wiedza to potencjał, egzekucja to potęga. Dziś pokazałeś potęgę. Świętuj i szykuj się na kolejny poziom."
    ]
  },
  {
    // Warunek 3: Zero punktów, a jest już wieczór (np. po 20:00)[cite: 1]
    condition: (stats) => stats.points === 0 && stats.hour >= 20, //[cite: 1]
    messages: [
      "Dzień się kończy, a na Twoim koncie zero punktów. To był dzień wymówek. Napraw to jutro od samego rana!", //[cite: 1]
      "Zero punktów. Ból, który teraz czujesz, to sygnał. Użyj go, by jutro wstać z innym nastawieniem.", //[cite: 1]
      "Koniec dnia, a Ty oddałeś go walkowerem. Zero punktów to decyzja, którą podjąłeś. Jutro podnosisz standard!",
      "Twój standard na dziś był żałosny. Zanim pójdziesz spać, zdefiniuj swój najważniejszy Cel na jutro. Zero litości!"
    ]
  },
  {
    // Warunek 4: Prokrastynacja (Popołudnie, bardzo mało wykonanych zadań)
    condition: (stats) => stats.hour >= 15 && stats.totalTasks >= 4 && (stats.doneTasks / stats.totalTasks) < 0.3,
    messages: [
      "Popołudnie, a Ty ledwo drasnąłeś swoją listę! Odkładasz trudne rzeczy na koniec? Bierz się do roboty TERAZ!",
      "Czas ucieka, a Ty działasz na 20% możliwości. Przestań być zajęty byciem zajętym i skończ to, co zacząłeś.",
      "Zostało Ci mnóstwo zadań. Przestań analizować. Wybierz JEDNĄ rzecz, zablokuj rozpraszacze i zrób ją do końca.",
      "Odkładanie na później to złodziej marzeń. Zamknij wymówki, otwórz cel i uderz w niego z pełną agresją!"
    ]
  },
  {
    // Warunek 5: Świetna passa (streak) i dużo punktów[cite: 1]
    condition: (stats) => stats.streak >= 5 && stats.points >= 50, //[cite: 1]
    messages: [
      "Jesteś w transie! 5 dni z rzędu na pełnych obrotach. Budujesz potężne momentum, nie zatrzymuj się!", //[cite: 1]
      "Mistrzowska konsekwencja! Twoja praca procentuje. Zaplanuj jutro z tą samą energią.", //[cite: 1]
      "Passa trwa! Jesteś w stanie flow. Pamiętaj jednak: mistrzowie nigdy nie osiadają na laurach. Ciśnij dalej!",
      "Zobacz, jak nawyk zmienia tożsamość. Jesteś teraz człowiekiem, który dowozi każdego dnia. Utrzymaj ten ogień!"
    ]
  },
  {
    // Warunek 6: Wykonane trudne zadania (Zjadanie Żaby)
    condition: (stats) => stats.hardTasksDone >= 2,
    messages: [
      "Zjadłeś dzisiaj najgorsze żaby! Rozwaliłeś najtrudniejsze zadania. Szacunek za przełamanie mentalnego oporu.",
      "Uderzyłeś prosto w strefę dyskomfortu. Dwa trudne cele z głowy. Tak buduje się prawdziwą stalową wolę!",
      "Nie poszedłeś na łatwiznę. Trudne zadania załatwione. Reszta dnia to już tylko formalność. Świetna robota!",
      "Większość ludzi ucieka przed wysiłkiem, Ty poszedłeś na czołowe zderzenie. Zbierz te punkty i bądź z siebie dumny."
    ]
  },
  {
    // Warunek 7: Wykonane tylko łatwe zadania[cite: 1]
    condition: (stats) => stats.doneTasks > 0 && stats.hardTasksDone === 0 && stats.hardTasksTotal > 0, // Zabezpieczone, żeby sprawdzał czy w ogóle miał trudne zadania
    messages: [
      "Punkty wpadły, ale robisz tylko to, co wygodne. Gdzie jest Twój Prawdziwy Cel? Zjedz tę żabę jutro jako pierwszą!", //[cite: 1]
      "Unikasz trudnych zadań. Mylisz bycie zajętym z byciem produktywnym. Podnieś standardy na jutro.", //[cite: 1]
      "Oszukujesz system i siebie. Odhaczasz łatwe punkty, uciekając przed prawdziwym wyzwaniem. Przestań negocjować z bólem!",
      "System świeci na zielono, ale omijasz najważniejsze cele. Jutro zaczynasz od najtrudniejszego. Żadnych wyjątków."
    ]
  },
  {
    // Warunek 8: Utrata długiej passy (Streak broken) - np. użytkownik resetuje aplikację / miał 0 PKT wczoraj
    condition: (stats) => stats.streak === 0 && stats.previousStreak >= 3,
    messages: [
      "Straciłeś passę, uległeś wymówkom. Boli? Ma boleć. Przeszłość to nie przyszłość. Zaczynamy Dzień 1. Wracaj do gry!",
      "Upadłeś. Trudno. Porażka to tylko informacja zwrotna. Nie pozwól, by jeden błąd zamienił się w lawinę. Odbijamy się!",
      "Łańcuch przerwany. Skup się teraz na pierwszej nowej klamrze. Jedno zadanie, już teraz, by odzyskać kontrolę."
    ]
  },
  {
    // Warunek 9: Zbalansowany wysiłek (Ponad 30 punktów w środku dnia 11:00-15:00)
    condition: (stats) => stats.points >= 30 && stats.hour >= 11 && stats.hour < 15,
    messages: [
      "Środek dnia, a Ty już prowadzisz! Masz świetne tempo. Utrzymaj tę dynamikę do wieczora i zamknij dzień z przytupem.",
      "Rewelacyjna efektywność. Nie czekasz, aż dzień sam się rozwinie, Ty narzucasz mu własne tempo. Uderzaj w kolejne cele!",
      "Rozpędziłeś maszynę. Użyj tego stanu uniesienia, by zrealizować Massive Action Plan do samego końca."
    ]
  },
  {
    // Warunek 10 (Zabezpieczenie - Default): Kiedy żaden specyficzny warunek nie pasuje[cite: 1]
    condition: () => true, //[cite: 1]
    messages: [
      "Każdy krok do przodu ma znaczenie. Przeanalizuj swój dzień i przygotuj się na jutro.", //[cite: 1]
      "Dyscyplina buduje wolność. Zobacz, co zadziałało, a co musisz poprawić.", //[cite: 1]
      "Pamiętaj: Rezultat, Powód, Działanie. Czy to, co robisz w tej sekundzie, zbliża Cię do Twojego nadrzędnego celu?",
      "Nie jesteś tu po to, żeby odhaczać punkty. Jesteś tu po to, żeby przesuwać granice. Skup się i podnieś poprzeczkę!",
      "Wygrywasz każdą decyzją o działaniu. Nie rozpraszaj się. Oczy na nagrodę i zmasowany atak!"
    ]
  }
];

export const getCoachMessage = (stats) => { //[cite: 1]
  // Upewniamy się, że stats posiada wszystkie potrzebne zmienne zabezpieczając przed "undefined"
  const safeStats = {
    hour: stats.hour || new Date().getHours(),
    points: stats.points || 0,
    streak: stats.streak || 0,
    previousStreak: stats.previousStreak || 0,
    totalTasks: stats.totalTasks || 0,
    doneTasks: stats.doneTasks || 0,
    hardTasksTotal: stats.hardTasksTotal || 0,
    hardTasksDone: stats.hardTasksDone || 0,
  };

  // Przelatujemy przez reguły i znajdujemy pierwszą, która zwraca "true"[cite: 1]
  const matchedRule = coachingRules.find(rule => rule.condition(safeStats)); //[cite: 1]
  
  // Losujemy jedną wiadomość z dopasowanej puli[cite: 1]
  const randomIndex = Math.floor(Math.random() * matchedRule.messages.length); //[cite: 1]
  return matchedRule.messages[randomIndex]; //[cite: 1]
};


export const yesterdayCoachingRules = [
  {
    // Warunek 1: Kompletna porażka (0 punktów) lub zrobione mniej niż 20% zadań
    condition: (stats) => stats.points === 0 || (stats.totalTasks > 0 && (stats.doneTasks / stats.totalTasks) < 0.2),
    messages: [
      "Patrzę na Twoje wczorajsze wyniki i widzę czyste alibi. Oddałeś ten dzień walkowerem! Przeszłość nie równa się przyszłości, ale tylko jeśli TERAZ podejmiesz decyzję o zmianie. Jaki jest Twój najważniejszy Rezultat na dzisiaj?",
      "Wczoraj zawiodłeś najważniejszą osobę – samego siebie. Boli? Użyj tego bólu! Przekuj to rozczarowanie w potężny Massive Action Plan na dzisiaj. Odbijamy się od dna!"
    ]
  },
  {
    // Warunek 2: Zaniedbane "Zdrowie" pomimo dobrych wyników ogólnych
    condition: (stats) => stats.points >= 30 && stats.healthTotal > 0 && stats.healthDone === 0,
    messages: [
      "Zrobiłeś wczoraj wynik, ale zignorowałeś absolutny fundament – swoje ciało. Energia to waluta sukcesu! Co Ci po punktach, jeśli zniszczysz maszynę, która je zdobywa? Dzisiaj kategoria 'Zdrowie' to Twój priorytet numer jeden!",
      "Sukces zawodowy czy edukacyjny bez zdrowia to porażka. Wczoraj ominąłeś trening. Dzisiaj nie ma wymówek – zrób cokolwiek, by wpompować tlen do krwi i zmienić swoją fizjologię!"
    ]
  },
  {
    // Warunek 3: Świetny wynik w Zdrowiu, ale słabo z resztą
    condition: (stats) => stats.healthDone >= 2 && (stats.doneTasks - stats.healthDone) <= 1,
    messages: [
      "Ciało wczoraj pracowało, maszyna jest naoliwiona, ale zawiodłeś w innych obszarach! Użyj tej wygenerowanej, fizycznej energii, żeby dzisiaj zdominować zadania umysłowe i zawodowe. Przenieś tę moc dalej!"
    ]
  },
  {
    // Warunek 4: Epickie zwycięstwo (ponad 80% zadań, w tym zdrowie)
    condition: (stats) => stats.totalTasks > 0 && (stats.doneTasks / stats.totalTasks) >= 0.8 && stats.healthDone > 0,
    messages: [
      "Wczoraj udowodniłeś, na co Cię stać! Zdominowałeś zadania i zadbałeś o ciało. To się nazywa życie na własnych warunkach. Skopiuj ten stan umysłu na dzisiaj i podnieś poprzeczkę jeszcze wyżej!",
      "Niesamowita egzekucja. Zostawiłeś wczoraj krew i pot na wirtualnym parkiecie. Uczcij to zwycięstwo przez sekundę, a potem... wracamy do budowania imperium. Jaki jest cel na dziś?"
    ]
  },
  {
    // Warunek 5 (Zabezpieczenie - Default): Średni, przeciętny dzień
    condition: () => true,
    messages: [
      "Wczoraj zrobiłeś krok do przodu, ale wiesz równie dobrze jak ja, że stać Cię na więcej. Przestań grać bezpiecznie. Zidentyfikuj dzisiaj jedną rzecz, która wygeneruje największy Rezultat i ruszaj do boju!",
      "Przeanalizuj wczorajsze statystyki. Co zadziałało? Co Cię rozproszyło? Wyciągnij lekcję, odetnij to co było i zaplanuj dzisiejszy Massive Action Plan."
    ]
  }
];

export const getYesterdayReview = (yesterdayStats) => {
  // Bezpieczne wartości domyślne na wypadek braku danych
  const safeStats = {
    points: yesterdayStats.points || 0,
    totalTasks: yesterdayStats.totalTasks || 0,
    doneTasks: yesterdayStats.doneTasks || 0,
    healthTotal: yesterdayStats.healthTotal || 0,
    healthDone: yesterdayStats.healthDone || 0,
  };

  const matchedRule = yesterdayCoachingRules.find(rule => rule.condition(safeStats));
  const randomIndex = Math.floor(Math.random() * matchedRule.messages.length);
  return matchedRule.messages[randomIndex];
};