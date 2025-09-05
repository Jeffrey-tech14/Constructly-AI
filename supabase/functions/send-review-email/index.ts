import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { Resend } from 'https://esm.sh/resend@2.0.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Get environment variables
    const supabaseUrl = Deno.env.get('SUPABASE_URL') || 'https://jtdtzkpqncpmmenywnlw.supabase.co';
    const supabaseServiceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    const resendApiKey = Deno.env.get('RESEND_API_KEY');
    
    if (!supabaseServiceRoleKey) {
      throw new Error('SUPABASE_SERVICE_ROLE_KEY environment variable is not set');
    }

    if (!resendApiKey) {
      throw new Error('RESEND_API_KEY environment variable is not set');
    }

    const supabaseClient = createClient(
      supabaseUrl,
      supabaseServiceRoleKey
    );

    const { quoteId, clientEmail, clientName, projectName } = await req.json();

    if (!quoteId || !clientEmail || !clientName) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields: quoteId, clientEmail, or clientName' }),
        { 
          status: 400,
          headers: { 
            'Content-Type': 'application/json',
            ...corsHeaders 
          } 
        }
      );
    }

    // Create a review link with the quote ID
    const reviewLink = `${supabaseUrl}/review/${quoteId}`;

    // Initialize Resend
    const resend = new Resend(resendApiKey);

    // Send email using Resend
    const { data, error } = await resend.emails.send({
      from: 'Constructly <noreply@constructly.app>',
      to: [clientEmail],
      subject: `Please Review Your ${projectName || 'Construction Project'}`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <style>
            body {
              font-family: 'Poppins', Arial, sans-serif;
              line-height: 1.6;
              color: #333;
              max-width: 600px;
              margin: 0 auto;
              padding: 20px;
            }
            .header {
              text-align: center;
              margin-bottom: 30px;
            }
            .logo {
              font-size: 24px;
              font-weight: bold;
              color: #3b82f6;
            }
            .button {
              display: inline-block;
              padding: 12px 24px;
              background-color: #3b82f6;
              color: white;
              text-decoration: none;
              border-radius: 6px;
              font-weight: bold;
              margin: 20px 0;
            }
            .footer {
              margin-top: 30px;
              padding-top: 20px;
              border-top: 1px solid #eee;
              font-size: 14px;
              color: #666;
            }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="logo">Constructly</div>
          </div>
          
          <h1>Hi ${clientName},</h1>
          
          <p>Your construction project${projectName ? ` "${projectName}"` : ''} has been completed!</p>
          
          <p>We value your feedback and would appreciate it if you could take a few moments to share your experience with us.</p>
          
          <p>Click the button below to leave a review:</p>
          
          <div style="text-align: center;">
            <a href="${reviewLink}" class="button">Leave a Review</a>
          </div>
          
          <p>Or copy and paste this link into your browser:</p>
          <p>${reviewLink}</p>
          
          <p>Thank you for choosing Constructly for your construction needs!</p>
          
          <div class="footer">
            <p>Best regards,<br>The Constructly Team</p>
            <p>If you have any questions, please contact us at support@constructly.app</p>
            <p><small>This is an automated message. Please do not reply to this email.</small></p>
          </div>
        </body>
        </html>
      `,
    });

    if (error) {
      console.error('Resend API error:', error);
      throw new Error(`Failed to send email: ${error.message}`);
    }

    console.log('Review email sent successfully:', data);

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Review email sent successfully',
        data 
      }),
      { 
        headers: { 
          'Content-Type': 'application/json',
          ...corsHeaders 
        } 
      }
    );
  } catch (error) {
    console.error('Error sending review email:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500,
        headers: { 
          'Content-Type': 'application/json',
          ...corsHeaders 
        } 
      }
    );
  }
});