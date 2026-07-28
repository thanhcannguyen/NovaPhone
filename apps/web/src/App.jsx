import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import ScrollToTop from './components/ScrollToTop'

// Auth
import Login from './pages/auth/Login'
import Register from './pages/auth/Register'

// Layouts
import UserLayout from './layouts/UserLayout'
import AdminLayout from './layouts/AdminLayout'

// User pages
import Home from './pages/user/Home'
import Products from './pages/user/Products'
import ProductDetail from './pages/user/ProductDetail'
import Profile from './pages/user/Profile'
import Cart from './pages/user/Cart'
import Checkout from './pages/user/Checkout'
import Orders from './pages/user/Orders'
import OrderDetail from './pages/user/OrderDetail'
import Policy from './pages/user/Policy'
import Contact from './pages/user/Contact'

// Admin pages
import Dashboard from './pages/admin/Dashboard'
import Categories from './pages/admin/Categories'
import AdminProducts from './pages/admin/Products'
import Users from './pages/admin/Users'
import AdminOrders from './pages/admin/Orders'
import Reviews from './pages/admin/Reviews'

// Route guards
import UserRoute from './routes/UserRoute'
import AdminRoute from './routes/AdminRoute'

export default function App() {
    return (
        <BrowserRouter>
            <ScrollToTop />
            <Routes>
                {/* Auth — public */}
                <Route path='/login' element={<Login />} />
                <Route path='/register' element={<Register />} />

                {/* Public pages */}
                <Route element={<UserLayout />}>
                    <Route path='/' element={<Home />} />
                    <Route path='/products' element={<Products />} />
                    <Route path='/product/:id' element={<ProductDetail />} />
                    <Route path="/policy" element={<Policy />} />
                    <Route path="/contact" element={<Contact />} />
                </Route>

                {/* User pages - yêu cầu đăng nhập */}
                <Route element={<UserRoute><UserLayout /></UserRoute>}>
                    <Route path='/profile' element={<Profile />} />
                    <Route path='/cart' element={<Cart />} />
                    <Route path='/checkout' element={<Checkout />} />
                    <Route path='/orders' element={<Orders />} />
                    <Route path='/orders/:id' element={<OrderDetail />} />
                </Route>

                {/* Admin only */}
                <Route element={<AdminRoute><AdminLayout /></AdminRoute>}>
                    <Route path='/admin' element={<Dashboard />} />
                    <Route path='/admin/categories' element={<Categories />} />
                    <Route path='/admin/products' element={<AdminProducts />} />
                    <Route path='/admin/users' element={<Users />} />
                    <Route path='/admin/orders' element={<AdminOrders />} />
                    <Route path='/admin/reviews' element={<Reviews />} />
                </Route>

                <Route path='*' element={<Navigate to='/products' />} />
            </Routes>
        </BrowserRouter>
    )
}
