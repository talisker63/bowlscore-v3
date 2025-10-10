# Lawn Bowls Training & Scorecard - Setup Guide

## Overview

A modern, mobile-friendly web application for lawn bowls training drills and digital scorekeeping with premium subscription features.

## Tech Stack

- **Frontend**: React + TypeScript + Vite + Tailwind CSS
- **Backend**: Supabase (Database, Auth, Edge Functions, Storage)
- **Payments**: Stripe (with 30-day free trial)
- **Icons**: Lucide React

## Database Schema

The application uses the following tables:

- `profiles` - User profiles linked to Supabase Auth
- `drills` - Training drill content
- `scorecards` - Saved scorecard data
- `subscriptions` - User subscription status
- `discount_requests` - 100% discount approval workflow

All tables have Row Level Security (RLS) enabled.

## Edge Functions

The following Supabase Edge Functions are deployed:

1. **stripe-checkout** - Creates Stripe checkout sessions with 30-day trial
2. **stripe-webhook** - Handles Stripe webhook events for subscription updates
3. **discount-request** - Submits discount requests and sends approval emails
4. **discount-approve** - Approves/declines discount requests and creates Stripe coupons
5. **email-scorecard** - Sends scorecard via email

## Features Implemented

### Authentication
- Email/password signup and login
- Google OAuth integration
- Protected routes and premium content

### Scorecard
- 2-4 players support
- 1-4 ends configurable
- 0-8 shots per end
- Save to database (logged in users)
- Download as JPEG
- Email scorecard
- Local storage persistence
- Reset scores / Reset all

### Training Drills
- Multiple drills with instructions and objectives
- Free and premium drills
- Hero images and descriptions
- Premium access control

### Subscription & Payments
- Annual subscription at $49/year
- 30-day free trial via Stripe
- Stripe webhook integration for status updates
- Premium feature gates

### Discount Request System
- User-submitted discount requests
- Admin approval via email links
- Automatic 100% Stripe coupon creation
- Email notifications

## Setup Instructions

### 1. Environment Variables

The following environment variables are already configured in `.env`:

```
VITE_SUPABASE_URL=https://dczxdxaoxztetrfncflb.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGc...
```

### 2. Stripe Configuration

To enable payments, you need to add Stripe secrets to your Supabase project:

1. Get your Stripe keys from [Stripe Dashboard](https://dashboard.stripe.com/apikeys)
2. Add secrets to Supabase (via CLI or Dashboard):
   - `STRIPE_SECRET_KEY` - Your Stripe secret key
   - `STRIPE_WEBHOOK_SECRET` - Your webhook signing secret (optional for development)

### 3. Google OAuth Setup

To enable Google login:

1. Go to Supabase Dashboard > Authentication > Providers
2. Enable Google provider
3. Add your Google OAuth credentials

### 4. Stripe Webhook Configuration

For production:

1. Set up webhook endpoint in Stripe Dashboard
2. Point to: `https://dczxdxaoxztetrfncflb.supabase.co/functions/v1/stripe-webhook`
3. Subscribe to events:
   - `checkout.session.completed`
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`

### 5. Email Service (Optional)

The discount-request and email-scorecard functions currently log emails.
To enable actual email sending, integrate:

- Resend API
- SendGrid
- AWS SES
- Or any other email service

Update the edge functions to call your chosen email service.

## Running Locally

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Type check
npm run typecheck
```

## Deployed Edge Functions

All edge functions are deployed and accessible at:

- `https://dczxdxaoxztetrfncflb.supabase.co/functions/v1/stripe-checkout`
- `https://dczxdxaoxztetrfncflb.supabase.co/functions/v1/stripe-webhook`
- `https://dczxdxaoxztetrfncflb.supabase.co/functions/v1/discount-request`
- `https://dczxdxaoxztetrfncflb.supabase.co/functions/v1/discount-approve`
- `https://dczxdxaoxztetrfncflb.supabase.co/functions/v1/email-scorecard`

## Design System

### Colors
- Background: `#F3F7F2` (light green)
- Panels: `#C7D9C2` (muted green)
- Accents: `#547A51` (sage green)
- Headings: `#34533A` (dark green)

### Typography
- Font: System fonts (Arial, sans-serif)
- Clean, readable, professional

### Components
- Rounded cards with subtle shadows
- Hover states and smooth transitions
- Mobile-first responsive design

## Key User Flows

### Free User
1. Visit site
2. View free drills
3. Use scorecard (not saved)
4. Can download/email without login (with prompt)

### Logged-In User (Free)
1. Sign up / Login
2. Access free drills
3. Save scorecards
4. View saved history
5. Premium drills locked

### Premium User
1. Start free trial (30 days)
2. Access all premium drills
3. All features unlocked
4. After trial, charged $49/year

### Discount Request Flow
1. User submits request with reason
2. Email sent to asleighty@gmail.com with Approve/Decline links
3. Admin clicks Approve
4. 100% Stripe coupon created automatically
5. User receives promotion code via email (when integrated)

## Production Checklist

- [ ] Add Stripe secret keys to Supabase
- [ ] Configure Google OAuth credentials
- [ ] Set up Stripe webhook endpoint
- [ ] Test subscription flow end-to-end
- [ ] Integrate email service (Resend/SendGrid)
- [ ] Test discount approval workflow
- [ ] Add analytics (optional)
- [ ] Set up domain and SSL
- [ ] Configure CORS for production domain

## Notes

- All RLS policies are restrictive by default
- Subscription status is automatically updated via webhooks
- Scorecards persist in localStorage before save
- Images are from Pexels (stock photos)
- No PayPal integration yet (placeholder button exists)

## Support

For questions or issues, contact: asleighty@gmail.com

---

© Copyright Andrew Sleight 2025
