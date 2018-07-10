const io = require('socket.io')()

const config = require('./data/config.json')

module.exports = function () {
  return io.attach(config.port)
}
