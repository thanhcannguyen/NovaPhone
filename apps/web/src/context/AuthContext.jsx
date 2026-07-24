
import { createContext, useContext, useState } from 'react'

// Tạo kho lưu auth dùng chung toàn frontend
const AuthContext = createContext()

export const AuthProvider = ({ children }) => {
    // Lấy token cũ từ localStorage để reload trang vẫn còn đăng nhập
    const [token, setToken] = useState(localStorage.getItem('token'))

    // Lấy user cũ từ localStorage
    const [user, setUser] = useState(() => {
        const savedUser = localStorage.getItem('user')
        return savedUser ? JSON.parse(savedUser) : null
    })

    // Hàm này được gọi sau khi login thành công
    const login = (token, user) => {
        localStorage.setItem('token', token)
        localStorage.setItem('user', JSON.stringify(user))

        setToken(token)
        setUser(user)
    }

    // Xóa thông tin đăng nhập
    const logout = () => {
        localStorage.removeItem('token')
        localStorage.removeItem('user')

        setToken(null)
        setUser(null)
    }

    return (
        // Cho toàn bộ app truy cập token, user, login, logout
        <AuthContext.Provider value={{ token, user, login, logout }}>
            {children}
        </AuthContext.Provider>
    )
}

// Custom hook để dùng auth cho gọn
export const useAuth = () => useContext(AuthContext)