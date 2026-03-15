import { BrevoClient } from "@getbrevo/brevo";
import auditLogger from "../utils/auditLogger.js";

const appName = process.env.APP_NAME || "CodeSeed";
const senderEmail = process.env.BREVO_SENDER_EMAIL || "";
const apiKey = process.env.BREVO_API_KEY || "";

const brevoClient = new BrevoClient({ apiKey });

const buildBaseTemplate = (title, body) => `
  <div style="margin:0;padding:0;background:#f5f7fb;font-family:Arial,Helvetica,sans-serif;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="padding:24px 0;">
      <tr>
        <td align="center">
          <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px;background:#ffffff;border-radius:12px;padding:32px;border:1px solid #e8ecf3;">
            <tr>
              <td style="font-size:24px;font-weight:700;color:#111827;padding-bottom:16px;">${title}</td>
            </tr>
            <tr>
              <td style="font-size:15px;line-height:1.6;color:#374151;">${body}</td>
            </tr>
            <tr>
              <td style="padding-top:24px;font-size:12px;color:#6b7280;">
                This is an automated message from ${appName}. Please do not reply.
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </div>
`;

export const emailTemplates = {
  welcomeEmail: ({ username }) => ({
    subject: `Welcome to ${appName} 🚀`,
    html: buildBaseTemplate(
      `Welcome to ${appName} 🚀`,
      `<p>Hi ${username || "there"},</p>
       <p>Welcome to ${appName}! We’re excited to have you onboard.</p>
       <p>Your account is ready. Please verify your email to unlock all features.</p>`
    ),
  }),

  verifyOtpEmail: ({ username, otp }) => ({
    subject: `${appName} Email Verification OTP`,
    html: buildBaseTemplate(
      `${appName} Email Verification OTP`,
      `<p>Hi ${username || "there"},</p>
       <p>Use this OTP to verify your account:</p>
       <p style="font-size:28px;font-weight:700;letter-spacing:6px;color:#111827;margin:16px 0;">${otp}</p>
       <p>This OTP expires in 10 minutes.</p>`
    ),
  }),

  resetPasswordOtpEmail: ({ username, otp }) => ({
    subject: `${appName} Password Reset OTP`,
    html: buildBaseTemplate(
      `${appName} Password Reset OTP`,
      `<p>Hi ${username || "there"},</p>
       <p>We received a request to reset your password.</p>
       <p>Use this OTP to continue:</p>
       <p style="font-size:28px;font-weight:700;letter-spacing:6px;color:#111827;margin:16px 0;">${otp}</p>
       <p>This OTP expires in 10 minutes.</p>`
    ),
  }),

  passwordResetSuccessEmail: ({ username }) => ({
    subject: "Password reset successful",
    html: buildBaseTemplate(
      "Password reset successful",
      `<p>Hi ${username || "there"},</p>
       <p>Your password was changed successfully.</p>
       <p>If this wasn't you, please secure your account immediately.</p>`
    ),
  }),

  emailVerifiedSuccessEmail: ({ username }) => ({
    subject: "Email verified successfully",
    html: buildBaseTemplate(
      "Email verified successfully",
      `<p>Hi ${username || "there"},</p>
       <p>Your email has been verified. Your account is now fully active.</p>
       <p>Thanks for verifying your account.</p>`
    ),
  }),
};

export const sendEmail = async ({ to, subject, html }) => {
  if (!apiKey || !senderEmail) {
    console.warn("[Email] Brevo config missing. Set BREVO_API_KEY and BREVO_SENDER_EMAIL.");
    return false;
  }

  if (!to || !subject || !html) {
    console.warn("[Email] Missing required email fields: to, subject, html.");
    return false;
  }

  try {
    await brevoClient.transactionalEmails.sendTransacEmail({
      sender: { email: senderEmail, name: appName },
      to: [{ email: to }],
      subject,
      htmlContent: html,
    });

    return true;
  } catch (error) {
    console.error("[Email] Brevo transactional API failed:", error?.message || error);
    return false;
  }
};

export const sendEmailSafe = async ({
  to,
  subject,
  html,
  auditContext = {},
  auditAction = "email_send_failed",
}) => {
  try {
    const isSent = await sendEmail({ to, subject, html });

    if (!isSent) {
      try {
        auditLogger.logSecurityEvent(
          auditAction,
          auditContext.userId || null,
          auditContext.email || to || "unknown",
          "medium",
          {
            ...auditContext,
            to,
            subject,
            component: "brevo_transactional_email",
          }
        );
      } catch (auditError) {
        console.warn("[Email] audit log failed:", auditError?.message || auditError);
      }
    }

    return isSent;
  } catch (error) {
    console.error("[Email] sendEmailSafe unexpected error:", error?.message || error);

    try {
      auditLogger.logSecurityEvent(
        auditAction,
        auditContext.userId || null,
        auditContext.email || to || "unknown",
        "high",
        {
          ...auditContext,
          to,
          subject,
          component: "brevo_transactional_email",
          error: error?.message || "unknown error",
        }
      );
    } catch (auditError) {
      console.warn("[Email] audit log failed:", auditError?.message || auditError);
    }

    return false;
  }
};
