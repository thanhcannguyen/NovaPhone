
import {
    createOrderService,
    getMyOrdersService,
    getOrderByIdService,
    getAllOrdersService,
    updateOrderStatusService,
    retryPaymentService,
} from '../services/order.service.js'
import { createCheckoutSessionForOrder, retryCheckoutSessionForOrder } from '../services/stripe.service.js'

// ================================================================
// CONTROLLER 1 — Tạo đơn hàng
// POST /api/orders
// ================================================================
export const createOrder = async (req, res) => {
    try {
        const { paymentMethod, shippingInfo, note } = req.body

        // Validate shippingInfo bắt buộc
        if (!shippingInfo?.fullName || !shippingInfo?.phone || !shippingInfo?.address) {
            return res.status(400).json({
                message: 'Vui lòng điền đầy đủ thông tin giao hàng (họ tên, SĐT, địa chỉ)',
            })
        }

        const order = await createOrderService(req.user._id, { paymentMethod, shippingInfo, note })

        // Nếu thanh toán qua Stripe, tạo phiên thanh toán ngay và trả link để frontend chuyển hướng.
        // Đơn hàng vẫn được tạo trước (status: pending, paymentStatus: unpaid) — webhook sẽ cập nhật
        // paymentStatus thành 'paid' sau khi khách thanh toán thành công trên trang Stripe.
        let checkoutUrl = null
        if (paymentMethod === 'STRIPE') {
            const session = await createCheckoutSessionForOrder(order)
            order.stripeSessionId = session.id
            await order.save()
            checkoutUrl = session.url
        }

        res.status(201).json({
            success: true,
            message: 'Đặt hàng thành công',
            data: order,
            checkoutUrl,
        })

    } catch (error) {
        console.error('Lỗi createOrder:', error)
        const status = error.message.includes('không') || error.message.includes('trống') ? 400 : 500
        res.status(status).json({ message: error.message })
    }
}

// ================================================================
// CONTROLLER 2 — Lấy đơn hàng của chính mình
// GET /api/orders/my
// ================================================================
export const getMyOrders = async (req, res) => {
    try {
        const orders = await getMyOrdersService(req.user._id)

        res.status(200).json({
            success: true,
            total: orders.length,
            data: orders,
        })

    } catch (error) {
        console.error('Lỗi getMyOrders:', error)
        res.status(500).json({ message: 'Lỗi server' })
    }
}

// ================================================================
// CONTROLLER 3 — Lấy chi tiết đơn hàng
// GET /api/orders/:id
// ================================================================
export const getOrderById = async (req, res) => {
    try {
        const order = await getOrderByIdService(req.params.id, req.user)

        res.status(200).json({
            success: true,
            data: order,
        })

    } catch (error) {
        console.error('Lỗi getOrderById:', error)
        const status = error.message.includes('quyền') ? 403
            : error.message.includes('tìm thấy') ? 404 : 500
        res.status(status).json({ message: error.message })
    }
}

// ================================================================
// CONTROLLER 4 — Admin lấy tất cả đơn hàng
// GET /api/orders
// ================================================================
export const getAllOrders = async (req, res) => {
    try {
        const orders = await getAllOrdersService()

        res.status(200).json({
            success: true,
            total: orders.length,
            data: orders,
        })

    } catch (error) {
        console.error('Lỗi getAllOrders:', error)
        res.status(500).json({ message: 'Lỗi server' })
    }
}

// ================================================================
// CONTROLLER 5 — Admin cập nhật trạng thái đơn hàng
// PUT /api/orders/:id/status
// ================================================================
export const updateOrderStatus = async (req, res) => {
    try {
        const { status } = req.body

        if (!status) {
            return res.status(400).json({ message: 'Vui lòng cung cấp trạng thái mới' })
        }

        const order = await updateOrderStatusService(req.params.id, status)

        res.status(200).json({
            success: true,
            message: 'Cập nhật trạng thái thành công',
            data: order,
        })

    } catch (error) {
        console.error('Lỗi updateOrderStatus:', error)
        const status = error.message.includes('tìm thấy') ? 404
            : error.message.includes('hợp lệ') || error.message.includes('thể') ? 400 : 500
        res.status(status).json({ message: error.message })
    }
}


// ================================================================
// CONTROLLER 6 — Tạo lại phiên thanh toán Stripe cho đơn chưa trả tiền
// POST /api/orders/:id/retry-payment
// ================================================================
export const retryPayment = async (req, res) => {
    try {
        const order = await retryPaymentService(req.params.id, req.user._id)
        const session = await retryCheckoutSessionForOrder(order)
        order.stripeSessionId = session.id
        await order.save()

        res.status(200).json({ success: true, checkoutUrl: session.url })
    } catch (error) {
        console.error('Lỗi retryPayment:', error)
        const status = error.message.includes('quyền') ? 403
            : error.message.includes('tìm thấy') ? 404 : 400
        res.status(status).json({ message: error.message })
    }
}