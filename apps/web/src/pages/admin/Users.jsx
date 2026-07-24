// src/pages/admin/Users.jsx
import { useState, useEffect, useRef } from 'react'
import Topbar from '../../components/admin/Topbar'
import Pagination from '../../components/admin/Pagination'
import { getAllUsers } from '../../api/userApi'

const ITEMS_PER_PAGE = 8

function useIsMobile() {
    const [isMobile, setIsMobile] = useState(window.innerWidth <= 768)
    useEffect(() => {
        const h = () => setIsMobile(window.innerWidth <= 768)
        window.addEventListener('resize', h)
        return () => window.removeEventListener('resize', h)
    }, [])
    return isMobile
}

function Dropdown({ value, onChange, options, style }) {
    const [open, setOpen] = useState(false)
    const ref = useRef(null)

    useEffect(() => {
        const handler = (e) => {
            if (ref.current && !ref.current.contains(e.target)) setOpen(false)
        }
        document.addEventListener('mousedown', handler)
        return () => document.removeEventListener('mousedown', handler)
    }, [])

    const selected = options.find(o => o.value === value)

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
            <div className="inner" ref={ref} style={{ position: 'relative', display: 'inline-block' }}>
                <button
                    onClick={() => setOpen(o => !o)}
                    style={{
                        ...style,
                        display: 'flex',
                        alignItems: 'center',
                        gap: 6,
                        justifyContent: 'space-between',
                        minWidth: 140,
                    }}
                >
                    <span>{selected?.label}</span>
                    <span style={{ fontSize: 10, transition: 'transform 0.2s', transform: open ? 'rotate(180deg)' : 'rotate(0deg)' }}>▼</span>
                </button>
                {open && (
                    <div style={{
                        position: 'absolute',
                        top: 'calc(100% + 4px)',
                        left: 0,
                        background: '#fff',
                        border: '1.5px solid #E5E7EB',
                        borderRadius: 8,
                        boxShadow: '0 4px 16px rgba(0,0,0,0.10)',
                        zIndex: 999,
                        minWidth: '100%',
                        width: 'max-content',
                        overflow: 'hidden',
                    }}>
                        {options.map(o => (
                            <div
                                key={o.value}
                                onClick={() => { onChange(o.value); setOpen(false) }}
                                style={{
                                    padding: '9px 16px',
                                    fontSize: 13,
                                    color: '#0A0A0A',
                                    cursor: 'pointer',
                                    background: value === o.value ? '#EEF4FF' : '#fff',
                                    fontWeight: value === o.value ? 600 : 400,
                                    whiteSpace: 'nowrap',
                                }}
                                onMouseEnter={e => { if (value !== o.value) e.currentTarget.style.background = '#F8F9FB' }}
                                onMouseEnter={e => { if (value !== o.value) e.currentTarget.style.background = '#F8F9FB' }}
                            >
                                {o.label}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </>
    )
}

export default function Users() {
    const isMobile = useIsMobile()
    const [users, setUsers] = useState([])
    const [loading, setLoading] = useState(true)
    const [search, setSearch] = useState('')
    const [roleFilter, setRoleFilter] = useState('all')
    const [statusFilter, setStatusFilter] = useState('all')
    const [currentPage, setCurrentPage] = useState(1)

    useEffect(() => {
        getAllUsers().then(res => setUsers(res.data.data)).catch(console.error).finally(() => setLoading(false))
    }, [])

    const filtered = users.filter(u => {
        const matchSearch = u.name.toLowerCase().includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase())
        const matchRole = roleFilter === 'all' || u.role === roleFilter
        const matchStatus = statusFilter === 'all' || String(u.isActive) === statusFilter
        return matchSearch && matchRole && matchStatus
    })
    useEffect(() => { setCurrentPage(1) }, [search, roleFilter, statusFilter])

    const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE)
    const paginated = filtered.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE)

    const avatarColor = (name) => {
        const colors = ['#0057FF', '#2e7d32', '#1565c0', '#6a1b9a', '#c62828', '#00695c', '#ef6c00']
        return colors[name?.charCodeAt(0) % colors.length] || '#0057FF'
    }
    const initials = (name) => {
        if (!name) return '?'
        const parts = name.trim().split(' ')
        return parts.length >= 2 ? (parts[0][0] + parts[parts.length - 1][0]).toUpperCase() : name.slice(0, 2).toUpperCase()
    }

    const stats = [
        { label: 'Tổng người dùng', value: users.length, color: '#0057FF', bg: '#EEF4FF' },
        { label: 'Đang hoạt động', value: users.filter(u => u.isActive).length, color: '#15803D', bg: '#e7f8ec' },
        { label: 'Đã xác minh', value: users.filter(u => u.isEmailVerified).length, color: '#1565c0', bg: '#e6f1fb' },
        { label: 'Quản trị viên', value: users.filter(u => u.role === 'admin').length, color: '#6a1b9a', bg: '#f3e8ff' },
    ]

    const filterStyle = {
        padding: '7px 14px',
        borderRadius: 8,
        border: '1.5px solid #e0d3c8',
        background: '#fff',
        color: '#0057FF',
        fontSize: 13,
        cursor: 'pointer',
        fontWeight: 500,
        fontFamily: 'inherit',
        outline: 'none',
        height: 36,
        boxSizing: 'border-box',
        whiteSpace: 'nowrap',
    }

    const roleOptions = [
        { value: 'all', label: 'Tất cả vai trò' },
        { value: 'user', label: 'User' },
        { value: 'admin', label: 'Admin' },
    ]

    const statusOptions = [
        { value: 'all', label: 'Tất cả trạng thái' },
        { value: 'true', label: 'Đang hoạt động' },
        { value: 'false', label: 'Đã khóa' },
    ]

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
                <Topbar title='Quản lý người dùng' />
                <div style={{ padding: '20px 24px' }}>

                    {/* Stats */}
                    <div style={{ display: 'grid', gridTemplateColumns: isMobile ? 'repeat(2,1fr)' : 'repeat(4,1fr)', gap: isMobile ? 8 : 12, marginBottom: 16 }}>
                        {stats.map(stat => (
                            <div key={stat.label} style={{ background: '#fff', borderRadius: 10, border: '1px solid #E5E7EB', padding: isMobile ? '12px 10px' : '12px 10px', textAlign: 'center' }}>
                                <div style={{ fontSize: isMobile ? 20 : 22, fontWeight: 700, color: stat.color, marginBottom: 4 }}>{stat.value}</div>
                                <div style={{ fontSize: 11, color: '#6B7280' }}>{stat.label}</div>
                            </div>
                        ))}
                    </div>

                    {/* Search — full width */}
                    <input
                        style={{ ...filterStyle, width: '100%', boxSizing: 'border-box', marginBottom: 8, borderRadius: 8, color: '#0A0A0A', fontWeight: 400 }}
                        placeholder='Tìm tên, email...' value={search} onChange={e => setSearch(e.target.value)} />

                    {/* Filters */}
                    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 14, alignItems: 'center' }}>
                        <Dropdown
                            value={roleFilter}
                            onChange={setRoleFilter}
                            options={roleOptions}
                            style={filterStyle}
                        />
                        <Dropdown
                            value={statusFilter}
                            onChange={setStatusFilter}
                            options={statusOptions}
                            style={filterStyle}
                        />
                        <button style={filterStyle} onClick={() => { setSearch(''); setRoleFilter('all'); setStatusFilter('all') }}>↺ Reset</button>
                        <span style={{ fontSize: 12, color: '#6B7280', marginLeft: 'auto' }}>{filtered.length}/{users.length} người dùng</span>
                    </div>

                    {/* Content */}
                    {loading ? <p style={{ color: '#6B7280', textAlign: 'center', padding: 32 }}>Đang tải...</p> :
                        filtered.length === 0 ? <p style={{ color: '#6B7280', textAlign: 'center', padding: 32 }}>Không tìm thấy người dùng nào</p> : (
                            <>
                                {isMobile ? (
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                                        {paginated.map(user => (
                                            <div key={user._id} style={s.userCard}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
                                                    <div style={{ width: 40, height: 40, borderRadius: '50%', background: avatarColor(user.name), color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, fontWeight: 600, flexShrink: 0 }}>
                                                        {initials(user.name)}
                                                    </div>
                                                    <div style={{ flex: 1, minWidth: 0 }}>
                                                        <div style={{ fontWeight: 600, fontSize: 14, color: '#0A0A0A', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user.name}</div>
                                                        <div style={{ fontSize: 12, color: '#6B7280', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user.email}</div>
                                                    </div>
                                                </div>
                                                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', alignItems: 'center' }}>
                                                    <span style={user.role === 'admin' ? s.badgeAdmin : s.badgeUser}>{user.role === 'admin' ? 'Admin' : 'User'}</span>
                                                    <span style={user.isEmailVerified ? s.badgeVerified : s.badgeUnverified}>{user.isEmailVerified ? '✓ Xác minh' : '✗ Chưa'}</span>
                                                    <span style={user.isActive ? s.badgeActive : s.badgeLocked}>{user.isActive ? 'Hoạt động' : 'Đã khóa'}</span>
                                                    <span style={{ fontSize: 11, color: '#aaa', marginLeft: 'auto' }}>{new Date(user.createdAt).toLocaleDateString('vi-VN')}</span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div style={{ background: '#fff', borderRadius: 10, border: '1px solid #E5E7EB', overflowX: 'auto' }}>
                                        <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 680 }}>
                                            <thead>
                                                <tr style={{ background: '#F8F9FB' }}>
                                                    {['Người dùng', 'Email', 'Vai trò', 'Xác minh', 'Trạng thái', 'Ngày tham gia'].map(h => (
                                                        <th key={h} style={s.th}>{h}</th>
                                                    ))}
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {paginated.map(user => (
                                                    <tr key={user._id} className='admin-tr'>
                                                        <td style={s.td}>
                                                            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                                                <div style={{ width: 34, height: 34, borderRadius: '50%', background: avatarColor(user.name), color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 600, flexShrink: 0 }}>{initials(user.name)}</div>
                                                                <span style={{ fontSize: 13, fontWeight: 500, whiteSpace: 'nowrap' }}>{user.name}</span>
                                                            </div>
                                                        </td>
                                                        <td style={{ ...s.td, maxWidth: 180, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user.email}</td>
                                                        <td style={{ ...s.td, textAlign: 'center' }}><span style={user.role === 'admin' ? s.badgeAdmin : s.badgeUser}>{user.role === 'admin' ? 'Admin' : 'User'}</span></td>
                                                        <td style={{ ...s.td, textAlign: 'center' }}><span style={user.isEmailVerified ? s.badgeVerified : s.badgeUnverified}>{user.isEmailVerified ? '✓ Đã xác minh' : '✗ Chưa'}</span></td>
                                                        <td style={{ ...s.td, textAlign: 'center' }}><span style={user.isActive ? s.badgeActive : s.badgeLocked}>{user.isActive ? 'Hoạt động' : 'Đã khóa'}</span></td>
                                                        <td style={{ ...s.td, textAlign: 'center', whiteSpace: 'nowrap' }}>{new Date(user.createdAt).toLocaleDateString('vi-VN')}</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                )}
                                <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
                            </>
                        )}
                </div>
            </div>
        </>
    )
}

const s = {
    th: { padding: '11px 14px', fontSize: 11, fontWeight: 700, color: '#6B7280', textTransform: 'uppercase', letterSpacing: 0.7, borderBottom: '2px solid #E5E7EB', textAlign: 'left', whiteSpace: 'nowrap' },
    td: { padding: '12px 14px', fontSize: 13, color: '#0A0A0A', verticalAlign: 'middle', borderBottom: '1px solid #F8F9FB' },
    userCard: { background: '#fff', borderRadius: 10, border: '1px solid #E5E7EB', padding: '14px' },
    badgeAdmin: { background: '#f3e8ff', color: '#6a1b9a', padding: '3px 10px', borderRadius: 20, fontSize: 11, whiteSpace: 'nowrap' },
    badgeUser: { background: '#e6f1fb', color: '#1565c0', padding: '3px 10px', borderRadius: 20, fontSize: 11, whiteSpace: 'nowrap' },
    badgeVerified: { background: '#e7f8ec', color: '#15803D', padding: '3px 10px', borderRadius: 20, fontSize: 11, whiteSpace: 'nowrap' },
    badgeUnverified: { background: '#fde8e8', color: '#DC2626', padding: '3px 10px', borderRadius: 20, fontSize: 11, whiteSpace: 'nowrap' },
    badgeActive: { background: '#e7f8ec', color: '#15803D', padding: '3px 10px', borderRadius: 20, fontSize: 11, whiteSpace: 'nowrap' },
    badgeLocked: { background: '#f0f0f0', color: '#888', padding: '3px 10px', borderRadius: 20, fontSize: 11, whiteSpace: 'nowrap' },
}