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
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { userId, name, email, reason } = await req.json();

    if (!name || !email || !reason) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields' }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    const { data: discountRequest, error: insertError } = await supabaseClient
      .from('discount_requests')
      .insert({
        user_id: userId || null,
        email_entered: email,
        name: name,
        reason: reason,
        status: 'pending',
      })
      .select()
      .single();

    if (insertError) {
      console.error('Insert error:', insertError);
      return new Response(
        JSON.stringify({ error: 'Failed to create request' }),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    const approveUrl = `${Deno.env.get('SUPABASE_URL')}/functions/v1/discount-approve?token=${discountRequest.approval_token}&action=approve`;
    const declineUrl = `${Deno.env.get('SUPABASE_URL')}/functions/v1/discount-approve?token=${discountRequest.approval_token}&action=decline`;

    const emailHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #547A51; color: white; padding: 20px; text-align: center; }
          .content { background: #f9f9f9; padding: 20px; }
          .button { display: inline-block; padding: 12px 24px; margin: 10px 5px; text-decoration: none; border-radius: 5px; font-weight: bold; }
          .approve { background: #4CAF50; color: white; }
          .decline { background: #f44336; color: white; }
          .info { background: white; padding: 15px; margin: 15px 0; border-left: 4px solid #547A51; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Discount Request Approval</h1>
          </div>
          <div class="content">
            <p>A new discount request has been submitted:</p>

            <div class="info">
              <p><strong>Name:</strong> ${name}</p>
              <p><strong>Email:</strong> ${email}</p>
              <p><strong>Reason:</strong></p>
              <p>${reason}</p>
            </div>

            <p>Please review and take action:</p>

            <div style="text-align: center; margin: 30px 0;">
              <a href="${approveUrl}" class="button approve">Approve Request</a>
              <a href="${declineUrl}" class="button decline">Decline Request</a>
            </div>

            <p style="font-size: 12px; color: #666;">
              Approving will create a 100% discount Stripe coupon and send the code to the user.
            </p>
          </div>
        </div>
      </body>
      </html>
    `;

    const resendApiKey = Deno.env.get('RESEND_API_KEY');

    if (!resendApiKey) {
      console.error('RESEND_API_KEY not configured');
      return new Response(
        JSON.stringify({ error: 'Email service not configured' }),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    const resendResponse = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${resendApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'Lawn Bowls App <andrew@asleight.com>',
        to: ['asleighty@gmail.com'],
        subject: 'New Discount Request',
        html: emailHtml,
      }),
    });

    const resendData = await resendResponse.json();

    if (!resendResponse.ok) {
      console.error('Resend error:', resendData);
      return new Response(
        JSON.stringify({ error: 'Failed to send email', details: resendData }),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    console.log('Discount request created:', discountRequest.id);
    console.log('Email sent successfully via Resend:', resendData.id);

    return new Response(
      JSON.stringify({ success: true, message: 'Request submitted successfully' }),
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
