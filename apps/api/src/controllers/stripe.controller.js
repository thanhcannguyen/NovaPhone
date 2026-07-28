
import Order from '../models/order.model.js'
import { verifyStripeWebhook } from '../services/stripe.service.js'

// POST /api/stripe/webhook — Stripe gọi vào đây mỗi khi có sự kiện thanh toán
export const handleStripeWebhook = async (req, res) => {
    const signature = req.headers['stripe-signature']
    let event

    try {
        // req.body ở đây PHẢI là raw buffer (chưa parse JSON) — xem cấu hình route bên dưới
        event = verifyStripeWebhook(req.body, signature)
    } catch (err) {
        console.error('Webhook Stripe: chữ ký không hợp lệ —', err.message)
        return res.status(400).send(`Webhook Error: ${err.message}`)
    }

    if (event.type === 'checkout.session.completed') {
        const session = event.data.object
        const orderId = session.metadata?.orderId

        if (orderId) {
            await Order.findByIdAndUpdate(orderId, {
                paymentStatus: 'paid',
                stripePaymentIntentId: session.payment_intent,
            })
            console.log(`✅ Đơn hàng ${orderId} đã thanh toán qua Stripe`)
        }
    }

    res.json({ received: true })
}