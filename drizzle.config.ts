import { defineConfig } from 'drizzle-kit';
import type { Config } from 'drizzle-kit';

// Use Turso for production, local SQLite for development
const useTurso = !!process.env.TURSO_DATABASE_URL;

if (!useTurso && !process.env.DATABASE_URL) {
	throw new Error('DATABASE_URL is not set');
}

if (useTurso && !process.env.TURSO_AUTH_TOKEN) {
	throw new Error('TURSO_AUTH_TOKEN is not set');
}

const config: Config = {
	schema: './src/lib/server/db/schema.ts',
	dialect: 'sqlite',
	dbCredentials: useTurso
		? ({
				url: process.env.TURSO_DATABASE_URL!,
				authToken: process.env.TURSO_AUTH_TOKEN!
			} as any)
		: { url: process.env.DATABASE_URL! },
	verbose: true,
	strict: true
};

export default defineConfig(config);
