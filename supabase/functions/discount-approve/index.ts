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
    const url = new URL(req.url);
    const token = url.searchParams.get('token');
    const action = url.searchParams.get('action');

    if (!token || !action) {
      return new Response(
        '<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><title>Invalid Request</title></head><body><h1>Invalid request</h1><p>Missing token or action</p></body></html>',
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'text/html; charset=utf-8' },
        }
      );
    }

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { data: discountRequest, error: fetchError } = await supabaseClient
      .from('discount_requests')
      .select('*')
      .eq('approval_token', token)
      .maybeSingle();

    if (fetchError || !discountRequest) {
      return new Response(
        '<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><title>Not Found</title></head><body><h1>Request not found</h1><p>Invalid or expired token</p></body></html>',
        {
          status: 404,
          headers: { ...corsHeaders, 'Content-Type': 'text/html; charset=utf-8' },
        }
      );
    }

    if (discountRequest.status !== 'pending') {
      return new Response(
        `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><title>Already Processed</title></head><body><h1>Already processed</h1><p>This request has already been ${discountRequest.status}</p></body></html>`,
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'text/html; charset=utf-8' },
        }
      );
    }

    if (action === 'decline') {
      await supabaseClient
        .from('discount_requests')
        .update({ status: 'declined' })
        .eq('id', discountRequest.id);

      return new Response(
        '<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><title>Request Declined</title></head><body><h1>Request Declined</h1><p>The discount request has been declined.</p></body></html>',
        {
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'text/html; charset=utf-8' },
        }
      );
    }

    if (action === 'approve') {
      const stripeKey = Deno.env.get('STRIPE_SECRET_KEY');
      if (!stripeKey) {
        return new Response(
          '<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><title>Configuration Error</title></head><body><h1>Configuration Error</h1><p>Stripe not configured</p></body></html>',
          {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'text/html; charset=utf-8' },
          }
        );
      }

      const couponResponse = await fetch('https://api.stripe.com/v1/coupons', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${stripeKey}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          'percent_off': '100',
          'duration': 'forever',
          'name': `Discount for ${discountRequest.name}`,
        }),
      });

      const coupon = await couponResponse.json();

      if (!couponResponse.ok) {
        console.error('Stripe coupon error:', coupon);
        return new Response(
          '<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><title>Error</title></head><body><h1>Error</h1><p>Failed to create Stripe coupon</p></body></html>',
          {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'text/html; charset=utf-8' },
          }
        );
      }

      const promoCodeResponse = await fetch('https://api.stripe.com/v1/promotion_codes', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${stripeKey}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          'coupon': coupon.id,
          'code': `APPROVED-${discountRequest.id.substring(0, 8).toUpperCase()}`,
        }),
      });

      const promoCode = await promoCodeResponse.json();

      if (!promoCodeResponse.ok) {
        console.error('Stripe promo code error:', promoCode);
        return new Response(
          '<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><title>Error</title></head><body><h1>Error</h1><p>Failed to create promotion code</p></body></html>',
          {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'text/html; charset=utf-8' },
          }
        );
      }

      await supabaseClient
        .from('discount_requests')
        .update({
          status: 'approved',
          stripe_coupon_id: coupon.id,
          stripe_promo_code: promoCode.code,
          approved_at: new Date().toISOString(),
        })
        .eq('id', discountRequest.id);

      const resendApiKey = Deno.env.get('RESEND_API_KEY');

      if (resendApiKey) {
        const userEmailHtml = `
          <!DOCTYPE html>
          <html>
          <head>
            <style>
              body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; }
              .header { background: #547A51; color: white; padding: 20px; text-align: center; }
              .content { background: #f9f9f9; padding: 20px; }
              .promo-code { background: white; padding: 20px; margin: 20px 0; border: 2px dashed #547A51; border-radius: 8px; text-align: center; }
              .code { font-size: 24px; font-weight: bold; color: #547A51; letter-spacing: 2px; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>Your Discount Has Been Approved!</h1>
              </div>
              <div class="content">
                <p>Hi ${discountRequest.name},</p>
                <p>Great news! Your discount request has been approved.</p>

                <div class="promo-code">
                  <p style="margin: 0 0 10px 0; font-size: 14px; color: #666;">Your Promotion Code:</p>
                  <div class="code">${promoCode.code}</div>
                </div>

                <p>To use this code:</p>
                <ol>
                  <li>Go to the pricing page</li>
                  <li>Click on "Upgrade to Premium"</li>
                  <li>Enter your promotion code at checkout</li>
                  <li>Enjoy 100% off your subscription!</li>
                </ol>

                <p>If you have any questions, feel free to reply to this email.</p>

                <p>Best regards,<br>The Lawn Bowls Team</p>
              </div>
            </div>
          </body>
          </html>
        `;

        try {
          const resendResponse = await fetch('https://api.resend.com/emails', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${resendApiKey}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              from: 'Lawn Bowls App <andrew@asleight.com>',
              to: [discountRequest.email_entered],
              subject: 'Your Discount Request Has Been Approved!',
              html: userEmailHtml,
            }),
          });

          const resendData = await resendResponse.json();

          if (resendResponse.ok) {
            console.log('Approval email sent successfully:', resendData.id);
          } else {
            console.error('Failed to send approval email:', resendData);
          }
        } catch (emailError) {
          console.error('Error sending approval email:', emailError);
        }
      }

      console.log('Discount approved. Promo code:', promoCode.code);
      console.log('Email sent to:', discountRequest.email_entered);

      return new Response(
        `<!DOCTYPE html>
        <html lang="en">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Request Approved</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 40px; max-width: 600px; margin: 0 auto; background: #f3f7f2; }
            .card { background: white; padding: 40px; border-radius: 12px; box-shadow: 0 2px 8px rgba(0,0,0,0.1); }
            h1 { color: #547A51; margin-top: 0; }
            .success { background: #d4edda; border: 1px solid #c3e6cb; color: #155724; padding: 15px; border-radius: 8px; margin: 20px 0; }
            .info { background: #f3f7f2; padding: 20px; border-radius: 8px; margin: 20px 0; }
            code { background: white; padding: 5px 10px; border-radius: 4px; font-family: monospace; font-size: 16px; }
          </style>
        </head>
        <body>
          <div class="card">
            <h1>✓ Request Approved</h1>
            <div class="success">
              <strong>Success!</strong> The discount has been approved and the user has been notified.
            </div>
            <div class="info">
              <p><strong>Promotion Code:</strong> <code>${promoCode.code}</code></p>
              <p><strong>User Email:</strong> ${discountRequest.email_entered}</p>
              <p><strong>User Name:</strong> ${discountRequest.name}</p>
            </div>
            <p style="color: #666; font-size: 14px;">An email has been sent to the user with their promotion code and instructions.</p>
          </div>
        </body>
        </html>`,
        {
          status: 200,
          headers: {
            ...corsHeaders,
            'Content-Type': 'text/html; charset=utf-8',
          },
        }
      );
    }

    return new Response(
      '<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><title>Invalid Action</title></head><body><h1>Invalid action</h1></body></html>',
      {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'text/html; charset=utf-8' },
      }
    );
  } catch (error) {
    console.error('Error:', error);
    return new Response(
      `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><title>Error</title></head><body><h1>Error</h1><p>${error.message}</p></body></html>`,
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'text/html; charset=utf-8' },
      }
    );
  }
});