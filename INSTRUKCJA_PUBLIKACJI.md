# SamoDyscyplina – publikacja

## 1. Publikacja aplikacji PWA

Sposób publikacji pozostaje bez zmian:

```powershell
npm install
npm run deploy
```

Po kilku minutach uruchom PWA na iPhonie z ikony na ekranie początkowym. Service worker pobierze nową wersję automatycznie; czasem potrzebne jest dwukrotne zamknięcie i ponowne otwarcie aplikacji.

Nie usuwaj PWA z iPhone’a, jeżeli nie masz aktualnej kopii danych.

## 2. Jednorazowa konfiguracja powiadomień w tle

Ta część jest potrzebna, aby przypomnienia przychodziły również po całkowitym zamknięciu PWA. Frontend nadal pozostaje na GitHub Pages.

### Instalacja i logowanie

```powershell
cd push-worker
npm install
npx wrangler login
```

### Utworzenie bazy D1

```powershell
npx wrangler d1 create discipline-push
```

Skopiuj otrzymane `database_id` do `push-worker/wrangler.jsonc` w miejsce `UZUPELNIJ_ID_BAZY_D1`.

W tym samym pliku zamień `UZUPELNIJ_SWOJ_EMAIL` na swój adres e-mail. Nie zmieniaj `ALLOWED_ORIGIN`, dopóki aplikacja działa pod adresem `https://asamselski.github.io/discipline-app/`.

### Klucze VAPID

```powershell
npm run generate:vapid
```

1. Skopiuj wyświetlony klucz publiczny do `VAPID_PUBLIC_KEY` w `wrangler.jsonc`.
2. Wykonaj:

```powershell
npx wrangler secret put VAPID_PRIVATE_JWK
```

3. Wklej całą jedną linię z pliku `.vapid-private.json` i zatwierdź.

Pliku `.vapid-private.json` nie publikuj w GitHubie. Jest już dodany do `.gitignore`.

### Baza i publikacja Workera

```powershell
npm run db:remote
npm run deploy
```

Po wdrożeniu Wrangler pokaże adres podobny do:

```text
https://samodyscyplina-push.TWOJE_KONTO.workers.dev
```

### Połączenie PWA z Workerem

1. Otwórz PWA na iPhonie z ekranu początkowego.
2. Wejdź w `Profil → Ustawienia → Powiadomienia`.
3. Wklej adres Workera.
4. Kliknij `Włącz powiadomienia w tle` i zaakceptuj zgodę iOS.

Aplikacja prześle do Workera przypomnienia na najbliższe 30 dni i będzie je aktualizować po zmianie zadań. Harmonogram Workera jest sprawdzany co minutę.

## 3. Automatyczna kopia Google Drive

Po zalogowaniu do Google w ustawieniach zaznaczona jest opcja `Automatyczna kopia po zmianach`. Kopia aktualizuje jeden plik `discipline_app_backup.json` około 12 sekund po zmianie danych. Nie tworzy już nowego pliku przy każdym zapisie.

Autoryzacja Google może wymagać ponowienia po ponownym uruchomieniu PWA. Eksport JSON działa niezależnie od Google Drive.

## 4. Bezpieczna aktualizacja

Przed pierwszym wdrożeniem tej wersji warto wykonać w obecnej aplikacji ręczną kopię Google Drive. Nowa wersja zachowuje wszystkie dotychczasowe klucze `discipline_*` i nie resetuje danych.
