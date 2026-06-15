export const buildResetPasswordUrl = token =>
    `${process.env.FRONTEND_URL}/reset-password?token=${token}`;