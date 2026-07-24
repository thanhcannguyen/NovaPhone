import { Outlet } from 'react-router-dom'
import Sidebar from '../components/admin/Sidebar'

export default function AdminLayout() {
    return (
        <div style={{ fontFamily: 'Nunito, sans-serif', background: '#F3F4F6', minHeight: '100vh' }}>
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Nunito:wght@400;500;600;700;800&display=swap');
                *, *::before, *::after { box-sizing: border-box; }
                body { font-family: 'Nunito', sans-serif; background: #F3F4F6; margin: 0; }
                /* Desktop: main pushed right by sidebar width */
                .admin-main { margin-left: 240px; min-height: 100vh; display: flex; flex-direction: column; }
                /* Mobile: no push, topbar replaces sidebar */
                @media (max-width: 768px) {
                    .admin-main { margin-left: 0; }
                }
            `}</style>
            <Sidebar />
            <div className="admin-main">
                <Outlet />
            </div>
        </div>
    )
}