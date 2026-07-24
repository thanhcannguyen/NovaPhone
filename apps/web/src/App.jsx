
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'

// Import Providers & Notification
import { AuthProvider } from './context/AuthContext'
import { CartProvider } from './context/CartContext'
import { WishlistProvider } from './context/WishlistContext'
import { CompareProvider } from './context/CompareContext'
import { ToastProvider } from './context/ToastContext'
import ToastContainer from './components/user/ToastContainer'

// Layouts
import UserLayout from './layouts/UserLayout'
import AdminLayout from './layouts/AdminLayout'

// Route Guards (chuẩn bị sẵn cho các giai đoạn sau)
import UserRoute from './routes/UserRoute'
import AdminRoute from './routes/AdminRoute'

// Component Placeholder tạm thời cho Giai đoạn 9
const HomePlaceholder = () => (
    <div style={{ padding: '4rem 2rem', textAlign: 'center', maxWidth: '600px', margin: '0 auto' }}>
        <h1 style={{ fontSize: '2rem', marginBottom: '1rem', color: '#1e293b' }}>
            🚀 Welcome to NovaPhone
        </h1>
        <p style={{ color: '#64748b', lineHeight: '1.6' }}>
            Hệ thống Frontend đang trong quá trình phát triển (<strong>Giai đoạn 9</strong>: Khởi tạo Vite, Layout, Context & Routing).
        </p>
    </div>
)

export default function App() {
    return (
        <BrowserRouter>
            <ToastProvider>
                <AuthProvider>
                    <CartProvider>
                        <WishlistProvider>
                            <CompareProvider>
                                {/* Hiển thị thông báo Toast toàn cục */}
                                <ToastContainer />

                                <Routes>
                                    {/* --- PUBLIC ROUTES (User Layout) --- */}
                                    <Route element={<UserLayout />}>
                                        <Route path='/' element={<HomePlaceholder />} />
                                    </Route>

                                    {/* 
                    LƯU Ý: Các Route đăng nhập, sản phẩm, giỏ hàng, đơn hàng, admin... 
                    sẽ lần lượt được import và mở ngoặc ở các Giai đoạn 10 -> 14.
                  */}

                                    {/* Chuyển hướng các route chưa tồn tại về trang chủ */}
                                    <Route path='*' element={<Navigate to='/' replace />} />
                                </Routes>

                            </CompareProvider>
                        </WishlistProvider>
                    </CartProvider>
                </AuthProvider>
            </ToastProvider>
        </BrowserRouter>
    )
}