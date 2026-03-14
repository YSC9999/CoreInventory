import nodemailer from "nodemailer";

// ─── In-memory OTP store ───────────────────────────────────────────────────
interface OTPEntry {
  otp: string;
  expiresAt: number; // unix ms
  role: string;      // role to assign when verified
  inviteCode: string;
}

const otpStore = new Map<string, OTPEntry>();

export function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString(); // 6-digit
}

export function storeOTP(email: string, otp: string, role: string, inviteCode: string) {
  otpStore.set(email.toLowerCase(), {
    otp,
    expiresAt: Date.now() + 10 * 60 * 1000, // 10 minutes
    role,
    inviteCode,
  });
}

export function verifyOTP(email: string, otp: string): { valid: boolean; role?: string; inviteCode?: string; error?: string } {
  const entry = otpStore.get(email.toLowerCase());
  if (!entry) return { valid: false, error: "No verification code found. Please request a new one." };
  if (Date.now() > entry.expiresAt) {
    otpStore.delete(email.toLowerCase());
    return { valid: false, error: "Verification code has expired. Please try again." };
  }
  if (entry.otp !== otp) return { valid: false, error: "Invalid verification code." };
  otpStore.delete(email.toLowerCase());
  return { valid: true, role: entry.role, inviteCode: entry.inviteCode };
}

// ─── Nodemailer transporter ────────────────────────────────────────────────
function getTransporter() {
  return nodemailer.createTransport({
    service: process.env.EMAIL_SERVICE || "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD,
    },
  });
}

// ─── Send verification email ───────────────────────────────────────────────
export async function sendVerificationEmail(to: string, otp: string, role: string): Promise<void> {
  const roleLabel = role === "MANAGER" ? "Inventory Manager" : "Warehouse Staff";
  const roleColor = role === "MANAGER" ? "#6366f1" : "#0ea5e9";

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
</head>
<body style="margin:0;padding:0;background:#0d0b26;font-family:'Segoe UI',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#0d0b26;padding:40px 0;">
    <tr>
      <td align="center">
        <table width="560" cellpadding="0" cellspacing="0" style="background:linear-gradient(135deg,#1a0f4e,#2d1272);border-radius:16px;overflow:hidden;border:1px solid rgba(99,102,241,0.3);">
          <!-- Header -->
          <tr>
            <td style="padding:32px 40px 24px;border-bottom:1px solid rgba(99,102,241,0.2);">
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td>
                    <div style="display:inline-flex;align-items:center;gap:10px;">
                      <span style="font-size:24px;font-weight:800;color:#fff;letter-spacing:-0.5px;">Core<span style="color:#a5b4fc;">Inv</span></span>
                    </div>
                  </td>
                  <td align="right">
                    <span style="display:inline-block;background:${roleColor}22;border:1px solid ${roleColor}55;color:${roleColor};padding:4px 12px;border-radius:20px;font-size:12px;font-weight:600;">${roleLabel}</span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <!-- Body -->
          <tr>
            <td style="padding:40px 40px 32px;">
              <h2 style="margin:0 0 8px;color:#fff;font-size:22px;font-weight:700;">Verify your email</h2>
              <p style="margin:0 0 28px;color:rgba(196,181,253,0.7);font-size:15px;">Use the code below to complete your CoreInventory account setup. This code expires in <strong style="color:#a5b4fc;">10 minutes</strong>.</p>

              <!-- OTP Box -->
              <div style="background:rgba(99,102,241,0.1);border:2px solid rgba(99,102,241,0.4);border-radius:12px;padding:28px;text-align:center;margin-bottom:28px;">
                <p style="margin:0 0 8px;color:rgba(196,181,253,0.6);font-size:12px;text-transform:uppercase;letter-spacing:2px;font-weight:600;">Verification Code</p>
                <span style="font-size:48px;font-weight:800;color:#fff;letter-spacing:12px;font-family:'Courier New',monospace;">${otp}</span>
              </div>

              <p style="margin:0;color:rgba(196,181,253,0.5);font-size:13px;">If you did not request this, you can safely ignore this email.</p>
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style="padding:20px 40px;border-top:1px solid rgba(99,102,241,0.2);">
              <p style="margin:0;color:rgba(196,181,253,0.4);font-size:12px;text-align:center;">CoreInventory · Inventory Management System</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

  const transporter = getTransporter();
  await transporter.sendMail({
    from: `"CoreInventory" <${process.env.EMAIL_USER}>`,
    to,
    subject: `Your CoreInventory verification code: ${otp}`,
    html,
    text: `Your CoreInventory verification code is: ${otp}\n\nThis code expires in 10 minutes.`,
  });
}
