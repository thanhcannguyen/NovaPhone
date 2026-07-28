import nodemailer from 'nodemailer'

// Tạo transporter "lười" (lazy) — chỉ khởi tạo khi thực sự cần gửi mail lần đầu,
// đảm bảo lúc đó process.env đã chắc chắn được .env nạp đầy đủ, không phụ thuộc
// vào thứ tự import giữa các file (nguồn gốc lỗi "Missing credentials" trước đó).
let transporter = null
const getTransporter = () => {
    if (!transporter) {
        transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.GMAIL_USER,
                pass: process.env.GMAIL_APP_PASSWORD,
            },
        })
    }
    return transporter
}

export const sendOtpEmail = async (toEmail, otp) => {
    await getTransporter().sendMail({
        from: `"NovaPhone" <${process.env.GMAIL_USER}>`,
        to: toEmail,
        subject: 'Mã xác thực tài khoản NovaPhone',
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto;">
                <h2 style="color: #0057FF;">Xác thực tài khoản NovaPhone</h2>
                <p>Chào bạn, đây là mã xác thực đăng ký tài khoản của bạn:</p>
                <div style="background: #F8F9FB; border: 1.5px solid #E5E7EB; border-radius: 10px; padding: 16px; text-align: center; margin: 16px 0;">
                    <span style="font-size: 28px; font-weight: 800; letter-spacing: 6px; color: #0A0A0A;">${otp}</span>
                </div>
                <p style="color: #6B7280; font-size: 14px;">Mã có hiệu lực trong <strong>10 phút</strong>. Nếu bạn không yêu cầu mã này, vui lòng bỏ qua email.</p>
            </div>
        `,
    })
}