import "jsr:@supabase/functions-js/edge-runtime.d.ts";

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
    const { to, playerAName, playerBName, sessionDate, weather, greenSpeed, stats, ends, imageData } = await req.json();

    if (!to) {
      return new Response(
        JSON.stringify({ error: 'Email address is required' }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    const endsTableRows = ends.map((end: any, idx: number) => `
      <tr>
        <td style="border: 1px solid #ddd; padding: 8px; text-align: center;">${idx + 1}</td>
        <td style="border: 1px solid #ddd; padding: 8px; text-align: center;">${end.playerAPoints}</td>
        <td style="border: 1px solid #ddd; padding: 8px; text-align: center;">${end.playerBPoints}</td>
        <td style="border: 1px solid #ddd; padding: 8px; text-align: center; font-weight: bold;">${end.playerACumulative}</td>
        <td style="border: 1px solid #ddd; padding: 8px; text-align: center; font-weight: bold;">${end.playerBCumulative}</td>
        <td style="border: 1px solid #ddd; padding: 8px; text-align: center;">${end.crossed}</td>
        <td style="border: 1px solid #ddd; padding: 8px; text-align: center;">${end.short}</td>
      </tr>
    `).join('');

    const emailHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Lead vs Lead Game Report</title>
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 800px; margin: 0 auto; padding: 20px;">
          <div style="background-color: #547A51; color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
            <h1 style="margin: 0; font-size: 32px;">Lead vs Lead Game Report</h1>
            <p style="margin: 10px 0 0 0; font-size: 18px;">Bowlscore</p>
          </div>

          <div style="background-color: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px;">
            <div style="background-color: white; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
              <h2 style="color: #34533A; margin-top: 0;">Game Summary</h2>
              <table style="width: 100%; border-collapse: collapse;">
                <tr>
                  <td style="padding: 8px 0;"><strong>Date:</strong></td>
                  <td style="padding: 8px 0;">${sessionDate}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0;"><strong>Weather:</strong></td>
                  <td style="padding: 8px 0;">${weather || 'N/A'}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0;"><strong>Surface Type:</strong></td>
                  <td style="padding: 8px 0;">${greenSpeed || 'N/A'}</td>
                </tr>
              </table>
            </div>

            <div style="background-color: #C7D9C2; padding: 20px; border-radius: 8px; margin-bottom: 20px; text-align: center;">
              <h2 style="color: #34533A; margin-top: 0;">Final Score</h2>
              <div style="font-size: 24px; font-weight: bold; color: #34533A;">
                ${playerAName}: ${stats.playerAFinalScore} | ${playerBName}: ${stats.playerBFinalScore}
              </div>
              <div style="font-size: 20px; color: #547A51; margin-top: 10px;">
                Winner: ${stats.winner}
              </div>
            </div>

            <div style="background-color: white; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
              <h2 style="color: #34533A; margin-top: 0;">End by End Scorecard</h2>
              <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
                <thead>
                  <tr style="background-color: #C7D9C2;">
                    <th style="border: 1px solid #ddd; padding: 8px;">End</th>
                    <th style="border: 1px solid #ddd; padding: 8px;">${playerAName} Pts</th>
                    <th style="border: 1px solid #ddd; padding: 8px;">${playerBName} Pts</th>
                    <th style="border: 1px solid #ddd; padding: 8px;">Cum ${playerAName}</th>
                    <th style="border: 1px solid #ddd; padding: 8px;">Cum ${playerBName}</th>
                    <th style="border: 1px solid #ddd; padding: 8px;">Crossed</th>
                    <th style="border: 1px solid #ddd; padding: 8px;">Short</th>
                  </tr>
                </thead>
                <tbody>
                  ${endsTableRows}
                </tbody>
              </table>
            </div>

            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 20px;">
              <div style="background-color: white; padding: 20px; border-radius: 8px;">
                <h3 style="color: #34533A; margin-top: 0;">${playerAName} Statistics</h3>
                <table style="width: 100%; font-size: 14px;">
                  <tr>
                    <td style="padding: 4px 0;">Total Held Shots:</td>
                    <td style="padding: 4px 0; text-align: right; font-weight: bold;">${stats.playerATotalHeld}</td>
                  </tr>
                  <tr>
                    <td style="padding: 4px 0;">Total Penalties:</td>
                    <td style="padding: 4px 0; text-align: right; font-weight: bold;">${stats.playerATotalPenalties}</td>
                  </tr>
                  <tr>
                    <td style="padding: 4px 0;">Average Per End:</td>
                    <td style="padding: 4px 0; text-align: right; font-weight: bold;">${stats.playerAAverage.toFixed(2)}</td>
                  </tr>
                  <tr>
                    <td style="padding: 4px 0;">Std Deviation:</td>
                    <td style="padding: 4px 0; text-align: right; font-weight: bold;">${stats.playerAStdDev.toFixed(2)}</td>
                  </tr>
                </table>
              </div>

              <div style="background-color: white; padding: 20px; border-radius: 8px;">
                <h3 style="color: #34533A; margin-top: 0;">${playerBName} Statistics</h3>
                <table style="width: 100%; font-size: 14px;">
                  <tr>
                    <td style="padding: 4px 0;">Total Held Shots:</td>
                    <td style="padding: 4px 0; text-align: right; font-weight: bold;">${stats.playerBTotalHeld}</td>
                  </tr>
                  <tr>
                    <td style="padding: 4px 0;">Total Penalties:</td>
                    <td style="padding: 4px 0; text-align: right; font-weight: bold;">${stats.playerBTotalPenalties}</td>
                  </tr>
                  <tr>
                    <td style="padding: 4px 0;">Average Per End:</td>
                    <td style="padding: 4px 0; text-align: right; font-weight: bold;">${stats.playerBAverage.toFixed(2)}</td>
                  </tr>
                  <tr>
                    <td style="padding: 4px 0;">Std Deviation:</td>
                    <td style="padding: 4px 0; text-align: right; font-weight: bold;">${stats.playerBStdDev.toFixed(2)}</td>
                  </tr>
                </table>
              </div>
            </div>

            ${imageData ? `
              <div style="background-color: white; padding: 20px; border-radius: 8px; text-align: center;">
                <h3 style="color: #34533A; margin-top: 0;">Scorecard Image</h3>
                <img src="${imageData}" alt="Scorecard" style="max-width: 100%; height: auto; border: 1px solid #ddd; border-radius: 4px;">
              </div>
            ` : ''}

            <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd;">
              <p style="color: #666; font-size: 14px; margin: 0;">
                Generated by <strong>Bowlscore</strong> - Your Premium Lawn Bowls Training Platform
              </p>
              <p style="color: #666; font-size: 12px; margin: 10px 0 0 0;">
                <a href="https://bowlscore.com.au" style="color: #547A51; text-decoration: none;">bowlscore.com.au</a>
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

    const emailResponse = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${resendApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'Bowlscore <noreply@bowlscore.com.au>',
        to: [to],
        subject: `Lead vs Lead Game Report - ${sessionDate}`,
        html: emailHtml,
      }),
    });

    if (!emailResponse.ok) {
      const errorText = await emailResponse.text();
      console.error('Resend API error:', errorText);
      throw new Error('Failed to send email');
    }

    return new Response(
      JSON.stringify({ success: true }),
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