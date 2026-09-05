import nodemailer from 'nodemailer';

let transporter = null;

function getTransporter() {
  if (transporter) return transporter;

  const host = process.env.SMTP_HOST || 'smtp.gmail.com';
  const port = parseInt(process.env.SMTP_PORT || '465', 10);
  const secure = process.env.SMTP_SECURE === 'true' || port === 465;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (user && pass) {
    transporter = nodemailer.createTransport({
      host,
      port,
      secure,
      auth: { user, pass },
      tls: {
        rejectUnauthorized: false,
      },
    });
  } else {
    // In-memory / console test fallback
    transporter = nodemailer.createTransport({
      streamTransport: true,
      newline: 'unix',
      buffer: true,
    });
  }

  return transporter;
}

/**
 * Sends a welcome email to a new tenant with instructions to change the default JPTL2026 password.
 */
export async function sendTenantWelcomeEmail({ email, name, landlordName = 'Your Landlord', propertyName = 'your community' }) {
  const from = process.env.SMTP_FROM || '"JPTL Property Management" <noreply@jptl.com>';
  const subject = 'Welcome to JPTL — Your Tenant Portal Account Credentials';

  const html = `
    <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #1e293b; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden;">
      <div style="background: linear-gradient(135deg, #1e3a8a, #3b82f6); padding: 24px; text-align: center; color: #ffffff;">
        <h1 style="margin: 0; font-size: 24px; letter-spacing: -0.5px;">Welcome to JPTL Portal</h1>
        <p style="margin: 6px 0 0 0; opacity: 0.9; font-size: 14px;">Your digital resident experience is ready</p>
      </div>
      <div style="padding: 24px;">
        <p>Hello <strong>${name || 'Resident'}</strong>,</p>
        <p>${landlordName} has created your resident account for <strong>${propertyName}</strong>.</p>
        
        <div style="background-color: #f8fafc; border: 1px solid #cbd5e1; border-radius: 8px; padding: 18px; margin: 20px 0;">
          <h3 style="margin-top: 0; color: #0f172a; font-size: 16px;">🔑 Your Login Credentials:</h3>
          <p style="margin: 6px 0;"><strong>Portal Login URL:</strong> <a href="http://localhost:5173/login" style="color: #2563eb;">http://localhost:5173/login</a></p>
          <p style="margin: 6px 0;"><strong>Username / Email:</strong> <code style="background: #e2e8f0; padding: 2px 6px; border-radius: 4px;">${email}</code></p>
          <p style="margin: 6px 0;"><strong>Default Password:</strong> <code style="background: #fef08a; color: #854d0e; padding: 2px 6px; border-radius: 4px; font-weight: bold;">JPTL2026</code></p>
        </div>

        <div style="background-color: #fef2f2; border-left: 4px solid #ef4444; padding: 12px 16px; margin: 20px 0; border-radius: 0 8px 8px 0;">
          <p style="margin: 0; color: #991b1b; font-weight: bold;">⚠️ Security Notice:</p>
          <p style="margin: 4px 0 0 0; color: #b91c1c; font-size: 14px;">
            Please log in and <strong>change your default password (JPTL2026) immediately</strong> in your <em>Tenant Settings</em> tab to protect your personal account and payment methods.
          </p>
        </div>

        <p style="color: #64748b; font-size: 13px; margin-top: 30px; border-top: 1px solid #e2e8f0; padding-top: 16px;">
          If you did not expect this invitation or have questions, please reach out to your property management office.
        </p>
      </div>
    </div>
  `;

  try {
    const client = getTransporter();
    const info = await client.sendMail({
      from,
      to: email,
      subject,
      html,
    });
    if (process.env.NODE_ENV !== 'test') {
      console.log(`📧 [Nodemailer] Welcome email sent to ${email} (MessageId: ${info.messageId})`);
    }
    return { success: true, messageId: info.messageId };
  } catch (err) {
    console.error(`⚠️ [Nodemailer] Failed to send welcome email to ${email}:`, err.message);
    return { success: false, error: err.message };
  }
}

/**
 * Sends broadcast email notifications for new announcements.
 */
export async function sendAnnouncementEmail({ recipients = [], title, content, category = 'General', authorName = 'Property Management' }) {
  if (!recipients || recipients.length === 0) return;

  const from = process.env.SMTP_FROM || '"JPTL Property Management" <noreply@jptl.com>';
  const subject = `[Announcement: ${category}] ${title}`;

  const html = `
    <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #1e293b; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden;">
      <div style="background: linear-gradient(135deg, #0f172a, #334155); padding: 20px; text-align: center; color: #ffffff;">
        <span style="background: #3b82f6; padding: 3px 10px; border-radius: 12px; font-size: 11px; text-transform: uppercase; font-weight: bold; letter-spacing: 0.5px;">${category}</span>
        <h2 style="margin: 10px 0 0 0; font-size: 20px;">${title}</h2>
        <p style="margin: 4px 0 0 0; opacity: 0.8; font-size: 13px;">Posted by ${authorName}</p>
      </div>
      <div style="padding: 24px;">
        <div style="font-size: 15px; color: #334155; white-space: pre-wrap;">${content}</div>
        <div style="margin-top: 24px; text-align: center;">
          <a href="http://localhost:5173/tenant" style="background: #2563eb; color: #ffffff; text-decoration: none; padding: 10px 20px; border-radius: 6px; font-size: 14px; font-weight: bold; display: inline-block;">View in Tenant Portal</a>
        </div>
      </div>
    </div>
  `;

  try {
    const client = getTransporter();
    const info = await client.sendMail({
      from,
      bcc: recipients,
      subject,
      html,
    });
    if (process.env.NODE_ENV !== 'test') {
      console.log(`📢 [Nodemailer] Announcement broadcasted to ${recipients.length} residents (MessageId: ${info.messageId})`);
    }
    return { success: true, messageId: info.messageId };
  } catch (err) {
    console.error(`⚠️ [Nodemailer] Failed to broadcast announcement email:`, err.message);
    return { success: false, error: err.message };
  }
}
