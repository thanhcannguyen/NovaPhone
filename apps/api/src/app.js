
import express from 'express'
import cors from 'cors'

import authRoute from './routes/auth.route.js'
import userRoute from './routes/user.route.js'

import categoryRoute from './routes/category.route.js'
import productRoute from './routes/product.route.js'

const app = express()
app.use(cors())
app.use(express.json())

// ...
app.use('/api/auth', authRoute)
app.use('/api/users', userRoute)
// ...
app.use('/api/categories', categoryRoute)
app.use('/api/products', productRoute)

app.use((req, res) => {
    res.status(404).json({ message: `Route không tìm thấy: ${req.originalUrl}` })
})

export default app