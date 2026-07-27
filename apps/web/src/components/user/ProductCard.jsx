import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Eye, Heart, GitCompareArrows } from 'lucide-react'
import { useWishlist } from '../../context/WishlistContext'
import { useCompare } from '../../context/CompareContext'
import { useToast } from '../../context/ToastContext'
import QuickViewModal from './QuickViewModal'

export default function ProductCard({ product }) {
    const navigate = useNavigate()
    const { isInWishlist, toggleWishlist } = useWishlist()
    const { isInCompare, toggleCompare } = useCompare()
    const { showToast } = useToast()

    const [hovered, setHovered] = useState(false)
    const [quickViewOpen, setQuickViewOpen] = useState(false)

    const hasDiscount = product.originalPrice > product.price
    const pct = hasDiscount ? Math.round((1 - product.price / product.originalPrice) * 100) : 0
    const inWishlist = isInWishlist(product._id)
    const inCompare = isInCompare(product._id)

    const handleWishlist = (e) => {
        e.stopPropagation()
        const added = toggleWishlist(product)
        showToast({
            type: 'wishlist',
            title: added ? 'Thêm vào danh sách yêu thích' : 'Đã xoá khỏi yêu thích',
            message: added
                ? 'Sản phẩm của bạn đã thêm vào danh sách yêu thích thành công.'
                : 'Sản phẩm đã được xoá khỏi danh sách yêu thích.',
        })
    }

    const handleCompare = (e) => {
        e.stopPropagation()
        const { added, limitReached } = toggleCompare(product)
        if (limitReached) {
            showToast({ type: 'compare', title: 'So sánh sản phẩm', message: 'Bạn chỉ có thể so sánh tối đa 4 sản phẩm cùng lúc.' })
            return
        }
        showToast({
            type: 'compare',
            title: 'So sánh sản phẩm',
            message: added ? 'Đã thêm vào danh sách so sánh' : 'Đã xoá khỏi danh sách so sánh',
        })
    }

    return (
        <>
            <div
                className="ps-pcard"
                onClick={() => navigate(`/product/${product._id}`)}
                onMouseEnter={() => setHovered(true)}
                onMouseLeave={() => setHovered(false)}
            >
                <style>{`
                    .ps-pcard {
                        border: 1px solid #E5E7EB; border-radius: 12px; overflow: hidden; background: #fff;
                        transition: all 0.2s; cursor: pointer; position: relative;
                        display: flex; flex-direction: column; height: 100%;
                    }
                    .ps-pcard:hover { border-color: #0057FF; transform: translateY(-3px); box-shadow: 0 6px 20px rgba(0,87,255,0.12); }
                    .ps-pcard-badge { position: absolute; top: 10px; left: 10px; background: #EF4444; color: #fff; font-size: 0.65rem; font-weight: 800; padding: 3px 9px; border-radius: 6px; z-index: 3; }
                    .ps-pcard-oos { position: absolute; top: 10px; right: 10px; background: #0A0A0A; color: #fff; font-size: 0.68rem; font-weight: 700; padding: 4px 10px; border-radius: 6px; z-index: 3; }
                    .ps-pcard-img-wrap { width: 100%; aspect-ratio: 1; background: #F8F9FB; position: relative; overflow: hidden; }
                    .ps-pcard-img { width: 100%; height: 100%; object-fit: cover; transition: transform 0.3s; }
                    .ps-pcard-actions {
                        position: absolute; top: 55%; right: 10px; transform: translateY(-50%) translateX(8px);
                        display: flex; flex-direction: column; gap: 8px;
                        opacity: 0; transition: opacity 0.2s, transform 0.2s; pointer-events: none;
                    }
                    .ps-pcard:hover .ps-pcard-actions { opacity: 1; transform: translateY(-50%) translateX(0); pointer-events: auto; }
                    .ps-pcard-action-btn {
                        width: 32px; height: 32px; border-radius: 50%; background: #fff; border: 1px solid #E5E7EB;
                        display: flex; align-items: center; justify-content: center; cursor: pointer;
                        color: #4B5563; box-shadow: 0 2px 8px rgba(0,0,0,0.12); transition: all 0.15s; position: relative;
                    }
                    .ps-pcard-action-btn:hover { background: #0057FF; border-color: #0057FF; color: #fff; }
                    .ps-pcard-action-btn.active { background: #FEE2E2; border-color: #EF4444; color: #EF4444; }
                    .ps-pcard-action-btn.active.compare-active { background: #EEF4FF; border-color: #0057FF; color: #0057FF; }
                    /* Tooltip tuỳ chỉnh — hiện gần như ngay lập tức khi hover, không dùng title mặc định của trình duyệt (vốn có độ trễ vài giây) */
                    .ps-pcard-tooltip {
                        position: absolute; right: 40px; top: 50%; transform: translateY(-50%) translateX(4px);
                        background: #0A0A0A; color: #fff; font-size: 0.7rem; font-weight: 600; padding: 5px 10px;
                        border-radius: 6px; white-space: nowrap; opacity: 0; pointer-events: none;
                        transition: opacity 0.1s ease, transform 0.1s ease; z-index: 4;
                    }
                    .ps-pcard-action-btn:hover .ps-pcard-tooltip { opacity: 1; transform: translateY(-50%) translateX(0); }
                    .ps-pcard-body { padding: 12px; display: flex; flex-direction: column; flex: 1; }
                    .ps-pcard-brand { font-size: 0.65rem; font-weight: 700; color: #0057FF; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 4px; }
                    .ps-pcard-name { font-weight: 700; font-size: 0.875rem; color: #0A0A0A; margin: 0 0 8px; line-height: 1.4; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; min-height: 2.4em; flex: 1; }
                    .ps-pcard-price-row { margin-bottom: 10px; }
                    .ps-pcard-price { font-weight: 800; font-size: 1rem; color: #EF4444; display: block; }
                    .ps-pcard-price-old { font-size: 0.78rem; color: #9CA3AF; text-decoration: line-through; }
                `}</style>

                {hasDiscount && <span className="ps-pcard-badge">Giảm {pct}%</span>}
                {product.stock === 0 && <span className="ps-pcard-oos">Hết hàng</span>}

                <div className="ps-pcard-img-wrap">
                    <img
                        className="ps-pcard-img"
                        src={product.image}
                        alt={product.name}
                        style={{ transform: hovered ? 'scale(1.05)' : 'scale(1)' }}
                        onError={e => { e.target.src = 'https://placehold.co/300x300/F8F9FB/0057FF?text=📱' }}
                    />
                    <div className="ps-pcard-actions">
                        <div className="ps-pcard-action-btn" onClick={e => { e.stopPropagation(); setQuickViewOpen(true) }}>
                            <Eye size={15} />
                            <span className="ps-pcard-tooltip">Xem nhanh</span>
                        </div>
                        <div className={`ps-pcard-action-btn${inWishlist ? ' active' : ''}`} onClick={handleWishlist}>
                            <Heart size={15} fill={inWishlist ? '#EF4444' : 'none'} />
                            <span className="ps-pcard-tooltip">{inWishlist ? 'Bỏ yêu thích' : 'Thêm vào yêu thích'}</span>
                        </div>
                        <div className={`ps-pcard-action-btn${inCompare ? ' active compare-active' : ''}`} onClick={handleCompare}>
                            <GitCompareArrows size={15} />
                            <span className="ps-pcard-tooltip">{inCompare ? 'Bỏ so sánh' : 'Thêm vào so sánh'}</span>
                        </div>
                    </div>
                </div>

                <div className="ps-pcard-body">
                    {(product.specs?.brand || product.category?.name) && (
                        <div className="ps-pcard-brand">{product.specs?.brand || product.category?.name}</div>
                    )}
                    <h3 className="ps-pcard-name">{product.name}</h3>
                    <div className="ps-pcard-price-row">
                        <span className="ps-pcard-price">{product.price.toLocaleString('vi-VN')}đ</span>
                        {hasDiscount && <span className="ps-pcard-price-old">{product.originalPrice.toLocaleString('vi-VN')}đ</span>}
                    </div>
                </div>
            </div>

            {quickViewOpen && (
                <QuickViewModal product={product} onClose={() => setQuickViewOpen(false)} />
            )}
        </>
    )
}