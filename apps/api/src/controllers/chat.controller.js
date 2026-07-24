export const chatWithAI = async (req, res) => {
    try {
        const { message } = req.body;

        if (!message || !message.trim()) {
            return res.status(400).json({
                success: false,
                message: "Vui lòng nhập nội dung cần tư vấn",
            });
        }

        const response = await fetch(process.env.N8N_CHAT_WEBHOOK_URL, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                message: message.trim(),
            }),
        });

        if (!response.ok) {
            const errorText = await response.text();
            return res.status(500).json({
                success: false,
                message: "n8n webhook trả về lỗi",
                error: errorText,
            });
        }

        const raw = await response.text();

        console.log("RAW N8N RESPONSE:");
        console.log(raw);

        let reply = "";

        try {
            const data = JSON.parse(raw);
            reply = data.reply;
        } catch (error) {
            reply = raw;
        }

        return res.status(200).json({
            success: true,
            reply: reply || "AI chưa có câu trả lời phù hợp.",
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Lỗi khi gọi AI chatbot",
            error: error.message,
        });
    }
};