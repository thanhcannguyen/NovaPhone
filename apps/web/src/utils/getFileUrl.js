
// Ghép URL gốc backend với đường dẫn ảnh tương đối trả về từ API
// (VD: "/uploads/avatars/xxx.jpg" -> "http://localhost:5000/uploads/avatars/xxx.jpg")
const API_ORIGIN = (import.meta.env.VITE_API_URL || 'http://localhost:5000/api').replace(/\/api\/?$/, '')

export const getFileUrl = (path) => {
    if (!path) return null
    if (path.startsWith('http')) return path // đã là URL đầy đủ (vd ảnh sản phẩm demo cũ)
    return `${API_ORIGIN}${path}`
}