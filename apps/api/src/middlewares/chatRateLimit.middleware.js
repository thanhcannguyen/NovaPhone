
import rateLimit from 'express-rate-limit'

// Giới hạn tần suất gọi chatbot — vì /api/chat không yêu cầu đăng nhập (cho khách vãng lai
// dùng được), cần chặn spam theo địa chỉ IP để tránh bị lạm dụng tốn quota Gemini API thật.
export const chatRateLimit = rateLimit({
    windowMs: 60 * 1000, // 1 phút
    max: 10, // tối đa 10 tin nhắn/phút cho mỗi IP — đủ dùng bình thường, chặn được spam tự động
    standardHeaders: true, // trả về header RateLimit-* chuẩn để frontend có thể đọc nếu cần
    legacyHeaders: false,
    message: {
        success: false,
        message: 'Bạn đang gửi tin nhắn quá nhanh, vui lòng đợi 1 chút rồi thử lại.',
    },
})