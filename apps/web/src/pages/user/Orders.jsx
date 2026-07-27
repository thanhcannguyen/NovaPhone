// src/pages/user/Orders.jsx — PHP style
import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { getMyOrdersApi } from '../../api/orderApi'

const STATUS_MAP = {
    pending: { label: 'Chờ xác nhận', color: '#B45309', bg: '#FEF3E2', border: '#FDE68A' },
    confirmed: { label: 'Đã xác nhận', color: '#0040CC', bg: '#EEF4FF', border: '#BFDBFE' },
    shipping: { label: 'Đang giao', color: '#6D28D9', bg: '#F5F3FF', border: '#DDD6FE' },
    delivered: { label: 'Đã giao', color: '#15803D', bg: '#F0FDF4', border: '#BBF7D0' },
    cancelled: { label: 'Đã huỷ', color: '#DC2626', bg: '#FEF2F2', border: '#FECACA' },
}

export default function Orders() {
    const navigate = useNavigate()
    const [orders, setOrders] = useState([])
    const [loading, setLoading] = useState(true)
    const [filter, setFilter] = useState('all')

    useEffect(() => {
        getMyOrdersApi().then(r => setOrders(r.data.data)).catch(console.error).finally(() => setLoading(false))
    }, [])

    const counts = { all: orders.length, ...Object.keys(STATUS_MAP).reduce((a, k) => ({ ...a, [k]: orders.filter(o => o.status === k).length }), {}) }
    const filtered = filter === 'all' ? orders : orders.filter(o => o.status === filter)

    return (
        <div style={{ background: '#F8F9FB', minHeight: '100vh', fontFamily: 'Nunito,sans-serif' }}>
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Nunito:wght@400;500;600;700;800&display=swap');
                .orders-wrap { max-width: 1280px; margin: 0 auto; padding: 32px 24px; }
                .page-header { margin-bottom: 24px; }
                .page-header h1 { font-size: 1.5rem; font-weight: 800; color: #0A0A0A; margin: 0 0 4px; }
                .page-header p { color: #6B7280; font-size: 0.875rem; margin: 0; }
                .filter-tabs { display: flex; gap: 6px; flex-wrap: wrap; margin-bottom: 20px; }
                .filter-tab { display: inline-flex; align-items: center; gap: 6px; padding: 7px 14px; border-radius: 100px; font-size: 0.82rem; font-weight: 700; border: 1.5px solid #E5E7EB; color: #6B7280; background: #fff; transition: all 0.2s; cursor: pointer; font-family: 'Nunito',sans-serif; text-decoration: none; }
                .filter-tab:hover { border-color: #0057FF; color: #0057FF; }
                .filter-tab.active { background: #0057FF; border-color: #0057FF; color: #fff; }
                .filter-count { background: rgba(0,0,0,0.1); padding: 1px 7px; border-radius: 100px; font-size: 0.72rem; }
                .filter-tab.active .filter-count { background: rgba(255,255,255,0.25); }
                .order-card { background: #fff; border: 1px solid #D1D5DB; border-radius: 14px; overflow: hidden; margin-bottom: 14px; transition: box-shadow 0.2s; }
                .order-card:hover { box-shadow: 0 4px 16px rgba(0,0,0,0.06); }
                .order-card-header { display: flex; align-items: center; justify-content: space-between; padding: 14px 20px; border-bottom: 1px solid #E5E7EB; background: #FAFAFA; flex-wrap: wrap; gap: 8px; }
                .order-code { font-family: monospace; font-size: 0.85rem; font-weight: 800; color: #0057FF; background: #EEF4FF; padding: 3px 10px; border-radius: 6px; }
                .order-date { font-size: 0.78rem; color: #6B7280; }
                .order-status-badge { display: inline-flex; align-items: center; gap: 5px; font-size: 0.75rem; font-weight: 700; padding: 4px 12px; border-radius: 100px; border: 1px solid; }
                .order-items-preview { padding: 16px 20px; display: flex; flex-direction: column; gap: 10px; }
                .order-item-row { display: flex; align-items: center; gap: 12px; }
                .order-item-img { width: 52px; height: 52px; border-radius: 8px; background: #F8F9FB; overflow: hidden; display: flex; align-items: center; justify-content: center; font-size: 1.5rem; flex-shrink: 0; border: 1px solid #E5E7EB; }
                .order-item-img img { width: 100%; height: 100%; object-fit: cover; }
                .order-item-name { font-size: 0.875rem; font-weight: 600; color: #0A0A0A; flex: 1; }
                .order-item-qty { font-size: 0.78rem; color: #6B7280; }
                .order-item-price { font-size: 0.875rem; font-weight: 700; color: #0A0A0A; white-space: nowrap; }
                .order-card-footer { display: flex; align-items: center; justify-content: space-between; padding: 12px 20px; border-top: 1px solid #E5E7EB; background: #FAFAFA; flex-wrap: wrap; gap: 10px; }
                .order-total strong { font-size: 1rem; font-weight: 800; color: #EF4444; margin-left: 4px; }
                .btn-order-detail { background: #0057FF; color: #fff; border: none; border-radius: 8px; padding: 7px 16px; font-size: 0.8rem; font-weight: 700; font-family: 'Nunito',sans-serif; cursor: pointer; transition: background 0.2s; }
                .btn-order-detail:hover { background: #0040CC; }
                .empty-state { text-align: center; padding: 60px 20px; background: #fff; border: 1px solid #D1D5DB; border-radius: 14px; }
                .breadcrumb { background: #fff; border-bottom: 1px solid #E5E7EB; padding: 10px 0; font-size: 0.82rem; color: #6B7280; }
                .breadcrumb-inner { max-width: 1280px; margin: 0 auto; padding: 0 24px; }
                @media (max-width: 600px) { .orders-wrap { padding: 16px; } }
            `}</style>

            <div className="breadcrumb">
                <div className="breadcrumb-inner">
                    <button onClick={() => navigate('/')} style={{ background: 'none', border: 'none', color: '#6B7280', cursor: 'pointer', fontFamily: 'Nunito,sans-serif', fontSize: '0.82rem', padding: 0 }}>Trang chủ</button>
                    <span style={{ margin: '0 6px', fontSize: '0.7rem' }}>›</span>
                    <strong style={{ color: '#0A0A0A' }}>Đơn hàng của tôi</strong>
                </div>
            </div>

            <div className="orders-wrap">
                <div className="page-header">
                    <h1>🛍️ Đơn hàng của tôi</h1>
                    <p>Theo dõi và quản lý tất cả đơn hàng của bạn</p>
                </div>

                {/* Filter tabs */}
                <div className="filter-tabs">
                    {[{ key: 'all', label: 'Tất cả' }, ...Object.entries(STATUS_MAP).map(([k, v]) => ({ key: k, label: v.label }))].map(tab => (
                        <button key={tab.key} className={`filter-tab${filter === tab.key ? ' active' : ''}`} onClick={() => setFilter(tab.key)}>
                            {tab.label}
                            {counts[tab.key] > 0 && <span className="filter-count">{counts[tab.key]}</span>}
                        </button>
                    ))}
                </div>

                {loading ? (
                    <div style={{ textAlign: 'center', padding: 40, color: '#6B7280' }}>Đang tải...</div>
                ) : filtered.length === 0 ? (
                    <div className="empty-state">
                        <div style={{ fontSize: '3.5rem', marginBottom: 14 }}>📋</div>
                        <h3 style={{ fontWeight: 800, color: '#0A0A0A', marginBottom: 6 }}>Chưa có đơn hàng nào</h3>
                        <p style={{ color: '#6B7280', fontSize: '0.875rem', marginBottom: 20 }}>Hãy mua sắm ngay hôm nay!</p>
                        <button style={{ padding: '10px 24px', background: '#0057FF', color: '#fff', border: 'none', borderRadius: 10, fontSize: '0.875rem', fontWeight: 700, cursor: 'pointer', fontFamily: 'Nunito,sans-serif' }} onClick={() => navigate('/products')}>🛍️ Mua ngay</button>
                    </div>
                ) : (
                    filtered.map(order => {
                        const s = STATUS_MAP[order.status] || STATUS_MAP.pending
                        return (
                            <div key={order._id} className="order-card">
                                <div className="order-card-header">
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                                        <span className="order-code">#{order._id.slice(-8).toUpperCase()}</span>
                                        <span className="order-date">{new Date(order.createdAt).toLocaleString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
                                    </div>
                                    <span className="order-status-badge" style={{ color: s.color, background: s.bg, borderColor: s.border }}>{s.label}</span>
                                </div>

                                <div className="order-items-preview">
                                    {order.items.map((item, idx) => (
                                        <div key={idx} className="order-item-row">
                                            <div className="order-item-img">
                                                {item.image ? <img src={item.image} alt={item.name} onError={e => { e.target.style.display = 'none' }} /> : '📱'}
                                            </div>
                                            <div className="order-item-name">{item.name}</div>
                                            <div className="order-item-qty">x{item.quantity}</div>
                                            <div className="order-item-price">{(item.price * item.quantity).toLocaleString('vi-VN')}đ</div>
                                        </div>
                                    ))}
                                </div>

                                <div className="order-card-footer">
                                    <div>
                                        <span style={{ fontSize: '0.875rem', color: '#6B7280' }}>Tổng cộng:</span>
                                        <strong>{order.totalAmount.toLocaleString('vi-VN')}đ</strong>
                                    </div>
                                    <div style={{ display: 'flex', gap: 8 }}>
                                        <button className="btn-order-detail" onClick={() => navigate(`/orders/${order._id}`)}>Xem chi tiết </button>
                                    </div>
                                </div>
                            </div>
                        )
                    })
                )}
            </div>
        </div>
    )
}