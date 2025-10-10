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
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'No authorization header' }),
        {
          status: 401,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    const token = authHeader.replace('Bearer ', '');
    const userResponse = await fetch(`${supabaseUrl}/auth/v1/user`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'apikey': supabaseKey || '',
      },
    });

    if (!userResponse.ok) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        {
          status: 401,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    const user = await userResponse.json();
    const { priceId, mode, successUrl, cancelUrl, promoCode } = await req.json();

    if (!priceId || !mode) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields' }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    const stripeKey = Deno.env.get('STRIPE_SECRET_KEY');
    if (!stripeKey) {
      console.error('Stripe secret key not configured');
      return new Response(
        JSON.stringify({ error: 'Payment system not configured' }),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // Check if user has already used a trial with this email address
    const supabaseClient = createClient(
      supabaseUrl ?? '',
      supabaseKey ?? ''
    );

    // Check for existing or past subscriptions with this email
    const { data: existingTrials } = await supabaseClient
      .from('subscriptions')
      .select('trial_used, email_at_signup')
      .eq('email_at_signup', user.email)
      .eq('trial_used', true);

    const hasUsedTrial = existingTrials && existingTrials.length > 0;

    // Map to actual Stripe price IDs
    let stripePriceId: string;
    if (priceId === 'monthly' || priceId === 'price_1SGB85DconJ5fBaN1jh1Js16') {
      stripePriceId = 'price_1SGB85DconJ5fBaN1jh1Js16';
    } else if (priceId === 'annual' || priceId === 'price_1SGB8fDconJ5fBaNmUVyvk3E') {
      stripePriceId = 'price_1SGB8fDconJ5fBaNmUVyvk3E';
    } else {
      // Fallback to the provided priceId if it looks like a Stripe price ID
      stripePriceId = priceId;
    }

    const sessionParams: Record<string, string> = {
      'mode': mode,
      'customer_email': user.email,
      'client_reference_id': user.id,
      'line_items[0][price]': stripePriceId,
      'line_items[0][quantity]': '1',
      'subscription_data[metadata][user_id]': user.id,
      'subscription_data[metadata][email]': user.email,
      'subscription_data[metadata][has_used_trial]': hasUsedTrial.toString(),
      'success_url': successUrl || `${Deno.env.get('SUPABASE_URL')}/success?session_id={CHECKOUT_SESSION_ID}`,
      'cancel_url': cancelUrl || `${Deno.env.get('SUPABASE_URL')}/pricing?canceled=true`,
    };

    // Only add trial if they haven't used one before
    if (!hasUsedTrial) {
      sessionParams['subscription_data[trial_period_days]'] = '7';
    }

    if (promoCode) {
      const promoCodeResponse = await fetch(
        `https://api.stripe.com/v1/promotion_codes?code=${encodeURIComponent(promoCode)}&active=true`,
        {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${stripeKey}`,
          },
        }
      );

      const promoCodeData = await promoCodeResponse.json();

      if (!promoCodeResponse.ok || !promoCodeData.data || promoCodeData.data.length === 0) {
        return new Response(
          JSON.stringify({ error: 'Invalid or expired promotion code' }),
          {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          }
        );
      }

      sessionParams['discounts[0][promotion_code]'] = promoCodeData.data[0].id;
    }

    const checkoutSession = await fetch('https://api.stripe.com/v1/checkout/sessions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${stripeKey}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams(sessionParams),
    });

    const session = await checkoutSession.json();

    if (!checkoutSession.ok) {
      console.error('Stripe error:', session);
      return new Response(
        JSON.stringify({ error: 'Failed to create checkout session' }),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    return new Response(
      JSON.stringify({ url: session.url }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});