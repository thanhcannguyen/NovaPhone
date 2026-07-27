import { Link, useNavigate, useLocation } from 'react-router-dom'

// Các trang Chính sách/Hỗ trợ chi tiết (Hướng dẫn mua hàng, Điều khoản dịch vụ...)
// chưa được xây dựng riêng — dẫn về trang Chính sách/Liên hệ thật đã có, hoặc trang chủ nếu chưa có trang tương ứng.
const POLICY_LINKS = [
    { label: 'Chính sách bảo mật', to: '/policy' },
    { label: 'Chính sách vận chuyển', to: '/policy' },
    { label: 'Chính sách đổi trả', to: '/policy' },
    { label: 'Quy định sử dụng', to: '/policy' },
]
const SUPPORT_LINKS = [
    { label: 'Hướng dẫn mua hàng', to: '/contact' },
    { label: 'Hướng dẫn thanh toán', to: '/contact' },
    { label: 'Hướng dẫn giao nhận', to: '/policy' },
    { label: 'Điều khoản dịch vụ', to: '/policy' },
]

export default function Footer() {
    const navigate = useNavigate()
    const location = useLocation()

    // Điều hướng có xử lý trường hợp đang sẵn ở đúng trang đích rồi —
    // đổi route sẽ không kích hoạt ScrollToTop nên phải tự cuộn lên đầu.
    const goTo = (to) => (e) => {
        e.preventDefault()
        if (location.pathname === to) {
            window.scrollTo({ top: 0, behavior: 'smooth' })
        } else {
            navigate(to)
        }
    }

    return (
        <footer style={s.footer}>
            <div style={s.inner}>
                <div style={s.grid}>

                    {/* Cột 1: Logo + mô tả + mạng xã hội */}
                    <div>
                        <div style={s.brand}>Nova<span style={{ color: '#0057FF' }}>Phone</span></div>
                        <p style={s.desc}>Nơi công nghệ gặp gỡ phong cách sống. NovaPhone mang đến trải nghiệm mua sắm điện thoại chính hãng, tận tâm và đáng tin cậy.</p>                    </div>

                    {/* Cột 2: Thông tin liên hệ */}
                    <div>
                        <div style={s.heading}>Thông tin</div>
                        <div style={s.infoRow}>
                            <span><strong style={s.infoStrong}>Địa chỉ:</strong> KDC Ehome4, Lái Thiêu, TP.HCM</span>
                        </div>
                        <div style={s.infoRow}>
                            <span><strong style={s.infoStrong}>Điện thoại:</strong> 0876 765 304</span>
                        </div>
                        <div style={s.infoRow}>
                            <span><strong style={s.infoStrong}>Email:</strong> support@novaphone.vn</span>
                        </div>
                    </div>

                    {/* Cột 3: Chính sách */}
                    <div>
                        <div style={s.heading}>Chính sách</div>
                        <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                            {POLICY_LINKS.map(item => (
                                <li key={item.label} style={{ marginBottom: 10 }}>
                                    <a href={item.to} style={s.link} onClick={goTo(item.to)}>{item.label}</a>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Cột 4: Hỗ trợ */}
                    <div>
                        <div style={s.heading}>Hỗ trợ</div>
                        <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                            {SUPPORT_LINKS.map(item => (
                                <li key={item.label} style={{ marginBottom: 10 }}>
                                    <a href={item.to} style={s.link} onClick={goTo(item.to)}>{item.label}</a>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            </div>
        </footer>
    )
}

const s = {
    footer: { background: '#0A0A0A', color: 'rgba(255,255,255,0.5)', padding: '52px 0 44px', fontFamily: 'Nunito,sans-serif', marginTop: 'auto' }, inner: { maxWidth: 1280, margin: '0 auto', padding: '0 24px' },
    grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 40, marginBottom: 0 }, brand: { fontFamily: 'Nunito,sans-serif', fontSize: '1.7rem', fontWeight: 800, color: '#fff', marginBottom: 12, letterSpacing: -0.3 },
    desc: { fontSize: '1rem', lineHeight: 1.7, maxWidth: 280, marginBottom: 18 },
    heading: { fontFamily: 'Nunito,sans-serif', fontWeight: 700, color: '#fff', fontSize: '1.1rem', marginBottom: 18 },
    link: { color: 'rgba(255,255,255,0.55)', textDecoration: 'none', fontSize: '1rem', transition: 'color 0.2s', cursor: 'pointer' },
    infoRow: { display: 'flex', alignItems: 'flex-start', gap: 10, marginBottom: 15, fontSize: '1rem', color: 'rgba(255,255,255,0.55)', lineHeight: 1.5 }, infoStrong: { color: '#fff', fontWeight: 700 },
}