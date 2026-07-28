
import { v2 as cloudinary } from 'cloudinary'
import { CloudinaryStorage } from 'multer-storage-cloudinary'
import multer from 'multer'

// Khởi tạo "lười" — cùng nguyên tắc đã áp dụng cho Gmail/Stripe trước đây,
// tránh lỗi thiếu credentials do thứ tự import chạy trước khi .env kịp nạp.
let configured = false
const ensureCloudinaryConfigured = () => {
    if (configured) return
    cloudinary.config({
        cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
        api_key: process.env.CLOUDINARY_API_KEY,
        api_secret: process.env.CLOUDINARY_API_SECRET,
    })
    configured = true
}

const storage = new CloudinaryStorage({
    cloudinary,
    params: async (req, file) => {
        // Cấu hình Cloudinary ngay tại đây (chạy mỗi khi có request upload thật),
        // không phải lúc module được import — đảm bảo .env đã chắc chắn nạp xong.
        ensureCloudinaryConfigured()
        return {
            folder: 'novaphone/avatars',
            public_id: `${req.user._id}`,
            allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
            transformation: [{ width: 500, height: 500, crop: 'fill', gravity: 'face' }],
        }
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
    limits: { fileSize: 5 * 1024 * 1024 },
})