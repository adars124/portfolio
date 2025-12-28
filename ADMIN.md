# Admin Panel Documentation

Your portfolio now includes a secure admin panel for managing blog posts.

## Features

✅ **Secure Authentication** - Session-based auth with HTTP-only cookies
✅ **Blog Post Management** - Create, edit, delete posts
✅ **Draft Support** - Save posts as drafts before publishing
✅ **WYSIWYG Editor** - HTML content editor
✅ **Auto Slug Generation** - Automatically generate SEO-friendly slugs
✅ **Tag Management** - Organize posts with tags
✅ **Post Statistics** - View count and reading time
✅ **Preview** - Preview posts before publishing

## Accessing the Admin Panel

### Login URL
```
http://localhost:5173/admin/login
```

### Default Credentials
```
Username: admin
Password: admin123
```

**⚠️ IMPORTANT: Change your password immediately after first login!**

## Admin Routes

- `/admin/login` - Login page
- `/admin/posts` - All blog posts dashboard
- `/admin/posts/new` - Create new post
- `/admin/posts/[id]/edit` - Edit existing post
- `/admin/logout` - Logout endpoint

## Creating Your First Post

1. **Login** to the admin panel
2. Click **"+ New Post"**
3. Fill in the form:
   - **Title**: Your post title (auto-generates slug)
   - **Slug**: URL-friendly identifier (can be customized)
   - **Description**: Short summary for SEO (shows in previews)
   - **Content**: Full HTML content of your post
   - **Cover Image**: Optional cover image URL
   - **Tags**: Comma-separated tags (e.g., "AI, Web Development")
   - **Published**: Check to publish immediately, uncheck for draft

4. Click **"Create Post"**

## Writing Content

The admin panel uses HTML for content. Here's a quick reference:

### Basic HTML Tags

```html
<h2>Main Heading</h2>
<h3>Sub Heading</h3>

<p>This is a paragraph with <strong>bold text</strong> and <em>italic text</em>.</p>

<ul>
  <li>Bullet point 1</li>
  <li>Bullet point 2</li>
</ul>

<ol>
  <li>Numbered item 1</li>
  <li>Numbered item 2</li>
</ol>

<blockquote>
  This is a quote
</blockquote>

<a href="https://example.com">Link text</a>

<img src="https://example.com/image.jpg" alt="Description" />
```

### Code Blocks

```html
<pre><code>function hello() {
  console.log('Hello World');
}
</code></pre>
```

### Inline Code

```html
<p>Use the <code>useState</code> hook in React.</p>
```

## Security

### Authentication System

- **Session-based**: Uses HTTP-only cookies for security
- **7-day sessions**: Sessions expire after 7 days
- **Password hashing**: SHA-256 password hashing
- **Protected routes**: All `/admin/posts/*` routes require authentication

### File Structure

```
src/routes/admin/
├── login/
│   ├── +page.svelte              # Login UI
│   └── +page.server.ts           # Login logic
├── logout/
│   └── +server.ts                # Logout endpoint
└── posts/
    ├── +layout.svelte            # Admin layout
    ├── +layout.server.ts         # Auth check
    ├── +page.svelte              # Posts list
    ├── +page.server.ts           # Posts data
    ├── new/
    │   ├── +page.svelte          # New post form
    │   └── +page.server.ts       # Create post
    └── [id]/edit/
        ├── +page.svelte          # Edit post form
        └── +page.server.ts       # Update post
```

### Auth Service

Located at `src/lib/server/services/auth.ts`

```typescript
// Verify credentials
await verifyCredentials(username, password);

// Create session
await createSession(userId);

// Validate session
await validateSession(sessionId);

// Delete session (logout)
await deleteSession(sessionId);
```

## Changing Your Password

Currently, password changing is done through the database. To change your password:

### Option 1: Using Drizzle Studio

1. Run `yarn db:studio`
2. Open http://localhost:4983
3. Navigate to `admin_users` table
4. Edit your user's `password_hash`
5. Generate a new hash using Node:

```javascript
const crypto = require('crypto');
const newPassword = 'your-new-password';
const hash = crypto.createHash('sha256').update(newPassword).digest('hex');
console.log(hash);
```

### Option 2: Using the Seed Script

1. Edit `src/lib/server/db/seed.ts`
2. Change the password in the admin user creation
3. Run `yarn db:seed`

## Managing Blog Posts

### Dashboard Features

- **View all posts** - Published and drafts
- **Status indicators** - Green for published, yellow for drafts
- **Quick actions** - View, Edit, Delete buttons
- **Statistics** - View count, publication date

### Post Actions

**View**: Opens the post in a new tab (public view)
**Edit**: Opens the edit form
**Delete**: Permanently deletes the post (asks for confirmation)

### Editing Posts

1. Click **"Edit"** on any post
2. Modify the content
3. Click **"Update Post"**
4. Use **"Preview"** to see how it looks before saving

### Drafts

- Uncheck "Published" to save as draft
- Drafts won't appear on the blog
- Perfect for working on posts over time

## Tips & Best Practices

1. **SEO-Friendly Slugs**
   - Use lowercase letters, numbers, and hyphens only
   - Keep them short and descriptive
   - Example: `getting-started-with-ai` not `Getting Started with AI!!!`

2. **Descriptions**
   - Write compelling descriptions (150-160 characters)
   - Include keywords naturally
   - This shows in search results and social shares

3. **Tags**
   - Use consistent tag names
   - Don't create too many tags
   - Tags help users find related content

4. **Content Structure**
   - Use `<h2>` for main sections
   - Use `<h3>` for subsections
   - Break content into readable paragraphs
   - Use lists for better scannability

5. **Images**
   - Use absolute URLs for images
   - Always include alt text
   - Optimize images before uploading

## Database Schema

### admin_users
- `id` - Auto-incrementing primary key
- `username` - Unique username
- `passwordHash` - SHA-256 hashed password
- `createdAt` - Account creation timestamp

### admin_sessions
- `id` - Random session ID (32 bytes hex)
- `userId` - Foreign key to admin_users
- `expiresAt` - Session expiration timestamp

## Troubleshooting

### Can't Login

- Verify you're using the correct credentials
- Check that the database has the admin user
- Clear your browser cookies
- Check browser console for errors

### Session Expired

- Sessions last 7 days
- Login again to create a new session
- Your data won't be lost

### Can't Delete Post

- Check browser console for errors
- Verify you have the correct permissions
- Try refreshing the page

### Post Not Showing on Blog

- Make sure "Published" is checked
- Verify the slug is unique
- Check that the post was saved successfully

## Production Deployment

### Security Checklist

Before deploying to production:

1. ✅ Change default admin password
2. ✅ Use HTTPS (secure cookies)
3. ✅ Set strong password
4. ✅ Keep admin URL private
5. ✅ Regular backups of `local.db`
6. ✅ Monitor for suspicious activity

### Environment Variables

Make sure to set:
```bash
NODE_ENV=production  # Enables secure cookies
DATABASE_URL=path/to/production.db
```

## Advanced: Adding More Admins

To add another admin user, use the auth service:

```typescript
import { createAdminUser } from '$lib/server/services/auth';

await createAdminUser('newadmin', 'secure-password');
```

## Support

If you encounter any issues:

1. Check the browser console for errors
2. Check the server logs
3. Verify database integrity with Drizzle Studio
4. Review this documentation

## Future Enhancements

Possible improvements you could add:

- Password change functionality in UI
- Multi-user support with roles
- Image upload functionality
- Markdown editor integration
- Post scheduling
- Analytics dashboard
- Comment moderation
- SEO tools

---

**Remember**: Always backup your database before making major changes!
