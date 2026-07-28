import express from 'express'
import { getProfile, getAllUsers, updateProfile, updateAvatar } from '../controllers/user.controller.js'
import { protect, restrictTo } from '../middlewares/auth.middleware.js'
import { uploadAvatar } from '../middlewares/upload.middleware.js'

const router = express.Router()

router.use(protect)

router.get('/', restrictTo('admin'), getAllUsers)
router.get('/profile', getProfile)
router.put('/profile', updateProfile)
router.put('/avatar', uploadAvatar.single('avatar'), updateAvatar)

export default router