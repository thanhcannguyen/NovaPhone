import { useState, useRef, useEffect } from 'react'
import { sendChatMessage } from '../../api/chatApi'
import { X, Send, Bot } from 'lucide-react'

// ẢNH ĐẠI DIỆN CHATBOT — TỰ THAY THẾ TẠI ĐÂY (tùy chọn)
// Đặt file ảnh mascot của bạn vào: src/assets/chatbot/avatar.png (hoặc .jpg/.svg)
// rồi bỏ comment dòng import bên dưới. Nếu không có ảnh, chatbot tự dùng icon robot mặc định.
// import botAvatar from '../../assets/chatbot/avatar.png'
const botAvatar = null // đổi thành `botAvatar` (biến import ở trên) khi đã có file ảnh thật

const BOT_NAME = 'NovaBot'
const WELCOME_MSG = 'Xin chào! Mình là NovaBot 👋 Mình có thể tư vấn điện thoại phù hợp với nhu cầu của bạn. Bạn đang tìm dòng máy nào?'
const TEASER_MSG = 'Bạn cần hỗ trợ gì?'
const SUGGESTIONS = [
    'So sánh iPhone và Samsung',
    'Điện thoại tầm 5-10 triệu',
    'Pin trâu, chụp ảnh đẹp',
]

function BotAvatar({ size }) {
    if (botAvatar) {
        return <img src={botAvatar} alt={BOT_NAME} style={{ width: size, height: size, objectFit: 'cover', borderRadius: '50%' }} />
    }
    return <Bot size={size * 0.55} />
}

export default function Chatbot() {
    const [isOpen, setIsOpen] = useState(false)
    const [message, setMessage] = useState('')
    const [loading, setLoading] = useState(false)
    const [messages, setMessages] = useState([{ role: 'assistant', content: WELCOME_MSG }])
    const scrollRef = useRef(null)
    const inputRef = useRef(null)

    useEffect(() => {
        scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' })
    }, [messages, loading])

    useEffect(() => {
        if (isOpen) inputRef.current?.focus()
    }, [isOpen])

    const send = async (text) => {
        const content = text.trim()
        if (!content || loading) return

        setMessages(prev => [...prev, { role: 'user', content }])
        setMessage('')
        setLoading(true)

        try {
            const data = await sendChatMessage(content, messages)
            setMessages(prev => [...prev, { role: 'assistant', content: data.reply || 'Xin lỗi, tôi chưa có câu trả lời.' }])
        } catch (error) {
            console.error('Lỗi chatbot:', error)
            const errMsg = error.response?.data?.message || 'Có lỗi xảy ra khi kết nối AI chatbot, vui lòng thử lại.'
            setMessages(prev => [...prev, { role: 'assistant', content: errMsg }])
        } finally {
            setLoading(false)
        }
    }

    const handleSend = () => send(message)

    return (
        <div className='cb-root'>
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Nunito:wght@400;500;600;700;800&display=swap');
                .cb-root { position: fixed; bottom: 20px; right: 20px; z-index: 9999; font-family: 'Nunito', sans-serif; }

                /* Khung chứa chung: icon luôn cố định dưới cùng, nội dung phía trên thay đổi
                   (bong bóng chào hỏi khi đóng ↔ khung chat khi mở) — cùng 1 vị trí, có đuôi chỉ xuống icon */
                .cb-stack { display: flex; flex-direction: column; align-items: flex-end; }

                .cb-panel { width: 360px; height: 520px; max-width: calc(100vw - 40px); max-height: calc(100vh - 100px); background: #fff; border-radius: 20px; box-shadow: 0 16px 48px rgba(0,0,0,0.2); display: flex; flex-direction: column; overflow: hidden; margin-bottom: 16px; animation: cbSlideUp 0.22s cubic-bezier(0.2,0.8,0.2,1); position: relative; }
                .cb-panel::after {
                    content: ''; position: absolute; bottom: -9px; right: 22px;
                    width: 0; height: 0; border-style: solid; border-width: 9px 9px 0 0;
                    border-color: #fff transparent transparent transparent;
                }
                @keyframes cbSlideUp { from { opacity: 0; transform: translateY(16px) scale(0.98); } to { opacity: 1; transform: none; } }

                .cb-header { background: linear-gradient(135deg, #0057FF 0%, #0040CC 100%); padding: 16px 16px 16px 14px; display: flex; align-items: center; gap: 10px; flex-shrink: 0; }
                .cb-header-avatar { width: 40px; height: 40px; border-radius: 50%; background: rgba(255,255,255,0.18); border: 1.5px solid rgba(255,255,255,0.3); display: flex; align-items: center; justify-content: center; color: #fff; flex-shrink: 0; overflow: hidden; }
                .cb-header-text { flex: 1; min-width: 0; }
                .cb-header-name { color: #fff; font-weight: 800; font-size: 0.95rem; line-height: 1.2; }
                .cb-header-status { display: flex; align-items: center; gap: 5px; color: rgba(255,255,255,0.85); font-size: 0.72rem; font-weight: 600; margin-top: 2px; }
                .cb-header-dot { width: 7px; height: 7px; border-radius: 50%; background: #4ADE80; box-shadow: 0 0 0 2px rgba(74,222,128,0.3); flex-shrink: 0; }
                .cb-header-close { background: rgba(255,255,255,0.15); border: none; width: 30px; height: 30px; border-radius: 9px; color: #fff; cursor: pointer; display: flex; align-items: center; justify-content: center; transition: background 0.15s; flex-shrink: 0; }
                .cb-header-close:hover { background: rgba(255,255,255,0.3); }

                .cb-body { flex: 1; overflow-y: auto; padding: 16px 14px; background: #F8F9FB; display: flex; flex-direction: column; gap: 12px; }
                .cb-body::-webkit-scrollbar { width: 5px; }
                .cb-body::-webkit-scrollbar-thumb { background: #D1D5DB; border-radius: 100px; }

                .cb-msg-row { display: flex; gap: 9px; align-items: flex-end; }
                .cb-msg-row.user { justify-content: flex-end; }
                .cb-avatar { width: 36px; height: 36px; border-radius: 50%; background: #EEF4FF; color: #0057FF; display: flex; align-items: center; justify-content: center; flex-shrink: 0; overflow: hidden; }
                .cb-msg-col { max-width: 76%; display: flex; flex-direction: column; gap: 3px; }
                .cb-msg-label { font-size: 0.68rem; color: #9CA3AF; font-weight: 700; padding-left: 2px; }
                .cb-bubble { padding: 10px 13px; border-radius: 15px; font-size: 0.85rem; line-height: 1.55; white-space: pre-wrap; word-break: break-word; }
                .cb-bubble.assistant { background: #fff; color: #0A0A0A; border: 1px solid #E5E7EB; border-bottom-left-radius: 4px; box-shadow: 0 1px 3px rgba(0,0,0,0.03); }
                .cb-bubble.user { background: #0057FF; color: #fff; border-bottom-right-radius: 4px; }

                .cb-typing { display: flex; gap: 4px; padding: 12px 14px; }
                .cb-typing span { width: 6px; height: 6px; border-radius: 50%; background: #9CA3AF; animation: cbBounce 1.2s infinite; }
                .cb-typing span:nth-child(2) { animation-delay: 0.15s; }
                .cb-typing span:nth-child(3) { animation-delay: 0.3s; }
                @keyframes cbBounce { 0%, 60%, 100% { transform: translateY(0); opacity: 0.4; } 30% { transform: translateY(-4px); opacity: 1; } }

                .cb-suggestions { display: flex; flex-wrap: wrap; gap: 7px; padding: 0 14px 12px; }
                .cb-suggestion-btn { background: #fff; border: 1.5px solid #C7D9FF; color: #0057FF; font-size: 0.78rem; font-weight: 700; padding: 7px 14px; border-radius: 100px; cursor: pointer; font-family: 'Nunito', sans-serif; transition: all 0.15s; }
                .cb-suggestion-btn:hover { background: #0057FF; color: #fff; }

                .cb-input-row { display: flex; padding: 12px; border-top: 1px solid #E5E7EB; gap: 8px; flex-shrink: 0; background: #fff; }
                .cb-input { flex: 1; padding: 10px 15px; border: 1.5px solid #E5E7EB; border-radius: 100px; font-size: 0.85rem; font-family: 'Nunito', sans-serif; outline: none; transition: border-color 0.15s; min-width: 0; }
                .cb-input:focus { border-color: #0057FF; }
                .cb-input:disabled { background: #F8F9FB; cursor: not-allowed; }
                .cb-send-btn { background: #0057FF; color: #fff; border: none; width: 42px; height: 42px; border-radius: 50%; cursor: pointer; display: flex; align-items: center; justify-content: center; flex-shrink: 0; transition: all 0.15s; }
                .cb-send-btn:hover:not(:disabled) { background: #0040CC; transform: scale(1.05); }
                .cb-send-btn:disabled { background: #C7D9FF; cursor: not-allowed; transform: none; }

                .cb-toggle { width: 62px; height: 62px; border-radius: 50%; border: 2px solid #fff; background: linear-gradient(135deg, #0057FF 0%, #0040CC 100%); color: #fff; cursor: pointer; box-shadow: 0 8px 24px rgba(0,87,255,0.4); display: flex; align-items: center; justify-content: center; transition: transform 0.15s; overflow: hidden; flex-shrink: 0; }
                .cb-toggle:hover { transform: scale(1.08); }

                /* Bong bóng chào hỏi — nằm TRÊN đầu icon, có đuôi chỉ xuống dưới, LUÔN hiện khi đóng chat */
                .cb-teaser {
                    position: relative; max-width: 210px; background: #fff; border-radius: 16px;
                    padding: 12px 16px; margin-bottom: 16px; box-shadow: 0 8px 24px rgba(0,0,0,0.15);
                    font-size: 0.85rem; font-weight: 700; color: #0A0A0A; cursor: pointer;
                    animation: cbTeaserIn 0.25s ease; white-space: nowrap;
                }
                .cb-teaser::after {
                    content: ''; position: absolute; bottom: -9px; right: 22px;
                    width: 0; height: 0; border-style: solid; border-width: 9px 9px 0 0;
                    border-color: #fff transparent transparent transparent;
                }
                @keyframes cbTeaserIn { from { opacity: 0; transform: translateY(6px); } to { opacity: 1; transform: none; } }

                @media (max-width: 420px) {
                    .cb-root { bottom: 12px; right: 12px; }
                    .cb-panel { width: calc(100vw - 24px); }
                    .cb-teaser { max-width: 160px; white-space: normal; }
                }
            `}</style>

            <div className='cb-stack'>
                {isOpen ? (
                    <div className='cb-panel'>
                        <div className='cb-header'>
                            <div className='cb-header-avatar'><BotAvatar size={40} /></div>
                            <div className='cb-header-text'>
                                <div className='cb-header-name'>{BOT_NAME}</div>
                                <div className='cb-header-status'><span className='cb-header-dot' /> Đang hoạt động</div>
                            </div>
                            <button className='cb-header-close' onClick={() => setIsOpen(false)}><X size={16} /></button>
                        </div>

                        <div className='cb-body' ref={scrollRef}>
                            {messages.map((msg, i) => (
                                <div key={i} className={`cb-msg-row ${msg.role}`}>
                                    {msg.role === 'assistant' && <div className='cb-avatar'><BotAvatar size={36} /></div>}
                                    <div className='cb-msg-col'>
                                        {msg.role === 'assistant' && <span className='cb-msg-label'>{BOT_NAME}</span>}
                                        <div className={`cb-bubble ${msg.role}`}>{msg.content}</div>
                                    </div>
                                </div>
                            ))}
                            {loading && (
                                <div className='cb-msg-row assistant'>
                                    <div className='cb-avatar'><BotAvatar size={36} /></div>
                                    <div className='cb-msg-col'>
                                        <span className='cb-msg-label'>{BOT_NAME}</span>
                                        <div className='cb-bubble assistant cb-typing'><span /><span /><span /></div>
                                    </div>
                                </div>
                            )}
                        </div>

                        {messages.length === 1 && (
                            <div className='cb-suggestions'>
                                {SUGGESTIONS.map(s => (
                                    <button key={s} className='cb-suggestion-btn' onClick={() => send(s)}>{s}</button>
                                ))}
                            </div>
                        )}

                        <div className='cb-input-row'>
                            <input
                                ref={inputRef}
                                className='cb-input'
                                type='text'
                                value={message}
                                placeholder='Nhập câu hỏi...'
                                disabled={loading}
                                onChange={e => setMessage(e.target.value)}
                                onKeyDown={e => { if (e.key === 'Enter') handleSend() }}
                            />
                            <button className='cb-send-btn' onClick={handleSend} disabled={loading || !message.trim()}>
                                <Send size={17} />
                            </button>
                        </div>
                    </div>
                ) : (
                    <div className='cb-teaser' onClick={() => setIsOpen(true)}>{TEASER_MSG}</div>
                )}

                <button className='cb-toggle' onClick={() => setIsOpen(o => !o)}>
                    <BotAvatar size={62} />
                </button>
            </div>
        </div>
    )
}