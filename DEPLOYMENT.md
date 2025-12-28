# Deployment Guide - Vercel + Custom Domain

This guide will walk you through deploying your SvelteKit portfolio to Vercel with your custom domain `aadarshaupadhyaya.com.np`.

## Prerequisites

- GitHub account
- Vercel account (sign up at https://vercel.com)
- Turso account (sign up at https://turso.tech) - Free tier available
- Your custom domain: `aadarshaupadhyaya.com.np`

## Part 1: Set Up Turso Database (Production Database)

### Step 1: Install Turso CLI

```bash
# macOS/Linux
curl -sSfL https://get.tur.so/install.sh | bash

# Or using Homebrew
brew install tursodatabase/tap/turso
```

### Step 2: Sign Up and Login

```bash
# Sign up for Turso
turso auth signup

# Or login if you already have an account
turso auth login
```

### Step 3: Create Production Database

```bash
# Create a new database
turso db create portfolio-production

# Get the database URL
turso db show portfolio-production --url

# Create an authentication token
turso db tokens create portfolio-production
```

**Save these values** - you'll need them later:

- Database URL (e.g., `libsql://portfolio-production-your-org.turso.io`)
- Auth Token (a long string starting with `eyJ...`)

### Step 4: Create Schema in Turso

Export your Turso credentials and create the schema:

```bash
# Export credentials (replace with your actual values)
export TURSO_DATABASE_URL=libsql://portfolio-production-your-org.turso.io
export TURSO_AUTH_TOKEN=your-auth-token-here

# Create database schema
node scripts/setup-turso.mjs
```

### Step 5: Seed Production Database

```bash
# Use Node 24 and seed the database
source ~/.nvm/nvm.sh && nvm use 24

# Export credentials again if needed
export TURSO_DATABASE_URL=libsql://portfolio-production-your-org.turso.io
export TURSO_AUTH_TOKEN=your-auth-token-here

# Seed the database
yarn db:seed
```

**Note**: You should see "📡 Using Turso database" in the output, confirming it's using the production database.

## Part 2: Push Code to GitHub

### Step 1: Initialize Git (if not already done)

```bash
# Check if git is initialized
git status

# If not, initialize it
git init
git add .
git commit -m "Initial commit - Portfolio ready for deployment"
```

### Step 2: Create GitHub Repository

1. Go to https://github.com/new
2. Name it: `portfolio` (or any name you prefer)
3. Keep it **Private** (recommended)
4. Don't add README, .gitignore, or license (we already have them)
5. Click "Create repository"

### Step 3: Push to GitHub

```bash
# Add remote repository (replace YOUR_USERNAME with your GitHub username)
git remote add origin https://github.com/YOUR_USERNAME/portfolio.git

# Push to GitHub
git branch -M main
git push -u origin main
```

## Part 3: Deploy to Vercel

### Step 1: Sign Up/Login to Vercel

1. Go to https://vercel.com
2. Sign up with your GitHub account
3. Authorize Vercel to access your repositories

### Step 2: Import Your Project

1. Click **"Add New..."** → **"Project"**
2. Import your GitHub repository
3. Vercel will auto-detect it as a SvelteKit project

### Step 3: Configure Build Settings

Vercel should auto-detect these settings:

- **Framework Preset**: SvelteKit
- **Build Command**: `yarn build`
- **Output Directory**: `.vercel/output` (auto-configured by adapter)
- **Install Command**: `yarn install`
- **Node.js Version**: 22.x

### Step 4: Add Environment Variables

Click on **"Environment Variables"** and add the following:

| Name                 | Value                                             | Environment         |
| -------------------- | ------------------------------------------------- | ------------------- |
| `DATABASE_URL`       | `local.db`                                        | All                 |
| `TURSO_DATABASE_URL` | `libsql://portfolio-production-your-org.turso.io` | Production, Preview |
| `TURSO_AUTH_TOKEN`   | `eyJ...` (your token)                             | Production, Preview |
| `NODE_ENV`           | `production`                                      | Production          |

**Important**: Make sure to add `TURSO_DATABASE_URL` and `TURSO_AUTH_TOKEN` with your actual values from Step 3 of Part 1.

### Step 5: Deploy

1. Click **"Deploy"**
2. Wait for the build to complete (usually 1-3 minutes)
3. Your site will be live at `https://your-project-name.vercel.app`

## Part 4: Configure Custom Domain

### Step 1: Add Domain in Vercel

1. In your Vercel project, go to **Settings** → **Domains**
2. Click **"Add Domain"**
3. Enter: `aadarshaupadhyaya.com.np`
4. Click **"Add"**

### Step 2: Configure DNS Records

Vercel will show you the DNS records you need to add. Go to your domain registrar's DNS settings and add:

#### Option A: Using A Records (Recommended)

Add these A records:

| Type | Name | Value       |
| ---- | ---- | ----------- |
| A    | @    | 76.76.19.19 |
| A    | www  | 76.76.19.19 |

#### Option B: Using CNAME (Alternative)

| Type  | Name | Value                |
| ----- | ---- | -------------------- |
| CNAME | @    | cname.vercel-dns.com |
| CNAME | www  | cname.vercel-dns.com |

**Note**: Some DNS providers don't support CNAME for root domains (@). In that case, use Option A.

### Step 3: Wait for DNS Propagation

- DNS changes can take 5 minutes to 48 hours
- Usually propagates within 1-2 hours
- Check status at: https://dnschecker.org

### Step 4: Enable HTTPS

1. Once DNS is configured, Vercel will automatically issue an SSL certificate
2. This usually takes 1-5 minutes
3. Your site will be accessible at:
   - `https://aadarshaupadhyaya.com.np`
   - `https://www.aadarshaupadhyaya.com.np`

### Step 5: Set Primary Domain (Optional)

1. In Vercel → **Settings** → **Domains**
2. Click the three dots next to your custom domain
3. Select **"Set as Primary Domain"**
4. This ensures redirects work correctly

## Part 5: Verify Deployment

### Check These URLs:

1. **Homepage (Terminal)**: `https://aadarshaupadhyaya.com.np`
2. **Blog**: `https://aadarshaupadhyaya.com.np/blog`
3. **Admin Login**: `https://aadarshaupadhyaya.com.np/admin/login`

### Test Admin Panel:

1. Go to `/admin/login`
2. Login with:
   - Username: `admin`
   - Password: `admin123`
3. **Immediately change your password!** (see Production Security below)

### Test Database:

1. Login to admin panel
2. Try creating a test blog post
3. Verify it appears on `/blog`
4. Delete the test post

## Part 6: Production Security

### Change Admin Password

Since you can't change passwords in the UI yet, use Turso CLI:

```bash
# Connect to your database
turso db shell portfolio-production

# Generate new password hash (in Node.js)
node -e "console.log(require('crypto').createHash('sha256').update('YOUR_NEW_SECURE_PASSWORD').digest('hex'))"

# Update password in database
UPDATE admin_users SET password_hash = 'YOUR_NEW_HASH' WHERE username = 'admin';

# Exit shell
.quit
```

Or use Drizzle Studio locally with production database:

```bash
# Set production env vars temporarily
export TURSO_DATABASE_URL=libsql://portfolio-production-your-org.turso.io
export TURSO_AUTH_TOKEN=your-token

# Open Drizzle Studio
yarn db:studio

# Edit admin_users table, update password_hash
# Use Node to generate hash: crypto.createHash('sha256').update('newpass').digest('hex')
```

### Security Checklist

- ✅ Changed default admin password
- ✅ HTTPS enabled (automatic with Vercel)
- ✅ Environment variables set in Vercel (not in code)
- ✅ `local.db` in `.vercelignore` and `.gitignore`
- ✅ Admin URL kept private (don't share `/admin/login` publicly)
- ✅ Regular database backups

## Part 7: Continuous Deployment

Now your site has **automatic deployments**:

1. Make changes locally
2. Commit and push to GitHub:
   ```bash
   git add .
   git commit -m "Update portfolio content"
   git push
   ```
3. Vercel automatically deploys the changes
4. Check deployment status at https://vercel.com/dashboard

### Preview Deployments

Every branch and PR gets a preview URL:

- Create a new branch: `git checkout -b feature/new-design`
- Push changes: `git push origin feature/new-design`
- Vercel creates a preview URL for testing

## Part 8: Managing Content

### Update Portfolio Data

#### Option 1: Via Admin Panel (Recommended for Blog)

1. Go to `https://aadarshaupadhyaya.com.np/admin/login`
2. Manage blog posts through the UI

#### Option 2: Via Turso CLI

```bash
turso db shell portfolio-production
```

#### Option 3: Via Drizzle Studio

```bash
# Set env vars
export TURSO_DATABASE_URL=your-url
export TURSO_AUTH_TOKEN=your-token

# Open studio
yarn db:studio
```

### Database Backups

```bash
# Export database
turso db shell portfolio-production .dump > backup-$(date +%Y%m%d).sql

# Restore from backup
turso db shell portfolio-production < backup-20240101.sql
```

## Troubleshooting

### Build Fails on Vercel

**Check build logs**:

1. Go to your Vercel project
2. Click on the failed deployment
3. Check the build logs

**Common issues**:

- Missing environment variables
- TypeScript errors
- Missing dependencies

**Solution**: Fix locally, test with `yarn build`, then push.

### Database Connection Error

**Error**: `DATABASE_URL is not set`

**Solution**:

- Check environment variables in Vercel
- Make sure `TURSO_DATABASE_URL` and `TURSO_AUTH_TOKEN` are set

### Domain Not Working

**Check DNS**:

```bash
# Check if DNS has propagated
nslookup aadarshaupadhyaya.com.np

# Or use online tool
# https://dnschecker.org
```

**Solutions**:

- Wait for DNS propagation (up to 48 hours)
- Verify DNS records are correct
- Check domain registrar settings

### SSL Certificate Not Issued

**Vercel needs DNS to be configured first**:

1. Verify DNS records are correct
2. Wait for DNS to propagate
3. Vercel will auto-issue SSL certificate
4. If it takes more than 24 hours, contact Vercel support

### Admin Login Not Working

**Check**:

1. Are you using the correct credentials?
2. Check browser console for errors
3. Verify database has admin user:
   ```bash
   turso db shell portfolio-production
   SELECT * FROM admin_users;
   ```

### Database Schema Changes

When you update the schema:

```bash
# 1. Update schema.ts locally

# 2. Generate migration
yarn db:generate

# 3. Test locally
yarn db:push

# 4. Apply to production
export TURSO_DATABASE_URL=your-url
export TURSO_AUTH_TOKEN=your-token
yarn db:push

# 5. Commit and push
git add .
git commit -m "Update database schema"
git push
```

## Monitoring & Analytics

### Vercel Analytics (Optional)

1. Go to your project → **Analytics**
2. Click **"Enable Analytics"**
3. Adds automatic page view tracking

### Vercel Logs

View real-time logs:

1. Project → **Logs**
2. Filter by deployment, function, or time
3. Useful for debugging production issues

## Performance Optimization

### Vercel Edge Network

Your site is automatically deployed to Vercel's global CDN:

- Static assets cached globally
- Serverless functions run close to users
- Automatic image optimization

### Recommended Settings

In your Vercel project settings:

1. **Headers** → Add security headers:

   ```json
   {
   	"headers": [
   		{
   			"source": "/(.*)",
   			"headers": [
   				{
   					"key": "X-Frame-Options",
   					"value": "DENY"
   				},
   				{
   					"key": "X-Content-Type-Options",
   					"value": "nosniff"
   				}
   			]
   		}
   	]
   }
   ```

2. **Images** → Enable automatic optimization

## Cost Breakdown

### Turso (Database)

- **Free Tier**:
  - 500 databases
  - 9 GB total storage
  - 1 billion row reads/month
  - More than enough for a portfolio

### Vercel (Hosting)

- **Hobby (Free)**:
  - Unlimited deployments
  - 100 GB bandwidth/month
  - Serverless functions
  - Custom domain + SSL
  - Perfect for personal portfolios

**Total Cost**: $0/month for most personal portfolios!

## Next Steps

1. ✅ Deploy to Vercel
2. ✅ Configure custom domain
3. ✅ Change admin password
4. 📝 Update portfolio content
5. 📝 Write your first blog post
6. 📝 Share your portfolio URL!

## Useful Commands

```bash
# Local development
yarn dev

# Build locally (test before deploying)
yarn build

# Preview production build
yarn preview

# Type checking
yarn check

# Lint code
yarn lint

# Format code
yarn format

# Database operations
yarn db:studio          # Open Drizzle Studio
yarn db:push           # Push schema changes
yarn db:seed           # Seed database
```

## Support & Resources

- **Vercel Docs**: https://vercel.com/docs
- **SvelteKit Docs**: https://svelte.dev/docs/kit
- **Turso Docs**: https://docs.turso.tech
- **Drizzle ORM**: https://orm.drizzle.team

---

## Quick Reference

### Vercel CLI (Optional)

Install Vercel CLI for advanced features:

```bash
# Install
npm i -g vercel

# Deploy from terminal
vercel

# Production deployment
vercel --prod

# Check deployment status
vercel ls

# View logs
vercel logs
```

### Environment Variables

| Variable             | Local         | Production     | Description              |
| -------------------- | ------------- | -------------- | ------------------------ |
| `DATABASE_URL`       | `local.db`    | `local.db`     | Fallback for local dev   |
| `TURSO_DATABASE_URL` | -             | `libsql://...` | Production database URL  |
| `TURSO_AUTH_TOKEN`   | -             | `eyJ...`       | Production database auth |
| `NODE_ENV`           | `development` | `production`   | Environment flag         |

---

**Congratulations!** 🎉 Your portfolio is now live at `https://aadarshaupadhyaya.com.np`!
