// routes/reviewAction.route.js
import express from 'express'
import { protect, restrictTo } from '../middlewares/auth.middleware.js'
import { toggleHelpful, deleteReview, createReply, getAllReviewsAdmin } from '../controllers/review.controller.js'

const router = express.Router()

// GET /api/reviews — chỉ admin — danh sách toàn bộ đánh giá/bình luận
router.get('/', protect, restrictTo('admin'), getAllReviewsAdmin)

// POST /api/reviews/:reviewId/reply — yêu cầu đăng nhập
router.post('/:reviewId/reply', protect, createReply)

// PATCH /api/reviews/:reviewId/helpful
router.patch('/:reviewId/helpful', protect, toggleHelpful)

// DELETE /api/reviews/:reviewId
router.delete('/:reviewId', protect, deleteReview)

export default router