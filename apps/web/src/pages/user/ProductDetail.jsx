// src/pages/user/ProductDetail.jsx
import { useState, useEffect, useMemo } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { getProductById } from '../../api/productApi'
import { addToCartApi } from '../../api/cartApi'
import { getProductReviews, checkCanRate, submitReview as submitReviewApi, toggleReviewHelpful } from '../../api/reviewApi'
import { useCart } from '../../context/CartContext'
import { useAuth } from '../../context/AuthContext'
import {
    ShoppingCart, Zap, ChevronRight, CheckCircle,
    ShieldCheck, RefreshCw, Truck, Star, Gift, Award,
    Phone, Heart, GitCompare, MessageSquare, ThumbsUp,
    Flag
} from 'lucide-react'

const IS = { display: 'block', border: 'none', outline: 'none', background: 'none', boxShadow: 'none', flexShrink: 0 }

// Star rating display
function Stars({ rating = 0, size = 14, interactive = false, onChange }) {
    const [hover, setHover] = useState(0)
    const display = interactive && hover ? hover : rating
    return (
        <span style={{ display: 'inline-flex', gap: 2 }}
            onMouseLeave={interactive ? () => setHover(0) : undefined}>
            {[1, 2, 3, 4, 5].map(i => (
                <Star key={i} size={size}
                    style={{ ...IS, color: '#F59E0B', cursor: interactive ? 'pointer' : 'default' }}
                    fill={i <= Math.round(display) ? '#F59E0B' : 'none'}
                    strokeWidth={1.8}
                    onMouseEnter={interactive ? () => setHover(i) : undefined}
                    onClick={interactive ? () => onChange?.(i) : undefined}
                />
            ))}
        </span>
    )
}

// Bullet trust points shown under the price (like the checkmark list in the reference layout)
const TRUST_POINTS = [
    'Máy mới 100% - Chính hãng, chưa active',
    'Được hỗ trợ 1 đổi 1 trong 30 ngày nếu lỗi từ nhà sản xuất',
    'Bảo hành chính hãng 12 tháng',
]

// Policies shown in the right sidebar
const POLICIES = [
    { icon: <Truck size={17} style={{ ...IS, color: '#0057FF' }} />, title: 'Vận chuyển miễn phí', sub: 'Áp dụng cho đơn từ 3 triệu' },
    { icon: <Gift size={17} style={{ ...IS, color: '#0057FF' }} />, title: 'Quà tặng', sub: 'Tặng kèm phụ kiện chính hãng' },
    { icon: <Award size={17} style={{ ...IS, color: '#0057FF' }} />, title: 'Chứng nhận chất lượng', sub: 'Sản phẩm chính hãng 100%' },
    { icon: <Phone size={17} style={{ ...IS, color: '#0057FF' }} />, title: 'Hotline hỗ trợ', sub: '1900 6750 - Hỗ trợ 24/7' },
]

// Default promotions shown when the product has none configured
const DEFAULT_PROMOTIONS = [
    'Thu cũ đổi mới - trợ giá đến 90%',
    'Hỗ trợ trả góp 0% qua thẻ tín dụng',
    'Giảm thêm 5% khi mua kèm phụ kiện',
]

const SPEC_ROWS = [
    ['brand', 'Thương hiệu'],
    ['chip', 'Chip xử lý'],
    ['ram', 'RAM'],
    ['storage', 'Bộ nhớ trong'],
    ['screen', 'Màn hình'],
    ['camera', 'Camera'],
    ['battery', 'Pin'],
    ['os', 'Hệ điều hành'],
]

const RATING_FILTERS = [5, 4, 3, 2, 1]

export default function ProductDetail() {
    const { id } = useParams()
    const navigate = useNavigate()
    const { fetchCart } = useCart()
    const [product, setProduct] = useState(null)
    const [loading, setLoading] = useState(true)
    const [qty, setQty] = useState(1)
    const [activeImg, setActiveImg] = useState(0)
    const [tab, setTab] = useState('desc') // 'desc' | 'reviews' | 'specs'
    const [adding, setAdding] = useState(false)
    const [addMsg, setAddMsg] = useState('')
    const [wished, setWished] = useState(false)
    const [compared, setCompared] = useState(false)
    const [toast, setToast] = useState('')

    // Reviews are backed by the review API
    const { token } = useAuth() // AuthContext chỉ có { token, user, login, logout } — suy ra trạng thái đăng nhập từ token
    const isAuthenticated = Boolean(token)
    const [reviews, setReviews] = useState([])
    const [reviewFilter, setReviewFilter] = useState('all')
    const [reviewForm, setReviewForm] = useState({ rating: 5, comment: '' })
    const [canRate, setCanRate] = useState(null) // null = chưa xác định, true/false sau khi kiểm tra
    const [submittingReview, setSubmittingReview] = useState(false)

    useEffect(() => {
        window.scrollTo(0, 0)
        setLoading(true)
        getProductById(id)
            .then(res => setProduct(res.data.data))
            .catch(() => navigate('/products'))
            .finally(() => setLoading(false))
    }, [id])

    const loadReviews = () => {
        getProductReviews(id)
            .then(res => setReviews(res.data.data.reviews || []))
            .catch(() => setReviews([]))
    }

    useEffect(() => {
        loadReviews()
    }, [id])

    useEffect(() => {
        if (!isAuthenticated) { setCanRate(false); return }
        checkCanRate(id)
            .then(res => setCanRate(res.data.data.canRate))
            .catch(() => setCanRate(false))
    }, [id, isAuthenticated])

    const handleAddToCart = async () => {
        setAdding(true)
        try {
            await addToCartApi(product._id, qty)
            await fetchCart()
            setAddMsg('✅ Đã thêm vào giỏ hàng!')
            setTimeout(() => setAddMsg(''), 2500)
        } catch (err) {
            setAddMsg('⚠️ ' + (err.response?.data?.message || 'Lỗi thêm vào giỏ'))
            setTimeout(() => setAddMsg(''), 2500)
        } finally { setAdding(false) }
    }

    const handleBuyNow = async () => {
        await handleAddToCart()
        navigate('/checkout')
    }

    const showToast = (msg) => {
        setToast(msg)
        setTimeout(() => setToast(''), 2000)
    }

    const toggleWish = () => {
        setWished(w => !w)
        showToast(!wished ? '❤️ Đã thêm vào yêu thích' : 'Đã bỏ khỏi yêu thích')
    }

    const toggleCompare = () => {
        setCompared(c => !c)
        showToast(!compared ? '🔁 Đã thêm vào so sánh' : 'Đã bỏ khỏi so sánh')
    }

    const handleSubmitReview = async (e) => {
        e.preventDefault()
        if (!isAuthenticated) { navigate('/login'); return }
        if (!reviewForm.comment.trim()) return
        setSubmittingReview(true)
        try {
            await submitReviewApi(id, {
                rating: canRate ? reviewForm.rating : undefined,
                comment: reviewForm.comment.trim(),
            })
            setReviewForm({ rating: 5, comment: '' })
            loadReviews()
            showToast('✅ Cảm ơn bạn đã đánh giá!')
        } catch (err) {
            showToast('⚠️ ' + (err.response?.data?.message || 'Lỗi gửi đánh giá'))
        } finally {
            setSubmittingReview(false)
        }
    }

    const handleToggleHelpful = async (reviewId) => {
        if (!isAuthenticated) { navigate('/login'); return }
        try {
            const res = await toggleReviewHelpful(reviewId)
            const { helpfulCount, active } = res.data.data
            setReviews(rs => rs.map(r => r._id === reviewId ? { ...r, helpfulCount, viewerFoundHelpful: active } : r))
        } catch { /* silent — không chặn thao tác của người dùng vì lỗi vặt */ }
    }

    // Chỉ những review có rating (tức verifiedPurchase) mới tính vào điểm trung bình / bộ lọc theo sao
    const reviewStats = useMemo(() => {
        const rated = reviews.filter(r => r.rating)
        const total = rated.length
        const avg = total ? rated.reduce((s, r) => s + r.rating, 0) / total : 0
        const counts = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 }
        rated.forEach(r => { counts[r.rating] = (counts[r.rating] || 0) + 1 })
        return { total, avg, counts, totalComments: reviews.length }
    }, [reviews])

    const filteredReviews = useMemo(() => {
        if (reviewFilter === 'all') return reviews
        return reviews.filter(r => r.rating === reviewFilter)
    }, [reviews, reviewFilter])

    if (loading) return (
        <div style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Nunito,sans-serif' }}>
            <div style={{ textAlign: 'center', color: '#6B7280' }}>
                <div style={{ width: 36, height: 36, border: '3px solid #E5E7EB', borderTop: '3px solid #0057FF', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto 12px' }} />
                <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
                Đang tải...
            </div>
        </div>
    )

    if (!product) return null

    const p = product
    const specs = p.specs || {}
    const imgs = p.images?.length > 0 ? p.images : [p.image]
    const discount = p.originalPrice > p.price
        ? Math.round((1 - p.price / p.originalPrice) * 100)
        : 0
    const inStock = (p.stock ?? 0) > 0
    const brand = specs.brand || p.category?.name || ''
    const promotions = p.promotions?.length ? p.promotions : DEFAULT_PROMOTIONS

    return (
        <div style={{ background: '#F8F9FB', minHeight: '100vh', fontFamily: 'Nunito,sans-serif' }}>
            <style>{`
            @import url('https://fonts.googleapis.com/css2?family=Nunito:wght@400;500;600;700;800&display=swap');
            .pd-page svg { display:block!important; border:none!important; outline:none!important; box-shadow:none!important; background:transparent!important; overflow:visible!important; }

            /* Breadcrumb */
            .pd-breadcrumb { background:#fff; border-bottom:1px solid #E5E7EB; padding:10px 0; font-size:0.82rem; color:#6B7280; }
            .pd-breadcrumb-inner { max-width:1320px; margin:0 auto; padding:0 24px; display:flex; align-items:center; gap:5px; flex-wrap:wrap; }

            /* Wrap */
            .pd-wrap { max-width:1320px; margin:0 auto; padding:24px; position:relative; }

            /* Toast */
            .pd-toast { position:fixed; top:20px; right:20px; background:#0A0A0A; color:#fff; padding:10px 18px; border-radius:10px; font-size:0.85rem; font-weight:600; z-index:50; box-shadow:0 8px 24px rgba(0,0,0,0.18); }

            /* ── HERO: image | info | sidebar ── */
            .pd-main { display:grid; grid-template-columns:400px 1fr 300px; gap:28px; background:#fff; border:1px solid #E5E7EB; border-radius:16px; padding:28px; margin-bottom:24px; align-items:start; }

            /* Image column */
            .pd-img-main { width:100%; aspect-ratio:1; background:#F8F9FB; border-radius:12px; overflow:hidden; display:flex; align-items:center; justify-content:center; margin-bottom:12px; cursor:zoom-in; }
            .pd-img-main img { width:100%; height:100%; object-fit:cover; transition:transform 0.3s; }
            .pd-img-main:hover img { transform:scale(1.05); }
            .pd-thumbs { display:flex; gap:8px; flex-wrap:wrap; }
            .pd-thumb { width:60px; height:60px; border:2px solid #E5E7EB; border-radius:8px; overflow:hidden; cursor:pointer; background:#F8F9FB; display:flex; align-items:center; justify-content:center; transition:border-color 0.2s; flex-shrink:0; }
            .pd-thumb img { width:100%; height:100%; object-fit:cover; }
            .pd-thumb.active { border-color:#0057FF; }
            .pd-thumb:hover { border-color:#0057FF; }

            /* Info column */
            .pd-brand { font-size:0.75rem; font-weight:700; color:#0057FF; text-transform:uppercase; letter-spacing:1.5px; margin-bottom:8px; }
            .pd-name { font-size:1.4rem; font-weight:800; color:#0A0A0A; line-height:1.3; margin-bottom:10px; }
            .pd-rating-row { display:flex; align-items:center; gap:6px; margin-bottom:16px; padding-bottom:16px; border-bottom:1px solid #E5E7EB; flex-wrap:nowrap; overflow:hidden; }
            .pd-stock-badge { margin-left:auto; font-size:0.72rem; font-weight:700; padding:3px 8px; border-radius:100px; display:flex; align-items:center; gap:4px; white-space:nowrap; flex-shrink:0; }
            .pd-price { font-size:1.7rem; font-weight:800; color:#EF4444; display:block; line-height:1; margin-bottom:6px; }
            .pd-price-row { display:flex; align-items:center; gap:8px; margin-bottom:14px; flex-wrap:wrap; }
            .pd-old-price { font-size:1rem; color:#6B7280; text-decoration:line-through; }
            .pd-discount-badge { background:#FEF2F2; color:#EF4444; border:1px solid #FECACA; font-size:0.8rem; font-weight:700; padding:3px 10px; border-radius:100px; }
            .pd-save { font-size:0.82rem; color:#16A34A; font-weight:600; }

            .pd-trust-list { list-style:none; padding:0; margin:0 0 18px; display:flex; flex-direction:column; gap:6px; }
            .pd-trust-list li { display:flex; align-items:flex-start; gap:7px; font-size:0.84rem; color:#374151; line-height:1.5; }

            /* Qty */
            .pd-qty-wrap { display:flex; align-items:center; gap:10px; margin-bottom:18px; flex-wrap:wrap; }
            .pd-qty-label { font-size:0.82rem; font-weight:700; color:#0A0A0A; }
            .pd-qty-ctrl { display:flex; align-items:center; border:1.5px solid #E5E7EB; border-radius:10px; overflow:hidden; }
            .pd-qty-btn { width:34px; height:34px; display:flex; align-items:center; justify-content:center; background:#F8F9FB; border:none; cursor:pointer; font-size:1.1rem; color:#0A0A0A; transition:background 0.15s; font-family:'Nunito',sans-serif; }
            .pd-qty-btn:hover { background:#ddd; }
            .pd-qty-num { width:46px; height:34px; border:none; border-left:1.5px solid #E5E7EB; border-right:1.5px solid #E5E7EB; text-align:center; font-size:0.9rem; font-weight:700; font-family:'Nunito',sans-serif; outline:none; }
            .pd-stock-label { font-size:0.8rem; color:#6B7280; }
            .pd-stock-label span { color:#16A34A; font-weight:700; }

            /* Actions */
            .pd-actions { display:flex; gap:10px; margin-bottom:10px; }
            @media (max-width: 480px) { .pd-actions { flex-direction:column; } }
            .btn-add-cart { flex:1; background:#fff; color:#0057FF; border:1.5px solid #0057FF; border-radius:10px; padding:12px; font-size:0.95rem; font-weight:700; font-family:'Nunito',sans-serif; cursor:pointer; transition:all 0.2s; display:flex; align-items:center; justify-content:center; gap:7px; }
            .btn-add-cart:hover:not(:disabled) { background:#EEF4FF; }
            .btn-add-cart:disabled { opacity:0.6; cursor:not-allowed; }
            .btn-buy-now { flex:1; background:#0A0A0A; color:#fff; border:none; border-radius:10px; padding:12px; font-size:0.95rem; font-weight:700; font-family:'Nunito',sans-serif; cursor:pointer; transition:all 0.2s; display:flex; align-items:center; justify-content:center; gap:7px; }
            .btn-buy-now:hover { background:#EF4444; transform:translateY(-1px); }

            /* Alert */
            .pd-alert-ok  { background:#F0FDF4; border:1px solid #BBF7D0; color:#16A34A; border-radius:8px; padding:10px 14px; font-size:0.85rem; margin-bottom:14px; }
            .pd-alert-err { background:#FEF2F2; border:1px solid #FECACA; color:#DC2626; border-radius:8px; padding:10px 14px; font-size:0.85rem; margin-bottom:14px; }

            /* Sidebar column */
            .pd-side-box { border-radius:12px; margin-bottom:14px; overflow:hidden; border:1px solid #E5E7EB; }
            .pd-promo-head { background:#EF4444; color:#fff; font-size:0.85rem; font-weight:800; padding:11px 14px; display:flex; align-items:center; gap:7px; }
            .pd-promo-body { padding:12px 14px; background:#FFF7F7; }
            .pd-promo-body ul { list-style:none; padding:0; margin:0; display:flex; flex-direction:column; gap:8px; }
            .pd-promo-body li { font-size:0.8rem; color:#374151; line-height:1.5; padding-left:14px; position:relative; }
            .pd-promo-body li::before { content:'•'; color:#EF4444; font-weight:800; position:absolute; left:0; }

            .pd-policy-head { background:#0A0A0A; color:#fff; font-size:0.85rem; font-weight:800; padding:11px 14px; display:flex; align-items:center; gap:7px; }
            .pd-policy-body { padding:8px 6px; background:#fff; }
            .pd-policy-item { display:flex; align-items:flex-start; gap:10px; padding:9px 8px; border-radius:8px; }
            .pd-policy-item:hover { background:#F8F9FB; }
            .pd-policy-title { font-size:0.82rem; font-weight:700; color:#0A0A0A; }
            .pd-policy-sub { font-size:0.72rem; color:#9CA3AF; }

            .pd-side-actions { display:flex; flex-direction:column; gap:8px; }
            .pd-side-btn { display:flex; align-items:center; justify-content:center; gap:7px; border:1.5px solid #E5E7EB; background:#fff; color:#374151; font-size:0.82rem; font-weight:700; padding:10px; border-radius:10px; cursor:pointer; font-family:'Nunito',sans-serif; transition:all 0.2s; }
            .pd-side-btn:hover { border-color:#0057FF; color:#0057FF; }
            .pd-side-btn.active { border-color:#EF4444; color:#EF4444; background:#FEF2F2; }

            /* ── Tabs section (below hero): Mô tả / Đánh giá / Thông số ── */
            .pd-tabs { background:#fff; border:1px solid #E5E7EB; border-radius:16px; overflow:hidden; margin-bottom:24px; }
            .pd-tab-nav { display:flex; border-bottom:1px solid #E5E7EB; overflow-x:auto; }
            .pd-tab-btn { padding:16px 28px; font-size:0.9rem; font-weight:700; color:#6B7280; background:none; border:none; border-bottom:2px solid transparent; cursor:pointer; font-family:'Nunito',sans-serif; transition:all 0.2s; margin-bottom:-1px; white-space:nowrap; display:flex; align-items:center; gap:6px; }
            .pd-tab-btn.active { color:#0057FF; border-bottom-color:#0057FF; }
            .pd-tab-btn:hover { color:#0057FF; }
            .pd-tab-body { padding:28px; }

            /* Specs table */
            .pd-specs-table { width:100%; border-collapse:collapse; }
            .pd-specs-table tr:nth-child(even) { background:#F8F9FB; }
            .pd-specs-table td { padding:10px 14px; font-size:0.875rem; border:1px solid #E5E7EB; }
            .pd-specs-table td:first-child { font-weight:700; color:#0A0A0A; width:35%; background:#F9FAFB; }
            .pd-specs-table td:last-child { color:#374151; }

            /* Description */
            .pd-desc p { font-size:0.9rem; line-height:1.8; color:#374151; margin-bottom:10px; }
            .pd-desc ul { padding-left:22px; margin:6px 0 10px; }
            .pd-desc li { margin-bottom:5px; line-height:1.7; font-size:0.9rem; color:#374151; }
            .pd-desc strong { font-weight:700; color:#0A0A0A; }

            /* Reviews tab */
            .pd-rev-summary { display:flex; gap:24px; align-items:center; flex-wrap:wrap; background:#FFF7F7; border:1px solid #FECACA; border-radius:12px; padding:18px 22px; margin-bottom:18px; }
            .pd-rev-score { font-size:2.2rem; font-weight:800; color:#0A0A0A; line-height:1; }
            .pd-rev-count { font-size:0.8rem; color:#6B7280; margin-top:4px; }
            .pd-rev-filters { display:flex; gap:8px; flex-wrap:wrap; }
            .pd-rev-filter-btn { border:1.5px solid #E5E7EB; background:#fff; color:#374151; font-size:0.8rem; font-weight:600; padding:7px 14px; border-radius:8px; cursor:pointer; font-family:'Nunito',sans-serif; transition:all 0.2s; }
            .pd-rev-filter-btn.active { border-color:#EF4444; color:#EF4444; background:#FEF2F2; }
            .pd-rev-filter-btn:hover { border-color:#0057FF; color:#0057FF; }

            .pd-rev-form { border:1px solid #E5E7EB; border-radius:12px; padding:18px; margin-bottom:22px; }
            .pd-rev-form-title { font-size:0.9rem; font-weight:700; color:#0A0A0A; margin-bottom:12px; }
            .pd-rev-form-row { display:grid; grid-template-columns:1fr 1fr 1fr; gap:10px; margin-bottom:10px; }
            .pd-rev-input, .pd-rev-textarea { border:1.5px solid #E5E7EB; border-radius:8px; padding:9px 12px; font-size:0.85rem; font-family:'Nunito',sans-serif; outline:none; width:100%; box-sizing:border-box; }
            .pd-rev-input:focus, .pd-rev-textarea:focus { border-color:#0057FF; }
            .pd-rev-textarea { min-height:80px; resize:vertical; margin-bottom:12px; }
            .pd-rev-submit { background:#EF4444; color:#fff; border:none; padding:10px 22px; border-radius:8px; font-size:0.85rem; font-weight:700; cursor:pointer; font-family:'Nunito',sans-serif; }
            .pd-rev-submit:hover { background:#DC2626; }

            .pd-rev-item { padding:16px 0; border-bottom:1px solid #E5E7EB; }
            .pd-rev-item:last-child { border-bottom:none; }
            .pd-rev-item-head { display:flex; align-items:center; gap:8px; margin-bottom:6px; flex-wrap:wrap; }
            .pd-rev-name { font-weight:700; font-size:0.88rem; color:#0A0A0A; }
            .pd-rev-verified { font-size:0.72rem; color:#EF4444; display:flex; align-items:center; gap:3px; }
            .pd-rev-date { font-size:0.75rem; color:#9CA3AF; margin-left:auto; }
            .pd-rev-comment { font-size:0.86rem; color:#374151; line-height:1.6; margin:6px 0 8px; }
            .pd-rev-actions { display:flex; gap:14px; }
            .pd-rev-action-btn { display:flex; align-items:center; gap:5px; background:none; border:none; color:#6B7280; font-size:0.78rem; cursor:pointer; font-family:'Nunito',sans-serif; padding:0; }
            .pd-rev-action-btn:hover { color:#0057FF; }
            .pd-rev-action-btn.active { color:#0057FF; font-weight:700; }
            .pd-rev-empty { text-align:center; padding:30px 0; color:#9CA3AF; font-size:0.88rem; }

            /* Responsive */
            @media (max-width:1100px) {
                .pd-main { grid-template-columns:360px 1fr; }
                .pd-main > div:last-child { grid-column:1 / -1; }
            }
            @media (max-width:900px) {
                .pd-main { grid-template-columns:1fr; gap:20px; padding:20px; }
                .pd-main > div:last-child { grid-column:auto; }
                .pd-actions { flex-direction:column; }
                .pd-rev-form-row { grid-template-columns:1fr; }
            }
            @media (max-width:600px) {
                .pd-wrap { padding:12px; }
                .pd-name { font-size:1.15rem; }
                .pd-price { font-size:1.35rem; }
                .pd-tab-btn { padding:12px 16px; font-size:0.82rem; }
                .pd-tab-body { padding:16px; }
                .pd-rev-summary { flex-direction:column; align-items:flex-start; }
            }
        `}</style>

            {toast && <div className="pd-toast">{toast}</div>}

            {/* Breadcrumb */}
            <div className="pd-breadcrumb pd-page">
                <div className="pd-breadcrumb-inner">
                    <button onClick={() => navigate('/products')} style={{ background: 'none', border: 'none', color: '#6B7280', cursor: 'pointer', fontSize: '0.82rem', fontFamily: 'Nunito,sans-serif', padding: 0 }}>Sản phẩm</button>
                    {brand && (
                        <>
                            <ChevronRight size={12} style={{ ...IS, color: '#9CA3AF' }} />
                            <button onClick={() => navigate(`/products?search=${encodeURIComponent(brand)}`)}
                                style={{ background: 'none', border: 'none', color: '#6B7280', cursor: 'pointer', fontSize: '0.82rem', fontFamily: 'Nunito,sans-serif', padding: 0 }}>
                                {brand}
                            </button>
                        </>
                    )}
                    <ChevronRight size={12} style={{ ...IS, color: '#9CA3AF' }} />
                    <span style={{ color: '#0A0A0A', fontWeight: 600 }}>{p.name}</span>
                </div>
            </div>

            <div className="pd-wrap pd-page">

                {/* ── HERO: image | info | sidebar ── */}
                <div className="pd-main">

                    {/* Column 1: Images */}
                    <div>
                        <div className="pd-img-main">
                            <img
                                src={imgs[activeImg] || p.image}
                                alt={p.name}
                                onError={e => { e.target.src = 'https://placehold.co/500x500/F8F9FB/0057FF?text=📱' }}
                            />
                        </div>
                        {imgs.length > 1 && (
                            <div className="pd-thumbs">
                                {imgs.map((img, idx) => (
                                    <div key={idx}
                                        className={`pd-thumb${activeImg === idx ? ' active' : ''}`}
                                        onClick={() => setActiveImg(idx)}>
                                        <img src={img} alt={`${p.name} ${idx + 1}`}
                                            onError={e => { e.target.src = 'https://placehold.co/60x60/F8F9FB/0057FF?text=📱' }} />
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Column 2: Info */}
                    <div>
                        {brand && <div className="pd-brand">{brand}</div>}
                        <h1 className="pd-name">{p.name}</h1>

                        {/* Rating + stock */}
                        <div className="pd-rating-row">
                            <Stars rating={reviewStats.avg} size={14} />
                            <span style={{ fontWeight: 700, fontSize: '0.88rem', color: '#0A0A0A' }}>
                                {reviewStats.total ? reviewStats.avg.toFixed(1) : 'Chưa có'}
                            </span>
                            <span style={{ color: '#6B7280', fontSize: '0.85rem' }}>({reviewStats.total} đánh giá)</span>
                            <span className="pd-stock-badge" style={{
                                background: inStock ? '#F0FDF4' : '#FEF2F2',
                                color: inStock ? '#16A34A' : '#EF4444',
                                border: `1px solid ${inStock ? '#BBF7D0' : '#FECACA'}`,
                            }}>
                                {inStock ? '● Còn hàng' : '○ Hết hàng'}
                            </span>
                        </div>

                        {/* Price */}
                        <span className="pd-price">{p.price.toLocaleString('vi-VN')}đ</span>
                        {p.originalPrice > p.price && (
                            <div className="pd-price-row">
                                <span className="pd-old-price">{p.originalPrice.toLocaleString('vi-VN')}đ</span>
                                {discount > 0 && (
                                    <span className="pd-discount-badge">Tiết kiệm {discount}%</span>
                                )}
                                <span className="pd-save">
                                    Tiết kiệm {(p.originalPrice - p.price).toLocaleString('vi-VN')}đ
                                </span>
                            </div>
                        )}

                        {/* Trust bullet points */}
                        <ul className="pd-trust-list">
                            {TRUST_POINTS.map((t, i) => (
                                <li key={i}>
                                    <CheckCircle size={15} style={{ ...IS, color: '#16A34A', marginTop: 2 }} />
                                    {t}
                                </li>
                            ))}
                        </ul>

                        {/* Quantity */}
                        <div className="pd-qty-wrap">
                            <span className="pd-qty-label">Số lượng</span>
                            <div className="pd-qty-ctrl">
                                <button className="pd-qty-btn" onClick={() => setQty(q => Math.max(1, q - 1))}>−</button>
                                <input className="pd-qty-num" type="number" value={qty} min={1} max={p.stock}
                                    onChange={e => setQty(Math.max(1, Math.min(p.stock, Number(e.target.value))))} />
                                <button className="pd-qty-btn" onClick={() => setQty(q => Math.min(p.stock, q + 1))}>+</button>
                            </div>
                            <span className="pd-stock-label">Kho: <span>{p.stock}</span></span>
                        </div>

                        {/* Alert */}
                        {addMsg && (
                            <div className={addMsg.startsWith('✅') ? 'pd-alert-ok' : 'pd-alert-err'}>{addMsg}</div>
                        )}

                        {/* Action buttons */}
                        <div className="pd-actions">
                            {inStock ? (
                                <>
                                    <button className="btn-buy-now" onClick={handleBuyNow} disabled={adding}>
                                        <Zap size={18} style={IS} />
                                        Mua ngay
                                    </button>
                                    <button className="btn-add-cart" onClick={handleAddToCart} disabled={adding}>
                                        <ShoppingCart size={18} style={IS} />
                                        {adding ? 'Đang thêm...' : 'Thêm vào giỏ'}
                                    </button>
                                </>
                            ) : (
                                <button className="btn-add-cart" disabled style={{ background: '#E5E7EB', color: '#9CA3AF', cursor: 'not-allowed', border: 'none' }}>
                                    Hết hàng
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Column 3: Promotions + Policies (sidebar) */}
                    <div>
                        <div className="pd-side-box">
                            <div className="pd-promo-head"><Gift size={16} style={IS} /> Khuyến mãi đặc biệt</div>
                            <div className="pd-promo-body">
                                <ul>
                                    {promotions.map((line, i) => <li key={i}>{line}</li>)}
                                </ul>
                            </div>
                        </div>

                        <div className="pd-side-box">
                            <div className="pd-policy-head"><ShieldCheck size={16} style={IS} /> Chính sách hỗ trợ</div>
                            <div className="pd-policy-body">
                                {POLICIES.map((pol, i) => (
                                    <div key={i} className="pd-policy-item">
                                        {pol.icon}
                                        <div>
                                            <div className="pd-policy-title">{pol.title}</div>
                                            <div className="pd-policy-sub">{pol.sub}</div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="pd-side-actions">
                            <button className={`pd-side-btn${wished ? ' active' : ''}`} onClick={toggleWish}>
                                <Heart size={15} style={IS} fill={wished ? '#EF4444' : 'none'} />
                                {wished ? 'Đã yêu thích' : 'Thêm vào yêu thích'}
                            </button>
                            <button className={`pd-side-btn${compared ? ' active' : ''}`} onClick={toggleCompare}>
                                <GitCompare size={15} style={IS} />
                                {compared ? 'Đã thêm so sánh' : 'Thêm vào so sánh'}
                            </button>
                        </div>
                    </div>
                </div>

                {/* ── TABS (below hero): Mô tả / Đánh giá / Thông số ── */}
                <div className="pd-tabs">
                    <div className="pd-tab-nav">
                        {[
                            { key: 'desc', label: '📄 Mô tả sản phẩm' },
                            { key: 'reviews', label: <><MessageSquare size={14} style={IS} /> Đánh giá sản phẩm ({reviewStats.totalComments})</> },
                            { key: 'specs', label: '📋 Thông số kỹ thuật' },
                        ].map(t => (
                            <button key={t.key}
                                className={`pd-tab-btn${tab === t.key ? ' active' : ''}`}
                                onClick={() => setTab(t.key)}>
                                {t.label}
                            </button>
                        ))}
                    </div>
                    <div className="pd-tab-body">

                        {/* Mô tả */}
                        {tab === 'desc' && (
                            <div className="pd-desc">
                                {p.description
                                    ? p.description.split('\n').map((line, i) => (
                                        <p key={i}>{line}</p>
                                    ))
                                    : <p style={{ color: '#6B7280' }}>Chưa có mô tả cho sản phẩm này.</p>
                                }
                            </div>
                        )}

                        {/* Thông số kỹ thuật */}
                        {tab === 'specs' && (
                            <table className="pd-specs-table">
                                <tbody>
                                    {[
                                        ['Thương hiệu', specs.brand || brand || '—'],
                                        ['Chip xử lý', specs.chip],
                                        ['RAM', specs.ram],
                                        ['Bộ nhớ trong', specs.storage],
                                        ['Màn hình', specs.screen],
                                        ['Camera', specs.camera],
                                        ['Pin', specs.battery],
                                        ['Hệ điều hành', specs.os],
                                        ['Tình trạng', inStock ? `Còn hàng (${p.stock})` : 'Hết hàng'],
                                        ['Giá bán', p.price.toLocaleString('vi-VN') + 'đ'],
                                        ...(p.originalPrice > p.price ? [['Giá gốc', p.originalPrice.toLocaleString('vi-VN') + 'đ']] : []),
                                    ].filter(([, val]) => val).map(([label, val], i) => (
                                        <tr key={i}>
                                            <td>{label}</td>
                                            <td style={{
                                                color: label === 'Giá bán' ? '#EF4444' : label === 'Tình trạng' && inStock ? '#16A34A' : '#374151',
                                                fontWeight: label === 'Giá bán' || (label === 'Tình trạng') ? 700 : 400,
                                            }}>{val}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}

                        {/* Đánh giá sản phẩm */}
                        {tab === 'reviews' && (
                            <div>
                                {/* Summary */}
                                <div className="pd-rev-summary">
                                    <div>
                                        <div className="pd-rev-score">{reviewStats.total ? reviewStats.avg.toFixed(1) : '0'}/5</div>
                                        <Stars rating={reviewStats.avg} size={16} />
                                        <div className="pd-rev-count">({reviewStats.total} đánh giá)</div>
                                    </div>
                                    <div className="pd-rev-filters">
                                        <button className={`pd-rev-filter-btn${reviewFilter === 'all' ? ' active' : ''}`}
                                            onClick={() => setReviewFilter('all')}>Tất cả</button>
                                        {RATING_FILTERS.map(n => (
                                            <button key={n}
                                                className={`pd-rev-filter-btn${reviewFilter === n ? ' active' : ''}`}
                                                onClick={() => setReviewFilter(n)}>
                                                {n} Điểm ({reviewStats.counts[n] || 0})
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Review form — gated theo trạng thái đăng nhập / đã mua */}
                                {!isAuthenticated ? (
                                    <div className="pd-rev-form" style={{ textAlign: 'center' }}>
                                        <p style={{ fontSize: '0.88rem', color: '#374151', marginBottom: 12 }}>
                                            Đăng nhập để xem và viết bình luận về sản phẩm này.
                                        </p>
                                        <button type="button" className="pd-rev-submit" onClick={() => navigate('/login')}>Đăng nhập</button>
                                    </div>
                                ) : (
                                    <form className="pd-rev-form" onSubmit={handleSubmitReview}>
                                        <div className="pd-rev-form-title">
                                            {canRate ? 'Đánh giá của bạn về sản phẩm:' : 'Viết bình luận về sản phẩm:'}
                                        </div>
                                        {canRate ? (
                                            <div style={{ marginBottom: 12 }}>
                                                <Stars rating={reviewForm.rating} size={22} interactive
                                                    onChange={r => setReviewForm(f => ({ ...f, rating: r }))} />
                                            </div>
                                        ) : (
                                            <p style={{ fontSize: '0.78rem', color: '#9CA3AF', marginBottom: 12 }}>
                                                Bạn chưa mua sản phẩm này nên chỉ có thể để lại bình luận, không có điểm sao.
                                            </p>
                                        )}
                                        <textarea className="pd-rev-textarea" placeholder="Nhập nội dung đánh giá của bạn về sản phẩm này"
                                            value={reviewForm.comment}
                                            onChange={e => setReviewForm(f => ({ ...f, comment: e.target.value }))} />
                                        <button type="submit" className="pd-rev-submit" disabled={submittingReview}>
                                            {submittingReview ? 'Đang gửi...' : 'Gửi đánh giá'}
                                        </button>
                                    </form>
                                )}

                                {/* Review list */}
                                {filteredReviews.length === 0 ? (
                                    <div className="pd-rev-empty">Chưa có đánh giá nào phù hợp.</div>
                                ) : (
                                    filteredReviews.map(r => (
                                        <div key={r._id} className="pd-rev-item">
                                            <div className="pd-rev-item-head">
                                                <span className="pd-rev-name">{r.name}</span>
                                                {r.rating ? <Stars rating={r.rating} size={13} /> : (
                                                    <span style={{ fontSize: '0.75rem', color: '#9CA3AF', fontStyle: 'italic' }}>Bình luận</span>
                                                )}
                                                {r.verifiedPurchase && (
                                                    <span className="pd-rev-verified"><CheckCircle size={12} style={IS} /> Đã mua hàng</span>
                                                )}
                                                <span className="pd-rev-date">{new Date(r.createdAt).toLocaleDateString('vi-VN')}</span>
                                            </div>
                                            <div className="pd-rev-comment">{r.comment}</div>
                                            <div className="pd-rev-actions">
                                                <button
                                                    className={`pd-rev-action-btn${r.viewerFoundHelpful ? ' active' : ''}`}
                                                    onClick={() => handleToggleHelpful(r._id)}>
                                                    <ThumbsUp size={13} style={IS} /> Hữu ích {r.helpfulCount ? `(${r.helpfulCount})` : (r.helpfulUsers?.length ? `(${r.helpfulUsers.length})` : '')}
                                                </button>
                                                <button className="pd-rev-action-btn">
                                                    <Flag size={13} style={IS} /> Báo cáo sai phạm
                                                </button>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        )}
                    </div>
                </div>

            </div>
        </div>
    )
}