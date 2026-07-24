// Admin Topbar — PHP style
export default function Topbar({ title, subtitle, actions }) {
    return (
        <div style={s.topbar}>
            <div>
                <h1 style={s.title}>{title}</h1>
                {subtitle && <p style={s.sub}>{subtitle}</p>}
            </div>
            {actions && <div style={s.actions}>{actions}</div>}
        </div>
    )
}
const s = {
    topbar: {
        background: '#fff', borderBottom: '1px solid #E5E7EB',
        padding: '0 28px', height: 60,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        position: 'sticky', top: 0, zIndex: 50,
        fontFamily: 'Nunito, sans-serif', flexShrink: 0,
    },
    title: { fontSize: '1rem', fontWeight: 800, color: '#0A0A0A', margin: 0 },
    sub: { fontSize: '0.78rem', color: '#6B7280', margin: '2px 0 0' },
    actions: { display: 'flex', alignItems: 'center', gap: 10 },
}