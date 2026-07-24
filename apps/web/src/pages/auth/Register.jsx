// src/pages/auth/Register.jsx
import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import axiosInstance from '../../api/axiosInstance'

export default function Register() {
    const navigate = useNavigate()
    const [formData, setFormData] = useState({ name: '', email: '', password: '' })
    const [loading, setLoading] = useState(false)
    const [message, setMessage] = useState('')
    const [error, setError] = useState('')
    const [showPass, setShowPass] = useState(false)

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value })
        setError(''); setMessage('')
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        setLoading(true); setMessage(''); setError('')
        try {
            await axiosInstance.post('/auth/register', formData)
            setMessage('Đăng ký thành công! Đang chuyển trang...')
            setTimeout(() => navigate('/login'), 1500)
        } catch (err) {
            setError(err.response?.data?.message || 'Đăng ký thất bại')
        } finally {
            setLoading(false)
        }
    }

    return (
        <>
            <style>{`
            @import url('https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700;800;900&display=swap');
            *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

            .reg-page {
                min-height: 100vh;
                display: flex;
                align-items: center;
                justify-content: center;
                padding: 24px 16px;
                font-family: 'Nunito', sans-serif;
                background: linear-gradient(135deg,
                    #c5d3f8 0%,
                    #d4c5f0 25%,
                    #e5bce8 50%,
                    #efc0df 75%,
                    #f5cce0 100%
);
                position: relative;
                overflow: hidden;
            }
            .reg-page::before {
                content: '';
                position: absolute;
                width: 500px; height: 500px;
                background: rgba(255,255,255,0.06);
                border-radius: 50%;
                top: -150px; left: -100px;
                pointer-events: none;
            }
            .reg-page::after {
                content: '';
                position: absolute;
                width: 400px; height: 400px;
                background: rgba(255,255,255,0.05);
                border-radius: 50%;
                bottom: -100px; right: -80px;
                pointer-events: none;
            }
            .reg-dot { position: absolute; border-radius: 50%; background: rgba(255,255,255,0.18); pointer-events: none; }

            .reg-card {
                background: rgba(255,255,255,0.96);
                backdrop-filter: blur(20px);
                border-radius: 24px;
                padding: 40px 36px 36px;
                width: 100%;
                max-width: 400px;
                box-shadow:
                    0 32px 80px rgba(80,40,120,0.25),
                    0 8px 24px rgba(0,0,0,0.1);
                position: relative;
                z-index: 1;
                animation: cardIn 0.5s cubic-bezier(.34,1.3,.64,1) both;
            }
            @keyframes cardIn {
                from { opacity: 0; transform: translateY(30px) scale(0.96); }
                to   { opacity: 1; transform: translateY(0) scale(1); }
            }

            .reg-logo {
                width: 56px; height: 56px;
                border-radius: 50%;
                background: linear-gradient(135deg, #e8927c, #a06cc9);
                display: flex; align-items: center; justify-content: center;
                margin: 0 auto 20px;
                font-size: 22px;
                box-shadow: 0 6px 20px rgba(160,108,201,0.4);
            }
            .reg-title {
                text-align: center;
                font-size: 26px; font-weight: 900;
                color: #1a1a2e; letter-spacing: -0.5px;
                margin-bottom: 6px;
            }
            .reg-sub {
                text-align: center;
                font-size: 13.5px; color: #94a3b8;
                margin-bottom: 28px; font-weight: 500;
            }

            .reg-alert-ok {
                background: #f0fdf4; border: 1px solid #bbf7d0;
                color: #15803d; border-radius: 10px;
                padding: 10px 14px; font-size: 13px;
                margin-bottom: 18px;
                display: flex; align-items: center; gap: 8px;
                justify-content: center;
            }
            .reg-alert-err {
                background: #fff1f1; border: 1px solid #fecaca;
                color: #dc2626; border-radius: 10px;
                padding: 10px 14px; font-size: 13px;
                margin-bottom: 18px;
                display: flex; align-items: center; gap: 8px;
                justify-content: center;
            }

            .reg-field {
                position: relative;
                margin-bottom: 16px;
            }
            .reg-input {
                width: 100%;
                padding: 14px 16px;
                border: none;
                border-bottom: 1.5px solid #e2e8f0;
                background: transparent;
                font-size: 14px;
                font-family: 'Nunito', sans-serif;
                color: #1a1a2e;
                outline: none;
                transition: border-color 0.2s;
            }
            .reg-input::placeholder { color: #b0bec5; }
            .reg-input:focus { border-bottom-color: #a06cc9; }

            .reg-pass-toggle {
                position: absolute;
                right: 4px; top: 50%;
                transform: translateY(-50%);
                background: none; border: none;
                cursor: pointer; font-size: 16px;
                color: #94a3b8; padding: 4px;
                transition: color 0.15s;
            }
            .reg-pass-toggle:hover { color: #a06cc9; }

            .reg-btn {
                width: 100%;
                padding: 14px;
                background: linear-gradient(135deg, #e8927c 0%, #c96bb8 50%, #6bb5c9 100%);
                color: #fff; border: none;
                border-radius: 50px;
                font-size: 15px; font-weight: 800;
                font-family: 'Nunito', sans-serif;
                cursor: pointer; margin-top: 8px;
                letter-spacing: 0.3px;
                transition: all 0.2s ease;
                box-shadow: 0 6px 20px rgba(160,108,201,0.35);
            }
            .reg-btn:hover:not(:disabled) {
                transform: translateY(-2px);
                box-shadow: 0 10px 28px rgba(160,108,201,0.45);
            }
            .reg-btn:active:not(:disabled) { transform: translateY(0); }
            .reg-btn:disabled { opacity: 0.7; cursor: default; }

            .reg-foot {
                text-align: center;
                font-size: 13.5px; color: #64748b;
                margin-top: 22px; font-weight: 600;
            }
            .reg-foot a {
                color: #7c3aed; font-weight: 800;
                text-decoration: none;
            }
            .reg-foot a:hover { text-decoration: underline; }

            @media (max-width: 480px) {
                .reg-card { padding: 32px 24px 28px; }
                .reg-title { font-size: 22px; }
            }
        `}</style>

            <div className="reg-page">
                <div className="reg-dot" style={{ width: 12, height: 12, top: '18%', left: '22%' }} />
                <div className="reg-dot" style={{ width: 8, height: 8, top: '30%', right: '18%' }} />
                <div className="reg-dot" style={{ width: 14, height: 14, bottom: '28%', left: '14%' }} />
                <div className="reg-dot" style={{ width: 9, height: 9, bottom: '20%', right: '25%' }} />
                <div className="reg-dot" style={{ width: 6, height: 6, top: '55%', left: '38%' }} />

                <div className="reg-card">
                    <div className="reg-logo">📱</div>

                    <h1 className="reg-title">Tạo tài khoản</h1>
                    <p className="reg-sub">Đăng ký để mua sắm ngay hôm nay</p>

                    {message && <div className="reg-alert-ok"><span>✅</span> {message}</div>}
                    {error && <div className="reg-alert-err"><span>⚠️</span> {error}</div>}

                    <form onSubmit={handleSubmit}>
                        <div className="reg-field">
                            <input
                                className="reg-input"
                                type="text" name="name"
                                placeholder="Họ và tên"
                                value={formData.name}
                                onChange={handleChange}
                                required
                            />
                        </div>
                        <div className="reg-field">
                            <input
                                className="reg-input"
                                type="email" name="email"
                                placeholder="Địa chỉ Email"
                                value={formData.email}
                                onChange={handleChange}
                                required
                            />
                        </div>
                        <div className="reg-field">
                            <input
                                className="reg-input"
                                type={showPass ? 'text' : 'password'}
                                name="password"
                                placeholder="Mật khẩu (ít nhất 6 ký tự)"
                                value={formData.password}
                                onChange={handleChange}
                                required
                                style={{ paddingRight: 36 }}
                            />
                            <button
                                type="button"
                                className="reg-pass-toggle"
                                onClick={() => setShowPass(p => !p)}
                            >
                                {showPass ? '🙈' : '👁️'}
                            </button>
                        </div>

                        <button className="reg-btn" disabled={loading}>
                            {loading ? 'Đang đăng ký...' : 'Đăng ký'}
                        </button>
                    </form>

                    <p className="reg-foot">
                        Đã có tài khoản? <Link to="/login">Đăng nhập</Link>
                    </p>
                </div>
            </div>
        </>
    )
}