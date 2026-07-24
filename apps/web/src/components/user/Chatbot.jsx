import { useState } from "react";
import { sendChatMessage } from "../../api/chatApi";

export default function Chatbot() {
    const [isOpen, setIsOpen] = useState(false);
    const [message, setMessage] = useState("");
    const [loading, setLoading] = useState(false);

    const [messages, setMessages] = useState([
        {
            role: "assistant",
            content: "Xin chào! Tôi có thể tư vấn điện thoại cho bạn.",
        },
    ]);

    const handleSend = async () => {
        if (!message.trim()) return;

        const userMessage = {
            role: "user",
            content: message,
        };

        setMessages((prev) => [...prev, userMessage]);

        const currentMessage = message;
        setMessage("");
        setLoading(true);

        try {
            const data = await sendChatMessage(currentMessage);

            setMessages((prev) => [
                ...prev,
                {
                    role: "assistant",
                    content:
                        data.reply ||
                        "Xin lỗi, tôi chưa có câu trả lời.",
                },
            ]);
        } catch (error) {
            console.error('Lỗi chatbot:', error)
            setMessages((prev) => [
                ...prev,
                {
                    role: "assistant",
                    content:
                        "Có lỗi xảy ra khi kết nối AI chatbot.",
                },
            ]);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div
            style={{
                position: "fixed",
                bottom: "20px",
                right: "20px",
                zIndex: 9999,
            }}
        >
            {isOpen && (
                <div
                    style={{
                        width: "350px",
                        height: "500px",
                        background: "#fff",
                        borderRadius: "12px",
                        boxShadow: "0 4px 20px rgba(0,0,0,0.2)",
                        display: "flex",
                        flexDirection: "column",
                        overflow: "hidden",
                        marginBottom: "10px",
                    }}
                >
                    <div
                        style={{
                            background: "#2563eb",
                            color: "#fff",
                            padding: "12px",
                            fontWeight: "bold",
                        }}
                    >
                        AI Phone Consultant
                    </div>

                    <div
                        style={{
                            flex: 1,
                            overflowY: "auto",
                            padding: "10px",
                            background: "#f8fafc",
                        }}
                    >
                        {messages.map((msg, index) => (
                            <div
                                key={index}
                                style={{
                                    marginBottom: "10px",
                                    display: "flex",
                                    justifyContent:
                                        msg.role === "user"
                                            ? "flex-end"
                                            : "flex-start",
                                }}
                            >
                                <div
                                    style={{
                                        maxWidth: "80%",
                                        padding: "10px",
                                        borderRadius: "10px",
                                        background:
                                            msg.role === "user"
                                                ? "#2563eb"
                                                : "#e5e7eb",
                                        color:
                                            msg.role === "user"
                                                ? "#fff"
                                                : "#000",
                                        whiteSpace: "pre-wrap",
                                    }}
                                >
                                    {msg.content}
                                </div>
                            </div>
                        ))}

                        {loading && (
                            <div>
                                AI đang trả lời...
                            </div>
                        )}
                    </div>

                    <div
                        style={{
                            display: "flex",
                            padding: "10px",
                            borderTop: "1px solid #ddd",
                            gap: "8px",
                        }}
                    >
                        <input
                            type="text"
                            value={message}
                            placeholder="Nhập câu hỏi..."
                            onChange={(e) =>
                                setMessage(e.target.value)
                            }
                            onKeyDown={(e) => {
                                if (e.key === "Enter") {
                                    handleSend();
                                }
                            }}
                            style={{
                                flex: 1,
                                padding: "10px",
                                border: "1px solid #ccc",
                                borderRadius: "8px",
                            }}
                        />

                        <button
                            onClick={handleSend}
                            style={{
                                background: "#2563eb",
                                color: "#fff",
                                border: "none",
                                padding: "10px 16px",
                                borderRadius: "8px",
                                cursor: "pointer",
                            }}
                        >
                            Gửi
                        </button>
                    </div>
                </div>
            )}

            <button
                onClick={() => setIsOpen(!isOpen)}
                style={{
                    width: "60px",
                    height: "60px",
                    borderRadius: "50%",
                    border: "none",
                    background: "#2563eb",
                    color: "#fff",
                    fontWeight: "bold",
                    cursor: "pointer",
                    boxShadow: "0 4px 10px rgba(0,0,0,0.3)",
                }}
            >
                AI
            </button>
        </div>
    );
}