import { useState, useEffect, useRef } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext.jsx'
import { useCart } from '../../context/CartContext.jsx'
import {
    Search, ShoppingCart, User, Package, LogOut,
    Menu, X, ChevronDown, Smartphone, ClipboardList, Home,
    UserCircle, ShieldCheck, MessageSquare, LogIn, UserPlus, Trash2
} from 'lucide-react'
import styles from './Header.module.css'

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

            <header className={styles.navbar} style={{ boxShadow: scrolled ? '0 2px 12px rgba(0,0,0,0.08)' : '0 1px 4px rgba(0,0,0,0.04)' }}>
                <div className={styles.navbarInner}>
                    {/* Brand */}
                    <Link to="/" className={styles.brand} onClick={handleLogoClick}>
                        Nova<span>Phone</span>
                    </Link>

                    {/* Search */}
                    <div className={styles.search}>
                        <input
                            type="text"
                            placeholder="Bạn cần tìm gì ?"
                            value={searchVal}
                            onChange={e => setSearchVal(e.target.value)}
                            onKeyDown={handleSearch}
                        />
                        <span className={styles.searchIcon}>
                            <Search size={16} />
                        </span>
                    </div>

                    {/* Nav desktop */}
                    <nav>
                        <ul className={styles.nav}>
                            {NAV_ITEMS.map(item => (
                                <li key={item.to}>
                                    {item.onClick ? (
                                        <button
                                            className={`${styles.navLink}${getNavActive(item.to) ? ' ' + styles.active : ''}`}
                                            onClick={item.onClick}
                                        >{item.label}</button>
                                    ) : (
                                        <Link
                                            to={item.to}
                                            className={`${styles.navLink}${getNavActive(item.to) ? ' ' + styles.active : ''}`}
                                            onClick={() => { }}
                                        >{item.label}</Link>
                                    )}
                                </li>
                            ))}
                        </ul>
                    </nav>

                    {/* Cart */}
                    <div className={styles.cartWrap}
                        onMouseEnter={() => setCartPreviewOpen(true)}
                        onMouseLeave={() => setCartPreviewOpen(false)}>
                        <Link to="/cart" className={`${styles.cart}${location.pathname === '/cart' ? ' ' + styles.active : ''}`}>
                            <ShoppingCart size={18} />
                            <span className={styles.cartLabel}>Giỏ hàng</span>
                            {cartCount > 0 && (
                                <span className={styles.cartBadge}>{cartCount > 99 ? '99+' : cartCount}</span>
                            )}
                        </Link>
                        {cartPreviewOpen && (
                            <div className={styles.cartPreview}>
                                {cartItems.length === 0 ? (
                                    <div className={styles.cartPreviewEmpty}>Giỏ hàng của bạn đang trống</div>
                                ) : (
                                    <>
                                        <div className={styles.cartPreviewTitle}>Giỏ hàng ({cartCount} sản phẩm)</div>
                                        <div className={styles.cartPreviewList}>
                                            {cartItems.map(item => (
                                                <div key={item.product._id} className={styles.cartPreviewItem}>
                                                    <img className={styles.cartPreviewImg} src={item.product.image} alt={item.product.name}
                                                        onError={e => { e.target.src = 'https://placehold.co/48x48/F8F9FB/0057FF?text=📱' }} />
                                                    <div className={styles.cartPreviewInfo}>
                                                        <div className={styles.cartPreviewName}>{item.product.name}</div>
                                                        <div className={styles.cartPreviewQty}>x{item.quantity}</div>
                                                    </div>
                                                    <div className={styles.cartPreviewPrice}>{(item.price * item.quantity).toLocaleString('vi-VN')}đ</div>
                                                </div>
                                            ))}
                                        </div>
                                        <div className={styles.cartPreviewFooter}>
                                            <div className={styles.cartPreviewTotal}>
                                                <span>Tổng tiền</span>
                                                <span>{cart.totalAmount.toLocaleString('vi-VN')}đ</span>
                                            </div>
                                            <Link to="/cart" className={styles.cartPreviewBtn}>Xem giỏ hàng</Link>
                                        </div>
                                    </>
                                )}
                            </div>
                        )}
                    </div>

                    {/* User dropdown — nội dung khác nhau tùy đã đăng nhập hay chưa */}
                    <div className={styles.userDrop} ref={userDropRef}>
                        {user ? (
                            <button className={styles.userBtn}
                                style={{ background: '#d3dbec', borderRadius: 100, padding: '4px 10px 4px 4px' }}
                                onClick={() => setUserDropOpen(o => !o)}>
                                <div className={styles.avatar}>{initials}</div>
                                <span className={styles.userName}>{user?.name?.split(' ').slice(-1)[0]}</span>
                                <ChevronDown size={14} color="var(--gray)"
                                    style={{ transition: 'transform 0.2s', transform: userDropOpen ? 'rotate(180deg)' : 'none' }} />
                            </button>
                        ) : (
                            <button className={styles.userBtn}
                                style={{ background: '#d3dbec', borderRadius: 100, padding: '6px 14px' }}
                                onClick={() => setUserDropOpen(o => !o)}>
                                <User size={18} color="var(--dark)" />
                                <ChevronDown size={14} color="var(--gray)"
                                    style={{ transition: 'transform 0.2s', transform: userDropOpen ? 'rotate(180deg)' : 'none' }} />
                            </button>
                        )}

                        {userDropOpen && (
                            <div className={styles.userMenu}>
                                {user ? (
                                    <>
                                        <div className={styles.userMenuHead}>
                                            <div className={styles.avatar}>{initials}</div>
                                            <div>
                                                <div className={styles.userMenuName}>{user?.name}</div>
                                                <div className={styles.userMenuEmail}>{user?.email}</div>
                                            </div>
                                        </div>
                                        <Link to="/profile" className={styles.dropItem}
                                            onClick={() => { setUserDropOpen(false) }}>
                                            <UserCircle size={17} className={styles.dropIcon} />
                                            Hồ sơ cá nhân
                                        </Link>
                                        <Link to="/orders" className={styles.dropItem}
                                            onClick={() => { setUserDropOpen(false) }}>
                                            <Package size={17} className={styles.dropIcon} />
                                            Đơn hàng của tôi
                                        </Link>
                                        <div className={styles.dropDivider} />
                                        <button className={`${styles.dropItem} ${styles.danger}`} onClick={handleLogout}>
                                            <LogOut size={17} className={styles.dropIcon} />
                                            Đăng xuất
                                        </button>
                                    </>
                                ) : (
                                    <>
                                        <Link to="/login" className={styles.dropItem}
                                            onClick={() => { setUserDropOpen(false) }}>
                                            <LogIn size={17} className={styles.dropIcon} />
                                            Đăng nhập
                                        </Link>
                                        <Link to="/register" className={styles.dropItem}
                                            onClick={() => { setUserDropOpen(false) }}>
                                            <UserPlus size={17} className={styles.dropIcon} />
                                            Đăng ký
                                        </Link>
                                    </>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Hamburger */}
                    <button className={styles.hamburger} onClick={() => setMenuOpen(true)}>
                        <Menu size={20} />
                    </button>
                </div>
            </header>

            {/* Mobile overlay */}
            <div className={`${styles.mobileOverlay}${menuOpen ? ' ' + styles.open : ''}`}
                onClick={() => setMenuOpen(false)} />

            {/* Mobile menu */}
            <div className={`${styles.mobileMenu}${menuOpen ? ' ' + styles.open : ''}`}>
                <div className={styles.mobileHead}>
                    <Link to="/" className={styles.brand}
                        onClick={() => { handleLogoClick(); setMenuOpen(false) }}>
                        Nova<span>Phone</span>
                    </Link>
                    <button className={styles.mobileClose} onClick={() => setMenuOpen(false)}>
                        <X size={18} />
                    </button>
                </div>

                {/* User info */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '14px 20px', borderBottom: '1px solid var(--border)', background: 'var(--light)' }}>
                    <div className={styles.avatar} style={{ width: 40, height: 40, fontSize: 15 }}>{initials}</div>
                    <div>
                        <div style={{ fontWeight: 700, fontSize: '0.875rem', color: 'var(--dark)' }}>{user?.name}</div>
                        <div style={{ fontSize: '0.72rem', color: 'var(--gray)' }}>{user?.email}</div>
                    </div>
                </div>

                {/* Search */}
                <div className={styles.mobileSearch}>
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
                            className={`${styles.mobileNavItem}${getNavActive(item.to) ? ' ' + styles.active : ''}`}
                            onClick={item.onClick}>
                            <span className={styles.mobileNavIcon}>{item.icon}</span>
                            {item.label}
                        </button>
                    ) : (
                        <Link key={item.to} to={item.to}
                            className={`${styles.mobileNavItem}${getNavActive(item.to) ? ' ' + styles.active : ''}`}
                            onClick={() => { setMenuOpen(false) }}>
                            <span className={styles.mobileNavIcon}>{item.icon}</span>
                            {item.label}
                        </Link>
                    )
                ))}

                <div className={styles.mobileDivider} />
                <button className={styles.mobileLogout} onClick={handleLogout}>
                    <span className={styles.mobileLogoutIcon}><LogOut size={18} /></span>
                    Đăng xuất
                </button>
            </div>
        </>
    )
}