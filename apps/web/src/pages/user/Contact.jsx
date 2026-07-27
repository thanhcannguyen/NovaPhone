// src/pages/user/Contact.jsx
import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Phone, Mail, MapPin, Clock, Send, CheckCircle, AlertCircle, ChevronRight, MessageSquare } from 'lucide-react'

const IS = { display: 'block', border: 'none', outline: 'none', background: 'none', boxShadow: 'none', flexShrink: 0 }

const INFO_ITEMS = [
    { icon: <Phone size={18} style={{ ...IS, color: '#60A5FA' }} />, label: 'HOTLINE', value: '1800 2097 (Miễn phí)', sub: '8:00 – 22:00 hàng ngày' },
    { icon: <Mail size={18} style={{ ...IS, color: '#60A5FA' }} />, label: 'EMAIL', value: 'support@phonestore.vn', sub: 'Phản hồi trong 2–4 giờ' },
    { icon: <MapPin size={18} style={{ ...IS, color: '#60A5FA' }} />, label: 'CỬA HÀNG', value: '123 Nguyễn Văn Linh, Q.7', sub: 'TP. Hồ Chí Minh' },
    { icon: <Clock size={18} style={{ ...IS, color: '#60A5FA' }} />, label: 'GIỜ LÀM VIỆC', value: '8:00 – 22:00', sub: 'Tất cả các ngày trong tuần' },
]

const FAQ_ITEMS = [
    { q: 'Làm thế nào để theo dõi đơn hàng?', a: 'Bạn có thể vào trang "Đơn hàng của tôi" trong tài khoản để theo dõi trạng thái đơn hàng theo thời gian thực.' },
    { q: 'Tôi có thể đổi trả hàng không?', a: 'Có! PhoneStore hỗ trợ đổi trả trong 30 ngày với sản phẩm lỗi do nhà sản xuất. Xem chi tiết tại trang Chính sách.' },
    { q: 'Phí vận chuyển là bao nhiêu?', a: 'Miễn phí vận chuyển cho đơn từ 500.000đ. Đơn dưới 500.000đ phí ship 30.000đ.' },
    { q: 'Tôi có thể thanh toán bằng hình thức nào?', a: 'PhoneStore hỗ trợ thanh toán COD (tiền mặt khi nhận hàng) và chuyển khoản ngân hàng.' },
]

export default function Contact() {
    const navigate = useNavigate()
    const [form, setForm] = useState({ name: '', email: '', phone: '', message: '' })
    const [status, setStatus] = useState('')
    const [loading, setLoading] = useState(false)
    const [openFaq, setOpenFaq] = useState(null)

    useEffect(() => { window.scrollTo(0, 0) }, [])

    const handleChange = e => { setForm({ ...form, [e.target.name]: e.target.value }); setStatus('') }

    const handleSubmit = async e => {
        e.preventDefault()
        if (!form.name || !form.email || !form.message) return setStatus('error')
        setLoading(true)
        // Giả lập gửi — bạn kết nối API backend nếu có
        await new Promise(r => setTimeout(r, 1000))
        setStatus('success')
        setForm({ name: '', email: '', phone: '', message: '' })
        setLoading(false)
    }

    return (
        <div style={{ background: '#F8F9FB', minHeight: '100vh', fontFamily: 'Nunito,sans-serif' }}>
            <style>{`
            @import url('https://fonts.googleapis.com/css2?family=Nunito:wght@400;500;600;700;800&display=swap');
            .contact-page svg { display:block!important; border:none!important; outline:none!important; box-shadow:none!important; background:transparent!important; }
            .contact-grid { display:grid; grid-template-columns:1fr 1.4fr; gap:24px; margin-bottom:24px; }
            .form-control { width:100%; background:#F8F9FB; border:1.5px solid #E5E7EB; border-radius:10px; padding:11px 14px; font-size:0.875rem; font-family:'Nunito',sans-serif; color:#0A0A0A; outline:none; transition:border-color 0.2s; box-sizing:border-box; }
            .form-control:focus { border-color:#0057FF; background:#fff; box-shadow:0 0 0 3px rgba(0,87,255,0.08); }
            .form-control::placeholder { color:#9CA3AF; }
            .faq-item { border:1px solid #D1D5DB; border-radius:12px; overflow:hidden; margin-bottom:10px; }
            .faq-question { display:flex; justify-content:space-between; align-items:center; padding:16px 20px; font-size:0.9rem; font-weight:700; color:#0A0A0A; cursor:pointer; background:#fff; transition:background 0.15s; }
            .faq-question:hover { background:#F8F9FB; }
            .faq-answer { padding:0 20px 16px; font-size:0.875rem; color:#374151; line-height:1.7; background:#fff; }
            @media (max-width:768px) { .contact-grid { grid-template-columns:1fr; } }
            @media (max-width:480px) { .contact-wrap { padding:16px!important; } }
        `}</style>

            {/* Breadcrumb */}
            <div style={{ background: '#fff', borderBottom: '1px solid #E5E7EB', padding: '10px 0' }} className="contact-page">
                <div style={{ maxWidth: 1280, margin: '0 auto', padding: '0 24px', fontSize: '0.82rem', color: '#6B7280', display: 'flex', alignItems: 'center', gap: 5 }}>
                    <button onClick={() => navigate('/')} style={{ background: 'none', border: 'none', color: '#6B7280', cursor: 'pointer', fontSize: '0.82rem', fontFamily: 'Nunito,sans-serif', padding: 0 }}>Trang chủ</button>
                    <ChevronRight size={12} style={{ ...IS, color: '#9CA3AF' }} />
                    <strong style={{ color: '#0A0A0A' }}>Liên hệ</strong>
                </div>
            </div>

            <div className="contact-wrap contact-page" style={{ maxWidth: 1280, margin: '0 auto', padding: '36px 24px' }}>

                {/* Page header */}
                <div style={{ textAlign: 'center', marginBottom: 36 }}>
                    <span style={{ display: 'inline-block', background: '#EEF4FF', color: '#0057FF', fontSize: '0.75rem', fontWeight: 700, letterSpacing: 2, textTransform: 'uppercase', padding: '5px 14px', borderRadius: 100, marginBottom: 12 }}>✦ Hỗ trợ khách hàng</span>
                    <h1 style={{ fontSize: '1.8rem', fontWeight: 800, color: '#0A0A0A', marginBottom: 8 }}>Liên hệ với chúng tôi</h1>
                    <p style={{ color: '#6B7280', fontSize: '0.9rem', margin: 0 }}>Chúng tôi luôn sẵn sàng hỗ trợ bạn 24/7</p>
                </div>

                <div className="contact-grid">
                    {/* ── LEFT: Info card ── */}
                    <div style={{ background: 'linear-gradient(145deg, #0A0A0A, #0d1b3e)', borderRadius: 16, padding: '32px 28px', color: '#fff', position: 'relative', overflow: 'hidden' }}>
                        <div style={{ position: 'absolute', width: 250, height: 250, background: 'radial-gradient(circle, rgba(0,87,255,0.25) 0%, transparent 70%)', top: -60, right: -60 }} />
                        <div style={{ position: 'absolute', width: 150, height: 150, background: 'radial-gradient(circle, rgba(0,87,255,0.15) 0%, transparent 70%)', bottom: -30, left: -30 }} />
                        <div style={{ position: 'relative', zIndex: 1 }}>
                            <h2 style={{ fontSize: '1.4rem', fontWeight: 800, marginBottom: 8 }}>Thông tin liên hệ</h2>
                            <p style={{ color: 'rgba(255,255,255,0.55)', fontSize: '0.875rem', lineHeight: 1.6, marginBottom: 32 }}>
                                Đội ngũ hỗ trợ PhoneStore luôn sẵn sàng giải đáp mọi thắc mắc của bạn
                            </p>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                                {INFO_ITEMS.map(item => (
                                    <div key={item.label} style={{ display: 'flex', alignItems: 'flex-start', gap: 14 }}>
                                        <div style={{ width: 42, height: 42, background: 'rgba(0,87,255,0.2)', border: '1px solid rgba(0,87,255,0.3)', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                            {item.icon}
                                        </div>
                                        <div>
                                            <div style={{ fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1, color: 'rgba(255,255,255,0.4)', marginBottom: 3 }}>{item.label}</div>
                                            <div style={{ fontSize: '0.9rem', fontWeight: 600, color: '#fff' }}>{item.value}</div>
                                            <div style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.45)', marginTop: 1 }}>{item.sub}</div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <div style={{ height: 1, background: 'rgba(255,255,255,0.08)', margin: '28px 0' }} />
                            <div style={{ fontSize: '0.82rem', color: 'rgba(255,255,255,0.45)', marginBottom: 12 }}>Theo dõi chúng tôi</div>
                            <div style={{ display: 'flex', gap: 10 }}>
                                {['📘 Facebook', '📸 Instagram', '▶️ YouTube'].map(s => (
                                    <span key={s} style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.12)', color: 'rgba(255,255,255,0.6)', fontSize: '0.75rem', padding: '6px 12px', borderRadius: 8, cursor: 'pointer' }}>{s}</span>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* ── RIGHT: Form ── */}
                    <div style={{ background: '#fff', border: '1px solid #D1D5DB', borderRadius: 16, padding: 32 }}>
                        <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#0A0A0A', marginBottom: 6, display: 'flex', alignItems: 'center', gap: 8 }}>
                            <MessageSquare size={18} style={{ ...IS, color: '#0057FF' }} /> Gửi tin nhắn
                        </h3>
                        <p style={{ fontSize: '0.82rem', color: '#6B7280', marginBottom: 24 }}>Điền form bên dưới, chúng tôi sẽ phản hồi trong 2–4 giờ</p>

                        {status === 'success' && (
                            <div style={{ background: '#F0FDF4', border: '1px solid #BBF7D0', color: '#15803D', borderRadius: 10, padding: '12px 16px', fontSize: '0.875rem', marginBottom: 20, display: 'flex', alignItems: 'center', gap: 8, fontWeight: 600 }}>
                                <CheckCircle size={17} style={IS} /> Cảm ơn bạn! Chúng tôi đã nhận được tin nhắn và sẽ phản hồi sớm nhất.
                            </div>
                        )}
                        {status === 'error' && (
                            <div style={{ background: '#FEF2F2', border: '1px solid #FECACA', color: '#DC2626', borderRadius: 10, padding: '12px 16px', fontSize: '0.875rem', marginBottom: 20, display: 'flex', alignItems: 'center', gap: 8 }}>
                                <AlertCircle size={17} style={IS} /> Vui lòng điền đầy đủ họ tên, email và nội dung!
                            </div>
                        )}

                        <form onSubmit={handleSubmit}>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 14 }}>
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#0A0A0A', marginBottom: 6 }}>Họ và tên *</label>
                                    <input className="form-control" name="name" value={form.name} onChange={handleChange} placeholder="Nguyễn Văn A" />
                                </div>
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#0A0A0A', marginBottom: 6 }}>Email *</label>
                                    <input className="form-control" name="email" type="email" value={form.email} onChange={handleChange} placeholder="email@example.com" />
                                </div>
                            </div>
                            <div style={{ marginBottom: 14 }}>
                                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#0A0A0A', marginBottom: 6 }}>Số điện thoại</label>
                                <input className="form-control" name="phone" value={form.phone} onChange={handleChange} placeholder="0901 234 567" />
                            </div>
                            <div style={{ marginBottom: 20 }}>
                                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#0A0A0A', marginBottom: 6 }}>Nội dung *</label>
                                <textarea className="form-control" name="message" value={form.message} onChange={handleChange}
                                    placeholder="Mô tả vấn đề bạn cần hỗ trợ..."
                                    rows={5} style={{ resize: 'vertical' }} />
                            </div>
                            <button type="submit" disabled={loading} style={{ width: '100%', background: '#0057FF', color: '#fff', border: 'none', borderRadius: 10, padding: '13px', fontSize: '0.95rem', fontWeight: 700, fontFamily: 'Nunito,sans-serif', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, transition: 'all 0.2s' }}>
                                <Send size={17} style={IS} />
                                {loading ? 'Đang gửi...' : 'Gửi tin nhắn'}
                            </button>
                        </form>
                    </div>
                </div>

                {/* FAQ */}
                <div style={{ background: '#fff', border: '1px solid #E5E7EB', borderRadius: 16, padding: 32 }}>
                    <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#0A0A0A', marginBottom: 20, display: 'flex', alignItems: 'center', gap: 8 }}>
                        ❓ Câu hỏi thường gặp
                    </h3>
                    {FAQ_ITEMS.map((faq, i) => (
                        <div key={i} className="faq-item">
                            <div className="faq-question" onClick={() => setOpenFaq(openFaq === i ? null : i)}>
                                <span>{faq.q}</span>
                                <span style={{ fontSize: '1.2rem', color: '#0057FF', transition: 'transform 0.2s', transform: openFaq === i ? 'rotate(45deg)' : 'none', flexShrink: 0 }}>+</span>
                            </div>
                            {openFaq === i && <div className="faq-answer">{faq.a}</div>}
                        </div>
                    ))}
                </div>

            </div>
        </div>
    )
}