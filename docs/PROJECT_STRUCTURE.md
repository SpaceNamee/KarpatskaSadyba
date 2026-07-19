# PROJECT_STRUCTURE — Новий сайт «Карпатська садиба»

> Структура Astro-проєкту. Статус: чернетка, залежить від затвердження SPEC.md.
> Новий сайт живе в цьому ж репозиторії; старі HTML-файли видаляємо після запуску (фаза 1).

```
Site/code/
├── docs/                          # Документація проєкту
│   ├── SPEC.md                    # Специфікація (що будуємо і чому)
│   ├── PROJECT_STRUCTURE.md       # Цей файл
│   ├── ROADMAP.md                 # Фази розробки
│   ├── TODO.md                    # Робочий чекліст
│   └── COMPETITORS.md             # Аналіз конкурентів
│
├── public/                        # Статика "як є" (без обробки)
│   ├── favicon.svg
│   ├── logo.svg                   # Оновлений логотип
│   └── robots.txt
│
├── src/
│   ├── content/                   # ← ВЕСЬ редагований контент (Content Collections)
│   │   ├── cottages/              # 1 файл = 1 котедж (типізовано схемою)
│   │   │   ├── kotedzh-1.json     # назва, площа, місткість, спальні/ліжка,
│   │   │   ├── kotedzh-2.json     #   ванни, родзинки, зручності, список фото,
│   │   │   └── kotedzh-3.json     #   ціни (1 доба / 2+), slug укр/en
│   │   ├── services/              # чан, сауна, риболовля, квадроцикли, дрова...
│   │   ├── attractions/           # ГК Плай/Звенів/..., водоспади, вершини, Тустань
│   │   └── reviews/               # цитати відгуків з Booking
│   │
│   ├── data/                      # службові JSON поза колекціями (прямий import)
│   │   └── site/                  #   (src/content/ Astro резервує під колекції)
│   │       ├── contacts.json      # телефони, Instagram, адреса, координати
│   │       ├── policies.json      # заїзд/виїзд, тихі години, завдаток, правила
│   │       └── prices-extra.json  # послуги з цінами, примітка про зимові ціни
│   │
│   ├── i18n/
│   │   ├── uk.json                # UI-рядки укр (кнопки, підписи, меню)
│   │   └── en.json                # UI-рядки англ
│   │
│   ├── assets/
│   │   └── photos/                # Фото (оптимізує astro:assets)
│   │       ├── cottage-1/         # ← переносимо з /photo/cottage-1 (23 фото)
│   │       ├── cottage-2/         # ← 20 фото
│   │       ├── cottage-3/         # ← 24 фото
│   │       └── estate/            # територія, басейн, чан, зима (з Instagram)
│   │
│   ├── layouts/
│   │   └── Base.astro             # <head> (SEO, hreflang, schema.org), шапка, футер
│   │
│   ├── components/
│   │   ├── Header.astro           # лого, меню, перемикач мови, телефон
│   │   ├── Footer.astro
│   │   ├── Hero.astro
│   │   ├── CottageCard.astro      # картка котеджу на головній
│   │   ├── BedsTable.astro        # схема спалень/ліжок
│   │   ├── Gallery.astro          # сітка фото + лайтбокс (острівець)
│   │   ├── PriceTable.astro
│   │   ├── Reviews.astro          # відгуки + бейдж Booking 9.2
│   │   ├── InstagramGrid.astro    # курована сітка фото → профіль
│   │   ├── SeasonBlock.astro      # зима/літо блок на головній
│   │   ├── MobileCta.astro        # плаваюча кнопка «Забронювати»
│   │   ├── AvailabilityCalendar/  # острівець: календар зайнятості (фаза 2)
│   │   ├── BookingForm/           # острівець: форма заявки (фаза 2)
│   │   └── ChatWidget/            # острівець: ШІ-помічник (фаза 3)
│   │
│   └── pages/
│       ├── index.astro                    # Головна (укр)
│       ├── kotedzhi/[slug].astro          # 3 сторінки котеджів з колекції
│       ├── tsiny.astro
│       ├── vidpochynok.astro
│       ├── lokatsiya.astro
│       ├── kontakty.astro
│       ├── 404.astro
│       └── en/                            # Дзеркало англійською (фаза 3)
│           ├── index.astro
│           ├── cottages/[slug].astro
│           ├── prices.astro
│           ├── activities.astro
│           ├── location.astro
│           └── contacts.astro
│
├── functions/                     # Cloudflare Pages Functions (serverless)
│   └── api/
│       ├── availability.ts        # GET  ?cottage=1..3 → зайняті дати (iCal Booking, кеш 1 год)
│       ├── booking-request.ts     # POST заявка → валідація → Telegram Bot API
│       └── chat.ts                # POST повідомлення → Claude API (Haiku) + ліміти
│
├── scripts/
│   └── screenshot.mjs             # dev-інструмент: скриншоти desktop+mobile через Edge
│
├── astro.config.mjs               # i18n (uk default, en), sitemap, image config
├── package.json
├── tsconfig.json
└── .env.example                   # TELEGRAM_BOT_TOKEN, TELEGRAM_CHAT_ID,
                                   # ANTHROPIC_API_KEY, ICAL_URL_1..3 (без значень!)
```

## Принципи

1. **Контент відділений від коду.** Ціни, тексти, телефони — тільки в `src/content/` і `src/i18n/`. Змінити ціну = відредагувати один JSON (через Claude або руками), пуш у `main` → автодеплой.
2. **Нуль секретів у репозиторії.** Токени — лише у змінних середовища Cloudflare; `.env.example` документує імена.
3. **Острівці інтерактивності.** Сторінки — статичний HTML; JS вантажиться лише для календаря, форми, галереї, чату.
4. **Фото одним шляхом.** Всі зображення через `src/assets/` + `astro:assets` → автоматичні WebP/AVIF і responsive-розміри; у `public/` — лише лого/favicon.
5. **Одне джерело правди для двох мов.** Числа (площа, ліжка, ціни) живуть у контент-файлах один раз; мовні поля — парами `uk`/`en` у тих самих файлах.

## Що станеться зі старими файлами

| Зараз | Після запуску |
|-------|---------------|
| `index.html`, `cotagge.html`, `cost.html`, `food.html`, `enjoq.html`, `location.html`, `contact.html`, `css/`, старий `img/` | Видаляємо (історія лишається в git). Кориснi іконки/лого переносимо в `src/assets/` |
| `photo/cottage-{1,2,3}/` | Переносимо в `src/assets/photos/` |
| GitHub Pages (spacenamee.github.io) | Сторінка-заглушка з редіректом на новий домен |
