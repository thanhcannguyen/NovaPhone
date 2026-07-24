// packages/shared-types/index.js
//
// Các hằng số/enum dùng CHUNG giữa backend và frontend.
// Mục đích: tránh tình trạng lệch giá trị giữa 2 phía (vd trước đây Order model
// backend cho phép 4 phương thức thanh toán COD/BANKING/MOMO/VNPAY nhưng
// frontend Checkout chỉ hiển thị 2 — dễ gây nhầm lẫn khi mở rộng tính năng sau này).
//
// Cách dùng:
//   Backend:  import { ORDER_STATUS, PAYMENT_METHODS, SHIPPING } from '@phone-store/shared-types'
//   Frontend: import { ORDER_STATUS, PAYMENT_METHODS, SHIPPING } from '@phone-store/shared-types'

// Trạng thái đơn hàng — khớp với enum trong order.model.js
// Flow: pending → confirmed → shipping → delivered
//              ↘ cancelled (chỉ từ pending hoặc confirmed)
export const ORDER_STATUS = {
    PENDING: 'pending',
    CONFIRMED: 'confirmed',
    SHIPPING: 'shipping',
    DELIVERED: 'delivered',
    CANCELLED: 'cancelled',
}

export const ORDER_STATUS_VALUES = Object.values(ORDER_STATUS)

export const ORDER_STATUS_LABELS = {
    [ORDER_STATUS.PENDING]: 'Chờ xác nhận',
    [ORDER_STATUS.CONFIRMED]: 'Đã xác nhận',
    [ORDER_STATUS.SHIPPING]: 'Đang giao hàng',
    [ORDER_STATUS.DELIVERED]: 'Đã giao hàng',
    [ORDER_STATUS.CANCELLED]: 'Đã hủy',
}

// Phương thức thanh toán — khớp với enum trong order.model.js
// `enabled: true` = đã hỗ trợ thật sự (hiển thị ở Checkout)
// `enabled: false` = có trong DB schema nhưng CHƯA tích hợp cổng thanh toán,
//                    giữ lại để dễ bật lên khi tích hợp MoMo/VNPAY thật sau này.
export const PAYMENT_METHODS = [
    { value: 'COD', label: 'Thanh toán khi nhận hàng', enabled: true },
    { value: 'BANKING', label: 'Chuyển khoản ngân hàng', enabled: true },
    { value: 'MOMO', label: 'Ví MoMo', enabled: false },
    { value: 'VNPAY', label: 'VNPay', enabled: false },
]

export const PAYMENT_METHOD_VALUES = PAYMENT_METHODS.map(m => m.value)

// Quy tắc phí vận chuyển — PHẢI khớp với backend/src/services/order.service.js
// Frontend chỉ dùng để HIỂN THỊ ước tính trước khi đặt hàng;
// số tiền thật luôn được backend tính lại và lưu vào Order, không tin frontend gửi lên.
export const SHIPPING = {
    FREE_THRESHOLD: 500000,
    FEE: 30000,
}
