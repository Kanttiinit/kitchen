import { parse } from '@std/yaml';

export const restaurants = parse(Deno.readTextFileSync('data/restaurants.yml')) as Restaurant[];
export const areas = parse(Deno.readTextFileSync('data/areas.yml')) as Area[];
export const favorites = parse(Deno.readTextFileSync('data/favorites.yml')) as Favorite[];
export const areasWithRestaurants = areas.map((area) => {
  return {
    ...area,
    restaurants: restaurants.filter((r) => r.areaId === area.id),
  };
});

export interface i18n {
  fi: string;
  en: string;
}

export interface Area {
  id: number;
  name_i18n: i18n;
}

export interface Restaurant {
  id: number;
  name_i18n: i18n;
  areaId: number;
  priceCategory: string;
  latitude: number;
  longitude: number;
  url: string;
  menuUrl: string;
}

export interface Favorite {}
