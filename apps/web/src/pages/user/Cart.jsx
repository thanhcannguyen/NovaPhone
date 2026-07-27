// src/pages/user/Cart.jsx — PHP style
import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useCart } from '../../context/CartContext'

export default function Cart() {
    const navigate = useNavigate()
    const { cart, loading, updateItem, removeItem, clearCart } = useCart()
    const items = cart?.items ?? []
    const totalAmount = cart?.totalAmount ?? 0
    useEffect(() => { window.scrollTo(0, 0) }, [])

    if (loading) return <div style={s.loading}>Đang tải giỏ hàng...</div>

    return (
        <div style={{ background: '#F8F9FB', minHeight: '100vh', fontFamily: 'Nunito, sans-serif' }}>
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Nunito:wght@400;500;600;700;800&display=swap');
                .cart-wrap { max-width: 1280px; margin: 0 auto; padding: 24px; display: grid; grid-template-columns: 1fr 360px; gap: 24px; align-items: start; }
                .cart-card { background: #fff; border: 1px solid #D1D5DB; border-radius: 16px; overflow: hidden; }
                .cart-header { display: flex; align-items: center; justify-content: space-between; padding: 18px 24px; border-bottom: 1px solid #E5E7EB; }
                .cart-title { font-size: 1.05rem; font-weight: 800; color: #0A0A0A; display: flex; align-items: center; gap: 8px; }
                .cart-title::before { content: ''; display: inline-block; width: 4px; height: 18px; background: #0057FF; border-radius: 2px; }
                .btn-clear { background: none; border: 1.5px solid #E5E7EB; border-radius: 8px; padding: 6px 14px; font-size: 0.8rem; font-weight: 600; color: #6B7280; cursor: pointer; font-family: 'Nunito',sans-serif; transition: all 0.2s; }
                .btn-clear:hover { border-color: #EF4444; color: #EF4444; }

                /* CSS Bảng tiêu đề & Item mới */
                .cart-table-head { display: grid; grid-template-columns: 1fr 130px 140px 130px; gap: 16px; padding: 12px 24px; background: #F8F9FB; border-bottom: 1px solid #E5E7EB; font-size: 0.75rem; font-weight: 700; color: #6B7280; text-transform: uppercase; letter-spacing: 0.4px; }
                .cart-table-head span:nth-child(2) { text-align: left; }
                .cart-table-head span:nth-child(3) { text-align: center; }
                .cart-table-head span:nth-child(4) { text-align: right; }

                .cart-item { display: grid; grid-template-columns: 1fr auto; gap: 16px; align-items: center; padding: 16px 24px; border-bottom: 1px solid #E5E7EB; transition: background 0.15s; }
                .cart-item:last-child { border-bottom: none; }
                .cart-item:hover { background: #FAFAFA; }

                .cart-item-product { display: flex; align-items: center; gap: 14px; min-width: 0; }
                .cart-item-img { width: 64px; height: 64px; border-radius: 10px; background: #F8F9FB; overflow: hidden; display: flex; align-items: center; justify-content: center; border: 1px solid #E5E7EB; flex-shrink: 0; }
                .cart-item-img img { width: 100%; height: 100%; object-fit: cover; }
                .cart-item-img:hover { opacity: 0.9; }
                .cart-item-brand { font-size: 0.65rem; font-weight: 700; color: #0057FF; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 3px; }
                .cart-item-name { font-weight: 700; font-size: 0.9rem; color: #0A0A0A; margin-bottom: 4px; line-height: 1.3; transition: color 0.15s; }
                .cart-item-name:hover { color: #0057FF; text-decoration: underline; }
                .btn-remove { background: none; border: none; color: #EF4444; cursor: pointer; font-size: 0.78rem; font-weight: 600; padding: 0; font-family: 'Nunito',sans-serif; }
                .btn-remove:hover { text-decoration: underline; }

                .cart-item-meta { display: grid; grid-template-columns: 130px 140px 130px; gap: 16px; align-items: center; }
                .cart-item-price-col { font-size: 0.9rem; font-weight: 700; color: #0A0A0A; }
                .cart-item-qty-col { display: flex; justify-content: center; }
                .cart-item-subtotal-col { font-size: 1rem; font-weight: 800; color: #0A0A0A; text-align: right; white-space: nowrap; }

                .qty-ctrl { display: flex; align-items: center; border: 1.5px solid #E5E7EB; border-radius: 8px; overflow: hidden; }
                .qty-ctrl button { width: 30px; height: 30px; background: #F8F9FB; border: none; cursor: pointer; font-size: 1rem; color: #0A0A0A; transition: background 0.15s; font-family: 'Nunito',sans-serif; }
                .qty-ctrl button:hover { background: #ddd; }
                .qty-ctrl span { width: 40px; height: 30px; border-left: 1.5px solid #E5E7EB; border-right: 1.5px solid #E5E7EB; text-align: center; font-size: 0.875rem; font-weight: 700; font-family: 'Nunito',sans-serif; line-height: 30px; display: block; }

                .summary-card { background: #fff; border: 1px solid #D1D5DB; border-radius: 16px; padding: 24px; position: sticky; top: 88px; }
                .summary-title { font-size: 1rem; font-weight: 800; color: #0A0A0A; margin-bottom: 20px; padding-bottom: 14px; border-bottom: 1px solid #E5E7EB; display: flex; align-items: center; gap: 8px; }
                .summary-title::before { content: ''; display: inline-block; width: 4px; height: 16px; background: #0057FF; border-radius: 2px; }
                .summary-row { display: flex; justify-content: space-between; align-items: center; font-size: 0.875rem; margin-bottom: 12px; }
                .summary-label { color: #6B7280; }
                .summary-value { font-weight: 700; color: #0A0A0A; }
                .summary-divider { height: 1px; background: #E5E7EB; margin: 16px 0; }
                .summary-total { display: flex; justify-content: space-between; align-items: center; font-size: 1rem; font-weight: 800; margin-bottom: 20px; }
                .summary-total .lbl { color: #0A0A0A; }
                .summary-total .val { color: #EF4444; font-size: 1.1rem; }
                .btn-checkout { display: block; width: 100%; padding: 13px; background: #0057FF; color: #fff; border: none; border-radius: 10px; font-size: 0.9rem; font-weight: 700; font-family: 'Nunito',sans-serif; cursor: pointer; text-align: center; text-decoration: none; transition: background 0.2s; margin-bottom: 10px; }
                .btn-checkout:hover { background: #0040CC; }
                .btn-continue { display: block; width: 100%; padding: 11px; background: #fff; color: #6B7280; border: 1.5px solid #E5E7EB; border-radius: 10px; font-size: 0.875rem; font-weight: 600; font-family: 'Nunito',sans-serif; cursor: pointer; text-align: center; transition: all 0.2s; }
                .btn-continue:hover { border-color: #0057FF; color: #0057FF; }
                .empty-cart { text-align: center; padding: 60px 20px; }
                .breadcrumb { background: #fff; border-bottom: 1px solid #E5E7EB; padding: 10px 0; font-size: 0.82rem; color: #6B7280; }
                .breadcrumb-inner { max-width: 1280px; margin: 0 auto; padding: 0 24px; }
                
                @media (max-width: 900px) {
                    .cart-wrap { grid-template-columns: 1fr; padding: 14px; }
                    .summary-card { position: static; }
                }

                /* Responsive Mobile cập nhật */
                @media (max-width: 600px) {
                    .cart-table-head { display: none; }
                    .cart-item { grid-template-columns: 1fr; row-gap: 10px; }
                    .cart-item-img { width: 52px; height: 52px; }
                    .cart-item-meta { grid-template-columns: 1fr auto; }
                    .cart-item-price-col { display: none; }
                }
            `}</style>

            {/* Breadcrumb */}
            <div className="breadcrumb">
                <div className="breadcrumb-inner">
                    <button onClick={() => navigate('/')} style={{ background: 'none', border: 'none', color: '#6B7280', cursor: 'pointer', fontFamily: 'Nunito,sans-serif', fontSize: '0.82rem', padding: 0 }}>Trang chủ</button>
                    <span style={{ margin: '0 6px', fontSize: '0.7rem' }}>›</span>
                    <strong style={{ color: '#0A0A0A' }}>Giỏ hàng</strong>
                </div>
            </div>

            <div className="cart-wrap">
                {items.length === 0 ? (
                    <div className="cart-card" style={{ gridColumn: '1/-1' }}>
                        <div className="empty-cart">
                            <div style={{ fontSize: '4rem', marginBottom: 16 }}>🛒</div>
                            <h3 style={{ fontWeight: 800, color: '#0A0A0A', marginBottom: 8 }}>Giỏ hàng trống!</h3>
                            <p style={{ color: '#6B7280', marginBottom: 24 }}>Bạn chưa có sản phẩm nào trong giỏ hàng.</p>
                            <button className="btn-checkout" style={{ width: 'auto', padding: '11px 28px', display: 'inline-block' }} onClick={() => navigate('/products')}>🛍️ Mua sắm ngay</button>
                        </div>
                    </div>
                ) : (
                    <>
                        {/* Cart items */}
                        <div>
                            <div className="cart-card">
                                <div className="cart-header">
                                    <div className="cart-title">Giỏ hàng ({items.reduce((s, i) => s + i.quantity, 0)} sản phẩm)</div>
                                    <button className="btn-clear" onClick={clearCart}>🗑️ Xóa tất cả</button>
                                </div>

                                {/* Hàng tiêu đề bảng */}
                                <div className="cart-table-head">
                                    <span>Thông tin sản phẩm</span>
                                    <span>Đơn giá</span>
                                    <span>Số lượng</span>
                                    <span>Thành tiền</span>
                                </div>

                                {items.map(item => {
                                    const product = item.product
                                    if (!product) return null
                                    const subtotal = item.price * item.quantity
                                    return (
                                        <div key={product._id} className="cart-item">
                                            <div className="cart-item-product">
                                                <div className="cart-item-img"
                                                    style={{ cursor: 'pointer' }}
                                                    onClick={() => navigate(`/product/${product._id}`)}>
                                                    <img src={product.image} alt={product.name}
                                                        onError={e => { e.target.src = 'https://placehold.co/80x80/F8F9FB/0057FF?text=📱' }} />
                                                </div>
                                                <div style={{ minWidth: 0 }}>
                                                    <div className="cart-item-brand">{product.specs?.brand || product.category?.name}</div>
                                                    <div className="cart-item-name"
                                                        style={{ cursor: 'pointer' }}
                                                        onClick={() => navigate(`/product/${product._id}`)}>
                                                        {product.name}
                                                    </div>
                                                    <button className="btn-remove" onClick={() => removeItem(product._id)}>Xóa</button>
                                                </div>
                                            </div>
                                            <div className="cart-item-meta">
                                                <div className="cart-item-price-col">{item.price.toLocaleString('vi-VN')}đ</div>
                                                <div className="cart-item-qty-col">
                                                    <div className="qty-ctrl">
                                                        <button onClick={() => updateItem(product._id, item.quantity - 1)}>−</button>
                                                        <span>{item.quantity}</span>
                                                        <button onClick={() => updateItem(product._id, item.quantity + 1)}>+</button>
                                                    </div>
                                                </div>
                                                <div className="cart-item-subtotal-col">{subtotal.toLocaleString('vi-VN')}đ</div>
                                            </div>
                                        </div>
                                    )
                                })}
                            </div>
                        </div>

                        {/* Summary */}
                        <div>
                            <div className="summary-card">
                                <div className="summary-title">Tóm tắt đơn hàng</div>
                                <div className="summary-row">
                                    <span className="summary-label">Số lượng sản phẩm</span>
                                    <span className="summary-value">{items.reduce((s, i) => s + i.quantity, 0)} món</span>
                                </div>
                                <div className="summary-row">
                                    <span className="summary-label">Tạm tính</span>
                                    <span className="summary-value">{totalAmount.toLocaleString('vi-VN')}đ</span>
                                </div>
                                <div className="summary-row">
                                    <span className="summary-label">Phí giao hàng</span>
                                    <span className="summary-value" style={{ color: '#16A34A' }}>Miễn phí</span>
                                </div>
                                <div className="summary-divider" />
                                <div className="summary-total">
                                    <span className="lbl">Tổng cộng</span>
                                    <span className="val">{totalAmount.toLocaleString('vi-VN')}đ</span>
                                </div>
                                <button className="btn-checkout" onClick={() => navigate('/checkout')}> Tiến hành thanh toán</button>
                                <button className="btn-continue" onClick={() => navigate('/products')}> Tiếp tục mua sắm</button>
                            </div>
                        </div>
                    </>
                )}
            </div>
        </div>
    )
}
const s = { loading: { textAlign: 'center', padding: 60, color: '#6B7280', fontFamily: 'Nunito,sans-serif' } }