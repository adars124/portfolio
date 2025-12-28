# Quick Deployment Checklist

Use this checklist to deploy your portfolio to Vercel with domain `aadarshaupadhyaya.com.np`.

## ✅ Pre-Deployment Checklist

- [ ] Code is committed to Git
- [ ] Node.js 24 is installed (`nvm use 24`)
- [ ] Project builds successfully (`yarn build`)
- [ ] All tests pass (`yarn check`)

## 🗄️ Step 1: Set Up Turso Database (10 mins)

### Install Turso CLI
```bash
# macOS/Linux
curl -sSfL https://get.tur.so/install.sh | bash

# Or with Homebrew
brew install tursodatabase/tap/turso
```

### Create Database
```bash
# Login to Turso
turso auth signup  # or: turso auth login

# Create production database
turso db create portfolio-production

# Get database URL (save this!)
turso db show portfolio-production --url

# Get auth token (save this!)
turso db tokens create portfolio-production
```

### Setup Database Schema
```bash
# Export your Turso credentials
export TURSO_DATABASE_URL=libsql://portfolio-production-YOUR-ORG.turso.io
export TURSO_AUTH_TOKEN=your-token-here

# Create schema
node scripts/setup-turso.mjs

# Seed with your data (requires Node 24)
source ~/.nvm/nvm.sh && nvm use 24
yarn db:seed
```

**Save these values** - you'll add them to Vercel:
- `TURSO_DATABASE_URL`: libsql://...
- `TURSO_AUTH_TOKEN`: eyJ...

## 📦 Step 2: Push to GitHub (5 mins)

### Create GitHub Repo
1. Go to https://github.com/new
2. Name: `portfolio`
3. Visibility: Private
4. Click "Create repository"

### Push Code
```bash
# Initialize git (if needed)
git init
git add .
git commit -m "Initial commit: Portfolio ready for deployment"

# Add remote (replace YOUR_USERNAME)
git remote add origin https://github.com/YOUR_USERNAME/portfolio.git

# Push
git branch -M main
git push -u origin main
```

## 🚀 Step 3: Deploy to Vercel (10 mins)

### Import Project
1. Go to https://vercel.com
2. Sign in with GitHub
3. Click "Add New..." → "Project"
4. Import your repository
5. Vercel auto-detects SvelteKit settings

### Add Environment Variables
In the "Environment Variables" section, add:

```bash
# Required for production
TURSO_DATABASE_URL=libsql://portfolio-production-YOUR-ORG.turso.io
TURSO_AUTH_TOKEN=eyJhbGc...your-token-here

# Always include
DATABASE_URL=local.db
NODE_ENV=production
```

**For each variable**:
- Add to: Production, Preview, Development
- Click "Add"

### Deploy
1. Click "Deploy"
2. Wait 2-3 minutes
3. Site will be live at `https://your-project.vercel.app`

## 🌐 Step 4: Configure Custom Domain (15 mins)

### Add Domain
1. In Vercel project → Settings → Domains
2. Click "Add Domain"
3. Enter: `aadarshaupadhyaya.com.np`
4. Click "Add"

### Configure DNS
Go to your domain registrar's DNS settings and add:

**Option A: A Records (Recommended)**
| Type | Name | Value | TTL |
|------|------|-------|-----|
| A | @ | 76.76.19.19 | 3600 |
| A | www | 76.76.19.19 | 3600 |

**Option B: CNAME (Alternative)**
| Type | Name | Value | TTL |
|------|------|-------|-----|
| CNAME | www | cname.vercel-dns.com | 3600 |

### Wait for Propagation
- DNS changes take 5 mins - 48 hours
- Usually ready in 1-2 hours
- Check at: https://dnschecker.org

### Verify SSL
1. Wait for DNS to propagate
2. Vercel auto-issues SSL certificate
3. Visit: `https://aadarshaupadhyaya.com.np`

## 🔒 Step 5: Security (5 mins)

### Change Admin Password
```bash
# Connect to database
turso db shell portfolio-production

# Generate new password hash in Node
node -e "console.log(require('crypto').createHash('sha256').update('YOUR_NEW_PASSWORD').digest('hex'))"

# Update in database
UPDATE admin_users SET password_hash = 'YOUR_NEW_HASH' WHERE username = 'admin';
.quit
```

### Security Checklist
- [ ] Changed admin password
- [ ] HTTPS is enabled (check padlock icon)
- [ ] Environment variables are set in Vercel
- [ ] `.env` file is in `.gitignore`
- [ ] `local.db` is in `.vercelignore`

## ✅ Step 6: Test Everything

Visit these URLs and verify:

1. **Homepage**: https://aadarshaupadhyaya.com.np
   - [ ] Terminal loads
   - [ ] Commands work
   - [ ] ASCII art displays

2. **Blog**: https://aadarshaupadhyaya.com.np/blog
   - [ ] Posts load
   - [ ] Can view individual posts
   - [ ] Tags work

3. **Admin**: https://aadarshaupadhyaya.com.np/admin/login
   - [ ] Can login
   - [ ] Dashboard loads
   - [ ] Can create/edit posts

## 🎯 Quick Commands Reference

```bash
# Build locally
yarn build

# Preview build
yarn preview

# Check types
yarn check

# Format code
yarn format

# Commit and deploy
git add .
git commit -m "Update content"
git push  # Auto-deploys to Vercel!

# View Turso database
turso db shell portfolio-production

# Database Studio (local)
export TURSO_DATABASE_URL=...
export TURSO_AUTH_TOKEN=...
yarn db:studio
```

## 🐛 Troubleshooting

### Build fails on Vercel
1. Check build logs in Vercel
2. Test locally: `yarn build`
3. Fix errors, commit, push

### Domain not working
1. Check DNS: `nslookup aadarshaupadhyaya.com.np`
2. Verify DNS records are correct
3. Wait for propagation (up to 48 hours)

### Database errors
1. Check env vars in Vercel settings
2. Verify Turso database is accessible:
   ```bash
   turso db show portfolio-production
   ```

### Admin login fails
1. Check browser console
2. Verify database has admin user:
   ```bash
   turso db shell portfolio-production
   SELECT * FROM admin_users;
   ```

## 📚 Full Documentation

For detailed information, see:
- **[DEPLOYMENT.md](DEPLOYMENT.md)** - Complete deployment guide
- **[README.md](README.md)** - Project overview
- **[ADMIN.md](ADMIN.md)** - Admin panel guide
- **[DATABASE.md](DATABASE.md)** - Database management

## 🎉 Success!

Your portfolio is now live at:
- https://aadarshaupadhyaya.com.np
- https://www.aadarshaupadhyaya.com.np

Every git push automatically deploys! 🚀
