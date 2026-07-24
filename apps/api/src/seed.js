import dotenv from 'dotenv'
dotenv.config()

import mongoose from 'mongoose'
import bcrypt from 'bcryptjs'
import User from './models/user.model.js'
import Category from './models/category.model.js'
import Product from './models/product.model.js'

const seed = async () => {
    await mongoose.connect(process.env.MONGO_URI)
    console.log('✅ MongoDB connected')

    // Xóa data cũ
    await Product.deleteMany({})
    await Category.deleteMany({})
    console.log('🗑️  Đã xóa data cũ')

    // ==========================================
    // CATEGORIES
    // ==========================================
    const categoryData = [
        { name: 'Apple', description: 'iPhone chính hãng' },
        { name: 'Samsung', description: 'Galaxy Series' },
        { name: 'Xiaomi', description: 'Redmi & POCO' },
        { name: 'Oppo', description: 'Reno & Find Series' },
        { name: 'Vivo', description: 'V & Y Series' },
    ]

    const categories = await Category.insertMany(
        categoryData.map(c => ({ ...c, isActive: true }))
    )

    const catMap = {}
    categories.forEach(c => { catMap[c.name] = c._id })
    console.log('📁 Đã tạo', categories.length, 'danh mục')

    // ==========================================
    // PRODUCTS
    // ==========================================
    const products = [
        // Apple
        {
            name: 'iPhone 16 Pro Max',
            description: 'Chip A18 Pro, camera 48MP Fusion, màn hình 6.9" Super Retina XDR, pin cả ngày.',
            price: 34990000, originalPrice: 36990000,
            image: 'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=600&q=80',
            category: catMap['Apple'], stock: 10,
            specs: { brand: 'Apple', chip: 'A18 Pro', ram: '8GB', storage: '256GB', screen: '6.9" OLED 120Hz', camera: '48MP Triple', battery: '4685mAh', os: 'iOS 18' }
        },
        {
            name: 'iPhone 15',
            description: 'Chip A16 Bionic, Dynamic Island, USB-C, camera 48MP.',
            price: 22990000, originalPrice: 24990000,
            image: 'https://images.unsplash.com/photo-1510557880182-3d4d3cba35a5?w=600&q=80',
            category: catMap['Apple'], stock: 15,
            specs: { brand: 'Apple', chip: 'A16 Bionic', ram: '6GB', storage: '128GB', screen: '6.1" OLED 60Hz', camera: '48MP Dual', battery: '3877mAh', os: 'iOS 17' }
        },
        {
            name: 'iPhone 14',
            description: 'Chip A15 Bionic, thiết kế classic, pin 3279mAh, camera 12MP.',
            price: 17490000, originalPrice: 19990000,
            image: 'https://images.unsplash.com/photo-1574755393849-623942496936?w=600&q=80',
            category: catMap['Apple'], stock: 8,
            specs: { brand: 'Apple', chip: 'A15 Bionic', ram: '6GB', storage: '128GB', screen: '6.1" OLED 60Hz', camera: '12MP Dual', battery: '3279mAh', os: 'iOS 16' }
        },

        // Samsung
        {
            name: 'Samsung Galaxy S25 Ultra',
            description: 'Snapdragon 8 Elite, camera 200MP, bút S Pen tích hợp, pin 5000mAh.',
            price: 31990000, originalPrice: 33990000,
            image: 'https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=600&q=80',
            category: catMap['Samsung'], stock: 12,
            specs: { brand: 'Samsung', chip: 'Snapdragon 8 Elite', ram: '12GB', storage: '256GB', screen: '6.9" AMOLED 120Hz', camera: '200MP Quad', battery: '5000mAh', os: 'Android 15' }
        },
        {
            name: 'Samsung Galaxy S24+',
            description: 'Galaxy AI, Snapdragon 8 Gen 3, màn hình 6.7" AMOLED sáng 2600 nit.',
            price: 24990000, originalPrice: 26990000,
            image: 'https://images.unsplash.com/photo-1567581935884-3349723552ca?w=600&q=80',
            category: catMap['Samsung'], stock: 20,
            specs: { brand: 'Samsung', chip: 'Snapdragon 8 Gen 3', ram: '12GB', storage: '256GB', screen: '6.7" AMOLED 120Hz', camera: '50MP Triple', battery: '4900mAh', os: 'Android 14' }
        },
        {
            name: 'Samsung Galaxy A55',
            description: 'Exynos 1480, camera 50MP OIS, IP67, màn hình Super AMOLED 120Hz.',
            price: 8990000, originalPrice: 9990000,
            image: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=600&q=80',
            category: catMap['Samsung'], stock: 25,
            specs: { brand: 'Samsung', chip: 'Exynos 1480', ram: '8GB', storage: '128GB', screen: '6.6" AMOLED 120Hz', camera: '50MP Triple', battery: '5000mAh', os: 'Android 14' }
        },

        // Xiaomi
        {
            name: 'Xiaomi 14T Pro',
            description: 'Dimensity 9300+, camera Leica 50MP, sạc nhanh 120W, chống nước IP68.',
            price: 16990000, originalPrice: 18490000,
            image: 'https://images.unsplash.com/photo-1585060544812-6b45742d762f?w=600&q=80',
            category: catMap['Xiaomi'], stock: 18,
            specs: { brand: 'Xiaomi', chip: 'Dimensity 9300+', ram: '12GB', storage: '256GB', screen: '6.67" AMOLED 144Hz', camera: '50MP Leica Triple', battery: '5000mAh 120W', os: 'Android 14' }
        },
        {
            name: 'Redmi Note 13 Pro+',
            description: 'Dimensity 7200 Ultra, camera 200MP, sạc 120W, màn hình cong 120Hz.',
            price: 8490000, originalPrice: 9490000,
            image: 'https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=600&q=80',
            category: catMap['Xiaomi'], stock: 30,
            specs: { brand: 'Xiaomi', chip: 'Dimensity 7200 Ultra', ram: '8GB', storage: '256GB', screen: '6.67" AMOLED 120Hz', camera: '200MP Triple', battery: '5000mAh 120W', os: 'Android 13' }
        },
        {
            name: 'POCO X6 Pro',
            description: 'Dimensity 8300 Ultra, gaming phone giá tốt, màn hình 144Hz Flow AMOLED.',
            price: 7490000, originalPrice: 7990000,
            image: 'https://images.unsplash.com/photo-1601784551446-20c9e07cdbdb?w=600&q=80',
            category: catMap['Xiaomi'], stock: 22,
            specs: { brand: 'Xiaomi', chip: 'Dimensity 8300 Ultra', ram: '8GB', storage: '256GB', screen: '6.67" AMOLED 144Hz', camera: '64MP Triple', battery: '5000mAh 67W', os: 'Android 14' }
        },

        // Oppo
        {
            name: 'Oppo Find X8 Pro',
            description: 'Dimensity 9400, camera Hasselblad 50MP, sạc không dây 50W, IP69.',
            price: 27990000, originalPrice: 29990000,
            image: 'https://images.unsplash.com/photo-1616348436168-de43ad0db179?w=600&q=80',
            category: catMap['Oppo'], stock: 8,
            specs: { brand: 'Oppo', chip: 'Dimensity 9400', ram: '16GB', storage: '256GB', screen: '6.78" AMOLED 120Hz', camera: '50MP Hasselblad Quad', battery: '5910mAh 80W', os: 'Android 15' }
        },
        {
            name: 'Oppo Reno 12',
            description: 'Dimensity 7300 Energy, camera AI 50MP, thiết kế mỏng 7.4mm, sạc 80W.',
            price: 9990000, originalPrice: 10990000,
            image: 'https://images.unsplash.com/photo-1580910051074-3eb694886505?w=600&q=80',
            category: catMap['Oppo'], stock: 15,
            specs: { brand: 'Oppo', chip: 'Dimensity 7300 Energy', ram: '12GB', storage: '256GB', screen: '6.7" AMOLED 120Hz', camera: '50MP Triple', battery: '5000mAh 80W', os: 'Android 14' }
        },

        // Vivo
        {
            name: 'Vivo X100 Pro',
            description: 'Dimensity 9300, camera ZEISS 50MP, sạc nhanh 100W, chống nước IP68.',
            price: 22990000, originalPrice: 24490000,
            image: 'https://images.unsplash.com/photo-1591337676887-a217a6970a8a?w=600&q=80',
            category: catMap['Vivo'], stock: 10,
            specs: { brand: 'Vivo', chip: 'Dimensity 9300', ram: '16GB', storage: '256GB', screen: '6.78" AMOLED 120Hz', camera: '50MP ZEISS Triple', battery: '5400mAh 100W', os: 'Android 14' }
        },
        {
            name: 'Vivo V30e',
            description: 'Snapdragon 6 Gen 1, camera ZEISS 50MP, pin 5500mAh, sạc 80W.',
            price: 7990000, originalPrice: 8490000,
            image: 'https://images.unsplash.com/photo-1544866092-1935c5ef2a8f?w=600&q=80',
            category: catMap['Vivo'], stock: 20,
            specs: { brand: 'Vivo', chip: 'Snapdragon 6 Gen 1', ram: '8GB', storage: '128GB', screen: '6.78" AMOLED 120Hz', camera: '50MP ZEISS Dual', battery: '5500mAh 80W', os: 'Android 14' }
        },
        {
            name: 'Vivo Y100',
            description: 'Snapdragon 4 Gen 1, pin 5000mAh, sạc 44W, camera 64MP.',
            price: 4990000, originalPrice: 5490000,
            image: 'https://images.unsplash.com/photo-1512054502232-10a0a035d672?w=600&q=80',
            category: catMap['Vivo'], stock: 35,
            specs: { brand: 'Vivo', chip: 'Snapdragon 4 Gen 1', ram: '8GB', storage: '128GB', screen: '6.38" AMOLED 90Hz', camera: '64MP Dual', battery: '5000mAh 44W', os: 'Android 13' }
        },
    ]

    await Product.insertMany(
        products.map(p => ({ ...p, isAvailable: true }))
    )
    console.log('📱 Đã tạo', products.length, 'sản phẩm')

    // ==========================================
    // ADMIN USER (nếu chưa có)
    // ==========================================
    const existAdmin = await User.findOne({ email: 'admin@phonestore.com' })
    if (!existAdmin) {
        const hashed = await bcrypt.hash('admin123', 10)
        await User.create({
            name: 'Admin',
            email: 'admin@phonestore.com',
            password: hashed,
            role: 'admin',
            isEmailVerified: true,
            isActive: true,
        })
        console.log('👤 Đã tạo admin — email: admin@phonestore.com | pass: admin123')
    } else {
        console.log('👤 Admin đã tồn tại, bỏ qua')
    }

    console.log('🎉 Seed hoàn tất!')
    process.exit(0)
}

seed().catch(err => {
    console.error('❌ Seed lỗi:', err.message)
    process.exit(1)
})