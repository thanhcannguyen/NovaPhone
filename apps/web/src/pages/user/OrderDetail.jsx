// src/pages/user/OrderDetail.jsx
import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { getOrderByIdApi } from '../../api/orderApi'

const STATUS_MAP = {
    pending: { label: 'Chờ xác nhận', bg: '#fef3e2', color: '#b45309' },
    confirmed: { label: 'Đã xác nhận', bg: '#EEF4FF', color: '#0040CC' },
    shipping: { label: 'Đang giao', bg: '#f3e8ff', color: '#6a1b9a' },
    delivered: { label: 'Đã giao', bg: '#e7f8ec', color: '#1b7f3a' },
    cancelled: { label: 'Đã huỷ', bg: '#fde8e8', color: '#b42318' },
}
const TIMELINE = ['pending', 'confirmed', 'shipping', 'delivered']

export default function OrderDetail() {
    const { id } = useParams()
    const navigate = useNavigate()
    const [order, setOrder] = useState(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')

    useEffect(() => {
        getOrderByIdApi(id)
            .then(res => setOrder(res.data.data))
            .catch(err => setError(err.response?.data?.message || 'Không tìm thấy đơn hàng'))
            .finally(() => setLoading(false))
    }, [id])

    if (loading) return <p style={s.loading}>Đang tải...</p>
    if (error) return <p style={{ ...s.loading, color: '#b42318' }}>{error}</p>
    if (!order) return null

    const status = STATUS_MAP[order.status] || { label: order.status, bg: '#f0f0f0', color: '#888' }
    const currentStep = TIMELINE.indexOf(order.status)

    return (
        <div style={s.page}>
            <style>{`
                .od-btn-primary { transition: all 0.2s; }
                .od-btn-primary:hover { background: #0040CC !important; transform: translateY(-1px); box-shadow: 0 6px 18px rgba(0,87,255,0.28); }
                .od-btn-outline { transition: all 0.2s; }
                .od-btn-outline:hover { border-color: #0057FF !important; color: #0057FF !important; background: #EEF4FF !important; }
                .od-item-row { transition: all 0.15s; }
                .od-item-row:hover { background: #EEF4FF !important; border-color: #C7D9FF !important; transform: translateX(2px); }
                .od-item-scroll::-webkit-scrollbar { width: 6px; }
                .od-item-scroll::-webkit-scrollbar-thumb { background: #D1D5DB; border-radius: 100px; }
                .od-item-scroll::-webkit-scrollbar-track { background: transparent; }
            `}</style>
            {/* Breadcrumb */}
            <div style={s.breadcrumb}>
                <div style={s.breadcrumbInner}>
                    <button style={s.breadcrumbLink} onClick={() => navigate('/')}>Trang chủ</button>
                    <span style={s.breadcrumbSep}>›</span>
                    <button style={s.breadcrumbLink} onClick={() => navigate('/orders')}>Đơn hàng</button>
                    <span style={s.breadcrumbSep}>›</span>
                    <strong style={{ color: '#0A0A0A' }}>#{order._id.slice(-8).toUpperCase()}</strong>
                </div>
            </div>

            <div style={s.container}>

                {/* Header */}
                <div style={{ ...s.topRow, marginTop: 24 }}>
                    <div>
                        <h1 style={s.title}>Đơn hàng #{order._id.slice(-8).toUpperCase()}</h1>
                        <p style={s.subtitle}>{new Date(order.createdAt).toLocaleString('vi-VN')}</p>
                    </div>
                    <span style={{ ...s.statusBadge, background: status.bg, color: status.color }}>{status.label}</span>
                </div>

                {/* Timeline */}
                {order.status !== 'cancelled' && (
                    <div style={s.timelineCard}>
                        <div style={s.timeline}>
                            {TIMELINE.map((step, idx) => {
                                const done = idx <= currentStep
                                const current = idx === currentStep
                                return (
                                    <div key={step} style={s.timelineStep}>
                                        <div style={{ ...s.timelineDot, background: done ? '#0057FF' : '#E5E7EB', boxShadow: current ? '0 0 0 3px rgba(26,115,232,0.25)' : 'none' }} />
                                        <div style={{ ...s.timelineLabel, color: done ? '#3d2410' : '#a09080', fontWeight: current ? 700 : 400 }}>
                                            {STATUS_MAP[step].label}
                                        </div>
                                        {idx < TIMELINE.length - 1 && (
                                            <div style={{ ...s.timelineLine, background: idx < currentStep ? '#0057FF' : '#E5E7EB' }} />
                                        )}
                                    </div>
                                )
                            })}
                        </div>
                    </div>
                )}

                {/* Layout — 2 cột desktop, 1 cột mobile */}
                <div className='order-detail-layout' style={s.layout}>

                    {/* Sản phẩm */}
                    <div style={{ ...s.card, display: 'flex', flexDirection: 'column', height: '100%' }}>
                        <h3 style={s.cardTitle}>Sản phẩm đã đặt</h3>
                        <div className="od-item-scroll" style={s.itemScroll}>
                            {order.items.map((item, idx) => (
                                <div key={idx} className="od-item-row" style={s.itemRow}>
                                    <div style={s.itemLeft}>
                                        {item.image && <img src={item.image} alt={item.name} style={s.thumb} onError={e => { e.target.src = 'https://placehold.co/48x48/e8f0fe/1a73e8?text=Phone' }} />}
                                        <div>
                                            <div style={s.itemName}>{item.name}</div>
                                            <div style={s.itemMeta}>{item.price.toLocaleString('vi-VN')}đ × {item.quantity}</div>
                                        </div>
                                    </div>
                                    <div style={s.itemTotal}>{(item.price * item.quantity).toLocaleString('vi-VN')}đ</div>
                                </div>
                            ))}
                        </div>
                        <div style={s.divider} />
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14, color: '#6B7280', marginBottom: 6 }}>
                            <span>Tạm tính</span>
                            <span>{(order.itemsTotal ?? order.totalAmount).toLocaleString('vi-VN')}đ</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14, color: '#6B7280', marginBottom: 6 }}>
                            <span>Phí vận chuyển</span>
                            <span>{order.shippingFee > 0 ? `${order.shippingFee.toLocaleString('vi-VN')}đ` : 'Miễn phí'}</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 700, fontSize: 15 }}>
                            <span>Tổng cộng</span>
                            <span style={{ color: '#0057FF' }}>{order.totalAmount.toLocaleString('vi-VN')}đ</span>
                        </div>
                    </div>

                    {/* Cột phải */}
                    <div>
                        <div style={s.card}>
                            <h3 style={s.cardTitle}>Thông tin nhận hàng</h3>
                            {[
                                { label: 'Họ tên', value: order.shippingInfo?.fullName },
                                { label: 'SĐT', value: order.shippingInfo?.phone },
                                { label: 'Địa chỉ', value: order.shippingInfo?.address },
                            ].map(row => (
                                <div key={row.label} style={s.infoRow}>
                                    <span style={s.infoLabel}>{row.label}</span>
                                    <span style={s.infoValue}>{row.value || '—'}</span>
                                </div>
                            ))}
                        </div>

                        <div style={s.card}>
                            <h3 style={s.cardTitle}>Thông tin thanh toán</h3>
                            {[
                                { label: 'Phương thức', value: order.paymentMethod },
                                { label: 'Phí giao hàng', value: <span style={{ color: '#1b7f3a', fontWeight: 600 }}>Miễn phí</span> },
                            ].map(row => (
                                <div key={row.label} style={s.infoRow}>
                                    <span style={s.infoLabel}>{row.label}</span>
                                    <span style={s.infoValue}>{row.value}</span>
                                </div>
                            ))}
                            {order.note && <div style={{ marginTop: 8, fontSize: 12, color: '#0A0A0A' }}><span style={s.infoLabel}>Ghi chú: </span>{order.note}</div>}
                        </div>

                        <button className="od-btn-primary" style={s.menuBtn} onClick={() => navigate('/products')}>Tiếp tục mua hàng</button>
                        <button className="od-btn-outline" style={s.historyBtn} onClick={() => navigate('/orders')}>Lịch sử đơn hàng</button>
                    </div>
                </div>
            </div>
        </div>
    )
}

const s = {
    page: { background: '#F8F9FB', padding: '0 0 60px', minHeight: '100vh' },
    container: { maxWidth: 1280, margin: '0 auto', padding: '0 16px' },
    loading: { padding: 40, textAlign: 'center', color: '#6B7280' },
    topRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16, flexWrap: 'wrap', gap: 10 },
    backBtn: { background: 'none', border: 'none', color: '#0057FF', fontSize: 13, cursor: 'pointer', padding: 0, fontWeight: 600, marginBottom: 6, display: 'block' },
    title: { fontSize: 22, fontWeight: 700, color: '#0A0A0A', margin: '0 0 4px' },
    subtitle: { fontSize: 13, fontWeight: 600, color: '#6B7280', margin: 0 },
    breadcrumb: { background: '#fff', borderBottom: '1px solid #E5E7EB', padding: '10px 0' },
    breadcrumbInner: { maxWidth: 1280, margin: '0 auto', padding: '0 24px', fontSize: 13, color: '#6B7280', display: 'flex', alignItems: 'center', gap: 5 },
    breadcrumbLink: { background: 'none', border: 'none', color: '#6B7280', cursor: 'pointer', fontSize: 13, fontFamily: 'Nunito,sans-serif', padding: 0 },
    breadcrumbSep: { fontSize: 11, color: '#9CA3AF' },
    statusBadge: { fontSize: 12, fontWeight: 600, padding: '6px 16px', borderRadius: 20 },
    timelineCard: { background: '#fff', borderRadius: 14, border: '1px solid #D1D5DB', padding: '20px 24px', marginBottom: 16, boxShadow: '0 1px 6px rgba(26,115,232,0.05)' },
    timeline: { display: 'flex', alignItems: 'flex-start' },
    timelineStep: { display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1, position: 'relative' },
    timelineDot: { width: 14, height: 14, borderRadius: '50%', marginBottom: 8, zIndex: 1 },
    timelineLabel: { fontSize: 11, textAlign: 'center', lineHeight: 1.4, color: '#4a5568' },
    timelineLine: { position: 'absolute', top: 7, left: '50%', width: '100%', height: 2, zIndex: 0 },
    layout: { display: 'grid', gridTemplateColumns: '1fr 280px', gap: 16, alignItems: 'stretch' },
    card: { background: '#fff', borderRadius: 14, border: '1px solid #D1D5DB', boxShadow: '0 1px 6px rgba(26,115,232,0.05)', padding: '20px', marginBottom: 14 },
    cardTitle: { fontSize: 14, fontWeight: 700, color: '#0A0A0A', margin: '0 0 14px', paddingBottom: 10, borderBottom: '1px solid #F8F9FB' },
    itemScroll: { overflowY: 'auto', overflowX: 'hidden', flex: '1 1 auto', minHeight: 0, maxHeight: 264 },
    itemRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 14px', marginBottom: 10, background: '#F8F9FB', border: '1px solid #F1F3F5', borderRadius: 12, boxSizing: 'border-box' },
    itemLeft: { display: 'flex', alignItems: 'center', gap: 12 },
    thumb: { width: 54, height: 54, borderRadius: 10, objectFit: 'contain', flexShrink: 0, background: '#fff', border: '1px solid #E5E7EB', padding: 4, boxSizing: 'border-box' },
    itemName: { fontSize: 13, fontWeight: 600, color: '#0A0A0A', marginBottom: 3 },
    itemMeta: { fontSize: 12, color: '#6B7280' },
    itemTotal: { fontSize: 14, fontWeight: 700, color: '#0057FF', flexShrink: 0 },
    divider: { borderTop: '1.5px solid #F8F9FB', margin: '14px 0' },
    infoRow: { display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #F8F9FB', gap: 8 },
    infoLabel: { fontSize: 12, color: '#6B7280', flexShrink: 0 },
    infoValue: { fontSize: 13, fontWeight: 600, color: '#0A0A0A', textAlign: 'right' },
    menuBtn: { width: '100%', padding: '13px', background: '#0057FF', color: '#fff', border: 'none', borderRadius: 10, fontSize: 14, fontWeight: 700, cursor: 'pointer', transition: 'background 0.15s' },
    historyBtn: { width: '100%', padding: '13px', background: '#fff', color: '#0A0A0A', border: '1.5px solid #D1D5DB', borderRadius: 10, fontSize: 14, fontWeight: 700, cursor: 'pointer', marginTop: 10, transition: 'all 0.15s' },
}