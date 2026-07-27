import { useState, useEffect } from 'react'
import { NavLink, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import {
    LayoutDashboard, Smartphone, FolderOpen,
    ShoppingBag, Users, Globe, LogOut, Menu, X
} from 'lucide-react'

const IS = { display: 'block', border: 'none', outline: 'none', background: 'none', boxShadow: 'none', flexShrink: 0 }

const NAV = [
    { path: '/admin', label: 'Dashboard', icon: <LayoutDashboard size={17} style={IS} />, end: true, section: 'Tổng quan' },
    { path: '/admin/products', label: 'Sản phẩm', icon: <Smartphone size={17} style={IS} />, section: 'Quản lý' },
    { path: '/admin/categories', label: 'Danh mục', icon: <FolderOpen size={17} style={IS} /> },
    { path: '/admin/orders', label: 'Đơn hàng', icon: <ShoppingBag size={17} style={IS} /> },
    { path: '/admin/users', label: 'Khách hàng', icon: <Users size={17} style={IS} /> },
    { path: '/products', label: 'Xem website', icon: <Globe size={17} style={IS} />, external: true, section: 'Khác' },
]

export default function Sidebar() {
    const { user, logout } = useAuth()
    const navigate = useNavigate()
    const location = useLocation()
    const [drawerOpen, setDrawerOpen] = useState(false)

    useEffect(() => { setDrawerOpen(false) }, [location.pathname])

    useEffect(() => {
        document.body.style.overflow = drawerOpen ? 'hidden' : ''
        return () => { document.body.style.overflow = '' }
    }, [drawerOpen])

    const handleLogout = () => { logout(); navigate('/login') }
    const initials = user?.name?.split(' ').map(w => w[0]).slice(-2).join('').toUpperCase() || 'AD'

    const SidebarContent = ({ onClose }) => (
        <>
            {/* Brand */}
            <div style={cs.brand}>
                <a href="/products" target="_blank" style={cs.brandLink}>
                    Nova<span style={{ color: '#0057FF' }}>Phone</span>
                </a>
                <div style={cs.brandSub}>Admin Panel</div>
            </div>

            {/* Nav */}
            <nav style={cs.nav}>
                {NAV.map((item, idx) => {
                    const prevItem = NAV[idx - 1]
                    const showSection = item.section && item.section !== prevItem?.section
                    return (
                        <div key={item.path}>
                            {showSection && <div style={cs.section}>{item.section}</div>}
                            {item.external ? (
                                <a href={item.path} target="_blank" rel="noreferrer"
                                    className="admin-nav-link-item"
                                    onClick={onClose}>
                                    <span style={cs.iconWrap}>{item.icon}</span>
                                    {item.label}
                                </a>
                            ) : (
                                <NavLink
                                    to={item.path}
                                    end={item.end}
                                    className={({ isActive }) =>
                                        `admin-nav-link-item${isActive ? ' active' : ''}`
                                    }
                                    onClick={onClose}
                                >
                                    <span style={cs.iconWrap}>{item.icon}</span>
                                    {item.label}
                                </NavLink>
                            )}
                        </div>
                    )
                })}
            </nav>

            {/* Footer */}
            <div style={cs.footer}>
                <div style={cs.userRow}>
                    <div style={cs.avatar}>{initials}</div>
                    <div style={{ minWidth: 0, flex: 1 }}>
                        <div style={cs.userName}>{user?.name || 'Admin'}</div>
                        <div style={cs.userRole}>Quản trị viên</div>
                    </div>
                </div>
                <button className="admin-logout-btn" onClick={handleLogout}>
                    <LogOut size={15} style={IS} /> Đăng xuất
                </button>
            </div>
        </>
    )

    return (
        <>
            <style>{`
            @import url('https://fonts.googleapis.com/css2?family=Nunito:wght@400;500;600;700;800&display=swap');
            /* SVG reset cho toàn sidebar */
            .admin-sidebar-desktop svg,
            .admin-mobile-topbar svg,
            .admin-drawer svg { 
                display: block !important;
                border: none !important;
                outline: none !important;
                box-shadow: none !important;
                background: transparent !important;
            }
            /* Nav link hover */
            .admin-nav-link-item {
                display: flex; align-items: center; gap: 10px;
                padding: 10px 20px;
                color: rgba(255,255,255,0.5);
                text-decoration: none;
                font-size: 0.875rem; font-weight: 600;
                transition: all 0.18s;
                border-left: 3px solid transparent;
                font-family: 'Nunito', sans-serif;
                cursor: pointer; background: none; width: 100%; text-align: left;
            }
            .admin-nav-link-item:hover {
                color: #fff;
                background: rgba(255,255,255,0.07);
                border-left-color: rgba(255,255,255,0.2);
                padding-left: 24px;
            }
            .admin-nav-link-item.active {
                background: rgba(0,87,255,0.18);
                color: #fff;
                border-left-color: #0057FF;
            }
            .admin-nav-link-item.active:hover {
                background: rgba(0,87,255,0.25);
                padding-left: 24px;
            }
            /* Logout btn hover */
            .admin-logout-btn {
                display: flex; align-items: center; gap: 8px; width: 100%;
                background: rgba(239,68,68,0.1);
                border: 1px solid rgba(239,68,68,0.2);
                color: #F87171; border-radius: 8px;
                padding: 8px 12px; font-size: 0.8rem; font-weight: 700;
                font-family: 'Nunito', sans-serif; cursor: pointer;
                transition: all 0.2s;
            }
            .admin-logout-btn:hover {
                background: rgba(239,68,68,0.22);
                border-color: rgba(239,68,68,0.4);
                color: #FCA5A5;
                transform: translateX(2px);
            }
            .admin-sidebar-desktop {
                position: fixed; top: 0; left: 0;
                width: 240px; height: 100vh;
                background: #0A0A0A;
                display: flex; flex-direction: column;
                z-index: 100; overflow-y: auto;
                font-family: 'Nunito', sans-serif;
            }
            .admin-mobile-topbar {
                display: none;
                background: #0A0A0A; height: 56px;
                padding: 0 16px;
                align-items: center; justify-content: space-between;
                position: sticky; top: 0; z-index: 100;
                border-bottom: 1px solid rgba(255,255,255,0.08);
                font-family: 'Nunito', sans-serif;
            }
            .admin-hamburger {
                width: 38px; height: 38px;
                background: rgba(255,255,255,0.08);
                border: 1.5px solid rgba(255,255,255,0.15);
                border-radius: 9px; cursor: pointer; color: #fff;
                display: flex; align-items: center; justify-content: center;
                transition: background 0.15s;
            }
            .admin-hamburger:hover { background: rgba(255,255,255,0.15); }
            .admin-mobile-brand { font-size: 1.15rem; font-weight: 800; color: #fff; letter-spacing: -0.3px; }
            .admin-mobile-brand span { color: #0057FF; }
            .admin-drawer-overlay {
                display: none; position: fixed; inset: 0;
                background: rgba(0,0,0,0.6); z-index: 200;
            }
            .admin-drawer-overlay.open { display: block; }
            .admin-drawer {
                position: fixed; top: 0; left: 0;
                width: 260px; height: 100vh;
                background: #0A0A0A; z-index: 201;
                transform: translateX(-100%);
                transition: transform 0.28s cubic-bezier(0.4,0,0.2,1);
                display: flex; flex-direction: column;
                overflow-y: auto; font-family: 'Nunito', sans-serif;
            }
            .admin-drawer.open { transform: translateX(0); }
            @media (min-width: 769px) {
                .admin-sidebar-desktop { display: flex !important; }
                .admin-mobile-topbar { display: none !important; }
            }
            @media (max-width: 768px) {
                .admin-sidebar-desktop { display: none !important; }
                .admin-mobile-topbar { display: flex !important; }
            }
        `}</style>

            {/* Desktop sidebar */}
            <aside className="admin-sidebar-desktop">
                <SidebarContent onClose={() => { }} />
            </aside>

            {/* Mobile topbar */}
            <div className="admin-mobile-topbar">
                <button className="admin-hamburger" onClick={() => setDrawerOpen(true)}>
                    <Menu size={20} style={IS} />
                </button>
                <div className="admin-mobile-brand">Phone<span>Store</span></div>
                <div style={{ ...cs.avatar, cursor: 'default' }}>{initials}</div>
            </div>

            {/* Mobile drawer overlay */}
            <div className={`admin-drawer-overlay${drawerOpen ? ' open' : ''}`}
                onClick={() => setDrawerOpen(false)} />

            {/* Mobile drawer */}
            <div className={`admin-drawer${drawerOpen ? ' open' : ''}`}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 20px', borderBottom: '1px solid rgba(255,255,255,0.08)', flexShrink: 0 }}>
                    <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#fff', letterSpacing: -0.3 }}>
                        Phone<span style={{ color: '#0057FF' }}>Store</span>
                        <span style={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.3)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1, display: 'block', marginTop: 2 }}>Admin Panel</span>
                    </div>
                    <button style={{ background: 'rgba(255,255,255,0.08)', border: 'none', color: '#fff', width: 30, height: 30, borderRadius: 7, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                        onClick={() => setDrawerOpen(false)}>
                        <X size={16} style={IS} />
                    </button>
                </div>
                <SidebarContent onClose={() => setDrawerOpen(false)} />
            </div>
        </>
    )
}

const cs = {
    brand: { padding: '20px 20px 16px', borderBottom: '1px solid rgba(255,255,255,0.08)', flexShrink: 0 },
    brandLink: { fontSize: '1.3rem', fontWeight: 800, color: '#fff', textDecoration: 'none', letterSpacing: -0.3 },
    brandSub: { fontSize: '0.62rem', color: 'rgba(255,255,255,0.28)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1.2px', marginTop: 2 },
    nav: { padding: '10px 0', flex: 1 },
    section: { fontSize: '0.62rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1.5px', color: 'rgba(255,255,255,0.22)', padding: '14px 20px 5px' },
    navLink: { display: 'flex', alignItems: 'center', gap: 10, padding: '10px 20px', color: 'rgba(255,255,255,0.5)', textDecoration: 'none', fontSize: '0.875rem', fontWeight: 600, transition: 'all 0.15s', borderLeft: '3px solid transparent', fontFamily: 'Nunito, sans-serif' },
    navLinkActive: { background: 'rgba(0,87,255,0.15)', color: '#fff', borderLeftColor: '#0057FF' },
    iconWrap: { display: 'flex', alignItems: 'center', width: 18, flexShrink: 0, color: 'inherit' },
    footer: { padding: '16px 20px', borderTop: '1px solid rgba(255,255,255,0.08)', flexShrink: 0 },
    userRow: { display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 },
    avatar: { width: 34, height: 34, borderRadius: '50%', background: 'rgba(0,87,255,0.3)', border: '1px solid rgba(0,87,255,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#60A5FA', fontSize: '0.78rem', fontWeight: 800, flexShrink: 0 },
    userName: { fontSize: '0.82rem', fontWeight: 700, color: '#fff', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' },
    userRole: { fontSize: '0.65rem', color: 'rgba(255,255,255,0.32)', marginTop: 1 },
    logoutBtn: { display: 'flex', alignItems: 'center', gap: 8, width: '100%', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', color: '#F87171', borderRadius: 8, padding: '8px 12px', fontSize: '0.8rem', fontWeight: 700, fontFamily: 'Nunito, sans-serif', cursor: 'pointer', transition: 'all 0.2s' },
}