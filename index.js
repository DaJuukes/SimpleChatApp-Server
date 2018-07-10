const initServer = require('./src/initServer.js')

const conn = initServer()

let users = {}

conn.use(function (socket, next) {
  var handshakeData = socket.request
  const username = handshakeData._query.username
  if (Object.values(users).includes(username)) {
    socket.disconnect(true)
    next(new Error('taken'))
  } else {
    users[socket.id] = username
    next()
  }
})

conn.on('connection', (socket) => {
  console.log(users[socket.id] + ' has connected')
  socket.broadcast.emit('other_message', { message: users[socket.id] + ' has connected' })

  socket.on('message', (data) => {
    console.log(users[socket.id] + ': ' + data.message)
    socket.broadcast.emit('chat_message', { username: users[socket.id], message: data.message })
  })

  socket.on('disconnect', () => {
    console.log(users[socket.id] + ' has disconnected')
    conn.emit('other_message', { message: users[socket.id] + ' has disconnected' }, 'everyone')
    delete users[socket.id]
  })
})
