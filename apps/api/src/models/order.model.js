import mongoose from 'mongoose'
import { ORDER_STATUS, ORDER_STATUS_VALUES, PAYMENT_METHOD_VALUES } from '@novaphone/shared-types'

// Snapshot pattern — lưu thông tin SP tại thời điểm đặt
const orderItemSchema = new mongoose.Schema({
    product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
        required: true,
    },
    name: { type: String, required: true },
    price: { type: Number, required: true, min: 0 },
    image: { type: String, default: '' },
    quantity: { type: Number, required: true, min: 1 },
    // Snapshot specs để lịch sử đơn hàng không bị thay đổi
    specs: {
        brand: { type: String, default: '' },
        storage: { type: String, default: '' },
        ram: { type: String, default: '' },
    },
}, { _id: false })

const orderSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true,
    },
    items: {
        type: [orderItemSchema],
        required: true,
        validate: {
            validator: (items) => items.length > 0,
            message: 'Đơn hàng phải có ít nhất 1 sản phẩm',
        },
    },
    // Tổng tiền hàng — chưa gồm phí ship
    itemsTotal: {
        type: Number,
        required: true,
        min: 0,
    },
    // Phí vận chuyển tại thời điểm đặt hàng (miễn phí nếu itemsTotal >= 500.000đ)
    shippingFee: {
        type: Number,
        required: true,
        min: 0,
        default: 0,
    },
    // Tổng cộng cuối cùng = itemsTotal + shippingFee — số tiền khách thực trả
    totalAmount: {
        type: Number,
        required: true,
        min: 0,
    },
    // Flow: pending → confirmed → shipping → delivered
    //              ↘ cancelled (từ pending hoặc confirmed)
    status: {
        type: String,
        enum: ORDER_STATUS_VALUES,
        default: ORDER_STATUS.PENDING,
        index: true,
    },
    paymentMethod: {
        type: String,
        enum: PAYMENT_METHOD_VALUES,
        default: 'COD',
    },
    // Riêng cho thanh toán online (Stripe) — theo dõi đã thanh toán thành công chưa,
    // độc lập với `status` (trạng thái giao hàng). COD/Banking không dùng field này.
    paymentStatus: {
        type: String,
        enum: ['unpaid', 'paid'],
        default: 'unpaid',
    },
    stripeSessionId: { type: String, default: null },
    stripePaymentIntentId: { type: String, default: null },
    // Snapshot thông tin giao hàng
    shippingInfo: {
        fullName: { type: String, required: true },
        phone: { type: String, required: true },
        address: { type: String, required: true },
        city: { type: String, default: '' },
    },
    note: { type: String, default: '' },
}, {
    timestamps: true,
})

const Order = mongoose.model('Order', orderSchema)

export default Order
