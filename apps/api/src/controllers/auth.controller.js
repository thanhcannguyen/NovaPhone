import User from '../models/user.model.js'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { sendOtpEmail } from '../utils/mailer.js'

const OTP_EXPIRE_MINUTES = 10
const generateOtp = () => Math.floor(100000 + Math.random() * 900000).toString()

// POST /api/auth/register
export const register = async (req, res) => {
    try {
        const { name, email, password } = req.body

        if (!name || !email || !password) {
            return res.status(400).json({ message: 'Vui lòng nhập đầy đủ thông tin' })
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        if (!emailRegex.test(email)) {
            return res.status(400).json({ message: 'Email không đúng định dạng' })
        }

        if (password.length < 6) {
            return res.status(400).json({ message: 'Mật khẩu phải ít nhất 6 ký tự' })
        }

        const existEmail = await User.findOne({ email })
        if (existEmail) {
            return res.status(400).json({ message: 'Email đã tồn tại' })
        }

        const hashedPassword = await bcrypt.hash(password, 10)
        const otp = generateOtp()
        const otpExpire = new Date(Date.now() + OTP_EXPIRE_MINUTES * 60 * 1000)

        await User.create({
            name,
            email,
            password: hashedPassword,
            isEmailVerified: false,
            emailOTP: otp,
            emailOTPExpire: otpExpire,
        })

        // Không "await" việc gửi email ở đây — trả response cho user ngay lập tức,
        // để việc gửi email chạy nền phía sau. Nếu SMTP bị chặn/chậm (ví dụ do
        // nền tảng hosting chặn cổng SMTP), user sẽ không bị treo màn hình "Đang đăng ký..."
        sendOtpEmail(email, otp).catch((mailErr) => {
            console.error('Lỗi gửi email OTP:', mailErr)
        })

        res.status(201).json({
            success: true,
            message: 'Đăng ký thành công! Vui lòng kiểm tra email để lấy mã xác thực.',
            email,
        })

    } catch (error) {
        return res.status(500).json({ message: 'Lỗi Server', error: error.message })
    }
}

// POST /api/auth/verify-email
export const verifyEmail = async (req, res) => {
    try {
        const { email, otp } = req.body
        if (!email || !otp) {
            return res.status(400).json({ message: 'Vui lòng nhập đầy đủ email và mã xác thực' })
        }

        const user = await User.findOne({ email }).select('+emailOTP +emailOTPExpire')
        if (!user) {
            return res.status(404).json({ message: 'Không tìm thấy tài khoản với email này' })
        }
        if (user.isEmailVerified) {
            return res.status(400).json({ message: 'Email này đã được xác thực trước đó' })
        }
        if (!user.emailOTP || !user.emailOTPExpire || user.emailOTPExpire < new Date()) {
            return res.status(400).json({ message: 'Mã xác thực đã hết hạn, vui lòng bấm gửi lại mã' })
        }
        if (user.emailOTP !== otp.trim()) {
            return res.status(400).json({ message: 'Mã xác thực không đúng' })
        }

        user.isEmailVerified = true
        user.emailOTP = undefined
        user.emailOTPExpire = undefined
        await user.save()

        res.status(200).json({ success: true, message: 'Xác thực email thành công! Bạn có thể đăng nhập.' })
    } catch (error) {
        res.status(500).json({ message: 'Lỗi Server' })
    }
}

// POST /api/auth/resend-otp
export const resendOtp = async (req, res) => {
    try {
        const { email } = req.body
        if (!email) {
            return res.status(400).json({ message: 'Vui lòng nhập email' })
        }

        const user = await User.findOne({ email })
        if (!user) {
            return res.status(404).json({ message: 'Không tìm thấy tài khoản với email này' })
        }
        if (user.isEmailVerified) {
            return res.status(400).json({ message: 'Email này đã được xác thực trước đó' })
        }

        const otp = generateOtp()
        user.emailOTP = otp
        user.emailOTPExpire = new Date(Date.now() + OTP_EXPIRE_MINUTES * 60 * 1000)
        await user.save()

        // Không chặn response khi gửi lại mã — cùng lý do như ở register()
        sendOtpEmail(email, otp).catch((mailErr) => {
            console.error('Lỗi gửi lại email OTP:', mailErr)
        })

        res.status(200).json({ success: true, message: 'Đã gửi lại mã xác thực, vui lòng kiểm tra email' })
    } catch (error) {
        console.error('Lỗi gửi lại OTP:', error)
        res.status(500).json({ message: 'Không thể gửi lại mã, vui lòng thử lại sau' })
    }
}

// POST /api/auth/login
export const login = async (req, res) => {
    try {
        const { email, password } = req.body

        if (!email || !password) {
            return res.status(400).json({ message: 'Vui lòng nhập email và mật khẩu' })
        }

        const user = await User.findOne({ email }).select('+password')
        if (!user) {
            return res.status(404).json({ message: 'Email không tồn tại' })
        }

        if (!user.isActive) {
            return res.status(403).json({ message: 'Tài khoản đã bị khóa' })
        }

        const isMatch = await bcrypt.compare(password, user.password)
        if (!isMatch) {
            return res.status(401).json({ message: 'Mật khẩu không chính xác' })
        }

        if (!user.isEmailVerified) {
            return res.status(403).json({
                message: 'Vui lòng xác thực email trước khi đăng nhập',
                emailNotVerified: true,
                email: user.email,
            })
        }

        const token = jwt.sign(
            { id: user._id, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: '7d' }
        )

        res.status(200).json({
            success: true,
            message: 'Đăng nhập thành công',
            token,
            data: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
            },
        })

    } catch (error) {
        res.status(500).json({ message: 'Lỗi Server' })
    }
}