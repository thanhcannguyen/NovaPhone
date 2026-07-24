import { useState, useEffect, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { getCategories } from '../../api/categoryApi'
import { getProducts } from '../../api/productApi'
import ProductCard from '../../components/user/ProductCard'
import TrustBadges from '../../components/user/TrustBadges'
import {
    Smartphone, Laptop, Headphones, Watch, Tablet, Speaker,
    ArrowRight, Star, Newspaper, ChevronRight
} from 'lucide-react'

/* -------------------- Static hero / promo content -------------------- */
const HERO_BIG = {
    tag: 'Hot Sale',
    title: 'iPhone 16 Pro Max',
    sub: 'Siêu phẩm Titan · Chip A18 Pro',
    cta: 'Xem ngay',
    search: 'iPhone',
    bg: 'linear-gradient(135deg, #0A0A0A 0%, #1a1a2e 100%)',
    img: 'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=700&q=90',
}
const HERO_SMALL = [
    {
        tag: 'Mới về',
        title: 'iPad Series',
        sub: 'Thiết kế mới 2025',
        cta: 'Xem ngay',
        search: 'iPad',
        bg: 'linear-gradient(135deg, #4338CA 0%, #7C3AED 100%)',
        img: 'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=500&q=90',
    },
    {
        tag: 'Phụ kiện',
        title: 'Tai nghe & Loa',
        sub: 'Đẳng cấp thời thượng',
        cta: 'Xem ngay',
        search: 'tai nghe',
        bg: 'linear-gradient(135deg, #047857 0%, #10B981 100%)',
        img: 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=500&q=90',
    },
]

const CATEGORY_STYLES = [
    { match: /điện thoại|smartphone|phone/i, icon: Smartphone, bg: '#F59E0B' },
    { match: /laptop|máy tính/i, icon: Laptop, bg: '#EF4444' },
    { match: /tai nghe|headphone|loa|speaker/i, icon: Headphones, bg: '#10B981' },
    { match: /watch|đồng hồ/i, icon: Watch, bg: '#0A0A0A' },
    { match: /ipad|tablet|máy tính bảng/i, icon: Tablet, bg: '#2563EB' },
]
const FALLBACK_STYLE = { icon: Speaker, bg: '#6B7280' }
const getCategoryStyle = (name = '') => CATEGORY_STYLES.find(c => c.match.test(name)) || FALLBACK_STYLE

const NEWS = [
    {
        title: 'Đánh giá hiệu năng và pin Nokia X10 5G: Đừng "nhìn mặt mà bắt hình dong"...',
        img: 'https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=500&q=80',
        author: 'Nguyễn Anh Dũng',
        date: 'Thứ Sáu, 24/06/2022',
        excerpt: 'Để đánh giá hiệu năng một chiếc điện thoại nhiều người chỉ cần nhìn vào tên bộ vi xử lý là đã có thể kết...',
    },
    {
        title: 'Đánh giá chi tiết camera Vivo X80: Camera Zeiss và chip hình ảnh Vivo V1+ "song kiếm..."',
        img: 'https://images.unsplash.com/photo-1520923642038-b4259acecbd7?w=500&q=80',
        author: 'Nguyễn Anh Dũng',
        date: 'Thứ Sáu, 24/06/2022',
        excerpt: 'Vivo X80 sở hữu cụm camera hợp tác cùng Zeiss - một trong những hãng nổi tiếng thế giới về thiết bị quang học...',
    },
]

const REVIEWS = [
    {
        name: 'Minh Ngọc',
        role: 'Sinh viên',
        avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&q=80',
        text: 'Mình rất ưng khi đến PhoneStore. Ở đây có rất nhiều mặt hàng phong phú, thả hồ lựa chọn. Nhân viên chuyên nghiệp, nhiệt tình. Chúc PhoneStore ngày càng phát triển.',
    },
    {
        name: 'Quang Huy',
        role: 'Nhân viên văn phòng',
        avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&q=80',
        text: 'Giao hàng nhanh, đóng gói cẩn thận, giá cả hợp lý so với thị trường. Mình đã mua 2 lần và đều rất hài lòng với dịch vụ.',
    },
]

/* -------------------- Home page -------------------- */
export default function Home() {
    const navigate = useNavigate()

    const [categories, setCategories] = useState([])
    const [products, setProducts] = useState([])
    const [loading, setLoading] = useState(true)

    const [activeBrand, setActiveBrand] = useState('Tất cả')
    const [brandProducts, setBrandProducts] = useState([])
    const [brandLoading, setBrandLoading] = useState(false)

    useEffect(() => {
        setLoading(true)
        Promise.all([getCategories(), getProducts({})])
            .then(([catRes, prodRes]) => {
                setCategories(catRes.data.data || [])
                setProducts(prodRes.data.data || [])
            })
            .catch(console.error)
            .finally(() => setLoading(false))
    }, [])

    const brands = useMemo(() => {
        const set = new Set()
        products.forEach(p => { if (p.specs?.brand) set.add(p.specs.brand) })
        return ['Tất cả', ...Array.from(set).slice(0, 4)]
    }, [products])

    useEffect(() => {
        setBrandLoading(true)
        const params = activeBrand !== 'Tất cả' ? { brand: activeBrand } : {}
        getProducts(params)
            .then(r => setBrandProducts((r.data.data || []).slice(0, 8)))
            .catch(console.error)
            .finally(() => setBrandLoading(false))
    }, [activeBrand])

    const featured = useMemo(() => {
        const withDiscount = products.filter(p => p.originalPrice > p.price)
        const pool = withDiscount.length >= 6 ? withDiscount : products
        return pool.slice(0, 6)
    }, [products])

    const countByCategory = useMemo(() => {
        const map = {}
        products.forEach(p => {
            const id = p.category?._id || p.category
            map[id] = (map[id] || 0) + 1
        })
        return map
    }, [products])

    const goSearch = (q) => navigate(`/products?search=${encodeURIComponent(q)}`)

    return (
        <div style={{ background: '#F8F9FB', minHeight: '100vh', fontFamily: 'Nunito, sans-serif' }}>
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Nunito:wght@400;500;600;700;800&display=swap');
                @keyframes spin { to { transform: rotate(360deg) } }

                .ps-home-wrap { max-width: 1280px; margin: 0 auto; padding: 20px 24px 48px; }

                /* Hero collage */
                .ps-hero-grid { display: grid; grid-template-columns: 2fr 1fr; gap: 16px; margin-bottom: 32px; }
                .ps-hero-right { display: grid; grid-template-rows: 1fr 1fr; gap: 16px; }
                .ps-hero-card { position: relative; border-radius: 16px; overflow: hidden; cursor: pointer; display: flex; align-items: center; min-height: 300px; transition: transform 0.2s; }
                .ps-hero-right .ps-hero-card { min-height: 142px; }
                .ps-hero-card:hover { transform: translateY(-2px); }
                .ps-hero-content { position: relative; z-index: 2; padding: 0 28px; max-width: 60%; }
                .ps-hero-tag { display: inline-block; background: rgba(255,255,255,0.15); border: 1px solid rgba(255,255,255,0.3); color: #FFD166; font-size: 0.68rem; font-weight: 800; letter-spacing: 1.5px; text-transform: uppercase; padding: 3px 10px; border-radius: 100px; margin-bottom: 10px; }
                .ps-hero-title { font-size: 1.6rem; font-weight: 900; color: #fff; margin: 0 0 6px; line-height: 1.2; }
                .ps-hero-right .ps-hero-title { font-size: 1.1rem; }
                .ps-hero-sub { font-size: 0.82rem; color: rgba(255,255,255,0.75); margin: 0 0 14px; }
                .ps-hero-btn { display: inline-flex; align-items: center; gap: 6px; padding: 8px 18px; border-radius: 9px; border: 1.5px solid rgba(255,255,255,0.7); background: transparent; color: #fff; font-size: 0.8rem; font-weight: 700; cursor: pointer; font-family: 'Nunito',sans-serif; transition: all 0.2s; }
                .ps-hero-btn:hover { background: #fff; color: #0A0A0A; }
                .ps-hero-img { position: absolute; right: -10px; bottom: 0; height: 100%; width: 45%; object-fit: cover; object-position: top; opacity: 0.95; }
                .ps-hero-right .ps-hero-img { width: 40%; }

                /* Section header */
                .ps-sec-head { display: flex; align-items: center; justify-content: space-between; margin-bottom: 18px; }
                .ps-sec-title { display: flex; align-items: center; gap: 10px; font-size: 1.15rem; font-weight: 800; color: #0A0A0A; }
                .ps-sec-title::before { content: ''; display: inline-block; width: 4px; height: 20px; background: #0057FF; border-radius: 2px; }
                .ps-sec-more { display: flex; align-items: center; gap: 4px; color: #0057FF; font-size: 0.85rem; font-weight: 700; text-decoration: none; cursor: pointer; background: none; border: none; font-family: 'Nunito',sans-serif; }
                .ps-sec-more:hover { text-decoration: underline; }

                .ps-section { margin-bottom: 40px; }

                /* Featured grid */
                .ps-feat-grid { display: grid; grid-template-columns: repeat(6, 1fr); gap: 14px; }

                /* Categories */
                .ps-cat-grid { display: grid; grid-template-columns: repeat(5, 1fr); gap: 14px; }
                .ps-cat-card { border-radius: 14px; padding: 18px; color: #fff; cursor: pointer; transition: transform 0.2s; min-height: 92px; display: flex; flex-direction: column; justify-content: space-between; }
                .ps-cat-card:hover { transform: translateY(-3px); }
                .ps-cat-name { font-weight: 800; font-size: 0.9rem; }
                .ps-cat-count { font-size: 0.72rem; opacity: 0.85; margin-top: 2px; }

                /* Brand tabs section */
                .ps-brand-section { display: grid; grid-template-columns: 1fr 300px; gap: 20px; }
                .ps-tabs { display: flex; gap: 8px; flex-wrap: wrap; }
                .ps-tab { padding: 7px 16px; border-radius: 100px; border: 1.5px solid #E5E7EB; background: #fff; color: #6B7280; font-size: 0.82rem; font-weight: 700; cursor: pointer; font-family: 'Nunito',sans-serif; transition: all 0.15s; }
                .ps-tab:hover { border-color: #0057FF; color: #0057FF; }
                .ps-tab.active { background: #0057FF; border-color: #0057FF; color: #fff; }
                .ps-brand-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 14px; margin-top: 18px; }
                .ps-side-banner { border-radius: 16px; overflow: hidden; position: relative; min-height: 100%; display: flex; align-items: flex-end; background: linear-gradient(160deg, #0A0A0A 0%, #1e1b3a 100%); cursor: pointer; padding: 24px; }
                .ps-side-banner img { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; opacity: 0.55; }
                .ps-side-banner-content { position: relative; z-index: 2; }
                .ps-side-banner-tag { color: #A78BFA; font-size: 0.7rem; font-weight: 800; letter-spacing: 1px; text-transform: uppercase; }
                .ps-side-banner-title { color: #fff; font-size: 1.3rem; font-weight: 900; margin: 4px 0 12px; }

                /* Promo strip */
                .ps-promo-strip { border-radius: 16px; padding: 32px 40px; background: linear-gradient(120deg, #0A0A0A 0%, #16213e 100%); display: flex; align-items: center; justify-content: space-between; cursor: pointer; overflow: hidden; position: relative; }
                .ps-promo-strip-title { color: #fff; font-size: 1.5rem; font-weight: 900; margin: 0 0 6px; }
                .ps-promo-strip-sub { color: rgba(255,255,255,0.65); font-size: 0.9rem; }

                /* News + reviews */
                .ps-bottom-grid { display: grid; grid-template-columns: 1fr 380px; gap: 24px; }
                .ps-news-card { display: flex; gap: 14px; background: #fff; border: 1px solid #E5E7EB; border-radius: 14px; overflow: hidden; margin-bottom: 14px; cursor: pointer; transition: box-shadow 0.2s; }
                .ps-news-card:hover { box-shadow: 0 6px 20px rgba(0,0,0,0.08); }
                .ps-news-img { width: 130px; flex-shrink: 0; object-fit: cover; }
                .ps-news-body { padding: 12px 14px 12px 0; flex: 1; }
                .ps-news-title { font-weight: 700; font-size: 0.88rem; color: #0A0A0A; margin: 0 0 6px; line-height: 1.4; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
                .ps-news-meta { font-size: 0.72rem; color: #9CA3AF; margin-bottom: 6px; }
                .ps-news-excerpt { font-size: 0.78rem; color: #6B7280; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }

                .ps-review-card { background: linear-gradient(135deg, #0057FF 0%, #1e3a8a 100%); border-radius: 16px; padding: 24px; color: #fff; height: 100%; display: flex; flex-direction: column; }
                .ps-review-head { display: flex; align-items: center; gap: 12px; margin-bottom: 16px; }
                .ps-review-avatar { width: 46px; height: 46px; border-radius: 50%; object-fit: cover; border: 2px solid rgba(255,255,255,0.4); }
                .ps-review-name { font-weight: 800; font-size: 0.95rem; }
                .ps-review-role { font-size: 0.75rem; opacity: 0.75; }
                .ps-review-text { font-size: 0.86rem; line-height: 1.6; opacity: 0.92; flex: 1; }
                .ps-review-dots { display: flex; gap: 6px; margin-top: 16px; }
                .ps-review-dot { width: 6px; height: 6px; border-radius: 100px; background: rgba(255,255,255,0.35); cursor: pointer; transition: all 0.2s; }
                .ps-review-dot.active { width: 20px; background: #fff; }

                @media (max-width: 980px) {
                    .ps-hero-grid { grid-template-columns: 1fr; }
                    .ps-hero-right { grid-template-columns: 1fr 1fr; grid-template-rows: 1fr; }
                    .ps-feat-grid { grid-template-columns: repeat(3, 1fr); }
                    .ps-cat-grid { grid-template-columns: repeat(3, 1fr); }
                    .ps-brand-section { grid-template-columns: 1fr; }
                    .ps-brand-grid { grid-template-columns: repeat(3, 1fr); }
                    .ps-side-banner { min-height: 180px; }
                    .ps-bottom-grid { grid-template-columns: 1fr; }
                }
                @media (max-width: 600px) {
                    .ps-home-wrap { padding: 14px 14px 32px; }
                    .ps-hero-right { grid-template-columns: 1fr; }
                    .ps-hero-content { max-width: 75%; }
                    .ps-feat-grid { grid-template-columns: repeat(2, 1fr); gap: 10px; }
                    .ps-cat-grid { grid-template-columns: repeat(2, 1fr); }
                    .ps-brand-grid { grid-template-columns: repeat(2, 1fr); }
                    .ps-promo-strip { flex-direction: column; text-align: center; gap: 14px; padding: 24px; }
                    .ps-news-card { flex-direction: column; }
                    .ps-news-img { width: 100%; height: 140px; }
                }
            `}</style>

            <div className="ps-home-wrap">

                {/* ============ HERO COLLAGE ============ */}
                <div className="ps-hero-grid">
                    <div className="ps-hero-card" style={{ background: HERO_BIG.bg }} onClick={() => goSearch(HERO_BIG.search)}>
                        <div className="ps-hero-content">
                            <span className="ps-hero-tag">{HERO_BIG.tag}</span>
                            <h2 className="ps-hero-title">{HERO_BIG.title}</h2>
                            <p className="ps-hero-sub">{HERO_BIG.sub}</p>
                            <button className="ps-hero-btn">{HERO_BIG.cta} <ArrowRight size={14} /></button>
                        </div>
                        <img className="ps-hero-img" src={HERO_BIG.img} alt={HERO_BIG.title} onError={e => e.target.style.display = 'none'} />
                    </div>
                    <div className="ps-hero-right">
                        {HERO_SMALL.map((h, i) => (
                            <div key={i} className="ps-hero-card" style={{ background: h.bg }} onClick={() => goSearch(h.search)}>
                                <div className="ps-hero-content">
                                    <span className="ps-hero-tag">{h.tag}</span>
                                    <h3 className="ps-hero-title">{h.title}</h3>
                                    <p className="ps-hero-sub">{h.sub}</p>
                                    <button className="ps-hero-btn" style={{ padding: '6px 14px' }}>{h.cta}</button>
                                </div>
                                <img className="ps-hero-img" src={h.img} alt={h.title} onError={e => e.target.style.display = 'none'} />
                            </div>
                        ))}
                    </div>
                </div>

                {/* ============ TRUST BADGES ============ */}
                <TrustBadges />

                {/* ============ FEATURED PRODUCTS ============ */}
                <section className="ps-section">
                    <div className="ps-sec-head">
                        <div className="ps-sec-title">Top sản phẩm nổi bật</div>
                        <button className="ps-sec-more" onClick={() => navigate('/products')}>Xem thêm <ChevronRight size={16} /></button>
                    </div>
                    {loading ? (
                        <div style={{ display: 'flex', justifyContent: 'center', padding: 50 }}>
                            <div style={{ width: 32, height: 32, border: '3px solid #E5E7EB', borderTop: '3px solid #0057FF', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
                        </div>
                    ) : (
                        <div className="ps-feat-grid">
                            {featured.map(p => (
                                <ProductCard key={p._id} product={p} />
                            ))}
                        </div>
                    )}
                </section>

                {/* ============ POPULAR CATEGORIES ============ */}
                {categories.length > 0 && (
                    <section className="ps-section">
                        <div className="ps-sec-head">
                            <div className="ps-sec-title">Danh mục phổ biến</div>
                        </div>
                        <div className="ps-cat-grid">
                            {categories.map(c => {
                                const { icon: Icon, bg } = getCategoryStyle(c.name)
                                return (
                                    <div key={c._id} className="ps-cat-card" style={{ background: bg }} onClick={() => navigate(`/products?category=${c._id}`)}>
                                        <Icon size={24} />
                                        <div>
                                            <div className="ps-cat-name">{c.name}</div>
                                            <div className="ps-cat-count">{countByCategory[c._id] || 0} sản phẩm</div>
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    </section>
                )}

                {/* ============ BRAND TABS + SIDE BANNER ============ */}
                <section className="ps-section">
                    <div className="ps-sec-head">
                        <div className="ps-sec-title">Khám phá theo thương hiệu</div>
                    </div>
                    <div className="ps-brand-section">
                        <div>
                            <div className="ps-tabs">
                                {brands.map(b => (
                                    <button key={b} className={`ps-tab${activeBrand === b ? ' active' : ''}`} onClick={() => setActiveBrand(b)}>{b}</button>
                                ))}
                            </div>
                            <div className="ps-brand-grid">
                                {brandLoading ? (
                                    <div style={{ gridColumn: '1 / -1', display: 'flex', justifyContent: 'center', padding: 40 }}>
                                        <div style={{ width: 28, height: 28, border: '3px solid #E5E7EB', borderTop: '3px solid #0057FF', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
                                    </div>
                                ) : brandProducts.length === 0 ? (
                                    <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: 30, color: '#9CA3AF', fontSize: '0.85rem' }}>Chưa có sản phẩm cho thương hiệu này</div>
                                ) : (
                                    brandProducts.map(p => (
                                        <ProductCard key={p._id} product={p} />
                                    ))
                                )}
                            </div>
                        </div>
                        <div className="ps-side-banner" onClick={() => navigate('/products')}>
                            <img src="https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=500&q=80" alt="banner" onError={e => e.target.style.display = 'none'} />
                            <div className="ps-side-banner-content">
                                <span className="ps-side-banner-tag">5G · Thước phim ma thuật</span>
                                <h3 className="ps-side-banner-title">Khám phá công nghệ mới nhất</h3>
                                <button className="ps-hero-btn" style={{ borderColor: '#fff' }}>Xem ngay <ArrowRight size={14} /></button>
                            </div>
                        </div>
                    </div>
                </section>

                {/* ============ PROMO STRIP ============ */}
                <section className="ps-section">
                    <div className="ps-promo-strip" onClick={() => navigate('/products')}>
                        <div>
                            <h3 className="ps-promo-strip-title">Giảm đến 20% phụ kiện chính hãng</h3>
                            <p className="ps-promo-strip-sub">Ốp lưng, tai nghe, sạc nhanh, cáp sạc... — số lượng có hạn</p>
                        </div>
                        <button className="ps-hero-btn" style={{ flexShrink: 0 }}>Mua ngay <ArrowRight size={14} /></button>
                    </div>
                </section>

                {/* ============ NEWS + REVIEWS ============ */}
                <div className="ps-bottom-grid">
                    <section>
                        <div className="ps-sec-head">
                            <div className="ps-sec-title">Tin tức mới nhất</div>
                        </div>
                        {NEWS.map((n, i) => (
                            <div key={i} className="ps-news-card">
                                <img className="ps-news-img" src={n.img} alt={n.title} onError={e => e.target.style.display = 'none'} />
                                <div className="ps-news-body">
                                    <h4 className="ps-news-title">{n.title}</h4>
                                    <div className="ps-news-meta">{n.date} · {n.author}</div>
                                    <p className="ps-news-excerpt">{n.excerpt}</p>
                                </div>
                            </div>
                        ))}
                    </section>

                    <section>
                        <div className="ps-sec-head">
                            <div className="ps-sec-title" style={{ gap: 8 }}>Khách hàng đánh giá</div>
                        </div>
                        <ReviewCard />
                    </section>
                </div>
            </div>
        </div>
    )
}

function ReviewCard() {
    const [i, setI] = useState(0)
    useEffect(() => {
        const t = setInterval(() => setI(v => (v + 1) % REVIEWS.length), 5000)
        return () => clearInterval(t)
    }, [])
    const r = REVIEWS[i]
    return (
        <div className="ps-review-card">
            <div className="ps-review-head">
                <img className="ps-review-avatar" src={r.avatar} alt={r.name} onError={e => e.target.style.display = 'none'} />
                <div>
                    <div className="ps-review-name">{r.name} - {r.role}</div>
                    <div style={{ display: 'flex', gap: 2, marginTop: 2 }}>
                        {[...Array(5)].map((_, s) => <Star key={s} size={12} fill="#FFD166" color="#FFD166" />)}
                    </div>
                </div>
            </div>
            <p className="ps-review-text">"{r.text}"</p>
            <div className="ps-review-dots">
                {REVIEWS.map((_, idx) => (
                    <div key={idx} className={`ps-review-dot${idx === i ? ' active' : ''}`} onClick={() => setI(idx)} />
                ))}
            </div>
        </div>
    )
}