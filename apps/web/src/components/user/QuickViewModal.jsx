import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { X, Minus, Plus, CheckCircle2 } from 'lucide-react'
import { useCart } from '../../context/CartContext'
import { useToast } from '../../context/ToastContext'

const ASSURANCES = [
    'Máy mới Fullbox 100% - Chưa Active - Chính hãng',
    'Được hỗ trợ 1 đổi 1 trong 30 ngày nếu có lỗi từ nhà sản xuất',
    'Bảo hành chính hãng 12 tháng',
]

export default function QuickViewModal({ product, onClose }) {
    const navigate = useNavigate()
    const { addToCart, cartCount } = useCart()
    const { showToast } = useToast()
    const [qty, setQty] = useState(1)
    const [adding, setAdding] = useState(false)
    const [added, setAdded] = useState(false)

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

    const goToDetail = () => { onClose(); navigate(`/product/${product._id}`) }

    const handleAddToCart = async () => {
        setAdding(true)
        try {
            await addToCart(product._id, qty)
            setAdded(true)
        } catch {
            showToast({ type: 'error', title: 'Không thể thêm vào giỏ', message: 'Vui lòng thử lại.' })
        } finally {
            setAdding(false)
        }
    }

    const goToCheckout = () => { onClose(); navigate('/checkout') }

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
                .ps-qv-title-link { cursor: pointer; transition: color 0.15s; display: inline-block; }
                .ps-qv-title-link:hover { color: #0057FF; }
                .ps-qv-meta { font-size: 0.82rem; color: #6B7280; margin-bottom: 16px; }
                .ps-qv-meta b { color: #0A0A0A; }
                .ps-qv-price-row { display: flex; align-items: baseline; gap: 10px; margin-bottom: 16px; flex-wrap: wrap; }
                .ps-qv-price { font-size: 1.5rem; font-weight: 900; color: #EF4444; }
                .ps-qv-price-old { font-size: 0.95rem; color: #9CA3AF; text-decoration: line-through; }
                .ps-qv-pct { background: #FEE2E2; color: #EF4444; font-size: 0.72rem; font-weight: 800; padding: 2px 8px; border-radius: 6px; }
                .ps-qv-assurance { list-style: none; margin: 0 0 22px; padding: 0; display: flex; flex-direction: column; gap: 7px; }
                .ps-qv-assurance li { display: flex; gap: 8px; align-items: flex-start; font-size: 0.83rem; color: #374151; line-height: 1.4; }
                .ps-qv-actions { display: flex; align-items: center; gap: 12px; }
                .ps-qv-qty { display: flex; align-items: center; border: 1.5px solid #E5E7EB; border-radius: 10px; overflow: hidden; flex-shrink: 0; }
                .ps-qv-qty button { width: 36px; height: 40px; border: none; background: #F8F9FB; color: #0A0A0A; cursor: pointer; display: flex; align-items: center; justify-content: center; }
                .ps-qv-qty button:hover { background: #EEF4FF; color: #0057FF; }
                .ps-qv-qty input { width: 42px; height: 40px; border: none; border-left: 1.5px solid #E5E7EB; border-right: 1.5px solid #E5E7EB; text-align: center; font-weight: 700; font-family: 'Nunito',sans-serif; outline: none; }
                .ps-qv-add-btn { flex: 1; height: 40px; border-radius: 10px; border: none; background: #0057FF; color: #fff; font-weight: 700; font-size: 0.85rem; cursor: pointer; letter-spacing: 0.3px; font-family: 'Nunito',sans-serif; transition: background 0.2s; }
                .ps-qv-add-btn:hover { background: #0040CC; }
                .ps-qv-add-btn:disabled { background: #93B8FF; cursor: not-allowed; }

                /* Modal "Thêm vào giỏ hàng thành công" — hiện thay cho modal xem nhanh sau khi thêm thành công */
                .ps-qv-modal.ps-qv-success { grid-template-columns: 1fr; max-width: 420px; }
                .ps-success-body { padding: 32px 28px 28px; text-align: center; }
                .ps-success-header { display: flex; align-items: center; justify-content: center; gap: 8px; margin-bottom: 20px; }
                .ps-success-title { font-size: 1.05rem; font-weight: 800; color: #0A0A0A; margin: 0; line-height: 1.3; }
                .ps-success-product { display: flex; align-items: center; gap: 12px; text-align: left; background: #F8F9FB; border-radius: 12px; padding: 12px; margin-bottom: 14px; }
                .ps-success-product img { width: 54px; height: 54px; object-fit: contain; border-radius: 8px; background: #fff; flex-shrink: 0; }
                .ps-success-name { font-weight: 700; font-size: 0.88rem; color: #0A0A0A; line-height: 1.35; }
                .ps-success-price { font-weight: 800; color: #EF4444; font-size: 0.9rem; margin-top: 4px; }
                .ps-success-cartcount { font-size: 0.85rem; color: #6B7280; margin-bottom: 20px; }
                .ps-success-cartcount b { color: #0A0A0A; }
                .ps-success-actions { display: flex; gap: 10px; }
                .ps-success-btn { flex: 1; height: 42px; border-radius: 10px; font-weight: 700; font-size: 0.85rem; cursor: pointer; font-family: 'Nunito',sans-serif; transition: all 0.15s; }
                .ps-success-btn-outline { background: #fff; border: 1.5px solid #E5E7EB; color: #0A0A0A; }
                .ps-success-btn-outline:hover { border-color: #9CA3AF; }
                .ps-success-btn-solid { background: #0057FF; border: none; color: #fff; }
                .ps-success-btn-solid:hover { background: #0040CC; }

                @media (max-width: 720px) {
                    .ps-qv-modal { grid-template-columns: 1fr; max-height: 92vh; }
                    .ps-qv-info { padding: 20px; }
                }
            `}</style>

            {added ? (
                <div className="ps-qv-modal ps-qv-success" onClick={e => e.stopPropagation()}>
                    <button className="ps-qv-close" onClick={onClose}><X size={18} /></button>
                    <div className="ps-success-body">
                        <div className="ps-success-header">
                            <CheckCircle2 size={22} color="#10B981" />
                            <h2 className="ps-success-title">Thêm vào giỏ hàng thành công</h2>
                        </div>
                        <div className="ps-success-product">
                            <img src={product.image} alt={product.name}
                                onError={e => { e.target.src = 'https://placehold.co/100x100/F8F9FB/0057FF?text=📱' }} />
                            <div>
                                <div className="ps-success-name">{product.name}</div>
                                <div className="ps-success-price">{product.price.toLocaleString('vi-VN')}đ</div>
                            </div>
                        </div>
                        <div className="ps-success-cartcount">Giỏ hàng của bạn hiện có <b>{cartCount}</b> sản phẩm</div>
                        <div className="ps-success-actions">
                            <button className="ps-success-btn ps-success-btn-outline" onClick={onClose}>Tiếp tục mua hàng</button>
                            <button className="ps-success-btn ps-success-btn-solid" onClick={goToCheckout}>Thanh toán ngay</button>
                        </div>
                    </div>
                </div>
            ) : (
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
                        <h2 className="ps-qv-title ps-qv-title-link" onClick={goToDetail}>{product.name}</h2>
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
                    </div>
                </div>
            )}
        </div>
    )
}