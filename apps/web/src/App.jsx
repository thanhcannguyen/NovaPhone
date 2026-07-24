
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

// Additional User Pages & Info Pages (Giai đoạn 13)
import Orders from './pages/user/Orders'
import OrderDetail from './pages/user/OrderDetail'
import Profile from './pages/user/Profile'
import Contact from './pages/user/Contact'
import Policy from './pages/user/Policy'

// Admin Pages (Giai đoạn 14)
import Dashboard from './pages/admin/Dashboard'
import AdminProducts from './pages/admin/Products'
import AdminCategories from './pages/admin/Categories'
import AdminOrders from './pages/admin/Orders'
import AdminUsers from './pages/admin/Users'

// Layouts & Guards
import UserLayout from './layouts/UserLayout'
import AdminLayout from './layouts/AdminLayout'
import UserRoute from './routes/UserRoute'
import AdminRoute from './routes/AdminRoute'

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
                                        {/* Public Routes */}
                                        <Route path='/' element={<Home />} />
                                        <Route path='/products' element={<Products />} />
                                        <Route path='/products/:id' element={<ProductDetail />} />
                                        <Route path='/product/:id' element={<ProductDetail />} />
                                        <Route path='/contact' element={<Contact />} />
                                        <Route path='/policy' element={<Policy />} />

                                        {/* Protected User Routes (Yêu cầu đăng nhập) */}
                                        <Route element={<UserRoute />}>
                                            <Route path='/cart' element={<Cart />} />
                                            <Route path='/checkout' element={<Checkout />} />
                                            <Route path='/orders' element={<Orders />} />
                                            <Route path='/orders/:id' element={<OrderDetail />} />
                                            <Route path='/profile' element={<Profile />} />
                                        </Route>
                                    </Route>

                                    {/* --- PROTECTED ADMIN ROUTES (Giai đoạn 14 - Yêu cầu quyền Admin) --- */}
                                    <Route element={<AdminRoute />}>
                                        <Route element={<AdminLayout />}>
                                            <Route path='/admin' element={<Dashboard />} />
                                            <Route path='/admin/products' element={<AdminProducts />} />
                                            <Route path='/admin/categories' element={<AdminCategories />} />
                                            <Route path='/admin/orders' element={<AdminOrders />} />
                                            <Route path='/admin/users' element={<AdminUsers />} />
                                        </Route>
                                    </Route>

                                    {/* Chuyển hướng các route không tồn tại về trang chủ */}
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