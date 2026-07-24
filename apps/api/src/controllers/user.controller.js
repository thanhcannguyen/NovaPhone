

import User from '../models/user.model.js'


// CONTROLLER 1 — Lấy thông tin cá nhân
// GET /api/users/profile
// Ai cũng dùng được — miễn là đã đăng nhập
export const getProfile = async (req, res) => {
    try {
        // req.user đã được middleware protect gắn sẵn
        // không cần query DB lại — lấy thẳng ra dùng
        res.status(200).json({
            success: true,
            data: {
                id: req.user._id,
                name: req.user.name,
                email: req.user.email,
                phone: req.user.phone,
                address: req.user.address,
                role: req.user.role,
                isEmailVerified: req.user.isEmailVerified,
                createdAt: req.user.createdAt,
            },
        })
    } catch (error) {
        console.error('Lỗi getProfile:', error)
        res.status(500).json({ message: 'Lỗi server' })
    }
}


// CONTROLLER 2 — Lấy tất cả user
// GET /api/users
// Chỉ admin mới gọi được
export const getAllUsers = async (req, res) => {
    try {
        const users = await User.find()
        // User.find() không trả password vì select: false trong schema

        res.status(200).json({
            success: true,
            total: users.length,
            data: users,
        })
    } catch (error) {
        console.error('Lỗi getAllUsers:', error)
        res.status(500).json({ message: 'Lỗi server' })
    }
}


// CONTROLLER 3 — Cập nhật thông tin cá nhân
// PUT /api/users/profile
// Hướng mở rộng sau này
export const updateProfile = async (req, res) => {
    try {
        // Chỉ cho phép cập nhật những field an toàn
        // Không cho tự sửa role, isActive, password qua đây
        const { name, phone, address } = req.body

        const updatedUser = await User.findByIdAndUpdate(
            req.user._id,
            { name, phone, address },
            {
                new: true,  // trả về document sau khi update, không phải trước
                runValidators: true // chạy lại validate của schema khi update
            }
        )

        res.status(200).json({
            success: true,
            message: 'Cập nhật thông tin thành công',
            data: updatedUser,
        })
    } catch (error) {
        console.error('Lỗi updateProfile:', error)
        res.status(500).json({ message: 'Lỗi server' })
    }
}