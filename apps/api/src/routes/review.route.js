// routes/review.route.js
import express from 'express'
import { protect } from '../middlewares/auth.middleware.js'
import { getProductReviews, checkCanRate, createOrUpdateReview } from '../controllers/review.controller.js'

const router = express.Router({ mergeParams: true }) // mergeParams để đọc được :productId

// GET /api/products/:productId/reviews            — public
router.get('/', getProductReviews)

// GET /api/products/:productId/reviews/can-review  — yêu cầu đăng nhập
router.get('/can-review', protect, checkCanRate)

// POST /api/products/:productId/reviews            — yêu cầu đăng nhập
router.post('/', protect, createOrUpdateReview)

export default router