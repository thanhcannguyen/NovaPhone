
import express from 'express'
import cors from 'cors'

import authRoute from './routes/auth.route.js'
import userRoute from './routes/user.route.js'

const app = express()
app.use(cors())
app.use(express.json())

// ...
app.use('/api/auth', authRoute)
app.use('/api/users', userRoute)

app.use((req, res) => {
    res.status(404).json({ message: `Route không tìm thấy: ${req.originalUrl}` })
})

export default app