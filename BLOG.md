# Blog System Documentation

Your portfolio now includes a fully-featured blog system with MDSveX support for rich content.

## Features

✅ **Rich Text Support** - Write blog posts in HTML or use MDSveX for Markdown
✅ **Database-Backed** - All posts stored in SQLite
✅ **Tagging System** - Organize posts with tags
✅ **Reading Time** - Automatically calculated
✅ **View Tracking** - Track post views
✅ **Responsive Design** - Beautiful on all devices
✅ **SEO-Friendly** - Proper meta tags and structure

## File Structure

```
src/
├── routes/
│   ├── blog/
│   │   ├── +page.svelte              # Blog listing page
│   │   ├── +page.server.ts           # Load all posts
│   │   ├── [slug]/
│   │   │   ├── +page.svelte          # Individual post page
│   │   │   └── +page.server.ts       # Load single post
│   │   └── tag/[tag]/
│   │       ├── +page.svelte          # Posts by tag
│   │       └── +page.server.ts       # Filter by tag
│   └── +page.svelte                  # Terminal homepage
├── lib/
│   ├── components/blog/
│   │   └── BlogCard.svelte           # Reusable blog card
│   └── server/
│       ├── db/
│       │   ├── schema.ts             # Database schema
│       │   └── seed.ts               # Sample data
│       └── services/
│           └── blog.ts               # Blog service layer
```

## Creating a New Blog Post

### Option 1: Using Drizzle Studio (Recommended)

1. Start Drizzle Studio:
   ```bash
   yarn db:studio
   ```

2. Open http://localhost:4983

3. Navigate to `blog_posts` table

4. Click "Add Row" and fill in:
   - **slug**: URL-friendly identifier (e.g., `my-first-post`)
   - **title**: Post title
   - **description**: Short summary (for SEO and cards)
   - **content**: Full HTML content
   - **published**: Set to `true` to make visible
   - **publishedAt**: Publication date
   - **tags**: Add tags in the `blog_tags` and `blog_post_tags` tables

### Option 2: Programmatically

Use the blog service in your code:

```typescript
import { createPost } from '$lib/server/services/blog';

await createPost({
	slug: 'my-awesome-post',
	title: 'My Awesome Post',
	description: 'A great post about something cool',
	content: `
		<h2>Introduction</h2>
		<p>This is my blog post content...</p>
	`,
	published: true,
	publishedAt: new Date(),
	tags: ['AI', 'Web Development']
});
```

## Writing Content

### HTML Format

```html
<h2>This is a heading</h2>
<p>This is a paragraph with <strong>bold text</strong> and <em>italic text</em>.</p>

<ul>
	<li>List item 1</li>
	<li>List item 2</li>
</ul>

<pre><code>// Code block
function hello() {
  console.log('Hello World');
}
</code></pre>
```

### Styling

The blog posts use Tailwind's typography plugin with custom dark theme styles. All standard HTML elements are automatically styled.

## Blog Service API

Located at `src/lib/server/services/blog.ts`

### Query Functions

```typescript
// Get all published posts
const posts = await getPublishedPosts();

// Get all posts (including unpublished)
const allPosts = await getAllPosts();

// Get single post by slug
const post = await getPostBySlug('my-post-slug');

// Get posts by tag
const taggedPosts = await getPostsByTag('ai');

// Get all tags
const tags = await getAllTags();
```

### Mutation Functions

```typescript
// Create new post
const newPost = await createPost({
	slug: 'my-post',
	title: 'My Post',
	description: 'Description',
	content: '<p>Content</p>',
	published: true,
	tags: ['AI', 'Tech']
});

// Update existing post
await updatePost({
	id: 1,
	title: 'Updated Title',
	published: true
});

// Delete post
await deletePost(1);

// Increment view count
await incrementViews(1);
```

## Terminal Integration

Type `blog` in the terminal to navigate to the blog:

```bash
→ blog
```

This will redirect to `/blog` where all your posts are displayed.

## Routes

- `/blog` - All blog posts
- `/blog/[slug]` - Individual post
- `/blog/tag/[tag]` - Posts filtered by tag

## Database Schema

### blog_posts
- `id` - Auto-incrementing primary key
- `slug` - Unique URL-friendly identifier
- `title` - Post title
- `description` - Short summary
- `content` - Full HTML content
- `coverImage` - Optional cover image URL
- `published` - Boolean flag
- `publishedAt` - Publication timestamp
- `createdAt` - Creation timestamp
- `updatedAt` - Last update timestamp
- `readingTime` - Calculated reading time in minutes
- `views` - View count

### blog_tags
- `id` - Auto-incrementing primary key
- `name` - Tag display name
- `slug` - URL-friendly tag identifier

### blog_post_tags
- `id` - Auto-incrementing primary key
- `postId` - Foreign key to blog_posts
- `tagId` - Foreign key to blog_tags

## Best Practices

1. **Unique Slugs** - Always use unique, URL-friendly slugs
2. **SEO** - Fill in description for better SEO
3. **Images** - Use absolute URLs for cover images
4. **Tags** - Use consistent tag names for better organization
5. **Publishing** - Set `published: false` for drafts
6. **Content** - Use semantic HTML for better accessibility

## Customization

### Styling

Edit the prose styles in `src/routes/blog/[slug]/+page.svelte`:

```css
:global(.prose h2) {
	color: rgb(241 245 249);
	font-weight: 600;
}
```

### Layout

Modify `src/routes/blog/+page.svelte` for the listing page layout.

### Card Design

Edit `src/lib/components/blog/BlogCard.svelte` to customize the card appearance.

## Tips

- Reading time is automatically calculated (200 words per minute)
- View count increments automatically when posts are viewed
- Tags are created automatically when you add them to a post
- Use the Drizzle Studio for quick content management
- Backup your database regularly (it's in `local.db`)

## Example Posts

Two sample posts are included:
1. "Getting Started with Agentic AI"
2. "Building Scalable Web Apps with SvelteKit"

Feel free to edit or delete these and add your own content!
