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
    const contentType = req.headers.get('content-type') || '';
    let email: string;
    let jpegBase64: string;
    let emailHtml: string;
    let subject: string;

    if (contentType.includes('application/json')) {
      const jsonData = await req.json();
      email = jsonData.to;
      const imageData = jsonData.imageData;
      const playerName = jsonData.playerName || 'Player';
      const stats = jsonData.stats;

      if (!email || !imageData) {
        return new Response(
          JSON.stringify({ error: 'Missing required fields' }),
          {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          }
        );
      }

      jpegBase64 = imageData.split(',')[1];
      subject = `40 Bowls Draw Drill - ${playerName}`;

      emailHtml = `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
            .container { max-width: 800px; margin: 0 auto; padding: 20px; }
            .header { background: #547A51; color: white; padding: 30px; text-align: center; }
            .content { padding: 20px; background: #f0f4f0; }
            .score-summary { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1 style="margin: 0;">40 Bowls Draw Drill</h1>
              <p style="margin: 10px 0 0 0; opacity: 0.9;">${new Date().toLocaleDateString()}</p>
            </div>
            <div class="content">
              <p>Hi there,</p>
              <p>A 40 Bowls Draw Drill scorecard has been shared with you.</p>

              <div class="score-summary">
                <h2 style="margin-top: 0; color: #34533A;">Drill Results - ${playerName}</h2>
                <p style="font-size: 18px;">
                  <strong>Success Rate:</strong> ${stats.percentage}%
                </p>
                <p style="color: #666;">
                  ${stats.successfulBowls} out of ${stats.totalBowls} bowls successful
                </p>
              </div>

              <p style="color: #666; font-size: 14px; margin-top: 30px;">
                The complete scorecard is attached as a JPEG image.
              </p>

              <p style="color: #666; font-size: 14px;">
                This scorecard was created using the Bowlscore Training app.
              </p>
            </div>
          </div>
        </body>
        </html>
      `;
    } else {
      const formData = await req.formData();
      email = formData.get('email') as string;
      const gameDataStr = formData.get('gameData') as string;
      const jpegFile = formData.get('jpeg') as File;

      if (!email || !gameDataStr || !jpegFile) {
        return new Response(
          JSON.stringify({ error: 'Missing required fields' }),
          {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          }
        );
      }

      const gameData = JSON.parse(gameDataStr);
      const team1Name = gameData.teamNames[0] || 'Team 1';
      const team2Name = gameData.teamNames[1] || 'Team 2';
      const team1Total = (gameData.scores[0]?.reduce((sum: number, score: number) => sum + score, 0) || 0) - (gameData.handicaps['team1'] || 0);
      const team2Total = (gameData.scores[1]?.reduce((sum: number, score: number) => sum + score, 0) || 0) - (gameData.handicaps['team2'] || 0);

      const jpegBuffer = await jpegFile.arrayBuffer();
      jpegBase64 = btoa(String.fromCharCode(...new Uint8Array(jpegBuffer)));
      subject = `Lawn Bowls Scorecard - ${team1Name} vs ${team2Name}`;

      emailHtml = `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
            .container { max-width: 800px; margin: 0 auto; padding: 20px; }
            .header { background: #2d5016; color: white; padding: 30px; text-align: center; }
            .content { padding: 20px; background: #f0f4f0; }
            .score-summary { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1 style="margin: 0;">Lawn Bowls Score Card</h1>
              <p style="margin: 10px 0 0 0; opacity: 0.9;">${new Date().toLocaleDateString()}</p>
            </div>
            <div class="content">
              <p>Hi there,</p>
              <p>A lawn bowls scorecard has been shared with you.</p>

              <div class="score-summary">
                <h2 style="margin-top: 0; color: #2d5016;">Match Result</h2>
                <p style="font-size: 18px;">
                  <strong>${team1Name}</strong>: ${team1Total} -
                  <strong>${team2Name}</strong>: ${team2Total}
                </p>
                <p style="color: #666;">
                  ${gameData.endsCount} ends played
                </p>
              </div>

              <p style="color: #666; font-size: 14px; margin-top: 30px;">
                The complete scorecard is attached as a JPEG image.
              </p>

              <p style="color: #666; font-size: 14px;">
                This scorecard was created using the Lawn Bowls Training & Scorecard app.
              </p>
            </div>
          </div>
        </body>
        </html>
      `;
    }

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
        to: [email],
        subject: subject,
        html: emailHtml,
        attachments: [
          {
            filename: 'scorecard.jpg',
            content: jpegBase64,
          }
        ],
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

    console.log('Scorecard email sent successfully via Resend:', resendData.id);

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Email sent successfully'
      }),
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