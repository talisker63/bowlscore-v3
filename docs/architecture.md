# BowlScore Architecture

## Overview

BowlScore is built as a modern single-page application (SPA) using React with TypeScript, backed by Supabase for backend services. The architecture prioritizes developer experience, maintainability, and user experience.

## Technology Stack

### Frontend
- **Framework**: React 18.3.1
- **Language**: TypeScript 5.5.3
- **Build Tool**: Vite 5.4.2
- **Styling**: Tailwind CSS 3.4.1
- **Routing**: React Router DOM 7.9.3
- **Icons**: Lucide React 0.344.0
- **Image Generation**: html2canvas 1.4.1

### Backend & Services
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **Storage**: Supabase Storage
- **Edge Functions**: Supabase Functions (Deno runtime)
- **Payments**: Stripe
- **Email**: Custom edge function integration

### Development Tools
- **Linting**: ESLint 9.9.1
- **Type Checking**: TypeScript compiler
- **Package Manager**: npm

## Architecture Patterns

### Component Architecture

The application follows a modular component architecture with clear separation of concerns:

```
src/
├── components/          # Reusable UI components
│   ├── AuthModal.tsx
│   ├── DiscountRequestModal.tsx
│   ├── FeedbackModal.tsx
│   ├── Footer.tsx
│   ├── FortyBowlsDrawDrill.tsx
│   ├── GameSetup.tsx
│   ├── Header.tsx
│   ├── Hero.tsx
│   ├── LeadVsLeadDrill.tsx
│   ├── Navbar.tsx
│   ├── PricingCard.tsx
│   ├── Scorecard.tsx
│   ├── SecondsChanceDrill.tsx
│   ├── SimplifiedGameSetup.tsx
│   ├── SimplifiedScorecard.tsx
│   └── SubscriptionStatus.tsx
├── contexts/            # React Context providers
│   └── AuthContext.tsx
├── hooks/               # Custom React hooks
│   ├── useStripe.ts
│   └── useSubscription.ts
├── lib/                 # Utility libraries
│   ├── jpegGenerator.ts
│   └── supabase.ts
├── pages/               # Page components (routes)
│   ├── DashboardPage.tsx
│   ├── DrillPage.tsx
│   ├── HomePage.tsx
│   ├── PricingPage.tsx
│   ├── ResetPasswordPage.tsx
│   ├── ScorecardPage.tsx
│   ├── SimpleScorecardPage.tsx
│   └── SuccessPage.tsx
├── App.tsx              # Main application component
├── main.tsx             # Application entry point
└── index.css            # Global styles
```

### State Management

#### Local State
Components use React hooks for local state management:
- `useState` for component-specific state
- `useEffect` for side effects and lifecycle management
- `useRef` for DOM references and mutable values

#### Global State (Context API)
```typescript
// AuthContext provides:
- user: User | null
- profile: Profile | null
- subscription: Subscription | null
- isPremium: boolean
- isLoading: boolean
- signUp, signIn, signOut, resetPassword
```

The `AuthContext` is the single source of truth for:
- User authentication state
- User profile data
- Subscription status
- Premium feature access

#### Data Persistence Strategy
1. **Database (Supabase)**: All critical user data, sessions, and scorecards
2. **Local Storage**: UI preferences and temporary draft data
3. **Session Storage**: Not currently used

### Key Architectural Decisions

#### 1. Premium Feature Gating

**Decision**: Use subscription status from database, not profile flags

**Implementation**:
```typescript
// ✅ Correct approach
const { isPremium } = useAuth();
if (!isPremium) {
  alert('This is a premium feature');
  return;
}

// ❌ Incorrect approach (legacy)
if (!profile?.is_premium) { // Field doesn't exist in DB
  alert('This is a premium feature');
  return;
}
```

**Reasoning**:
- Subscription status is the single source of truth
- Supports trial periods and multiple subscription states
- Centralized in AuthContext for consistency
- Easier to maintain and debug

#### 2. Image Generation

**Decision**: Client-side image generation using html2canvas

**Reasoning**:
- Reduces server load
- Faster user experience (no round trip)
- Works offline
- Privacy-friendly (data never leaves browser unless explicitly sent)

**Implementation**:
```typescript
const generateImage = async () => {
  const canvas = await html2canvas(elementRef.current, {
    scale: 2,
    backgroundColor: '#ffffff',
    logging: false,
  });
  return canvas.toDataURL('image/jpeg', 0.95);
};
```

#### 3. Data Normalization

**Decision**: Store complete session state in JSONB fields

**Reasoning**:
- Flexible schema for different drill types
- Allows evolution without migrations
- Efficient for read-heavy workloads
- Simplified queries

**Trade-offs**:
- Harder to query specific nested data
- Larger storage footprint
- Cannot use database constraints on nested data

#### 4. Authentication Flow

**Decision**: Supabase Auth with email/password only

**Reasoning**:
- Simple and secure
- No OAuth complexity
- Full control over user experience
- Easy to implement password reset
- Can add OAuth later if needed

#### 5. Edge Functions for Sensitive Operations

**Decision**: Use Supabase Edge Functions for server-side operations

**Use cases**:
- Stripe webhook handling
- Stripe checkout session creation
- Email sending
- Subscription cancellation
- Discount approval

**Reasoning**:
- Keeps API keys secure
- Prevents client-side tampering
- Enables server-side validation
- Supports async operations (webhooks)

#### 6. Component Organization

**Decision**: Colocate drill components, separate page components

**Structure**:
```
components/       # Reusable and drill components
  - Drills go here (self-contained)
  - Shared UI components
pages/            # Route-level components
  - Page wrappers
  - Route-specific logic
```

**Reasoning**:
- Drills are feature-complete units
- Pages are thin wrappers
- Easier to navigate codebase
- Clear separation of routing vs features

## Data Flow

### Authentication Flow
```
1. User enters credentials
   ↓
2. AuthContext.signIn() called
   ↓
3. Supabase Auth validates
   ↓
4. Profile loaded from database
   ↓
5. Subscription status checked
   ↓
6. isPremium computed
   ↓
7. UI updates based on auth state
```

### Drill Session Flow
```
1. User completes drill
   ↓
2. Session data compiled
   ↓
3. Image generated (html2canvas)
   ↓
4. Optional: Save to database
   ↓
5. Optional: Upload image to storage
   ↓
6. Optional: Email via edge function
   ↓
7. Results remain on screen
```

### Subscription Flow
```
1. User clicks upgrade
   ↓
2. stripe-checkout edge function called
   ↓
3. Checkout session created
   ↓
4. User redirected to Stripe
   ↓
5. User completes payment
   ↓
6. Stripe webhook fired
   ↓
7. stripe-webhook edge function processes
   ↓
8. Subscription record created/updated
   ↓
9. User redirected to success page
   ↓
10. AuthContext refreshes subscription state
```

## Security Architecture

### Row Level Security (RLS)

All database tables use RLS policies:

```sql
-- Example: profiles table
CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);
```

### API Key Management

- **Client-side**: Only `VITE_SUPABASE_ANON_KEY` exposed
- **Server-side**: `SUPABASE_SERVICE_ROLE_KEY` kept in edge functions
- **Stripe**: Keys stored in environment, never in client code

### Authentication Tokens

- JWT tokens managed by Supabase
- Automatic refresh handling
- Secure HTTP-only cookies (Supabase managed)
- No manual token management required

## Performance Considerations

### Code Splitting

Currently using single bundle. Future improvements:
- Route-based code splitting
- Lazy loading for drill components
- Dynamic imports for heavy libraries

### Image Optimization

- JPEG quality set to 0.95 (balance size vs quality)
- Scale factor of 2x for high-DPI displays
- Async generation prevents UI blocking

### Database Queries

- Use `.maybeSingle()` for single-record queries
- Index on user_id for all user-scoped tables
- JSONB indexing on frequently queried fields

### Caching Strategy

Current:
- Browser caching for static assets
- No application-level caching

Future:
- React Query for server state
- Service Worker for offline support
- Edge caching for public data

## Error Handling

### Pattern
```typescript
try {
  // Operation
  const result = await someOperation();
  alert('Success!');
} catch (error) {
  console.error('Error context:', error);
  alert('User-friendly error message');
}
```

### Error Boundaries
- Currently minimal error boundaries
- Future: Component-level error boundaries
- Future: Error reporting service integration

## Testing Strategy

### Current State
- No automated tests
- Manual testing for features

### Planned
- Unit tests for utility functions
- Component tests for UI components
- E2E tests for critical flows
- Integration tests for edge functions

## Scalability Considerations

### Current Bottlenecks
1. Single bundle size (667KB)
2. No CDN for assets
3. No caching strategy
4. Client-side image generation

### Future Scaling Plans
1. Implement CDN
2. Add Redis caching layer
3. Move image generation to server
4. Implement queue system for heavy operations
5. Database read replicas if needed

## Deployment Architecture

```
┌─────────────────┐
│   Vite Build    │
│   (Static SPA)  │
└────────┬────────┘
         │
         ↓
┌─────────────────┐
│   Hosting       │
│   (Vercel/      │
│    Netlify)     │
└────────┬────────┘
         │
         ↓
┌─────────────────────────────────┐
│      Supabase Platform          │
│  ┌──────────┐  ┌──────────┐   │
│  │   Auth   │  │    DB    │   │
│  └──────────┘  └──────────┘   │
│  ┌──────────┐  ┌──────────┐   │
│  │ Storage  │  │   Edge   │   │
│  │          │  │ Functions│   │
│  └──────────┘  └──────────┘   │
└─────────────────────────────────┘
         │
         ↓
┌─────────────────┐
│     Stripe      │
│   (Payments)    │
└─────────────────┘
```

## Development Workflow

1. **Local Development**: `npm run dev`
2. **Type Checking**: `npm run typecheck`
3. **Linting**: `npm run lint`
4. **Build**: `npm run build`
5. **Deploy**: Automatic via git push

## Future Architectural Considerations

1. **Microservices**: Consider splitting heavy operations
2. **Real-time Features**: Leverage Supabase Realtime
3. **Mobile Apps**: React Native with shared logic
4. **GraphQL**: Consider migration from REST
5. **Internationalization**: i18n infrastructure
6. **Analytics**: User behavior tracking
7. **A/B Testing**: Feature flag system
