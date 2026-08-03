// src/pages/auth/Register.jsx
import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import axiosInstance from '../../api/axiosInstance'
import styles from './Register.module.css'

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

    const [registeredEmail, setRegisteredEmail] = useState('')

    const handleSubmit = async (e) => {
        e.preventDefault()
        setLoading(true); setMessage(''); setError('')
        try {
            await axiosInstance.post('/auth/register', formData)
            setMessage('Đăng ký thành công!')
            setRegisteredEmail(formData.email)
        } catch (err) {
            setError(err.response?.data?.message || 'Đăng ký thất bại')
        } finally {
            setLoading(false)
        }
    }

    return (
        <>


            <div className={styles.regPage}>
                <div className={styles.regDot} style={{ width: 12, height: 12, top: '18%', left: '22%' }} />
                <div className={styles.regDot} style={{ width: 8, height: 8, top: '30%', right: '18%' }} />
                <div className={styles.regDot} style={{ width: 14, height: 14, bottom: '28%', left: '14%' }} />
                <div className={styles.regDot} style={{ width: 9, height: 9, bottom: '20%', right: '25%' }} />
                <div className={styles.regDot} style={{ width: 6, height: 6, top: '55%', left: '38%' }} />

                <div className={styles.regCard}>
                    <div className={styles.regLogo}>📱</div>

                    <h1 className={styles.regTitle}>Tạo tài khoản</h1>
                    <p className={styles.regSub}>Đăng ký để mua sắm ngay hôm nay</p>

                    {message && (
                        <div className={styles.regAlertOk}>
                            <span style={{ fontWeight: 700 }}>✅ {message}</span>
                            <span>Vui lòng kiểm tra email để lấy mã xác thực.</span>
                            {registeredEmail && (
                                <Link to="/verify-email" state={{ email: registeredEmail }}
                                    style={{ color: '#15803d', fontWeight: 800, textDecoration: 'underline', marginTop: 4 }}>
                                    Đến trang xác thực email
                                </Link>
                            )}
                        </div>
                    )}
                    {error && <div className={styles.regAlertErr}><span>⚠️</span> {error}</div>}

                    {!registeredEmail && (
                        <form onSubmit={handleSubmit}>
                            <div className={styles.regField}>
                                <input
                                    className={styles.regInput}
                                    type="text" name="name"
                                    placeholder="Họ và tên"
                                    value={formData.name}
                                    onChange={handleChange}
                                    required
                                />
                            </div>
                            <div className={styles.regField}>
                                <input
                                    className={styles.regInput}
                                    type="email" name="email"
                                    placeholder="Địa chỉ Email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    required
                                />
                            </div>
                            <div className={styles.regField}>
                                <input
                                    className={styles.regInput}
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
                                    className={styles.regPassToggle}
                                    onClick={() => setShowPass(p => !p)}
                                >
                                    {showPass ? '🙈' : '👁️'}
                                </button>
                            </div>

                            <button className={styles.regBtn} disabled={loading}>
                                {loading ? 'Đang đăng ký...' : 'Đăng ký'}
                            </button>
                        </form>)}

                    <p className={styles.regFoot}>
                        Đã có tài khoản? <Link to="/login">Đăng nhập</Link>
                    </p>
                </div>
            </div>
        </>
    )
}