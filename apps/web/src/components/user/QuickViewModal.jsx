import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { X, Minus, Plus, CheckCircle2 } from 'lucide-react'
import { useCart } from '../../context/CartContext'
import { useToast } from '../../context/ToastContext'

const SPEC_LABELS = {
    brand: 'Thương hiệu', chip: 'Chip xử lý', ram: 'RAM', storage: 'Bộ nhớ',
    screen: 'Màn hình', battery: 'Pin', camera: 'Camera', os: 'Hệ điều hành',
}

const ASSURANCES = [
    'Máy mới Fullbox 100% - Chưa Active - Chính hãng',
    'Được hỗ trợ 1 đổi 1 trong 30 ngày nếu có lỗi từ nhà sản xuất',
    'Bảo hành chính hãng 12 tháng',
]

export default function QuickViewModal({ product, onClose }) {
    const navigate = useNavigate()
    const { addToCart } = useCart()
    const { showToast } = useToast()
    const [qty, setQty] = useState(1)
    const [adding, setAdding] = useState(false)

    const images = [product.image, ...(product.images || [])].filter(Boolean)
    const [activeImg, setActiveImg] = useState(0)

    useEffect(() => {
        document.body.style.overflow = 'hidden'
        return () => { document.body.style.overflow = '' }
    }, [])

    useEffect(() => {
        const onKey = (e) => { if (e.key === 'Escape') onClose() }
        window.addEventListener('keydown', onKey)
        return () => window.removeEventListener('keydown', onKey)
    }, [onClose])

    const hasDiscount = product.originalPrice > product.price
    const pct = hasDiscount ? Math.round((1 - product.price / product.originalPrice) * 100) : 0
    const specs = product.specs || {}
    const specChips = Object.entries(SPEC_LABELS).filter(([key]) => specs[key])

    const handleAddToCart = async () => {
        setAdding(true)
        await addToCart(product._id, qty)
        setAdding(false)
        showToast({ type: 'success', title: 'Đã thêm vào giỏ hàng', message: `${qty} x ${product.name}` })
        onClose()
    }

    return (
        <div className="ps-qv-overlay" onClick={onClose}>
            <style>{`
                .ps-qv-overlay {
                    position: fixed; inset: 0; background: rgba(10,10,10,0.6);
                    z-index: 2500; display: flex; align-items: center; justify-content: center;
                    padding: 20px; animation: psQvFade 0.15s ease;
                }
                @keyframes psQvFade { from { opacity: 0 } to { opacity: 1 } }
                .ps-qv-modal {
                    background: #fff; border-radius: 18px; max-width: 900px; width: 100%;
                    max-height: 88vh; overflow-y: auto; position: relative;
                    display: grid; grid-template-columns: 1fr 1fr; gap: 0;
                    font-family: 'Nunito', sans-serif; animation: psQvUp 0.2s ease;
                }
                @keyframes psQvUp { from { opacity: 0; transform: translateY(10px) } to { opacity: 1; transform: none } }
                .ps-qv-close {
                    position: absolute; top: 14px; right: 14px; width: 34px; height: 34px;
                    border-radius: 50%; border: none; background: #F3F4F6; color: #0A0A0A;
                    display: flex; align-items: center; justify-content: center; cursor: pointer;
                    z-index: 5; transition: background 0.15s;
                }
                .ps-qv-close:hover { background: #E5E7EB; }
                .ps-qv-media { padding: 28px; background: #F8F9FB; display: flex; flex-direction: column; }
                .ps-qv-main-img { width: 100%; aspect-ratio: 1; object-fit: contain; background: #fff; border-radius: 14px; margin-bottom: 12px; }
                .ps-qv-thumbs { display: flex; gap: 8px; flex-wrap: wrap; }
                .ps-qv-thumb { width: 56px; height: 56px; border-radius: 8px; overflow: hidden; border: 2px solid transparent; cursor: pointer; background: #fff; }
                .ps-qv-thumb.active { border-color: #0057FF; }
                .ps-qv-thumb img { width: 100%; height: 100%; object-fit: contain; }
                .ps-qv-info { padding: 32px 28px 28px 20px; }
                .ps-qv-title { font-size: 1.3rem; font-weight: 800; color: #0A0A0A; margin: 0 0 10px; line-height: 1.3; padding-right: 30px; }
                .ps-qv-meta { font-size: 0.82rem; color: #6B7280; margin-bottom: 16px; }
                .ps-qv-meta b { color: #0A0A0A; }
                .ps-qv-price-row { display: flex; align-items: baseline; gap: 10px; margin-bottom: 16px; flex-wrap: wrap; }
                .ps-qv-price { font-size: 1.5rem; font-weight: 900; color: #EF4444; }
                .ps-qv-price-old { font-size: 0.95rem; color: #9CA3AF; text-decoration: line-through; }
                .ps-qv-pct { background: #FEE2E2; color: #EF4444; font-size: 0.72rem; font-weight: 800; padding: 2px 8px; border-radius: 6px; }
                .ps-qv-assurance { list-style: none; margin: 0 0 18px; padding: 0; display: flex; flex-direction: column; gap: 7px; }
                .ps-qv-assurance li { display: flex; gap: 8px; align-items: flex-start; font-size: 0.83rem; color: #374151; line-height: 1.4; }
                .ps-qv-specs { display: flex; flex-wrap: wrap; gap: 6px; margin-bottom: 20px; }
                .ps-qv-spec-chip { background: #F8F9FB; border: 1px solid #E5E7EB; border-radius: 7px; padding: 4px 10px; font-size: 0.72rem; color: #4B5563; }
                .ps-qv-spec-chip b { color: #0A0A0A; }
                .ps-qv-actions { display: flex; align-items: center; gap: 12px; }
                .ps-qv-qty { display: flex; align-items: center; border: 1.5px solid #E5E7EB; border-radius: 10px; overflow: hidden; flex-shrink: 0; }
                .ps-qv-qty button { width: 36px; height: 40px; border: none; background: #F8F9FB; color: #0A0A0A; cursor: pointer; display: flex; align-items: center; justify-content: center; }
                .ps-qv-qty button:hover { background: #EEF4FF; color: #0057FF; }
                .ps-qv-qty input { width: 42px; height: 40px; border: none; border-left: 1.5px solid #E5E7EB; border-right: 1.5px solid #E5E7EB; text-align: center; font-weight: 700; font-family: 'Nunito',sans-serif; outline: none; }
                .ps-qv-add-btn { flex: 1; height: 40px; border-radius: 10px; border: none; background: #0057FF; color: #fff; font-weight: 700; font-size: 0.85rem; cursor: pointer; letter-spacing: 0.3px; font-family: 'Nunito',sans-serif; transition: background 0.2s; }
                .ps-qv-add-btn:hover { background: #0040CC; }
                .ps-qv-add-btn:disabled { background: #93B8FF; cursor: not-allowed; }
                .ps-qv-detail-link { display: block; text-align: center; margin-top: 12px; font-size: 0.8rem; color: #0057FF; font-weight: 700; cursor: pointer; background: none; border: none; width: 100%; font-family: 'Nunito',sans-serif; }
                .ps-qv-detail-link:hover { text-decoration: underline; }

                @media (max-width: 720px) {
                    .ps-qv-modal { grid-template-columns: 1fr; max-height: 92vh; }
                    .ps-qv-info { padding: 20px; }
                }
            `}</style>

            <div className="ps-qv-modal" onClick={e => e.stopPropagation()}>
                <button className="ps-qv-close" onClick={onClose}><X size={18} /></button>

                <div className="ps-qv-media">
                    <img className="ps-qv-main-img" src={images[activeImg]} alt={product.name}
                        onError={e => { e.target.src = 'https://placehold.co/400x400/F8F9FB/0057FF?text=📱' }} />
                    {images.length > 1 && (
                        <div className="ps-qv-thumbs">
                            {images.map((img, i) => (
                                <div key={i} className={`ps-qv-thumb${i === activeImg ? ' active' : ''}`} onClick={() => setActiveImg(i)}>
                                    <img src={img} alt="" onError={e => { e.target.style.display = 'none' }} />
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                <div className="ps-qv-info">
                    <h2 className="ps-qv-title">{product.name}</h2>
                    <div className="ps-qv-meta">
                        {specs.brand && <>Thương hiệu: <b>{specs.brand}</b> &nbsp;|&nbsp; </>}
                        Mã sản phẩm: <b>{product._id.slice(-8).toUpperCase()}</b>
                    </div>

                    <div className="ps-qv-price-row">
                        <span className="ps-qv-price">{product.price.toLocaleString('vi-VN')}đ</span>
                        {hasDiscount && <span className="ps-qv-price-old">{product.originalPrice.toLocaleString('vi-VN')}đ</span>}
                        {hasDiscount && <span className="ps-qv-pct">-{pct}%</span>}
                    </div>

                    <ul className="ps-qv-assurance">
                        {ASSURANCES.map((a, i) => (
                            <li key={i}><CheckCircle2 size={16} color="#10B981" style={{ flexShrink: 0, marginTop: 1 }} />{a}</li>
                        ))}
                    </ul>

                    {specChips.length > 0 && (
                        <div className="ps-qv-specs">
                            {specChips.map(([key, label]) => (
                                <span key={key} className="ps-qv-spec-chip">{label}: <b>{specs[key]}</b></span>
                            ))}
                        </div>
                    )}

                    <div className="ps-qv-actions">
                        <div className="ps-qv-qty">
                            <button onClick={() => setQty(q => Math.max(1, q - 1))}><Minus size={14} /></button>
                            <input value={qty} readOnly />
                            <button onClick={() => setQty(q => Math.min(product.stock || 99, q + 1))}><Plus size={14} /></button>
                        </div>
                        <button className="ps-qv-add-btn" onClick={handleAddToCart} disabled={adding || product.stock === 0}>
                            {product.stock === 0 ? 'HẾT HÀNG' : adding ? 'ĐANG THÊM...' : 'THÊM VÀO GIỎ HÀNG'}
                        </button>
                    </div>

                    <button className="ps-qv-detail-link" onClick={() => { onClose(); navigate(`/product/${product._id}`) }}>
                        Xem chi tiết sản phẩm →
                    </button>
                </div>
            </div>
        </div>
    )
}