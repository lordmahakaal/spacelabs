import { NextResponse } from 'next/server'
export const runtime = 'edge';

import { Resend } from 'resend'

export async function POST(request: Request) {
  const { name, email, message } = await request.json()

  if (!name || !email || !message) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
  }


  if (!process.env.RESEND_API_KEY) {
    return NextResponse.json({ error: 'Email service not configured' }, { status: 500 })
  }


  try {
    const resend = new Resend(process.env.RESEND_API_KEY)

    const { data, error } = await resend.emails.send({
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

    if (error) {
      return NextResponse.json({ error: 'Failed to send email', details: error }, { status: 500 })
    }


    return NextResponse.json({ success: true, message: 'Email sent successfully', messageId: data?.id }, { status: 200 })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to send email', details: error instanceof Error ? error.message : 'Unknown error' }, { status: 500 })
  }
}
