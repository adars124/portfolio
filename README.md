# Portfolio Website with Terminal Interface

A modern, interactive portfolio website built with SvelteKit, featuring a terminal-style interface, blog system, and admin panel. The unique terminal UI provides an engaging way for visitors to explore your professional information, work experience, projects, and blog posts.

## Features

### Terminal Interface
- Interactive terminal-style homepage
- Custom commands for navigation (`help`, `about`, `experience`, `skills`, `projects`, `blog`, etc.)
- ASCII art branding
- Command history and autocomplete
- Fully responsive design

### Blog System
- Database-backed blog with SQLite
- Rich text editor with TipTap
- Tag-based organization
- Reading time calculation
- View tracking
- Draft and publish workflow
- SEO-friendly URLs

### Admin Panel
- Secure session-based authentication
- Create, edit, and delete blog posts
- WYSIWYG editor for rich content
- Draft support
- Auto-generated slugs
- Tag management
- Post statistics

### Tech Stack
- **Framework**: SvelteKit (v2.49.1) with Svelte 5
- **Database**: SQLite with Drizzle ORM
- **Styling**: Tailwind CSS v4 with Typography plugin
- **Editor**: TipTap rich text editor
- **Content**: MDSveX for Markdown support
- **Type Safety**: TypeScript
- **Deployment**: Adapter Auto (supports multiple platforms)

## Prerequisites

- Node.js (see [.nvmrc](.nvmrc) for recommended version)
- Yarn package manager

## Getting Started

### 1. Installation

Clone the repository and install dependencies:

```bash
# Install dependencies
yarn install
```

### 2. Environment Setup

Create a `.env` file in the root directory:

```bash
cp .env.example .env
```

The default configuration uses a local SQLite database:

```env
DATABASE_URL=local.db
```

### 3. Database Setup

Initialize and seed the database:

```bash
# Push schema to database
yarn db:push

# Seed with sample data
yarn db:seed
```

### 4. Start Development Server

```bash
# Start the dev server
yarn dev

# Or open in browser automatically
yarn dev -- --open
```

The application will be available at `http://localhost:5173`

## Project Structure

```
svelte-intro/
├── src/
│   ├── lib/
│   │   ├── assets/              # Static assets (favicon, etc.)
│   │   ├── components/          # Reusable Svelte components
│   │   │   ├── blog/           # Blog-specific components
│   │   │   ├── Terminal.svelte # Terminal interface component
│   │   │   └── RichTextEditor.svelte # TipTap editor
│   │   ├── data/               # Static data and command definitions
│   │   ├── server/             # Server-side code
│   │   │   ├── db/            # Database schema and migrations
│   │   │   │   ├── schema.ts  # Drizzle schema definitions
│   │   │   │   └── seed.ts    # Database seeding script
│   │   │   └── services/      # Business logic layer
│   │   │       ├── auth.ts    # Authentication service
│   │   │       ├── blog.ts    # Blog service
│   │   │       └── portfolio.ts # Portfolio data service
│   │   └── types/              # TypeScript type definitions
│   ├── routes/
│   │   ├── admin/              # Admin panel routes
│   │   │   ├── login/         # Login page
│   │   │   ├── logout/        # Logout endpoint
│   │   │   └── posts/         # Post management
│   │   │       ├── new/       # Create new post
│   │   │       └── [id]/edit/ # Edit existing post
│   │   ├── blog/               # Public blog routes
│   │   │   ├── [slug]/        # Individual post page
│   │   │   └── tag/[tag]/     # Posts filtered by tag
│   │   ├── +layout.svelte      # Root layout
│   │   ├── +page.svelte        # Terminal homepage
│   │   └── +page.server.ts     # Homepage data loading
│   ├── app.html                # HTML template
│   └── app.d.ts                # Global type definitions
├── static/                      # Static files served as-is
├── drizzle/                     # Database migrations
├── scripts/                     # Utility scripts
├── drizzle.config.ts            # Drizzle ORM configuration
├── svelte.config.js             # SvelteKit configuration
├── vite.config.ts               # Vite configuration
├── tailwind.config.js           # Tailwind CSS configuration (v4)
├── tsconfig.json                # TypeScript configuration
├── .env.example                 # Environment variables template
└── local.db                     # SQLite database (generated)
```

## Available Commands

### Development
```bash
yarn dev              # Start development server
yarn build            # Build for production
yarn preview          # Preview production build
```

### Code Quality
```bash
yarn check            # Type-check with svelte-check
yarn check:watch      # Type-check in watch mode
yarn lint             # Run ESLint and Prettier checks
yarn format           # Format code with Prettier
```

### Database Management
```bash
yarn db:push          # Push schema changes to database
yarn db:generate      # Generate migrations
yarn db:migrate       # Run migrations
yarn db:studio        # Open Drizzle Studio (GUI for database)
yarn db:seed          # Seed database with sample data
```

## Terminal Commands

Once the app is running, try these commands in the terminal interface:

- `help` - Show all available commands
- `about` - Display personal information
- `experience` - List work experience
- `skills` - Show technical skills
- `education` - Display educational background
- `projects` - List portfolio projects
- `blog` - Navigate to blog
- `contact` - Show contact information
- `clear` - Clear terminal history
- `exit` - Navigate back to homepage

## Admin Panel

### Accessing the Admin Panel

Navigate to `/admin/login` and use the default credentials:

```
Username: admin
Password: admin123
```

**Important**: Change the default password immediately after first login!

### Admin Routes

- `/admin/login` - Login page
- `/admin/posts` - Blog post dashboard
- `/admin/posts/new` - Create new post
- `/admin/posts/[id]/edit` - Edit existing post
- `/admin/logout` - Logout endpoint

### Managing Content

#### Creating a Blog Post

1. Login to admin panel
2. Click "New Post"
3. Fill in the form:
   - Title (auto-generates slug)
   - Description (for SEO)
   - Content (HTML/rich text)
   - Tags (comma-separated)
   - Published status
4. Click "Create Post"

#### Using Drizzle Studio

For direct database access:

```bash
yarn db:studio
```

Open `http://localhost:4983` to view and edit all tables visually.

## Database Schema

### Core Tables

- **personal_info** - Personal information and contact details
- **work_experience** - Job experiences with skills
- **experience_skills** - Skills associated with each job
- **education** - Educational background
- **skills** - Technical skills by category
- **projects** - Portfolio projects

### Blog Tables

- **blog_posts** - Blog post content and metadata
- **blog_tags** - Available tags
- **blog_post_tags** - Many-to-many relationship

### Admin Tables

- **admin_users** - Admin user accounts
- **admin_sessions** - Active sessions

See [DATABASE.md](DATABASE.md) for detailed schema documentation.

## Customization

### Updating Your Information

#### Option 1: Drizzle Studio (Recommended)
1. Run `yarn db:studio`
2. Edit tables directly in the browser
3. Changes save automatically

#### Option 2: Seed File
1. Edit [src/lib/server/db/seed.ts](src/lib/server/db/seed.ts)
2. Run `yarn db:seed`

### Customizing the Terminal

Edit terminal commands in [src/lib/data/portfolio.ts](src/lib/data/portfolio.ts)

### Styling

- Global styles: [src/routes/layout.css](src/routes/layout.css)
- Tailwind config: Uses Tailwind CSS v4 with `@tailwindcss/vite` plugin
- Component styles: Scoped to individual `.svelte` files

### Adding New Routes

SvelteKit uses file-based routing. Add new routes in `src/routes/`:

```
src/routes/
├── your-page/
│   ├── +page.svelte        # UI component
│   └── +page.server.ts     # Server-side logic (optional)
```

## Security

### Authentication

- Session-based auth with HTTP-only cookies
- 7-day session expiration
- SHA-256 password hashing
- Protected admin routes

### Best Practices

Before deploying to production:

1. Change default admin password
2. Use HTTPS (required for secure cookies)
3. Set `NODE_ENV=production`
4. Keep admin URLs private
5. Regular database backups
6. Review [ADMIN.md](ADMIN.md) security checklist

## Deployment

### Build for Production

```bash
yarn build
```

### Environment Variables

Set these in your production environment:

```bash
NODE_ENV=production
DATABASE_URL=/path/to/production.db
```

### Adapter Configuration

The project uses `@sveltejs/adapter-auto` which automatically detects your deployment platform. Supported platforms include:

- Vercel
- Netlify
- Cloudflare Pages
- And more

For specific platforms, you may want to install a dedicated adapter. See [SvelteKit adapters documentation](https://svelte.dev/docs/kit/adapters).

## Documentation

- [ADMIN.md](ADMIN.md) - Comprehensive admin panel guide
- [BLOG.md](BLOG.md) - Blog system documentation
- [DATABASE.md](DATABASE.md) - Database schema and management

## Troubleshooting

### Module version mismatch (better-sqlite3)

```bash
npm rebuild better-sqlite3
```

### Database locked error

Close Drizzle Studio before running `yarn db:seed`

### Session expired

Sessions last 7 days. Simply login again to create a new session.

### TypeScript errors

```bash
yarn check
```

### Port already in use

Change the port in your dev command:
```bash
yarn dev -- --port 3000
```

## Technologies Used

- **SvelteKit** - Full-stack framework
- **Svelte 5** - Reactive UI framework
- **TypeScript** - Type safety
- **Tailwind CSS v4** - Utility-first CSS
- **Drizzle ORM** - Type-safe database toolkit
- **Better SQLite3** - SQLite database driver
- **TipTap** - Rich text editor
- **MDSveX** - Markdown preprocessor
- **ESLint** - Code linting
- **Prettier** - Code formatting

## License

This project is private and not licensed for public use.

## Support

For issues and questions:
1. Check the documentation files
2. Review browser console for errors
3. Check server logs
4. Verify database integrity with Drizzle Studio

---

Built with SvelteKit and Svelte 5
