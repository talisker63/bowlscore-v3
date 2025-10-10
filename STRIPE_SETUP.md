# Stripe Integration Setup

## Quick Start

Your Lawn Bowls app needs Stripe credentials to enable premium subscriptions with a 30-day free trial.

## Step 1: Get Your Stripe API Keys

1. Go to [Stripe Dashboard](https://dashboard.stripe.com/register) and create an account
2. Navigate to [Developers > API Keys](https://dashboard.stripe.com/apikeys)
3. Copy your **Secret key** (starts with `sk_test_` or `sk_live_`)

## Step 2: Add Stripe Secret to Supabase

You need to add the Stripe secret key to your Supabase Edge Functions environment.

### Option A: Via Supabase CLI (Recommended)

```bash
# Install Supabase CLI if you haven't
npm install -g supabase

# Login to Supabase
supabase login

# Link your project
supabase link --project-ref dczxdxaoxztetrfncflb

# Set the Stripe secret
supabase secrets set STRIPE_SECRET_KEY=sk_test_your_key_here
```

### Option B: Via Supabase Dashboard

1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project: `dczxdxaoxztetrfncflb`
3. Navigate to **Edge Functions**
4. Click on any function, then go to **Secrets**
5. Add secret:
   - Name: `STRIPE_SECRET_KEY`
   - Value: Your Stripe secret key (e.g., `sk_test_...`)
6. Save

## Step 3: Test the Integration

1. Run your app: `npm run dev`
2. Navigate to `/pricing`
3. Click "Start Free Trial with Stripe"
4. Complete the checkout (use test card `4242 4242 4242 4242`)
5. Verify subscription appears in Stripe Dashboard

## Step 4: Set Up Webhooks (Production)

For production, configure Stripe webhooks to keep subscriptions in sync:

1. Go to [Stripe Webhooks](https://dashboard.stripe.com/webhooks)
2. Click **Add endpoint**
3. Endpoint URL: `https://dczxdxaoxztetrfncflb.supabase.co/functions/v1/stripe-webhook`
4. Description: `Lawn Bowls Subscription Webhooks`
5. Select events to send:
   - `checkout.session.completed`
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
6. Click **Add endpoint**
7. Copy the **Signing secret** (starts with `whsec_`)
8. Add to Supabase secrets:
   ```bash
   supabase secrets set STRIPE_WEBHOOK_SECRET=whsec_your_secret_here
   ```

## Test Cards

Use these test cards in Stripe test mode:

- **Success**: `4242 4242 4242 4242`
- **Decline**: `4000 0000 0000 0002`
- **Requires Auth**: `4000 0025 0000 3155`

Use any future expiry date, any 3-digit CVC, and any postal code.

## Subscription Details

- **Price**: $49/year
- **Trial**: 30 days free
- **Renewal**: Automatic annual renewal
- **Currency**: USD

## Troubleshooting

### "Payment system not configured" error
- Ensure `STRIPE_SECRET_KEY` is set in Supabase secrets
- Restart edge functions after adding secrets

### Subscription not updating after payment
- Check Stripe webhook is configured
- Verify webhook events are being sent
- Check Supabase Edge Function logs

### Can't create checkout session
- Verify Stripe API key is valid (not expired)
- Check Supabase function logs for errors
- Ensure you're using the secret key, not publishable key

## Going Live

When ready for production:

1. Switch to **Live mode** in Stripe Dashboard
2. Get your **live secret key** (starts with `sk_live_`)
3. Update Supabase secret with live key
4. Set up webhook with live endpoint
5. Test with real card in incognito window

## Support

For Stripe-specific questions: [Stripe Support](https://support.stripe.com/)
For app-specific issues: asleighty@gmail.com
