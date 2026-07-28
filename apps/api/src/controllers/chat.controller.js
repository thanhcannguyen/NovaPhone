
import Product from '../models/product.model.js'

const GEMINI_MODEL = 'gemini-3.5-flash'
const GEMINI_API_URL = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`

const MAX_MESSAGE_LENGTH = 1000
const GEMINI_TIMEOUT_MS = 15000

// Hướng dẫn "tính cách" và giới hạn hành vi cho AI — cực kỳ quan trọng để tránh
// AI bịa sản phẩm/giá không có thật (hallucination).
const SYSTEM_INSTRUCTION = `Bạn là trợ lý tư vấn bán hàng thân thiện của NovaPhone — cửa hàng điện thoại chính hãng.
Quy tắc bắt buộc:
- Khi khách hỏi về sản phẩm cụ thể, giá cả, hoặc muốn được gợi ý điện thoại, LUÔN gọi hàm search_products trước để lấy dữ liệu thật từ kho hàng, không được tự bịa tên sản phẩm hay giá.
- Chỉ tư vấn dựa trên đúng những sản phẩm được trả về từ search_products. Nếu không tìm thấy sản phẩm phù hợp, hãy nói thật là hiện chưa có, đừng bịa ra.
- Với các câu hỏi chung (chào hỏi, chính sách đổi trả, vận chuyển...) không cần gọi hàm, trả lời tự nhiên bằng kiến thức chung.
- Luôn trả lời bằng tiếng Việt, giọng điệu gần gũi, thân thiện, ngắn gọn, dễ hiểu, xưng "shop" hoặc "bên em".`

// Khai báo "công cụ" cho Gemini — mô tả rõ để AI tự hiểu khi nào cần dùng và cần tham số gì
const SEARCH_PRODUCTS_TOOL = {
    name: 'search_products',
    description: 'Tìm kiếm sản phẩm điện thoại thật đang có trong kho hàng theo hãng, khoảng giá, hoặc từ khóa tên sản phẩm. Nếu khách mô tả nhu cầu chung chung (ví dụ "pin trâu", "chụp ảnh đẹp", "chơi game mượt") mà không có hãng/giá cụ thể, hãy gọi hàm này KHÔNG kèm tham số nào để lấy danh sách sản phẩm hiện có, rồi tự chọn ra sản phẩm phù hợp nhất dựa trên thông số RAM/pin/camera trả về để tư vấn.',
    parameters: {
        type: 'OBJECT',
        properties: {
            brand: { type: 'STRING', description: 'Tên hãng, ví dụ: Samsung, Apple, Xiaomi, Oppo, Vivo' },
            minPrice: { type: 'NUMBER', description: 'Giá tối thiểu tính bằng VNĐ' },
            maxPrice: { type: 'NUMBER', description: 'Giá tối đa tính bằng VNĐ' },
            keyword: { type: 'STRING', description: 'Từ khóa trong tên sản phẩm, ví dụ: iPhone 15, Galaxy S24' },
        },
    },
}

// Thực thi truy vấn MongoDB thật dựa trên tham số Gemini tự trích xuất từ câu hỏi khách
async function executeSearchProducts(args = {}) {
    const query = { isAvailable: true }
    if (args.keyword) query.name = { $regex: args.keyword, $options: 'i' }
    if (args.brand) query['specs.brand'] = { $regex: args.brand, $options: 'i' }
    if (args.minPrice || args.maxPrice) {
        query.price = {}
        if (args.minPrice) query.price.$gte = Number(args.minPrice)
        if (args.maxPrice) query.price.$lte = Number(args.maxPrice)
    }

    const products = await Product.find(query)
        .select('name price originalPrice stock specs.brand specs.ram specs.storage specs.screen')
        .limit(5)
        .lean()

    return products.map(p => ({
        name: p.name,
        price: p.price,
        originalPrice: p.originalPrice,
        stock: p.stock,
        brand: p.specs?.brand,
        ram: p.specs?.ram,
        storage: p.specs?.storage,
        screen: p.specs?.screen,
    }))
}

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms))

// Gọi Gemini API — dùng chung cho cả 2 lượt (lượt đầu + lượt sau khi có kết quả hàm)
// Tự động thử lại tối đa 2 lần nếu Google báo model đang quá tải (503) — lỗi tạm thời,
// không phải do code, thường tự hết sau vài giây.
async function callGemini(contents, retriesLeft = 2) {
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), GEMINI_TIMEOUT_MS)

    try {
        const res = await fetch(`${GEMINI_API_URL}?key=${process.env.GEMINI_API_KEY}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            signal: controller.signal,
            body: JSON.stringify({
                contents,
                systemInstruction: { parts: [{ text: SYSTEM_INSTRUCTION }] },
                tools: [{ functionDeclarations: [SEARCH_PRODUCTS_TOOL] }],
            }),
        })

        if (!res.ok) {
            const errText = await res.text()
            console.error('Gemini API lỗi:', res.status, errText)

            // 503 = model quá tải tạm thời, 429 = vượt quota/rate limit — cả 2 đáng để thử lại
            if ((res.status === 503 || res.status === 429) && retriesLeft > 0) {
                clearTimeout(timeout)
                await sleep(1500)
                return callGemini(contents, retriesLeft - 1)
            }

            throw new Error('GEMINI_ERROR')
        }

        return await res.json()
    } finally {
        clearTimeout(timeout)
    }
}

export const chatWithAI = async (req, res) => {
    try {
        const { message, history } = req.body

        if (!message || !message.trim()) {
            return res.status(400).json({ success: false, message: 'Vui lòng nhập nội dung cần tư vấn' })
        }
        if (message.trim().length > MAX_MESSAGE_LENGTH) {
            return res.status(400).json({ success: false, message: `Nội dung quá dài, vui lòng nhập tối đa ${MAX_MESSAGE_LENGTH} ký tự` })
        }
        if (!process.env.GEMINI_API_KEY) {
            console.error('Chatbot chưa được cấu hình: thiếu GEMINI_API_KEY trong .env')
            return res.status(503).json({ success: false, message: 'Chatbot hiện chưa khả dụng, vui lòng thử lại sau' })
        }

        // Chỉ giữ 10 tin gần nhất để tránh prompt quá dài (tốn quota, chậm phản hồi)
        const pastTurns = (Array.isArray(history) ? history : [])
            .slice(-10)
            .map(m => ({ role: m.role === 'user' ? 'user' : 'model', parts: [{ text: m.content }] }))
        let contents = [...pastTurns, { role: 'user', parts: [{ text: message.trim() }] }]

        // Vòng lặp gọi hàm (agentic loop) — Gemini có thể cần gọi search_products nhiều lần
        // (ví dụ câu hỏi mơ hồ như "pin trâu chụp ảnh đẹp" không có tiêu chí rõ, nó có thể thử
        // lại với tham số khác). Giới hạn tối đa 3 vòng để tránh lặp vô hạn/tốn quota.
        const MAX_FUNCTION_ROUNDS = 3
        let finalReply = ''

        for (let round = 0; round < MAX_FUNCTION_ROUNDS; round++) {
            let data
            try {
                data = await callGemini(contents)
            } catch {
                return res.status(502).json({ success: false, message: 'Dịch vụ tư vấn AI đang gặp sự cố, vui lòng thử lại sau' })
            }

            const candidate = data.candidates?.[0]
            const parts = candidate?.content?.parts || []
            const functionCallPart = parts.find(p => p.functionCall)

            // Không còn gọi hàm nữa — đây là câu trả lời cuối cùng, dừng vòng lặp
            if (!functionCallPart) {
                finalReply = parts.map(p => p.text).filter(Boolean).join(' ').trim()
                break
            }

            // Còn muốn gọi hàm — thực thi và nối tiếp vòng lặp
            const { name, args } = functionCallPart.functionCall
            let functionResult = []
            if (name === 'search_products') {
                functionResult = await executeSearchProducts(args)
            }

            contents = [
                ...contents,
                { role: 'model', parts: [functionCallPart] },
                { role: 'user', parts: [{ functionResponse: { name, response: { products: functionResult } } }] },
            ]
        }

        return res.status(200).json({
            success: true,
            reply: finalReply || 'Dạ shop chưa tìm được sản phẩm phù hợp, bạn thử mô tả cụ thể hơn về mức giá hoặc hãng mình quan tâm nhé!',
        })
    } catch (error) {
        console.error('Lỗi chatbot:', error)
        return res.status(500).json({ success: false, message: 'Lỗi khi gọi AI chatbot' })
    }
}