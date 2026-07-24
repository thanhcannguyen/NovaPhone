
// src/components/admin/Pagination.jsx
export default function Pagination({ currentPage, totalPages, onPageChange }) {
    if (totalPages <= 1) return null

    // Tạo danh sách số trang hiển thị
    // Luôn hiện: trang đầu, trang cuối, trang hiện tại và 1 trang 2 bên
    const getPageNumbers = () => {
        const pages = []
        const delta = 1 // số trang hiện mỗi bên của trang hiện tại

        for (let i = 1; i <= totalPages; i++) {
            if (
                i === 1 ||                          // trang đầu
                i === totalPages ||                 // trang cuối
                (i >= currentPage - delta && i <= currentPage + delta) // trang gần hiện tại
            ) {
                pages.push(i)
            }
        }

        // Thêm dấu ... vào giữa khoảng cách
        const result = []
        let prev = 0
        for (const page of pages) {
            if (prev && page - prev > 1) {
                result.push('...')
            }
            result.push(page)
            prev = page
        }
        return result
    }

    const pages = getPageNumbers()

    return (
        <div style={s.wrap}>
            {/* Nút Previous */}
            <button
                style={{ ...s.btn, ...(currentPage === 1 ? s.btnDisabled : {}) }}
                onClick={() => onPageChange(currentPage - 1)}
                disabled={currentPage === 1}
            >
                ‹
            </button>

            {/* Số trang */}
            {pages.map((page, idx) =>
                page === '...' ? (
                    <span key={`dots-${idx}`} style={s.dots}>...</span>
                ) : (
                    <button
                        key={page}
                        style={{ ...s.btn, ...(page === currentPage ? s.btnActive : {}) }}
                        onClick={() => onPageChange(page)}
                    >
                        {page}
                    </button>
                )
            )}

            {/* Nút Next */}
            <button
                style={{ ...s.btn, ...(currentPage === totalPages ? s.btnDisabled : {}) }}
                onClick={() => onPageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
            >
                ›
            </button>

            <span style={s.info}>
                Trang {currentPage} / {totalPages}
            </span>
        </div>
    )
}

const s = {
    wrap: {
        display: 'flex', alignItems: 'center', gap: 4,
        padding: '16px 0 4px', justifyContent: 'center',
    },
    btn: {
        minWidth: 34, height: 34, borderRadius: 8,
        border: '1px solid #e2e8f0', background: '#fff',
        color: '#0d1117', fontSize: 14, cursor: 'pointer',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontFamily: 'inherit', transition: 'all 0.15s',
        padding: '0 10px',
    },
    btnActive: {
        background: '#1a73e8', color: '#fff',
        border: '1px solid #6f4e37', fontWeight: 600,
    },
    btnDisabled: {
        opacity: 0.35, cursor: 'not-allowed',
    },
    dots: { fontSize: 14, color: '#718096', padding: '0 4px' },
    info: { fontSize: 12, color: '#718096', marginLeft: 8 },
}