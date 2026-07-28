// controllers/review.controller.js
import mongoose from 'mongoose'
import Review from '../models/review.model.js'
import Order from '../models/order.model.js'

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
// Trả về bình luận GỐC (parentId: null) kèm mảng "replies" (các câu trả lời của thread đó)
export const getProductReviews = async (req, res) => {
    try {
        const { productId } = req.params
        const { rating } = req.query

        const filter = { product: productId, parentId: null }
        if (rating) filter.rating = Number(rating)

        const topLevel = await Review.find(filter).sort({ createdAt: -1 }).lean()
        const topIds = topLevel.map(r => r._id)

        const replies = await Review.find({ parentId: { $in: topIds } }).sort({ createdAt: 1 }).lean()
        const repliesByParent = {}
        replies.forEach(r => {
            const key = r.parentId.toString()
            if (!repliesByParent[key]) repliesByParent[key] = []
            repliesByParent[key].push(r)
        })

        const reviews = topLevel.map(r => ({ ...r, replies: repliesByParent[r._id.toString()] || [] }))

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
// Admin luôn được đánh giá kèm sao, bất kể đã mua hay chưa
export const checkCanRate = async (req, res) => {
    try {
        const { productId } = req.params
        if (req.user.role === 'admin') {
            return res.json({ success: true, data: { canRate: true } })
        }
        const qualifyingOrder = await findQualifyingOrder(req.user.id, productId)
        res.json({ success: true, data: { canRate: Boolean(qualifyingOrder) } })
    } catch (err) {
        res.status(500).json({ success: false, message: 'Lỗi kiểm tra quyền đánh giá', error: err.message })
    }
}

// POST /api/products/:productId/reviews — yêu cầu đăng nhập
// Tạo/cập nhật bình luận GỐC. Admin luôn được kèm sao; user thường chỉ được kèm sao nếu đã mua (delivered).
export const createOrUpdateReview = async (req, res) => {
    try {
        const { productId } = req.params
        const userId = req.user.id
        const userName = req.user.name || 'Người dùng'
        const isAdmin = req.user.role === 'admin'

        const { rating, comment } = req.body
        if (!comment || !comment.trim()) {
            return res.status(400).json({ success: false, message: 'Vui lòng nhập nội dung đánh giá' })
        }

        const qualifyingOrder = isAdmin ? null : await findQualifyingOrder(userId, productId)
        const canRateNow = isAdmin || Boolean(qualifyingOrder)

        const review = await Review.findOneAndUpdate(
            { product: productId, user: userId, parentId: null },
            {
                product: productId,
                user: userId,
                name: userName,
                role: req.user.role,
                rating: canRateNow ? (rating || null) : null,
                comment: comment.trim(),
                verifiedPurchase: Boolean(qualifyingOrder),
                order: qualifyingOrder,
                parentId: null,
            },
            { upsert: true, new: true, setDefaultsOnInsert: true }
        )

        res.json({ success: true, data: review })
    } catch (err) {
        res.status(500).json({ success: false, message: 'Lỗi gửi đánh giá', error: err.message })
    }
}

// POST /api/reviews/:reviewId/reply — yêu cầu đăng nhập
// Trả lời 1 bình luận gốc — không có sao, không giới hạn theo đã mua hay chưa (ai đăng nhập cũng trả lời được)
export const createReply = async (req, res) => {
    try {
        const { reviewId } = req.params
        const { comment } = req.body
        if (!comment || !comment.trim()) {
            return res.status(400).json({ success: false, message: 'Vui lòng nhập nội dung trả lời' })
        }

        const target = await Review.findById(reviewId)
        if (!target) return res.status(404).json({ success: false, message: 'Không tìm thấy bình luận' })

        // Nếu đang trả lời 1 CÂU TRẢ LỜI khác (không phải bình luận gốc), gộp về chung thread gốc
        // để tránh lồng vô hạn cấp, nhưng vẫn ghi nhớ đang trả lời ai qua replyToName
        const rootParentId = target.parentId || target._id
        const replyToName = target.parentId ? target.name : null

        const reply = await Review.create({
            product: target.product,
            user: req.user.id,
            name: req.user.name || 'Người dùng',
            role: req.user.role,
            rating: null,
            comment: comment.trim(),
            verifiedPurchase: false,
            parentId: rootParentId,
            replyToName,
        })

        res.json({ success: true, data: reply })
    } catch (err) {
        res.status(500).json({ success: false, message: 'Lỗi gửi trả lời', error: err.message })
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
// Xóa kèm toàn bộ reply con nếu đây là bình luận gốc (tránh để lại reply "mồ côi")
export const deleteReview = async (req, res) => {
    try {
        const { reviewId } = req.params
        const review = await Review.findById(reviewId)
        if (!review) return res.status(404).json({ success: false, message: 'Không tìm thấy đánh giá' })
        if (review.user.toString() !== req.user.id && req.user.role !== 'admin') {
            return res.status(403).json({ success: false, message: 'Không có quyền xoá đánh giá này' })
        }

        if (!review.parentId) {
            await Review.deleteMany({ parentId: review._id })
        }
        await review.deleteOne()
        res.json({ success: true })
    } catch (err) {
        res.status(500).json({ success: false, message: 'Lỗi xoá đánh giá', error: err.message })
    }
}

// GET /api/reviews — chỉ admin — quản lý toàn bộ đánh giá/bình luận trong hệ thống
export const getAllReviewsAdmin = async (req, res) => {
    try {
        const reviews = await Review.find()
            .populate('product', 'name image')
            .populate('user', 'name email')
            .sort({ createdAt: -1 })
        res.json({ success: true, data: reviews })
    } catch (err) {
        res.status(500).json({ success: false, message: 'Lỗi tải danh sách đánh giá', error: err.message })
    }
}