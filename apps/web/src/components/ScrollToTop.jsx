import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'

// Đặt component này ngay trong <BrowserRouter>, cùng cấp với <Routes>.
// React Router SPA không tự cuộn trang lên đầu khi chuyển route (khác với website
// load lại trang truyền thống) — nên khi bấm từ 1 trang đang cuộn xuống giữa/cuối
// sang trang khác, trang mới vẫn giữ nguyên vị trí cuộn cũ nếu không xử lý thủ công.
export default function ScrollToTop() {
    const { pathname } = useLocation()

    useEffect(() => {
        window.scrollTo(0, 0)
    }, [pathname])

    return null
}
