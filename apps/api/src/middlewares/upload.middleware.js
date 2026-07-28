
import multer from 'multer'
import path from 'path'
import fs from 'fs'

const UPLOAD_DIR = path.join(process.cwd(), 'uploads', 'avatars')

// Tự tạo thư mục nếu chưa tồn tại (tránh lỗi lúc chạy lần đầu trên máy mới/server mới)
if (!fs.existsSync(UPLOAD_DIR)) {
    fs.mkdirSync(UPLOAD_DIR, { recursive: true })
}

const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, UPLOAD_DIR),
    filename: (req, file, cb) => {
        // Đặt tên file duy nhất: <userId>-<thời điểm>.<đuôi file gốc>
        const ext = path.extname(file.originalname)
        cb(null, `${req.user._id}-${Date.now()}${ext}`)
    },
})

const fileFilter = (req, file, cb) => {
    if (!file.mimetype.startsWith('image/')) {
        return cb(new Error('Chỉ chấp nhận file ảnh'), false)
    }
    cb(null, true)
}

export const uploadAvatar = multer({
    storage,
    fileFilter,
    limits: { fileSize: 5 * 1024 * 1024 }, // giới hạn 5MB/ảnh
})