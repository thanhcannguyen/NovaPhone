// src/pages/user/ProductDetail.jsx
import { useState, useEffect, useMemo } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { getProductById } from '../../api/productApi'
import { addToCartApi } from '../../api/cartApi'
import { getProductReviews, checkCanRate, submitReview as submitReviewApi, submitReply, toggleReviewHelpful } from '../../api/reviewApi'
import { useCart } from '../../context/CartContext'
import { useAuth } from '../../context/AuthContext'
import {
    ShoppingCart, Zap, ChevronRight, CheckCircle,
    ShieldCheck, RefreshCw, Truck, Star, Gift, Award,
    Phone, Heart, GitCompare, MessageSquare, ThumbsUp,
    Flag
} from 'lucide-react'
import styles from './ProductDetail.module.css'

const IS = { display: 'block', border: 'none', outline: 'none', background: 'none', boxShadow: 'none', flexShrink: 0 }

// Star rating display
function Stars({ rating = 0, size = 14, interactive = false, onChange }) {
    const [hover, setHover] = useState(0)
    const display = interactive && hover ? hover : Number(rating) || 0
    return (
        <span style={{ display: 'inline-flex', gap: 2 }}
            onMouseLeave={interactive ? () => setHover(0) : undefined}>
            {[1, 2, 3, 4, 5].map(i => {
                const filled = i <= Math.round(display)
                return (
                    <span key={i} className={`${styles.starUnit}${filled ? ' ' + styles.filled : ''}`}
                        style={{ width: size, height: size, cursor: interactive ? 'pointer' : 'default' }}
                        onMouseEnter={interactive ? () => setHover(i) : undefined}
                        onClick={interactive ? () => onChange?.(i) : undefined}
                    >
                        <Star size={size} style={{ ...IS, width: '100%', height: '100%' }} strokeWidth={2} />
                    </span>
                )
            })}
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
const AVATAR_COLORS = ['#0057FF', '#16A34A', '#7C3AED', '#EF4444', '#0EA5E9', '#DB2777', '#F59E0B']
const avatarColor = (name = '') => AVATAR_COLORS[name.charCodeAt(0) % AVATAR_COLORS.length] || '#0057FF'
const getInitials = (name = '') => {
    const parts = name.trim().split(' ')
    return parts.length >= 2 ? (parts[0][0] + parts[parts.length - 1][0]).toUpperCase() : name.slice(0, 2).toUpperCase()
}

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
    const [replyingTo, setReplyingTo] = useState(null) // id của review đang mở form trả lời
    const [replyText, setReplyText] = useState('')
    const [submittingReply, setSubmittingReply] = useState(false)
    const [expandedThreads, setExpandedThreads] = useState({}) // { [reviewId]: true } khi bấm "Xem thêm phản hồi"

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

    const handleSubmitReply = async (reviewId) => {
        if (!isAuthenticated) { navigate('/login'); return }
        if (!replyText.trim()) return
        setSubmittingReply(true)
        try {
            await submitReply(reviewId, replyText.trim())
            setReplyText('')
            setReplyingTo(null)
            loadReviews()
            showToast('✅ Đã gửi trả lời!')
        } catch (err) {
            showToast('⚠️ ' + (err.response?.data?.message || 'Lỗi gửi trả lời'))
        } finally {
            setSubmittingReply(false)
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

            {toast && <div className={styles.toast}>{toast}</div>}

            {/* Breadcrumb */}
            <div className={`${styles.breadcrumb} ${styles.page}`}>
                <div className={styles.breadcrumbInner}>
                    <button onClick={() => navigate('/')} style={{ background: 'none', border: 'none', color: '#6B7280', cursor: 'pointer', fontSize: '0.82rem', fontFamily: 'Nunito,sans-serif', padding: 0 }}>Trang chủ</button>
                    <ChevronRight size={12} style={{ ...IS, color: '#9CA3AF' }} />
                    <button onClick={() => navigate('/products')} style={{ background: 'none', border: 'none', color: '#6B7280', cursor: 'pointer', fontSize: '0.82rem', fontFamily: 'Nunito,sans-serif', padding: 0 }}>Sản phẩm</button>
                    {brand && (
                        <>
                            <ChevronRight size={12} style={{ ...IS, color: '#9CA3AF' }} />
                            <button onClick={() => {
                                const catId = p.category?._id || p.category
                                navigate(catId ? `/products?category=${catId}` : '/products')
                            }}
                                style={{ background: 'none', border: 'none', color: '#6B7280', cursor: 'pointer', fontSize: '0.82rem', fontFamily: 'Nunito,sans-serif', padding: 0 }}>
                                {brand}
                            </button>
                        </>
                    )}
                    <ChevronRight size={12} style={{ ...IS, color: '#9CA3AF' }} />
                    <span style={{ color: '#0A0A0A', fontWeight: 600 }}>{p.name}</span>
                </div>
            </div>

            <div className={`${styles.wrap} ${styles.page}`}>

                {/* ── HERO: image | info | sidebar ── */}
                <div className={styles.main}>

                    {/* Column 1: Images */}
                    <div>
                        <div className={styles.imgMain}>
                            <img
                                src={imgs[activeImg] || p.image}
                                alt={p.name}
                                onError={e => { e.target.src = 'https://placehold.co/500x500/F8F9FB/0057FF?text=📱' }}
                            />
                        </div>
                        {imgs.length > 1 && (
                            <div className={styles.thumbs}>
                                {imgs.map((img, idx) => (
                                    <div key={idx}
                                        className={`${styles.thumb}${activeImg === idx ? ' ' + styles.active : ''}`}
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
                        {brand && <div className={styles.brand}>{brand}</div>}
                        <h1 className={styles.name}>{p.name}</h1>

                        {/* Rating + stock */}
                        <div className={styles.ratingRow}>
                            <Stars rating={reviewStats.avg} size={14} />
                            <span style={{ fontWeight: 700, fontSize: '0.88rem', color: '#0A0A0A' }}>
                                {reviewStats.total ? reviewStats.avg.toFixed(1) : 'Chưa có'}
                            </span>
                            <span style={{ color: '#6B7280', fontSize: '0.85rem' }}>({reviewStats.total} đánh giá)</span>
                            <span className={styles.stockBadge} style={{
                                background: inStock ? '#F0FDF4' : '#FEF2F2',
                                color: inStock ? '#16A34A' : '#EF4444',
                                border: `1px solid ${inStock ? '#BBF7D0' : '#FECACA'}`,
                            }}>
                                {inStock ? '● Còn hàng' : '○ Hết hàng'}
                            </span>
                        </div>

                        {/* Price */}
                        <span className={styles.price}>{p.price.toLocaleString('vi-VN')}đ</span>
                        {p.originalPrice > p.price && (
                            <div className={styles.priceRow}>
                                <span className={styles.oldPrice}>{p.originalPrice.toLocaleString('vi-VN')}đ</span>
                                {discount > 0 && (
                                    <span className={styles.discountBadge}>Tiết kiệm {discount}%</span>
                                )}
                                <span className={styles.save}>
                                    Tiết kiệm {(p.originalPrice - p.price).toLocaleString('vi-VN')}đ
                                </span>
                            </div>
                        )}

                        {/* Trust bullet points */}
                        <ul className={styles.trustList}>
                            {TRUST_POINTS.map((t, i) => (
                                <li key={i}>
                                    <CheckCircle size={15} style={{ ...IS, color: '#16A34A', marginTop: 2 }} />
                                    {t}
                                </li>
                            ))}
                        </ul>

                        {/* Quantity */}
                        <div className={styles.qtyWrap}>
                            <span className={styles.qtyLabel}>Số lượng</span>
                            <div className={styles.qtyCtrl}>
                                <button className={styles.qtyBtn} onClick={() => setQty(q => Math.max(1, q - 1))}>−</button>
                                <input className={styles.qtyNum} type="number" value={qty} min={1} max={p.stock}
                                    onChange={e => setQty(Math.max(1, Math.min(p.stock, Number(e.target.value))))} />
                                <button className={styles.qtyBtn} onClick={() => setQty(q => Math.min(p.stock, q + 1))}>+</button>
                            </div>
                            <span className={styles.stockLabel}>Kho: <span>{p.stock}</span></span>
                        </div>

                        {/* Alert */}
                        {addMsg && (
                            <div className={addMsg.startsWith('✅') ? styles.alertOk : styles.alertErr}>{addMsg}</div>
                        )}

                        {/* Action buttons */}
                        <div className={styles.actions}>
                            {inStock ? (
                                <>
                                    <button className={styles.btnBuyNow} onClick={handleBuyNow} disabled={adding}>
                                        <Zap size={18} style={IS} />
                                        Mua ngay
                                    </button>
                                    <button className={styles.btnAddCart} onClick={handleAddToCart} disabled={adding}>
                                        <ShoppingCart size={18} style={IS} />
                                        {adding ? 'Đang thêm...' : 'Thêm vào giỏ'}
                                    </button>
                                </>
                            ) : (
                                <button className={styles.btnAddCart} disabled style={{ background: '#E5E7EB', color: '#9CA3AF', cursor: 'not-allowed', border: 'none' }}>
                                    Hết hàng
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Column 3: Promotions + Policies (sidebar) */}
                    <div>
                        <div className={styles.sideBox}>
                            <div className={styles.promoHead}><Gift size={16} style={IS} /> Khuyến mãi đặc biệt</div>
                            <div className={styles.promoBody}>
                                <ul>
                                    {promotions.map((line, i) => <li key={i}>{line}</li>)}
                                </ul>
                            </div>
                        </div>

                        <div className={styles.sideBox}>
                            <div className={styles.policyHead}><ShieldCheck size={16} style={IS} /> Chính sách hỗ trợ</div>
                            <div className={styles.policyBody}>
                                {POLICIES.map((pol, i) => (
                                    <div key={i} className={styles.policyItem}>
                                        {pol.icon}
                                        <div>
                                            <div className={styles.policyTitle}>{pol.title}</div>
                                            <div className={styles.policySub}>{pol.sub}</div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className={styles.sideActions}>
                            <button className={`${styles.sideBtn}${wished ? ' ' + styles.active : ''}`} onClick={toggleWish}>
                                <Heart size={15} style={IS} fill={wished ? '#EF4444' : 'none'} />
                                {wished ? 'Đã yêu thích' : 'Thêm vào yêu thích'}
                            </button>
                            <button className={`${styles.sideBtn}${compared ? ' ' + styles.active : ''}`} onClick={toggleCompare}>
                                <GitCompare size={15} style={IS} />
                                {compared ? 'Đã thêm so sánh' : 'Thêm vào so sánh'}
                            </button>
                        </div>
                    </div>
                </div>

                {/* ── TABS (below hero): Mô tả / Đánh giá / Thông số ── */}
                <div className={styles.tabs}>
                    <div className={styles.tabNav}>
                        {[
                            { key: 'desc', label: '📄 Mô tả sản phẩm' },
                            { key: 'reviews', label: <><MessageSquare size={14} style={IS} /> Đánh giá sản phẩm ({reviewStats.totalComments})</> },
                            { key: 'specs', label: '📋 Thông số kỹ thuật' },
                        ].map(t => (
                            <button key={t.key}
                                className={`${styles.tabBtn}${tab === t.key ? ' ' + styles.active : ''}`}
                                onClick={() => setTab(t.key)}>
                                {t.label}
                            </button>
                        ))}
                    </div>
                    <div className={styles.tabBody}>

                        {/* Mô tả */}
                        {tab === 'desc' && (
                            <div className={styles.desc}>
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
                            <table className={styles.specsTable}>
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
                                <div className={styles.revSummary}>
                                    <div>
                                        <div className={styles.revScore}>{reviewStats.total ? reviewStats.avg.toFixed(1) : '0'}/5</div>
                                        <Stars rating={reviewStats.avg} size={16} />
                                        <div className={styles.revCount}>({reviewStats.total} đánh giá)</div>
                                    </div>
                                    <div className={styles.revFilters}>
                                        <button className={`${styles.revFilterBtn}${reviewFilter === 'all' ? ' ' + styles.active : ''}`}
                                            onClick={() => setReviewFilter('all')}>Tất cả</button>
                                        {RATING_FILTERS.map(n => (
                                            <button key={n}
                                                className={`${styles.revFilterBtn}${reviewFilter === n ? ' ' + styles.active : ''}`}
                                                onClick={() => setReviewFilter(n)}>
                                                {n} Điểm ({reviewStats.counts[n] || 0})
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Review form — gated theo trạng thái đăng nhập / đã mua */}
                                {!isAuthenticated ? (
                                    <div className={styles.revForm} style={{ textAlign: 'center' }}>
                                        <p style={{ fontSize: '0.88rem', color: '#374151', marginBottom: 12 }}>
                                            Đăng nhập để xem và viết bình luận về sản phẩm này.
                                        </p>
                                        <button type="button" className={styles.revSubmit} onClick={() => navigate('/login')}>Đăng nhập</button>
                                    </div>
                                ) : (
                                    <form className={styles.revForm} onSubmit={handleSubmitReview}>
                                        <div className={styles.revFormTitle}>
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
                                        <textarea className={styles.revTextarea} placeholder="Nhập nội dung đánh giá của bạn về sản phẩm này"
                                            value={reviewForm.comment}
                                            onChange={e => setReviewForm(f => ({ ...f, comment: e.target.value }))} />
                                        <button type="submit" className={styles.revSubmit} disabled={submittingReview}>
                                            {submittingReview ? 'Đang gửi...' : 'Gửi đánh giá'}
                                        </button>
                                    </form>
                                )}

                                {/* Review list */}
                                {filteredReviews.length === 0 ? (
                                    <div className={styles.revEmpty}>Chưa có đánh giá nào phù hợp.</div>
                                ) : (
                                    filteredReviews.map(r => {
                                        const showAll = expandedThreads[r._id]
                                        const visibleReplies = showAll ? r.replies : (r.replies || []).slice(0, 3)
                                        const hiddenCount = (r.replies?.length || 0) - visibleReplies.length

                                        return (
                                            <div key={r._id} className={styles.revItem}>
                                                <div className={styles.revAvatar} style={{ background: avatarColor(r.name) }}>{getInitials(r.name)}</div>
                                                <div className={styles.revBody}>
                                                    <div className={styles.revItemHead}>
                                                        <span className={styles.revName}>{r.name}</span>
                                                        {r.role === 'admin' && <span className={styles.replyBadgeAdmin}>Quản trị viên</span>}
                                                        {r.rating ? <Stars rating={r.rating} size={13} /> : (
                                                            <span style={{ fontSize: '0.75rem', color: '#9CA3AF', fontStyle: 'italic' }}>Bình luận</span>
                                                        )}
                                                        {r.verifiedPurchase && (
                                                            <span className={styles.revVerified}><CheckCircle size={12} style={IS} /> Đã mua hàng</span>
                                                        )}
                                                        <span className={styles.revDate}>{new Date(r.createdAt).toLocaleDateString('vi-VN')}</span>
                                                    </div>
                                                    <div className={styles.revComment}>{r.comment}</div>
                                                    <div className={styles.revActions}>
                                                        <button
                                                            className={`${styles.revActionBtn}${r.viewerFoundHelpful ? ' ' + styles.active : ''}`}
                                                            onClick={() => handleToggleHelpful(r._id)}>
                                                            <ThumbsUp size={13} style={IS} /> Hữu ích {r.helpfulCount ? `(${r.helpfulCount})` : (r.helpfulUsers?.length ? `(${r.helpfulUsers.length})` : '')}
                                                        </button>
                                                        <button className={styles.revActionBtn} onClick={() => { setReplyingTo(replyingTo === r._id ? null : r._id); setReplyText('') }}>
                                                            <MessageSquare size={13} style={IS} /> Trả lời
                                                        </button>
                                                        <button className={styles.revActionBtn}>
                                                            <Flag size={13} style={IS} /> Báo cáo sai phạm
                                                        </button>
                                                    </div>

                                                    {/* Form nhập câu trả lời cho bình luận gốc */}
                                                    {replyingTo === r._id && (
                                                        <div className={styles.replyForm}>
                                                            <input
                                                                className={styles.replyInput}
                                                                placeholder={isAuthenticated ? 'Viết câu trả lời...' : 'Đăng nhập để trả lời'}
                                                                value={replyText}
                                                                disabled={!isAuthenticated}
                                                                onChange={e => setReplyText(e.target.value)}
                                                                onKeyDown={e => { if (e.key === 'Enter') handleSubmitReply(r._id) }}
                                                            />
                                                            <button className={styles.replySend} disabled={submittingReply}
                                                                onClick={() => isAuthenticated ? handleSubmitReply(r._id) : navigate('/login')}>
                                                                {submittingReply ? '...' : 'Gửi'}
                                                            </button>
                                                        </div>
                                                    )}

                                                    {/* Danh sách câu trả lời của thread này */}
                                                    {r.replies?.length > 0 && (
                                                        <div className={styles.replyList}>
                                                            {visibleReplies.map(rep => (
                                                                <div key={rep._id} className={styles.replyRow}>
                                                                    <div className={styles.replyAvatar} style={{ background: avatarColor(rep.name) }}>{getInitials(rep.name)}</div>
                                                                    <div className={styles.replyBody}>
                                                                        <div className={styles.replyItemHead}>
                                                                            <span className={styles.replyName}>{rep.name}</span>
                                                                            {rep.role === 'admin' && <span className={styles.replyBadgeAdmin}>Quản trị viên</span>}
                                                                            {rep.replyToName && <span style={{ fontSize: '0.75rem', color: '#0057FF' }}>→ @{rep.replyToName}</span>}
                                                                            <span className={styles.replyDate}>{new Date(rep.createdAt).toLocaleDateString('vi-VN')}</span>
                                                                        </div>
                                                                        <div className={styles.replyComment}>{rep.comment}</div>
                                                                        <button className={styles.replyBtn} style={{ marginTop: 4 }}
                                                                            onClick={() => { setReplyingTo(replyingTo === rep._id ? null : rep._id); setReplyText('') }}>
                                                                            <MessageSquare size={12} style={IS} /> Trả lời
                                                                        </button>
                                                                        {replyingTo === rep._id && (
                                                                            <div className={styles.replyForm}>
                                                                                <input
                                                                                    className={styles.replyInput}
                                                                                    placeholder={isAuthenticated ? `Trả lời ${rep.name}...` : 'Đăng nhập để trả lời'}
                                                                                    value={replyText}
                                                                                    disabled={!isAuthenticated}
                                                                                    onChange={e => setReplyText(e.target.value)}
                                                                                    onKeyDown={e => { if (e.key === 'Enter') handleSubmitReply(rep._id) }}
                                                                                />
                                                                                <button className={styles.replySend} disabled={submittingReply}
                                                                                    onClick={() => isAuthenticated ? handleSubmitReply(rep._id) : navigate('/login')}>
                                                                                    {submittingReply ? '...' : 'Gửi'}
                                                                                </button>
                                                                            </div>
                                                                        )}
                                                                    </div>
                                                                </div>
                                                            ))}
                                                            {hiddenCount > 0 && (
                                                                <button className={styles.showMoreBtn} onClick={() => setExpandedThreads(s => ({ ...s, [r._id]: true }))}>
                                                                    <ChevronRight size={14} style={IS} /> Xem thêm {hiddenCount} phản hồi
                                                                </button>
                                                            )}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        )
                                    })
                                )}
                            </div>
                        )}
                    </div>
                </div>

            </div>
        </div>
    )
}
