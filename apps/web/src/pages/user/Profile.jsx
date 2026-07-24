// src/pages/user/Profile.jsx — PHP style + Lucide icons
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { updateProfile } from '../../api/userApi'
import {
    User, ShoppingBag, Smartphone, LogOut,
    Pencil, Save, CheckCircle, AlertCircle,
    ShieldCheck, Phone, MapPin, Mail, X, Package
} from 'lucide-react'

// Style reset dùng chung cho tất cả Lucide icons
const IS = { display: 'block', border: 'none', outline: 'none', background: 'none', boxShadow: 'none', flexShrink: 0 }
// Icon nhỏ trong label/info (có màu nhạt hơn)
const ISm = { ...IS, color: '#9CA3AF' }

export default function Profile() {
    const { user, login, logout } = useAuth()
    const navigate = useNavigate()
    const [editing, setEditing] = useState(false)
    const [loading, setLoading] = useState(false)
    const [success, setSuccess] = useState('')
    const [error, setError] = useState('')
    const [form, setForm] = useState({
        name: user?.name || '', phone: user?.phone || '',
        street: user?.address?.street || '',
        district: user?.address?.district || '',
        city: user?.address?.city || '',
    })

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value })
        setSuccess(''); setError('')
    }

    const handleSubmit = async (e) => {
        e.preventDefault(); setLoading(true); setSuccess(''); setError('')
        try {
            const res = await updateProfile({
                name: form.name, phone: form.phone,
                address: { street: form.street, district: form.district, city: form.city }
            })
            login(localStorage.getItem('token'), res.data.data)
            setSuccess('Cập nhật thông tin thành công!')
            setEditing(false)
        } catch (err) {
            setError(err.response?.data?.message || 'Cập nhật thất bại')
        } finally { setLoading(false) }
    }

    const initials = user?.name?.split(' ').map(w => w[0]).slice(-2).join('').toUpperCase() || '?'
    const handleLogout = () => { logout(); navigate('/login') }

    const NAV_ITEMS = [
        { icon: <User size={17} strokeWidth={1.8} style={IS} />, label: 'Thông tin cá nhân', action: null, active: true },
        { icon: <Package size={17} strokeWidth={1.8} style={IS} />, label: 'Đơn hàng của tôi', action: () => navigate('/orders') },
        { icon: <Smartphone size={17} strokeWidth={1.8} style={IS} />, label: 'Tiếp tục mua sắm', action: () => navigate('/products') },
    ]

    return (
        <div style={{ background: '#F8F9FB', minHeight: '100vh', fontFamily: 'Nunito,sans-serif' }}>
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Nunito:wght@400;500;600;700;800&display=swap');
                /* SVG reset toàn trang */
                .profile-page svg {
                    display: block !important;
                    border: none !important;
                    outline: none !important;
                    box-shadow: none !important;
                    background: transparent !important;
                    overflow: visible !important;
                }
                .profile-wrap { max-width: 900px; margin: 0 auto; padding: 32px 24px; display: grid; grid-template-columns: 260px 1fr; gap: 24px; align-items: start; }
                .profile-sidebar { position: sticky; top: 80px; }
                .profile-card { background: linear-gradient(145deg, #0A0A0A, #0d1b3e); border-radius: 16px; padding: 24px; color: #fff; text-align: center; margin-bottom: 14px; position: relative; overflow: hidden; }
                .profile-card::before { content: ''; position: absolute; width: 200px; height: 200px; background: radial-gradient(circle, rgba(0,87,255,0.25) 0%, transparent 70%); top: -60px; right: -60px; }
                .profile-avatar { width: 72px; height: 72px; background: rgba(0,87,255,0.3); border: 3px solid rgba(0,87,255,0.4); border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 1.8rem; font-weight: 800; color: #60A5FA; margin: 0 auto 12px; position: relative; z-index: 1; }
                .profile-name { font-weight: 800; font-size: 1rem; margin-bottom: 4px; position: relative; z-index: 1; }
                .profile-email { font-size: 0.75rem; color: rgba(255,255,255,0.5); position: relative; z-index: 1; word-break: break-all; }
                .profile-nav { background: #fff; border: 1px solid #E5E7EB; border-radius: 14px; overflow: hidden; }
                .profile-nav-item { display: flex; align-items: center; gap: 10px; padding: 12px 16px; color: #6B7280; text-decoration: none; font-size: 0.875rem; font-weight: 600; border-left: 3px solid transparent; border-bottom: 1px solid #E5E7EB; transition: all 0.2s; cursor: pointer; background: none; width: 100%; font-family: 'Nunito',sans-serif; }
                .profile-nav-item:last-child { border-bottom: none; }
                .profile-nav-item:hover { background: #F8F9FB; color: #0057FF; }
                .profile-nav-item:hover .nav-icon { color: #0057FF; }
                .profile-nav-item.active { color: #0057FF; background: #EEF4FF; border-left-color: #0057FF; }
                .profile-nav-item.active .nav-icon { color: #0057FF; }
                .nav-icon { display: flex; align-items: center; flex-shrink: 0; color: #9CA3AF; transition: color 0.2s; }
                .profile-nav-logout { display: flex; align-items: center; gap: 10px; padding: 12px 16px; color: #EF4444; font-size: 0.875rem; font-weight: 600; border-left: 3px solid transparent; cursor: pointer; background: none; width: 100%; font-family: 'Nunito',sans-serif; transition: all 0.2s; }
                .profile-nav-logout:hover { background: #FEF2F2; border-left-color: #EF4444; }
                .logout-icon { display: flex; align-items: center; flex-shrink: 0; }
                .form-card { background: #fff; border: 1px solid #E5E7EB; border-radius: 16px; overflow: hidden; margin-bottom: 16px; }
                .form-card-header { padding: 16px 24px; border-bottom: 1px solid #E5E7EB; }
                .form-card-title { font-weight: 800; font-size: 0.95rem; color: #0A0A0A; display: flex; align-items: center; gap: 8px; }
                .form-card-title::before { content: ''; display: inline-block; width: 4px; height: 16px; background: #0057FF; border-radius: 2px; flex-shrink: 0; }
                .form-card-body { padding: 24px; }
                .form-grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
                .form-group { margin-bottom: 16px; }
                .form-group:last-child { margin-bottom: 0; }
                .form-label { display: flex; align-items: center; gap: 5px; font-size: 0.82rem; font-weight: 700; color: #0A0A0A; margin-bottom: 6px; }
                .form-control { width: 100%; background: #F8F9FB; border: 1.5px solid #E5E7EB; border-radius: 10px; padding: 10px 14px; font-size: 0.875rem; font-family: 'Nunito',sans-serif; color: #0A0A0A; outline: none; transition: border-color 0.2s; }
                .form-control:focus { border-color: #0057FF; background: #fff; box-shadow: 0 0 0 3px rgba(0,87,255,0.08); }
                .form-control:disabled { opacity: 0.6; cursor: not-allowed; }
                .btn-save { background: #0057FF; color: #fff; border: none; border-radius: 10px; padding: 10px 20px; font-size: 0.875rem; font-weight: 700; font-family: 'Nunito',sans-serif; cursor: pointer; transition: all 0.2s; display: inline-flex; align-items: center; gap: 7px; }
                .btn-save:hover { background: #0040CC; transform: translateY(-1px); }
                .btn-save:disabled { opacity: 0.7; cursor: default; transform: none; }
                .btn-cancel { background: #fff; color: #6B7280; border: 1.5px solid #E5E7EB; border-radius: 10px; padding: 9px 18px; font-size: 0.875rem; font-weight: 600; font-family: 'Nunito',sans-serif; cursor: pointer; transition: all 0.2s; display: inline-flex; align-items: center; gap: 6px; }
                .btn-cancel:hover { border-color: #EF4444; color: #EF4444; }
                .btn-edit { padding: 6px 14px; border-radius: 8px; border: 1px solid #E5E7EB; background: #F8F9FB; color: #0057FF; font-size: 0.82rem; font-weight: 600; cursor: pointer; font-family: 'Nunito',sans-serif; display: inline-flex; align-items: center; gap: 5px; transition: all 0.2s; }
                .btn-edit:hover { background: #EEF4FF; border-color: #0057FF; }
                .info-row { display: flex; justify-content: space-between; align-items: center; padding: 10px 0; border-bottom: 1px solid #F9FAFB; gap: 8px; flex-wrap: wrap; }
                .info-row:last-child { border-bottom: none; }
                .info-label { display: flex; align-items: center; gap: 7px; font-size: 0.82rem; color: #6B7280; }
                .info-value { font-size: 0.875rem; font-weight: 600; color: #0A0A0A; text-align: right; word-break: break-word; }
                .alert-ok { background: #F0FDF4; border: 1px solid #BBF7D0; color: #15803D; border-radius: 10px; padding: 11px 16px; font-size: 0.875rem; margin-bottom: 16px; display: flex; align-items: center; gap: 8px; font-weight: 600; }
                .alert-err { background: #FEF2F2; border: 1px solid #FECACA; color: #DC2626; border-radius: 10px; padding: 11px 16px; font-size: 0.875rem; margin-bottom: 16px; display: flex; align-items: center; gap: 8px; }
                .breadcrumb-bar { background: #fff; border-bottom: 1px solid #E5E7EB; padding: 10px 0; font-size: 0.82rem; color: #6B7280; }
                .breadcrumb-inner { max-width: 900px; margin: 0 auto; padding: 0 24px; display: flex; align-items: center; gap: 6px; }
                @media (max-width: 700px) {
                    .profile-wrap { grid-template-columns: 1fr; padding: 16px; }
                    .profile-sidebar { position: static; }
                    .form-grid-2 { grid-template-columns: 1fr; }
                }
            `}</style>

            {/* Breadcrumb */}
            <div className="breadcrumb-bar profile-page">
                <div className="breadcrumb-inner">
                    <button onClick={() => navigate('/products')}
                        style={{ background: 'none', border: 'none', color: '#6B7280', cursor: 'pointer', fontFamily: 'Nunito,sans-serif', fontSize: '0.82rem', padding: 0, display: 'flex', alignItems: 'center', gap: 4 }}>
                        <Smartphone size={13} style={IS} /> Trang chủ
                    </button>
                    <span style={{ fontSize: '0.7rem' }}>›</span>
                    <strong style={{ color: '#0A0A0A' }}>Cài đặt tài khoản</strong>
                </div>
            </div>

            <div className="profile-wrap profile-page">
                {/* Sidebar */}
                <div className="profile-sidebar">
                    <div className="profile-card">
                        <div className="profile-avatar">{initials}</div>
                        <div className="profile-name">{user?.name}</div>
                        <div className="profile-email">{user?.email}</div>
                    </div>

                    <div className="profile-nav">
                        {NAV_ITEMS.map((item, idx) => (
                            <button key={idx}
                                className={`profile-nav-item${item.active ? ' active' : ''}`}
                                onClick={item.action || undefined}>
                                <span className="nav-icon">{item.icon}</span>
                                {item.label}
                            </button>
                        ))}
                        <button className="profile-nav-logout" onClick={handleLogout}>
                            <span className="logout-icon">
                                <LogOut size={17} strokeWidth={1.8} style={IS} />
                            </span>
                            Đăng xuất
                        </button>
                    </div>
                </div>

                {/* Main */}
                <div>
                    {success && <div className="alert-ok"><CheckCircle size={17} style={IS} /> {success}</div>}
                    {error && <div className="alert-err"><AlertCircle size={17} style={IS} /> {error}</div>}

                    {/* Thông tin cá nhân */}
                    <div className="form-card">
                        <div className="form-card-header">
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <div className="form-card-title">Thông tin cá nhân</div>
                                {!editing && (
                                    <button className="btn-edit" onClick={() => setEditing(true)}>
                                        <Pencil size={13} style={IS} /> Chỉnh sửa
                                    </button>
                                )}
                            </div>
                        </div>
                        <div className="form-card-body">
                            {editing ? (
                                <form onSubmit={handleSubmit}>
                                    <div className="form-grid-2">
                                        <div className="form-group">
                                            <label className="form-label">
                                                <User size={14} style={ISm} /> Họ và tên *
                                            </label>
                                            <input className="form-control" name="name" value={form.name} onChange={handleChange} placeholder="Nguyễn Văn A" required />
                                        </div>
                                        <div className="form-group">
                                            <label className="form-label">
                                                <Mail size={14} style={ISm} /> Email
                                            </label>
                                            <input className="form-control" value={user?.email} disabled />
                                        </div>
                                        <div className="form-group">
                                            <label className="form-label">
                                                <Phone size={14} style={ISm} /> Số điện thoại
                                            </label>
                                            <input className="form-control" name="phone" value={form.phone} onChange={handleChange} placeholder="0901 234 567" />
                                        </div>
                                        <div className="form-group">
                                            <label className="form-label">
                                                <ShieldCheck size={14} style={ISm} /> Quyền tài khoản
                                            </label>
                                            <input className="form-control" value={user?.role === 'admin' ? 'Quản trị viên' : 'Khách hàng'} disabled />
                                        </div>
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">
                                            <MapPin size={14} style={ISm} /> Địa chỉ giao hàng
                                        </label>
                                        <input className="form-control" name="street" value={form.street} onChange={handleChange} placeholder="Số nhà, tên đường" style={{ marginBottom: 8 }} />
                                        <input className="form-control" name="district" value={form.district} onChange={handleChange} placeholder="Quận / Huyện" style={{ marginBottom: 8 }} />
                                        <input className="form-control" name="city" value={form.city} onChange={handleChange} placeholder="Tỉnh / Thành phố" />
                                    </div>
                                    <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
                                        <button type="submit" className="btn-save" disabled={loading}>
                                            <Save size={15} style={IS} />
                                            {loading ? 'Đang lưu...' : 'Lưu thay đổi'}
                                        </button>
                                        <button type="button" className="btn-cancel" onClick={() => setEditing(false)}>
                                            <X size={14} style={IS} /> Hủy
                                        </button>
                                    </div>
                                </form>
                            ) : (
                                <>
                                    {[
                                        { icon: <User size={14} style={ISm} />, label: 'Họ tên', value: user?.name },
                                        { icon: <Mail size={14} style={ISm} />, label: 'Email', value: user?.email },
                                        { icon: <Phone size={14} style={ISm} />, label: 'Số điện thoại', value: user?.phone || <span style={{ color: '#9CA3AF', fontStyle: 'italic' }}>Chưa cập nhật</span> },
                                        { icon: <MapPin size={14} style={ISm} />, label: 'Đường', value: user?.address?.street || <span style={{ color: '#9CA3AF', fontStyle: 'italic' }}>Chưa cập nhật</span> },
                                        { icon: <MapPin size={14} style={ISm} />, label: 'Quận / Huyện', value: user?.address?.district || <span style={{ color: '#9CA3AF', fontStyle: 'italic' }}>Chưa cập nhật</span> },
                                        { icon: <MapPin size={14} style={ISm} />, label: 'Tỉnh / TP', value: user?.address?.city || <span style={{ color: '#9CA3AF', fontStyle: 'italic' }}>Chưa cập nhật</span> },
                                    ].map(row => (
                                        <div key={row.label} className="info-row">
                                            <span className="info-label">{row.icon} {row.label}</span>
                                            <span className="info-value">{row.value}</span>
                                        </div>
                                    ))}
                                </>
                            )}
                        </div>
                    </div>

                    {/* Bảo mật */}
                    <div className="form-card">
                        <div className="form-card-header">
                            <div className="form-card-title">Bảo mật</div>
                        </div>
                        <div className="form-card-body">
                            <div className="info-row">
                                <span className="info-label"><ShieldCheck size={14} style={ISm} /> Mật khẩu</span>
                                <span className="info-value">••••••••</span>
                            </div>
                            <div className="info-row">
                                <span className="info-label"><Mail size={14} style={ISm} /> Xác minh email</span>
                                <span style={{ fontSize: '0.78rem', background: '#F0FDF4', color: '#15803D', padding: '3px 10px', borderRadius: 20, border: '1px solid #BBF7D0', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 5 }}>
                                    <CheckCircle size={12} style={IS} /> Đã xác minh
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}