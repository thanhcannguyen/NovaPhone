import Product from '../models/product.model.js'

export const getProductsForAI = async (req, res) => {
    try {
        const products = await Product.find({
            isAvailable: true,
            stock: { $gt: 0 }
        })
            .select('name description price originalPrice stock specs')
            .lean()

        return res.status(200).json({
            success: true,
            total: products.length,
            products
        })
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'Lỗi khi lấy dữ liệu sản phẩm cho AI',
            error: error.message
        })
    }
}