
import express from "express";
import {
    getCart,
    addToCart,
    updateCartItem,
    removeCartItem,
    clearCart
} from "../controllers/cart.controller.js";
import { protect } from "../middlewares/auth.middleware.js";

const router = express.Router();

// GET /api/cart
// Lấy giỏ hàng của user đang đăng nhập
router.get("/", protect, getCart);

// POST /api/cart
// thêm sản phẩm vào giỏ hàng
router.post("/", protect, addToCart);

// PUT /api/productId
// cập nhật số lượng
router.put('/:productId', protect, updateCartItem)

// DELETE /api / productId
// xóa 1 item
router.delete('/:productId', protect, removeCartItem)


// DELETE /api/
// xóa hết giỏ hàng
router.delete('/', protect, clearCart)

export default router;