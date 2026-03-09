import { NextRequest, NextResponse } from 'next/server'
export const runtime = 'edge';

import { Resend } from 'resend'

export async function POST(request: Request) {
  const { name, email, message } = await request.json()

  if (!name || !email || !message) {
    return new Response(JSON.stringify({ error: 'Missing required fields' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' }
    })
  }


  if (!process.env.RESEND_API_KEY) {
    return new Response(JSON.stringify({ error: 'Email service not configured' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    })
  }


  try {
    const resend = new Resend(process.env.RESEND_API_KEY)

    const { data, error } = await resend.emails.send({
      from: 'onboarding@resend.dev',
      to: 'vishnusashi999@gmail.com',
      subject: `New Contact Form Submission from ${name}`,
      html: `
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Message:</strong> ${message}</p>
      `
    })

    if (error) {
      return new Response(JSON.stringify({ error: 'Failed to send email' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      })
    }


    return new Response(JSON.stringify({ success: true, data }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    })
  } catch (error) {
    return new Response(JSON.stringify({ error: 'Failed to send email' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    })
  }
}

    // Check if RESEND_API_KEY is configured
    if (!process.env.RESEND_API_KEY) {
      console.error('RESEND_API_KEY is not configured')
      return NextResponse.json(
        { error: 'Email service is not configured' },
        { status: 500 }
      )
    }

    // Send email using verified email address
    // In production, configure a custom domain at resend.com/domains and use that
    const resend = new Resend(process.env.RESEND_API_KEY);
    const result = await resend.emails.send({
      from: 'onboarding@resend.dev',
      to: 'vishnusashi999@gmail.com',
      replyTo: email,
      subject: `New Contact Form Submission from ${name}`,
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px; background-color: #f5f5f5;">
          <div style="background-color: white; padding: 20px; border-radius: 8px;">
            <h2 style="color: #333; margin-bottom: 20px;">New Contact Form Submission</h2>
            <div style="margin-bottom: 15px;">
              <p style="margin: 0; color: #666;"><strong>Name:</strong></p>
              <p style="margin: 5px 0 0 0; color: #333;">${name}</p>
            </div>
            <div style="margin-bottom: 15px;">
              <p style="margin: 0; color: #666;"><strong>Contact Email:</strong></p>
              <p style="margin: 5px 0 0 0; color: #333;"><a href="mailto:${email}">${email}</a></p>
            </div>
            <div style="margin-bottom: 15px;">
              <p style="margin: 0; color: #666;"><strong>Message:</strong></p>
              <p style="margin: 5px 0 0 0; color: #333; white-space: pre-wrap;">${message}</p>
            </div>
            <div style="margin-bottom: 15px;">
              <p style="margin: 0; color: #666;"><strong>For:</strong></p>
              <p style="margin: 5px 0 0 0; color: #333;">connect@spacelabs.pro</p>
            </div>
            <hr style="margin: 20px 0; border: none; border-top: 1px solid #eee;" />
            <p style="color: #999; font-size: 12px; margin: 0;">This is an automated message from Spacelabs Contact Form</p>
          </div>
        </div>
      `,
    })

    // Log the result for debugging
    console.log('[v0] Email sent result:', result)

    if (result.error) {
      console.error('[v0] Error sending email:', result.error)
      return NextResponse.json(
        { error: 'Failed to send email', details: result.error },
        { status: 500 }
      )
    }

    return NextResponse.json(
      { success: true, message: 'Email sent successfully', messageId: result.data?.id },
      { status: 200 }
    )
  } catch (error) {
    console.error('[v0] Error sending email:', error)
    return NextResponse.json(
      { error: 'Failed to send email', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
