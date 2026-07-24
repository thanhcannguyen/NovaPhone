// models/Review.js
// ⚠️ Nếu các model khác của bạn đặt tên kiểu 'order.model.js', 'product.model.js'
// thì đổi tên file này thành 'review.model.js' cho đồng bộ (không bắt buộc để chạy được).
import mongoose from 'mongoose'

const reviewSchema = new mongoose.Schema(
    {
        product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true, index: true },
        user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },

        // Snapshot tên người đánh giá tại thời điểm gửi
        name: { type: String, required: true },

        // null khi người đánh giá CHƯA mua sản phẩm — chỉ có comment, không có sao
        rating: { type: Number, min: 1, max: 5, default: null },

        comment: { type: String, required: true, trim: true, maxlength: 1000 },

        verifiedPurchase: { type: Boolean, default: false },

        // Đơn hàng dùng để xác thực đã mua (nếu có)
        order: { type: mongoose.Schema.Types.ObjectId, ref: 'Order', default: null },

        // Danh sách user đã bấm "Hữu ích"
        helpfulUsers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    },
    { timestamps: true }
)

// Mỗi user chỉ có 1 đánh giá / 1 sản phẩm — gửi lại sẽ cập nhật thay vì tạo bản ghi mới
reviewSchema.index({ product: 1, user: 1 }, { unique: true })

const Review = mongoose.model('Review', reviewSchema)

export default Review