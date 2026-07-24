import { createContext, useContext, useState, useEffect, useCallback } from 'react'

const WishlistContext = createContext()
const STORAGE_KEY = 'ps_wishlist'

export const WishlistProvider = ({ children }) => {
    const [items, setItems] = useState(() => {
        try {
            const saved = localStorage.getItem(STORAGE_KEY)
            return saved ? JSON.parse(saved) : []
        } catch {
            return []
        }
    })

    useEffect(() => {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(items))
    }, [items])

    const isInWishlist = useCallback((id) => items.some(p => p._id === id), [items])

    // Trả về true nếu vừa được THÊM, false nếu vừa được XOÁ
    const toggleWishlist = useCallback((product) => {
        const wasIn = items.some(p => p._id === product._id)
        setItems(prev => wasIn
            ? prev.filter(p => p._id !== product._id)
            : [...prev, { _id: product._id, name: product.name, image: product.image, price: product.price }])
        return !wasIn
    }, [items])

    return (
        <WishlistContext.Provider value={{ items, count: items.length, isInWishlist, toggleWishlist }}>
            {children}
        </WishlistContext.Provider>
    )
}

export const useWishlist = () => useContext(WishlistContext)