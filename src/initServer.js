const io = require('socket.io')()

const config = require('./data/config.json')

module.exports = function () {
  console.log('Starting server on ' + config.port + '...')
  return io.attach(config.port)
}
