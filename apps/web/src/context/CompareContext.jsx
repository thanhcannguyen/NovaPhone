import { createContext, useContext, useState, useEffect, useCallback } from 'react'

const CompareContext = createContext()
const STORAGE_KEY = 'ps_compare'
const MAX_COMPARE = 4

export const CompareProvider = ({ children }) => {
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

    const isInCompare = useCallback((id) => items.some(p => p._id === id), [items])

    // Trả về { added: boolean, limitReached: boolean }
    const toggleCompare = useCallback((product) => {
        const wasIn = items.some(p => p._id === product._id)
        if (!wasIn && items.length >= MAX_COMPARE) {
            return { added: false, limitReached: true }
        }
        setItems(prev => wasIn
            ? prev.filter(p => p._id !== product._id)
            : [...prev, { _id: product._id, name: product.name, image: product.image, price: product.price }])
        return { added: !wasIn, limitReached: false }
    }, [items])

    return (
        <CompareContext.Provider value={{ items, count: items.length, maxCompare: MAX_COMPARE, isInCompare, toggleCompare }}>
            {children}
        </CompareContext.Provider>
    )
}

export const useCompare = () => useContext(CompareContext)