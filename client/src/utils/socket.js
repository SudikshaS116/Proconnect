import { io } from 'socket.io-client'

const socket = io('https://proconnect-07nx.onrender.com', {
  transports: ['websocket', 'polling'],
  withCredentials: true
})

export default socket