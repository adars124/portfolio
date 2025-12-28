# Portfolio Database Management

This project uses SQLite with Drizzle ORM to store portfolio data.

## Database Commands

### Seed the database with portfolio data
```bash
yarn db:seed
```

### View/Edit database with Drizzle Studio
```bash
yarn db:studio
```
Then open http://localhost:4983 in your browser to visually edit your data.

### Generate migration after schema changes
```bash
yarn db:generate
```

### Push schema changes to database
```bash
yarn db:push
```

## Database Structure

- **personal_info** - Your personal information (name, title, bio, contact)
- **work_experience** - Job experiences
- **experience_skills** - Skills for each job experience
- **education** - Educational background
- **skills** - Technical skills grouped by category
- **projects** - Portfolio projects

## Updating Your Portfolio Data

### Option 1: Using Drizzle Studio (Recommended)
1. Run `yarn db:studio`
2. Open http://localhost:4983
3. Click on any table to view/edit data
4. Changes are saved automatically

### Option 2: Editing the Seed File
1. Edit `src/lib/server/db/seed.ts`
2. Run `yarn db:seed` to update the database

### Option 3: Direct Database Access
The database file is located at `local.db` in the project root.

## Troubleshooting

### Module version mismatch error
If you see errors about `better-sqlite3` module versions, run:
```bash
npm rebuild better-sqlite3
```

### Database locked error
Make sure Drizzle Studio is closed before running `yarn db:seed`.

## File Locations

- **Schema**: `src/lib/server/db/schema.ts`
- **Seed Script**: `src/lib/server/db/seed.ts`
- **Database Service**: `src/lib/server/services/portfolio.ts`
- **Database File**: `local.db` (gitignored)
