const initServer = require('./src/initServer.js')

const conn = initServer()

let users = new Map()
let invites = new Map()

conn.use(function (socket, next) {
  var handshakeData = socket.request
  const username = handshakeData._query.username
  if (Object.values(users).includes(username)) {
    socket.disconnect(true)
    next(new Error('Username taken.'))
  } else {
    users.set(socket.id, username)
    next()
  }
})

conn.on('connection', (socket) => {
  const senderInitial = users.get(socket.id)
  console.log(senderInitial + ' has connected')
  socket.broadcast.emit('other_message', { message: senderInitial + ' has connected' })

  socket.on('message', (data) => {
    const sender = users.get(socket.id)
    console.log(sender + ': ' + data.message)
    if (data.room) {
      if (conn.rooms[data.room] && conn.rooms[data.room].includes(socket.id)) {
        socket.broadcast.to(data.room).emit('chat_message', { username: sender, message: data.message })
      } else {
        socket.emit('fail', { message: 'room is invalid' })
      }
    } else {
      socket.broadcast.emit('chat_message', { username: sender, message: data.message })
    }
  })

  socket.on('adduser', () => {
    // Add user to room
    
  })

  socket.on('joinroom', (data) => {
    const sender = users.get(socket.id)
    if (socket.rooms.includes(data.room) && invites.has(sender)) {
      socket.join(data.room)
      socket.emit('success', { message: 'joined room successfully' })
    } else {
      socket.emit('fail', { message: 'room is invalid' })
    }
  })

  socket.on('disconnect', () => {
    const sender = users.get(socket.id)
    console.log(sender + ' has disconnected')
    conn.emit('other_message', { message: sender + ' has disconnected' }, 'everyone')
    users.delete(socket.id)
  })
})
