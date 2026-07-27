// src/pages/user/Policy.jsx
import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { RefreshCw, ShieldCheck, Truck, Lock, ChevronRight, AlertCircle, Info } from 'lucide-react'

const IS = { display: 'block', border: 'none', outline: 'none', background: 'none', boxShadow: 'none', flexShrink: 0 }

const TABS = [
    { key: 'return', label: 'Đổi trả hàng', icon: <RefreshCw size={15} style={IS} /> },
    { key: 'warranty', label: 'Bảo hành', icon: <ShieldCheck size={15} style={IS} /> },
    { key: 'shipping', label: 'Vận chuyển', icon: <Truck size={15} style={IS} /> },
    { key: 'privacy', label: 'Bảo mật', icon: <Lock size={15} style={IS} /> },
]

const HIGHLIGHTS = [
    { icon: '🔄', bg: '#EEF4FF', title: 'Đổi trả 30 ngày', desc: 'Đổi trả miễn phí trong 30 ngày nếu sản phẩm lỗi do nhà sản xuất' },
    { icon: '🛡️', bg: '#F0FDF4', title: 'Bảo hành 12 tháng', desc: 'Bảo hành chính hãng 12 tháng, hỗ trợ kỹ thuật tận nơi' },
    { icon: '🚚', bg: '#FFFBEB', title: 'Giao hàng toàn quốc', desc: 'Miễn phí vận chuyển cho đơn từ 500K, giao trong 2–5 ngày' },
]

function Badge({ type, children }) {
    const styles = {
        green: { background: '#F0FDF4', color: '#16A34A', border: '1px solid #BBF7D0' },
        red: { background: '#FEF2F2', color: '#EF4444', border: '1px solid #FECACA' },
        yellow: { background: '#FFFBEB', color: '#D97706', border: '1px solid #FDE68A' },
    }
    return <span style={{ ...styles[type], fontSize: '0.72rem', fontWeight: 700, padding: '2px 8px', borderRadius: 100 }}>{children}</span>
}

function Step({ num, title, desc }) {
    return (
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14, marginBottom: 14 }}>
            <div style={{ width: 32, height: 32, background: '#0057FF', color: '#fff', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.82rem', fontWeight: 800, flexShrink: 0 }}>{num}</div>
            <div>
                <div style={{ fontWeight: 700, fontSize: '0.875rem', color: '#0A0A0A', marginBottom: 3 }}>{title}</div>
                <div style={{ fontSize: '0.82rem', color: '#6B7280', lineHeight: 1.5 }} dangerouslySetInnerHTML={{ __html: desc }} />
            </div>
        </div>
    )
}

function SectionTitle({ children }) {
    return (
        <div style={{ fontSize: '1.05rem', fontWeight: 800, color: '#0A0A0A', marginBottom: 14, display: 'flex', alignItems: 'center', gap: 8, paddingBottom: 10, borderBottom: '2px solid #E5E7EB' }}>
            {children}
        </div>
    )
}

function NoteBox({ type = 'warning', children }) {
    const s = type === 'warning'
        ? { bg: '#FFF7ED', border: '#FED7AA', left: '#F97316', color: '#92400E' }
        : { bg: '#F0FDF4', border: '#BBF7D0', left: '#22C55E', color: '#166534' }
    return (
        <div style={{ background: s.bg, border: `1px solid ${s.border}`, borderLeft: `4px solid ${s.left}`, borderRadius: '0 10px 10px 0', padding: '14px 16px', fontSize: '0.85rem', color: s.color, margin: '16px 0', lineHeight: 1.6 }}>
            {children}
        </div>
    )
}

function PolicyTable({ headers, rows }) {
    return (
        <div style={{ overflowX: 'auto', margin: '16px 0' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
                <thead>
                    <tr>{headers.map(h => <th key={h} style={{ background: '#F8F9FB', padding: '10px 14px', textAlign: 'left', fontWeight: 700, color: '#0A0A0A', border: '1px solid #E5E7EB' }}>{h}</th>)}</tr>
                </thead>
                <tbody>
                    {rows.map((row, i) => (
                        <tr key={i} style={{ background: i % 2 === 1 ? '#FAFAFA' : '#fff' }}>
                            {row.map((cell, j) => <td key={j} style={{ padding: '10px 14px', border: '1px solid #E5E7EB', color: '#374151', lineHeight: 1.5 }}>{cell}</td>)}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    )
}

function PolicyList({ items }) {
    return (
        <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
            {items.map((item, i) => (
                <li key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, padding: '8px 0', fontSize: '0.875rem', color: '#374151', lineHeight: 1.6, borderBottom: '1px solid #F9FAFB' }}>
                    <span style={{ width: 6, height: 6, background: '#0057FF', borderRadius: '50%', marginTop: 8, flexShrink: 0, display: 'block' }} />
                    <span dangerouslySetInnerHTML={{ __html: item }} />
                </li>
            ))}
        </ul>
    )
}

export default function Policy() {
    const navigate = useNavigate()
    const [tab, setTab] = useState('return')

    useEffect(() => { window.scrollTo(0, 0) }, [])

    return (
        <div style={{ background: '#F8F9FB', minHeight: '100vh', fontFamily: 'Nunito,sans-serif' }}>
            <style>{`
            @import url('https://fonts.googleapis.com/css2?family=Nunito:wght@400;500;600;700;800&display=swap');
            .policy-page svg { display:block!important; border:none!important; outline:none!important; box-shadow:none!important; background:transparent!important; }
            .policy-highlights { display:grid; grid-template-columns:repeat(3,1fr); gap:16px; margin-bottom:32px; }
            .highlight-card { background:#fff; border:1px solid ##D1D5DB; border-radius:14px; padding:20px; text-align:center; transition:all 0.2s; cursor:default; }
            .highlight-card:hover { border-color:#0057FF; box-shadow:0 6px 20px rgba(0,87,255,0.08); transform:translateY(-2px); }
            .tab-nav { display:flex; border-bottom:1px solid #E5E7EB; overflow-x:auto; scrollbar-width:none; }
            .tab-nav::-webkit-scrollbar { display:none; }
            .tab-btn { display:flex; align-items:center; gap:7px; padding:16px 22px; font-size:0.875rem; font-weight:700; color:#6B7280; background:none; border:none; border-bottom:2px solid transparent; cursor:pointer; font-family:'Nunito',sans-serif; transition:all 0.2s; white-space:nowrap; margin-bottom:-1px; }
            .tab-btn:hover { color:#0057FF; }
            .tab-btn.active { color:#0057FF; border-bottom-color:#0057FF; }
            @media (max-width:768px) { .policy-highlights { grid-template-columns:1fr; } .tab-btn { padding:12px 14px; font-size:0.82rem; } }
            @media (max-width:480px) { .policy-wrap { padding:16px!important; } }
        `}</style>

            {/* Breadcrumb */}
            <div style={{ background: '#fff', borderBottom: '1px solid #E5E7EB', padding: '10px 0' }} className="policy-page">
                <div style={{ maxWidth: 1280, margin: '0 auto', padding: '0 24px', fontSize: '0.82rem', color: '#6B7280', display: 'flex', alignItems: 'center', gap: 5 }}>
                    <button onClick={() => navigate('/')} style={{ background: 'none', border: 'none', color: '#6B7280', cursor: 'pointer', fontSize: '0.82rem', fontFamily: 'Nunito,sans-serif', padding: 0 }}>Trang chủ</button>
                    <ChevronRight size={12} style={{ ...IS, color: '#9CA3AF' }} />
                    <strong style={{ color: '#0A0A0A' }}>Chính sách</strong>
                </div>
            </div>

            <div className="policy-wrap policy-page" style={{ maxWidth: 1280, margin: '0 auto', padding: '36px 24px' }}>

                {/* Page header */}
                <div style={{ textAlign: 'center', marginBottom: 36 }}>
                    <span style={{ display: 'inline-block', background: '#EEF4FF', color: '#0057FF', fontSize: '0.75rem', fontWeight: 700, letterSpacing: 2, textTransform: 'uppercase', padding: '5px 14px', borderRadius: 100, marginBottom: 12 }}>✦ Cam kết của chúng tôi</span>
                    <h1 style={{ fontSize: '1.8rem', fontWeight: 800, color: '#0A0A0A', marginBottom: 8 }}>Chính sách & Điều khoản</h1>
                    <p style={{ color: '#6B7280', fontSize: '0.9rem', margin: 0 }}>Minh bạch, rõ ràng — chúng tôi cam kết bảo vệ quyền lợi của bạn</p>
                </div>

                {/* Highlights */}
                <div className="policy-highlights">
                    {HIGHLIGHTS.map(h => (
                        <div key={h.title} className="highlight-card">
                            <div style={{ width: 52, height: 52, background: h.bg, borderRadius: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem', margin: '0 auto 12px' }}>{h.icon}</div>
                            <div style={{ fontWeight: 800, fontSize: '0.9rem', color: '#0A0A0A', marginBottom: 4 }}>{h.title}</div>
                            <div style={{ fontSize: '0.78rem', color: '#6B7280', lineHeight: 1.5 }}>{h.desc}</div>
                        </div>
                    ))}
                </div>

                {/* Tabs */}
                <div style={{ background: '#fff', border: '1px solid #D1D5DB', borderRadius: 16, overflow: 'hidden' }}>
                    <div className="tab-nav">
                        {TABS.map(t => (
                            <button key={t.key} className={`tab-btn${tab === t.key ? ' active' : ''}`} onClick={() => setTab(t.key)}>
                                {t.icon} {t.label}
                            </button>
                        ))}
                    </div>

                    <div style={{ padding: 32 }}>

                        {/* ── ĐỔI TRẢ ── */}
                        {tab === 'return' && (
                            <>
                                <div style={{ marginBottom: 28 }}>
                                    <SectionTitle><Info size={16} style={{ ...IS, color: '#0057FF' }} /> Điều kiện đổi trả</SectionTitle>
                                    <PolicyTable
                                        headers={['Trường hợp', 'Thời hạn', 'Chi phí', 'Trạng thái']}
                                        rows={[
                                            ['Sản phẩm lỗi do nhà sản xuất', '30 ngày', 'Miễn phí', <Badge type="green">Được đổi</Badge>],
                                            ['Giao sai sản phẩm / màu sắc', '7 ngày', 'Miễn phí', <Badge type="green">Được đổi</Badge>],
                                            ['Khách đổi ý (không lỗi)', '7 ngày', 'Khách chịu phí ship', <Badge type="yellow">Có phí</Badge>],
                                            ['Sản phẩm đã kích hoạt bảo hành', '—', '—', <Badge type="red">Không đổi</Badge>],
                                            ['Sản phẩm đã qua sử dụng, trầy xước', '—', '—', <Badge type="red">Không đổi</Badge>],
                                        ]}
                                    />
                                </div>
                                <div style={{ marginBottom: 28 }}>
                                    <SectionTitle><AlertCircle size={16} style={{ ...IS, color: '#0057FF' }} /> Yêu cầu quay video khi nhận hàng COD</SectionTitle>
                                    <div style={{ background: '#FEF2F2', border: '1px solid #FECACA', borderLeft: '4px solid #EF4444', borderRadius: '0 10px 10px 0', padding: 16, marginBottom: 16 }}>
                                        <div style={{ fontWeight: 800, color: '#DC2626', fontSize: '0.9rem', marginBottom: 8 }}>⚠ Bắt buộc đối với đơn hàng thanh toán COD</div>
                                        <div style={{ fontSize: '0.85rem', color: '#7F1D1D', lineHeight: 1.7 }}>
                                            Để bảo vệ quyền lợi của bạn, PhoneStore <strong>yêu cầu bắt buộc quay video liên tục toàn bộ quá trình mở hộp</strong> khi nhận hàng COD. <strong>Mọi khiếu nại sẽ không được xử lý nếu không có video unboxing.</strong>
                                        </div>
                                    </div>
                                    <PolicyList items={[
                                        'Quay video <strong>liên tục, không cắt ghép</strong> từ lúc nhận kiện hàng đến khi mở hộp hoàn toàn',
                                        'Video phải thể hiện rõ <strong>tình trạng bên ngoài</strong> — bao bì, băng keo, tem niêm phong',
                                        'Quay rõ <strong>mã đơn hàng</strong> trên kiện hàng trong video',
                                        'Nếu phát hiện lỗi, <strong>không sử dụng sản phẩm</strong> và liên hệ hotline <strong>1800 2097</strong>',
                                        'Kiện hàng móp méo, ướt, rách — <strong>từ chối nhận và quay video</strong> trước khi trả shipper',
                                    ]} />
                                </div>
                                <div style={{ marginBottom: 28 }}>
                                    <SectionTitle><RefreshCw size={16} style={{ ...IS, color: '#0057FF' }} /> Quy trình đổi trả</SectionTitle>
                                    <Step num={1} title="Liên hệ hỗ trợ" desc="Gọi hotline <strong>1800 2097</strong> hoặc nhắn tin fanpage để thông báo yêu cầu và được xác nhận điều kiện" />
                                    <Step num={2} title="Xác nhận & đóng gói" desc="Nhân viên xác nhận điều kiện, hướng dẫn đóng gói và mang sản phẩm đến cửa hàng" />
                                    <Step num={3} title="Kiểm tra sản phẩm" desc="Kỹ thuật viên kiểm tra trong <strong>1–2 ngày làm việc</strong> và thông báo kết quả" />
                                    <Step num={4} title="Hoàn tất đổi trả" desc="Giao sản phẩm mới hoặc hoàn tiền trong <strong>3–5 ngày làm việc</strong>" />
                                </div>
                                <NoteBox type="warning">⚠ <strong>Lưu ý:</strong> PhoneStore có quyền từ chối đổi trả nếu sản phẩm không đáp ứng điều kiện. Mọi tranh chấp giải quyết theo quy định pháp luật Việt Nam.</NoteBox>
                            </>
                        )}

                        {/* ── BẢO HÀNH ── */}
                        {tab === 'warranty' && (
                            <>
                                <div style={{ marginBottom: 28 }}>
                                    <SectionTitle><ShieldCheck size={16} style={{ ...IS, color: '#0057FF' }} /> Thời hạn bảo hành</SectionTitle>
                                    <PolicyTable
                                        headers={['Loại sản phẩm', 'Bảo hành chính hãng', 'Bảo hành PhoneStore']}
                                        rows={[
                                            ['Điện thoại iPhone', '12 tháng Apple', '12 tháng'],
                                            ['Android (Samsung, Xiaomi, Oppo...)', '12 tháng hãng', '12 tháng'],
                                            ['Phụ kiện chính hãng', '3–6 tháng', '3 tháng'],
                                            ['Phụ kiện thông thường', 'Không', '1 tháng'],
                                        ]}
                                    />
                                </div>
                                <div style={{ marginBottom: 28 }}>
                                    <SectionTitle>📋 Điều kiện bảo hành</SectionTitle>
                                    <PolicyList items={[
                                        'Sản phẩm còn trong thời hạn bảo hành, có hóa đơn mua hàng từ PhoneStore',
                                        'Lỗi kỹ thuật do nhà sản xuất — không phải do tác động vật lý, nước, cháy nổ',
                                        'Tem bảo hành, số IMEI còn nguyên vẹn, không bị can thiệp',
                                        'Sản phẩm không bị tự ý sửa chữa tại nơi khác trong thời gian bảo hành',
                                    ]} />
                                </div>
                                <div style={{ marginBottom: 28 }}>
                                    <SectionTitle>🚫 Trường hợp không được bảo hành</SectionTitle>
                                    <PolicyList items={[
                                        'Màn hình bể, vỡ, trầy xước do va đập',
                                        'Vào nước, ngấm ẩm (trừ sản phẩm chống nước được công bố)',
                                        'Cháy nổ do sạc không đúng cách, dùng sạc không chính hãng',
                                        'Tự ý tháo máy, sửa chữa tại nơi không được ủy quyền',
                                        'Tem bảo hành bị rách, số serial/IMEI không khớp',
                                    ]} />
                                </div>
                                <NoteBox type="success">✅ <strong>Lưu ý:</strong> Mang sản phẩm đến trực tiếp cửa hàng hoặc gọi hotline <strong>1800 2097</strong> để được hỗ trợ bảo hành nhanh nhất.</NoteBox>
                            </>
                        )}

                        {/* ── VẬN CHUYỂN ── */}
                        {tab === 'shipping' && (
                            <>
                                <div style={{ marginBottom: 28 }}>
                                    <SectionTitle><Truck size={16} style={{ ...IS, color: '#0057FF' }} /> Phí vận chuyển</SectionTitle>
                                    <PolicyTable
                                        headers={['Giá trị đơn hàng', 'Phí vận chuyển', 'Thời gian']}
                                        rows={[
                                            ['Dưới 500.000đ', '30.000đ', '2–5 ngày làm việc'],
                                            ['Từ 500.000đ trở lên', <Badge type="green">Miễn phí</Badge>, '2–5 ngày làm việc'],
                                            ['Hỏa tốc (nội thành TP.HCM)', '50.000đ', 'Trong ngày'],
                                        ]}
                                    />
                                </div>
                                <div style={{ marginBottom: 28 }}>
                                    <SectionTitle>📦 Quy trình xử lý đơn hàng</SectionTitle>
                                    <Step num={1} title="Đặt hàng & xác nhận" desc="Sau khi đặt hàng, bạn nhận xác nhận qua email trong vòng <strong>30 phút</strong>" />
                                    <Step num={2} title="Đóng gói & bàn giao" desc="Đơn hàng được đóng gói cẩn thận và bàn giao cho đơn vị vận chuyển trong <strong>24 giờ</strong>" />
                                    <Step num={3} title="Vận chuyển" desc="Đơn vị vận chuyển giao hàng trong <strong>2–5 ngày</strong> làm việc tùy khu vực" />
                                    <Step num={4} title="Nhận hàng & kiểm tra" desc="Kiểm tra hàng trước khi thanh toán (COD). Quay video unboxing để đảm bảo quyền lợi" />
                                </div>
                                <NoteBox type="warning">⚠ <strong>Lưu ý:</strong> Thời gian giao hàng có thể thay đổi do điều kiện thời tiết, lễ tết hoặc các yếu tố bất khả kháng.</NoteBox>
                            </>
                        )}

                        {/* ── BẢO MẬT ── */}
                        {tab === 'privacy' && (
                            <>
                                <div style={{ marginBottom: 28 }}>
                                    <SectionTitle><Lock size={16} style={{ ...IS, color: '#0057FF' }} /> Thông tin chúng tôi thu thập</SectionTitle>
                                    <PolicyList items={[
                                        'Họ tên, số điện thoại, địa chỉ email khi đăng ký tài khoản',
                                        'Địa chỉ giao hàng khi đặt mua sản phẩm',
                                        'Lịch sử mua hàng và thông tin đơn hàng',
                                        'Thông tin thiết bị và cookie khi sử dụng website',
                                    ]} />
                                </div>
                                <div style={{ marginBottom: 28 }}>
                                    <SectionTitle>🔒 Cách chúng tôi sử dụng thông tin</SectionTitle>
                                    <PolicyList items={[
                                        'Xử lý đơn hàng và liên hệ giao hàng',
                                        'Gửi thông báo về đơn hàng, khuyến mãi (nếu bạn đồng ý)',
                                        'Cải thiện trải nghiệm người dùng trên website',
                                        'Phòng chống gian lận và bảo mật tài khoản',
                                    ]} />
                                </div>
                                <div style={{ marginBottom: 28 }}>
                                    <SectionTitle>🛡️ Cam kết bảo mật</SectionTitle>
                                    <PolicyList items={[
                                        'PhoneStore <strong>không bán, không chia sẻ</strong> thông tin cá nhân của bạn cho bên thứ ba',
                                        'Mọi dữ liệu được mã hóa và lưu trữ an toàn trên máy chủ bảo mật',
                                        'Bạn có quyền yêu cầu xem, chỉnh sửa hoặc xóa thông tin bất kỳ lúc nào',
                                        'Liên hệ <strong>support@phonestore.vn</strong> nếu có thắc mắc về quyền riêng tư',
                                    ]} />
                                </div>
                                <NoteBox type="success">✅ Chính sách bảo mật này có hiệu lực từ <strong>01/01/2025</strong> và được cập nhật định kỳ.</NoteBox>
                            </>
                        )}

                    </div>
                </div>
            </div>
        </div>
    )
}