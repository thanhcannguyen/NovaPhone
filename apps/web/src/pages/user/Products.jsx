import { useState, useEffect, useRef } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { getCategories } from '../../api/categoryApi'
import { getProducts } from '../../api/productApi'
import ProductCard from '../../components/user/ProductCard'
// bỏ: import { useCart } from '../../context/CartContext'

const PRICE_RANGES = [
    { label: 'Tất cả', min: null, max: null },
    { label: '< 5 triệu', min: null, max: 5000000 },
    { label: '5–10 triệu', min: 5000000, max: 10000000 },
    { label: '10–20 triệu', min: 10000000, max: 20000000 },
    { label: '> 20 triệu', min: 20000000, max: null },
]

const BANNERS = [
    { tag: 'FLAGSHIP 2025', title: 'iPhone 16 Pro Max', titleHighlight: 'Pro Max', sub: 'Chip A18 Pro · Camera Control · Titanium Design', price: '34.990.000đ', bg: 'linear-gradient(135deg, #0A0A0A 0%, #1a1a2e 100%)', accent: '#60A5FA', img: 'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=800&q=90' },
    { tag: 'ANDROID KING', title: 'Galaxy S25 Ultra', titleHighlight: 'S25 Ultra', sub: 'Snapdragon 8 Elite · 200MP · S Pen tích hợp', price: '31.990.000đ', bg: 'linear-gradient(135deg, #0c1a2e 0%, #0f3460 100%)', accent: '#38bdf8', img: 'https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=800&q=90' },
    { tag: 'GIÁ TỐT NHẤT', title: 'Xiaomi 14T Pro', titleHighlight: '14T Pro', sub: 'Leica Camera · Sạc 120W · Chống nước IP68', price: '16.990.000đ', bg: 'linear-gradient(135deg, #1a0533 0%, #3b0764 100%)', accent: '#a78bfa', img: 'https://images.unsplash.com/photo-1585060544812-6b45742d762f?w=800&q=90' },
]

function BannerSlider() {
    const [cur, setCur] = useState(0)
    const [visible, setVisible] = useState(true)
    const timer = useRef(null)
    const goTo = (i) => { setVisible(false); setTimeout(() => { setCur(i); setVisible(true) }, 200) }
    const resetAndGo = (i) => { clearInterval(timer.current); goTo(i); timer.current = setInterval(() => { setVisible(false); setTimeout(() => { setCur(c => (c + 1) % BANNERS.length); setVisible(true) }, 200) }, 5000) }
    useEffect(() => { timer.current = setInterval(() => { setVisible(false); setTimeout(() => { setCur(c => (c + 1) % BANNERS.length); setVisible(true) }, 200) }, 5000); return () => clearInterval(timer.current) }, [])
    const b = BANNERS[cur]
    return (
        <div style={{ background: '#0A0A0A', overflow: 'hidden', borderRadius: 16, marginBottom: 0 }}>
            <div style={{ position: 'relative', minHeight: 280, display: 'flex', alignItems: 'center', overflow: 'hidden', background: b.bg, opacity: visible ? 1 : 0, transform: visible ? 'none' : 'translateY(6px)', transition: 'opacity 0.2s, transform 0.2s', borderRadius: 16 }}>
                <div style={{ position: 'absolute', width: 380, height: 380, background: `radial-gradient(circle, rgba(0,87,255,0.2) 0%, transparent 70%)`, top: -100, right: -50, borderRadius: '50%', pointerEvents: 'none' }} />
                <div style={{ position: 'relative', zIndex: 2, padding: '0 32px 0 44px', flex: '0 0 55%' }}>
                    <span style={{ display: 'inline-block', background: 'rgba(0,87,255,0.18)', border: `1px solid rgba(0,87,255,0.4)`, color: b.accent, fontSize: '0.68rem', fontWeight: 800, letterSpacing: 2, textTransform: 'uppercase', padding: '3px 12px', borderRadius: 100, marginBottom: 14 }}>{b.tag}</span>
                    <h2 style={{ fontSize: '1.9rem', fontWeight: 900, color: '#F8F9FB', margin: '0 0 8px', lineHeight: 1.15, letterSpacing: -0.5 }}>{b.title}</h2>
                    <p style={{ fontSize: '0.85rem', color: 'rgba(248,249,251,0.55)', margin: '0 0 16px', lineHeight: 1.6 }}>{b.sub}</p>
                    <div className="ps-banner-cta-row">
                        <span style={{ fontSize: '1.5rem', fontWeight: 800, color: b.accent }}>{b.price}</span>
                        <button style={{ padding: '9px 20px', borderRadius: 10, border: 'none', background: '#0057FF', color: '#fff', fontSize: '0.82rem', fontWeight: 700, cursor: 'pointer', transition: 'background 0.2s' }}>Xem ngay</button>
                    </div>
                </div>
                <div style={{ position: 'absolute', right: 0, top: 0, width: '45%', height: '100%' }}>
                    <img src={b.img} alt={b.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={e => { e.target.style.display = 'none' }} />
                    <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to right, #0A0A0A 0%, transparent 40%)' }} />
                </div>
            </div>
            <div style={{ display: 'flex', justifyContent: 'center', gap: 6, padding: '10px 0', background: '#070709' }}>
                {BANNERS.map((_, i) => (
                    <button key={i} onClick={() => resetAndGo(i)} style={{ width: i === cur ? 28 : 8, height: 8, borderRadius: 4, border: 'none', cursor: 'pointer', padding: 0, background: i === cur ? b.accent : 'rgba(255,255,255,0.2)', transition: 'all 0.3s' }} />
                ))}
            </div>
        </div>
    )
}



export default function ProductsPage() {
    const navigate = useNavigate()
    const [searchParams] = useSearchParams()

    const [categories, setCategories] = useState([])
    const [products, setProducts] = useState([])
    const [selectedCategories, setSelectedCategories] = useState([]) // mảng rỗng = chưa lọc hãng nào = hiện tất cả
    const [selectedPriceRanges, setSelectedPriceRanges] = useState([]) // mảng rỗng = chưa lọc giá nào = hiện tất cả
    const [search, setSearch] = useState('')
    const [loading, setLoading] = useState(true)

    const [shimmerAll, setShimmerAll] = useState(false)
    const [sidebarOpen, setSidebarOpen] = useState(false)
    const [sortBy, setSortBy] = useState('newest')
    const [sortOpen, setSortOpen] = useState(false)




    useEffect(() => {
        const handler = () => { setShimmerAll(true); setTimeout(() => setShimmerAll(false), 1600) }
        window.addEventListener('logoClick', handler)
        return () => window.removeEventListener('logoClick', handler)
    }, [])

    useEffect(() => { setSearch(searchParams.get('search') || '') }, [searchParams])
    useEffect(() => {
        const catId = searchParams.get('category')
        if (catId) setSelectedCategories([catId])
    }, [searchParams])
    useEffect(() => { getCategories().then(r => setCategories(r.data.data)).catch(console.error) }, [])
    // Lọc nhiều hãng / nhiều khoảng giá cùng lúc cần logic OR bên trong mỗi nhóm —
    // API hiện tại chỉ nhận 1 category/1 khoảng giá, nên gọi API chỉ với "search",
    // còn lọc hãng + giá thực hiện ở client (xem filteredProducts bên dưới).
    useEffect(() => {
        setLoading(true)
        const params = {}
        if (search) params.search = search
        getProducts(params).then(r => setProducts(r.data.data)).catch(console.error).finally(() => setLoading(false))
    }, [search])


    const toggleCategory = (id) => {
        if (id === null) { setSelectedCategories([]); return }
        setSelectedCategories(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id])
    }
    const togglePriceRange = (i) => {
        if (i === 0) { setSelectedPriceRanges([]); return }
        setSelectedPriceRanges(prev => prev.includes(i) ? prev.filter(x => x !== i) : [...prev, i])
    }

    const clearAll = () => { setSelectedCategories([]); setSelectedPriceRanges([]); setSearch('') }
    const hasFilter = selectedCategories.length > 0 || selectedPriceRanges.length > 0 || search !== ''

    // Lọc theo nhiều hãng (OR trong nhóm hãng) VÀ nhiều khoảng giá (OR trong nhóm giá)
    const filteredProducts = products.filter(p => {
        const catId = p.category?._id || p.category
        const matchCategory = selectedCategories.length === 0 || selectedCategories.includes(catId)
        const matchPrice = selectedPriceRanges.length === 0 || selectedPriceRanges.some(i => {
            const pr = PRICE_RANGES[i]
            return (pr.min == null || p.price >= pr.min) && (pr.max == null || p.price <= pr.max)
        })
        return matchCategory && matchPrice
    })

    const sortedProducts = [...filteredProducts].sort((a, b) => {
        if (sortBy === 'price_asc') return a.price - b.price
        if (sortBy === 'price_desc') return b.price - a.price
        if (sortBy === 'discount') return (b.originalPrice - b.price) - (a.originalPrice - a.price)
        return 0
    })

    return (
        <div style={{ background: '#F8F9FB', minHeight: '100vh', fontFamily: 'Nunito, sans-serif' }}>
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Nunito:wght@400;500;600;700;800&display=swap');
                @keyframes spin { to { transform: rotate(360deg) } }
                @keyframes shimmerSweep {
                    0% { transform: translateX(-100%) skewX(-15deg); opacity: 0; }
                    15% { opacity: 1; } 85% { opacity: 1; }
                    100% { transform: translateX(220%) skewX(-15deg); opacity: 0; }
                }
                .shimmer-card { overflow: hidden; position: relative; border-radius: 12px; }
                .shimmer-card::after { content: ''; position: absolute; inset: 0; z-index: 10; background: linear-gradient(105deg, transparent 25%, rgba(255,255,255,0.65) 50%, transparent 75%); animation: shimmerSweep 0.85s ease forwards; animation-delay: var(--shimmer-delay, 0ms); pointer-events: none; border-radius: 12px; }

                /* Breadcrumb */
                .ps-breadcrumb { background: #fff; border-bottom: 1px solid #E5E7EB; padding: 10px 0; font-size: 0.82rem; color: #6B7280; }
                .ps-breadcrumb-inner { max-width: 1280px; margin: 0 auto; padding: 0 24px; }

                /* Banner section */
                .ps-hero { background: var(--light,#F8F9FB); padding: 16px 0; }
                .ps-hero-inner { max-width: 1280px; margin: 0 auto; padding: 0 24px; }

                /* Products page layout */
                .ps-products-page { max-width: 1280px; margin: 0 auto; padding: 24px; display: grid; grid-template-columns: 248px 1fr; gap: 22px; align-items: start; }

                /* Sidebar */
                .ps-sidebar { position: sticky; top: 80px; }
                .ps-filter-card { background: #fff; border: 1px solid #E5E7EB; border-radius: 14px; overflow: hidden; margin-bottom: 12px; }
                .ps-filter-head { display: flex; align-items: center; justify-content: space-between; padding: 13px 16px; border-bottom: 1px solid #E5E7EB; }
                .ps-filter-head-title { font-weight: 700; font-size: 0.875rem; color: #0A0A0A; }
                .ps-filter-body { padding: 12px 16px; }
                .ps-filter-check { display: flex; align-items: center; gap: 8px; padding: 5px 0; cursor: pointer; font-size: 0.875rem; color: #0A0A0A; transition: color 0.15s; }
                .ps-filter-check:hover { color: #0057FF; }
                .ps-filter-check input { width: 15px; height: 15px; accent-color: #0057FF; cursor: pointer; flex-shrink: 0; }

                /* Price presets */
                .ps-price-preset { padding: 4px 10px; border: 1.5px solid #E5E7EB; border-radius: 20px; font-size: 0.75rem; font-weight: 600; background: #fff; color: #6B7280; cursor: pointer; transition: all 0.15s; font-family: 'Nunito',sans-serif; }
                .ps-price-preset:hover, .ps-price-preset.active { border-color: #0057FF; color: #0057FF; background: #EEF4FF; }

                /* Filter section header kiểu underline ngắn dưới chữ */
                .ps-filter-head-v2 { padding: 14px 16px 10px; }
                .ps-filter-title-underline { font-weight: 800; font-size: 0.8rem; letter-spacing: 0.6px; text-transform: uppercase; color: #0A0A0A; display: inline-block; padding-bottom: 8px; border-bottom: 2.5px solid #0057FF; }
                .ps-banner-cta-row { display: flex; align-items: center; gap: 14px; }
                .ps-banner-cta-row button { white-space: nowrap; }
                @media (max-width: 600px) {
                    .ps-banner-cta-row { flex-direction: column; align-items: flex-start; gap: 10px; }
                }

                /* Toolbar */
                .ps-toolbar { display: flex; align-items: center; justify-content: space-between; background: #fff; border: 1px solid #E5E7EB; border-radius: 12px; padding: 10px 16px; margin-bottom: 18px; gap: 8px; flex-wrap: wrap; }
                .ps-toolbar-left { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; flex: 1; min-width: 0; }
                .ps-toolbar-right { display: flex; align-items: center; gap: 6px; flex-shrink: 0; white-space: nowrap; }
                .ps-toolbar-count { font-size: 0.82rem; color: #6B7280; white-space: nowrap; }
                .ps-toolbar-count strong { color: #0A0A0A; }
                .ps-filter-tag { display: inline-flex; align-items: center; gap: 5px; background: #EEF4FF; color: #0057FF; border: 1px solid #C7D9FF; border-radius: 100px; padding: 3px 10px; font-size: 0.75rem; font-weight: 600; cursor: pointer; white-space: nowrap; }
                .ps-filter-tag:hover { background: #C7D9FF; }
                .ps-sort-select { background: #F8F9FB; border: 1.5px solid #E5E7EB; border-radius: 8px; padding: 6px 10px; font-size: 0.82rem; font-family: 'Nunito',sans-serif; color: #0A0A0A; outline: none; cursor: pointer; max-width: 130px; }
                .ps-sort-select:focus { border-color: #0057FF; }
                .ps-sort-label { font-size: 0.82rem; color: #6B7280; white-space: nowrap; }
                /* Custom sort dropdown */
                .ps-sort-drop { position: relative; flex-shrink: 0; }
                .ps-sort-btn { display: flex; align-items: center; gap: 6px; background: #F8F9FB; border: 1.5px solid #E5E7EB; border-radius: 8px; padding: 6px 10px; font-size: 0.82rem; font-family: 'Nunito',sans-serif; color: #0A0A0A; cursor: pointer; white-space: nowrap; transition: border-color 0.2s; min-width: 110px; justify-content: space-between; }
                .ps-sort-btn:hover, .ps-sort-btn.open { border-color: #0057FF; }
                .ps-sort-arrow { font-size: 9px; color: #6B7280; transition: transform 0.2s; flex-shrink: 0; }
                .ps-sort-btn.open .ps-sort-arrow { transform: rotate(180deg); }
                .ps-sort-menu { position: absolute; top: calc(100% + 5px); right: 0; background: #fff; border: 1px solid #E5E7EB; border-radius: 10px; box-shadow: 0 8px 24px rgba(0,0,0,0.1); z-index: 999; min-width: 100%; overflow: hidden; animation: dropFade 0.15s ease; }
                @keyframes dropFade { from { opacity:0; transform:translateY(-4px); } to { opacity:1; transform:none; } }
                .ps-sort-item { display: block; width: 100%; padding: 9px 14px; text-align: left; font-size: 0.85rem; font-family: 'Nunito',sans-serif; color: #0A0A0A; background: none; border: none; cursor: pointer; white-space: nowrap; transition: background 0.12s; }
                .ps-sort-item:hover { background: #F8F9FB; }
                .ps-sort-item.active { background: #EEF4FF; color: #0057FF; font-weight: 700; }

                /* Grid */
                .ps-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 14px; margin-bottom: 24px; }

                /* Apply btn */
                .ps-btn-apply { width: 100%; background: #0057FF; color: #fff; border: none; border-radius: 10px; padding: 10px; font-size: 0.875rem; font-weight: 700; font-family: 'Nunito',sans-serif; cursor: pointer; transition: background 0.2s; margin-top: 4px; }
                .ps-btn-apply:hover { background: #0040CC; }
                .ps-btn-clear { width: 100%; background: transparent; color: #6B7280; border: 1.5px solid #E5E7EB; border-radius: 10px; padding: 9px; font-size: 0.85rem; font-weight: 600; font-family: 'Nunito',sans-serif; cursor: pointer; transition: all 0.2s; margin-top: 8px; }
                .ps-btn-clear:hover { border-color: #EF4444; color: #EF4444; }

                /* Mobile filter btn */
                .ps-mobile-filter-btn { display: none; align-items: center; gap: 6px; background: #F8F9FB; border: 1.5px solid #E5E7EB; border-radius: 8px; padding: 8px 14px; font-size: 0.85rem; font-weight: 600; font-family: 'Nunito',sans-serif; color: #0A0A0A; cursor: pointer; margin-bottom: 16px; }

                /* Section title */
                .ps-section-title { display: flex; align-items: center; gap: 10px; font-size: 1.1rem; font-weight: 800; color: #0A0A0A; margin-bottom: 18px; padding-bottom: 13px; border-bottom: 1.5px solid #E5E7EB; }
                .ps-section-title::before { content: ''; display: inline-block; width: 3px; height: 18px; background: #0057FF; border-radius: 2px; }

                /* Responsive */
                @media (max-width: 900px) {
                    .ps-products-page { grid-template-columns: 1fr; padding: 16px; }
                    .ps-sidebar { position: static; display: none; }
                    .ps-sidebar.open { display: block; }
                    .ps-mobile-filter-btn { display: flex !important; }
                    .ps-grid { grid-template-columns: repeat(3, 1fr); }
                }
                @media (max-width: 600px) {
                    .ps-grid { grid-template-columns: repeat(2, 1fr); gap: 10px; }
                    .ps-hero-inner { padding: 0 12px; }
                }
                @media (max-width: 380px) {
                    .ps-grid { grid-template-columns: repeat(2, 1fr); gap: 8px; }
                }
            `}</style>

            {/* Breadcrumb */}
            <div className="ps-breadcrumb">
                <div className="ps-breadcrumb-inner">
                    <button onClick={() => navigate('/')} style={{ background: 'none', border: 'none', color: '#6B7280', cursor: 'pointer', fontSize: '0.82rem', fontFamily: 'Nunito,sans-serif', padding: 0 }}>Trang chủ</button>
                    <span style={{ margin: '0 6px', fontSize: '0.7rem' }}>›</span>
                    <strong style={{ color: '#0A0A0A' }}>Sản phẩm{search ? ` — "${search}"` : ''}</strong>
                </div>
            </div>

            {/* Banner */}
            <div className="ps-hero">
                <div className="ps-hero-inner">
                    <BannerSlider />
                </div>
            </div>

            {/* Filter bar anchor */}
            <div id="filter-bar" />

            {/* Main layout */}
            <div className="ps-products-page">

                {/* SIDEBAR */}
                <aside className={`ps-sidebar${sidebarOpen ? ' open' : ''}`}>

                    {/* Thương hiệu */}
                    <div className="ps-filter-card">
                        <div className="ps-filter-head-v2">
                            <span className="ps-filter-title-underline">Thương hiệu</span>
                        </div>
                        <div className="ps-filter-body">
                            <label className="ps-filter-check">
                                <input type="checkbox"
                                    checked={selectedCategories.length === 0}
                                    onChange={() => toggleCategory(null)} />
                                Tất cả
                            </label>
                            {categories.map(c => (
                                <label key={c._id} className="ps-filter-check">
                                    <input type="checkbox"
                                        checked={selectedCategories.includes(c._id)}
                                        onChange={() => toggleCategory(c._id)} />
                                    {c.name}
                                </label>
                            ))}
                        </div>
                    </div>

                    {/* Chọn mức giá */}
                    <div className="ps-filter-card">
                        <div className="ps-filter-head-v2">
                            <span className="ps-filter-title-underline">Chọn mức giá</span>
                        </div>
                        <div className="ps-filter-body">
                            {PRICE_RANGES.map((pr, i) => (
                                <label key={i} className="ps-filter-check">
                                    <input type="checkbox"
                                        checked={i === 0 ? selectedPriceRanges.length === 0 : selectedPriceRanges.includes(i)}
                                        onChange={() => togglePriceRange(i)} />
                                    {pr.label}
                                </label>
                            ))}
                            {hasFilter && (
                                <button className="ps-btn-clear" onClick={clearAll}>✕ Xoá bộ lọc</button>
                            )}
                        </div>
                    </div>
                </aside>

                {/* MAIN */}
                <main>
                    {/* Mobile filter toggle */}
                    <button className="ps-mobile-filter-btn" onClick={() => setSidebarOpen(o => !o)}>
                        ☰ {sidebarOpen ? 'Ẩn bộ lọc' : 'Bộ lọc'}
                    </button>

                    {/* Section title */}
                    <div className="ps-section-title">
                        {search ? `Kết quả: "${search}"` : selectedCategories.length === 1 ? categories.find(c => c._id === selectedCategories[0])?.name || 'Sản phẩm' : 'Tất cả sản phẩm'}
                    </div>

                    {/* Toolbar */}
                    <div className="ps-toolbar">
                        <div className="ps-toolbar-left">
                            {!loading && <span className="ps-toolbar-count">Hiển thị <strong>{sortedProducts.length}</strong> sản phẩm</span>}
                            {hasFilter && (
                                <span className="ps-filter-tag" onClick={clearAll}>✕ Xoá lọc</span>
                            )}
                            {search && (
                                <span className="ps-filter-tag" onClick={() => setSearch('')}>🔍 {search} ✕</span>
                            )}
                        </div>
                        <div className="ps-toolbar-right">
                            <span className="ps-sort-label">Sắp xếp:</span>
                            <div className="ps-sort-drop">
                                <button
                                    className={`ps-sort-btn${sortOpen ? ' open' : ''}`}
                                    onClick={() => setSortOpen(o => !o)}
                                    onBlur={() => setTimeout(() => setSortOpen(false), 150)}
                                >
                                    <span>{{ newest: 'Mới nhất', price_asc: 'Giá tăng dần', price_desc: 'Giá giảm dần', discount: 'Giảm giá nhiều' }[sortBy]}</span>
                                    <span className="ps-sort-arrow">▼</span>
                                </button>
                                {sortOpen && (
                                    <div className="ps-sort-menu">
                                        {[
                                            { value: 'newest', label: 'Mới nhất' },
                                            { value: 'price_asc', label: 'Giá tăng dần' },
                                            { value: 'price_desc', label: 'Giá giảm dần' },
                                            { value: 'discount', label: 'Giảm giá nhiều' },
                                        ].map(opt => (
                                            <button key={opt.value}
                                                className={`ps-sort-item${sortBy === opt.value ? ' active' : ''}`}
                                                onMouseDown={() => { setSortBy(opt.value); setSortOpen(false) }}>
                                                {opt.label}
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Products grid */}
                    {loading ? (
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: 80 }}>
                            <div style={{ width: 36, height: 36, border: '3px solid #E5E7EB', borderTop: '3px solid #0057FF', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
                            <p style={{ color: '#9CA3AF', marginTop: 14, fontSize: '0.875rem' }}>Đang tải sản phẩm...</p>
                        </div>
                    ) : sortedProducts.length === 0 ? (
                        <div style={{ textAlign: 'center', padding: '60px 20px' }}>
                            <div style={{ fontSize: '3.5rem', marginBottom: 16 }}>📭</div>
                            <h3 style={{ fontWeight: 700, color: '#0A0A0A', marginBottom: 8 }}>Không tìm thấy sản phẩm</h3>
                            <p style={{ color: '#6B7280', fontSize: '0.9rem', marginBottom: 20 }}>Thử thay đổi bộ lọc hoặc từ khoá tìm kiếm</p>
                            <button style={{ padding: '10px 24px', background: '#0057FF', color: '#fff', border: 'none', borderRadius: 10, fontSize: '0.875rem', fontWeight: 700, cursor: 'pointer', fontFamily: 'Nunito,sans-serif' }} onClick={clearAll}>Xoá bộ lọc</button>
                        </div>
                    ) : (
                        <div className="ps-grid">
                            {sortedProducts.map((product, idx) => (
                                <div key={product._id}
                                    className={shimmerAll ? 'shimmer-card' : ''}
                                    style={{
                                        position: 'relative',
                                        ...(shimmerAll ? { '--shimmer-delay': `${idx * 55}ms` } : {})
                                    }}>
                                    <ProductCard product={product} />
                                </div>
                            ))}
                        </div>
                    )}
                </main>
            </div>
        </div>
    )
}