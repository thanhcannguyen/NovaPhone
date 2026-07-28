import express from 'express'
import { register, login, verifyEmail, resendOtp } from '../controllers/auth.controller.js'

const router = express.Router()

router.post('/register', register)
router.post('/login', login)
router.post('/verify-email', verifyEmail)
router.post('/resend-otp', resendOtp)

export default router