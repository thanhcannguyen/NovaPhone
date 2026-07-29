import Product from '../models/product.model.js'
import Category from '../models/category.model.js'

// GET /api/products
// Query: category, brand, minPrice, maxPrice, search
export const getProducts = async (req, res) => {
    try {
        const { category, brand, minPrice, maxPrice, search, featured } = req.query

        const filter = { isAvailable: true }
        if (category) filter.category = category
        if (brand) filter['specs.brand'] = { $regex: brand, $options: 'i' }
        if (featured === 'true') filter.isFeatured = true
        if (minPrice || maxPrice) {
            filter.price = {}
            if (minPrice) filter.price.$gte = Number(minPrice)
            if (maxPrice) filter.price.$lte = Number(maxPrice)
        }
        if (search) {
            filter.$or = [
                { name: { $regex: search, $options: 'i' } },
                { 'specs.brand': { $regex: search, $options: 'i' } },
                { description: { $regex: search, $options: 'i' } },
            ]
        }

        const products = await Product.find(filter)
            .populate('category', 'name')
            .sort({ createdAt: -1 })

        return res.status(200).json({
            success: true,
            total: products.length,
            data: products
        })
    } catch (error) {
        return res.status(500).json({ message: 'Lỗi server', error: error.message })
    }
}

// GET /api/products/:id
export const getProductById = async (req, res) => {
    try {
        const product = await Product.findById(req.params.id).populate('category', 'name')

        if (!product) return res.status(404).json({ message: 'Không tìm thấy sản phẩm' })
        if (!product.isAvailable) return res.status(404).json({ message: 'Sản phẩm hiện không có sẵn' })

        return res.status(200).json({ success: true, data: product })
    } catch (error) {
        return res.status(500).json({ message: 'Lỗi server', error: error.message })
    }
}

// POST /api/products — admin only
export const createProduct = async (req, res) => {
    try {
        const { name, description, price, originalPrice, image, images, category, specs, stock, isFeatured } = req.body

        if (!name || !price || !image || !category) {
            return res.status(400).json({ message: 'Vui lòng điền đủ tên, giá, ảnh và danh mục' })
        }

        const existedCategory = await Category.findById(category)
        if (!existedCategory || !existedCategory.isActive) {
            return res.status(400).json({ message: 'Danh mục không tồn tại hoặc đã bị ẩn' })
        }

        const existedProduct = await Product.findOne({
            name: { $regex: `^${name.trim()}$`, $options: 'i' }
        })
        if (existedProduct) return res.status(400).json({ message: 'Tên sản phẩm đã tồn tại' })

        const product = await Product.create({
            name: name.trim(),
            description: description?.trim() || '',
            price,
            originalPrice: originalPrice || 0,
            image,
            images: images || [],
            category,
            specs: specs || {},
            stock: stock || 0,
            isFeatured: isFeatured || false,
        })

        await product.populate('category', 'name')

        return res.status(201).json({
            success: true,
            message: 'Tạo sản phẩm thành công',
            data: product,
        })
    } catch (error) {
        return res.status(500).json({ message: 'Lỗi server', error: error.message })
    }
}

// PUT /api/products/:id — admin only
export const updateProduct = async (req, res) => {
    try {
        const { id } = req.params
        const { name, description, price, originalPrice, image, images, category, specs, stock, isAvailable, isFeatured } = req.body

        const product = await Product.findById(id)
        if (!product) return res.status(404).json({ message: 'Không tìm thấy sản phẩm' })

        if (name && name.trim() !== product.name) {
            const existed = await Product.findOne({
                name: { $regex: `^${name.trim()}$`, $options: 'i' },
                _id: { $ne: id }
            })
            if (existed) return res.status(400).json({ message: 'Tên sản phẩm đã tồn tại' })
        }

        if (category) {
            const existedCategory = await Category.findById(category)
            if (!existedCategory || !existedCategory.isActive) {
                return res.status(400).json({ message: 'Danh mục không tồn tại hoặc đã bị ẩn' })
            }
        }

        if (name !== undefined) product.name = name.trim()
        if (description !== undefined) product.description = description.trim()
        if (price !== undefined) product.price = price
        if (originalPrice !== undefined) product.originalPrice = originalPrice
        if (image !== undefined) product.image = image
        if (images !== undefined) product.images = images
        if (category !== undefined) product.category = category
        if (specs !== undefined) product.specs = { ...product.specs, ...specs }
        if (stock !== undefined) product.stock = stock
        if (isAvailable !== undefined) product.isAvailable = isAvailable
        if (isFeatured !== undefined) product.isFeatured = isFeatured

        await product.save()
        await product.populate('category', 'name')

        return res.status(200).json({
            success: true,
            message: 'Cập nhật sản phẩm thành công',
            data: product,
        })
    } catch (error) {
        return res.status(500).json({ message: 'Lỗi server', error: error.message })
    }
}

// DELETE /api/products/:id — soft delete, admin only
export const deleteProduct = async (req, res) => {
    try {
        const product = await Product.findById(req.params.id)
        if (!product) return res.status(404).json({ message: 'Không tìm thấy sản phẩm' })
        if (!product.isAvailable) return res.status(400).json({ message: 'Sản phẩm đã bị ẩn trước đó' })

        product.isAvailable = false
        await product.save()

        return res.status(200).json({ success: true, message: 'Đã ẩn sản phẩm thành công' })
    } catch (error) {
        return res.status(500).json({ message: 'Lỗi server', error: error.message })
    }
}

// GET /api/products/admin/all — lấy cả sp đã ẩn, admin only
export const getAllProductsAdmin = async (req, res) => {
    try {
        const products = await Product.find({})
            .populate('category', 'name')
            .sort({ createdAt: -1 })

        return res.status(200).json({ success: true, total: products.length, data: products })
    } catch (error) {
        return res.status(500).json({ message: 'Lỗi server', error: error.message })
    }
}
