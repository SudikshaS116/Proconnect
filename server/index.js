import express from 'express'
import { createServer } from 'http'
import { Server } from 'socket.io'
import mongoose from 'mongoose'
import cors from 'cors'
import dotenv from 'dotenv'
import morgan from 'morgan'
import authRoutes from './routes/authRoutes.js'
import userRoutes from './routes/userRoutes.js'
import postRoutes from './routes/postRoutes.js'
import connectionRoutes from './routes/connectionRoutes.js'
import messageRoutes from './routes/messageRoutes.js'
import notificationRoutes from './routes/notificationRoutes.js'
import storyRoutes from './routes/storyRoutes.js'

dotenv.config()

const app = express()
const httpServer = createServer(app)
const io = new Server(httpServer, {
  cors: { origin: 'http://localhost:5173', credentials: true }
})

app.use(cors({ origin: 'http://localhost:5173', credentials: true }))
app.use(express.json())
app.use(morgan('dev'))

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('✅ MongoDB connected'))
  .catch((err) => console.log(err))

app.use('/api/auth', authRoutes)
app.use('/api/users', userRoutes)
app.use('/api/posts', postRoutes)
app.use('/api/connections', connectionRoutes)
app.use('/api/messages', messageRoutes)
app.use('/api/notifications', notificationRoutes)
app.use('/api/stories', storyRoutes)

app.get('/', (req, res) => {
  res.json({ message: 'ProConnect API running 🚀' })
})

const onlineUsers = {}

io.on('connection', (socket) => {
  socket.on('join', (userId) => {
    onlineUsers[userId] = socket.id
    io.emit('onlineUsers', Object.keys(onlineUsers))
  })
  socket.on('sendMessage', (message) => {
    const receiverSocketId = onlineUsers[message.receiver._id]
    if (receiverSocketId) {
      io.to(receiverSocketId).emit('receiveMessage', message)
    }
  })
  socket.on('disconnect', () => {
    for (const userId in onlineUsers) {
      if (onlineUsers[userId] === socket.id) {
        delete onlineUsers[userId]
        break
      }
    }
    io.emit('onlineUsers', Object.keys(onlineUsers))
  })
})

const PORT = process.env.PORT || 5000
httpServer.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`))