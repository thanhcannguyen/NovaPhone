import User from '../models/user.model.js'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'

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

        // Tạo user, isEmailVerified = true luôn — bỏ qua bước OTP
        await User.create({
            name,
            email,
            password: hashedPassword,
            isEmailVerified: true,
        })

        res.status(201).json({
            success: true,
            message: 'Đăng ký thành công! Bạn có thể đăng nhập ngay.',
        })

    } catch (error) {
        return res.status(500).json({ message: 'Lỗi Server', error: error.message })
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