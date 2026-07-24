import { createContext, useContext, useState, useEffect } from 'react'
import { useAuth } from './AuthContext'
import {
    getCartApi,
    addToCartApi,
    updateCartItemApi,
    removeCartItemApi,
    clearCartApi,
} from '../api/cartApi'

const CartContext = createContext()

export const CartProvider = ({ children }) => {
    const { user } = useAuth()
    const [cart, setCart] = useState(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        if (user) {
            fetchCart()
        } else {
            setCart(null)
            setLoading(false)
        }
    }, [user])

    const fetchCart = async () => {
        setLoading(true)
        try {
            const res = await getCartApi()
            setCart(res.data.cart)          // GET  → res.data.cart
        } catch (error) {
            console.error('Lỗi fetchCart:', error)
        } finally {
            setLoading(false)
        }
    }

    const addToCart = async (productId, quantity = 1) => {
        try {
            const res = await addToCartApi(productId, quantity)
            setCart(res.data.data)          // POST → res.data.data
            return true
        } catch (error) {
            console.error('Lỗi addToCart:', error)
            return false
        }
    }

    const updateItem = async (productId, quantity) => {
        try {
            const res = await updateCartItemApi(productId, quantity)
            setCart(res.data.data)          // PUT  → res.data.data
        } catch (error) {
            console.error('Lỗi updateItem:', error)
        }
    }

    const removeItem = async (productId) => {
        try {
            const res = await removeCartItemApi(productId)
            setCart(res.data.data)          // DELETE item → res.data.data
        } catch (error) {
            console.error('Lỗi removeItem:', error)
        }
    }

    const clearCart = async () => {
        try {
            await clearCartApi()
            setCart(prev => ({ ...prev, items: [], totalAmount: 0 }))
        } catch (error) {
            console.error('Lỗi clearCart:', error)
        }
    }

    const cartCount = cart?.items?.reduce(
        (sum, item) => sum + item.quantity, 0
    ) ?? 0

    return (
        <CartContext.Provider value={{
            cart,
            loading,
            cartCount,
            addToCart,
            updateItem,
            removeItem,
            clearCart,
            fetchCart,
        }}>
            {children}
        </CartContext.Provider>
    )
}

export const useCart = () => useContext(CartContext)