import { useState, useRef, useEffect } from 'react'
import { useLocation, useNavigate, Link } from 'react-router-dom'
import axiosInstance from '../../api/axiosInstance'

export default function VerifyEmail() {
    const location = useLocation()
    const navigate = useNavigate()
    const [email, setEmail] = useState(location.state?.email || '')
    const [otp, setOtp] = useState('')
    const [loading, setLoading] = useState(false)
    const [message, setMessage] = useState('')
    const [error, setError] = useState('')
    const [cooldown, setCooldown] = useState(0)
    const timerRef = useRef(null)

    useEffect(() => {
        if (cooldown <= 0) return
        timerRef.current = setTimeout(() => setCooldown(c => c - 1), 1000)
        return () => clearTimeout(timerRef.current)
    }, [cooldown])

    const [verified, setVerified] = useState(false)

    const handleVerify = async (e) => {
        e.preventDefault()
        setLoading(true); setMessage(''); setError('')
        try {
            const res = await axiosInstance.post('/auth/verify-email', { email, otp })
            setMessage(res.data.message || 'Xác thực thành công!')
            setVerified(true)
        } catch (err) {
            setError(err.response?.data?.message || 'Xác thực thất bại')
        } finally {
            setLoading(false)
        }
    }

    const handleResend = async () => {
        if (!email || cooldown > 0) return
        setLoading(true); setMessage(''); setError('')
        try {
            const res = await axiosInstance.post('/auth/resend-otp', { email })
            setMessage(res.data.message || 'Đã gửi lại mã')
            setCooldown(60)
        } catch (err) {
            setError(err.response?.data?.message || 'Không thể gửi lại mã')
        } finally {
            setLoading(false)
        }
    }

    return (
        <>
            <style>{`
            @import url('https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700;800;900&display=swap');
            *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
            .ve-page {
                min-height: 100vh; display: flex; align-items: center; justify-content: center;
                padding: 24px 16px; font-family: 'Nunito', sans-serif;
                background: linear-gradient(135deg, #c5d3f8 0%, #d4c5f0 25%, #e5bce8 50%, #efc0df 75%, #f5cce0 100%);
            }
            .ve-card {
                background: rgba(255,255,255,0.96); backdrop-filter: blur(20px);
                border-radius: 24px; padding: 40px 36px 36px; width: 100%; max-width: 400px;
                box-shadow: 0 32px 80px rgba(80,40,120,0.25), 0 8px 24px rgba(0,0,0,0.1);
                animation: cardIn 0.5s cubic-bezier(.34,1.3,.64,1) both;
            }
            @keyframes cardIn { from { opacity: 0; transform: translateY(30px) scale(0.96); } to { opacity: 1; transform: none; } }
            .ve-logo {
                width: 56px; height: 56px; border-radius: 50%;
                background: linear-gradient(135deg, #e8927c, #a06cc9);
                display: flex; align-items: center; justify-content: center;
                margin: 0 auto 20px; font-size: 22px;
                box-shadow: 0 6px 20px rgba(160,108,201,0.4);
            }
            .ve-title { text-align: center; font-size: 24px; font-weight: 900; color: #1a1a2e; margin-bottom: 6px; }
            .ve-sub { text-align: center; font-size: 13.5px; color: #94a3b8; margin-bottom: 24px; font-weight: 500; line-height: 1.5; }
            .ve-sub strong { color: #1a1a2e; }
            .ve-alert-ok { background: #f0fdf4; border: 1px solid #bbf7d0; color: #15803d; border-radius: 10px; padding: 10px 14px; font-size: 13px; margin-bottom: 18px; display: flex; align-items: center; gap: 8px; justify-content: center; }
            .ve-alert-err { background: #fff1f1; border: 1px solid #fecaca; color: #dc2626; border-radius: 10px; padding: 10px 14px; font-size: 13px; margin-bottom: 18px; display: flex; align-items: center; gap: 8px; justify-content: center; }
            .ve-field { margin-bottom: 16px; }
            .ve-input {
                width: 100%; padding: 14px 16px; border: none; border-bottom: 1.5px solid #e2e8f0;
                background: transparent; font-size: 14px; font-family: 'Nunito', sans-serif;
                color: #1a1a2e; outline: none; transition: border-color 0.2s;
            }
            .ve-input.otp { text-align: center; letter-spacing: 8px; font-size: 20px; font-weight: 800; }
            .ve-input:focus { border-bottom-color: #a06cc9; }
            .ve-btn {
                width: 100%; padding: 14px; background: linear-gradient(135deg, #e8927c 0%, #c96bb8 50%, #6bb5c9 100%);
                color: #fff; border: none; border-radius: 50px; font-size: 15px; font-weight: 800;
                font-family: 'Nunito', sans-serif; cursor: pointer; margin-top: 8px;
                box-shadow: 0 6px 20px rgba(160,108,201,0.35); transition: all 0.2s ease;
            }
            .ve-btn:hover:not(:disabled) { transform: translateY(-2px); box-shadow: 0 10px 28px rgba(160,108,201,0.45); }
            .ve-btn:disabled { opacity: 0.7; cursor: default; }
            .ve-resend { width: 100%; background: none; border: none; color: #7c3aed; font-weight: 700; font-size: 13.5px; margin-top: 16px; cursor: pointer; }
            .ve-resend:disabled { color: #94a3b8; cursor: default; }
            .ve-foot { text-align: center; font-size: 13.5px; color: #64748b; margin-top: 18px; font-weight: 600; }
            .ve-foot a { color: #7c3aed; font-weight: 800; text-decoration: none; }
        `}</style>

            <div className="ve-page">
                <div className="ve-card">
                    <div className="ve-logo">✉️</div>
                    <h1 className="ve-title">Xác thực Email</h1>
                    <p className="ve-sub">Nhập mã 6 số vừa được gửi đến{email && <> <strong>{email}</strong></>}</p>

                    {message && (
                        <div className="ve-alert-ok" style={{ flexDirection: 'column', gap: 4, textAlign: 'center' }}>
                            <span>✅ Xác thực email thành công!</span>
                            <span>Bạn có thể đăng nhập ngay bây giờ.</span>
                            {verified && (
                                <Link to="/login" style={{ color: '#15803d', fontWeight: 800, textDecoration: 'underline', marginTop: 4 }}>
                                    Đến trang đăng nhập
                                </Link>
                            )}
                        </div>
                    )}
                    {error && <div className="ve-alert-err">⚠️ {error}</div>}

                    {!verified && (
                        <form onSubmit={handleVerify}>
                            {!location.state?.email && (
                                <div className="ve-field">
                                    <input className="ve-input" type="email" placeholder="Địa chỉ email"
                                        value={email} onChange={e => setEmail(e.target.value)} required />
                                </div>
                            )}
                            <div className="ve-field">
                                <input className="ve-input otp" type="text" inputMode="numeric" maxLength={6}
                                    placeholder="------" value={otp}
                                    onChange={e => setOtp(e.target.value.replace(/\D/g, ''))} required />
                            </div>
                            <button className="ve-btn" disabled={loading || otp.length !== 6}>
                                {loading ? 'Đang xác thực...' : 'Xác thực'}
                            </button>
                        </form>
                    )}
                    {!verified && (
                        <button className="ve-resend" onClick={handleResend} disabled={loading || cooldown > 0}>
                            {cooldown > 0 ? `Gửi lại mã sau ${cooldown}s` : 'Gửi lại mã xác thực'}
                        </button>
                    )}

                    {!verified && (
                        <p className="ve-foot">
                            <Link to="/login">Quay lại đăng nhập</Link>
                        </p>
                    )}
                </div>
            </div>
        </>
    )
}