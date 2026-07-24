import { useState, useEffect } from 'react'
import Topbar from '../../components/admin/Topbar'
import Pagination from '../../components/admin/Pagination'
import { getAllProductsAdmin, createProduct, updateProduct } from '../../api/productApi'
import { getCategories } from '../../api/categoryApi'

const EMPTY_FORM = {
    name: '', description: '', price: '', originalPrice: '', image: '', category: '', stock: '',
    specs: { brand: '', chip: '', ram: '', storage: '', screen: '', camera: '', battery: '', os: '' }
}
const ITEMS_PER_PAGE = 8

export default function AdminProducts() {
    const [products, setProducts] = useState([])
    const [categories, setCategories] = useState([])
    const [loading, setLoading] = useState(true)
    const [form, setForm] = useState(EMPTY_FORM)
    const [editId, setEditId] = useState(null)
    const [panelOpen, setPanelOpen] = useState(false)
    const [search, setSearch] = useState('')
    const [filterCat, setFilterCat] = useState('all')
    const [currentPage, setCurrentPage] = useState(1)
    const [msg, setMsg] = useState({ type: '', text: '' })
    const [saving, setSaving] = useState(false)
    const [dropOpen, setDropOpen] = useState(false)

    const showMsg = (type, text) => {
        setMsg({ type, text })
        setTimeout(() => setMsg({ type: '', text: '' }), 3000)
    }

    const loadData = () => {
        setLoading(true)
        Promise.all([getAllProductsAdmin(), getCategories()])
            .then(([pRes, cRes]) => {
                setProducts(pRes.data.data)
                setCategories(cRes.data.data)
            })
            .catch(() => showMsg('error', 'Không thể tải dữ liệu'))
            .finally(() => setLoading(false))
    }

    useEffect(() => { loadData() }, [])

    const openAdd = () => { setForm(EMPTY_FORM); setEditId(null); setPanelOpen(true) }
    const openEdit = (p) => {
        setForm({
            name: p.name, description: p.description || '',
            price: p.price, originalPrice: p.originalPrice || '',
            image: p.image, category: p.category?._id || '',
            stock: p.stock || 0,
            specs: {
                brand: p.specs?.brand || '', chip: p.specs?.chip || '',
                ram: p.specs?.ram || '', storage: p.specs?.storage || '',
                screen: p.specs?.screen || '', camera: p.specs?.camera || '',
                battery: p.specs?.battery || '', os: p.specs?.os || ''
            }
        })
        setEditId(p._id)
        setPanelOpen(true)
    }

    const handleChange = (e) => setForm(f => ({ ...f, [e.target.name]: e.target.value }))
    const handleSpecChange = (e) => setForm(f => ({ ...f, specs: { ...f.specs, [e.target.name]: e.target.value } }))

    const handleSubmit = async () => {
        if (!form.name || !form.price || !form.image || !form.category)
            return showMsg('error', 'Vui lòng điền tên, giá, ảnh và hãng')
        setSaving(true)
        const payload = {
            ...form,
            price: Number(form.price),
            originalPrice: Number(form.originalPrice) || 0,
            stock: Number(form.stock) || 0
        }
        try {
            if (editId) {
                await updateProduct(editId, payload)
                showMsg('success', 'Cập nhật sản phẩm thành công')
            } else {
                await createProduct(payload)
                showMsg('success', 'Thêm sản phẩm thành công')
            }
            setPanelOpen(false)
            loadData()
        } catch (err) {
            showMsg('error', err.response?.data?.message || 'Lỗi thao tác')
        } finally {
            setSaving(false)
        }
    }

    const handleToggle = async (p) => {
        try {
            await updateProduct(p._id, { isAvailable: !p.isAvailable })
            showMsg('success', p.isAvailable ? 'Đã ẩn sản phẩm' : 'Đã hiện sản phẩm')
            loadData()
        } catch {
            showMsg('error', 'Lỗi cập nhật')
        }
    }

    const filtered = products.filter(p => {
        const q = search.toLowerCase()
        const matchSearch = p.name.toLowerCase().includes(q) ||
            (p.specs?.brand || '').toLowerCase().includes(q)
        const matchCat = filterCat === 'all' || p.category?._id === filterCat
        return matchSearch && matchCat
    })

    const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE)
    const paginated = filtered.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE)

    return (
        <>
            <style>{`
            @import url('https://fonts.googleapis.com/css2?family=Nunito:wght@400;500;600;700;800&display=swap');
            * { box-sizing: border-box; }

            /* ── Toolbar ── */
            .ap-toolbar {
                display: flex; gap: 10px;
                margin-bottom: 16px; align-items: stretch; flex-wrap: nowrap;
            }
            .ap-search {
                flex: 1; min-width: 0;
                background: #fff; border: 1.5px solid #E5E7EB;
                border-radius: 10px; padding: 9px 12px 9px 36px;
                font-size: 0.85rem; font-family: 'Nunito',sans-serif;
                color: #0A0A0A; outline: none;
                transition: border-color 0.2s;
                width: 100%;
            }
            .ap-search:focus { border-color: #0057FF; }
            .ap-search-wrap { position: relative; flex: 1; min-width: 0; }
            .ap-search-icon {
                position: absolute; left: 11px; top: 50%;
                transform: translateY(-50%);
                font-size: 13px; pointer-events: none; color: #9CA3AF;
            }
            .ap-select {
                background: #fff; border: 1.5px solid #E5E7EB;
                border-radius: 10px; padding: 9px 10px;
                font-size: 0.82rem; font-family: 'Nunito',sans-serif;
                outline: none; cursor: pointer; color: #0A0A0A;
                max-width: 140px; width: 140px; flex-shrink: 0;
            }
            .ap-select:focus { border-color: #0057FF; }

            /* Custom dropdown — giống ảnh mẫu */
            .ap-drop { position: relative; flex-shrink: 0; }
            .ap-drop-btn {
                display: flex; align-items: center; justify-content: space-between;
                gap: 8px; width: 140px;
                background: #fff; border: 1.5px solid #E5E7EB;
                border-radius: 10px; padding: 9px 12px;
                font-size: 0.82rem; font-family: 'Nunito',sans-serif;
                font-weight: 600; color: #0A0A0A;
                cursor: pointer; outline: none; text-align: left;
                transition: border-color 0.2s;
            }
            .ap-drop-btn.open { border-color: #0057FF; }
            .ap-drop-arrow { font-size: 10px; color: #6B7280; flex-shrink: 0; transition: transform 0.2s; }
            .ap-drop-btn.open .ap-drop-arrow { transform: rotate(180deg); }
            .ap-drop-menu {
                position: absolute; top: calc(100% + 6px); left: 0;
                background: #fff; border: 1px solid #E5E7EB;
                border-radius: 10px; box-shadow: 0 8px 24px rgba(0,0,0,0.1);
                z-index: 999; min-width: 100%; width: max-content; max-width: 200px;
                overflow: hidden;
                animation: dropFade 0.15s ease;
            }
            @keyframes dropFade {
                from { opacity: 0; transform: translateY(-4px); }
                to   { opacity: 1; transform: translateY(0); }
            }
            .ap-drop-item {
                display: block; width: 100%;
                padding: 9px 14px; text-align: left;
                font-size: 0.85rem; font-family: 'Nunito',sans-serif;
                font-weight: 500; color: #0A0A0A;
                background: none; border: none; cursor: pointer;
                transition: background 0.12s;
                white-space: nowrap;
            }
            .ap-drop-item:hover { background: #F8F9FB; }
            .ap-drop-item.active { background: #EEF4FF; color: #0057FF; font-weight: 700; }
            .ap-add-btn {
                background: #0057FF; color: #fff; border: none;
                border-radius: 10px; padding: 9px 14px;
                font-size: 0.82rem; font-weight: 700;
                font-family: 'Nunito',sans-serif; cursor: pointer;
                white-space: nowrap; flex-shrink: 0;
                transition: background 0.2s;
            }
            .ap-add-btn:hover { background: #0040CC; }

            /* ── Desktop Table ── */
            .ap-table-wrap { display: block; }
            .ap-table {
                width: 100%; border-collapse: collapse;
                font-family: 'Nunito',sans-serif;
            }
            .ap-table th {
                padding: 10px 14px; text-align: left;
                font-size: 0.7rem; font-weight: 700;
                text-transform: uppercase; letter-spacing: 0.5px;
                color: #6B7280; background: #F8F9FB;
                border-bottom: 1px solid #E5E7EB; white-space: nowrap;
            }
            .ap-table td {
                padding: 11px 14px; font-size: 0.83rem;
                border-bottom: 1px solid #F9FAFB; vertical-align: middle;
                color: #0A0A0A;
            }
            .ap-table tr:last-child td { border-bottom: none; }
            .ap-table tr:hover td { background: #FAFAFA; }

            /* ── Mobile Card List ── */
            .ap-card-list { display: none; flex-direction: column; gap: 10px; }
            .ap-card {
                background: #fff; border: 1px solid #E5E7EB;
                border-radius: 12px; padding: 12px 14px;
                display: flex; align-items: center; gap: 12px;
            }
            .ap-card-img {
                width: 54px; height: 54px; border-radius: 8px;
                object-fit: contain; background: #F8F9FB;
                border: 1px solid #E5E7EB; padding: 4px;
                flex-shrink: 0;
            }
            .ap-card-body { flex: 1; min-width: 0; }
            .ap-card-name {
                font-size: 0.85rem; font-weight: 700;
                color: #0A0A0A; margin-bottom: 3px;
                overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
            }
            .ap-card-meta {
                display: flex; flex-wrap: wrap; gap: 6px;
                align-items: center; margin-bottom: 4px;
            }
            .ap-card-brand {
                font-size: 0.7rem; font-weight: 700;
                background: #EEF4FF; color: #0040CC;
                padding: 2px 7px; border-radius: 4px;
            }
            .ap-card-price {
                font-size: 0.85rem; font-weight: 800; color: #0057FF;
            }
            .ap-card-row2 {
                display: flex; align-items: center;
                justify-content: space-between; margin-top: 6px;
            }
            .ap-card-stock { font-size: 0.75rem; color: #6B7280; }
            .ap-card-badge {
                font-size: 0.7rem; font-weight: 700;
                padding: 2px 8px; border-radius: 20px; border: 1px solid;
            }
            .ap-card-actions { display: flex; gap: 6px; flex-shrink: 0; }
            .ap-btn-edit {
                background: #EEF4FF; color: #0057FF;
                border: none; border-radius: 7px;
                padding: 6px 10px; font-size: 0.75rem; font-weight: 700;
                font-family: 'Nunito',sans-serif; cursor: pointer;
                transition: all 0.2s; display: flex; align-items: center; gap: 4px;
            }
            .ap-btn-edit:hover { background: #0057FF; color: #fff; }
            .ap-btn-toggle {
                background: #FEF2F2; color: #EF4444;
                border: none; border-radius: 7px;
                padding: 6px 10px; font-size: 0.75rem; font-weight: 700;
                font-family: 'Nunito',sans-serif; cursor: pointer;
                transition: all 0.2s; display: flex; align-items: center; gap: 4px;
            }
            .ap-btn-toggle:hover { background: #EF4444; color: #fff; }
            .ap-btn-toggle.show { background: #F0FDF4; color: #15803D; }
            .ap-btn-toggle.show:hover { background: #15803D; color: #fff; }

            /* Shared buttons in table */
            .admin-btn-edit {
                background: #EEF4FF; color: #0057FF; border: none;
                border-radius: 7px; padding: 6px 11px; font-size: 0.78rem;
                font-weight: 700; font-family: 'Nunito',sans-serif;
                cursor: pointer; margin-right: 4px; transition: all 0.2s;
            }
            .admin-btn-edit:hover { background: #0057FF; color: #fff; }
            .admin-btn-del {
                background: #FEF2F2; color: #EF4444; border: none;
                border-radius: 7px; padding: 6px 11px; font-size: 0.78rem;
                font-weight: 700; font-family: 'Nunito',sans-serif;
                cursor: pointer; transition: all 0.2s;
            }
            .admin-btn-del:hover { background: #EF4444; color: #fff; }

            /* Status badge */
            .badge-active {
                background: #F0FDF4; color: #15803D;
                border: 1px solid #BBF7D0;
                font-size: 0.72rem; font-weight: 700;
                padding: 3px 10px; border-radius: 100px;
            }
            .badge-hidden {
                background: #F8F9FB; color: #9CA3AF;
                border: 1px solid #E5E7EB;
                font-size: 0.72rem; font-weight: 700;
                padding: 3px 10px; border-radius: 100px;
            }

            /* Form panel */
            .admin-input {
                width: 100%; background: #F8F9FB;
                border: 1.5px solid #E5E7EB; border-radius: 10px;
                padding: 10px 14px; font-size: 0.875rem;
                font-family: 'Nunito',sans-serif; color: #0A0A0A;
                outline: none; transition: border-color 0.2s;
            }
            .admin-input:focus { border-color: #0057FF; background: #fff; }
            .admin-btn-primary {
                background: #0057FF; color: #fff; border: none;
                border-radius: 10px; padding: 10px 20px;
                font-size: 0.875rem; font-weight: 700;
                font-family: 'Nunito',sans-serif; cursor: pointer;
                transition: background 0.2s; margin-right: 8px;
                white-space: nowrap;
            }
            .admin-btn-primary:hover { background: #0040CC; }
            .admin-btn-primary:disabled { opacity: 0.7; cursor: default; }
            .admin-btn-secondary {
                background: #fff; color: #6B7280;
                border: 1.5px solid #E5E7EB; border-radius: 10px;
                padding: 9px 16px; font-size: 0.875rem; font-weight: 600;
                font-family: 'Nunito',sans-serif; cursor: pointer; transition: all 0.2s;
            }
            .admin-btn-secondary:hover { border-color: #0057FF; color: #0057FF; }

            /* ── Responsive ── */
            @media (max-width: 768px) {
                /* Trên mobile: ẩn table, hiện card list */
                .ap-table-wrap { display: none !important; }
                .ap-card-list  { display: flex !important; }
                /* Toolbar: search + select full width, add btn riêng dòng */
                .ap-toolbar { flex-wrap: wrap; }
                .ap-search-wrap { flex: 1; min-width: calc(100% - 150px); }
                .ap-select { width: 140px; max-width: 140px; }
                .ap-add-btn { width: 100%; justify-content: center; text-align: center; }
            }
            @media (max-width: 400px) {
                .ap-toolbar { flex-wrap: wrap; }
                .ap-search-wrap { width: 100%; flex: none; }
                .ap-select { width: 100%; max-width: none; flex: none; }
            }
        `}</style>

            <div style={{ minHeight: '100vh', background: '#F3F4F6', fontFamily: 'Nunito,sans-serif' }}>
                <Topbar title='Quản lý sản phẩm' subtitle='Điện thoại & phụ kiện'
                    actions={
                        <button className="ap-add-btn" style={{ display: 'none' }}
                            onClick={openAdd}>+ Thêm</button>
                    }
                />
                <div style={{ padding: '20px 20px' }}>

                    {/* Alert */}
                    {msg.text && (
                        <div style={{
                            padding: '10px 16px', borderRadius: 10, marginBottom: 16,
                            fontSize: '0.875rem', fontWeight: 600,
                            background: msg.type === 'success' ? '#F0FDF4' : '#FEF2F2',
                            color: msg.type === 'success' ? '#15803D' : '#DC2626',
                            border: `1px solid ${msg.type === 'success' ? '#BBF7D0' : '#FECACA'}`,
                            display: 'flex', alignItems: 'center', gap: 8
                        }}>
                            {msg.type === 'success' ? '✅' : '⚠️'} {msg.text}
                        </div>
                    )}

                    {/* Toolbar */}
                    <div className="ap-toolbar">
                        <div className="ap-search-wrap">
                            <span className="ap-search-icon">🔍</span>
                            <input
                                className="ap-search"
                                placeholder="Tìm sản phẩm, thương hiệu..."
                                value={search}
                                onChange={e => { setSearch(e.target.value); setCurrentPage(1) }}
                            />
                        </div>
                        {/* Custom dropdown — không tràn màn hình */}
                        <div className="ap-drop">
                            <button
                                className={`ap-drop-btn${dropOpen ? ' open' : ''}`}
                                onClick={() => setDropOpen(o => !o)}
                                onBlur={() => setTimeout(() => setDropOpen(false), 150)}
                            >
                                <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1 }}>
                                    {filterCat === 'all'
                                        ? 'Tất cả hãng'
                                        : (categories.find(c => c._id === filterCat)?.name || 'Tất cả hãng')
                                    }
                                </span>
                                <span className="ap-drop-arrow">▼</span>
                            </button>
                            {dropOpen && (
                                <div className="ap-drop-menu">
                                    {[{ _id: 'all', name: 'Tất cả hãng' }, ...categories].map(c => (
                                        <button
                                            key={c._id}
                                            className={`ap-drop-item${filterCat === c._id ? ' active' : ''}`}
                                            onMouseDown={() => {
                                                setFilterCat(c._id)
                                                setCurrentPage(1)
                                                setDropOpen(false)
                                            }}
                                        >
                                            {c.name}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                        <button className="ap-add-btn" onClick={openAdd}>
                            + Thêm sản phẩm
                        </button>
                    </div>

                    {/* ── DESKTOP: Table ── */}
                    <div style={{ background: '#fff', borderRadius: 14, border: '1px solid #E5E7EB', overflow: 'hidden' }}>
                        <div className="ap-table-wrap" style={{ overflowX: 'auto' }}>
                            <table className="ap-table">
                                <thead>
                                    <tr>
                                        <th>Sản phẩm</th>
                                        <th>Hãng</th>
                                        <th>Giá</th>
                                        <th>Kho</th>
                                        <th>Trạng thái</th>
                                        <th>Thao tác</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {loading ? (
                                        <tr><td colSpan={6} style={{ textAlign: 'center', padding: 40, color: '#6B7280' }}>Đang tải...</td></tr>
                                    ) : paginated.length === 0 ? (
                                        <tr><td colSpan={6} style={{ textAlign: 'center', padding: 40, color: '#6B7280' }}>Không có sản phẩm</td></tr>
                                    ) : paginated.map(p => (
                                        <tr key={p._id}>
                                            <td>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                                    <img src={p.image} alt={p.name}
                                                        style={{ width: 42, height: 42, objectFit: 'contain', borderRadius: 8, background: '#F8F9FB', border: '1px solid #E5E7EB', padding: 4, flexShrink: 0 }}
                                                        onError={e => { e.target.src = 'https://placehold.co/40x40/EEF4FF/0057FF?text=P' }} />
                                                    <div>
                                                        <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#0A0A0A', maxWidth: 220, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.name}</div>
                                                        {p.originalPrice > p.price && (
                                                            <div style={{ fontSize: '0.72rem', color: '#9CA3AF', textDecoration: 'line-through' }}>{p.originalPrice.toLocaleString('vi-VN')}đ</div>
                                                        )}
                                                    </div>
                                                </div>
                                            </td>
                                            <td>
                                                <span style={{ fontSize: '0.75rem', padding: '2px 8px', borderRadius: 5, background: '#EEF4FF', color: '#0040CC', fontWeight: 700 }}>
                                                    {p.specs?.brand || p.category?.name || '—'}
                                                </span>
                                            </td>
                                            <td style={{ fontWeight: 700, color: '#0057FF' }}>
                                                {p.price.toLocaleString('vi-VN')}đ
                                            </td>
                                            <td>{p.stock ?? 0}</td>
                                            <td>
                                                {p.isAvailable
                                                    ? <span className="badge-active">Đang bán</span>
                                                    : <span className="badge-hidden">Đã ẩn</span>
                                                }
                                            </td>
                                            <td style={{ whiteSpace: 'nowrap' }}>
                                                <button className="admin-btn-edit" onClick={() => openEdit(p)}>✏️ Sửa</button>
                                                <button className="admin-btn-del" onClick={() => handleToggle(p)}>
                                                    {p.isAvailable ? '🙈 Ẩn' : '✅ Hiện'}
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* ── MOBILE: Card list ── */}
                        <div className="ap-card-list" style={{ padding: '12px' }}>
                            {loading ? (
                                <div style={{ textAlign: 'center', padding: 40, color: '#6B7280' }}>Đang tải...</div>
                            ) : paginated.length === 0 ? (
                                <div style={{ textAlign: 'center', padding: 40, color: '#6B7280' }}>Không có sản phẩm</div>
                            ) : paginated.map(p => (
                                <div key={p._id} className="ap-card">
                                    <img
                                        src={p.image} alt={p.name}
                                        className="ap-card-img"
                                        onError={e => { e.target.src = 'https://placehold.co/54x54/EEF4FF/0057FF?text=P' }}
                                    />
                                    <div className="ap-card-body">
                                        <div className="ap-card-name">{p.name}</div>
                                        <div className="ap-card-meta">
                                            <span className="ap-card-brand">{p.specs?.brand || p.category?.name || '—'}</span>
                                            <span className="ap-card-price">{p.price.toLocaleString('vi-VN')}đ</span>
                                        </div>
                                        <div className="ap-card-row2">
                                            <span className="ap-card-stock">Kho: {p.stock ?? 0}</span>
                                            {p.isAvailable
                                                ? <span className="ap-card-badge" style={{ background: '#F0FDF4', color: '#15803D', borderColor: '#BBF7D0' }}>Đang bán</span>
                                                : <span className="ap-card-badge" style={{ background: '#F8F9FB', color: '#9CA3AF', borderColor: '#E5E7EB' }}>Đã ẩn</span>
                                            }
                                        </div>
                                    </div>
                                    <div className="ap-card-actions">
                                        <button className="ap-btn-edit" onClick={() => openEdit(p)}>✏️</button>
                                        <button
                                            className={`ap-btn-toggle${p.isAvailable ? '' : ' show'}`}
                                            onClick={() => handleToggle(p)}
                                        >
                                            {p.isAvailable ? '🙈' : '✅'}
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
                    </div>
                </div>
            </div>

            {/* ── Form panel ── */}
            {panelOpen && (
                <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', zIndex: 300, display: 'flex', justifyContent: 'flex-end' }}
                    onClick={() => setPanelOpen(false)}>
                    <div style={{ width: '100%', maxWidth: 460, background: '#fff', height: '100vh', display: 'flex', flexDirection: 'column', overflowY: 'auto' }}
                        onClick={e => e.stopPropagation()}>
                        {/* Header */}
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '18px 24px', borderBottom: '1px solid #E5E7EB', position: 'sticky', top: 0, background: '#fff', zIndex: 1 }}>
                            <h2 style={{ fontSize: '1rem', fontWeight: 800, color: '#0A0A0A', margin: 0 }}>
                                {editId ? '✏️ Sửa sản phẩm' : '➕ Thêm sản phẩm'}
                            </h2>
                            <button style={{ background: 'none', border: 'none', fontSize: 18, cursor: 'pointer', color: '#6B7280', padding: 4 }} onClick={() => setPanelOpen(false)}>✕</button>
                        </div>

                        {/* Body */}
                        <div style={{ padding: '20px 24px', flex: 1, display: 'flex', flexDirection: 'column', gap: 20 }}>
                            {/* Thông tin cơ bản */}
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                                <div style={{ fontSize: '0.72rem', fontWeight: 700, color: '#0057FF', textTransform: 'uppercase', letterSpacing: 0.8, paddingBottom: 6, borderBottom: '1px solid #EEF4FF' }}>
                                    Thông tin cơ bản
                                </div>
                                <Field label="Tên sản phẩm *">
                                    <input className="admin-input" name="name" value={form.name} onChange={handleChange} placeholder="VD: Samsung Galaxy S25 Ultra" />
                                </Field>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                                    <Field label="Giá bán *">
                                        <input className="admin-input" name="price" type="number" value={form.price} onChange={handleChange} placeholder="25990000" />
                                    </Field>
                                    <Field label="Giá gốc">
                                        <input className="admin-input" name="originalPrice" type="number" value={form.originalPrice} onChange={handleChange} placeholder="Để tính % giảm" />
                                    </Field>
                                </div>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                                    <Field label="Tồn kho">
                                        <input className="admin-input" name="stock" type="number" value={form.stock} onChange={handleChange} placeholder="0" />
                                    </Field>
                                    <Field label="Hãng *">
                                        <select className="admin-input" name="category" value={form.category} onChange={handleChange}>
                                            <option value="">-- Chọn hãng --</option>
                                            {categories.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
                                        </select>
                                    </Field>
                                </div>
                                <Field label="URL ảnh chính *">
                                    <input className="admin-input" name="image" value={form.image} onChange={handleChange} placeholder="https://..." />
                                </Field>
                                {form.image && (
                                    <img src={form.image} alt="preview"
                                        style={{ width: 80, height: 80, objectFit: 'contain', borderRadius: 8, border: '1px solid #E5E7EB', background: '#F8F9FB', padding: 4 }}
                                        onError={e => { e.target.style.display = 'none' }} />
                                )}
                                <Field label="Mô tả">
                                    <textarea className="admin-input" name="description" value={form.description} onChange={handleChange}
                                        placeholder="Mô tả ngắn về sản phẩm..." rows={3} style={{ resize: 'vertical' }} />
                                </Field>
                            </div>

                            {/* Thông số kỹ thuật */}
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                                <div style={{ fontSize: '0.72rem', fontWeight: 700, color: '#0057FF', textTransform: 'uppercase', letterSpacing: 0.8, paddingBottom: 6, borderBottom: '1px solid #EEF4FF' }}>
                                    Thông số kỹ thuật
                                </div>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                                    {[
                                        ['brand', 'Thương hiệu', 'Samsung...'],
                                        ['chip', 'Chip xử lý', 'Snapdragon 8...'],
                                        ['ram', 'RAM', '8GB, 12GB'],
                                        ['storage', 'Bộ nhớ', '128GB, 256GB'],
                                        ['screen', 'Màn hình', '6.7 AMOLED...'],
                                        ['camera', 'Camera', '200MP...'],
                                        ['battery', 'Pin', '5000mAh...'],
                                        ['os', 'Hệ điều hành', 'Android 15...'],
                                    ].map(([name, label, ph]) => (
                                        <Field key={name} label={label}>
                                            <input className="admin-input" name={name} value={form.specs[name]}
                                                onChange={handleSpecChange} placeholder={ph}
                                                style={{ fontSize: '0.82rem', padding: '8px 12px' }} />
                                        </Field>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Footer */}
                        <div style={{ padding: '14px 24px', borderTop: '1px solid #E5E7EB', position: 'sticky', bottom: 0, background: '#fff', display: 'flex', gap: 10 }}>
                            <button className="admin-btn-primary" onClick={handleSubmit} disabled={saving} style={{ flex: 1 }}>
                                {saving ? 'Đang lưu...' : editId ? 'Cập nhật' : 'Thêm sản phẩm'}
                            </button>
                            <button className="admin-btn-secondary" onClick={() => setPanelOpen(false)}>Huỷ</button>
                        </div>
                    </div>
                </div>
            )}
        </>
    )
}

// Helper component
function Field({ label, children }) {
    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            <label style={{ fontSize: '0.78rem', fontWeight: 700, color: '#374151' }}>{label}</label>
            {children}
        </div>
    )
}