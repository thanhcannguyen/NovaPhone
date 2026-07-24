import { Link } from 'react-router-dom'
import { Mail, Phone } from 'lucide-react'
import { useAuth } from '../../context/AuthContext.jsx'

export default function TopBar() {
    const { user } = useAuth()

    return (
        <div className="site-topbar">
            <style>{`
                .site-topbar {
                    width: 100%;
                    background: #f5f6f8;
                    border-bottom: 1px solid #e5e7eb;
                    color: #5f6673;
                    font-size: 13px;
                }

                .site-topbar__inner {
                    max-width: 1280px;
                    min-height: 34px;
                    margin: 0 auto;
                    padding: 0 24px;
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    gap: 20px;
                }

                .site-topbar__group {
                    display: flex;
                    align-items: center;
                    gap: 18px;
                    min-width: 0;
                }

                .site-topbar__item,
                .site-topbar__link {
                    display: inline-flex;
                    align-items: center;
                    gap: 6px;
                    color: inherit;
                    text-decoration: none;
                    white-space: nowrap;
                }

                .site-topbar__link {
                    transition: color 0.18s ease;
                }

                .site-topbar__link:hover {
                    color: var(--primary, #1a73e8);
                }

                .site-topbar__separator {
                    width: 1px;
                    height: 14px;
                    background: #d7dbe1;
                    flex-shrink: 0;
                }

                .site-topbar__welcome {
                    max-width: 220px;
                    overflow: hidden;
                    text-overflow: ellipsis;
                    white-space: nowrap;
                }

                @media (max-width: 768px) {
                    .site-topbar__inner {
                        min-height: 30px;
                        padding: 0 16px;
                    }

                    .site-topbar__group--contact {
                        gap: 12px;
                    }

                    .site-topbar__email {
                        display: none;
                    }

                    .site-topbar__welcome {
                        display: none;
                    }
                }

                @media (max-width: 420px) {
                    .site-topbar__inner {
                        padding: 0 12px;
                    }

                    .site-topbar__group {
                        gap: 9px;
                    }

                    .site-topbar__item,
                    .site-topbar__link {
                        font-size: 12px;
                    }
                }
            `}</style>

            <div className="site-topbar__inner">
                <div className="site-topbar__group site-topbar__group--contact">
                    <a className="site-topbar__link" href="tel:19006750">
                        <Phone size={14} strokeWidth={1.9} />
                        <span>1900 6750</span>
                    </a>

                    <a
                        className="site-topbar__link site-topbar__email"
                        href="mailto:support@phonestore.vn"
                    >
                        <Mail size={14} strokeWidth={1.9} />
                        <span>support@phonestore.vn</span>
                    </a>
                </div>

                <div className="site-topbar__group">
                    {user ? (
                        <>
                            <span className="site-topbar__welcome">
                                Xin chào, {user.name || 'Khách hàng'}
                            </span>
                            <span className="site-topbar__separator" />
                            <Link className="site-topbar__link" to="/orders">
                                Đơn hàng
                            </Link>
                            <span className="site-topbar__separator" />
                            <Link className="site-topbar__link" to="/profile">
                                Tài khoản
                            </Link>
                        </>
                    ) : (
                        <>
                            <Link className="site-topbar__link" to="/login">
                                Đăng nhập
                            </Link>
                            <span className="site-topbar__separator" />
                            <Link className="site-topbar__link" to="/register">
                                Đăng ký
                            </Link>
                        </>
                    )}
                </div>
            </div>
        </div>
    )
}