
import jwt from 'jsonwebtoken'
import User from '../models/user.model.js'

// MIDDLEWARE 1 — Xác minh token
// Dùng cho mọi route cần đăng nhập
export const protect = async (req, res, next) => {
    try {
        // Bước 1 — Lấy token từ header
        // Client gửi lên dạng: Authorization: Bearer <token>
        const authHeader = req.headers.authorization

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({
                message: 'Không tìm thấy token, vui lòng đăng nhập',
            })
        }

        // "Bearer eyJhbGci..." → tách lấy phần token thôi
        const token = authHeader.split(' ')[1]

        // Bước 2 — Xác minh token có hợp lệ không
        // jwt.verify() tự kiểm tra chữ ký và hạn sử dụng
        // Nếu sai hoặc hết hạn → ném lỗi → rơi vào catch
        const decoded = jwt.verify(token, process.env.JWT_SECRET)
        // decoded = { id: "64f2a1...", role: "user", iat: ..., exp: ... }

        // Bước 3 — Tìm user từ id trong token
        // Kiểm tra user có còn tồn tại trong DB không
        // Tránh trường hợp token còn hạn nhưng user đã bị xóa
        const user = await User.findById(decoded.id)

        if (!user) {
            return res.status(401).json({
                message: 'Tài khoản không còn tồn tại',
            })
        }

        // Bước 4 — Kiểm tra tài khoản có bị khóa không
        if (!user.isActive) {
            return res.status(403).json({
                message: 'Tài khoản đã bị khóa',
            })
        }

        // Bước 5 — Gắn thông tin user vào req
        // Các controller phía sau dùng req.user để biết ai đang gọi
        req.user = user

        // Bước 6 — Chuyển sang bước tiếp theo
        // Không gọi next() → request bị treo mãi mãi
        next()

    } catch (error) {
        // jwt.verify() ném 2 loại lỗi phổ biến — cần phân biệt rõ
        if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({
                message: 'Token không hợp lệ',
            })
        }

        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({
                message: 'Token đã hết hạn, vui lòng đăng nhập lại',
            })
        }

        console.error('Lỗi middleware protect:', error)
        res.status(500).json({
            message: 'Lỗi server, vui lòng thử lại sau',
        })
    }
}

// MIDDLEWARE 2 — Phân quyền theo role
// Dùng sau protect — phải biết req.user trước mới check role được
export const restrictTo = (...roles) => {
    // (...roles) → nhận vào danh sách role được phép
    // Ví dụ: restrictTo('admin') hoặc restrictTo('admin', 'manager')

    return (req, res, next) => {
        if (!roles.includes(req.user.role)) {
            return res.status(403).json({
                message: 'Bạn không có quyền thực hiện hành động này',
            })
        }
        next()
    }
}