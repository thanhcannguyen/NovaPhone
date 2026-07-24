import express from 'express'
import { getProductsForAI } from '../controllers/ai.controller.js'

const router = express.Router()

router.get('/products', getProductsForAI)

export default router