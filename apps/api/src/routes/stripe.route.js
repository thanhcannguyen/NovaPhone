
import express from 'express'
import { handleStripeWebhook } from '../controllers/stripe.controller.js'

const router = express.Router()

// express.raw thay vì express.json — Stripe yêu cầu body ở dạng thô (chưa parse)
// để xác thực chữ ký, nếu bị parse JSON trước sẽ luôn báo "chữ ký không hợp lệ".
router.post('/webhook', express.raw({ type: 'application/json' }), handleStripeWebhook)

export default router