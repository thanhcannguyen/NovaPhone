
import { useState, useEffect, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { getCategories } from '../../api/categoryApi'
import { getProducts } from '../../api/productApi'
import ProductCard from '../../components/user/ProductCard'
import TrustBadges from '../../components/user/TrustBadges'
import { useToast } from '../../context/ToastContext'
import { ArrowRight, ChevronRight } from 'lucide-react'

/* -------------------- BANNER & CUSTOMER IMAGES -------------------- */
import heroBigImg from '../../assets/banners/banner9.jpg'
import heroSmall1Img from '../../assets/banners/banner1.jpg'
import heroSmall2Img from '../../assets/banners/banner3.jpg'
import heroRightImg from '../../assets/banners/banner8.jpg'
import sideBannerImgFile from '../../assets/banners/banner6.jpg'
import promoStripImg from '../../assets/banners/banner14.jpg'

import customer1 from '../../assets/customers/customer-1.jpg'
import customer2 from '../../assets/customers/customer-2.jpg'
import customer3 from '../../assets/customers/customer-3.jpg'
import customer4 from '../../assets/customers/customer-4.jpg'
import customer5 from '../../assets/customers/customer-5.jpg'

/* -------------------- CONSTANTS & CONFIG -------------------- */
const HERO_IMAGES = {
    big: { bg: 'linear-gradient(135deg, #0A0A0A 0%, #1a1a2e 100%)', img: heroBigImg },
    smalls: [
        { bg: 'linear-gradient(135deg, #4338CA 0%, #7C3AED 100%)', img: heroSmall1Img },
        { bg: 'linear-gradient(135deg, #047857 0%, #10B981 100%)', img: heroSmall2Img },
    ],
    right: { bg: 'linear-gradient(160deg, #1e1b3a 0%, #0A0A0A 100%)', img: heroRightImg }
}

const CATEGORY_COLORS = [
    { solid: '#F59E0B', soft: 'rgba(245,158,11,0.55)' },
    { solid: '#EF4444', soft: 'rgba(239,68,68,0.55)' },
    { solid: '#10B981', soft: 'rgba(16,185,129,0.55)' },
    { solid: '#2563EB', soft: 'rgba(37,99,235,0.55)' },
    { solid: '#7C3AED', soft: 'rgba(124,58,237,0.55)' },
    { solid: '#0EA5E9', soft: 'rgba(14,165,233,0.55)' },
    { solid: '#DB2777', soft: 'rgba(219,39,119,0.55)' },
]
const CATEGORY_FALLBACK_IMG = 'https://placehold.co/300x300/F8F9FB/9CA3AF?text=📱'
const CUSTOMER_PHOTOS = [customer1, customer2, customer3, customer4, customer5]

/* ============================================================================
 * MAIN HOME COMPONENT
 * ============================================================================ */
export default function Home() {
    const navigate = useNavigate()
    const { showToast } = useToast()

    const [categories, setCategories] = useState([])
    const [products, setProducts] = useState([])
    const [loading, setLoading] = useState(true)

    const [activeBrand, setActiveBrand] = useState('')
    const [brandProducts, setBrandProducts] = useState([])
    const [brandLoading, setBrandLoading] = useState(false)

    // Tải dữ liệu ban đầu
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

    // Danh sách các thương hiệu
    const brands = useMemo(() => {
        const set = new Set()
        products.forEach(p => { if (p.specs?.brand) set.add(p.specs.brand) })
        return Array.from(set)
    }, [products])

    useEffect(() => {
        if (!activeBrand && brands.length > 0) setActiveBrand(brands[0])
    }, [brands, activeBrand])

    // Tải sản phẩm theo thương hiệu
    useEffect(() => {
        if (!activeBrand) return
        setBrandLoading(true)
        getProducts({ brand: activeBrand })
            .then(r => setBrandProducts((r.data.data || []).slice(0, 4)))
            .catch(console.error)
            .finally(() => setBrandLoading(false))
    }, [activeBrand])

    // Dữ liệu đã tối ưu tính toán
    const featured = useMemo(() => {
        const withDiscount = products.filter(p => p.originalPrice > p.price)
        return (withDiscount.length >= 6 ? withDiscount : products).slice(0, 6)
    }, [products])

    const countByCategory = useMemo(() => {
        return products.reduce((acc, p) => {
            const id = p.category?._id || p.category
            if (id) acc[id] = (acc[id] || 0) + 1
            return acc
        }, {})
    }, [products])

    const categoryImageMap = useMemo(() => {
        return products.reduce((acc, p) => {
            const id = p.category?._id || p.category
            if (id && !acc[id] && p.image) acc[id] = p.image
            return acc
        }, {})
    }, [products])

    const handleNewsletterSubmit = (e) => {
        e.preventDefault()
        showToast({ type: 'success', title: 'Đăng ký thành công', message: 'Cảm ơn bạn đã đăng ký nhận tin từ NovaPhone!' })
        e.target.reset()
    }

    return (
        <div style={{ background: '#F8F9FB', minHeight: '100vh', fontFamily: 'Nunito, sans-serif' }}>
            <Styles />

            <div className="ps-home-wrap">
                {/* 1. Hero Banners */}
                <HeroCollage />

                {/* 2. Trust Badges */}
                <TrustBadges />

                {/* 3. Sản phẩm nổi bật */}
                <FeaturedSection loading={loading} products={featured} onMore={() => navigate('/products')} />

                {/* 4. Danh mục phổ biến */}
                {categories.length > 0 && (
                    <CategorySection
                        categories={categories}
                        countMap={countByCategory}
                        imageMap={categoryImageMap}
                        onSelect={(id) => navigate(`/products?category=${id}`)}
                    />
                )}

                {/* 5. Khám phá theo thương hiệu */}
                <BrandSection
                    brands={brands}
                    activeBrand={activeBrand}
                    brandProducts={brandProducts}
                    brandLoading={brandLoading}
                    onSelectBrand={setActiveBrand}
                    onSideBannerClick={() => navigate('/products?search=Apple')}
                />

                {/* 6. Banner Khuyến mãi */}
                <PromoStrip onBannerClick={() => navigate('/products')} />

                {/* 7. Khách hàng NovaPhone */}
                <CustomerGallery />

                {/* 8. Đăng ký nhận tin */}
                <NewsletterSection onSubmit={handleNewsletterSubmit} />
            </div>
        </div>
    )
}

/* ============================================================================
 * SUB-COMPONENTS (Tách nhỏ giao diện trong cùng 1 file)
 * ============================================================================ */

function HeroCollage() {
    const hideImg = e => { e.target.style.display = 'none' }
    return (
        <div className="ps-hero-grid">
            <div className="ps-hero-card" style={{ background: HERO_IMAGES.big.bg }}>
                <img className="ps-hero-img" src={HERO_IMAGES.big.img} alt="Banner" onError={hideImg} />
            </div>
            <div className="ps-hero-right">
                {HERO_IMAGES.smalls.map((h, i) => (
                    <div key={i} className="ps-hero-card" style={{ background: h.bg }}>
                        <img className="ps-hero-img" src={h.img} alt="Banner" onError={hideImg} />
                    </div>
                ))}
            </div>
            <div className="ps-hero-card ps-hero-tall" style={{ background: HERO_IMAGES.right.bg }}>
                <img className="ps-hero-img" src={HERO_IMAGES.right.img} alt="Banner" onError={hideImg} />
            </div>
        </div>
    )
}

function FeaturedSection({ loading, products, onMore }) {
    return (
        <section className="ps-section">
            <div className="ps-sec-head">
                <div className="ps-sec-title">Top sản phẩm nổi bật</div>
                <button className="ps-sec-more" onClick={onMore}>Xem thêm <ChevronRight size={16} /></button>
            </div>
            {loading ? <Spinner /> : (
                <div className="ps-feat-grid">
                    {products.map(p => <ProductCard key={p._id} product={p} />)}
                </div>
            )}
        </section>
    )
}

function CategorySection({ categories, countMap, imageMap, onSelect }) {
    return (
        <section className="ps-section">
            <div className="ps-sec-head">
                <div className="ps-sec-title">Danh mục phổ biến</div>
            </div>
            <div className="ps-cat-grid">
                {categories.map((c, idx) => {
                    const color = CATEGORY_COLORS[idx % CATEGORY_COLORS.length]
                    return (
                        <div
                            key={c._id}
                            className="ps-cat-card"
                            style={{ '--cat-color': color.solid, '--cat-color-soft': color.soft }}
                            onClick={() => onSelect(c._id)}
                        >
                            <div className="ps-cat-card-text">
                                <div className="ps-cat-name">{c.name}</div>
                                <div className="ps-cat-count">{countMap[c._id] || 0} sản phẩm</div>
                            </div>
                            <img className="ps-cat-card-img" src={imageMap[c._id] || CATEGORY_FALLBACK_IMG} alt={c.name} onError={e => { e.target.src = CATEGORY_FALLBACK_IMG }} />
                        </div>
                    )
                })}
            </div>
        </section>
    )
}

function BrandSection({ brands, activeBrand, brandProducts, brandLoading, onSelectBrand, onSideBannerClick }) {
    return (
        <section className="ps-section">
            <div className="ps-sec-head">
                <div className="ps-sec-title">Khám phá theo thương hiệu</div>
            </div>
            <div className="ps-brand-section">
                <div>
                    <div className="ps-tabs">
                        {brands.map(b => (
                            <button key={b} className={`ps-tab${activeBrand === b ? ' active' : ''}`} onClick={() => onSelectBrand(b)}>{b}</button>
                        ))}
                    </div>
                    <div className="ps-brand-grid">
                        {brandLoading ? <Spinner size={28} /> : brandProducts.length === 0 ? (
                            <div className="ps-empty-msg">Chưa có sản phẩm cho thương hiệu này</div>
                        ) : (
                            brandProducts.map(p => <ProductCard key={p._id} product={p} />)
                        )}
                    </div>
                </div>
                <div className="ps-side-banner" onClick={onSideBannerClick}>
                    <img src={sideBannerImgFile} alt="Banner" onError={e => e.target.style.display = 'none'} />
                </div>
            </div>
        </section>
    )
}

function PromoStrip({ onBannerClick }) {
    return (
        <section className="ps-section">
            <div className="ps-promo-strip" style={{ backgroundImage: `linear-gradient(120deg, #0A0A0A 15%, rgba(10,10,10,0.6) 60%, rgba(10,10,10,0.8) 100%), url('${promoStripImg}')` }} onClick={onBannerClick}>
                <div>
                    <h3 className="ps-promo-strip-title">Thu cũ - Lên đời, trợ giá đến 2.000.000đ</h3>
                    <p className="ps-promo-strip-sub">Đổi điện thoại cũ lấy máy mới tại NovaPhone - thẩm định nhanh, giá tốt</p>
                </div>
                <button className="ps-hero-btn" style={{ flexShrink: 0 }}>Xem ngay <ArrowRight size={14} /></button>
            </div>
        </section>
    )
}

function CustomerGallery() {
    return (
        <section className="ps-section">
            <h2 className="ps-customer-title">KHÁCH HÀNG CỦA <span>NOVAPHONE</span></h2>
            <div className="ps-customer-grid">
                {CUSTOMER_PHOTOS.map((src, i) => (
                    <div key={i} className="ps-customer-photo">
                        <img src={src} alt={`Khách hàng ${i + 1}`} onError={e => e.target.style.display = 'none'} />
                    </div>
                ))}
            </div>
        </section>
    )
}

function NewsletterSection({ onSubmit }) {
    return (
        <section className="ps-section">
            <div className="ps-newsletter">
                <h3>Đăng ký nhận tin từ NovaPhone</h3>
                <p>Nhận thông tin sản phẩm mới nhất và các chương trình khuyến mãi.</p>
                <form className="ps-newsletter-form" onSubmit={onSubmit}>
                    <input type="email" name="email" placeholder="Nhập địa chỉ email" required />
                    <button type="submit">Đăng ký</button>
                </form>
            </div>
        </section>
    )
}

function Spinner({ size = 32 }) {
    return (
        <div style={{ display: 'flex', justifyContent: 'center', padding: 40, gridColumn: '1 / -1' }}>
            <div style={{ width: size, height: size, border: '3px solid #E5E7EB', borderTop: '3px solid #0057FF', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
        </div>
    )
}

/* ============================================================================
 * CSS STYLES (Nhóm lại gọn gàng)
 * ============================================================================ */
function Styles() {
    return (
        <style>{`
            @import url('https://fonts.googleapis.com/css2?family=Nunito:wght@400;500;600;700;800&display=swap');
            @keyframes spin { to { transform: rotate(360deg) } }

            .ps-home-wrap { max-width: 1280px; margin: 0 auto; padding: 20px 24px 48px; }
            .ps-section { margin-bottom: 40px; }

            /* Hero Grid */
            .ps-hero-grid { display: grid; grid-template-columns: 2fr 1.3fr 1.3fr; gap: 16px; margin-bottom: 32px; }
            .ps-hero-right { display: grid; grid-template-rows: 1fr 1fr; gap: 16px; }
            .ps-hero-tall { min-height: 300px; }
            .ps-hero-card { position: relative; border-radius: 16px; overflow: hidden; display: flex; align-items: center; min-height: 300px; transition: transform 0.2s; }
            .ps-hero-right .ps-hero-card { min-height: 142px; }
            .ps-hero-card:hover { transform: translateY(-2px); }
            .ps-hero-img { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; }
            .ps-hero-card::after {
                content: ''; position: absolute; top: 0; left: -75%; width: 45%; height: 100%;
                background: linear-gradient(100deg, transparent 0%, rgba(255,255,255,0.4) 50%, transparent 100%);
                transform: skewX(-20deg); z-index: 3; pointer-events: none; transition: left 0.75s ease;
            }
            .ps-hero-card:hover::after { left: 130%; }
            .ps-hero-btn { display: inline-flex; align-items: center; gap: 6px; padding: 8px 18px; border-radius: 9px; border: 1.5px solid rgba(255,255,255,0.7); background: transparent; color: #fff; font-size: 0.8rem; font-weight: 700; cursor: pointer; font-family: 'Nunito',sans-serif; transition: all 0.2s; }
            .ps-hero-btn:hover { background: #fff; color: #0A0A0A; }

            /* Section Headers */
            .ps-sec-head { display: flex; align-items: center; justify-content: space-between; margin-bottom: 18px; }
            .ps-sec-title { display: flex; align-items: center; gap: 10px; font-size: 1.15rem; font-weight: 800; color: #0A0A0A; }
            .ps-sec-title::before { content: ''; display: inline-block; width: 4px; height: 20px; background: #0057FF; border-radius: 2px; }
            .ps-sec-more { display: flex; align-items: center; gap: 4px; color: #0057FF; font-size: 0.85rem; font-weight: 700; background: none; border: none; cursor: pointer; font-family: 'Nunito',sans-serif; }
            .ps-sec-more:hover { text-decoration: underline; }

            /* Grids */
            .ps-feat-grid { display: grid; grid-template-columns: repeat(6, 1fr); gap: 14px; }
            .ps-cat-grid { display: grid; grid-template-columns: repeat(5, 1fr); gap: 14px; }
            .ps-brand-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 14px; margin-top: 18px; flex: 1; }

            /* Categories */
            .ps-cat-card { border-radius: 14px; color: #fff; cursor: pointer; transition: transform 0.2s; min-height: 110px; position: relative; overflow: hidden; background: var(--cat-color); }
            .ps-cat-card:hover { transform: translateY(-3px); }
            .ps-cat-card::before { content: ''; position: absolute; inset: 0; background: linear-gradient(100deg, var(--cat-color-soft) 0%, transparent 68%); z-index: 1; }
            .ps-cat-card-img { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; z-index: 0; }
            .ps-cat-card-text { position: relative; z-index: 2; padding: 18px; max-width: 70%; }
            .ps-cat-name { font-weight: 800; font-size: 0.9rem; }
            .ps-cat-count { font-size: 0.72rem; opacity: 0.85; margin-top: 2px; }

            /* Brand Section */
            .ps-brand-section { display: flex; align-items: stretch; gap: 20px; }
            .ps-brand-section > div:first-child { flex: 1; min-width: 0; display: flex; flex-direction: column; }
            .ps-tabs { display: flex; gap: 8px; flex-wrap: wrap; }
            .ps-tab { padding: 7px 16px; border-radius: 100px; border: 1.5px solid #E5E7EB; background: #fff; color: #6B7280; font-size: 0.82rem; font-weight: 700; cursor: pointer; font-family: 'Nunito',sans-serif; transition: all 0.15s; }
            .ps-tab:hover { border-color: #0057FF; color: #0057FF; }
            .ps-tab.active { background: #0057FF; border-color: #0057FF; color: #fff; }
            .ps-side-banner { border-radius: 16px; overflow: hidden; position: relative; width: 300px; max-height: 560px; flex-shrink: 0; cursor: pointer; background: linear-gradient(160deg, #1a1a2e 0%, #0A0A0A 100%); }
            .ps-side-banner img { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; }
            .ps-empty-msg { grid-column: 1 / -1; text-align: center; padding: 30px; color: #9CA3AF; font-size: 0.85rem; }

            /* Promo Strip */
            .ps-promo-strip { border-radius: 16px; padding: 32px 40px; background-size: cover; background-position: center; display: flex; align-items: center; justify-content: space-between; cursor: pointer; overflow: hidden; position: relative; box-shadow: 0 10px 30px rgba(0,87,255,0.15); }
            .ps-promo-strip::before { content: ''; position: absolute; inset: 0; background: radial-gradient(circle at 85% 50%, rgba(0,87,255,0.35), transparent 60%); pointer-events: none; }
            .ps-promo-strip-title { color: #fff; font-size: 1.5rem; font-weight: 900; margin: 0 0 6px; position: relative; z-index: 1; }
            .ps-promo-strip-sub { color: rgba(255,255,255,0.7); font-size: 0.9rem; position: relative; z-index: 1; }

            /* Customer Gallery */
            .ps-customer-title { text-align: center; font-size: 1.4rem; font-weight: 900; margin-bottom: 24px; }
            .ps-customer-title span { color: #EF4444; }
            .ps-customer-grid { display: grid; grid-template-columns: repeat(5, 1fr); gap: 16px; }
            .ps-customer-photo { border-radius: 14px; overflow: hidden; aspect-ratio: 1; background: #F3F4F6; }
            .ps-customer-photo img { width: 100%; height: 100%; object-fit: cover; transition: transform 0.3s; }
            .ps-customer-photo:hover img { transform: scale(1.06); }

            /* Newsletter */
            .ps-newsletter { background: #F1F4F9; border-radius: 16px; padding: 32px 40px; text-align: center; }
            .ps-newsletter h3 { font-size: 1.25rem; font-weight: 800; color: #0A0A0A; margin: 0 0 6px; }
            .ps-newsletter p { font-size: 1.15rem; color: #6B7280; margin: 0 0 18px; }
            .ps-newsletter-form { position: relative; max-width: 480px; margin: 0 auto; }
            .ps-newsletter-form input { width: 100%; height: 56px; border: 1.5px solid #0A0A0A; border-radius: 100px; padding: 0 130px 0 22px; font-size: 0.85rem; font-family: 'Nunito',sans-serif; outline: none; box-sizing: border-box; }
            .ps-newsletter-form button { position: absolute; right: 4px; top: 4px; bottom: 4px; white-space: nowrap; padding: 0 24px; border: none; border-radius: 100px; background: #0A0A0A; color: #fff; font-weight: 700; font-size: 0.85rem; cursor: pointer; font-family: 'Nunito',sans-serif; transition: background 0.15s; }
            .ps-newsletter-form button:hover { background: #262626; }

            /* Responsive */
            @media (max-width: 980px) {
                .ps-hero-grid { grid-template-columns: 1fr; }
                .ps-hero-right { grid-template-columns: 1fr 1fr; grid-template-rows: 1fr; }
                .ps-feat-grid, .ps-cat-grid, .ps-brand-grid, .ps-customer-grid { grid-template-columns: repeat(3, 1fr); }
                .ps-brand-section { flex-direction: column; }
                .ps-side-banner { width: 100%; min-height: 180px; }
            }
            @media (max-width: 600px) {
                .ps-home-wrap { padding: 14px 14px 32px; }
                .ps-hero-right { grid-template-columns: 1fr; }
                .ps-feat-grid, .ps-cat-grid, .ps-brand-grid, .ps-customer-grid { grid-template-columns: repeat(2, 1fr); gap: 10px; }
                .ps-promo-strip { flex-direction: column; text-align: center; gap: 14px; padding: 24px; }
                .ps-newsletter { padding: 24px 20px; }
            }
        `}</style>
    )
}