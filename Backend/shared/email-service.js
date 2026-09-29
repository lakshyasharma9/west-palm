const { Resend } = require('resend');

const resend = new Resend(process.env.RESEND_API_KEY);

const COMPANY_NAME = 'West Palm Consultants';
const COMPANY_EMAIL = 'noreply@westpalmcs.com';
const ADMIN_EMAILS = ['sales@westpalmcs.com', 'kvijay@westpalmcs.com'];
const LOGO_URL = 'https://westpalmcs.com/West_Palm_Logo-removebg-preview.png';
const WEBSITE_URL = 'https://westpalmcs.com';
const PRIMARY_COLOR = '#146321';
const GOLD_COLOR = '#D4AF37';

// ─────────────────────────────────────────────
// CLIENT CONFIRMATION EMAIL TEMPLATE
// ─────────────────────────────────────────────
function buildClientConfirmationHTML(data) {
  const servicesList = data.services && data.services.length > 0
    ? data.services.map(s => `
        <span style="display:inline-block;background:#f0f9f0;color:${PRIMARY_COLOR};
          border:1px solid #c6e6c8;border-radius:20px;padding:4px 14px;
          font-size:13px;font-weight:600;margin:3px 4px 3px 0;">
          ${s}
        </span>`).join('')
    : `<span style="color:#94a3b8;font-size:13px;">Not specified</span>`;

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Thank You – ${COMPANY_NAME}</title>
</head>
<body style="margin:0;padding:0;background:#f1f5f1;font-family:'Segoe UI',Arial,sans-serif;">

  <!-- Preheader -->
  <div style="display:none;max-height:0;overflow:hidden;color:#f1f5f1;">
    We've received your inquiry and will get back to you within 24 hours.
  </div>

  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f1f5f1;padding:40px 0;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;">

        <!-- HEADER -->
        <tr>
          <td style="background:linear-gradient(135deg,#0d1f0d 0%,${PRIMARY_COLOR} 100%);
            border-radius:16px 16px 0 0;padding:40px 48px;text-align:center;">
            <img src="${LOGO_URL}" alt="${COMPANY_NAME}" width="120"
              style="display:block;margin:0 auto 20px;max-height:60px;object-fit:contain;" />
            <h1 style="margin:0;color:#ffffff;font-size:26px;font-weight:700;letter-spacing:-0.3px;">
              Thank You, ${data.fullName.split(' ')[0]}!
            </h1>
            <p style="margin:10px 0 0;color:rgba(255,255,255,0.75);font-size:15px;">
              Your inquiry has been received
            </p>
          </td>
        </tr>

        <!-- GOLD DIVIDER -->
        <tr>
          <td style="background:${GOLD_COLOR};height:4px;"></td>
        </tr>

        <!-- BODY -->
        <tr>
          <td style="background:#ffffff;padding:44px 48px;">

            <p style="margin:0 0 24px;color:#1e293b;font-size:16px;line-height:1.7;">
              Hi <strong>${data.fullName}</strong>,
            </p>
            <p style="margin:0 0 24px;color:#475569;font-size:15px;line-height:1.8;">
              Thank you for reaching out to <strong>${COMPANY_NAME}</strong>. 
              We've received your inquiry and our technical team will review it carefully.
              Expect a response within <strong style="color:${PRIMARY_COLOR};">24 business hours</strong>.
            </p>

            <!-- SUBMISSION SUMMARY BOX -->
            <table width="100%" cellpadding="0" cellspacing="0"
              style="background:#f8faf8;border:1px solid #e2ece2;border-radius:12px;
                margin:28px 0;overflow:hidden;">
              <tr>
                <td style="background:${PRIMARY_COLOR};padding:14px 24px;">
                  <p style="margin:0;color:#fff;font-size:12px;font-weight:700;
                    letter-spacing:0.12em;text-transform:uppercase;">
                    Your Submission Summary
                  </p>
                </td>
              </tr>
              <tr>
                <td style="padding:24px;">
                  <table width="100%" cellpadding="0" cellspacing="0">
                    <tr>
                      <td width="36%" style="padding:8px 0;color:#94a3b8;font-size:13px;
                        font-weight:600;text-transform:uppercase;letter-spacing:0.05em;
                        vertical-align:top;">Name</td>
                      <td style="padding:8px 0;color:#1e293b;font-size:14px;
                        font-weight:600;vertical-align:top;">${data.fullName}</td>
                    </tr>
                    <tr>
                      <td style="padding:8px 0;color:#94a3b8;font-size:13px;
                        font-weight:600;text-transform:uppercase;letter-spacing:0.05em;
                        vertical-align:top;border-top:1px solid #e8f0e8;">Email</td>
                      <td style="padding:8px 0;color:#1e293b;font-size:14px;
                        vertical-align:top;border-top:1px solid #e8f0e8;">${data.email}</td>
                    </tr>
                    ${data.company ? `
                    <tr>
                      <td style="padding:8px 0;color:#94a3b8;font-size:13px;
                        font-weight:600;text-transform:uppercase;letter-spacing:0.05em;
                        vertical-align:top;border-top:1px solid #e8f0e8;">Company</td>
                      <td style="padding:8px 0;color:#1e293b;font-size:14px;
                        vertical-align:top;border-top:1px solid #e8f0e8;">${data.company}</td>
                    </tr>` : ''}
                    ${data.services && data.services.length > 0 ? `
                    <tr>
                      <td style="padding:8px 0;color:#94a3b8;font-size:13px;
                        font-weight:600;text-transform:uppercase;letter-spacing:0.05em;
                        vertical-align:top;border-top:1px solid #e8f0e8;">Services</td>
                      <td style="padding:8px 0;vertical-align:top;
                        border-top:1px solid #e8f0e8;">${servicesList}</td>
                    </tr>` : ''}
                    <tr>
                      <td style="padding:8px 0;color:#94a3b8;font-size:13px;
                        font-weight:600;text-transform:uppercase;letter-spacing:0.05em;
                        vertical-align:top;border-top:1px solid #e8f0e8;">Message</td>
                      <td style="padding:8px 0;color:#475569;font-size:14px;
                        line-height:1.6;vertical-align:top;
                        border-top:1px solid #e8f0e8;">${data.message}</td>
                    </tr>
                    <tr>
                      <td style="padding:8px 0;color:#94a3b8;font-size:13px;
                        font-weight:600;text-transform:uppercase;letter-spacing:0.05em;
                        vertical-align:top;border-top:1px solid #e8f0e8;">Submitted</td>
                      <td style="padding:8px 0;color:#1e293b;font-size:14px;
                        vertical-align:top;border-top:1px solid #e8f0e8;">${data.submittedAt}</td>
                    </tr>
                  </table>
                </td>
              </tr>
            </table>

            <!-- WHAT'S NEXT -->
            <p style="margin:28px 0 16px;color:#1e293b;font-size:15px;font-weight:700;">
              What happens next?
            </p>
            <table width="100%" cellpadding="0" cellspacing="0">
              ${[
                ['🔍', 'Review', 'Our team reviews your inquiry in detail.'],
                ['📞', 'Contact', 'A specialist will reach out within 24 hours.'],
                ['🚀', 'Kickoff', "We'll tailor a solution for your project."]
              ].map(([icon, title, desc], i) => `
              <tr>
                <td style="padding:10px 0;">
                  <table cellpadding="0" cellspacing="0">
                    <tr>
                      <td width="44" style="vertical-align:top;">
                        <div style="width:36px;height:36px;background:#f0f9f0;
                          border-radius:50%;text-align:center;line-height:36px;font-size:18px;">
                          ${icon}
                        </div>
                      </td>
                      <td style="vertical-align:top;padding-left:4px;">
                        <p style="margin:0;color:#1e293b;font-size:14px;font-weight:700;">${title}</p>
                        <p style="margin:2px 0 0;color:#64748b;font-size:13px;">${desc}</p>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>`).join('')}
            </table>

            <!-- CTA BUTTON -->
            <div style="text-align:center;margin:36px 0 8px;">
              <a href="${WEBSITE_URL}" target="_blank"
                style="display:inline-block;background:${PRIMARY_COLOR};color:#ffffff;
                  text-decoration:none;font-size:15px;font-weight:700;
                  padding:14px 36px;border-radius:10px;
                  letter-spacing:0.04em;">
                Visit Our Website →
              </a>
            </div>

          </td>
        </tr>

        <!-- FOOTER -->
        <tr>
          <td style="background:#0d1f0d;border-radius:0 0 16px 16px;
            padding:28px 48px;text-align:center;">
            <p style="margin:0 0 6px;color:rgba(255,255,255,0.4);font-size:12px;">
              © ${new Date().getFullYear()} ${COMPANY_NAME}. All rights reserved.
            </p>
            <p style="margin:0;color:rgba(255,255,255,0.25);font-size:11px;">
              Vista Parkway, West Palm Beach, FL 33411 &nbsp;|&nbsp;
              <a href="mailto:sales@westpalmcs.com"
                style="color:rgba(255,255,255,0.4);text-decoration:none;">
                sales@westpalmcs.com
              </a>
            </p>
            <p style="margin:10px 0 0;color:rgba(255,255,255,0.2);font-size:11px;">
              This is an automated confirmation. Please do not reply to this email.
            </p>
          </td>
        </tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

// ─────────────────────────────────────────────
// ADMIN LEAD NOTIFICATION EMAIL TEMPLATE
// ─────────────────────────────────────────────
function buildAdminLeadHTML(data) {
  const servicesList = data.services && data.services.length > 0
    ? data.services.map(s => `
        <span style="display:inline-block;background:#fff3cd;color:#7c5a00;
          border:1px solid #f0d060;border-radius:20px;padding:4px 14px;
          font-size:13px;font-weight:600;margin:3px 4px 3px 0;">
          ${s}
        </span>`).join('')
    : `<span style="color:#94a3b8;font-size:13px;">Not specified</span>`;

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>New Lead – ${COMPANY_NAME}</title>
</head>
<body style="margin:0;padding:0;background:#f1f5f1;font-family:'Segoe UI',Arial,sans-serif;">

  <div style="display:none;max-height:0;overflow:hidden;color:#f1f5f1;">
    New inquiry from ${data.fullName}${data.company ? ` at ${data.company}` : ''} – Action required.
  </div>

  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f1f5f1;padding:40px 0;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;">

        <!-- HEADER -->
        <tr>
          <td style="background:linear-gradient(135deg,#0d1f0d 0%,${PRIMARY_COLOR} 100%);
            border-radius:16px 16px 0 0;padding:36px 48px;">
            <table width="100%" cellpadding="0" cellspacing="0">
              <tr>
                <td>
                  <img src="${LOGO_URL}" alt="${COMPANY_NAME}" height="48"
                    style="display:block;max-height:48px;object-fit:contain;" />
                </td>
                <td align="right">
                  <span style="display:inline-block;background:${GOLD_COLOR};color:#0d1f0d;
                    font-size:11px;font-weight:800;letter-spacing:0.1em;text-transform:uppercase;
                    padding:5px 14px;border-radius:20px;">
                    🔔 New Lead
                  </span>
                </td>
              </tr>
            </table>
            <h1 style="margin:20px 0 4px;color:#ffffff;font-size:24px;font-weight:700;">
              New Contact Form Submission
            </h1>
            <p style="margin:0;color:rgba(255,255,255,0.65);font-size:14px;">
              Received on ${data.submittedAt}
            </p>
          </td>
        </tr>

        <!-- GOLD DIVIDER -->
        <tr><td style="background:${GOLD_COLOR};height:4px;"></td></tr>

        <!-- BODY -->
        <tr>
          <td style="background:#ffffff;padding:40px 48px;">

            <!-- LEAD INFO CARD -->
            <table width="100%" cellpadding="0" cellspacing="0"
              style="background:#f8faf8;border:1px solid #e2ece2;
                border-radius:12px;margin-bottom:28px;overflow:hidden;">
              <tr>
                <td style="background:${PRIMARY_COLOR};padding:13px 24px;">
                  <p style="margin:0;color:#fff;font-size:12px;font-weight:700;
                    letter-spacing:0.12em;text-transform:uppercase;">Lead Details</p>
                </td>
              </tr>
              <tr>
                <td style="padding:24px;">
                  <table width="100%" cellpadding="0" cellspacing="0">
                    <tr>
                      <td width="36%" style="padding:10px 0;color:#94a3b8;font-size:12px;
                        font-weight:700;text-transform:uppercase;letter-spacing:0.07em;
                        vertical-align:top;">Full Name</td>
                      <td style="padding:10px 0;color:#1e293b;font-size:15px;
                        font-weight:700;vertical-align:top;">${data.fullName}</td>
                    </tr>
                    <tr>
                      <td style="padding:10px 0;color:#94a3b8;font-size:12px;
                        font-weight:700;text-transform:uppercase;letter-spacing:0.07em;
                        vertical-align:top;border-top:1px solid #e8f0e8;">Email</td>
                      <td style="padding:10px 0;vertical-align:top;
                        border-top:1px solid #e8f0e8;">
                        <a href="mailto:${data.email}"
                          style="color:${PRIMARY_COLOR};font-size:14px;font-weight:600;
                            text-decoration:none;">${data.email}</a>
                      </td>
                    </tr>
                    ${data.company ? `
                    <tr>
                      <td style="padding:10px 0;color:#94a3b8;font-size:12px;
                        font-weight:700;text-transform:uppercase;letter-spacing:0.07em;
                        vertical-align:top;border-top:1px solid #e8f0e8;">Company</td>
                      <td style="padding:10px 0;color:#1e293b;font-size:14px;
                        font-weight:600;vertical-align:top;
                        border-top:1px solid #e8f0e8;">${data.company}</td>
                    </tr>` : ''}
                    ${data.services && data.services.length > 0 ? `
                    <tr>
                      <td style="padding:10px 0;color:#94a3b8;font-size:12px;
                        font-weight:700;text-transform:uppercase;letter-spacing:0.07em;
                        vertical-align:top;border-top:1px solid #e8f0e8;">Services</td>
                      <td style="padding:10px 0;vertical-align:top;
                        border-top:1px solid #e8f0e8;">${servicesList}</td>
                    </tr>` : ''}
                    ${data.attachmentUrl ? `
                    <tr>
                      <td style="padding:10px 0;color:#94a3b8;font-size:12px;
                        font-weight:700;text-transform:uppercase;letter-spacing:0.07em;
                        vertical-align:top;border-top:1px solid #e8f0e8;">Attachment</td>
                      <td style="padding:10px 0;vertical-align:top;
                        border-top:1px solid #e8f0e8;">
                        <span style="color:#64748b;font-size:13px;">📎 File uploaded (view in admin panel)</span>
                      </td>
                    </tr>` : ''}
                    <tr>
                      <td style="padding:10px 0;color:#94a3b8;font-size:12px;
                        font-weight:700;text-transform:uppercase;letter-spacing:0.07em;
                        vertical-align:top;border-top:1px solid #e8f0e8;">Lead ID</td>
                      <td style="padding:10px 0;color:#94a3b8;font-size:12px;
                        font-family:monospace;vertical-align:top;
                        border-top:1px solid #e8f0e8;">${data.id}</td>
                    </tr>
                  </table>
                </td>
              </tr>
            </table>

            <!-- MESSAGE BOX -->
            <table width="100%" cellpadding="0" cellspacing="0"
              style="background:#fff8f0;border-left:4px solid ${GOLD_COLOR};
                border-radius:0 10px 10px 0;margin-bottom:28px;">
              <tr>
                <td style="padding:20px 24px;">
                  <p style="margin:0 0 8px;color:#94a3b8;font-size:11px;font-weight:700;
                    letter-spacing:0.1em;text-transform:uppercase;">Message</p>
                  <p style="margin:0;color:#1e293b;font-size:14px;line-height:1.8;
                    white-space:pre-wrap;">${data.message}</p>
                </td>
              </tr>
            </table>

            <!-- ACTION BUTTONS -->
            <table width="100%" cellpadding="0" cellspacing="0">
              <tr>
                <td style="padding-right:8px;" width="50%">
                  <a href="mailto:${data.email}?subject=Re: Your Inquiry to ${COMPANY_NAME}"
                    style="display:block;background:${PRIMARY_COLOR};color:#ffffff;
                      text-decoration:none;font-size:14px;font-weight:700;text-align:center;
                      padding:13px 20px;border-radius:10px;">
                    ✉️ Reply to Lead
                  </a>
                </td>
                <td style="padding-left:8px;" width="50%">
                  <a href="https://admin.westpalmcs.com/admin/queries"
                    style="display:block;background:#f8faf8;color:${PRIMARY_COLOR};
                      text-decoration:none;font-size:14px;font-weight:700;text-align:center;
                      padding:13px 20px;border-radius:10px;
                      border:2px solid ${PRIMARY_COLOR};">
                    📋 View in Dashboard
                  </a>
                </td>
              </tr>
            </table>

          </td>
        </tr>

        <!-- FOOTER -->
        <tr>
          <td style="background:#0d1f0d;border-radius:0 0 16px 16px;
            padding:24px 48px;text-align:center;">
            <p style="margin:0;color:rgba(255,255,255,0.35);font-size:11px;">
              © ${new Date().getFullYear()} ${COMPANY_NAME} – Internal Notification
            </p>
          </td>
        </tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

// ─────────────────────────────────────────────
// SEND BOTH EMAILS
// ─────────────────────────────────────────────
async function sendContactFormEmails(queryData) {
  if (!process.env.RESEND_API_KEY) {
    console.warn('⚠️  RESEND_API_KEY not set — skipping email send');
    return { success: true, skipped: true };
  }

  const submittedAt = new Date().toLocaleString('en-US', {
    timeZone: 'America/New_York',
    dateStyle: 'full',
    timeStyle: 'short'
  }) + ' ET';

  const emailData = {
    id: queryData.id,
    fullName: queryData.fullName,
    email: queryData.email,
    company: queryData.company || '',
    services: queryData.services || [],
    message: queryData.message,
    attachmentUrl: queryData.attachment || null,
    submittedAt
  };

  const results = await Promise.allSettled([
    // 1. Confirmation to the person who filled the form
    resend.emails.send({
      from: `${COMPANY_NAME} <${COMPANY_EMAIL}>`,
      to: [emailData.email],
      subject: `We received your inquiry – ${COMPANY_NAME}`,
      html: buildClientConfirmationHTML(emailData),
    }),

    // 2. Lead notification to both admin emails
    resend.emails.send({
      from: `${COMPANY_NAME} <${COMPANY_EMAIL}>`,
      to: ADMIN_EMAILS,
      subject: `🔔 New Lead: ${emailData.fullName}${emailData.company ? ` (${emailData.company})` : ''}`,
      html: buildAdminLeadHTML(emailData),
    })
  ]);

  const [clientResult, adminResult] = results;

  if (clientResult.status === 'rejected') {
    console.error('❌ Client confirmation email failed:', clientResult.reason);
  } else {
    console.log('✅ Client confirmation sent:', clientResult.value?.data?.id);
  }

  if (adminResult.status === 'rejected') {
    console.error('❌ Admin lead notification failed:', adminResult.reason);
  } else {
    console.log('✅ Admin lead notification sent:', adminResult.value?.data?.id);
  }

  return {
    success: true,
    clientEmail: clientResult.status === 'fulfilled',
    adminEmail: adminResult.status === 'fulfilled'
  };
}

module.exports = { sendContactFormEmails };
