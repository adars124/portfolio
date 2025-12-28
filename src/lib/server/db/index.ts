import { drizzle as drizzleSqlite } from 'drizzle-orm/better-sqlite3';
import { drizzle as drizzleLibsql } from 'drizzle-orm/libsql';
import { createClient } from '@libsql/client';
import Database from 'better-sqlite3';
import * as schema from './schema';
import { env } from '$env/dynamic/private';

if (!env.DATABASE_URL) throw new Error('DATABASE_URL is not set');

// Use Turso (libsql) if TURSO_DATABASE_URL is set, otherwise use local SQLite
let db;

if (env.TURSO_DATABASE_URL) {
	// Production: Use Turso
	const client = createClient({
		url: env.TURSO_DATABASE_URL,
		authToken: env.TURSO_AUTH_TOKEN
	});
	db = drizzleLibsql(client, { schema });
} else {
	// Development: Use local SQLite
	const client = new Database(env.DATABASE_URL);
	db = drizzleSqlite(client, { schema });
}

export { db };
