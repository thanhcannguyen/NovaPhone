import { useState, useEffect } from 'react'
import Topbar from '../../components/admin/Topbar'
import Pagination from '../../components/admin/Pagination'
import { getAllProductsAdmin, createProduct, updateProduct } from '../../api/productApi'
import { getCategories } from '../../api/categoryApi'
import styles from './Products.module.css'

const EMPTY_FORM = {
    name: '', description: '', price: '', originalPrice: '', image: '', category: '', stock: '', isFeatured: false,
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
            stock: p.stock || 0, isFeatured: p.isFeatured || false,
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

    const handleChange = (e) => {
        const { name, type, checked, value } = e.target
        setForm(f => ({ ...f, [name]: type === 'checkbox' ? checked : value }))
    }
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

    const handleToggleFeatured = async (p) => {
        try {
            await updateProduct(p._id, { isFeatured: !p.isFeatured })
            showMsg('success', p.isFeatured ? 'Đã bỏ nổi bật' : 'Đã đánh dấu nổi bật')
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

            <div style={{ minHeight: '100vh', background: '#F3F4F6', fontFamily: 'Nunito,sans-serif' }}>
                <Topbar title='Quản lý sản phẩm' subtitle='Điện thoại & phụ kiện'
                    actions={
                        <button className={styles.addBtn} style={{ display: 'none' }}
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
                    <div className={styles.toolbar}>
                        <div className={styles.searchWrap}>
                            <span className={styles.searchIcon}>🔍</span>
                            <input
                                className={styles.search}
                                placeholder="Tìm sản phẩm, thương hiệu..."
                                value={search}
                                onChange={e => { setSearch(e.target.value); setCurrentPage(1) }}
                            />
                        </div>
                        {/* Custom dropdown — không tràn màn hình */}
                        <div className={styles.drop}>
                            <button
                                className={`${styles.dropBtn}${dropOpen ? ' ' + styles.open : ''}`}
                                onClick={() => setDropOpen(o => !o)}
                                onBlur={() => setTimeout(() => setDropOpen(false), 150)}
                            >
                                <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1 }}>
                                    {filterCat === 'all'
                                        ? 'Tất cả hãng'
                                        : (categories.find(c => c._id === filterCat)?.name || 'Tất cả hãng')
                                    }
                                </span>
                                <span className={styles.dropArrow}>▼</span>
                            </button>
                            {dropOpen && (
                                <div className={styles.dropMenu}>
                                    {[{ _id: 'all', name: 'Tất cả hãng' }, ...categories].map(c => (
                                        <button
                                            key={c._id}
                                            className={`${styles.dropItem}${filterCat === c._id ? ' ' + styles.active : ''}`}
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
                        <button className={styles.addBtn} onClick={openAdd}>
                            + Thêm sản phẩm
                        </button>
                    </div>

                    {/* ── DESKTOP: Table ── */}
                    <div style={{ background: '#fff', borderRadius: 14, border: '1px solid #E5E7EB', overflow: 'hidden' }}>
                        <div className={styles.tableWrap} style={{ overflowX: 'auto' }}>
                            <table className={styles.table}>
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
                                                    ? <span className={styles.badgeActive}>Đang bán</span>
                                                    : <span className={styles.badgeHidden}>Đã ẩn</span>
                                                }
                                            </td>
                                            <td style={{ whiteSpace: 'nowrap' }}>
                                                <button className={styles.adminBtnEdit} onClick={() => openEdit(p)}>✏️ Sửa</button>
                                                <button className={styles.adminBtnDel} onClick={() => handleToggle(p)}>
                                                    {p.isAvailable ? '🙈 Ẩn' : '✅ Hiện'}
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* ── MOBILE: Card list ── */}
                        <div className={styles.cardList} style={{ padding: '12px' }}>
                            {loading ? (
                                <div style={{ textAlign: 'center', padding: 40, color: '#6B7280' }}>Đang tải...</div>
                            ) : paginated.length === 0 ? (
                                <div style={{ textAlign: 'center', padding: 40, color: '#6B7280' }}>Không có sản phẩm</div>
                            ) : paginated.map(p => (
                                <div key={p._id} className={styles.card}>
                                    <img
                                        src={p.image} alt={p.name}
                                        className={styles.cardImg}
                                        onError={e => { e.target.src = 'https://placehold.co/54x54/EEF4FF/0057FF?text=P' }}
                                    />
                                    <div className={styles.cardBody}>
                                        <div className={styles.cardName}>{p.name}</div>
                                        <div className={styles.cardMeta}>
                                            <span className={styles.cardBrand}>{p.specs?.brand || p.category?.name || '—'}</span>
                                            <span className={styles.cardPrice}>{p.price.toLocaleString('vi-VN')}đ</span>
                                        </div>
                                        <div className={styles.cardRow2}>
                                            <span className={styles.cardStock}>Kho: {p.stock ?? 0}</span>
                                            {p.isAvailable
                                                ? <span className={styles.cardBadge} style={{ background: '#F0FDF4', color: '#15803D', borderColor: '#BBF7D0' }}>Đang bán</span>
                                                : <span className={styles.cardBadge} style={{ background: '#F8F9FB', color: '#9CA3AF', borderColor: '#E5E7EB' }}>Đã ẩn</span>
                                            }
                                        </div>
                                    </div>
                                    <div className={styles.cardActions}>
                                        <button className={styles.btnEdit} onClick={() => openEdit(p)}>✏️</button>
                                        <button
                                            className={`${styles.btnToggle}${p.isAvailable ? '' : ' ' + styles.show}`}
                                            onClick={() => handleToggle(p)}
                                        >
                                            {p.isAvailable ? '🙈' : '✅'}
                                        </button>
                                        <button
                                            title={p.isFeatured ? 'Bỏ nổi bật' : 'Đánh dấu nổi bật'}
                                            className={styles.btnEdit}
                                            style={{ color: p.isFeatured ? '#F59E0B' : '#9CA3AF' }}
                                            onClick={() => handleToggleFeatured(p)}
                                        >
                                            {p.isFeatured ? '⭐' : '☆'}
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
                                    <input className={styles.adminInput} name="name" value={form.name} onChange={handleChange} placeholder="VD: Samsung Galaxy S25 Ultra" />
                                </Field>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                                    <Field label="Giá bán *">
                                        <input className={styles.adminInput} name="price" type="number" value={form.price} onChange={handleChange} placeholder="25990000" />
                                    </Field>
                                    <Field label="Giá gốc">
                                        <input className={styles.adminInput} name="originalPrice" type="number" value={form.originalPrice} onChange={handleChange} placeholder="Để tính % giảm" />
                                    </Field>
                                </div>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                                    <Field label="Tồn kho">
                                        <input className={styles.adminInput} name="stock" type="number" value={form.stock} onChange={handleChange} placeholder="0" />
                                    </Field>
                                    <Field label="Hãng *">
                                        <select className={styles.adminInput} name="category" value={form.category} onChange={handleChange}>
                                            <option value="">-- Chọn hãng --</option>
                                            {categories.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
                                        </select>
                                    </Field>
                                </div>
                                <Field label="URL ảnh chính *">
                                    <input className={styles.adminInput} name="image" value={form.image} onChange={handleChange} placeholder="https://..." />
                                </Field>
                                <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.85rem', fontWeight: 700, color: '#0A0A0A', cursor: 'pointer' }}>
                                    <input type="checkbox" name="isFeatured" checked={form.isFeatured} onChange={handleChange}
                                        style={{ width: 16, height: 16, accentColor: '#F59E0B' }} />
                                    ⭐ Đánh dấu sản phẩm nổi bật (hiện ở trang chủ)
                                </label>
                                {form.image && (
                                    <img src={form.image} alt="preview"
                                        style={{ width: 80, height: 80, objectFit: 'contain', borderRadius: 8, border: '1px solid #E5E7EB', background: '#F8F9FB', padding: 4 }}
                                        onError={e => { e.target.style.display = 'none' }} />
                                )}
                                <Field label="Mô tả">
                                    <textarea className={styles.adminInput} name="description" value={form.description} onChange={handleChange}
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
                                            <input className={styles.adminInput} name={name} value={form.specs[name]}
                                                onChange={handleSpecChange} placeholder={ph}
                                                style={{ fontSize: '0.82rem', padding: '8px 12px' }} />
                                        </Field>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Footer */}
                        <div style={{ padding: '14px 24px', borderTop: '1px solid #E5E7EB', position: 'sticky', bottom: 0, background: '#fff', display: 'flex', gap: 10 }}>
                            <button className={styles.adminBtnPrimary} onClick={handleSubmit} disabled={saving} style={{ flex: 1 }}>
                                {saving ? 'Đang lưu...' : editId ? 'Cập nhật' : 'Thêm sản phẩm'}
                            </button>
                            <button className={styles.adminBtnSecondary} onClick={() => setPanelOpen(false)}>Huỷ</button>
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