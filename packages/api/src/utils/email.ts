import nodemailer from "nodemailer";
export const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.GMAIL_USER, // Your actual gmail: "founder@gmail.com"
        pass: process.env.GMAIL_APP_PASSWORD, // The 16-char App Password
    },
});