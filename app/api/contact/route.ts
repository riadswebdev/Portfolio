import { NextResponse } from "next/server";
import nodemailer from "nodemailer";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, email, subject, message } = body;

    if (!name || !email || !subject || !message) {
      return NextResponse.json(
        { error: "All fields (name, email, subject, message) are required." },
        { status: 400 }
      );
    }

    const gmailUser = process.env.GMAIL_USER || "riadswebdev@gmail.com";
    const gmailAppPassword = process.env.GMAIL_APP_PASSWORD;

    if (!gmailAppPassword) {
      console.warn("GMAIL_APP_PASSWORD is not set in .env.local.");
      return NextResponse.json(
        { error: "Server email credentials are not configured. Please set GMAIL_APP_PASSWORD in .env.local." },
        { status: 500 }
      );
    }

    // Configure Gmail Transporter
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: gmailUser,
        pass: gmailAppPassword,
      },
    });

    // Send Email
    await transporter.sendMail({
      from: `"${name}" <${gmailUser}>`,
      replyTo: email,
      to: gmailUser,
      subject: subject,
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px; background-color: #0b1329; color: #f4f4f5; border-radius: 12px;">
          <h2 style="color: #38bdf8; margin-bottom: 16px;">New Contact Message from Portfolio</h2>
          <p style="margin: 6px 0;"><strong>Name:</strong> ${name}</p>
          <p style="margin: 6px 0;"><strong>Email:</strong> <a href="mailto:${email}" style="color: #38bdf8;">${email}</a></p>
          <p style="margin: 6px 0;"><strong>Subject:</strong> ${subject}</p>
          <hr style="border-color: #1e293b; margin: 16px 0;" />
          <p style="margin-bottom: 8px;"><strong>Message:</strong></p>
          <div style="background-color: #07090e; padding: 14px; border-radius: 8px; border: 1px solid #1e293b; white-space: pre-wrap; font-size: 14px; color: #e4e4e7;">${message}</div>
        </div>
      `,
    });

    return NextResponse.json({ success: true, message: "Email sent successfully!" });
  } catch (error: any) {
    console.error("Contact API error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to send email message." },
      { status: 500 }
    );
  }
}
