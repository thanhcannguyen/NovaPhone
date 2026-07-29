import mongoose from 'mongoose'

const productSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        minLength: 2,
        maxLength: 150
    },
    description: {
        type: String,
        trim: true,
        default: '',
        maxLength: 1000
    },
    price: {
        type: Number,
        required: true,
        min: 0
    },
    // Giá gốc để hiển thị % giảm giá
    originalPrice: {
        type: Number,
        min: 0,
        default: 0
    },
    image: {
        type: String,
        required: true
    },
    // Nhiều ảnh cho sản phẩm điện thoại
    images: {
        type: [String],
        default: []
    },
    category: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Category',
        required: true,
    },
    // Thông số kỹ thuật điện thoại
    specs: {
        brand: { type: String, default: '' },       // Samsung, Apple, Xiaomi...
        ram: { type: String, default: '' },          // 8GB, 12GB
        storage: { type: String, default: '' },      // 128GB, 256GB
        screen: { type: String, default: '' },       // 6.7 inch, AMOLED
        battery: { type: String, default: '' },      // 5000mAh
        camera: { type: String, default: '' },       // 108MP, Triple camera
        os: { type: String, default: '' },           // Android 14, iOS 17
        chip: { type: String, default: '' },         // Snapdragon 8 Gen 3
    },
    stock: {
        type: Number,
        default: 0,
        min: 0
    },
    isAvailable: {
        type: Boolean,
        default: true,
    },
    // Admin tự đánh dấu — quyết định sản phẩm nào hiện ở mục "Top sản phẩm nổi bật" trang chủ
    isFeatured: {
        type: Boolean,
        default: false,
    }
}, {
    timestamps: true
})

// Index để tìm kiếm nhanh theo brand
productSchema.index({ 'specs.brand': 1 })

const Product = mongoose.model('Product', productSchema)

export default Product
