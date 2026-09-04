import { PGlite } from '@electric-sql/pglite';
import { Pool } from 'pg';
import {
  type Generated,
  type JSONColumnType,
  Kysely,
  ParseJSONResultsPlugin,
  PGliteDialect,
  PostgresDialect,
  sql,
} from 'kysely';
import z from 'zod';

import { databaseURL } from './environment.ts';

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

interface MenusTable {
  restaurant_id: number;
  day: string;
  courses_i18n: JSONColumnType<Menu['courses_i18n']>;
}

interface ChangesTable {
  data_type: 'restaurant';
  uuid: Generated<string>;
  filter: JSONColumnType<object>;
  change: JSONColumnType<object>;
  applied_at: Date | null;
  applied_by: string | null;
  created_at: Generated<Date>;
}

export interface Database {
  menus: MenusTable;
  changes: ChangesTable;
}

function createDialect() {
  if (databaseURL) {
    return new PostgresDialect({ pool: new Pool({ connectionString: databaseURL }) });
  }
  return new PGliteDialect({ pglite: new PGlite('local.db') });
}

export const db = new Kysely<Database>({
  dialect: createDialect(),
  plugins: [new ParseJSONResultsPlugin()],
});

await sql`
  CREATE TABLE IF NOT EXISTS menus (
    restaurant_id integer,
    day date,
    courses_i18n json,
    PRIMARY KEY (restaurant_id, day)
  )
`.execute(db);

await sql`
  CREATE TABLE IF NOT EXISTS changes (
    data_type character varying(255) NOT NULL CHECK (data_type IN ('restaurant')),
    uuid uuid NOT NULL DEFAULT gen_random_uuid(),
    filter jsonb NOT NULL,
    change jsonb NOT NULL,
    applied_at timestamp with time zone,
    applied_by character varying(255),
    created_at timestamp with time zone NOT NULL DEFAULT now()
  )
`.execute(db);
