
import Stripe from 'stripe'

// Khởi tạo "lười" — chỉ tạo instance Stripe khi thực sự cần dùng lần đầu,
// đảm bảo lúc đó .env đã chắc chắn được nạp đầy đủ, không phụ thuộc thứ tự import
// giữa các file (cùng nguyên nhân với lỗi "Missing credentials" ở mailer.js trước đây).
let stripe = null
const getStripe = () => {
    if (!stripe) stripe = new Stripe(process.env.STRIPE_SECRET_KEY)
    return stripe
}

const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:5173'

// Tạo phiên thanh toán Stripe Checkout (trang thanh toán do Stripe tự dựng sẵn)
// Lưu ý quan trọng: Stripe coi VND là "zero-decimal currency" — truyền thẳng số tiền
// VNĐ nguyên vẹn, KHÔNG nhân 100 như USD/EUR (vốn cần quy đổi ra cent).
export const createCheckoutSessionForOrder = async (order) => {
    const stripe = getStripe()
    const lineItems = order.items.map(item => ({
        price_data: {
            currency: 'vnd',
            product_data: { name: item.name },
            unit_amount: Math.round(item.price),
        },
        quantity: item.quantity,
    }))

    if (order.shippingFee > 0) {
        lineItems.push({
            price_data: {
                currency: 'vnd',
                product_data: { name: 'Phí vận chuyển' },
                unit_amount: Math.round(order.shippingFee),
            },
            quantity: 1,
        })
    }

    const session = await stripe.checkout.sessions.create({
        mode: 'payment',
        payment_method_types: ['card'],
        line_items: lineItems,
        metadata: { orderId: order._id.toString() },
        success_url: `${CLIENT_URL}/orders/${order._id}?payment=success`,
        cancel_url: `${CLIENT_URL}/checkout?payment=cancelled`,
    })

    return session
}

// Xác thực chữ ký webhook — đảm bảo request thật sự đến từ Stripe, không phải giả mạo
export const verifyStripeWebhook = (payload, signature) => {
    return getStripe().webhooks.constructEvent(payload, signature, process.env.STRIPE_WEBHOOK_SECRET)
}

// Tạo lại phiên thanh toán mới cho 1 đơn Stripe đã tồn tại nhưng chưa thanh toán —
// dùng khi khách thoát ngang trang Stripe lần trước, link cũ đã hết hạn (Stripe giới hạn 24h).
export const retryCheckoutSessionForOrder = async (order) => {
    return await createCheckoutSessionForOrder(order)
}