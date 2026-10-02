import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || "localhost",
    port: Number(process.env.SMTP_PORT) || 1025,
    secure: false,
})

export const sendVerificationOtp = async (email: string, otp: string): Promise<void> => {
    await transporter.sendMail({
        from:
            process.env.SMTP_FROM ||
            "PadosiPro <no-reply@padosipro.local>",

        to: email,

        subject: "Verify your PadosiPro email",

        text: `Your PadosiPro verification code is ${otp}. This code expires in 10 minutes.`,

        html: `
      <div style="font-family: Arial, sans-serif;">
        <h2>Verify your PadosiPro email</h2>

        <p>Your verification code is:</p>

        <h1 style="letter-spacing: 6px;">${otp}</h1>

        <p>This code expires in 10 minutes.</p>

        <p>If you did not create this account, you can ignore this email.</p>
      </div>
    `,
    })
}