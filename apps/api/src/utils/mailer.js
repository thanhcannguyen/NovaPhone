// Gửi email qua Brevo API (HTTPS, cổng 443) thay vì Gmail SMTP (cổng 465/587).
//
// Lý do đổi: Render free tier chặn toàn bộ traffic outbound tới cổng SMTP kể từ
// 9/2025 (https://render.com/changelog/free-web-services-will-no-longer-allow-outbound-traffic-to-smtp-ports),
// khiến nodemailer + Gmail SMTP bị treo/timeout khi chạy trên Render. Brevo dùng
// REST API qua HTTPS nên không bị chặn.
//
// Yêu cầu: BREVO_API_KEY và BREVO_SENDER_EMAIL trong .env — sender phải được
// verify trong Brevo Dashboard (Senders, Domains & Dedicated IPs → Senders)
// trước khi dùng được, xem hướng dẫn kèm theo.

const BREVO_API_URL = 'https://api.brevo.com/v3/smtp/email'

export const sendOtpEmail = async (toEmail, otp) => {
    const res = await fetch(BREVO_API_URL, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'api-key': process.env.BREVO_API_KEY,
        },
        body: JSON.stringify({
            sender: { name: 'NovaPhone', email: process.env.BREVO_SENDER_EMAIL },
            to: [{ email: toEmail }],
            subject: 'Mã xác thực tài khoản NovaPhone',
            htmlContent: `
                <div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto;">
                    <h2 style="color: #0057FF;">Xác thực tài khoản NovaPhone</h2>
                    <p>Chào bạn, đây là mã xác thực đăng ký tài khoản của bạn:</p>
                    <div style="background: #F8F9FB; border: 1.5px solid #E5E7EB; border-radius: 10px; padding: 16px; text-align: center; margin: 16px 0;">
                        <span style="font-size: 28px; font-weight: 800; letter-spacing: 6px; color: #0A0A0A;">${otp}</span>
                    </div>
                    <p style="color: #6B7280; font-size: 14px;">Mã có hiệu lực trong <strong>10 phút</strong>. Nếu bạn không yêu cầu mã này, vui lòng bỏ qua email.</p>
                </div>
            `,
        }),
    })

    if (!res.ok) {
        const errText = await res.text()
        throw new Error(`Brevo API lỗi ${res.status}: ${errText}`)
    }
}