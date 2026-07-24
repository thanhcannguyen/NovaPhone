// src/pages/admin/Categories.jsx
import { useState, useEffect } from 'react'
import Topbar from '../../components/admin/Topbar'
import Pagination from '../../components/admin/Pagination'
import { getCategories, createCategory, updateCategory, deleteCategory } from '../../api/categoryApi'

// ITEMS_PER_PAGE handled dynamically in component

function useIsMobile() {
    const [isMobile, setIsMobile] = useState(window.innerWidth <= 768)
    useEffect(() => {
        const h = () => setIsMobile(window.innerWidth <= 768)
        window.addEventListener('resize', h)
        return () => window.removeEventListener('resize', h)
    }, [])
    return isMobile
}

export default function Categories() {
    const isMobile = useIsMobile()
    const [categories, setCategories] = useState([])
    const [loading, setLoading] = useState(true)
    const [form, setForm] = useState({ name: '', description: '' })
    const [editId, setEditId] = useState(null)
    const [error, setError] = useState('')
    const [success, setSuccess] = useState('')
    const [currentPage, setCurrentPage] = useState(1)
    const [showForm, setShowForm] = useState(false)

    const fetchData = () => {
        setLoading(true)
        getCategories().then(res => setCategories(res.data.data)).catch(console.error).finally(() => setLoading(false))
    }
    useEffect(() => { fetchData() }, [])
    useEffect(() => { setCurrentPage(1) }, [categories.length])

    const itemsPerPage = isMobile ? 4 : 6
    const totalPages = Math.ceil(categories.length / itemsPerPage)
    const paginated = categories.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)

    const handleSubmit = async (e) => {
        e.preventDefault(); setError(''); setSuccess('')
        try {
            if (editId) { await updateCategory(editId, form); setSuccess('Cập nhật danh mục thành công') }
            else { await createCategory(form); setSuccess('Tạo danh mục thành công') }
            setForm({ name: '', description: '' }); setEditId(null); setShowForm(false); fetchData()
        } catch (err) { setError(err.response?.data?.message || 'Có lỗi xảy ra') }
    }

    const handleEdit = (cat) => {
        setEditId(cat._id); setForm({ name: cat.name, description: cat.description })
        setError(''); setSuccess(''); setShowForm(true)
    }

    const handleDelete = async (id) => {
        if (!window.confirm('Ẩn danh mục này?')) return
        try { await deleteCategory(id); setSuccess('Đã ẩn danh mục'); fetchData() }
        catch (err) { setError(err.response?.data?.message || 'Có lỗi xảy ra') }
    }

    const FormCard = (
        <div style={s.formCard}>
            <h3 style={s.formTitle}>{editId ? '✏️ Chỉnh sửa' : '➕ Thêm danh mục mới'}</h3>
            {error && <div style={s.alertErr}>{error}</div>}
            {success && <div style={s.alertOk}>{success}</div>}
            <form onSubmit={handleSubmit}>
                <label style={s.label}>Tên danh mục</label>
                <input className='admin-input' style={{ marginBottom: 14 }} value={form.name}
                    onChange={e => setForm({ ...form, name: e.target.value })} placeholder='VD: Samsung, Apple, Xiaomi...' required />
                <label style={s.label}>Mô tả</label>
                <textarea className='admin-input' style={{ height: 80, resize: 'vertical', marginBottom: 16 }}
                    value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} placeholder='Mô tả ngắn về danh mục' />
                <button type='submit' className='admin-btn-primary'
                    style={{ width: '100%', justifyContent: 'center', textAlign: 'center' }}>
                    {editId ? 'Cập nhật' : 'Tạo danh mục'}
                </button>
                {editId && (
                    <button type='button' className='admin-btn-secondary'
                        onClick={() => { setEditId(null); setForm({ name: '', description: '' }); setError(''); setSuccess(''); setShowForm(false) }}>Hủy</button>
                )}
            </form>
        </div>
    )

    return (
        <>
            <style>{`
            @import url('https://fonts.googleapis.com/css2?family=Nunito:wght@400;500;600;700;800&display=swap');
            .admin-table { width: 100%; border-collapse: collapse; font-family: 'Nunito',sans-serif; }
            .admin-table th { padding: 10px 16px; text-align: left; font-size: 0.72rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; color: #6B7280; background: #F8F9FB; border-bottom: 1px solid #E5E7EB; white-space: nowrap; }
            .admin-table td { padding: 12px 16px; font-size: 0.85rem; border-bottom: 1px solid #F9FAFB; vertical-align: middle; }
            .admin-table tr:last-child td { border-bottom: none; }
            .admin-table tr:hover td { background: #FAFAFA; }
            .admin-search-input { background: #fff; border: 1.5px solid #E5E7EB; border-radius: 10px; padding: 9px 14px; font-size: 0.875rem; font-family: 'Nunito',sans-serif; outline: none; min-width: 200px; transition: border-color 0.2s; }
            .admin-search-input:focus { border-color: #0057FF; }
            .admin-filter-select { background: #fff; border: 1.5px solid #E5E7EB; border-radius: 10px; padding: 9px 12px; font-size: 0.875rem; font-family: 'Nunito',sans-serif; outline: none; cursor: pointer; }
            .admin-input { width: 100%; background: #F8F9FB; border: 1.5px solid #E5E7EB; border-radius: 10px; padding: 10px 14px; font-size: 0.875rem; font-family: 'Nunito',sans-serif; color: #0A0A0A; outline: none; transition: border-color 0.2s; }
            .admin-input:focus { border-color: #0057FF; background: #fff; }
            .admin-btn-primary { background: #0057FF; color: #fff; border: none; border-radius: 10px; padding: 9px 18px; font-size: 0.875rem; font-weight: 700; font-family: 'Nunito',sans-serif; cursor: pointer; transition: background 0.2s; display: inline-flex; align-items: center; gap: 6px; }
            .admin-btn-primary:hover { background: #0040CC; }
            .admin-btn-primary:disabled { opacity: 0.7; cursor: default; }
            .admin-btn-secondary { background: #fff; color: #6B7280; border: 1.5px solid #E5E7EB; border-radius: 10px; padding: 9px 16px; font-size: 0.875rem; font-weight: 600; font-family: 'Nunito',sans-serif; cursor: pointer; transition: all 0.2s; }
            .admin-btn-secondary:hover { border-color: #0057FF; color: #0057FF; }
            .admin-btn-edit { background: #EEF4FF; color: #0057FF; border: none; border-radius: 7px; padding: 6px 12px; font-size: 0.78rem; font-weight: 700; font-family: 'Nunito',sans-serif; cursor: pointer; margin-right: 4px; transition: all 0.2s; }
            .admin-btn-edit:hover { background: #0057FF; color: #fff; }
            .admin-btn-del { background: #FEF2F2; color: #EF4444; border: none; border-radius: 7px; padding: 6px 12px; font-size: 0.78rem; font-weight: 700; font-family: 'Nunito',sans-serif; cursor: pointer; transition: all 0.2s; }
            .admin-btn-del:hover { background: #EF4444; color: #fff; }
            .filter-tab { display: inline-flex; align-items: center; gap: 6px; padding: 7px 14px; border-radius: 100px; font-size: 0.82rem; font-weight: 700; border: 1.5px solid #E5E7EB; color: #6B7280; background: #fff; cursor: pointer; transition: all 0.2s; font-family: 'Nunito',sans-serif; }
            .filter-tab:hover { border-color: #0057FF; color: #0057FF; }
            .filter-tab.active { background: #0057FF; border-color: #0057FF; color: #fff; }
            /* Responsive */
            @media (max-width: 768px) {
                .admin-search-input { width: 100%; min-width: unset; }
                .admin-filter-select { width: 100%; }
                .admin-table th:nth-child(4), .admin-table td:nth-child(4),
                .admin-table th:nth-child(5), .admin-table td:nth-child(5),
                .admin-table th:nth-child(7), .admin-table td:nth-child(7) { display: none; }
            }
            @media (max-width: 480px) {
                .admin-table th:nth-child(3), .admin-table td:nth-child(3) { display: none; }
            }
        `}</style>
            <div className="inner">
                <Topbar title='Quản lý hãng' subtitle='Thêm, chỉnh sửa và ẩn các hãng điện thoại' />
                <div style={{ padding: '20px 24px' }}>

                    {/* Mobile: toggle form button */}
                    {isMobile && !showForm && (
                        <button className='admin-btn-primary' style={{ marginBottom: 14, width: '100%' }}
                            onClick={() => setShowForm(true)}>➕ Thêm danh mục mới</button>
                    )}
                    {isMobile && showForm && FormCard}

                    <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '280px 1fr', gap: 20 }}>
                        {/* Desktop form */}
                        {!isMobile && FormCard}

                        {/* Table / Cards */}
                        <div style={s.tableCard}>
                            <h3 style={s.tableTitle}>Danh sách danh mục ({categories.length})</h3>
                            {loading ? <p style={s.muted}>Đang tải...</p> : categories.length === 0 ? <p style={s.muted}>Chưa có danh mục</p> : (
                                <>
                                    {isMobile ? (
                                        // Mobile: card list
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                                            {paginated.map(cat => (
                                                <div key={cat._id} style={s.mobileCard}>
                                                    <div style={{ flex: 1 }}>
                                                        <div style={{ fontWeight: 600, fontSize: 14, color: '#0A0A0A', marginBottom: 4 }}>{cat.name}</div>
                                                        <div style={{ fontSize: 12, color: '#6B7280', marginBottom: 6 }}>{cat.description || '—'}</div>
                                                        <span style={cat.isActive ? s.badgeGreen : s.badgeGray}>{cat.isActive ? 'Đang hoạt động' : 'Đã ẩn'}</span>
                                                    </div>
                                                    <div style={{ display: 'flex', flexDirection: 'column', gap: 6, flexShrink: 0 }}>
                                                        <button className='admin-btn-edit' onClick={() => handleEdit(cat)}>Sửa</button>
                                                        {cat.isActive && <button className='admin-btn-del' onClick={() => handleDelete(cat._id)}>Ẩn</button>}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        // Desktop: table
                                        <table style={s.table}>
                                            <thead>
                                                <tr style={s.thead}>
                                                    <th style={{ ...s.th, textAlign: 'center' }}>Tên danh mục</th>
                                                    <th style={{ ...s.th, textAlign: 'center' }}>Mô tả</th>
                                                    <th style={{ ...s.th, textAlign: 'center' }}>Trạng thái</th>
                                                    <th style={{ ...s.th, textAlign: 'center' }}>Thao tác</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {paginated.map(cat => (
                                                    <tr key={cat._id} className='admin-tr'>
                                                        <td style={{ ...s.td, fontWeight: 600, textAlign: 'center' }}>{cat.name}</td>
                                                        <td style={{ ...s.td, textAlign: 'center' }}>{cat.description || '—'}</td>
                                                        <td style={{ ...s.td, textAlign: 'center' }}>
                                                            <span style={cat.isActive ? s.badgeGreen : s.badgeGray}>{cat.isActive ? 'Đang hoạt động' : 'Đã ẩn'}</span>
                                                        </td>
                                                        <td style={{ ...s.td, textAlign: 'center' }}>
                                                            <button className='admin-btn-edit' onClick={() => handleEdit(cat)}>Sửa</button>
                                                            {cat.isActive && <button className='admin-btn-del' onClick={() => handleDelete(cat._id)}>Ẩn</button>}
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    )}
                                    <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}

const s = {
    formCard: { background: '#fff', borderRadius: 12, border: '1px solid #E5E7EB', padding: 20, marginBottom: 14 },
    tableCard: { background: '#fff', borderRadius: 12, border: '1px solid #E5E7EB', padding: 20 },
    formTitle: { fontSize: 15, fontWeight: 700, color: '#0A0A0A', margin: '0 0 16px', textAlign: 'center' },
    tableTitle: { fontSize: 15, fontWeight: 700, color: '#0A0A0A', margin: '0 0 16px', textAlign: 'center' },
    label: { display: 'block', fontSize: 11, fontWeight: 700, color: '#5a3e2b', marginBottom: 6, textTransform: 'uppercase', letterSpacing: 0.7 },
    alertErr: { background: '#fde8e8', color: '#DC2626', padding: '10px 12px', borderRadius: 8, fontSize: 12, marginBottom: 14 },
    alertOk: { background: '#e7f8ec', color: '#15803D', padding: '10px 12px', borderRadius: 8, fontSize: 12, marginBottom: 14 },
    table: { width: '100%', borderCollapse: 'collapse' },
    thead: { background: '#F8F9FB' },
    th: { padding: '11px 14px', fontSize: 11, fontWeight: 700, color: '#5a3e2b', borderBottom: '2px solid #E5E7EB', textTransform: 'uppercase', letterSpacing: 0.7 },
    td: { padding: '12px 14px', fontSize: 13, color: '#0A0A0A', verticalAlign: 'middle', borderBottom: '1px solid #F8F9FB' },
    mobileCard: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', background: '#F8F9FB', borderRadius: 10, border: '1px solid #E5E7EB', padding: '12px 14px', gap: 10 },
    badgeGreen: { background: '#e7f8ec', color: '#15803D', padding: '3px 10px', borderRadius: 20, fontSize: 11 },
    badgeGray: { background: '#f0f0f0', color: '#888', padding: '3px 10px', borderRadius: 20, fontSize: 11 },
    muted: { color: '#6B7280', fontSize: 13 },
}