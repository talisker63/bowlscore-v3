import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const signature = req.headers.get('stripe-signature');
    const body = await req.text();

    const stripeWebhookSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET');

    if (!signature) {
      console.log('No signature provided, processing event anyway (development mode)');
    }

    const event = JSON.parse(body);

    console.log('Received Stripe webhook event:', event.type);

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object;
        const userId = session.client_reference_id;
        const customerId = session.customer;
        const subscriptionId = session.subscription;
        const customerEmail = session.customer_email || session.customer_details?.email;

        if (userId && customerId) {
          // Create or update stripe_customers
          const { data: existingCustomer } = await supabaseClient
            .from('stripe_customers')
            .select('id')
            .eq('user_id', userId)
            .maybeSingle();

          if (existingCustomer) {
            await supabaseClient
              .from('stripe_customers')
              .update({
                customer_id: customerId,
                updated_at: new Date().toISOString(),
              })
              .eq('user_id', userId);
          } else {
            await supabaseClient
              .from('stripe_customers')
              .insert({
                user_id: userId,
                customer_id: customerId,
              });
          }

          // Create or update subscriptions
          const { data: existing } = await supabaseClient
            .from('subscriptions')
            .select('id')
            .eq('user_id', userId)
            .maybeSingle();

          if (existing) {
            await supabaseClient
              .from('subscriptions')
              .update({
                provider: 'stripe',
                provider_customer_id: customerId,
                provider_sub_id: subscriptionId,
                status: 'active',
                trial_used: true,
                email_at_signup: customerEmail,
              })
              .eq('user_id', userId);
          } else {
            await supabaseClient
              .from('subscriptions')
              .insert({
                user_id: userId,
                provider: 'stripe',
                provider_customer_id: customerId,
                provider_sub_id: subscriptionId,
                status: 'active',
                trial_used: true,
                email_at_signup: customerEmail,
              });
          }

          console.log('Subscription created/updated for user:', userId);
        }
        break;
      }

      case 'customer.subscription.updated':
      case 'customer.subscription.created': {
        const subscription = event.data.object;
        const customerId = subscription.customer;
        const priceId = subscription.items.data[0]?.price?.id;
        const metadata = subscription.items.data[0]?.price?.metadata;

        // Determine the priceId based on interval
        const interval = subscription.items.data[0]?.price?.recurring?.interval;
        const simplePriceId = interval === 'month' ? 'monthly' : 'annual';

        const { data: subRecord } = await supabaseClient
          .from('subscriptions')
          .select('user_id')
          .eq('provider_customer_id', customerId)
          .maybeSingle();

        if (subRecord) {
          await supabaseClient
            .from('subscriptions')
            .update({
              status: subscription.status,
              current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
            })
            .eq('user_id', subRecord.user_id);

          // Create or update stripe_subscriptions
          const { data: existingStripeSubscription } = await supabaseClient
            .from('stripe_subscriptions')
            .select('id')
            .eq('customer_id', customerId)
            .maybeSingle();

          if (existingStripeSubscription) {
            await supabaseClient
              .from('stripe_subscriptions')
              .update({
                subscription_id: subscription.id,
                price_id: simplePriceId,
                current_period_start: subscription.current_period_start,
                current_period_end: subscription.current_period_end,
                cancel_at_period_end: subscription.cancel_at_period_end,
                status: subscription.status,
                updated_at: new Date().toISOString(),
              })
              .eq('customer_id', customerId);
          } else {
            await supabaseClient
              .from('stripe_subscriptions')
              .insert({
                customer_id: customerId,
                subscription_id: subscription.id,
                price_id: simplePriceId,
                current_period_start: subscription.current_period_start,
                current_period_end: subscription.current_period_end,
                cancel_at_period_end: subscription.cancel_at_period_end,
                status: subscription.status,
              });
          }

          console.log('Subscription status updated:', subscription.status, 'cancel_at_period_end:', subscription.cancel_at_period_end);
        }
        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object;
        const customerId = subscription.customer;

        const { data: subRecord } = await supabaseClient
          .from('subscriptions')
          .select('user_id')
          .eq('provider_customer_id', customerId)
          .maybeSingle();

        if (subRecord) {
          await supabaseClient
            .from('subscriptions')
            .update({
              status: 'canceled',
            })
            .eq('user_id', subRecord.user_id);

          console.log('Subscription canceled');
        }
        break;
      }

      default:
        console.log('Unhandled event type:', event.type);
    }

    return new Response(
      JSON.stringify({ received: true }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Webhook error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});