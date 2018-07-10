const initServer = require('./src/initServer.js')

const conn = initServer()

let users = new Map()

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
    socket.broadcast.emit('chat_message', { username: sender, message: data.message })
  })

  socket.on('disconnect', () => {
    const sender = users.get(socket.id)
    console.log(sender + ' has disconnected')
    conn.emit('other_message', { message: sender + ' has disconnected' }, 'everyone')
    users.delete(socket.id)
  })
})
