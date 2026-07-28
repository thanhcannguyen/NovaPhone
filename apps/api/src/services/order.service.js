import Order from '../models/order.model.js'
import Cart from '../models/cart.model.js'
import Product from '../models/product.model.js'
import { SHIPPING, ORDER_STATUS, ORDER_STATUS_VALUES } from '@novaphone/shared-types'

// Quy tắc phí vận chuyển — tính ở BACKEND, không tin số liệu frontend gửi lên
// Ngưỡng/mức phí lấy từ package dùng chung để luôn khớp với những gì frontend hiển thị
const calcShippingFee = (itemsTotal) =>
    itemsTotal >= SHIPPING.FREE_THRESHOLD ? 0 : SHIPPING.FEE

export const createOrderService = async (userId, orderData) => {
    const { paymentMethod, shippingInfo, note } = orderData

    const cart = await Cart.findOne({ user: userId }).populate({
        path: 'items.product',
        select: 'name price image isAvailable specs stock',
    })

    if (!cart) throw new Error('Giỏ hàng không tồn tại')
    if (!cart.items || cart.items.length === 0) throw new Error('Giỏ hàng đang trống')

    const unavailable = cart.items.filter(item => !item.product?.isAvailable)
    if (unavailable.length > 0) {
        const names = unavailable.map(i => i.product?.name).join(', ')
        throw new Error(`Sản phẩm không còn bán: ${names}`)
    }

    // Kiểm tra tồn kho trước khi đặt
    const outOfStock = cart.items.filter(item => (item.product?.stock ?? 0) < item.quantity)
    if (outOfStock.length > 0) {
        const names = outOfStock.map(i => `${i.product?.name} (còn ${i.product?.stock})`).join(', ')
        throw new Error(`Sản phẩm không đủ số lượng: ${names}`)
    }

    // Snapshot pattern — lưu thông tin SP + specs tại thời điểm đặt
    const orderItems = cart.items.map(item => ({
        product: item.product._id,
        name: item.product.name,
        price: item.price,
        image: item.product.image,
        quantity: item.quantity,
        specs: {
            brand: item.product.specs?.brand || '',
            storage: item.product.specs?.storage || '',
            ram: item.product.specs?.ram || '',
        },
    }))

    const itemsTotal = orderItems.reduce((sum, item) => sum + item.price * item.quantity, 0)
    const shippingFee = calcShippingFee(itemsTotal)
    const totalAmount = itemsTotal + shippingFee

    // ── Trừ stock một cách atomic (an toàn khi nhiều người đặt hàng cùng lúc) ──
    // Điều kiện $gte đảm bảo không bao giờ trừ xuống âm dù có 2 request chạy song song.
    const stockResults = await Promise.all(
        cart.items.map(item =>
            Product.findOneAndUpdate(
                { _id: item.product._id, stock: { $gte: item.quantity } },
                { $inc: { stock: -item.quantity } },
                { new: true }
            )
        )
    )

    const soldOutIndex = stockResults.findIndex(r => r === null)
    if (soldOutIndex !== -1) {
        // Rollback những sản phẩm đã trừ thành công trước đó trong cùng đơn
        await Promise.all(
            stockResults.map((r, idx) =>
                r ? Product.findByIdAndUpdate(r._id, { $inc: { stock: cart.items[idx].quantity } }) : null
            )
        )
        throw new Error(`Sản phẩm "${cart.items[soldOutIndex].product.name}" vừa hết hàng, vui lòng cập nhật lại giỏ hàng`)
    }

    const order = await Order.create({
        user: userId,
        items: orderItems,
        itemsTotal,
        shippingFee,
        totalAmount,
        paymentMethod: paymentMethod || 'COD',
        shippingInfo,
        note: note || '',
    })

    // Xóa giỏ hàng
    cart.items = []
    cart.totalAmount = 0
    await cart.save()

    return order
}

export const getMyOrdersService = async (userId) => {
    return await Order.find({ user: userId }).sort({ createdAt: -1 }).select('-__v')
}

export const getOrderByIdService = async (orderId, user) => {
    const order = await Order.findById(orderId).populate('user', 'name email phone').select('-__v')

    if (!order) throw new Error('Không tìm thấy đơn hàng')

    if (user.role !== 'admin') {
        if (order.user._id.toString() !== user._id.toString()) {
            throw new Error('Bạn không có quyền xem đơn hàng này')
        }
    }

    return order
}

export const getAllOrdersService = async () => {
    return await Order.find()
        .populate('user', 'name email phone')
        .sort({ createdAt: -1 })
        .select('-__v')
}

export const updateOrderStatusService = async (orderId, status) => {
    if (!ORDER_STATUS_VALUES.includes(status)) {
        throw new Error(`Trạng thái không hợp lệ. Chỉ chấp nhận: ${ORDER_STATUS_VALUES.join(', ')}`)
    }

    const order = await Order.findById(orderId)
    if (!order) throw new Error('Không tìm thấy đơn hàng')

    if (order.status === ORDER_STATUS.DELIVERED) throw new Error('Không thể cập nhật đơn hàng đã giao')

    // Chặn cứng ở backend (không chỉ ẩn nút ở frontend) — đơn Stripe chưa thanh toán
    // không được phép tiến đến bất kỳ trạng thái xử lý nào, trừ huỷ đơn.
    const isUnpaidStripe = order.paymentMethod === 'STRIPE' && order.paymentStatus !== 'paid'
    if (isUnpaidStripe && status !== ORDER_STATUS.CANCELLED) {
        throw new Error('Đơn hàng thanh toán qua Stripe chưa nhận được tiền, không thể xác nhận/giao hàng')
    }

    // Chỉ cho phép 1 ngoại lệ khi đơn đã huỷ: khôi phục lại về "Chờ xác nhận"
    // (trường hợp admin bấm huỷ nhầm). Không cho chuyển sang bất kỳ trạng thái nào khác từ cancelled.
    if (order.status === ORDER_STATUS.CANCELLED && status !== ORDER_STATUS.PENDING) {
        throw new Error('Đơn đã huỷ chỉ có thể khôi phục về trạng thái Chờ xác nhận')
    }

    // Nếu huỷ đơn → hoàn lại stock
    if (status === ORDER_STATUS.CANCELLED && order.status !== ORDER_STATUS.CANCELLED) {
        await Promise.all(
            order.items.map(item =>
                Product.findByIdAndUpdate(
                    item.product,
                    { $inc: { stock: item.quantity } },
                    { new: true }
                )
            )
        )
    }

    // Nếu khôi phục đơn đã huỷ → trừ lại stock, atomic + rollback giống lúc tạo đơn,
    // vì trong lúc đơn bị huỷ, sản phẩm có thể đã được người khác mua mất.
    if (order.status === ORDER_STATUS.CANCELLED && status === ORDER_STATUS.PENDING) {
        const stockResults = await Promise.all(
            order.items.map(item =>
                Product.findOneAndUpdate(
                    { _id: item.product, stock: { $gte: item.quantity } },
                    { $inc: { stock: -item.quantity } },
                    { new: true }
                )
            )
        )

        const soldOutIndex = stockResults.findIndex(r => r === null)
        if (soldOutIndex !== -1) {
            // Rollback những sản phẩm đã trừ thành công trước đó
            await Promise.all(
                stockResults.map((r, idx) =>
                    r ? Product.findByIdAndUpdate(r._id, { $inc: { stock: order.items[idx].quantity } }) : null
                )
            )
            throw new Error(`Không thể khôi phục: sản phẩm "${order.items[soldOutIndex].name}" hiện không đủ tồn kho`)
        }
    }

    order.status = status
    await order.save()
    return order
}


export const retryPaymentService = async (orderId, userId) => {
    const order = await Order.findById(orderId)
    if (!order) throw new Error('Không tìm thấy đơn hàng')
    if (order.user.toString() !== userId.toString()) throw new Error('Bạn không có quyền thao tác đơn hàng này')
    if (order.paymentMethod !== 'STRIPE') throw new Error('Đơn hàng này không thanh toán qua Stripe')
    if (order.paymentStatus === 'paid') throw new Error('Đơn hàng đã được thanh toán')
    if (order.status === 'cancelled') throw new Error('Đơn hàng đã bị huỷ, không thể thanh toán lại')

    return order
}