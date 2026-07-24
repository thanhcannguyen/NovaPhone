import { createContext, useContext, useState, useCallback, useRef } from 'react'

const ToastContext = createContext()
let uid = 0

export const ToastProvider = ({ children }) => {
    const [toasts, setToasts] = useState([])
    const timers = useRef({})

    const removeToast = useCallback((id) => {
        setToasts(prev => prev.filter(t => t.id !== id))
        clearTimeout(timers.current[id])
        delete timers.current[id]
    }, [])

    const showToast = useCallback(({ title, message, type = 'success', duration = 3000 }) => {
        const id = ++uid
        setToasts(prev => [...prev, { id, title, message, type }])
        timers.current[id] = setTimeout(() => {
            setToasts(prev => prev.filter(t => t.id !== id))
            delete timers.current[id]
        }, duration)
        return id
    }, [])

    return (
        <ToastContext.Provider value={{ toasts, showToast, removeToast }}>
            {children}
        </ToastContext.Provider>
    )
}

export const useToast = () => useContext(ToastContext)