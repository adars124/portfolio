#!/usr/bin/env node
/**
 * Helper script to set up Turso database schema
 * Run with: node scripts/setup-turso.mjs
 */

import { createClient } from '@libsql/client';

if (!process.env.TURSO_DATABASE_URL || !process.env.TURSO_AUTH_TOKEN) {
	console.error('❌ Error: TURSO_DATABASE_URL and TURSO_AUTH_TOKEN must be set');
	console.error('\nUsage:');
	console.error('  export TURSO_DATABASE_URL=libsql://...');
	console.error('  export TURSO_AUTH_TOKEN=eyJ...');
	console.error('  node scripts/setup-turso.mjs');
	process.exit(1);
}

const client = createClient({
	url: process.env.TURSO_DATABASE_URL,
	authToken: process.env.TURSO_AUTH_TOKEN
});

console.log('🚀 Setting up Turso database schema...\n');
console.log('Database:', process.env.TURSO_DATABASE_URL, '\n');

const schema = `
CREATE TABLE IF NOT EXISTS personal_info (
	id INTEGER PRIMARY KEY AUTOINCREMENT,
	name TEXT NOT NULL,
	title TEXT NOT NULL,
	tagline TEXT NOT NULL,
	bio TEXT NOT NULL,
	location TEXT NOT NULL,
	email TEXT NOT NULL,
	github TEXT NOT NULL,
	linkedin TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS work_experience (
	id INTEGER PRIMARY KEY AUTOINCREMENT,
	company TEXT NOT NULL,
	position TEXT NOT NULL,
	type TEXT NOT NULL,
	duration TEXT NOT NULL,
	location TEXT NOT NULL,
	description TEXT NOT NULL,
	\`order\` INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS experience_skills (
	id INTEGER PRIMARY KEY AUTOINCREMENT,
	experience_id INTEGER NOT NULL REFERENCES work_experience(id) ON DELETE CASCADE,
	skill TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS education (
	id INTEGER PRIMARY KEY AUTOINCREMENT,
	institution TEXT NOT NULL,
	degree TEXT NOT NULL,
	field TEXT NOT NULL,
	duration TEXT NOT NULL,
	\`order\` INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS skills (
	id INTEGER PRIMARY KEY AUTOINCREMENT,
	category TEXT NOT NULL,
	skill TEXT NOT NULL,
	\`order\` INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS projects (
	id INTEGER PRIMARY KEY AUTOINCREMENT,
	title TEXT NOT NULL,
	description TEXT NOT NULL,
	tech_stack TEXT NOT NULL,
	url TEXT,
	\`order\` INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS blog_posts (
	id INTEGER PRIMARY KEY AUTOINCREMENT,
	slug TEXT NOT NULL UNIQUE,
	title TEXT NOT NULL,
	description TEXT NOT NULL,
	content TEXT NOT NULL,
	cover_image TEXT,
	published INTEGER NOT NULL DEFAULT 0,
	published_at INTEGER,
	created_at INTEGER NOT NULL,
	updated_at INTEGER NOT NULL,
	reading_time INTEGER NOT NULL DEFAULT 0,
	views INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS blog_tags (
	id INTEGER PRIMARY KEY AUTOINCREMENT,
	name TEXT NOT NULL UNIQUE,
	slug TEXT NOT NULL UNIQUE
);

CREATE TABLE IF NOT EXISTS blog_post_tags (
	id INTEGER PRIMARY KEY AUTOINCREMENT,
	post_id INTEGER NOT NULL REFERENCES blog_posts(id) ON DELETE CASCADE,
	tag_id INTEGER NOT NULL REFERENCES blog_tags(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS admin_users (
	id INTEGER PRIMARY KEY AUTOINCREMENT,
	username TEXT NOT NULL UNIQUE,
	password_hash TEXT NOT NULL,
	created_at INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS admin_sessions (
	id TEXT PRIMARY KEY,
	user_id INTEGER NOT NULL REFERENCES admin_users(id) ON DELETE CASCADE,
	expires_at INTEGER NOT NULL
);
`;

try {
	const statements = schema
		.split(';')
		.map((s) => s.trim())
		.filter((s) => s.length > 0);

	for (const statement of statements) {
		await client.execute(statement + ';');
		const tableName = statement.match(/CREATE TABLE IF NOT EXISTS (\w+)/)?.[1];
		if (tableName) {
			console.log('✅ Created table:', tableName);
		}
	}

	console.log('\n🎉 Schema setup complete!');
	console.log('\nNext step: Run the seed command to populate data');
	console.log('  source ~/.nvm/nvm.sh && nvm use 24');
	console.log('  export TURSO_DATABASE_URL=...');
	console.log('  export TURSO_AUTH_TOKEN=...');
	console.log('  yarn db:seed');
} catch (error) {
	console.error('❌ Error:', error.message);
	process.exit(1);
}
