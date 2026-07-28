// models/review.model.js
import mongoose from 'mongoose'

const reviewSchema = new mongoose.Schema(
    {
        product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true, index: true },
        user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },

        // Snapshot tên người đánh giá tại thời điểm gửi
        name: { type: String, required: true },

        // Snapshot vai trò tại thời điểm gửi — dùng để hiện nhãn "Quản trị viên" trong UI
        role: { type: String, enum: ['user', 'admin'], default: 'user' },

        // null khi người viết CHƯA mua sản phẩm (và không phải admin) — chỉ có comment, không có sao
        rating: { type: Number, min: 1, max: 5, default: null },

        comment: { type: String, required: true, trim: true, maxlength: 1000 },

        verifiedPurchase: { type: Boolean, default: false },

        // Đơn hàng dùng để xác thực đã mua (nếu có)
        order: { type: mongoose.Schema.Types.ObjectId, ref: 'Order', default: null },

        // null = bình luận/đánh giá gốc. Có giá trị = đây là 1 câu TRẢ LỜI trỏ về bình luận GỐC (thread 1 cấp phẳng).
        parentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Review', default: null, index: true },

        // Tên người được nhắm đến khi trả lời 1 CÂU TRẢ LỜI khác trong cùng thread
        // Dùng để hiển thị nhãn "Trả lời @tên" ở phía frontend
        replyToName: { type: String, default: null },

        // Danh sách user đã bấm "Hữu ích"
        helpfulUsers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    },
    { timestamps: true }
)

// Mỗi user chỉ có 1 đánh giá/bình luận GỐC cho mỗi sản phẩm (gửi lại sẽ cập nhật thay vì tạo mới).
// Chỉ áp dụng cho bình luận gốc (parentId: null) — 1 user vẫn có thể trả lời nhiều lần trong các thread khác nhau.
reviewSchema.index(
    { product: 1, user: 1 },
    { unique: true, partialFilterExpression: { parentId: null } }
)

const Review = mongoose.model('Review', reviewSchema)

export default Review