// src/pages/user/Checkout.jsx — PHP style
import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useCart } from '../../context/CartContext'
import { createOrderApi } from '../../api/orderApi'
import { PAYMENT_METHODS as SHARED_PAYMENT_METHODS, SHIPPING } from '@novaphone/shared-types'
import {
    MapPin, Phone, User, FileText, CreditCard,
    ShoppingBag, Truck, ChevronRight,
    CheckCircle, ShoppingCart, Banknote
} from 'lucide-react'

const IS = { display: 'block', border: 'none', outline: 'none', background: 'none', boxShadow: 'none', flexShrink: 0 }

// Metadata hiển thị (icon, mô tả, màu) — value/label/enabled lấy từ package dùng chung
// để luôn khớp với enum paymentMethod ở backend Order model.
const PAYMENT_METHOD_UI = {
    COD: { desc: 'Trả tiền mặt khi shipper giao hàng', icon: <Truck size={20} style={IS} />, iconBg: '#FFF7ED', iconColor: '#F97316' },
    BANKING: { desc: 'Chuyển khoản thủ công qua STK', icon: <Banknote size={20} style={IS} />, iconBg: '#EEF4FF', iconColor: '#0057FF' },
}

// Chỉ hiển thị các phương thức đã thực sự tích hợp (enabled: true)
const PAYMENT_METHODS = SHARED_PAYMENT_METHODS
    .filter(m => m.enabled && PAYMENT_METHOD_UI[m.value])
    .map(m => ({ ...m, ...PAYMENT_METHOD_UI[m.value] }))

// Step indicator — từ PHP
function CheckoutSteps({ step }) {
    const steps = [
        { num: 1, label: 'Giỏ hàng', done: step > 1 },
        { num: 2, label: 'Thanh toán', active: step === 2 },
        { num: 3, label: 'Hoàn tất', active: step === 3 },
    ]
    return (
        <div className="ck-steps">
            {steps.map((s, idx) => (
                <div key={s.num} className="ck-step">
                    <div className="ck-step-inner">
                        <div className="ck-step-circle" style={{
                            background: s.done ? '#16A34A' : s.active ? '#0057FF' : '#E5E7EB',
                            color: s.done || s.active ? '#fff' : '#6B7280',
                        }}>
                            {s.done ? '✓' : s.num}
                        </div>
                        <span className="ck-step-label" style={{
                            color: s.done ? '#16A34A' : s.active ? '#0057FF' : '#6B7280',
                        }}>{s.label}</span>
                    </div>
                    {idx < steps.length - 1 && (
                        <div className="ck-step-connector" style={{ background: s.done ? '#16A34A' : '#E5E7EB' }} />
                    )}
                </div>
            ))}
        </div>
    )
}

export default function Checkout() {
    const navigate = useNavigate()
    const { cart, fetchCart } = useCart()
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')
    const [form, setForm] = useState({
        name: '', phone: '', address: '',
        paymentMethod: 'COD', note: ''
    })

    const items = cart?.items ?? []
    const totalAmount = cart?.totalAmount ?? 0
    const shippingFee = totalAmount >= SHIPPING.FREE_THRESHOLD ? 0 : SHIPPING.FEE
    const finalTotal = totalAmount + shippingFee

    useEffect(() => { window.scrollTo(0, 0) }, [])

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value })
        setError('')
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        // Validate
        if (!form.name.trim()) return setError('Vui lòng nhập họ tên!')
        if (!form.phone.trim()) return setError('Vui lòng nhập số điện thoại!')
        if (!/^[0-9]{9,11}$/.test(form.phone.trim())) return setError('Số điện thoại không hợp lệ!')
        if (!form.address.trim()) return setError('Vui lòng nhập địa chỉ giao hàng!')
        if (items.length === 0) return setError('Giỏ hàng đang trống!')

        try {
            setLoading(true)
            const res = await createOrderApi({
                shippingInfo: { fullName: form.name, phone: form.phone, address: form.address },
                paymentMethod: form.paymentMethod,
                note: form.note,
            })
            await fetchCart()
            navigate(`/orders/${res.data.data._id}`)
        } catch (err) {
            setError(err.response?.data?.message || 'Đặt hàng thất bại, vui lòng thử lại!')
        } finally {
            setLoading(false)
        }
    }

    if (!cart) return (
        <div style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Nunito,sans-serif' }}>
            <div style={{ textAlign: 'center', color: '#6B7280' }}>
                <div style={{ width: 36, height: 36, border: '3px solid #E5E7EB', borderTop: '3px solid #0057FF', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto 14px' }} />
                <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
                Đang tải...
            </div>
        </div>
    )

    return (
        <div style={{ background: '#F8F9FB', minHeight: '100vh', fontFamily: 'Nunito,sans-serif' }}>
            <style>{`
            @import url('https://fonts.googleapis.com/css2?family=Nunito:wght@400;500;600;700;800&display=swap');
            @keyframes spin { to { transform: rotate(360deg) } }
            @keyframes fadeUp { from { opacity:0; transform:translateY(12px) } to { opacity:1; transform:none } }
            .checkout-page svg { display:block!important; border:none!important; outline:none!important; box-shadow:none!important; background:transparent!important; }

            /* Breadcrumb */
            .ck-breadcrumb { background:#fff; border-bottom:1px solid #E5E7EB; padding:10px 0; font-size:0.82rem; color:#6B7280; }
            .ck-breadcrumb-inner { max-width:1280px; margin:0 auto; padding:0 24px; display:flex; align-items:center; gap:6px; }

            /* Layout */
            .ck-wrap { max-width:1280px; margin:0 auto; padding:24px; }
            .ck-grid { display:grid; grid-template-columns:1fr 360px; gap:24px; align-items:start; }

            /* Form card */
            .ck-card { background:#fff; border:1px solid #E5E7EB; border-radius:16px; overflow:hidden; margin-bottom:16px; }
            .ck-card-header { padding:16px 24px; border-bottom:1px solid #E5E7EB; font-size:0.95rem; font-weight:800; color:#0A0A0A; display:flex; align-items:center; gap:10px; }
            .ck-card-header-icon { color:#0057FF; display:flex; align-items:center; }
            .ck-card-body { padding:20px 24px; }

            .ck-row2 { display:grid; grid-template-columns:1fr 1fr; gap:14px; }
            .ck-group { margin-bottom:14px; }
            .ck-group:last-child { margin-bottom:0; }
            .ck-label { display:block; font-size:0.82rem; font-weight:700; color:#0A0A0A; margin-bottom:6px; }
            .ck-label .req { color:#EF4444; }
            .ck-input { width:100%; background:#F8F9FB; border:1.5px solid #E5E7EB; border-radius:10px; padding:10px 14px; font-size:0.875rem; font-family:'Nunito',sans-serif; color:#0A0A0A; outline:none; transition:border-color 0.2s; }
            .ck-input:focus { border-color:#0057FF; background:#fff; box-shadow:0 0 0 3px rgba(0,87,255,0.08); }
            .ck-input.error { border-color:#EF4444; }
            textarea.ck-input { resize:vertical; min-height:80px; }

            /* Payment options — PHP style */
            .pay-option { border:2px solid #E5E7EB; border-radius:12px; padding:14px 16px; cursor:pointer; transition:all 0.2s; margin-bottom:10px; }
            .pay-option:last-child { margin-bottom:0; }
            .pay-option.selected { border-color:#0057FF; background:#EEF4FF; }
            .pay-option-row { display:flex; align-items:center; gap:12px; }
            .pay-option input[type="radio"] { width:18px; height:18px; accent-color:#0057FF; cursor:pointer; flex-shrink:0; }
            .pay-icon-box { width:36px; height:36px; border-radius:8px; display:flex; align-items:center; justify-content:center; flex-shrink:0; }
            .pay-title { font-weight:700; font-size:0.9rem; color:#0A0A0A; }
            .pay-desc { font-size:0.78rem; color:#6B7280; margin-top:1px; }

            /* Summary card */
            .ck-summary { background:#fff; border:1px solid #E5E7EB; border-radius:16px; overflow:hidden; position:sticky; top:80px; }
            .ck-summary-header { padding:16px 20px; border-bottom:1px solid #E5E7EB; font-size:0.95rem; font-weight:800; color:#0A0A0A; display:flex; align-items:center; gap:8px; }
            .ck-summary-items { padding:12px 20px; }
            .ck-summary-item { display:flex; align-items:center; gap:10px; padding:10px 0; border-bottom:1px solid #F9FAFB; }
            .ck-summary-item:last-child { border-bottom:none; }
            .ck-item-img { width:52px; height:52px; border-radius:8px; background:#F8F9FB; border:1px solid #E5E7EB; overflow:hidden; display:flex; align-items:center; justify-content:center; flex-shrink:0; }
            .ck-item-img img { width:100%; height:100%; object-fit:cover; }
            .ck-item-name { font-size:0.82rem; font-weight:600; color:#0A0A0A; flex:1; line-height:1.35; }
            .ck-item-qty { font-size:0.75rem; color:#6B7280; margin-top:2px; }
            .ck-item-price { font-size:0.875rem; font-weight:800; color:#0A0A0A; white-space:nowrap; }
            .ck-summary-footer { padding:16px 20px; border-top:1px solid #E5E7EB; background:#F8F9FB; }
            .ck-sum-row { display:flex; justify-content:space-between; font-size:0.85rem; margin-bottom:8px; color:#6B7280; }
            .ck-sum-row .val { font-weight:700; color:#0A0A0A; }
            .ck-sum-row .free { color:#16A34A; font-weight:700; }
            .ck-total-row { display:flex; justify-content:space-between; align-items:center; margin-top:12px; padding-top:12px; border-top:1px solid #E5E7EB; }
            .ck-total-label { font-weight:800; font-size:0.95rem; color:#0A0A0A; }
            .ck-total-val { font-size:1.2rem; font-weight:800; color:#EF4444; }

            /* Buttons */
            .btn-order { width:100%; background:#0057FF; color:#fff; border:none; border-radius:10px; padding:14px; font-size:0.95rem; font-weight:700; font-family:'Nunito',sans-serif; cursor:pointer; transition:all 0.2s; margin-top:14px; display:flex; align-items:center; justify-content:center; gap:8px; }
            .btn-order:hover:not(:disabled) { background:#0040CC; transform:translateY(-1px); box-shadow:0 6px 20px rgba(0,87,255,0.25); }
            .btn-order:disabled { opacity:0.7; cursor:not-allowed; transform:none; }
            .btn-back { display:flex; align-items:center; justify-content:center; gap:5px; margin-top:10px; font-size:0.82rem; color:#6B7280; text-decoration:none; cursor:pointer; background:none; border:none; width:100%; font-family:'Nunito',sans-serif; transition:color 0.15s; }
            .btn-back:hover { color:#0057FF; }

            /* Alert */
            .ck-alert-err { background:#FEF2F2; border:1px solid #FECACA; color:#DC2626; border-radius:10px; padding:12px 16px; font-size:0.875rem; margin-bottom:16px; display:flex; align-items:center; gap:8px; }

            /* Responsive */
            /* Step indicator — CSS mặc định, áp dụng mọi kích thước màn hình */
            .ck-steps { display:flex; align-items:center; justify-content:center; margin-bottom:28px; }
            .ck-step { display:flex; align-items:center; flex-shrink:0; }
            .ck-step-inner { display:flex; align-items:center; gap:8px; flex-shrink:0; }
            .ck-step-circle { width:28px; height:28px; border-radius:50%; display:flex; align-items:center; justify-content:center; font-size:0.78rem; font-weight:800; flex-shrink:0; }
            .ck-step-label { font-size:0.82rem; font-weight:700; white-space:nowrap; }
            .ck-step-connector { width:48px; height:2px; margin:0 10px; flex-shrink:1; min-width:12px; }

            @media (max-width:900px) {
                .ck-grid { grid-template-columns:1fr; }
                .ck-summary { position:static; }
            }
            @media (max-width:480px) {
                .ck-step-connector { width:16px; margin:0 6px; }
                .ck-step-inner { gap:5px; }
            }
            @media (max-width:600px) {
                .ck-wrap { padding:14px; }
                .ck-row2 { grid-template-columns:1fr; }
                .ck-card-body { padding:16px; }
                .ck-breadcrumb-inner { padding:0 14px; }
            }
        `}</style>

            {/* Breadcrumb */}
            <div className="ck-breadcrumb checkout-page">
                <div className="ck-breadcrumb-inner">
                    <button onClick={() => navigate('/products')} style={{ background: 'none', border: 'none', color: '#6B7280', cursor: 'pointer', fontSize: '0.82rem', fontFamily: 'Nunito,sans-serif', padding: 0 }}>
                        Trang chủ
                    </button>
                    <ChevronRight size={13} style={{ ...IS, color: '#9CA3AF' }} />
                    <button onClick={() => navigate('/cart')} style={{ background: 'none', border: 'none', color: '#6B7280', cursor: 'pointer', fontSize: '0.82rem', fontFamily: 'Nunito,sans-serif', padding: 0 }}>
                        Giỏ hàng
                    </button>
                    <ChevronRight size={13} style={{ ...IS, color: '#9CA3AF' }} />
                    <strong style={{ color: '#0A0A0A' }}>Thanh toán</strong>
                </div>
            </div>

            <div className="ck-wrap checkout-page">
                {/* Step indicator */}
                <CheckoutSteps step={2} />

                {error && (
                    <div className="ck-alert-err">
                        ⚠️ {error}
                    </div>
                )}

                <form onSubmit={handleSubmit}>
                    <div className="ck-grid">
                        {/* ── LEFT: Form ── */}
                        <div>
                            {/* Thông tin giao hàng */}
                            <div className="ck-card">
                                <div className="ck-card-header">
                                    <span className="ck-card-header-icon"><MapPin size={18} style={IS} /></span>
                                    Thông tin giao hàng
                                </div>
                                <div className="ck-card-body">
                                    <div className="ck-row2">
                                        <div className="ck-group">
                                            <label className="ck-label">Họ và tên <span className="req">*</span></label>
                                            <input className="ck-input" name="name" value={form.name}
                                                onChange={handleChange} placeholder="Nguyễn Văn A" required />
                                        </div>
                                        <div className="ck-group">
                                            <label className="ck-label">Số điện thoại <span className="req">*</span></label>
                                            <input className="ck-input" name="phone" value={form.phone}
                                                onChange={handleChange} placeholder="0901 234 567" required />
                                        </div>
                                    </div>
                                    <div className="ck-group">
                                        <label className="ck-label">Địa chỉ giao hàng <span className="req">*</span></label>
                                        <input className="ck-input" name="address" value={form.address}
                                            onChange={handleChange}
                                            placeholder="Số nhà, tên đường, phường/xã, quận/huyện, tỉnh/thành phố" required />
                                    </div>
                                    <div className="ck-group">
                                        <label className="ck-label">Ghi chú đơn hàng</label>
                                        <textarea className="ck-input" name="note" value={form.note}
                                            onChange={handleChange}
                                            placeholder="Ghi chú thêm (giao giờ hành chính, để trước cửa...)" />
                                    </div>
                                </div>
                            </div>

                            {/* Phương thức thanh toán */}
                            <div className="ck-card">
                                <div className="ck-card-header">
                                    <span className="ck-card-header-icon"><CreditCard size={18} style={IS} /></span>
                                    Phương thức thanh toán
                                </div>
                                <div className="ck-card-body">
                                    {PAYMENT_METHODS.map(method => (
                                        <div
                                            key={method.value}
                                            className={`pay-option${form.paymentMethod === method.value ? ' selected' : ''}`}
                                            onClick={() => setForm({ ...form, paymentMethod: method.value })}
                                        >
                                            <div className="pay-option-row">
                                                <input type="radio" name="paymentMethod"
                                                    value={method.value}
                                                    checked={form.paymentMethod === method.value}
                                                    onChange={() => setForm({ ...form, paymentMethod: method.value })}
                                                />
                                                <div className="pay-icon-box"
                                                    style={{ background: method.iconBg, color: method.iconColor }}>
                                                    {method.icon}
                                                </div>
                                                <div>
                                                    <div className="pay-title">{method.label}</div>
                                                    <div className="pay-desc">{method.desc}</div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* ── RIGHT: Summary ── */}
                        <div className="ck-summary">
                            <div className="ck-summary-header">
                                <ShoppingBag size={18} style={{ ...IS, color: '#0057FF' }} />
                                Đơn hàng của bạn
                            </div>

                            <div className="ck-summary-items">
                                {items.map((item, idx) => (
                                    <div key={idx} className="ck-summary-item">
                                        <div className="ck-item-img">
                                            <img
                                                src={item.product?.image || item.image}
                                                alt={item.product?.name}
                                                onError={e => { e.target.src = 'https://placehold.co/52x52/F8F9FB/0057FF?text=📱' }}
                                            />
                                        </div>
                                        <div style={{ flex: 1, minWidth: 0 }}>
                                            <div className="ck-item-name">{item.product?.name || item.name}</div>
                                            <div className="ck-item-qty">x{item.quantity}</div>
                                        </div>
                                        <div className="ck-item-price">
                                            {(item.price * item.quantity).toLocaleString('vi-VN')}đ
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="ck-summary-footer">
                                <div className="ck-sum-row">
                                    <span>Tạm tính</span>
                                    <span className="val">{totalAmount.toLocaleString('vi-VN')}đ</span>
                                </div>
                                <div className="ck-sum-row">
                                    <span>Phí vận chuyển</span>
                                    {shippingFee === 0
                                        ? <span className="free">Miễn phí</span>
                                        : <span className="val">{shippingFee.toLocaleString('vi-VN')}đ</span>
                                    }
                                </div>
                                <div className="ck-total-row">
                                    <span className="ck-total-label">Tổng cộng</span>
                                    <span className="ck-total-val">{finalTotal.toLocaleString('vi-VN')}đ</span>
                                </div>

                                <button type="submit" className="btn-order" disabled={loading || items.length === 0}>
                                    <ShoppingBag size={18} style={IS} />
                                    {loading ? 'Đang xử lý...' : 'Đặt hàng ngay'}
                                </button>

                            </div>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    )
}