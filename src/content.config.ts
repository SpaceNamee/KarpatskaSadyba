import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

/** Рядок двома мовами; en заповнюється в Фазі 3, поки допускаємо чернетку */
const l10n = z.object({ uk: z.string(), en: z.string() });

const cottages = defineCollection({
  loader: glob({ pattern: '**/*.json', base: './src/content/cottages' }),
  schema: z.object({
    order: z.number(),
    name: l10n,
    areaM2: z.number(),
    capacityBase: z.number(),
    capacityMax: z.number(),
    summary: l10n,
    floors: z.array(l10n),
    /** Кількість спалень (вітальня зі спальним місцем сюди не входить) */
    bedroomsCount: z.number(),
    bedrooms: z.array(l10n),
    bathrooms: l10n,
    features: z.array(l10n),
    kitchen: z.array(l10n),
    view: l10n,
    prices: z.object({
      twoPlusNights: z.number(),
      oneNight: z.number(),
      includedGuests: z.number(),
      extraPersonUah: z.number(),
    }),
    photosDir: z.string(),
    photos: z.array(
      z.object({
        file: z.string(),
        alt: l10n,
      })
    ),
    /** Головне фото для картки на головній (file з photos) */
    cardPhoto: z.string(),
  }),
});

export const collections = { cottages };
