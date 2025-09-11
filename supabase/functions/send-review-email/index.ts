
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from '@supabase/supabase-js';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      'https://jtdtzkpqncpmmenywnlw.supabase.co' ,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { quoteId, clientEmail, clientName } = await req.json();

    // Create a review link with the quote ID
    const reviewLink = `${'https://jtdtzkpqncpmmenywnlw.supabase.co'}/review/${quoteId}`;

    // For now, we'll just log the email request
    // In production, you would integrate with an email service like Resend
    console.log('Review email request:', {
      quoteId,
      clientEmail,
      clientName,
      reviewLink
    });

    // You could integrate with Resend here:
    // const resend = new Resend(Deno.env.get('RESEND_API_KEY'));
    // await resend.emails.send({
    //   from: 'Construction App <noreply@yourapp.com>',
    //   to: [clientEmail],
    //   subject: 'Project Completed - Please Leave a Review',
    //   html: `
    //     <h1>Hi ${clientName},</h1>
    //     <p>Your construction project has been completed!</p>
    //     <p>We'd love to hear about your experience. Please click the link below to leave a review:</p>
    //     <a href="${reviewLink}">Leave a Review</a>
    //   `
    // });

    return new Response(
      JSON.stringify({ success: true, message: 'Review email sent' }),
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
