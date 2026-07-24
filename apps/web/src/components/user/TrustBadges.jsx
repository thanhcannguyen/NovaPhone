import { Truck, Gift, BadgeCheck, PhoneCall } from 'lucide-react'

const BADGES = [
    { icon: Truck, title: 'Vận chuyển miễn phí', sub: 'Hóa đơn trên 5 triệu', bg: '#EAF1FF', fg: '#0057FF' },
    { icon: Gift, title: 'Quà tặng hấp dẫn', sub: 'Hóa đơn trên 10 triệu', bg: '#FDEAF3', fg: '#DB2777' },
    { icon: BadgeCheck, title: 'Chứng nhận chất lượng', sub: 'Sản phẩm chính hãng', bg: '#FEF6E0', fg: '#B45309' },
    { icon: PhoneCall, title: 'Hotline: 1900 6750', sub: 'Hỗ trợ 24/7', bg: '#E6F9EF', fg: '#10893E' },
]

export default function TrustBadges() {
    return (
        <div className="ps-trust-grid">
            <style>{`
                .ps-trust-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 14px; margin-bottom: 28px; }
                .ps-trust-item { display: flex; align-items: center; gap: 12px; border-radius: 12px; padding: 14px 16px; }
                .ps-trust-icon { width: 38px; height: 38px; border-radius: 10px; background: rgba(255,255,255,0.6); display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
                .ps-trust-title { font-weight: 800; font-size: 0.85rem; color: #0A0A0A; line-height: 1.3; }
                .ps-trust-sub { font-size: 0.75rem; color: #6B7280; margin-top: 1px; }
                @media (max-width: 900px) { .ps-trust-grid { grid-template-columns: repeat(2, 1fr); } }
                @media (max-width: 480px) { .ps-trust-grid { grid-template-columns: 1fr; } }
            `}</style>
            {BADGES.map((b, i) => {
                const Icon = b.icon
                return (
                    <div key={i} className="ps-trust-item" style={{ background: b.bg }}>
                        <div className="ps-trust-icon">
                            <Icon size={20} color={b.fg} />
                        </div>
                        <div>
                            <div className="ps-trust-title">{b.title}</div>
                            <div className="ps-trust-sub">{b.sub}</div>
                        </div>
                    </div>
                )
            })}
        </div>
    )
}