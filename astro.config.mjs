// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  site: 'https://karpatska-sadyba.com.ua',
  trailingSlash: 'never',
  i18n: {
    locales: ['uk', 'en'],
    defaultLocale: 'uk',
    routing: {
      prefixDefaultLocale: false,
    },
  },
  integrations: [
    sitemap({
      // 404 у мапу сайту не потрапляє
      filter: (page) => !page.includes('/404'),
      changefreq: 'weekly',
    }),
  ],
});
