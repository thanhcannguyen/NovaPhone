// controllers/review.controller.js
import mongoose from 'mongoose'
import Review from '../models/review.model.js'
import Order from '../models/order.model.js'

// Đơn được coi là "đã mua" khi status là 'delivered' (đã xác nhận đúng theo Order model của bạn)
const COMPLETED_STATUSES = ['delivered']

async function findQualifyingOrder(userId, productId) {
    const order = await Order.findOne({
        user: userId,
        status: { $in: COMPLETED_STATUSES },
        'items.product': productId,
    }).select('_id')
    return order ? order._id : null
}

// GET /api/products/:productId/reviews?rating=5 — public
export const getProductReviews = async (req, res) => {
    try {
        const { productId } = req.params
        const { rating } = req.query

        const filter = { product: productId }
        if (rating) filter.rating = Number(rating)

        const reviews = await Review.find(filter).sort({ createdAt: -1 })

        const statsAgg = await Review.aggregate([
            { $match: { product: new mongoose.Types.ObjectId(productId), rating: { $ne: null } } },
            { $group: { _id: '$rating', count: { $sum: 1 } } },
        ])
        const counts = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 }
        let total = 0, sum = 0
        statsAgg.forEach(s => { counts[s._id] = s.count; total += s.count; sum += s._id * s.count })

        res.json({
            success: true,
            data: { reviews, stats: { total, avg: total ? sum / total : 0, counts } },
        })
    } catch (err) {
        res.status(500).json({ success: false, message: 'Lỗi tải đánh giá', error: err.message })
    }
}

// GET /api/products/:productId/reviews/can-review — yêu cầu đăng nhập
export const checkCanRate = async (req, res) => {
    try {
        const { productId } = req.params
        const qualifyingOrder = await findQualifyingOrder(req.user.id, productId) // ⚠️ đổi req.user.id nếu middleware auth gắn field khác (vd req.user._id)
        res.json({ success: true, data: { canRate: Boolean(qualifyingOrder) } })
    } catch (err) {
        res.status(500).json({ success: false, message: 'Lỗi kiểm tra quyền đánh giá', error: err.message })
    }
}

// POST /api/products/:productId/reviews — yêu cầu đăng nhập
export const createOrUpdateReview = async (req, res) => {
    try {
        const { productId } = req.params
        const userId = req.user.id // ⚠️ đổi theo field auth middleware của bạn (id hay _id)
        const userName = req.user.name || req.user.fullName || req.user.username || 'Người dùng' // ⚠️ đổi theo field tên trên payload JWT / User model

        const { rating, comment } = req.body
        if (!comment || !comment.trim()) {
            return res.status(400).json({ success: false, message: 'Vui lòng nhập nội dung đánh giá' })
        }

        const qualifyingOrder = await findQualifyingOrder(userId, productId)
        const verifiedPurchase = Boolean(qualifyingOrder)

        const review = await Review.findOneAndUpdate(
            { product: productId, user: userId },
            {
                product: productId,
                user: userId,
                name: userName,
                rating: verifiedPurchase ? (rating || null) : null,
                comment: comment.trim(),
                verifiedPurchase,
                order: qualifyingOrder,
            },
            { upsert: true, new: true, setDefaultsOnInsert: true }
        )

        res.json({ success: true, data: review })
    } catch (err) {
        res.status(500).json({ success: false, message: 'Lỗi gửi đánh giá', error: err.message })
    }
}

// PATCH /api/reviews/:reviewId/helpful — yêu cầu đăng nhập
export const toggleHelpful = async (req, res) => {
    try {
        const { reviewId } = req.params
        const userId = req.user.id
        const review = await Review.findById(reviewId)
        if (!review) return res.status(404).json({ success: false, message: 'Không tìm thấy đánh giá' })

        const idx = review.helpfulUsers.findIndex(u => u.toString() === userId)
        if (idx >= 0) review.helpfulUsers.splice(idx, 1)
        else review.helpfulUsers.push(userId)
        await review.save()

        res.json({ success: true, data: { helpfulCount: review.helpfulUsers.length, active: idx < 0 } })
    } catch (err) {
        res.status(500).json({ success: false, message: 'Lỗi cập nhật', error: err.message })
    }
}

// DELETE /api/reviews/:reviewId — chủ sở hữu hoặc admin
export const deleteReview = async (req, res) => {
    try {
        const { reviewId } = req.params
        const review = await Review.findById(reviewId)
        if (!review) return res.status(404).json({ success: false, message: 'Không tìm thấy đánh giá' })
        if (review.user.toString() !== req.user.id && req.user.role !== 'admin') {
            return res.status(403).json({ success: false, message: 'Không có quyền xoá đánh giá này' })
        }
        await review.deleteOne()
        res.json({ success: true })
    } catch (err) {
        res.status(500).json({ success: false, message: 'Lỗi xoá đánh giá', error: err.message })
    }
}