import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';
import nodemailer from 'nodemailer';

interface OtpRecord {
  code: string;
  expiresAt: number;
  timer: NodeJS.Timeout;
}

// Memory store for OTPs
const otpMemoryStore = new Map<string, OtpRecord>();

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, nombres } = body || {};

    if (!email || typeof email !== 'string' || !email.includes('@')) {
      return NextResponse.json(
        { success: false, error: 'Correo electrónico válido requerido' },
        { status: 400 }
      );
    }

    const cleanEmail = email.trim().toLowerCase();
    const cleanNombres = (nombres || cleanEmail.split('@')[0]).trim();

    // 1. Generate 6-digit code
    const code = Math.floor(100000 + Math.random() * 900000).toString();

    // 2. Clear previous timer if exists for this email
    const existing = otpMemoryStore.get(cleanEmail);
    if (existing) {
      clearTimeout(existing.timer);
    }

    // 3. Store in memory with 5 min (300,000 ms) auto-cleanup
    const timer = setTimeout(() => {
      otpMemoryStore.delete(cleanEmail);
      console.log(`⏱️ OTP para ${cleanEmail} expiró y fue removido de memoria.`);
    }, 5 * 60 * 1000);

    otpMemoryStore.set(cleanEmail, {
      code,
      expiresAt: Date.now() + 5 * 60 * 1000,
      timer
    });

    console.log(`✉️ [OTP CLIENTE MEMORIA] Código de 6 dígitos para ${cleanEmail}: ${code}`);

    let emailSent = false;
    let resendError = null;

    // 4. Send email via Resend if RESEND_API_KEY is available
    const apiKey = process.env.RESEND_API_KEY;
    const htmlContent = `
      <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 500px; margin: 0 auto; padding: 32px 24px; background: #0f172a; color: #ffffff; border-radius: 16px; border: 1px solid rgba(239, 68, 68, 0.3);">
        <div style="text-align: center; margin-bottom: 20px;">
          <h1 style="color: #ef4444; font-size: 24px; margin: 0;">🍗 BuchisapaWeb</h1>
        </div>
        <p style="font-size: 15px; color: #cbd5e1;">Hola <strong>${cleanNombres}</strong>,</p>
        <p style="font-size: 15px; color: #cbd5e1;">Tu código BuchisapaWeb es:</p>
        <div style="text-align: center; margin: 24px 0;">
          <span style="font-size: 32px; font-weight: 800; letter-spacing: 6px; color: #ffffff; background: #dc2626; padding: 12px 24px; border-radius: 10px; display: inline-block;">
            ${code}
          </span>
        </div>
        <p style="font-size: 12px; color: #94a3b8; text-align: center;">Este código es válido durante 5 minutos.</p>
      </div>
    `;

    if (apiKey) {
      try {
        const resend = new Resend(apiKey);
        await resend.emails.send({
          from: 'BuchiSapa <onboarding@resend.dev>',
          to: cleanEmail,
          subject: `Tu código BuchisapaWeb es ${code}`,
          html: htmlContent
        });
        emailSent = true;
        console.log(`✉️ Email enviado por Resend a ${cleanEmail}`);
      } catch (err: any) {
        resendError = err.message;
        console.warn(`Error en Resend (${err.message}). Reintentando por Nodemailer fallback...`);
      }
    }

    // 5. Fallback via Nodemailer if Resend fails or key is absent
    if (!emailSent) {
      try {
        const user = process.env.GMAIL_USER || process.env.SMTP_USER || process.env.EMAIL_USER;
        const pass = process.env.GMAIL_APP_PASSWORD || process.env.GMAIL_APP_PASS || process.env.SMTP_PASS || process.env.EMAIL_PASS;
        if (user && pass) {
          const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: { user, pass }
          });
          await transporter.sendMail({
            from: `"BuchiSapa" <${user}>`,
            to: cleanEmail,
            subject: `Tu código BuchisapaWeb es ${code}`,
            html: htmlContent
          });
          emailSent = true;
          console.log(`✉️ Email enviado por Nodemailer Gmail a ${cleanEmail}`);
        }
      } catch (err: any) {
        console.warn(`Error Nodemailer: ${err.message}`);
      }
    }

    return NextResponse.json({
      success: true,
      message: emailSent
        ? `Código enviado a tu correo ${cleanEmail}`
        : `Código de 6 dígitos generado para ${cleanEmail}`,
      emailSent,
      resendError,
      debugCode: code
    });

  } catch (error: any) {
    console.error('Error in send-otp route:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Error al procesar solicitud OTP' },
      { status: 500 }
    );
  }
}
