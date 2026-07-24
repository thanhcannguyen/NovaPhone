
import Cart from "../models/cart.model.js"
import Product from "../models/product.model.js"



// Helper — tính lại totalAmount sau mỗi thay đổi
// Tách ra helper để không lặp code ở mọi service
const calcTotal = (items) =>
    items.reduce((sum, item) => sum + item.price * item.quantity, 0)

// Populate config dùng chung
// Chỉ khai báo 1 lần, dùng ở mọi nơi cần populate
const populateConfig = {
    path: 'items.product',
    select: 'name price image category isAvailable',
}


// hàm lấy giỏ hàng (cart)
export const getCartService = async (userId) => {
    // tìm giỏ hàng (cart) theo userId và populate thông tin product
    const cart = await Cart.findOne({ user: userId }).populate({
        path: "items.product",                  // đường dẫn tới product trong items
        select: "name price image category"     // chỉ lấy các field cần thiết
    })

    // Nếu chưa có giỏ hàng thì trả về giỏ hàng rỗng
    if (!cart) {
        return {
            user: userId,
            items: [],
            totalAmount: 0
        }
    }
    // Nếu có thì trả về giỏ hàng
    return cart
}



// Thêm sản phẩm vào giỏ hàng
export const addToCartService = async (userId, productId, quantity = 1) => {
    // 1. Tìm sản phẩm
    const product = await Product.findById(productId)
    // 2. Nếu không có hoặc ngừng bán → báo lỗi
    if (!product) {
        throw new Error('Sản phẩm này không tồn tại')
    }
    if (!product.isAvailable) {
        throw new Error('Sản phẩm này không có sẵn')
    }

    // 3. Tìm giỏ hàng của user
    let cart = await Cart.findOne({ user: userId })

    // 4. Nếu chưa có → tạo giỏ hàng
    if (!cart) {
        cart = await Cart.create({
            user: userId,
            items: [],
            totalAmount: 0
        })
    }
    // 5. Xem sản phẩm đã có trong giỏ chưa
    const existingItem = cart.items.find(
        item => item.product.toString() === productId.toString()
    )

    // Kiểm tra tồn kho — không cho thêm vượt quá số lượng còn lại
    const requestedQty = (existingItem?.quantity || 0) + quantity
    if (requestedQty > product.stock) {
        throw new Error(`Sản phẩm chỉ còn ${product.stock} trong kho`)
    }

    // 6. Có rồi → cộng số lượng
    if (existingItem) {
        existingItem.quantity += quantity
    } else {
        // 7. Chưa có → thêm mới
        cart.items.push({
            product: productId,
            quantity: quantity,
            price: product.price,
        })
    }

    // 8. Tính lại tổng tiền
    cart.totalAmount = calcTotal(cart.items)
    // 9. Lưu DB
    await cart.save()
    // 10. Trả cart sau khi populate
    return await cart.populate(populateConfig)

}



// cập nhật số lượng item trong giỏ hàng
export const updateCartItemService = async (userId, productId, quantity) => {
    // 1. Tìm giỏ hàng của user
    const cart = await Cart.findOne({ user: userId })
    // Nếu không có giỏ hàng thì báo lỗi
    if (!cart) {
        throw new Error('Giỏ hàng không tồn tại')
    }
    // 2. Tìm item trong giỏ bằng productId
    const itemIndex = cart.items.findIndex(
        item => item.product.toString() === productId.toString()
    )
    // Bug cũ: nếu không tìm thấy item (itemIndex === -1), splice(-1, 1) sẽ
    // xóa NHẦM phần tử cuối cùng của mảng, và gán quantity sẽ crash (undefined).
    if (itemIndex === -1) {
        throw new Error('Sản phẩm không có trong giỏ hàng')
    }
    // 3. Nếu quantity <= 0 thì xóa item
    if (quantity <= 0) {
        // Số lượng về 0 → xóa item luôn
        cart.items.splice(itemIndex, 1)
    } else {
        // 4. Nếu quantity > 0 thì kiểm tra tồn kho rồi cập nhật
        const product = await Product.findById(productId).select('stock')
        if (product && quantity > product.stock) {
            throw new Error(`Sản phẩm chỉ còn ${product.stock} trong kho`)
        }
        cart.items[itemIndex].quantity = quantity
    }
    // 5. Tính lại tổng tiền
    cart.totalAmount = calcTotal(cart.items)
    // 6. Lưu DB
    await cart.save()
    // 7. Trả cart đã populate
    return await cart.populate(populateConfig)
}


// Xóa 1 item khỏi giỏ hàng
// Mục đích:
// - Xóa một sản phẩm cụ thể khỏi giỏ hàng của user
// - Sau khi xóa thì tính lại tổng tiền
// - Lưu cart mới vào database
// - Trả về cart đã populate thông tin sản phẩm

export const removeCartItemService = async (userId, productId) => {
    // Bước 1 — Tìm giỏ hàng của user
    const cart = await Cart.findOne({ user: userId })
    // Nếu user chưa có giỏ hàng thì không thể xóa sản phẩm
    if (!cart) {
        throw new Error('Giỏ hàng không tồn tại')
    }
    // Bước 2 — Lưu lại số lượng item trước khi xóa
    // Mục đích: lát nữa so sánh xem có item nào thật sự bị xóa không
    const beforeCount = cart.items.length
    // Bước 3 — Lọc bỏ sản phẩm cần xóa khỏi mảng items
    // Giữ lại những item có product khác productId cần xóa
    cart.items = cart.items.filter(
        item => item.product.toString() !== productId.toString()
    )
    // Bước 4 — Kiểm tra xem sản phẩm có tồn tại trong giỏ không
    // Nếu số lượng item sau khi filter vẫn bằng ban đầu
    // nghĩa là không có sản phẩm nào bị xóa
    if (cart.items.length === beforeCount) {
        throw new Error('Sản phẩm không có trong giỏ hàng')
    }
    // Bước 5 — Tính lại tổng tiền sau khi xóa sản phẩm
    cart.totalAmount = calcTotal(cart.items)
    // Bước 6 — Lưu thay đổi vào database
    await cart.save()
    // Bước 7 — Populate thông tin sản phẩm rồi trả cart về
    return await cart.populate(populateConfig)
}



// SERVICE 5 — Xóa toàn bộ giỏ hàng
// Mục đích:
// - Xóa toàn bộ sản phẩm trong giỏ hàng của user
// - Đưa totalAmount về 0
// - Thường dùng sau khi user checkout / tạo order thành công

export const clearCartService = async (userId) => {
    // Bước 1 — Tìm giỏ hàng của user
    const cart = await Cart.findOne({ user: userId })
    // Bước 2 — Nếu user chưa có giỏ hàng thì không cần làm gì
    // Không throw error vì clear cart là thao tác "dọn sạch"
    // Nếu chưa có cart thì coi như giỏ đã sạch rồi
    if (!cart) return
    // Bước 3 — Xóa toàn bộ item trong giỏ
    cart.items = []
    // Bước 4 — Reset tổng tiền về 0
    cart.totalAmount = 0
    // Bước 5 — Lưu thay đổi vào database
    await cart.save()
    // Bước 6 — Trả cart sau khi đã clear
    return cart
}