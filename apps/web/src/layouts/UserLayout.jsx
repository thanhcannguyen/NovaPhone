import { Outlet } from 'react-router-dom'
import TopBar from '../components/user/TopBar'
import Header from '../components/user/Header'
import Footer from '../components/user/Footer'
import Chatbot from '../components/user/Chatbot'
import ToastContainer from '../components/user/ToastContainer'

export default function UserLayout() {
    return (
        <div
            style={{
                display: 'flex',
                flexDirection: 'column',
                minHeight: '100vh',
                fontFamily: 'Nunito, sans-serif',
            }}
        >
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Nunito:wght@400;500;600;700;800&display=swap');
                body {
                    font-family: 'Nunito', sans-serif;
                }
            `}</style>

            <TopBar />
            <Header />

            <ToastContainer />

            <main style={{ flex: 1 }}>
                <Outlet />
            </main>

            <Footer />

            <Chatbot />
        </div>
    )
}