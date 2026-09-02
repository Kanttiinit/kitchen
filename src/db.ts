import postgres from 'postgres';
import { databaseURL } from './environment.ts';
import { PGlite } from '@electric-sql/pglite';

interface Db {
  exec(query: string): void;
  queryArray(query: string, params: any[]): Promise<any>;
  queryObject(query: string, params: any[]): Promise<any>;
}

class LocalDb implements Db {
  instance: PGlite;
  constructor() {
    this.instance = new PGlite('local.db');
  }

  async exec(query: string) {
    await this.instance.exec(query);
  }

  async queryArray(query: string, params: any[]) {
    const result = await this.instance.query(query, params, { rowMode: 'array' });
    return result.rows;
  }

  async queryObject(query: string, params: any[]) {
    const result = await this.instance.query(query, params, { rowMode: 'object' });
    return result.rows[0];
  }
}

class ProductionDb implements Db {
  instance: postgres.Sql;
  constructor(url: string) {
    this.instance = postgres(url);
  }
  exec(query: string): void {
    throw new Error('Method not implemented.');
  }
  queryArray(query: string, params: any[]): Promise<any> {
    throw new Error('Method not implemented.');
  }
  queryObject(query: string, params: any[]): Promise<any> {
    throw new Error('Method not implemented.');
  }
}

export const db: Db = databaseURL ? new ProductionDb(databaseURL) : new LocalDb();

await db.exec(`
CREATE TABLE IF NOT EXISTS menus (
  restaurant_id integer,
  day date,
  courses_i18n json,
  PRIMARY KEY (restaurant_id, day)
);

CREATE TABLE IF NOT EXISTS changes (
    "modelName" character varying(255) NOT NULL,
    uuid uuid NOT NULL,
    "modelFilter" jsonb NOT NULL,
    change jsonb NOT NULL,
    "appliedAt" timestamp with time zone,
    "appliedBy" character varying(255),
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL
);
`);
