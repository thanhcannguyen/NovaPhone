// src/pages/auth/Login.jsx
import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import axiosInstance from '../../api/axiosInstance'
import { useAuth } from '../../context/AuthContext'

export default function Login() {
    const navigate = useNavigate()
    const { login } = useAuth()
    const [formData, setFormData] = useState({ email: '', password: '' })
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')
    const [showPass, setShowPass] = useState(false)

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value })
        setError('')
    }

    const [needsVerify, setNeedsVerify] = useState(false)

    const handleSubmit = async (e) => {
        e.preventDefault()
        setLoading(true); setError(''); setNeedsVerify(false)
        try {
            const res = await axiosInstance.post('/auth/login', formData)
            login(res.data.token, res.data.data)
            navigate(res.data.data.role === 'admin' ? '/admin' : '/')
        } catch (err) {
            const data = err.response?.data
            setError(data?.message || 'Email hoặc mật khẩu không đúng')
            if (data?.emailNotVerified) setNeedsVerify(true)
        } finally {
            setLoading(false)
        }
    }

    return (
        <>
            <style>{`
            @import url('https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700;800;900&display=swap');
            *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

            .login-page {
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

            /* Floating blobs */
            .login-page::before {
                content: '';
                position: absolute;
                width: 500px; height: 500px;
                background: rgba(255,255,255,0.06);
                border-radius: 50%;
                top: -150px; left: -100px;
                pointer-events: none;
            }
            .login-page::after {
                content: '';
                position: absolute;
                width: 400px; height: 400px;
                background: rgba(255,255,255,0.05);
                border-radius: 50%;
                bottom: -100px; right: -80px;
                pointer-events: none;
            }

            /* Dot decorations */
            .dot { position: absolute; border-radius: 50%; background: rgba(255,255,255,0.18); pointer-events: none; }

            .login-card {
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

            /* Logo */
            .login-logo {
                width: 56px; height: 56px;
                border-radius: 50%;
                background: linear-gradient(135deg, #e8927c, #a06cc9);
                display: flex; align-items: center; justify-content: center;
                margin: 0 auto 20px;
                font-size: 22px;
                box-shadow: 0 6px 20px rgba(160,108,201,0.4);
            }

            .login-title {
                text-align: center;
                font-size: 26px;
                font-weight: 900;
                color: #1a1a2e;
                letter-spacing: -0.5px;
                margin-bottom: 6px;
            }
            .login-sub {
                text-align: center;
                font-size: 13.5px;
                color: #94a3b8;
                margin-bottom: 28px;
                font-weight: 500;
            }

            /* Error */
            .login-error {
                background: #fff1f1;
                border: 1px solid #fecaca;
                color: #dc2626;
                border-radius: 10px;
                padding: 10px 14px;
                font-size: 13px;
                margin-bottom: 18px;
                display: flex; align-items: center; gap: 8px;
                justify-content: center;
            }

            /* Input */
            .login-field {
                position: relative;
                margin-bottom: 16px;
            }
            .login-input {
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
            .login-input::placeholder { color: #b0bec5; }
            .login-input:focus { border-bottom-color: #a06cc9; }

            .pass-toggle {
                position: absolute;
                right: 4px; top: 50%;
                transform: translateY(-50%);
                background: none; border: none;
                cursor: pointer; font-size: 16px;
                color: #94a3b8; padding: 4px;
                transition: color 0.15s;
            }
            .pass-toggle:hover { color: #a06cc9; }

            /* Submit btn */
            .login-btn {
                width: 100%;
                padding: 14px;
                background: linear-gradient(135deg, #e8927c 0%, #c96bb8 50%, #6bb5c9 100%);
                color: #fff;
                border: none;
                border-radius: 50px;
                font-size: 15px;
                font-weight: 800;
                font-family: 'Nunito', sans-serif;
                cursor: pointer;
                margin-top: 8px;
                letter-spacing: 0.3px;
                transition: all 0.2s ease;
                box-shadow: 0 6px 20px rgba(160,108,201,0.35);
            }
            .login-btn:hover:not(:disabled) {
                transform: translateY(-2px);
                box-shadow: 0 10px 28px rgba(160,108,201,0.45);
            }
            .login-btn:active:not(:disabled) { transform: translateY(0); }
            .login-btn:disabled { opacity: 0.7; cursor: default; }

            .login-foot {
                text-align: center;
                font-size: 13.5px;
                color: #64748b;
                margin-top: 22px;
                font-weight: 600;
            }
            .login-foot a {
                color: #7c3aed;
                font-weight: 800;
                text-decoration: none;
            }
            .login-foot a:hover { text-decoration: underline; }

            @media (max-width: 480px) {
                .login-card { padding: 32px 24px 28px; }
                .login-title { font-size: 22px; }
            }
        `}</style>

            <div className="login-page">
                {/* Decorative dots */}
                <div className="dot" style={{ width: 12, height: 12, top: '18%', left: '22%' }} />
                <div className="dot" style={{ width: 8, height: 8, top: '30%', right: '18%' }} />
                <div className="dot" style={{ width: 14, height: 14, bottom: '28%', left: '14%' }} />
                <div className="dot" style={{ width: 9, height: 9, bottom: '20%', right: '25%' }} />
                <div className="dot" style={{ width: 6, height: 6, top: '55%', left: '38%' }} />

                <div className="login-card">
                    {/* Logo */}
                    <div className="login-logo">📱</div>

                    <h1 className="login-title">Chào mừng trở lại</h1>
                    <p className="login-sub">Đăng nhập vào NovaPhone của bạn</p>

                    {error && (
                        <div className="login-error" style={{ flexDirection: 'column', gap: 6 }}>
                            <span>⚠️ {error}</span>
                            {needsVerify && (
                                <Link to="/verify-email" state={{ email: formData.email }}
                                    style={{ color: '#dc2626', fontWeight: 800, textDecoration: 'underline' }}>
                                    Đến trang xác thực email
                                </Link>
                            )}
                        </div>
                    )}

                    <form onSubmit={handleSubmit}>
                        <div className="login-field">
                            <input
                                className="login-input"
                                type="email" name="email"
                                placeholder="Địa chỉ Email"
                                value={formData.email}
                                onChange={handleChange}
                                required
                            />
                        </div>
                        <div className="login-field">
                            <input
                                className="login-input"
                                type={showPass ? 'text' : 'password'}
                                name="password"
                                placeholder="Mật khẩu"
                                value={formData.password}
                                onChange={handleChange}
                                required
                                style={{ paddingRight: 36 }}
                            />
                            <button
                                type="button"
                                className="pass-toggle"
                                onClick={() => setShowPass(p => !p)}
                            >
                                {showPass ? '🙈' : '👁️'}
                            </button>
                        </div>

                        <button
                            className="login-btn"
                            disabled={loading}
                        >
                            {loading ? 'Đang đăng nhập...' : 'Đăng nhập'}
                        </button>
                    </form>

                    <p className="login-foot">
                        Chưa có tài khoản? <Link to="/register">Tạo tài khoản</Link>
                    </p>
                </div>
            </div>
        </>
    )
}