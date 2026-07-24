
import dotenv from 'dotenv'
import app from './app.js'
import connectDB from './config/db.js'

// Load biến môi trường từ file .env vào process.env
// Phải gọi trước khi dùng process.env.PORT, MONGO_URI...
dotenv.config()

// Lấy port từ biến môi trường, nếu không có thì dùng 5000
const PORT = process.env.PORT || 5000

// Hàm khởi động server
const startServer = async () => {
    try {
        // Kết nối đến MongoDB
        // Nếu lỗi sẽ nhảy xuống catch
        await connectDB()

        // Chỉ khi DB kết nối thành công mới start server
        app.listen(PORT, () => {
            console.log(`Server đang chạy tại http://localhost:${PORT}`)
        })

    } catch (error) {
        // Nếu không kết nối được DB thì log lỗi
        console.error("Không thể kết nối DB:", error.message)

        // Dừng server (thoát process)
        process.exit(1)
    }
}

// Gọi hàm để chạy server
startServer()