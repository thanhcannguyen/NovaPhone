
import express from 'express'
import cors from 'cors'

import authRoute from './routes/auth.route.js'
import userRoute from './routes/user.route.js'

import categoryRoute from './routes/category.route.js'
import productRoute from './routes/product.route.js'

import cartRoute from './routes/cart.route.js'

import orderRoute from './routes/order.route.js'

import reviewRoute from './routes/review.route.js'
import reviewActionRoute from './routes/reviewAction.route.js'
import chatRoute from './routes/chat.route.js'
import aiRoute from './routes/ai.route.js'

const app = express()
app.use(cors())

// ⚠️ QUAN TRỌNG: route webhook Stripe phải đăng ký TRƯỚC express.json() —
// nếu để sau, express.json() sẽ đọc và "tiêu thụ" hết phần body thô trước khi
// đến route này, khiến việc xác thực chữ ký Stripe luôn thất bại.
app.use('/api/stripe', stripeRoute)

app.use(express.json())

// Cho phép truy cập ảnh đã upload qua URL, ví dụ:
// http://localhost:5000/uploads/avatars/xxx.jpg
app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')))

// ...
app.use('/api/auth', authRoute)
app.use('/api/users', userRoute)
// ...
app.use('/api/categories', categoryRoute)
app.use('/api/products', productRoute)
// ...
app.use('/api/cart', cartRoute)
// ...
app.use('/api/orders', orderRoute)
// ...
app.use('/api/products/:productId/reviews', reviewRoute)
app.use('/api/reviews', reviewActionRoute)
app.use('/api/chat', chatRoute)
app.use('/api/ai', aiRoute)

app.use((req, res) => {
    res.status(404).json({ message: `Route không tìm thấy: ${req.originalUrl}` })
})

// Thêm error handler cuối cùng (sau route 404)
app.use((err, req, res, next) => {
    console.error('Lỗi không xác định:', err)
    res.status(err.status || 500).json({ message: err.message || 'Đã xảy ra lỗi không xác định phía server' })
})

export default app