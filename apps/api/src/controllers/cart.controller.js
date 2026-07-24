
// import service xử lý logic giỏ hàng
import {
    getCartService,
    addToCartService,
    updateCartItemService,
    removeCartItemService,
    clearCartService
} from "../services/cart.service.js"

// controller xử lý request lấy xem giỏ hàng
export const getCart = async (req, res) => {
    try {
        // Bước 1 lấy userId từ req.user (được gán từ middleware auth)
        const userId = req.user._id

        // Bước 2 gọi service để lấy giỏ hàng của user
        const cart = await getCartService(userId)

        // Bước 3 trả response thành công về cho client
        return res.status(200).json({
            message: "Get cart successfully",
            cart
        })

    } catch (error) {
        return res.status(500).json({
            message: "Lỗi Server",
            error: error.message
        })
    }
}


// controller xử lý request thêm sản phẩm vào giỏ hàng
export const addToCart = async (req, res) => {
    try {
        // Bước 1 — Lấy dữ liệu từ body
        // quantity có thể là string → cần ép kiểu về number
        const { productId, quantity } = req.body

        // Ép quantity về số, nếu không có thì mặc định = 1
        const qty = Number(quantity) || 1

        // Bước 2 — Validate productId (bắt buộc)
        if (!productId) {
            return res.status(400).json({ message: 'Thiếu productId' })
        }

        // Bước 3 — Validate quantity
        // Không cho phép số lượng <= 0
        if (qty < 1) {
            return res.status(400).json({ message: 'Số lượng phải lớn hơn 0' })
        }
        // Chặn số thập phân như 3.5
        if (!Number.isInteger(qty)) {
            return res.status(400).json({
                message: 'Số lượng phải là số nguyên'
            })
        }

        // Bước 4 — Gọi service xử lý logic chính
        // Truyền userId từ middleware auth (req.user)
        const cart = await addToCartService(req.user._id, productId, qty)

        // Bước 5 — Trả response thành công
        res.status(200).json({
            success: true,
            data: cart
        })

    } catch (error) {
        // Bước 6 — Log lỗi để debug phía server
        console.error('Lỗi addToCart:', error)

        // Bước 7 — Trả lỗi về client
        // Ở version đơn giản: coi mọi lỗi là 400 (bad request)
        res.status(400).json({
            message: error.message
        })
    }
}


// CONTROLLER 3 — Cập nhật số lượng item
// PUT /api/cart/:productId
// Body: { quantity }

export const updateCartItem = async (req, res) => {
    try {
        // Bước 1 — Lấy productId từ URL params
        const { productId } = req.params

        // Bước 2 — Lấy quantity từ body
        const { quantity } = req.body

        // Bước 3 — Kiểm tra quantity có được gửi lên không
        if (quantity === undefined || quantity === null) {
            return res.status(400).json({
                message: 'Thiếu quantity'
            })
        }

        // Bước 4 — Ép quantity về number
        const qty = Number(quantity)

        // Bước 5 — Kiểm tra quantity có phải số hợp lệ không
        if (Number.isNaN(qty)) {
            return res.status(400).json({
                message: 'Quantity phải là số'
            })
        }

        // Bước 6 — Không cho phép số thập phân
        if (!Number.isInteger(qty)) {
            return res.status(400).json({
                message: 'Quantity phải là số nguyên'
            })
        }

        // Bước 7 — Gọi service xử lý logic chính
        // quantity <= 0 thì service sẽ xóa item khỏi giỏ
        const cart = await updateCartItemService(
            req.user._id,
            productId,
            qty
        )

        // Bước 8 — Trả response thành công
        return res.status(200).json({
            success: true,
            data: cart
        })

    } catch (error) {
        console.error('Lỗi updateCartItem:', error)
        const status = error.message.includes('không') ? 400 : 500
        return res.status(status).json({
            message: error.message
        })
    }
}



// CONTROLLER 4 — Xóa 1 item khỏi giỏ hàng
// DELETE /api/cart/:productId
// Mục đích:
// - Nhận request từ client để xóa 1 sản phẩm khỏi giỏ
// - Validate dữ liệu đầu vào (productId)
// - Gọi service xử lý logic chính
// - Trả kết quả về client
export const removeCartItem = async (req, res) => {
    try {
        // Bước 1 — Lấy productId từ URL params
        // Ví dụ: DELETE /api/cart/abc123
        const { productId } = req.params
        // Bước 2 — Validate productId (bắt buộc phải có)
        if (!productId) {
            return res.status(400).json({
                message: 'Thiếu productId'
            })
        }
        // Bước 3 — Gọi service xử lý logic xóa item
        // Truyền userId (từ middleware auth) + productId
        const cart = await removeCartItemService(
            req.user._id,
            productId
        )
        // Bước 4 — Trả response thành công
        return res.status(200).json({
            success: true,
            message: 'Xóa item khỏi giỏ hàng thành công',
            data: cart
        })
    } catch (error) {
        // Bước 5 — Log lỗi để debug phía server
        console.error('Lỗi removeCartItem:', error)
        // Bước 6 — Phân loại lỗi đơn giản
        // Nếu lỗi có chữ "không" → lỗi phía client (400)
        // Ngược lại → lỗi server (500)
        const status = error.message.includes('không') ? 400 : 500
        // Bước 7 — Trả lỗi về client
        return res.status(status).json({
            message: error.message
        })
    }
}



// CONTROLLER 5 — Xóa toàn bộ giỏ hàng
// DELETE /api/cart
// Mục đích:
// - Nhận request từ client để xóa toàn bộ giỏ hàng
// - Gọi service xử lý việc clear cart
// - Trả response thành công về client

export const clearCart = async (req, res) => {
    try {
        // Bước 1 — Gọi service để xóa toàn bộ giỏ hàng
        // req.user._id lấy từ middleware auth
        await clearCartService(req.user._id)

        // Bước 2 — Trả response thành công
        return res.status(200).json({
            success: true,
            message: 'Đã xóa toàn bộ giỏ hàng'
        })
    } catch (error) {
        // Bước 3 — Log lỗi để debug phía server
        console.error('Lỗi clearCart:', error)
        // Bước 4 — Trả lỗi server về client
        return res.status(500).json({
            message: 'Lỗi server'
        })
    }
}