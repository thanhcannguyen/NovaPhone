
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'

// Import Providers & Notification
import { AuthProvider } from './context/AuthContext'
import { CartProvider } from './context/CartContext'
import { WishlistProvider } from './context/WishlistContext'
import { CompareProvider } from './context/CompareContext'
import { ToastProvider } from './context/ToastContext'
import ToastContainer from './components/user/ToastContainer'

// Auth Pages (Giai đoạn 10)
import Login from './pages/auth/Login'
import Register from './pages/auth/Register'

// User Public Pages (Giai đoạn 11)
import Home from './pages/user/Home'
import Products from './pages/user/Products'
import ProductDetail from './pages/user/ProductDetail'

// Cart & Checkout Pages (Giai đoạn 12)
import Cart from './pages/user/Cart'
import Checkout from './pages/user/Checkout'

// Layouts & Guards
import UserLayout from './layouts/UserLayout'
import UserRoute from './routes/UserRoute'

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
                                    {/* --- AUTH ROUTES --- */}
                                    <Route path='/login' element={<Login />} />
                                    <Route path='/register' element={<Register />} />

                                    {/* --- PUBLIC & PROTECTED USER ROUTES --- */}
                                    <Route element={<UserLayout />}>
                                        {/* Public Routes (Giai đoạn 11) */}
                                        <Route path='/' element={<Home />} />
                                        <Route path='/products' element={<Products />} />
                                        <Route path='/products/:id' element={<ProductDetail />} />
                                        <Route path='/product/:id' element={<ProductDetail />} />

                                        {/* Protected User Routes (Giai đoạn 12 - Yêu cầu đăng nhập) */}
                                        <Route element={<UserRoute />}>
                                            <Route path='/cart' element={<Cart />} />
                                            <Route path='/checkout' element={<Checkout />} />
                                        </Route>
                                    </Route>

                                    {/* 
                    LƯU Ý: Các Route Profile, Đơn hàng, Admin... 
                    sẽ lần lượt được thêm ở Giai đoạn 13 & 14.
                  */}

                                    {/* Chuyển hướng các route chưa khởi tạo về trang chủ */}
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