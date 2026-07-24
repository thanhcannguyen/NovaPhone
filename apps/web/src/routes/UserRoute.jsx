import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function UserRoute({ children }) {
    const { token } = useAuth()
    if (!token) return <Navigate to='/login' />
    return children || <Outlet />
}