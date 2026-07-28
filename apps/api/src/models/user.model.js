
import mongoose from 'mongoose'

const userSchema = new mongoose.Schema({
    // Tên người dùng
    name: {
        type: String,
        required: true,
        trim: true
    },

    // Email để đăng nhập
    email: {
        type: String,
        required: true,     // bắt buộc phải có
        unique: true,       // không được trùng
        trim: true,         // xóa khoảng trắng đầu và cuối
        lowercase: true     // tự  chuyển thành chữ thường
    },

    // Mật khẩu đăng nhập đã hash
    password: {
        type: String,
        required: true,
        minLength: 6,       // tối thiểu 6 kí tự
        select: false       // mặc định không trả password khi query user
    },

    // Số điện thoại liên hệ giao hàng
    // Hướng mở rộng tương lai: xác minh số VN và kiểm tra còn hoạt động hay không
    phone: {
        type: String,
        trim: true,
    },

    // Địa chỉ mặc định của khách hàng
    address: {
        street: {
            type: String,
            trim: true
        },
        district: {
            type: String,
            trim: true
        },
        city: {
            type: String,
            trim: true
        }
    },

    // Phân quyền tài khoản
    role: {
        type: String,
        enum: ['user', 'admin'],
        default: 'user'             // mặc định là user
    },

    // Trạng thái tài khoản
    // true = được phép dùng / đăng nhập
    // false = bị vô hiệu hóa
    isActive: {
        type: Boolean,
        default: true
    },

    // Trạng thái xác minh email
    // false = user chưa verify email
    // true  = đã xác minh (được coi là tài khoản hợp lệ)
    isEmailVerified: {
        type: Boolean,
        default: false
    },

    // Mã OTP xác thực email — select: false để không tự trả về khi query user thông thường
    emailOTP: {
        type: String,
        select: false
    },
    emailOTPExpire: {
        type: Date,
        select: false
    },

}, {
    // Tự tạo createdAt và updatedAt
    timestamps: true
})

const User = mongoose.model("User", userSchema)

export default User