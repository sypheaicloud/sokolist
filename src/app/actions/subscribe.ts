'use server';

import nodemailer from 'nodemailer';

export async function subscribeUser(formData: FormData) {
    const email = formData.get('email') as string;

    if (!email || !email.includes('@')) {
        return { success: false, message: 'Invalid email address' };
    }

    if (!process.env.GMAIL_USER || !process.env.GMAIL_APP_PASSWORD) {
        console.error('❌ Server Error: Missing GMAIL_USER or GMAIL_APP_PASSWORD in .env file.');
        return { success: false, message: 'System configuration error.' };
    }

    try {
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.GMAIL_USER,
                pass: process.env.GMAIL_APP_PASSWORD,
            },
        });

        await transporter.sendMail({
            from: `"MarketPlace254 Bot" <${process.env.GMAIL_USER}>`,
            to: process.env.GMAIL_USER,
            replyTo: email,
            // ✅ CORRECT SPELLING HERE
            subject: `[MarketPlace254 Subscriber] ${email}`,
            text: `New subscriber: ${email}\n\nHit Reply to contact them.`,
            html: `
                <div style="font-family: sans-serif; padding: 20px; border: 1px solid #e2e8f0; border-radius: 12px; background-color: #f8fafc;">
                    <h2 style="color: #7c3aed; margin-top:0;">New MarketPlace254 Subscriber 🎉</h2>
                    <p style="font-size: 16px;">A new user has requested to join your list:</p>
                    <div style="background: white; padding: 15px; border-radius: 8px; border: 1px solid #cbd5e1; font-weight: bold; font-size: 18px;">
                        ${email}
                    </div>
                    <p style="color: #64748b; font-size: 14px; margin-top: 20px;">
                        Tip: You can hit <strong>Reply</strong> to email them directly.
                    </p>
                </div>
            `,
        });

        return { success: true, message: 'Subscribed successfully!' };
    } catch (error) {
        console.error('Subscribe Error:', error);
        return { success: false, message: 'Could not subscribe. Try again.' };
    }
}