import nodemailer from "nodemailer"

/**
 * SEND EMAIL UTILITY
 * Why: This is the actual engine that connects to Google's SMTP servers to send emails.
 * It's used by our background "Worker".
 */
const sendEmail = async (options: {
    email: string
    subject: string
    message: string
    html?: string
}) => {
    // 1. Create the "Mailing Machine" (Transporter)
    // Why: We use your Gmail app password to gain permission to send emails from your account.
    const transporter = nodemailer.createTransport({
        service: process.env.SMTP_SERVICE,
        host: process.env.SMTP_HOST,
        port: Number(process.env.SMTP_PORT),
        secure: false, // use TLS (Standard for port 587)
        auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASSWORD,
        },
    })

    // 2. Prepare the Envelope
    const mailOptions = {
        // Branding: This makes it show as "ConnectiFy <your-email>" in the user's inbox
        from: `${process.env.APP_NAME || "ConnectiFy"} <${process.env.SMTP_USER}>`,
        to: options.email,
        subject: options.subject,
        text: options.message,
        html: options.html,
    }

    // 3. Send the Mail
    await transporter.sendMail(mailOptions)
}

export default sendEmail
