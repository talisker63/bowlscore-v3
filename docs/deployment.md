# BowlScore Deployment Guide

## Overview

BowlScore is deployed as a static single-page application (SPA) with backend services provided by Supabase. This guide covers deployment procedures, environment configuration, and operational considerations.

## Architecture Overview

```
┌─────────────────────────────────────────┐
│         Frontend (Static SPA)           │
│  ┌───────────────────────────────────┐  │
│  │     Vite Build Output             │  │
│  │  - HTML, CSS, JS bundles          │  │
│  │  - Optimized & minified           │  │
│  └───────────────────────────────────┘  │
│           Hosted on Vercel/Netlify      │
└────────────────┬────────────────────────┘
                 │
                 ↓
┌─────────────────────────────────────────┐
│         Supabase Platform               │
│  ┌──────────┐  ┌──────────┐            │
│  │   Auth   │  │ Database │            │
│  │          │  │(Postgres)│            │
│  └──────────┘  └──────────┘            │
│  ┌──────────┐  ┌──────────┐            │
│  │ Storage  │  │   Edge   │            │
│  │          │  │ Functions│            │
│  └──────────┘  └──────────┘            │
└────────────────┬────────────────────────┘
                 │
                 ↓
┌─────────────────────────────────────────┐
│            Stripe API                   │
│         Payment Processing              │
└─────────────────────────────────────────┘
```

## Prerequisites

### Required Accounts
- Supabase account with project created
- Stripe account (for payments)
- Hosting platform account (Vercel, Netlify, etc.)
- Domain registrar (optional, for custom domain)

### Required Tools
- Node.js 18+ and npm
- Git
- Supabase CLI (for migrations)
- Code editor

## Environment Variables

### Frontend (.env)

Create a `.env` file in the project root:

```bash
# Supabase Configuration
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here

# Stripe Configuration (Optional for development)
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_...
```

**Important Notes:**
- All variables must be prefixed with `VITE_` to be accessible in the app
- Never commit `.env` to version control (already in `.gitignore`)
- Use different keys for development and production

### Backend (Supabase Edge Functions)

Edge function environment variables are managed in Supabase dashboard:

```bash
# Required for all edge functions
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Required for Stripe functions
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Required for email functions
RESEND_API_KEY=re_...
# or
SENDGRID_API_KEY=SG...
```

**Setting Environment Variables:**
1. Go to Supabase Dashboard
2. Navigate to Edge Functions
3. Click on function
4. Add secrets in the Secrets section

## Database Setup

### 1. Create Supabase Project

```bash
# Via Dashboard:
1. Go to https://supabase.com
2. Click "New Project"
3. Fill in project details
4. Wait for provisioning (~2 minutes)
5. Note your project URL and keys
```

### 2. Apply Migrations

```bash
# Install Supabase CLI
npm install -g supabase

# Login to Supabase
supabase login

# Link to your project
supabase link --project-ref your-project-ref

# Apply all migrations
supabase db push

# Verify migrations
supabase db diff
```

**Migration Order:**
1. `20251006053845_create_initial_schema.sql`
2. `20251007054527_create_drill_sessions_table.sql`
3. `20251009010029_fix_security_and_performance_issues.sql`
4. `20251009042847_add_trial_tracking.sql`
5. `20251009095009_create_lead_vs_lead_sessions_table.sql`
6. `20251010034117_create_seconds_chance_sessions_table.sql`

### 3. Configure Storage

```bash
# Create storage bucket (via Dashboard or SQL)
1. Go to Storage in Supabase Dashboard
2. Create new bucket named "scorecards"
3. Make bucket public
4. Set file size limit to 10MB
5. Allow MIME types: image/jpeg, image/jpg
```

## Edge Functions Deployment

### 1. Deploy Functions

```bash
# Deploy all functions
supabase functions deploy

# Or deploy individual functions
supabase functions deploy stripe-webhook
supabase functions deploy stripe-checkout
supabase functions deploy email-scorecard
supabase functions deploy email-lead-vs-lead
supabase functions deploy email-seconds-chance
supabase functions deploy feedback
supabase functions deploy discount-request
supabase functions deploy discount-approve
supabase functions deploy cancel-subscription
```

### 2. Configure Function Secrets

```bash
# Set secrets via CLI
supabase secrets set STRIPE_SECRET_KEY=sk_live_...
supabase secrets set STRIPE_WEBHOOK_SECRET=whsec_...
supabase secrets set RESEND_API_KEY=re_...

# Or via Dashboard (recommended)
1. Go to Edge Functions
2. Select function
3. Add secrets in Secrets tab
```

### 3. Test Functions

```bash
# Test locally
supabase functions serve stripe-checkout --env-file .env.local

# Test deployed function
curl https://your-project.supabase.co/functions/v1/stripe-checkout \
  -H "Authorization: Bearer your-anon-key"
```

## Frontend Deployment

### Option 1: Vercel

#### Via Dashboard

1. Go to https://vercel.com
2. Click "New Project"
3. Import your Git repository
4. Configure:
   - Framework Preset: Vite
   - Build Command: `npm run build`
   - Output Directory: `dist`
5. Add environment variables
6. Deploy

#### Via CLI

```bash
# Install Vercel CLI
npm install -g vercel

# Login
vercel login

# Deploy
vercel

# Deploy to production
vercel --prod
```

**Environment Variables in Vercel:**
1. Go to Project Settings
2. Navigate to Environment Variables
3. Add all `VITE_*` variables
4. Redeploy for changes to take effect

### Option 2: Netlify

#### Via Dashboard

1. Go to https://netlify.com
2. Click "New site from Git"
3. Choose repository
4. Configure:
   - Build Command: `npm run build`
   - Publish Directory: `dist`
5. Add environment variables
6. Deploy

#### Via CLI

```bash
# Install Netlify CLI
npm install -g netlify-cli

# Login
netlify login

# Deploy
netlify deploy

# Deploy to production
netlify deploy --prod
```

### Option 3: Manual Deployment

```bash
# Build the application
npm run build

# Output will be in /dist directory
# Upload contents to any static hosting:
# - AWS S3 + CloudFront
# - Google Cloud Storage
# - Azure Static Web Apps
# - GitHub Pages
# - Firebase Hosting
```

## Stripe Configuration

### 1. Create Products

```bash
# Via Stripe Dashboard:
1. Go to Products
2. Create "Premium Monthly" product
3. Set recurring price
4. Note the Price ID
```

### 2. Configure Webhooks

```bash
# Add webhook endpoint:
1. Go to Developers > Webhooks
2. Add endpoint: https://your-project.supabase.co/functions/v1/stripe-webhook
3. Select events:
   - checkout.session.completed
   - customer.subscription.created
   - customer.subscription.updated
   - customer.subscription.deleted
4. Copy webhook signing secret
5. Add to Supabase secrets as STRIPE_WEBHOOK_SECRET
```

### 3. Update Price IDs in Code

```typescript
// src/stripe-config.ts
export const STRIPE_PRICE_IDS = {
  monthly: 'price_1234567890abcdef', // Update with your Price ID
};
```

## DNS Configuration

### Custom Domain Setup

#### For Vercel
1. Go to Project Settings > Domains
2. Add your domain
3. Configure DNS records:
   ```
   Type: CNAME
   Name: www (or @)
   Value: cname.vercel-dns.com
   ```

#### For Netlify
1. Go to Domain Settings
2. Add custom domain
3. Configure DNS records:
   ```
   Type: CNAME
   Name: www (or @)
   Value: your-site.netlify.app
   ```

### SSL/TLS
- Automatic via hosting provider
- Free Let's Encrypt certificates
- Auto-renewal handled

## Monitoring & Logging

### Supabase Logs

```bash
# View function logs
supabase functions logs stripe-webhook --tail

# View database logs
supabase db logs
```

### Application Monitoring

Recommended services:
- **Sentry** for error tracking
- **LogRocket** for session replay
- **Google Analytics** for user analytics
- **Mixpanel** for product analytics

### Uptime Monitoring

Tools to consider:
- UptimeRobot
- Pingdom
- StatusCake
- New Relic Synthetics

## Backup Procedures

### Database Backups

```bash
# Automated by Supabase (daily)
# Manual backup:
supabase db dump > backup.sql

# Restore from backup:
psql -h db.your-project.supabase.co -U postgres -d postgres < backup.sql
```

### Storage Backups

```bash
# Download all files from bucket
supabase storage download scorecards --destination ./backups/

# Sync to cloud backup
aws s3 sync ./backups/ s3://your-backup-bucket/
```

## CI/CD Pipeline

### GitHub Actions Example

```yaml
# .github/workflows/deploy.yml
name: Deploy

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - name: Setup Node
        uses: actions/setup-node@v3
        with:
          node-version: '18'

      - name: Install dependencies
        run: npm ci

      - name: Run tests
        run: npm test

      - name: Build
        run: npm run build
        env:
          VITE_SUPABASE_URL: ${{ secrets.VITE_SUPABASE_URL }}
          VITE_SUPABASE_ANON_KEY: ${{ secrets.VITE_SUPABASE_ANON_KEY }}
          VITE_STRIPE_PUBLISHABLE_KEY: ${{ secrets.VITE_STRIPE_PUBLISHABLE_KEY }}

      - name: Deploy to Vercel
        uses: amondnet/vercel-action@v20
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
          vercel-args: '--prod'
```

## Rollback Procedures

### Frontend Rollback

#### Vercel
```bash
# Via Dashboard:
1. Go to Deployments
2. Find previous deployment
3. Click "Promote to Production"

# Via CLI:
vercel rollback
```

#### Netlify
```bash
# Via Dashboard:
1. Go to Deploys
2. Find previous deploy
3. Click "Publish deploy"
```

### Database Rollback

```bash
# Restore from backup
supabase db reset --db-url your-backup-db-url

# Or run specific migration
supabase db push --dry-run
```

### Edge Functions Rollback

```bash
# Redeploy previous version
git checkout <previous-commit>
supabase functions deploy <function-name>
```

## Performance Optimization

### Build Optimization

```bash
# Analyze bundle size
npm run build -- --mode=analyze

# Results in dist/stats.html
```

### CDN Configuration

- Use Vercel or Netlify edge network
- Enable automatic asset optimization
- Configure cache headers
- Use image optimization services

### Database Optimization

```sql
-- Add indexes for common queries
CREATE INDEX idx_scorecards_user_id ON scorecards(user_id);
CREATE INDEX idx_drill_sessions_user_id ON drill_sessions(user_id);
CREATE INDEX idx_drill_sessions_drill_type ON drill_sessions(drill_type);

-- Analyze query performance
EXPLAIN ANALYZE SELECT * FROM scorecards WHERE user_id = 'xxx';
```

## Security Checklist

- [ ] Environment variables secured
- [ ] RLS policies enabled on all tables
- [ ] API keys rotated regularly
- [ ] HTTPS enforced
- [ ] CORS configured properly
- [ ] Rate limiting enabled
- [ ] Input validation in place
- [ ] SQL injection prevention
- [ ] XSS prevention
- [ ] CSRF protection
- [ ] Secrets never committed to repo
- [ ] Service role key never exposed to client
- [ ] Webhook signatures verified
- [ ] Authentication required for sensitive operations

## Troubleshooting

### Common Issues

#### Build Fails
```bash
# Clear cache and rebuild
rm -rf node_modules dist
npm install
npm run build
```

#### Environment Variables Not Working
```bash
# Check variable names start with VITE_
# Rebuild after adding variables
# Verify in deployment platform settings
```

#### Edge Function Errors
```bash
# Check function logs
supabase functions logs <function-name>

# Verify secrets are set
supabase secrets list

# Test locally
supabase functions serve <function-name>
```

#### Database Connection Issues
```bash
# Check project status
supabase projects list

# Verify connection string
supabase db inspect

# Test connection
psql -h db.your-project.supabase.co -U postgres
```

## Maintenance Schedule

### Daily
- Monitor error logs
- Check uptime
- Review usage metrics

### Weekly
- Review performance metrics
- Check for security updates
- Review user feedback

### Monthly
- Database maintenance (VACUUM, ANALYZE)
- Review and rotate API keys
- Audit user access
- Review storage usage

### Quarterly
- Security audit
- Performance optimization
- Dependency updates
- Disaster recovery test

## Support Contacts

### Internal
- Development Team: dev@bowlscore.com
- DevOps: devops@bowlscore.com

### External
- Supabase Support: https://supabase.com/support
- Vercel Support: https://vercel.com/support
- Stripe Support: https://support.stripe.com

## Additional Resources

- [Vite Deployment Guide](https://vitejs.dev/guide/static-deploy.html)
- [Supabase Documentation](https://supabase.com/docs)
- [Stripe API Reference](https://stripe.com/docs/api)
- [React Deployment Best Practices](https://react.dev/learn/start-a-new-react-project)

---

Last Updated: November 2024
