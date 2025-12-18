import nodemailer from "nodemailer";

if (!process.env.GMAIL_USER || !process.env.GMAIL_PASSWORD) {
  console.warn(
    "GMAIL_USER or GMAIL_PASSWORD is not set. Email sending will fail.",
  );
}

export const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.GMAIL_USER, // Your actual gmail: "founder@gmail.com"
    pass: process.env.GMAIL_PASSWORD, // The 16-char App Password
  },
});
