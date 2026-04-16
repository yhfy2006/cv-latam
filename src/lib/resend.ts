import { Resend } from "resend";

export const resend = new Resend(process.env.RESEND_API_KEY!);

export async function sendWaitlistConfirmation(email: string) {
  return resend.emails.send({
    from: process.env.EMAIL_FROM ?? "noreply@example.com",
    to: email,
    subject: process.env.WAITLIST_EMAIL_SUBJECT ?? "You're on the waitlist!",
    html: `<p>${process.env.WAITLIST_EMAIL_BODY ?? "Thanks for signing up. We'll be in touch soon."}</p>`,
  });
}
