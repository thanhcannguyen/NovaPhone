// routes/reviewAction.route.js
import express from 'express'
import { protect } from '../middlewares/auth.middleware.js'
import { toggleHelpful, deleteReview } from '../controllers/review.controller.js'

const router = express.Router()

// PATCH /api/reviews/:reviewId/helpful
router.patch('/:reviewId/helpful', protect, toggleHelpful)

// DELETE /api/reviews/:reviewId
router.delete('/:reviewId', protect, deleteReview)

export default router