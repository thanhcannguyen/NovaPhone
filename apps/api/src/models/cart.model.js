import mongoose from 'mongoose'

// Schema cho từng item bên trong giỏ hàng
// Tách ra để dễ đọc và tái sử dụng
const cartItemSchema = new mongoose.Schema({

    // Sản phẩm được thêm vào giỏ
    product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
        required: true,
    },

    // Số lượng — tối thiểu 1
    quantity: {
        type: Number,
        required: true,
        min: 1,
        default: 1,
    },

    // Giá tại thời điểm thêm vào giỏ
    // Lưu riêng vì giá product có thể thay đổi sau này
    // Khi tính totalAmount dùng price này, không dùng product.price
    price: {
        type: Number,
        required: true,
        min: 0,
    },

}, { _id: false })
// _id: false — mỗi item không cần _id riêng
// vì mình sẽ tìm item theo productId, không cần _id

const cartSchema = new mongoose.Schema({

    // Mỗi user chỉ có đúng 1 giỏ hàng
    // unique: true đảm bảo không tạo 2 cart cho cùng 1 user
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        unique: true,
    },

    // Danh sách sản phẩm trong giỏ
    // Mảng các cartItemSchema ở trên
    items: {
        type: [cartItemSchema],
        default: [],  // mặc định giỏ rỗng
    },

    // Tổng tiền toàn bộ giỏ hàng
    // = sum(item.price * item.quantity) của tất cả items
    // Cập nhật mỗi khi items thay đổi
    totalAmount: {
        type: Number,
        default: 0,
        min: 0,
    },

}, {
    timestamps: true,
})

const Cart = mongoose.model('Cart', cartSchema)

export default Cart