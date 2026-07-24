import { useState, useEffect } from 'react'
import Topbar from '../../components/admin/Topbar'
import Pagination from '../../components/admin/Pagination'
import { getAllOrdersApi, updateOrderStatusApi } from '../../api/orderApi'

const STATUS_MAP = {
    pending: { label: 'Chờ xác nhận', color: '#b45309', bg: '#fef3e2' },
    confirmed: { label: 'Đã xác nhận', color: '#0040CC', bg: '#EEF4FF' },
    shipping: { label: 'Đang giao', color: '#6a1b9a', bg: '#f3e8ff' },
    delivered: { label: 'Đã giao', color: '#15803D', bg: '#e7f8ec' },
    cancelled: { label: 'Đã huỷ', color: '#DC2626', bg: '#fde8e8' },
}

const NEXT_STATUS = {
    pending: [{ value: 'confirmed', label: 'Xác nhận' }, { value: 'cancelled', label: 'Huỷ đơn' }],
    confirmed: [{ value: 'shipping', label: 'Giao hàng' }, { value: 'cancelled', label: 'Huỷ đơn' }],
    shipping: [{ value: 'delivered', label: 'Đã giao' }],
    delivered: [],
    cancelled: [],
}

const ITEMS_PER_PAGE = 8

function useIsMobile() {
    const [isMobile, setIsMobile] = useState(window.innerWidth <= 768)
    useEffect(() => {
        const h = () => setIsMobile(window.innerWidth <= 768)
        window.addEventListener('resize', h)
        return () => window.removeEventListener('resize', h)
    }, [])
    return isMobile
}

export default function AdminOrders() {
    const isMobile = useIsMobile()
    const [orders, setOrders] = useState([])
    const [loading, setLoading] = useState(true)
    const [filterStatus, setFilterStatus] = useState('all')
    const [currentPage, setCurrentPage] = useState(1)
    const [selectedOrder, setSelectedOrder] = useState(null)
    const [msg, setMsg] = useState({ type: '', text: '' })

    const showMsg = (type, text) => { setMsg({ type, text }); setTimeout(() => setMsg({ type: '', text: '' }), 3000) }

    const loadOrders = () => {
        setLoading(true)
        getAllOrdersApi()
            .then(r => setOrders(r.data.data))
            .catch(() => showMsg('error', 'Không thể tải đơn hàng'))
            .finally(() => setLoading(false))
    }

    useEffect(() => { loadOrders() }, [])

    const handleUpdateStatus = async (orderId, status) => {
        try {
            await updateOrderStatusApi(orderId, status)
            showMsg('success', 'Cập nhật trạng thái thành công')
            if (selectedOrder?._id === orderId) setSelectedOrder(prev => ({ ...prev, status }))
            loadOrders()
        } catch (err) {
            showMsg('error', err.response?.data?.message || 'Lỗi cập nhật')
        }
    }

    const filtered = filterStatus === 'all' ? orders : orders.filter(o => o.status === filterStatus)
    const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE)
    const paginated = filtered.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE)

    return (
        <div style={{ minHeight: '100vh', background: '#F3F4F6', fontFamily: 'Nunito,sans-serif' }}>
            <div style={{ flex: 1, minWidth: 0, paddingBottom: isMobile ? 80 : 0 }}>
                <Topbar title='Quản lý đơn hàng' subtitle={`Tổng ${orders.length} đơn`} />
                <div style={{ padding: '20px 24px' }}>

                    {msg.text && (
                        <div style={{ padding: '10px 16px', borderRadius: 8, marginBottom: 14, fontSize: 13, fontWeight: 500, background: msg.type === 'success' ? '#e7f8ec' : '#fde8e8', color: msg.type === 'success' ? '#15803D' : '#DC2626' }}>
                            {msg.text}
                        </div>
                    )}

                    {/* Status filters */}
                    <div style={{ display: 'flex', gap: 6, marginBottom: 16, flexWrap: 'wrap' }}>
                        <button className={`admin-filter-btn${filterStatus === 'all' ? ' active' : ''}`}
                            onClick={() => { setFilterStatus('all'); setCurrentPage(1) }}>
                            Tất cả ({orders.length})
                        </button>
                        {Object.entries(STATUS_MAP).map(([key, info]) => (
                            <button key={key} className={`admin-filter-btn${filterStatus === key ? ' active' : ''}`}
                                onClick={() => { setFilterStatus(key); setCurrentPage(1) }}>
                                {info.label} ({orders.filter(o => o.status === key).length})
                            </button>
                        ))}
                    </div>

                    {/* Table */}
                    <div style={{ background: '#fff', borderRadius: 14, border: '1px solid #E5E7EB', overflowX: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 620 }}>
                            <thead>
                                <tr style={{ background: '#F8F9FB', border: '1px solid #E5E7EB', borderRadius: 14, overflow: 'hidden' }}>
                                    <th style={s.th}>Mã đơn</th>
                                    <th style={s.th}>Khách hàng</th>
                                    <th style={s.th}>Sản phẩm</th>
                                    <th style={s.th}>Tổng tiền</th>
                                    <th style={s.th}>Trạng thái</th>
                                    <th style={s.th}>Thao tác</th>
                                </tr>
                            </thead>
                            <tbody>
                                {loading ? (
                                    <tr><td colSpan={6} style={s.center}>Đang tải...</td></tr>
                                ) : paginated.length === 0 ? (
                                    <tr><td colSpan={6} style={s.center}>Không có đơn hàng</td></tr>
                                ) : paginated.map(order => {
                                    const st = STATUS_MAP[order.status]
                                    const nextActions = NEXT_STATUS[order.status] || []
                                    return (
                                        <tr key={order._id} className='admin-tr' style={{ cursor: 'pointer' }} onClick={() => setSelectedOrder(order)}>
                                            <td style={s.td}>
                                                <span style={s.orderId}>#{order._id.slice(-6).toUpperCase()}</span>
                                                <div style={{ fontSize: 10, color: '#9CA3AF' }}>{new Date(order.createdAt).toLocaleDateString('vi-VN')}</div>
                                            </td>
                                            <td style={s.td}>
                                                <div style={s.custName}>{order.user?.name || '—'}</div>
                                                <div style={{ fontSize: 11, color: '#9CA3AF' }}>{order.shippingInfo?.phone}</div>
                                            </td>
                                            <td style={s.td}>{order.items.length} sản phẩm</td>
                                            <td style={s.td}><span style={s.amount}>{order.totalAmount.toLocaleString('vi-VN')}đ</span></td>
                                            <td style={s.td} onClick={e => e.stopPropagation()}>
                                                <span style={{ ...s.badge, background: st?.bg, color: st?.color }}>{st?.label}</span>
                                            </td>
                                            <td style={s.td} onClick={e => e.stopPropagation()}>
                                                {nextActions.map(action => (
                                                    <button key={action.value} className='admin-next-btn'
                                                        style={{ background: action.value === 'cancelled' ? '#fde8e8' : '#EEF4FF', color: action.value === 'cancelled' ? '#DC2626' : '#0040CC', marginBottom: 4 }}
                                                        onClick={() => handleUpdateStatus(order._id, action.value)}>
                                                        {action.label}
                                                    </button>
                                                ))}
                                            </td>
                                        </tr>
                                    )
                                })}
                            </tbody>
                        </table>
                        <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
                    </div>
                </div>
            </div>

            {/* Order detail panel */}
            {selectedOrder && (
                <div style={s.overlay} onClick={() => setSelectedOrder(null)}>
                    <div style={s.panel} onClick={e => e.stopPropagation()}>
                        <div style={s.panelHeader}>
                            <div>
                                <h2 style={s.panelTitle}>#{selectedOrder._id.slice(-6).toUpperCase()}</h2>
                                <p style={{ fontSize: 12, color: '#6B7280', margin: 0 }}>{new Date(selectedOrder.createdAt).toLocaleString('vi-VN')}</p>
                            </div>
                            <button style={s.closeBtn} onClick={() => setSelectedOrder(null)}>✕</button>
                        </div>
                        <div style={{ padding: '20px 24px', flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 20 }}>
                            {/* Status */}
                            <div>
                                <div style={s.sectionLabel}>Trạng thái</div>
                                {(() => {
                                    const st = STATUS_MAP[selectedOrder.status]
                                    const actions = NEXT_STATUS[selectedOrder.status] || []
                                    return (
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                                            <span style={{ ...s.badge, background: st?.bg, color: st?.color, fontSize: 13, padding: '5px 14px' }}>{st?.label}</span>
                                            {actions.map(a => (
                                                <button key={a.value} className='admin-next-btn'
                                                    style={{ background: a.value === 'cancelled' ? '#fde8e8' : '#0057FF', color: a.value === 'cancelled' ? '#DC2626' : '#fff', padding: '7px 14px', fontWeight: 600 }}
                                                    onClick={() => handleUpdateStatus(selectedOrder._id, a.value)}>
                                                    {a.label}
                                                </button>
                                            ))}
                                        </div>
                                    )
                                })()}
                            </div>

                            {/* Customer */}
                            <div>
                                <div style={s.sectionLabel}>Thông tin giao hàng</div>
                                <div style={s.infoGrid}>
                                    <div style={s.infoRow}><span style={s.infoKey}>Họ tên</span><span style={s.infoVal}>{selectedOrder.shippingInfo?.fullName}</span></div>
                                    <div style={s.infoRow}><span style={s.infoKey}>SĐT</span><span style={s.infoVal}>{selectedOrder.shippingInfo?.phone}</span></div>
                                    <div style={s.infoRow}><span style={s.infoKey}>Địa chỉ</span><span style={s.infoVal}>{selectedOrder.shippingInfo?.address}</span></div>
                                    <div style={s.infoRow}><span style={s.infoKey}>Thanh toán</span><span style={s.infoVal}>{selectedOrder.paymentMethod}</span></div>
                                    {selectedOrder.note && <div style={s.infoRow}><span style={s.infoKey}>Ghi chú</span><span style={s.infoVal}>{selectedOrder.note}</span></div>}
                                </div>
                            </div>

                            {/* Items */}
                            <div>
                                <div style={s.sectionLabel}>Sản phẩm ({selectedOrder.items.length})</div>
                                {selectedOrder.items.map((item, i) => (
                                    <div key={i} style={s.itemRow}>
                                        <img src={item.image} alt={item.name} style={s.itemImg}
                                            onError={e => { e.target.src = 'https://placehold.co/44x44/e8f0fe/1a73e8?text=P' }} />
                                        <div style={{ flex: 1, minWidth: 0 }}>
                                            <div style={s.itemName}>{item.name}</div>
                                            {(item.specs?.ram || item.specs?.storage) && (
                                                <div style={{ fontSize: 11, color: '#6B7280' }}>
                                                    {[item.specs.ram, item.specs.storage].filter(Boolean).join(' · ')}
                                                </div>
                                            )}
                                        </div>
                                        <div style={{ textAlign: 'right', flexShrink: 0 }}>
                                            <div style={s.itemPrice}>{item.price.toLocaleString('vi-VN')}đ</div>
                                            <div style={{ fontSize: 11, color: '#6B7280' }}>×{item.quantity}</div>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Total */}
                            <div style={s.totalRow}>
                                <span style={s.totalLabel}>Tổng cộng</span>
                                <span style={s.totalAmount}>{selectedOrder.totalAmount.toLocaleString('vi-VN')}đ</span>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

const s = {
    th: { padding: '12px 14px', textAlign: 'left', fontSize: 11, fontWeight: 700, color: '#6B7280', textTransform: 'uppercase', letterSpacing: 0.5, whiteSpace: 'nowrap' },
    td: { padding: '12px 14px', fontSize: 13, verticalAlign: 'middle' },
    center: { textAlign: 'center', padding: 40, color: '#6B7280', fontSize: 14 },
    orderId: { fontSize: 13, fontWeight: 700, color: '#0A0A0A', fontFamily: 'monospace' },
    custName: { fontSize: 13, fontWeight: 600, color: '#0A0A0A' },
    amount: { fontSize: 13, fontWeight: 700, color: '#0057FF' },
    badge: { fontSize: 11, fontWeight: 500, padding: '3px 10px', borderRadius: 20, display: 'inline-block' },
    overlay: { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.35)', zIndex: 200, display: 'flex', justifyContent: 'flex-end' },
    panel: { width: '100%', maxWidth: 440, background: '#fff', height: '100vh', display: 'flex', flexDirection: 'column' },
    panelHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', padding: '20px 24px', borderBottom: '1px solid #E5E7EB' },
    panelTitle: { fontSize: 16, fontWeight: 700, color: '#0A0A0A', margin: '0 0 2px' },
    closeBtn: { background: 'none', border: 'none', fontSize: 18, cursor: 'pointer', color: '#6B7280' },
    sectionLabel: { fontSize: 11, fontWeight: 700, color: '#0057FF', textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 10, paddingBottom: 6, borderBottom: '1px solid #EEF4FF' },
    infoGrid: { display: 'flex', flexDirection: 'column', gap: 8 },
    infoRow: { display: 'flex', gap: 12 },
    infoKey: { fontSize: 12, color: '#6B7280', minWidth: 70, flexShrink: 0 },
    infoVal: { fontSize: 13, color: '#0A0A0A', fontWeight: 500 },
    itemRow: { display: 'flex', alignItems: 'center', gap: 12, padding: '10px 0', borderBottom: '1px solid #F8F9FB' },
    itemImg: { width: 44, height: 44, objectFit: 'contain', borderRadius: 8, background: '#F8F9FB', border: '1px solid #E5E7EB', padding: 4, flexShrink: 0 },
    itemName: { fontSize: 13, fontWeight: 600, color: '#0A0A0A', marginBottom: 2 },
    itemPrice: { fontSize: 13, fontWeight: 700, color: '#0057FF' },
    totalRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 0', borderTop: '2px solid #E5E7EB' },
    totalLabel: { fontSize: 14, fontWeight: 600, color: '#0A0A0A' },
    totalAmount: { fontSize: 20, fontWeight: 800, color: '#0057FF' },
}