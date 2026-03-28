import { NextResponse } from 'next/server';
import { Resend } from 'resend';

export const runtime = 'edge';

export async function POST(request: Request) {
  const resend = new Resend(process.env.RESEND_API_KEY);
  try {
    const { email, name, password } = await request.json();

    if (!email || !name || !password) {
      return NextResponse.json(
        { error: 'Email, name and password are required' },
        { status: 400 }
      );
    }

    const { data, error } = await resend.emails.send({
      from: `GESTCLINIA <${process.env.RESEND_FROM_EMAIL}>`,
      to: [email],
      subject: '¡Bienvenido a GESTCLINIA! - Tu cuenta y contraseña',
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eaeaea; border-radius: 10px;">
          <h2 style="color: #4f46e5;">¡Bienvenido/a a GESTCLINIA, ${name}!</h2>
          <p>Tu cuenta ha sido creada exitosamente. A continuación encontrarás las credenciales que se generaron de forma segura para tu acceso:</p>
          <div style="background-color: #f3f4f6; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <p style="margin: 0 0 10px 0;"><strong>Usuario:</strong> ${email}</p>
            <p style="margin: 0;"><strong>Contraseña:</strong> <span style="font-family: monospace; font-size: 16px;">${password}</span></p>
          </div>
          <p>Por favor, usa esta contraseña para iniciar sesión en la plataforma. Te recomendamos guardarla en un lugar seguro.</p>
          <br/>
          <p style="color: #6b7280; font-size: 14px;">El equipo de GESTCLINIA</p>
        </div>
      `
    });

    if (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      return NextResponse.json({ error: errorMessage }, { status: 500 });
    }

    return NextResponse.json({ success: true, data });
  } catch (error) {
    const message = error instanceof Error ? error.message : "An unknown error occurred";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
