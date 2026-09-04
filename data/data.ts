import { parse } from '@std/yaml';
import z from 'zod';

const i18nString = z.object({
  fi: z.string(),
  en: z.string().optional(),
}).strict();

export const areaSchema = z.object({
  id: z.number().int(),
  name_i18n: i18nString,
}).strict();

export type Area = z.infer<typeof areaSchema>;

export const openingHoursSchema = z.array(z.union([z.tuple([z.number(), z.number()]), z.null()]));

export const restaurantSchema = z.object({
  id: z.number().int(),
  name_i18n: i18nString,
  areaId: z.number().int(),
  priceCategory: z.enum(['student', 'studentPremium', 'regular']),
  latitude: z.number(),
  longitude: z.number(),
  url: z.url(),
  menuUrl: z.url(),
  address: z.string(),
  openingHours: openingHoursSchema,
}).strict();

export type Restaurant = z.infer<typeof restaurantSchema>;

export const favoriteSchema = z.object({
  id: z.number().int(),
  regexp: z.string(),
  name_i18n: i18nString,
}).strict();

export type Favorite = z.infer<typeof favoriteSchema>;

export const updatesSchema = z.object({
  id: z.number().int(),
  title: z.string(),
  description: z.string(),
  createdAt: z.string(),
}).strict();

export const restaurants = z.array(restaurantSchema).parse(parse(Deno.readTextFileSync('data/restaurants.yml')));
export const areas = z.array(areaSchema).parse(parse(Deno.readTextFileSync('data/areas.yml')));
export const favorites = z.array(favoriteSchema).parse(parse(Deno.readTextFileSync('data/favorites.yml')));
export const updates = z.array(updatesSchema).parse(parse(Deno.readTextFileSync('data/updates.yml')));
export const areasWithRestaurants = areas.map((area) => {
  return {
    ...area,
    restaurants: restaurants.filter((r) => r.areaId === area.id),
  };
});
export const areasWithRestaurantIds = areas.map((area) => {
  return {
    ...area,
    restaurants: restaurants.filter((r) => r.areaId === area.id).map((r) => r.id),
  };
});
