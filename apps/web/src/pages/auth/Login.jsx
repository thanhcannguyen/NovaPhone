// src/pages/auth/Login.jsx
import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import axiosInstance from '../../api/axiosInstance'
import { useAuth } from '../../context/AuthContext'
import styles from './Login.module.css'

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

            <div className={styles.loginPage}>
                {/* Decorative dots */}
                <div className={styles.dot} style={{ width: 12, height: 12, top: '18%', left: '22%' }} />
                <div className={styles.dot} style={{ width: 8, height: 8, top: '30%', right: '18%' }} />
                <div className={styles.dot} style={{ width: 14, height: 14, bottom: '28%', left: '14%' }} />
                <div className={styles.dot} style={{ width: 9, height: 9, bottom: '20%', right: '25%' }} />
                <div className={styles.dot} style={{ width: 6, height: 6, top: '55%', left: '38%' }} />

                <div className={styles.loginCard}>
                    {/* Logo */}
                    <div className={styles.loginLogo}>📱</div>

                    <h1 className={styles.loginTitle}>Chào mừng trở lại</h1>
                    <p className={styles.loginSub}>Đăng nhập vào NovaPhone của bạn</p>

                    {error && (
                        <div className={styles.loginError} style={{ flexDirection: 'column', gap: 6 }}>
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
                        <div className={styles.loginField}>
                            <input
                                className={styles.loginInput}
                                type="email" name="email"
                                placeholder="Địa chỉ Email"
                                value={formData.email}
                                onChange={handleChange}
                                required
                            />
                        </div>
                        <div className={styles.loginField}>
                            <input
                                className={styles.loginInput}
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
                                className={styles.passToggle}
                                onClick={() => setShowPass(p => !p)}
                            >
                                {showPass ? '🙈' : '👁️'}
                            </button>
                        </div>

                        <button
                            className={styles.loginBtn}
                            disabled={loading}
                        >
                            {loading ? 'Đang đăng nhập...' : 'Đăng nhập'}
                        </button>
                    </form>

                    <p className={styles.loginFoot}>
                        Chưa có tài khoản? <Link to="/register">Tạo tài khoản</Link>
                    </p>
                </div>
            </div>
        </>
    )
}