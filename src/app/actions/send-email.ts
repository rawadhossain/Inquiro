"use server";

import { Resend } from "resend";

interface IEmailProps {
  to: string;
  subject: string;
  text?: string;
  html?: string;
}

const resend = new Resend(process.env.RESEND_API_KEY);

async function sendEmail({ to, subject, text, html }: IEmailProps) {
  if (!process.env.RESEND_API_KEY ) {
    throw new Error("RESEND_API_KEY environment variable is not set");
  }
  if (!process.env.EMAIL_FROM) {
    throw new Error("EMAIL_FROM environment variable is not set");
  }

  if (!text && !html) {
    throw new Error("Either text or html content must be provided");
  }

  try {
    const emailData: any = {
      from: process.env.EMAIL_FROM,
      to,
      subject,
    };

    if (html) {
      emailData.html = html;
    }
    if (text) {
      emailData.text = text;
    }

    const { data, error } = await resend.emails.send(emailData);

    if (error) {
      console.error("Error sending email:", error);
      return {
        success: false,
        message: "Failed to send email.",
        error,
      };
    }

    return {
      success: true,
      message: "Email sent successfully!",
      messageId: data?.id,
    };
  } catch (err) {
    console.error("Unexpected error sending email:", err);
    return {
      success: false,
      message: "Unexpected error occurred while sending email.",
    };
  }
}

export default sendEmail;