import { useState, useEffect, useRef } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext.jsx'
import { useCart } from '../../context/CartContext.jsx'
import {
    Search, ShoppingCart, User, Package, LogOut,
    Menu, X, ChevronDown, Smartphone, ClipboardList, Home,
    UserCircle, ShieldCheck, MessageSquare, LogIn, UserPlus, Trash2
} from 'lucide-react'

export default function Header() {
    const { user, logout } = useAuth()
    const { cart, cartCount, updateItem, removeItem } = useCart()
    const navigate = useNavigate()
    const location = useLocation()
    const [menuOpen, setMenuOpen] = useState(false)
    const [scrolled, setScrolled] = useState(false)
    const [searchVal, setSearchVal] = useState('')
    const [userDropOpen, setUserDropOpen] = useState(false)
    const [cartPreviewOpen, setCartPreviewOpen] = useState(false)
    const userDropRef = useRef(null)
    const cartItems = cart?.items ?? []

    useEffect(() => {
        const onScroll = () => setScrolled(window.scrollY > 2)
        window.addEventListener('scroll', onScroll)
        return () => window.removeEventListener('scroll', onScroll)
    }, [])

    useEffect(() => { setMenuOpen(false); setUserDropOpen(false) }, [location.pathname])

    useEffect(() => {
        document.body.style.overflow = menuOpen ? 'hidden' : ''
        return () => { document.body.style.overflow = '' }
    }, [menuOpen])

    useEffect(() => {
        const handler = (e) => {
            if (userDropRef.current && !userDropRef.current.contains(e.target))
                setUserDropOpen(false)
        }
        document.addEventListener('mousedown', handler)
        return () => document.removeEventListener('mousedown', handler)
    }, [])

    const handleLogout = () => { logout(); navigate('/login') }

    const handleSearch = (e) => {
        if (e.key === 'Enter' && searchVal.trim()) {
            navigate(`/products?search=${encodeURIComponent(searchVal.trim())}`)
            setSearchVal('')
        }
    }

    const handleProductsClick = (e) => {
        e.preventDefault()
        if (location.pathname === '/products') {
            // Đã ở sẵn trang /products — pathname không đổi nên ScrollToTop
            // (dựa vào useLocation trong App.jsx) sẽ không tự kích hoạt, phải tự cuộn lên đầu.
            window.scrollTo({ top: 0, behavior: 'smooth' })
        } else {
            navigate('/products')
        }
    }

    const handleLogoClick = () => {
        window.scrollTo({ top: 0, behavior: 'smooth' })
        window.dispatchEvent(new CustomEvent('logoClick'))
    }

    // Detect active nav từ URL thực tế
    const getNavActive = (to) => {
        if (to === '/products') {
            return location.pathname === '/products' ||
                location.pathname.startsWith('/product/')
        }
        return location.pathname === to || location.pathname.startsWith(to + '/')
    }

    const initials = user?.name?.split(' ').map(w => w[0]).slice(-2).join('').toUpperCase() || '?'

    const NAV_ITEMS = [
        { to: '/', label: 'Trang chủ' },
        { to: '/products', label: 'Sản phẩm', onClick: handleProductsClick },
        { to: '/policy', label: 'Chính sách' },
        { to: '/contact', label: 'Liên hệ' },
    ]

    const MOBILE_NAV = [
        { to: '/', icon: <Home size={18} />, label: 'Trang chủ' },
        { to: '/products', icon: <Smartphone size={18} />, label: 'Sản phẩm', onClick: (e) => { handleProductsClick(e); setMenuOpen(false) } },
        { to: '/cart', icon: <ShoppingCart size={18} />, label: `Giỏ hàng${cartCount > 0 ? ` (${cartCount})` : ''}` },
        ...(user ? [{ to: '/orders', icon: <Package size={18} />, label: 'Đơn hàng của tôi' }] : []),
        { to: '/policy', icon: <ShieldCheck size={18} />, label: 'Chính sách' },
        { to: '/contact', icon: <MessageSquare size={18} />, label: 'Liên hệ' },
    ]

    return (
        <>
            <style>{`
            @import url('https://fonts.googleapis.com/css2?family=Nunito:wght@400;500;600;700;800&display=swap');
            :root {
                --primary: #0057FF; --primary-dark: #0040CC;
                --primary-light: #EEF4FF; --danger: #EF4444;
                --dark: #0A0A0A; --gray: #6B7280; --gray-light: #9CA3AF;
                --light: #F8F9FB; --border: #E5E7EB;
            }
            * { box-sizing: border-box; }
            body { font-family: 'Nunito', sans-serif; }

            .ps-navbar {
                background: #fff; border-bottom: 1px solid var(--border);
                position: sticky; top: 0; z-index: 100;
                box-shadow: ${scrolled ? '0 2px 12px rgba(0,0,0,0.08)' : '0 1px 4px rgba(0,0,0,0.04)'};
                transition: box-shadow 0.2s;
            }
            .ps-navbar-inner {
                display: flex; align-items: center; gap: 12px;
                height: 64px; max-width: 1280px; margin: 0 auto; padding: 0 24px;
            }
            .ps-brand {
                font-family: 'Nunito', sans-serif; font-weight: 800; font-size: 1.35rem;
                color: var(--dark); text-decoration: none; letter-spacing: -0.5px;
                white-space: nowrap; flex-shrink: 0;
            }
            .ps-brand span { color: var(--primary); }

            /* Search */
            .ps-search { flex: 1; max-width: 480px; position: relative; }
            .ps-search input {
                width: 100%; background: var(--light); border: 1.5px solid var(--border);
                border-radius: 10px; padding: 10px 42px 10px 16px;
                font-size: 0.875rem; font-family: 'Nunito', sans-serif;
                color: var(--dark); outline: none; transition: border-color 0.2s, background 0.2s;
            }
            .ps-search input:focus { border-color: var(--primary); background: #fff; }
            .ps-search input::placeholder { color: var(--gray-light); }
            .ps-search-icon {
                position: absolute; right: 12px; top: 50%;
                transform: translateY(-50%); color: var(--gray); pointer-events: none;
                display: flex; align-items: center;
            }

            /* Nav */
            .ps-nav { display: flex; gap: 2px; list-style: none; margin: 0; padding: 0; }
            .ps-nav-link {
                display: flex; align-items: center; gap: 6px;
                padding: 8px 13px; font-size: 0.875rem; font-weight: 600;
                color: var(--gray); text-decoration: none; border-radius: 8px;
                transition: all 0.15s; white-space: nowrap; cursor: pointer;
                border: none; background: none; font-family: 'Nunito', sans-serif;
            }
            .ps-nav-link:hover { background: #E0EAFF; color: var(--primary); }
            .ps-nav-link.active { background: #E0EAFF; color: var(--primary); }

            /* Cart */
            .ps-cart {
                position: relative; display: flex; align-items: center; gap: 7px;
                padding: 8px 14px; font-size: 0.875rem; font-weight: 600;
                color: var(--dark); text-decoration: none; border-radius: 8px;
                border: 1.5px solid var(--border); transition: all 0.2s;
                white-space: nowrap; flex-shrink: 0;
            }
            .ps-cart:hover { border-color: var(--primary); color: var(--primary); }
            .ps-cart-badge {
                position: absolute; top: -6px; right: -6px;
                background: var(--danger); color: #fff;
                font-size: 0.6rem; font-weight: 800; min-width: 17px; height: 17px;
                border-radius: 100px; display: flex; align-items: center;
                justify-content: center; padding: 0 4px; border: 2px solid #fff;
            }

            .ps-cart.active { background: #E0EAFF; border-color: var(--primary); color: var(--primary); }
            .ps-cart-wrap { position: relative; flex-shrink: 0; }

            /* Cart preview dropdown */
            .ps-cart-preview {
                position: absolute; top: calc(100% + 10px); right: 0; width: 320px;
                background: #fff; border: 1px solid var(--border); border-radius: 14px;
                box-shadow: 0 8px 32px rgba(0,0,0,0.12); z-index: 999; padding: 14px;
                animation: dropIn 0.15s ease;
            }
            .ps-cart-preview-empty { padding: 24px 0; text-align: center; color: var(--gray); font-size: 0.85rem; }
            .ps-cart-preview-title { font-weight: 800; font-size: 0.85rem; color: var(--dark); margin-bottom: 10px; }
            .ps-cart-preview-list { max-height: 228px; overflow-y: auto; display: flex; flex-direction: column; gap: 10px; margin-bottom: 12px; padding-right: 4px; }
            .ps-cart-preview-list::-webkit-scrollbar { width: 5px; }
            .ps-cart-preview-list::-webkit-scrollbar-thumb { background: var(--border); border-radius: 100px; }
            .ps-cart-preview-item { display: flex; gap: 10px; align-items: center; }
            .ps-cart-preview-img { width: 48px; height: 48px; border-radius: 8px; object-fit: cover; background: var(--light); border: 1px solid var(--border); flex-shrink: 0; }
            .ps-cart-preview-info { flex: 1; min-width: 0; }
            .ps-cart-preview-name { font-size: 0.8rem; font-weight: 600; color: var(--dark); line-height: 1.3; margin-bottom: 2px; }
            .ps-cart-preview-qty { font-size: 0.72rem; color: var(--gray); }
            .ps-cart-preview-price { font-size: 0.8rem; font-weight: 700; color: var(--danger); white-space: nowrap; flex-shrink: 0; }
            .ps-cart-preview-footer { border-top: 1px solid var(--border); padding-top: 12px; }
            .ps-cart-preview-total { display: flex; justify-content: space-between; font-size: 0.85rem; font-weight: 700; color: var(--dark); margin-bottom: 10px; }
            .ps-cart-preview-btn { display: block; width: 100%; text-align: center; background: var(--dark); color: #fff; padding: 10px; border-radius: 10px; font-weight: 700; font-size: 0.85rem; text-decoration: none; box-sizing: border-box; transition: background 0.15s; }
            .ps-cart-preview-btn:hover { background: #262626; }

            /* User dropdown */
            .ps-user-drop { position: relative; flex-shrink: 0; }
            .ps-user-btn {
                display: flex; align-items: center; gap: 8px;
                cursor: pointer; background: none; border: none; padding: 4px;
                border-radius: 8px; transition: background 0.15s;
            }
            .ps-user-btn:hover { background: #DBEAFE; }
            .ps-avatar {
                width: 34px; height: 34px; border-radius: 50%;
                background: var(--primary-light); color: var(--primary);
                font-size: 13px; font-weight: 800;
                display: flex; align-items: center; justify-content: center;
                flex-shrink: 0;
            }
            .ps-user-name { font-size: 0.85rem; font-weight: 700; color: var(--dark); white-space: nowrap; }
            .ps-user-menu {
                position: absolute; top: calc(100% + 10px); right: 0;
                background: #fff; border: 1px solid var(--border);
                border-radius: 14px; box-shadow: 0 8px 32px rgba(0,0,0,0.12);
                min-width: 220px; z-index: 999; padding: 6px; overflow: hidden;
                animation: dropIn 0.15s ease;
            }
            @keyframes dropIn {
                from { opacity: 0; transform: translateY(-6px); }
                to   { opacity: 1; transform: translateY(0); }
            }
            .ps-user-menu-head {
                display: flex; align-items: center; gap: 10px;
                padding: 10px 12px; border-bottom: 1px solid var(--border); margin-bottom: 4px;
            }
            .ps-user-menu-name { font-weight: 700; font-size: 0.875rem; color: var(--dark); }
            .ps-user-menu-email { font-size: 0.72rem; color: var(--gray); word-break: break-all; }
            .ps-drop-item {
                display: flex; align-items: center; gap: 10px;
                padding: 9px 12px; color: var(--dark); text-decoration: none;
                font-size: 0.875rem; font-weight: 600; border-radius: 8px;
                transition: background 0.15s; cursor: pointer;
                background: none; border: none; width: 100%;
                font-family: 'Nunito', sans-serif; text-align: left;
            }
            .ps-drop-item:hover { background: var(--light); color: var(--primary); }
            .ps-drop-item .drop-icon { color: var(--gray); flex-shrink: 0; transition: color 0.15s; }
            .ps-drop-item:hover .drop-icon { color: var(--primary); }
            .ps-drop-item.danger { color: var(--danger) !important; }
            .ps-drop-item.danger .drop-icon { color: var(--danger) !important; }
            .ps-drop-item.danger:hover { background: #FEF2F2 !important; }
            .ps-drop-divider { height: 1px; background: var(--border); margin: 4px 0; }

            /* Hamburger */
            .ps-hamburger {
                display: none; width: 40px; height: 40px;
                background: var(--light); border: 1.5px solid var(--border);
                border-radius: 9px; cursor: pointer; color: var(--dark);
                align-items: center; justify-content: center;
                margin-left: auto; flex-shrink: 0; transition: all 0.2s;
            }
            .ps-hamburger:hover { background: var(--primary-light); color: var(--primary); }

            /* Mobile overlay */
            .ps-mobile-overlay {
                display: none; position: fixed; inset: 0;
                background: rgba(0,0,0,0.5); z-index: 1100;
            }
            .ps-mobile-overlay.open { display: block; }

            /* Mobile menu */
            .ps-mobile-menu {
                position: fixed; top: 0; left: 0;
                width: 300px; height: 100vh; background: #fff; z-index: 1101;
                display: flex; flex-direction: column;
                transform: translateX(-100%);
                transition: transform 0.3s cubic-bezier(0.4,0,0.2,1);
                overflow-y: auto; box-shadow: 4px 0 24px rgba(0,0,0,0.12);
            }
            .ps-mobile-menu.open { transform: translateX(0); }
            .ps-mobile-head {
                display: flex; align-items: center; justify-content: space-between;
                padding: 16px; border-bottom: 1px solid var(--border);
                position: sticky; top: 0; background: #fff; z-index: 1;
            }
            .ps-mobile-close {
                width: 34px; height: 34px; background: var(--light);
                border: none; border-radius: 8px; cursor: pointer;
                color: var(--gray); display: flex; align-items: center; justify-content: center;
                transition: all 0.2s;
            }
            .ps-mobile-close:hover { background: #FEE2E2; color: var(--danger); }
            .ps-mobile-search {
                padding: 12px 16px; border-bottom: 1px solid var(--border);
            }
            .ps-mobile-search input {
                width: 100%; padding: 10px 14px;
                background: var(--light); border: 1.5px solid var(--border);
                border-radius: 10px; font-size: 0.875rem; font-family: 'Nunito', sans-serif;
                color: var(--dark); outline: none;
            }
            .ps-mobile-search input:focus { border-color: var(--primary); }
            .ps-mobile-nav-item {
                display: flex; align-items: center; gap: 12px;
                padding: 13px 20px; font-size: 0.9rem; font-weight: 600;
                color: var(--dark); text-decoration: none; transition: background 0.15s;
                cursor: pointer; border: none; background: none; width: 100%;
                font-family: 'Nunito', sans-serif; text-align: left;
            }
            .ps-mobile-nav-item:hover { background: var(--light); color: var(--primary); }
            .ps-mobile-nav-item.active { color: var(--primary); background: var(--primary-light); }
            .ps-mobile-nav-icon {
                display: flex; align-items: center; justify-content: center;
                width: 22px; flex-shrink: 0; color: var(--gray);
            }
            .ps-mobile-nav-item:hover .ps-mobile-nav-icon,
            .ps-mobile-nav-item.active .ps-mobile-nav-icon { color: var(--primary); }
            .ps-mobile-divider { height: 1px; background: var(--border); margin: 6px 16px; }
            .ps-mobile-logout {
                display: flex; align-items: center; gap: 12px;
                padding: 13px 20px; font-size: 0.9rem; font-weight: 600;
                color: var(--danger); cursor: pointer; border: none; background: none;
                width: 100%; font-family: 'Nunito', sans-serif; transition: background 0.15s;
            }
            .ps-mobile-logout:hover { background: #FEF2F2; }
            .ps-mobile-logout-icon { display: flex; align-items: center; width: 22px; flex-shrink: 0; }

            /* Responsive */
            @media (max-width: 991px) {
                .ps-nav { display: none !important; }
                .ps-user-drop { display: none !important; }
                .ps-hamburger { display: flex !important; }
            }
            @media (max-width: 600px) {
            .ps-navbar-inner { padding: 0 12px; height: 56px; }
            .ps-brand { font-size: 1.15rem; }
            .ps-search { max-width: none; flex: 1; min-width: 0; }
            .ps-search input { padding: 9px 36px 9px 12px; font-size: 0.8rem; }
            .ps-search input::placeholder { overflow: visible; white-space: nowrap; }
            .ps-search-icon { right: 10px; }
            .ps-cart-label { display: none; }
            .ps-cart { padding: 8px 10px; }
}
        `}</style>

            <header className="ps-navbar">
                <div className="ps-navbar-inner">
                    {/* Brand */}
                    <Link to="/" className="ps-brand" onClick={handleLogoClick}>
                        Nova<span>Phone</span>
                    </Link>

                    {/* Search */}
                    <div className="ps-search">
                        <input
                            type="text"
                            placeholder="Bạn cần tìm gì ?"
                            value={searchVal}
                            onChange={e => setSearchVal(e.target.value)}
                            onKeyDown={handleSearch}
                        />
                        <span className="ps-search-icon">
                            <Search size={16} />
                        </span>
                    </div>

                    {/* Nav desktop */}
                    <nav>
                        <ul className="ps-nav">
                            {NAV_ITEMS.map(item => (
                                <li key={item.to}>
                                    {item.onClick ? (
                                        <button
                                            className={`ps-nav-link${getNavActive(item.to) ? ' active' : ''}`}
                                            onClick={item.onClick}
                                        >{item.label}</button>
                                    ) : (
                                        <Link
                                            to={item.to}
                                            className={`ps-nav-link${getNavActive(item.to) ? ' active' : ''}`}
                                            onClick={() => { }}
                                        >{item.label}</Link>
                                    )}
                                </li>
                            ))}
                        </ul>
                    </nav>

                    {/* Cart */}
                    <div className="ps-cart-wrap"
                        onMouseEnter={() => setCartPreviewOpen(true)}
                        onMouseLeave={() => setCartPreviewOpen(false)}>
                        <Link to="/cart" className={`ps-cart${location.pathname === '/cart' ? ' active' : ''}`}>
                            <ShoppingCart size={18} />
                            <span className="ps-cart-label">Giỏ hàng</span>
                            {cartCount > 0 && (
                                <span className="ps-cart-badge">{cartCount > 99 ? '99+' : cartCount}</span>
                            )}
                        </Link>
                        {cartPreviewOpen && (
                            <div className="ps-cart-preview">
                                {cartItems.length === 0 ? (
                                    <div className="ps-cart-preview-empty">Giỏ hàng của bạn đang trống</div>
                                ) : (
                                    <>
                                        <div className="ps-cart-preview-title">Giỏ hàng ({cartCount} sản phẩm)</div>
                                        <div className="ps-cart-preview-list">
                                            {cartItems.map(item => (
                                                <div key={item.product._id} className="ps-cart-preview-item">
                                                    <img className="ps-cart-preview-img" src={item.product.image} alt={item.product.name}
                                                        onError={e => { e.target.src = 'https://placehold.co/48x48/F8F9FB/0057FF?text=📱' }} />
                                                    <div className="ps-cart-preview-info">
                                                        <div className="ps-cart-preview-name">{item.product.name}</div>
                                                        <div className="ps-cart-preview-qty">x{item.quantity}</div>
                                                    </div>
                                                    <div className="ps-cart-preview-price">{(item.price * item.quantity).toLocaleString('vi-VN')}đ</div>
                                                </div>
                                            ))}
                                        </div>
                                        <div className="ps-cart-preview-footer">
                                            <div className="ps-cart-preview-total">
                                                <span>Tổng tiền</span>
                                                <span>{cart.totalAmount.toLocaleString('vi-VN')}đ</span>
                                            </div>
                                            <Link to="/cart" className="ps-cart-preview-btn">Xem giỏ hàng</Link>
                                        </div>
                                    </>
                                )}
                            </div>
                        )}
                    </div>

                    {/* User dropdown — nội dung khác nhau tùy đã đăng nhập hay chưa */}
                    <div className="ps-user-drop" ref={userDropRef}>
                        {user ? (
                            <button className="ps-user-btn"
                                style={{ background: '#d3dbec', borderRadius: 100, padding: '4px 10px 4px 4px' }}
                                onClick={() => setUserDropOpen(o => !o)}>
                                <div className="ps-avatar">{initials}</div>
                                <span className="ps-user-name">{user?.name?.split(' ').slice(-1)[0]}</span>
                                <ChevronDown size={14} color="var(--gray)"
                                    style={{ transition: 'transform 0.2s', transform: userDropOpen ? 'rotate(180deg)' : 'none' }} />
                            </button>
                        ) : (
                            <button className="ps-user-btn"
                                style={{ background: '#d3dbec', borderRadius: 100, padding: '6px 14px' }}
                                onClick={() => setUserDropOpen(o => !o)}>
                                <User size={18} color="var(--dark)" />
                                <ChevronDown size={14} color="var(--gray)"
                                    style={{ transition: 'transform 0.2s', transform: userDropOpen ? 'rotate(180deg)' : 'none' }} />
                            </button>
                        )}

                        {userDropOpen && (
                            <div className="ps-user-menu">
                                {user ? (
                                    <>
                                        <div className="ps-user-menu-head">
                                            <div className="ps-avatar">{initials}</div>
                                            <div>
                                                <div className="ps-user-menu-name">{user?.name}</div>
                                                <div className="ps-user-menu-email">{user?.email}</div>
                                            </div>
                                        </div>
                                        <Link to="/profile" className="ps-drop-item"
                                            onClick={() => { setUserDropOpen(false) }}>
                                            <UserCircle size={17} className="drop-icon" />
                                            Hồ sơ cá nhân
                                        </Link>
                                        <Link to="/orders" className="ps-drop-item"
                                            onClick={() => { setUserDropOpen(false) }}>
                                            <Package size={17} className="drop-icon" />
                                            Đơn hàng của tôi
                                        </Link>
                                        <div className="ps-drop-divider" />
                                        <button className="ps-drop-item danger" onClick={handleLogout}>
                                            <LogOut size={17} className="drop-icon" />
                                            Đăng xuất
                                        </button>
                                    </>
                                ) : (
                                    <>
                                        <Link to="/login" className="ps-drop-item"
                                            onClick={() => { setUserDropOpen(false) }}>
                                            <LogIn size={17} className="drop-icon" />
                                            Đăng nhập
                                        </Link>
                                        <Link to="/register" className="ps-drop-item"
                                            onClick={() => { setUserDropOpen(false) }}>
                                            <UserPlus size={17} className="drop-icon" />
                                            Đăng ký
                                        </Link>
                                    </>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Hamburger */}
                    <button className="ps-hamburger" onClick={() => setMenuOpen(true)}>
                        <Menu size={20} />
                    </button>
                </div>
            </header>

            {/* Mobile overlay */}
            <div className={`ps-mobile-overlay${menuOpen ? ' open' : ''}`}
                onClick={() => setMenuOpen(false)} />

            {/* Mobile menu */}
            <div className={`ps-mobile-menu${menuOpen ? ' open' : ''}`}>
                <div className="ps-mobile-head">
                    <Link to="/" className="ps-brand"
                        onClick={() => { handleLogoClick(); setMenuOpen(false) }}>
                        Nova<span>Phone</span>
                    </Link>
                    <button className="ps-mobile-close" onClick={() => setMenuOpen(false)}>
                        <X size={18} />
                    </button>
                </div>

                {/* User info */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '14px 20px', borderBottom: '1px solid var(--border)', background: 'var(--light)' }}>
                    <div className="ps-avatar" style={{ width: 40, height: 40, fontSize: 15 }}>{initials}</div>
                    <div>
                        <div style={{ fontWeight: 700, fontSize: '0.875rem', color: 'var(--dark)' }}>{user?.name}</div>
                        <div style={{ fontSize: '0.72rem', color: 'var(--gray)' }}>{user?.email}</div>
                    </div>
                </div>

                {/* Search */}
                <div className="ps-mobile-search">
                    <input
                        placeholder="Tìm kiếm..."
                        value={searchVal}
                        onChange={e => setSearchVal(e.target.value)}
                        onKeyDown={e => {
                            if (e.key === 'Enter' && searchVal.trim()) {
                                navigate(`/products?search=${encodeURIComponent(searchVal.trim())}`)
                                setSearchVal(''); setMenuOpen(false)
                            }
                        }}
                    />
                </div>

                {/* Nav items */}
                {MOBILE_NAV.map(item => (
                    item.onClick ? (
                        <button key={item.to}
                            className={`ps-mobile-nav-item${getNavActive(item.to) ? ' active' : ''}`}
                            onClick={item.onClick}>
                            <span className="ps-mobile-nav-icon">{item.icon}</span>
                            {item.label}
                        </button>
                    ) : (
                        <Link key={item.to} to={item.to}
                            className={`ps-mobile-nav-item${getNavActive(item.to) ? ' active' : ''}`}
                            onClick={() => { setMenuOpen(false) }}>
                            <span className="ps-mobile-nav-icon">{item.icon}</span>
                            {item.label}
                        </Link>
                    )
                ))}

                <div className="ps-mobile-divider" />
                <button className="ps-mobile-logout" onClick={handleLogout}>
                    <span className="ps-mobile-logout-icon"><LogOut size={18} /></span>
                    Đăng xuất
                </button>
            </div>
        </>
    )
}