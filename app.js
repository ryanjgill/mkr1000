'use strict'

// node express and rethinkdb
let express = require('express')
let path = require('path')
let favicon = require('serve-favicon')
let logger = require('morgan')
let cookieParser = require('cookie-parser')
let bodyParser = require('body-parser')
const r = require('rethinkdb')
var dbConnection = null

let app = express()

// defining sensor variables
var led, moistureSensor, tempSensor, lightSensor

// MKR1000 stuffs
let httpServer = require('http').Server(app)
let io = require('socket.io')(httpServer)
let net = require('net')
let five = require('johnny-five')
let firmata = require('firmata')

httpServer.listen(3000)

// set options to match Firmata config for wifi
// using MKR1000 with WiFi101
const options = {
  host: '192.168.86.63',
  port: 3030
}

// connection starts here
net.connect(options, function() { //'connect' listener
  console.log('connected to server!')

  var socketClient = this

  // use the socketClient instead of a serial port for transport
  var boardIo = new firmata.Board(socketClient)

  boardIo.once('ready', function(){
    console.log('boardIo ready')

    boardIo.isReady = true

    var board = new five.Board({io: boardIo, repl: true})

    /* RethinkDB stuffs */
    const p = r.connect({
      host: 'localhost',
      port: 28015,
      db: 'plant_monitoring_system'
    })

    dbConnection = null

    p.then(function (conn) {
      // connected to rethinkdb
      console.log('rethinkdb connected!')
      dbConnection = conn

      r.table('measurements').run(conn, function (err, cursor) {
        //cursor.each(console.log)
      })

    }).error(function (err) {
      console.log('Rethinkdb error!')
      console.log(err)
      console.log(`
Make sure you have rethinkdb up and running and can connect on the same network. 
Could possibly need to run 'rethinkdb --bind all' to expose the connection.`)
    })

    board.on('ready', function() {
      // full Johnny-Five support here
      console.log('five ready')

      // setup led on pin 6 --> led pin for MKR1000
      led = new five.Led(6)

      // pulse led to indicate the board is communicating
      pulseLed(led, 2000, function () {
        console.log('LED √')
      })

      // setup temperature sensor LM35
      tempSensor = new five.Thermometer({
        controller: 'LM35',
        pin: 'A1',
        freq: 250
      })

      // setup moisture sensor to correct pin
      moistureSensor = new five.Sensor({
        pin: 'A2',
        freq: 250
      })

      // setup light sensor to correct pin
      lightSensor = new five.Sensor({
        pin: 'A3',
        freq: 250
      })

      io.on('connection', function (socket) {
        console.log(socket.id)

        // emit usersCount on new connection
        emitUsersCount(io)

        // emit usersCount when connection is closed
        socket.on('disconnect', function () {
          emitUsersCount(io)
        })
      })

      // emit chart data on each interval
      setInterval(function () {
        emitChartData(io, tempSensor, lightSensor, moistureSensor)
      }, 1000)

      // save measurement to rethinkdb on each interval
      setInterval(function () {
        if (dbConnection) {
          saveMeasurements(dbConnection, tempSensor, lightSensor, moistureSensor)
        }
      }, 10000)

    })
  })

}).on('error', function (err) {
  console.log('Unable to connect!')
  console.log('Please make sure you have the latest StandardFirmataWifi sketch loaded on the MKR1000')
})

// emit usersCount to all sockets
function emitUsersCount(io) {
  io.sockets.emit('usersCount', {
    totalUsers: io.engine.clientsCount
  })
}

// emit chart data to all sockets
function emitChartData(io, tempSensor, lightSensor, moistureSensor) {
  io.sockets.emit('chart:data', {
    date: new Date().getTime(),
    value: [getTemp(tempSensor), getLight(lightSensor), getMoisture(moistureSensor)]
  })
}

// save measurements to RethinkDB
function saveMeasurements(connection, tempSensor, lightSensor, moistureSensor) {
  let measurement = {
    date: new Date().getTime(),
    temp: getTemp(tempSensor),
    light: getLight(lightSensor),
    moisture: getMoisture(moistureSensor)
  }

  r.table('measurements').insert(measurement).run(connection)
  .then()
  .error(function (err) {
    console.log('Error saving measurement!')
    console.log(err)
  })
}

// get temperature measurement
function getTemp(tempSensor) {
  return Math.round(tempSensor.fahrenheit - 25)
}

// get light measurement
function getLight(lightSensor) {
  return Math.round(lightSensor.value/1023*100)
}

// get moisture measurement
function getMoisture(moisture) {
  return Math.round(moisture.value/1023*100)
}

// pulse led
function pulseLed(led, duration, cb) {
  led.blink()
  setTimeout(function () {
    led.stop().off()
    cb()
  }, duration)
}

// setting app stuff
app.locals.title = 'MKR1000'

// view engine setup
app.set('views', path.join(__dirname, 'views'))
app.set('view engine', 'pug')

app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')))
app.use(logger('dev'))
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: false }))
app.use(cookieParser())
app.use(require('node-sass-middleware')({
  src: path.join(__dirname, 'public'),
  dest: path.join(__dirname, 'public'),
  indentedSyntax: true,
  sourceMap: true
}))
app.use(express.static(path.join(__dirname, 'public')))

// get random int in range of min and max --> was used to mock out data
function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

// get all measurements of certain type
function getAllMeasurementsOfCertainType(type, cb) {
  r.table('measurements')
      .filter((m) => m.hasFields(type))
      .orderBy('date').map(function (m) {
        return [m('date'), m(type) || 0]
      })
      .run(dbConnection, function (err, measurements) {
        if (err) { return cb(err) }
        measurements.toArray(cb)
      })
}

// get all temperature measurements
function getAllTemperatureMeasurements(cb) {
  return getAllMeasurementsOfCertainType('temp', cb)
}

// get all temperature measurements
function getAllLightMeasurements(cb) {
  return getAllMeasurementsOfCertainType('light', cb)
}

// get all temperature measurements
function getAllMoistureMeasurements(cb) {
  return getAllMeasurementsOfCertainType('moisture', cb)
}


// Routes
app.get('/', function(req, res, next) {
  res.render('index')
})

app.get('/temperature', function (req, res, next) {
  res.render('temperature')
})

app.get('/light', function (req, res, next) {
  res.render('light')
})

app.get('/moisture', function (req, res, next) {
  res.render('moisture')
})


// Routes for data
app.get('/api/temps', function (req, res, next) {
  getAllTemperatureMeasurements(function (err, measurements) {
    if (err) { console.log(err) }

    res.write(JSON.stringify(measurements))
    res.end()
  })
})

app.get('/api/light', function (req, res, next) {
  getAllLightMeasurements(function (err, measurements) {
    if (err) { console.log(err) }

    res.write(JSON.stringify(measurements))
    res.end()
  })
})

app.get('/api/moisture', function (req, res, next) {
  getAllMoistureMeasurements(function (err, measurements) {
    if (err) { console.log(err) }

    res.write(JSON.stringify(measurements))
    res.end()
  })
})
