# BowlScore Quick Reference

## Essential Commands

### Development
```bash
npm run dev          # Start development server (localhost:5173)
npm run typecheck    # Check TypeScript types
npm run lint         # Run ESLint
npm run build        # Build for production
```

### Database
```bash
supabase link --project-ref <ref>    # Link to Supabase project
supabase db push                     # Apply migrations
supabase db reset                    # Reset local database
supabase migration new <name>        # Create new migration
```

### Edge Functions
```bash
supabase functions serve <name>      # Test function locally
supabase functions deploy <name>     # Deploy function
supabase functions logs <name>       # View function logs
supabase secrets set KEY=value       # Set environment secret
```

## File Locations

### Key Files
- `src/contexts/AuthContext.tsx` - Authentication state
- `src/lib/supabase.ts` - Supabase client
- `src/stripe-config.ts` - Stripe configuration
- `.env` - Environment variables (not in git)

### Components
- `src/components/` - Reusable components
- `src/pages/` - Route components
- `src/hooks/` - Custom hooks

### Backend
- `supabase/functions/` - Edge functions
- `supabase/migrations/` - Database migrations

## Environment Variables

### Frontend (.env)
```bash
VITE_SUPABASE_URL=https://xxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJxxx
VITE_STRIPE_PUBLISHABLE_KEY=pk_xxx
```

### Edge Functions (Supabase Dashboard)
```bash
STRIPE_SECRET_KEY=sk_xxx
STRIPE_WEBHOOK_SECRET=whsec_xxx
RESEND_API_KEY=re_xxx
```

## Common Tasks

### Add New Feature
1. Create branch: `git checkout -b feature/name`
2. Develop and test
3. Commit: `git commit -m "feat: description"`
4. Push: `git push origin feature/name`
5. Create Pull Request

### Add Database Table
1. Create migration: `supabase migration new table_name`
2. Write SQL in migration file
3. Test: `supabase db reset`
4. Apply: `supabase db push`

### Deploy Edge Function
1. Edit `supabase/functions/<name>/index.ts`
2. Test locally: `supabase functions serve <name>`
3. Deploy: `supabase functions deploy <name>`
4. Check logs: `supabase functions logs <name>`

### Fix Premium Feature Bug
1. Check `useAuth()` hook usage
2. Verify `isPremium` (not `profile?.is_premium`)
3. Test with premium and free accounts
4. Check subscription status in database

## Code Patterns

### Check Premium Status
```typescript
// ✅ Correct
const { isPremium } = useAuth();
if (!isPremium) {
  alert('Premium feature');
  return;
}

// ❌ Wrong
if (!profile?.is_premium) { // Field doesn't exist
  // ...
}
```

### Database Query
```typescript
const { data, error } = await supabase
  .from('table_name')
  .select('*')
  .eq('user_id', user.id)
  .maybeSingle(); // Use for 0 or 1 results
```

### Edge Function Template
```typescript
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Client-Info, Apikey',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    // Your logic
    return new Response(JSON.stringify(data), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});
```

## Troubleshooting

### Build Fails
```bash
rm -rf node_modules dist
npm install
npm run build
```

### Environment Variables Not Working
- Ensure `VITE_` prefix for frontend vars
- Restart dev server after changes
- Check `.env` file exists and is not in `.gitignore`

### Database Connection Issues
```bash
supabase link --project-ref your-ref
supabase db inspect
```

### Edge Function Errors
```bash
supabase functions logs <name> --tail
```

## Database Tables Quick Reference

| Table | Purpose | Premium Only |
|-------|---------|--------------|
| profiles | User profiles | No |
| subscriptions | Premium status | No |
| scorecards | Traditional scorecards | No |
| drill_sessions | 40 Bowls Draw | View only |
| lead_vs_lead_sessions | Lead vs Lead drill | View only |
| seconds_chance_sessions | 2nd's Chance drill | View only |
| discount_requests | Discount requests | No |

## Premium Feature Gates

Features requiring `isPremium`:
- Save drill sessions
- View drill history
- Download drill results
- Email drill results
- Save scorecards to cloud
- Email scorecards

## URLs

### Development
- App: http://localhost:5173
- Supabase Studio: http://localhost:54323
- Edge Functions: http://localhost:54321/functions/v1/

### Production
- Supabase Dashboard: https://supabase.com/dashboard
- Stripe Dashboard: https://dashboard.stripe.com

## Key Metrics

| Metric | Value |
|--------|-------|
| Total Code | ~15,000 lines |
| Documentation | ~12,000 words |
| Components | 18 |
| Pages | 7 |
| Edge Functions | 9 |
| Database Tables | 8 |
| Migrations | 6 |

## Support

- **Docs**: `/docs/` folder
- **Development Guide**: `docs/development-guide.md`
- **Architecture**: `docs/architecture.md`
- **Database**: `docs/database-schema.md`
- **Deployment**: `docs/deployment.md`

## Git Workflow

```bash
# Feature branch
git checkout -b feature/name

# Regular commits
git add .
git commit -m "type: description"

# Push and PR
git push origin feature/name
# Create PR on GitHub

# After merge
git checkout develop
git pull origin develop
git branch -d feature/name
```

## Commit Types

- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation
- `style`: Formatting
- `refactor`: Code restructuring
- `test`: Tests
- `chore`: Maintenance

---

**Quick Links**:
- [Full Documentation](./README.md)
- [Roadmap](./bowlscore-roadmap.md)
- [Features](./features.md)
- [Architecture](./architecture.md)
