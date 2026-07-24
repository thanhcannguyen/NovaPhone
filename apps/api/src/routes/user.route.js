
import express from 'express'
import { getProfile, getAllUsers, updateProfile } from '../controllers/user.controller.js'
import { protect, restrictTo } from '../middlewares/auth.middleware.js'

const router = express.Router()

// --- Tất cả route bên dưới đều cần đăng nhập ---
// Thay vì viết protect lặp đi lặp lại ở mỗi route
// dùng router.use(protect) — áp dụng cho toàn bộ file này
router.use(protect)

router.get('/', restrictTo('admin'), getAllUsers)        // chỉ admin
router.get('/profile', getProfile)                       // user thường
router.put('/profile', updateProfile)                    // user thường

export default router