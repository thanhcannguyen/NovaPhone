// src/pages/admin/Dashboard.jsx — PHP style + responsive
import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Topbar from '../../components/admin/Topbar'
import Pagination from '../../components/admin/Pagination'
import { getCategories } from '../../api/categoryApi'
import { getProducts } from '../../api/productApi'
import { getAllUsers } from '../../api/userApi'
import { getAllOrdersApi } from '../../api/orderApi'

const STATUS_MAP = {
    pending: { label: 'Chờ xác nhận', color: '#B45309', bg: '#FEF3E2', border: '#FDE68A' },
    confirmed: { label: 'Đã xác nhận', color: '#0040CC', bg: '#EEF4FF', border: '#BFDBFE' },
    shipping: { label: 'Đang giao', color: '#6D28D9', bg: '#F5F3FF', border: '#DDD6FE' },
    delivered: { label: 'Đã giao', color: '#15803D', bg: '#F0FDF4', border: '#BBF7D0' },
    cancelled: { label: 'Đã huỷ', color: '#DC2626', bg: '#FEF2F2', border: '#FECACA' },
}

export default function Dashboard() {
    const navigate = useNavigate()
    const [loading, setLoading] = useState(true)
    const [data, setData] = useState({ categories: 0, products: 0, users: 0, orders: [] })
    const [currentPage, setCurrentPage] = useState(1)
    const ITEMS_PER_PAGE = 6

    useEffect(() => {
        Promise.all([getCategories(), getProducts(), getAllUsers(), getAllOrdersApi()])
            .then(([c, p, u, o]) => setData({ categories: c.data.total, products: p.data.total, users: u.data.total, orders: o.data.data }))
            .catch(console.error).finally(() => setLoading(false))
    }, [])

    const orders = data.orders
    const totalRevenue = orders.filter(o => o.status === 'delivered').reduce((s, o) => s + o.totalAmount, 0)
    const pendingCount = orders.filter(o => o.status === 'pending').length
    const orderByStatus = Object.keys(STATUS_MAP).reduce((a, k) => ({ ...a, [k]: orders.filter(o => o.status === k).length }), {})
    const totalPages = Math.ceil(orders.length / ITEMS_PER_PAGE)
    const paginatedOrders = orders.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE)

    const today = new Date().toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' })

    const STAT_CARDS = [
        { label: 'Doanh thu', value: totalRevenue.toLocaleString('vi-VN') + 'đ', sub: 'Từ đơn đã giao', subClass: '', iconBg: '#EEF4FF', icon: '💰', iconColor: '#0057FF' },
        { label: 'Đơn hàng', value: orders.length, sub: pendingCount > 0 ? `${pendingCount} chờ xác nhận` : 'Không có đơn chờ', subClass: pendingCount > 0 ? 'warning' : '', iconBg: '#FFFBEB', icon: '📦', iconColor: '#D97706' },
        { label: 'Sản phẩm', value: data.products, sub: `${data.categories} danh mục`, subClass: '', iconBg: '#F0FDF4', icon: '📱', iconColor: '#16A34A' },
        { label: 'Khách hàng', value: data.users, sub: 'Đã đăng ký', subClass: '', iconBg: '#F5F3FF', icon: '👥', iconColor: '#7C3AED' },
    ]

    return (
        <div>
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Nunito:wght@400;500;600;700;800&display=swap');
                /* Stats */
                .dash-stats { display: grid; grid-template-columns: repeat(4,1fr); gap: 16px; margin-bottom: 24px; }
                .stat-card { background: #fff; border: 1px solid #E5E7EB; border-radius: 14px; padding: 20px; display: flex; align-items: flex-start; justify-content: space-between; transition: all 0.2s; }
                .stat-card:hover { box-shadow: 0 4px 16px rgba(0,0,0,0.06); transform: translateY(-1px); }
                .stat-label { font-size: 0.75rem; font-weight: 700; color: #6B7280; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 6px; }
                .stat-value { font-size: 1.5rem; font-weight: 800; color: #0A0A0A; line-height: 1; margin-bottom: 4px; }
                .stat-sub { font-size: 0.75rem; color: #6B7280; }
                .stat-sub.warning { color: #D97706; font-weight: 700; }
                .stat-sub.danger  { color: #EF4444; font-weight: 700; }
                .stat-icon { width: 46px; height: 46px; border-radius: 12px; display: flex; align-items: center; justify-content: center; font-size: 1.3rem; flex-shrink: 0; }
                /* Section cards */
                .section-card { background: #fff; border: 1px solid #E5E7EB; border-radius: 14px; overflow: hidden; margin-bottom: 16px; }
                .section-card-header { display: flex; align-items: center; justify-content: space-between; padding: 16px 20px; border-bottom: 1px solid #E5E7EB; }
                .section-card-title { font-size: 0.9rem; font-weight: 800; color: #0A0A0A; display: flex; align-items: center; gap: 8px; }
                .section-card-title::before { content: ''; display: inline-block; width: 3px; height: 16px; background: #0057FF; border-radius: 2px; }
                .btn-view-all { font-size: 0.78rem; font-weight: 700; color: #0057FF; text-decoration: none; border: 1.5px solid #0057FF; border-radius: 8px; padding: 5px 12px; transition: all 0.2s; background: none; cursor: pointer; font-family: 'Nunito',sans-serif; }
                .btn-view-all:hover { background: #0057FF; color: #fff; }
                /* Table */
                .admin-table { width: 100%; border-collapse: collapse; font-family: 'Nunito',sans-serif; }
                .admin-table th { padding: 10px 16px; text-align: left; font-size: 0.72rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; color: #6B7280; background: #F8F9FB; border-bottom: 1px solid #E5E7EB; white-space: nowrap; }
                .admin-table td { padding: 12px 16px; font-size: 0.85rem; border-bottom: 1px solid #F9FAFB; vertical-align: middle; }
                .admin-table tr:last-child td { border-bottom: none; }
                .admin-table tr:hover td { background: #FAFAFA; }
                /* Status badge */
                .status-badge { display: inline-flex; align-items: center; font-size: 0.72rem; font-weight: 700; padding: 3px 10px; border-radius: 100px; border: 1px solid; white-space: nowrap; }
                /* Quick actions */
                .quick-actions { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; padding: 16px; }
                .quick-action-btn {
                    display: flex; align-items: center; justify-content: flex-start; gap: 8px;
                    padding: 10px 12px;
                    background: #F8F9FB; border: 1.5px solid #E5E7EB; border-radius: 10px;
                    font-size: 0.82rem; font-weight: 600; color: #0A0A0A;
                    cursor: pointer; transition: all 0.2s;
                    text-decoration: none; font-family: 'Nunito',sans-serif;
                    white-space: nowrap; overflow: hidden;
                    min-height: 42px;
                }
                .quick-action-btn:hover { border-color: #0057FF; color: #0057FF; background: #EEF4FF; }
                .quick-action-btn span:first-child { flex-shrink: 0; }
                .quick-action-btn .btn-label { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
                /* 2-col layout */
                .dash-body { display: grid; grid-template-columns: 1fr 340px; gap: 16px; align-items: start; }
                /* Responsive */
                @media (max-width: 1100px) { .dash-stats { grid-template-columns: repeat(2,1fr); } }
                @media (max-width: 900px) { .dash-body { grid-template-columns: 1fr; } }
                @media (max-width: 768px) {
                    .page-body { padding: 16px !important; }
                    .admin-table th:nth-child(5), .admin-table td:nth-child(5) { display: none; }
                    .dash-topbar-btn { white-space: nowrap !important; padding: 7px 12px !important; font-size: 0.78rem !important; }
                }
                @media (max-width: 480px) {
                    .dash-stats { grid-template-columns: repeat(2,1fr); gap: 8px; }
                    /* Stat card: dùng flex column, icon nhỏ lại */
                    .stat-card { padding: 12px; flex-direction: column; gap: 8px; align-items: flex-start; }
                    .stat-value { font-size: 1.1rem; }
                    .stat-label { font-size: 0.65rem; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 100%; }
                    .stat-sub { font-size: 0.68rem; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 100%; }
                    .stat-icon { width: 32px; height: 32px; font-size: 0.9rem; border-radius: 8px; }
                    .admin-table th:nth-child(4), .admin-table td:nth-child(4) { display: none; }
                    .quick-action-btn { font-size: 0.75rem; padding: 9px 10px; gap: 6px; }
                }
            `}</style>

            <Topbar
                title="Dashboard"
                subtitle={`Tổng quan hệ thống — ${today}`}
                actions={
                    <button
                        className="dash-topbar-btn"
                        style={{ background: '#0057FF', color: '#fff', border: 'none', borderRadius: 8, padding: '8px 16px', fontSize: '0.82rem', fontWeight: 700, cursor: 'pointer', fontFamily: 'Nunito,sans-serif', display: 'flex', alignItems: 'center', gap: 6, whiteSpace: 'nowrap', flexShrink: 0 }}
                        onClick={() => navigate('/admin/products')}>
                        Thêm sản phẩm
                    </button>
                }
            />

            <div className="page-body" style={{ padding: 24 }}>
                {/* Stat cards */}
                <div className="dash-stats">
                    {STAT_CARDS.map(card => (
                        <div key={card.label} className="stat-card">
                            <div>
                                <div className="stat-label">{card.label}</div>
                                <div className="stat-value">{loading ? '...' : card.value}</div>
                                <div className={`stat-sub ${card.subClass}`}>{card.sub}</div>
                            </div>
                            <div className="stat-icon" style={{ background: card.iconBg }}>
                                <span style={{ fontSize: '1.3rem' }}>{card.icon}</span>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Body: table + sidebar */}
                <div className="dash-body">
                    {/* Recent orders table */}
                    <div className="section-card">
                        <div className="section-card-header">
                            <div className="section-card-title">🛍️ Đơn hàng mới nhất</div>
                            <button className="btn-view-all" onClick={() => navigate('/admin/orders')}>Xem tất cả </button>
                        </div>
                        <div style={{ overflowX: 'auto' }}>
                            <table className="admin-table">
                                <thead>
                                    <tr>
                                        <th>Mã đơn</th>
                                        <th>Khách hàng</th>
                                        <th>Tổng tiền</th>
                                        <th>Trạng thái</th>
                                        <th>Ngày đặt</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {loading ? (
                                        <tr><td colSpan={5} style={{ textAlign: 'center', padding: 32, color: '#6B7280' }}>Đang tải...</td></tr>
                                    ) : paginatedOrders.length === 0 ? (
                                        <tr><td colSpan={5} style={{ textAlign: 'center', padding: 32, color: '#6B7280' }}>Chưa có đơn hàng nào</td></tr>
                                    ) : paginatedOrders.map(order => {
                                        const s = STATUS_MAP[order.status] || STATUS_MAP.pending
                                        return (
                                            <tr key={order._id} style={{ cursor: 'pointer' }} onClick={() => navigate('/admin/orders')}>
                                                <td>
                                                    <span style={{ fontFamily: 'monospace', fontSize: '0.78rem', color: '#0057FF', fontWeight: 700, background: '#EEF4FF', padding: '2px 8px', borderRadius: 5 }}>
                                                        #{order._id.slice(-7).toUpperCase()}
                                                    </span>
                                                </td>
                                                <td>
                                                    <div style={{ fontWeight: 700, fontSize: '0.85rem', color: '#0A0A0A' }}>{order.user?.name || '—'}</div>
                                                    <div style={{ fontSize: '0.72rem', color: '#6B7280' }}>{order.shippingInfo?.phone || order.user?.email || ''}</div>
                                                </td>
                                                <td style={{ fontWeight: 800, color: '#EF4444' }}>{order.totalAmount.toLocaleString('vi-VN')}đ</td>
                                                <td>
                                                    <span className="status-badge" style={{ color: s.color, background: s.bg, borderColor: s.border }}>{s.label}</span>
                                                </td>
                                                <td style={{ color: '#6B7280', fontSize: '0.78rem', whiteSpace: 'nowrap' }}>
                                                    {new Date(order.createdAt).toLocaleString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' })}
                                                </td>
                                            </tr>
                                        )
                                    })}
                                </tbody>
                            </table>
                        </div>
                        {totalPages > 1 && (
                            <div style={{ padding: '12px 20px', borderTop: '1px solid #F8F9FB' }}>
                                <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
                            </div>
                        )}
                    </div>

                    {/* Right column */}
                    <div>
                        {/* Order status breakdown */}
                        <div className="section-card">
                            <div className="section-card-header">
                                <div className="section-card-title">📊 Theo trạng thái</div>
                            </div>
                            <div style={{ padding: '16px 20px' }}>
                                {Object.entries(STATUS_MAP).map(([key, info]) => {
                                    const count = orderByStatus[key] || 0
                                    const pct = orders.length > 0 ? (count / orders.length) * 100 : 0
                                    return (
                                        <div key={key} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
                                            <span style={{ width: 8, height: 8, borderRadius: '50%', background: info.color, flexShrink: 0 }} />
                                            <span style={{ fontSize: '0.78rem', color: '#0A0A0A', width: 110, flexShrink: 0 }}>{info.label}</span>
                                            <div style={{ flex: 1, height: 6, background: '#F3F4F6', borderRadius: 3, overflow: 'hidden' }}>
                                                <div style={{ width: `${pct}%`, height: '100%', background: info.color, borderRadius: 3, transition: 'width 0.8s ease' }} />
                                            </div>
                                            <span style={{ fontSize: '0.78rem', fontWeight: 700, color: info.color, width: 22, textAlign: 'right', flexShrink: 0 }}>{count}</span>
                                        </div>
                                    )
                                })}
                            </div>
                        </div>

                        {/* Quick actions */}
                        <div className="section-card">
                            <div className="section-card-header">
                                <div className="section-card-title">⚡ Thao tác nhanh</div>
                            </div>
                            <div className="quick-actions">
                                {[
                                    { icon: '➕', label: 'Thêm sản phẩm', path: '/admin/products' },
                                    { icon: '⏳', label: `Đơn chờ (${pendingCount})`, path: '/admin/orders' },
                                    { icon: '📂', label: 'Danh mục', path: '/admin/categories' },
                                    { icon: '👥', label: 'Khách hàng', path: '/admin/users' },
                                ].map(item => (
                                    <button key={item.label} className="quick-action-btn" onClick={() => navigate(item.path)}>
                                        <span>{item.icon}</span>
                                        <span className="btn-label">{item.label}</span>
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}