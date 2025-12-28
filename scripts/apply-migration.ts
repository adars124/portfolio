import Database from 'better-sqlite3';
import { readFileSync } from 'fs';
import { join } from 'path';

const DATABASE_URL = process.env.DATABASE_URL || 'local.db';
const db = new Database(DATABASE_URL);

const migrationPath = join(process.cwd(), 'drizzle/0000_adorable_blackheart.sql');
const migration = readFileSync(migrationPath, 'utf-8');

const statements = migration
	.split('--> statement-breakpoint')
	.map((s) => s.trim())
	.filter((s) => s.length > 0);

console.log('Applying migration...');
for (const statement of statements) {
	console.log('Executing:', statement.substring(0, 50) + '...');
	db.exec(statement);
}

console.log('✅ Migration applied successfully!');
db.close();
