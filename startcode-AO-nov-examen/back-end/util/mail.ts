import nodemailer, { Transporter } from "nodemailer";

const transporter: Transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT),
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
    }
});

interface SendMailOptions {
    to: string;
    subject: string;
    html: string;
}

const sendMail = async ({ to, subject, html }: SendMailOptions) => {
    return transporter.sendMail({
        from: process.env.SMTP_SENDER as string,
        to,
        subject,
        html
    });
};

export { transporter, sendMail };