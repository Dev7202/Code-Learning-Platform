import sgMail from '@sendgrid/mail';
import dotenv from 'dotenv';
dotenv.config();

export const transporter = {
    sendMail: async (mailOptions) => {
        sgMail.setApiKey(process.env.SENDGRID_API_KEY);
        await sgMail.send(mailOptions);
    },
};

export const verifyEmailTransporter = async () => {
    sgMail.setApiKey(process.env.SENDGRID_API_KEY);
    console.log('SendGrid ready');
};