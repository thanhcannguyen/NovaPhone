import { Link } from 'react-router-dom'

export default function Footer() {
    return (
        <footer style={s.footer}>
            <div style={s.inner}>
                <div style={s.grid}>
                    <div>
                        <div style={s.brand}>Phone<span style={{ color: '#0057FF' }}>Store</span></div>
                        <p style={s.desc}>Điện thoại chính hãng, giá tốt nhất thị trường. Hàng nghìn sản phẩm từ các thương hiệu hàng đầu.</p>
                        <div style={{ display: 'flex', gap: 8 }}>
                            {['📘 Facebook', '📸 Instagram', '🐦 Twitter'].map(s => (
                                <span key={s} style={{ fontSize: '0.78rem', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.5)', padding: '4px 10px', borderRadius: 6 }}>{s}</span>
                            ))}
                        </div>
                    </div>
                    <div>
                        <div style={s.heading}>Sản phẩm</div>
                        <ul style={{ listStyle: 'none', padding: 0 }}>
                            {['iPhone', 'Samsung Galaxy', 'Xiaomi', 'Oppo', 'Vivo'].map(b => (
                                <li key={b} style={{ marginBottom: 8 }}>
                                    <Link to={`/products?search=${b}`} style={s.link}>{b}</Link>
                                </li>
                            ))}
                        </ul>
                    </div>
                    <div>
                        <div style={s.heading}>Hỗ trợ</div>
                        <ul style={{ listStyle: 'none', padding: 0 }}>
                            {['Chính sách đổi trả', 'Bảo hành', 'Thanh toán', 'Vận chuyển', 'Liên hệ'].map(item => (
                                <li key={item} style={{ marginBottom: 8 }}>
                                    <span style={s.link}>{item}</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                    <div>
                        <div style={s.heading}>Liên hệ</div>
                        {[
                            { icon: '📍', text: '123 Nguyễn Văn Linh, TP.HCM' },
                            { icon: '📞', text: '1800 1234 (Miễn phí)' },
                            { icon: '✉️', text: 'support@phonestore.vn' },
                            { icon: '⏰', text: '8:00 – 22:00 hàng ngày' },
                        ].map(item => (
                            <div key={item.text} style={{ display: 'flex', gap: 8, marginBottom: 10, fontSize: '0.84rem', color: 'rgba(255,255,255,0.48)', alignItems: 'flex-start' }}>
                                <span style={{ flexShrink: 0 }}>{item.icon}</span>
                                <span>{item.text}</span>
                            </div>
                        ))}
                    </div>
                </div>
                <div style={s.bottom}>
                    <span>© 2025 PhoneStore. Tất cả quyền được bảo lưu.</span>
                    <div style={{ display: 'flex', gap: 8 }}>
                        {['Visa', 'Mastercard', 'MoMo', 'ZaloPay'].map(p => (
                            <span key={p} style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.5)', fontSize: '0.68rem', padding: '4px 10px', borderRadius: 6 }}>{p}</span>
                        ))}
                    </div>
                </div>
            </div>
        </footer>
    )
}

const s = {
    footer: { background: '#0A0A0A', color: 'rgba(255,255,255,0.5)', padding: '52px 0 28px', fontFamily: 'Nunito,sans-serif', marginTop: 'auto' },
    inner: { maxWidth: 1280, margin: '0 auto', padding: '0 24px' },
    grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 40, marginBottom: 40 },
    brand: { fontFamily: 'Nunito,sans-serif', fontSize: '1.4rem', fontWeight: 800, color: '#fff', marginBottom: 10, letterSpacing: -0.3 },
    desc: { fontSize: '0.84rem', lineHeight: 1.7, maxWidth: 240, marginBottom: 16 },
    heading: { fontFamily: 'Nunito,sans-serif', fontWeight: 700, color: '#fff', fontSize: '0.9rem', marginBottom: 14 },
    link: { color: 'rgba(255,255,255,0.48)', textDecoration: 'none', fontSize: '0.84rem', transition: 'color 0.2s', cursor: 'pointer' },
    bottom: { borderTop: '1px solid rgba(255,255,255,0.07)', marginTop: 40, paddingTop: 20, display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.76rem', flexWrap: 'wrap', gap: 8 },
}