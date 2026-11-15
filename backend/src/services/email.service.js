import nodemailer from 'nodemailer';

let transporter = null;
let etherealWarningLogged = false;

/**
 * Initialize or get active email transporter
 */
async function getTransporter() {
  if (transporter) return transporter;

  const {
    SMTP_HOST,
    SMTP_PORT,
    SMTP_USER,
    SMTP_PASS,
    SMTP_SECURE,
    EMAIL_SERVICE,
    EMAIL_USER,
    EMAIL_PASS,
    GMAIL_USER,
    GMAIL_APP_PASSWORD,
  } = process.env;

  // 1. Gmail Preset configuration
  const gmailUser = (EMAIL_USER || GMAIL_USER || '').trim();
  const gmailPass = (EMAIL_PASS || GMAIL_APP_PASSWORD || '').trim();

  if (gmailUser && gmailPass) {
    console.log(`📧 [WorkPur Mailer] Initializing Gmail SMTP transport with ${gmailUser}...`);
    transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: gmailUser,
        pass: gmailPass,
      },
    });
    return transporter;
  }

  // 2. Custom SMTP Server configuration (Brevo, SendGrid, Mailgun, AWS SES, or custom SMTP)
  if (SMTP_HOST && SMTP_USER && SMTP_PASS) {
    const port = parseInt(SMTP_PORT || '587', 10);
    const secure = SMTP_SECURE === 'true' || port === 465;

    console.log(`📧 [WorkPur Mailer] Initializing Custom SMTP transport (${SMTP_HOST}:${port})...`);
    transporter = nodemailer.createTransport({
      host: SMTP_HOST,
      port,
      secure,
      auth: {
        user: SMTP_USER,
        pass: SMTP_PASS,
      },
    });
    return transporter;
  }

  // 3. Fallback to Ethereal Test Account when no credentials are configured
  if (!etherealWarningLogged) {
    console.log('\n⚠️  [WorkPur Mailer Notice]');
    console.log('   No SMTP credentials found in backend/.env.');
    console.log('   Creating an Ethereal test inbox so real emails can be previewed online.');
    console.log('   👉 To receive real emails in your Gmail inbox, add to backend/.env:');
    console.log('      EMAIL_SERVICE=gmail');
    console.log('      EMAIL_USER=your_email@gmail.com');
    console.log('      EMAIL_PASS=your_16_character_google_app_password\n');
    etherealWarningLogged = true;
  }

  try {
    const testAccount = await nodemailer.createTestAccount();
    transporter = nodemailer.createTransport({
      host: testAccount.smtp.host,
      port: testAccount.smtp.port,
      secure: testAccount.smtp.secure,
      auth: {
        user: testAccount.user,
        pass: testAccount.pass,
      },
    });
    return transporter;
  } catch (err) {
    console.warn('Could not generate Ethereal test account:', err.message);
    return null;
  }
}

/**
 * Sends a real Verification OTP email to the recipient
 */
export async function sendOtpEmail({ to, code, name }) {
  const mailTransporter = await getTransporter();
  const fromAddress = process.env.SMTP_FROM || process.env.EMAIL_USER || process.env.GMAIL_USER || '"WorkPur Security" <security@workpur.com>';

  const subject = `Your WorkPur Verification Code: ${code}`;
  
  const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>WorkPur Verification Code</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f8fafc; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #1e293b;">
  <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #f8fafc; padding: 40px 15px;">
    <tr>
      <td align="center">
        <table width="100%" max-width="520" style="max-width: 520px; background-color: #ffffff; border-radius: 16px; border: 1px solid #e2e8f0; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);">
          <!-- Header Banner -->
          <tr>
            <td style="background: linear-gradient(135deg, #1e1b4b 0%, #312e81 100%); padding: 32px 30px; text-align: center;">
              <h1 style="margin: 0; color: #ffffff; font-size: 24px; font-weight: 800; letter-spacing: -0.5px;">
                Work<span style="color: #818cf8;">Pur</span>
              </h1>
              <p style="margin: 6px 0 0 0; color: #94a3b8; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 1.5px;">
                Enterprise Talent & Escrow Marketplace
              </p>
            </td>
          </tr>

          <!-- Content Body -->
          <tr>
            <td style="padding: 36px 32px;">
              <h2 style="margin: 0 0 12px 0; color: #0f172a; font-size: 20px; font-weight: 700;">
                Verify Your Email Address
              </h2>
              <p style="margin: 0 0 24px 0; color: #475569; font-size: 14px; line-height: 22px;">
                ${name ? `Hello <strong>${name}</strong>,` : 'Hello,'}<br>
                Thank you for signing up with <strong>WorkPur</strong>. To complete your registration and secure your account, please enter the one-time verification code below:
              </p>

              <!-- OTP Code Display Card -->
              <div style="background-color: #f1f5f9; border: 1px solid #cbd5e1; border-radius: 12px; padding: 22px; text-align: center; margin-bottom: 24px;">
                <span style="display: block; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 1.5px; color: #64748b; margin-bottom: 8px;">
                  One-Time Password (OTP)
                </span>
                <span style="display: inline-block; font-family: 'SF Mono', Consolas, Monaco, monospace; font-size: 36px; font-weight: 900; letter-spacing: 8px; color: #4338ca;">
                  ${code}
                </span>
                <span style="display: block; font-size: 12px; color: #64748b; margin-top: 8px;">
                  ⏱️ Expires in <strong>10 minutes</strong>
                </span>
              </div>

              <!-- Security Information -->
              <p style="margin: 0 0 16px 0; color: #64748b; font-size: 12px; line-height: 18px;">
                🔒 <strong>Security Notice:</strong> Never share this code with anyone. WorkPur staff will never ask for your verification code or account password.
              </p>
              <p style="margin: 0; color: #94a3b8; font-size: 11px; line-height: 16px;">
                If you did not initiate this registration, please disregard this email or contact support.
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #f8fafc; border-top: 1px solid #f1f5f9; padding: 20px 32px; text-align: center;">
              <p style="margin: 0; color: #94a3b8; font-size: 11px;">
                © ${new Date().getFullYear()} WorkPur Inc. All rights reserved.<br>
                100% Guaranteed Escrow Protection & Global Talent Marketplace
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `;

  if (!mailTransporter) {
    console.warn(`[WorkPur Mailer] No email transport available. Code for ${to}: ${code}`);
    return {
      sent: false,
      message: 'Email transport not available',
      code,
    };
  }

  try {
    const info = await mailTransporter.sendMail({
      from: fromAddress,
      to,
      subject,
      text: `Your WorkPur verification code is: ${code}. This code expires in 10 minutes.`,
      html: htmlContent,
    });

    console.log(`\n======================================================`);
    console.log(`✅ [WorkPur Mailer] Email Successfully Sent!`);
    console.log(`   To:         ${to}`);
    console.log(`   Subject:    ${subject}`);
    console.log(`   Message ID: ${info.messageId}`);

    // If using Ethereal test inbox, log preview URL
    const testUrl = nodemailer.getTestMessageUrl(info);
    if (testUrl) {
      console.log(`   🌐 Ethereal Web Preview: ${testUrl}`);
    }
    console.log(`======================================================\n`);

    return {
      sent: true,
      messageId: info.messageId,
      previewUrl: testUrl || null,
      code,
    };
  } catch (err) {
    console.error(`❌ [WorkPur Mailer] Error sending email to ${to}:`, err.message);
    return {
      sent: false,
      error: err.message,
      code,
    };
  }
}
