import { Heart, GitCompareArrows, CheckCircle2, X } from 'lucide-react'
import { useToast } from '../../context/ToastContext'

const ICONS = {
    wishlist: <Heart size={18} fill="#EF4444" color="#EF4444" />,
    compare: <GitCompareArrows size={18} color="#0057FF" />,
    success: <CheckCircle2 size={18} color="#10B981" />,
}

export default function ToastContainer() {
    const { toasts, removeToast } = useToast()
    if (!toasts.length) return null

    return (
        <div className="ps-toast-wrap">
            <style>{`
                .ps-toast-wrap {
                    position: fixed; top: 78px; right: 20px; z-index: 3000;
                    display: flex; flex-direction: column; gap: 10px;
                    max-width: 340px; width: calc(100% - 40px);
                }
                .ps-toast {
                    background: #EAFBF1; border: 1px solid #B9F0D1; border-radius: 12px;
                    padding: 12px 14px; display: flex; gap: 10px; align-items: flex-start;
                    box-shadow: 0 8px 24px rgba(0,0,0,0.12);
                    animation: psToastIn 0.25s ease;
                    font-family: 'Nunito', sans-serif;
                }
                @keyframes psToastIn {
                    from { opacity: 0; transform: translateX(24px); }
                    to   { opacity: 1; transform: translateX(0); }
                }
                .ps-toast-icon { flex-shrink: 0; margin-top: 1px; }
                .ps-toast-body { flex: 1; min-width: 0; }
                .ps-toast-title { font-weight: 800; font-size: 0.85rem; color: #0A0A0A; margin-bottom: 2px; }
                .ps-toast-msg { font-size: 0.78rem; color: #4B5563; line-height: 1.4; }
                .ps-toast-close {
                    background: none; border: none; cursor: pointer; color: #6B7280;
                    padding: 2px; flex-shrink: 0; display: flex; border-radius: 6px;
                }
                .ps-toast-close:hover { background: rgba(0,0,0,0.06); color: #0A0A0A; }
                @media (max-width: 600px) {
                    .ps-toast-wrap { right: 10px; left: 10px; max-width: none; top: 70px; }
                }
            `}</style>
            {toasts.map(t => (
                <div key={t.id} className="ps-toast">
                    <span className="ps-toast-icon">{ICONS[t.type] || ICONS.success}</span>
                    <div className="ps-toast-body">
                        <div className="ps-toast-title">{t.title}</div>
                        {t.message && <div className="ps-toast-msg">{t.message}</div>}
                    </div>
                    <button className="ps-toast-close" onClick={() => removeToast(t.id)}>
                        <X size={14} />
                    </button>
                </div>
            ))}
        </div>
    )
}