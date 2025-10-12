# BowlScore Development Guide

## Overview

This guide covers everything developers need to know to work on BowlScore effectively, from initial setup to advanced development workflows.

## Prerequisites

### Required Software
- **Node.js**: 18.x or higher
- **npm**: 9.x or higher (comes with Node.js)
- **Git**: Latest version
- **Code Editor**: VS Code recommended

### Recommended VS Code Extensions
- ESLint
- Prettier
- TypeScript and JavaScript
- Tailwind CSS IntelliSense
- GitLens
- Error Lens
- Auto Rename Tag
- Supabase

### Accounts Required
- GitHub account (for version control)
- Supabase account (for backend services)
- Stripe account (for testing payments)

## Initial Setup

### 1. Clone Repository

```bash
git clone https://github.com/your-org/bowlscore.git
cd bowlscore
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Environment Configuration

Create a `.env` file in the project root:

```bash
# Supabase Configuration
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key

# Stripe Configuration (use test keys)
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_...
```

**Getting Supabase Keys:**
1. Go to your Supabase project dashboard
2. Navigate to Settings > API
3. Copy the project URL and anon/public key

**Getting Stripe Keys:**
1. Go to Stripe Dashboard
2. Switch to Test mode
3. Go to Developers > API keys
4. Copy the Publishable key

### 4. Database Setup

```bash
# Install Supabase CLI
npm install -g supabase

# Login to Supabase
supabase login

# Link to your project
supabase link --project-ref your-project-ref

# Run migrations
supabase db push
```

### 5. Start Development Server

```bash
npm run dev
```

The application will be available at `http://localhost:5173`

## Project Structure

```
bowlscore/
├── docs/                       # Documentation
├── public/                     # Static assets
│   └── images/                 # Image files
├── src/
│   ├── components/             # React components
│   │   ├── AuthModal.tsx       # Authentication modal
│   │   ├── DrillComponents/    # Drill-specific components
│   │   └── Shared/             # Shared UI components
│   ├── contexts/               # React contexts
│   │   └── AuthContext.tsx     # Authentication state
│   ├── hooks/                  # Custom React hooks
│   │   ├── useAuth.ts          # Authentication hook
│   │   ├── useStripe.ts        # Stripe integration
│   │   └── useSubscription.ts  # Subscription management
│   ├── lib/                    # Utility libraries
│   │   ├── supabase.ts         # Supabase client
│   │   └── jpegGenerator.ts    # Image generation
│   ├── pages/                  # Page components (routes)
│   │   ├── HomePage.tsx
│   │   ├── DashboardPage.tsx
│   │   ├── DrillPage.tsx
│   │   └── ...
│   ├── App.tsx                 # Main app component
│   ├── main.tsx                # Entry point
│   └── index.css               # Global styles
├── supabase/
│   ├── functions/              # Edge functions
│   │   ├── stripe-webhook/
│   │   ├── stripe-checkout/
│   │   ├── email-scorecard/
│   │   └── ...
│   └── migrations/             # Database migrations
├── .env                        # Environment variables (gitignored)
├── .gitignore                  # Git ignore rules
├── package.json                # Dependencies and scripts
├── tsconfig.json               # TypeScript config
├── vite.config.ts              # Vite config
└── tailwind.config.js          # Tailwind config
```

## Development Workflow

### Branch Strategy

```
main (production)
  ├── develop (staging)
      ├── feature/drill-xyz
      ├── feature/scorecard-improvement
      ├── bugfix/premium-access
      └── hotfix/critical-bug
```

**Branch Types:**
- `feature/*` - New features
- `bugfix/*` - Bug fixes
- `hotfix/*` - Critical production fixes
- `refactor/*` - Code refactoring
- `docs/*` - Documentation updates

### Workflow Steps

1. **Create Branch**
   ```bash
   git checkout develop
   git pull origin develop
   git checkout -b feature/your-feature-name
   ```

2. **Make Changes**
   - Write code
   - Test locally
   - Commit regularly

3. **Commit Changes**
   ```bash
   git add .
   git commit -m "feat: add new drill functionality"
   ```

4. **Push Branch**
   ```bash
   git push origin feature/your-feature-name
   ```

5. **Create Pull Request**
   - Open PR to `develop` branch
   - Add description
   - Request review
   - Address feedback

6. **Merge**
   - Squash and merge to `develop`
   - Delete feature branch
   - Deploy to staging for testing

### Commit Message Convention

Follow [Conventional Commits](https://www.conventionalcommits.org/):

```
<type>(<scope>): <subject>

<body>

<footer>
```

**Types:**
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting)
- `refactor`: Code refactoring
- `test`: Adding tests
- `chore`: Maintenance tasks

**Examples:**
```bash
feat(drills): add 40 bowls draw drill
fix(auth): correct premium feature access check
docs(readme): update installation instructions
refactor(scorecard): simplify scoring logic
```

## Code Standards

### TypeScript

```typescript
// ✅ Good: Use explicit types
interface Player {
  name: string;
  score: number;
}

const players: Player[] = [];

// ❌ Bad: Avoid 'any'
const players: any[] = [];
```

### React Components

```typescript
// ✅ Good: Functional component with TypeScript
import React, { useState } from 'react';

interface ScoreInputProps {
  onChange: (score: number) => void;
  defaultValue?: number;
}

const ScoreInput: React.FC<ScoreInputProps> = ({
  onChange,
  defaultValue = 0
}) => {
  const [score, setScore] = useState(defaultValue);

  return (
    <input
      type="number"
      value={score}
      onChange={(e) => {
        const newScore = Number(e.target.value);
        setScore(newScore);
        onChange(newScore);
      }}
    />
  );
};

export default ScoreInput;
```

### State Management

```typescript
// ✅ Good: Use context for global state
const { user, isPremium } = useAuth();

// ✅ Good: Use useState for local state
const [score, setScore] = useState(0);

// ❌ Bad: Don't use globals
window.userScore = 0;
```

### Styling

```typescript
// ✅ Good: Use Tailwind classes
<button className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
  Click Me
</button>

// ✅ Good: Extract repeated styles
const buttonClasses = "px-4 py-2 rounded font-semibold transition-colors";

// ❌ Bad: Inline styles (avoid unless necessary)
<button style={{ padding: '8px 16px', background: 'blue' }}>
  Click Me
</button>
```

### Error Handling

```typescript
// ✅ Good: Proper error handling
try {
  const result = await someOperation();
  alert('Success!');
} catch (error) {
  console.error('Operation failed:', error);
  alert('An error occurred. Please try again.');
}

// ❌ Bad: Silent failures
try {
  await someOperation();
} catch (error) {
  // Nothing
}
```

## Testing

### Manual Testing Checklist

Before submitting a PR:

- [ ] Feature works as expected
- [ ] Error cases handled gracefully
- [ ] Mobile responsive
- [ ] Works in Chrome, Firefox, Safari
- [ ] Premium features gated correctly
- [ ] No console errors
- [ ] Data saves correctly
- [ ] Images generate properly

### Testing Authentication

```typescript
// Test different auth states
1. Test as logged out user
2. Test as free user
3. Test as premium user
4. Test as trial user
5. Test expired subscription
```

### Testing Premium Features

```typescript
// Verify premium checks
const { isPremium } = useAuth();

if (!isPremium) {
  alert('Premium feature');
  return;
}
// Premium code here
```

## Database Development

### Creating Migrations

```bash
# Create new migration
supabase migration new your_migration_name

# Edit file in supabase/migrations/
# Add SQL statements

# Test locally
supabase db reset

# Apply to remote
supabase db push
```

### Migration Template

```sql
/*
  # Migration Title

  1. Changes
    - What's being added
    - What's being modified
    - What's being removed

  2. Security
    - RLS policies
    - Grants and permissions
*/

-- Your SQL here
CREATE TABLE IF NOT EXISTS table_name (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE table_name ENABLE ROW LEVEL SECURITY;

-- Add policies
CREATE POLICY "Users can view own data"
  ON table_name FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);
```

### Testing Database Changes

```bash
# Reset local database
supabase db reset

# Run specific migration
supabase migration up <timestamp>

# Test queries
supabase db inspect
```

## Edge Functions Development

### Creating New Function

```bash
# Create function
supabase functions new my-function

# Edit supabase/functions/my-function/index.ts
```

### Function Template

```typescript
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Client-Info, Apikey',
};

serve(async (req: Request) => {
  // Handle OPTIONS for CORS
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    // Your logic here
    const data = { message: 'Hello World' };

    return new Response(
      JSON.stringify(data),
      {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      }
    );
  }
});
```

### Testing Functions Locally

```bash
# Start function locally
supabase functions serve my-function --env-file .env.local

# Test with curl
curl -X POST http://localhost:54321/functions/v1/my-function \
  -H "Authorization: Bearer your-anon-key" \
  -H "Content-Type: application/json" \
  -d '{"key":"value"}'
```

### Deploying Functions

```bash
# Deploy single function
supabase functions deploy my-function

# Deploy all functions
supabase functions deploy
```

## Debugging

### React DevTools

1. Install React DevTools browser extension
2. Open DevTools
3. Navigate to Components tab
4. Inspect component state and props

### Supabase Logs

```bash
# View function logs
supabase functions logs my-function --tail

# View specific time range
supabase functions logs my-function --since 1h
```

### Network Debugging

1. Open browser DevTools
2. Navigate to Network tab
3. Filter by XHR/Fetch
4. Inspect request/response data

### Common Issues

#### Issue: Environment variables not working
```bash
# Solution: Ensure VITE_ prefix
VITE_MY_VAR=value  # ✅ Correct
MY_VAR=value       # ❌ Wrong

# Restart dev server after changes
```

#### Issue: Database connection failed
```bash
# Solution: Check credentials
supabase link --project-ref your-ref
supabase db inspect
```

#### Issue: Build fails
```bash
# Solution: Clear cache and rebuild
rm -rf node_modules dist
npm install
npm run build
```

## Performance Optimization

### Code Splitting

```typescript
// Use React.lazy for route-based code splitting
import React, { lazy, Suspense } from 'react';

const DrillPage = lazy(() => import('./pages/DrillPage'));

function App() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <DrillPage />
    </Suspense>
  );
}
```

### Memoization

```typescript
import React, { useMemo, useCallback } from 'react';

// Memoize expensive calculations
const stats = useMemo(() => calculateStats(data), [data]);

// Memoize callbacks
const handleClick = useCallback(() => {
  doSomething(id);
}, [id]);
```

### Image Optimization

```typescript
// Optimize html2canvas settings
const canvas = await html2canvas(element, {
  scale: 2,          // 2x for retina displays
  logging: false,    // Disable logs
  useCORS: true,     // Enable cross-origin images
  backgroundColor: '#ffffff',
});
```

## Security Best Practices

### Never Expose Secrets

```typescript
// ❌ Bad: Exposing service role key
const supabase = createClient(url, serviceRoleKey);

// ✅ Good: Use anon key in client
const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);
```

### Always Validate Input

```typescript
// ✅ Good: Validate user input
const sanitizeEmail = (email: string) => {
  return email.trim().toLowerCase();
};

const email = sanitizeEmail(userInput);
if (!email.includes('@')) {
  throw new Error('Invalid email');
}
```

### Use RLS Policies

```sql
-- ✅ Good: Restrict access
CREATE POLICY "Users can only see own data"
  ON table_name FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- ❌ Bad: Open access
CREATE POLICY "Anyone can see all data"
  ON table_name FOR SELECT
  USING (true);
```

## Getting Help

### Resources

- **React Documentation**: https://react.dev
- **TypeScript Handbook**: https://www.typescriptlang.org/docs/
- **Supabase Docs**: https://supabase.com/docs
- **Tailwind CSS Docs**: https://tailwindcss.com/docs
- **Vite Guide**: https://vitejs.dev/guide/

### Team Communication

- **Daily Standup**: 9:00 AM
- **Code Reviews**: Within 24 hours
- **Slack Channels**:
  - #bowlscore-dev (development)
  - #bowlscore-bugs (bug reports)
  - #bowlscore-deploys (deployment notifications)

### Code Review Guidelines

#### As a Reviewer
- Review within 24 hours
- Be constructive and kind
- Focus on code quality and correctness
- Check for security issues
- Verify tests pass

#### As an Author
- Provide context in PR description
- Keep PRs small and focused
- Respond to feedback promptly
- Update based on comments
- Request re-review when ready

## Tips and Tricks

### Faster Development

```bash
# Use TypeScript watch mode
npm run typecheck -- --watch

# Run linter on save in VS Code
"editor.codeActionsOnSave": {
  "source.fixAll.eslint": true
}
```

### Debugging Tips

```typescript
// Quick debug log
console.log('🔍 Debug:', { variable, state });

// React error boundary for better errors
<ErrorBoundary>
  <YourComponent />
</ErrorBoundary>
```

### Keyboard Shortcuts (VS Code)

- `Ctrl/Cmd + P` - Quick file open
- `Ctrl/Cmd + Shift + P` - Command palette
- `Ctrl/Cmd + B` - Toggle sidebar
- `Ctrl/Cmd + /` - Toggle comment
- `F12` - Go to definition
- `Shift + F12` - Find all references

---

## Next Steps

1. Set up your development environment
2. Read through the [Architecture documentation](./architecture.md)
3. Review the [Database Schema](./database-schema.md)
4. Pick a task from the backlog
5. Create a feature branch
6. Start coding!

---

Last Updated: November 2024
