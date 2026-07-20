# Карпатська садиба

Сайт садиби з трьома котеджами в Карпатах (с. Плав'я, Львівська обл.): опис котеджів,
ціни, відпочинок (басейн, чан, сауна), локація та прямі заявки на бронювання.

**Домен:** [karpatska-sadyba.com.ua](https://karpatska-sadyba.com.ua) · **Хостинг:** Cloudflare Pages
Старий сайт: `spacenamee.github.io/KarpatskaSadyba/` (буде перенаправлений після запуску).

## Стек

- **Astro 5** — статична генерація, контент у файлах (без БД і адмінки)
- **Cloudflare Pages** — хостинг + serverless-функції (`functions/api/`)
- Шрифти Philosopher + Manrope, власні дизайн-токени (`src/styles/tokens.css`)

## Швидкий старт

```bash
npm install
npm run dev      # локальний сервер, http://localhost:4321
npm run build    # збірка в dist/
npm run preview  # перегляд зібраного сайту
npm run check    # перевірка типів і шаблонів
```

## Структура

```
docs/               SPEC, ROADMAP, TODO, PROJECT_STRUCTURE, COMPETITORS
functions/api/      availability.ts (iCal з Booking), booking-request.ts (Telegram)
public/             favicon, logo, robots.txt
src/
  assets/photos/    фото котеджів (cottage-1..3), оптимізуються при збірці
  components/       Header, Footer, CottageCard, Gallery, BookingForm,
                    AvailabilityCalendar, MobileCta
  content/cottages/ 1 файл = 1 котедж (типізована схема, content.config.ts)
  data/site/        contacts, policies, services, attractions
  i18n/             UI-рядки uk/en
  layouts/, pages/, styles/
```

Увесь редагований контент — у `src/content/` та `src/data/site/`. Щоб змінити ціну,
телефон чи опис котеджу, правити треба ці файли, а не розмітку сторінок.

## Змінні середовища

Задаються в Cloudflare Pages → Settings → Environment variables.
Імена й призначення — у [`.env.example`](.env.example); реальні значення в репозиторій **не** потрапляють.

| Змінна | Навіщо |
| --- | --- |
| `TELEGRAM_BOT_TOKEN`, `TELEGRAM_CHAT_ID` | заявки з форми бронювання приходять у Telegram |
| `ICAL_URL_COTTAGE_1..3` | календар зайнятості (iCal-експорт з екстранету Booking.com) |
| `PUBLIC_GA4_ID` | Google Analytics 4 (build-змінна) |
| `ANTHROPIC_API_KEY` | ШІ-помічник, фаза 3 |

Без цих змінних сайт збирається й працює: календар показує фолбек, форма повідомляє
про недоступність, аналітика вимкнена.

## Стан розробки

- **Фаза 0** — фундамент (Astro, дизайн-токени, layout) ✅ код готовий
- **Фаза 1** — контентний сайт: всі сторінки, галереї, schema.org ✅ код готовий
- **Фаза 2** — бронювання: календар зайнятості, форма → Telegram ✅ код готовий
- **Фаза 3** — англійська версія + ШІ-помічник — попереду

Сайт ще **не запущено**: лишилось підключити Cloudflare Pages з доменом, додати iCal-посилання,
Telegram-бота й GA4, доробити SEO і прибрати старі HTML-файли з кореня репозиторію.
Актуальний чекліст — [`docs/TODO.md`](docs/TODO.md), плани по фазах — [`docs/ROADMAP.md`](docs/ROADMAP.md).

## Старий сайт

HTML-файли в корені (`index.html`, `cotagge.html`, `cost.html`, `enjoq.html`, `food.html`,
`location.html`, `contact.html`) — це вже не сайт, а заглушки-редіректи зі старого
`spacenamee.github.io/KarpatskaSadyba/` на відповідні сторінки нового домену.
GitHub Pages не вміє віддавати 301, тому редірект зроблено через `meta refresh` + `location.replace`
і `noindex`, щоб старі адреси не конкурували в пошуку. Стару розмітку, `css/` та `img/` видалено.

Заглушки можна прибрати, коли Google перенесе всі старі адреси на новий домен (кілька місяців
після запуску, видно в Search Console).
