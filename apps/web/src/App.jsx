
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

// Layouts
import UserLayout from './layouts/UserLayout'

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

                                    {/* --- PUBLIC USER ROUTES --- */}
                                    <Route element={<UserLayout />}>
                                        <Route path='/' element={<Home />} />
                                        <Route path='/products' element={<Products />} />
                                        <Route path='/products/:id' element={<ProductDetail />} />
                                        <Route path='/product/:id' element={<ProductDetail />} />
                                    </Route>

                                    {/* 
                    LƯU Ý: Các Route Giỏ hàng, Checkout, Profile, Đơn hàng, Admin... 
                    sẽ lần lượt được thêm ở các Giai đoạn 12 -> 14.
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