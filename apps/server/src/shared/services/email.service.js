import nodemailer from 'nodemailer';

let _transporter = null;

function getTransporter() {
  if (_transporter) return _transporter;

  _transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.SMTP_PORT || '465', 10),
    secure: process.env.SMTP_SECURE === 'true',
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  return _transporter;
}

/**
 * Send a styled JPTL email.
 * @param {object} opts
 * @param {string} opts.to
 * @param {string} opts.subject
 * @param {string} opts.html
 */
export async function sendEmail({ to, subject, html }) {
  const from = process.env.SMTP_FROM || `"JPTL Property Management" <${process.env.SMTP_USER}>`;
  await getTransporter().sendMail({ from, to, subject, html });
}

/**
 * Send a password reset email.
 * @param {object} opts
 * @param {string} opts.to        - Recipient email
 * @param {string} opts.firstName - Recipient first name
 * @param {string} opts.resetUrl  - Full reset URL containing the raw token
 */
export async function sendPasswordResetEmail({ to, firstName, resetUrl }) {
  const html = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <title>Password Reset — JPTL</title>
    </head>
    <body style="margin:0;padding:0;background:#070A12;font-family:'Segoe UI',Arial,sans-serif;">
      <table width="100%" cellpadding="0" cellspacing="0" style="background:#070A12;padding:40px 16px;">
        <tr>
          <td align="center">
            <table width="520" cellpadding="0" cellspacing="0" style="background:#0D111D;border:1px solid rgba(99,102,241,0.2);border-radius:20px;overflow:hidden;max-width:100%;">
              <!-- Header -->
              <tr>
                <td style="background:linear-gradient(135deg,#1e1b4b,#0f172a);padding:32px 40px;text-align:center;">
                  <div style="display:inline-flex;align-items:center;gap:10px;">
                    <div style="width:40px;height:40px;background:#4F46E5;border-radius:12px;display:inline-block;line-height:40px;text-align:center;">
                      <span style="color:#fff;font-size:20px;font-weight:bold;">J</span>
                    </div>
                    <span style="color:#fff;font-size:20px;font-weight:800;letter-spacing:-0.5px;">JPTL<span style="color:#818CF8;">.SYSTEM</span></span>
                  </div>
                </td>
              </tr>
              <!-- Body -->
              <tr>
                <td style="padding:40px;">
                  <p style="color:#94A3B8;font-size:12px;font-family:monospace;letter-spacing:2px;text-transform:uppercase;margin:0 0 12px;">Password Reset</p>
                  <h1 style="color:#F8FAFC;font-size:24px;font-weight:800;margin:0 0 16px;line-height:1.2;">Hi, ${firstName} </h1>
                  <p style="color:#94A3B8;font-size:14px;line-height:1.7;margin:0 0 24px;">
                    We received a request to reset the password for your JPTL account. Click the button below to create a new password. This link is valid for <strong style="color:#E2E8F0;">30 minutes</strong>.
                  </p>
                  <div style="text-align:center;margin:32px 0;">
                    <a href="${resetUrl}"
                       style="display:inline-block;padding:14px 36px;background:#4F46E5;color:#fff;font-size:14px;font-weight:700;text-decoration:none;border-radius:14px;letter-spacing:0.3px;box-shadow:0 8px 24px rgba(79,70,229,0.4);">
                      Reset My Password
                    </a>
                  </div>
                  <p style="color:#64748B;font-size:12px;line-height:1.7;margin:0 0 8px;">
                    If the button above doesn't work, copy and paste this URL into your browser:
                  </p>
                  <p style="background:#111827;border:1px solid #1E293B;border-radius:8px;padding:12px;color:#818CF8;font-size:11px;font-family:monospace;word-break:break-all;margin:0 0 24px;">
                    ${resetUrl}
                  </p>
                  <p style="color:#64748B;font-size:12px;line-height:1.7;margin:0;">
                    If you didn't request a password reset, you can safely ignore this email — your password will not be changed.
                  </p>
                </td>
              </tr>
              <!-- Footer -->
              <tr>
                <td style="border-top:1px solid #1E293B;padding:24px 40px;text-align:center;">
                  <p style="color:#475569;font-size:11px;font-family:monospace;margin:0;">
                    JPTL Property Management System &bull; Automated Security Email
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

  await sendEmail({ to, subject: 'Reset Your JPTL Password', html });
}
