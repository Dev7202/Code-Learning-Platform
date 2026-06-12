export const passwordResetEmail = (resetUrl) => ({
    subject: 'Reset your DevPath password',
    html: `
        <div style="font-family:Arial,sans-serif;max-width:500px;margin:auto;">
            <h2>Password Reset Request</h2>
            <p>Click the button below to reset your password.</p>
            <a href="${resetUrl}"
               style="background:#4F46E5;color:white;padding:12px 24px;
                      border-radius:6px;text-decoration:none;display:inline-block;margin:16px 0;">
                Reset Password
            </a>
            <p style="color:#888;font-size:13px;">
                This link expires in 15 minutes. If you didn't request this, ignore this email.
            </p>
        </div>
    `,
});