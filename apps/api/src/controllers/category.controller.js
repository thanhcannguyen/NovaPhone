
import Category from '../models/category.model.js';

// user xem tất cả danh sách category
// GET /api/categories
// Public — ai cũng xem được, không cần login

export const getCategories = async (req, res) => {
    try {
        // Chỉ lấy category đang active
        // index: true trên isActive → query này chạy nhanh
        const categories = await Category.find({ isActive: true }).sort({ createdAt: -1 })

        return res.status(200).json({
            success: true,
            total: categories.length,
            data: categories,
        })
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Lỗi Server",
            error: error.message
        })
    }
}


// admin tạo category mới
// POST /api/categories
// Chỉ admin — cần protect + restrictTo('admin')

export const createCategory = async (req, res) => {
    try {
        // Bước 1 lấy dữ liệu từ request
        const { name, description } = req.body
        // Bước 2 xác thực đầu vào
        if (!name) {
            return res.status(400).json({
                message: "Tên danh mục thiếu, kiểm tra lại"
            })
        }
        // Bước 3 kiểm tra tên đã tồn tại chưa
        // so sánh không phân biệt hoa thường
        const existed = await Category.findOne({
            name: { $regex: `^${name.trim()}$`, $options: 'i' }
        })

        if (existed) {
            return res.status(400).json({
                message: "Tên danh mục đã tồn tại"
            })
        }
        // Bước 4 tạo category
        const category = await Category.create({
            name: name.trim(),
            description: description?.trim() || ''
        })
        // Bước 5 trả kết quả
        return res.status(201).json({
            success: true,
            message: "Tạo danh mục thành công",
            data: category,
        })
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Lỗi Server",
            error: error.message
        })
    }
}


// cập nhật category
// PUT /api/categories/:id
// Chỉ admin — cần protect + restrictTo('admin')

export const updateCategory = async (req, res) => {
    try {
        // Bước 1 lấy id từ params
        const { id } = req.params
        const { name, description, isActive } = req.body
        // Bước 2 kiểm tra category có tồn tại không
        const category = await Category.findById(id)
        if (!category) {
            return res.status(404).json({
                message: "Không tìm thấy danh mục"
            })
        }
        // Bước 3 nếu đổi tên -> kiểm tra tên mới có trùng không
        // loại trừ chính nó khi so sánh
        if (name && name.trim() !== category.name) {
            const existed = await Category.findOne({
                name: { $regex: `^${name.trim()}$`, $options: 'i' },
                _id: { $ne: id } // không tính chính category đang update
            })

            if (existed) {
                return res.status(400).json({ message: 'Tên danh mục này đã tồn tại' })
            }
        }

        // Bước 4 cập nhật danh mục
        // Chỉ update field nào được gửi lên
        // ----------------------------------------
        if (name !== undefined) category.name = name.trim()
        if (description !== undefined) category.description = description.trim()
        if (isActive !== undefined) category.isActive = isActive

        // Bước 5 lưu thay đổi
        await category.save()

        // Bước 6 trả kết quả
        return res.status(200).json({
            success: true,
            message: 'Cập nhật danh mục thành công',
            data: category,
        })
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Lỗi Server",
            error: error.message
        })
    }
}



// Xóa mềm category (soft delete)
// DELETE /api/categories/:id
// Chỉ admin — cần protect + restrictTo('admin')
// Không xóa hẳn — chỉ set isActive: false
// Lý do: category có thể đang được gắn với product
//        xóa hẳn sẽ làm hỏng dữ liệu product liên quan
export const deleteCategory = async (req, res) => {
    try {
        // Bước 1 lấy id từ params
        const { id } = req.params
        // Bước 2 kiểm tra category có tồn tại không
        const category = await Category.findById(id)

        if (!category) {
            return res.status(404).json({ message: 'Không tìm thấy danh mục' })
        }

        // Bước 3 : Đã ẩn rồi thì không cần làm gì thêm
        if (!category.isActive) {
            return res.status(400).json({ message: 'Danh mục này đã bị ẩn trước đó' })
        }

        // Bước 4: Soft delete — ẩn đi, không xóa khỏi DB
        category.isActive = false
        await category.save()

        // Bước 5 trả kết quả
        return res.status(200).json({
            success: true,
            message: 'Đã ẩn danh mục thành công',
        })

    } catch (error) {
        return res.status(500).json({ message: 'Lỗi server' })
    }
}