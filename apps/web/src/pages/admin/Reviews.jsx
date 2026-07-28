// src/pages/admin/Reviews.jsx
import { useState, useEffect } from 'react'
import Topbar from '../../components/admin/Topbar'
import { getAllReviewsAdmin, deleteReviewApi } from '../../api/reviewApi'

export default function Reviews() {
    const [reviews, setReviews] = useState([])
    const [loading, setLoading] = useState(true)
    const [search, setSearch] = useState('')

    const load = () => {
        setLoading(true)
        getAllReviewsAdmin().then(res => setReviews(res.data.data)).catch(console.error).finally(() => setLoading(false))
    }
    useEffect(() => { load() }, [])

    const handleDelete = async (id) => {
        if (!confirm('Xóa bình luận/đánh giá này? (Nếu là bình luận gốc, mọi trả lời bên dưới cũng bị xóa theo)')) return
        try {
            await deleteReviewApi(id)
            load()
        } catch (err) {
            alert(err.response?.data?.message || 'Xóa thất bại')
        }
    }

    const filtered = reviews.filter(r =>
        r.comment.toLowerCase().includes(search.toLowerCase()) ||
        r.user?.name?.toLowerCase().includes(search.toLowerCase()) ||
        r.product?.name?.toLowerCase().includes(search.toLowerCase())
    )

    return (
        <div className="inner">
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Nunito:wght@400;500;600;700;800&display=swap');
                .rv-input { background: #fff; border: 1.5px solid #E5E7EB; border-radius: 10px; padding: 9px 14px; font-size: 0.875rem; font-family: 'Nunito',sans-serif; outline: none; width: 100%; box-sizing: border-box; margin-bottom: 14px; }
                .rv-input:focus { border-color: #0057FF; }
                .rv-card { background: #fff; border: 1px solid #E5E7EB; border-radius: 12px; padding: 16px; margin-bottom: 10px; }
                .rv-head { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; margin-bottom: 8px; }
                .rv-product { font-size: 0.78rem; color: #0057FF; font-weight: 700; background: #EEF4FF; padding: 3px 10px; border-radius: 100px; }
                .rv-name { font-weight: 700; font-size: 0.85rem; color: #0A0A0A; }
                .rv-badge { font-size: 0.68rem; font-weight: 800; padding: 2px 8px; border-radius: 100px; }
                .rv-badge-admin { background: #0057FF; color: #fff; }
                .rv-badge-verified { background: #F0FDF4; color: #16A34A; border: 1px solid #BBF7D0; }
                .rv-badge-reply { background: #F3F4F6; color: #6B7280; }
                .rv-date { font-size: 0.72rem; color: #9CA3AF; margin-left: auto; }
                .rv-comment { font-size: 0.85rem; color: #374151; line-height: 1.55; margin-bottom: 10px; }
                .rv-del-btn { background: #FEF2F2; color: #EF4444; border: none; border-radius: 7px; padding: 6px 14px; font-size: 0.78rem; font-weight: 700; font-family: 'Nunito',sans-serif; cursor: pointer; transition: all 0.2s; }
                .rv-del-btn:hover { background: #EF4444; color: #fff; }
            `}</style>
            <Topbar title="Quản lý đánh giá & bình luận" />
            <div style={{ padding: '20px 24px' }}>
                <input className="rv-input" placeholder="Tìm theo tên khách, sản phẩm, nội dung..."
                    value={search} onChange={e => setSearch(e.target.value)} />

                {loading ? (
                    <p style={{ color: '#6B7280', textAlign: 'center', padding: 32 }}>Đang tải...</p>
                ) : filtered.length === 0 ? (
                    <p style={{ color: '#6B7280', textAlign: 'center', padding: 32 }}>Không có đánh giá/bình luận nào</p>
                ) : (
                    filtered.map(r => (
                        <div key={r._id} className="rv-card">
                            <div className="rv-head">
                                <span className="rv-product">{r.product?.name || 'Sản phẩm đã xóa'}</span>
                                <span className="rv-name">{r.user?.name || r.name}</span>
                                {r.role === 'admin' && <span className="rv-badge rv-badge-admin">Admin</span>}
                                {r.verifiedPurchase && <span className="rv-badge rv-badge-verified">Đã mua hàng</span>}
                                {r.parentId && <span className="rv-badge rv-badge-reply">Trả lời</span>}
                                {r.rating && <span style={{ fontSize: '0.8rem', color: '#F59E0B', fontWeight: 700 }}>{'★'.repeat(r.rating)}</span>}
                                <span className="rv-date">{new Date(r.createdAt).toLocaleString('vi-VN')}</span>
                            </div>
                            <div className="rv-comment">{r.comment}</div>
                            <button className="rv-del-btn" onClick={() => handleDelete(r._id)}>Xóa</button>
                        </div>
                    ))
                )}
            </div>
        </div>
    )
}