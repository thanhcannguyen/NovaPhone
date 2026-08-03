<div align="center">

#  NovaPhone

**Nền tảng thương mại điện tử bán điện thoại full-stack MERN — có trợ lý mua sắm AI, thanh toán an toàn, và tư duy kỹ thuật xử lý lỗi ở mức production.**

[![Demo trực tiếp](https://img.shields.io/badge/demo-live-0057FF?style=for-the-badge)](https://nova-phone-web.vercel.app)
![React](https://img.shields.io/badge/React-19-61DAFB?style=flat-square&logo=react&logoColor=black)
![Node.js](https://img.shields.io/badge/Node.js-Express-339933?style=flat-square&logo=node.js&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-47A248?style=flat-square&logo=mongodb&logoColor=white)
![Stripe](https://img.shields.io/badge/Stripe-Payments-635BFF?style=flat-square&logo=stripe&logoColor=white)
![Gemini](https://img.shields.io/badge/Gemini-AI_Chatbot-8E75B2?style=flat-square&logo=googlegemini&logoColor=white)

[Demo trực tiếp](https://nova-phone-web.vercel.app) · [Báo lỗi](../../issues) · [Tính năng](#-tính-năng-chính) · [Ảnh chụp màn hình](#-ảnh-chụp-màn-hình) · [Công nghệ sử dụng](#-công-nghệ-sử-dụng) · [Bắt đầu](#-bắt-đầu)

</div>

![Trang chủ NovaPhone](screenshots/01-homepage.png)

---

## 📝 Giới thiệu dự án

NovaPhone là 1 ứng dụng web thương mại điện tử hoàn chỉnh để xem và mua điện thoại, được xây dựng nhằm chứng minh khả năng làm full-stack ở mức thực tế/production — không chỉ dừng lại ở CRUD đơn thuần. Ngoài luồng giỏ hàng và thanh toán tiêu chuẩn, dự án còn có **trợ lý mua sắm AI**, **thanh toán thật qua Stripe**, và nhiều **cơ chế chống lỗi** (tự động chuyển đổi dự phòng, xử lý bất đồng bộ không chặn luồng, xử lý dữ liệu tránh race condition) — được thiết kế và debug đúng như cách người ta làm trong môi trường production thật.

Codebase được tổ chức theo **monorepo npm workspaces**, tách riêng Express API, React frontend, và 1 package dùng chung — đúng mô hình cấu trúc mà nhiều codebase JS/TS production thật đang dùng.

---

## ✨ Tính năng chính

### 🛍️ Trải nghiệm khách hàng
- Danh mục sản phẩm có tìm kiếm, lọc theo hãng/giá, sắp xếp
- Trang chi tiết sản phẩm với thư viện ảnh và thông số đầy đủ
- Giỏ hàng & thanh toán nhiều bước
- Tích hợp **Stripe Checkout** với cập nhật trạng thái đơn hàng qua webhook
- Lịch sử đơn hàng & theo dõi chi tiết đơn hàng
- Đánh giá sản phẩm dạng luồng (có trả lời), chấm sao, và huy hiệu **"Đã mua hàng"**
- Xác thực email bằng mã OTP khi đăng ký (qua API email giao dịch)

### 🤖 Trợ lý mua sắm AI
- Chatbot hội thoại chạy trên **Google Gemini** với **function calling** — AI có thể truy vấn database sản phẩm thật theo thời gian thực để gợi ý điện thoại dựa trên yêu cầu bằng ngôn ngữ tự nhiên (VD: *"tìm điện thoại chụp ảnh đẹp"*)
- Chuỗi dự phòng đa model và **chế độ dự phòng graceful** — tự động chuyển sang tìm kiếm database trực tiếp nếu mọi model AI đều tạm thời không khả dụng — cuộc trò chuyện không bao giờ bị lỗi cứng

### 🔐 Trang quản trị (Admin)
- CRUD đầy đủ cho sản phẩm, danh mục, đơn hàng, người dùng
- Quản lý đơn hàng với cập nhật trạng thái
- Kiểm duyệt đánh giá (trả lời với vai trò admin, xoá, xem tất cả)
- Phân quyền theo vai trò (JWT + kiểm soát route)

### ⚙️ Điểm nhấn kỹ thuật
*(phần mình tự hào nhất trong dự án — xem chi tiết ở [mục bên dưới](#-đi-sâu-vào-kỹ-thuật-điểm-nhấn-kỹ-thuật))*
- Đã xử lý 1 race condition âm thầm trong React có thể trả về kết quả tìm kiếm sai (không lọc)
- Thiết kế lại luồng gửi email OTP để vượt qua 1 giới hạn mạng thật của nền tảng hosting (chặn cổng SMTP) mà không bao giờ làm treo HTTP response
- Sửa lỗi 404 khi truy cập route trực tiếp (deep-link) trên Vercel
- Trừ kho khi đặt hàng theo cơ chế atomic, tránh bán vượt tồn kho khi có nhiều người đặt cùng lúc

---

## 📸 Ảnh chụp màn hình

> Toàn bộ ảnh bên dưới đều chụp từ bản đã deploy thật.

### 🏠 Trang chủ & Khám phá sản phẩm
Đây là điểm mạnh trực quan nhất — banner carousel, thẻ sản phẩm gọn gàng, và duyệt theo danh mục đều thể hiện công sức thiết kế frontend.

*(xem ảnh hero ở đầu file README này)*

![Duyệt sản phẩm theo hãng, có giảm giá thật](screenshots/02-homepage-brands.png)

![Khu vực khách hàng tin dùng + đăng ký nhận tin](screenshots/03-homepage-trust.png)

### 📱 Chi tiết sản phẩm
![Trang chi tiết sản phẩm](screenshots/04-product-detail.png)

### 🤖 Chatbot AI đang hoạt động
Đây là tính năng khác biệt về mặt kỹ thuật nhất của dự án — xứng đáng có 1 ảnh chụp riêng, rõ ràng (hoặc tốt hơn là 1 đoạn quay màn hình GIF ngắn) thể hiện 1 cuộc hội thoại thật, nơi bot gợi ý đúng 1 sản phẩm thật.

![User hỏi NovaBot tư vấn điện thoại](screenshots/05-chatbot-question.png)
![NovaBot so sánh 2 sản phẩm thật, còn hàng, kèm giá thật](screenshots/06-chatbot-answer.png)

### 🛒 Giỏ hàng & Thanh toán
![Trang giỏ hàng](screenshots/07-cart.png)
![Trang thanh toán — đã chọn Stripe](screenshots/08-checkout.png)
![Form thanh toán Stripe](screenshots/09-stripe-payment.png)
![Chi tiết đơn hàng sau khi thanh toán thành công](screenshots/10-order-detail.png)

### 🧑‍💼 Trang quản trị (Admin)
Đừng bỏ qua phần này — 1 trang admin là 1 trong những tín hiệu rõ ràng nhất cho nhà tuyển dụng thấy bạn làm được nhiều hơn chỉ phần giao diện khách hàng.

![Tổng quan Admin Dashboard](screenshots/11-admin-dashboard.png)
![Bảng quản lý sản phẩm (Admin)](screenshots/12-admin-products.png)

![Quản lý đơn hàng (Admin) — cập nhật trạng thái](screenshots/14-admin-orders.png)

### 📱 Responsive trên di động
![Giao diện di động — trang sản phẩm có bộ lọc và sắp xếp](screenshots/13-mobile-products.png)

---

## 🧠 Đi sâu vào kỹ thuật: Điểm nhấn kỹ thuật

Hầu hết tutorial chỉ dừng lại ở mức "chạy được trên máy mình". Việc đưa dự án lên hosting thật (Render + Vercel + MongoDB Atlas) đã phát sinh nhiều vấn đề ở mức production mà môi trường local không bao giờ gặp phải — dưới đây là cách từng vấn đề được chẩn đoán và xử lý:

| Vấn đề | Nguyên nhân gốc | Cách xử lý |
|---|---|---|
| Giao diện đăng ký bị treo mãi ở "Đang đăng ký..." | Render free tier chặn cổng SMTP outbound (25/465/587); việc `await` gửi email OTP bị treo tới khi hết timeout | Xây lại luồng gửi email trên 1 API email giao dịch qua HTTPS, và cho việc gửi chạy không chặn (non-blocking) — HTTP response không bao giờ phải chờ nó |
| Chatbot AI thỉnh thoảng báo lỗi "dịch vụ không khả dụng" | Gemini API tier miễn phí có thể trả về lỗi `503` khi nhu cầu tăng cao | Thêm cơ chế retry với backoff tăng dần, kèm chuỗi dự phòng 3 model, và cuối cùng là chế độ dự phòng trả lời trực tiếp từ database nếu mọi model đều sập |
| Các đường link trực tiếp như `/orders/:id` trả về lỗi 404 cấp nền tảng trên Vercel | Vercel tìm file tĩnh khớp URL trước khi React Router kịp xử lý route ở lần điều hướng trực tiếp (hard navigation) | Thêm rewrite fallback SPA để mọi route không khớp đều trả về `index.html` |
| Tìm kiếm 1 từ khoá không có kết quả nào đôi khi lại hiển thị toàn bộ catalog thay vì 0 kết quả | 1 race condition trong React: 2 effect cùng fetch sản phẩm lúc component mount lần đầu, và request không lọc thỉnh thoảng phản hồi *sau* request đã lọc, âm thầm ghi đè lên state đúng | Gộp logic lại thành 1 effect duy nhất, lấy từ khoá tìm kiếm trực tiếp từ URL, loại bỏ hoàn toàn state trùng lặp và race condition |

---

## 🛠️ Công nghệ sử dụng

**Frontend**
- React 19 + Vite
- React Router
- Axios
- Design system riêng (font Nunito, màu thương hiệu `#0057FF`, độ rộng nội dung 1280px)

**Backend**
- Node.js + Express
- MongoDB + Mongoose
- Xác thực JWT, hash mật khẩu bằng bcrypt
- Cloudinary (upload ảnh)
- Stripe (thanh toán + webhook)
- Google Gemini API (chatbot AI, function calling)
- Brevo API (gửi email giao dịch)

**Hạ tầng**
- MongoDB Atlas (database)
- Render (hosting backend)
- Vercel (hosting frontend)
- Monorepo npm workspaces

---

## 🏗️ Cấu trúc dự án

```
NovaPhone/
├── apps/
│   ├── api/                 # Backend Express
│   │   └── src/
│   │       ├── controllers/
│   │       ├── models/
│   │       ├── routes/
│   │       ├── middlewares/
│   │       ├── services/
│   │       └── utils/
│   └── web/                 # Frontend React (Vite)
│       └── src/
│           ├── pages/       # trang user / admin / auth
│           ├── components/
│           └── api/         # tầng gọi API bằng axios
├── packages/
│   └── shared-types/        # hằng số & enum dùng chung giữa api + web
└── package.json              # gốc npm workspaces
```

---

## 🚀 Bắt đầu

### Yêu cầu
- Node.js 18+
- 1 connection string MongoDB Atlas
- API key cho: Cloudinary, Stripe, Google Gemini, Brevo

### Cài đặt

```bash
git clone https://github.com/thanhcannguyen/NovaPhone.git
cd NovaPhone
npm install
```

### Biến môi trường

Tạo file `apps/api/.env`:

```env
PORT=5000
MONGO_URI=your_mongodb_atlas_connection_string
JWT_SECRET=your_jwt_secret
CLIENT_URL=http://localhost:5173

BREVO_API_KEY=your_brevo_api_key
BREVO_SENDER_EMAIL=your_verified_sender_email

CLOUDINARY_CLOUD_NAME=...
CLOUDINARY_API_KEY=...
CLOUDINARY_API_SECRET=...

GEMINI_API_KEY=...

STRIPE_SECRET_KEY=...
STRIPE_WEBHOOK_SECRET=...
```

Tạo file `apps/web/.env`:

```env
VITE_API_URL=http://localhost:5000/api
```

### Chạy local

```bash
npm run dev:api    # chạy backend ở cổng :5000
npm run dev:web    # chạy frontend ở cổng :5173
```

---

## 🌐 Deploy

| Dịch vụ | Nền tảng |
|---|---|
| Database | MongoDB Atlas |
| Backend API | [Render](https://render.com) |
| Frontend | [Vercel](https://vercel.com) |

Demo trực tiếp: **[nova-phone-web.vercel.app](https://nova-phone-web.vercel.app)**

---

## 👤 Tác giả

**Nguyễn Thành Can**
Xây dựng như 1 dự án portfolio để chứng minh khả năng phát triển full-stack MERN, tích hợp API bên thứ 3, và debug ở môi trường production.

- GitHub: [@thanhcannguyen](https://github.com/thanhcannguyen)

</div>
