import postgres from 'postgres';
import { databaseURL } from './environment.ts';
import { PGlite } from '@electric-sql/pglite';
import z from 'zod';

interface Db {
  exec(query: string): void;
  queryArray<T>(query: string, params: unknown[]): Promise<T[]>;
  queryObject<T>(query: string, params: unknown[]): Promise<T>;
}

class LocalDb implements Db {
  instance: PGlite;
  constructor() {
    this.instance = new PGlite('local.db');
  }

  async exec(query: string) {
    await this.instance.exec(query);
  }

  async queryArray<T>(query: string, params: unknown[]) {
    const result = await this.instance.query(query, params);
    return result.rows as T[]; // array of objects
  }

  async queryObject<T>(query: string, params: unknown[]) {
    const result = await this.instance.query(query, params);
    return result.rows[0] as T;
  }
}

class ProductionDb implements Db {
  instance: postgres.Sql;
  constructor(url: string) {
    this.instance = postgres(url);
  }

  async exec(query: string) {
    await this.instance.unsafe(query).simple();
  }

  async queryArray<T>(query: string, params: any[]) {
    return await this.instance.unsafe(query, params) as T[];
  }

  async queryObject<T>(query: string, params: any[]) {
    const rows = await this.instance.unsafe(query, params);
    return rows[0] as T;
  }
}

export enum MenuProperty {
  CONTAINS_ALLERGENS = 'A+',
  CONTAINS_CELERY = 'C+',
  EGG_FREE = 'E',
  GLUTEN_FREE = 'G',
  HEALTHIER_CHOICE = 'H',
  LACTOSE_FREE = 'L',
  LOW_IN_LACTOSE = 'LL',
  MILK_FREE = 'M',
  CONTAINS_NUTS = 'N+',
  CONTAINS_GARLIC = 'O+',
  SOY_FREE = 'S',
  CONTAINS_SOY = 'S+',
  VEGETARIAN = 'V',
  VEGAN = 'VV',
  IGNORE = '?',
}

export const menuList = z.array(z.object({
  title: z.string(),
  properties: z.array(z.enum(MenuProperty)),
}));

export const menuSchema = z.object({
  restaurant_id: z.number().int(),
  day: z.string(),
  courses_i18n: z.object({
    fi: menuList,
    en: menuList,
  }),
});

export const changeSchema = z.object({
  data_type: z.enum(['restaurant']),
  uuid: z.uuid(),
  filter: z.json(),
  change: z.json(),
  applied_at: z.date().optional(),
  applied_by: z.string().optional(),
  created_at: z.date(),
});

export type Menu = z.infer<typeof menuSchema>;
export type Change = z.infer<typeof changeSchema>;

export const db: Db = databaseURL ? new ProductionDb(databaseURL) : new LocalDb();

await db.exec(`
CREATE TABLE IF NOT EXISTS menus (
  restaurant_id integer,
  day date,
  courses_i18n json,
  PRIMARY KEY (restaurant_id, day)
);

CREATE TABLE IF NOT EXISTS changes (
  data_type character varying(255) NOT NULL CHECK (data_type IN ('restaurant')),
  uuid uuid NOT NULL DEFAULT gen_random_uuid(),
  filter jsonb NOT NULL,
  change jsonb NOT NULL,
  applied_at timestamp with time zone,
  applied_by character varying(255),
  created_at timestamp with time zone NOT NULL DEFAULT now()
);
`);
