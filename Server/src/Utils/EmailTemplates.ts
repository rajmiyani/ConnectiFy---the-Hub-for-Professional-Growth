const brandColor = '#4F46E5'; // ConnectiFy Blue
const secondaryColor = '#6B7280';
const backgroundColor = '#F9FAFB';

const baseTemplate = (content: string) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <style>
    body { font-family: 'Inter', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; background-color: ${backgroundColor}; margin: 0; padding: 0; -webkit-font-smoothing: antialiased; }
    .container { max-width: 600px; margin: 40px auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06); }
    .header { background-color: ${brandColor}; padding: 32px; text-align: center; }
    .header h1 { color: #ffffff; margin: 0; font-size: 24px; font-weight: 700; letter-spacing: -0.025em; }
    .content { padding: 40px; line-height: 1.6; color: #1F2937; }
    .content h2 { color: #111827; margin-top: 0; font-size: 20px; font-weight: 600; }
    .footer { background-color: #F3F4F6; padding: 24px; text-align: center; font-size: 14px; color: ${secondaryColor}; }
    .button { display: inline-block; padding: 12px 24px; background-color: ${brandColor}; color: #ffffff !important; text-decoration: none; border-radius: 6px; font-weight: 500; margin-top: 16px; transition: background-color 0.2s; }
    .otp-card { background-color: #F3F4F6; border-radius: 8px; padding: 24px; text-align: center; margin: 24px 0; }
    .otp-code { font-size: 32px; font-weight: 700; letter-spacing: 0.25em; color: ${brandColor}; margin: 0; }
    @media (max-width: 620px) { .container { margin: 0; border-radius: 0; } }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>ConnectiFy</h1>
    </div>
    <div class="content">
      ${content}
    </div>
    <div class="footer">
      <p>&copy; 2026 ConnectiFy. All rights reserved.</p>
      <p>Building connections that matter.</p>
    </div>
  </div>
</body>
</html>
`;

export const emailTemplates = {
  welcome: (name: string) => baseTemplate(`
    <h2>Welcome to the family, ${name}! 🚀</h2>
    <p>We're absolutely thrilled to have you join <strong>ConnectiFy</strong>. You've just taken the first step towards building more meaningful professional and social connections.</p>
    <p>Our goal is to help you showcase your skills, discover new opportunities, and grow your network with people who inspire you.</p>
    <div style="margin: 32px 0;">
      <p><strong>Ready to get started?</strong></p>
      <ul style="padding-left: 20px; color: #4B5563;">
        <li>Complete your professional profile</li>
        <li>Browse trending opportunities</li>
        <li>Connect with like-minded peers</li>
      </ul>
    </div>
    <a href="https://connectify-app.com/dashboard" class="button">Go to Dashboard</a>
    <p style="margin-top: 32px; font-size: 14px; color: #6B7280;">If you have any questions, feel free to reply to this email. We're here to help!</p>
  `),

  otp: (otp: string) => baseTemplate(`
    <h2>Verify your identity</h2>
    <p>To keep your ConnectiFy account secure, we need to verify your email address. Please use the following one-time password (OTP) to complete your request:</p>
    <div class="otp-card">
      <p class="otp-code">${otp}</p>
    </div>
    <p>This code will expire in <strong>10 minutes</strong>. If you didn't request this code, you can safely ignore this email.</p>
    <p style="font-size: 14px; color: #9CA3AF;">For security reasons, never share this code with anyone.</p>
  `),

  resetPassword: (link: string) => baseTemplate(`
    <h2>Reset your password</h2>
    <p>We received a request to reset the password for your ConnectiFy account. No worries, it happens!</p>
    <p>Click the button below to choose a new password. This link will expire in 1 hour for your security.</p>
    <div style="text-align: center; margin: 32px 0;">
      <a href="${link}" class="button">Reset My Password</a>
    </div>
    <p>If you didn't request this change, please ignore this email or reach out to our support team if you have concerns.</p>
  `),

  loginAlert: (name: string, device: string, location: string) => baseTemplate(`
    <h2>New Login Detected</h2>
    <p>Hi ${name}, there was a new login to your ConnectiFy account.</p>
    <div style="background-color: #FFFBEB; border-left: 4px solid #F59E0B; padding: 16px; margin: 24px 0;">
      <p style="margin: 0;"><strong>Device:</strong> ${device}</p>
      <p style="margin: 4px 0 0 0;"><strong>Location:</strong> ${location}</p>
    </div>
    <p>If this was you, you can safely ignore this alert. If you don't recognize this activity, we recommend changing your password immediately.</p>
    <a href="https://connectify-app.com/security" class="button">Secure Account</a>
  `),

  passwordChanged: (name: string) => baseTemplate(`
    <h2>Security Update: Password Changed</h2>
    <p>Hi ${name}, we're letting you know that the password for your ConnectiFy account was recently changed.</p>
    <p>If you made this change, you're all set! If you did <strong>not</strong> change your password, please take immediate action to secure your account.</p>
    <div style="text-align: center; margin: 32px 0;">
      <a href="https://connectify-app.com/forgot-password" class="button">I Don't Recognize This</a>
    </div>
  `),

  generalNotification: (title: string, message: string, ctaText?: string, ctaLink?: string) => baseTemplate(`
    <h2>${title}</h2>
    ${message}
    ${ctaText && ctaLink ? `<div style="text-align: center; margin: 32px 0;"><a href="${ctaLink}" class="button">${ctaText}</a></div>` : ''}
  `)
};
